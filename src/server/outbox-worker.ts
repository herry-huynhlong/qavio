import { randomUUID } from 'node:crypto';
import { db,transaction } from './db';
import { assertDatabaseUrl } from './db-safety';
import { lockSubscriber } from './repository';
import { renderEmail,smtpAdapter,type EmailAdapter } from './email';
import {sha256,tokenValue} from './crypto';

const MAX_ATTEMPTS=5;
export async function runOutboxBatch(testAdapter?:EmailAdapter, batchSize=10) {
  if(testAdapter){if(process.env.QAVIO_DEPLOYMENT_ENV!=='test')throw new Error('TEST_ADAPTER_FORBIDDEN');assertDatabaseUrl(process.env.DATABASE_URL,'test');}
  const adapter=testAdapter||smtpAdapter();
  if(!adapter)return {processed:0,reason:'EMAIL_NOT_CONFIGURED'};
  let processed=0;
  for(let i=0;i<Math.min(batchSize,50);i++){
    const claim=await transaction(async tx=>{
      const now=new Date();
      const rows=await tx.$queryRaw<{id:string}[]>`SELECT id FROM "EmailOutbox" WHERE attempts < ${MAX_ATTEMPTS} AND ((status='PENDING' AND "nextAttemptAt" <= ${now}) OR (status='SENDING' AND "leaseUntil" < ${now})) ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1`;
      if(!rows.length)return null;
      return tx.emailOutbox.update({where:{id:rows[0].id},data:{status:'SENDING',attempts:{increment:1},claimToken:randomUUID(),leaseUntil:new Date(Date.now()+120000)}});
    });
    if(!claim)break;
    // External send is serialized with subscriber status and this claimed row.
    // A persisted claim survives crashes; expired leases can be recovered, with bounded attempts.
    await db().$transaction(async tx=>{
      await tx.$queryRaw`SELECT id FROM "EmailOutbox" WHERE id=${claim.id}::uuid FOR UPDATE`;
      const row=await tx.emailOutbox.findUniqueOrThrow({where:{id:claim.id}});
      if(row.claimToken!==claim.claimToken||row.status!=='SENDING')return;
      let eligible=true;
      const payload=(row.payload||{}) as {tokenId?:string;version?:number};
      if(row.subscriberId){
        const subscriber=await lockSubscriber(tx,row.subscriberId);
        if(row.recipient!==subscriber.emailNormalized)eligible=false;
        if(payload.version!==subscriber.version)eligible=false;
        if(row.kind==='NEWSLETTER_CONFIRM'&&subscriber.status!=='PENDING')eligible=false;
        if(['NEWSLETTER_WELCOME','MARKETING'].includes(row.kind)&&subscriber.status!=='CONFIRMED')eligible=false;
        if(row.kind==='NEWSLETTER_UNSUBSCRIBED'&&subscriber.status!=='UNSUBSCRIBED')eligible=false;
        if(['NEWSLETTER_CONFIRM','NEWSLETTER_WELCOME','MARKETING'].includes(row.kind)){
          const token=payload.tokenId?await tx.newsletterToken.findUnique({where:{id:payload.tokenId}}):null;
          if(!token||token.subscriberId!==subscriber.id||token.version!==subscriber.version||token.usedAt||token.expiresAt<=new Date()||token.purpose!==(row.kind==='NEWSLETTER_CONFIRM'?'CONFIRM':'UNSUBSCRIBE'))eligible=false;
          if(token&&token.tokenHash!==sha256(tokenValue(token.id)))eligible=false;
        }
      } else if(['MARKETING','NEWSLETTER_CONFIRM','NEWSLETTER_WELCOME','NEWSLETTER_UNSUBSCRIBED'].includes(row.kind)) eligible=false;
      if(!eligible){await tx.emailOutbox.update({where:{id:row.id},data:{status:'CANCELLED',leaseUntil:null,claimToken:null,lastError:'RECIPIENT_NOT_ELIGIBLE'}});return;}
      try{
        const message=await renderEmail(tx,row);
        await adapter.send(message);
        await tx.emailOutbox.update({where:{id:row.id},data:{status:'SENT',sentAt:new Date(),leaseUntil:null,claimToken:null,lastError:null}});
      }catch{
        await tx.emailOutbox.update({where:{id:row.id},data:{status:row.attempts>=MAX_ATTEMPTS?'FAILED':'PENDING',nextAttemptAt:new Date(Date.now()+Math.min(3600000,30000*2**(row.attempts-1))),leaseUntil:null,claimToken:null,lastError:'DELIVERY_FAILED'}});
      }
    },{maxWait:10000,timeout:60000});
    processed++;
  }
  // A crash after the final claim must not leave a permanently stuck SENDING row.
  await db().emailOutbox.updateMany({where:{status:'SENDING',attempts:{gte:MAX_ATTEMPTS},leaseUntil:{lt:new Date()}},data:{status:'FAILED',lastError:'LEASE_EXPIRED',claimToken:null,leaseUntil:null}});
  return {processed};
}

import { randomUUID } from 'node:crypto';
import { db,transaction } from './db';
import { assertDatabaseUrl } from './db-safety';
import {emailEligible} from './outbox-eligibility';
import { renderEmail,smtpAdapter,type EmailAdapter } from './email';


const MAX_ATTEMPTS=5;
export async function runOutboxBatch(testAdapter?:EmailAdapter, batchSize=10,shouldStop?:()=>boolean) {
  if(testAdapter){if(process.env.QAVIO_DEPLOYMENT_ENV!=='test')throw new Error('TEST_ADAPTER_FORBIDDEN');assertDatabaseUrl(process.env.DATABASE_URL,'test');}
  const adapter=testAdapter||smtpAdapter();
  if(!adapter)return {processed:0,reason:'EMAIL_NOT_CONFIGURED'};
  let processed=0;
  for(let i=0;i<Math.min(batchSize,50);i++){
    if(shouldStop?.())break;
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
      if(!await emailEligible(tx,row)){await tx.emailOutbox.update({where:{id:row.id},data:{status:'CANCELLED',leaseUntil:null,claimToken:null,lastError:'RECIPIENT_NOT_ELIGIBLE'}});return;}
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

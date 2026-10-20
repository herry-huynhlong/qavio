import type {EmailOutbox} from '@prisma/client';
import type {Transaction} from './db';
import {lockSubscriber} from './repository';
import {sha256,tokenValue} from './crypto';
export async function emailEligible(tx:Transaction,row:EmailOutbox){
  const payload=(row.payload||{}) as {tokenId?:string;version?:number};
  if(!row.subscriberId)return !['MARKETING','NEWSLETTER_CONFIRM','NEWSLETTER_WELCOME','NEWSLETTER_UNSUBSCRIBED'].includes(row.kind);
  const subscriber=await lockSubscriber(tx,row.subscriberId);
  if(row.recipient!==subscriber.emailNormalized||payload.version!==subscriber.version)return false;
  if(row.kind==='NEWSLETTER_CONFIRM'&&subscriber.status!=='PENDING')return false;
  if(['NEWSLETTER_WELCOME','MARKETING'].includes(row.kind)&&subscriber.status!=='CONFIRMED')return false;
  if(row.kind==='NEWSLETTER_UNSUBSCRIBED'&&subscriber.status!=='UNSUBSCRIBED')return false;
  if(['NEWSLETTER_CONFIRM','NEWSLETTER_WELCOME','MARKETING'].includes(row.kind)){
    const token=payload.tokenId?await tx.newsletterToken.findUnique({where:{id:payload.tokenId}}):null;
    if(!token||token.subscriberId!==subscriber.id||token.version!==subscriber.version||token.usedAt||token.expiresAt<=new Date()||token.purpose!==(row.kind==='NEWSLETTER_CONFIRM'?'CONFIRM':'UNSUBSCRIBE')||token.tokenHash!==sha256(tokenValue(token.id)))return false;
  }
  return true;
}

import { randomUUID } from 'node:crypto';
import type { TokenPurpose } from '@prisma/client';
import type { SubscribeInput } from '@/lib/submission-schema';
import { normalized } from '@/lib/submission-schema';
import { sha256, tokenValue } from './crypto';
import { transaction, type Transaction } from './db';
import { idempotent } from './idempotency';
import { lock, lockSubscriber } from './repository';
import { HttpError } from './http';
import { mailConfigured, POLICY_VERSION } from './config';

export async function issueToken(tx: Transaction, subscriberId: string, version: number, purpose: TokenPurpose) {
  const id = randomUUID();
  return tx.newsletterToken.create({ data: { id, subscriberId, version, purpose, tokenHash: sha256(tokenValue(id)), expiresAt: new Date(Date.now() + (purpose === 'CONFIRM' ? 86400000 : 365 * 86400000)) } });
}
export async function subscribe(raw: SubscribeInput, key: string | null, ip: string) {
  const input = normalized(raw);
  return idempotent('newsletter', key, input, ip, async tx => {
    await lock(tx, `newsletter-email:${input.email}`);
    let subscriber = await tx.newsletterSubscriber.findUnique({ where: { emailNormalized: input.email } });
    if (subscriber) subscriber = await lockSubscriber(tx, subscriber.id);
    if (subscriber?.status !== 'CONFIRMED') {
      const recent = subscriber?.status === 'PENDING' ? await tx.newsletterToken.findFirst({ where: { subscriberId: subscriber.id, purpose:'CONFIRM', version:subscriber.version, usedAt:null, expiresAt:{gt:new Date()}, createdAt:{gt:new Date(Date.now()-300000)} } }) : null;
      if (!recent) {
        subscriber = subscriber ? await tx.newsletterSubscriber.update({ where:{id:subscriber.id}, data:{status:'PENDING',version:{increment:1},name:input.name||null,confirmedAt:null,source:input.sourcePage} }) : await tx.newsletterSubscriber.create({data:{emailNormalized:input.email,name:input.name||null,source:input.sourcePage}});
        await tx.newsletterConsentEvent.create({data:{subscriberId:subscriber.id,type:'SUBSCRIBE_REQUESTED',policyVersion:input.privacyPolicyVersion,source:input.sourcePage}});
        const token = await issueToken(tx,subscriber.id,subscriber.version,'CONFIRM');
        await tx.emailOutbox.create({data:{kind:'NEWSLETTER_CONFIRM',recipient:subscriber.emailNormalized,subscriberId:subscriber.id,payload:{tokenId:token.id,version:subscriber.version}}});
      }
    }
    // Identical result for absent, pending, confirmed and previously unsubscribed emails.
    return {ok:true,code:'NEWSLETTER_ACCEPTED',emailDelivery:mailConfigured()?'configured':'not_configured'};
  });
}
export async function consumeNewsletterToken(raw: string, purpose: TokenPurpose, ip: string) {
  void ip;
  return transaction(async tx => {
    const found = await tx.newsletterToken.findUnique({where:{tokenHash:sha256(raw)}});
    if (!found || found.purpose !== purpose) throw new HttpError(400,'TOKEN_INVALID');
    const subscriber = await lockSubscriber(tx,found.subscriberId);
    const token = await tx.newsletterToken.findUniqueOrThrow({where:{id:found.id}});
    if (token.usedAt) throw new HttpError(410,'TOKEN_USED');
    if (token.expiresAt <= new Date() || token.version !== subscriber.version) throw new HttpError(410,'TOKEN_EXPIRED');
    if (purpose === 'CONFIRM' && subscriber.status !== 'PENDING') throw new HttpError(410,'TOKEN_EXPIRED');
    if (purpose === 'UNSUBSCRIBE' && subscriber.status !== 'CONFIRMED') throw new HttpError(410,'TOKEN_EXPIRED');
    await tx.newsletterToken.update({where:{id:token.id},data:{usedAt:new Date()}});
    await tx.newsletterSubscriber.update({where:{id:subscriber.id},data: purpose === 'CONFIRM' ? {status:'CONFIRMED',confirmedAt:new Date(),unsubscribedAt:null} : {status:'UNSUBSCRIBED',unsubscribedAt:new Date(),version:{increment:1}}});
    await tx.newsletterConsentEvent.create({data:{subscriberId:subscriber.id,type:purpose==='CONFIRM'?'CONFIRMED':'UNSUBSCRIBED',policyVersion:POLICY_VERSION,source:purpose==='CONFIRM'?'/newsletter/confirm':'/newsletter/unsubscribe'}});
    const unsubscribe = purpose === 'CONFIRM' ? await issueToken(tx,subscriber.id,subscriber.version,'UNSUBSCRIBE') : null;
    await tx.emailOutbox.create({data:{kind:purpose==='CONFIRM'?'NEWSLETTER_WELCOME':'NEWSLETTER_UNSUBSCRIBED',recipient:subscriber.emailNormalized,subscriberId:subscriber.id,payload:{version:purpose==='CONFIRM'?subscriber.version:subscriber.version+1,...(unsubscribe?{tokenId:unsubscribe.id}:{})}}});
    return {ok:true,code:purpose==='CONFIRM'?'NEWSLETTER_CONFIRMED':'NEWSLETTER_UNSUBSCRIBED'};
  });
}

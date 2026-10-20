import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db,transaction} from '../src/server/db';
import {publicPost} from '../src/server/public-api';
import {rateLimit} from '../src/server/rate-limit';
import {runOutboxBatch} from '../src/server/outbox-worker';
import {tokenValue,sha256} from '../src/server/crypto';
import type {EmailMessage} from '../src/server/email';
import {POLICY_VERSION} from '../src/lib/submission-schema';
import {clientBucket,failure} from '../src/server/http';
import {hmac} from '../src/server/crypto';
import {formsEnabled} from '../src/server/config';

process.loadEnvFile('.env.local');
assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');
process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;
process.env.QAVIO_DEPLOYMENT_ENV='test';process.env.QAVIO_PUBLIC_FORMS_ENABLED='true';process.env.EMAIL_PROVIDER='disabled';
process.env.LEAD_NOTIFICATION_EMAIL='admin-integration@example.invalid';process.env.LEAD_RECEIPT_ENABLED='true';
const run=randomUUID(),email=`qa-${run}@example.invalid`,sent:EmailMessage[]=[];
const testIp=`198.18.${parseInt(run.slice(0,2),16)}.${parseInt(run.slice(2,4),16)}`;
process.env.QAVIO_TRUSTED_PROXY_SECRET=randomUUID();
const common={fullName:`QA ${run}`,email,phone:'0900000000',consent:true,privacyPolicyVersion:POLICY_VERSION,sourcePage:'/contact',website:'',startedAt:Date.now()-5000};
const contact={...common,inquiryType:'CONTACT',subject:'Tìm hiểu sản phẩm',message:`Integration ${run}`};
let passed=0;
async function check(name:string,operation:()=>Promise<void>){await operation();passed++;console.log(`PASS ${name}`);}
async function post(operation:Parameters<typeof publicPost>[1],body:unknown,key=randomUUID(),extra:Record<string,string>={}){
  const request=new Request(`http://127.0.0.1:3100/api/${operation}`,{method:'POST',headers:{origin:'http://127.0.0.1:3100','content-type':'application/json','idempotency-key':key,'x-qavio-client-ip':testIp,'x-qavio-proxy-secret':process.env.QAVIO_TRUSTED_PROXY_SECRET!,...extra},body:JSON.stringify(body)});
  const response=await publicPost(request,operation);return {status:response.status,body:await response.json()};
}
async function main(){
  await check('database safeguards reject Restaurant, staging and production',async()=>{
    for(const name of ['restaurant_saas','subscription_test','qavio_prod','qavio_staging'])assert.throws(()=>assertDatabaseUrl(`postgresql://x:x@127.0.0.1:55432/${name}`,'test'));
    assert.throws(()=>assertDatabaseUrl('postgresql://x:x@public.example/qavio_test','test'));
  });
  await check('CONTACT persists consent and atomic outbox',async()=>{assert.equal((await post('contact',contact)).status,200);const lead=await db().lead.findFirstOrThrow({where:{email}});assert.equal(lead.status,'NEW');assert.equal(lead.privacyPolicyVersion,POLICY_VERSION);assert.equal(await db().emailOutbox.count({where:{leadId:lead.id}}),2);});
  await check('DEMO stores QuánPilot and role-specific fields',async()=>{const result=await post('demo',{...common,inquiryType:'DEMO',sourcePage:'/request-demo',restaurantName:'QA test',businessType:'Quán ăn',branchCount:2,subject:'Menu QR / gọi món',message:''});assert.equal(result.status,200);assert.equal((await db().lead.findFirstOrThrow({where:{email,inquiryType:'DEMO'}})).productInterest,'QuánPilot');});
  await check('QUOTE persists selection without price/payment',async()=>{assert.equal((await post('quote',{...common,inquiryType:'QUOTE',sourcePage:'/pricing',productInterest:'QuánPilot',planInterest:'PRO',termMonths:6,branchCount:1,message:''})).status,200);});
  await check('validation/missing consent/forged status do not create leads',async()=>{const before=await db().lead.count();for(const data of [{...contact,email:'wrong'},{...contact,consent:false},{...contact,status:'CONVERTED'}])assert.equal((await post('contact',data)).status,422);assert.equal(await db().lead.count(),before);});
  await check('double submit and concurrent idempotency create one lead',async()=>{const key=randomUUID(),body={...contact,email:`concurrent-${email}`};const before=await db().lead.count();const results=await Promise.all(Array.from({length:8},()=>post('contact',body,key)));assert.ok(results.every(r=>r.status===200));assert.equal(new Set(results.map(r=>JSON.stringify(r.body))).size,1);assert.equal(await db().lead.count(),before+1);assert.equal((await post('contact',{...body,message:'different request'},key)).status,409);});
  await check('new logical request is allowed for same email',async()=>{const before=await db().lead.count({where:{email}});assert.equal((await post('contact',contact)).status,200);assert.equal(await db().lead.count({where:{email}}),before+1);});
  await check('expired idempotency key allows a new logical request',async()=>{const key=randomUUID(),body={...contact,email:`expiry-${email}`};assert.equal((await post('contact',body,key)).status,200);await db().idempotencyRecord.update({where:{scope_keyHash:{scope:'lead',keyHash:hmac(`idem:${key}`)}},data:{expiresAt:new Date(0)}});assert.equal((await post('contact',body,key)).status,200);assert.equal(await db().lead.count({where:{email:body.email}}),2);});
  await check('lead/activity/outbox roll back together',async()=>{const lead=await db().lead.findFirstOrThrow({where:{email}});await assert.rejects(transaction(async tx=>{await tx.leadActivity.create({data:{leadId:lead.id,type:'ROLLBACK_TEST'}});await tx.emailOutbox.create({data:{leadId:lead.id,kind:'LEAD_RECEIPT',recipient:email,payload:{rollback:true}}});throw Error('INTENTIONAL_TEST_ROLLBACK');}));assert.equal(await db().leadActivity.count({where:{leadId:lead.id,type:'ROLLBACK_TEST'}}),0);assert.equal(await db().emailOutbox.count({where:{leadId:lead.id,payload:{path:['rollback'],equals:true}}}),0);});
  const sub={email:`newsletter-${email}`,name:'QA test',consent:true,privacyPolicyVersion:POLICY_VERSION,sourcePage:'/subscribe',website:'',startedAt:Date.now()-5000};
  await check('newsletter PENDING and case-insensitive unique',async()=>{const a=await post('subscribe',sub),b=await post('subscribe',{...sub,email:sub.email.toUpperCase()});assert.deepEqual(a.body,b.body);assert.equal(await db().newsletterSubscriber.count({where:{emailNormalized:sub.email}}),1);assert.equal((await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:sub.email}})).status,'PENDING');});
  await check('concurrent newsletter enrollment creates one subscriber/token',async()=>{const body={...sub,email:`race-${email}`};const results=await Promise.all(Array.from({length:4},()=>post('subscribe',body)));assert.ok(results.every(result=>result.status===200));const record=await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:body.email}});assert.equal(await db().newsletterToken.count({where:{subscriberId:record.id}}),1);});
  const subscriber=await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:sub.email}});
  const token=await db().newsletterToken.findFirstOrThrow({where:{subscriberId:subscriber.id,purpose:'CONFIRM'}});
  const raw=tokenValue(token.id);
  await check('raw confirmation token is not stored in token/outbox records',async()=>{assert.equal(token.tokenHash,sha256(raw));const dump=JSON.stringify(await db().emailOutbox.findMany({where:{subscriberId:subscriber.id}}));assert.ok(!dump.includes(raw));});
  await check('token cannot be used for a different purpose',async()=>{assert.equal((await post('unsubscribe',{token:raw})).status,400);});
  await check('provider not configured leaves queued emails and subscriber pending',async()=>{assert.equal((await runOutboxBatch()).reason,'EMAIL_NOT_CONFIGURED');assert.equal(await db().emailOutbox.count({where:{subscriberId:subscriber.id,status:'SENT'}}),0);});
  await check('reject expired tokens and replay, confirm once',async()=>{
    await db().newsletterToken.update({where:{id:token.id},data:{expiresAt:new Date(Date.now()-1000)}});assert.equal((await post('confirm',{token:raw})).status,410);
    await db().newsletterToken.update({where:{id:token.id},data:{expiresAt:new Date(Date.now()+86400000)}});
    const results=await Promise.all([post('confirm',{token:raw}),post('confirm',{token:raw})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,410]);assert.equal((await db().newsletterSubscriber.findUniqueOrThrow({where:{id:subscriber.id}})).status,'CONFIRMED');
  });
  await check('newsletter response does not enumerate confirmed email',async()=>{const existing=await post('subscribe',sub);const absent=await post('subscribe',{...sub,email:`fresh-${email}`});assert.deepEqual(existing.body,absent.body);});
  await check('unsubscribe records consent, no silent re-enrollment',async()=>{const unsub=await db().newsletterToken.findFirstOrThrow({where:{subscriberId:subscriber.id,purpose:'UNSUBSCRIBE'}});assert.equal((await post('unsubscribe',{token:tokenValue(unsub.id)})).status,200);assert.equal((await db().newsletterSubscriber.findUniqueOrThrow({where:{id:subscriber.id}})).status,'UNSUBSCRIBED');assert.equal((await post('subscribe',{...sub,consent:false})).status,422);assert.equal(await db().newsletterConsentEvent.count({where:{subscriberId:subscriber.id,type:'UNSUBSCRIBED'}}),1);});
  await check('marketing blocked for PENDING and UNSUBSCRIBED',async()=>{
    const pending=await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:`fresh-${email}`}});
    for(const row of [pending,await db().newsletterSubscriber.findUniqueOrThrow({where:{id:subscriber.id}})])await db().emailOutbox.create({data:{kind:'MARKETING',recipient:row.emailNormalized,subscriberId:row.id,payload:{text:'test',version:row.version}}});
    await runOutboxBatch({async send(message){sent.push(message);}},50);
    assert.equal(await db().emailOutbox.count({where:{kind:'MARKETING',subscriberId:{in:[pending.id,subscriber.id]},status:'CANCELLED'}}),2);
  });
  await check('explicit re-enrollment needs fresh consent and confirmation',async()=>{assert.equal((await post('subscribe',sub)).status,200);const record=await db().newsletterSubscriber.findUniqueOrThrow({where:{id:subscriber.id}});assert.equal(record.status,'PENDING');assert.ok(record.version>subscriber.version);assert.equal((await post('confirm',{token:raw})).status,410);assert.equal(await db().newsletterConsentEvent.count({where:{subscriberId:subscriber.id,type:'SUBSCRIBE_REQUESTED'}}),2);});
  await check('failed sends retry with sanitized errors then succeed',async()=>{
    const row=await db().emailOutbox.create({data:{kind:'LEAD_RECEIPT',recipient:`retry-${email}`,payload:{}}});
    await runOutboxBatch({async send(){throw new Error(`secret-token-and-email-${email}`);}},50);
    const failed=await db().emailOutbox.findUniqueOrThrow({where:{id:row.id}});assert.equal(failed.status,'PENDING');assert.equal(failed.lastError,'DELIVERY_FAILED');assert.equal(failed.attempts,1);
    await db().emailOutbox.update({where:{id:row.id},data:{nextAttemptAt:new Date(0)}});
    await runOutboxBatch({async send(message){sent.push(message);}},50);assert.equal((await db().emailOutbox.findUniqueOrThrow({where:{id:row.id}})).status,'SENT');
  });
  await check('two workers never send the same claimed message simultaneously',async()=>{const row=await db().emailOutbox.create({data:{kind:'LEAD_RECEIPT',recipient:`worker-${email}`,payload:{}}});let count=0;const adapter={async send(message:EmailMessage){if(message.to===row.recipient)count++;await new Promise(resolve=>setTimeout(resolve,30));}};await Promise.all([runOutboxBatch(adapter,10),runOutboxBatch(adapter,10)]);assert.equal(count,1);});
  await check('expired leases recover and repeated failure stops at five attempts',async()=>{const row=await db().emailOutbox.create({data:{kind:'LEAD_RECEIPT',recipient:`lease-${email}`,payload:{},status:'SENDING',attempts:4,claimToken:randomUUID(),leaseUntil:new Date(0)}});await runOutboxBatch({async send(){throw Error('PRIVATE_PROVIDER_ERROR');}},50);const failed=await db().emailOutbox.findUniqueOrThrow({where:{id:row.id}});assert.equal(failed.attempts,5);assert.equal(failed.status,'FAILED');assert.equal(failed.lastError,'DELIVERY_FAILED');});
  await check('Postgres rate limiter is atomic under concurrency',async()=>{const results=await Promise.allSettled(Array.from({length:8},()=>transaction(tx=>rateLimit(tx,`integration:${run}`,3,60000))));assert.equal(results.filter(r=>r.status==='fulfilled').length,3);assert.equal(results.filter(r=>r.status==='rejected').length,5);});
  await check('origin, payload size, honeypot and fast submits rejected',async()=>{assert.equal((await post('contact',contact,randomUUID(),{origin:'https://evil.example'})).status,403);assert.equal((await post('contact',{...contact,message:'x'.repeat(17000)})).status,413);assert.equal((await post('contact',{...contact,website:'bot'})).status,422);assert.equal((await post('contact',{...contact,startedAt:Date.now()})).status,422);});
  await check('forged forwarding headers cannot bypass the proxy trust boundary',async()=>{for(const headers of [{'x-forwarded-for':'1.2.3.4'},{'x-qavio-client-ip':'1.2.3.4','x-qavio-proxy-secret':'forged'}] as Record<string,string>[])assert.equal(clientBucket(new Request('http://localhost',{headers})),'untrusted-shared');});
  await check('HTTP 429 is returned when the PostgreSQL request bucket is exhausted',async()=>{await transaction(tx=>rateLimit(tx,`envelope:${testIp}`,100,60000));await db().rateLimitBucket.update({where:{key:hmac(`rate:envelope:${testIp}`)},data:{count:100}});assert.equal((await post('contact',contact)).status,429);await db().rateLimitBucket.update({where:{key:hmac(`rate:envelope:${testIp}`)},data:{count:1}});});
  await check('production collection stays closed without approved privacy policy',async()=>{try{process.env.QAVIO_DEPLOYMENT_ENV='production';process.env.QAVIO_DATA_POLICY_APPROVED='false';assert.equal(formsEnabled(),false);assert.equal((await post('contact',contact)).status,503);process.env.QAVIO_DEPLOYMENT_ENV='invalid-tier';assert.equal(formsEnabled(),false);}finally{process.env.QAVIO_DEPLOYMENT_ENV='test';}});
  await check('unexpected database/provider errors produce no sensitive response/log',async()=>{const lines:string[]=[];const original=console.error;console.error=(value)=>{lines.push(String(value));};try{const result=failure(new Error(`private ${email} ${raw}`));assert.equal(result.status,503);const body=JSON.stringify(await result.json());assert.ok(!body.includes(email)&&!body.includes(raw));assert.deepEqual(lines,[JSON.stringify({event:'qavio_api_unavailable'})]);}finally{console.error=original;}});
  await check('response omits personal information/internal IDs',async()=>{const result=await post('subscribe',{...sub,email:`privacy-${email}`});const json=JSON.stringify(result.body);for(const value of [email,subscriber.id,raw,'phone','tokenHash'])assert.ok(!json.includes(value));});
  console.log(JSON.stringify({database:'qavio_test',checks:passed,status:'PASS',emailProvider:'in-process test adapter only; no real provider verified'}));
}
main().catch(error=>{console.error('INTEGRATION_FAILED',error instanceof assert.AssertionError?error.message:'CHECK_FAILED');process.exitCode=1;}).finally(async()=>{
  // Only this run's generated rows; no reset, truncate, drop or blanket deletion.
  await db().lead.deleteMany({where:{email:{in:[email,`concurrent-${email}`,`expiry-${email}`]}}});
  await db().newsletterSubscriber.deleteMany({where:{emailNormalized:{in:[`newsletter-${email}`,`fresh-${email}`,`privacy-${email}`,`race-${email}`]}}});
  await db().emailOutbox.deleteMany({where:{recipient:{in:[`retry-${email}`,`worker-${email}`,`lease-${email}`]}}});
  await db().$disconnect();
});

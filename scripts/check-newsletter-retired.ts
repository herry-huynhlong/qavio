import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {cleanHtml,cleanData} from '../src/server/admin/validation';
import {publicPost} from '../src/server/public-api';
import {issueToken} from '../src/server/newsletter-service';
import {tokenValue} from '../src/server/crypto';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';process.env.APP_ORIGIN='http://127.0.0.1:3100';
const email='retired-'+randomUUID()+'@example.invalid';
async function post(operation:'subscribe'|'confirm'|'unsubscribe',body:unknown){return publicPost(new Request('http://127.0.0.1:3100/api/newsletter/'+operation,{method:'POST',headers:{origin:process.env.APP_ORIGIN!,'content-type':'application/json'},body:JSON.stringify(body)}),operation);}
async function counts(){return {subscribers:await db().newsletterSubscriber.count(),tokens:await db().newsletterToken.count(),events:await db().newsletterConsentEvent.count(),outbox:await db().emailOutbox.count()};}
async function main(){
 assert.throws(()=>cleanData('CTA',{label:'Old newsletter',href:'/subscribe'}));
 const html=cleanHtml('<p>Keep content</p><a href="https://qavio.site/subscribe?old=1">Old newsletter</a><a href="/subscribe">Old relative</a><a href="/contact">Contact</a>');
 assert.ok(!html.includes('Old newsletter')&&!html.includes('Old relative'));assert.ok(html.includes('Contact')&&html.includes('Keep content'));

 const old=await db().newsletterSubscriber.create({data:{emailNormalized:email,status:'CONFIRMED',confirmedAt:new Date(),source:'retirement-qa'}});
 const token=await issueToken(db(),old.id,old.version,'UNSUBSCRIBE');
 const before=await counts(),original=await db().newsletterSubscriber.findUniqueOrThrow({where:{id:old.id}});
 for(const enabled of ['false','true']){process.env.QAVIO_PUBLIC_FORMS_ENABLED=enabled;process.env.QAVIO_DATA_POLICY_APPROVED='true';process.env.EMAIL_PROVIDER='smtp';process.env.SMTP_HOST='smtp.example.invalid';process.env.EMAIL_FROM='qa@example.invalid';
 for(const operation of ['subscribe','confirm'] as const){const response=await post(operation,{email,token:tokenValue(token.id)});assert.equal(response.status,410);assert.deepEqual(await response.json(),{ok:false,code:'NEWSLETTER_RETIRED'});}}
 assert.deepEqual(await counts(),before,'Retired endpoints cannot write subscriber/token/event/outbox');assert.deepEqual(await db().newsletterSubscriber.findUnique({where:{id:old.id}}),original,'Stored subscriber unchanged');
 process.env.QAVIO_PUBLIC_FORMS_ENABLED='false';process.env.EMAIL_PROVIDER='disabled';
 assert.equal((await post('unsubscribe',{token:'a'.repeat(64)})).status,400);
 assert.equal((await post('unsubscribe',{token:tokenValue(token.id)})).status,200);
 const after=await db().newsletterSubscriber.findUniqueOrThrow({where:{id:old.id}});assert.equal(after.status,'UNSUBSCRIBED');assert.equal(after.emailNormalized,original.emailNormalized);assert.equal(await db().newsletterSubscriber.count(),before.subscribers);assert.equal((await post('unsubscribe',{token:tokenValue(token.id)})).status,410);
 console.log('PASS newsletter retirement:410 despite enabled flags/SMTP; zero intake writes; existing row preserved; opt-out works with intake/SMTP disabled; invalid/replayed token safe');
}
main().catch(e=>{console.error(e instanceof assert.AssertionError?e.message:'RETIREMENT_TEST_FAILED');process.exitCode=1;}).finally(async()=>{await db().newsletterSubscriber.deleteMany({where:{emailNormalized:email}});await db().$disconnect();});

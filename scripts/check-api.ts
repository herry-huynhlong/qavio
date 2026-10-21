import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
import {POLICY_VERSION} from '../src/lib/submission-schema';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const base=new URL(process.env.TEST_BASE_URL||'http://127.0.0.1:3100');if(!['127.0.0.1','localhost','[::1]'].includes(base.hostname))throw Error('LOCAL_HTTP_TEST_ONLY');
const name='http-contact-'+randomUUID();
async function post(path:string,body:unknown,key=randomUUID(),origin=base.origin){return fetch(new URL(path,base),{method:'POST',headers:{'content-type':'application/json',origin,'idempotency-key':key},body:JSON.stringify(body)});}
async function main(){
 const status=await(await fetch(new URL('/api/forms/status',base))).json();assert.equal(status.testing,true);assert.equal(status.enabled,true);assert.equal(status.emailConfigured,false);assert.equal(status.newsletterEnabled,false);
 for(const path of ['/api/leads','/api/leads/export','/api/leads/notifications','/api/notifications','/api/subscribers','/api/newsletter/subscribers'])assert.equal((await fetch(new URL(path,base))).status,404);
 for(const path of ['/api/contact','/api/demo-requests','/api/quote-requests','/api/newsletter/subscribe','/api/newsletter/confirm','/api/newsletter/unsubscribe'])assert.equal((await fetch(new URL(path,base))).status,405);
 assert.equal((await post('/api/contact',{},randomUUID(),'https://evil.example')).status,403);assert.equal((await post('/api/contact',{})).status,422);assert.equal((await post('/api/newsletter/subscribe',{})).status,503);
 const body={fullName:name,phone:'+12025550198',consent:true,privacyPolicyVersion:POLICY_VERSION,sourcePage:'/request-demo',inquiryType:'DEMO',website:'',startedAt:Date.now()-5000},key=randomUUID();
 const results=await Promise.all([post('/api/demo-requests',body,key),post('/api/demo-requests',body,key)]);for(const r of results){assert.equal(r.status,200);assert.ok(!JSON.stringify(await r.json()).includes(name));}
 const rows=await db().lead.findMany({where:{fullName:name}});assert.equal(rows.length,1);assert.equal(rows[0].email,null);assert.equal(rows[0].message,'');assert.equal(await db().emailOutbox.count({where:{leadId:rows[0].id}}),0);
 console.log(JSON.stringify({suite:'compiled HTTP APIs',leadWithoutEmail:true,idempotency:true,noOutbox:true,newsletterClosed:true,publicDataProtected:true,result:'PASS'}));
}
main().catch(e=>{console.error('HTTP_API_CHECK_FAILED',e instanceof assert.AssertionError?e.message:'CHECK_FAILED');process.exitCode=1;}).finally(async()=>{await db().lead.deleteMany({where:{fullName:name}});await db().$disconnect();});
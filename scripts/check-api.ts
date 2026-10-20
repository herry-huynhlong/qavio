import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
import {POLICY_VERSION} from '../src/lib/submission-schema';
import {tokenValue} from '../src/server/crypto';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');
process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const base=new URL(process.env.TEST_BASE_URL||'http://127.0.0.1:3100');
if(!['127.0.0.1','localhost','[::1]'].includes(base.hostname))throw Error('LOCAL_HTTP_TEST_ONLY');
const run=randomUUID(),email=`http-${run}@example.invalid`;
async function post(path:string,body:unknown,headers:Record<string,string>={}){return fetch(new URL(path,base),{method:'POST',headers:{'content-type':'application/json',origin:base.origin,'idempotency-key':randomUUID(),...headers},body:JSON.stringify(body)});}
async function main(){
  const status=await(await fetch(new URL('/api/forms/status',base))).json();assert.equal(status.testing,true);assert.equal(status.enabled,true);assert.equal(status.emailConfigured,false);
  for(const path of ['/api/leads','/api/leads/export','/api/subscribers','/api/newsletter/subscribers'])assert.equal((await fetch(new URL(path,base))).status,404);
  for(const path of ['/api/contact','/api/demo-requests','/api/quote-requests','/api/newsletter/subscribe','/api/newsletter/confirm','/api/newsletter/unsubscribe'])assert.equal((await fetch(new URL(path,base))).status,405);
  assert.equal((await post('/api/contact',{}, {origin:'https://evil.example'})).status,403);
  assert.equal((await post('/api/contact',{email})).status,422);
  const sub={email,name:'HTTP QA',consent:true,privacyPolicyVersion:POLICY_VERSION,sourcePage:'/subscribe',website:'',startedAt:Date.now()-5000};
  const response=await post('/api/newsletter/subscribe',sub);assert.equal(response.status,200);const body=JSON.stringify(await response.json());assert.ok(!body.includes(email));
  const subscriber=await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:email}});assert.equal(subscriber.status,'PENDING');
  const token=await db().newsletterToken.findFirstOrThrow({where:{subscriberId:subscriber.id,purpose:'CONFIRM'}});
  for(const path of ['/newsletter/confirm','/newsletter/unsubscribe']){const page=await fetch(new URL(path,base));assert.equal(page.status,200);assert.match(await page.text(),/noindex/);}
  assert.equal((await post('/api/newsletter/confirm',{token:tokenValue(token.id)})).status,200);
  const unsubscribe=await db().newsletterToken.findFirstOrThrow({where:{subscriberId:subscriber.id,purpose:'UNSUBSCRIBE'}});
  assert.equal((await post('/api/newsletter/unsubscribe',{token:tokenValue(unsubscribe.id)})).status,200);
  assert.equal((await db().newsletterSubscriber.findUniqueOrThrow({where:{id:subscriber.id}})).status,'UNSUBSCRIBED');
  console.log(JSON.stringify({suite:'compiled HTTP APIs',publicListings:'not exposed',getMutations:'blocked',newsletter:'pending-confirm-unsubscribe PASS',privateResponse:'PASS',status:'PASS'}));
}
main().catch(()=>{console.error('HTTP_API_CHECK_FAILED');process.exitCode=1;}).finally(async()=>{await db().newsletterSubscriber.deleteMany({where:{emailNormalized:email}});await db().$disconnect();});

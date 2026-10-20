import assert from 'node:assert/strict';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const emails=['qa-browser-phase-c@example.invalid','qa-browser-demo-phase-c@example.invalid','qa-browser-quote-phase-c@example.invalid'];
const newsletter='qa-browser-newsletter-phase-c@example.invalid';
async function main(){
  const expected=['CONTACT','DEMO','QUOTE'];
  for(let i=0;i<emails.length;i++){const rows=await db().lead.findMany({where:{email:emails[i]}});assert.equal(rows.length,1);assert.equal(rows[0].inquiryType,expected[i]);assert.equal(rows[0].status,'NEW');assert.ok(rows[0].consentAcceptedAt);if(i===2){assert.equal(rows[0].planInterest,'PRO');assert.equal(rows[0].termMonths,6);}assert.equal(await db().newsletterSubscriber.count({where:{emailNormalized:emails[i]}}),0);}
  assert.equal((await db().newsletterSubscriber.findUniqueOrThrow({where:{emailNormalized:newsletter}})).status,process.argv.includes('--completed-newsletter')?'UNSUBSCRIBED':'PENDING');
  if(process.argv.includes('--completed-newsletter')){const rows=await db().lead.findMany({where:{email:'qa-browser-failure-phase-c@example.invalid'}});assert.equal(rows.length,1);assert.match(rows[0].message,/Kiem thu mat ket noi/);}
  console.log(JSON.stringify({suite:'browser UI → compiled API → actual PostgreSQL',contact:'PASS',demo:'PASS',quote:'PASS',newsletter:process.argv.includes('--completed-newsletter')?'confirm + unsubscribe PASS':'PENDING PASS',silentMarketingEnrollment:'none'}));
  if(process.argv.includes('--cleanup')){await db().lead.deleteMany({where:{email:{in:[...emails,'qa-browser-failure-phase-c@example.invalid']}}});await db().newsletterSubscriber.deleteMany({where:{emailNormalized:newsletter}});console.log('SCOPED_BROWSER_QA_ROWS_REMOVED');}
}
main().catch(()=>{console.error('BROWSER_DATABASE_CHECK_FAILED');process.exitCode=1;}).finally(()=>db().$disconnect());

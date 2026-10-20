// Explicit local QA setup/cleanup; never used in deployment or automatic bootstrap.
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
import {hashPassword} from '../src/server/admin/password';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const file='.runtime/admin-browser-fixture.json';
async function main(){
 if(process.argv.includes('--cleanup')){const fixture=JSON.parse(await readFile(file,'utf8')),ids=fixture.users.map((u:{id:string})=>u.id);const media=await db().mediaAsset.findMany({where:{createdById:{in:ids}}});await db().contentEntry.deleteMany({where:{authorId:{in:ids}}});await db().category.deleteMany({where:{slug:{startsWith:fixture.prefix}}});await db().mediaAsset.deleteMany({where:{id:{in:media.map(m=>m.id)}}});for(const m of media)await unlink('.runtime/media/'+m.storageKey).catch(()=>{});await db().dataRequest.deleteMany({where:{actorId:{in:ids}}});await db().lead.deleteMany({where:{id:{in:fixture.leads}}});await db().newsletterSubscriber.deleteMany({where:{id:{in:fixture.subscribers}}});await db().emailOutbox.deleteMany({where:{id:{in:fixture.emails}}});await db().auditLog.deleteMany({where:{OR:[{actorId:{in:ids}},{targetId:{in:ids}}]}});await db().adminUser.deleteMany({where:{id:{in:ids}}});await unlink(file);console.log('Local browser QA fixtures removed.');return;}
 if(await db().adminUser.count())throw Error('Use empty qavio_test admin fixture scope.');
 const prefix='browser-'+randomUUID(),password=randomBytes(30).toString('base64url'),passwordHash=await hashPassword(password),users=[];
 for(const role of ['SUPER_ADMIN','ADMIN','EDITOR'] as const){const user=await db().adminUser.create({data:{email:`${role.toLowerCase()}-${prefix}@example.invalid`,name:role==='SUPER_ADMIN'?'QAVIO QA · Quản trị':'QAVIO QA · '+role,role,passwordHash}});users.push({id:user.id,email:user.email,role});}
 const leads=[],subscribers=[],emails=[];
 for(let i=0;i<24;i++){const row=await db().lead.create({data:{fullName:`Kiểm thử local ${String(i+1).padStart(2,'0')}`,email:`${i}-${prefix}@example.invalid`,phone:'0900000000',inquiryType:i%2?'DEMO':'CONTACT',message:'Dữ liệu kiểm thử local; không phải yêu cầu khách hàng thật.',subject:'Kiểm tra giao diện',sourcePage:'/contact',consentAcceptedAt:new Date(),privacyPolicyVersion:'qa-only'}});leads.push(row.id);}
 const sub=await db().newsletterSubscriber.create({data:{emailNormalized:`${prefix}@example.invalid`,name:'Người kiểm thử',source:'/subscribe'}});subscribers.push(sub.id);
 const email=await db().emailOutbox.create({data:{kind:'LEAD_RECEIPT',recipient:`${prefix}@example.invalid`,payload:{leadId:leads[0]},status:'FAILED',attempts:5}});emails.push(email.id);
 await writeFile(file,JSON.stringify({prefix,password,users,leads,subscribers,emails}),{mode:0o600,flag:'wx'});console.log('Local browser fixtures created; credentials are in ignored runtime file, not logs.');
}
main().catch(()=>{console.error('QA_FIXTURE_FAILED');process.exitCode=1;}).finally(()=>db().$disconnect());

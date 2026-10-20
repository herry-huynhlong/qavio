import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const email=`cli-${randomUUID()}@example.invalid`,password=randomBytes(30).toString('base64url');let id:string|undefined;
async function cli(input:unknown,test=true,env=process.env){return new Promise<{code:number|null;output:string}>(resolve=>{const child=spawn(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/bootstrap-admin.ts',...(test?['--test']:[])],{env,windowsHide:true,stdio:['pipe','pipe','pipe']});let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);child.on('close',code=>resolve({code,output}));child.stdin.end(JSON.stringify(input));});}
async function main(){assert.equal(await db().adminUser.count(),0);const input={email,name:'QA CLI',password};const first=await cli(input);assert.equal(first.code,0);assert.ok(!first.output.includes(password));const row=await db().adminUser.findUniqueOrThrow({where:{email}});id=row.id;assert.equal(row.role,'SUPER_ADMIN');assert.match(row.passwordHash,/^scrypt\$/);assert.equal((await cli(input)).code,1);assert.equal((await cli(input,false,{...process.env,DATABASE_URL:'postgresql://wrong:wrong@127.0.0.1:1/qavio_prod'})).code,1);console.log('PASS CLI stdin bootstrap, no echoed credential, duplicate/production guards');}
main().catch(error=>{console.error('BOOTSTRAP_CHECK_FAILED',error instanceof assert.AssertionError?error.message:'CHECK_FAILED');process.exitCode=1;}).finally(async()=>{if(id){await db().auditLog.deleteMany({where:{actorId:id}});await db().adminUser.delete({where:{id}});}await db().$disconnect();});

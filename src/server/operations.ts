import {access,mkdir,readFile,rename,statfs,writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {db} from './db';
import {validateEnvironment} from '../../deploy/runtime-environment.mjs';
export function opsRoot(){if(['production','staging'].includes(process.env.QAVIO_DEPLOYMENT_ENV||'')&&!process.env.QAVIO_OPS_ROOT)throw Error('OPS_STORAGE_REQUIRED');return path.resolve(/* turbopackIgnore: true */ process.env.QAVIO_OPS_ROOT||'.runtime/ops');}
let heartbeatQueue:Promise<void>=Promise.resolve();
async function writeHeartbeat(state:'STARTING'|'READY'|'EMAIL_DISABLED'|'ERROR'|'STOPPED'){
 const root=opsRoot();await mkdir(root,{recursive:true,mode:0o700});const file=path.join(root,'worker.json'),tmp=file+'.tmp';
 await writeFile(tmp,JSON.stringify({version:1,state,at:new Date().toISOString()}),{mode:0o600});await rename(tmp,file);
}
export function workerHeartbeat(state:Parameters<typeof writeHeartbeat>[0]){const next=heartbeatQueue.catch(()=>{}).then(()=>writeHeartbeat(state));heartbeatQueue=next;return next;}
export async function workerStatus(){try{const text=await readFile(/* turbopackIgnore: true */ path.join(opsRoot(),'worker.json'),'utf8');const value=JSON.parse(text);if(!['STARTING','READY','EMAIL_DISABLED','ERROR','STOPPED'].includes(value.state)||!Number.isFinite(Date.parse(value.at)))throw Error();const age=Date.now()-Date.parse(value.at);return {state:value.state,ageSeconds:Math.round(age/1000),healthy:age>=-5000&&age<90000&&['READY','EMAIL_DISABLED'].includes(value.state)};}catch{return {state:'UNKNOWN',ageSeconds:null,healthy:false};}}
export async function databaseReady(){
 await db().$transaction(async tx=>{await tx.$executeRaw`SET LOCAL statement_timeout = '2000ms'`;await tx.$queryRaw`SELECT 1`;
  // Test the columns introduced by D without reading PII or requiring migration-owner privileges.
  await tx.$queryRaw`SELECT "assignedToId",version FROM "Lead" LIMIT 0`;await tx.$queryRaw`SELECT "sessionVersion" FROM "AdminUser" LIMIT 0`;await tx.$queryRaw`SELECT "manualRetries" FROM "EmailOutbox" LIMIT 0`;await tx.$queryRaw`SELECT "featuredMediaId" FROM "ContentEntry" LIMIT 0`;
 },{maxWait:2500,timeout:3000});
}
async function checkReadiness(){
 try{validateEnvironment();await databaseReady();if(process.env.QAVIO_CMS_ENABLED==='true'||process.env.QAVIO_ADMIN_ENABLED==='true'){const root=path.resolve(/* turbopackIgnore: true */ process.env.QAVIO_MEDIA_ROOT||'.runtime/media');await access(root,constants.R_OK|constants.W_OK);const disk=await statfs(/* turbopackIgnore: true */ root);if(Number(disk.bavail)*Number(disk.bsize)<64*1024*1024)throw Error();}return true;}catch{return false;}
}
let readyAt=0,readyValue=false,readyFlight:Promise<boolean>|null=null;
export async function readiness(){if(Date.now()-readyAt<5000)return readyValue;if(readyFlight)return readyFlight;readyFlight=checkReadiness().then(value=>{readyValue=value;readyAt=Date.now();return value;}).finally(()=>{readyFlight=null;});return readyFlight;}
export async function operationalStatus(){
 await databaseReady();const since=new Date(Date.now()-3600000);
 const [failed,pending,loginFailures,media,worker]=await Promise.all([db().emailOutbox.count({where:{status:'FAILED'}}),db().emailOutbox.count({where:{status:'PENDING'}}),db().auditLog.count({where:{action:'LOGIN_FAILED',createdAt:{gte:since}}}),db().mediaAsset.aggregate({_sum:{byteSize:true},_count:true}),workerStatus()]);
 const disk=await statfs(/* turbopackIgnore: true */ opsRoot());
 let backup:{state:string;ageHours?:number}={state:'UNKNOWN'};try{const value=JSON.parse(await readFile(/* turbopackIgnore: true */ path.join(opsRoot(),'backup.json'),'utf8')),age=(Date.now()-Date.parse(value.at))/3600000;if(!Number.isFinite(age)||age<0||!/^[a-f0-9]{64}$/.test(value.sha256))throw Error();backup={state:age<=36?'FRESH':'STALE',ageHours:Math.round(age*10)/10};}catch{}
 return {databaseReady:true,worker,backup,email:{failed,pending,configured:process.env.EMAIL_PROVIDER==='smtp'},loginFailuresLastHour:loginFailures,media:{files:media._count,bytes:media._sum.byteSize||0},diskAvailableBytes:Number(disk.bavail)*Number(disk.bsize),cliRssBytes:process.memoryUsage().rss};
}

import {setTimeout as delay} from 'node:timers/promises';
import {runOutboxBatch} from '../src/server/outbox-worker';
import {db} from '../src/server/db';
import {workerHeartbeat} from '../src/server/operations';
import {validateEnvironment} from '../deploy/runtime-environment.mjs';
try{process.loadEnvFile('.env.local');}catch{}
let stopping=false;const pause=new AbortController();let state:'STARTING'|'READY'|'EMAIL_DISABLED'|'ERROR'='STARTING';let heartbeat:ReturnType<typeof setInterval>|undefined;
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{stopping=true;pause.abort();});
async function main(){
  validateEnvironment();await workerHeartbeat('STARTING');heartbeat=setInterval(()=>{void workerHeartbeat(state).catch(()=>{});},15000);heartbeat.unref();
  do{
    try{const result=await runOutboxBatch(undefined,10,()=>stopping);state='reason' in result?'EMAIL_DISABLED':'READY';await workerHeartbeat(state);console.log(JSON.stringify({event:'outbox_batch',...result}));}
    catch{state='ERROR';await workerHeartbeat('ERROR');console.error(JSON.stringify({event:'outbox_worker_error'}));if(!process.argv.includes('--loop'))throw Error('WORKER_FAILED');}
    if(!process.argv.includes('--loop')||stopping)break;
    await delay(15000,undefined,{signal:pause.signal}).catch(()=>{});
  }while(!stopping);
}
main().catch(()=>{console.error('OUTBOX_WORKER_FAILED');process.exitCode=1;}).finally(async()=>{if(heartbeat)clearInterval(heartbeat);await workerHeartbeat('STOPPED').catch(()=>{});await db().$disconnect();});

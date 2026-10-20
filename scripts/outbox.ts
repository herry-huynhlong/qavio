import {runOutboxBatch} from '../src/server/outbox-worker';
import {db} from '../src/server/db';
try{process.loadEnvFile('.env.local');}catch{}
async function main(){
  do{
    const result=await runOutboxBatch();
    console.log(JSON.stringify({event:'outbox_batch',...result}));
    if(!process.argv.includes('--loop'))break;
    await new Promise(resolve=>setTimeout(resolve,15000));
  }while(true);
}
main().catch(()=>{console.error('OUTBOX_WORKER_FAILED');process.exitCode=1;}).finally(async()=>{await db().$disconnect();});

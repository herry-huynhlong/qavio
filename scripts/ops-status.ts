import {operationalStatus,workerStatus} from '../src/server/operations';
import {db} from '../src/server/db';
try{process.loadEnvFile('.env.local');}catch{}
async function main(){if(process.argv.includes('--worker-health')){const state=await workerStatus();if(!state.healthy)process.exitCode=1;console.log(JSON.stringify(state));return;}console.log(JSON.stringify(await operationalStatus()));}
main().catch(()=>{console.error('QAVIO_OPERATIONS_UNAVAILABLE');process.exitCode=1;}).finally(()=>db().$disconnect());

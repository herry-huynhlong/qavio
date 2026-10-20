import {assertDatabaseUrl} from '../src/server/db-safety';
import {db} from '../src/server/db';
try{process.loadEnvFile('.env.local');}catch{}
async function main(){
  const purpose=process.argv[2];
  if(purpose!=='dev'&&purpose!=='test')throw Error('LOCAL_MAINTENANCE_ONLY');
  if(purpose==='test'){assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';}
  else assertDatabaseUrl(process.env.DATABASE_URL,'development');
  const now=new Date();
  const [keys,buckets]=await db().$transaction([db().idempotencyRecord.deleteMany({where:{expiresAt:{lt:now}}}),db().rateLimitBucket.deleteMany({where:{resetAt:{lt:now}}})]);
  console.log(JSON.stringify({event:'expired_technical_records_removed',keys:keys.count,buckets:buckets.count}));
}
main().catch(()=>{console.error('MAINTENANCE_FAILED');process.exitCode=1;}).finally(()=>db().$disconnect());

import {spawnSync} from 'node:child_process';
import {PrismaClient} from '@prisma/client';
// Previous C approval does not authorize a D/E release. Operators must supply
// fresh release approval and verified-backup evidence before each invocation.
function approvedTarget(){
  if(process.env.QAVIO_DEPLOYMENT_ENV!=='production'||process.env.QAVIO_PRODUCTION_MIGRATION_APPROVED!=='true'||process.env.QAVIO_PREDEPLOY_BACKUP_VERIFIED!=='true'||!/^[a-f0-9]{40}$/.test(process.env.QAVIO_APPROVED_RELEASE_SHA||''))throw Error('PRODUCTION_MIGRATION_NOT_APPROVED');
  let target;
  try{target=new URL(process.env.DATABASE_URL);}catch{throw Error('INVALID_MIGRATION_TARGET');}
  if(!['postgresql:','postgres:'].includes(target.protocol)||target.hostname!=='qavio-postgres'||target.pathname!=='/qavio_prod'||target.username!=='qavio_owner')throw Error('MIGRATION_TARGET_REJECTED');
}
async function main(){
  approvedTarget();
  const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{stdio:'inherit',env:process.env});
  if(result.status!==0)throw Error('MIGRATION_FAILED');
  const client=new PrismaClient({log:[]});
  try{await client.$executeRawUnsafe('REVOKE ALL ON TABLE "_prisma_migrations" FROM qavio_app');}
  finally{await client.$disconnect();}
  console.log('QAVIO_PRODUCTION_MIGRATIONS_COMPLETE');
}
main().catch(()=>{console.error('QAVIO_PRODUCTION_MIGRATION_FAILED');process.exitCode=1;});

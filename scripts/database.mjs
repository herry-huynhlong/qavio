import {spawnSync} from 'node:child_process';
import {assertDatabaseUrl} from '../src/server/db-safety.ts';
try{process.loadEnvFile('.env.local');}catch{}
const purpose=process.argv[2];
if(!['dev','test'].includes(purpose))throw new Error('Use database.mjs dev|test. Production/staging migrations require a separate approved procedure.');
const target=purpose==='test'?process.env.QAVIO_TEST_DATABASE_URL:process.env.DATABASE_URL;
assertDatabaseUrl(target,purpose==='test'?'test':'development');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{stdio:'inherit',env:{...process.env,DATABASE_URL:target}});
process.exitCode=result.status??1;

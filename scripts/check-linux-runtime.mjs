// Run inside the isolated operations image. Does not bootstrap users or send mail.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {access,readFile,stat} from 'node:fs/promises';
import {createSecureContext} from 'node:tls';
import sharp from 'sharp';
import {PrismaClient} from '@prisma/client';
import {validateEnvironment} from '../deploy/runtime-environment.mjs';
async function main(){assert.equal(process.platform,'linux','LINUX_RUNTIME_REQUIRED');validateEnvironment();assert.equal(process.env.QAVIO_DEPLOYMENT_ENV,'staging');const client=new PrismaClient({log:[]});try{
 assert.equal(process.getuid(),1000);assert.ok(process.versions.openssl);createSecureContext();await access('/etc/ssl/certs/ca-certificates.crt');
 const pg=spawnSync('pg_dump',['--version'],{encoding:'utf8'});assert.equal(pg.status,0);assert.match(pg.stdout,/16\./);
 assert.equal((await client.$queryRaw`SELECT current_database() AS name`)[0].name,'qavio_staging');assert.equal((await client.$queryRaw`SELECT current_user AS name`)[0].name,'qavio_app');
 assert.equal((await client.$queryRaw`SELECT has_schema_privilege(current_user,'public','CREATE') AS allowed`)[0].allowed,false);assert.equal((await client.$queryRaw`SELECT has_table_privilege(current_user,'public."_prisma_migrations"','INSERT') AS allowed`)[0].allowed,false);await client.adminUser.count();await client.contentEntry.count();
 const image=await sharp({create:{width:64,height:48,channels:3,background:'#102030'}}).png().toBuffer();assert.equal((await sharp(image).webp().toBuffer({resolveWithObject:true})).info.format,'webp');
 for(const root of [process.env.QAVIO_MEDIA_ROOT,process.env.QAVIO_OPS_ROOT]){const info=await stat(root);assert.equal(info.uid,1000);assert.ok(!(info.mode&0o022),'Private volume must not be group/world writable');}
 const base=new URL(process.env.QAVIO_CHECK_BASE_URL||'http://web:3000');assert.equal(base.hostname,'web');for(const endpoint of ['/api/health','/api/ready'])assert.equal((await fetch(new URL(endpoint,base))).status,200);
 const forms=await(await fetch(new URL('/api/forms/status',base))).json();assert.equal(forms.enabled,false);assert.equal(forms.emailConfigured,false);
 for(const file of ['/app/.env','/app/.env.local','/app/.env.production','/app/.runtime']){await assert.rejects(access(file));}
 console.log(JSON.stringify({platform:'linux',openssl:true,ca:true,pgTools16:true,prisma:true,leastPrivilege:true,sharp:true,volumes:true,health:true,readiness:true,formsClosed:true,status:'PASS'}));
 // Full admin/CMS/upload/restart/restore follow the runbook; do not substitute this smoke for them.
 await readFile('/etc/os-release');
}finally{await client.$disconnect();}}
main().catch(()=>{console.error('LINUX_RUNTIME_CHECK_FAILED');process.exitCode=1;});

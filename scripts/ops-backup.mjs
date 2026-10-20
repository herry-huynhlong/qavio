import {createCipheriv,createDecipheriv,createHash,publicEncrypt,privateDecrypt,randomBytes} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {appendFile,chmod,mkdir,mkdtemp,open,readFile,readdir,rename,rm,stat,writeFile} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PrismaClient} from '@prisma/client';
const MAGIC=Buffer.from('QAVIO-BACKUP-1\n'),MAX_MANIFEST=1024*1024;
const tables=['Lead','LeadActivity','NewsletterSubscriber','NewsletterConsentEvent','NewsletterToken','EmailOutbox','AdminUser','AdminSession','AuditLog','Category','ContentEntry','ContentRevision','MediaAsset','DataRequest','IdempotencyRecord','RateLimitBucket'];
export function backupTarget(raw,{restore=false,testSandbox=false}={}){
 const u=new URL(raw||'');if(!['postgres:','postgresql:'].includes(u.protocol))throw Error('TARGET_REJECTED');
 const name=decodeURIComponent(u.pathname.slice(1)),local=['127.0.0.1','localhost','[::1]'].includes(u.hostname);
 const sandbox=/^qavio_e_(migration|restore)_[a-f0-9]{12}$/.test(name)&&local&&testSandbox;
 if(restore){if(!/^qavio_e_restore_[a-f0-9]{12}$/.test(name)||!local||!testSandbox)throw Error('ISOLATED_EMPTY_RESTORE_TARGET_REQUIRED');}
 else if(!sandbox&&!['qavio_dev','qavio_test','qavio_staging','qavio_prod'].includes(name))throw Error('TARGET_REJECTED');
 if(['qavio_dev','qavio_test'].includes(name)&&!local&&u.hostname!=='qavio-postgres')throw Error('LOCAL_TARGET_REQUIRED');
 if(['qavio_staging','qavio_prod'].includes(name)&&u.hostname!=='qavio-postgres')throw Error('DEPLOYED_TARGET_HOST_REJECTED');
 return u;
}
export async function pgTool(tool,url,args){
 const executable=process.env.QAVIO_PG_BIN?path.join(process.env.QAVIO_PG_BIN,tool+(process.platform==='win32'?'.exe':'')):tool;
 const env={...process.env,PGHOST:url.hostname.replace(/^\[|\]$/g,''),PGPORT:url.port||'5432',PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),PGCONNECT_TIMEOUT:'5'};
 if(url.searchParams.has('sslmode'))env.PGSSLMODE=url.searchParams.get('sslmode');
 return new Promise((resolve,reject)=>{const child=spawn(executable,['--no-password',...args],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});const out=[];let bytes=0;child.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes<1024*1024)out.push(chunk);});child.stderr.resume();child.on('error',()=>reject(Error('PG_TOOL_UNAVAILABLE')));child.on('close',code=>code===0?resolve(Buffer.concat(out).toString()):reject(Error('PG_TOOL_FAILED')));});
}
async function hashFile(file){const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');}
async function ownedTemp(root,fn){const parent=path.resolve(root);await mkdir(parent,{recursive:true,mode:0o700});const folder=await mkdtemp(path.join(parent,'qavio-ops-'));await chmod(folder,0o700);try{return await fn(folder);}finally{const resolved=path.resolve(folder);if(!resolved.startsWith(parent+path.sep)||!path.basename(resolved).startsWith('qavio-ops-'))throw Error('TEMP_BOUNDARY_REJECTED');await rm(resolved,{recursive:true,force:true});}}
async function inventory(client){const result={};for(const table of tables){const exists=await client.$queryRawUnsafe(`SELECT to_regclass('public."${table}"')::text AS name`);if(exists[0].name){const rows=await client.$queryRawUnsafe(`SELECT count(*)::int AS count FROM "${table}"`);result[table]=rows[0].count;}}return result;}
/** @param {{url:string,mediaRoot:string,output:string,publicKeyFile:string,tempRoot:string,testSandbox?:boolean,quiesced?:boolean,productionApproved?:boolean,statusFile?:string}} options */
export async function backup({url,mediaRoot,output,publicKeyFile,tempRoot,testSandbox=false,quiesced=false,productionApproved=false,statusFile=undefined}){
 const target=backupTarget(url,{testSandbox});if(target.pathname==='/qavio_prod'&&!productionApproved)throw Error('PRODUCTION_BACKUP_APPROVAL_REQUIRED');if(!quiesced)throw Error('QUIESCED_BACKUP_REQUIRED');
 const client=new PrismaClient({datasources:{db:{url}},log:[]});
 try{return await ownedTemp(tempRoot,async temp=>{
  const dump=path.join(temp,'database.dump');await pgTool('pg_dump',target,['--format=custom','--no-owner','--no-acl','--file',dump]);await chmod(dump,0o600);
  const mediaTable=await client.$queryRaw`SELECT to_regclass('public."MediaAsset"')::text AS name`;
  const media=mediaTable[0].name?await client.mediaAsset.findMany({select:{storageKey:true,byteSize:true}}):[],files=[{name:'database.dump',file:dump,size:(await stat(dump)).size,sha256:await hashFile(dump)}];
  for(const row of media){if(!/^[a-f0-9-]{36}\.webp$/.test(row.storageKey))throw Error('UNSAFE_MEDIA_KEY');const file=path.resolve(mediaRoot,row.storageKey);const info=await stat(file);if(!info.isFile()||info.size!==row.byteSize)throw Error('MEDIA_FILE_MISMATCH');files.push({name:'media/'+row.storageKey,file,size:info.size,sha256:await hashFile(file)});}
  const manifest={version:1,createdAt:new Date().toISOString(),database:target.pathname.slice(1),counts:await inventory(client),files:files.map(({name,size,sha256})=>({name,size,sha256}))};
  const manifestBytes=Buffer.from(JSON.stringify(manifest));if(manifestBytes.length>MAX_MANIFEST)throw Error('MANIFEST_LIMIT');const length=Buffer.alloc(4);length.writeUInt32BE(manifestBytes.length);
  const key=randomBytes(32),iv=randomBytes(12),wrappedKey=publicEncrypt({key:await readFile(publicKeyFile),oaepHash:'sha256'},key).toString('base64');
  const header=Buffer.from(JSON.stringify({algorithm:'AES-256-GCM+RSA-OAEP-SHA256',iv:iv.toString('base64'),wrappedKey})),headerLength=Buffer.alloc(4);headerLength.writeUInt32BE(header.length);
  await mkdir(path.dirname(path.resolve(output)),{recursive:true,mode:0o700});const stream=createWriteStream(output,{flags:'wx',mode:0o600});stream.write(Buffer.concat([MAGIC,headerLength,header]));
  const cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(header);
  async function* payload(){yield length;yield manifestBytes;for(const entry of files)for await(const chunk of createReadStream(entry.file))yield chunk;}
  await pipeline(payload(),cipher,stream);await appendFile(output,cipher.getAuthTag());key.fill(0);
  const result={file:path.basename(output),sha256:await hashFile(output),counts:manifest.counts,mediaFiles:media.length};
  if(statusFile){await mkdir(path.dirname(path.resolve(statusFile)),{recursive:true,mode:0o700});await writeFile(statusFile+'.tmp',JSON.stringify({at:new Date().toISOString(),file:result.file,sha256:result.sha256}),{mode:0o600});await rename(statusFile+'.tmp',statusFile);}
  return result;
 });}finally{await client.$disconnect();}
}
export async function restoreIsolated({url,input,mediaRoot,privateKeyFile,tempRoot,testSandbox=false}){
 const target=backupTarget(url,{restore:true,testSandbox}),client=new PrismaClient({datasources:{db:{url}},log:[]});
 try{
  const existing=await client.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;if(existing.length)throw Error('RESTORE_TARGET_NOT_EMPTY');
  await mkdir(mediaRoot,{recursive:true,mode:0o700});if((await readdir(mediaRoot)).length)throw Error('RESTORE_MEDIA_NOT_EMPTY');
  return await ownedTemp(tempRoot,async temp=>{
   const handle=await open(input,'r');const size=(await handle.stat()).size;const prefix=Buffer.alloc(MAGIC.length+4);await handle.read(prefix,0,prefix.length,0);if(!prefix.subarray(0,MAGIC.length).equals(MAGIC))throw Error('BACKUP_FORMAT_INVALID');const len=prefix.readUInt32BE(MAGIC.length);if(len>16384||len<1)throw Error('BACKUP_HEADER_LIMIT');
   const headerBytes=Buffer.alloc(len);await handle.read(headerBytes,0,len,prefix.length);const header=JSON.parse(headerBytes.toString());const tag=Buffer.alloc(16);await handle.read(tag,0,16,size-16);await handle.close();
   if(header.algorithm!=='AES-256-GCM+RSA-OAEP-SHA256')throw Error('BACKUP_ALGORITHM_REJECTED');
   const key=privateDecrypt({key:await readFile(privateKeyFile),oaepHash:'sha256'},Buffer.from(header.wrappedKey,'base64'));const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(header.iv,'base64'));decipher.setAAD(headerBytes);decipher.setAuthTag(tag);const plain=path.join(temp,'bundle.bin');
   await pipeline(createReadStream(input,{start:prefix.length+len,end:size-17}),decipher,createWriteStream(plain,{flags:'wx',mode:0o600}));key.fill(0);
   const bundle=await open(plain,'r');const n=Buffer.alloc(4);await bundle.read(n,0,4,0);const manifestSize=n.readUInt32BE();if(manifestSize>MAX_MANIFEST||manifestSize<1)throw Error('MANIFEST_LIMIT');const raw=Buffer.alloc(manifestSize);await bundle.read(raw,0,manifestSize,4);await bundle.close();const manifest=JSON.parse(raw.toString());if(manifest.version!==1||!Array.isArray(manifest.files)||manifest.files.length>100000)throw Error('MANIFEST_INVALID');
   let offset=4+manifestSize;const names=new Set();
   for(const entry of manifest.files){if(!/^(database\.dump|media\/[a-f0-9-]{36}\.webp)$/.test(entry.name)||names.has(entry.name)||!Number.isSafeInteger(entry.size)||entry.size<1||!/^\w{64}$/.test(entry.sha256))throw Error('ARCHIVE_ENTRY_INVALID');names.add(entry.name);const destination=entry.name==='database.dump'?path.join(temp,'database.dump'):path.join(mediaRoot,path.basename(entry.name));await pipeline(createReadStream(plain,{start:offset,end:offset+entry.size-1}),createWriteStream(destination,{flags:'wx',mode:0o600}));if(await hashFile(destination)!==entry.sha256)throw Error('ARCHIVE_INTEGRITY_FAILED');offset+=entry.size;}
   if(offset!==(await stat(plain)).size||!names.has('database.dump'))throw Error('ARCHIVE_SIZE_MISMATCH');
   await pgTool('pg_restore',target,['--exit-on-error','--single-transaction','--no-owner','--no-acl','--dbname',target.pathname.slice(1),path.join(temp,'database.dump')]);
   const actual=await inventory(client);if(JSON.stringify(actual)!==JSON.stringify(manifest.counts))throw Error('RESTORE_COUNT_MISMATCH');
   return {counts:actual,mediaFiles:manifest.files.length-1,integrity:'PASS'};
  });
 }finally{await client.$disconnect();}
}
async function main(){
 const testSandbox=process.env.QAVIO_E_TEST_SANDBOX==='true';
 if(process.argv.includes('--restore-isolated')){
  const result=await restoreIsolated({url:process.env.QAVIO_RESTORE_DATABASE_URL,input:process.env.QAVIO_BACKUP_FILE,mediaRoot:process.env.QAVIO_RESTORE_MEDIA_ROOT,privateKeyFile:process.env.QAVIO_BACKUP_PRIVATE_KEY_FILE,tempRoot:process.env.QAVIO_OPS_TEMP_ROOT||'.runtime/ops-temp',testSandbox});console.log(JSON.stringify({event:'qavio_restore_verified',...result}));
 }else{
  if(process.argv.length!==2)throw Error('CONFIGURE_VIA_ENV_ONLY');
  const result=await backup({url:process.env.DATABASE_URL,mediaRoot:process.env.QAVIO_MEDIA_ROOT,output:process.env.QAVIO_BACKUP_FILE,publicKeyFile:process.env.QAVIO_BACKUP_PUBLIC_KEY_FILE,tempRoot:process.env.QAVIO_OPS_TEMP_ROOT||'.runtime/ops-temp',testSandbox,quiesced:process.env.QAVIO_BACKUP_QUIESCED==='true',productionApproved:process.env.QAVIO_PRODUCTION_BACKUP_APPROVED==='true',statusFile:process.env.QAVIO_OPS_ROOT?path.join(process.env.QAVIO_OPS_ROOT,'backup.json'):undefined});console.log(JSON.stringify({event:'qavio_backup_complete',...result}));
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('QAVIO_BACKUP_OR_RESTORE_FAILED');process.exitCode=1;});

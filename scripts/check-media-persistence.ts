import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import path from 'node:path';
import {db} from '../src/server/db';
import {assertDatabaseUrl} from '../src/server/db-safety';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
const base='http://127.0.0.1:3100',file='.runtime/e-media-check.json';
const digest=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
async function main(){assert.equal((await(await fetch(base+'/api/forms/status')).json()).testing,true);
 if(process.argv.includes('--verify')){const saved=JSON.parse(await readFile(file,'utf8'));const response=await fetch(base+'/media/'+saved.id,{headers:{cookie:saved.cookie}});assert.equal(response.status,200);assert.equal(digest(Buffer.from(await response.arrayBuffer())),saved.hash);assert.notEqual((await fetch(base+'/media/'+saved.id)).status,200);await db().contentEntry.delete({where:{id:saved.entryId}});const asset=await db().mediaAsset.delete({where:{id:saved.id}});await unlink(path.resolve('.runtime/media',asset.storageKey));await unlink(file);console.log('PASS private media and persisted session survive actual standalone process restart');return;}
 const fixture=JSON.parse(await readFile('.runtime/admin-browser-fixture.json','utf8')),user=fixture.users.find((u:{role:string})=>u.role==='SUPER_ADMIN');
 const pre=await fetch(base+'/api/admin/auth/csrf'),nonce=await pre.json();const login=await fetch(base+'/api/admin/auth/login',{method:'POST',headers:{origin:base,cookie:pre.headers.getSetCookie()[0].split(';')[0],'content-type':'application/json','x-csrf-token':nonce.csrfToken},body:JSON.stringify({email:user.email,password:fixture.password})});assert.equal(login.status,200);const cookie=login.headers.getSetCookie().find(c=>c.startsWith('qavio_admin='))!.split(';')[0],me=await(await fetch(base+'/api/admin/auth/me',{headers:{cookie}})).json();
 const headers={cookie,origin:base,'x-csrf-token':me.csrfToken},image=await sharp({create:{width:1024,height:768,channels:3,background:'#152338'}}).png().toBuffer(),body=new FormData();body.set('file',new File([new Uint8Array(image)],'e-qa.png',{type:'image/png'}));const uploaded=await fetch(base+'/api/admin/media',{method:'POST',headers,body});assert.equal(uploaded.status,200);const asset=await uploaded.json();
 const entry=await fetch(base+'/api/admin/content',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({kind:'POST',slug:fixture.prefix+'-persistence',title:'QA media persistence',summary:'Local fixture only',bodyHtml:'<p>QA</p>',data:{},status:'DRAFT',featuredMediaId:asset.id})});assert.equal(entry.status,200);const content=await entry.json();const response=await fetch(base+'/media/'+asset.id,{headers:{cookie}});assert.equal(response.status,200);const hash=digest(Buffer.from(await response.arrayBuffer()));assert.notEqual((await fetch(base+'/media/'+asset.id)).status,200);
 await writeFile(file,JSON.stringify({id:asset.id,entryId:content.id,cookie,hash}),{mode:0o600});console.log('PASS actual HTTP upload/re-encode; draft private. Restart owned local server, then run --verify.');
}
main().catch(error=>{console.error('MEDIA_PERSISTENCE_FAILED',error instanceof assert.AssertionError?error.message:'CHECK_FAILED');process.exitCode=1;}).finally(()=>db().$disconnect());

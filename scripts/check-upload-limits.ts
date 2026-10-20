import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {db} from '../src/server/db';
import {assertDatabaseUrl} from '../src/server/db-safety';
process.loadEnvFile('.env.local');assertDatabaseUrl(process.env.QAVIO_TEST_DATABASE_URL,'test');process.env.DATABASE_URL=process.env.QAVIO_TEST_DATABASE_URL;process.env.QAVIO_DEPLOYMENT_ENV='test';
async function main(){const base='http://127.0.0.1:3100';assert.equal((await(await fetch(base+'/api/forms/status')).json()).testing,true);const saved=JSON.parse(await readFile('.runtime/e-media-check.json','utf8')),me=await(await fetch(base+'/api/admin/auth/me',{headers:{cookie:saved.cookie}})).json();const headers={cookie:saved.cookie,origin:base,'x-csrf-token':me.csrfToken};async function upload(bytes:Uint8Array,mime:string){const body=new FormData();body.set('file',new File([new Uint8Array(bytes)],'qa-validation.png',{type:mime}));return fetch(base+'/api/admin/media',{method:'POST',headers,body});}
 assert.equal((await upload(Buffer.from('<svg onload="alert(1)"></svg>'),'image/png')).status,422);assert.equal((await upload(Buffer.alloc(5*1024*1024+1),'image/png')).status,413);
 const original=await db().mediaAsset.findUniqueOrThrow({where:{id:saved.id}}),count=await db().mediaAsset.count();await db().mediaAsset.update({where:{id:saved.id},data:{byteSize:1073741824}});try{const png=await sharp({create:{width:20,height:20,channels:3,background:'#123456'}}).png().toBuffer();assert.equal((await upload(png,'image/png')).status,507);assert.equal(await db().mediaAsset.count(),count);}finally{await db().mediaAsset.update({where:{id:saved.id},data:{byteSize:original.byteSize}});}console.log('PASS HTTP spoofed SVG/oversize rejected; media quota returns 507 without new DB record');}
main().catch(error=>{console.error('UPLOAD_LIMITS_FAILED',error instanceof assert.AssertionError?error.message:'CHECK_FAILED');process.exitCode=1;}).finally(()=>db().$disconnect());

// Bounded loopback verification (four concurrent actors), never a production stress test.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import sharp from 'sharp';
const base='http://127.0.0.1:3100';
async function main(){assert.equal((await(await fetch(base+'/api/forms/status')).json()).testing,true);const fixture=JSON.parse(await readFile('.runtime/admin-browser-fixture.json','utf8')),samples:{name:string;ms:number;status:number}[]=[];
 async function measure(name:string,action:()=>Promise<Response>){const start=performance.now(),response=await action();await response.arrayBuffer();samples.push({name,ms:Math.round(performance.now()-start),status:response.status});return response;}
 async function login(user:{email:string}){const pre=await fetch(base+'/api/admin/auth/csrf'),nonce=await pre.json(),start=performance.now();const response=await fetch(base+'/api/admin/auth/login',{method:'POST',headers:{origin:base,cookie:pre.headers.getSetCookie()[0].split(';')[0],'content-type':'application/json','x-csrf-token':nonce.csrfToken},body:JSON.stringify({email:user.email,password:fixture.password})});samples.push({name:'scrypt-login',ms:Math.round(performance.now()-start),status:response.status});assert.equal(response.status,200);const cookie=response.headers.getSetCookie().find(c=>c.startsWith('qavio_admin='))!.split(';')[0],me=await(await fetch(base+'/api/admin/auth/me',{headers:{cookie}})).json();return {cookie,origin:base,'x-csrf-token':me.csrfToken};}
 const actors=await Promise.all([...fixture.users,fixture.users.find((u:{role:string})=>u.role==='ADMIN')].map(login));
 const bytes=await sharp({create:{width:2048,height:1536,channels:3,background:'#152338'}}).png().toBuffer();
 function upload(){const body=new FormData();body.set('file',new File([new Uint8Array(bytes)],'qa-performance.png',{type:'image/png'}));return measure('image-upload',()=>fetch(base+'/api/admin/media',{method:'POST',headers:actors[0],body}));}
 for(let round=0;round<3;round++)await Promise.all([measure('dashboard',()=>fetch(base+'/api/admin/dashboard',{headers:actors[0]})),measure('lead-page',()=>fetch(base+'/api/admin/leads/search',{method:'POST',headers:{...actors[1],'content-type':'application/json'},body:JSON.stringify({page:1,size:20})})),measure('public-home',()=>fetch(base+'/')),upload()]);
 assert.ok(samples.every(row=>row.status===200));const metrics=Object.fromEntries([...new Set(samples.map(s=>s.name))].map(name=>{const values=samples.filter(s=>s.name===name).map(s=>s.ms).sort((a,b)=>a-b);return [name,{samples:values.length,p50ms:values[Math.floor(values.length*.5)],p95ms:values[Math.min(values.length-1,Math.ceil(values.length*.95)-1)],maxMs:values.at(-1)}];}));
 const result={scope:'Windows loopback production standalone; synthetic 24-lead fixture; bounded concurrency 4',notVpsCapacityTest:true,metrics};await writeFile('.runtime/e-performance.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
main().catch(error=>{console.error('PERFORMANCE_CHECK_FAILED',error instanceof assert.AssertionError?error.message:'CHECK_FAILED');process.exitCode=1;});

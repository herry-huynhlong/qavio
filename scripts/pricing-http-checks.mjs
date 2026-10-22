import assert from 'node:assert/strict';
const origin=await (await fetch('http://127.0.0.1:3200/api/public/pricing')).json();
const deadline=Date.now()+35000;
while((await (await fetch('http://127.0.0.1:3100/api/public/pricing')).json()).version!==origin.version){assert.ok(Date.now()<deadline,'QAVIO refresh within 35 seconds');await new Promise(r=>setTimeout(r,500));}
for(const base of ['http://127.0.0.1:3200','http://127.0.0.1:3100']){
 const response=await fetch(base+'/api/public/pricing');assert.equal(response.status,200);
 assert.match(response.headers.get('cache-control')||'',/no-store/);
 const data=await response.json();assert.deepEqual(data.prices,origin.prices);
 assert.ok(!JSON.stringify(data).match(/bankCode|accountNumber|passwordHash|actorUserId|subscriptionId|priceId/));
 for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await fetch(base+'/api/public/pricing',{method,headers:{'content-type':'application/json'},body:JSON.stringify({priceVnd:1})})).status,405);
}
assert.equal((await fetch('http://127.0.0.1:3200/platform/plans',{redirect:'manual'})).status,307);
console.log('PASS HTTP: QuánPilot/QAVIO GET updated published price; no-store; allowlist; POST/PUT/PATCH/DELETE 405; anonymous Admin denied');

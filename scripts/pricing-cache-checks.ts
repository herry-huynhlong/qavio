import assert from 'node:assert/strict';
import {createPricingReader} from '../src/server/pricing';
const start=Date.UTC(2026,9,22),version='a'.repeat(64);let clock=start,calls=0,broken=false,price=900000;
const source=async()=>{calls++;if(broken)throw Error('Offline');return Response.json({version,generatedAt:new Date(clock).toISOString(),validUntil:new Date(clock+60000).toISOString(),terms:[3,6,12],prices:[{plan:'BASIC',name:'BASIC',termMonths:3,currency:'VND',priceVnd:price,monthlyPriceVnd:price/3,originalPriceVnd:null,discountBasisPoints:0,features:['Menu QR'],status:'PUBLISHED',updatedAt:new Date(clock).toISOString()}]});};
async function main(){
 const read=createPricingReader(source as typeof fetch,()=>clock);
 assert.equal((await read())?.prices[0].priceVnd,900000);price=990000;
 clock+=14999;assert.equal((await read())?.prices[0].priceVnd,900000);assert.equal(calls,1);
 clock++;assert.equal((await read())?.prices[0].priceVnd,990000);assert.equal(calls,2);
 broken=true;clock+=15000;assert.equal((await read())?.prices[0].priceVnd,990000);
 clock+=45001;assert.equal(await read(),null,'Expired cache must disappear on source failure');
 const unavailable=createPricingReader(source as typeof fetch,()=>clock);assert.equal(await unavailable(),null);
 broken=false;price=1000000;assert.equal(await unavailable(),null,'Reject inconsistent monthly amount');
 console.log('PASS pricing cache: 15s refresh, source update, valid-only fallback, expiry, cold outage, invalid response rejection');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});

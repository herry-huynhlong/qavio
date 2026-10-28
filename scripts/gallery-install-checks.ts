import assert from 'node:assert/strict';
import {readFile}from'node:fs/promises';
import {createHash}from'node:crypto';
import {productDemoGroups}from'../src/components/product-demo-gallery';
import {productDemoVisuals}from'../src/lib/product-demo-visuals';
async function main(){
const audit=JSON.parse(await readFile('docs/gallery-install/mapping.json','utf8')) as {slot:string;src:string;sha256:string}[];
const screens=productDemoGroups.flatMap(group=>group.screens);
assert.equal(screens.length,26);assert.equal(new Set(screens.map(screen=>screen.slot)).size,26);
assert.equal(new Set(screens.map(screen=>productDemoVisuals[screen.slot]!.src)).size,26);
for(const screen of screens){const image=productDemoVisuals[screen.slot]!;const row=audit.find(row=>row.slot===screen.slot);assert.ok(row);assert.equal(image.src,row.src);assert.equal(image.origin,'SCREENSHOT');assert.ok(image.alt&&image.caption);assert.equal(createHash('sha256').update(await readFile('public'+image.src)).digest('hex'),row.sha256,screen.slot+': visually approved pixels unchanged');}
assert.match(productDemoVisuals['tables-screen']!.src,/pro-tables-v2-/);assert.match(productDemoVisuals['menu-admin-screen']!.src,/pro-menu-admin-v2-/);
const guide=await readFile('src/app/(public)/products/quanpilot/install/page.tsx','utf8');
for(const text of ['Android','Safari','Chrome','Edge','kết nối mạng','site.quanpilotLoginUrl'])assert.ok(guide.includes(text));
console.log('PASS: 26 unique, visually reviewed gallery assets, hashes and installation guide safeguards.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});

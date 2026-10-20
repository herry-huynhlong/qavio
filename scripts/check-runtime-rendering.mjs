import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// A Docker build has no private env files. Runtime CMS flags must still work.
const manifest=JSON.parse(await readFile('.next/prerender-manifest.json','utf8'));
for(const route of ['/','/about','/faq','/contact','/sitemap.xml']){
 assert.ok(!Object.hasOwn(manifest.routes,route),`${route}: runtime CMS must not be frozen into a build-time fallback`);
}
console.log('Runtime CMS rendering manifest: PASS');

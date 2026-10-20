import assert from 'node:assert/strict';

// Acceptance routes, independently checked against the running production build.
const routes = ['/', '/about', '/solutions', '/products', '/products/quanpilot', '/pricing', '/news', '/contact', '/request-demo', '/request-quote', '/subscribe', '/faq', '/privacy', '/terms'];
const base = new URL(process.env.TEST_BASE_URL || 'http://127.0.0.1:3100');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Use a local test server only.');
const pages = new Map();
const titles = new Set();
for (const route of routes) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 200, `${route}: HTTP`);
  const html = await response.text();
  pages.set(route, html);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${route}: unique title`);
  titles.add(title);
  assert.match(html, /name="description" content="[^"]+"/, `${route}: description`);
  assert.match(html, /rel="canonical" href="https?:\/\/[^" ]+"/, `${route}: canonical`);
  assert.equal(new URL(html.match(/rel="canonical" href="([^"]+)"/)[1]).pathname, route, `${route}: canonical points to its own page`);
  assert.match(html, /property="og:image"/, `${route}: OG image`);
  assert.match(html, /name="twitter:card" content="summary_large_image"/, `${route}: Twitter card`);
  assert.match(html, /id="main-content"/, `${route}: skip link target`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: single H1`);
  const structuredData = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(structuredData.length > 0, `${route}: structured data present`);
  for (const match of structuredData) {
    const data = JSON.parse(match[1]);
    assert.ok(['WebSite', 'BreadcrumbList'].includes(data['@type']), `${route}: verified structured data only`);
  }
}
let linksChecked = 0;
for (const [route, html] of pages) {
  for (const [, raw] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
    assert.ok(!raw.startsWith('//'), `${route}: unexpected external protocol-relative link`);
    const url = new URL(raw.replaceAll('&amp;', '&'), new URL(route, base));
    const target = pages.get(url.pathname);
    assert.ok(target, `${route}: unexpected/missing internal page ${url.pathname}`);
    if (url.hash) assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: missing anchor ${url.hash}`);
    linksChecked++;
  }
}
const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
assert.match(sitemap, /<urlset/);
assert.ok(!sitemap.includes('/privacy') && !sitemap.includes('/terms'), 'Draft legal routes excluded from sitemap');
assert.equal((await fetch(new URL('/not-an-existing-page', base))).status, 404);
assert.equal((await fetch(new URL('/brand/Qavio.png', base))).status, 200);
console.log(JSON.stringify({ pages: routes.length, internalLinks: linksChecked, seo: 'pass', sitemap: 'pass', notFound: 'pass', originalLogo: 'pass' }));

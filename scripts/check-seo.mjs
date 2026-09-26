import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, 'Exactly one H1');
assert.equal((html.match(/rel="canonical"/g) || []).length, 1, 'Exactly one canonical');
assert.match(html, /<title>Saim Zaib/);
assert.match(html, /name="description"/);
assert.match(html, /name="google-site-verification"/);
assert(!/noindex/i.test(html), 'Page must be indexable');
assert.match(html, /SecureKubeOps Pipeline/, 'Project content is in initial HTML');
assert.match(html, /<h2[^>]*>About Me<\/h2>/, 'About is prerendered');
const headings = [...html.matchAll(/<h([1-6])(?:\s|>)/g)].map(match => Number(match[1]));
for (let i = 1; i < headings.length; i++) assert(headings[i] <= headings[i-1] + 1, 'No skipped heading levels');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
for (const [, href] of html.matchAll(/\shref="(#[^"]+)"/g)) assert(ids.has(href.slice(1)), `Missing anchor ${href}`);
for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(img, /\balt="[^"]*"/, 'Image needs explicit alt, empty for decorative placeholders');
  assert.match(img, /\bwidth="\d+"/);
  assert.match(img, /\bheight="\d+"/);
}
for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)) await access(`dist${path}`);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@graph'].find(node => node['@type'] === 'ProfilePage').mainEntity['@id'], 'https://saimzaib.tech/#person');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 1, 'One real indexable page');
assert.match(sitemap, /<loc>https:\/\/saimzaib.tech\/<\/loc>/);
assert.match(await readFile('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/saimzaib.tech\/sitemap.xml/);
console.log('SEO checks passed: prerender, metadata, schema, heading order, anchors, local assets, image attributes, sitemap and robots.');

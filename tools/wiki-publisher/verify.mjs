import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = resolve(process.argv[2] || join(site, '.build/site'));
const files = readdirSync(join(out, 'wiki')).filter(name => name.endsWith('.html'));
const errors = [];
let checked = 0;
const idsByPath = new Map();
for (const name of files) {
  const path = join(out, 'wiki', name);
  const $ = load(readFileSync(path, 'utf8'));
  const ids = $('[id]').map((_, el) => $(el).attr('id')).get();
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate HTML ids`);
  idsByPath.set(path, new Set(ids));
  if ($('h1').length !== 1) errors.push(`${name}: expected one h1`);
  if ($('link[rel="canonical"]').length !== 1) errors.push(`${name}: expected one canonical URL`);
  if ($('iframe,object,embed').length) errors.push(`${name}: unexpected active content`);
  const scripts = $('script');
  if (scripts.length !== 1 || scripts.attr('src') !== '/wiki/wiki-navigation.js' || scripts.text().trim() || Object.keys(scripts.get(0)?.attribs || {}).some(key => !['src', 'defer'].includes(key))) errors.push(`${name}: unexpected active content`);
}
for (const name of files) {
  const $ = load(readFileSync(join(out, 'wiki', name), 'utf8'));
  $('a[href],img[src],link[href],script[src],meta[property="og:image"]').each((_, el) => {
    const raw = $(el).attr('href') || $(el).attr('src') || $(el).attr('content');
    const url = new URL(raw, `https://optimallearning.org/wiki/${name}`);
    if (url.origin !== 'https://optimallearning.org') return;
    const local = decodeURIComponent(url.pathname).slice(1) + (url.pathname.endsWith('/') ? 'index.html' : '');
    const path = join(local.startsWith('wiki/') ? out : site, local);
    if (!existsSync(path)) errors.push(`${name}: missing resource ${raw}`);
    else if (url.hash && idsByPath.has(path) && !idsByPath.get(path).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${name}: missing anchor ${raw}`);
    checked++;
  });
}
const sitemap = load(readFileSync(join(out, 'sitemap.xml'), 'utf8'), { xml: true });
const urls = sitemap('urlset > url > loc').map((_, el) => sitemap(el).text()).get();
if (urls.length < files.length || urls.some(url => !url.startsWith('https://optimallearning.org/'))) errors.push('Invalid sitemap URLs');
for (const url of urls) {
  const path = new URL(url).pathname;
  const file = join(out, decodeURIComponent(path), path.endsWith('/') ? 'index.html' : '');
  if (!existsSync(file)) { errors.push(`Sitemap target missing: ${url}`); continue; }
  const $ = load(readFileSync(file, 'utf8'));
  if (/\b(noindex|none)\b/i.test($('meta[name="robots"]').attr('content') || '') || $('meta[http-equiv="refresh"]').length) errors.push(`Non-indexable sitemap target: ${url}`);
  if (!$('title').text().trim() || !$('meta[name="description"]').attr('content')?.trim()) errors.push(`Missing search metadata: ${url}`);
}
if (errors.length) throw new Error([...new Set(errors)].join('\n'));
console.log(`Verified ${files.length} HTML pages, ${checked} local links/resources, and ${urls.length} sitemap URLs.`);

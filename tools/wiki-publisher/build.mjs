import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { load } from 'cheerio';
import GithubSlugger from 'github-slugger';
import { icon, navigation } from './navigation.mjs';

const toolDir = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(toolDir, '../..');
const args = process.argv.slice(2);
function option(name, defaultValue) {
  const i = args.indexOf(name);
  if (i < 0) return defaultValue;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${name}`);
  return args[i + 1];
}
const wikiDir = resolve(option('--wiki', 'C:/dev/MoFaCTS.wiki'));
const outDir = resolve(option('--out', join(siteDir, '.build/site')));
if (outDir === siteDir || outDir === wikiDir || isAbsolute(relative(siteDir, outDir)) || relative(siteDir, outDir).startsWith('..')) {
  throw new Error('Build output must be a dedicated directory inside the website source directory.');
}
if (existsSync(outDir) && readdirSync(outDir).length) throw new Error('Build output must be empty; choose a fresh --out directory.');
const origin = 'https://optimallearning.org';
const wikiUrl = 'https://github.com/memphis-iis/MoFaCTS/wiki';
const git = (...argv) => execFileSync('git', ['-C', wikiDir, ...argv], { maxBuffer: 64 * 1024 * 1024 });
const revision = git('rev-parse', '--verify', `${option('--revision', 'HEAD')}^{commit}`).toString().trim();
const sourceFiles = git('ls-tree', '-rz', '--name-only', revision).toString().split('\0').filter(Boolean);
const source = name => git('show', `${revision}:${name}`);
const pages = sourceFiles.filter(p => p.endsWith('.md') && !p.startsWith('_'));
if (!pages.includes('Home.md') || !sourceFiles.includes('_Sidebar.md')) throw new Error('Wiki Home.md and _Sidebar.md are required.');
const pageByName = new Map(pages.map(p => [p.slice(0, -3).toLowerCase(), p]));
const assets = new Set(sourceFiles.filter(p => !p.endsWith('.md')));
const htmlPath = page => page === 'Home.md' ? '/wiki/' : `/wiki/${encodeURIComponent(page.slice(0, -3))}.html`;
const outputPath = page => page === 'Home.md' ? 'wiki/index.html' : `wiki/${page.slice(0, -3)}.html`;
function write(name, body) {
  const target = resolve(outDir, name);
  if (relative(outDir, target).startsWith('..')) throw new Error(`Invalid output path: ${name}`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body);
}
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const failures = [];
const localLinks = [];
const rendered = new Map();
const assetUsage = new Set();

function rewrite(raw, owner, image = false) {
  if (!raw) return raw;
  let value = raw;
  const wikiMatch = value.match(/^https?:\/\/github\.com\/memphis-iis\/mofacts\/wiki\/?(.*)$/i);
  const rawMatch = value.match(/^https?:\/\/raw\.githubusercontent\.com\/wiki\/memphis-iis\/mofacts\/(.*)$/i);
  if (wikiMatch) value = wikiMatch[1] || 'Home';
  if (rawMatch) value = rawMatch[1];
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) throw new Error(`${owner}: unsupported URL ${value}`);
  if (value.startsWith('#')) {
    localLinks.push({ owner, page: owner, fragment: decodeURIComponent(value.slice(1)) });
    return value;
  }
  const hashIndex = value.indexOf('#');
  const fragment = hashIndex < 0 ? '' : decodeURIComponent(value.slice(hashIndex + 1));
  const withoutHash = hashIndex < 0 ? value : value.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex < 0 ? '' : withoutHash.slice(queryIndex);
  const pathname = decodeURIComponent(queryIndex < 0 ? withoutHash : withoutHash.slice(0, queryIndex)).replace(/^\.\//, '');
  const candidate = pathname.replace(/^\/wiki\//, '').replace(/\.md$/i, '').replaceAll(' ', '-');
  const page = pageByName.get(candidate.toLowerCase());
  // GitHub's special navigation documents are edited there, not separate website articles.
  if (candidate.startsWith('_') && sourceFiles.includes(candidate + '.md') && !image) return `${wikiUrl}/${encodeURIComponent(candidate)}`;
  if (page && !image) {
    localLinks.push({ owner, page, fragment });
    return htmlPath(page) + query + (fragment ? '#' + encodeURIComponent(fragment) : '');
  }
  if (assets.has(pathname)) {
    assetUsage.add(pathname);
    return '/wiki/' + pathname.split('/').map(encodeURIComponent).join('/') + query + (fragment ? '#' + encodeURIComponent(fragment) : '');
  }
  failures.push(`${owner}: missing ${image ? 'image' : 'page or asset'} ${raw}`);
  return raw;
}

function normalize(html, owner) {
  const $ = load(html, null, false);
  $('script, iframe, object, embed, base, form').each((_, el) => failures.push(`${owner}: unsupported active HTML element ${el.tagName}`));
  $('*').each((_, el) => {
    for (const attr of Object.keys(el.attribs || {})) {
      if (/^on/i.test(attr)) failures.push(`${owner}: event-handler attribute ${attr}`);
    }
    // Review comments and material explicitly hidden in Markdown remain absent from the public HTML.
    $(el).contents().filter((_, node) => node.type === 'comment').remove();
  });
  $('a[href]').each((_, el) => $(el).attr('href', rewrite($(el).attr('href'), owner)));
  $('img[src]').each((_, el) => {
    $(el).attr('src', rewrite($(el).attr('src'), owner, true));
    if ($(el).attr('alt') === undefined) failures.push(`${owner}: image without alt text`);
  });
  const slugger = new GithubSlugger();
  const headings = [];
  $('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const title = $(el).text();
    const id = slugger.slug(title);
    $(el).attr('id', id);
    headings.push({ level: Number(el.tagName.slice(1)), title, id });
  });
  $('table').each((_, el) => $(el).wrap('<div class="wiki-table" tabindex="0" role="region" aria-label="Documentation table"></div>'));
  const ids = new Set($('[id]').map((_, el) => $(el).attr('id')).get());
  return { $, headings, ids };
}

let diagramCount = 0;
const diagramCli = join(toolDir, 'node_modules/@mermaid-js/mermaid-cli/src/cli.js');
const diagramConfig = join(toolDir, 'mermaid.json');
for (const page of pages) {
  const doc = normalize(marked.parse(source(page).toString(), { gfm: true }), page);
  const diagrams = doc.$('pre > code.language-mermaid').toArray();
  for (const [i, el] of diagrams.entries()) {
    const stem = `${page.slice(0, -3)}-${i + 1}`;
    const input = join(outDir, `.diagrams/${stem}.mmd`);
    const target = join(outDir, `wiki/diagrams/${stem}.svg`);
    mkdirSync(dirname(input), { recursive: true });
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(input, doc.$(el).text());
    execFileSync(process.execPath, [diagramCli, '-i', input, '-o', target, '-c', diagramConfig, '-p', join(toolDir, 'puppeteer.json'), '-b', 'transparent'], { stdio: 'pipe' });
    doc.$(el).parent().replaceWith(`<figure><img src="/wiki/diagrams/${encodeURIComponent(stem)}.svg" alt="${escape(doc.headings[0]?.title || page)} — diagram ${i + 1}"></figure>`);
    diagramCount++;
  }
  rendered.set(page, doc);
}
const sidebar = normalize(marked.parse(source('_Sidebar.md').toString(), { gfm: true }), '_Sidebar.md');
for (const { owner, page, fragment } of localLinks) {
  if (fragment && !rendered.get(page)?.ids.has(fragment)) failures.push(`${owner}: missing heading ${page}#${fragment}`);
}
if (failures.length) throw new Error('Wiki validation failed:\n' + [...new Set(failures)].join('\n'));

// Extract the actual site shell, avoiding a separately maintained copy of its navigation.
const shell = load(readFileSync(join(siteDir, 'links.html'), 'utf8'));
shell('header a[href], footer a[href], head link[href]').each((_, el) => {
  const href = shell(el).attr('href');
  if (href && !/^(https?:|mailto:|\/|#)/.test(href)) shell(el).attr('href', '/' + href);
});
shell('header img[src], footer img[src]').each((_, el) => {
  const src = shell(el).attr('src');
  if (src && !/^(https?:|\/)/.test(src)) shell(el).attr('src', '/' + src);
});
const header = shell('header.site-header').toString();
const footer = shell('footer.site-footer').toString();
if (!header || !footer) throw new Error('The website shell must have site-header and site-footer elements.');
const sharedHead = shell('head link[rel="stylesheet"], head link[rel="preconnect"], head link[rel="icon"]').toString();
// Website search presentation is separate from the wiki's visible article headings.
const searchMetadata = JSON.parse(readFileSync(join(toolDir, 'search-metadata.json'), 'utf8'));
const sentences = new Intl.Segmenter('en', { granularity: 'sentence' });
for (const [page, doc] of rendered) {
  const title = doc.headings[0]?.title || page.slice(0, -3).replaceAll('-', ' ');
  const searchTitle = searchMetadata[page]?.title || title;
  const introduction = doc.$('p').toArray().map(el => doc.$(el).text().replace(/\s+/g, ' ').trim()).find(s => s.length > 70 && !s.startsWith('Last Updated:'));
  const description = searchMetadata[page]?.description || (introduction ? [...sentences.segment(introduction)][0].segment.trim() : `${title} — MoFaCTS documentation.`);
  const image = searchMetadata[page]?.image;
  let imageTags = '';
  if (image) {
    if (!/^[a-z0-9-]+\.png$/.test(image.file) || !image.alt?.trim()) throw new Error(`${page}: invalid sharing image metadata`);
    const bytes = readFileSync(join(toolDir, 'social', image.file));
    if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error(`${page}: sharing image must be PNG`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width < 1200 || height < 627 || bytes.length > 5_000_000) throw new Error(`${page}: sharing image must be at least 1200 by 627 pixels and under 5 MB`);
    const imagePath = `wiki/social/${image.file}`;
    write(imagePath, bytes);
    imageTags = `<meta property="og:image" content="${origin}/${imagePath}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="${width}"><meta property="og:image:height" content="${height}"><meta property="og:image:alt" content="${escape(image.alt)}">`;
  }
  const nav = load(sidebar.$.html(), null, false);
  const navigationHtml = navigation(nav, htmlPath(page), escape);
  const canonical = origin + htmlPath(page);
  const titleElement = doc.$('h1').first();
  const pageTitle = titleElement.length ? titleElement.toString() : `<h1>${escape(title)}</h1>`;
  titleElement.remove();
  write(outputPath(page), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(searchTitle)} | Optimal Learning Lab</title><meta name="description" content="${escape(description)}">
<link rel="canonical" href="${canonical}"><meta property="og:title" content="${escape(searchTitle)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}">
${imageTags}${sharedHead}<link rel="stylesheet" href="/wiki/wiki.css"><script src="/wiki/wiki-navigation.js" defer></script></head>
<body><a class="wiki-skip-link" href="#wiki-content">Skip to documentation</a><div class="site-shell">${header}
<main class="wiki-layout wiki-shell"><aside class="wiki-sidebar" aria-label="Documentation sidebar"><div class="wiki-sidebar-header"><span class="wiki-sidebar-brand">MoFaCTS <small>Documentation</small></span><button class="wiki-sidebar-toggle" type="button" aria-controls="wiki-navigation" aria-expanded="false" aria-label="Expand documentation sidebar" title="Expand sidebar">${icon('panel')}</button></div><nav id="wiki-navigation" aria-label="Documentation">${navigationHtml}</nav></aside>
<article class="wiki-article" id="wiki-content">${pageTitle}<div class="wiki-page-meta"><a href="/wiki/">Documentation home</a><a href="${wikiUrl}/${encodeURIComponent(page.slice(0, -3))}">View source on GitHub</a></div>
${doc.$.html()}</article></main>${footer}</div></body></html>\n`);
}
for (const asset of assetUsage) write('wiki/' + asset, source(asset));
write('wiki/wiki.css', readFileSync(join(toolDir, 'wiki.css')));
write('wiki/wiki-navigation.js', readFileSync(join(toolDir, 'wiki-navigation.js')));
const rootPages = readdirSync(siteDir).filter(name => name.endsWith('.html'));
for (const page of rootPages) write(page, readFileSync(join(siteDir, page)));
for (const folder of ['_frame', '_fonts', '_media']) cpSync(join(siteDir, folder), join(outDir, folder), { recursive: true });
const indexableRootPages = rootPages.filter(page => {
  const $ = load(readFileSync(join(siteDir, page), 'utf8'));
  const robots = $('meta[name="robots"]').attr('content') || '';
  return !/\b(noindex|none)\b/i.test(robots) && !$('meta[http-equiv="refresh"]').length;
});
const urls = [...indexableRootPages.map(p => origin + '/' + p), ...pages.map(p => origin + htmlPath(p))].sort();
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
const manifest = { source: wikiUrl, sourceRevision: revision, publisherRevision: option('--publisher-revision', 'local-preview'), pages: pages.length, diagrams: diagramCount, assets: [...assetUsage].sort() };
write('wiki/publication.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ ...manifest, output: outDir }, null, 2));

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { navigation } from '../navigation.mjs';

const tool = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(tool, '../../.build');
mkdirSync(base, { recursive: true });
function fixture(t, home) {
  const dir = mkdtempSync(join(base, 'test-'));
  t.after(() => { assert(!relative(base, dir).startsWith('..')); rmSync(dir, { recursive: true, force: true }); });
  const wiki = join(dir, 'source'); mkdirSync(wiki);
  const git = (...args) => execFileSync('git', ['-C', wiki, ...args], { stdio: 'pipe' });
  git('init'); git('config', 'user.name', 'Publisher test'); git('config', 'user.email', 'test@example.invalid');
  writeFileSync(join(wiki, 'Home.md'), home);
  writeFileSync(join(wiki, 'Other-page.md'), '# Other page\n\n## Shared heading\n\nSaved content.\n\n## Shared heading\n\nAnother section.\n');
  writeFileSync(join(wiki, '_Sidebar.md'), '[Home](Home)\n\n[Other page](Other-page#shared-heading-1)\n');
  git('add', '.'); git('commit', '-m', 'Fixture');
  return { wiki, out: join(dir, 'out') };
}
const build = f => execFileSync(process.execPath, [join(tool, 'build.mjs'), '--wiki', f.wiki, '--out', f.out], { stdio: 'pipe' });

test('Publishes committed content with website links and stable duplicate heading anchors', t => {
  const f = fixture(t, '# Home\n\n[Target](Other-page#shared-heading-1)\n\n| A | B |\n|---|---|\n| one | two |\n');
  writeFileSync(join(f.wiki, 'Home.md'), '# Uncommitted text must not publish');
  build(f);
  const html = readFileSync(join(f.out, 'wiki/index.html'), 'utf8');
  const $ = load(html);
  assert.equal($('h1').text(), 'Home');
  assert.equal($('article a').filter((_, el) => $(el).text() === 'Target').attr('href'), '/wiki/Other-page.html#shared-heading-1');
  assert.equal($('.wiki-table table').length, 1);
  assert.equal($('link[rel="canonical"]').attr('href'), 'https://optimallearning.org/wiki/');
  assert(!html.includes('Uncommitted text'));
  execFileSync(process.execPath, [join(tool, 'verify.mjs'), f.out], { stdio: 'pipe' });
  writeFileSync(join(f.out, 'wiki/index.html'), html.replace('</head>', '<script src="/unapproved.js"></script></head>'));
  assert.throws(() => execFileSync(process.execPath, [join(tool, 'verify.mjs'), f.out], { stdio: 'pipe' }), error => error.stderr.toString().includes('unexpected active content'));
});

test('Sidebar preserves source links and groups while identifying the current page', () => {
  const source = load('<h2><a href="/wiki/">Home</a></h2><hr><h2>For Developers</h2><p><strong>Reference</strong></p><ul><li><a href="/wiki/TutorScript.html">TutorScript</a></li><li><a href="https://github.com/example">Source</a></li></ul>', null, false);
  const result = load(navigation(source, '/wiki/TutorScript.html', value => value), null, false);
  assert.deepEqual(result('a').map((_, el) => result(el).attr('href')).get(), ['/wiki/', '/wiki/TutorScript.html', 'https://github.com/example']);
  assert.equal(result('a[aria-current="page"]').text(), 'TutorScript');
  assert.equal(result('details[open] > summary').attr('aria-label'), 'Developers');
  assert.equal(result('.wiki-nav-links strong').text(), 'Reference');
});
test('Rejects missing wiki targets before writing published pages', t => {
  const f = fixture(t, '# Home\n\n[Broken](Missing-page)');
  assert.throws(() => build(f), error => error.stderr.toString().includes('missing page or asset Missing-page'));
});
test('Rejects active HTML and executable URLs', t => {
  const f = fixture(t, '# Home\n\n<script>alert(1)</script>\n\n[Execute](javascript:alert%281%29)');
  assert.throws(() => build(f), error => error.stderr.toString().includes('unsupported URL'));
});

test('Preserves complete search descriptions and excludes non-indexable sitemap entries', t => {
  const f = fixture(t, '# Home\n\nDocumentation.');
  const sentence = 'This instructional example explains how the selected target, evaluated learner response, and available assistance determine which production can generate a useful next question for the learner.';
  writeFileSync(join(f.wiki, 'Other-page.md'), `# Other page\n\n${sentence} A separate sentence follows.\n\n## Shared heading\n\n## Shared heading\n`);
  writeFileSync(join(f.wiki, 'Introduction-to-TutorScript.md'), '# Introduction to TutorScript\n\nTutorScript describes instructional productions.');
  execFileSync('git', ['-C', f.wiki, 'add', '.']);
  execFileSync('git', ['-C', f.wiki, 'commit', '-m', 'Metadata fixture'], { stdio: 'pipe' });
  build(f);
  const other = load(readFileSync(join(f.out, 'wiki/Other-page.html'), 'utf8'));
  assert.equal(other('meta[name="description"]').attr('content'), sentence);
  assert.equal(other('meta[property="og:description"]').attr('content'), sentence);
  const tutor = load(readFileSync(join(f.out, 'wiki/Introduction-to-TutorScript.html'), 'utf8'));
  assert.equal(tutor('h1').text(), 'Introduction to TutorScript');
  assert.equal(tutor('title').text(), 'TutorScript: Production Rules for Intelligent Tutoring | Optimal Learning Lab');
  assert.equal(tutor('meta[property="og:image"]').attr('content'), 'https://optimallearning.org/wiki/social/tutorscript-share.png');
  const image = readFileSync(join(f.out, 'wiki/social/tutorscript-share.png'));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 627);
  assert.equal(tutor('meta[property="og:image:width"]').attr('content'), '1200');
  assert.equal(tutor('meta[property="og:image:height"]').attr('content'), '627');
  assert(tutor('meta[property="og:image:alt"]').attr('content').includes('student choice'));
  assert(!other('meta[property="og:image"]').length);
  const sitemap = readFileSync(join(f.out, 'sitemap.xml'), 'utf8');
  assert(!sitemap.includes('postsecondary-anatomy-and-physio.html'));
  assert(sitemap.includes('postsecondary-anatomy-and-physiology.html'));
});

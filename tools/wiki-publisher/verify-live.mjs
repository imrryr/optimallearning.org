import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const expected = JSON.parse(readFileSync(join(process.argv[2], 'wiki/publication.json'), 'utf8'));
const origin = 'https://optimallearning.org';
async function get(path) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' } });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}
if (!process.argv.includes('--content-only')) {
  const published = await (await get('/wiki/publication.json')).json();
  assert.equal(published.sourceRevision, expected.sourceRevision);
  assert.equal(published.publisherRevision, expected.publisherRevision);
}
const page = await (await get('/wiki/Introduction-to-TutorScript.html')).text();
assert.equal(page, readFileSync(join(process.argv[2], 'wiki/Introduction-to-TutorScript.html'), 'utf8'), 'Public TutorScript page does not match this build.');
assert(page.includes('TutorScript is the JSON representation'));
assert(page.includes('https://optimallearning.org/wiki/Introduction-to-TutorScript.html'));
assert((await (await get('/wiki/')).text()).includes('Welcome to MoFaCTS'));
assert((await (await get('/links.html')).text()).includes('wiki/Introduction-to-TutorScript.html'));
assert((await (await get('/sitemap.xml')).text()).includes('https://optimallearning.org/wiki/Introduction-to-TutorScript.html'));
assert((await (await get('/robots.txt')).text()).includes('Sitemap: https://optimallearning.org/sitemap.xml'));
const figure = await get('/wiki/images/workflows/tutorscript-instructional-cycle.svg');
assert(figure.headers.get('content-type')?.includes('image/svg+xml'));
assert((await figure.text()).includes('KC A'));
console.log(`Live ${process.argv.includes('--content-only') ? 'content' : 'publication'} verified: wiki ${expected.sourceRevision}, website ${expected.publisherRevision}.`);

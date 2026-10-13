import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const wikiRevision = execFileSync('git', ['ls-remote', 'https://github.com/memphis-iis/MoFaCTS.wiki.git', 'HEAD'], { encoding: 'utf8' }).split(/\s/)[0];
if (!/^[a-f0-9]{40}$/.test(wikiRevision)) throw new Error('Could not resolve the published wiki revision.');
if (!/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || '')) throw new Error('A website commit SHA is required.');
const response = await fetch('https://optimallearning.org/wiki/publication.json', { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(30000) });
let changed;
if (response.status === 404) {
  // This is the explicit initial-publication state, not recovery from a failed request.
  changed = true;
} else {
  if (!response.ok) throw new Error(`Publication status returned HTTP ${response.status}; refusing to assume an empty site.`);
  const published = await response.json();
  if (!/^[a-f0-9]{40}$/.test(published.sourceRevision || '') || !/^[a-f0-9]{40}$/.test(published.publisherRevision || '')) throw new Error('Invalid published revision record.');
  changed = published.sourceRevision !== wikiRevision || published.publisherRevision !== process.env.GITHUB_SHA;
}
if (process.env.FORCE_PUBLISH === 'true') changed = true;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\nwiki_revision=${wikiRevision}\n`);
console.log(changed ? `Build required for wiki ${wikiRevision}.` : 'Website and wiki revisions are already published.');

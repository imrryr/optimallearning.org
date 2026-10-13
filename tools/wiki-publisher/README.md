# Wiki publishing

The MoFaCTS GitHub wiki remains the editable source. The publisher builds ordinary
HTML documentation under `/wiki/` inside the existing Optimal Learning website.
The website header, navigation, fonts and footer come from `links.html`; its shared
stylesheet remains `_frame/site-refresh.css`. `wiki.css` adds documentation layout.
Below the shared site header and menu, documentation navigation defaults to a compact
icon rail. The sidebar toggle expands labeled sections and resizes only the article
area, without covering it. Section icons also expand their link group. Section order
and links come from `_Sidebar.md`; `navigation.mjs` supplies website labels and SVG
icons. `wiki-navigation.js` owns the toggle and Escape behavior. Articles and links
remain generated HTML. Reduced-motion preferences disable the width animation.

## Publishing contract

- Read a specific committed wiki revision, never uncommitted authoring changes.
- Convert public wiki pages, rewrite internal page and fragment links, and copy
  tracked assets. `_Sidebar.md` supplies navigation; links to special GitHub
  navigation documents continue to point to their GitHub source. Other public
  Markdown pages, including the wiki's maintenance references, are mirrored.
- Render Mermaid diagrams to SVG during the build. The published site requires
  no browser script to load or render documentation content.
- Keep the TutorScript infographic as its original editable SVG.
- Produce page titles, descriptions, self-canonical URLs, a valid sitemap with
  absolute URLs, and a visible link back to each page's GitHub source.
- `search-metadata.json` owns website search titles and descriptions for key wiki
  pages; visible headings and article text remain wiki-owned. Other descriptions
  use a complete introductory sentence. Redirect and noindex pages are excluded
  from the sitemap, while remaining available at their existing addresses.
- Optional `image` metadata supplies a website-owned sharing PNG and accessible
  description. Files live in `social/` and publish under `/wiki/social/`. The build
  includes a content hash in the published filename so revised artwork receives
  a new image URL without changing the article's URL or hand-editing version numbers.
  It reads dimensions from the PNG, checks LinkedIn's size limits, and emits Open Graph
  image tags. Link verification checks the asset; live delivery checks its bytes.
- Check internal links and images before publishing. A failed build must not
  update the live site's publication marker.
- The publishing workflow owns `/wiki/` and the generated sitemap. It must never
  run a recursive bucket-root deletion or publish local authoring tools, Git
  metadata, credentials, or unrelated files.
- An unattended workflow uses an AWS OIDC role scoped to this publisher. Browser
  login is for setup and inspection, not the workflow's authentication mechanism.

Source repository: `https://github.com/imrryr/optimallearning.org`.

## Build and verify locally

Requires Node.js 24, Git, and the approved locked build dependencies. Mermaid CLI
installs its browser dependency for build-time SVG rendering. There is no Mermaid
runtime or Markdown parser on the public website.

CI uses the Ubuntu runner's installed Chrome at `/opt/google/chrome/chrome`
through `PUPPETEER_EXECUTABLE_PATH`, with normal headless mode and sandboxing
enabled. Its AppArmor profile permits Chrome's sandbox; downloaded browser
binaries are not covered by that profile. CI skips the unused browser download
and fails if the configured executable is missing. Local builds use Puppeteer's
installed Chrome. Never disable sandboxing to make diagram rendering pass.

```powershell
npm ci --prefix tools/wiki-publisher
npm test --prefix tools/wiki-publisher
node tools/wiki-publisher/build.mjs --wiki C:/dev/MoFaCTS.wiki --out C:/dev/optimallearning.org/.build/review
node tools/wiki-publisher/verify.mjs .build/review
```

Choose a fresh output directory on a later build. Existing output is never silently
mixed with a new build. `--revision` pins a wiki commit; `--publisher-revision` records
the website commit. Preview the complete generated site with an ordinary local HTTP
server rooted at the output directory.

Dependencies are pinned in `package-lock.json`. Mermaid CLI 12 currently reports one
low-severity KaTeX advisory (also reported against the parent CLI package); it requires
pre-existing prototype pollution. The parser/renderer runs only in the build and
publishes static SVG. No affected JavaScript is delivered to readers. Do not blindly
use `npm audit fix --force`, which selects a different Mermaid major version.

## AWS activation

Verified hosting is S3 bucket `optimallearning.org` in `us-east-1`, served through
CloudFront distribution `E1TXXZFADCMIJE`. The existing bucket policy already permits
public object reads. No public-access policy change is needed.

1. Create the GitHub OIDC provider with URL `https://token.actions.githubusercontent.com`
   and audience `sts.amazonaws.com` if it is absent.
2. Create role `GitHubOptimalLearningWikiPublisher` with `aws-trust-policy.json` and
   inline permissions from `aws-permissions-policy.json`. Only this repository's
   `main` branch may assume it. It cannot administer AWS or write unrelated content.
   The subject includes immutable owner/repository IDs, as required for newly
   created GitHub repositories. Verify the exact prefix with
   `gh api repos/imrryr/optimallearning.org/actions/oidc/customization/sub`;
   do not replace it with a name-only subject or wildcard.
3. Enable S3 versioning for the website bucket before activation. Automated writes
   and removal of obsolete generated objects then retain recoverable versions.
   Existing versions consume S3 storage; the publisher cannot delete versions.
4. Set GitHub Actions repository variable `AWS_ROLE_ARN` to the created role ARN.
   This variable activates the workflow. No long-lived AWS key is stored in GitHub.
5. Dispatch **Publish MoFaCTS wiki**, then verify its public-delivery check passes.

These AWS access changes require the owner's explicit action-time approval.

## Automatic operation

The workflow checks at minute 17 of each hour and on website pushes to `main`.
GitHub schedules can be delayed. It compares both published revisions and skips
unchanged builds. A manual dispatch with `force` republishes intentionally. A 404
publication marker denotes first publication; other errors stop the job.

Build, link/image checks, and tests finish before AWS authentication and upload.
The workflow publishes `/wiki/`, removes obsolete generated objects within that
prefix, updates the homepage and resource-page links, shared stylesheet/favicon, sitemap and
robots file, and refreshes the corresponding CloudFront cache paths. It verifies
public content before uploading the revision marker, refreshes that marker, and
then verifies the completed publication. S3 publication
is not an atomic transaction; a partial upload fails visibly and can be repaired
by rerunning the same verified revision. Concurrent publications are serialized.

The homepage also retains Google's public site-verification meta tag for the
owner's Search Console property at `https://optimallearning.org/`. This is a
public ownership marker, not an API credential. Keep it during homepage edits.

## Recovery and boundaries

- To pause publishing, remove the `AWS_ROLE_ARN` repository variable or disable the workflow.
- To restore editorial content, revert the relevant wiki commit and let the next run publish.
- For a deployment incident, previous S3 object versions can be restored through the console;
  the workflow is not authorized to erase version history. Re-run and invalidate CloudFront
  after restoring a consistent release.
- The build artifact and `wiki/publication.json` identify the source and publisher commits.
- The workflow never deploys source tools, `.git`, local settings, or `.diagrams` intermediates.
- Live HTTP verification proves delivery, not Google indexing. Search Console sitemap
  submission is a separate account action; Google controls indexing and ranking.

## TutorScript sharing graphic

`social/tutorscript-share.svg` is the editable, original vector artwork created for
this website. Its checked-in `tutorscript-share.png` is the 1200 × 627 sharing export;
it uses the site's navy/lavender palette and Inter/Segoe UI sans-serif font stack.
Keep the PNG synchronized when editing the SVG. The publisher copies the approved
PNG without requiring a new image-rendering dependency in CI. Only the PNG is
published as a sharing asset; the detailed instructional-cycle SVG stays in the wiki.
After publishing a changed card, inspect the page at LinkedIn Post Inspector before
sharing. LinkedIn caches previews; refreshing applies to new posts, not existing ones.

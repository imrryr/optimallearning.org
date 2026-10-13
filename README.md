# Optimal Learning Lab website

Public website: <https://optimallearning.org/>

This is the source for the existing static website and its automated MoFaCTS wiki
mirror. Root HTML files are hand-maintained; `_frame/site-refresh.css` supplies the
shared theme. The original refresh notes remain as historical authoring records.

## Shared presentation

Ordinary reading text uses IBM Plex Sans; headings retain Source Serif 4, and
navigation, action links and brand labels retain Inter. The existing Google Fonts
links in root pages load regular, italic and bold Plex faces. The wiki inherits
that font request from `links.html`; its article styles belong to
`tools/wiki-publisher/wiki.css`. Code and embedded figure artwork keep their fonts.

`_frame/site-refresh.css` defines a 4/8/12/16/24/32px spacing scale. Headers own the
gap before the first content section; later sections own their separation. Desktop
section gaps are 32px, with 24px on mobile. Reading blocks use a 68ch maximum while
figures and tables can fill their containers. Cards use restrained shadows and
content-driven heights; navigation keeps its approved capsule dimensions.
Wide wiki tables scroll inside their existing focusable regions on small screens,
preserving field names and keeping horizontal scrolling out of the page itself.

For visual review, serve a fresh full publisher build. Disable browser caching and
verify the served stylesheet bytes and actual rendered fonts, then check the
homepage, interior pages and TutorScript at desktop and mobile widths. Also check
320px reflow, keyboard focus, and expanded/collapsed wiki navigation. Keep review
screenshots and diagnostic artifacts in ignored `.build/`, not in public assets.

## Documentation publishing

The public CV lives at `_media/documents/Philip-Pavlik-CV.pdf`, with its editable
copy alongside it as `Philip-Pavlik-CV.docx`. These are intentional public assets
maintained from Philip Pavlik's professional CV. Before replacing them, check
citation metadata and rendered pages, remove private contact and application
metadata, and preserve the distinction between award totals and Memphis subawards.
The current wiki publishing role does not cover these assets or most main-site
content pages; publication of a complete content update requires a separately
authorized deployment step.

The GitHub wiki is the editorial source. The website mirror at `/wiki/` is generated
from committed wiki Markdown and assets, using the site's header, footer and styles.
See [the publisher guide](tools/wiki-publisher/README.md) for setup, verification,
deployment boundaries and recovery. Generated files are kept in ignored `.build/`.

The publisher owns the deployed `sitemap.xml` and `robots.txt`. The source copies
provide a valid website-only baseline; deployment regenerates the complete sitemap
including the current wiki pages. Do not add wiki entries manually.

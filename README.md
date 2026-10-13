# Optimal Learning Lab website

Public website: <https://optimallearning.org/>

This is the source for the existing static website and its automated MoFaCTS wiki
mirror. Root HTML files are hand-maintained; `_frame/site-refresh.css` supplies the
shared theme. The original refresh notes remain as historical authoring records.

## Documentation publishing

The GitHub wiki is the editorial source. The website mirror at `/wiki/` is generated
from committed wiki Markdown and assets, using the site's header, footer and styles.
See [the publisher guide](tools/wiki-publisher/README.md) for setup, verification,
deployment boundaries and recovery. Generated files are kept in ignored `.build/`.

The publisher owns the deployed `sitemap.xml` and `robots.txt`. The source copies
provide a valid website-only baseline; deployment regenerates the complete sitemap
including the current wiki pages. Do not add wiki entries manually.

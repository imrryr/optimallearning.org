# OptimalLearning Website Agent Guide

## Purpose
- Repository path: `C:\dev\optimallearning.org`
- GitHub repository: `https://github.com/imrryr/optimallearning.org`.
- Related public-facing website content for product messaging, project context, and externally visible workflow descriptions.

## Sibling Repositories In This Workspace
- `C:\dev\MoFaCTS` (main product code)
- `C:\dev\mofacts_config` (configuration/content expectations)
- `C:\dev\MoFaCTS.wiki` (canonical product/developer documentation)

## When To Inspect Siblings
- If user-facing behavior/workflow changes in `mofacts` (especially in `svelte-app`), inspect this website for messaging alignment needs.
- If config expectations or terminology used publicly changes, inspect `mofacts_config` and align wording/examples.
- If wiki guidance changes product framing or user workflow documentation, inspect this site for consistency.

## Cross-Repo Coordination Is Expected
- Do not assume this site is self-contained.
- Coordinate with code/docs/config repos when product behavior or documentation-relevant messaging changes.

## Wiki Publishing
- Wiki Markdown remains owned by `C:\dev\MoFaCTS.wiki`; do not edit generated HTML.
- Publisher source and operating instructions live in `tools/wiki-publisher/`.
- Build only committed wiki content. Local uncommitted wiki changes must not leak into publication.
- The publisher reuses the header, footer and shared styles from this website.
- Run publisher tests, a full wiki build and generated-link verification before publishing.
- Keep `.build/`, dependency folders, credentials and local agent settings out of Git and S3.
- The publishing workflow must be confined to its documented S3 paths; no bucket-root sync/delete.

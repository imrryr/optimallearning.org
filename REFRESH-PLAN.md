# OptimalLearning.org Refresh Plan

## Recommended Direction

Rebuild the public-facing pages as a small hand-maintained static site, using the current export only as source material. The current site is a TOWeb export with repeated boilerplate in every page, which makes even simple edits expensive and inconsistent.

## What I Found

- Shared theme and layout are embedded in each page instead of a reusable template.
- Styling is concentrated in a large generated stylesheet with dated visual choices and Bootstrap 2-era patterns.
- There is clearly stale or broken copy:
  - typo in brand line: `Appying cognitive theory...`
  - placeholder text still present: `%PREZIMEM%`
  - encoding issue: `naïve`
  - time-sensitive claims like "6th year," "most recent work, since 2014," "Past Seminar," and "forthcoming"
- Content structure is fragmented:
  - `research.html` exists but is not in the top nav
  - two anatomy/physiology grant pages appear to overlap
- Old technical baggage is still included:
  - HTTP Google Analytics snippet in pages
  - large legacy script bundle under `_scripts/`
  - generated search page likely requires manual regeneration

## Plan

1. Define scope and target structure
- Keep only pages that still serve a current purpose.
- Proposed primary nav: `Home`, `Research`, `People`, `Projects`, `Funding`, `Resources`, `Contact`.
- Move one-off archive content such as the 2024 tutorial into an `Archive` section or remove from nav.

2. Audit and classify all current pages
- `Keep and rewrite`: `index`, `people`, `research`, `funding`, `links`, `mobile-fact-and-concept-training-system-mofacts`, `logistic-knowledge-tracing-lkt-tutorial`
- `Keep as supporting detail`: the individual grant pages
- `Archive/remove`: outdated event/tutorial pages, redundant pages, weak "link dump" content, duplicate grant pages
- Deliverable: a page-by-page disposition list before editing

3. Rewrite core content first
- Homepage:
  - replace generic lab description with a current value proposition
  - add 3 to 5 clear entry points: research, software, publications, funding, contact
  - remove "Past Seminar" from the hero area
- People:
  - update current members, roles, bios, affiliations
  - separate active members, collaborators, alumni
- Research:
  - rewrite for current work, methods, and application areas
  - remove placeholder/encoding issues and time-relative wording
- Funding:
  - convert from card blurbs to a current + past funding timeline
- Links/Resources:
  - reduce to only high-value links that still matter

4. Replace the presentation layer
- Stop relying on the generated `_frame/style.css` as the main design system.
- Create a smaller modern stylesheet and a shared page shell.
- Remove Bootstrap 2-era navbar/layout assumptions and simplify to responsive CSS.
- Preserve only needed assets such as headshots and a small number of icons.

5. Normalize the HTML
- Use semantic sections: `header`, `main`, `nav`, `section`, `footer`.
- Remove duplicated inline styles and generated wrapper divs where possible.
- Standardize metadata, page titles, descriptions, and social preview tags.
- Fix accessibility basics: heading order, alt text, link labels, keyboard-friendly nav.

6. Clean up obsolete scripts and integrations
- Remove legacy HTTP analytics snippet unless you intentionally still use it.
- Remove unused JS libraries from `_scripts/`.
- Decide whether site search is worth keeping; if not, delete the generated search page and form.
- Keep only minimal JS for nav/menu behavior if needed.

7. Preserve URLs while reducing clutter
- Keep existing URLs for pages that may already be indexed or linked.
- If pages are removed or merged, add redirects in `.htaccess`.
- Consolidate duplicate grant pages to one canonical URL.

8. Validate and polish
- Mobile layout review.
- Link check across internal and external pages.
- Content proofreading pass for dates, names, affiliations, and claims.
- Basic performance pass: remove unused assets, optimize images, cut JS/CSS weight.

## Suggested Execution Order

1. Finalize sitemap and decide what gets archived.
2. Rewrite homepage, research, and people content.
3. Build a shared modern page shell and stylesheet.
4. Migrate funding/projects/resources into the new shell.
5. Add redirects and remove obsolete files/assets.
6. Do a final QA pass on mobile, links, and metadata.

## Practical First Milestone

A good first deliverable would be:
- new homepage
- new research page
- new people page
- shared header/footer/styles
- all other pages left temporarily functional

That gives the site an immediate improvement without forcing a full rewrite in one pass.

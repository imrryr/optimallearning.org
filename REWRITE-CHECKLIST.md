# OptimalLearning.org Rewrite Checklist

## Recommended Defaults

- Primary navigation: `Home`, `Research`, `People`, `Projects`, `Funding`, `Resources`, `Contact`
- `MoFaCTS`: move under `Projects` as the flagship project, but preserve the current URL
- `LKT Tutorial`: move under `Resources` conceptually, but preserve the current landing page URL
- Site search: remove it unless there is evidence people actively use it
- Historical content: archive only pages with lasting scholarly or reference value; remove low-value historical clutter
- URL policy: preserve existing URLs for retained pages and add redirects for merged or removed pages

## Status Key

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `Archive` Keep accessible but remove from primary navigation
- `Remove` Delete or redirect after replacement exists

## Site-Level Checklist

### Information Architecture
- [ ] Finalize primary navigation: `Home`, `Research`, `People`, `Projects`, `Funding`, `Resources`, `Contact`
- [ ] Implement `Projects` as the home for MoFaCTS and any future software or applied systems
- [ ] Implement `Resources` as the home for LKT materials, selected links, and possibly FAQ content
- [ ] Create an `Archive` bucket for past events and historical material
- [ ] Create a redirect plan for merged and removed pages

### Design And Frontend
- [x] Build a shared page shell for header, nav, main content, and footer
- [x] Replace generated TOWeb visual layer with a smaller custom stylesheet
- [ ] Remove Bootstrap 2-era layout dependencies where possible
- [ ] Standardize spacing, typography, buttons, and content widths
- [ ] Validate mobile navigation and responsive behavior
- [ ] Improve accessibility: heading structure, alt text, focus states, nav labels

### HTML/CSS Cruft Removal
- [~] Remove generated wrapper divs and nested layout markup that no longer serves the rewritten pages
- [~] Strip inline styles that duplicate stylesheet rules or lock pages into the old layout
- [~] Remove obsolete utility classes that are only present because of the TOWeb export
- [ ] Remove CSS rules in `_frame/style.css` that are unused after the rewrite or replace the file entirely
- [ ] Remove page-specific style fragments that exist only to support old widgets or generated sections
- [x] Eliminate duplicate visual patterns and replace them with a small shared set of reusable classes
- [~] Remove dead HTML fragments such as placeholder blocks, empty containers, duplicate buttons, and unused embed wrappers

### Content And Metadata
- [x] Rewrite homepage copy to reflect current lab mission and current work
- [ ] Remove time-relative wording such as "most recent," "forthcoming," and year-relative claims
- [~] Fix typos, grammar, and encoding issues across all retained pages
- [ ] Standardize page titles and meta descriptions
- [ ] Standardize footer text and update date handling

### Technical Cleanup
- [ ] Remove legacy HTTP Google Analytics snippet unless intentionally retained
- [ ] Audit `_scripts/` and remove unused libraries after migration
- [x] Remove `_search.html` and the search form unless there is a strong deployment reason to keep them
- [ ] Update `.htaccess` with redirects for merged, renamed, or removed pages
- [x] Refresh `sitemap.xml` and `robots.txt` after structure is finalized

## Page-By-Page Checklist

### 1. Home
File: `index.html`
Action: `Rewrite in place`
Role in final site: `Top-level landing page`
- [ ] Replace the current intro with a concise current lab overview
- [ ] Replace the "Past Seminar on LKT R package" block with current calls to action
- [ ] Add clear entry points to Research, People, Projects/MoFaCTS, Funding, and Contact
- [ ] Decide whether to keep any video on the homepage
- [ ] Fix branding copy: "Applying cognitive theory to optimize learning"
- [ ] Update metadata and social preview copy
- [ ] Remove homepage-specific generated layout cruft and empty content containers

Recommendation:
- Keep the homepage short, current, and directional. It should explain the lab in under 20 seconds and route visitors to the right destination.

### 2. Research
File: `research.html`
Action: `Rewrite in place and add to nav`
Role in final site: `Top-level page`
- [ ] Rewrite the page around current research themes, methods, and application areas
- [ ] Remove `%PREZIMEM%`
- [ ] Fix encoding and spelling issues such as `na√Øve`, `invovles`, and similar errors
- [ ] Replace dated timeline language like "since 2014" with durable wording
- [ ] Add clear links to related projects, publications, or software
- [ ] Remove old sidebar and panel markup if it is no longer needed

Recommendation:
- This should become one of the core public pages. It is stronger and more important than `Links` as a top-level destination.

### 3. People
File: `people.html`
Action: `Rewrite in place`
Role in final site: `Top-level page`
- [ ] Verify all current members and roles
- [ ] Split into `Director`, `Current Members`, `Collaborators`, `Alumni`
- [ ] Replace relative career statements such as "6th year"
- [ ] Clean up capitalization and formatting inconsistencies
- [ ] Decide which alumni entries should remain and which can move to archive
- [ ] Update profile links and external destinations
- [ ] Remove generated image/text float markup that is only supporting the old layout

Recommendation:
- Keep alumni visible but compressed. The page should primarily communicate who is active now.

### 4. Projects / MoFaCTS
File: `mobile-fact-and-concept-training-system-mofacts.html`
Action: `Rewrite and position under Projects`
Role in final site: `Project detail page`
- [ ] Rewrite page to explain what MoFaCTS is, who it serves, and its current status
- [ ] Keep current external links only if still valid
- [ ] Rework the developer history into a maintainable acknowledgments/history section
- [ ] Add a short "Use it / Learn more / Source code" action area
- [ ] Keep the current URL even if the nav label changes to `Projects`
- [ ] Remove generated button rows and layout spans that do not survive the rewrite

Recommendation:
- Do not keep `MoFaCTS` as a top-level nav item by itself. It is important, but it reads more cleanly as the labís flagship project inside `Projects`.

### 5. Funding
File: `funding.html`
Action: `Rewrite in place`
Role in final site: `Top-level page`
- [ ] Reframe as `Current and Past Funding`
- [ ] Turn grant cards into a timeline or structured list
- [ ] Remove duplicate `More...` buttons and generated card clutter
- [ ] Summarize each grant consistently: sponsor, years, aim, outcome, link
- [ ] Decide which grant pages remain as detail pages
- [ ] Remove thumbnail-grid markup if it is replaced by simpler content sections

Recommendation:
- Keep this top-level because it is useful for academic credibility and institutional context.

### 6. Grant Detail Pages
Files:
- `ies-bridging-the-bridge-to-algebra.html`
- `nsf-building-a-scalable-infrastructure-for-data-driven-discovery-and-innovation-in-education.html`
- `ies-using-adaptive-practice-to-improve-recall-and-understanding-in-postsecondary-anatomy-and-physiology.html`
- `ies-using-adaptive-practice-to-improve-recall-and-understanding-in-postsecondary-anatomy-and-physio.html`
Action: `Keep selected pages, merge duplicates, archive older details`
Role in final site: `Supporting detail pages`
- [x] Compare both anatomy/physiology pages and keep one canonical version
- [x] Rewrite surviving pages for consistency and factual accuracy
- [x] Add a standard grant page template: overview, sponsor, collaborators, outputs
- [x] Remove or redirect duplicate anatomy/physio URL
- [ ] Decide whether older grants belong in archive instead of active navigation
- [x] Remove leftover generated card/list wrappers after template conversion

Recommendation:
- Keep only the strongest, cleanest grant detail pages. These should support funding summaries, not compete with them.

### 7. Resources / Links
File: `links.html`
Action: `Rewrite in place as Resources or merge into a broader resources page`
Role in final site: `Top-level page or subsection of Resources`
- [ ] Trim link list to high-value current external resources only
- [ ] Remove generic descriptions that do not add value
- [ ] Verify every external link still resolves and is still relevant
- [ ] Rename visible section to `Resources`
- [ ] Remove old list presentation styles that make the page feel like a link dump

Recommendation:
- Keep the file if convenient, but change the visible label from `Links` to `Resources`. `Links` undersells the content and feels dated.

### 8. FAQ
File: `frequently-asked-questions.html`
Action: `Merge into Resources or Projects unless a standalone FAQ remains justified`
Role in final site: `Secondary content`
- [ ] Rewrite for current usage paths and current code hosting location
- [ ] Replace outdated Bitbucket reference if no longer correct
- [ ] Fix grammar and spelling issues such as `Collaobrations` and `critereon`
- [ ] Decide final home for this content: Resources section, Projects page, or standalone FAQ
- [ ] Add redirect if the standalone page is removed
- [ ] Remove anchor-list and repeated wrapper markup if merged into another page

Recommendation:
- Do not keep FAQ as a top-level standalone page. Fold it into `Resources` unless the rewritten content becomes large enough to justify its own page.

### 9. LKT Landing Page
File: `logistic-knowledge-tracing-lkt-tutorial.html`
Action: `Keep and rewrite lightly as documentation hub`
Role in final site: `Resource hub`
- [x] Rename visible framing from `Tutorial` to `Tutorial and Resources` or similar
- [x] Remove stale event-specific callouts from the top of the page
- [x] Organize subpages around getting started, data prep, inputs/outputs, examples
- [x] Add a short overview of the LKT package and who this material is for
- [x] Keep the current URL even if the nav label becomes `Resources`
- [x] Remove event-microsite layout markup that is not needed for long-term documentation

Recommendation:
- Keep this material, but stop presenting it like a live event microsite. It should read like maintained documentation.

### 10. LKT Subpages
Files:
- `lkt-basics.html`
- `data-prepreparation.html`
- `lkt-input-and-output.html`
- `lkt-examples.html`
Action: `Keep and rewrite for consistency`
Role in final site: `Documentation pages`
- [x] Correct spelling of `data-prepreparation` in visible text; decide whether URL should stay for compatibility
- [x] Standardize intros, headings, and code/example formatting
- [~] Check for obsolete examples or package references
- [ ] Add "last reviewed" notes if ongoing maintenance is expected
- [~] Confirm links to CRAN, GitHub, and mailing list are current
- [x] Remove leftover generated layout wrappers and local-topbar cruft where possible

Recommendation:
- Preserve these URLs if they may already be shared, but clean up the visible titles and page structure.

### 11. Event Page
File: `edm-2024-tutorial-schedule.html`
Action: `Archive`
Role in final site: `Archive only`
- [ ] Remove from active learning/resource pathways
- [ ] Keep accessible only if historically useful
- [ ] Remove unfinished notes like "To be finished before 7/13"
- [ ] Optionally add an archive banner indicating it was a July 14, 2024 event
- [ ] Strip unnecessary page chrome if the page is retained only as an archive record

Recommendation:
- Archive, do not feature.

### 12. Comparison / Historical Content
File: `flashcard-systems-of-varying-quality.html`
Action: `Archive or remove`
Role in final site: `Historical content at most`
- [x] Decide whether this content still supports the current site goals
- [ ] If kept, rewrite as a historical comparison with current context
- [x] If not kept, remove without redirect tracking
- [ ] Remove legacy formatting and long generated link-list presentation if retained

Recommendation:
- Default to remove unless you specifically want a historical context page. It currently reads more like old web curation than current lab communication.

### 13. Utility Pages
Files:
- `_search.html`
- `_message.html`
- `_tos.html`
- `_error-msg.php`
Action: `Review individually`
Role in final site: `Only if functionally required`
- [x] Determine whether each file is still used by the deployed site
- [x] Remove generated search if search is dropped
- [x] Keep terms/message/error pages only if they support active forms or workflows
- [ ] Rewrite any retained utility page to match the new page shell
- [x] Remove generated utility HTML/CSS scaffolding from any retained file

Recommendation:
- Keep only what the deployed site actually uses. Generated utility pages should not survive by default.

### 14. SEO / Ops Files
Files:
- `.htaccess`
- `sitemap.xml`
- `robots.txt`
Action: `Update after content migration`
Role in final site: `Operational support`
- [ ] Add redirects for removed and merged pages
- [ ] Regenerate sitemap once final URLs are settled
- [ ] Confirm robots policy matches the final site structure

Recommendation:
- Treat redirects as part of the rewrite, not as a cleanup afterthought.

## Recommended Build Order

### Milestone 1: Core Public Face
- [x] Rewrite `index.html`
- [x] Rewrite `research.html`
- [x] Rewrite `people.html`
- [x] Implement shared layout and stylesheet for those pages
- [x] Remove obsolete HTML/CSS cruft from those pages as part of the rewrite, not after

### Milestone 2: Main Supporting Content
- [x] Rewrite `funding.html`
- [x] Rewrite `mobile-fact-and-concept-training-system-mofacts.html`
- [x] Rewrite `links.html` as `Resources`
- [x] Merge or rewrite `frequently-asked-questions.html`
- [x] Remove obsolete HTML/CSS cruft from those pages as part of the rewrite, not after

### Milestone 3: LKT Section
- [x] Rewrite `logistic-knowledge-tracing-lkt-tutorial.html`
- [x] Refresh all LKT subpages
- [x] Archive `edm-2024-tutorial-schedule.html`
- [x] Remove obsolete event and documentation layout cruft during the refresh

### Milestone 4: Cleanup And Launch
- [x] Consolidate grant detail pages
- [x] Remove obsolete scripts and generated artifacts
- [x] Replace or heavily reduce `_frame/style.css`
- [ ] Add redirects in `.htaccess`
- [x] Update `sitemap.xml`
- [ ] Run final mobile, content, and link QA

## Decisions Resolved

- [x] `MoFaCTS` should move under `Projects`
- [x] `LKT Tutorial` should move under `Resources` conceptually, while keeping the current URL
- [x] Site search should be removed by default
- [x] Historical pages should be archived only if they retain scholarly or reference value
- [x] Existing URLs should be preserved for retained pages, with redirects for merged or removed pages

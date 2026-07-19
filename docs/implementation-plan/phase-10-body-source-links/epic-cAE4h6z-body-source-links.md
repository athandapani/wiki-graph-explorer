# Epic cAE4h6z: Body Source Links

**Phase:** 10 — Body Source Links
**Status:** Not Started
**Dependencies:** Epic Dj3m8aH (established the node-field extraction pattern used by `description`), Epic nQJ8Ofz (established the rich, sectioned side-panel layout this feature extends)

> **Brand:** Use the project's brand guidelines skill for the "Cited sources" list styling if one is configured.

---

## Description

Extend the side panel's source-transparency story beyond the single self-referential "View
source on GitHub" link. When a vault page cites external material inline (standard
`[text](url)` Markdown links in its body), the build tool now extracts up to the first 5 of
those links, in document order, into a new `sourceLinks` field on the node's `graph-data.json`
entry — kept strictly distinct from the `[[slug|title]]` wikilink syntax already used for
`Related`/`Referenced By` edges. The side panel renders these as a "Cited sources" list below
the existing "Connected pages" section, letting a visitor jump straight to the material a page
references, not just verify the page itself. The 5-link cap and no-deduplication behavior are
deliberate scope constraints to keep the feature contained rather than open-ended.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|----------------|
| TOR-01-VpUINkL | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall extract standard inline Markdown links from a page's body into a sourceLinks field on that page's node entry in graph-data.json |
| TOR-01-C9XWA4Y | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall cap the sourceLinks field at the first 5 inline Markdown links found in a page's body, in document order |
| TOR-01-BUr15UG | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall not extract wikilinks as sourceLinks entries, keeping body source-link extraction distinct from Related/Referenced By edge parsing |
| TOR-01-wU3svpK | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall not deduplicate repeated URLs when extracting sourceLinks, counting each occurrence toward the 5-link cap |
| TOR-01-6VVefyP | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit an empty sourceLinks array, without error, for a page whose body contains no inline Markdown links |
| TOR-04-nsmOOZ8 | `docs/requirements/04-side-panel.feature.md` | The side panel shall display a "Cited sources" list of clickable links when the selected node's sourceLinks field is non-empty |
| TOR-04-F5cdTRd | `docs/requirements/04-side-panel.feature.md` | The side panel shall omit the "Cited sources" section entirely, without rendering an empty heading or placeholder, when the selected node's sourceLinks field is empty |
| TOR-04-9JDfgAA | `docs/requirements/04-side-panel.feature.md` | Each cited-source link shall open its target URL in a new tab |

## Key Components

### Backend (Build Pipeline)

- `lib/frontmatter-parser.ts` — add an `extractSourceLinks()` helper alongside the existing
  `extractFirstBodyParagraph()` and `extractWikilinks()` functions: regex-matches standard
  `[text](url)` links in the page body (frontmatter already excluded upstream), returns up to
  the first 5 matches as `{ text, url }` pairs in document order, with no deduplication. Must
  not match `[[slug|title]]` wikilink syntax (already a different pattern, but add a
  regression test alongside `extractWikilinks()`'s existing tests to confirm no cross-match).
- `lib/graph-builder.ts` — add `sourceLinks: { text: string; url: string }[]` to the
  `NodeRecord` interface; call `extractSourceLinks(parsed.body)` in `buildGraph()` and include
  the result on each pushed node record (mirrors how `description` is already resolved and
  attached at lines 52/59).
- `lib/graph-data-writer.ts` — verify the writer serializes full `NodeRecord` objects (no
  field allowlist to update) so `sourceLinks` passes through automatically; add/confirm test
  coverage for the new field's presence in written output.

### Frontend

- `components/graph/SidePanel.tsx` — add a "Cited sources" section rendered immediately after
  the existing "Connected pages" section (~line 115) and before the "View source on GitHub"
  link (~line 146), following the same clickable-link visual treatment as that GitHub link.
  Render only when the selected node's `sourceLinks` array has at least one entry; omit the
  section (no heading, no placeholder) when empty. Each link opens via `target="_blank"` with
  `rel="noopener noreferrer"`, `href` set to the entry's `url`, and label text set to the
  entry's `text`.

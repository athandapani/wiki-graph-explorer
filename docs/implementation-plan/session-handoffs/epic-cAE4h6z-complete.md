# Epic cAE4h6z: Body Source Links — Complete

**Completed:** 2026-07-18
**Verified by:** Independent review via `/peak-workflow:wrapup-epic cAE4h6z`

## What Was Built

The build tool extracts up to the first 5 standard `[text](url)` Markdown links found in a
page's body (frontmatter excluded, `[[slug|title]]` wikilinks structurally excluded) into a new
`sourceLinks` field on each node in `graph-data.json`. The side panel renders these as a "Cited
sources" list between "Connected pages" and "View source on GitHub", omitted entirely when a
page has no such links.

## Key Files

| File | Purpose |
|------|---------|
| `lib/frontmatter-parser.ts` | `extractSourceLinks()` — the regex-based extraction, capped at 5, document order, no dedup |
| `lib/graph-builder.ts` | Adds `sourceLinks` to `NodeRecord`; wires extraction into `buildGraph()` |
| `components/graph/GraphCanvas.tsx` | Adds `sourceLinks` to the shared `GraphNode` interface |
| `components/graph/SidePanel.tsx` | Renders the "Cited sources" section |
| `tests/frontmatter-parser.test.ts`, `tests/graph-builder.test.ts`, `tests/build-graph.test.ts`, `tests/side-panel.test.ts`, `tests/side-panel.test.tsx` | Unit, wiring, and end-to-end coverage for all 8 TORs |

## Key Decisions

- `sourceLinks` extraction reuses the existing `[text](url)` regex shape already present in
  `frontmatter-parser.ts` (previously used only for *stripping* links from the description
  fallback) — no new parsing dependency introduced.
- Wikilink exclusion (TOR-01-BUr15UG) required no special-casing: the regex structurally cannot
  match `[[slug|title]]` syntax, since no `(` ever immediately follows a wikilink's closing `]]`.
- `lib/graph-data-writer.ts` needed no code change — it already serializes full `NodeRecord`
  objects with no field allowlist, so the new field passes through automatically.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-VpUINkL | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-01-C9XWA4Y | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-01-BUr15UG | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts |
| TOR-01-wU3svpK | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts |
| TOR-01-6VVefyP | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-04-nsmOOZ8 | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts, tests/side-panel.test.tsx |
| TOR-04-F5cdTRd | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts, tests/side-panel.test.tsx |
| TOR-04-9JDfgAA | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts, tests/side-panel.test.tsx |

## Verification Summary

### Counts
- TOR Requirements: 8/8 PASS
- Quality Gates: 4/4 PASS (lint, typecheck, build, tests)
- Tests: 298 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-01-VpUINkL / TOR-01-C9XWA4Y — `extractSourceLinks()` correctly extracts and caps at 5 in document order (lib/frontmatter-parser.ts:89-96, tests/frontmatter-parser.test.ts, tests/build-graph.test.ts)
- ✅ TOR-01-BUr15UG — regex structurally excludes wikilinks (lib/frontmatter-parser.ts:85-88)
- ✅ TOR-01-wU3svpK / TOR-01-6VVefyP — no dedup; empty case returns `[]` cleanly
- ✅ TOR-04-nsmOOZ8 / TOR-04-F5cdTRd / TOR-04-9JDfgAA — "Cited sources" section correctly positioned and gated (components/graph/SidePanel.tsx:140-157); visually confirmed via `playwright-cli` against the real public vault (correct text/href/target/rel, and complete omission when empty)

### Conclusion
Independent source inspection (not just tests) confirms all 8 Given/When/Then requirements are
realized exactly as specified in the epic spec, with zero deviations. All quality gates pass.

### Manual verification performed: Yes
Clicked through the Cited sources list and confirmed links opened correctly while the local playwright demo was running.

## Known Issues / Follow-ups

None.

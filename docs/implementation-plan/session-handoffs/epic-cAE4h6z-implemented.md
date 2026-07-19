# Epic cAE4h6z: Body Source Links — Implemented

## What Was Built

The build tool now extracts up to the first 5 standard `[text](url)` Markdown links found in a
page's body (frontmatter excluded, `[[slug|title]]` wikilinks structurally excluded) into a new
`sourceLinks` field on each node in `graph-data.json`. The side panel renders these as a "Cited
sources" list between the existing "Connected pages" section and the "View source on GitHub"
link, using the same omit-when-empty and new-tab-link conventions already established for
`description` and the GitHub source link.

## Key Files

| File | Change |
|---|---|
| `lib/frontmatter-parser.ts` | Added `extractSourceLinks()` and `SOURCE_LINK_PATTERN`/`SOURCE_LINK_CAP` |
| `lib/graph-builder.ts` | Added `sourceLinks` to `NodeRecord`; wired `extractSourceLinks()` into `buildGraph()` |
| `components/graph/GraphCanvas.tsx` | Added `sourceLinks` to `GraphNode` interface |
| `components/graph/SidePanel.tsx` | Added "Cited sources" section |
| `tests/frontmatter-parser.test.ts` | 5 new unit tests (one per build-pipeline TOR) |
| `tests/graph-builder.test.ts` | 1 new wiring test |
| `tests/build-graph.test.ts` | 2 new end-to-end tests |
| `tests/side-panel.test.ts` | 3 new source-inspection tests; `node()` helper updated |
| `tests/side-panel.test.tsx` | 3 new rendered-DOM tests; `node()` helper updated |
| `tests/dual-pane-board.test.tsx`, `tests/swim-lane-canvas.test.tsx`, `tests/filter-controls.test.ts` | `node()` helpers updated with `sourceLinks: []` default (type-correctness only, no new tests) |

## Spec Deviations

None. All 8 TORs implemented exactly as specified.

## TOR Coverage

| TOR ID | Verdict |
|---|---|
| TOR-01-VpUINkL | PASS |
| TOR-01-C9XWA4Y | PASS |
| TOR-01-BUr15UG | PASS |
| TOR-01-wU3svpK | PASS |
| TOR-01-6VVefyP | PASS |
| TOR-04-nsmOOZ8 | PASS |
| TOR-04-F5cdTRd | PASS |
| TOR-04-9JDfgAA | PASS |

## Verification Results

- `npm run lint` — PASS (no output)
- `npm run build` — PASS (Next.js static export compiled successfully)
- `npm test` — PASS (298/298 tests, 43 files)
- `npm run typecheck` — PASS (no errors)
- Visual verification via `playwright-cli` — PASS. Built `graph-data.json` locally against the
  public `../ai-adoption-wiki/wiki` vault (43 of 110 nodes have inline citation links), started
  the dev server, and confirmed in the browser: (1) the "145 AI Laws Were Passed in 2025" node
  shows a "Cited sources" list with the correct link text, `href`, `target="_blank"`, and
  `rel="noopener noreferrer"`; (2) the "AI Acceptable Use Policy" node (no inline links) shows no
  "Cited sources" heading at all. Verification build output was not committed (gitignored,
  cleaned up after verification).

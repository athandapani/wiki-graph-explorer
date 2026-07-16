# Epic W677sOY: Search Everywhere — Complete

**Completed:** 2026-07-16
**Verified by:** Independent review via `/peak-workflow:wrapup-epic W677sOY`

## What Was Built

Semantic search is now wired into the swim-lane board, not just the force-directed canvas — typing a query dims/highlights pills exactly as it does force-directed nodes, and a match with no pill on the board (hidden by low degree) is revealed dashed rather than staying invisible. The search input was promoted from an in-canvas control to an always-visible header slot with a live "N matching pages" count, reachable from anywhere via Ctrl+K or `/`, and the active query now survives switching between layout modes instead of resetting.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/useSearchRanking.ts` | Shared hook + exported `computeSearchDimmedNodeIds`/`computeMatchCount` — single source of truth both canvases read so dimming can't diverge again |
| `components/graph/SwimLaneCanvas.tsx` | Consumes shared dimming; reveals off-board search matches (dashed) regardless of degree |
| `components/graph/GraphCanvas.tsx` | Refactored to consume the same shared `computeSearchDimmedNodeIds` (previously had its own inline copy) |
| `components/graph/SearchInput.tsx` | Result-count display; Ctrl+K / `/` global focus shortcut, ignoring `/` while already in a text input |
| `components/graph/Header.tsx` | New optional `search` slot, rendered `shrink-0` so it never scrolls out of view |
| `app/graph/page.tsx` | `useSearchRanking` hoisted above the layout-mode branches; both canvases stay mounted (CSS `display` toggle) so query state is never re-instantiated on switch |

## Key Decisions

- Deduplicated the dimming decision into one exported function (`computeSearchDimmedNodeIds`) consumed by both `GraphCanvas` and `SwimLaneCanvas`, rather than fixing swim-lane in isolation — duplicated per-canvas logic is what let the original bug (issue #4 finding A1) exist in the first place.
- A search match that would otherwise be hidden by the swim-lane board's low-degree filtering is now force-revealed (dashed styling, same visual language as click-reveals) so the result count and the visible board never disagree.
- Layout-mode persistence is achieved by keeping both canvases permanently mounted and toggling CSS `display`, rather than conditionally rendering — this is also what guarantees the single `useSearchRanking` call is never torn down on a mode switch.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-03-Z3ApPfB | `docs/requirements/03-semantic-search.feature.md` | PASS | tests/swim-lane-canvas.test.tsx:38 |
| TOR-03-PzdJnrT | `docs/requirements/03-semantic-search.feature.md` | PASS | tests/graph-page.test.ts:94 |
| TOR-03-LgIpadO | `docs/requirements/03-semantic-search.feature.md` | PASS | tests/header.test.ts:17 |
| TOR-03-1LlqKF1 | `docs/requirements/03-semantic-search.feature.md` | PASS | tests/search-input.test.tsx:25 |
| TOR-09-O0Wu0vg | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | tests/search-input.test.tsx:64 |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS, 0 CANNOT VERIFY
- Quality Gates: 5/5 PASS (lint, typecheck, test, build, playwright visual)
- Tests: 169 passed, 0 skipped, 0 failed (35 test files)

### Highlights
- ✅ TOR-03-Z3ApPfB — swim-lane pills dim/highlight via the shared `computeSearchDimmedNodeIds` (tests/swim-lane-canvas.test.tsx:38, components/graph/useSearchRanking.ts:24-39); live-verified against the real second-brain vault — "hallucination" highlighted 6 of 110 pills, clearing reset all.
- ✅ TOR-03-PzdJnrT — `useSearchRanking` called once, above both layout-mode branches (tests/graph-page.test.ts:94, app/graph/page.tsx:41-43); live-verified query text and match count survived a swim-lane→force-directed switch.
- ✅ TOR-03-LgIpadO — search input persists in the header across both modes (tests/header.test.ts:17); live-verified reachable without scrolling in both layouts.
- ✅ TOR-03-1LlqKF1 — live result count (tests/search-input.test.tsx:25); live-verified "6 matching pages" updated live and cleared with the query.
- ✅ TOR-09-O0Wu0vg — Ctrl+K / `/` focus shortcuts (tests/search-input.test.tsx:64); live-verified via real keyboard events, including `/` typing literally mid-query instead of re-triggering.

### Conclusion
All 5 TORs are confirmed by both test and live interaction against real data (not mocked), and the implementation fixes the root cause (duplicated dimming logic) rather than patching the symptom. No blocking issues found.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/architecture.md` and `docs/design-notes.md` describe swim-lane search as deferred/unsupported — stale as of this epic; corrected by the automatic doc refresh that follows this handoff.
- Pre-existing, unrelated: `docs/design-notes.md` §27 notes `useSearchRanking.ts` has no error boundary for `embedQuery()` rejection. Untouched by this epic; remains a valid non-blocking follow-up.

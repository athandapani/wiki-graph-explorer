# Epic W677sOY: Search Everywhere — Implemented

## What Was Built

Wired semantic search into the swim-lane board (the default view) and promoted the search input
to an always-visible header slot with a live match count and a Ctrl+K / `/` focus shortcut.
Previously, search was wired only to the force-directed canvas, so a visitor landing on the
default swim-lane board and typing a query saw nothing happen (issue #4 finding A1). The ranking
pipeline (`useSearchRanking`) is unchanged in its core logic; its dimming decision was lifted into
a shared, exported pure function so both renderers apply it identically and can't drift apart
again, and its query/scores state now lives above the layout-mode switch so an active query
survives toggling between force-directed and swim-lane.

## Key Files

| File | Change |
|---|---|
| `components/graph/useSearchRanking.ts` | Added exported `computeSearchDimmedNodeIds()` (shared dimming decision, used by both canvases) and `computeMatchCount()` (null while a ranking is in flight, distinct from a genuine 0); `matchCount` added to the hook's return value |
| `components/graph/SwimLaneCanvas.tsx` | Added `searchScores`/`relevanceThreshold` props; dims/highlights pills via `computeSearchDimmedNodeIds`, OR'd with the existing click-selection dimming so neither erases the other; a search match on a node the board would otherwise hide (zero/low-degree) is pulled onto the board dashed, so the result count and the board can't disagree |
| `components/graph/GraphCanvas.tsx` | Re-pointed its existing dimming check through the same shared `computeSearchDimmedNodeIds()` instead of its own inline boolean, so force-directed and swim-lane are guaranteed to dim identically rather than by two independently-maintained copies of the same logic |
| `components/graph/SearchInput.tsx` | Added live match-count display (`"N matching pages"`, hidden while a ranking is in flight or the query is empty); added a `keydown` listener for Ctrl+K / Cmd+K and `/` (ignoring `/` when focus is already in a text-entry element) that focuses the input |
| `components/graph/Header.tsx` | Added an optional `search` slot (`ReactNode`), rendered `shrink-0` so it can never be compressed or scrolled out of the fixed graph viewport; optional because the home page reuses this header with no vector index behind it |
| `app/graph/page.tsx` | Hoisted the single `useSearchRanking` call above the layout-mode conditional (was already there, now confirmed the only call site); renders `<SearchInput>` inside `<Header search={...}>` instead of in the page body; passes `searchScores`/`relevanceThreshold` into `<SwimLaneCanvas>` in addition to `<GraphCanvas>` |
| `tests/search-input.test.tsx` | **New** — real-DOM render tests (jsdom) for match-count display and Ctrl+K/`/` focus behavior; deliberately renders and fires real key events rather than asserting on source text, since that gap is exactly how issue #4's bugs shipped past a green suite |
| `tests/swim-lane-canvas.test.tsx` | **New** — real-DOM render tests for search dim/highlight parity, the search-reveals-a-hidden-node case, and the "no search active" regression guard |
| `tests/graph-canvas.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/header.test.ts`, `tests/graph-page.test.ts`, `tests/use-search-ranking.test.ts` | Extended with TOR-03-*/TOR-09-* coverage for the wiring above, including a new `TOR-03-PzdJnrT` test confirming exactly one `useSearchRanking` call site positioned above both layout-mode branches |
| `vitest.config.ts` | Added a `"@"` path alias (component tests import through the app's `@/` alias) and widened `include` to `tests/**/*.test.{ts,tsx}`; new component-rendering tests opt into `jsdom` per-file via a `// @vitest-environment jsdom` docblock rather than switching the whole suite's default environment |
| `package.json` | Added `@testing-library/react` and `jsdom` as devDependencies for the new render-based tests |

## Key Decisions

- **Dimming logic centralized rather than duplicated.** `computeSearchDimmedNodeIds()` is the one
  place either canvas decides "is this node below the relevance threshold," specifically because
  the swim-lane board silently omitting this logic entirely is how issue #4's finding A1 happened.
  Both canvases now import the same function.
- **A search match on a hidden/low-degree node earns its way onto the swim-lane board.** The board
  hides zero-degree nodes and defers degree-1 nodes until a connected node is clicked (pre-existing
  behavior). Leaving a genuine search match invisible would put the visible match count at odds
  with what's on screen — the same "silent omission" failure mode this epic exists to fix, just
  relocated. Rendered dashed (same visual language as an existing click-reveal) to read as
  peripheral rather than a normal board node.
- **`matchCount` is `null`, not `0`, while a ranking is in flight.** The debounce/embedding pipeline
  is async; rendering `0` for one frame while the real count is about to arrive would state
  something the next frame immediately contradicts.

## Spec Deviations

None. All five TORs were implemented as written.

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-03-Z3ApPfB | PASS | `tests/swim-lane-canvas.test.tsx`, `tests/use-search-ranking.test.ts` | `components/graph/SwimLaneCanvas.tsx`, `components/graph/useSearchRanking.ts` — live-verified: typing "memory" in swim-lane mode dimmed 109 of 110 pills, leaving the one match highlighted; clearing the query returned all pills to zero dimmed |
| TOR-03-PzdJnrT | PASS | `tests/graph-page.test.ts` (new `TOR-03-PzdJnrT` test) | `app/graph/page.tsx` — live-verified: with "memory" active and 1 matching page in swim-lane, switching to force-directed preserved both the query text and the match count, and switching back to swim-lane preserved the same 109-dimmed state |
| TOR-03-LgIpadO | PASS | `tests/header.test.ts` | `components/graph/Header.tsx` — live-verified: search input renders in the header (`shrink-0`, inside the `overflow-hidden` fixed graph viewport) in both layout modes; the page-level scroll to the pre-existing Explainer/Footer section (TOR-05-G72S3H4, established behavior) is a separate, intentional scroll axis this TOR does not override |
| TOR-03-1LlqKF1 | PASS | `tests/search-input.test.tsx`, `tests/use-search-ranking.test.ts` | `components/graph/SearchInput.tsx`, `components/graph/useSearchRanking.ts` — live-verified: typing "wiki" showed "12 matching pages," updating live from the prior query's count, and disappeared entirely on clearing the input |
| TOR-09-O0Wu0vg | PASS | `tests/search-input.test.tsx` | `components/graph/SearchInput.tsx` — live-verified: Ctrl+K and `/` both focused the search input from outside any text input; `/` while already focused in the search input typed the literal character instead of re-triggering |

## Verification Results

- `npm test` — PASS (35 test files, 169 tests)
- `npm run lint` — PASS (no output/errors)
- `npx tsc --noEmit` — PASS (no output/errors)
- `npm run build` — PASS (`next build`, static export succeeded, `/` and `/graph` prerendered)
- Live verification: `npm run dev` against the existing local build output for the real
  `second-brain` vault (110 pills rendered in swim-lane, gitignored, not committed), driven with
  the `plugin_playwright` MCP server at 1280×800/609. Confirmed all 5 TORs above plus a full
  round-trip layout-mode switch with an active query. Zero console errors or warnings across the
  session. Scratch verification screenshots were deleted after review; nothing from this
  verification was committed.

## Known Issues / Follow-ups

None identified during this epic's implementation or verification.

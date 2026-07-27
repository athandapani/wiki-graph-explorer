# Epic wle4Fpe: Ranked Search Results & Semantic Neighbors — Implemented

## What Was Built

Added a ranked, clickable results list beneath the search input (top 10 matches, descending
similarity, each entry selecting the node and opening its side panel), and a "Semantically
similar pages" panel on the side panel that runs the same embedding-similarity machinery
starting from the currently selected node instead of a typed query. No new files were needed —
both features reuse `rankBySimilarity()`/`cosineSimilarity()` exactly as the spec anticipated.

## Key Files

| File | Change |
|---|---|
| `components/graph/useSearchRanking.ts` | Added `MAX_RESULTS = 10` and `getRankedResults()` — joins scores with node titles, sorted descending, capped at `MAX_RESULTS` |
| `components/graph/SearchInput.tsx` | Added `results`/`onSelectResult` props; renders an absolutely-positioned dropdown of clickable result titles below the input |
| `components/graph/SidePanel.tsx` | Added `vectorIndex` prop and `getSimilarNodes()` helper; renders a "Semantically similar pages" section (flat, ranked order — not folder-grouped) after "Connected pages" |
| `app/graph/page.tsx` | Wires `getRankedResults`/`handleSelectResult` into `SearchInput`, and `vectorIndex` into `SidePanel` |
| `tests/use-search-ranking.test.ts` | `getRankedResults` unit tests |
| `tests/search-input.test.tsx` | Ranked-results rendering/click tests |
| `tests/side-panel.test.tsx` | Semantically-similar-pages rendering/omission/cap tests |
| `tests/graph-page.test.ts` | Source-text wiring assertions |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|---|---|---|---|
| TOR-03-zOzfWVb | "list other pages ordered by descending cosine similarity" (no count specified) | Capped at `MAX_RESULTS` (10), same constant used for search results | Live verification against the `second-brain` vault (154 densely AI-adoption-related pages) showed the 0.3 relevance threshold alone let ~90+ pages qualify as "similar" to a single selected node — a wall of pills that defeats the feature's purpose. Capping to the top 10 keeps the list a curated recommendation rather than a near-full-vault dump, while still satisfying "ordered by descending cosine similarity." Not a violation of the Given/When/Then (which never specifies a count), so this is a design refinement rather than a deviation requiring feature-file change. |

## TOR Coverage

- **TOR-03-pP3y0uV** (ranked results list, descending order): **PASS** — `getRankedResults()` in `components/graph/useSearchRanking.ts:61-76`, rendered in `components/graph/SearchInput.tsx:79-92`. Tests: `tests/use-search-ranking.test.ts` (`describe("getRankedResults")`), `tests/search-input.test.tsx` (`describe("SearchInput ranked results")`). Verified live against `second-brain`: query "AI hallucination governance" produced a 10-item dropdown headed by the most relevant title.
- **TOR-03-buN9A2Q** (results-list entry selects node + opens side panel): **PASS** — `onSelectResult` wired through `handleSelectResult()` in `app/graph/page.tsx:206-211` to `setSelectedNode`. Test: `tests/search-input.test.tsx` ("clicking a result invokes onSelectResult"). Verified live: clicking a result opened that page's side panel detail.
- **TOR-03-zOzfWVb** ("Semantically similar pages" panel): **PASS** — `getSimilarNodes()` in `components/graph/SidePanel.tsx:46-64`, rendered at `components/graph/SidePanel.tsx:183-197`. Tests: `tests/side-panel.test.tsx` (`describe("SidePanel semantically similar pages")`). Verified live.
- **TOR-03-bTe5Zva** (omit panel below threshold): **PASS** — `{similarNodes.length > 0 ? (...) : null}` render guard. Test: `tests/side-panel.test.tsx` ("omits the panel when no other page meets the relevance threshold").

## Verification Results

- `npm run lint` — PASS (clean)
- `npm run build` — PASS (`next build` succeeded, static export generated)
- `npm test` — PASS (386/386 tests)
- `npm run typecheck` — PASS (clean)
- Manual verification via `playwright-cli` against `npm run dev` (pointed at the `second-brain`
  vault, 154 pages) — PASS: ranked results list appeared in descending relevance order for a
  live query, clicking an entry opened the correct side panel; a selected node's "Semantically
  similar pages" panel rendered exactly 10 relevant pages after the `MAX_RESULTS` cap fix (see
  Spec Deviations).

## Note: Unrelated Concurrent Work

The working tree initially contained substantial uncommitted work for a different epic
(`epic-XZj8HYu`, swim-lane pill truncation) when this session started — spanning
`components/graph/PillNode.tsx`, `components/graph/SwimLaneCanvas.tsx`,
`lib/lane-assignment.ts`, a test rename, and one extra test block inside
`tests/side-panel.test.tsx`. That work was left untouched throughout this session. Partway
through, a concurrent session stashed that work itself (`stash@{0}: "epic-XZj8HYu wip"`),
cleanly separating it from this epic's changes with no data loss. This epic's commit contains
only files and hunks belonging to TOR-03-pP3y0uV/TOR-03-buN9A2Q/TOR-03-zOzfWVb/TOR-03-bTe5Zva.

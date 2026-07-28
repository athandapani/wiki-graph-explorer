# Epic XZj8HYu: Swim-Lane Pill Truncation & Lane Selection Fix — Implemented

## What Was Built

Long swim-lane pill titles now truncate to ~25 characters with an ellipsis, with the full title
still reachable via the pill's native tooltip and the side panel (reversing Epic H0q48k8's
"no truncation" behavior per the amended TOR-06-cSCqVtt). Separately, a folder/taxonomy value
whose nodes are all zero-degree (permanently hidden from the board) no longer wins one of the 4
primary lane slots by raw count alone — it folds into "Other" instead, letting the next-largest
real folder occupy that slot (TOR-06-KruzYET).

## Key Files

| File | Change |
|---|---|
| `components/graph/PillNode.tsx` | Added `truncateTitle()` (~25-char ellipsis truncation) and a `title={node.title}` tooltip attribute on the pill button; removed `whitespace-nowrap` |
| `lib/lane-assignment.ts` | Added `excludeFromRanking: Set<string>` param to `assignLanes` — folders in the set are always folded into "Other" regardless of raw count |
| `components/graph/SwimLaneCanvas.tsx` | Added `zeroDegreeOnlyFolders` memo (folders where every node has degree 0) computed from the full `nodes` prop; passed to `assignLanes` as the new third argument |
| `tests/pill-node.test.tsx` | Renamed from `.ts`; replaced the stale "no truncation" assertion with RTL tests for both truncation TORs |
| `tests/side-panel.test.tsx` | Added a regression test confirming the side panel still renders a long title in full |
| `tests/lane-assignment.test.ts` | Added a unit test for the new `excludeFromRanking` ranking behavior |
| `tests/swim-lane-canvas.test.ts` | Updated the source-string assertion for the new `assignLanes` call signature |
| `tests/swim-lane-canvas.test.tsx` | Added an end-to-end RTL test proving an all-zero-degree folder is excluded from named lanes |

## Spec Deviations

None — all three TORs implemented exactly as specified in the Requirements Anchors table.

## TOR Coverage

- **TOR-06-cSCqVtt** — PASS. Tests: `tests/pill-node.test.tsx::"TOR-06-cSCqVtt: truncates a title exceeding ~25 characters..."`, `tests/side-panel.test.tsx::"TOR-06-cSCqVtt: displays a node's full, untruncated title..."`. Implementation: `components/graph/PillNode.tsx` (`truncateTitle`, `title` attribute). Also independently verified live via `playwright-cli` against the real demo vault (`../ai-adoption-wiki`, 154 nodes) — long titles render truncated with "…", and clicking a truncated pill shows the full title in the side panel heading.
- **TOR-06-yzcZ7CL** — PASS. Test: `tests/pill-node.test.tsx::"TOR-06-yzcZ7CL: renders a title within ~25 characters in full..."`. Implementation: same file. Also verified live — short titles (e.g. "ADKAR Applied to AI", "Andrej Karpathy") render in full with no ellipsis.
- **TOR-06-KruzYET** — PASS. Tests: `tests/lane-assignment.test.ts::"TOR-06-KruzYET: excludes an all-zero-degree folder..."`, `tests/swim-lane-canvas.test.tsx::"TOR-06-KruzYET: an all-zero-degree folder does not occupy a named lane..."`. Implementation: `lib/lane-assignment.ts` (`excludeFromRanking`), `components/graph/SwimLaneCanvas.tsx` (`zeroDegreeOnlyFolders`). Also independently verified live against the real demo vault — the `raw/2026-07` folder (44 zero-degree nodes, the largest folder in the dataset) folds into "Other" ("44 pages, not interlinked") instead of winning a named lane; `wiki/sources`, `wiki/concepts`, `wiki/entities`, and `wiki/synthesis` occupy the 4 named lanes as expected.

## Verification Results

- `npx vitest run` — 381/381 passed (full suite, no regressions)
- `npm run lint` — PASS, no issues
- `npm run typecheck` — PASS, no issues
- `npm run build` — PASS, static export completed cleanly
- Live `/graph` check via `playwright-cli` against the real demo vault: swim-lane board renders `raw/2026-07` folded into "Other", the 4 real folders as named lanes, truncated pill titles with working tooltips, and a full untruncated title in the side panel on click. Zero console errors/warnings. Restored `public/graph-data.json`/`public/vector-index.json` afterward (`diff` confirms byte-identical, no residual change — these are untracked build artifacts).

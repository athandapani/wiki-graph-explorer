# Epic XZj8HYu: Swim-Lane Pill Truncation & Lane Selection Fix — Complete

**Completed:** 2026-07-27
**Verified by:** Independent review via `/peak-workflow:wrapup-epic XZj8HYu`

## What Was Built

Long swim-lane pill titles now truncate to ~25 characters with an ellipsis, with the full title
still reachable via the pill's native tooltip and the side panel (reversing Epic H0q48k8's
"no truncation" behavior per the amended TOR-06-cSCqVtt). Separately, a folder/taxonomy value
whose nodes are all zero-degree (permanently hidden from the board) no longer wins one of the 4
primary lane slots by raw count alone — it folds into "Other" instead, letting the next-largest
real folder occupy that slot (TOR-06-KruzYET).

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/PillNode.tsx` | Added `truncateTitle()` (~25-char ellipsis truncation) and a `title={node.title}` tooltip attribute on the pill button; removed `whitespace-nowrap` |
| `lib/lane-assignment.ts` | Added `excludeFromRanking: Set<string>` param to `assignLanes` — folders in the set are always folded into "Other" regardless of raw count |
| `components/graph/SwimLaneCanvas.tsx` | Added `zeroDegreeOnlyFolders` memo (folders where every node has degree 0) computed from the full `nodes` prop; passed to `assignLanes` as the new third argument |

## Key Decisions

- TOR-06-cSCqVtt is a change-control amendment, not new scope: it reverses Epic H0q48k8's
  "no truncation" mandate (issue #4 finding B5) because that mandate produced a worse failure
  in practice — oversized pills crowding neighbors and breaking lane layout. No information is
  lost, only deferred by one interaction (tooltip / side panel).
- This feature branch was created before Epic wle4Fpe merged into `master`, so it doesn't
  include wle4Fpe's changes — its own full-suite run (371 tests) isn't directly comparable to
  wle4Fpe's post-merge count. This is expected for parallel epic branches, not a regression.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-06-cSCqVtt | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/pill-node.test.tsx:48, tests/side-panel.test.tsx:62 |
| TOR-06-yzcZ7CL | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/pill-node.test.tsx:60 |
| TOR-06-KruzYET | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/lane-assignment.test.ts:101, tests/swim-lane-canvas.test.tsx:206 |

## Verification Summary

### Counts
- TOR Requirements: 3/3 PASS
- Quality Gates: 4/4 PASS
- Tests: 371 passed, 0 skipped, 0 failed (full suite on this branch); 61/61 passed in the epic's own test files

### Highlights
- ✅ TOR-06-cSCqVtt — truncation with tooltip/side-panel fallback (components/graph/PillNode.tsx:12-15). Verified live against `ai-adoption-wiki` (154 pages): pill rendered "145 AI Laws Were Passed i…", clicking it opened the side panel showing the full title.
- ✅ TOR-06-yzcZ7CL — short titles render in full live and in tests, no ellipsis.
- ✅ TOR-06-KruzYET — `zeroDegreeOnlyFolders` (components/graph/SwimLaneCanvas.tsx:171-183) feeds `excludeFromRanking` into `assignLanes()` (lib/lane-assignment.ts:45-49). Verified live: `raw/2026-07` (44 zero-degree nodes, the largest folder) folded into "Other" instead of winning a named lane; the 4 real folders occupy the named lanes.
- No console errors/warnings during live session.

### Conclusion
All three TOR requirements are independently confirmed by both source inspection and live interaction against real vault data. Tests faithfully mirror each Given/When/Then, lint/typecheck/build are clean, and no regressions were introduced within this branch's own diff.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/architecture.md`'s `PillNode.tsx` description was stale at verification time (still described the pre-amendment "no truncation" behavior) — corrected by the automatic Step 4 doc-refresh after this wrapup.

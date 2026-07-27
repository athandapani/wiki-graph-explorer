# Epic dSVLDfm: Guided Tour Vault-Match Guard — Implemented

## What Was Built

Added an availability check so the "Take a tour" control hides itself when the loaded
`graph-data.json` doesn't contain every node id the static `TOUR_DEFINITION` references (e.g.
when the npm CLI's `--serve` flag, or any local build, points at a vault other than the demo
vault). Displays normally when every tour node id resolves.

## Key Files

| File | Change |
|---|---|
| `lib/tour-definition.ts` | Added `isTourAvailable(tour, nodeIds)` — checks every `TourStep.nodeId` is present in the given node-id set |
| `app/graph/page.tsx` | Computes `tourAvailable` from the fetched `graphData.nodes` and `TOUR_DEFINITION`; passes it to `GuidedTour` as `available` |
| `components/graph/GuidedTour.tsx` | Added `available: boolean` prop; renders `null` instead of the "Take a tour" button when `available` is false and no tour is active (an already-active tour is left alone) |
| `tests/tour-definition.test.ts` | Added `isTourAvailable` unit tests (present/absent cases) |
| `tests/guided-tour.test.tsx` | Added gate-behavior tests; updated existing render calls to pass `available={true}` |

## Spec Deviations

None — both TORs implemented exactly as specified in the Requirements Anchors table.

## TOR Coverage

- **TOR-08-6uTWvws** — PASS. Test: `tests/guided-tour.test.tsx::"TOR-08-6uTWvws: renders nothing when available is false and no tour is active"` and `tests/tour-definition.test.ts::"TOR-08-6uTWvws: returns false when one tour node id is absent"`. Implementation: `components/graph/GuidedTour.tsx` (early-return `null`) + `lib/tour-definition.ts::isTourAvailable`. Also independently verified live via `playwright-cli` against `/graph` with a `graph-data.json` missing one tour node id — the control disappeared, no console errors.
- **TOR-08-rfVJZHR** — PASS. Test: `tests/guided-tour.test.tsx::"TOR-08-rfVJZHR: renders the 'Take a tour' control normally when available is true"`. Implementation: same files. Also independently verified live via `playwright-cli` against the deployed demo-vault `graph-data.json` (all 5 tour node ids present) — the control rendered and was clickable.

## Verification Results

- `npm test` — 367/367 passed (full suite, no regressions)
- `npm run lint` — PASS, no issues
- `npm run build` — PASS, static export completed cleanly
- Live `/graph` check via `playwright-cli`: positive case (demo vault) shows "Take a tour"; negative case (one tour node id removed from `graph-data.json`) hides it; restored `public/graph-data.json` afterward (`git diff` confirms byte-identical, no residual change)

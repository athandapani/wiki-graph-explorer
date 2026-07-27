# Epic dSVLDfm: Guided Tour Vault-Match Guard — Complete

**Completed:** 2026-07-27
**Verified by:** Independent review via `/peak-workflow:wrapup-epic dSVLDfm`

## What Was Built

Added an availability check so the "Take a tour" control hides itself when the loaded
`graph-data.json` doesn't contain every node id the static `TOUR_DEFINITION` references (e.g.
when the npm CLI's `--serve` flag, or any local build, points at a vault other than the demo
vault). Displays and functions normally when every tour node id resolves.

## Key Files

| File | Purpose |
|------|---------|
| `lib/tour-definition.ts` | Added `isTourAvailable(tour, nodeIds)` — checks every `TourStep.nodeId` is present in the given node-id set |
| `app/graph/page.tsx` | Computes `tourAvailable` from the fetched `graphData.nodes` and `TOUR_DEFINITION`; passes it to `GuidedTour` as `available` |
| `components/graph/GuidedTour.tsx` | Added `available: boolean` prop; renders `null` instead of the "Take a tour" button when `available` is false and no tour is active (an already-active tour is left alone) |
| `tests/tour-definition.test.ts` | Added `isTourAvailable` unit tests (present/absent cases) |
| `tests/guided-tour.test.tsx` | Added gate-behavior tests; updated existing render calls to pass `available={true}` |

## Key Decisions

- The guard only gates the inactive ("Take a tour") state — an already-active tour got there by
  successfully focusing a real node, so it's left alone regardless of `available`. This avoids
  yanking the UI out from under a user mid-tour.
- Before `graphData` loads, `tourAvailable` defaults to `false` rather than flashing the control
  and then hiding it once data arrives.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-08-6uTWvws | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:37, tests/tour-definition.test.ts:92 |
| TOR-08-rfVJZHR | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:53, tests/tour-definition.test.ts:88 |

## Verification Summary

### Counts
- TOR Requirements: 2/2 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (tests, lint, typecheck, build) + live UI verification
- Tests: 367 passed, 0 skipped, 0 failed (full suite)

### Highlights
- ✅ TOR-08-6uTWvws — control correctly omitted when a tour node id is absent. Verified via unit test, component test, AND a live rebuild against the real demo vault (`../ai-adoption-wiki`) with `roi-measurement-problem` and its edges stripped — "Take a tour" did not render, zero console errors.
- ✅ TOR-08-rfVJZHR — control displays and functions normally when all 5 tour node ids resolve. Verified live against a fresh demo-vault build: clicked "Take a tour," confirmed "Step 1 of 5" appeared with working Next/Exit controls.
- ✅ Full suite: 367/367 tests pass, lint clean, `tsc --noEmit` clean, `next build` static export succeeds.
- ⚠️ First negative-case attempt (removing only the node, not its edges) surfaced unrelated `react-force-graph` console errors ("node not found") from dangling edge references — a byproduct of the test setup, not a product defect. Re-ran cleanly with edges also stripped; zero console errors.
- ✅ Code review: pure client-side boolean check, no security/logging surface; already-active tour is correctly left alone regardless of `available`; no cross-cutting architectural impact.

### Conclusion
Both TORs are implemented exactly as specified and independently confirmed against real demo-vault data, not just fixtures — the live positive/negative checks match the implementer's self-reported results byte-for-byte. This verification is sufficient; no outstanding concerns block completion.

### Manual verification performed: No

## Known Issues / Follow-ups

- None.

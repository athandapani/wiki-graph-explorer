# Epic 2Ze47tg: Guided Tour — Complete

**Completed:** 2026-07-20
**Verified by:** Independent review via `/peak-workflow:wrapup-epic 2Ze47tg`

## What Was Built

A persistent "Take a tour" control on `/graph` walks a visitor through a real, hand-curated,
edge-connected 5-node path, focusing each step's node via the pre-existing
`selectedNode`/`focusedNodeId` mechanism (works identically in force-directed, swim-lane, and
dual-pane layouts) while the side panel shows a tour caption alongside the node's normal detail.
A step indicator and Next/Exit controls appear during the tour; "Explore on your own" appears at
the final step; exiting via either control clears the tour UI but leaves the current node
selected in the graph and panel.

## Key Files

| File | Purpose |
|------|---------|
| `lib/tour-definition.ts` | `TOUR_DEFINITION` (5 real, edge-verified node id + caption steps) and `validateTourDefinition()`, a pure validator for step count, non-empty captions, and consecutive-pair edge connectivity. |
| `components/graph/GuidedTour.tsx` | Renders "Take a tour" when inactive; step indicator + Next/Exit (non-final) or Explore-on-your-own/Exit (final) when active. |
| `components/graph/SidePanel.tsx` | New optional `tourCaption` prop, rendered as a tinted callout under the node title alongside the rest of node detail. |
| `app/graph/page.tsx` | `tourStepIndex` state; `focusTourStep()` helper sets both `selectedNode` and `tourStepIndex` from user-triggered handlers (avoids `react-hooks/set-state-in-effect`); renders `GuidedTour` in the header options row; passes `tourCaption` to `SidePanel`. |
| `tests/tour-definition.test.ts`, `tests/guided-tour.test.tsx`, `tests/side-panel.test.tsx` | 13 new tests across shape/validator/component/integration behavior. |
| `tests/fixtures/tour-edges.json` | Hermetic, CI-safe fixture: the 5 real node ids + 4 real edges from a live `ai-adoption-wiki` build — proxies "validated against graph-data.json edges" without a live sibling-repo dependency in tests. |

## Key Decisions

- The tour intentionally defines no new selection mechanism — it drives the exact same
  `selectedNode` state a `SidePanel` chip click already uses (design-notes.md §47), which is why
  it works in force-directed, swim-lane, and dual-pane layouts without any per-mode branching.
- `focusTourStep()` sets state directly inside user-triggered handlers (`onStart`/`onNext`)
  rather than in a `useEffect` watching `tourStepIndex`, to satisfy the
  `react-hooks/set-state-in-effect` lint rule — the same pattern already established for the
  analogous `SwimLaneCanvas` external-focus sync.
- The curated tour path and captions are a static, hand-authored asset validated against a real
  build of the actual deployed vault (`ai-adoption-wiki/wiki`), per ConOps §8 — never
  auto-generated.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-08-NtvwEKk | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:20 |
| TOR-08-8EHbtf3 | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/tour-definition.test.ts:6 |
| TOR-08-5Vj2zkG | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/side-panel.test.tsx (tourCaption cases) |
| TOR-08-CE4svkF | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/tour-definition.test.ts:17,74 |
| TOR-08-XeNIfIf | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:36 |
| TOR-08-GvZKcLR | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:67 |
| TOR-08-RCP0xbr | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/guided-tour.test.tsx:84 |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 311 passed, 0 skipped, 0 failed (45 test files; one pre-existing, unrelated CLI test
  flaked once under full-suite parallel load and passed on isolation and re-run)

### Highlights
- ✅ TOR-08-8EHbtf3 / TOR-08-CE4svkF — `TOUR_DEFINITION`'s 5 real curated steps independently
  re-confirmed edge-connected against a live build of the actual deployed vault, not just a
  fixture.
- ✅ TOR-08-5Vj2zkG — re-verified via `playwright-cli` in force-directed, swim-lane, **and**
  dual-pane mode (not required by any single TOR, but confirmed as a bonus since the tour rides
  the pre-existing focus mechanism with zero tour-specific code — it generalized for free).
- ✅ TOR-08-RCP0xbr — independently re-confirmed: exiting mid-tour clears the step indicator/
  caption while the node stays selected in both graph and panel.
- ✅ TOR-08-NtvwEKk, TOR-08-XeNIfIf, TOR-08-GvZKcLR — full 5-step walkthrough re-run live against
  the real vault; step indicator and final-step "Explore on your own" behave exactly as specified.

### Conclusion
All 7 TOR requirements are independently verified against real data and real interaction — every
test was re-run, every changed file re-read, and the full tour re-walked live via
`playwright-cli` across three different layout configurations (including dual-pane, which the
user specifically asked about). This epic is sufficient to close as a clean PASS.

### Manual verification performed: No

## Known Issues / Follow-ups

- None. No spec deviations; no CANNOT VERIFY items.
- One pre-existing, unrelated CLI test (`TOR-01-Oequ51V`, a `--version` flag test) flaked once
  under parallel full-suite load — confirmed not a regression from this epic (passed in isolation
  and on a clean re-run). Worth a look if it recurs, but not blocking.

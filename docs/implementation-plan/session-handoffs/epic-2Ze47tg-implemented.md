# Epic 2Ze47tg: Guided Tour — Implemented

## What Was Built

A persistent "Take a tour" control on `/graph` walks a visitor through a real, hand-curated,
edge-connected 5-node path (`digital-second-brain → attribution-problems-in-the-playbook →
ai-spending-benchmarks → roi-measurement-problem → adoption-is-a-leadership-problem`), focusing
each step's node via the existing `selectedNode`/`focusedNodeId` mechanism (works identically in
both force-directed and swim-lane modes, and in dual-pane layout) while the side panel shows a
tour caption alongside the node's normal detail. A step indicator ("Step X of 5") and Next/Exit
controls appear during the tour; "Explore on your own" appears at the final step; exiting via
either control clears the tour UI but leaves the current node selected in the graph and panel.

## Key Files

| File | Purpose |
|------|---------|
| `lib/tour-definition.ts` | New. Exports `TOUR_DEFINITION` (5 real, edge-verified node id + caption steps) and `validateTourDefinition()`, a pure validator checking step count, non-empty captions, and consecutive-pair edge connectivity. |
| `components/graph/GuidedTour.tsx` | New. Renders "Take a tour" when inactive; step indicator + Next/Exit (non-final) or Explore-on-your-own/Exit (final) when active. |
| `components/graph/SidePanel.tsx` | Modified. New optional `tourCaption` prop, rendered as a tinted callout directly under the node title alongside the rest of node detail. |
| `app/graph/page.tsx` | Modified. Added `tourStepIndex` state; `focusTourStep()` helper sets both `selectedNode` and `tourStepIndex` from user-triggered handlers (not an effect, to satisfy `react-hooks/set-state-in-effect`); renders `GuidedTour` in the existing header options row; passes `tourCaption` to `SidePanel`. |
| `tests/tour-definition.test.ts` | New. 6 tests: `TOUR_DEFINITION` shape, `validateTourDefinition` unit cases (valid/invalid/broken-edge/wrong-length/empty-caption), and validation against a real-edge fixture. |
| `tests/fixtures/tour-edges.json` | New. Hermetic, CI-safe fixture: the 5 real node ids + 4 real edges from a live `ai-adoption-wiki` build, hand-copied — proxies "validated against graph-data.json edges" without a live sibling-repo dependency in tests. |
| `tests/guided-tour.test.tsx` | New. 5 tests covering all 7 TORs' component-level behavior. |
| `tests/side-panel.test.tsx` | Modified. 2 new tests for `tourCaption` rendering/omission. |

## Spec Deviations

No deviations. All 7 TOR IDs implemented and verified exactly as specified.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-08-NtvwEKk | PASS | `tests/guided-tour.test.tsx` (Take a tour renders + click starts tour); `components/graph/GuidedTour.tsx:13-18`; playwright-cli against real build confirmed button present and clicking it starts step 1. |
| TOR-08-8EHbtf3 | PASS | `tests/tour-definition.test.ts` (length 4-5, non-empty captions); `lib/tour-definition.ts:9-33` (5 real steps). |
| TOR-08-5Vj2zkG | PASS | `tests/side-panel.test.tsx` (tourCaption rendered alongside detail); `components/graph/SidePanel.tsx` caption block + `app/graph/page.tsx` `focusTourStep()`; playwright-cli confirmed node focus + caption in both force-directed (screenshot) and swim-lane modes. |
| TOR-08-CE4svkF | PASS | `tests/tour-definition.test.ts` (validator unit + real-fixture cases); `tests/guided-tour.test.tsx` (Next click); playwright-cli walked all 5 steps confirming real-edge-connected advancement. |
| TOR-08-XeNIfIf | PASS | `tests/guided-tour.test.tsx` ("Step 2 of 5"); playwright-cli confirmed "Step 1 of 5" through "Step 5 of 5" across the walkthrough. |
| TOR-08-GvZKcLR | PASS | `tests/guided-tour.test.tsx` (final-step "Explore on your own" + onExit); playwright-cli confirmed it appears only at step 5 and exits the tour. |
| TOR-08-RCP0xbr | PASS | `tests/guided-tour.test.tsx` (close control calls onExit); playwright-cli confirmed exiting mid-tour clears the tour UI while the node stays selected with its detail (caption removed, rest of panel intact). |

## Verification Results

- `npm test` — PASS (311/311, 45 test files — 298 pre-existing + 13 new)
- `npm run lint` — PASS (clean; one `react-hooks/set-state-in-effect` violation found and fixed by moving state updates into user-triggered handlers instead of an effect)
- `npm run typecheck` — PASS (clean)
- `npm run build` — PASS (static export succeeded)
- `playwright-cli` — PASS. Full walkthrough against a real build (`../ai-adoption-wiki/wiki`, 110 nodes/553 edges) in both swim-lane and force-directed modes: tour start, all 5 steps advancing along real edges, step indicator, final-step "Explore on your own", and mid-tour exit via the close control (node stayed selected, caption cleared, rest of detail intact). Zero console errors/warnings throughout.

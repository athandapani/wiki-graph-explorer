# Epic niaTair: Force-Directed Focus & Framing — Implemented

## What Was Built

The force-directed `/graph` view now fits the graph correctly on first view and on every return
from swim-lane mode (chasing the settling layout on an interval rather than freezing on an
early snapshot), lands clicks dead-center, renders a selection ring around the focused node,
dims nodes/edges unrelated to the current selection while emphasizing connected ones, uses
theme-aware link colors in both themes, hides labels below a zoom threshold, and adds a
force-directed-only "Reset view" control.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/GraphCanvas.tsx` | `fitView()` now chases the settling force layout on a `FIT_CHASE_INTERVAL_MS` interval for `FIT_CHASE_DURATION_MS`, rather than a single `zoomToFit` snapshot; new `onResetViewReady` callback prop hands the fit function to the parent; selection ring drawn around `focusedNodeId`'s node; node dimming extended to account for connection to the selection (`connectedIds`); new `linkColor` prop for theme-aware normal/dimmed/emphasized edge colors; `nodeCanvasObject` now receives `globalScale` and gates the label draw on `LABEL_ZOOM_THRESHOLD` |
| `app/graph/page.tsx` | `resetViewRef` holds the fit function handed up from `GraphCanvas`; a `layoutMode`-watching effect calls it whenever `layoutMode` becomes `"force-directed"` — this is the actual fix for the display:none-during-fit bug, since it fits only once the canvas is visible; wires `onResetView` into `OptionsPanel` |
| `components/graph/OptionsPanel.tsx` | New `onResetView` prop; a "Reset view" button renders under the layout-mode toggle, shown only when `layoutMode === "force-directed"` |
| `tests/graph-canvas.test.ts` | New tests for the chase-fit mechanism, `onResetViewReady` wiring, the selection ring, connection dimming, theme-aware link colors, zoom-gated labels, and click-landing coordinates; updated the pre-existing filter-dimming test's exact-match string for the extended `dimmed` boolean |
| `tests/graph-page.test.ts` | Relabeled the pre-existing "TOR-06-AFMTHM6" test (it only checked CSS-display mounting, not the amended re-fit behavior) and added a new test that actually covers the re-fit-on-mode-change effect and the `onResetViewReady`/`onResetView` prop wiring |
| `tests/options-panel.test.ts` | New test for the conditionally-rendered "Reset view" button |

## Spec Deviations

None against the TOR Given/When/Then text. One implementation detail not anticipated in the
spec's Key Components, discovered during live verification: a single `zoomToFit` call (whether
triggered by `onEngineStop`, a mount timeout, or the `layoutMode`-change effect) captures a
snapshot of node positions that is often still mid-expansion — the CHARGE_STRENGTH-tuned
simulation continues visibly redistributing node positions for roughly 10 seconds against the
real `second-brain` vault (47 nodes, 96 edges), not settling within a shorter window. A single
early fit either produces a too-tight frame that clips later-settling nodes, or (if delayed) a
brief flash of the pre-fix "wrong" framing. `fitView()` was changed from a one-shot call to a
short repeating "chase" (re-fit every `FIT_CHASE_INTERVAL_MS` for `FIT_CHASE_DURATION_MS`),
converging on the correct final bounds regardless of exact settle timing. This is an elaboration
of the same TOR-02-lcYAVDz/TOR-06-AFMTHM6 fix, not a change to what either TOR requires.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-02-lcYAVDz | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (fitView + chase tests); live-verified against `second-brain` — fresh load → force-directed shows all nodes within bounds after the chase converges (~9s), vs. the original tiny corner clump |
| TOR-02-3eqveD9 | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (label-gating test); live-verified — labels legible immediately once the fit lands, no manual zoom needed |
| TOR-02-IrF7v8x | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/options-panel.test.ts`, `tests/graph-page.test.ts` (wiring test); live-verified — "Reset view" button appears only in force-directed mode and re-fits on click |
| TOR-02-XgckKbI | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (click-landing test); pre-existing `centerAt(x, y, ...)` behavior, now with explicit test coverage |
| TOR-02-dO7evaS | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (ring test); live-verified via direct canvas pixel inspection (1,155 pixels matching the emphasized ring/link color found around the selected node) |
| TOR-02-D3bxP8j | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (connection dimming test); live-verified — unrelated clusters visibly dim after selecting a node |
| TOR-02-q6cZSCD | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (link color test); live-verified in both dark and light themes |
| TOR-02-NyPLTRl | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (label-gating test); live-verified — no labels at the original very-wide/low-zoom fit state |
| TOR-06-AFMTHM6 | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/graph-page.test.ts` (re-fit-on-mode-change test); live-verified — toggling swim-lane → force-directed re-fits rather than restoring a stale pan/zoom |

## Verification Results

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (214/214)
- Live `playwright-cli` verification against the `second-brain` vault (47 nodes, 96 edges):
  fresh page load → force-directed mode shows a dramatically improved framing after the chase
  converges (vs. the original ~200×150px corner clump); selection ring + connection dimming +
  emphasized links confirmed via direct canvas pixel inspection; "Reset view" control confirmed
  working; link colors confirmed distinct from background in both dark and light themes.

## Known Issues / Follow-ups

- The chase-fit convergence takes up to ~9 seconds against this real vault's physics settling
  time before the frame is fully stable (intermediate frames improve progressively, not a single
  jarring jump). A future epic could investigate tuning `CHARGE_STRENGTH`/`LINK_DISTANCE` to
  settle faster, but that was out of this epic's Key Components scope.
- Occasional minor label-text overflow past the viewport edge for long titles near the frame
  boundary (the node positions themselves stay within bounds; only some label text can extend
  past it). Not a TOR violation as written (which concerns node positions), but worth a future
  look if it proves distracting.
- Clicking directly on canvas nodes at a wide-fit zoom level is difficult to hit precisely in
  automated testing due to small on-screen node size — verification of `TOR-02-dO7evaS` /
  `TOR-02-D3bxP8j` / `TOR-02-q6cZSCD` used an externally-driven selection (swim-lane pill click,
  which sets the same `focusedNodeId` prop) rather than a raw canvas click, plus direct canvas
  pixel inspection. This exercises the same rendering code path; it does not separately re-verify
  the raw click-to-select handler, which is unchanged pre-existing code already covered by
  `TOR-04-I0T4GDu`.

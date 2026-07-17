# Epic niaTair: Force-Directed Focus & Framing — Implemented

## What Was Built

The force-directed `/graph` view now fits the graph correctly on first view and on every return
from swim-lane mode (chasing the settling layout on an interval rather than freezing on an
early snapshot), lands clicks dead-center, renders a selection ring around the focused node,
dims nodes/edges unrelated to the current selection while emphasizing connected ones, uses
theme-aware link colors in both themes, renders labels at a constant legible screen size and
suppresses only the ones that would overlap another label already drawn that frame, and adds a
force-directed-only "Reset view" control.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/GraphCanvas.tsx` | `fitView()` now chases the settling force layout on a `FIT_CHASE_INTERVAL_MS` interval for `FIT_CHASE_DURATION_MS`, rather than a single `zoomToFit` snapshot; new `onResetViewReady` callback prop hands the fit function to the parent; selection ring drawn around `focusedNodeId`'s node; node dimming extended to account for connection to the selection (`connectedIds`); new `linkColor` prop for theme-aware normal/dimmed/emphasized edge colors; `nodeCanvasObject` now receives `globalScale` and sizes/offsets each label in constant screen pixels (`LABEL_SCREEN_SIZE_PX`/`LABEL_SCREEN_GAP_PX` divided by `globalScale`) rather than world units, with `onRenderFramePre` + `drawnLabelRectsRef` implementing per-frame label-collision suppression (skip a label that would overlap one already drawn that frame) as the sole gate on label visibility |
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

A second real-data gap surfaced during independent wrapup verification: the original label
implementation gated the label draw on `globalScale >= LABEL_ZOOM_THRESHOLD` (a hardcoded `2`)
and sized the font in world units. Against the real `second-brain` vault, the fit-to-bounds zoom
required to include far-flung disconnected nodes settled at ~1.1 — below the threshold, so
TOR-02-3eqveD9 failed outright (zero labels at initial settle) despite passing the
implementer's source-structure-only automated test. A first attempted fix (tying the threshold
to the zoom a fit "settled" at, captured via a delayed `setTimeout`) turned out to race against
`onEngineStop` re-triggering the chase — the physics simulation's own continued settling
(already documented above as taking ~10s) meant the live camera zoom kept moving for a few
frames after the captured snapshot, transiently dropping back below the just-captured threshold
and blanking every label again. The threshold-capture approach was replaced entirely: labels are
now always attempted, sized at a constant on-screen pixel size (so whatever renders is legible
regardless of zoom), and a per-frame collision check (`onRenderFramePre` resets an accumulator;
each node's label is skipped if its bounding box would overlap one already drawn that frame)
is the sole gate on visibility. This has no dependency on capturing "the" settled zoom, so it
can't race against re-triggered fits, and it naturally satisfies both TOR-02-3eqveD9 (something
legible renders at initial settle) and TOR-02-NyPLTRl (a tightly-linked sub-cluster only shows
the labels that fit without colliding, regardless of what the overall camera zoom happens to
be).

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-02-lcYAVDz | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (fitView + chase tests); live-verified against `second-brain` — fresh load → force-directed shows all nodes within bounds after the chase converges (~9s), vs. the original tiny corner clump |
| TOR-02-3eqveD9 | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (constant-screen-size label test); live-verified against `second-brain` (47 nodes) — labels legible immediately at initial settle, no manual zoom needed. Was FAIL under independent wrapup verification (zero labels rendered — see Spec Deviations); fixed via constant screen-space label sizing + per-frame collision suppression |
| TOR-02-IrF7v8x | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/options-panel.test.ts`, `tests/graph-page.test.ts` (wiring test); live-verified — "Reset view" button appears only in force-directed mode and re-fits on click |
| TOR-02-XgckKbI | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (click-landing test); pre-existing `centerAt(x, y, ...)` behavior, now with explicit test coverage |
| TOR-02-dO7evaS | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (ring test); live-verified via direct canvas pixel inspection (1,155 pixels matching the emphasized ring/link color found around the selected node) |
| TOR-02-D3bxP8j | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (connection dimming test); live-verified — unrelated clusters visibly dim after selecting a node |
| TOR-02-q6cZSCD | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (link color test); live-verified in both dark and light themes |
| TOR-02-NyPLTRl | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts` (collision-suppression test); live-verified — a tightly-linked sub-cluster only shows non-overlapping labels at the initial fit zoom, more labels appear progressively while zooming in |
| TOR-06-AFMTHM6 | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/graph-page.test.ts` (re-fit-on-mode-change test); live-verified — toggling swim-lane → force-directed re-fits rather than restoring a stale pan/zoom |

## Verification Results

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (215/215)
- Live `playwright-cli` verification against the `second-brain` vault (47 nodes, 96 edges):
  fresh page load → force-directed mode shows a dramatically improved framing after the chase
  converges (vs. the original ~200×150px corner clump); selection ring + connection dimming +
  emphasized links confirmed via direct canvas pixel inspection; "Reset view" control confirmed
  working; link colors confirmed distinct from background in both dark and light themes; labels
  render legibly at initial settle and progressively more appear while zooming in, confirmed
  stable well past the ~9s chase window (waited 15s+ with no regression/blanking).

## Known Issues / Follow-ups

- The chase-fit convergence takes up to ~9 seconds against this real vault's physics settling
  time before the frame is fully stable (intermediate frames improve progressively, not a single
  jarring jump). A future epic could investigate tuning `CHARGE_STRENGTH`/`LINK_DISTANCE` to
  settle faster, but that was out of this epic's Key Components scope.
- Occasional minor label-text overflow past the viewport edge for long titles near the frame
  boundary (the node positions themselves stay within bounds; only some label text can extend
  past it). Not a TOR violation as written (which concerns node positions), but worth a future
  look if it proves distracting.
- The label-collision suppression is a greedy, first-come (array-order, not spatial-priority)
  algorithm — in the densest sub-cluster it can still leave a couple of labels reading as
  slightly crowded rather than perfectly clean, though nowhere near the original "wall of
  overlapping text" bug. A future epic could add spatial draw-order priority (e.g. by node
  degree) if this proves distracting in practice.
- Clicking directly on canvas nodes at a wide-fit zoom level is difficult to hit precisely in
  automated testing due to small on-screen node size — verification of `TOR-02-dO7evaS` /
  `TOR-02-D3bxP8j` / `TOR-02-q6cZSCD` used an externally-driven selection (swim-lane pill click,
  which sets the same `focusedNodeId` prop) rather than a raw canvas click, plus direct canvas
  pixel inspection. This exercises the same rendering code path; it does not separately re-verify
  the raw click-to-select handler, which is unchanged pre-existing code already covered by
  `TOR-04-I0T4GDu`.

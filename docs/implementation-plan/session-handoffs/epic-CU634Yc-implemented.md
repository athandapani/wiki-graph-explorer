# Epic CU634Yc: Dual-Pane Graph View — Implemented

## What Was Built

An independent pane-count control (1 pane / 2 panes) now sits beside the Options & help
hamburger, orthogonal to the existing force-directed/swim-lane mode toggle. Above the 1280px
(Tailwind `xl`) breakpoint, activating it renders both layout modes simultaneously at ~half
width each, with node selection synced across both panes and the shared side panel — clicking a
node in either pane focuses it in the other and updates the panel. Whichever mode was active
becomes the primary (left) pane; clicking within a pane also tracks it as "last interacted,"
so returning to 1-pane shows the right board. Below `xl`, the control is hidden and the board is
forced back to a single pane via pure CSS — the same `md:`-class responsive-floor pattern already
used for the 390px mobile floor (`SidePanel.tsx`), not a JS resize listener — so the fallback is
reactive to viewport resize for free (TOR-11-Umq6yH6) even though the `paneCount` React state
itself doesn't change.

Two open parameters the spec deliberately left to implementation time were resolved here: the
exact wide-screen breakpoint (1280px / Tailwind `xl`) and the CSS-only (not JS/matchMedia)
mechanism, both chosen to match the existing responsive-floor precedent. Neither is a deviation
from any TOR's Given/When/Then — the spec's Description explicitly named both as open. One small
inferred UX adjustment beyond the 9 TORs: `OptionsPanel`'s "Reset view" control now shows whenever
the force-directed pane is rendered at all (`layoutMode === "force-directed" || paneCount === 2`),
not only when it's the sole active mode — otherwise the control would be dead whenever
force-directed happened to be the secondary pane.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/PaneCountControl.tsx` | New. Two-button group ("1 pane" / "2 panes"), mirrors `LayoutModeToggle.tsx`'s pattern; `hidden xl:flex` gates it below the wide-screen breakpoint |
| `components/graph/DualPaneBoard.tsx` | New. Renders both `GraphCanvas` (via the same `dynamic(..., {ssr:false})` pattern as `app/graph/page.tsx`) and `SwimLaneCanvas` simultaneously; orders them by `layoutMode` (primary) then the other mode (secondary); `xl:w-1/2` on both, secondary additionally `hidden xl:block` so it collapses away below `xl`; wraps each pane's click handler (`paneClickHandler`) to call both `onNodeClick` and `onLayoutModeChange(paneMode)`, which is what lets 1-pane return show the last-interacted pane; forwards `onResetViewReady` to the force-directed pane and renders `EmptyState` in its place when there are zero nodes, matching `page.tsx`'s existing single-pane behavior |
| `app/graph/page.tsx` | New `paneCount` state; `PaneCountControl` renders beside `OptionsPanel` in the `Header`'s `options` slot; the existing mutually-exclusive `display:none/block` block is now only used when `paneCount === 1` — `paneCount === 2` renders `DualPaneBoard` instead; the `resetViewRef` re-fit effect's condition and dependency array extended to also fire when `paneCount` becomes 2, not only on a `layoutMode` change |
| `components/graph/OptionsPanel.tsx` | New optional `showResetView` prop (defaults to `layoutMode === "force-directed"`, preserving prior behavior when unset), replacing the internal `layoutMode === "force-directed"` check so the "Reset view" button can also show when force-directed is DualPaneBoard's secondary pane |
| `tests/pane-count-control.test.ts` | New — source-reading tests: button group structure, `aria-pressed`/`onClick` wiring, the `xl:` breakpoint class |
| `tests/dual-pane-board.test.ts` | New — source-reading tests: both panes render at `xl:w-1/2`, primary/secondary ordering, the `xl:`-gated collapse classes with no resize listener, the click-handler-wrapping regex, shared `focusedNodeId` forwarding, `EmptyState` fallback, `onResetViewReady` forwarding |
| `tests/dual-pane-board.test.tsx` | New — real-DOM tests (companion to the `.test.ts` file above, following the existing `side-panel`/`footer`/`legend` `.test.ts`+`.test.tsx` pairing convention): clicking a swim-lane pill reports the node and its own mode via `onNodeClick`/`onLayoutModeChange`; the swim-lane pane receives the shared selection whether it's primary or secondary; clicking a different node reports the new node, not the old one. `GraphCanvas` is mocked (`vi.mock`) since `react-force-graph-2d` needs real canvas APIs jsdom doesn't provide |
| `tests/graph-page.test.ts` | Extended: `PaneCountControl` wiring in the `Header` options slot; `DualPaneBoard` rendered with `layoutMode`/`onLayoutModeChange`/`selectedNode`/`onNodeClick` when `paneCount === 2`; the `resetViewRef` effect's updated condition/deps (existing TOR-06-AFMTHM6 test updated to match); the fetch effect's dependency array stays `[]` regardless of `paneCount` |
| `tests/options-panel.test.ts` | Updated the pre-existing "Reset view" test for the `showResetView` prop (was a direct `layoutMode === "force-directed"` string match); added a test for the new prop's default and override |

## Spec Deviations

None against any TOR's Given/When/Then. See "What Was Built" above for the two open parameters
(breakpoint value, CSS-only mechanism) the spec explicitly deferred to implementation time —
those are fill-ins, not deviations.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-11-45utBRH | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/pane-count-control.test.ts`, `tests/graph-page.test.ts`; live-verified at 1440px — control visible beside the hamburger, independent of the layout-mode toggle |
| TOR-11-6XjR1qm | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts`; live-verified — activating "2 panes" rendered both layouts, primary pane measured 800px = exactly half its 1600px container |
| TOR-11-XOBsafW | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts`, `tests/dual-pane-board.test.tsx`; live-verified — swim-lane (the active `layoutMode`) rendered as the left/primary pane |
| TOR-11-y75iqea | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx`; live-verified — a node selected via the swim-lane pane showed as focused (ring + connections) in the force-directed pane, with the shared side panel showing its detail |
| TOR-11-edqY3uP | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx`; live-verified — clicking a second swim-lane node updated the side panel to the new node |
| TOR-11-qzGSh7K | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx`; live-verified — after two swim-lane-only interactions in 2-pane mode, deactivating returned to 1-pane showing swim-lane (not force-directed) |
| TOR-11-TFakQZA | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/pane-count-control.test.ts`, `tests/dual-pane-board.test.ts`; live-verified at effective ~1000px width — pane-count control `display: none`, secondary pane `display: none`, exactly one layout mode rendered |
| TOR-11-Umq6yH6 | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts`; live-verified — resized from 2-pane-at-1440px down to ~1000px effective width; board auto-collapsed to 1 pane and the control hid, purely via CSS with `paneCount` state left untouched |
| TOR-11-73Scw5U | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/graph-page.test.ts`; the fetch effect's dependency array is `[]`, structurally decoupled from `paneCount` |

## Verification Results

- `npm run lint` — PASS
- `npx tsc --noEmit` (`npm run typecheck`) — PASS
- `npm run build` — PASS (static export, all 4 routes prerendered)
- `npm test` — PASS (284/284 across 43 test files, including 3 new test files for this epic and updates to `tests/graph-page.test.ts` and `tests/options-panel.test.ts`)
- Live `playwright-cli` verification against the deployed `ai-adoption-wiki` demo vault (110 nodes,
  553 connections) via `npm run dev`, no console errors at any point:
  - 1440px: pane-count control visible; activating 2-pane rendered both layouts at measured
    800px/800px (half of a 1600px container); swim-lane rendered as primary/left since it was the
    active mode
  - Selecting nodes via the swim-lane pane (twice, different nodes each time) correctly updated
    the force-directed pane's focus/highlight and the shared side panel each time
  - Deactivating 2-pane after two swim-lane-only interactions returned to 1-pane showing swim-lane
  - Resized to an effective ~1000px width (below the 1280px breakpoint): pane-count control and
    secondary pane both computed `display: none`; resized back to 1440px: both reappeared,
    confirming the CSS-only fallback is reactive in both directions with no resize listener

## Known Issues / Follow-ups

- Clicking directly on force-directed canvas nodes (as opposed to swim-lane pills or the side
  panel) is difficult to target precisely in automated browser testing at a wide-fit zoom level —
  the same limitation noted in epic niaTair's handoff. Cross-pane sync from the force-directed
  side was verified live by observing the force-directed pane react correctly to selections made
  via the swim-lane pane and the side panel (which set the same shared `selectedNode` state a
  direct force-directed click would), not via a raw canvas click in that direction specifically.
- `FilterControls` (status/folder filters) still only render when `layoutMode === "force-directed"`,
  same as before this epic — in 2-pane mode they're hidden whenever swim-lane happens to be
  primary, even though the force-directed pane is visible as secondary. Not one of the 9 TORs;
  left unchanged to keep this epic's scope to the Requirements Anchors table. A future epic could
  revisit whether filters should apply whenever force-directed is rendered anywhere on the board.

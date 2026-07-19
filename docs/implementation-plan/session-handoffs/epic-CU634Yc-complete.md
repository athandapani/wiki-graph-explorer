# Epic CU634Yc: Dual-Pane Graph View — Complete

**Completed:** 2026-07-18
**Verified by:** Independent review via `/peak-workflow:wrapup-epic CU634Yc`

## What Was Built

An independent pane-count control (single icon toggle, beside the Options & help hamburger) lets
visitors on wide screens (≥1280px) view the swim-lane and force-directed layouts side by side —
swim-lane fixed on the left, force-directed fixed on the right — with node selection synced
across both panes and the shared side panel. Below the breakpoint the board falls back to a
single pane automatically via CSS, no resize listener needed.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/PaneCountControl.tsx` | Single icon-only toggle button (1↔2 panes), `hidden xl:block` |
| `components/graph/DualPaneBoard.tsx` | Renders both canvases simultaneously, swim-lane fixed left / force-directed fixed right; wraps click handlers to track last-interacted pane |
| `app/graph/page.tsx` | `paneCount` state; renders `DualPaneBoard` when `paneCount === 2`; re-fit effect extended to fire on pane-count change |
| `components/graph/OptionsPanel.tsx` | New `showResetView` prop so "Reset view" shows whenever force-directed is rendered at all |
| `components/graph/GraphCanvas.tsx` | **Wrapup fix:** measures its container via `ResizeObserver` and passes explicit `width`/`height` to `ForceGraph2D`, instead of relying on the library's own auto-sizing |
| `docs/requirements/11-dual-pane-layout.feature.md` | **Wrapup amendment:** TOR-11-XOBsafW changed from "active mode = primary pane" to a fixed swim-lane-left/force-directed-right order |
| `tests/pane-count-control.test.ts`, `tests/dual-pane-board.test.ts`, `tests/dual-pane-board.test.tsx`, `tests/graph-page.test.ts`, `tests/options-panel.test.ts` | Updated/new tests for all of the above |

## Key Decisions

- **Fixed pane order over "active mode = primary."** The original TOR-11-XOBsafW made pane
  position depend on prior navigation, which live use showed was unpredictable. Amended
  (change-control event, user-approved directly — see the Note block in the feature file) to a
  fixed swim-lane-left/force-directed-right order. TOR-11-qzGSh7K's last-interacted-pane tracking
  is independent of pane position and was unaffected.
- **Single icon toggle over two buttons.** User preference, no requirement conflict — TOR-11-45utBRH
  only requires *a* pane-count control exists and toggles state independently of the layout-mode
  toggle, not a specific button shape.
- **Explicit container-measured width/height for `ForceGraph2D`**, rather than relying on
  `react-force-graph-2d`'s own auto-sizing. Root-caused during wrapup: the library falls back to
  `window.innerWidth`/`innerHeight` when its container reports zero size at the moment its
  internal tracking first runs, and — critically — never self-corrects afterward, even across
  many repeated `zoomToFit` calls over the existing 9-second chase window. This was invisible in
  the single always-mounted instance (its container is never zero-sized for long) but broke
  every fresh `GraphCanvas` mount inside `DualPaneBoard`: the canvas locked to the full viewport
  width, got clipped by the pane's `overflow`, and rendered mostly empty space with nodes pushed
  off to one side. A `ResizeObserver`-measured container with explicit `width`/`height` props
  sidesteps the library's unreliable-in-this-context auto-detection entirely, and applies
  uniformly to the existing single-pane case too (verified no regression there).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-11-45utBRH | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/pane-count-control.test.ts`, `tests/graph-page.test.ts` |
| TOR-11-6XjR1qm | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts` |
| TOR-11-XOBsafW (amended) | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts`, `tests/dual-pane-board.test.tsx` |
| TOR-11-y75iqea | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx` |
| TOR-11-edqY3uP | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx` |
| TOR-11-qzGSh7K | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.tsx` |
| TOR-11-TFakQZA | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/pane-count-control.test.ts`, `tests/dual-pane-board.test.ts` |
| TOR-11-Umq6yH6 | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/dual-pane-board.test.ts` |
| TOR-11-73Scw5U | `docs/requirements/11-dual-pane-layout.feature.md` | PASS | `tests/graph-page.test.ts` |

## Verification Summary

### Counts
- TOR Requirements: 9/9 PASS
- Quality Gates: 4/4 PASS (lint, typecheck, build, test)
- Tests: 284 passed, 0 skipped, 0 failed

### Highlights
- ✅ All 9 TOR-11 IDs independently re-verified against the requirements baseline and re-confirmed live after the wrapup fixes, including the amended TOR-11-XOBsafW
- ⚠️ Initial wrapup pass (before user manual testing) reported PASS on code/tests alone but missed a real force-directed sizing bug in 2-pane mode — corrected below
- ✅ Root-caused and fixed the force-directed zoom/framing bug via `ResizeObserver`-measured explicit canvas dimensions, live-verified with a before/after DOM measurement (canvas locked to viewport width 1440 in an 800px container → correctly sized to the container after the fix)
- ✅ Amended TOR-11-XOBsafW (fixed pane order) through the same in-file change-control convention already established by TOR-06-AFMTHM6, keeping the requirements baseline and the shipped behavior in sync rather than diverging silently

### Conclusion
All 9 TOR Given/When/Then statements are satisfied. This wrapup pass caught a real, user-facing
defect (force-directed sizing in 2-pane mode) that had passed the epic's own test suite and
initial live verification — the tests exercised the wiring correctly but nothing had asserted on
the actual rendered canvas pixel dimensions inside a nested dynamic-import remount, which is
exactly where the bug lived. Fixed at the root (GraphCanvas's own sizing strategy) rather than
patched around, and verified via direct DOM measurement, not just visual inspection.

### Manual verification performed: Yes
User tested the live dev build directly and reported three issues: (1) wanted a single icon
toggle instead of two separate pane-count buttons, (2) wanted swim-lane always on the left and
force-directed always on the right regardless of which mode was active before switching to
2-pane, and (3) reported the force-directed pane showing mostly empty space with nodes pushed to
one side in 2-pane mode. All three were fixed and the fixes were re-verified live in this same
session before completion.

## Known Issues / Follow-ups

- `FilterControls` (status/folder filters) still only render when `layoutMode === "force-directed"`
  — in 2-pane mode they're hidden whenever swim-lane happens to be the last-interacted mode, even
  though the force-directed pane is visible on the right. Not one of the 9 TORs; deferred.
- Clicking directly on force-directed canvas nodes (vs. swim-lane pills or the side panel) remains
  difficult to target precisely in automated browser testing — same limitation noted in epic
  niaTair's handoff.
- A new, unrelated feature request came in during this wrapup session: enumerate source-webpage
  links found in a page's source Markdown and list them (e.g. "link1, link2, …") in the side
  panel, falling back to the existing "View source on GitHub" link when none exist. This is
  explicitly out of scope for epic CU634Yc and will be scoped as its own follow-up.

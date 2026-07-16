# Epic nQJ8Ofz: Rich Browsable Detail Panel — Implemented

**Implemented:** 2026-07-16

## What Was Built

The side panel now shows a folder badge colored to match the node's graph color, the node's
description (from Epic Dj3m8aH), and its connected pages rendered as clickable chips grouped by
folder. Clicking a chip selects that node and drives the same focus treatment a direct click
gets: canvas center/zoom in force-directed mode, active-node highlight/connector-lines in
swim-lane mode. This required an additive `focusedNodeId` prop on both canvases so an
externally-driven selection (the chip) can trigger the same focus mechanics a direct click
already triggers internally — not listed in the spec's Key Components, but necessary for
TOR-04-1iMsnYq to hold in both layout modes.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/GraphCanvas.tsx` | Added `description: string` to the shared `GraphNode` type; added `focusedNodeId` prop + effect that centers/zooms to an externally focused node, reusing the existing click-zoom constants |
| `components/graph/SidePanel.tsx` | New `isDark`/`onSelectNode` props; folder badge; conditional description block; new exported `groupNodesByFolder()`; "Connected pages" section rendering `PillNode` chips grouped by folder |
| `components/graph/SwimLaneCanvas.tsx` | Added `focusedNodeId` prop; render-phase (not effect) sync of `activeNodeId` from an externally focused node, one-way and non-null-only so panel dismissal doesn't clear the board's highlight |
| `app/graph/page.tsx` | Wires `focusedNodeId={selectedNode?.id ?? null}` into both canvases and `isDark`/`onSelectNode={setSelectedNode}` into `SidePanel` |
| `tests/side-panel.test.ts` | Updated: `groupNodesByFolder` unit tests (real logic, TOR-04-xeqtJpo's exact Given); badge/description/chip wiring assertions; updated the now-stale TOR-05-EmhMDFS assertion for the new grouped rendering |
| `tests/side-panel.test.tsx` (new) | Real-DOM tests: badge color, description presence/omission, chip grouping/click wiring |
| `tests/graph-canvas.test.ts` | New assertion for the `focusedNodeId` prop + centerAt/zoom effect |
| `tests/swim-lane-canvas.test.ts` | New assertion for the `focusedNodeId` prop + render-phase sync, with a regression guard preserving TOR-06-RlMt9hc (no camera API in this file) |
| `tests/swim-lane-canvas.test.tsx` | New real-DOM tests: external focus applies the same active/highlight state as a direct click; dismissal (`focusedNodeId` → null) does not clear it |
| `tests/graph-page.test.ts` | New assertion for `focusedNodeId`/`onSelectNode`/`isDark` prop wiring |
| `tests/filter-controls.test.ts` | Fixed a pre-existing `GraphNode` literal missing the new required `description` field |

## Spec Deviations

None. All five TORs were implemented per their Given/When/Then as written. The `focusedNodeId`
addition to `GraphCanvas.tsx`/`SwimLaneCanvas.tsx` extends the spec's Key Components (which named
only `SidePanel.tsx`, `nodeColor.ts`, `app/graph/page.tsx`) but does not deviate from any TOR's
Given/When/Then — it's the mechanism required to satisfy TOR-04-1iMsnYq's "same focus treatment"
clause, discovered during implementation planning, not a change to the requirement itself.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference | Impl Reference |
|--------|--------------|---------|-----------------|-----------------|
| TOR-04-iI9aJNn | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts` (badge wiring), `tests/side-panel.test.tsx` (real-DOM color match) | `components/graph/SidePanel.tsx:81-83` |
| TOR-04-0igGafN | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`, `tests/side-panel.test.tsx` | `components/graph/SidePanel.tsx:98-100` |
| TOR-04-olJvPNV | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`, `tests/side-panel.test.tsx` (empty-description case) | `components/graph/SidePanel.tsx:98` (conditional renders `null`, not a placeholder) |
| TOR-04-xeqtJpo | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts` (`groupNodesByFolder` unit tests, exact 2-concepts/1-sources Given), `tests/side-panel.test.tsx` | `components/graph/SidePanel.tsx:40-51,101-121` |
| TOR-04-1iMsnYq | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/graph-canvas.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/swim-lane-canvas.test.tsx`, `tests/graph-page.test.ts`; live-verified via playwright-cli against the `second-brain` vault in both layout modes | `components/graph/GraphCanvas.tsx:32,88-95`; `components/graph/SwimLaneCanvas.tsx:25,96-113`; `app/graph/page.tsx:135,150,163-164` |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, typecheck, build, test)
- Tests: 209 passed, 0 skipped, 0 failed (38 test files, up from 201/36)

### Highlights
- Live-verified via `playwright-cli` against a fresh build of the private `second-brain` vault
  (47 nodes, 96 edges; never committed — build artifacts stay in gitignored `public/*.json`):
  - Swim-lane mode: clicked "Arun Thandapani" (folder `wiki/people`, degree 29) — badge, real
    description, and "Connected pages" grouped under `wiki/concepts`/`wiki/entities`/`wiki/people`/
    `wiki/sources`/`wiki/synthesis` all rendered correctly. Clicking the "Applied AI
    Transformation Positioning" chip updated the panel to that node **and** moved the board's
    active/pressed highlight to it (confirmed via accessibility snapshot: the new node's pill
    gained `[pressed]`, the old one lost it) — no page reload.
  - Force-directed mode: clicked a node directly (canvas center/zoom fired as before), then
    clicked a connected chip ("Accenture") in the panel — panel content updated and the canvas
    remained correctly anchored in the same graph neighborhood (consistent with `centerAt`/`zoom`
    firing on the new node's already-close position); direct code inspection plus the dedicated
    unit test confirm the effect calls the same `centerAt`/`zoom(CLICK_ZOOM_LEVEL, ...)` a direct
    click uses.
- The vault's 47 live nodes all have non-empty descriptions (matches Dj3m8aH's prior finding of
  41/41 on the smaller vault), so TOR-04-olJvPNV's empty-description case could not be exercised
  against live data — verified instead via the real-DOM RTL test in `tests/side-panel.test.tsx`
  (renders a node with `description: ""` and asserts no gap/placeholder while the rest of the
  panel renders normally).
- Fixed a lint failure (`react-hooks/set-state-in-effect`) by moving the `SwimLaneCanvas`
  focus-sync out of a `useEffect` into React's documented render-phase "adjusting state from
  props" pattern instead.

### Conclusion
All 5 TORs are confirmed by test and by live inspection against the real `second-brain` vault.
No blocking issues found.

### Manual verification performed: Yes (playwright-cli against `npm run dev`, both layout modes)

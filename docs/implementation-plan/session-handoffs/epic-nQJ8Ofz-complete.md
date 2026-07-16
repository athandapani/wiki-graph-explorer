# Epic nQJ8Ofz: Rich Browsable Detail Panel — Complete

**Completed:** 2026-07-16
**Verified by:** Independent review via `/peak-workflow:wrapup-epic nQJ8Ofz`

## What Was Built

The side panel now shows a folder badge colored to match the node's graph color, the node's
description, and its connected pages rendered as clickable chips grouped by folder. Clicking a
chip selects that node and drives the same focus treatment a direct click gets — canvas
center/zoom in force-directed mode, active-node highlight/connector-lines in swim-lane mode —
turning the panel from a navigation dead end into a browsable surface.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/GraphCanvas.tsx` | Added `description: string` to the shared `GraphNode` type; added `focusedNodeId` prop + effect that centers/zooms to an externally focused node, reusing the existing click-zoom constants |
| `components/graph/SidePanel.tsx` | New `isDark`/`onSelectNode` props; folder badge; conditional description block; new exported `groupNodesByFolder()`; "Connected pages" section rendering `PillNode` chips grouped by folder |
| `components/graph/SwimLaneCanvas.tsx` | Added `focusedNodeId` prop; render-phase (not effect) sync of `activeNodeId` from an externally focused node, one-way and non-null-only so panel dismissal doesn't clear the board's highlight |
| `app/graph/page.tsx` | Wires `focusedNodeId={selectedNode?.id ?? null}` into both canvases and `isDark`/`onSelectNode={setSelectedNode}` into `SidePanel` |

## Key Decisions

- The `focusedNodeId` prop addition to `GraphCanvas.tsx`/`SwimLaneCanvas.tsx` extends the spec's
  Key Components (which named only `SidePanel.tsx`, `nodeColor.ts`, `app/graph/page.tsx`) but is
  the mechanism required to satisfy TOR-04-1iMsnYq's "same focus treatment" clause — discovered
  during implementation, not a change to the requirement itself.
- `SwimLaneCanvas`'s focus sync uses React's documented render-phase "adjusting state from
  props" pattern instead of a `useEffect`, to satisfy the `react-hooks/set-state-in-effect` lint
  rule and avoid an extra cascading render.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-04-iI9aJNn | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts:82, tests/side-panel.test.tsx:39 |
| TOR-04-0igGafN | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts:87, tests/side-panel.test.tsx:61 |
| TOR-04-olJvPNV | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts:92, tests/side-panel.test.tsx:78 |
| TOR-04-xeqtJpo | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts:43,98, tests/side-panel.test.tsx:107 |
| TOR-04-1iMsnYq | `docs/requirements/04-side-panel.feature.md` | PASS | tests/side-panel.test.ts:110, tests/side-panel.test.tsx:136, tests/graph-canvas.test.ts:88, tests/swim-lane-canvas.test.ts:98, tests/swim-lane-canvas.test.tsx:153, tests/graph-page.test.ts:42 |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, typecheck, build, test)
- Tests: 201 passed, 0 skipped, 0 failed (36 test files)

### Highlights
- ✅ TOR-04-iI9aJNn — folder badge colored via `getFolderColor(node.folder, isDark)`, matching the graph's palette (`SidePanel.tsx:77-88`); live-verified against `second-brain` (badge "wiki/people" rendered correctly)
- ✅ TOR-04-0igGafN / TOR-04-olJvPNV — description conditionally renders (`SidePanel.tsx:98-100`); real-DOM test asserts no gap/placeholder when empty and the rest of the panel still renders normally
- ✅ TOR-04-xeqtJpo — `groupNodesByFolder()` groups connected pages under folder headings as `PillNode` chips; live-verified 5 folder groups on a 29-degree node
- ✅ TOR-04-1iMsnYq — live-verified in swim-lane mode: clicking a chip updated both panel content and the board's active/pressed highlight (confirmed via before/after accessibility snapshot); force-directed mode verified via code inspection + unit test reusing the same `centerAt`/`zoom` a direct click uses
- ⚠️ The prior implementer's handoff claimed "209 passed... 38 test files" post-epic; the actual repo state (verified by running `npm test`) is 201 tests / 36 files — the same numbers cited as the pre-epic baseline. This is a reporting inaccuracy in that handoff's prose, not a functional gap — all new tests exist, are committed, and pass.

### Conclusion
All 5 TORs are independently confirmed by test inspection, test execution, source-code inspection, and live `playwright-cli` verification against the real `second-brain` vault in swim-lane mode. The one issue found (stale test-count arithmetic in the prior handoff prose) doesn't affect functional correctness.

### Manual verification performed: No

## Known Issues / Follow-ups

- The implementation handoff's test-count delta ("209/38") does not match the actual repo state ("201/36") — cosmetic reporting issue only, no code change needed.
- `docs/architecture.md` and `docs/design-notes.md` describe the pre-epic `SidePanel.tsx` (plain-text related nodes, no folder badge, no `focusedNodeId`) — addressed by the automatic doc-refresh step later in this wrapup.
- Noticed (out of scope for this epic): the "View source on GitHub" link generated against the `second-brain` vault contained a doubled `wiki/wiki` path segment. This vault is dev-only and never deployed, and this epic's TORs don't cover source-link resolution (that's TOR-04-Pc0DlQe, a different epic's requirement) — flagging for awareness only, not a blocking finding here.

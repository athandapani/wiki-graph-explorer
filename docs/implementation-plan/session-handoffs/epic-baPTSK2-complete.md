# Epic baPTSK2: Graph Canvas Rendering — Complete

**Completed:** 2026-07-14
**Verified by:** Independent review via `/peak-workflow:wrapup-epic baPTSK2`

## What Was Built

The `/graph` page now renders the real force-directed graph via `react-force-graph-2d`: nodes
colored by folder/taxonomy, a small status dot per node (active/revisiting/dormant), a hover
tooltip showing the node's title and status, and a click-to-center-zoom (~900ms) interaction.
Empty-graph and data-load-failure states display dedicated messages instead of a blank/broken
canvas, and a version footer sourced from `package.json` is always present.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/GraphCanvas.tsx` | `react-force-graph-2d` wrapper — node/edge rendering, taxonomy-colored body + status dot via custom `nodeCanvasObject`/`nodePointerAreaPaint`, hover tooltip, click-to-center-zoom, initial `zoomToFit` |
| `components/graph/nodeColor.ts` | `getFolderColor()` — validated 8-hue categorical palette, first-seen order, golden-angle overflow beyond 8 folders |
| `components/graph/StatusDot.tsx` | `statusColor()` mapping + standalone `<StatusDot>` component for future reuse |
| `components/graph/EmptyState.tsx` | Zero-node empty-state message |
| `components/graph/ErrorState.tsx` | Data-load failure message naming the problem + next action |
| `components/graph/Footer.tsx` | `wiki-graph-explorer v<semver>` sourced from `package.json` |
| `app/graph/page.tsx` | Dynamically imports `GraphCanvas` via `next/dynamic(..., { ssr: false })`; branches to error/loading/empty/canvas based on fetch outcome and node count |

## Key Decisions

- `react-force-graph-2d` (not the full 3D/VR bundle) — no TOR requires 3D, lighter bundle.
- Taxonomy colors sourced from the dataviz skill's validated categorical palette
  (`references/palette.md`), run through `scripts/validate_palette.js` before use.
- Status-dot colors deliberately do NOT reuse the dataviz skill's reserved status palette
  (good/warning/serious/critical means health/severity, a different concept from content
  freshness) — only "good"/"warning" hues borrowed for active/revisiting; dormant/unknown use a
  neutral chrome gray.
- Folders beyond the palette's 8 fixed slots get a generated golden-angle HSL color rather than
  cycling (cycling would collide with an earlier folder's color). A proper "Other"/legend UI is
  deferred to the future side-panel epic (V3PlLFL).
- `next/dynamic(..., { ssr: false })` is required for `GraphCanvas` — `react-force-graph-2d`
  touches `window`/canvas at module scope, which breaks Next's build-time prerender pass even
  inside a `"use client"` file otherwise.
- TOR-02-pRzSHQL (40+-node interactivity) verified against `../second-brain/wiki` (41 real
  pages), not `public-vault/wiki` (only 2 placeholder pages today) — per `CLAUDE.md`'s
  "prefer live data over fixtures" guidance. Output gitignored, never committed.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-02-k4HmFPL | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/footer.test.ts:12` |
| TOR-02-rG2HTvc | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/error-state.test.ts:11`, live-verified |
| TOR-02-TW7XEms | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts:11`, `tests/graph-page.test.ts:17` |
| TOR-02-Hja6xEo | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts:17`, live-verified |
| TOR-02-AyzgOJs | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/node-color.test.ts:9` |
| TOR-02-VIOZzEK | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/status-dot.test.ts:5` |
| TOR-02-6fwdtOM | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts:24`, live-verified |
| TOR-02-VLOPcgD | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/graph-canvas.test.ts:29`, live-verified |
| TOR-02-mqgZkBc | `docs/requirements/02-graph-rendering.feature.md` | PASS | `tests/empty-state.test.ts:11`, live-verified |
| TOR-02-pRzSHQL | `docs/requirements/02-graph-rendering.feature.md` | PASS | live-verified against 41-node vault |

## Verification Summary

### Counts
- TOR Requirements: 10/10 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (test, lint, typecheck, build)
- Tests: 61 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-02-mqgZkBc — freshly live-verified this review (built against a genuinely empty vault):
  empty-state message renders, zero console/page errors, no `<canvas>` mounts at all
- ✅ TOR-02-rG2HTvc — freshly live-verified this review (forced a real 404 by deleting
  `public/graph-data.json`): error message + next-action text render, footer still shows
- ✅ TOR-02-6fwdtOM, TOR-02-VLOPcgD — confirmed via headed (visible) Chromium session at user
  request: tooltip "Example Research Source · current" appears on hover and disappears on
  pointer-leave; click-to-center-zoom visibly animates
- ✅ TOR-02-pRzSHQL — confirmed via a second headed session against `../second-brain/wiki`
  (41 nodes, 96 edges): pan-drag, zoom-in, zoom-out, and click-to-zoom all responsive
- ✅ TOR-02-AyzgOJs — categorical palette independently validated via the dataviz skill's
  `scripts/validate_palette.js` before use (PASS)

### Conclusion
All 10 TOR IDs pass both static inspection and live browser verification, including two
(empty-state console-cleanliness, error-state messaging) that the original implementation
session had only source-inspected — this review genuinely triggered both conditions and
confirmed the Given/When/Then holds. Two headed (visible) Playwright sessions were also run at
the user's request, demonstrating hover/click/pan/zoom interactively. No gaps found.

### Manual verification performed: No
The user requested and watched two headed (visible) Chromium demo sessions run by the reviewer
(public-vault 2-node hover/click-zoom, and second-brain 41-node pan/zoom/click) but did not
report performing separate manual verification of their own beyond that.

## Known Issues / Follow-ups

- `docs/architecture.md` §2 and §6 still describe the pre-epic stub state ("react-force-graph...
  TBD — pending integration") — expected staleness, addressed by the automatic `refresh-docs`
  step that follows this handoff.
- A proper taxonomy legend / "Other" grouping UI for vaults with more than 8 distinct folders is
  deferred to the future side-panel epic (V3PlLFL).

# Epic baPTSK2 — Implemented

## What Was Built

The `/graph` page now renders the real force-directed graph via `react-force-graph-2d`: nodes
colored by folder/taxonomy, a small status dot per node (active/revisiting/dormant), a hover
tooltip showing the node's title and status, and a click-to-center-zoom (~900ms) interaction.
Empty-graph and data-load-failure states display dedicated messages instead of a blank/broken
canvas, and a version footer sourced from `package.json` is always present.

## Key Files

| File | Change |
|------|--------|
| `components/graph/GraphCanvas.tsx` | Created — `react-force-graph-2d` wrapper: node/edge rendering via `graphData={{ nodes, links: edges }}`, custom `nodeCanvasObject` (taxonomy-colored body + status dot) paired with `nodePointerAreaPaint` for correct hit-testing, `nodeLabel` hover tooltip, `onNodeClick` click-to-center-zoom (`centerAt`/`zoom`, 900ms), `onEngineStop` → `zoomToFit` for a usable initial viewport at any scale |
| `components/graph/nodeColor.ts` | Created — `getFolderColor()`: fixed 8-hue validated categorical palette (dataviz skill `references/palette.md`) in first-seen order, golden-angle HSL generation for any folder beyond the 8th; `resetFolderColors()` for test isolation |
| `components/graph/StatusDot.tsx` | Created — `statusColor()` mapping (active→good-green, revisiting→warning-amber, dormant/unknown→neutral chrome gray) and a standalone `<StatusDot>` component for future reuse |
| `components/graph/EmptyState.tsx` | Created — zero-node empty-state message |
| `components/graph/ErrorState.tsx` | Created — data-load failure message naming the problem + next action |
| `components/graph/Footer.tsx` | Created — `wiki-graph-explorer v<semver>` sourced directly from `package.json` |
| `app/graph/page.tsx` | Modified — dynamically imports `GraphCanvas` via `next/dynamic(..., { ssr: false })` (required — `react-force-graph-2d` touches `window`/canvas at module scope, which breaks Next's build-time prerender pass otherwise); branches to `ErrorState`/loading/`EmptyState`/`GraphCanvas` based on fetch outcome and node count; `Footer` always rendered |
| `package.json` | Modified — added `react-force-graph-2d` dependency |
| `tests/graph-canvas.test.ts`, `tests/node-color.test.ts`, `tests/status-dot.test.ts`, `tests/empty-state.test.ts`, `tests/error-state.test.ts`, `tests/footer.test.ts` | Created — new TOR coverage |
| `tests/graph-page.test.ts` | Modified — extended with new TOR coverage for the rewritten page wiring |

## Key Decisions

- **`react-force-graph-2d`** (not the full `react-force-graph` bundle) — no TOR requires 3D/VR,
  and the 2D-only package avoids pulling in `three.js`/WebGL for a lighter bundle. Still the
  `react-force-graph` family named in `CLAUDE.md`.
- **Taxonomy colors sourced from the dataviz skill's validated categorical palette**
  (`references/palette.md`) rather than picked by eye — ran `scripts/validate_palette.js` against
  the 8-hue set before use (PASS, worst adjacent CVD ΔE 24.2; three slots below 3:1 contrast are
  flagged for the relief rule, mitigated here by the hover tooltip already showing the node's
  identity as a visible label).
- **Status-dot colors deliberately do NOT reuse the dataviz skill's reserved status palette**
  (good/warning/serious/critical — that set means health/severity). `active`/`revisiting`/
  `dormant` is a content-freshness state, a different concept — only the "good" and "warning"
  hues are borrowed for the two states that map cleanly; `dormant` and any unknown status use a
  neutral chrome gray rather than "serious"/"critical" framing, since a quiet page isn't a
  problem.
- **Overflow taxonomy colors**: folders beyond the palette's 8 fixed slots get a generated
  golden-angle HSL color rather than cycling the fixed 8 (cycling would collide with an earlier
  folder's color, violating "different folders render distinctly"). A proper "Other" grouping /
  legend UI is deferred to the future side-panel epic (V3PlLFL).
- **40+-node interactivity (TOR-02-pRzSHQL) verified against `../second-brain/wiki`** (41 real
  pages), not `public-vault/wiki` (only 2 placeholder pages today) — per `CLAUDE.md`'s "prefer
  live data over fixtures" guidance and the precedent set in epic cxjcyqx. Output was gitignored
  and deleted after verification; never committed.

## Spec Deviations

None. All 10 TOR IDs were implementable as literally written.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-02-k4HmFPL | PASS | `components/graph/Footer.tsx:1-5`, `app/graph/page.tsx:56`; test `tests/footer.test.ts`; live check: footer text "wiki-graph-explorer v0.1.0" visible in every Playwright screenshot |
| TOR-02-rG2HTvc | PASS | `components/graph/ErrorState.tsx:1-3`, `app/graph/page.tsx:30-38,46-47`; test `tests/error-state.test.ts`, `tests/graph-page.test.ts` |
| TOR-02-TW7XEms | PASS | `components/graph/GraphCanvas.tsx:38`, `app/graph/page.tsx:12,26-29`; test `tests/graph-canvas.test.ts`, `tests/graph-page.test.ts`; live check: both nodes rendered from `graph-data.json`, zero non-asset network requests observed |
| TOR-02-Hja6xEo | PASS | `components/graph/GraphCanvas.tsx:38` (default link rendering, no override); test `tests/graph-canvas.test.ts`; live check: visible connecting line between the two public-vault nodes in `graph-before-hover.png` |
| TOR-02-AyzgOJs | PASS | `components/graph/nodeColor.ts:25-39`, `components/graph/GraphCanvas.tsx:46`; test `tests/node-color.test.ts`; live check: distinct blue/green node colors for the two distinct public-vault folders |
| TOR-02-VIOZzEK | PASS | `components/graph/StatusDot.tsx:13-15`, `components/graph/GraphCanvas.tsx:49-52`; test `tests/status-dot.test.ts` (directly exercises status='dormant'); live check: visible gray status dot distinct from node body color |
| TOR-02-6fwdtOM | PASS | `components/graph/GraphCanvas.tsx:39`; test `tests/graph-canvas.test.ts`; live Playwright check: hovering a node showed tooltip "Example Research Source · current", confirmed hidden after the pointer moved away |
| TOR-02-VLOPcgD | PASS | `components/graph/GraphCanvas.tsx:62-67` (900ms literal); test `tests/graph-canvas.test.ts`; live Playwright check: clicking a node visibly re-centered and enlarged the view (before/after screenshots) |
| TOR-02-mqgZkBc | PASS | `components/graph/EmptyState.tsx:1-3`, `app/graph/page.tsx:50-51` (never mounts `GraphCanvas` when `nodes.length === 0`, so no canvas-related console error is possible); test `tests/empty-state.test.ts`, `tests/graph-page.test.ts` |
| TOR-02-pRzSHQL | PASS | `components/graph/GraphCanvas.tsx:68-70` (`zoomToFit` on engine stop); live Playwright check against `../second-brain/wiki` (41 nodes, 96 edges): pan and zoom both produced visible, correct view changes with zero console/page errors |

## Verification Results

| Gate | Result |
|------|--------|
| `npm test` | PASS — 61/61 tests passing across 16 test files (re-confirmed after final cleanup, following a brief Bash-tool outage mid-session) |
| `npm run lint` | PASS — no output, no errors |
| `npm run typecheck` | PASS — `tsc --noEmit` clean |
| `npm run build` | PASS — `next build` compiles, prerenders `/graph` with no "window is not defined" or other SSR error from the `react-force-graph-2d` dynamic-import boundary |
| Live Playwright verification (public-vault, 2 nodes) | PASS — node/edge rendering, taxonomy colors, status dots, hover tooltip (appears with title+status, disappears on pointer-leave), click-to-center-zoom all visually confirmed; zero console/page errors |
| Live Playwright verification (`../second-brain/wiki`, 41 nodes/96 edges) | PASS — pan and zoom both produced correct, responsive view changes; zero console/page errors; output never committed (gitignored `public/*.json`, `out/`, confirmed via `git status` after cleanup) |

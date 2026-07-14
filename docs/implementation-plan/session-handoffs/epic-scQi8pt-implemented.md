# Epic scQi8pt: Swim-Lane Layout Mode — Implemented

## What Was Built

Added a second, selectable rendering mode for `/graph`: a static, tiered swim-lane board
mirroring the Nate Herk "AI Stack, Connected" reference demo. Nodes group into up to 4 named
lanes by folder (with overflow folders collapsing into a shared "Other" lane), render as labeled
pill shapes, and hide their edges until a node is clicked — at which point curved SVG connector
lines animate in over ~950ms to each related node. A persistent toggle switches between
force-directed and swim-lane modes without refetching data or losing the force-directed view's
pan/zoom position, since both canvases stay mounted simultaneously and are toggled via CSS
`display` rather than conditional unmounting.

## Key Files

| File | Change |
|---|---|
| `lib/lane-assignment.ts` | New — folder→lane bucketing (top 4 by count, alphabetical tie-break, overflow → "Other") |
| `lib/connector-line-animation.ts` | New — `CONNECTOR_ANIMATION_DURATION_MS` (950) and curved SVG path builder |
| `components/graph/PillNode.tsx` | New — rounded pill node, reuses `getFolderColor`/`StatusDot` |
| `components/graph/SwimLaneCanvas.tsx` | New — swim-lane board: lane layout, click-to-reveal connector-line animation (SVG `stroke-dashoffset` draw technique), reuses `getRelatedNodeIds` from `SidePanel.tsx` and `EmptyState.tsx` |
| `components/graph/LayoutModeToggle.tsx` | New — persistent force-directed/swim-lane toggle |
| `app/graph/page.tsx` | Modified — adds `layoutMode` state; both canvases render simultaneously, toggled via CSS `display`; empty-state check moved from a single page-level gate to per-canvas so the toggle remains usable at zero nodes |
| `tests/lane-assignment.test.ts`, `tests/connector-line-animation.test.ts`, `tests/pill-node.test.ts`, `tests/swim-lane-canvas.test.ts` | New test files |
| `tests/graph-page.test.ts` | Extended with 4 new cases for toggle/state wiring |

## Spec Deviations

None. Two open risks the epic spec explicitly left for this spike were resolved and confirmed
with the user before implementation (not deviations, since the spec anticipated this decision):

- **Rendering approach:** custom SVG/CSS renderer, not `react-force-graph-2d` fixed-position
  mode. Rationale: real DOM text for pill titles (TOR-06-hCQUwZW), CSS flexbox for the
  no-scrollbar viewport fit (TOR-06-0ZRtILL), the standard SVG `stroke-dasharray`/`stroke-dashoffset`
  technique for the 950ms line-draw (TOR-06-pbVYver), and "no pan/zoom on click"
  (TOR-06-RlMt9hc) satisfied by construction (no camera exists in this renderer).
- **"Other" lane tie-break:** alphabetical by folder name, matching the example already noted in
  `06-swim-lane-layout.feature.md`.

**Lane-count reading (noted, not a deviation):** TOR-06-a3pVfbc's Then clause is literal — the 4
largest folders each get their own lane AND remaining folders collapse into "Other" — so when
>4 distinct folders exist, the board shows 5 lanes total (4 named + Other). Verified against real
data: the `second-brain` vault (47 nodes, 5 distinct folders) renders exactly 5 lanes. This does
not contradict TOR-06-6dbr9Jn's "at most 4 lanes" title, whose own Given/When/Then only requires
≥2 distinct folders (not necessarily >4).

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-06-DRtjcOk | PASS | `tests/graph-page.test.ts:64` | `components/graph/LayoutModeToggle.tsx`; `app/graph/page.tsx` — visually confirmed via Playwright (toggle visible, switches modes) |
| TOR-06-mvJp8Oa | PASS | `tests/graph-page.test.ts:71` | `app/graph/page.tsx` — Playwright network capture confirmed exactly 1 fetch each for `graph-data.json`/`vector-index.json` across toggling both directions |
| TOR-06-AFMTHM6 | PASS | `tests/graph-page.test.ts:79` | `app/graph/page.tsx` (CSS-display keep-alive) — Playwright pixel-diff comparison: toggle-induced canvas drift (43,952/44,913 bytes) matched no-toggle-wait drift (43,727/44,901 bytes), confirming the toggle itself introduces no camera loss beyond ordinary d3-force simulation jitter |
| TOR-06-6dbr9Jn | PASS | `tests/lane-assignment.test.ts:5` | `lib/lane-assignment.ts` — Playwright: 5 lanes rendered against real 47-node/5-folder data |
| TOR-06-a3pVfbc | PASS | `tests/lane-assignment.test.ts:23`, `:48` | `lib/lane-assignment.ts` |
| TOR-06-hCQUwZW | PASS | `tests/pill-node.test.ts:11`, `:17` | `components/graph/PillNode.tsx` — visually confirmed via Playwright screenshot |
| TOR-06-0ZRtILL | PASS | `tests/swim-lane-canvas.test.ts:16` | `components/graph/SwimLaneCanvas.tsx` — Playwright: `scrollHeight === clientHeight` (155/155) at default viewport with 5 lanes |
| TOR-06-RlMt9hc | PASS | `tests/swim-lane-canvas.test.ts:22` | `components/graph/SwimLaneCanvas.tsx` — no camera API present |
| TOR-06-tq70ta7 | PASS | `tests/swim-lane-canvas.test.ts:28` | `components/graph/SwimLaneCanvas.tsx` — Playwright: 0 connector paths before any click |
| TOR-06-pbVYver | PASS | `tests/connector-line-animation.test.ts:8,12`; `tests/swim-lane-canvas.test.ts:32` | `lib/connector-line-animation.ts`, `components/graph/SwimLaneCanvas.tsx` — Playwright: `strokeDashoffset` was mid-transition (0.83px) immediately after click and fully drawn (0px) ~1s later |
| TOR-06-baMJL3X | PASS | `tests/swim-lane-canvas.test.ts:39` | `components/graph/SwimLaneCanvas.tsx` — Playwright: path `d` data changed and count changed (3→2) after clicking a second, different node |
| TOR-06-n4fJkbK | PASS | `tests/swim-lane-canvas.test.ts:43`; `tests/graph-page.test.ts:84` | `components/graph/SwimLaneCanvas.tsx`, `app/graph/page.tsx` — Playwright: side panel opened with title/tags/status dot/GitHub link after a pill click |
| TOR-06-NJmtnhV | PASS | Verified via Playwright only (real-data interactivity claim) | `components/graph/SwimLaneCanvas.tsx` — 47-node `second-brain` build; click registered, connector animation and side panel both opened correctly |
| TOR-06-M0SNN90 | PASS | `tests/swim-lane-canvas.test.ts:48` | `components/graph/SwimLaneCanvas.tsx` — Playwright against a temporary empty-vault build: empty-state message rendered, toggle remained usable, zero console errors |

## Verification Results

- `npm test` — PASS (26 test files, 109 tests)
- `npm run lint` — PASS (no output/errors)
- `npm run typecheck` — PASS (no output/errors)
- `npm run build` — PASS (`next build`, static export succeeded, `/graph` prerendered)
- `npm run build:graph -- --vault ../second-brain --out public` — PASS (local-dev-only, 47 nodes/96 edges; not committed — `public/graph-data.json` and `public/vector-index.json` remain gitignored)
- `playwright-cli`-equivalent visual verification (ad hoc Playwright script against `npm run dev` on `http://localhost:3000/graph`, since no `playwright-cli` MCP tool was registered in this session): all scenarios above confirmed against real data; zero console errors observed in any scenario. Scratch verification scripts and screenshots were written outside the repo/deleted after use — no test artifacts were committed.

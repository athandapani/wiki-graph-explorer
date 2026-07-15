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

**Post-implementation UX redesign (this session, 2026-07-15):** after the original 14 TORs were
independently verified PASS, live user feedback drove a substantial redesign, all implemented
and re-verified in this same epic: a dark-theme-by-default shell with a light/dark toggle; the
swim-lane board rebuilt from horizontal-scrolling strips into full-width horizontal bands;
connector lines re-anchored to pill top/bottom mid-points and colored by destination folder;
zero/low-connectivity node hiding with click-to-reveal dashed styling; the side panel converted
from a slide-in overlay to an always-visible flex column; a new `Header` (logo + product title)
on both pages; and a rewritten home page replacing the unedited `create-next-app` boilerplate.
This drove a **formal requirements reconciliation** (see Spec Deviations below): one TOR was
amended in place, two TORs on a different, already-`Complete` epic (V3PlLFL) were amended as a
cross-epic side effect, and 5 new TORs were captured retroactively to give the new behavior
proper coverage.

## Key Files

| File | Change |
|---|---|
| `lib/lane-assignment.ts` | Folder→lane bucketing (top 4 by count, alphabetical tie-break, overflow → "Other") |
| `lib/connector-line-animation.ts` | `CONNECTOR_ANIMATION_DURATION_MS` (950) and curved SVG path builder; anchors now pill top/bottom mid-points |
| `components/graph/PillNode.tsx` | Rounded pill node, reuses `getFolderColor`/`StatusDot`; dashed border when revealed |
| `components/graph/SwimLaneCanvas.tsx` | Swim-lane board: full-width horizontal-band lanes, click-to-reveal connector-line animation, zero/low-degree node hiding (`LOW_DEGREE_THRESHOLD`), dashed-reveal for low-connectivity nodes |
| `components/graph/LayoutModeToggle.tsx` | Force-directed/swim-lane toggle, now hosted inside `OptionsPanel` |
| `components/graph/OptionsPanel.tsx` | **New this session** — persistent "Options & help" button opening a panel with the layout toggle, theme toggle, and help text |
| `components/graph/ThemeToggle.tsx` | **New this session** — light/dark switch, persists to `localStorage` |
| `components/graph/Header.tsx`, `components/graph/Logo.tsx` | **New this session** — product header/logo on `/` and `/graph` |
| `components/graph/SidePanel.tsx` | **Modified this session** — always-visible flex column instead of slide-in overlay; close reverts to placeholder instead of unmounting |
| `components/graph/nodeColor.ts` | **Modified this session** — dark-mode folder color variants |
| `app/graph/page.tsx` | Both canvases render simultaneously, toggled via CSS `display`; hosts `Header`, `OptionsPanel`, always-visible `SidePanel`; theme state + `localStorage` persistence |
| `app/layout.tsx` | **Modified this session** — dark class by default, anti-flash inline script, `suppressHydrationWarning` |
| `app/page.tsx` | **Rewritten this session** — real product intro, "how to use it", CTA into `/graph` (was `create-next-app` boilerplate) |
| `docs/requirements/06-swim-lane-layout.feature.md` | **Amended this session** — TOR-06-DRtjcOk wording; **added** TOR-06-nQ4vXsD, TOR-06-Zk8pLwR |
| `docs/requirements/04-side-panel.feature.md` | **Amended this session, cross-epic** — TOR-04-GOmpoij, TOR-04-tgCQzbT wording |
| `docs/requirements/07-product-shell-and-theming.feature.md` | **New this session** — TOR-07-Wb3kNfT, TOR-07-Ht6rMqL, TOR-07-Yp2cVxJ |
| `tests/lane-assignment.test.ts`, `tests/connector-line-animation.test.ts`, `tests/pill-node.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/graph-page.test.ts` | Test coverage for original + redesigned behavior |
| `tests/header.test.ts`, `tests/home-page.test.ts`, `tests/options-panel.test.ts`, `tests/layout.test.ts` | **New this session** — header, home page, options panel, dark-theme-default coverage |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|---|---|---|---|
| TOR-06-DRtjcOk | "a visible, persistent toggle control should be present on the page" | A persistent "Options & help" button (always visible) opens a panel containing the layout-mode toggle | Explicit, live user UX direction during this session. TOR wording amended in place (see `docs/requirements/06-swim-lane-layout.feature.md`) rather than treated as a silent gap, per user decision. |
| TOR-04-GOmpoij (epic V3PlLFL, cross-epic) | "The side panel shall slide in... keeping the graph visible" | Side panel is a permanently-mounted, always-visible flex column that populates with content on click; never slides in/out | Same UX redesign — the side panel became a persistent column rather than an overlay. TOR wording amended in place in `docs/requirements/04-side-panel.feature.md`, cross-referenced from this epic since V3PlLFL is already `status: Complete`. |
| TOR-04-tgCQzbT (epic V3PlLFL, cross-epic) | "The side panel shall close when the visitor explicitly dismisses it" | Dismissing reverts the panel to its placeholder text; the panel itself never unmounts | Same redesign; same amendment as above. |

**Rendering approach (resolved spike, not a deviation):** custom SVG/CSS renderer, not
`react-force-graph-2d` fixed-position mode — confirmed and unchanged by the redesign. Real DOM
text for pill titles, CSS flexbox for the no-scrollbar viewport fit, standard SVG
`stroke-dasharray`/`stroke-dashoffset` for the ~950ms line-draw, and "no pan/zoom on click"
satisfied by construction (no camera exists in this renderer).

**Lane-count reading (noted, not a deviation):** when >4 distinct folders exist, the board shows
5 lanes total (4 named + "Other"). Verified against real data both this session and the prior
one: the `second-brain` vault (47 nodes, 5 distinct folders) renders exactly 5 lanes at both
1280px and 1024px viewports with no vertical scrollbar.

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-06-DRtjcOk (amended) | PASS | `tests/graph-page.test.ts:64`, `tests/options-panel.test.ts` | `components/graph/OptionsPanel.tsx`, `components/graph/LayoutModeToggle.tsx` — re-verified live via Playwright this session: "Options & help" button visible, opens panel, toggle switches modes |
| TOR-06-mvJp8Oa | PASS | `tests/graph-page.test.ts:71` | `app/graph/page.tsx` — re-verified live: exactly 1 network request each for `graph-data.json`/`vector-index.json`, unchanged after toggling both directions |
| TOR-06-AFMTHM6 | PASS | `tests/graph-page.test.ts:79` | `app/graph/page.tsx` (CSS-display keep-alive, unchanged mechanism) |
| TOR-06-6dbr9Jn | PASS | `tests/lane-assignment.test.ts:5` | `lib/lane-assignment.ts` — re-verified live: 5 lanes rendered against real 47-node/5-folder data at 1280px and 1024px |
| TOR-06-a3pVfbc | PASS | `tests/lane-assignment.test.ts:23`, `:48` | `lib/lane-assignment.ts` |
| TOR-06-hCQUwZW | PASS | `tests/pill-node.test.ts:11`, `:17` | `components/graph/PillNode.tsx` — re-verified live via Playwright screenshot |
| TOR-06-0ZRtILL | PASS | `tests/swim-lane-canvas.test.ts:16` | `components/graph/SwimLaneCanvas.tsx` — re-verified live at **both 1280px and 1024px** viewports (this session's added narrow-viewport check): no vertical scrollbar at either width |
| TOR-06-RlMt9hc | PASS | `tests/swim-lane-canvas.test.ts:22` | `components/graph/SwimLaneCanvas.tsx` — no camera API present |
| TOR-06-tq70ta7 | PASS | `tests/swim-lane-canvas.test.ts:28` | `components/graph/SwimLaneCanvas.tsx` — re-verified live: 0 connector lines visible before any click |
| TOR-06-pbVYver | PASS | `tests/connector-line-animation.test.ts:8,12`; `tests/swim-lane-canvas.test.ts:32` | `lib/connector-line-animation.ts`, `components/graph/SwimLaneCanvas.tsx` — re-verified live: connector lines animate in on click, now anchored at pill top/bottom mid-points and colored by destination folder |
| TOR-06-baMJL3X | PASS | `tests/swim-lane-canvas.test.ts:39` | `components/graph/SwimLaneCanvas.tsx` |
| TOR-06-n4fJkbK | PASS | `tests/swim-lane-canvas.test.ts:43`; `tests/graph-page.test.ts:84` | `components/graph/SwimLaneCanvas.tsx`, `components/graph/SidePanel.tsx` — re-verified live: side panel populates with title/tags/status dot/related list/GitHub link on click |
| TOR-06-NJmtnhV | PASS | Verified via Playwright (real-data interactivity claim) | `components/graph/SwimLaneCanvas.tsx` — 47-node `second-brain` build; click registered, connector animation and side panel both opened correctly |
| TOR-06-M0SNN90 | PASS | `tests/swim-lane-canvas.test.ts:65` | `components/graph/SwimLaneCanvas.tsx` — `nodes.length === 0` renders `EmptyState` |
| TOR-06-nQ4vXsD (new) | PASS | `tests/swim-lane-canvas.test.ts` ("TOR-06-nQ4vXsD: hides zero-connection nodes...") | `components/graph/SwimLaneCanvas.tsx` — zero-degree nodes excluded from `baseNodes` |
| TOR-06-Zk8pLwR (new) | PASS | `tests/swim-lane-canvas.test.ts` ("TOR-06-Zk8pLwR: pulls a low-connection related node...") | `components/graph/SwimLaneCanvas.tsx` — re-verified live: clicking "Arun Thandapani" pulled "Arun Memory File" into the wiki/sources lane (4→5 nodes) with a dashed orange connector line |
| TOR-07-Wb3kNfT (new) | PASS | `tests/layout.test.ts` | `app/layout.tsx`, `components/graph/ThemeToggle.tsx`, `app/graph/page.tsx` — re-verified live: fresh session renders dark (black background, "Light mode" toggle label confirms `isDark=true` default), `localStorage.setItem("theme", ...)` on change |
| TOR-07-Ht6rMqL (new) | PASS | `tests/header.test.ts` | `components/graph/Header.tsx` — re-verified live: header with logo + "Wiki Graph Explorer" on both `/` and `/graph`; Playwright reported Page Title "Wiki Graph Explorer" (not the create-next-app default) |
| TOR-07-Yp2cVxJ (new) | PASS | `tests/home-page.test.ts` | `app/page.tsx` — re-verified live: product intro, "How to use it" list, "Open the graph →" CTA into `/graph`, no boilerplate |
| TOR-04-GOmpoij (amended, epic V3PlLFL) | PASS | Playwright live verification | `components/graph/SidePanel.tsx` — re-verified this session: panel populates without full navigation, graph canvas stays visible/centered |
| TOR-04-tgCQzbT (amended, epic V3PlLFL) | PASS | Playwright live verification | `components/graph/SidePanel.tsx` — Close button reverts to placeholder text; panel remains mounted/visible |

## Verification Results

- `npm test` — PASS (30 test files, 127 tests)
- `npm run lint` — PASS (no output/errors)
- `npm run typecheck` — PASS (no output/errors)
- `npm run build` — PASS (`next build`, static export succeeded, `/` and `/graph` prerendered)
- Live verification: `npm run dev` against the existing local build output for the real
  `second-brain` vault (47 nodes / 96 edges, gitignored, not committed), driven with the
  `plugin_playwright` MCP tools at both 1280px and 1024px viewports. Confirmed: dark theme
  default, Options-panel-mediated layout toggle (both directions, zero refetch), swim-lane
  lanes/pills/colors, edges hidden until click, ~950ms connector animation anchored at pill
  edges and colored by destination folder, zero/low-degree node hiding with dashed-reveal on
  click, always-visible side panel (populate + placeholder-revert), header/logo/title on both
  pages, rewritten home page, no vertical scrollbar in swim-lane mode at either viewport width,
  zero console errors in every scenario. Scratch screenshots were deleted after review; nothing
  from this verification was committed.

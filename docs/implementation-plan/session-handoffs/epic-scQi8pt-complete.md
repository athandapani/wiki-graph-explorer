# Epic scQi8pt: Swim-Lane Layout Mode — Complete

**Completed:** 2026-07-15
**Verified by:** Independent review via `/peak-workflow:wrapup-epic scQi8pt`

## What Was Built

A second, selectable rendering mode for `/graph` — a static, tiered swim-lane board (up to 4
named folder lanes + an "Other" lane) with labeled pill nodes, click-to-reveal ~950ms curved
connector-line animation, and click-to-reveal low-connectivity nodes — toggled against the
existing force-directed mode without refetching data or losing view state. A post-implementation
UX redesign (same epic, same session) layered on a dark-theme-by-default shell with persistent
light/dark toggle, an always-visible side panel, a product Header/Logo on both pages, and a
rewritten home page replacing the unedited `create-next-app` boilerplate.

## Key Files

| File | Purpose |
|------|---------|
| `lib/lane-assignment.ts` | Folder→lane bucketing (top 4 by count, alphabetical tie-break, overflow → "Other") |
| `lib/connector-line-animation.ts` | `CONNECTOR_ANIMATION_DURATION_MS` (950) and curved SVG path builder, anchored at pill top/bottom mid-points |
| `components/graph/SwimLaneCanvas.tsx` | Swim-lane board renderer: full-width horizontal-band lanes, click-to-reveal connector animation, zero/low-degree node hiding |
| `components/graph/PillNode.tsx` | Rounded pill node; dashed border when revealed as low-connectivity |
| `components/graph/LayoutModeToggle.tsx` | Force-directed/swim-lane toggle, hosted inside `OptionsPanel` |
| `components/graph/OptionsPanel.tsx` | Persistent "Options & help" button opening a panel with the layout toggle, theme toggle, and help text |
| `components/graph/ThemeToggle.tsx` | Light/dark switch, persists to `localStorage` |
| `components/graph/Header.tsx`, `components/graph/Logo.tsx` | Product header/logo on `/` and `/graph` |
| `components/graph/SidePanel.tsx` | Always-visible flex column instead of slide-in overlay; close reverts to placeholder |
| `app/graph/page.tsx` | Both canvases render simultaneously, toggled via CSS `display`; hosts `Header`, `OptionsPanel`, always-visible `SidePanel`; theme state + `localStorage` persistence |
| `app/layout.tsx` | Dark class by default, anti-flash inline script, `suppressHydrationWarning` |
| `app/page.tsx` | Real product intro, "how to use it", CTA into `/graph` |
| `docs/requirements/06-swim-lane-layout.feature.md` | Amended TOR-06-DRtjcOk wording; added TOR-06-nQ4vXsD, TOR-06-Zk8pLwR |
| `docs/requirements/04-side-panel.feature.md` | Cross-epic amendment — TOR-04-GOmpoij, TOR-04-tgCQzbT wording |
| `docs/requirements/07-product-shell-and-theming.feature.md` | New — TOR-07-Wb3kNfT, TOR-07-Ht6rMqL, TOR-07-Yp2cVxJ |

## Key Decisions

- Rendering approach (resolved spike): a custom SVG/CSS renderer, not `react-force-graph-2d`
  fixed-position mode — real DOM text for pill titles, CSS flexbox for the no-scrollbar viewport
  fit, standard SVG `stroke-dasharray`/`stroke-dashoffset` for the line-draw animation, and "no
  pan/zoom on click" satisfied by construction (no camera exists in this renderer).
- Both canvases (force-directed and swim-lane) stay mounted simultaneously and are toggled via
  CSS `display` rather than conditional unmounting — this is what makes the zero-refetch and
  pan/zoom-preservation requirements hold without extra state-management code.
- Nodes with zero edges are permanently hidden from the swim-lane board; nodes with exactly one
  edge are hidden by default but revealed (with a dashed pill/connector) when the node they link
  to is clicked — keeps large, sparsely-connected vaults fitting on one screen.
- TOR-06-DRtjcOk, TOR-04-GOmpoij, and TOR-04-tgCQzbT were amended in place (not silently
  deviated from) following explicit live user UX direction during this session; the amendment
  record lives in the feature files' inline comments and this epic's implemented handoff.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-06-DRtjcOk | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/graph-page.test.ts:64 |
| TOR-06-mvJp8Oa | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/graph-page.test.ts:71 |
| TOR-06-AFMTHM6 | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/graph-page.test.ts:79 |
| TOR-06-6dbr9Jn | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/lane-assignment.test.ts:5 |
| TOR-06-a3pVfbc | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/lane-assignment.test.ts:23,48 |
| TOR-06-hCQUwZW | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/pill-node.test.ts:11,17 |
| TOR-06-0ZRtILL | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:16 |
| TOR-06-RlMt9hc | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:39 |
| TOR-06-tq70ta7 | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:45 |
| TOR-06-pbVYver | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/connector-line-animation.test.ts:8 |
| TOR-06-baMJL3X | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:56 |
| TOR-06-n4fJkbK | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:60 |
| TOR-06-NJmtnhV | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | live Playwright verification |
| TOR-06-M0SNN90 | `docs/requirements/06-swim-lane-layout.feature.md` | PASS WITH EXCEPTIONS | tests/swim-lane-canvas.test.ts:65 |
| TOR-06-nQ4vXsD | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:24 |
| TOR-06-Zk8pLwR | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | tests/swim-lane-canvas.test.ts:34 |
| TOR-07-Wb3kNfT | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/layout.test.ts |
| TOR-07-Ht6rMqL | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/header.test.ts |
| TOR-07-Yp2cVxJ | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/home-page.test.ts |

## Verification Summary

### Counts
- TOR Requirements: 19/19 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, typecheck, build, live UI verification)
- Tests: 127 passed, 0 skipped, 0 failed

### Highlights
- ✅ Full round-trip live-verified against the real `second-brain` build (47 nodes/96 edges): toggled force-directed → swim-lane → force-directed twice while watching network requests — zero new requests for `graph-data.json`/`vector-index.json` either time (TOR-06-mvJp8Oa), and a zoomed/panned force-directed view was pixel-for-pixel restored after the round trip (TOR-06-AFMTHM6).
- ✅ Clicked through the click-interaction chain live: clicking "Arun Thandapani" drew curved, folder-colored connector lines and pulled a hidden low-connectivity node into its lane with a dashed border/line; clicking "Coco Miske" immediately cleared those lines and drew new ones, and the dashed node reverted to hidden (TOR-06-pbVYver, TOR-06-baMJL3X, TOR-06-nQ4vXsD, TOR-06-Zk8pLwR).
- ✅ Theme toggle verified end-to-end: switched to light mode, confirmed `localStorage.setItem`, reloaded `/graph` and navigated to `/`, and the light theme persisted across both with zero console errors (TOR-07-Wb3kNfT).
- ⚠️ TOR-06-M0SNN90 (empty-graph state) verified by direct source inspection and its passing unit test, not by live-simulating a genuinely empty `graph-data.json`.

### Conclusion
All 19 TOR requirements are satisfied by the implementation — verified via a combination of passing tests, direct source inspection, and extensive live Playwright verification against real vault data (not fixtures), covering every interactive path: layout toggle, theme toggle, connector-line animation/clearing, low-connectivity node reveal, and cross-page navigation.

### Manual verification performed: Yes
Visual/UX review across devices.

## Known Issues / Follow-ups

- TOR-06-M0SNN90's empty-graph path was verified by code inspection + unit test rather than a live empty-vault build; low risk given the guard clause is a single trivial conditional, but worth a live check if the empty-graph path is ever refactored.

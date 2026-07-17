# Epic nB4iwQu: Responsive Layout — Implemented

## What Was Built

`/graph` now works at the 390px design floor. Below a `md:` (768px) breakpoint, the side panel no
longer sits alongside the board as a fixed 320px column crushing it to a sliver — it's hidden
entirely until a node is selected, then appears as a bottom-sheet overlay that shows the node's
detail, supports tapping connected-page chips to re-target itself, and dismisses cleanly via its
existing close control, leaving the board fully interactive. The header now wraps and the search
input can shrink so nothing forces horizontal overflow, and the search input's font-size is bumped
to 16px on mobile to avoid iOS's auto-zoom-on-focus. Desktop layout (`md:` and up) is pixel-for-
pixel unchanged.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/SidePanel.tsx` | `<aside>`'s className is now a conditional expression keyed on `node`: `hidden md:flex ... md:w-80` when nothing is selected, `fixed inset-x-0 bottom-0 z-30 max-h-[70vh] ... md:static ... md:w-80` when a node is selected. No changes to the render logic inside — same title/tags/chips/close button markup, just different positioning classes |
| `components/graph/Header.tsx` | Inner row gained `flex-wrap`; the `{search}` slot is now wrapped in a `min-w-0 flex-1` div so it can shrink or wrap instead of forcing horizontal overflow |
| `components/graph/SearchInput.tsx` | `<input>` className: `text-sm` → `text-base md:text-sm` (16px mobile floor, avoids iOS auto-zoom) |
| `tests/side-panel.test.ts`, `tests/header.test.ts`, `tests/search-input.test.ts` | New coverage for all 5 TORs; one pre-existing untagged test ("takes up real layout space…") updated to assert the new responsive-aware invariant instead of the old unconditional "never fixed" rule it previously encoded |

`app/graph/page.tsx` and `components/graph/SwimLaneCanvas.tsx` were **not modified** — live
verification confirmed the board's existing `flex min-w-0 flex-1` wrapper already claims the space
`SidePanel` frees up once it becomes `fixed`/`hidden`, and `SwimLaneCanvas`'s lanes were already
single-column by construction. No defect was found in either file, so per the plan neither was
touched.

## Spec Deviations

None. Implemented exactly as scoped against each TOR's Given/When/Then.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-09-ULogLhW | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified at 390×844 — board width 374.67px / 390px viewport = 96%, `<aside>` computed `display: none` when unselected |
| TOR-09-Gx908bc | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified — tapping a node made `<aside>` `position: fixed`, anchored to viewport bottom (`bottom: 844` = viewport height), showing the tapped node's full detail |
| TOR-09-FSqHlRx | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | existing `tests/side-panel.test.tsx` chip-click coverage (unchanged logic); live-verified — tapping "Arun Thandapani" chip inside the open sheet re-rendered it with Arun Thandapani's detail |
| TOR-09-rOB5DZW | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified — closing the sheet returned `<aside>` to `display: none`, tapping a different board node reopened the sheet with that node's detail, zero console errors |
| TOR-09-kMjRcRb | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/header.test.ts`, `tests/search-input.test.ts`; live-verified — header right edge at 374.67px (< 390px viewport), search input right edge at 358.67px, computed input `font-size: 16px`, `document.documentElement.scrollWidth <= window.innerWidth` |

## Verification Results

- `npx vitest run tests/side-panel.test.ts tests/side-panel.test.tsx tests/search-input.test.ts tests/search-input.test.tsx tests/header.test.ts tests/graph-page.test.ts` — PASS (64/64)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (240/240, up from 236 — 4 new tests added)
- Live `playwright-cli` verification against `npm run dev`:
  - At 390×844 (design floor): board occupies 96% of viewport width with no horizontal scroll;
    side panel hidden when unselected; tapping a node opens it as a `fixed` bottom sheet capped at
    `max-h-[70vh]`; tapping a connected-page chip inside the sheet re-targets it; closing the sheet
    restores full board interactivity and re-tapping a node reopens it; header and search input
    both render fully within the viewport; search input computed font-size is exactly 16px.
  - At 1280×800 (desktop regression check, not a new TOR): confirmed the panel remains
    `position: static`, `width: 320px` regardless of selection state — pixel-identical to
    pre-epic behavior.
  - Zero console errors across both viewport sizes and the full click-through flow.

## Known Issues / Follow-ups

- A very long, untruncated pill title (per the intentional no-ellipsis rule from TOR-06-cSCqVtt)
  can visually clip against its lane's `overflow-hidden` boundary at 390px width. This does not
  create an actual page-level horizontal scrollbar (confirmed via `document.documentElement.scrollWidth`)
  and no TOR in this epic requires full pill-title visibility at narrow widths — noted as an
  observed, out-of-scope tradeoff, not a regression introduced by this epic.

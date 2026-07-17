# Epic nB4iwQu: Responsive Layout — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic nB4iwQu`

## What Was Built

`/graph` now works at the 390px design floor. Below the `md:` (768px) breakpoint, the side panel
no longer sits alongside the board as a fixed 320px column crushing it to a sliver — it's hidden
entirely until a node is selected, then appears as a bottom-sheet overlay that shows the node's
detail, supports tapping connected-page chips to re-target itself, and dismisses cleanly via its
existing close control, leaving the board fully interactive. The header now wraps and the search
input can shrink so nothing forces horizontal overflow, and the search input's font-size is
bumped to 16px on mobile to avoid iOS's auto-zoom-on-focus. Desktop layout (`md:` and up) is
pixel-for-pixel unchanged.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/SidePanel.tsx` | `<aside>`'s className is now a conditional expression keyed on `node`: `hidden md:flex ... md:w-80` when nothing is selected, `fixed inset-x-0 bottom-0 z-30 max-h-[70vh] ... md:static ... md:w-80` when a node is selected. Render logic inside is unchanged. |
| `components/graph/Header.tsx` | Inner row gained `flex-wrap`; the `{search}` slot is wrapped in a `min-w-0 flex-1` div so it can shrink or wrap instead of forcing horizontal overflow |
| `components/graph/SearchInput.tsx` | `<input>` className: `text-sm` → `text-base md:text-sm` (16px mobile floor, avoids iOS auto-zoom) |
| `tests/side-panel.test.ts`, `tests/header.test.ts`, `tests/search-input.test.ts` | New coverage for all 5 TORs; one pre-existing untagged test updated to assert the new responsive-aware invariant instead of the old unconditional "never fixed" rule |

`app/graph/page.tsx` and `components/graph/SwimLaneCanvas.tsx` were **not modified** — the
board's existing `flex min-w-0 flex-1` wrapper already claims the space `SidePanel` frees up once
it becomes `fixed`/`hidden`, and `SwimLaneCanvas`'s lanes were already single-column by
construction.

## Key Decisions

- The bottom sheet is implemented as a CSS-conditional className switch on the same `<aside>`
  element, not a separate mobile component — keeps the detail-rendering logic (title, tags,
  chips, GitHub link) as a single source of truth shared across breakpoints.
- `docs/design-notes.md` §21 ("Always-Visible Side Panel — Not Slide-In Overlay") is now stale
  below `md:` — this epic intentionally introduces a mobile bottom-sheet overlay. Flagged for the
  Step 4 automated doc refresh.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-09-ULogLhW | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts:135`; live-verified 390px |
| TOR-09-Gx908bc | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts:140`; live-verified 390px |
| TOR-09-FSqHlRx | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.tsx:136` (chip-click); live-verified 390px |
| TOR-09-rOB5DZW | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified 390px |
| TOR-09-kMjRcRb | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/header.test.ts:40`, `tests/search-input.test.ts:22`; live-verified 390px |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS
- Quality Gates: 5/5 PASS (lint, typecheck, build, full test suite, live playwright)
- Tests: 240 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-09-ULogLhW — live-verified at 390×844: board occupies 96.1% of viewport width, `<aside>` computed `display: none` when unselected (`SidePanel.tsx:65-67`, `app/graph/page.tsx:104`)
- ✅ TOR-09-Gx908bc — live-verified: tapping a node made `<aside>` `position: fixed`, `bottom: 0px`, `max-height: 590.8px` (70vh), showing the tapped node's detail
- ✅ TOR-09-FSqHlRx — live-verified: tapping the "Accenture" connected-page chip inside the open sheet re-rendered it with Accenture's own detail and made it the selected node
- ✅ TOR-09-rOB5DZW — live-verified: closing the sheet returned `<aside>` to `display: none`; tapping a different node reopened it with that node's detail; zero console errors throughout
- ✅ TOR-09-kMjRcRb — live-verified: header right edge 374.67px, search input right edge 358.67px (both < 390px viewport), computed input `font-size: 16px`
- ⚠️ `docs/design-notes.md` §21 is stale below `md:` — deferred to Step 4 doc refresh, not a defect

### Conclusion
All 5 TOR requirements are independently confirmed against real DOM state and computed styles,
not just source-string assertions — the reviewer drove the actual flow (select → chip re-target →
dismiss → reselect) against live second-brain vault data at the 390px design floor with zero
console errors, then confirmed desktop (1280×800) is pixel-identical to pre-epic behavior.
Sufficient for sign-off.

### Manual verification performed: No

## Known Issues / Follow-ups

- A very long, untruncated pill title (per the intentional no-ellipsis rule from TOR-06-cSCqVtt)
  can visually clip against its lane's `overflow-hidden` boundary at 390px width. This does not
  create an actual page-level horizontal scrollbar and no TOR in this epic requires full
  pill-title visibility at narrow widths — an observed, out-of-scope tradeoff, not a regression.
- `docs/design-notes.md` §21 needs a follow-up edit to reflect the mobile bottom-sheet behavior
  introduced by this epic — handled by the Step 4 automated doc refresh.

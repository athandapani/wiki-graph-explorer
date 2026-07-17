# Epic xvzgc4Z: Visual Identity, Typography & Hero — Implemented

## What Was Built

The site now actually renders in the Geist typeface (it was loaded via `next/font` but silently
overridden by a hardcoded Arial rule), the header logo and home-page CTA are tinted with the
graph's own folder-color palette instead of a stock Tailwind blue, `/graph` opens with a hero row
naming the page's identity and a one-line promise of what the map is, and every interactive
control on the page now shows a visible keyboard focus ring — including pills inside the
swim-lane board's `overflow-hidden` lane containers, which a plain `outline` would have silently
clipped.

## Key Files

| File | Purpose |
|------|---------|
| `app/globals.css` | Removed the hardcoded `Arial` fallback from `body` so Tailwind's `--font-sans`→Geist binding takes effect; added `--accent` custom property (`:root`/`.dark`, mirroring `nodeColor.ts`); added a global `:focus-visible` rule with a negative `outline-offset` so the ring stays inside the element's own box under clipping ancestors |
| `components/graph/nodeColor.ts` | Added `ACCENT_LIGHT`/`ACCENT_DARK` exports (palette slot 0) as the shared accent source |
| `components/graph/Header.tsx` | Added optional `tagline?: string` prop; header becomes `flex-col` with the tagline rendered below the existing logo/title/search row when present; title bumps to hero size/weight (`text-xl font-bold`) only when `tagline` is set; `<Logo>` retinted to `text-[var(--accent)]` |
| `app/graph/page.tsx` | Passes the hero tagline into `<Header>` |
| `app/page.tsx` | Retinted the hero graphic and CTA button from `blue-500`/`blue-600` to `var(--accent)` |
| `tests/globals-css.test.ts` (new), `tests/node-color.test.ts`, `tests/header.test.ts`, `tests/graph-page.test.ts`, `tests/home-page.test.ts` | New/updated coverage for all 5 TORs |

## Key Decisions

- **Branch stacked on Epic H0q48k8's branch, not `master`.** `master` doesn't yet have H0q48k8's
  swim-lane container/heading changes (PR #12 is open, not merged), and this epic's dependency is
  specifically on that work ("lane containers and headings to style"). Branched from
  `feature/epic-H0q48k8-swim-lane-board-completion` instead — same pattern already established in
  this project (Epic vH3Ls3h was stacked on niaTair for an analogous reason). Confirmed with the
  user before proceeding.
- **Tagline is `/graph`-only, not shared with `/`.** `Header.tsx`'s `tagline` prop is optional and
  the home page doesn't pass one, so its header is visually unchanged — `/` already got its own,
  larger hero treatment in Epic hxffZxb and doesn't need a second one bolted onto the shared
  header component.
- **`--accent` is a CSS custom property, not a JS-threaded prop.** `app/page.tsx` (home) is a
  plain server-rendered component with no `isDark` state to pass down; CSS vars solve this the
  same way the pre-existing `--background`/`--foreground` pair already does, so this follows that
  established pattern rather than introducing prop-drilling.
- **Focus ring uses `outline-offset: -2px`, not the default positive offset.** `SwimLaneCanvas`'s
  lane containers and board wrapper both use `overflow-hidden`; a plain outline drawn outside the
  element's box would be silently clipped there, which is the most likely explanation for why
  keyboard focus was invisible before this epic. A negative offset draws the ring inside the
  element's own box, so it survives that clipping — confirmed live against a pill inside a
  clipped lane.

## Spec Deviations

None. Implemented exactly as scoped against each TOR's Given/When/Then.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-07-37VPhrV | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/globals-css.test.ts`; live-verified — `getComputedStyle(document.body).fontFamily` resolves to `"Geist, \"Geist Fallback\""`, no Arial |
| TOR-07-DsHsIKN | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/header.test.ts`; hero heading (`text-xl font-bold`, 20px/700) visually and structurally exceeds lane headings (`text-xs font-semibold`, 12px/600), which in turn out-weight side-panel body text (`text-sm`, 14px/400, no bold) — confirmed via screenshot |
| TOR-07-7ha0SK5 | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/node-color.test.ts`, `tests/globals-css.test.ts`, `tests/header.test.ts`, `tests/home-page.test.ts`; live-verified — logo `getComputedStyle(...).color` = `rgb(57, 135, 229)` matching `--accent` (`#3987e5`) in dark theme, `#2a78d6` in light theme |
| TOR-07-juwVT2o | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/globals-css.test.ts`; live-verified — Tab-focusing a pill inside `SwimLaneCanvas`'s `overflow-hidden` lane shows `outline: 2px solid rgb(57,135,229)` / `outline-offset: -2px`, fully visible and uncropped (screenshot), in both themes |
| TOR-08-qBVi9Aa | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/header.test.ts`, `tests/graph-page.test.ts`; live-verified — hero row (identity + "Every page of this wiki in one map — click anything to see what it is and how it connects.") visible above the board with no scroll, in both themes |

## Verification Results

- `npx vitest run tests/globals-css.test.ts tests/node-color.test.ts tests/header.test.ts tests/graph-page.test.ts tests/home-page.test.ts` — PASS (36/36)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (236/236, up from 227 — 9 new tests added)
- Live `playwright-cli` verification against `npm run dev`: confirmed computed `font-family`
  resolves to Geist (not Arial); confirmed accent color renders correctly on the header logo and
  focus rings in both light (`#2a78d6`) and dark (`#3987e5`) themes; confirmed the hero row is
  visible above the board without scrolling; confirmed a Tab-focused pill inside an
  `overflow-hidden` swim-lane container shows a fully visible, uncropped focus ring. One
  transient false read (focus styles captured before Chromium's post-focus style recalc settled,
  in the same `evaluate` call as the triggering keypresses) was caught and re-verified with a
  separate follow-up read, which showed the correct values consistently. Zero console errors
  throughout.

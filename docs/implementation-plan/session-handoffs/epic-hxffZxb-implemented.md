# Epic hxffZxb: Home Page Hero & Visual Flair — Implemented

## What Was Built

The home page (`/`) now uses a real two-column hero layout instead of a narrow `max-w-2xl`
centered text column on an otherwise-empty viewport. On large viewports (`lg:` and up), the
existing product description / "How to use it" / CTA content sits in a left column while a
decorative, non-interactive SVG "graph teaser" (abstract nodes and connecting lines, subtly
pulsing) fills the right column that a design-flair review flagged as dead space. On small
viewports the page renders exactly as before — single column, teaser hidden — since responsive
polish is out of scope for this epic.

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Restructured `<main>` into an `lg:grid-cols-2` layout; added `HERO_NODES`/`HERO_EDGES` data and a local `HomeHeroGraphic` component (decorative SVG, `aria-hidden="true"`, `currentColor`-based so it themes automatically); all existing text content preserved verbatim |
| `app/globals.css` | Added `hero-pulse` `@keyframes` for the teaser's staggered opacity animation, referenced via a Tailwind v4 arbitrary-value `animate-[...]` utility paired with `motion-reduce:animate-none` |
| `tests/home-page.test.ts` | Existing TOR-07-Yp2cVxJ test unchanged (content wasn't touched); added a new test guarding against regressing back into the narrow centered-column layout |

## Spec Deviations

None. Implemented as planned — a layout/visual-treatment change only, with the existing text
content preserved verbatim as the spec required.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-07-Yp2cVxJ | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/home-page.test.ts:8,16`; live-verified via `playwright-cli` at 1440×900 (light + dark theme) and 390×844 — hero graphic renders in the previously-empty right column on desktop, page collapses to today's single column on mobile, CTA click navigates to `/graph`, zero console errors |

## Verification Results

- `npx vitest run tests/home-page.test.ts` — PASS (2/2)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (217/217)
- Live `playwright-cli` verification: desktop (1440×900) light and dark theme both render the
  hero graphic cleanly in the right column with legible contrast; mobile (390×844) is pixel-identical
  to the pre-epic single-column layout; "Open the graph →" CTA navigates to `/graph`; no console
  errors in either state.

## Known Issues / Follow-ups

None. Full responsive polish (beyond the mobile/desktop split verified here) remains `nB4iwQu`'s
scope. The declared palette/folder-color accent system referenced by the epic spec as an optional
future input (`xvzgc4Z`) has not landed yet, so this hero uses only the existing `blue-500` accent
and foreground/background tokens — revisit if `xvzgc4Z` ships a different accent system later.

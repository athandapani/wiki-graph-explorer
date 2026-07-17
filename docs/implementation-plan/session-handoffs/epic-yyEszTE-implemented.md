# Epic yyEszTE: Logo & Brand Mark Redesign — Implemented

## What Was Built

`components/graph/Logo.tsx`'s mark was replaced: the old 4-circle/3-line symmetric star is now
an "Orbit Node" mark — one large hub circle, one smaller satellite circle, and one bold
connecting line, all themed via `currentColor` so it still adapts to the header's accent color
and dark/light mode. `app/icon.svg` was added using Next.js's static-SVG-icon convention (the
same mark in fixed colors matching the app's dark theme), and the stale default `app/favicon.ico`
was deleted, so the browser tab icon now matches the in-page logo instead of showing the generic
Next.js icon.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/Logo.tsx` | New Orbit Node mark (hub circle r=6 at (8,16), satellite circle r=3.5 at (17,7), connecting line strokeWidth=2.5); `role="img"`, `aria-label`, `currentColor` theming, and `className` passthrough all unchanged |
| `app/icon.svg` | New file — Next.js auto-detected favicon using the same mark in fixed colors (`#0a0a0a` background, `#3987e5` mark, matching the app's actual dark-mode `--accent`) |
| `app/favicon.ico` | Deleted — one unambiguous icon source now |
| `tests/logo.test.ts` | New — asserts the a11y contract survives, `currentColor` theming (no hardcoded fill/stroke), and exactly 2 `<circle>` + 1 `<line>` (regression guard against reverting to the old mark) |

## Key Decisions

- Used the app's actual current dark-mode `--accent` (`#3987e5`, `app/globals.css:16`) for the
  favicon color instead of the prior session's plan (`#3b82f6`/Tailwind blue-500), since
  `Header.tsx` no longer applies `text-blue-500` to the logo — a later epic (xvzgc4Z) switched it
  to `text-[var(--accent)]`. The favicon should match what visitors actually see in the header.
- `Header.tsx` required no changes — the new mark keeps the same 24×24 `viewBox`, so the existing
  `h-6 w-6 text-[var(--accent)]` sizing/tint classes apply unmodified.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-07-Ht6rMqL | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/logo.test.ts`, `tests/header.test.ts`; live-verified |

## Spec Deviations

None. Implemented exactly as scoped against the TOR's Given/When/Then, with one corrected detail
(favicon accent color) versus the prior session's unexecuted plan — not a deviation from the spec
itself, since the spec's Key Components section only says "an icon derived from the new mark," not
a specific color.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-07-Ht6rMqL | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/logo.test.ts`; `tests/header.test.ts` (unaffected, still asserts `<Logo` + "Wiki Graph Explorer" + `href="/"`); live-verified at `/` and `/graph` — header renders the new Orbit Node mark, `<link rel="icon" href=".../icon.svg">` auto-wired by Next.js, `/icon.svg` serves the new mark's SVG content, zero console errors |

## Verification Results

- `npx vitest run tests/logo.test.ts tests/header.test.ts` — PASS (8/8)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS (`/icon.svg` listed as a prerendered static route)
- `npm test` — PASS (239/239 on this branch, based off `master` without Epic nB4iwQu's
  as-yet-unmerged test additions)
- Live `playwright-cli` verification against `npm run dev`:
  - `/` and `/graph`: header `<svg aria-label="Wiki Graph Explorer logo">` renders the new
    hub-circle/satellite-circle/connecting-line mark in the accent color, confirmed via DOM
    inspection and a visual screenshot
  - `<link rel="icon">` present in `<head>`, pointing at `/icon.svg`; `curl`'d content matches
    the authored SVG exactly (dark background, accent-blue mark)
  - Zero console errors on both pages

## Known Issues / Follow-ups

None.

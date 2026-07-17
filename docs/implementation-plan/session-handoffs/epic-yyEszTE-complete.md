# Epic yyEszTE: Logo & Brand Mark Redesign — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic yyEszTE`

## What Was Built

`components/graph/Logo.tsx`'s mark was replaced: the old 4-circle/3-line symmetric star is now
an "Orbit Node" mark — one large hub circle, one smaller satellite circle, and one bold
connecting line, all themed via `currentColor` so it still adapts to the header's accent color
and dark/light mode. `app/icon.svg` was added using Next.js's static-SVG-icon convention, and the
stale default `app/favicon.ico` was deleted, so the browser tab icon now matches the in-page logo
instead of showing the generic Next.js icon.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/Logo.tsx` | New Orbit Node mark (hub circle r=6 at (8,16), satellite circle r=3.5 at (17,7), connecting line strokeWidth=2.5); `role="img"`, `aria-label`, `currentColor` theming, and `className` passthrough all unchanged |
| `app/icon.svg` | New file — Next.js auto-detected favicon using the same mark in fixed colors (`#0a0a0a` background, `#3987e5` mark, matching the app's actual dark-mode `--accent`) |
| `app/favicon.ico` | Deleted — one unambiguous icon source now |
| `tests/logo.test.ts` | New — asserts the a11y contract survives, `currentColor` theming, and exactly 2 `<circle>` + 1 `<line>` (regression guard) |

## Key Decisions

- Used the app's actual current dark-mode `--accent` (`#3987e5`) for the favicon color instead of
  a prior session's unexecuted plan (`#3b82f6`/Tailwind blue-500), since `Header.tsx` no longer
  applies `text-blue-500` to the logo — a later epic (xvzgc4Z) switched it to
  `text-[var(--accent)]`.
- `Header.tsx` required no changes — the new mark keeps the same 24×24 `viewBox`.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-07-Ht6rMqL | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | `tests/logo.test.ts:11`, `tests/header.test.ts`; live-verified |

## Verification Summary

### Counts
- TOR Requirements: 1/1 PASS
- Quality Gates: 4/4 PASS (lint, typecheck, build, live playwright)
- Tests: 239 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-07-Ht6rMqL — live-verified at `/` and `/graph`: header renders the new Orbit Node mark, browser tab title is "Wiki Graph Explorer", `<link rel="icon">` auto-wired to `/icon.svg`, zero console errors (`components/graph/Logo.tsx:1-23`, `tests/logo.test.ts:11-28`)
- ✅ Regression guard: exactly 2 `<circle>` + 1 `<line>` asserted, preventing a silent revert to the old mark
- ✅ A11y contract preserved: `role="img"` + `aria-label` unchanged, `currentColor` theming intact
- ⚠️ `docs/design-notes.md` §45 references a now-stale `Logo.tsx` stroke convention (`strokeWidth=1.75`) — the new mark uses `strokeWidth={2.5}` on its one line and filled circles. Not a defect; addressed by the Step 4 automated doc refresh in this wrapup.

### Conclusion
The TOR requirement is independently confirmed against real DOM state — the reviewer drove `/`
and `/graph` live, inspected the rendered SVG and the auto-wired favicon link, and confirmed zero
console errors. Sufficient for sign-off.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/design-notes.md` §45's stale cross-reference to `Logo.tsx`'s old stroke convention —
  handled by this wrapup's Step 4 automated doc refresh.

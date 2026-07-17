# Epic xvzgc4Z: Visual Identity, Typography & Hero — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic xvzgc4Z`

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
  swim-lane container/heading changes (PR #12 open, not merged at implementation time), and this
  epic's dependency is specifically on that work. Branched from
  `feature/epic-H0q48k8-swim-lane-board-completion` instead, matching this project's existing
  precedent (Epic vH3Ls3h was stacked on niaTair for an analogous reason). Confirmed with the user
  before proceeding. **Consequence for shipping:** `git log master..HEAD` on this branch includes
  H0q48k8's 3 commits in addition to xvzgc4Z's own — a PR opened from this branch must target
  H0q48k8's branch (or wait for PR #12 to merge to `master` first and rebase), not `master`
  directly.
- **`--accent` is a CSS custom property, not a JS-threaded prop.** `app/page.tsx` (home) is a
  plain server-rendered component with no `isDark` state to pass down; CSS vars solve this the
  same way the pre-existing `--background`/`--foreground` pair already does.
- **Focus ring uses `outline-offset: -2px`.** `SwimLaneCanvas`'s lane containers and board wrapper
  both use `overflow-hidden`; a plain outline drawn outside the element's box would be silently
  clipped there — independently confirmed live via a real Tab-key sequence landing on a button
  nested inside an `overflow-hidden` ancestor, still showing a fully visible ring.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-07-37VPhrV | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/globals-css.test.ts:8 |
| TOR-07-DsHsIKN | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/header.test.ts:36 |
| TOR-07-7ha0SK5 | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/node-color.test.ts:23, tests/globals-css.test.ts:13, tests/header.test.ts:25, tests/home-page.test.ts:21 |
| TOR-07-juwVT2o | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/globals-css.test.ts:18 |
| TOR-08-qBVi9Aa | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/header.test.ts:30, tests/graph-page.test.ts:176 |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS
- Quality Gates: 4/4 PASS (build, lint, typecheck, full test suite 236/236)
- Tests: 236 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-07-37VPhrV — live-confirmed on both `/` and `/graph`, in both themes: `getComputedStyle(document.body).fontFamily` resolves to `"Geist, \"Geist Fallback\""`, never Arial (`app/globals.css:26-29`)
- ✅ TOR-07-DsHsIKN — computed styles independently confirm the hierarchy: hero heading 20px/700 > lane heading 12px/600 (wins via weight) > side-panel body 14px/400 — actual rendered `getComputedStyle` comparison, not just source-string matching (`components/graph/Header.tsx:22`)
- ✅ TOR-07-7ha0SK5 — live-confirmed logo/CTA render `rgb(57,135,229)` (`#3987e5`, dark) / `rgb(42,120,214)` (`#2a78d6`, light) on both `/` and `/graph`, matching `nodeColor.ts`'s `ACCENT_DARK`/`ACCENT_LIGHT` exactly
- ✅ TOR-07-juwVT2o — live-confirmed via a real Tab-key sequence (not programmatic `.focus()`, which unreliably triggers `:focus-visible`): a Tab-focused button confirmed to sit inside an `overflow-hidden` ancestor still shows a fully visible `outline: 2px solid rgb(57,135,229)` / `outline-offset: -2px`
- ✅ TOR-08-qBVi9Aa — live-confirmed `header.getBoundingClientRect()` is fully within the viewport (no scroll needed), displaying identity + tagline text verbatim

### Conclusion
All 5 TOR Given/When/Then behaviors are independently confirmed both by source inspection and live
computed-style interaction — including catching and correcting a transient false read on the
focus-ring check (a same-`evaluate` race between keypress and style recalc) by re-verifying with a
settled read. Quality gates are clean, zero console errors throughout.

### Manual verification performed: No

## Known Issues / Follow-ups

- **Branch stacking requires special shipping handling.** This branch carries H0q48k8's commits
  in addition to its own (see Key Decisions above). Do not open a PR against `master` directly —
  target H0q48k8's branch, or wait for PR #12 to merge and rebase first.
- `docs/architecture.md`/`docs/design-notes.md` predate this epic's decisions (Geist fix, accent
  system, focus-ring approach) — addressed by the automatic doc refresh that follows this handoff.

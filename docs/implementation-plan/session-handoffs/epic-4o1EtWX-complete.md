# Epic 4o1EtWX: Theme Chooser — Complete

**Completed:** 2026-07-20
**Verified by:** Independent review via `/peak-workflow:wrapup-epic 4o1EtWX`

## What Was Built

A header-level theme chooser: an icon-only sun/moon dark/light toggle plus a "Theme presets"
dropdown offering 3 curated font+accent presets (Teal/Manrope+Inter, Indigo/Space Grotesk+IBM
Plex Sans, Plum/Fraunces+Source Sans 3) and a 4th "Custom" option with a color picker for an
arbitrary accent, chrome-only, with a visible CVD/contrast disclosure. Selecting a curated preset
re-themes both the page chrome (font + accent) and the graph's full 8-hue node color palette
together, each independently validated via the dataviz skill's palette checks; a custom accent
re-themes chrome only. Selection persists across reloads via localStorage, with an anti-flash
script applying the stored preset/custom accent before first paint.

## Key Files

| File | Purpose |
|------|---------|
| `lib/theme-presets.ts` | `THEME_PRESETS` registry (3 curated presets, accents derived from `nodeColor.ts`'s `PRESET_PALETTES` slot 0) + localStorage persistence helpers |
| `components/graph/nodeColor.ts` | `PRESET_PALETTES` — one full validated 8-hue array per preset (both light/dark) — plus `setActivePreset(id)`/`resetPaletteToDefault()` that swap the entire active palette |
| `components/graph/ThemeToggle.tsx` | Icon-only sun/moon header button (both icons always rendered, toggled via static `dark:` CSS to avoid hydration mismatch) |
| `components/graph/ThemePresetPicker.tsx` | Header dropdown: 3 curated swatches + Custom, custom color picker + disclosure note |
| `components/graph/OptionsPanel.tsx` | Theme controls removed; relabeled "Help" with rewritten copy |
| `app/layout.tsx` | 4 additional `next/font/google` imports; anti-flash `<script>` applies stored theme preset/custom accent before paint |
| `app/globals.css` | `[data-theme-preset="indigo"/"plum"]` font-variable blocks; plain font-family rules bypassing Tailwind v4's `@theme inline` baking |
| `app/graph/page.tsx` | Theme preset/custom-accent state and handlers; header composition |
| `tests/theme-presets.test.ts`, `tests/theme-toggle.test.tsx`, `tests/theme-preset-picker.test.tsx`, `tests/node-color.test.ts`, `tests/layout.test.ts` | TOR coverage for registry, persistence, toggle, dropdown, palette swap, and anti-flash script |

## Key Decisions

- Each of the 3 curated presets carries its own complete, independently-validated 8-hue
  categorical palette (not a shared base with a swappable slot-0 accent) — a full re-palette
  every folder recolors on preset switch, not just one.
- All 3 presets reuse the same 8 validated hue families, reordered per preset (promoting a
  different hue to slot 0) rather than inventing new hue families — the dataviz skill's method
  treats hue order as a separable "theme" on fixed, already-safe anchors.
- Custom accent is deliberately chrome-only (no `setActivePreset` call, no palette re-validation)
  since an arbitrary visitor-chosen color has no CVD/contrast guarantee — disclosed visibly in
  the UI rather than implying parity with curated presets.
- Theme/font/accent controls live as standalone header icons rather than inside the "Options &
  help" popover (direct user instruction during planning) — that popover was relabeled "Help".
- The anti-flash inline `<script>` in `app/layout.tsx` necessarily duplicates preset→accent hex
  values (it must run before any JS module import, so it can't reference `PRESET_PALETTES`
  directly) — a regression-guard test (`tests/layout.test.ts`) now builds its expected substring
  from the live `PRESET_PALETTES` export so a future palette change that forgets to update the
  duplicate fails immediately instead of silently drifting again (see Known Issues history below).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-07-6nVdgBJ | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:23 |
| TOR-07-VBZZx0f | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:39, tests/node-color.test.ts:41 |
| TOR-07-LquSsD5 | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:66 |
| TOR-07-p18cpcx | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:97 |
| TOR-07-HKyFd0T | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:79 |
| TOR-07-WU8PBMV | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/layout.test.ts:16, tests/layout.test.ts (regression guard) |
| TOR-07-dttI7qm | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | tests/theme-preset-picker.test.tsx:114, tests/node-color.test.ts:63 |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS
- Quality Gates: 4/4 PASS
- Tests: 355 passed, 0 skipped, 0 failed (50 test files)

### Highlights
- ✅ TOR-07-6nVdgBJ — 3 curated presets + Custom render as header dropdown swatches (tests/theme-preset-picker.test.tsx:23, components/graph/ThemePresetPicker.tsx:74-102)
- ✅ TOR-07-VBZZx0f — live-verified: clicking Indigo via UI set `--accent` to `#9085e9` and swapped the full 8-hue graph palette (app/graph/page.tsx:109-127, components/graph/nodeColor.ts:100-105)
- ✅ TOR-07-p18cpcx / TOR-07-HKyFd0T — live-verified: Custom reveals a picker + CVD disclosure note; picking a hex updates only `--accent`, never the graph palette
- ✅ TOR-07-dttI7qm — live-verified: switching Custom → Plum applied `#d55181` to chrome, in sync with the graph
- ⚠️ TOR-07-WU8PBMV — independent review found the anti-flash script's duplicated accent map stale after this epic's own mid-review re-palette rework (still held pre-rework draft hex values for Indigo/Plum), so a returning visitor's curated-preset chrome accent was silently wrong on reload. Fixed during wrapup: map corrected to match `PRESET_PALETTES`, plus a regression-guard test tying the duplicate to the live palette export. Re-verified live: Indigo/Plum reload now applies the correct accent.

### Conclusion
All 7 TORs are implemented and live-verified end-to-end against the real `second-brain` vault.
Independent review during wrapup caught one real defect (stale accent values in the anti-flash
script, isolated to Indigo/Plum reload) that the implementer's own live testing had missed because
it only exercised custom-accent reload, not curated-preset reload. The fix was narrow, verified
live, and paired with a regression-guard test tying the duplicated value to its source of truth.

### Manual verification performed: No

## Known Issues / Follow-ups

- The teal baseline's one pre-existing normal-vision-floor FAIL (orange↔magenta light, red↔magenta
  dark) remains un-addressed by choice — it predates this epic and reordering teal's own hues was
  out of scope for the palette rework.

# Epic 4o1EtWX: Theme Chooser — Implemented

## What Was Built

The Options & help popover's light/dark toggle and a new theme-preset picker now live as
standalone icons in the header, next to the pane-count control. `ThemeToggle` is an icon-only
sun/moon button (was a text button inside the popover). A new `ThemePresetPicker` header dropdown
offers 3 curated font+accent presets (Teal/Manrope+Inter, Indigo/Space Grotesk+IBM Plex Sans,
Plum/Fraunces+Source Sans 3) plus a 4th "Custom" option with a color picker for an arbitrary
accent color, chrome-only, with a visible CVD/contrast disclosure note. Selecting a curated
preset updates both the chrome (font/accent) and the graph's node color palette together; a
custom accent re-themes chrome only. Selection persists across reloads via localStorage, with an
anti-flash script extension so a returning visitor's preset/custom accent applies before first
paint. The former "Options & help" popover, now theme-control-free, is relabeled "Help" and its
copy was rewritten for scannability (bulleted "How to use it", trimmed "Why this exists", and a
new "Build this for your own wiki" section pointing at the `build:graph` CLI).

**Rework (post-wrapup):** The first pass validated each preset as "this accent in slot 0 + the 7
existing fixed hues" — i.e. only 1 of 8 categorical folder-color slots actually changed per
preset, so switching presets barely recolored the graph (only the chrome and whichever single
folder happened to occupy slot 0 changed). Live verification during `/peak-workflow:wrapup-epic`
surfaced this as a real product gap, not just a nitpick, and the epic was reopened for a full
re-palette: each of the 3 presets now carries its own complete, independently-validated 8-hue
categorical palette (see `nodeColor.ts`'s `PRESET_PALETTES` below), so every visible swim-lane
recolors on a preset switch, not just one. See Spec Deviations for the one visible consequence
(Indigo/Plum's exact accent hex changed) and TOR Coverage for the re-verified results.

## Key Files

| File | Purpose |
|------|---------|
| `lib/theme-presets.ts` (NEW) | `THEME_PRESETS` registry (3 curated presets) + localStorage persistence helpers for preset id and custom accent; `accentLight`/`accentDark` are now derived from `nodeColor.ts`'s `PRESET_PALETTES[id]` slot 0 rather than independently hardcoded (rework) |
| `components/graph/nodeColor.ts` | Rework: replaced the single shared `LIGHT_PALETTE`/`DARK_PALETTE` + slot-0-only `setPaletteAccent` with `PRESET_PALETTES` (one full validated 8-hue array per preset, both modes) and `setActivePreset(id)`/`resetPaletteToDefault()`, which swap the entire active palette |
| `components/graph/ThemeToggle.tsx` | Converted from a text button to an icon-only sun/moon button; both icons always rendered, toggled via static `dark:` CSS (not JS-conditional rendering) to avoid a structural hydration mismatch — see Spec Deviations |
| `components/graph/ThemePresetPicker.tsx` (NEW) | Header dropdown: 3 curated swatches + Custom, controlled open/close (same backdrop pattern as `OptionsPanel`), custom color picker + disclosure note |
| `components/graph/OptionsPanel.tsx` | Dropped the "Color theme" section and `isDark`/`onThemeChange` props; relabeled `aria-label` to "Help"; rewrote the Help/Why-build-this copy; added "Build this for your own wiki" |
| `app/layout.tsx` | Added 4 `next/font/google` imports (Space Grotesk, IBM Plex Sans, Fraunces, Source Sans 3); extended the anti-flash `<script>` to apply a stored theme preset/custom accent before paint |
| `app/globals.css` | `[data-theme-preset="indigo"/"plum"]` blocks; plain `body`/`h1`-`h6`/`.heading-font` rules using `var(--font-sans)`/`var(--font-heading)` — required after discovering Tailwind v4's `@theme inline` bakes those tokens into `.font-sans`/`.font-heading` utility classes at build time (see Spec Deviations) |
| `components/graph/Header.tsx` | Title span switched from Tailwind's `font-heading` utility class to the new plain `.heading-font` class |
| `app/graph/page.tsx` | `themePreset`/`customAccent`/`paletteVersion`/`isThemePickerOpen` state; `handleThemePresetChange`/`handleCustomAccentChange`; `handleThemeChange` reapplies the active accent on dark/light flip; new Esc-chain layer; header composition (`ThemeToggle`, `ThemePresetPicker` between `PaneCountControl` and `OptionsPanel`) |
| `components/graph/SwimLaneCanvas.tsx`, `DualPaneBoard.tsx` | New `paletteVersion?: number` prop, added to `SwimLaneCanvas`'s `connectorPaths` effect dependency array so connector-line colors recompute on a preset change alone |
| `tests/theme-presets.test.ts`, `tests/theme-toggle.test.tsx`, `tests/theme-preset-picker.test.tsx` (NEW) | Registry/persistence, icon-toggle behavior, dropdown/TOR coverage |
| `tests/node-color.test.ts` | Rework: replaced the "slot 0 only" tests with assertions that `setActivePreset` swaps the entire 8-hue array (both modes) and `resetPaletteToDefault` restores all 8 teal slots; added a test that each of `PRESET_PALETTES`'s 3 presets has 8 valid, distinct hex entries per mode |
| `tests/layout.test.ts`, `tests/options-panel.test.ts`, `tests/options-panel.test.tsx`, `tests/graph-page.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/dual-pane-board.test.ts` | Extended for the anti-flash script, Help relabel/copy, header composition, Esc-chain order, and `paletteVersion` wiring |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|-----------------|--------|
| TOR-07-6nVdgBJ | Presets/toggle live inside the "Options & help popover" | Dark/light is a standalone header icon; the 3 presets + Custom are a separate header dropdown | Direct user instruction during planning (this session) — confirmed via plan approval. Given/When/Then intent (both controls are discoverable and usable on `/graph`) is preserved; only the container changed. |
| (no TOR anchor) | — | Header popover relabeled "Options & help" → "Help"; copy rewritten (bulleted "How to use it", trimmed "Why this exists", new "Build this for your own wiki" section) | Follows directly from the header relocation above (theme controls no longer live in this popover) plus a direct user request for more scannable, executive-readable copy and a build-your-own-wiki note. TOR-06-DRtjcOk and TOR-05-G72S3H4's underlying content requirements (a persistent layout-mode control; second-brain/dynamic-context/content-gap descriptive text) still hold — verified against the rewritten copy, not just the old literal heading text. |
| TOR-07-VBZZx0f, TOR-07-dttI7qm | Indigo accent `#2a78d6`/`#5b93e0`, Plum accent `#a13d8f`/`#bd6cb3` (first-pass draft values) | Indigo accent `#4a3aa7`/`#9085e9` (the palette's own "violet" hue promoted to slot 0), Plum accent `#e87ba4`/`#d55181` (the palette's own "magenta" hue promoted to slot 0) | Rework requirement: reuse only already-validated hues so each preset's full 8-hue palette passes the dataviz skill's CVD/contrast checks without inventing new hue families (an ad-hoc hue-rotation of the whole set was tried first and reliably broke the lightness-band/CVD checks). Reordering the existing 8 validated hues per preset — promoting a different hue to slot 0 and reordering the rest — is the method's own documented "theme" mechanism (`references/color-formula.md`: "the slot order is a separable, named choice ... on the same hues and the same six checks"). Both new accents still read as "cooler blue-violet" (Indigo) and "warm pink-mauve" (Plum), matching the preset names; the Given/When/Then intent (a curated preset re-themes chrome + graph together to validated values) is fully preserved. |

Two implementation-time findings surfaced during live verification, fixed inline (not deviations
from any TOR — both are technical corrections needed to make the plan's stated design actually
work):

- **SSR/hydration mismatch (`ThemeToggle`):** relocating the toggle to always-visible header
  chrome (previously only mounted after a user opened the popover) exposed a pre-existing
  SSR/anti-flash-script timing gap — the server always renders assuming dark, but the anti-flash
  script may have already flipped the DOM before hydration. Fixed by rendering both icons always
  (toggled via static `dark:` CSS, not JS-conditional structure) plus `suppressHydrationWarning`
  on the button for the residual `aria-pressed`/`aria-label` attribute-only mismatch — same
  accepted pattern design-notes.md §24 already established for `<html className>`.
- **Tailwind v4 `@theme inline` bakes referenced values at build time:** the plan flagged this as
  a risk to verify live. Confirmed: `.font-sans`/`.font-heading` utility classes stayed frozen to
  Inter/Manrope even after the `[data-theme-preset]` override changed the underlying custom
  properties, while plain CSS rules using `var(--font-heading)`/`var(--font-sans)` (not generated
  by `@theme inline`) responded correctly. Fixed per the plan's documented fallback: `body` and
  `Header.tsx`'s title span now use plain rules/a new `.heading-font` class instead of the baked
  Tailwind utilities.

## TOR Coverage

Re-verified after the full-palette rework (all 7 TORs live-verified end-to-end against the real
`second-brain` vault a second time — see Verification Results):

| TOR ID | Feature File | Verdict | Notes |
|--------|--------------|---------|-------|
| TOR-07-6nVdgBJ | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | Live-verified: header shows sun/moon toggle + "Theme presets" dropdown with 4 swatches (Teal/Indigo/Plum/Custom) |
| TOR-07-VBZZx0f | same | PASS | Live-verified: selecting Indigo updated `--accent` to `#9085e9` (dark mode) AND **all 5 visible swim-lanes** to `PRESET_PALETTES.indigo.dark[0..4]` exactly (violet/green/magenta/yellow/aqua) — not just slot 0/lane 0 as in the first pass |
| TOR-07-LquSsD5 | same | PASS | Live-verified: selecting Custom revealed the color picker + disclosure with `--accent` unchanged until a color was actually picked |
| TOR-07-p18cpcx | same | PASS | Live-verified: picking `#ff00aa` updated `--accent` only; all 5 graph lane colors stayed at Indigo's full palette values, unchanged |
| TOR-07-HKyFd0T | same | PASS | Live-verified: disclosure note ("not checked for color-vision-deficiency safety or contrast") present only while Custom is active |
| TOR-07-WU8PBMV | same | PASS | Live-verified: a custom accent (`#ff00aa`) survived a full page reload with the correct dark-mode palette state, zero visual flash and zero console errors |
| TOR-07-dttI7qm | same | PASS | Live-verified: switching from Custom to Plum updated `--accent` to `#d55181` AND **all 5 visible lanes** to `PRESET_PALETTES.plum.dark[0..4]` exactly, together in one action |

## Verification Results

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (354/354, 50 test files)
- Live `playwright-cli` verification against `npm run dev`, rebuilt against the real
  `second-brain` vault (47 nodes, 96 edges): all 7 TORs re-exercised end-to-end (see TOR Coverage
  above) with the new full-palette behavior — confirmed via direct DOM/CSS inspection that every
  visible swim-lane's background color matches the active preset's own `PRESET_PALETTES` array,
  not just slot 0. Zero console errors throughout, including a cold reload with cleared
  localStorage.
- Palette validation: `PRESET_PALETTES.indigo` and `PRESET_PALETTES.plum` (both light and dark)
  run through the dataviz skill's `validate_palette.js` — **ALL CHECKS PASS** in all 4 runs (no
  FAIL, and the only WARN is the same sub-3:1-contrast WARN the shipped teal baseline already
  carries, legal since folder identity is never color-alone — every pill always shows its full
  title text). This is strictly cleaner than the teal baseline, which carries one accepted
  normal-vision-floor FAIL (orange↔magenta light ΔE 12.9, red↔magenta dark ΔE 7.8) predating this
  epic.

## Known Issues / Follow-ups

None. (The teal baseline's one pre-existing normal-vision-floor FAIL — orange↔magenta light,
red↔magenta dark — remains un-addressed by choice, as before this epic; it predates this epic and
reordering teal's own hues was out of scope for this rework.)

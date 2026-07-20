# Epic 4o1EtWX: Theme Chooser — Implemented

## What Was Built

The Options & help popover's light/dark toggle and a new theme-preset picker now live as
standalone icons in the header, next to the pane-count control. `ThemeToggle` is an icon-only
sun/moon button (was a text button inside the popover). A new `ThemePresetPicker` header dropdown
offers 3 curated font+accent presets (Teal/Manrope+Inter, Indigo/Space Grotesk+IBM Plex Sans,
Plum/Fraunces+Source Sans 3 — each validated as a full 8-slot categorical palette against the
dataviz skill's `validate_palette.js`, with no new pass/warn/fail vs. the shipped teal baseline)
plus a 4th "Custom" option with a color picker for an arbitrary accent color, chrome-only, with a
visible CVD/contrast disclosure note. Selecting a curated preset updates both the chrome
(font/accent) and the graph's node color palette together; a custom accent re-themes chrome only.
Selection persists across reloads via localStorage, with an anti-flash script extension so a
returning visitor's preset/custom accent applies before first paint. The former "Options & help"
popover, now theme-control-free, is relabeled "Help" and its copy was rewritten for scannability
(bulleted "How to use it", trimmed "Why this exists", and a new "Build this for your own wiki"
section pointing at the `build:graph` CLI).

## Key Files

| File | Purpose |
|------|---------|
| `lib/theme-presets.ts` (NEW) | `THEME_PRESETS` registry (3 curated presets) + localStorage persistence helpers for preset id and custom accent |
| `components/graph/nodeColor.ts` | `LIGHT_PALETTE`/`DARK_PALETTE` made mutable; added `setPaletteAccent`/`resetPaletteAccentToDefault` to rewrite slot 0 (the shared chrome/graph accent) at runtime |
| `components/graph/ThemeToggle.tsx` | Converted from a text button to an icon-only sun/moon button; both icons always rendered, toggled via static `dark:` CSS (not JS-conditional rendering) to avoid a structural hydration mismatch — see Spec Deviations |
| `components/graph/ThemePresetPicker.tsx` (NEW) | Header dropdown: 3 curated swatches + Custom, controlled open/close (same backdrop pattern as `OptionsPanel`), custom color picker + disclosure note |
| `components/graph/OptionsPanel.tsx` | Dropped the "Color theme" section and `isDark`/`onThemeChange` props; relabeled `aria-label` to "Help"; rewrote the Help/Why-build-this copy; added "Build this for your own wiki" |
| `app/layout.tsx` | Added 4 `next/font/google` imports (Space Grotesk, IBM Plex Sans, Fraunces, Source Sans 3); extended the anti-flash `<script>` to apply a stored theme preset/custom accent before paint |
| `app/globals.css` | `[data-theme-preset="indigo"/"plum"]` blocks; plain `body`/`h1`-`h6`/`.heading-font` rules using `var(--font-sans)`/`var(--font-heading)` — required after discovering Tailwind v4's `@theme inline` bakes those tokens into `.font-sans`/`.font-heading` utility classes at build time (see Spec Deviations) |
| `components/graph/Header.tsx` | Title span switched from Tailwind's `font-heading` utility class to the new plain `.heading-font` class |
| `app/graph/page.tsx` | `themePreset`/`customAccent`/`paletteVersion`/`isThemePickerOpen` state; `handleThemePresetChange`/`handleCustomAccentChange`; `handleThemeChange` reapplies the active accent on dark/light flip; new Esc-chain layer; header composition (`ThemeToggle`, `ThemePresetPicker` between `PaneCountControl` and `OptionsPanel`) |
| `components/graph/SwimLaneCanvas.tsx`, `DualPaneBoard.tsx` | New `paletteVersion?: number` prop, added to `SwimLaneCanvas`'s `connectorPaths` effect dependency array so connector-line colors recompute on a preset change alone |
| `tests/theme-presets.test.ts`, `tests/theme-toggle.test.tsx`, `tests/theme-preset-picker.test.tsx` (NEW) | Registry/persistence, icon-toggle behavior, dropdown/TOR coverage |
| `tests/node-color.test.ts`, `tests/layout.test.ts`, `tests/options-panel.test.ts`, `tests/options-panel.test.tsx`, `tests/graph-page.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/dual-pane-board.test.ts` | Extended for the new palette setter, anti-flash script, Help relabel/copy, header composition, Esc-chain order, and `paletteVersion` wiring |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|-----------------|--------|
| TOR-07-6nVdgBJ | Presets/toggle live inside the "Options & help popover" | Dark/light is a standalone header icon; the 3 presets + Custom are a separate header dropdown | Direct user instruction during planning (this session) — confirmed via plan approval. Given/When/Then intent (both controls are discoverable and usable on `/graph`) is preserved; only the container changed. |
| (no TOR anchor) | — | Header popover relabeled "Options & help" → "Help"; copy rewritten (bulleted "How to use it", trimmed "Why this exists", new "Build this for your own wiki" section) | Follows directly from the header relocation above (theme controls no longer live in this popover) plus a direct user request for more scannable, executive-readable copy and a build-your-own-wiki note. TOR-06-DRtjcOk and TOR-05-G72S3H4's underlying content requirements (a persistent layout-mode control; second-brain/dynamic-context/content-gap descriptive text) still hold — verified against the rewritten copy, not just the old literal heading text. |

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

| TOR ID | Feature File | Verdict | Notes |
|--------|--------------|---------|-------|
| TOR-07-6nVdgBJ | `docs/requirements/07-product-shell-and-theming.feature.md` | PASS | Live-verified: header shows sun/moon toggle + "Theme presets" dropdown with 4 swatches (Teal/Indigo/Plum/Custom) |
| TOR-07-VBZZx0f | same | PASS | Live-verified: selecting Indigo updated `--accent` to `#5b93e0`, title font to Space Grotesk, body font to IBM Plex Sans, AND the graph's lane background to `rgba(91,147,224,0.1)` (same hex) together |
| TOR-07-LquSsD5 | same | PASS | Live-verified: selecting Custom revealed the color picker + disclosure with `--accent` unchanged (still `#5b93e0`) until a color was actually picked |
| TOR-07-p18cpcx | same | PASS | Live-verified: picking `#ff00aa` updated `--accent` only; the graph lane color stayed at Indigo's `#5b93e0` |
| TOR-07-HKyFd0T | same | PASS | Live-verified: disclosure note ("not checked for color-vision-deficiency safety or contrast") present only while Custom is active |
| TOR-07-WU8PBMV | same | PASS | Live-verified: preset (`indigo`), then custom accent, then a switch to `plum`+light mode all survived a full page reload with zero visual flash and zero console errors |
| TOR-07-dttI7qm | same | PASS | Live-verified: switching from Custom to Plum updated `--accent` to `#bd6cb3` AND the graph lane color to the same hex together; connector-line colors (a selected node's related-page lines) also recomputed on the preset change alone, confirming the `paletteVersion` dependency-array fix works |

## Verification Results

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (353/353, 50 test files)
- Live `playwright-cli` verification against `npm run dev`, built against the real `second-brain`
  vault (47 nodes, 96 edges): all 7 TORs exercised end-to-end (see TOR Coverage above), plus
  2-pane `DualPaneBoard` mode and the Esc-chain de-escalation of the new theme-picker dropdown —
  zero console errors throughout the full session, including a cold reload with cleared
  localStorage (first-time-visitor path).

## Known Issues / Follow-ups

None.

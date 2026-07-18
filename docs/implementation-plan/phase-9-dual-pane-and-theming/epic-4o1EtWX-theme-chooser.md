# Epic 4o1EtWX: Theme Chooser

**Phase:** 9 — Dual-Pane & Theming
**Status:** Not Started
**Dependencies:** Epic xvzgc4Z (Visual Identity, Typography & Hero — establishes the surface
palette and folder-accent system this epic extends), Epic vH3Ls3h (Icon-Only Options Menu —
owns the Options & help popover the Color theme section lives in)

> **Brand:** Use the project's brand guidelines skill for the preset swatches and color-picker
> UI in this epic if one is configured.

---

## Description

Extend the existing Color theme section (light/dark toggle) in the Options & help popover with
3 curated font+accent-color presets, each validated as a set via the dataviz skill's palette
validator — the same process used for the shipped teal/Manrope refresh (epic xvzgc4Z) — plus a
4th "Custom" option where the visitor picks an arbitrary accent color via a color picker. The 3
curated presets keep the existing chrome-accent/graph-node-palette sync established in epic
xvzgc4Z (picking a preset re-themes both together); the custom option is chrome-only (header,
buttons, focus ring) since a visitor-chosen color isn't re-validated into the 8-hue categorical
node palette, so the UI must visibly disclose this rather than implying the same accessibility
guarantee as the presets. Selection persists via localStorage, following the same pattern as the
existing dark/light preference.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|-----------------|
| TOR-07-6nVdgBJ | `docs/requirements/07-product-shell-and-theming.feature.md` | The Color theme section shall display 3 curated font+accent-color presets in addition to the existing light/dark toggle |
| TOR-07-VBZZx0f | `docs/requirements/07-product-shell-and-theming.feature.md` | Selecting a curated theme preset shall update both the page's chrome and the graph's node color palette to that preset's validated values |
| TOR-07-LquSsD5 | `docs/requirements/07-product-shell-and-theming.feature.md` | The Color theme section shall provide a 4th 'Custom' option that reveals a color picker for selecting an arbitrary accent color |
| TOR-07-p18cpcx | `docs/requirements/07-product-shell-and-theming.feature.md` | Selecting a custom accent color shall re-theme only chrome elements, leaving the graph's node color palette unchanged |
| TOR-07-HKyFd0T | `docs/requirements/07-product-shell-and-theming.feature.md` | The theme chooser shall visibly disclose that a custom accent color is not validated for CVD-safety or contrast, distinguishing it from the curated presets |
| TOR-07-WU8PBMV | `docs/requirements/07-product-shell-and-theming.feature.md` | The visitor's selected theme preset or custom color choice shall persist across page reloads via localStorage |
| TOR-07-dttI7qm | `docs/requirements/07-product-shell-and-theming.feature.md` | Switching from a custom accent color back to a curated preset shall re-sync both chrome and the graph's node color palette to that preset's validated values |

## Key Components

### Frontend

- `components/graph/ThemeToggle.tsx` — extend with the curated-preset swatches and the
  "Custom" option, or split preset/custom selection into a new sibling component
- `components/graph/OptionsPanel.tsx` — Color theme section: render the preset swatches, the
  Custom option, the color picker, and the accessibility-disclosure note
- `components/graph/nodeColor.ts` — parameterize the folder-color palette by active preset so
  the graph's node colors re-theme in sync with chrome for curated presets
- `app/globals.css` — CSS custom properties for the 3 curated font+accent presets and the
  custom-accent chrome-only override
- New: a theme-persistence module (e.g. `lib/theme-preference.ts` or colocated in
  `ThemeToggle.tsx`) — localStorage read/write for the selected preset or custom color,
  following the existing light/dark persistence pattern

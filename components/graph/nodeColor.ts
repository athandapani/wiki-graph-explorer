// Validated categorical palettes (dataviz skill, scripts/validate_palette.js) — one full 8-hue
// set per theme preset, not a shared base with a swappable accent slot (epic 4o1EtWX rework).
// The original single-palette-plus-slot-0-swap design only ever re-themed 1 of 8 folder-color
// slots per preset, so switching presets barely changed the graph. Each preset below is instead
// its own independently-validated 8-hue set: CVD separation, chroma floor, lightness band, and
// surface contrast all checked in both light and dark mode via `validate_palette.js`.
//
// All 3 presets are built from the SAME underlying 8 validated hue families (teal, aqua,
// yellow, violet, green, red, magenta, orange) — the dataviz skill's own method treats the hue
// *order* as a separable "theme" on fixed, already-safe hue anchors, rather than inventing new
// hue families per preset (an ad-hoc hue-rotation of the whole set was tried first and reliably
// broke the lightness-band/CVD checks — reordering existing validated hues is what the method
// actually prescribes). Each preset promotes a different hue family to slot 0 (the shared
// chrome/graph accent) and reorders the remaining 7 to clear the checks for that new slot-0
// neighbor:
//   - teal:   slot 0 = teal (original order, unchanged)
//   - indigo: slot 0 = violet (a cooler blue-violet accent than the previously-drafted
//             #2a78d6/#5b93e0 — the tradeoff that made "reuse only proven-safe hues" possible)
//   - plum:   slot 0 = magenta (a warm pink-mauve accent, in place of the previously-drafted
//             #a13d8f/#bd6cb3, for the same reason)
// Both new orderings clear ALL SIX checks in both modes (no FAILs, no WARNs beyond the
// pre-existing sub-3:1-contrast WARN that the teal baseline also carries — legal per the
// validator's rules since every folder pill always shows its full title text as well, i.e.
// color is never the only encoding). This is strictly cleaner than the teal baseline, which
// carries one accepted normal-vision-floor FAIL (orange↔magenta light, red↔magenta dark) —
// see PRESET_PALETTES.teal below.
//
// Folders beyond the 8 fixed slots fall back to a generated golden-angle HSL ramp rather than
// cycling the fixed slots (a cycled hue would collide with an earlier folder's color, which
// nodes-with-different-folders-render-distinctly forbids).
type PresetId = "teal" | "indigo" | "plum";

interface PalettePair {
  light: string[];
  dark: string[];
}

export const PRESET_PALETTES: Record<PresetId, PalettePair> = {
  // Order: teal, aqua, yellow, violet, green, red, magenta, orange. Carries one accepted
  // normal-vision-floor FAIL (orange↔magenta light ΔE 12.9, red↔magenta dark ΔE 7.8) — a
  // pre-existing, documented finding (see prior TOR-07-37VPhrV / slot-3/4 swap history), not
  // introduced by this rework.
  teal: {
    light: [
      "#0088a3", // teal
      "#1baf7a", // aqua
      "#eda100", // yellow
      "#4a3aa7", // violet
      "#008300", // green
      "#e34948", // red
      "#e87ba4", // magenta
      "#eb6834", // orange
    ],
    dark: [
      "#109cc6", // teal
      "#199e70", // aqua
      "#d17d00", // yellow
      "#9085e9", // violet
      "#008300", // green
      "#e66767", // red
      "#d55181", // magenta
      "#d95926", // orange
    ],
  },
  // Order (light): violet, red, yellow, magenta, green, aqua, teal, orange — worst adjacent
  // ΔE 15.0 normal-vision / 14.4 CVD (#0088a3↔#1baf7a). ALL CHECKS PASS.
  // Order (dark): violet, green, magenta, yellow, aqua, orange, teal, red — worst adjacent
  // ΔE 17.6 normal-vision / 8.7 CVD (#199e70↔#d17d00). ALL CHECKS PASS.
  indigo: {
    light: ["#4a3aa7", "#e34948", "#eda100", "#e87ba4", "#008300", "#1baf7a", "#0088a3", "#eb6834"],
    dark: ["#9085e9", "#008300", "#d55181", "#d17d00", "#199e70", "#d95926", "#109cc6", "#e66767"],
  },
  // Order (light): magenta, yellow, red, violet, aqua, green, teal, orange — worst adjacent
  // ΔE 15.6 normal-vision / 15.2 CVD (#008300↔#1baf7a). ALL CHECKS PASS.
  // Order (dark): magenta, green, teal, yellow, aqua, orange, violet, red — worst adjacent
  // ΔE 21.5 normal-vision / 8.7 CVD (#199e70↔#d17d00). ALL CHECKS PASS.
  plum: {
    light: ["#e87ba4", "#eda100", "#e34948", "#4a3aa7", "#1baf7a", "#008300", "#0088a3", "#eb6834"],
    dark: ["#d55181", "#008300", "#109cc6", "#d17d00", "#199e70", "#d95926", "#9085e9", "#e66767"],
  },
};

const DEFAULT_PRESET: PresetId = "teal";

let LIGHT_PALETTE = PRESET_PALETTES[DEFAULT_PRESET].light;
let DARK_PALETTE = PRESET_PALETTES[DEFAULT_PRESET].dark;

// The interface's shared accent color (header logo, CTA button, focus ring) is drawn from the
// active preset's own slot 0 rather than an unrelated stock Tailwind color, so the chrome reads
// as authored around the data it's showing (issue #4 finding B10). Mirrored as the --accent CSS
// custom property in app/globals.css for use in static/server components that have no isDark
// prop to thread through — keep both in sync if a preset's slot 0 ever changes.
export let ACCENT_LIGHT = LIGHT_PALETTE[0];
export let ACCENT_DARK = DARK_PALETTE[0];

// Swaps the ENTIRE active 8-hue palette (light + dark) to the given preset's own validated set —
// not just slot 0. ES module bindings are live, so every importer of LIGHT_PALETTE/DARK_PALETTE
// (via getFolderColor) and ACCENT_LIGHT/ACCENT_DARK sees the update automatically — no separate
// getter needed.
export function setActivePreset(id: PresetId): void {
  LIGHT_PALETTE = PRESET_PALETTES[id].light;
  DARK_PALETTE = PRESET_PALETTES[id].dark;
  ACCENT_LIGHT = LIGHT_PALETTE[0];
  ACCENT_DARK = DARK_PALETTE[0];
}

export function resetPaletteToDefault(): void {
  setActivePreset(DEFAULT_PRESET);
}

const GOLDEN_ANGLE_DEGREES = 137.508;

const folderSlots = new Map<string, number>();

function getFolderSlot(folder: string): number {
  const existing = folderSlots.get(folder);
  if (existing !== undefined) {
    return existing;
  }

  const index = folderSlots.size;
  folderSlots.set(folder, index);
  return index;
}

function generateOverflowColor(index: number, isDark: boolean): string {
  const hue = (index * GOLDEN_ANGLE_DEGREES) % 360;
  const lightness = isDark ? 66 : 40;
  return `hsl(${hue.toFixed(1)}, 65%, ${lightness}%)`;
}

export function getFolderColor(folder: string, isDark = false): string {
  const slot = getFolderSlot(folder);
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  if (slot < palette.length) {
    return palette[slot];
  }
  return generateOverflowColor(slot - palette.length, isDark);
}

export function resetFolderColors(): void {
  folderSlots.clear();
}

// Validated categorical palette (dataviz skill, references/palette.md) — fixed hue order.
// Folders beyond the 8 fixed slots fall back to a generated golden-angle HSL ramp rather than
// cycling the fixed slots (a cycled hue would collide with an earlier folder's color, which
// nodes-with-different-folders-render-distinctly forbids). Dark-mode steps are the same eight
// hues stepped for the dark surface, not a separate palette — lighter/less saturated so they
// still clear 3:1 against #0a0f14.
//
// Slot 0 (teal) was re-validated against the other 7 fixed hues when the accent moved from
// blue to teal (visual refresh, TOR-07-37VPhrV Spec Deviation) — CVD separation, chroma floor,
// and surface contrast all pass for the new slot 0 in both themes.
//
// Slots 3/4 (green/violet) were swapped after the first 4 slots — the only ones visible for a
// dataset with exactly 4 folders — put two green-family hues (slot 1 aqua, slot 3 green) next
// to each other while violet sat entirely unused. Violet now renders; pure green moved to slot
// 4, only used with a 5th+ folder. This introduces one new WARN-level (not FAIL) adjacency
// (red↔green in light, ΔE 7.2) — legal per the validator's own rules since folder identity is
// never color-alone here (every pill always shows its full title text as well).
//
// Dark-mode slot 2 (yellow) was brightened from #c98500 (#0088a3-era) to #d17d00 — found via a
// max-chroma search within hue 36–48°: the dark-mode OKLCH lightness band caps at L 0.67, and
// #c98500 already sat at L 0.6699 (the ceiling), so true "lighter" wasn't available without
// breaking CVD-safety. #d17d00 instead maximizes chroma within the same safe band (0.1425 →
// 0.1494) for a more vivid look at the same lightness.
//
// The validator also surfaces two pre-existing floor failures unrelated to any of the above
// (orange↔magenta in light, red↔magenta in dark) — these predate this change and are a
// separate, not-yet-addressed finding, not a regression introduced here.
let LIGHT_PALETTE = [
  "#0088a3", // teal
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#4a3aa7", // violet
  "#008300", // green
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

let DARK_PALETTE = [
  "#109cc6", // teal
  "#199e70", // aqua
  "#d17d00", // yellow
  "#9085e9", // violet
  "#008300", // green
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
];

const DEFAULT_LIGHT_SLOT0 = LIGHT_PALETTE[0];
const DEFAULT_DARK_SLOT0 = DARK_PALETTE[0];

// The interface's shared accent color (header logo, CTA button, focus ring) is drawn from the
// same palette as the graph nodes rather than an unrelated stock Tailwind color, so the chrome
// reads as authored around the data it's showing (issue #4 finding B10). Slot 0 (teal, moved
// from the original blue in a later visual refresh) is kept in 1:1 sync with the chrome accent
// by deliberate design. Mirrored as the --accent CSS custom property in app/globals.css for use
// in static/server components that have no isDark prop to thread through — keep both in sync
// if this slot ever changes.
export let ACCENT_LIGHT = LIGHT_PALETTE[0];
export let ACCENT_DARK = DARK_PALETTE[0];

// Rewrites slot 0 (the shared chrome/graph accent) for a curated theme preset or a custom
// accent color. ES module bindings are live, so every importer of ACCENT_LIGHT/ACCENT_DARK sees
// the update automatically — no separate getter needed.
export function setPaletteAccent(lightHex: string, darkHex: string): void {
  LIGHT_PALETTE = [lightHex, ...LIGHT_PALETTE.slice(1)];
  DARK_PALETTE = [darkHex, ...DARK_PALETTE.slice(1)];
  ACCENT_LIGHT = lightHex;
  ACCENT_DARK = darkHex;
}

export function resetPaletteAccentToDefault(): void {
  setPaletteAccent(DEFAULT_LIGHT_SLOT0, DEFAULT_DARK_SLOT0);
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

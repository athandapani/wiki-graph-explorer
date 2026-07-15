// Validated categorical palette (dataviz skill, references/palette.md) — fixed hue order,
// worst adjacent CVD ΔE 24.2 (light) / 10.3 (dark). Folders beyond the 8 fixed slots fall
// back to a generated golden-angle HSL ramp rather than cycling the fixed slots (a cycled hue
// would collide with an earlier folder's color, which nodes-with-different-folders-render-
// distinctly forbids). Dark-mode steps are the same eight hues stepped for the dark surface,
// not a separate palette — lighter/less saturated so they still clear 3:1 against #0a0a0a.
const LIGHT_PALETTE = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

const DARK_PALETTE = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
];

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

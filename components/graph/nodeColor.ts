// Validated categorical palette (dataviz skill, references/palette.md) — fixed hue order,
// worst adjacent CVD ΔE 24.2. Folders beyond the 8 fixed slots fall back to a generated
// golden-angle HSL ramp rather than cycling the fixed slots (a cycled hue would collide with
// an earlier folder's color, which nodes-with-different-folders-render-distinctly forbids).
const CATEGORICAL_PALETTE = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

const GOLDEN_ANGLE_DEGREES = 137.508;

const folderColors = new Map<string, string>();

function generateOverflowColor(index: number): string {
  const hue = (index * GOLDEN_ANGLE_DEGREES) % 360;
  return `hsl(${hue.toFixed(1)}, 65%, 45%)`;
}

export function getFolderColor(folder: string): string {
  const existing = folderColors.get(folder);
  if (existing) {
    return existing;
  }

  const index = folderColors.size;
  const color =
    index < CATEGORICAL_PALETTE.length
      ? CATEGORICAL_PALETTE[index]
      : generateOverflowColor(index - CATEGORICAL_PALETTE.length);

  folderColors.set(folder, color);
  return color;
}

export function resetFolderColors(): void {
  folderColors.clear();
}

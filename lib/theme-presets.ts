import { PRESET_PALETTES } from "@/components/graph/nodeColor";

export type ThemePresetId = "teal" | "indigo" | "plum" | "custom";

export interface ThemePreset {
  id: Exclude<ThemePresetId, "custom">;
  label: string;
  accentLight: string;
  accentDark: string;
  fontHeadingVar: string;
  fontBodyVar: string;
}

// accentLight/accentDark are derived from PRESET_PALETTES[id]'s own slot 0 (nodeColor.ts) rather
// than independently hardcoded, so chrome and the graph's slot-0 folder color can never drift
// apart — each preset's full 8-hue palette (chrome accent + the other 7 graph hues) is validated
// together as one set (see nodeColor.ts's PRESET_PALETTES doc comment for the validator results).
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    label: "Teal",
    accentLight: PRESET_PALETTES.teal.light[0],
    accentDark: PRESET_PALETTES.teal.dark[0],
    fontHeadingVar: "var(--font-manrope)",
    fontBodyVar: "var(--font-inter)",
  },
  {
    id: "indigo",
    label: "Indigo",
    accentLight: PRESET_PALETTES.indigo.light[0],
    accentDark: PRESET_PALETTES.indigo.dark[0],
    fontHeadingVar: "var(--font-space-grotesk)",
    fontBodyVar: "var(--font-ibm-plex-sans)",
  },
  {
    id: "plum",
    label: "Plum",
    accentLight: PRESET_PALETTES.plum.light[0],
    accentDark: PRESET_PALETTES.plum.dark[0],
    fontHeadingVar: "var(--font-fraunces)",
    fontBodyVar: "var(--font-source-sans-3)",
  },
];

const THEME_PRESET_KEY = "themePreset";
const CUSTOM_ACCENT_KEY = "customAccent";

function isThemePresetId(value: string): value is ThemePresetId {
  return value === "teal" || value === "indigo" || value === "plum" || value === "custom";
}

export function readStoredPreset(): ThemePresetId | null {
  try {
    const stored = localStorage.getItem(THEME_PRESET_KEY);
    return stored && isThemePresetId(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredPreset(id: ThemePresetId): void {
  try {
    localStorage.setItem(THEME_PRESET_KEY, id);
  } catch {
    // localStorage unavailable (private browsing, etc.) — preset still applies for this session
  }
}

export function readStoredCustomAccent(): string | null {
  try {
    return localStorage.getItem(CUSTOM_ACCENT_KEY);
  } catch {
    return null;
  }
}

export function writeStoredCustomAccent(hex: string): void {
  try {
    localStorage.setItem(CUSTOM_ACCENT_KEY, hex);
  } catch {
    // localStorage unavailable (private browsing, etc.) — custom accent still applies for this session
  }
}

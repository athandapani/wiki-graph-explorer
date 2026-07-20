export type ThemePresetId = "teal" | "indigo" | "plum" | "custom";

export interface ThemePreset {
  id: Exclude<ThemePresetId, "custom">;
  label: string;
  accentLight: string;
  accentDark: string;
  fontHeadingVar: string;
  fontBodyVar: string;
}

// Each accent was run through the dataviz skill's validate_palette.js as a full 8-slot palette
// (this accent in slot 0 + the 7 existing fixed hues) in both light and dark mode, and compared
// against the shipped teal palette as baseline — none introduce a new pass/warn/fail beyond what
// teal already has (see docs/implementation-plan/phase-9-dual-pane-and-theming's session handoff
// for the validator output). Keep in sync with components/graph/nodeColor.ts's slot 0 defaults.
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    label: "Teal",
    accentLight: "#0088a3",
    accentDark: "#109cc6",
    fontHeadingVar: "var(--font-manrope)",
    fontBodyVar: "var(--font-inter)",
  },
  {
    id: "indigo",
    label: "Indigo",
    accentLight: "#2a78d6",
    accentDark: "#5b93e0",
    fontHeadingVar: "var(--font-space-grotesk)",
    fontBodyVar: "var(--font-ibm-plex-sans)",
  },
  {
    id: "plum",
    label: "Plum",
    accentLight: "#a13d8f",
    accentDark: "#bd6cb3",
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

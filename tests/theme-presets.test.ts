// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  readStoredCustomAccent,
  readStoredPreset,
  THEME_PRESETS,
  writeStoredCustomAccent,
  writeStoredPreset,
} from "../lib/theme-presets";

afterEach(() => {
  localStorage.clear();
});

describe("THEME_PRESETS", () => {
  it("TOR-07-6nVdgBJ: has exactly 3 curated presets with distinct ids, accents, and font pairings", () => {
    expect(THEME_PRESETS).toHaveLength(3);

    const ids = THEME_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(3);

    const accentLights = THEME_PRESETS.map((preset) => preset.accentLight);
    expect(new Set(accentLights).size).toBe(3);

    const fontPairs = THEME_PRESETS.map((preset) => `${preset.fontHeadingVar}|${preset.fontBodyVar}`);
    expect(new Set(fontPairs).size).toBe(3);
  });

  it("each preset has a light and dark accent hex", () => {
    for (const preset of THEME_PRESETS) {
      expect(preset.accentLight).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.accentDark).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("theme preset persistence", () => {
  it("TOR-07-WU8PBMV: round-trips a stored preset id through localStorage", () => {
    expect(readStoredPreset()).toBeNull();
    writeStoredPreset("indigo");
    expect(readStoredPreset()).toBe("indigo");
  });

  it("TOR-07-WU8PBMV: round-trips a stored custom accent hex through localStorage", () => {
    expect(readStoredCustomAccent()).toBeNull();
    writeStoredCustomAccent("#123456");
    expect(readStoredCustomAccent()).toBe("#123456");
  });

  it("ignores a stored value that isn't a recognized preset id", () => {
    localStorage.setItem("themePreset", "not-a-real-preset");
    expect(readStoredPreset()).toBeNull();
  });

  it("does not throw when localStorage is unavailable (e.g. private browsing)", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("localStorage unavailable");
      },
    });

    try {
      expect(() => writeStoredPreset("plum")).not.toThrow();
      expect(() => readStoredPreset()).not.toThrow();
      expect(() => writeStoredCustomAccent("#abcdef")).not.toThrow();
      expect(() => readStoredCustomAccent()).not.toThrow();
      expect(readStoredPreset()).toBeNull();
      expect(readStoredCustomAccent()).toBeNull();
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });
});

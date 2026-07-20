import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACCENT_DARK,
  ACCENT_LIGHT,
  getFolderColor,
  PRESET_PALETTES,
  resetFolderColors,
  resetPaletteToDefault,
  setActivePreset,
} from "../components/graph/nodeColor";

describe("getFolderColor", () => {
  beforeEach(() => {
    resetFolderColors();
  });

  afterEach(() => {
    resetPaletteToDefault();
  });

  it("TOR-02-AyzgOJs: given two nodes with the same folder value, when colored, then they render in the same color", () => {
    expect(getFolderColor("concepts")).toBe(getFolderColor("concepts"));
  });

  it("TOR-02-AyzgOJs: given two nodes with different folder values, when colored, then they render in visually distinct colors", () => {
    expect(getFolderColor("concepts")).not.toBe(getFolderColor("sources"));
  });

  it("given more distinct folders than the fixed 8-slot palette, when colored, then every folder still gets a distinct color", () => {
    const folders = Array.from({ length: 12 }, (_, i) => `folder-${i}`);
    const colors = folders.map((folder) => getFolderColor(folder));
    expect(new Set(colors).size).toBe(folders.length);
  });

  it("TOR-07-7ha0SK5: ACCENT_LIGHT/ACCENT_DARK equal the palette's first slot, so the shared interface accent tracks the graph's own folder colors", () => {
    expect(ACCENT_LIGHT).toBe(getFolderColor("__first-folder-slot__", false));
    resetFolderColors();
    expect(ACCENT_DARK).toBe(getFolderColor("__first-folder-slot__", true));
  });

  it("TOR-07-VBZZx0f: setActivePreset swaps the ENTIRE 8-hue palette, not just slot 0", () => {
    resetFolderColors();
    const originalSlots = Array.from({ length: 8 }, (_, i) => getFolderColor(`__slot-${i}__`, false));

    resetFolderColors();
    setActivePreset("indigo");
    const indigoSlots = Array.from({ length: 8 }, (_, i) => getFolderColor(`__slot-${i}__`, false));

    expect(indigoSlots).toEqual(PRESET_PALETTES.indigo.light);
    // the whole array changed, not just slot 0 — this is the point of the rework (previously
    // only slot 0 ever differed between presets). Individual slots may coincidentally share a
    // hex across presets (both orderings draw from the same 8 validated hue families), so the
    // meaningful assertion is on the array as a whole, not a per-slot inequality.
    expect(indigoSlots).not.toEqual(originalSlots);
  });

  it("TOR-07-VBZZx0f: setActivePreset updates ACCENT_LIGHT/ACCENT_DARK via live module bindings", () => {
    setActivePreset("indigo");
    expect(ACCENT_LIGHT).toBe(PRESET_PALETTES.indigo.light[0]);
    expect(ACCENT_DARK).toBe(PRESET_PALETTES.indigo.dark[0]);
  });

  it("TOR-07-dttI7qm: resetPaletteToDefault restores all 8 teal slots (light and dark), not just slot 0", () => {
    setActivePreset("plum");
    resetPaletteToDefault();

    expect(ACCENT_LIGHT).toBe(PRESET_PALETTES.teal.light[0]);
    expect(ACCENT_DARK).toBe(PRESET_PALETTES.teal.dark[0]);

    resetFolderColors();
    const lightSlots = Array.from({ length: 8 }, (_, i) => getFolderColor(`__slot-${i}__`, false));
    resetFolderColors();
    const darkSlots = Array.from({ length: 8 }, (_, i) => getFolderColor(`__slot-${i}__`, true));

    expect(lightSlots).toEqual(PRESET_PALETTES.teal.light);
    expect(darkSlots).toEqual(PRESET_PALETTES.teal.dark);
  });
});

describe("PRESET_PALETTES", () => {
  it("each preset has an 8-entry light and dark array of valid, distinct hex values", () => {
    for (const id of ["teal", "indigo", "plum"] as const) {
      const { light, dark } = PRESET_PALETTES[id];
      expect(light).toHaveLength(8);
      expect(dark).toHaveLength(8);

      for (const hex of [...light, ...dark]) {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      }

      expect(new Set(light).size).toBe(8);
      expect(new Set(dark).size).toBe(8);
    }
  });
});

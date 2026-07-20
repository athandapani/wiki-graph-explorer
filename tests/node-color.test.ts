import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACCENT_DARK,
  ACCENT_LIGHT,
  getFolderColor,
  resetFolderColors,
  resetPaletteAccentToDefault,
  setPaletteAccent,
} from "../components/graph/nodeColor";

describe("getFolderColor", () => {
  beforeEach(() => {
    resetFolderColors();
  });

  afterEach(() => {
    resetPaletteAccentToDefault();
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

  it("TOR-07-VBZZx0f: setPaletteAccent rewrites slot 0 only, leaving the other 7 fixed hues unchanged", () => {
    // getFolderColor assigns slots in first-seen order, so "first"/"second" land in slot 0/1
    // respectively as long as folderSlots isn't reset between the two calls in each pair.
    resetFolderColors();
    getFolderColor("__first-folder-slot__", false); // claims slot 0
    const originalSlot1Light = getFolderColor("__second-folder-slot__", false); // claims slot 1

    resetFolderColors();
    getFolderColor("__first-folder-slot__", true);
    const originalSlot1Dark = getFolderColor("__second-folder-slot__", true);

    setPaletteAccent("#2a78d6", "#5b93e0");

    resetFolderColors();
    expect(getFolderColor("__first-folder-slot__", false)).toBe("#2a78d6");
    expect(getFolderColor("__second-folder-slot__", false)).toBe(originalSlot1Light);

    resetFolderColors();
    expect(getFolderColor("__first-folder-slot__", true)).toBe("#5b93e0");
    expect(getFolderColor("__second-folder-slot__", true)).toBe(originalSlot1Dark);
  });

  it("TOR-07-VBZZx0f: setPaletteAccent updates ACCENT_LIGHT/ACCENT_DARK via live module bindings", () => {
    setPaletteAccent("#a13d8f", "#bd6cb3");
    expect(ACCENT_LIGHT).toBe("#a13d8f");
    expect(ACCENT_DARK).toBe("#bd6cb3");
  });

  it("TOR-07-dttI7qm: resetPaletteAccentToDefault restores the original teal slot-0 hexes", () => {
    setPaletteAccent("#2a78d6", "#5b93e0");
    resetPaletteAccentToDefault();

    expect(ACCENT_LIGHT).toBe("#0088a3");
    expect(ACCENT_DARK).toBe("#109cc6");
    expect(getFolderColor("__first-folder-slot__", false)).toBe("#0088a3");
    resetFolderColors();
    expect(getFolderColor("__first-folder-slot__", true)).toBe("#109cc6");
  });
});

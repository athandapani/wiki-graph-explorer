import { beforeEach, describe, expect, it } from "vitest";
import { ACCENT_DARK, ACCENT_LIGHT, getFolderColor, resetFolderColors } from "../components/graph/nodeColor";

describe("getFolderColor", () => {
  beforeEach(() => {
    resetFolderColors();
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
});

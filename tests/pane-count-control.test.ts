import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/PaneCountControl.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "PaneCountControl.tsx"),
    "utf-8",
  );

  it("TOR-11-45utBRH: is a client component rendering a single icon button that toggles pane count", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("<button");
    expect(source).toContain("<svg");
    // Single button, not a two-button group.
    expect((source.match(/<button/g) ?? []).length).toBe(1);
  });

  it("TOR-11-45utBRH: wires aria-pressed and onClick to toggle paneCount, independent of layout mode", () => {
    expect(source).toContain("aria-pressed={isTwoPane}");
    expect(source).toContain("onClick={() => onChange(isTwoPane ? 1 : 2)}");
    expect(source).not.toContain("layoutMode");
  });

  it("TOR-11-TFakQZA: hidden below the xl (1280px) wide-screen breakpoint via pure CSS, matching the existing responsive-floor pattern", () => {
    expect(source).toContain("hidden rounded border border-black/10 p-2 xl:block");
  });
});

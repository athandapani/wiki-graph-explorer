import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/PaneCountControl.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "PaneCountControl.tsx"),
    "utf-8",
  );

  it("TOR-11-45utBRH: is a client component rendering a 1-pane/2-panes button group", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain('role="group"');
    expect(source).toContain('aria-label="Pane count"');
    expect(source).toContain("1 pane");
    expect(source).toContain("2 panes");
  });

  it("TOR-11-45utBRH: wires aria-pressed and onClick to the paneCount prop, independent of layout mode", () => {
    expect(source).toContain("aria-pressed={paneCount === 1}");
    expect(source).toContain("onClick={() => onChange(1)}");
    expect(source).toContain("aria-pressed={paneCount === 2}");
    expect(source).toContain("onClick={() => onChange(2)}");
    expect(source).not.toContain("layoutMode");
  });

  it("TOR-11-TFakQZA: hidden below the xl (1280px) wide-screen breakpoint via pure CSS, matching the existing responsive-floor pattern", () => {
    expect(source).toContain('className="hidden gap-1 text-sm xl:flex"');
  });
});

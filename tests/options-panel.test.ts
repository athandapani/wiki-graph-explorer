import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/OptionsPanel.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "OptionsPanel.tsx"),
    "utf-8",
  );

  it("is a client component that composes LayoutModeToggle and ThemeToggle behind a toggle button", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("<LayoutModeToggle");
    expect(source).toContain("<ThemeToggle");
    expect(source).toContain("mode={layoutMode}");
    expect(source).toContain("onChange={onLayoutModeChange}");
    expect(source).toContain("isDark={isDark}");
    expect(source).toContain("onChange={onThemeChange}");
  });

  it("includes a Help section explaining swim-lane vs force-directed mode", () => {
    expect(source).toContain("Help");
    expect(source).toContain("Swim-lane");
    expect(source).toContain("Force-directed");
  });
});

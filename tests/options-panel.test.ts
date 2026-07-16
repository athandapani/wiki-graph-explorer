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

  it("TOR-02-IrF7v8x: renders a Reset view control only in force-directed mode, wired to onResetView", () => {
    expect(source).toContain("onResetView?: () => void");
    expect(source).toMatch(
      /\{layoutMode === "force-directed" && \(\s*<button[\s\S]*?onClick=\{onResetView\}[\s\S]*?Reset view[\s\S]*?<\/button>\s*\)\}/,
    );
  });

  it("TOR-06-DRtjcOk: renders an icon-only hamburger button with an accessible label, not a text label", () => {
    expect(source).toContain('aria-label="Options & help"');
    expect(source).toContain("<svg");
    expect(source.match(/<line /g)?.length).toBe(3);
    expect(source).not.toContain("Options &amp; help");
  });
});

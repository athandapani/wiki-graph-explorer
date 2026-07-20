import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/OptionsPanel.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "OptionsPanel.tsx"),
    "utf-8",
  );

  it("is a client component that composes LayoutModeToggle behind a toggle button; theme controls moved to header icons (epic 4o1EtWX)", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("<LayoutModeToggle");
    expect(source).toContain("mode={layoutMode}");
    expect(source).toContain("onChange={onLayoutModeChange}");
    expect(source).not.toContain("<ThemeToggle");
    expect(source).not.toContain("isDark");
    expect(source).not.toContain("onThemeChange");
  });

  it("includes a 'How to use it' section explaining swim-lane vs force-directed mode", () => {
    expect(source).toContain("How to use it");
    expect(source).toContain("Swim-lane");
    expect(source).toContain("Force-directed");
  });

  it("TOR-02-IrF7v8x: renders a Reset view control only when the force-directed pane is rendered, wired to onResetView", () => {
    expect(source).toContain("onResetView?: () => void");
    expect(source).toMatch(
      /\{showResetView && \(\s*<button[\s\S]*?onClick=\{onResetView\}[\s\S]*?Reset view[\s\S]*?<\/button>\s*\)\}/,
    );
  });

  it("TOR-11-6XjR1qm: defaults showResetView to force-directed mode, but accepts an override for when force-directed is a secondary DualPaneBoard pane", () => {
    // DualPaneBoard can render force-directed as the non-primary pane in 2-pane mode, in which
    // case layoutMode reflects the primary (swim-lane) pane — showResetView lets app/graph/page.tsx
    // broaden visibility to `layoutMode === "force-directed" || paneCount === 2` without OptionsPanel
    // needing to know about paneCount at all.
    expect(source).toContain('showResetView?: boolean;');
    expect(source).toContain('showResetView = layoutMode === "force-directed",');
  });

  it("TOR-09-4BewmC1: is a controlled component — isOpen/onOpenChange props drive open state, not internal useState", () => {
    expect(source).toContain("isOpen: boolean;");
    expect(source).toContain("onOpenChange: (open: boolean) => void;");
    expect(source).not.toContain("useState");
    expect(source).toContain("onClick={() => onOpenChange(!isOpen)}");
    expect(source).toContain("onClick={() => onOpenChange(false)}");
  });

  it("TOR-06-DRtjcOk: renders an icon-only hamburger button with an accessible label, not a text label — relabeled 'Help' (epic 4o1EtWX, theme controls moved to the header)", () => {
    expect(source).toContain('aria-label="Help"');
    expect(source).not.toContain('aria-label="Options & help"');
    expect(source).toContain("<svg");
    expect(source.match(/<line /g)?.length).toBe(3);
    expect(source).not.toContain("Options &amp; help");
  });

  // Moved from the deleted tests/explainer-section.test.ts (TOR-05-G72S3H4 Spec Deviation —
  // the explainer now lives here instead of a separate below-the-fold section). Heading text
  // changed from "Why build this" to "Why this exists" (epic 4o1EtWX copy refresh) — the TOR's
  // Given/When/Then requires the descriptive-content substrings below, not this literal heading.
  it("TOR-05-G72S3H4: includes a 'Why this exists' section with descriptive text about second-brain/dynamic-context benefits and missing-link discovery", () => {
    expect(source).toContain("Why this exists");
    expect(source.toLowerCase()).toContain("second-brain");
    expect(source).toMatch(/dynamic context|dynamic, relevant context|relevant context/i);
    expect(source).toMatch(/missing link|content gap|isolated/i);
  });

  it("(new, epic 4o1EtWX, no TOR anchor) includes a 'Build this for your own wiki' section pointing at the build:graph CLI", () => {
    expect(source).toContain("Build this for your own wiki");
    expect(source).toContain("npm run build:graph -- --vault");
    expect(source).toContain("github.com/athandapani/wiki-graph-explorer");
  });

  it("TOR-05-OMWVZWL: names force-directed mode as where the filter and node-sizing affordances live", () => {
    expect(source).toContain("force-directed");
    expect(source).toMatch(/force-directed[\s\S]*status\s+and\s+folder\s+filters/);
  });
});

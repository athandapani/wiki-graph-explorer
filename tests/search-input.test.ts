import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/SearchInput.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "SearchInput.tsx"),
    "utf-8",
  );

  it("TOR-03-TOtRRhr: is a client component rendering a visible text search input", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain('type="text"');
    expect(source).toContain("onChange={(event) => onChange(event.target.value)}");
  });

  it("TOR-03-HjJLHTr: displays a no-results indication when active and hasResults is false", () => {
    expect(source).toContain("isActive && !hasResults");
    expect(source).toContain("No closely matching results found.");
  });

  it("TOR-09-kMjRcRb: input font-size is at least 16px below md, avoiding iOS's auto-zoom-on-focus at the 390px design floor", () => {
    expect(source).toContain("text-base");
    expect(source).toContain("md:text-sm");
  });
});

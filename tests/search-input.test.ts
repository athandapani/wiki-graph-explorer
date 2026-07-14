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
});

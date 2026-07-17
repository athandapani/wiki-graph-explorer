import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/PillNode.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "PillNode.tsx"),
    "utf-8",
  );

  it("TOR-06-hCQUwZW: is a client component rendering a rounded pill shape with the node's title", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("rounded-full");
    expect(source).toContain("{node.title}");
  });

  it("TOR-06-hCQUwZW: reuses taxonomy coloring and the status dot for visual consistency", () => {
    expect(source).toContain("getFolderColor(node.folder, isDark)");
    expect(source).toContain("<StatusDot");
  });

  it("dims the pill via reduced opacity when isDimmed is true", () => {
    expect(source).toContain("isDimmed?: boolean");
    expect(source).toContain('isDimmed ? "opacity-30" : ""');
  });

  it("TOR-06-cSCqVtt: sizes the pill to its full title text, with no max-width truncation", () => {
    expect(source).not.toContain("truncate");
    expect(source).not.toContain("max-w-[150px]");
    expect(source).toContain("whitespace-nowrap");
  });
});

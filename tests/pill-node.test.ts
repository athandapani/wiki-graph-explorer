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
});

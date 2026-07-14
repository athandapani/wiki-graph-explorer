import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/EmptyState.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "EmptyState.tsx"),
    "utf-8",
  );

  it("TOR-02-mqgZkBc: displays a non-error empty-state message instead of a blank/broken canvas", () => {
    expect(source).toContain("This wiki graph is empty");
    expect(source).not.toContain("ForceGraph2D");
  });
});

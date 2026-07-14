import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/ErrorState.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "ErrorState.tsx"),
    "utf-8",
  );

  it("TOR-02-rG2HTvc: names the problem and suggests a next action", () => {
    expect(source).toContain("Failed to load graph data");
    expect(source).toContain("Try reloading the page");
  });
});

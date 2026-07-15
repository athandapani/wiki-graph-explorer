import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/ExplainerSection.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "ExplainerSection.tsx"),
    "utf-8",
  );

  it("TOR-05-G72S3H4: renders a heading and descriptive text about second-brain/dynamic-context benefits and missing-link discovery", () => {
    expect(source).toContain("Why build this");
    expect(source).toMatch(/second-brain/i);
    expect(source).toMatch(/dynamic context|dynamic, relevant context|relevant context/i);
    expect(source).toMatch(/missing link|content gap|isolated/i);
  });
});

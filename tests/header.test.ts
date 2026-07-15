import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/Header.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "Header.tsx"),
    "utf-8",
  );

  it("renders the Logo and the product title, linking back to the home page", () => {
    expect(source).toContain("<Logo");
    expect(source).toContain("Wiki Graph Explorer");
    expect(source).toContain('href="/"');
  });
});

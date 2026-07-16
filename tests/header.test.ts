import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/Header.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "Header.tsx"),
    "utf-8",
  );

  it("TOR-07-Ht6rMqL: renders the Logo and the product title, linking back to the home page", () => {
    expect(source).toContain("<Logo");
    expect(source).toContain("Wiki Graph Explorer");
    expect(source).toContain('href="/"');
  });

  it("TOR-03-LgIpadO: exposes an optional search slot and renders it, staying shrink-0 so it never scrolls away", () => {
    // Optional rather than built-in: the home page renders this same header (app/page.tsx) and
    // has no vector index behind it, so only /graph fills the slot.
    expect(source).toContain("search?: ReactNode");
    expect(source).toContain("{search}");
    expect(source).toContain("shrink-0");
  });
});

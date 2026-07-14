import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../package.json";

describe("components/graph/Footer.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "Footer.tsx"),
    "utf-8",
  );

  it("TOR-02-k4HmFPL: renders 'wiki-graph-explorer v<semver>' sourced from package.json", () => {
    expect(source).toContain("wiki-graph-explorer v{pkg.version}");
    expect(source).toContain('from "../../package.json"');
    expect(`wiki-graph-explorer v${pkg.version}`).toMatch(/wiki-graph-explorer v\d+\.\d+\.\d+/);
  });
});

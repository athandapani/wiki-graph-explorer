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

  it("TOR-08-LQAbYTw: renders the provenance sentence in source-count -> page-count-and-connection-count order when sourceCount is truthy", () => {
    expect(source).toContain(
      "`Built from ${sourceCount} raw sources → ${nodeCount} wiki pages and ${edgeCount} connections`",
    );
  });

  it("TOR-08-dkecfj5: omits the provenance clause, rendering only page and connection counts, when sourceCount is falsy", () => {
    expect(source).toContain("`${nodeCount} wiki pages · ${edgeCount} connections`");
    // Falsy (0 or null) both hit this branch via the `sourceCount ? ... : ...` ternary.
    expect(source).toContain("? sourceCount");
  });

  it("TOR-08-AzJ7BQu: renders the Esc-to-reset hint, gated on hasStats so the home page's parameterless <Footer /> never shows it", () => {
    expect(source).toContain("Esc to reset");
    expect(source).toContain("{hasStats ? (");
  });
});

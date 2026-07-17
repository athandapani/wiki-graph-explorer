import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/Legend.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "Legend.tsx"),
    "utf-8",
  );

  it("TOR-08-xZxrwfj: renders a legend entry per folder colored via getFolderColor(folder, isDark)", () => {
    expect(source).toContain("folders.map((folder)");
    expect(source).toContain("getFolderColor(folder, isDark)");
    expect(source).toContain('{folder || "Other"}');
  });

  it("TOR-08-hTq5dSY: renders a legend entry for active, revisiting, and dormant using StatusDot", () => {
    expect(source).toContain('["active", "revisiting", "dormant"]');
    expect(source).toContain("<StatusDot");
    expect(source).toContain("{status}");
  });
});

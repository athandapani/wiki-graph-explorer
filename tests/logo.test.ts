import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/Logo.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "Logo.tsx"),
    "utf-8",
  );

  it("TOR-07-Ht6rMqL: preserves the a11y contract Header.tsx depends on", () => {
    expect(source).toContain('role="img"');
    expect(source).toContain('aria-label="Wiki Graph Explorer logo"');
  });

  it("TOR-07-Ht6rMqL: themes via currentColor rather than a hardcoded color", () => {
    expect(source).toContain("currentColor");
    expect(source).not.toMatch(/fill="#[0-9a-fA-F]{3,6}"/);
    expect(source).not.toMatch(/stroke="#[0-9a-fA-F]{3,6}"/);
  });

  it("renders the Orbit Node mark: exactly one hub circle, one satellite circle, one connecting line", () => {
    // Regression guard against reverting to the old 4-circle/3-line symmetric star.
    const circleCount = (source.match(/<circle/g) ?? []).length;
    const lineCount = (source.match(/<line/g) ?? []).length;
    expect(circleCount).toBe(2);
    expect(lineCount).toBe(1);
  });
});

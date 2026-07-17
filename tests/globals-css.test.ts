import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/globals.css", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "app", "globals.css"), "utf-8");

  it("TOR-07-37VPhrV: no longer hardcodes Arial over the bound Geist font variable", () => {
    expect(source).not.toContain("Arial");
    expect(source).toContain("--font-sans: var(--font-geist-sans);");
  });

  it("TOR-07-7ha0SK5: declares an --accent custom property in both :root and .dark, mirroring nodeColor.ts's palette slot 0", () => {
    expect(source).toMatch(/:root\s*\{[^}]*--accent:\s*#2a78d6;/);
    expect(source).toMatch(/\.dark\s*\{[^}]*--accent:\s*#3987e5;/);
  });

  it("TOR-07-juwVT2o: declares a global :focus-visible ring with a negative outline-offset so it isn't clipped by overflow-hidden ancestors", () => {
    expect(source).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent\);[^}]*outline-offset:\s*-2px;/);
  });
});

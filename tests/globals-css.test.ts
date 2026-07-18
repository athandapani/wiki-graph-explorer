import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/globals.css", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "app", "globals.css"), "utf-8");

  // TOR-07-37VPhrV mandates the Geist typeface specifically. This is a documented Spec
  // Deviation (visual refresh, user-confirmed) — the site now uses Manrope/Inter instead,
  // same pattern as the earlier TOR-05-G72S3H4 deviation. Still asserts no hardcoded fallback
  // (Arial) silently overrides the bound font variable, which is the TOR's actual underlying
  // concern.
  it("TOR-07-37VPhrV (Spec Deviation): no longer hardcodes Arial over the bound font variable", () => {
    expect(source).not.toContain("Arial");
    expect(source).toContain("--font-sans: var(--font-inter);");
  });

  it("TOR-07-7ha0SK5: declares an --accent custom property in both :root and .dark, mirroring nodeColor.ts's palette slot 0", () => {
    expect(source).toMatch(/:root\s*\{[^}]*--accent:\s*#0088a3;/);
    expect(source).toMatch(/\.dark\s*\{[^}]*--accent:\s*#109cc6;/);
  });

  it("TOR-07-juwVT2o: declares a global :focus-visible ring with a negative outline-offset so it isn't clipped by overflow-hidden ancestors", () => {
    expect(source).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent\);[^}]*outline-offset:\s*-2px;/);
  });
});

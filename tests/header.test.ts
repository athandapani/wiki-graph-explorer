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

  it("TOR-07-7ha0SK5: tints the logo with the shared folder-palette accent, not the stock Tailwind blue", () => {
    expect(source).toContain("text-[var(--accent)]");
    expect(source).not.toContain("text-blue-500");
  });

  it("TOR-08-qBVi9Aa: accepts an optional tagline and renders it below the title, identity, when set", () => {
    expect(source).toContain("tagline?: string");
    expect(source).toContain("{tagline ? <p");
    expect(source).toContain("{tagline}</p>");
  });

  it("TOR-07-DsHsIKN: bumps the title to hero size/weight only when tagline is present, exceeding lane/section headings (text-xs) and side-panel body text (text-sm)", () => {
    expect(source).toContain('tagline ? "text-xl font-bold" : "text-lg font-semibold"');
  });
});

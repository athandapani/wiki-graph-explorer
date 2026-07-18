import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/layout.tsx", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "app", "layout.tsx"), "utf-8");

  it("TOR-07-Wb3kNfT: defaults to the dark theme class and runs an anti-flash script honoring a stored light preference", () => {
    expect(source).toContain('className={`${inter.variable} ${manrope.variable} dark h-full antialiased`}');
    expect(source).toContain("localStorage.getItem('theme')==='light'");
    expect(source).toContain("classList.remove('dark')");
  });

  it("TOR-07-Ht6rMqL: sets the page metadata title to the product name, not the create-next-app default", () => {
    expect(source).toContain('title: "Wiki Graph Explorer"');
    expect(source).not.toContain("Create Next App");
  });
});

describe("app/graph/page.tsx theme persistence", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "graph", "page.tsx"),
    "utf-8",
  );

  it("TOR-07-Wb3kNfT: persists the visitor's theme choice to localStorage on change", () => {
    expect(source).toContain("function handleThemeChange(nextIsDark: boolean)");
    expect(source).toContain('localStorage.setItem("theme", nextIsDark ? "dark" : "light")');
  });
});

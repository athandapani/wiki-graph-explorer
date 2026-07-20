import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/layout.tsx", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "app", "layout.tsx"), "utf-8");

  it("TOR-07-Wb3kNfT: defaults to the dark theme class and runs an anti-flash script honoring a stored light preference", () => {
    expect(source).toContain(
      "className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${fraunces.variable} ${sourceSans3.variable} dark h-full antialiased`}",
    );
    expect(source).toContain("localStorage.getItem('theme')==='light'");
    expect(source).toContain("classList.remove('dark')");
  });

  it("TOR-07-WU8PBMV: loads the Indigo/Plum preset fonts and runs an anti-flash script applying a stored theme preset or custom accent before paint", () => {
    expect(source).toContain('import { Fraunces, IBM_Plex_Sans, Inter, Manrope, Source_Sans_3, Space_Grotesk } from "next/font/google";');
    expect(source).toContain('variable: "--font-space-grotesk"');
    expect(source).toContain('variable: "--font-ibm-plex-sans"');
    expect(source).toContain('variable: "--font-fraunces"');
    expect(source).toContain('variable: "--font-source-sans-3"');
    expect(source).toContain("localStorage.getItem('themePreset')");
    expect(source).toContain("setAttribute('data-theme-preset',p)");
    expect(source).toContain("localStorage.getItem('customAccent')");
    expect(source).toContain("style.setProperty('--accent',c)");
    expect(source).toContain("style.setProperty('--accent',accents[p][dark?1:0])");
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

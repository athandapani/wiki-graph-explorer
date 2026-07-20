import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { PRESET_PALETTES } from "../components/graph/nodeColor";

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

  it("TOR-07-WU8PBMV: the anti-flash script's duplicated accent map matches nodeColor.ts's PRESET_PALETTES slot 0, so a reload never applies a stale accent for a curated preset", () => {
    // Regression guard: this map is hand-duplicated into the inline script (it must run before
    // any JS module import, so it can't just reference PRESET_PALETTES directly) and was once
    // left stale after a palette rework — reload silently applied an old, unvalidated accent for
    // Indigo/Plum. Building the expected substring from the live PRESET_PALETTES export means any
    // future palette change that forgets to update the duplicate fails this test immediately.
    const expected =
      `accents={teal:['${PRESET_PALETTES.teal.light[0]}','${PRESET_PALETTES.teal.dark[0]}']` +
      `,indigo:['${PRESET_PALETTES.indigo.light[0]}','${PRESET_PALETTES.indigo.dark[0]}']` +
      `,plum:['${PRESET_PALETTES.plum.light[0]}','${PRESET_PALETTES.plum.dark[0]}']}`;
    expect(source).toContain(expected);
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

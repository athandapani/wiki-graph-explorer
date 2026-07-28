import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const README_PATH = path.resolve(__dirname, "..", "README.md");
const readme = fs.readFileSync(README_PATH, "utf-8");

const DEMO_EMBED_PATTERN = /!\[[^\]]*\]\(([^)]+\.(?:gif|mp4|webm))\)/i;

describe("README demo media", () => {
  it("TOR-12-a4ESHYa: embeds an animated demo (.gif/.mp4/.webm) before the Getting Started heading", () => {
    const match = readme.match(DEMO_EMBED_PATTERN);
    expect(match).not.toBeNull();

    const embedIndex = match!.index!;
    const gettingStartedIndex = readme.indexOf("## Getting Started");

    expect(gettingStartedIndex).toBeGreaterThan(-1);
    expect(embedIndex).toBeLessThan(gettingStartedIndex);
  });

  it("TOR-12-T1Bb2fG: the referenced demo asset exists in the repository", () => {
    const match = readme.match(DEMO_EMBED_PATTERN);
    expect(match).not.toBeNull();

    const assetPath = match![1];
    const resolvedPath = path.resolve(__dirname, "..", assetPath);

    expect(fs.existsSync(resolvedPath)).toBe(true);
  });
});

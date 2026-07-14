import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { findSecondBrainPathViolations } from "../lib/second-brain-path-check";

describe("findSecondBrainPathViolations", () => {
  it("TOR-01-lgzWfrv: given a non-.md file containing a path-shaped second-brain reference, when scanned, then it is flagged", () => {
    const violations = findSecondBrainPathViolations([
      { path: "scripts/build.ts", content: 'const vault = "../second-brain/wiki";' },
    ]);
    expect(violations).toEqual(["scripts/build.ts"]);
  });

  it("given a non-.md file containing only prose mentioning second-brain (no path shape), when scanned, then it is not flagged", () => {
    const violations = findSecondBrainPathViolations([
      { path: "scripts/notes.ts", content: "// the private second-brain vault must stay isolated" },
    ]);
    expect(violations).toEqual([]);
  });

  it("given a path-shaped second-brain reference inside a .md file, when scanned, then it is not flagged (documentation exclusion)", () => {
    const violations = findSecondBrainPathViolations([
      { path: "CLAUDE.md", content: "npm run build:graph -- --vault ../second-brain" },
    ]);
    expect(violations).toEqual([]);
  });

  it("given a file mentioning 'second-brain-site' (different word), when scanned, then it is not flagged", () => {
    const violations = findSecondBrainPathViolations([
      { path: "scripts/notes.ts", content: '// see the second-brain-site repo for context' },
    ]);
    expect(violations).toEqual([]);
  });

  it("TOR-01-lgzWfrv: given the repository's actual committed source code and CI/CD configuration, when scanned, then zero violations are found", () => {
    const repoRoot = path.resolve(__dirname, "..");
    const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf-8", cwd: repoRoot })
      .split("\n")
      .filter((file) => file.length > 0 && file !== "scripts/check-no-second-brain-path.ts");

    const files = trackedFiles
      .map((relativePath) => ({ relativePath, fullPath: path.join(repoRoot, relativePath) }))
      .filter(({ fullPath }) => fs.existsSync(fullPath) && fs.statSync(fullPath).isFile())
      .map(({ relativePath, fullPath }) => ({
        path: relativePath,
        content: fs.readFileSync(fullPath, "utf-8"),
      }));

    const violations = findSecondBrainPathViolations(files);
    expect(violations).toEqual([]);
  });
});

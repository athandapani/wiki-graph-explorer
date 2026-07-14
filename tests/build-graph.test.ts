import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const buildGraphScript = path.join(repoRoot, "scripts", "build-graph.ts");

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(process.execPath, [tsxCli, buildGraphScript, ...args], {
    cwd: repoRoot,
    encoding: "utf-8",
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? 1,
  };
}

describe("build-graph CLI", () => {
  let tmpVaultDir: string;

  beforeEach(() => {
    tmpVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-vault-"));
  });

  afterEach(() => {
    fs.rmSync(tmpVaultDir, { recursive: true, force: true });
  });

  it("TOR-01-Oequ51V: given --version, when run, then stdout matches the version line and exit code is 0", () => {
    const { stdout, exitCode } = runCli(["--version"]);
    expect(stdout.trim()).toMatch(/^wiki-graph-explorer v\d+\.\d+\.\d+$/);
    expect(exitCode).toBe(0);
  });

  it("TOR-01-pWeHInR: given a valid --vault argument, when run, then the first stderr line is the stamped INFO startup record", () => {
    const { stderr } = runCli(["--vault", tmpVaultDir]);
    const firstLine = stderr.split("\n")[0];
    expect(firstLine).toMatch(/^\[INFO\] wiki-graph-explorer v\d+\.\d+\.\d+ /);
  });

  it("TOR-01-847tYDS: given a valid --vault path, when run, then stdout contains exactly one build-confirmation line and all other output is on stderr", () => {
    const { stdout, stderr, exitCode } = runCli(["--vault", tmpVaultDir]);
    const stdoutLines = stdout.split("\n").filter((line) => line.length > 0);
    expect(stdoutLines).toHaveLength(1);
    expect(stdoutLines[0]).toMatch(/^Wrote graph-data\.json \(\d+ nodes, \d+ edges\)$/);
    expect(exitCode).toBe(0);
    expect(stderr).toContain("[INFO]");
  });

  it("TOR-01-FPff1RV: given --vault /nonexistent/path, when run, then stderr names the problem and next action, exit code 1", () => {
    const missingPath = path.join(tmpVaultDir, "does-not-exist");
    const { stderr, exitCode } = runCli(["--vault", missingPath]);
    expect(stderr).toContain("vault path not found");
    expect(stderr).toContain("Check --vault points to a valid wiki directory");
    expect(exitCode).toBe(1);
  });

  it("TOR-01-LplbdUv: given an unrecognized flag, when run, then exit code is 2", () => {
    const { exitCode } = runCli(["--bogus-flag"]);
    expect(exitCode).toBe(2);
  });

  it("TOR-01-Z0d0o1e: given no args, when run, then stderr contains the usage hint and exit code is 2", () => {
    const { stderr, exitCode } = runCli([]);
    expect(stderr).toContain("--vault is required");
    expect(exitCode).toBe(2);
  });

  it("TOR-01-igqi4aJ: given no --vault flag, when run, then no graph-data.json is written and exit code is 2", () => {
    const outputFile = path.join(repoRoot, "local-build", "graph-data.json");
    const existedBefore = fs.existsSync(outputFile);
    const mtimeBefore = existedBefore ? fs.statSync(outputFile).mtimeMs : null;

    const { exitCode } = runCli([]);

    expect(exitCode).toBe(2);
    if (existedBefore) {
      expect(fs.statSync(outputFile).mtimeMs).toBe(mtimeBefore);
    } else {
      expect(fs.existsSync(outputFile)).toBe(false);
    }
  });
});

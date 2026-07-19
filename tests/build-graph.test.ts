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
    env: { ...process.env, WGE_FAKE_EMBEDDINGS: "1" },
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? 1,
  };
}

function writePage(
  vaultDir: string,
  relPath: string,
  frontmatter: { title: string; tags: string[]; status: string; description?: string },
  body: string,
): void {
  const fullPath = path.join(vaultDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const tagsYaml = `[${frontmatter.tags.join(", ")}]`;
  const descriptionLine =
    frontmatter.description !== undefined ? `description: ${frontmatter.description}\n` : "";
  const content = `---
title: ${frontmatter.title}
tags: ${tagsYaml}
status: ${frontmatter.status}
${descriptionLine}---

${body}
`;
  fs.writeFileSync(fullPath, content);
}

function readGraphData(): {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  meta: { sourceCount: number | null };
} {
  const outputFile = path.join(repoRoot, "local-build", "graph-data.json");
  return JSON.parse(fs.readFileSync(outputFile, "utf-8"));
}

function readVectorIndex(): Array<{ id: string; embedding: number[] }> {
  const outputFile = path.join(repoRoot, "local-build", "vector-index.json");
  return JSON.parse(fs.readFileSync(outputFile, "utf-8"));
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

  it("TOR-01-NTPrx23: given a vault page with valid frontmatter, when run, then graph-data.json has a matching node entry", () => {
    writePage(tmpVaultDir, "example.md", { title: "Example Page", tags: ["foo", "bar"], status: "current" }, "## Body\ncontent");

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes).toHaveLength(1);
    expect(graphData.nodes[0]).toMatchObject({
      id: "example",
      title: "Example Page",
      tags: ["foo", "bar"],
      status: "current",
    });
  });

  it("TOR-01-FQuBqe1: given a vault page with a frontmatter description, when run, then graph-data.json's node has that description", () => {
    writePage(
      tmpVaultDir,
      "example.md",
      {
        title: "Example Page",
        tags: [],
        status: "current",
        description: "A short summary of this page.",
      },
      "## Body\ncontent",
    );

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes[0].description).toBe("A short summary of this page.");
  });

  it("TOR-01-r0LGd50: given a page with no frontmatter description and a body paragraph, when run, then the node's description is that paragraph", () => {
    writePage(
      tmpVaultDir,
      "change-management.md",
      { title: "Change Management", tags: [], status: "current" },
      "# Change Management\n\nAdoption stalls when process change outpaces training. This page collects\nevidence on sequencing the two.\n\n## Related\n- [[training-programs]]\n",
    );

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes[0].description).toBe(
      "Adoption stalls when process change outpaces training. This page collects evidence on sequencing the two.",
    );
  });

  it("TOR-01-l3K1BGM: given a page with no description and a body of only headings/wikilinks, when run, then the node's description is empty and the node is still present, exit code 0", () => {
    writePage(
      tmpVaultDir,
      "example.md",
      { title: "Example Page", tags: [], status: "current" },
      "# Title\n\n## Related\n- [[foo|Foo]]\n",
    );

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes).toHaveLength(1);
    expect(graphData.nodes[0].description).toBe("");
  });

  it("TOR-01-VpUINkL, TOR-01-C9XWA4Y: given a page with 7 sequential inline links, when run, then graph-data.json's node has exactly the first 5 sourceLinks in document order", () => {
    const links = Array.from({ length: 7 }, (_, i) => `[link${i}](https://example.com/${i})`);
    writePage(
      tmpVaultDir,
      "example.md",
      { title: "Example Page", tags: [], status: "current" },
      `## Body\n${links.join(" ")}\n`,
    );

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes[0].sourceLinks).toEqual(
      Array.from({ length: 5 }, (_, i) => ({ text: `link${i}`, url: `https://example.com/${i}` })),
    );
  });

  it("TOR-01-6VVefyP: given a page with no inline Markdown links, when run, then the node's sourceLinks is empty and exit code is 0", () => {
    writePage(
      tmpVaultDir,
      "example.md",
      { title: "Example Page", tags: [], status: "current" },
      "## Body\nJust prose, no links here.",
    );

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes[0].sourceLinks).toEqual([]);
  });

  it("TOR-01-IBry2Oi: given page A Related->B and page B Referenced By->A, when run, then graph-data.json has exactly one edge connecting them", () => {
    writePage(tmpVaultDir, "page-a.md", { title: "Page A", tags: [], status: "current" }, "## Related\n- [[page-b|Page B]]\n");
    writePage(tmpVaultDir, "page-b.md", { title: "Page B", tags: [], status: "current" }, "## Referenced By\n- [[page-a|Page A]]\n");

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.edges).toHaveLength(1);
    const [a, b] = ["page-a", "page-b"].sort();
    expect(graphData.edges[0]).toEqual({ source: a, target: b });
  });

  it("TOR-01-aqsjUxj: given a page under a subdirectory, when run, then its node entry has the matching folder value", () => {
    writePage(tmpVaultDir, "change-management/example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes[0].folder).toBe("change-management");
  });

  it("TOR-01-dEUM3Pp: given one malformed and two valid files, when run, then stderr WARNs the invalid file and graph-data.json has the two valid nodes", () => {
    writePage(tmpVaultDir, "valid-1.md", { title: "Valid 1", tags: [], status: "current" }, "## Body\ncontent");
    writePage(tmpVaultDir, "valid-2.md", { title: "Valid 2", tags: [], status: "current" }, "## Body\ncontent");
    fs.writeFileSync(
      path.join(tmpVaultDir, "invalid.md"),
      "---\ntitle: [unclosed\nstatus: current\n---\n\nbody\n",
    );

    const { stderr, exitCode } = runCli(["--vault", tmpVaultDir]);

    expect(stderr).toMatch(/\[WARN\].*invalid\.md/);
    const graphData = readGraphData();
    expect(graphData.nodes).toHaveLength(2);
    expect(graphData.nodes.map((n) => n.id).sort()).toEqual(["valid-1", "valid-2"]);
    expect(exitCode).toBe(0);
  });

  it("TOR-01-6H0EK6c: given an empty vault directory, when run, then graph-data.json has empty nodes and edges arrays, exit code 0", () => {
    const { exitCode } = runCli(["--vault", tmpVaultDir]);

    expect(exitCode).toBe(0);
    const graphData = readGraphData();
    expect(graphData.nodes).toEqual([]);
    expect(graphData.edges).toEqual([]);
  });

  it("TOR-01-cqloSLI: given a vault with a valid page, when run, then graph-data.json is valid JSON with top-level nodes/edges arrays", () => {
    writePage(tmpVaultDir, "example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { exitCode } = runCli(["--vault", tmpVaultDir]);
    expect(exitCode).toBe(0);

    const outputFile = path.join(repoRoot, "local-build", "graph-data.json");
    const raw = fs.readFileSync(outputFile, "utf-8");
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed.nodes)).toBe(true);
    expect(Array.isArray(parsed.edges)).toBe(true);
    expect(typeof parsed.meta).toBe("object");
  });

  it("TOR-01-vhBOpOz: given a sibling raw/ directory with 40 Markdown files, when run, then meta.sourceCount is 40", () => {
    const wikiDir = path.join(tmpVaultDir, "wiki");
    const rawDir = path.join(tmpVaultDir, "raw");
    fs.mkdirSync(wikiDir);
    fs.mkdirSync(rawDir);
    writePage(wikiDir, "example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");
    for (let i = 0; i < 40; i++) {
      fs.writeFileSync(path.join(rawDir, `source-${i}.md`), `source ${i}`);
    }

    const { exitCode } = runCli(["--vault", wikiDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.meta.sourceCount).toBe(40);
  });

  it("TOR-01-gi1qoBS: given no sibling raw/ directory, when run, then meta.sourceCount is null and exit code 0", () => {
    const wikiDir = path.join(tmpVaultDir, "wiki");
    fs.mkdirSync(wikiDir);
    writePage(wikiDir, "example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { exitCode } = runCli(["--vault", wikiDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.meta.sourceCount).toBeNull();
  });

  it("TOR-01-gYbfrvE: given a sibling raw/ directory that exists but contains no Markdown files, when run, then meta.sourceCount is 0 and exit code 0", () => {
    const wikiDir = path.join(tmpVaultDir, "wiki");
    const rawDir = path.join(tmpVaultDir, "raw");
    fs.mkdirSync(wikiDir);
    fs.mkdirSync(rawDir);
    writePage(wikiDir, "example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { exitCode } = runCli(["--vault", wikiDir]);
    expect(exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.meta.sourceCount).toBe(0);
  });

  it("TOR-01-FFu6OJ3: given a previous run against a 3-page vault, when the vault changes and the tool runs again, then graph-data.json reflects only the current contents", () => {
    writePage(tmpVaultDir, "page-1.md", { title: "Page 1", tags: [], status: "current" }, "## Body\ncontent");
    writePage(tmpVaultDir, "page-2.md", { title: "Page 2", tags: [], status: "current" }, "## Body\ncontent");
    writePage(tmpVaultDir, "page-3.md", { title: "Page 3", tags: [], status: "current" }, "## Body\ncontent");

    expect(runCli(["--vault", tmpVaultDir]).exitCode).toBe(0);
    expect(readGraphData().nodes).toHaveLength(3);

    fs.rmSync(path.join(tmpVaultDir, "page-2.md"));
    writePage(tmpVaultDir, "page-4.md", { title: "Page 4", tags: [], status: "current" }, "## Body\ncontent");

    expect(runCli(["--vault", tmpVaultDir]).exitCode).toBe(0);
    const graphData = readGraphData();
    const ids = graphData.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(["page-1", "page-3", "page-4"]);
  });

  it("TOR-01-uY4K5t1: given a newly added page, when the tool runs again, then graph-data.json and vector-index.json both include an entry for it, with no tool-code changes", () => {
    writePage(tmpVaultDir, "page-1.md", { title: "Page 1", tags: [], status: "current" }, "## Body\ncontent");
    writePage(tmpVaultDir, "page-2.md", { title: "Page 2", tags: [], status: "current" }, "## Body\ncontent");

    expect(runCli(["--vault", tmpVaultDir]).exitCode).toBe(0);
    expect(readGraphData().nodes).toHaveLength(2);
    expect(readVectorIndex()).toHaveLength(2);

    writePage(tmpVaultDir, "page-new.md", { title: "Page New", tags: [], status: "current" }, "## Body\ncontent");

    expect(runCli(["--vault", tmpVaultDir]).exitCode).toBe(0);

    const graphData = readGraphData();
    expect(graphData.nodes.map((n) => n.id).sort()).toEqual(["page-1", "page-2", "page-new"]);

    const vectorIndex = readVectorIndex();
    expect(vectorIndex.map((entry) => entry.id).sort()).toEqual(["page-1", "page-2", "page-new"]);
    const newEntry = vectorIndex.find((entry) => entry.id === "page-new");
    expect(newEntry?.embedding.length).toBeGreaterThan(0);
  });
});

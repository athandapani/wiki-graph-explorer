import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildGraph } from "../lib/graph-builder";
import { walkVault } from "../lib/vault-walker";

function writePage(
  vaultDir: string,
  relPath: string,
  frontmatter: { title: string; tags: string[]; status: string },
  body: string,
): void {
  const fullPath = path.join(vaultDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const tagsYaml = `[${frontmatter.tags.join(", ")}]`;
  const content = `---
title: ${frontmatter.title}
tags: ${tagsYaml}
status: ${frontmatter.status}
---

${body}
`;
  fs.writeFileSync(fullPath, content);
}

describe("buildGraph", () => {
  let vaultDir: string;
  let warnSpy: (message: string) => void;
  let warnCalls: string[];
  let debugSpy: (message: string) => void;
  let debugCalls: string[];

  beforeEach(() => {
    vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-graph-"));
    warnCalls = [];
    warnSpy = vi.fn((message: string) => warnCalls.push(message));
    debugCalls = [];
    debugSpy = vi.fn((message: string) => debugCalls.push(message));
  });

  afterEach(() => {
    fs.rmSync(vaultDir, { recursive: true, force: true });
  });

  it("TOR-01-NTPrx23: given one valid page, when built, then node id/title/tags/status match frontmatter", () => {
    writePage(vaultDir, "example.md", { title: "Example Page", tags: ["foo", "bar"], status: "current" }, "## Body\ncontent");

    const { nodes } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe("example");
    expect(nodes[0].title).toBe("Example Page");
    expect(nodes[0].tags).toEqual(["foo", "bar"]);
    expect(nodes[0].status).toBe("current");
  });

  it("TOR-04-JCORp98: given a page under a subfolder, when built, then node path is the vault-relative path", () => {
    writePage(vaultDir, "sources/example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { nodes } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(nodes[0].path).toBe("sources/example.md");
  });

  it("TOR-01-aqsjUxj: given a page under change-management/, when built, then folder is 'change-management'", () => {
    writePage(vaultDir, "change-management/example.md", { title: "Example", tags: [], status: "current" }, "## Body\ncontent");

    const { nodes } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(nodes[0].folder).toBe("change-management");
  });

  it("TOR-01-IBry2Oi: given page A Related->B and page B Referenced By->A, when built, then exactly one edge connects A and B", () => {
    writePage(vaultDir, "page-a.md", { title: "Page A", tags: [], status: "current" }, "## Related\n- [[page-b|Page B]]\n");
    writePage(vaultDir, "page-b.md", { title: "Page B", tags: [], status: "current" }, "## Referenced By\n- [[page-a|Page A]]\n");

    const { edges } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(edges).toHaveLength(1);
    const [a, b] = ["page-a", "page-b"].sort();
    expect(edges[0]).toEqual({ source: a, target: b });
  });

  it("given a page whose body contains an inline Markdown link, when built, then the node's sourceLinks field contains that entry", () => {
    writePage(
      vaultDir,
      "example.md",
      { title: "Example", tags: [], status: "current" },
      "## Body\nSee [this report](https://example.com/report) for details.",
    );

    const { nodes } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(nodes[0].sourceLinks).toEqual([
      { text: "this report", url: "https://example.com/report" },
    ]);
  });

  it("TOR-01-DPjgHwE: given a page with '## Related'/'## Referenced By' sections, when built, then edges are produced to both targets", () => {
    writePage(vaultDir, "source.md", { title: "Source", tags: [], status: "current" }, "## Related\n- [[training-programs]]\n\n## Referenced By\n- [[change-management-overview]]\n");
    writePage(vaultDir, "training-programs.md", { title: "Training Programs", tags: [], status: "current" }, "## Body\ncontent");
    writePage(vaultDir, "change-management-overview.md", { title: "Change Management Overview", tags: [], status: "current" }, "## Body\ncontent");

    const { edges } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    const edgeIds = edges.map((edge) => [edge.source, edge.target].sort().join("::"));
    expect(edgeIds).toContain(["source", "training-programs"].sort().join("::"));
    expect(edgeIds).toContain(["change-management-overview", "source"].sort().join("::"));
  });

  it("TOR-01-7lCwTjk: given a cross-folder, case-different wikilink and a title match, when built, then an edge connects them", () => {
    writePage(vaultDir, "concepts/example.md", { title: "Example", tags: [], status: "current" }, "## Body\nSee [[change management]] for context.");
    writePage(vaultDir, "sources/Change Management.md", { title: "Change Management", tags: [], status: "current" }, "## Body\ncontent");

    const { edges } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(edges).toHaveLength(1);
    expect([edges[0].source, edges[0].target].sort()).toEqual(
      ["example", "Change Management"].sort(),
    );
  });

  it("TOR-01-OgWxAs0: given two same-titled pages in different folders, when built twice, then both runs resolve to the identical node", () => {
    writePage(vaultDir, "folder-a/overview.md", { title: "Overview", tags: [], status: "current" }, "## Body\ncontent");
    writePage(vaultDir, "folder-b/overview.md", { title: "Overview", tags: [], status: "current" }, "## Body\ncontent");
    writePage(vaultDir, "linker.md", { title: "Linker", tags: [], status: "current" }, "## Body\nSee [[Overview]].");

    const firstRun = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);
    const secondRun = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    const targetOf = (result: typeof firstRun): string | undefined =>
      result.edges.find((edge) => edge.source === "linker" || edge.target === "linker") &&
      [
        result.edges.find((edge) => edge.source === "linker" || edge.target === "linker")!.source,
        result.edges.find((edge) => edge.source === "linker" || edge.target === "linker")!.target,
      ].find((id) => id !== "linker");

    expect(firstRun.edges).toHaveLength(1);
    expect(secondRun.edges).toHaveLength(1);
    expect(targetOf(firstRun)).toBe(targetOf(secondRun));
  });

  it("TOR-01-lgSvch6: given a wikilink to a nonexistent page, when built, then it is dropped and logged at DEBUG only", () => {
    writePage(vaultDir, "example.md", { title: "Example", tags: [], status: "current" }, "## Body\nSee [[Nonexistent Page]] for more.");

    const { nodes, edges } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy, debugSpy);

    expect(nodes.map((n) => n.id)).not.toContain("Nonexistent Page");
    expect(edges).toHaveLength(0);
    expect(debugCalls).toHaveLength(1);
    expect(debugCalls[0]).toContain("Nonexistent Page");
    expect(warnCalls).toHaveLength(0);
  });

  it("TOR-01-dEUM3Pp: given one malformed and two valid files, when built, then warn names the malformed file and nodes has only the two valid entries", () => {
    writePage(vaultDir, "valid-1.md", { title: "Valid 1", tags: [], status: "current" }, "## Body\ncontent");
    writePage(vaultDir, "valid-2.md", { title: "Valid 2", tags: [], status: "current" }, "## Body\ncontent");
    fs.writeFileSync(
      path.join(vaultDir, "invalid.md"),
      "---\ntitle: [unclosed\nstatus: current\n---\n\nbody\n",
    );

    const { nodes } = buildGraph(vaultDir, walkVault(vaultDir), warnSpy);

    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.id).sort()).toEqual(["valid-1", "valid-2"]);
    expect(warnCalls).toHaveLength(1);
    expect(warnCalls[0]).toContain("invalid.md");
  });
});

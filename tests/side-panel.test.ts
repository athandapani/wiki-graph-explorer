import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { GraphEdge } from "../components/graph/GraphCanvas";
import { getRelatedNodeIds } from "../components/graph/SidePanel";

describe("getRelatedNodeIds", () => {
  it("TOR-04-p0sfy0j: returns the connected node id when edges use string endpoints", () => {
    const edges: GraphEdge[] = [
      { source: "a", target: "b" },
      { source: "c", target: "a" },
      { source: "b", target: "c" },
    ];

    expect(getRelatedNodeIds("a", edges).sort()).toEqual(["b", "c"]);
  });

  it("TOR-04-p0sfy0j: returns the connected node id when edges use mutated object endpoints", () => {
    // react-force-graph-2d mutates edge.source/target from string ids to node object refs
    // in place once its layout simulation runs.
    const edges = [
      { source: { id: "a" }, target: { id: "b" } },
      { source: { id: "c" }, target: { id: "a" } },
    ] as unknown as GraphEdge[];

    expect(getRelatedNodeIds("a", edges).sort()).toEqual(["b", "c"]);
  });
});

describe("components/graph/SidePanel.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "SidePanel.tsx"),
    "utf-8",
  );

  it("TOR-04-I0T4GDu: displays the clicked node's title", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("node.title");
  });

  it("TOR-04-tgCQzbT: has a close control wired to onClose", () => {
    expect(source).toContain("onClick={onClose}");
  });

  it("TOR-04-OSiZDmK: displays tags and a status dot matching the node's status", () => {
    expect(source).toContain("node.tags");
    expect(source).toContain("<StatusDot");
    expect(source).toContain("status={node.status}");
  });

  it("TOR-04-JCORp98: displays a View source on GitHub link opening the raw file in a new tab", () => {
    expect(source).toContain("getGithubSourceUrl(node.path)");
    expect(source).toContain('target="_blank"');
    expect(source).toContain("View source on GitHub");
  });

  it("takes up real layout space instead of overlaying/blocking content, and stays visible at all times", () => {
    expect(source).not.toContain("fixed top-0 right-0");
    expect(source).not.toContain("translate-x");
    expect(source).toContain('className="h-full w-80 shrink-0');
    expect(source).not.toContain('"w-80" : "w-0"');
  });

  it("shows a placeholder prompt instead of collapsing when no node is selected", () => {
    expect(source).toContain("Select a node to see its details");
  });

  it("TOR-05-EmhMDFS: renders the full, untruncated related-node list so a visitor can observe sparse connections directly", () => {
    expect(source).not.toMatch(/relatedNodes\.slice/);
    expect(source).not.toMatch(/relatedNodes\.filter\([^)]*index/);
    expect(source).toContain("relatedNodes.map((related) => (");
    expect(source).toContain("No related pages.");
  });
});

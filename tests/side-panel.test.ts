import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { GraphEdge, GraphNode } from "../components/graph/GraphCanvas";
import { getRelatedNodeIds, groupNodesByFolder } from "../components/graph/SidePanel";

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

function node(id: string, folder: string): GraphNode {
  return {
    id,
    title: `Title ${id}`,
    tags: [],
    status: "active",
    description: "",
    folder,
    path: `${id}.md`,
  };
}

describe("groupNodesByFolder", () => {
  it("TOR-04-xeqtJpo: groups 2 'concepts' nodes and 1 'sources' node into their folder groups, in first-seen order", () => {
    const nodes = [
      node("c1", "concepts"),
      node("s1", "sources"),
      node("c2", "concepts"),
    ];

    expect(groupNodesByFolder(nodes)).toEqual([
      { folder: "concepts", nodes: [nodes[0], nodes[2]] },
      { folder: "sources", nodes: [nodes[1]] },
    ]);
  });

  it("returns an empty array for an empty node list", () => {
    expect(groupNodesByFolder([])).toEqual([]);
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

  it("TOR-04-iI9aJNn: displays a folder badge colored via getFolderColor(node.folder, isDark)", () => {
    expect(source).toContain("getFolderColor(node.folder, isDark)");
    expect(source).toContain("{node.folder}");
  });

  it("TOR-04-0igGafN: displays the node's description when non-empty", () => {
    expect(source).toContain("node.description ? (");
    expect(source).toContain("{node.description}");
  });

  it("TOR-04-olJvPNV: renders nothing (not even a placeholder) when description is empty", () => {
    // The conditional renders `null` in the false branch, so nothing mounts when description is "".
    expect(source).toMatch(/node\.description\s*\?\s*\(/);
    expect(source).not.toMatch(/node\.description\s*\?\s*\([\s\S]*?\)\s*:\s*<p/);
  });

  it("TOR-04-xeqtJpo: groups connected pages by folder and renders each as a PillNode chip", () => {
    expect(source).toContain("groupNodesByFolder(relatedNodes)");
    expect(source).toContain("<PillNode");
    expect(source).toContain("Connected pages");
    // Untruncated rendering (TOR-05-EmhMDFS): no slice/index-based filtering anywhere in the
    // grouping/rendering path.
    expect(source).not.toMatch(/relatedNodes\.slice/);
    expect(source).not.toMatch(/folderNodes\.slice/);
    expect(source).not.toMatch(/\.filter\([^)]*index/);
    expect(source).toContain("No connected pages.");
  });

  it("TOR-04-1iMsnYq: wires chip clicks to the onSelectNode callback prop", () => {
    expect(source).toContain("onSelectNode: (node: GraphNode) => void");
    expect(source).toContain("onClick={onSelectNode}");
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
    // Superseded rendering shape: TOR-04-xeqtJpo groups the same untruncated related-node list
    // by folder into chips instead of a flat <ul>. The "no truncation" guarantee still holds —
    // see the TOR-04-xeqtJpo test above, which asserts no slice/index-based filtering anywhere
    // in the grouping/rendering path.
    expect(source).toContain("groupNodesByFolder(relatedNodes)");
    expect(source).not.toMatch(/relatedNodes\.slice/);
    expect(source).not.toMatch(/relatedNodes\.filter\([^)]*index/);
  });
});

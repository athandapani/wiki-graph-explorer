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
    sourceLinks: [],
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

  it("TOR-04-nsmOOZ8: displays a Cited sources section listing clickable links when sourceLinks is non-empty", () => {
    expect(source).toContain("node.sourceLinks.length > 0 ? (");
    expect(source).toContain("Cited sources");
    expect(source).toContain("node.sourceLinks.map");
    expect(source).toContain("{link.text}");
  });

  it("TOR-04-F5cdTRd: renders nothing (not even a placeholder) when sourceLinks is empty", () => {
    // The conditional renders `null` in the false branch, so nothing mounts when sourceLinks is [].
    expect(source).toMatch(/node\.sourceLinks\.length > 0 \? \(/);
    expect(source).not.toMatch(/node\.sourceLinks\.length > 0 \? \([\s\S]*?\)\s*:\s*<(ul|div|p)/);
  });

  it("TOR-04-9JDfgAA: each cited-source link opens its target url in a new tab", () => {
    expect(source).toContain('href={link.url}');
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
  });

  it("TOR-04-JCORp98: displays a View source on GitHub link opening the raw file in a new tab", () => {
    expect(source).toContain("getGithubSourceUrl(node.path)");
    expect(source).toContain('target="_blank"');
    expect(source).toContain("View source on GitHub");
  });

  it("at desktop widths (md+), takes up real layout space instead of overlaying/blocking content, and stays visible at all times regardless of selection", () => {
    // Updated for TOR-09-ULogLhW/TOR-09-Gx908bc (epic nB4iwQu): the panel is now genuinely
    // `fixed` below md as a bottom sheet — that's the point of this epic, not a regression. What
    // must still never happen, at any breakpoint, is a slide-off-screen drawer (translate-x) or a
    // naive width-collapse toggle; and at md+ specifically, the panel must remain a real in-flow
    // column exactly as before.
    expect(source).not.toContain("fixed top-0 right-0");
    expect(source).not.toContain("translate-x");
    expect(source).not.toContain('"w-80" : "w-0"');
    expect(source).toContain("md:static");
    expect(source).toContain("md:w-80");
    expect(source).toContain("md:shrink-0");
  });

  it("TOR-09-ULogLhW: below md, the panel is a fixed bottom-sheet overlay (not a fixed-width column) when no node is selected", () => {
    // The unselected branch is deliberately never `hidden` — merging with TOR-08-LuQzsEi
    // (start-anywhere card must render "whenever no node is selected") revealed that hiding
    // the panel entirely on mobile made the onboarding card unreachable there. A `fixed`
    // overlay satisfies both: it still doesn't compete with the board for horizontal width
    // (TOR-09-ULogLhW's actual requirement), while remaining visible (TOR-08-LuQzsEi's).
    expect(source).toContain("panelClassName = node");
    expect(source).toContain('"fixed inset-x-0 bottom-0 z-30 max-h-[45vh]');
  });

  it("TOR-09-Gx908bc: below md, selecting a node turns the panel into a fixed bottom sheet overlaying the lower viewport", () => {
    expect(source).toContain('"fixed inset-x-0 bottom-0');
    expect(source).toContain("max-h-[70vh]");
    expect(source).toContain("overflow-y-auto");
  });

  it("shows a placeholder prompt instead of collapsing when no node is selected", () => {
    expect(source).toContain("Start anywhere");
  });

  it("TOR-08-LuQzsEi: displays a 'Start anywhere' card naming what the map is built from, whenever no node is selected", () => {
    expect(source).toContain("Start anywhere");
    expect(source).toContain("This map is built from {allNodes.length}");
    expect(source).toContain("<Legend");
  });

  it("TOR-08-Z2By5L0: displays a concrete first-move suggestion", () => {
    expect(source).toContain("Not sure where to start?");
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

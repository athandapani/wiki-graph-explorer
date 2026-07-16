import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/SwimLaneCanvas.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "SwimLaneCanvas.tsx"),
    "utf-8",
  );

  it("TOR-06-6dbr9Jn: is a client component that groups nodes into lanes via assignLanes", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("assignLanes(laneNodes)");
  });

  it("TOR-06-0ZRtILL: stacks lanes vertically as full-width bands, wrapping each lane's pills within the viewport with no scrollbars", () => {
    expect(source).toContain("flex h-full flex-col");
    expect(source).toContain("overflow-hidden");
    expect(source).toContain("flex-wrap");
    expect(source).not.toContain("overflow-y-auto");
    expect(source).not.toContain("overflow-x-auto");
  });

  it("TOR-06-nQ4vXsD: hides zero-connection nodes from the board and reduces low-connection nodes to click-revealable", () => {
    expect(source).toContain("if (degree === 0) continue;");
    expect(source).toContain("degree <= LOW_DEGREE_THRESHOLD");
    expect(source).toContain("revealable.add(node.id)");
  });

  it("falls back to showing all nodes if degree-based filtering would leave the board empty", () => {
    expect(source).toContain("if (base.length === 0)");
  });

  it("TOR-06-Zk8pLwR: pulls a low-connection related node into its lane and connects it with a dashed line when revealed by a click", () => {
    expect(source).toContain("getRelatedNodeIds(activeNodeId, edges)");
    expect(source).toContain(".filter((id) => revealableIds.has(id))");
    expect(source).toContain('strokeDasharray="3 3"');
  });

  it("TOR-06-RlMt9hc: has no camera/pan-zoom API, so clicking a node cannot move a viewport", () => {
    expect(source).not.toContain("centerAt");
    expect(source).not.toContain("zoomToFit");
    expect(source).not.toContain(".zoom(");
  });

  it("TOR-06-tq70ta7: renders connector lines only when a node is active", () => {
    expect(source).toContain("activeNodeId != null &&");
  });

  it("TOR-06-pbVYver: animates connector lines drawing over CONNECTOR_ANIMATION_DURATION_MS via stroke-dashoffset", () => {
    expect(source).toContain("CONNECTOR_ANIMATION_DURATION_MS");
    expect(source).toContain("pathLength");
    expect(source).toContain("strokeDasharray");
    expect(source).toContain("`stroke-dashoffset ${CONNECTOR_ANIMATION_DURATION_MS}ms ease-out`");
  });

  it("TOR-06-baMJL3X: keys connector paths by the active node so a new click remounts and redraws them", () => {
    expect(source).toContain("key={`${activeNodeId}-${targetId}`}");
  });

  it("TOR-06-n4fJkbK: invokes the onNodeClick callback prop when a pill is clicked", () => {
    expect(source).toContain("onNodeClick?: (node: GraphNode) => void");
    expect(source).toContain("onNodeClick?.(node)");
  });

  it("TOR-06-M0SNN90: renders EmptyState instead of a board when there are zero nodes", () => {
    expect(source).toContain("nodes.length === 0");
    expect(source).toContain("<EmptyState");
  });

  it("anchors connector lines to each pill's top/bottom mid-point rather than its center", () => {
    expect(source).toContain('edge === "top" ? rect.top : rect.bottom');
    expect(source).toContain("pickConnectorEdges(sourceCenterY, targetCenterY)");
  });

  it("colors each connector line by its destination node's folder color", () => {
    expect(source).toContain("getFolderColor(targetNode.folder, isDark)");
  });

  it("dims nodes that are not the active node and not directly connected to it", () => {
    expect(source).toContain(
      "new Set([activeNodeId, ...getRelatedNodeIds(activeNodeId, edges)])",
    );
    expect(source).toContain("highlightedIds != null && !highlightedIds.has(node.id)");
  });

  it("TOR-03-Z3ApPfB: dims by search score as well as by selection, without either erasing the other", () => {
    // Both dimming sources OR together — a search-dimmed pill must stay dimmed while a node is
    // selected, and vice versa. Behavior is covered for real in tests/swim-lane-canvas.test.tsx.
    expect(source).toContain("computeSearchDimmedNodeIds(nodes, searchScores ?? null, relevanceThreshold)");
    expect(source).toMatch(/isDimmed=\{[\s\S]*?highlightedIds[\s\S]*?\|\|[\s\S]*?searchDimmedIds\.has\(node\.id\)[\s\S]*?\}/);
  });

  it("renders the connector-line svg behind the pill nodes (negative z-index)", () => {
    expect(source).toContain('className="pointer-events-none absolute inset-0 -z-10 h-full w-full"');
  });

  it("TOR-04-1iMsnYq: syncs activeNodeId from an externally focused node (e.g. a SidePanel chip click), one-way and non-null-only", () => {
    expect(source).toContain("focusedNodeId?: string | null");
    // Adjusted during render (not inside useEffect) per React's props->state sync pattern.
    expect(source).toContain("if (focusedNodeId !== prevFocusedNodeId)");
    expect(source).toMatch(/if \(focusedNodeId !== prevFocusedNodeId\) \{\s*setPrevFocusedNodeId\(focusedNodeId\);\s*if \(focusedNodeId != null\) \{\s*setActiveNodeId\(focusedNodeId\);/);
    // Regression guard: TOR-06-RlMt9hc forbids a camera/pan-zoom API in this file.
    expect(source).not.toContain("centerAt");
    expect(source).not.toContain("zoomToFit");
    expect(source).not.toContain(".zoom(");
  });
});

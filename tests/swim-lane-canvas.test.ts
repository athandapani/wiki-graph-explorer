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
    expect(source).toContain("assignLanes(laneNodes, hiddenCandidateNodes, zeroDegreeOnlyFolders)");
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

  it("hides nodes that are not the active node and not directly connected to it", () => {
    expect(source).toContain(
      "new Set([activeNodeId, ...getRelatedNodeIds(activeNodeId, edges)])",
    );
    expect(source).toContain("highlightedIds != null && !highlightedIds.has(node.id)");
  });

  it("TOR-03-Z3ApPfB: dims by search score when no selection is active, and hides by selection (fully invisible, not merely dimmed) once a node is clicked", () => {
    // isDimmed (partial fade — TOR-03-Z3ApPfB's "dimmed") is search-only, so a pure search query
    // with no active selection still reads as dimmed, not hidden. isHiddenBySelection (fully
    // invisible) is selection-only and takes visual precedence once a node is clicked — the board
    // enters a focus mode where cluster-exclusion supersedes search-relevance fading. Behavior is
    // covered for real in tests/swim-lane-canvas.test.tsx.
    expect(source).toContain("computeSearchDimmedNodeIds(nodes, searchScores ?? null, relevanceThreshold)");
    expect(source).toContain("isDimmed={searchDimmedIds.has(node.id)}");
    expect(source).toMatch(
      /isHiddenBySelection=\{[\s\S]*?highlightedIds != null && !highlightedIds\.has\(node\.id\)[\s\S]*?\}/,
    );
  });

  it("renders the connector-line svg behind the pill nodes (negative z-index)", () => {
    expect(source).toContain('className="pointer-events-none absolute inset-0 -z-10 h-full w-full"');
  });

  it("gives the pill-row container an explicit stacking-context z-index above the connector svg", () => {
    // Belt-and-suspenders guarantee (on top of the svg's -z-10 above) that pills are always an
    // unambiguous stacking-context member above the connector lines, regardless of any future
    // change to pill or lane styling — a pill's text must never be visually covered by a line.
    expect(source).toContain(
      'className="relative z-0 flex flex-wrap content-start gap-x-1 gap-y-0.5 overflow-hidden"',
    );
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

  it('TOR-06-BxA7IRn: computes still-hidden candidates for the per-lane "+N more" affordance from zero- and low-degree nodes not already shown', () => {
    expect(source).toContain("const zeroDegreeIds = useMemo(");
    expect(source).toContain("new Set([...zeroDegreeIds, ...revealableIds])");
  });

  it('TOR-06-BxA7IRn: renders a "+N more" affordance reading the lane\'s exact hidden count', () => {
    expect(source).toMatch(/\+\{lane\.hiddenNodeIds\.length\}\s*more/);
  });

  it('TOR-06-ihpx0Ya: omits the "+N more" affordance once a lane is expanded or has no hidden nodes', () => {
    expect(source).toContain("!isExpanded && lane.hiddenNodeIds.length > 0 &&");
  });

  it("TOR-06-YjETzyC: activating a lane's affordance renders all its hidden nodes as clickable pills", () => {
    expect(source).toContain("setExpandedLaneNames((prev) => new Set(prev).add(laneName))");
    expect(source).toContain(
      "isExpanded ? [...lane.nodeIds, ...lane.hiddenNodeIds] : lane.nodeIds",
    );
  });

  it("TOR-06-JuNSwaW: renders each lane as a tinted rounded container with a heading and a page-count descriptor", () => {
    expect(source).toContain("rounded-lg");
    // Flat, folder-agnostic tint (not per-folder accent) — still a background distinguishing the
    // lane from the board background, just uniform across lanes so color reads only on pills.
    expect(source).toContain(
      'backgroundColor: isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.035)"',
    );
    expect(source).toMatch(/\{totalCount\} page\{totalCount === 1 \? "" : "s"\} total/);
  });

  it("TOR-07-VBZZx0f/dttI7qm: accepts a paletteVersion prop and includes it in the connectorPaths effect's dependency array, so connector colors recompute on a theme-preset change alone", () => {
    expect(source).toContain("paletteVersion?: number;");
    const effectStart = source.indexOf("setConnectorPaths(paths);");
    const depsBlock = source.slice(effectStart, source.indexOf(";", source.indexOf("]);", effectStart)));
    expect(depsBlock).toContain("paletteVersion");
  });
});

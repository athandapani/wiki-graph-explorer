import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/GraphCanvas.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "GraphCanvas.tsx"),
    "utf-8",
  );

  it("TOR-02-TW7XEms: is a client component rendering ForceGraph2D with nodes/links from graphData", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("ForceGraph2D");
    expect(source).toMatch(/graphData=\{\{\s*nodes,\s*links:\s*edges\s*\}\}/);
  });

  it("TOR-02-Hja6xEo: renders a visible connecting line for each edge via ForceGraph2D's link rendering", () => {
    // react-force-graph-2d renders every entry in `links` as a connecting line by default;
    // no custom link renderer overrides that, so edges pass straight through unmodified.
    expect(source).not.toContain("linkVisibility");
    expect(source).toContain("links: edges");
  });

  it("TOR-02-6fwdtOM: wires a hover tooltip containing the node's title", () => {
    expect(source).toContain("nodeLabel");
    expect(source).toContain("node.title");
  });

  it("TOR-02-VLOPcgD: wires click-to-center-zoom with a 900ms duration", () => {
    expect(source).toContain("onNodeClick");
    expect(source).toContain("centerAt");
    expect(source).toContain("CLICK_ZOOM_DURATION_MS = 900");
  });

  it("wires theme-aware taxonomy coloring into the custom node draw, with no icon overlay", () => {
    expect(source).toContain("getFolderColor(node.folder, isDark)");
    expect(source).toContain("nodePointerAreaPaint");
    expect(source).not.toContain("statusColor");
  });

  it("tightens the default force layout so a sparse graph doesn't scatter across empty canvas", () => {
    expect(source).toContain('d3Force("charge")');
    expect(source).toContain('d3Force("link")');
  });

  it("draws each node's title as a visible label beneath it, not just in the hover tooltip", () => {
    expect(source).toContain("ctx.fillText(node.title, x, y + radius + LABEL_GAP)");
  });

  it("TOR-02-pRzSHQL: fits the view to the graph once the layout engine settles", () => {
    expect(source).toContain("onEngineStop");
    expect(source).toContain("zoomToFit");
  });

  it("TOR-04-I0T4GDu: invokes the onNodeClick callback prop when a node is clicked", () => {
    expect(source).toContain("onNodeClick?: (node: GraphNode) => void");
    expect(source).toContain("onNodeClick?.(node)");
  });

  it("TOR-03-UH4yx26: dims nodes below the relevance threshold via ctx.globalAlpha", () => {
    // The below-threshold decision itself moved into computeSearchDimmedNodeIds so that this
    // canvas and the swim-lane board cannot drift apart (TOR-03-Z3ApPfB requires they dim
    // identically). That function's behavior is tested directly in tests/use-search-ranking.test.ts;
    // what matters here is that this canvas routes its dimming through it and applies the result.
    expect(source).toContain("searchScores?: Map<string, number> | null");
    expect(source).toContain("relevanceThreshold?: number");
    expect(source).toContain("computeSearchDimmedNodeIds(nodes, searchScores ?? null, relevanceThreshold)");
    expect(source).toContain("const searchDimmed = searchDimmedNodeIds.has(node.id);");
    expect(source).toContain("ctx.globalAlpha = dimmed ? DIMMED_OPACITY : 1");
  });

  it("TOR-03-e3TJKQb: restores full opacity for every node when searchScores is null/unset", () => {
    expect(source).toContain("ctx.globalAlpha = 1");
  });

  it("TOR-05-dfhLAbM / TOR-05-UPr1Am6: dims nodes excluded by the status/folder filter alongside search dimming", () => {
    expect(source).toContain("filteredOutNodeIds?: Set<string> | null");
    expect(source).toContain("filteredOutNodeIds?.has(node.id) ?? false");
    expect(source).toContain("const dimmed = searchDimmed || filterDimmed;");
  });

  it("TOR-05-02VIaa3: scales node radius (and its click hit-area) by radiusScaleByNodeId", () => {
    expect(source).toContain("radiusScaleByNodeId?: Map<string, number> | null");
    expect(source.match(/const radius = NODE_RADIUS \* \(radiusScaleByNodeId\?\.get\(node\.id\) \?\? 1\);/g)?.length).toBe(2);
    expect(source).toContain("ctx.arc(x, y, radius, 0, 2 * Math.PI);");
  });

  it("TOR-04-1iMsnYq: centers/zooms to an externally focused node (e.g. a SidePanel chip click), reusing the same click-zoom constants", () => {
    expect(source).toContain("focusedNodeId?: string | null");
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?focusedNodeId[\s\S]*?centerAt[\s\S]*?CLICK_ZOOM_DURATION_MS[\s\S]*?\}, \[focusedNodeId, nodes\]\);/);
    expect(source).toMatch(/graphRef\.current\?\.zoom\(CLICK_ZOOM_LEVEL, CLICK_ZOOM_DURATION_MS\)/);
  });
});

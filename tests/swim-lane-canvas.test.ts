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
    expect(source).toContain("assignLanes(nodes)");
  });

  it("TOR-06-0ZRtILL: lays out lanes to fit the viewport height without a vertical scrollbar", () => {
    expect(source).toContain("flex h-full flex-col");
    expect(source).toContain("flex-1");
    expect(source).toContain("overflow-y-hidden");
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
});

import { describe, expect, it } from "vitest";
import {
  computeDegrees,
  computeRadiusScale,
  MAX_RADIUS_SCALE,
  MIN_RADIUS_SCALE,
} from "../components/graph/edgeCountIndicator";
import type { GraphEdge, GraphNode } from "../components/graph/GraphCanvas";

function node(id: string, folder: string): Pick<GraphNode, "id" | "folder"> {
  return { id, folder };
}

describe("computeDegrees", () => {
  it("counts edges per node id, string endpoints", () => {
    const edges: GraphEdge[] = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "c" },
    ];
    const degrees = computeDegrees([{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }], edges);
    expect(degrees.get("a")).toBe(2);
    expect(degrees.get("b")).toBe(2);
    expect(degrees.get("c")).toBe(2);
    expect(degrees.get("d")).toBe(0);
  });

  it("counts edges per node id, mutated object endpoints", () => {
    // react-force-graph-2d mutates edge.source/target from string ids to node object refs
    // in place once its layout simulation runs.
    const edges = [
      { source: { id: "a" }, target: { id: "b" } },
    ] as unknown as GraphEdge[];
    const degrees = computeDegrees([{ id: "a" }, { id: "b" }], edges);
    expect(degrees.get("a")).toBe(1);
    expect(degrees.get("b")).toBe(1);
  });
});

describe("computeRadiusScale", () => {
  it("TOR-05-02VIaa3: a node with markedly fewer edges than its cluster peers gets a smaller scale", () => {
    const nodes = [
      node("hub", "concepts"),
      node("mid", "concepts"),
      node("isolated", "concepts"),
    ];
    const edges: GraphEdge[] = [
      { source: "hub", target: "mid" },
      { source: "hub", target: "x1" },
      { source: "hub", target: "x2" },
      { source: "hub", target: "x3" },
    ];
    const scales = computeRadiusScale(nodes, edges);

    expect(scales.get("hub")).toBe(MAX_RADIUS_SCALE);
    expect(scales.get("isolated")).toBe(MIN_RADIUS_SCALE);
    expect(scales.get("mid")!).toBeGreaterThan(scales.get("isolated")!);
    expect(scales.get("mid")!).toBeLessThan(scales.get("hub")!);
  });

  it("scales are computed relative to each node's own folder cluster, not the whole graph", () => {
    const nodes = [
      node("a-hub", "alpha"),
      node("a-leaf", "alpha"),
      node("b-only", "bravo"),
    ];
    const edges: GraphEdge[] = [
      { source: "a-hub", target: "x1" },
      { source: "a-hub", target: "x2" },
    ];
    const scales = computeRadiusScale(nodes, edges);

    // "bravo" cluster has only one node with zero edges — nothing to compare against,
    // so it gets full scale rather than being penalized by the whole-graph max degree.
    expect(scales.get("b-only")).toBe(MAX_RADIUS_SCALE);
    expect(scales.get("a-leaf")).toBe(MIN_RADIUS_SCALE);
  });

  it("gives every node full scale when a cluster has no edges at all", () => {
    const nodes = [node("x", "gamma"), node("y", "gamma")];
    const scales = computeRadiusScale(nodes, []);
    expect(scales.get("x")).toBe(MAX_RADIUS_SCALE);
    expect(scales.get("y")).toBe(MAX_RADIUS_SCALE);
  });
});

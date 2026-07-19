import { describe, expect, it } from "vitest";
import { ALL_FILTER_VALUE, computeFilteredOutNodeIds } from "../components/graph/FilterControls";
import type { GraphNode } from "../components/graph/GraphCanvas";

function node(id: string, status: string, folder: string): GraphNode {
  return { id, title: id, tags: [], status, description: "", sourceLinks: [], folder, path: `${id}.md` };
}

describe("computeFilteredOutNodeIds", () => {
  const nodes: GraphNode[] = [
    node("a", "active", "concepts"),
    node("b", "dormant", "concepts"),
    node("c", "dormant", "sources"),
    node("d", "revisiting", "sources"),
  ];

  it("TOR-05-dfhLAbM: filtering by 'dormant' status leaves only dormant nodes visible/undimmed", () => {
    const filteredOut = computeFilteredOutNodeIds(nodes, "dormant", ALL_FILTER_VALUE);
    expect(filteredOut).toEqual(new Set(["a", "d"]));
  });

  it("TOR-05-UPr1Am6: filtering by the 'sources' folder cluster leaves only that cluster's nodes visible/undimmed", () => {
    const filteredOut = computeFilteredOutNodeIds(nodes, ALL_FILTER_VALUE, "sources");
    expect(filteredOut).toEqual(new Set(["a", "b"]));
  });

  it("combines status and folder filters", () => {
    const filteredOut = computeFilteredOutNodeIds(nodes, "dormant", "sources");
    expect(filteredOut).toEqual(new Set(["a", "b", "d"]));
  });

  it("filters out nothing when both filters are set to 'All'", () => {
    const filteredOut = computeFilteredOutNodeIds(nodes, ALL_FILTER_VALUE, ALL_FILTER_VALUE);
    expect(filteredOut.size).toBe(0);
  });
});

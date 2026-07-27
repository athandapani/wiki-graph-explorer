// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GraphEdge, GraphNode } from "../components/graph/GraphCanvas";
import SwimLaneCanvas from "../components/graph/SwimLaneCanvas";

// These tests render the real board and inspect real DOM, deliberately unlike the source-reading
// tests elsewhere in this suite. Issue #4 finding A1 — search doing nothing on the default view —
// shipped past a green suite precisely because the assertion was that a *string* appeared in the
// source rather than that a pill actually dimmed.

const THRESHOLD = 0.3;

function node(id: string, folder = "concepts"): GraphNode {
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

// Degree 2+ keeps a node on the board by default; the board hides degree 0 and degree 1.
function wellConnected(ids: string[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (const id of ids) {
    edges.push({ source: id, target: `${id}-x1` }, { source: id, target: `${id}-x2` });
  }
  return edges;
}

function pill(title: string): HTMLElement {
  const el = screen.getByText(title).closest("button");
  if (el == null) throw new Error(`no pill button found for "${title}"`);
  return el;
}

const DIM_CLASS = "opacity-30";

afterEach(cleanup);

describe("SwimLaneCanvas search integration", () => {
  it("TOR-03-Z3ApPfB: highlights pills above the relevance threshold and dims those below", () => {
    // Given a swim-lane board whose pages score both above and below the threshold
    const nodes = [node("hit"), node("miss")];
    const edges = wellConnected(["hit", "miss"]);
    const scores = new Map([
      ["hit", 0.9],
      ["miss", 0.05],
    ]);

    // When the board renders with that ranking
    render(
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        isDark
        searchScores={scores}
        relevanceThreshold={THRESHOLD}
      />,
    );

    // Then the above-threshold pill stays highlighted and the below-threshold pill dims
    expect(pill("Title hit").className).not.toContain(DIM_CLASS);
    expect(pill("Title miss").className).toContain(DIM_CLASS);
  });

  it("TOR-03-Z3ApPfB: returns every pill to its unfiltered appearance when the query is cleared", () => {
    const nodes = [node("hit"), node("miss")];
    const edges = wellConnected(["hit", "miss"]);

    // Given a cleared query, the hook derives scores as null
    render(
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        isDark
        searchScores={null}
        relevanceThreshold={THRESHOLD}
      />,
    );

    // Then nothing is dimmed
    expect(pill("Title hit").className).not.toContain(DIM_CLASS);
    expect(pill("Title miss").className).not.toContain(DIM_CLASS);
  });

  it("TOR-03-Z3ApPfB: dims no pill when no search is active at all", () => {
    // Guards the regression directly: before this epic the board received no scores prop, and
    // that must remain indistinguishable from "no query typed" rather than dimming everything.
    const nodes = [node("a"), node("b")];
    render(<SwimLaneCanvas nodes={nodes} edges={wellConnected(["a", "b"])} isDark />);

    expect(pill("Title a").className).not.toContain(DIM_CLASS);
    expect(pill("Title b").className).not.toContain(DIM_CLASS);
  });

  it("reveals a matching node the board hides for low connectivity, marked as a peripheral reveal", () => {
    // Given "lonely" has a single edge, so the board hides it by default
    const nodes = [node("hub"), node("peer"), node("lonely")];
    const edges: GraphEdge[] = [
      ...wellConnected(["hub", "peer"]),
      { source: "hub", target: "lonely" },
    ];

    // Sanity check the precondition: with no query, the hidden node has no pill at all.
    const { unmount } = render(<SwimLaneCanvas nodes={nodes} edges={edges} isDark />);
    expect(screen.queryByText("Title lonely")).toBeNull();
    unmount();

    // When it scores above the threshold
    render(
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        isDark
        searchScores={new Map([["lonely", 0.9], ["hub", 0.05], ["peer", 0.05]])}
        relevanceThreshold={THRESHOLD}
      />,
    );

    // Then it earns a pill, dashed to read as peripheral, and is not dimmed
    const revealed = pill("Title lonely");
    expect(revealed.className).toContain("border-dashed");
    expect(revealed.className).not.toContain(DIM_CLASS);
  });

  it("leaves a non-matching hidden node hidden", () => {
    const nodes = [node("hub"), node("peer"), node("lonely")];
    const edges: GraphEdge[] = [
      ...wellConnected(["hub", "peer"]),
      { source: "hub", target: "lonely" },
    ];

    render(
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        isDark
        searchScores={new Map([["hub", 0.9], ["peer", 0.9], ["lonely", 0.05]])}
        relevanceThreshold={THRESHOLD}
      />,
    );

    expect(screen.queryByText("Title lonely")).toBeNull();
  });
});

describe("SwimLaneCanvas external focus sync", () => {
  it("TOR-04-1iMsnYq: applies the same active-node highlight/connector treatment as a direct click when focusedNodeId is set externally, with no prior click", () => {
    const nodes = [node("hub"), node("peer")];
    const edges = wellConnected(["hub", "peer"]);

    render(<SwimLaneCanvas nodes={nodes} edges={edges} isDark focusedNodeId="hub" />);

    // "hub" gets the active pill's pressed state, same as clicking it directly would.
    expect(pill("Title hub").getAttribute("aria-pressed")).toBe("true");
    // Nodes not connected to "hub" dim; "hub" itself and its direct connections do not.
    expect(pill("Title hub").className).not.toContain(DIM_CLASS);
  });

  it("does not clear the current highlight when focusedNodeId becomes null (panel dismissal)", () => {
    const nodes = [node("hub"), node("peer")];
    const edges = wellConnected(["hub", "peer"]);

    const { rerender } = render(
      <SwimLaneCanvas nodes={nodes} edges={edges} isDark focusedNodeId="hub" />,
    );
    expect(pill("Title hub").getAttribute("aria-pressed")).toBe("true");

    rerender(<SwimLaneCanvas nodes={nodes} edges={edges} isDark focusedNodeId={null} />);

    expect(pill("Title hub").getAttribute("aria-pressed")).toBe("true");
  });

  it("TOR-09-a6cppkl: clears the highlight when forceClearSignal changes, unlike a plain focusedNodeId=null transition", () => {
    const nodes = [node("hub"), node("peer")];
    const edges = wellConnected(["hub", "peer"]);

    const { rerender } = render(
      <SwimLaneCanvas nodes={nodes} edges={edges} isDark focusedNodeId="hub" forceClearSignal={0} />,
    );
    expect(pill("Title hub").getAttribute("aria-pressed")).toBe("true");

    // Esc clears selectedNode (focusedNodeId -> null) and bumps forceClearSignal in the same
    // update, unlike the panel's own Close button which only does the former.
    rerender(
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        isDark
        focusedNodeId={null}
        forceClearSignal={1}
      />,
    );

    expect(pill("Title hub").getAttribute("aria-pressed")).toBe("false");
  });
});

describe("SwimLaneCanvas lane ranking", () => {
  it("TOR-06-KruzYET: an all-zero-degree folder does not occupy a named lane; the next-largest real folder does", () => {
    // "raw" has the most total nodes (6) but none of them have any edges, so every one is
    // zero-degree and permanently hidden from the board. Without the fix, its inflated raw count
    // would win a named slot and bump "delta" (1 node) out to "Other" instead.
    const rawNodes = ["r1", "r2", "r3", "r4", "r5", "r6"].map((id) => node(id, "raw"));
    const alpha = [node("a1", "alpha"), node("a2", "alpha")];
    const bravo = [node("b1", "bravo")];
    const charlie = [node("c1", "charlie")];
    const delta = [node("d1", "delta")];
    const nodes = [...rawNodes, ...alpha, ...bravo, ...charlie, ...delta];
    const edges = wellConnected(["a1", "a2", "b1", "c1", "d1"]);

    render(<SwimLaneCanvas nodes={nodes} edges={edges} isDark />);

    // "raw"'s compact-empty-lane heading form is the bare folder name with no count suffix
    // (SwimLaneCanvas.tsx's isCompactEmptyLane branch) — its absence means it didn't win a slot.
    expect(screen.queryByText("raw")).toBeNull();
    expect(screen.getByText("delta (1)")).toBeTruthy();
    expect(screen.getByText("Other")).toBeTruthy();
  });
});

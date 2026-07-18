// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DualPaneBoard } from "../components/graph/DualPaneBoard";
import type { GraphEdge, GraphNode } from "../components/graph/GraphCanvas";

// GraphCanvas pulls in react-force-graph-2d, which needs real canvas APIs jsdom doesn't provide —
// stubbed out here (the force-directed pane's wiring is covered instead by the source-reading
// tests in tests/dual-pane-board.test.ts) so these tests can exercise real DOM behavior on the
// swim-lane pane, which renders fine in jsdom (see tests/swim-lane-canvas.test.tsx).
vi.mock("../components/graph/GraphCanvas", () => ({
  default: () => null,
}));

function node(id: string, folder = "concepts"): GraphNode {
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

// Degree 2+ keeps a node on the swim-lane board by default.
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

afterEach(cleanup);

describe("DualPaneBoard cross-pane sync", () => {
  it("TOR-11-qzGSh7K: clicking a node in the swim-lane pane reports both the node and its own mode via onNodeClick/onLayoutModeChange", () => {
    const nodes = [node("a"), node("b")];
    const edges = wellConnected(["a", "b"]);
    const onNodeClick = vi.fn();
    const onLayoutModeChange = vi.fn();

    render(
      <DualPaneBoard
        nodes={nodes}
        edges={edges}
        layoutMode="swim-lane"
        onLayoutModeChange={onLayoutModeChange}
        selectedNode={null}
        onNodeClick={onNodeClick}
        isDark={false}
      />,
    );

    fireEvent.click(pill("Title a"));

    expect(onNodeClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
    expect(onLayoutModeChange).toHaveBeenCalledWith("swim-lane");
  });

  it("TOR-11-y75iqea / TOR-11-XOBsafW: the swim-lane pane receives the shared selection regardless of whether it's the primary or secondary pane", () => {
    const nodes = [node("a"), node("b")];
    const edges = wellConnected(["a", "b"]);

    // layoutMode="force-directed" makes swim-lane the *secondary* pane here (TOR-11-XOBsafW's
    // ordering rule) — the point of this test is that focus still reaches it either way, exactly
    // as it would if a force-directed-pane click (untestable here — canvas-based) had set
    // selectedNode.
    render(
      <DualPaneBoard
        nodes={nodes}
        edges={edges}
        layoutMode="force-directed"
        onLayoutModeChange={vi.fn()}
        selectedNode={node("a")}
        onNodeClick={vi.fn()}
        isDark={false}
      />,
    );

    // SwimLaneCanvas gives the focused node's pill aria-pressed="true" (see
    // tests/swim-lane-canvas.test.tsx's externally-set-focusedNodeId case) — its presence here
    // confirms DualPaneBoard forwarded focusedNodeId="a" down to the swim-lane pane even though
    // it's in the secondary slot.
    expect(pill("Title a").getAttribute("aria-pressed")).toBe("true");
  });

  it("TOR-11-edqY3uP: clicking a different swim-lane node reports the newly clicked node, not the previously selected one", () => {
    const nodes = [node("a"), node("b")];
    const edges = wellConnected(["a", "b"]);
    const onNodeClick = vi.fn();

    render(
      <DualPaneBoard
        nodes={nodes}
        edges={edges}
        layoutMode="swim-lane"
        onLayoutModeChange={vi.fn()}
        selectedNode={node("a")}
        onNodeClick={onNodeClick}
        isDark={false}
      />,
    );

    fireEvent.click(pill("Title b"));

    expect(onNodeClick).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
    expect(onNodeClick).not.toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
  });
});

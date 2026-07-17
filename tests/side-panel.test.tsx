// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphEdge, GraphNode } from "../components/graph/GraphCanvas";
import { getFolderColor, resetFolderColors } from "../components/graph/nodeColor";
import { SidePanel } from "../components/graph/SidePanel";

// jsdom normalizes any color assigned to an inline style to "rgb(r, g, b)" form regardless of
// the hex/hsl string it was assigned as, so comparisons against getFolderColor's raw hex/hsl
// output must go through the same normalization.
function normalizedColor(color: string): string {
  const probe = document.createElement("div");
  probe.style.color = color;
  return probe.style.color;
}

// These tests render the real panel and inspect real DOM, deliberately unlike the source-reading
// tests in tests/side-panel.test.ts — grouping order, click wiring, and conditional-render
// omission cannot be verified reliably by reading source text alone.

function node(overrides: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    title: `Title ${overrides.id}`,
    tags: [],
    status: "active",
    description: "",
    folder: "concepts",
    path: `${overrides.id}.md`,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  resetFolderColors();
});

describe("SidePanel folder badge", () => {
  it("TOR-04-iI9aJNn: displays a badge labeled with the node's folder, colored to match the graph", () => {
    resetFolderColors();
    const selected = node({ id: "a", folder: "change-management" });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    const badge = screen.getByText("change-management");
    const expectedColor = getFolderColor("change-management", false);
    expect(badge.style.color).toBe(normalizedColor(expectedColor));
  });
});

describe("SidePanel description", () => {
  it("TOR-04-0igGafN: displays the node's description when non-empty", () => {
    const selected = node({ id: "a", description: "A short summary." });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("A short summary.")).toBeTruthy();
  });

  it("TOR-04-olJvPNV: omits the description area entirely when empty, while the rest of the panel renders normally", () => {
    const selected = node({
      id: "a",
      description: "",
      folder: "concepts",
      tags: ["tag-one"],
    });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    // Remaining detail still renders normally.
    expect(screen.getByText(selected.title)).toBeTruthy();
    expect(screen.getByText("concepts")).toBeTruthy();
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("tag-one")).toBeTruthy();
    expect(screen.getByText("Connected pages")).toBeTruthy();
  });
});

describe("SidePanel connected pages", () => {
  it("TOR-04-xeqtJpo: groups 2 'concepts' chips and 1 'sources' chip under their folder headings", () => {
    const selected = node({ id: "a", folder: "misc" });
    const concept1 = node({ id: "c1", title: "Concept One", folder: "concepts" });
    const concept2 = node({ id: "c2", title: "Concept Two", folder: "concepts" });
    const source1 = node({ id: "s1", title: "Source One", folder: "sources" });
    const edges: GraphEdge[] = [
      { source: "a", target: "c1" },
      { source: "a", target: "c2" },
      { source: "a", target: "s1" },
    ];

    render(
      <SidePanel
        node={selected}
        edges={edges}
        allNodes={[selected, concept1, concept2, source1]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("concepts")).toBeTruthy();
    expect(screen.getByText("sources")).toBeTruthy();
    expect(screen.getByText("Concept One")).toBeTruthy();
    expect(screen.getByText("Concept Two")).toBeTruthy();
    expect(screen.getByText("Source One")).toBeTruthy();
  });

  it("TOR-04-1iMsnYq: clicking a connected-page chip invokes onSelectNode with that exact node", () => {
    const selected = node({ id: "a", folder: "misc" });
    const concept1 = node({ id: "c1", title: "Concept One", folder: "concepts" });
    const edges: GraphEdge[] = [{ source: "a", target: "c1" }];
    const onSelectNode = vi.fn();

    render(
      <SidePanel
        node={selected}
        edges={edges}
        allNodes={[selected, concept1]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={onSelectNode}
      />,
    );

    fireEvent.click(screen.getByText("Concept One"));

    expect(onSelectNode).toHaveBeenCalledWith(concept1);
  });

  it("shows a 'No connected pages.' message when the node has no edges", () => {
    const selected = node({ id: "a" });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("No connected pages.")).toBeTruthy();
  });
});

describe("SidePanel start-anywhere card", () => {
  it("TOR-08-LuQzsEi, TOR-08-xZxrwfj: displays the start-anywhere card with a folder legend spanning every distinct folder, when no node is selected", () => {
    const allNodes = [
      node({ id: "a", folder: "concepts" }),
      node({ id: "b", folder: "sources" }),
      node({ id: "c", folder: "entities" }),
      node({ id: "d", folder: "synthesis" }),
    ];

    render(
      <SidePanel
        node={null}
        edges={[]}
        allNodes={allNodes}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("Start anywhere")).toBeTruthy();
    expect(screen.getByText("concepts")).toBeTruthy();
    expect(screen.getByText("sources")).toBeTruthy();
    expect(screen.getByText("entities")).toBeTruthy();
    expect(screen.getByText("synthesis")).toBeTruthy();
  });

  it("TOR-08-hTq5dSY: displays the status legend on the start-anywhere card", () => {
    render(
      <SidePanel
        node={null}
        edges={[]}
        allNodes={[node({ id: "a" })]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("revisiting")).toBeTruthy();
    expect(screen.getByText("dormant")).toBeTruthy();
  });

  it("TOR-08-zwMqZzr: replaces the start-anywhere card with node detail once a node is selected", () => {
    const selected = node({ id: "a", title: "Selected Page" });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.queryByText("Start anywhere")).toBeNull();
    expect(screen.getByText("Selected Page")).toBeTruthy();
  });

  it("TOR-08-r0Nam2Q: restores the start-anywhere card when the selection is cleared", () => {
    const allNodes = [node({ id: "a" })];
    const { rerender } = render(
      <SidePanel
        node={allNodes[0]}
        edges={[]}
        allNodes={allNodes}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.queryByText("Start anywhere")).toBeNull();

    rerender(
      <SidePanel
        node={null}
        edges={[]}
        allNodes={allNodes}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
      />,
    );

    expect(screen.getByText("Start anywhere")).toBeTruthy();
  });
});

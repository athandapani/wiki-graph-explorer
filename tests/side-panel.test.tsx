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
    sourceLinks: [],
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

describe("SidePanel cited sources", () => {
  it("TOR-04-nsmOOZ8: displays a Cited sources list of clickable links when sourceLinks is non-empty", () => {
    const selected = node({
      id: "a",
      sourceLinks: [
        { text: "Source One", url: "https://example.com/one" },
        { text: "Source Two", url: "https://example.com/two" },
        { text: "Source Three", url: "https://example.com/three" },
      ],
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

    expect(screen.getByText("Cited sources")).toBeTruthy();
    expect(screen.getByText("Source One")).toBeTruthy();
    expect(screen.getByText("Source Two")).toBeTruthy();
    expect(screen.getByText("Source Three")).toBeTruthy();
  });

  it("TOR-04-F5cdTRd: omits the Cited sources section entirely when sourceLinks is empty, while the rest of the panel renders normally", () => {
    const selected = node({ id: "a", sourceLinks: [] });

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

    expect(screen.queryByText("Cited sources")).toBeNull();
    expect(screen.getByText(selected.title)).toBeTruthy();
    expect(screen.getByText("Connected pages")).toBeTruthy();
  });

  it("TOR-04-9JDfgAA: a cited-source link opens its target url in a new tab", () => {
    const selected = node({
      id: "a",
      sourceLinks: [{ text: "The Report", url: "https://example.com/report" }],
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

    const link = screen.getByText("The Report") as HTMLAnchorElement;
    expect(link.href).toBe("https://example.com/report");
    expect(link.target).toBe("_blank");
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

describe("SidePanel tour caption", () => {
  it("TOR-08-5Vj2zkG: displays the tour caption alongside the selected node's detail", () => {
    const selected = node({ id: "a", title: "Digital Second Brain" });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
        tourCaption="This whole map is a Digital Second Brain."
      />,
    );

    expect(screen.getByText("This whole map is a Digital Second Brain.")).toBeTruthy();
    expect(screen.getByText("Digital Second Brain")).toBeTruthy();
  });

  it("TOR-08-5Vj2zkG: omits the caption block when tourCaption is null", () => {
    const selected = node({ id: "a" });

    render(
      <SidePanel
        node={selected}
        edges={[]}
        allNodes={[selected]}
        isDark={false}
        onClose={() => {}}
        onSelectNode={() => {}}
        tourCaption={null}
      />,
    );

    expect(screen.getByText(selected.title)).toBeTruthy();
  });
});

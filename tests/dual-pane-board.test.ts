import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("components/graph/DualPaneBoard.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "DualPaneBoard.tsx"),
    "utf-8",
  );

  it("TOR-11-6XjR1qm: is a client component rendering both GraphCanvas and SwimLaneCanvas simultaneously, at half width each via xl:w-1/2", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain('dynamic(() => import("./GraphCanvas")');
    expect(source).toContain("ssr: false");
    expect(source).toContain("<SwimLaneCanvas");
    const primaryPaneClasses = source.slice(
      source.indexOf('<div className="min-h-0 w-full'),
      source.indexOf(">", source.indexOf('<div className="min-h-0 w-full')),
    );
    expect(primaryPaneClasses).toContain("xl:w-1/2");
    const secondaryPaneClasses = source.slice(
      source.indexOf('<div className="hidden min-h-0'),
      source.indexOf(">", source.indexOf('<div className="hidden min-h-0')),
    );
    expect(secondaryPaneClasses).toContain("xl:w-1/2");
  });

  it("TOR-11-XOBsafW: renders whichever mode is layoutMode as the primary (first) pane, the other mode as secondary", () => {
    expect(source).toContain(
      'const secondaryMode: LayoutMode = layoutMode === "force-directed" ? "swim-lane" : "force-directed";',
    );
    const primaryPaneIndex = source.indexOf("{renderPane(layoutMode)}");
    const secondaryPaneIndex = source.indexOf("{renderPane(secondaryMode)}");
    expect(primaryPaneIndex).toBeGreaterThan(-1);
    expect(secondaryPaneIndex).toBeGreaterThan(-1);
    expect(primaryPaneIndex).toBeLessThan(secondaryPaneIndex);
  });

  it("TOR-11-TFakQZA / TOR-11-Umq6yH6: below the xl breakpoint the secondary pane is hidden and the primary pane takes full width, via pure CSS with no resize listener", () => {
    expect(source).toContain("hidden min-h-0 flex-1 xl:block xl:w-1/2");
    expect(source).toContain("min-h-0 w-full flex-1 xl:w-1/2");
    expect(source).not.toContain("matchMedia");
    expect(source).not.toContain("addEventListener(\"resize\"");
  });

  it("TOR-11-qzGSh7K: wraps each pane's onNodeClick so a click also reports that pane's own mode via onLayoutModeChange", () => {
    expect(source).toMatch(
      /function paneClickHandler\(mode: LayoutMode\) \{\s*return \(node: GraphNode\) => \{\s*onNodeClick\(node\);\s*onLayoutModeChange\(mode\);\s*\};\s*\}/,
    );
    expect(source).toContain('paneClickHandler("force-directed")');
    expect(source).toContain('paneClickHandler("swim-lane")');
  });

  it("TOR-11-y75iqea / TOR-11-edqY3uP: passes the same shared selectedNode as focusedNodeId to both panes", () => {
    const focusedNodeIdOccurrences = source.match(/focusedNodeId=\{selectedNode\?\.id \?\? null\}/g) ?? [];
    expect(focusedNodeIdOccurrences).toHaveLength(2);
  });

  it("renders EmptyState instead of GraphCanvas when there are zero nodes, matching app/graph/page.tsx's existing single-pane behavior", () => {
    expect(source).toContain("if (nodes.length === 0) return <EmptyState />;");
  });

  it("forwards onResetViewReady to the force-directed pane so the shared reset-view control keeps working in 2-pane mode", () => {
    const graphCanvasProps = source.slice(
      source.indexOf("<GraphCanvas"),
      source.indexOf("/>", source.indexOf("<GraphCanvas")),
    );
    expect(graphCanvasProps).toContain("onResetViewReady={onResetViewReady}");
  });
});

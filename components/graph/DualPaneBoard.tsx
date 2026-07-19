"use client";

import dynamic from "next/dynamic";
import { EmptyState } from "./EmptyState";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import type { LayoutMode } from "./LayoutModeToggle";
import SwimLaneCanvas from "./SwimLaneCanvas";

// Same ssr:false rationale as app/graph/page.tsx: react-force-graph-2d touches canvas/window at
// module scope.
const GraphCanvas = dynamic(() => import("./GraphCanvas"), { ssr: false });

interface DualPaneBoardProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  // Fixed pane order: swim-lane always left, force-directed always right (TOR-11-XOBsafW,
  // amended — see docs/requirements/11-dual-pane-layout.feature.md). `layoutMode` no longer
  // decides pane position; it's used only below the wide-screen breakpoint, where exactly one
  // pane shows (whichever `layoutMode` currently is), and by paneClickHandler to track the
  // last-interacted pane for TOR-11-qzGSh7K's return-to-1-pane behavior.
  layoutMode: LayoutMode;
  // Called with a pane's own mode whenever a node is clicked in that pane, so `layoutMode`
  // tracks "last interacted pane" — this is what lets returning to 1-pane show the right board
  // (TOR-11-qzGSh7K) without a separate piece of state.
  onLayoutModeChange: (mode: LayoutMode) => void;
  selectedNode: GraphNode | null;
  onNodeClick: (node: GraphNode) => void;
  isDark: boolean;
  searchScores?: Map<string, number> | null;
  relevanceThreshold?: number;
  filteredOutNodeIds?: Set<string> | null;
  radiusScaleByNodeId?: Map<string, number> | null;
  onResetViewReady?: (resetView: () => void) => void;
}

// Renders both layout modes simultaneously (TOR-11-6XjR1qm), swim-lane fixed on the left and
// force-directed fixed on the right (TOR-11-XOBsafW, amended). Below the wide-screen breakpoint
// (`xl`, 1280px) only the pane matching the current `layoutMode` is shown, at full width, via pure
// CSS — same pattern as the existing 390px responsive floor (SidePanel.tsx's `md:` classes) and
// the layoutMode display:none/block toggle in app/graph/page.tsx: no resize listener needed, and
// the board observably renders as 1-pane below the breakpoint regardless of the paneCount state
// that caused this component to mount (TOR-11-TFakQZA, TOR-11-Umq6yH6).
export function DualPaneBoard({
  nodes,
  edges,
  layoutMode,
  onLayoutModeChange,
  selectedNode,
  onNodeClick,
  isDark,
  searchScores,
  relevanceThreshold,
  filteredOutNodeIds,
  radiusScaleByNodeId,
  onResetViewReady,
}: DualPaneBoardProps) {
  function paneClickHandler(mode: LayoutMode) {
    return (node: GraphNode) => {
      onNodeClick(node);
      onLayoutModeChange(mode);
    };
  }

  function renderPane(mode: LayoutMode) {
    if (mode === "force-directed") {
      if (nodes.length === 0) return <EmptyState />;
      return (
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodeClick={paneClickHandler("force-directed")}
          searchScores={searchScores}
          relevanceThreshold={relevanceThreshold}
          isDark={isDark}
          filteredOutNodeIds={filteredOutNodeIds}
          radiusScaleByNodeId={radiusScaleByNodeId}
          focusedNodeId={selectedNode?.id ?? null}
          onResetViewReady={onResetViewReady}
        />
      );
    }
    return (
      <SwimLaneCanvas
        nodes={nodes}
        edges={edges}
        onNodeClick={paneClickHandler("swim-lane")}
        isDark={isDark}
        searchScores={searchScores}
        relevanceThreshold={relevanceThreshold}
        focusedNodeId={selectedNode?.id ?? null}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className={`min-h-0 flex-1 xl:block xl:w-1/2 ${layoutMode === "swim-lane" ? "block w-full" : "hidden"}`}
      >
        {renderPane("swim-lane")}
      </div>
      <div
        className={`min-h-0 flex-1 xl:block xl:w-1/2 ${layoutMode === "force-directed" ? "block w-full" : "hidden"}`}
      >
        {renderPane("force-directed")}
      </div>
    </div>
  );
}

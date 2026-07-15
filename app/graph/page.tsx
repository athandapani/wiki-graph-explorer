"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/graph/EmptyState";
import { ErrorState } from "@/components/graph/ErrorState";
import { ExplainerSection } from "@/components/graph/ExplainerSection";
import { ALL_FILTER_VALUE, computeFilteredOutNodeIds, FilterControls } from "@/components/graph/FilterControls";
import { Footer } from "@/components/graph/Footer";
import type { GraphEdge, GraphNode } from "@/components/graph/GraphCanvas";
import { computeRadiusScale } from "@/components/graph/edgeCountIndicator";
import { Header } from "@/components/graph/Header";
import { type LayoutMode } from "@/components/graph/LayoutModeToggle";
import { OptionsPanel } from "@/components/graph/OptionsPanel";
import { SearchInput } from "@/components/graph/SearchInput";
import { SidePanel } from "@/components/graph/SidePanel";
import SwimLaneCanvas from "@/components/graph/SwimLaneCanvas";
import { RELEVANCE_THRESHOLD, useSearchRanking } from "@/components/graph/useSearchRanking";
import type { VectorIndexEntry } from "@/lib/embeddings";

// react-force-graph-2d touches canvas/window at module scope, which breaks Next's build-time
// prerender pass even inside a "use client" file — ssr: false keeps it out of that pass.
const GraphCanvas = dynamic(() => import("@/components/graph/GraphCanvas"), { ssr: false });

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [vectorIndex, setVectorIndex] = useState<VectorIndexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("swim-lane");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
  const [folderFilter, setFolderFilter] = useState(ALL_FILTER_VALUE);
  const [isDark, setIsDark] = useState(() =>
    typeof document === "undefined" ? true : document.documentElement.classList.contains("dark"),
  );
  const { query, setQuery, scores, isSearchActive, hasResults } = useSearchRanking(
    vectorIndex ?? [],
  );

  function handleThemeChange(nextIsDark: boolean): void {
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // localStorage unavailable (private browsing, etc.) — theme still applies for this session
    }
  }

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [graphResponse, vectorResponse] = await Promise.all([
          fetch("/graph-data.json"),
          fetch("/vector-index.json"),
        ]);
        if (!graphResponse.ok || !vectorResponse.ok) {
          throw new Error("Failed to load graph data.");
        }
        const graph = (await graphResponse.json()) as GraphData;
        const vectors = (await vectorResponse.json()) as VectorIndexEntry[];
        setGraphData(graph);
        setVectorIndex(vectors);
      } catch {
        setError("Failed to load graph data.");
      }
    }
    void load();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex h-full shrink-0 flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {error ? (
              <ErrorState />
            ) : !graphData ? (
              <p className="p-4">Loading graph…</p>
            ) : (
              <>
                <div className="flex justify-end px-4 pt-3">
                  <OptionsPanel
                    layoutMode={layoutMode}
                    onLayoutModeChange={setLayoutMode}
                    isDark={isDark}
                    onThemeChange={handleThemeChange}
                  />
                </div>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  isActive={isSearchActive}
                  hasResults={hasResults}
                />
                {layoutMode === "force-directed" && (
                  <FilterControls
                    nodes={graphData.nodes}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    folderFilter={folderFilter}
                    onFolderFilterChange={setFolderFilter}
                  />
                )}
                <div
                  className="min-h-0 flex-1"
                  style={{ display: layoutMode === "force-directed" ? "block" : "none" }}
                >
                  {graphData.nodes.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <GraphCanvas
                      nodes={graphData.nodes}
                      edges={graphData.edges}
                      onNodeClick={setSelectedNode}
                      searchScores={scores}
                      relevanceThreshold={RELEVANCE_THRESHOLD}
                      isDark={isDark}
                      filteredOutNodeIds={computeFilteredOutNodeIds(
                        graphData.nodes,
                        statusFilter,
                        folderFilter,
                      )}
                      radiusScaleByNodeId={computeRadiusScale(graphData.nodes, graphData.edges)}
                    />
                  )}
                </div>
                <div
                  className="min-h-0 flex-1"
                  style={{ display: layoutMode === "swim-lane" ? "block" : "none" }}
                >
                  <SwimLaneCanvas
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    onNodeClick={setSelectedNode}
                    isDark={isDark}
                  />
                </div>
              </>
            )}
          </div>
          <SidePanel
            node={selectedNode}
            edges={graphData?.edges ?? []}
            allNodes={graphData?.nodes ?? []}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
      <ExplainerSection />
      <Footer />
    </div>
  );
}

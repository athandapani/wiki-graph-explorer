"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/graph/EmptyState";
import { ErrorState } from "@/components/graph/ErrorState";
import { Footer } from "@/components/graph/Footer";
import type { GraphEdge, GraphNode } from "@/components/graph/GraphCanvas";
import { SearchInput } from "@/components/graph/SearchInput";
import { SidePanel } from "@/components/graph/SidePanel";
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
  const { query, setQuery, scores, isSearchActive, hasResults } = useSearchRanking(
    vectorIndex ?? [],
  );

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
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        {error ? (
          <ErrorState />
        ) : !graphData ? (
          <p>Loading graph…</p>
        ) : graphData.nodes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              isActive={isSearchActive}
              hasResults={hasResults}
            />
            <GraphCanvas
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={setSelectedNode}
              searchScores={scores}
              relevanceThreshold={RELEVANCE_THRESHOLD}
            />
          </>
        )}
      </div>
      <SidePanel
        node={selectedNode}
        edges={graphData?.edges ?? []}
        allNodes={graphData?.nodes ?? []}
        onClose={() => setSelectedNode(null)}
      />
      <Footer />
    </div>
  );
}

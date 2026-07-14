"use client";

import { useEffect, useState } from "react";

interface GraphData {
  nodes: unknown[];
  edges: unknown[];
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [vectorIndexCount, setVectorIndexCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        const vectorIndex = (await vectorResponse.json()) as unknown[];
        setGraphData(graph);
        setVectorIndexCount(vectorIndex.length);
      } catch {
        setError("Failed to load graph data.");
      }
    }
    void load();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!graphData) {
    return <p>Loading graph…</p>;
  }

  return (
    <p>
      Loaded {graphData.nodes.length} nodes, {graphData.edges.length} edges (
      {vectorIndexCount} embeddings). Full graph rendering coming soon.
    </p>
  );
}

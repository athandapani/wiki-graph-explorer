"use client";

import { useEffect, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { getFolderColor } from "./nodeColor";

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  status: string;
  folder: string;
  path: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  searchScores?: Map<string, number> | null;
  relevanceThreshold?: number;
  isDark?: boolean;
  filteredOutNodeIds?: Set<string> | null;
  radiusScaleByNodeId?: Map<string, number> | null;
}

const NODE_RADIUS = 5;
const LABEL_FONT_SIZE = 3.4;
const LABEL_GAP = 1.5;
const CLICK_ZOOM_LEVEL = 6;
const CLICK_ZOOM_DURATION_MS = 900;
const INITIAL_FIT_DURATION_MS = 400;
const DIMMED_OPACITY = 0.15;
// Pulls the layout tighter than react-force-graph-2d's defaults (charge -30, link
// distance ~30), which otherwise scatter a sparse real-world vault graph across mostly
// empty canvas.
const CHARGE_STRENGTH = -6;
const LINK_DISTANCE = 16;

interface StrengthForce {
  strength: (value: number) => void;
}

interface DistanceForce {
  distance: (value: number) => void;
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  searchScores,
  relevanceThreshold = 0,
  isDark = false,
  filteredOutNodeIds,
  radiusScaleByNodeId,
}: GraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge> | undefined>(undefined);

  useEffect(() => {
    (graphRef.current?.d3Force("charge") as StrengthForce | undefined)?.strength(
      CHARGE_STRENGTH,
    );
    (graphRef.current?.d3Force("link") as DistanceForce | undefined)?.distance(LINK_DISTANCE);
  }, []);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={{ nodes, links: edges }}
      nodeLabel={(node: NodeObject<GraphNode>) => `${node.title} · ${node.status}`}
      nodeCanvasObject={(node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;

        const searchDimmed =
          searchScores != null && (searchScores.get(node.id) ?? 0) < relevanceThreshold;
        const filterDimmed = filteredOutNodeIds?.has(node.id) ?? false;
        const dimmed = searchDimmed || filterDimmed;
        ctx.globalAlpha = dimmed ? DIMMED_OPACITY : 1;

        const radius = NODE_RADIUS * (radiusScaleByNodeId?.get(node.id) ?? 1);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = getFolderColor(node.folder, isDark);
        ctx.fill();

        ctx.font = `${LABEL_FONT_SIZE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDark ? "#ededed" : "#171717";
        ctx.fillText(node.title, x, y + radius + LABEL_GAP);

        ctx.globalAlpha = 1;
      }}
      nodePointerAreaPaint={(node: NodeObject<GraphNode>, color: string, ctx: CanvasRenderingContext2D) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const radius = NODE_RADIUS * (radiusScaleByNodeId?.get(node.id) ?? 1);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }}
      onNodeClick={(node: NodeObject<GraphNode>) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        graphRef.current?.centerAt(x, y, CLICK_ZOOM_DURATION_MS);
        graphRef.current?.zoom(CLICK_ZOOM_LEVEL, CLICK_ZOOM_DURATION_MS);
        onNodeClick?.(node);
      }}
      onEngineStop={() => {
        graphRef.current?.zoomToFit(INITIAL_FIT_DURATION_MS);
      }}
    />
  );
}

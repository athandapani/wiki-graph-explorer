"use client";

import { useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { getFolderColor } from "./nodeColor";
import { statusColor } from "./StatusDot";

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
}

const NODE_RADIUS = 5;
const STATUS_DOT_RADIUS = 2;
const CLICK_ZOOM_LEVEL = 6;
const CLICK_ZOOM_DURATION_MS = 900;
const INITIAL_FIT_DURATION_MS = 400;
const DIMMED_OPACITY = 0.15;

export default function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  searchScores,
  relevanceThreshold = 0,
}: GraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge> | undefined>(undefined);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={{ nodes, links: edges }}
      nodeLabel={(node: NodeObject<GraphNode>) => `${node.title} · ${node.status}`}
      nodeCanvasObject={(node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;

        const dimmed = searchScores != null && (searchScores.get(node.id) ?? 0) < relevanceThreshold;
        ctx.globalAlpha = dimmed ? DIMMED_OPACITY : 1;

        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = getFolderColor(node.folder);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + NODE_RADIUS * 0.7, y - NODE_RADIUS * 0.7, STATUS_DOT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = statusColor(node.status);
        ctx.fill();

        ctx.globalAlpha = 1;
      }}
      nodePointerAreaPaint={(node: NodeObject<GraphNode>, color: string, ctx: CanvasRenderingContext2D) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
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

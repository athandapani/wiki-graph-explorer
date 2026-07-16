"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { getFolderColor } from "./nodeColor";
import { computeSearchDimmedNodeIds } from "./useSearchRanking";

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  status: string;
  description: string;
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
  focusedNodeId?: string | null;
  // Hands the parent a stable reference to this canvas's fit-to-view function, so an
  // external control (OptionsPanel's "Reset view" button, or a layoutMode-change effect
  // in app/graph/page.tsx) can trigger the same framing this component uses internally —
  // a callback-prop handoff rather than useImperativeHandle/forwardRef, since no other
  // component in this codebase forwards a ref across the next/dynamic boundary.
  onResetViewReady?: (resetView: () => void) => void;
}

// react-force-graph-2d/d3-force mutate each node object in place to add its simulated
// x/y position — the same mutation pattern documented for edge endpoints in SidePanel.
type PositionedNode = GraphNode & { x?: number; y?: number };

// Mirrors SidePanel's EdgeEndpoint/endpointId (design-notes.md §16): react-force-graph-2d
// mutates edge.source/edge.target from string ids to node-object references once its d3-force
// simulation runs, so any code reading edges must handle both shapes. Duplicated locally
// (rather than imported from SidePanel) to avoid a circular import between the two modules.
type EdgeEndpoint = string | { id: string };

function endpointId(endpoint: EdgeEndpoint): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function getRelatedIds(nodeId: string, edges: GraphEdge[]): string[] {
  const related: string[] = [];
  for (const edge of edges) {
    const sourceId = endpointId(edge.source as unknown as EdgeEndpoint);
    const targetId = endpointId(edge.target as unknown as EdgeEndpoint);
    if (sourceId === nodeId) {
      related.push(targetId);
    } else if (targetId === nodeId) {
      related.push(sourceId);
    }
  }
  return related;
}

const NODE_RADIUS = 2.5;
// Constant on-screen pixel size (not world-space units) so a label is legible whenever it's
// shown, regardless of what zoom level the current fit happens to land on — a real vault
// with far-flung disconnected nodes can force a fit zoom well under 1, where a world-space
// font would rasterize at a couple of illegible pixels.
const LABEL_SCREEN_SIZE_PX = 11;
const LABEL_SCREEN_GAP_PX = 6;
const CLICK_ZOOM_LEVEL = 6;
const CLICK_ZOOM_DURATION_MS = 900;
const INITIAL_FIT_DURATION_MS = 400;
const DIMMED_OPACITY = 0.15;
// Pulls the layout tighter than react-force-graph-2d's defaults (charge -30, link
// distance ~30), which otherwise scatter a sparse real-world vault graph across mostly
// empty canvas.
const CHARGE_STRENGTH = -6;
const LINK_DISTANCE = 16;
// Padding (px) around the fitted bounds so nodes aren't flush against the canvas edge.
const ZOOM_FIT_PADDING_PX = 60;
// Mount-time fallback fit, decoupled from onEngineStop: the force-directed container can be
// display:none at mount (default layoutMode is swim-lane), so a fit computed against a
// zero-dimension canvas produces the "tiny clump in the corner" bug. app/graph/page.tsx's
// layoutMode-change effect is the primary fix (fits once the canvas is actually visible);
// this timeout is defense-in-depth for the case force-directed is already the visible mode.
const FIT_FALLBACK_DELAY_MS = 100;
// The weak CHARGE_STRENGTH above means node positions keep expanding for several seconds
// after the simulation starts — a single zoomToFit call taken too early freezes the camera on
// a still-expanding layout, so nodes drift outside the frozen viewport as physics continues
// (a different bug than the corner-clump one: nodes clipped off-screen instead of clumped).
// fitView "chases" the settling layout by re-fitting on an interval for a few seconds after
// each trigger, converging on the correct bounds regardless of exact settle timing.
const FIT_CHASE_INTERVAL_MS = 300;
// Live-verified against the real second-brain vault (47 nodes/96 edges): the simulation keeps
// visibly redistributing node positions for 10+ seconds under CHARGE_STRENGTH's weak repulsion,
// so a shorter chase window converges on a partial, still-expanding layout and clips nodes that
// settle into place afterward.
const FIT_CHASE_DURATION_MS = 9000;
const SELECTION_RING_OFFSET = 2;
const SELECTION_RING_WIDTH = 1.5;
// Shared accent for "this is the focused/emphasized thing" — matches the existing blue
// accent used by Logo.tsx and the home page's CTA button.
const EMPHASIZED_COLOR = "#3b82f6";
const LINK_COLOR_NORMAL_DARK = "rgba(237, 237, 237, 0.25)";
const LINK_COLOR_NORMAL_LIGHT = "rgba(23, 23, 23, 0.25)";
const LINK_COLOR_DIMMED_DARK = "rgba(237, 237, 237, 0.06)";
const LINK_COLOR_DIMMED_LIGHT = "rgba(23, 23, 23, 0.06)";

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
  focusedNodeId,
  onResetViewReady,
}: GraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge> | undefined>(undefined);

  const searchDimmedNodeIds = useMemo(
    () => computeSearchDimmedNodeIds(nodes, searchScores ?? null, relevanceThreshold),
    [nodes, searchScores, relevanceThreshold],
  );

  // Nodes directly connected to the current selection — used to emphasize their edges/nodes
  // while dimming everything else unrelated to the selection (TOR-02-D3bxP8j).
  const connectedIds = useMemo(
    () => new Set(focusedNodeId ? getRelatedIds(focusedNodeId, edges) : []),
    [focusedNodeId, edges],
  );

  const chaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Reset every frame via onRenderFramePre; accumulates each drawn label's bounding box so a
  // later node in this same frame can skip its own label if it would overlap one already
  // drawn. This is the sole mechanism gating label visibility (no separate zoom threshold):
  // it naturally hides labels when nodes are packed too closely on-screen to read — whether
  // that's the pre-fit chaos before layout settles, a tightly-linked sub-cluster still
  // cramped at whatever zoom a real vault's fit lands on, or a visitor deliberately zooming
  // out — and lets them reappear as soon as zooming in gives them room, all driven by actual
  // on-screen crowding rather than a fragile snapshot of "the zoom a fit settled at" (which a
  // still-expanding physics simulation or a re-triggered chase can invalidate moments later).
  const drawnLabelRectsRef = useRef<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  // Re-fits repeatedly for FIT_CHASE_DURATION_MS after being triggered, rather than a single
  // snapshot-in-time zoomToFit call — see FIT_CHASE_INTERVAL_MS above for why. A new trigger
  // (e.g. a second onEngineStop, or the reset-view button) restarts the chase window instead of
  // stacking a second concurrent interval.
  const fitView = useCallback(() => {
    if (chaseIntervalRef.current != null) {
      clearInterval(chaseIntervalRef.current);
    }
    const runFit = () => {
      graphRef.current?.zoomToFit(INITIAL_FIT_DURATION_MS, ZOOM_FIT_PADDING_PX);
    };
    runFit();
    const start = Date.now();
    chaseIntervalRef.current = setInterval(() => {
      if (Date.now() - start >= FIT_CHASE_DURATION_MS) {
        if (chaseIntervalRef.current != null) clearInterval(chaseIntervalRef.current);
        chaseIntervalRef.current = null;
        return;
      }
      runFit();
    }, FIT_CHASE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (chaseIntervalRef.current != null) clearInterval(chaseIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    (graphRef.current?.d3Force("charge") as StrengthForce | undefined)?.strength(
      CHARGE_STRENGTH,
    );
    (graphRef.current?.d3Force("link") as DistanceForce | undefined)?.distance(LINK_DISTANCE);
  }, []);

  // Fallback fit independent of onEngineStop — see FIT_FALLBACK_DELAY_MS above for why.
  useEffect(() => {
    const timeoutId = setTimeout(fitView, FIT_FALLBACK_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [fitView]);

  // Hands the fit function to the parent so an external control (reset-view button,
  // layoutMode-change effect) can trigger the same framing.
  useEffect(() => {
    onResetViewReady?.(fitView);
  }, [fitView, onResetViewReady]);

  // Lets an externally driven selection (e.g. a chip clicked in SidePanel) trigger the same
  // center/zoom treatment a direct canvas click already triggers via onNodeClick below.
  useEffect(() => {
    if (!focusedNodeId) return;
    const target = nodes.find((candidate) => candidate.id === focusedNodeId) as
      | PositionedNode
      | undefined;
    if (!target) return;
    graphRef.current?.centerAt(target.x ?? 0, target.y ?? 0, CLICK_ZOOM_DURATION_MS);
    graphRef.current?.zoom(CLICK_ZOOM_LEVEL, CLICK_ZOOM_DURATION_MS);
  }, [focusedNodeId, nodes]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={{ nodes, links: edges }}
      onRenderFramePre={() => {
        drawnLabelRectsRef.current = [];
      }}
      nodeLabel={(node: NodeObject<GraphNode>) => `${node.title} · ${node.status}`}
      linkColor={(link: GraphEdge) => {
        if (!focusedNodeId) {
          return isDark ? LINK_COLOR_NORMAL_DARK : LINK_COLOR_NORMAL_LIGHT;
        }
        const sourceId = endpointId(link.source as unknown as EdgeEndpoint);
        const targetId = endpointId(link.target as unknown as EdgeEndpoint);
        const connected = sourceId === focusedNodeId || targetId === focusedNodeId;
        if (connected) return EMPHASIZED_COLOR;
        return isDark ? LINK_COLOR_DIMMED_DARK : LINK_COLOR_DIMMED_LIGHT;
      }}
      nodeCanvasObject={(node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;

        const searchDimmed = searchDimmedNodeIds.has(node.id);
        const filterDimmed = filteredOutNodeIds?.has(node.id) ?? false;
        const selectionDimmed =
          focusedNodeId != null && node.id !== focusedNodeId && !connectedIds.has(node.id);
        const dimmed = searchDimmed || filterDimmed || selectionDimmed;
        ctx.globalAlpha = dimmed ? DIMMED_OPACITY : 1;

        const radius = NODE_RADIUS * (radiusScaleByNodeId?.get(node.id) ?? 1);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = getFolderColor(node.folder, isDark);
        ctx.fill();

        if (node.id === focusedNodeId) {
          ctx.beginPath();
          ctx.arc(x, y, radius + SELECTION_RING_OFFSET, 0, 2 * Math.PI);
          ctx.strokeStyle = EMPHASIZED_COLOR;
          ctx.lineWidth = SELECTION_RING_WIDTH;
          ctx.stroke();
        }

        {
          // Sized/offset in screen pixels rather than world units, so the label is a constant,
          // legible size regardless of the current zoom level.
          const fontSize = LABEL_SCREEN_SIZE_PX / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          const textWidth = ctx.measureText(node.title).width;
          const labelTop = y + radius + LABEL_SCREEN_GAP_PX / globalScale;
          const rect = {
            x1: x - textWidth / 2,
            y1: labelTop,
            x2: x + textWidth / 2,
            y2: labelTop + fontSize,
          };
          // Skip a label that would overlap one already drawn this frame, rather than let them
          // stack into unreadable text — this is the sole gate on label visibility (see
          // drawnLabelRectsRef above for why there's no separate zoom threshold).
          const overlapsDrawnLabel = drawnLabelRectsRef.current.some(
            (drawn) => rect.x1 < drawn.x2 && rect.x2 > drawn.x1 && rect.y1 < drawn.y2 && rect.y2 > drawn.y1,
          );
          if (!overlapsDrawnLabel) {
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = isDark ? "#ededed" : "#171717";
            ctx.fillText(node.title, x, labelTop);
            drawnLabelRectsRef.current.push(rect);
          }
        }

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
      onEngineStop={fitView}
    />
  );
}

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  buildConnectorPath,
  CONNECTOR_ANIMATION_DURATION_MS,
  pickConnectorEdges,
  type ConnectorAnchorEdge,
} from "@/lib/connector-line-animation";
import { assignLanes } from "@/lib/lane-assignment";
import { EmptyState } from "./EmptyState";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import { getFolderColor } from "./nodeColor";
import { PillNode } from "./PillNode";
import { getRelatedNodeIds } from "./SidePanel";
import { computeSearchDimmedNodeIds } from "./useSearchRanking";

interface SwimLaneCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDark: boolean;
  onNodeClick?: (node: GraphNode) => void;
  searchScores?: Map<string, number> | null;
  relevanceThreshold?: number;
}

interface ConnectorPathData {
  targetId: string;
  d: string;
  color: string;
  isRevealed: boolean;
}

// Nodes with this many connections or fewer are hidden from the board by default so a
// large, sparsely-connected vault still fits on one screen with no scrollbars. Zero-degree
// nodes are hidden permanently (nothing ever links to them, so they can never be revealed);
// low-but-nonzero-degree nodes are still reachable — clicking a node that links to one pulls
// it into its lane on demand, connected with a dotted line to mark it as a peripheral reveal
// rather than an always-visible node.
const LOW_DEGREE_THRESHOLD = 1;

// Every lane gets this much height guaranteed (heading + one row of pills) before the
// remaining space is distributed proportionally by node count — otherwise a lane with
// only a few nodes gets starved down to a sliver by lanes with many more.
const MIN_LANE_HEIGHT_PX = 52;

function ConnectorPath({
  d,
  color,
  isRevealed,
}: {
  d: string;
  color: string;
  isRevealed: boolean;
}) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (isRevealed) {
    return <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3 3" />;
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={drawn ? 0 : 1}
      style={{ transition: `stroke-dashoffset ${CONNECTOR_ANIMATION_DURATION_MS}ms ease-out` }}
    />
  );
}

function anchorPoint(rect: DOMRect, edge: ConnectorAnchorEdge, boardRect: DOMRect) {
  return {
    x: rect.left + rect.width / 2 - boardRect.left,
    y: (edge === "top" ? rect.top : rect.bottom) - boardRect.top,
  };
}

export default function SwimLaneCanvas({
  nodes,
  edges,
  isDark,
  onNodeClick,
  searchScores,
  relevanceThreshold = 0,
}: SwimLaneCanvasProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [connectorPaths, setConnectorPaths] = useState<ConnectorPathData[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const nodesById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const degreeById = useMemo(() => {
    const degrees = new Map<string, number>();
    for (const node of nodes) {
      degrees.set(node.id, getRelatedNodeIds(node.id, edges).length);
    }
    return degrees;
  }, [nodes, edges]);

  const { baseNodes, revealableIds } = useMemo(() => {
    const revealable = new Set<string>();
    const base: GraphNode[] = [];
    for (const node of nodes) {
      const degree = degreeById.get(node.id) ?? 0;
      if (degree === 0) continue;
      if (degree <= LOW_DEGREE_THRESHOLD) {
        revealable.add(node.id);
      } else {
        base.push(node);
      }
    }
    // Don't hide everything if the whole graph is sparsely connected — a blank board is
    // worse than one that needs a bit more room.
    if (base.length === 0) {
      return { baseNodes: nodes, revealableIds: new Set<string>() };
    }
    return { baseNodes: base, revealableIds: revealable };
  }, [nodes, degreeById]);

  const revealedNodes = useMemo(() => {
    if (activeNodeId == null) return [];
    return getRelatedNodeIds(activeNodeId, edges)
      .filter((id) => revealableIds.has(id))
      .map((id) => nodesById.get(id))
      .filter((candidate): candidate is GraphNode => candidate !== undefined);
  }, [activeNodeId, edges, revealableIds, nodesById]);

  const searchDimmedIds = useMemo(
    () => computeSearchDimmedNodeIds(nodes, searchScores ?? null, relevanceThreshold),
    [nodes, searchScores, relevanceThreshold],
  );

  // A query can match a page that has no pill — the board hides zero-degree nodes outright and
  // degree-1 nodes until something links to them. Leaving those matches invisible would put the
  // result count at odds with the board and repeat the silent-omission problem the "+N more"
  // work exists to fix, so a match earns its way onto the board regardless of degree. Rendered
  // dashed, like click-reveals, to read as peripheral rather than as a normal board node.
  const searchRevealedNodes = useMemo(() => {
    if (searchScores == null) return [];
    const onBoard = new Set(baseNodes.map((node) => node.id));
    return nodes.filter((node) => !onBoard.has(node.id) && !searchDimmedIds.has(node.id));
  }, [nodes, baseNodes, searchScores, searchDimmedIds]);

  const searchRevealedIds = useMemo(
    () => new Set(searchRevealedNodes.map((node) => node.id)),
    [searchRevealedNodes],
  );

  // Nodes that stay fully visible (not dimmed) when a node is active: the active node itself
  // plus everything it's directly connected to. Everything else in the board dims out so the
  // active node's connections stand out.
  const highlightedIds = useMemo(() => {
    if (activeNodeId == null) return null;
    return new Set([activeNodeId, ...getRelatedNodeIds(activeNodeId, edges)]);
  }, [activeNodeId, edges]);

  // Deduped: a node can be both click-revealed and search-revealed at once, and assignLanes
  // would otherwise place it in its lane twice.
  const laneNodes = useMemo(() => {
    const seen = new Set<string>();
    const combined: GraphNode[] = [];
    for (const node of [...baseNodes, ...revealedNodes, ...searchRevealedNodes]) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      combined.push(node);
    }
    return combined;
  }, [baseNodes, revealedNodes, searchRevealedNodes]);
  const lanes = useMemo(() => assignLanes(laneNodes), [laneNodes]);

  useLayoutEffect(() => {
    if (activeNodeId == null || boardRef.current == null) {
      setConnectorPaths([]);
      return;
    }

    const sourceEl = pillRefs.current.get(activeNodeId);
    if (sourceEl == null) {
      setConnectorPaths([]);
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;

    const paths: ConnectorPathData[] = [];
    for (const targetId of getRelatedNodeIds(activeNodeId, edges)) {
      const targetEl = pillRefs.current.get(targetId);
      const targetNode = nodesById.get(targetId);
      if (targetEl == null || targetNode == null) continue;

      const targetRect = targetEl.getBoundingClientRect();
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const { sourceEdge, targetEdge } = pickConnectorEdges(sourceCenterY, targetCenterY);
      const source = anchorPoint(sourceRect, sourceEdge, boardRect);
      const target = anchorPoint(targetRect, targetEdge, boardRect);

      paths.push({
        targetId,
        d: buildConnectorPath(source.x, source.y, target.x, target.y),
        color: getFolderColor(targetNode.folder, isDark),
        isRevealed: revealableIds.has(targetId),
      });
    }

    setConnectorPaths(paths);
  }, [activeNodeId, edges, nodesById, isDark, revealableIds, laneNodes]);

  if (nodes.length === 0) {
    return <EmptyState />;
  }

  function handlePillClick(node: GraphNode) {
    setActiveNodeId(node.id);
    onNodeClick?.(node);
  }

  return (
    <div ref={boardRef} className="relative flex h-full flex-col overflow-hidden">
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        {activeNodeId != null &&
          connectorPaths.map(({ targetId, d, color, isRevealed }) => (
            <ConnectorPath
              key={`${activeNodeId}-${targetId}`}
              d={d}
              color={color}
              isRevealed={isRevealed}
            />
          ))}
      </svg>
      {lanes.map((lane) => (
        <div
          key={lane.name}
          className="flex min-h-0 flex-col overflow-hidden border-b border-black/10 px-2 py-2 last:border-b-0 dark:border-white/10"
          style={{ flexGrow: lane.nodeIds.length, flexBasis: MIN_LANE_HEIGHT_PX }}
        >
          <h3 className="mb-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {lane.name} ({lane.nodeIds.length})
          </h3>
          <div className="flex flex-1 flex-wrap content-start gap-1 overflow-hidden">
            {lane.nodeIds
              .map((id) => nodesById.get(id))
              .filter((candidate): candidate is GraphNode => candidate !== undefined)
              .map((node) => (
                <PillNode
                  key={node.id}
                  node={node}
                  isActive={node.id === activeNodeId}
                  isDark={isDark}
                  isRevealed={revealableIds.has(node.id) || searchRevealedIds.has(node.id)}
                  isDimmed={
                    (highlightedIds != null && !highlightedIds.has(node.id)) ||
                    searchDimmedIds.has(node.id)
                  }
                  onClick={handlePillClick}
                  pillRef={(el) => {
                    if (el) {
                      pillRefs.current.set(node.id, el);
                    } else {
                      pillRefs.current.delete(node.id);
                    }
                  }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

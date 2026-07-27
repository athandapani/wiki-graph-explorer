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
  focusedNodeId?: string | null;
  // Increment to force-clear the board's highlight even though focusedNodeId's sync below is
  // deliberately null-blind (TOR-09-a6cppkl: Esc must remove connector lines/selection ring/
  // dimming from the board, unlike the SidePanel's own Close button, which intentionally leaves
  // the board's highlight in place per the comment on prevFocusedNodeId below).
  forceClearSignal?: number;
  // Increment when the theme-preset chrome/graph accent changes (epic 4o1EtWX). Connector-line
  // colors are computed via getFolderColor inside a useEffect with a fixed dependency list that
  // doesn't otherwise include anything palette-related, so a preset change alone wouldn't
  // recompute them without this signal — see the connectorPaths effect below.
  paletteVersion?: number;
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

// A lane's pill area is sized to however many rows its own content actually needs (2 rows stays
// 2 rows, 6 needs stays 6), not a proportional share of a shared height budget — the old
// flex-grow-by-node-count split gave small lanes more room than their content used while
// starving large lanes below what theirs needed. MAX_VISIBLE_ROWS is a hard ceiling per lane so
// one very large folder can't push the board past the viewport (TOR-06-0ZRtILL).
const PILL_ROW_HEIGHT_PX = 24;
const MAX_VISIBLE_ROWS = 12;

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
  focusedNodeId,
  forceClearSignal,
  paletteVersion,
}: SwimLaneCanvasProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(focusedNodeId ?? null);
  const [expandedLaneNames, setExpandedLaneNames] = useState<Set<string>>(new Set());

  // Lets an externally driven selection (e.g. a chip clicked in SidePanel) apply the same
  // active-node highlight/connector-line treatment a direct pill click already applies via
  // handlePillClick below. Adjusted during render (React's documented pattern for syncing state
  // from props: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes),
  // not inside a useEffect, so it applies synchronously in the same render rather than causing an
  // extra cascading render. Deliberately one-way and non-null-only: syncing on null (panel
  // dismissal sets this to null) would clear the board's highlight, breaking the existing
  // requirement that the board keeps its current view state when the panel closes.
  const [prevFocusedNodeId, setPrevFocusedNodeId] = useState(focusedNodeId);
  if (focusedNodeId !== prevFocusedNodeId) {
    setPrevFocusedNodeId(focusedNodeId);
    if (focusedNodeId != null) {
      setActiveNodeId(focusedNodeId);
    }
  }

  // TOR-09-a6cppkl: forceClearSignal is the escape hatch for the null-blind sync above — Esc
  // needs the board to actually clear, unlike a plain focusedNodeId=null transition.
  const [prevForceClearSignal, setPrevForceClearSignal] = useState(forceClearSignal);
  if (forceClearSignal !== prevForceClearSignal) {
    setPrevForceClearSignal(forceClearSignal);
    setActiveNodeId(null);
  }
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

  // Tracked separately from the base/revealable split below so the "+N more" affordance can
  // count zero-degree nodes too (TOR-06-BxA7IRn) without touching the literal
  // `if (degree === 0) continue;` line that TOR-06-nQ4vXsD's regression test pins.
  const zeroDegreeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of nodes) {
      if ((degreeById.get(node.id) ?? 0) === 0) {
        ids.add(node.id);
      }
    }
    return ids;
  }, [nodes, degreeById]);

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

  // Still-hidden candidates for the per-lane "+N more" affordance (TOR-06-BxA7IRn): every
  // zero-degree or low-degree node not already shown via the existing click-reveal or
  // search-reveal mechanisms above.
  const hiddenCandidateNodes = useMemo(() => {
    const onBoard = new Set(laneNodes.map((node) => node.id));
    const candidates: GraphNode[] = [];
    for (const id of new Set([...zeroDegreeIds, ...revealableIds])) {
      if (onBoard.has(id)) continue;
      const node = nodesById.get(id);
      if (node !== undefined) candidates.push(node);
    }
    return candidates;
  }, [zeroDegreeIds, revealableIds, laneNodes, nodesById]);

  const lanes = useMemo(
    () => assignLanes(laneNodes, hiddenCandidateNodes),
    [laneNodes, hiddenCandidateNodes],
  );

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
        d: buildConnectorPath(source.x, source.y, target.x, target.y, sourceEdge, targetEdge),
        color: getFolderColor(targetNode.folder, isDark),
        isRevealed: revealableIds.has(targetId),
      });
    }

    setConnectorPaths(paths);
  }, [
    activeNodeId,
    edges,
    nodesById,
    isDark,
    revealableIds,
    laneNodes,
    expandedLaneNames,
    paletteVersion,
  ]);

  if (nodes.length === 0) {
    return <EmptyState />;
  }

  function handlePillClick(node: GraphNode) {
    setActiveNodeId(node.id);
    onNodeClick?.(node);
  }

  function handleExpandLane(laneName: string) {
    setExpandedLaneNames((prev) => new Set(prev).add(laneName));
  }

  return (
    <div ref={boardRef} className="relative flex h-full flex-col gap-1.5 overflow-hidden p-1.5">
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
      {lanes.map((lane) => {
        const isExpanded = expandedLaneNames.has(lane.name);
        const visibleIds = isExpanded ? [...lane.nodeIds, ...lane.hiddenNodeIds] : lane.nodeIds;
        const totalCount = lane.nodeIds.length + lane.hiddenNodeIds.length;
        // A lane with nothing rendered but a "+N more" affordance (e.g. a raw/ ingestion folder
        // whose pages sit outside the interlinked wikilink graph entirely) gets a one-line header
        // instead of the usual heading+descriptor pair — same content-based sizing as every other
        // lane below naturally collapses it to a slim strip with no forced minimum height.
        const isCompactEmptyLane = visibleIds.length === 0;

        return (
          <div
            key={lane.name}
            className="flex min-h-0 flex-col overflow-hidden rounded-lg px-2 py-1"
            style={{
              // Content-based, not proportional: every lane takes exactly the height its own
              // pills need (capped per-lane below), so a folder with few pills doesn't get
              // stretched and a folder with many doesn't get starved by its neighbors.
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: "auto",
              // Flat and folder-agnostic (not tinted per lane) so color reads only on the pills
              // themselves, and so the connector-line layer beneath the pills stays legible
              // against a plain backdrop instead of a translucent color wash.
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.035)",
            }}
          >
            {isCompactEmptyLane ? (
              <div className="flex shrink-0 items-baseline gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  {lane.name}
                </h3>
                <p className="text-[11px] text-foreground/40">
                  {totalCount} page{totalCount === 1 ? "" : "s"}, not interlinked
                </p>
              </div>
            ) : (
              <div className="mb-0.5 flex shrink-0 items-baseline gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  {lane.name} ({visibleIds.length})
                </h3>
                <p className="text-[11px] text-foreground/50">
                  {totalCount} page{totalCount === 1 ? "" : "s"} total
                </p>
              </div>
            )}
            <div
              className="relative z-0 flex flex-wrap content-start gap-x-1 gap-y-0.5 overflow-hidden"
              style={{ maxHeight: MAX_VISIBLE_ROWS * PILL_ROW_HEIGHT_PX }}
            >
              {visibleIds
                .map((id) => nodesById.get(id))
                .filter((candidate): candidate is GraphNode => candidate !== undefined)
                .map((node) => (
                  <PillNode
                    key={node.id}
                    node={node}
                    isActive={node.id === activeNodeId}
                    isDark={isDark}
                    isRevealed={
                      revealableIds.has(node.id) ||
                      searchRevealedIds.has(node.id) ||
                      lane.hiddenNodeIds.includes(node.id)
                    }
                    isDimmed={searchDimmedIds.has(node.id)}
                    isHiddenBySelection={
                      highlightedIds != null && !highlightedIds.has(node.id)
                    }
                    isConnected={
                      highlightedIds != null &&
                      node.id !== activeNodeId &&
                      highlightedIds.has(node.id)
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
              {!isExpanded && lane.hiddenNodeIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleExpandLane(lane.name)}
                  aria-label={`Show ${lane.hiddenNodeIds.length} more nodes in ${lane.name}`}
                  className="flex shrink-0 items-center rounded-full border border-dashed border-black/20 px-2.5 py-1 text-xs font-medium text-foreground/60 transition-colors hover:bg-black/10 dark:border-white/20 dark:hover:bg-white/10"
                >
                  +{lane.hiddenNodeIds.length} more
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

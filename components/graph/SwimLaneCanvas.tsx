"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  buildConnectorPath,
  CONNECTOR_ANIMATION_DURATION_MS,
} from "@/lib/connector-line-animation";
import { assignLanes } from "@/lib/lane-assignment";
import { EmptyState } from "./EmptyState";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import { PillNode } from "./PillNode";
import { getRelatedNodeIds } from "./SidePanel";

interface SwimLaneCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

interface ConnectorPathData {
  targetId: string;
  d: string;
}

function ConnectorPath({ d }: { d: string }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={drawn ? 0 : 1}
      style={{ transition: `stroke-dashoffset ${CONNECTOR_ANIMATION_DURATION_MS}ms ease-out` }}
    />
  );
}

export default function SwimLaneCanvas({ nodes, edges, onNodeClick }: SwimLaneCanvasProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [connectorPaths, setConnectorPaths] = useState<ConnectorPathData[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const lanes = useMemo(() => assignLanes(nodes), [nodes]);

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
    const sourceX = sourceRect.left + sourceRect.width / 2 - boardRect.left;
    const sourceY = sourceRect.top + sourceRect.height / 2 - boardRect.top;

    const paths: ConnectorPathData[] = [];
    for (const targetId of getRelatedNodeIds(activeNodeId, edges)) {
      const targetEl = pillRefs.current.get(targetId);
      if (targetEl == null) continue;
      const targetRect = targetEl.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2 - boardRect.left;
      const targetY = targetRect.top + targetRect.height / 2 - boardRect.top;
      paths.push({ targetId, d: buildConnectorPath(sourceX, sourceY, targetX, targetY) });
    }

    setConnectorPaths(paths);
  }, [activeNodeId, nodes, edges]);

  if (nodes.length === 0) {
    return <EmptyState />;
  }

  function handlePillClick(node: GraphNode) {
    setActiveNodeId(node.id);
    onNodeClick?.(node);
  }

  return (
    <div ref={boardRef} className="relative flex h-full flex-col overflow-hidden">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-foreground/60">
        {activeNodeId != null &&
          connectorPaths.map(({ targetId, d }) => (
            <ConnectorPath key={`${activeNodeId}-${targetId}`} d={d} />
          ))}
      </svg>
      {lanes.map((lane) => (
        <div
          key={lane.name}
          className="flex flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden border-b border-black/10 px-2 dark:border-white/10"
        >
          <h3 className="shrink-0 text-xs font-semibold uppercase text-foreground/60">
            {lane.name}
          </h3>
          {lane.nodeIds
            .map((id) => nodes.find((candidate) => candidate.id === id))
            .filter((candidate): candidate is GraphNode => candidate !== undefined)
            .map((node) => (
              <PillNode
                key={node.id}
                node={node}
                isActive={node.id === activeNodeId}
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
      ))}
    </div>
  );
}

"use client";

import { getGithubSourceUrl } from "../../lib/github-source-link";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import { StatusDot } from "./StatusDot";

interface SidePanelProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
}

type EdgeEndpoint = string | { id: string };

// react-force-graph-2d mutates edge.source/edge.target from string ids to node object
// references in place once its layout simulation runs, so this must handle both shapes.
function endpointId(endpoint: EdgeEndpoint): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

export function getRelatedNodeIds(nodeId: string, edges: GraphEdge[]): string[] {
  const relatedIds: string[] = [];
  for (const edge of edges) {
    const sourceId = endpointId(edge.source as unknown as EdgeEndpoint);
    const targetId = endpointId(edge.target as unknown as EdgeEndpoint);
    if (sourceId === nodeId) {
      relatedIds.push(targetId);
    } else if (targetId === nodeId) {
      relatedIds.push(sourceId);
    }
  }
  return relatedIds;
}

export function SidePanel({ node, edges, allNodes, onClose }: SidePanelProps) {
  const relatedNodes = node
    ? getRelatedNodeIds(node.id, edges)
        .map((id) => allNodes.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is GraphNode => candidate !== undefined)
    : [];

  return (
    <aside
      aria-hidden={!node}
      className={`fixed top-0 right-0 h-full w-80 transform overflow-y-auto border-l border-black/10 bg-background p-4 text-foreground shadow-lg transition-transform duration-300 ease-in-out dark:border-white/10 ${
        node ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {node && (
        <>
          <button type="button" onClick={onClose} aria-label="Close panel" className="mb-4 text-sm">
            Close
          </button>
          <h2 className="text-lg font-semibold">{node.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <StatusDot status={node.status} />
            <span className="text-sm">{node.status}</span>
          </div>
          {node.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {node.tags.map((tag) => (
                <li key={tag} className="rounded bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-4 text-sm font-semibold">Related</h3>
          {relatedNodes.length > 0 ? (
            <ul className="mt-1 text-sm">
              {relatedNodes.map((related) => (
                <li key={related.id}>{related.title}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-foreground/60">No related pages.</p>
          )}
          <a
            href={getGithubSourceUrl(node.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-sm underline"
          >
            View source on GitHub
          </a>
        </>
      )}
    </aside>
  );
}

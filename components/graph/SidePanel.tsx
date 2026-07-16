"use client";

import { getGithubSourceUrl } from "../../lib/github-source-link";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import { getFolderColor } from "./nodeColor";
import { PillNode } from "./PillNode";
import { StatusDot } from "./StatusDot";

interface SidePanelProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  isDark: boolean;
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
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

export function groupNodesByFolder(nodes: GraphNode[]): { folder: string; nodes: GraphNode[] }[] {
  const order: string[] = [];
  const grouped = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    if (!grouped.has(node.folder)) {
      order.push(node.folder);
      grouped.set(node.folder, []);
    }
    grouped.get(node.folder)?.push(node);
  }
  return order.map((folder) => ({ folder, nodes: grouped.get(folder) ?? [] }));
}

export function SidePanel({ node, edges, allNodes, isDark, onClose, onSelectNode }: SidePanelProps) {
  const relatedNodes = node
    ? getRelatedNodeIds(node.id, edges)
        .map((id) => allNodes.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is GraphNode => candidate !== undefined)
    : [];

  return (
    <aside className="h-full w-80 shrink-0 overflow-y-auto border-l border-black/10 bg-background p-4 text-foreground shadow-lg dark:border-white/10">
      {node ? (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="mb-4 text-sm"
          >
            Close
          </button>
          <h2 className="text-lg font-semibold">{node.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <StatusDot status={node.status} />
            <span className="text-sm">{node.status}</span>
          </div>
          {node.folder ? (
            <span
              className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${getFolderColor(node.folder, isDark)}${isDark ? "33" : "1f"}`,
                borderColor: getFolderColor(node.folder, isDark),
                color: getFolderColor(node.folder, isDark),
              }}
            >
              {node.folder}
            </span>
          ) : null}
          {node.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {node.tags.map((tag) => (
                <li key={tag} className="rounded bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {node.description ? (
            <p className="mt-3 text-sm text-foreground/80">{node.description}</p>
          ) : null}
          <h3 className="mt-4 text-sm font-semibold">Connected pages</h3>
          {relatedNodes.length > 0 ? (
            <div className="mt-1 space-y-3">
              {groupNodesByFolder(relatedNodes).map(({ folder, nodes: folderNodes }) => (
                <div key={folder}>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    {folder || "Other"}
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {folderNodes.map((related) => (
                      <PillNode
                        key={related.id}
                        node={related}
                        isActive={false}
                        isDark={isDark}
                        onClick={onSelectNode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-foreground/60">No connected pages.</p>
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
      ) : (
        <p className="text-sm text-foreground/60">
          Select a node to see its details, tags, and related pages here.
        </p>
      )}
    </aside>
  );
}

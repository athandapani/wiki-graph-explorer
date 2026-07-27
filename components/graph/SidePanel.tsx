"use client";

import { cosineSimilarity } from "../../lib/cosine-similarity";
import type { VectorIndexEntry } from "../../lib/embeddings";
import { getGithubSourceUrl } from "../../lib/github-source-link";
import type { GraphEdge, GraphNode } from "./GraphCanvas";
import { Legend } from "./Legend";
import { getFolderColor } from "./nodeColor";
import { PillNode } from "./PillNode";
import { StatusDot } from "./StatusDot";
import { MAX_RESULTS, RELEVANCE_THRESHOLD } from "./useSearchRanking";

interface SidePanelProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  vectorIndex?: VectorIndexEntry[];
  isDark: boolean;
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  tourCaption?: string | null;
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

// Distinct from getRelatedNodeIds (explicit Related/Referenced By wikilinks) — this surfaces
// pages the vault author never linked but whose content is embedding-close to the selected page,
// ordered by similarity rather than grouped by folder (grouping would discard that order).
export function getSimilarNodes(
  nodeId: string,
  vectorIndex: VectorIndexEntry[],
  allNodes: GraphNode[],
  threshold: number,
  limit: number,
): GraphNode[] {
  const target = vectorIndex.find((entry) => entry.id === nodeId);
  if (!target) {
    return [];
  }
  return vectorIndex
    .filter((entry) => entry.id !== nodeId)
    .map((entry) => ({ id: entry.id, score: cosineSimilarity(target.embedding, entry.embedding) }))
    .filter((entry) => entry.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => allNodes.find((candidate) => candidate.id === entry.id))
    .filter((candidate): candidate is GraphNode => candidate !== undefined);
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

export function SidePanel({
  node,
  edges,
  allNodes,
  vectorIndex = [],
  isDark,
  onClose,
  onSelectNode,
  tourCaption = null,
}: SidePanelProps) {
  const relatedNodes = node
    ? getRelatedNodeIds(node.id, edges)
        .map((id) => allNodes.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is GraphNode => candidate !== undefined)
    : [];

  const similarNodes = node
    ? getSimilarNodes(node.id, vectorIndex, allNodes, RELEVANCE_THRESHOLD, MAX_RESULTS)
    : [];

  // Below md (768px), the panel is always a `fixed` bottom-sheet overlay rather than a
  // fixed-width column competing with the board for the 390px design floor (TOR-09-ULogLhW) —
  // never hidden entirely, since the empty state now carries genuinely useful onboarding content
  // (start-anywhere card, TOR-08-LuQzsEi) that must render "whenever no node is selected," not
  // only once something is clicked. The unselected sheet caps at a shorter 45vh (its content is
  // lighter than full node detail) so it doesn't dominate a first-time mobile visitor's screen;
  // the selected sheet keeps the fuller 70vh since that's an explicit user action. At md and up,
  // both branches converge on the same static in-flow column (md:max-h-none overrides both mobile
  // caps), so desktop remains pixel-for-pixel unchanged regardless of selection.
  const panelClassName = node
    ? "fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-black/10 bg-background p-4 text-foreground shadow-lg dark:border-white/10 md:static md:inset-auto md:z-auto md:h-full md:max-h-none md:w-80 md:shrink-0 md:rounded-none md:border-t-0 md:border-l"
    : "fixed inset-x-0 bottom-0 z-30 max-h-[45vh] overflow-y-auto rounded-t-lg border-t border-black/10 bg-background p-4 text-foreground shadow-lg dark:border-white/10 md:static md:inset-auto md:z-auto md:h-full md:max-h-none md:w-80 md:shrink-0 md:rounded-none md:border-t-0 md:border-l";

  return (
    <aside className={panelClassName}>
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
          {tourCaption ? (
            <p className="mt-2 rounded border-l-2 border-[var(--accent)] bg-black/5 p-2 text-sm dark:bg-white/10">
              {tourCaption}
            </p>
          ) : null}
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
          {similarNodes.length > 0 ? (
            <>
              <h3 className="mt-4 text-sm font-semibold">Semantically similar pages</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {similarNodes.map((similar) => (
                  <PillNode
                    key={similar.id}
                    node={similar}
                    isActive={false}
                    isDark={isDark}
                    onClick={onSelectNode}
                  />
                ))}
              </div>
            </>
          ) : null}
          {node.sourceLinks.length > 0 ? (
            <>
              <h3 className="mt-4 text-sm font-semibold">Cited sources</h3>
              <ul className="mt-1 space-y-1">
                {node.sourceLinks.map((link, i) => (
                  <li key={`${link.url}-${i}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
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
        <div>
          <h2 className="text-lg font-semibold">Start anywhere</h2>
          <p className="mt-1 text-sm text-foreground/70">
            This map is built from {allNodes.length} interlinked wiki pages across{" "}
            {groupNodesByFolder(allNodes).length} folders — click any node to see its detail and
            connections.
          </p>
          <div className="mt-3">
            <Legend folders={groupNodesByFolder(allNodes).map((group) => group.folder)} isDark={isDark} />
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            Not sure where to start? Try clicking a brightly-colored, well-connected node, or
            search for a topic above.
          </p>
        </div>
      )}
    </aside>
  );
}

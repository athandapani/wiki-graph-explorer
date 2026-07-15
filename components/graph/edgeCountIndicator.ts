import type { GraphEdge, GraphNode } from "./GraphCanvas";

export const MIN_RADIUS_SCALE = 0.5;
export const MAX_RADIUS_SCALE = 1.0;

type EdgeEndpoint = string | { id: string };

// react-force-graph-2d mutates edge.source/edge.target from string ids to node object
// references in place once its layout simulation runs, so this must handle both shapes
// (same pattern as getRelatedNodeIds in SidePanel.tsx).
function endpointId(endpoint: EdgeEndpoint): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

export function computeDegrees(
  nodes: Pick<GraphNode, "id">[],
  edges: GraphEdge[],
): Map<string, number> {
  const degrees = new Map<string, number>();
  for (const node of nodes) {
    degrees.set(node.id, 0);
  }
  for (const edge of edges) {
    const sourceId = endpointId(edge.source as unknown as EdgeEndpoint);
    const targetId = endpointId(edge.target as unknown as EdgeEndpoint);
    if (degrees.has(sourceId)) {
      degrees.set(sourceId, (degrees.get(sourceId) ?? 0) + 1);
    }
    if (degrees.has(targetId)) {
      degrees.set(targetId, (degrees.get(targetId) ?? 0) + 1);
    }
  }
  return degrees;
}

// Scales each node's radius relative to its own folder/taxonomy cluster (not the whole
// graph), so a node with markedly fewer edges than its cluster peers renders visibly
// smaller than them — the TOR's "relative to their cluster peers" comparison. A cluster
// with only one node, or where every node in it has zero edges, has no peer to compare
// against, so every node in it renders at full scale.
export function computeRadiusScale(
  nodes: Pick<GraphNode, "id" | "folder">[],
  edges: GraphEdge[],
): Map<string, number> {
  const degrees = computeDegrees(nodes, edges);

  const idsByFolder = new Map<string, string[]>();
  for (const node of nodes) {
    const ids = idsByFolder.get(node.folder) ?? [];
    ids.push(node.id);
    idsByFolder.set(node.folder, ids);
  }

  const scaleById = new Map<string, number>();
  for (const ids of idsByFolder.values()) {
    const maxDegree = Math.max(...ids.map((id) => degrees.get(id) ?? 0));
    for (const id of ids) {
      if (maxDegree === 0) {
        scaleById.set(id, MAX_RADIUS_SCALE);
        continue;
      }
      const degree = degrees.get(id) ?? 0;
      scaleById.set(
        id,
        MIN_RADIUS_SCALE + (MAX_RADIUS_SCALE - MIN_RADIUS_SCALE) * (degree / maxDegree),
      );
    }
  }
  return scaleById;
}

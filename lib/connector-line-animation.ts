export const CONNECTOR_ANIMATION_DURATION_MS = 950;

// Cubic-bezier "flowchart" curve: each control point pulls straight out from its anchor
// (vertically, since anchors are always a pill's top-mid or bottom-mid point) before
// curving toward the other end, so the line leaves/enters each pill perpendicular to its
// edge rather than at a diagonal.
export function buildConnectorPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): string {
  const dy = targetY - sourceY;
  const pull = Math.max(Math.abs(dy) * 0.5, 30);
  const direction = dy >= 0 ? 1 : -1;
  const c1x = sourceX;
  const c1y = sourceY + direction * pull;
  const c2x = targetX;
  const c2y = targetY - direction * pull;
  return `M ${sourceX} ${sourceY} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetX} ${targetY}`;
}

export type ConnectorAnchorEdge = "top" | "bottom";

// Whichever pill sits lower on screen gets connected from/to its top edge, and the higher
// one from/to its bottom edge, so the curve always travels the shorter vertical span between
// the two pills' facing edges.
export function pickConnectorEdges(
  sourceCenterY: number,
  targetCenterY: number,
): { sourceEdge: ConnectorAnchorEdge; targetEdge: ConnectorAnchorEdge } {
  return targetCenterY >= sourceCenterY
    ? { sourceEdge: "bottom", targetEdge: "top" }
    : { sourceEdge: "top", targetEdge: "bottom" };
}

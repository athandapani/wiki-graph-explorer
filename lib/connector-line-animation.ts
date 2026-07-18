export const CONNECTOR_ANIMATION_DURATION_MS = 950;

export type ConnectorAnchorEdge = "top" | "bottom";

// A "bottom" anchor's natural exit/entry direction is downward (+y, away from the pill above
// it); a "top" anchor's is upward (-y). Deriving each control point's pull from its own edge
// (rather than a single dy-sign-derived direction) is what makes the same-edge case below
// (bottom→bottom) pull both control points the same way instead of in mirrored opposite ones.
function edgePullDirection(edge: ConnectorAnchorEdge): 1 | -1 {
  return edge === "bottom" ? 1 : -1;
}

// Cubic-bezier "flowchart" curve: each control point pulls straight out from its anchor
// (vertically, since anchors are always a pill's top-mid or bottom-mid point) before
// curving toward the other end, so the line leaves/enters each pill perpendicular to its
// edge rather than at a diagonal.
export function buildConnectorPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceEdge: ConnectorAnchorEdge,
  targetEdge: ConnectorAnchorEdge,
): string {
  const dy = targetY - sourceY;
  const pull = Math.max(Math.abs(dy) * 0.5, 30);
  const c1x = sourceX;
  const c1y = sourceY + edgePullDirection(sourceEdge) * pull;
  const c2x = targetX;
  const c2y = targetY + edgePullDirection(targetEdge) * pull;
  return `M ${sourceX} ${sourceY} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetX} ${targetY}`;
}

// Whichever pill sits lower on screen gets connected from/to its top edge, and the higher
// one from/to its bottom edge, so the curve always travels the shorter vertical span between
// the two pills' facing edges. When both pills sit at the same horizontal level (same row),
// connecting bottom-to-top would force the curve to cross vertically through the entire row
// in between, visually crossing over unrelated pills — bottom-to-bottom instead dips the
// curve below the row, staying clear of it entirely.
export function pickConnectorEdges(
  sourceCenterY: number,
  targetCenterY: number,
): { sourceEdge: ConnectorAnchorEdge; targetEdge: ConnectorAnchorEdge } {
  const SAME_ROW_EPSILON_PX = 1;
  if (Math.abs(targetCenterY - sourceCenterY) < SAME_ROW_EPSILON_PX) {
    return { sourceEdge: "bottom", targetEdge: "bottom" };
  }
  return targetCenterY > sourceCenterY
    ? { sourceEdge: "bottom", targetEdge: "top" }
    : { sourceEdge: "top", targetEdge: "bottom" };
}

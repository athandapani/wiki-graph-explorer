export const CONNECTOR_ANIMATION_DURATION_MS = 950;

// Quadratic-bezier curve: control point offset perpendicular to the source→target
// line, scaled by horizontal distance, so lanes stacked horizontally get a gentle arc
// rather than a straight connector.
export function buildConnectorPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): string {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const curveOffset = (targetX - sourceX) * 0.15;
  return `M ${sourceX} ${sourceY} Q ${midX} ${midY - curveOffset} ${targetX} ${targetY}`;
}

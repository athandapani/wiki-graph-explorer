import { describe, expect, it } from "vitest";
import {
  buildConnectorPath,
  CONNECTOR_ANIMATION_DURATION_MS,
  pickConnectorEdges,
} from "../lib/connector-line-animation";

describe("connector-line-animation", () => {
  it("TOR-06-pbVYver: exposes a ~950ms animation duration", () => {
    expect(CONNECTOR_ANIMATION_DURATION_MS).toBe(950);
  });

  it("TOR-06-pbVYver: builds a smooth cubic-bezier SVG path string from source to target", () => {
    const path = buildConnectorPath(0, 0, 100, 40, "bottom", "top");

    expect(path.startsWith("M 0 0 C")).toBe(true);
    expect(path.endsWith("100 40")).toBe(true);
  });

  it("pulls each control point straight out from its own anchor before curving toward the other end", () => {
    // source below target (dy < 0): the source control point should pull upward (smaller y
    // than the source anchor) and the target control point should pull downward.
    const path = buildConnectorPath(0, 100, 50, 0, "top", "bottom");
    const [, , , c1x, c1y, c2x, c2y] = path.match(
      /M ([\d.-]+) ([\d.-]+) C ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)/,
    )!.map(Number);

    expect(c1x).toBe(0);
    expect(c1y).toBeLessThan(100);
    expect(c2x).toBe(50);
    expect(c2y).toBeGreaterThan(0);
  });

  it("pulls both control points the same direction (downward) for a same-edge bottom-to-bottom pair", () => {
    // Same-row connections (source and target pills at the same horizontal level) use
    // bottom-to-bottom so the curve dips below both pills instead of crossing through the row.
    const path = buildConnectorPath(0, 50, 100, 50, "bottom", "bottom");
    const [, , , , c1y, , c2y] = path.match(
      /M ([\d.-]+) ([\d.-]+) C ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)/,
    )!.map(Number);

    expect(c1y).toBeGreaterThan(50);
    expect(c2y).toBeGreaterThan(50);
  });

  it("picks the facing top/bottom edges based on which pill sits lower on screen", () => {
    expect(pickConnectorEdges(0, 100)).toEqual({ sourceEdge: "bottom", targetEdge: "top" });
    expect(pickConnectorEdges(100, 0)).toEqual({ sourceEdge: "top", targetEdge: "bottom" });
  });

  it("picks bottom-to-bottom edges when source and target pills sit at the same horizontal level", () => {
    expect(pickConnectorEdges(50, 50)).toEqual({ sourceEdge: "bottom", targetEdge: "bottom" });
  });
});

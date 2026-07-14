import { describe, expect, it } from "vitest";
import {
  buildConnectorPath,
  CONNECTOR_ANIMATION_DURATION_MS,
} from "../lib/connector-line-animation";

describe("connector-line-animation", () => {
  it("TOR-06-pbVYver: exposes a ~950ms animation duration", () => {
    expect(CONNECTOR_ANIMATION_DURATION_MS).toBe(950);
  });

  it("TOR-06-pbVYver: builds a curved SVG path string from source to target", () => {
    const path = buildConnectorPath(0, 0, 100, 0);

    expect(path.startsWith("M 0 0 Q")).toBe(true);
    expect(path.endsWith("100 0")).toBe(true);
  });
});

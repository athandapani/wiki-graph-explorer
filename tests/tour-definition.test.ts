import { describe, expect, it } from "vitest";
import { TOUR_DEFINITION, validateTourDefinition } from "../lib/tour-definition";
import tourEdgesFixture from "./fixtures/tour-edges.json";

describe("TOUR_DEFINITION shape", () => {
  it("TOR-08-8EHbtf3: defines an ordered list of between 4 and 5 node ids, each with a caption", () => {
    expect(TOUR_DEFINITION.length).toBeGreaterThanOrEqual(4);
    expect(TOUR_DEFINITION.length).toBeLessThanOrEqual(5);
    for (const step of TOUR_DEFINITION) {
      expect(step.nodeId.trim()).not.toBe("");
      expect(step.caption.trim()).not.toBe("");
    }
  });
});

describe("validateTourDefinition", () => {
  it("TOR-08-CE4svkF: returns valid when every consecutive pair is connected by an edge", () => {
    const tour = [
      { nodeId: "a", caption: "A" },
      { nodeId: "b", caption: "B" },
      { nodeId: "c", caption: "C" },
      { nodeId: "d", caption: "D" },
    ];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
      { source: "d", target: "c" }, // reversed orientation — still connects c/d
    ];

    expect(validateTourDefinition(tour, edges)).toEqual({ valid: true, errors: [] });
  });

  it("TOR-08-CE4svkF: returns invalid and names the broken pair when a consecutive edge is missing", () => {
    const tour = [
      { nodeId: "a", caption: "A" },
      { nodeId: "b", caption: "B" },
      { nodeId: "c", caption: "C" },
      { nodeId: "d", caption: "D" },
    ];
    const edges = [
      { source: "a", target: "b" },
      // b -> c is missing
      { source: "c", target: "d" },
    ];

    const result = validateTourDefinition(tour, edges);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No edge connects consecutive tour steps "b" and "c"');
  });

  it("TOR-08-8EHbtf3: returns invalid when the tour has fewer than 4 or more than 5 steps", () => {
    const tooShort = [
      { nodeId: "a", caption: "A" },
      { nodeId: "b", caption: "B" },
    ];
    expect(validateTourDefinition(tooShort, []).valid).toBe(false);
  });

  it("TOR-08-8EHbtf3: returns invalid when a step has an empty caption", () => {
    const tour = [
      { nodeId: "a", caption: "A" },
      { nodeId: "b", caption: "" },
      { nodeId: "c", caption: "C" },
      { nodeId: "d", caption: "D" },
    ];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
      { source: "c", target: "d" },
    ];
    expect(validateTourDefinition(tour, edges).valid).toBe(false);
  });

  it("TOR-08-CE4svkF: the shipped TOUR_DEFINITION validates against a real fixture of its actual graph edges", () => {
    const result = validateTourDefinition(TOUR_DEFINITION, tourEdgesFixture.edges);
    expect(result).toEqual({ valid: true, errors: [] });
  });
});

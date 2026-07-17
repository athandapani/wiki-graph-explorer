import { describe, expect, it } from "vitest";
import { assignLanes } from "../lib/lane-assignment";

describe("assignLanes", () => {
  it("TOR-06-6dbr9Jn: groups nodes into a lane per distinct folder, at most 4 lanes", () => {
    const nodes = [
      { id: "a1", folder: "concepts" },
      { id: "a2", folder: "concepts" },
      { id: "b1", folder: "sources" },
      { id: "c1", folder: "projects" },
    ];

    const lanes = assignLanes(nodes);

    expect(lanes.length).toBeLessThanOrEqual(4);
    expect(lanes).toHaveLength(3);
    const byName = Object.fromEntries(lanes.map((lane) => [lane.name, lane.nodeIds.sort()]));
    expect(byName["concepts"]).toEqual(["a1", "a2"]);
    expect(byName["sources"]).toEqual(["b1"]);
    expect(byName["projects"]).toEqual(["c1"]);
  });

  it("TOR-06-a3pVfbc: collapses folders beyond the 4 largest into a single 'Other' lane", () => {
    const nodes = [
      { id: "a1", folder: "alpha" },
      { id: "a2", folder: "alpha" },
      { id: "a3", folder: "alpha" },
      { id: "b1", folder: "bravo" },
      { id: "b2", folder: "bravo" },
      { id: "c1", folder: "charlie" },
      { id: "c2", folder: "charlie" },
      { id: "d1", folder: "delta" },
      { id: "e1", folder: "echo" },
      { id: "f1", folder: "foxtrot" },
    ];

    const lanes = assignLanes(nodes);

    expect(lanes).toHaveLength(5);
    const namedLanes = lanes.slice(0, 4).map((lane) => lane.name);
    expect(namedLanes).toEqual(["alpha", "bravo", "charlie", "delta"]);

    const otherLane = lanes[4];
    expect(otherLane.name).toBe("Other");
    expect(otherLane.nodeIds.sort()).toEqual(["e1", "f1"]);
  });

  it("TOR-06-BxA7IRn: reports each lane's hidden node ids separately from its visible ones", () => {
    const visible = [
      { id: "v1", folder: "concepts" },
      { id: "v2", folder: "sources" },
    ];
    const hidden = [
      { id: "h1", folder: "concepts" },
      { id: "h2", folder: "concepts" },
      { id: "h3", folder: "sources" },
    ];

    const lanes = assignLanes(visible, hidden);

    const byName = Object.fromEntries(lanes.map((lane) => [lane.name, lane]));
    expect(byName["concepts"].hiddenNodeIds.sort()).toEqual(["h1", "h2"]);
    expect(byName["sources"].hiddenNodeIds).toEqual(["h3"]);
  });

  it("TOR-06-BxA7IRn: still produces a lane for a folder whose members are entirely hidden", () => {
    const visible = [{ id: "v1", folder: "concepts" }];
    const hidden = [{ id: "h1", folder: "archive" }];

    const lanes = assignLanes(visible, hidden);

    const archiveLane = lanes.find((lane) => lane.name === "archive");
    expect(archiveLane).toBeDefined();
    expect(archiveLane?.nodeIds).toEqual([]);
    expect(archiveLane?.hiddenNodeIds).toEqual(["h1"]);
  });

  it("counts hidden nodes toward a folder's total when deciding the 4 named lanes vs 'Other'", () => {
    const visible = [
      { id: "a1", folder: "alpha" },
      { id: "b1", folder: "bravo" },
      { id: "c1", folder: "charlie" },
      { id: "d1", folder: "delta" },
      { id: "e1", folder: "echo" },
    ];
    // "echo" has 3 hidden nodes on top of its 1 visible node (total 4), outranking "delta"'s
    // solo visible node (total 1) for the 4th named-lane slot.
    const hidden = [
      { id: "e2", folder: "echo" },
      { id: "e3", folder: "echo" },
      { id: "e4", folder: "echo" },
    ];

    const lanes = assignLanes(visible, hidden);

    const namedLanes = lanes.slice(0, 4).map((lane) => lane.name);
    expect(namedLanes).toContain("echo");
    expect(namedLanes).not.toContain("delta");
  });

  it("TOR-06-a3pVfbc: breaks ties for the 4th lane slot alphabetically by folder name", () => {
    const nodes = [
      { id: "a1", folder: "alpha" },
      { id: "a2", folder: "alpha" },
      { id: "b1", folder: "bravo" },
      { id: "b2", folder: "bravo" },
      { id: "c1", folder: "charlie" },
      { id: "c2", folder: "charlie" },
      // "delta" and "zulu" are tied at 1 node each for the 4th (last named) lane slot.
      { id: "d1", folder: "delta" },
      { id: "z1", folder: "zulu" },
    ];

    const lanes = assignLanes(nodes);

    expect(lanes).toHaveLength(5);
    const namedLanes = lanes.slice(0, 4).map((lane) => lane.name);
    expect(namedLanes).toEqual(["alpha", "bravo", "charlie", "delta"]);
    expect(lanes[4].name).toBe("Other");
    expect(lanes[4].nodeIds).toEqual(["z1"]);
  });
});

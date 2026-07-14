import { describe, expect, it } from "vitest";
import { statusColor } from "../components/graph/StatusDot";

describe("statusColor", () => {
  it("TOR-02-VIOZzEK: given a node's status field is 'dormant', when colored, then it renders a color distinct from active/revisiting", () => {
    const dormant = statusColor("dormant");
    expect(dormant).not.toBe(statusColor("active"));
    expect(dormant).not.toBe(statusColor("revisiting"));
  });

  it("maps active, revisiting, and dormant to three distinct, defined colors", () => {
    const colors = [statusColor("active"), statusColor("revisiting"), statusColor("dormant")];
    expect(colors.every((c) => typeof c === "string" && c.length > 0)).toBe(true);
    expect(new Set(colors).size).toBe(3);
  });
});

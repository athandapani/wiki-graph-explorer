// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Legend } from "../components/graph/Legend";
import { getFolderColor, resetFolderColors } from "../components/graph/nodeColor";

function normalizedColor(color: string): string {
  const probe = document.createElement("div");
  probe.style.color = color;
  return probe.style.color;
}

afterEach(() => {
  cleanup();
  resetFolderColors();
});

describe("Legend", () => {
  it("TOR-08-xZxrwfj: displays a legend entry for each folder, colored to match the graph", () => {
    resetFolderColors();
    const expectedConcepts = getFolderColor("concepts", false);
    const expectedSources = getFolderColor("sources", false);
    resetFolderColors();

    render(<Legend folders={["concepts", "sources"]} isDark={false} />);

    const concepts = screen.getByText("concepts");
    const conceptsDot = concepts.closest("li")?.querySelector("span") as HTMLElement;
    expect(conceptsDot.style.backgroundColor).toBe(normalizedColor(expectedConcepts));

    const sources = screen.getByText("sources");
    const sourcesDot = sources.closest("li")?.querySelector("span") as HTMLElement;
    expect(sourcesDot.style.backgroundColor).toBe(normalizedColor(expectedSources));
  });

  it("TOR-08-hTq5dSY: displays a legend entry for active, revisiting, and dormant", () => {
    render(<Legend folders={[]} isDark={false} />);

    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("revisiting")).toBeTruthy();
    expect(screen.getByText("dormant")).toBeTruthy();
  });

  it("displays 'Other' for the empty-string (root-level) folder", () => {
    render(<Legend folders={[""]} isDark={false} />);

    expect(screen.getByText("Other")).toBeTruthy();
  });
});

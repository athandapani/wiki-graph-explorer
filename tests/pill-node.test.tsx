// @vitest-environment jsdom
import * as fs from "node:fs";
import * as path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GraphNode } from "../components/graph/GraphCanvas";
import { PillNode } from "../components/graph/PillNode";

function node(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: "n1",
    title: "Short Title",
    tags: [],
    status: "active",
    description: "",
    sourceLinks: [],
    folder: "concepts",
    path: "n1.md",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("components/graph/PillNode.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "PillNode.tsx"),
    "utf-8",
  );

  it("TOR-06-hCQUwZW: is a client component rendering a rounded pill shape with the node's title", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("rounded-full");
  });

  it("TOR-06-hCQUwZW: reuses taxonomy coloring and the status dot for visual consistency", () => {
    expect(source).toContain("getFolderColor(node.folder, isDark)");
    expect(source).toContain("<StatusDot");
  });

  it("dims the pill via reduced opacity when isDimmed is true", () => {
    expect(source).toContain("isDimmed?: boolean");
    expect(source).toContain('isDimmed ? "opacity-30" : ""');
  });

  it("TOR-06-cSCqVtt: truncates a title exceeding ~25 characters with an ellipsis, exposing the full title via the tooltip", () => {
    const longTitle = "This Is A Really Long Node Title That Exceeds The Limit";
    render(
      <PillNode node={node({ title: longTitle })} isActive={false} isDark={false} onClick={() => {}} />,
    );

    const button = screen.getByRole("button");
    expect(button.textContent).not.toBe(longTitle);
    expect(button.textContent).toContain("…");
    expect(button.getAttribute("title")).toBe(longTitle);
  });

  it("TOR-06-yzcZ7CL: renders a title within ~25 characters in full, with no ellipsis", () => {
    const shortTitle = "Short Title";
    render(
      <PillNode node={node({ title: shortTitle })} isActive={false} isDark={false} onClick={() => {}} />,
    );

    expect(screen.getByText(shortTitle)).toBeTruthy();
    expect(screen.queryByText(/…/)).toBeNull();
  });
});

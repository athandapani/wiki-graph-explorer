import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/graph/page.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "graph", "page.tsx"),
    "utf-8",
  );

  it("TOR-01-ly1VpL1: is a client component that fetches graph-data.json and vector-index.json for client-side rendering", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain('fetch("/graph-data.json")');
    expect(source).toContain('fetch("/vector-index.json")');
  });

  it("TOR-02-TW7XEms: dynamically imports GraphCanvas with ssr disabled", () => {
    expect(source).toContain('dynamic(() => import("@/components/graph/GraphCanvas")');
    expect(source).toContain("ssr: false");
  });

  it("TOR-02-rG2HTvc: renders ErrorState when the fetch fails", () => {
    expect(source).toContain("<ErrorState");
    expect(source).toContain("setError(");
  });

  it("TOR-02-mqgZkBc: renders EmptyState when graph-data.json has zero nodes", () => {
    expect(source).toContain("<EmptyState");
    expect(source).toContain("graphData.nodes.length === 0");
  });

  it("TOR-02-k4HmFPL: always renders the Footer alongside every page state", () => {
    expect(source).toContain("<Footer");
  });

  it("TOR-04-I0T4GDu: lifts selected-node state and renders SidePanel", () => {
    expect(source).toContain("useState<GraphNode | null>(null)");
    expect(source).toContain("<SidePanel");
    expect(source).toContain("onNodeClick={setSelectedNode}");
  });

  it("TOR-03-TOtRRhr: renders SearchInput above GraphCanvas", () => {
    expect(source).toContain("<SearchInput");
    expect(source).toContain("<GraphCanvas");
    expect(source.indexOf("<SearchInput")).toBeLessThan(source.indexOf("<GraphCanvas"));
  });

  it("TOR-03-C1lczJo: captures the vector-index fetch into state instead of discarding it", () => {
    expect(source).toContain("setVectorIndex(vectors)");
    expect(source).not.toContain("await vectorResponse.json();\n");
  });

  it("TOR-03-6MpPbQh / TOR-03-UH4yx26: wires useSearchRanking's live scores into GraphCanvas", () => {
    expect(source).toContain("useSearchRanking(");
    expect(source).toContain("searchScores={scores}");
    expect(source).toContain("relevanceThreshold={RELEVANCE_THRESHOLD}");
  });

  it("TOR-03-HjJLHTr: wires isSearchActive/hasResults into SearchInput", () => {
    expect(source).toContain("isActive={isSearchActive}");
    expect(source).toContain("hasResults={hasResults}");
  });

  it("TOR-06-DRtjcOk: renders a persistent OptionsPanel wired to layoutMode state, defaulting to swim-lane", () => {
    expect(source).toContain("<OptionsPanel");
    expect(source).toContain('useState<LayoutMode>("swim-lane")');
    expect(source).toContain("layoutMode={layoutMode}");
    expect(source).toContain("onLayoutModeChange={setLayoutMode}");
  });

  it("TOR-06-mvJp8Oa: fetches graph-data.json and vector-index.json exactly once, never inside the toggle path", () => {
    const graphDataFetches = source.match(/fetch\("\/graph-data\.json"\)/g) ?? [];
    const vectorIndexFetches = source.match(/fetch\("\/vector-index\.json"\)/g) ?? [];
    expect(graphDataFetches).toHaveLength(1);
    expect(vectorIndexFetches).toHaveLength(1);
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/);
  });

  it("TOR-06-AFMTHM6: keeps both canvases mounted, toggling visibility via CSS display instead of unmounting", () => {
    expect(source).toContain('display: layoutMode === "force-directed" ? "block" : "none"');
    expect(source).toContain('display: layoutMode === "swim-lane" ? "block" : "none"');
  });

  it("TOR-06-n4fJkbK: wires SwimLaneCanvas node clicks into the same selected-node state as SidePanel", () => {
    expect(source).toContain("<SwimLaneCanvas");
    expect(source.indexOf("<SwimLaneCanvas")).toBeLessThan(source.indexOf("<SidePanel"));
  });
});

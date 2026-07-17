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

  it("TOR-04-1iMsnYq: passes the selected node's id as focusedNodeId to both canvases, and wires SidePanel's chip clicks back into the same selection state", () => {
    const graphCanvasProps = source.slice(
      source.indexOf("<GraphCanvas"),
      source.indexOf("/>", source.indexOf("<GraphCanvas")),
    );
    const swimLaneProps = source.slice(
      source.indexOf("<SwimLaneCanvas"),
      source.indexOf("/>", source.indexOf("<SwimLaneCanvas")),
    );
    const sidePanelProps = source.slice(
      source.indexOf("<SidePanel"),
      source.indexOf("/>", source.indexOf("<SidePanel")),
    );
    expect(graphCanvasProps).toContain("focusedNodeId={selectedNode?.id ?? null}");
    expect(swimLaneProps).toContain("focusedNodeId={selectedNode?.id ?? null}");
    expect(sidePanelProps).toContain("isDark={isDark}");
    expect(sidePanelProps).toContain("onSelectNode={setSelectedNode}");
  });

  it("TOR-03-TOtRRhr / TOR-03-LgIpadO: renders SearchInput in the persistent Header, above both canvases", () => {
    // Re-pointed 2026-07-15 (epic W677sOY). This previously asserted <SearchInput> appeared in
    // this file before <GraphCanvas> — an implementation detail rather than the requirement.
    // TOR-03-TOtRRhr ("a visible search input above the graph canvas") is still satisfied: the
    // input now lives in the Header slot, which renders above both canvases and stays visible
    // without scrolling in either layout mode (TOR-03-LgIpadO).
    expect(source).toContain("<SearchInput");
    expect(source).toContain("<Header");
    expect(source).toContain("search={");
    expect(source.indexOf("<Header")).toBeLessThan(source.indexOf("<GraphCanvas"));
    expect(source.indexOf("<Header")).toBeLessThan(source.indexOf("<SwimLaneCanvas"));
    // The search input must be inside the Header's slot, not stranded back in the page body.
    expect(source.indexOf("<SearchInput")).toBeGreaterThan(source.indexOf("<Header"));
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

  it("TOR-03-Z3ApPfB: wires the same live scores into SwimLaneCanvas, not just GraphCanvas", () => {
    // Issue #4 finding A1: the assertion above passed while search was dead on the default view,
    // because `searchScores={scores}` appeared exactly once — on GraphCanvas. Both canvases must
    // receive the ranking. SwimLaneCanvas's own dimming behavior is covered for real in
    // tests/swim-lane-canvas.test.tsx; this guards the wiring that test cannot see.
    const swimLaneProps = source.slice(
      source.indexOf("<SwimLaneCanvas"),
      source.indexOf("/>", source.indexOf("<SwimLaneCanvas")),
    );
    expect(swimLaneProps).toContain("searchScores={scores}");
    expect(swimLaneProps).toContain("relevanceThreshold={RELEVANCE_THRESHOLD}");
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

  it("TOR-03-PzdJnrT: calls useSearchRanking exactly once, above both layout-mode branches, so an active query survives switching layouts", () => {
    // Given a query is actively filtering one layout mode, When the visitor switches to the
    // other, Then the same query/scores must still apply — which only holds if there is a
    // single useSearchRanking call shared by both canvases rather than one instantiated per
    // layout branch (which would reset on switch). TOR-06-AFMTHM6 above already guards the other
    // half of this: both canvases stay mounted (not unmounted/remounted) across the switch.
    const rankingCalls = source.match(/useSearchRanking\(/g) ?? [];
    expect(rankingCalls).toHaveLength(1);
    const rankingCallIndex = source.indexOf("useSearchRanking(");
    const forceDirectedBranchIndex = source.indexOf('layoutMode === "force-directed"');
    const swimLaneBranchIndex = source.indexOf('layoutMode === "swim-lane"');
    expect(rankingCallIndex).toBeLessThan(forceDirectedBranchIndex);
    expect(rankingCallIndex).toBeLessThan(swimLaneBranchIndex);
  });

  it("TOR-06-mvJp8Oa: fetches graph-data.json and vector-index.json exactly once, never inside the toggle path", () => {
    const graphDataFetches = source.match(/fetch\("\/graph-data\.json"\)/g) ?? [];
    const vectorIndexFetches = source.match(/fetch\("\/vector-index\.json"\)/g) ?? [];
    expect(graphDataFetches).toHaveLength(1);
    expect(vectorIndexFetches).toHaveLength(1);
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/);
  });

  it("keeps both canvases mounted, toggling visibility via CSS display instead of unmounting", () => {
    // This is a supporting implementation detail, not itself the TOR-06-AFMTHM6 requirement:
    // staying mounted is what necessitates the explicit re-fit below (a canvas that were
    // unmounted/remounted would lose its stale camera state for free). See the dedicated
    // TOR-06-AFMTHM6 test for the actual amended re-fit behavior.
    expect(source).toContain('display: layoutMode === "force-directed" ? "block" : "none"');
    expect(source).toContain('display: layoutMode === "swim-lane" ? "block" : "none"');
  });

  it("TOR-06-AFMTHM6 / TOR-02-lcYAVDz: re-fits the force-directed camera via resetViewRef whenever layoutMode becomes force-directed", () => {
    // Amended 2026-07-15 (Cycle 2): re-implemented by epic niaTair. The pre-amendment reading
    // (passively "restore" the prior pan/zoom by never unmounting) is exactly what produced the
    // off-screen clump issue #4 finding A2 reported — this now requires an active re-fit on
    // every transition into force-directed mode, including the first one (default layoutMode is
    // swim-lane, so a visitor's first view of force-directed is always such a transition).
    expect(source).toContain("const resetViewRef = useRef<(() => void) | null>(null);");
    expect(source).toMatch(
      /useEffect\(\(\) => \{\s*if \(layoutMode === "force-directed"\) \{\s*resetViewRef\.current\?\.\(\);\s*\}\s*\}, \[layoutMode\]\);/,
    );
  });

  it("TOR-02-lcYAVDz / TOR-02-IrF7v8x: wires GraphCanvas's fit function into resetViewRef, and resetViewRef into OptionsPanel's reset control", () => {
    const graphCanvasProps = source.slice(
      source.indexOf("<GraphCanvas"),
      source.indexOf("/>", source.indexOf("<GraphCanvas")),
    );
    const optionsPanelProps = source.slice(
      source.indexOf("<OptionsPanel"),
      source.indexOf("/>", source.indexOf("<OptionsPanel")),
    );
    expect(graphCanvasProps).toContain("onResetViewReady={(fn) => {");
    expect(graphCanvasProps).toContain("resetViewRef.current = fn;");
    expect(optionsPanelProps).toContain("onResetView={() => resetViewRef.current?.()}");
  });

  it("TOR-06-n4fJkbK: wires SwimLaneCanvas node clicks into the same selected-node state as SidePanel", () => {
    expect(source).toContain("<SwimLaneCanvas");
    expect(source.indexOf("<SwimLaneCanvas")).toBeLessThan(source.indexOf("<SidePanel"));
  });

  it("TOR-08-qBVi9Aa: passes a hero tagline into Header, which renders above both canvases (no scroll needed to see it)", () => {
    const headerProps = source.slice(
      source.indexOf("<Header"),
      source.indexOf("/>", source.indexOf("<Header")),
    );
    expect(headerProps).toContain("tagline=");
    expect(source.indexOf("<Header")).toBeLessThan(source.indexOf("<GraphCanvas"));
    expect(source.indexOf("<Header")).toBeLessThan(source.indexOf("<SwimLaneCanvas"));
  });

  it("TOR-05-G72S3H4: renders ExplainerSection below the graph so a visitor can scroll to it", () => {
    expect(source).toContain("<ExplainerSection");
    // Outer wrapper scrolls; inner graph section keeps the original fixed-height class (proven
    // to size GraphCanvas/SwimLaneCanvas correctly) plus shrink-0 so flexbox can't compress it
    // to fit the scrollable outer container.
    expect(source).toContain('className="flex h-full flex-col overflow-y-auto"');
    expect(source).toContain('className="flex h-full shrink-0 flex-col overflow-hidden"');
  });
});

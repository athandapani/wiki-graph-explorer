"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { DualPaneBoard } from "@/components/graph/DualPaneBoard";
import { EmptyState } from "@/components/graph/EmptyState";
import { ErrorState } from "@/components/graph/ErrorState";
import { ALL_FILTER_VALUE, computeFilteredOutNodeIds, FilterControls } from "@/components/graph/FilterControls";
import { Footer } from "@/components/graph/Footer";
import type { GraphEdge, GraphNode } from "@/components/graph/GraphCanvas";
import { computeRadiusScale } from "@/components/graph/edgeCountIndicator";
import { GuidedTour } from "@/components/graph/GuidedTour";
import { Header } from "@/components/graph/Header";
import { type LayoutMode } from "@/components/graph/LayoutModeToggle";
import { OptionsPanel } from "@/components/graph/OptionsPanel";
import { type PaneCount, PaneCountControl } from "@/components/graph/PaneCountControl";
import { SearchInput } from "@/components/graph/SearchInput";
import { SidePanel } from "@/components/graph/SidePanel";
import SwimLaneCanvas from "@/components/graph/SwimLaneCanvas";
import { ThemePresetPicker } from "@/components/graph/ThemePresetPicker";
import { ThemeToggle } from "@/components/graph/ThemeToggle";
import { RELEVANCE_THRESHOLD, useSearchRanking } from "@/components/graph/useSearchRanking";
import { useEscapeChain } from "@/hooks/useEscapeChain";
import type { VectorIndexEntry } from "@/lib/embeddings";
import { setActivePreset } from "@/components/graph/nodeColor";
import {
  readStoredCustomAccent,
  readStoredPreset,
  THEME_PRESETS,
  type ThemePresetId,
  writeStoredCustomAccent,
  writeStoredPreset,
} from "@/lib/theme-presets";
import { isTourAvailable, TOUR_DEFINITION } from "@/lib/tour-definition";

// react-force-graph-2d touches canvas/window at module scope, which breaks Next's build-time
// prerender pass even inside a "use client" file — ssr: false keeps it out of that pass.
const GraphCanvas = dynamic(() => import("@/components/graph/GraphCanvas"), { ssr: false });

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: { sourceCount: number | null };
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [vectorIndex, setVectorIndex] = useState<VectorIndexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("swim-lane");
  const [paneCount, setPaneCount] = useState<PaneCount>(1);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [swimLaneClearSignal, setSwimLaneClearSignal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
  const [folderFilter, setFolderFilter] = useState(ALL_FILTER_VALUE);
  const [isDark, setIsDark] = useState(() =>
    typeof document === "undefined" ? true : document.documentElement.classList.contains("dark"),
  );
  const [themePreset, setThemePreset] = useState<ThemePresetId>(() => {
    const stored = readStoredPreset() ?? "teal";
    // Sync nodeColor.ts's module-level palette to a stored non-default preset before first
    // paint. The layout.tsx anti-flash script already set the --accent CSS var and
    // data-theme-preset attribute (it can't reach into this JS module), so this closes the loop
    // for the graph's own node colors.
    if (stored !== "custom") {
      setActivePreset(stored);
    }
    return stored;
  });
  const [customAccent, setCustomAccent] = useState<string | null>(() => readStoredCustomAccent());
  const [paletteVersion, setPaletteVersion] = useState(0);
  const { query, setQuery, scores, isSearchActive, hasResults, matchCount } = useSearchRanking(
    vectorIndex ?? [],
  );
  // TOR-08-6uTWvws/TOR-08-rfVJZHR: the curated tour is hand-bound to the demo vault's node ids
  // (ConOps §8) — a --serve/local build pointed at a different vault won't have them, so the
  // control hides itself rather than offering a tour that can't resolve to real nodes.
  const tourAvailable = graphData
    ? isTourAvailable(
        TOUR_DEFINITION,
        graphData.nodes.map((node) => node.id),
      )
    : false;
  const resetViewRef = useRef<(() => void) | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Applies the currently active accent (a curated preset's light/dark value, or the custom hex,
  // which is theme-independent) to the --accent CSS custom property. Called both when the accent
  // itself changes and when dark/light flips, so toggling dark/light never silently reverts a
  // non-default preset/custom accent back to the CSS default teal.
  function applyAccentForCurrentTheme(preset: ThemePresetId, custom: string | null, dark: boolean): void {
    if (preset === "custom") {
      if (custom) {
        document.documentElement.style.setProperty("--accent", custom);
      }
      return;
    }
    const found = THEME_PRESETS.find((candidate) => candidate.id === preset);
    if (found) {
      document.documentElement.style.setProperty("--accent", dark ? found.accentDark : found.accentLight);
    }
  }

  function handleThemeChange(nextIsDark: boolean): void {
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // localStorage unavailable (private browsing, etc.) — theme still applies for this session
    }
    applyAccentForCurrentTheme(themePreset, customAccent, nextIsDark);
  }

  function handleThemePresetChange(id: ThemePresetId): void {
    setThemePreset(id);
    document.documentElement.setAttribute("data-theme-preset", id);
    writeStoredPreset(id);

    if (id === "custom") {
      // TOR-07-LquSsD5: selecting Custom only reveals the picker — no accent/palette change yet.
      return;
    }

    const preset = THEME_PRESETS.find((candidate) => candidate.id === id);
    if (!preset) {
      return;
    }
    setActivePreset(id);
    document.documentElement.style.setProperty("--accent", isDark ? preset.accentDark : preset.accentLight);
    setCustomAccent(null);
    setPaletteVersion((version) => version + 1);
  }

  function handleCustomAccentChange(hex: string): void {
    // TOR-07-p18cpcx: chrome only — the graph's node palette is deliberately left untouched, so
    // no setActivePreset call and no paletteVersion bump here.
    setCustomAccent(hex);
    document.documentElement.style.setProperty("--accent", hex);
    writeStoredCustomAccent(hex);
  }

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        // Next's basePath rewriting only covers its own build-time asset/link references, not
        // plain runtime fetch() calls — these must prepend it manually to resolve correctly when
        // served from a subpath (e.g. GitHub Project Pages).
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const [graphResponse, vectorResponse] = await Promise.all([
          fetch(`${basePath}/graph-data.json`),
          fetch(`${basePath}/vector-index.json`),
        ]);
        if (!graphResponse.ok || !vectorResponse.ok) {
          throw new Error("Failed to load graph data.");
        }
        const graph = (await graphResponse.json()) as GraphData;
        const vectors = (await vectorResponse.json()) as VectorIndexEntry[];
        setGraphData(graph);
        setVectorIndex(vectors);
      } catch {
        setError("Failed to load graph data.");
      }
    }
    void load();
  }, []);

  // Re-fits the force-directed camera whenever it becomes the visible mode — both the first
  // time a visitor switches into it (default layoutMode is swim-lane) and every subsequent
  // toggle back from swim-lane (TOR-06-AFMTHM6, amended). GraphCanvas is always mounted
  // (design-notes.md §20), so triggering the fit here, at the moment the canvas actually
  // becomes visible, is what fixes the display:none-during-fit clump bug. Also fires when
  // paneCount becomes 2 (TOR-11-6XjR1qm): DualPaneBoard can make force-directed newly visible at
  // its new ~half-width bounds without a layoutMode change (e.g. swim-lane stays primary).
  useEffect(() => {
    if (layoutMode === "force-directed" || paneCount === 2) {
      resetViewRef.current?.();
    }
  }, [layoutMode, paneCount]);

  // Drives the guided tour through the exact same selection path a SidePanel chip click uses
  // (design-notes.md §47) — setting selectedNode focuses the node in whichever layout
  // mode/pane-count is active, with no tour-specific selection logic needed. Done directly in
  // these user-triggered handlers rather than an effect watching tourStepIndex, to avoid the
  // react-hooks/set-state-in-effect cascading-render pattern (same rule noted in design-notes.md
  // §47 for the analogous SwimLaneCanvas sync).
  function focusTourStep(index: number): void {
    if (!graphData) {
      return;
    }
    const step = TOUR_DEFINITION[index];
    const stepNode = graphData.nodes.find((candidate) => candidate.id === step?.nodeId);
    if (stepNode) {
      setSelectedNode(stepNode);
    }
    setTourStepIndex(index);
  }

  function handleTourStart(): void {
    focusTourStep(0);
  }

  function handleTourNext(): void {
    if (tourStepIndex === null) {
      return;
    }
    focusTourStep(tourStepIndex + 1);
  }

  function handleTourExit(): void {
    // Deliberately does not touch selectedNode — the previously-focused node and its side
    // panel detail remain exactly as they were (TOR-08-RCP0xbr).
    setTourStepIndex(null);
  }

  // Esc peels exactly one UI layer per press, in this priority order (TOR-09-YrywFkB): an
  // active tour outranks the theme-preset picker and the Options/Help popover (same tier as each
  // other — epic 4o1EtWX added the theme picker as a header popover alongside Options), which
  // outrank an active search query, which outranks the node selection. handleTourExit is reused
  // as-is so TOR-09-L9qGFOu's "step's node remains selected" falls out of the same behavior
  // TOR-08-RCP0xbr already established.
  useEscapeChain([
    { isActive: tourStepIndex !== null, onEscape: handleTourExit },
    { isActive: isThemePickerOpen, onEscape: () => setIsThemePickerOpen(false) },
    { isActive: isOptionsOpen, onEscape: () => setIsOptionsOpen(false) },
    {
      isActive: isSearchActive,
      onEscape: () => {
        setQuery("");
        searchInputRef.current?.blur();
      },
    },
    {
      isActive: selectedNode !== null,
      onEscape: () => {
        setSelectedNode(null);
        // SwimLaneCanvas's focusedNodeId sync is deliberately null-blind (keeps the board's
        // highlight when the panel's own Close button clears selectedNode) — this signal is the
        // explicit override Esc needs to actually remove the ring/connectors (TOR-09-a6cppkl).
        setSwimLaneClearSignal((count) => count + 1);
      },
    },
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header
        tagline="Every page of this wiki in one map — click anything to see what it is and how it connects."
        search={
          <SearchInput
            ref={searchInputRef}
            value={query}
            onChange={setQuery}
            isActive={isSearchActive}
            hasResults={hasResults}
            matchCount={matchCount}
          />
        }
        options={
          <div className="flex items-center gap-2">
            <GuidedTour
              tourDefinition={TOUR_DEFINITION}
              available={tourAvailable}
              stepIndex={tourStepIndex}
              onStart={handleTourStart}
              onNext={handleTourNext}
              onExit={handleTourExit}
            />
            <PaneCountControl paneCount={paneCount} onChange={setPaneCount} />
            <ThemeToggle isDark={isDark} onChange={handleThemeChange} />
            <ThemePresetPicker
              isOpen={isThemePickerOpen}
              onOpenChange={setIsThemePickerOpen}
              activePreset={themePreset}
              customAccent={customAccent}
              onPresetChange={handleThemePresetChange}
              onCustomAccentChange={handleCustomAccentChange}
            />
            <OptionsPanel
              isOpen={isOptionsOpen}
              onOpenChange={setIsOptionsOpen}
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
              onResetView={() => resetViewRef.current?.()}
              showResetView={layoutMode === "force-directed" || paneCount === 2}
            />
          </div>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {error ? (
            <ErrorState />
          ) : !graphData ? (
            <p className="p-4">Loading graph…</p>
          ) : (
            <>
              {layoutMode === "force-directed" && (
                <FilterControls
                  nodes={graphData.nodes}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  folderFilter={folderFilter}
                  onFolderFilterChange={setFolderFilter}
                />
              )}
              {paneCount === 2 ? (
                <DualPaneBoard
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  layoutMode={layoutMode}
                  onLayoutModeChange={setLayoutMode}
                  selectedNode={selectedNode}
                  onNodeClick={setSelectedNode}
                  isDark={isDark}
                  searchScores={scores}
                  relevanceThreshold={RELEVANCE_THRESHOLD}
                  filteredOutNodeIds={computeFilteredOutNodeIds(
                    graphData.nodes,
                    statusFilter,
                    folderFilter,
                  )}
                  radiusScaleByNodeId={computeRadiusScale(graphData.nodes, graphData.edges)}
                  onResetViewReady={(fn) => {
                    resetViewRef.current = fn;
                  }}
                  swimLaneClearSignal={swimLaneClearSignal}
                  paletteVersion={paletteVersion}
                />
              ) : (
                <>
                  <div
                    className="min-h-0 flex-1"
                    style={{ display: layoutMode === "force-directed" ? "block" : "none" }}
                  >
                    {graphData.nodes.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <GraphCanvas
                        nodes={graphData.nodes}
                        edges={graphData.edges}
                        onNodeClick={setSelectedNode}
                        searchScores={scores}
                        relevanceThreshold={RELEVANCE_THRESHOLD}
                        isDark={isDark}
                        filteredOutNodeIds={computeFilteredOutNodeIds(
                          graphData.nodes,
                          statusFilter,
                          folderFilter,
                        )}
                        radiusScaleByNodeId={computeRadiusScale(graphData.nodes, graphData.edges)}
                        focusedNodeId={selectedNode?.id ?? null}
                        onResetViewReady={(fn) => {
                          resetViewRef.current = fn;
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="min-h-0 flex-1"
                    style={{ display: layoutMode === "swim-lane" ? "block" : "none" }}
                  >
                    <SwimLaneCanvas
                      nodes={graphData.nodes}
                      edges={graphData.edges}
                      onNodeClick={setSelectedNode}
                      isDark={isDark}
                      searchScores={scores}
                      relevanceThreshold={RELEVANCE_THRESHOLD}
                      focusedNodeId={selectedNode?.id ?? null}
                      forceClearSignal={swimLaneClearSignal}
                      paletteVersion={paletteVersion}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <SidePanel
          node={selectedNode}
          edges={graphData?.edges ?? []}
          allNodes={graphData?.nodes ?? []}
          isDark={isDark}
          onClose={() => setSelectedNode(null)}
          onSelectNode={setSelectedNode}
          tourCaption={tourStepIndex !== null ? (TOUR_DEFINITION[tourStepIndex]?.caption ?? null) : null}
        />
      </div>
      {graphData ? (
        <Footer
          nodeCount={graphData.nodes.length}
          edgeCount={graphData.edges.length}
          sourceCount={graphData.meta.sourceCount}
        />
      ) : (
        <Footer />
      )}
    </div>
  );
}

"use client";

import { LayoutModeToggle, type LayoutMode } from "./LayoutModeToggle";

interface OptionsPanelProps {
  // Controlled rather than internal state: app/graph/page.tsx's Esc de-escalation chain
  // (TOR-09-4BewmC1) needs to both read whether the popover is open and close it from outside.
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onResetView?: () => void;
  // Whether the force-directed pane is rendered anywhere on the board right now — true when it's
  // the sole active mode, and also in 2-pane mode where it may be the secondary pane even while
  // layoutMode reflects the primary swim-lane pane (DualPaneBoard, TOR-11-6XjR1qm).
  showResetView?: boolean;
}

// Dark/light and the theme-preset picker moved to standalone header icons (epic 4o1EtWX,
// ThemeToggle.tsx / ThemePresetPicker.tsx) — this popover no longer owns any theme control, so
// it's relabeled "Help" (was "Options & help"). Diagram style (layout-mode toggle + reset view)
// stays here rather than getting its own icon.
export function OptionsPanel({
  isOpen,
  onOpenChange,
  layoutMode,
  onLayoutModeChange,
  onResetView,
  showResetView = layoutMode === "force-directed",
}: OptionsPanelProps) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Help"
        onClick={() => onOpenChange(!isOpen)}
        className="rounded border border-black/10 p-2 dark:border-white/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close options"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 z-20 mt-2 max-h-[80vh] w-80 overflow-y-auto rounded border border-black/10 bg-background p-4 text-sm shadow-lg dark:border-white/10">
            <section className="mb-4">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Diagram style
              </h2>
              <LayoutModeToggle mode={layoutMode} onChange={onLayoutModeChange} />
              {showResetView && (
                <button
                  type="button"
                  onClick={onResetView}
                  className="mt-2 rounded px-2 py-1 text-sm hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Reset view
                </button>
              )}
            </section>
            <section className="mb-4">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                How to use it
              </h2>
              <ul className="list-disc space-y-1 pl-4 text-foreground/70">
                <li>Click any node to open its details, tags, and related pages in the side panel.</li>
                <li>
                  <strong>Swim-lane</strong> groups pages into folder lanes and reveals
                  connections when you click a node.
                </li>
                <li>
                  <strong>Force-directed</strong> shows the whole graph as a freely explorable,
                  physics-based network.
                </li>
                <li>Use the search box to highlight matching pages.</li>
              </ul>
            </section>
            {/* TOR-05-G72S3H4 Spec Deviation: that requirement specifies the explainer is
                revealed by scrolling. User-confirmed intentional deviation (visual refresh) —
                folded in here instead of a below-the-fold scroll section. TOR-05-OMWVZWL (name
                the correct layout mode per affordance) still holds; the copy was rewritten for
                scannability (epic 4o1EtWX) but keeps the same substance. */}
            <section className="mb-4">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Why this exists
              </h2>
              <p className="text-foreground/70">
                A second-brain wiki only stays useful if it can surface relevant, dynamic context
                on demand — for a person or an LLM — instead of forcing a re-read of everything
                from scratch. A folder of Markdown files hides its own structure: you can&apos;t
                see which pages are richly connected and which are quietly isolated just by
                browsing a file tree. Rendering the backlink structure as a graph makes it
                visible — dense clusters show where the wiki&apos;s thinking connects well; thin
                or missing edges surface a content gap before it becomes a blind spot.
              </p>
              <p className="mt-2 text-foreground/70">
                <strong>Try it:</strong> in force-directed mode, use the status and folder filters
                above the graph to isolate a cluster, then look for a node visibly smaller than
                its neighbors — a page with fewer connections than its peers. Click it and check
                the side panel&apos;s related-pages list — a short list on a page that should
                connect to more of the wiki is a missing link made concrete.
              </p>
            </section>
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Build this for your own wiki
              </h2>
              <p className="text-foreground/70">
                This project is open source and works with any Markdown wiki that links pages to
                each other (the &quot;Karpathy pattern&quot;: raw notes compiled into a
                maintained, cross-linked wiki). Point the build script at your vault and it emits
                a static graph plus a semantic search index — no server required:
              </p>
              <code className="mt-2 block overflow-x-auto rounded bg-black/10 px-2 py-1 text-xs dark:bg-white/10">
                npm run build:graph -- --vault &lt;path-to-your-wiki&gt;
              </code>
              <p className="mt-2 text-foreground/70">
                See the{" "}
                <a
                  href="https://github.com/athandapani/wiki-graph-explorer#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-[var(--accent)]"
                >
                  project README
                </a>{" "}
                for setup details.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

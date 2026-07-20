"use client";

import { LayoutModeToggle, type LayoutMode } from "./LayoutModeToggle";
import { ThemeToggle } from "./ThemeToggle";

interface OptionsPanelProps {
  // Controlled rather than internal state: app/graph/page.tsx's Esc de-escalation chain
  // (TOR-09-4BewmC1) needs to both read whether the popover is open and close it from outside.
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  isDark: boolean;
  onThemeChange: (isDark: boolean) => void;
  onResetView?: () => void;
  // Whether the force-directed pane is rendered anywhere on the board right now — true when it's
  // the sole active mode, and also in 2-pane mode where it may be the secondary pane even while
  // layoutMode reflects the primary swim-lane pane (DualPaneBoard, TOR-11-6XjR1qm).
  showResetView?: boolean;
}

export function OptionsPanel({
  isOpen,
  onOpenChange,
  layoutMode,
  onLayoutModeChange,
  isDark,
  onThemeChange,
  onResetView,
  showResetView = layoutMode === "force-directed",
}: OptionsPanelProps) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Options & help"
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
                Color theme
              </h2>
              <ThemeToggle isDark={isDark} onChange={onThemeChange} />
            </section>
            <section className="mb-4">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Help
              </h2>
              <p className="text-foreground/70">
                Click any node to open its details, tags, and related pages in the side panel.{" "}
                <strong>Swim-lane</strong> groups pages into folder lanes and reveals connections
                when you click a node. <strong>Force-directed</strong> shows the whole graph as a
                freely explorable, physics-based network. Use the search box to highlight
                matching pages.
              </p>
            </section>
            {/* TOR-05-G72S3H4 Spec Deviation: that requirement specifies the explainer is
                revealed by scrolling. User-confirmed intentional deviation (visual refresh) —
                folded in here instead of a below-the-fold scroll section. TOR-05-OMWVZWL (name
                the correct layout mode per affordance) still holds; the copy is unchanged. */}
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Why build this
              </h2>
              <p className="text-foreground/70">
                A second-brain wiki only stays useful if an LLM (or a human) can load fresh,
                relevant context on demand instead of re-reading everything from scratch. The
                Karpathy pattern — raw sources compiled into a maintained wiki, backlinked page to
                page — is what makes that dynamic context possible. But a folder of Markdown files
                hides its own structure: you can&apos;t see which pages are richly connected and
                which ones are quietly isolated just by browsing a file tree.
              </p>
              <p className="mt-2 text-foreground/70">
                Rendering the same backlink structure as a graph makes that structure visible.
                Dense clusters show where the wiki&apos;s thinking is well-connected; thin or
                missing edges show where a concept was written down but never linked back to the
                ideas it logically relates to — a content gap an LLM (or a person) would otherwise
                silently work around instead of surfacing.
              </p>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Try it yourself
              </h3>
              <p className="mt-2 text-foreground/70">
                In <strong>force-directed</strong> mode, use the status and folder filters above
                the graph to isolate a cluster, then look for a node that&apos;s visibly smaller
                than its neighbors — that&apos;s a page with markedly fewer connections than its
                peers. Click it and check the side panel&apos;s related-pages list: a short list
                on a page that reads like it should connect to more of the wiki is a missing link
                made concrete, not just a claim.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

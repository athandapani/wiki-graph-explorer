"use client";

import { useState } from "react";
import { LayoutModeToggle, type LayoutMode } from "./LayoutModeToggle";
import { ThemeToggle } from "./ThemeToggle";

interface OptionsPanelProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  isDark: boolean;
  onThemeChange: (isDark: boolean) => void;
  onResetView?: () => void;
}

export function OptionsPanel({
  layoutMode,
  onLayoutModeChange,
  isDark,
  onThemeChange,
  onResetView,
}: OptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Options & help"
        onClick={() => setIsOpen((open) => !open)}
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
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded border border-black/10 bg-background p-4 text-sm shadow-lg dark:border-white/10">
            <section className="mb-4">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Diagram style
              </h2>
              <LayoutModeToggle mode={layoutMode} onChange={onLayoutModeChange} />
              {layoutMode === "force-directed" && (
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
            <section>
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
          </div>
        </>
      )}
    </div>
  );
}

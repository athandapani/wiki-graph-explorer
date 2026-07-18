"use client";

export type PaneCount = 1 | 2;

interface PaneCountControlProps {
  paneCount: PaneCount;
  onChange: (paneCount: PaneCount) => void;
}

// Independent of LayoutModeToggle (TOR-11-45utBRH) and rendered beside the Options & help
// hamburger, not inside its popover — unlike LayoutModeToggle, which lives inside OptionsPanel.
// Hidden below the wide-screen breakpoint (`xl`, 1280px) via pure CSS, matching the existing
// 390px responsive-floor precedent (SidePanel.tsx's `md:` classes) rather than a JS resize
// listener — the board falls back to 1-pane automatically for the same reason (TOR-11-TFakQZA,
// TOR-11-Umq6yH6).
export function PaneCountControl({ paneCount, onChange }: PaneCountControlProps) {
  return (
    <div role="group" aria-label="Pane count" className="hidden gap-1 text-sm xl:flex">
      <button
        type="button"
        aria-pressed={paneCount === 1}
        onClick={() => onChange(1)}
        className={`rounded px-2 py-1 ${paneCount === 1 ? "bg-black/10 dark:bg-white/10" : ""}`}
      >
        1 pane
      </button>
      <button
        type="button"
        aria-pressed={paneCount === 2}
        onClick={() => onChange(2)}
        className={`rounded px-2 py-1 ${paneCount === 2 ? "bg-black/10 dark:bg-white/10" : ""}`}
      >
        2 panes
      </button>
    </div>
  );
}

"use client";

export type PaneCount = 1 | 2;

interface PaneCountControlProps {
  paneCount: PaneCount;
  onChange: (paneCount: PaneCount) => void;
}

// Independent of LayoutModeToggle (TOR-11-45utBRH) and rendered beside the Help hamburger, not
// inside its popover — unlike LayoutModeToggle, which lives inside OptionsPanel. A single icon
// button toggles between 1 and 2 panes (rather than two separate buttons), mirroring
// OptionsPanel's icon-only hamburger. Hidden below the wide-screen breakpoint (`xl`, 1280px) via
// pure CSS, matching the existing 390px responsive-floor precedent (SidePanel.tsx's `md:` classes)
// rather than a JS resize listener — the board falls back to 1-pane automatically for the same
// reason (TOR-11-TFakQZA, TOR-11-Umq6yH6).
export function PaneCountControl({ paneCount, onChange }: PaneCountControlProps) {
  const isTwoPane = paneCount === 2;

  return (
    <button
      type="button"
      aria-pressed={isTwoPane}
      aria-label={isTwoPane ? "Switch to 1 pane" : "Switch to 2 panes"}
      title={isTwoPane ? "Switch to 1 pane" : "Switch to 2 panes"}
      onClick={() => onChange(isTwoPane ? 1 : 2)}
      className={`hidden rounded border border-black/10 p-2 xl:block dark:border-white/10 ${isTwoPane ? "bg-black/10 dark:bg-white/10" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
        {isTwoPane && <line x1="12" y1="4.5" x2="12" y2="19.5" />}
      </svg>
    </button>
  );
}

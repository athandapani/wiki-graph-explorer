"use client";

export type LayoutMode = "force-directed" | "swim-lane";

interface LayoutModeToggleProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutModeToggle({ mode, onChange }: LayoutModeToggleProps) {
  return (
    <div role="group" aria-label="Layout mode" className="flex gap-1 text-sm">
      <button
        type="button"
        aria-pressed={mode === "force-directed"}
        onClick={() => onChange("force-directed")}
        className={`rounded px-2 py-1 ${mode === "force-directed" ? "bg-black/10 dark:bg-white/10" : ""}`}
      >
        Force-directed
      </button>
      <button
        type="button"
        aria-pressed={mode === "swim-lane"}
        onClick={() => onChange("swim-lane")}
        className={`rounded px-2 py-1 ${mode === "swim-lane" ? "bg-black/10 dark:bg-white/10" : ""}`}
      >
        Swim-lane
      </button>
    </div>
  );
}

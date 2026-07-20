"use client";

import { THEME_PRESETS, type ThemePresetId } from "@/lib/theme-presets";

interface ThemePresetPickerProps {
  // Controlled rather than internal state, same reason as OptionsPanel (TOR-09-4BewmC1's Esc
  // de-escalation chain needs to read/close this popover from outside).
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activePreset: ThemePresetId;
  customAccent: string | null;
  onPresetChange: (id: ThemePresetId) => void;
  onCustomAccentChange: (hex: string) => void;
}

export function ThemePresetPicker({
  isOpen,
  onOpenChange,
  activePreset,
  customAccent,
  onPresetChange,
  onCustomAccentChange,
}: ThemePresetPickerProps) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Theme presets"
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-1 rounded border border-black/10 p-2 hover:bg-black/10 dark:border-white/10 dark:hover:bg-white/10"
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
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="8.2" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="15.8" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15.8" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="8.2" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close theme presets"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded border border-black/10 bg-background p-3 text-sm shadow-lg dark:border-white/10">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
              Theme preset
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={activePreset === preset.id}
                  onClick={() => onPresetChange(preset.id)}
                  className="flex items-center gap-2 rounded border border-black/10 px-2 py-1.5 hover:bg-black/10 aria-pressed:border-[var(--accent)] dark:border-white/10 dark:hover:bg-white/10"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: preset.accentLight }}
                    aria-hidden="true"
                  />
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={activePreset === "custom"}
                onClick={() => onPresetChange("custom")}
                className="flex items-center gap-2 rounded border border-black/10 px-2 py-1.5 hover:bg-black/10 aria-pressed:border-[var(--accent)] dark:border-white/10 dark:hover:bg-white/10"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-dashed border-current"
                  aria-hidden="true"
                />
                Custom
              </button>
            </div>
            {activePreset === "custom" && (
              <div className="mt-3 border-t border-black/10 pt-3 dark:border-white/10">
                <label className="flex items-center gap-2 text-foreground/80">
                  <input
                    type="color"
                    aria-label="Custom accent color"
                    value={customAccent ?? "#0088a3"}
                    onChange={(event) => onCustomAccentChange(event.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-black/10 dark:border-white/10"
                  />
                  Pick a custom accent color
                </label>
                <p className="mt-2 text-xs text-foreground/60">
                  Custom colors are not checked for color-vision-deficiency safety or contrast —
                  the curated presets are.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

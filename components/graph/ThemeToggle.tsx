"use client";

interface ThemeToggleProps {
  isDark: boolean;
  onChange: (isDark: boolean) => void;
}

export function ThemeToggle({ isDark, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={isDark}
      onClick={() => onChange(!isDark)}
      className="rounded px-2 py-1 text-sm hover:bg-black/10 dark:hover:bg-white/10"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}

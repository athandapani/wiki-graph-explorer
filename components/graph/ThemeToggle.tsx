"use client";

interface ThemeToggleProps {
  isDark: boolean;
  onChange: (isDark: boolean) => void;
}

// Icon-only header control (epic 4o1EtWX) — relocated out of the Options & help popover to
// always-visible header chrome. The icon shown is the mode a click switches TO (matches the
// previous text-label's semantics): dark mode shows a sun (click for light), light mode shows a
// moon (click for dark).
//
// Unlike the old text-label version (only ever mounted after a user opened the popover — no SSR
// involved), this button is now in the initial render tree, so it's SSR'd. The server always
// renders assuming dark (layout.tsx's default), but the layout.tsx anti-flash script may have
// already flipped the page to light before React hydrates (design-notes.md §24's established,
// accepted mismatch — same reason <html> carries suppressHydrationWarning). Two things follow:
// 1. Both icons are always rendered, toggled by the static `dark:` CSS variant (which reads the
//    already-anti-flash-corrected `.dark` class, not the isDark JS prop) instead of JS
//    conditional rendering — so the two icons are never a *structural* hydration mismatch.
// 2. aria-pressed/aria-label still derive from the isDark JS prop (screen readers need the real
//    state, not a CSS proxy) and can therefore differ from the SSR markup for one hydration
//    pass; suppressHydrationWarning covers exactly that attribute-only case, same pattern §24
//    already established.
export function ThemeToggle({ isDark, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      onClick={() => onChange(!isDark)}
      className="rounded border border-black/10 p-2 hover:bg-black/10 dark:border-white/10 dark:hover:bg-white/10"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden h-5 w-5 dark:block"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
        <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
        <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
        <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="block h-5 w-5 dark:hidden"
        aria-hidden="true"
      >
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  hasResults: boolean;
  matchCount?: number | null;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

export function SearchInput({
  value,
  onChange,
  isActive,
  hasResults,
  matchCount = null,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // Ctrl+K is the reflex a technical evaluator arrives with; Cmd+K is the same reflex on a
      // Mac. Both work from anywhere, including from inside the input itself.
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      // "/" only grabs focus when the visitor isn't already typing somewhere — otherwise the
      // character could never be typed into a query.
      if (event.key === "/" && !isTextEntryTarget(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // null while a ranking is in flight — render nothing rather than a count the next frame
  // contradicts. At zero, the no-results message below already says it; a "0 matching pages"
  // next to it would just be the same fact twice.
  const showCount = isActive && matchCount !== null && matchCount > 0;

  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search the wiki…"
        aria-label="Search"
        aria-keyshortcuts="Control+K /"
        className="min-w-0 flex-1 rounded border border-black/10 bg-background px-3 py-2 text-base text-foreground dark:border-white/10 md:text-sm"
      />
      {showCount && (
        <p role="status" className="shrink-0 text-sm text-foreground/60">
          {matchCount} matching {matchCount === 1 ? "page" : "pages"}
        </p>
      )}
      {isActive && !hasResults && (
        <p role="status" className="shrink-0 text-sm text-foreground/60">
          No closely matching results found.
        </p>
      )}
    </div>
  );
}

"use client";

import { forwardRef, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  hasResults: boolean;
  matchCount?: number | null;
  results?: Array<{ id: string; title: string; score: number }>;
  onSelectResult?: (id: string) => void;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

// Forwards the underlying <input> so app/graph/page.tsx's Esc de-escalation chain
// (TOR-09-gEPQ6wm) can blur() it when clearing the query — the value itself stays controlled
// via value/onChange, this ref is only for imperative focus management.
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, isActive, hasResults, matchCount = null, results = [], onSelectResult = () => {} },
  forwardedRef,
) {
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

  const showResults = isActive && results.length > 0;

  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof forwardedRef === "function") {
              forwardedRef(node);
            } else if (forwardedRef) {
              forwardedRef.current = node;
            }
          }}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search the wiki…"
          aria-label="Search"
          aria-keyshortcuts="Control+K /"
          className="w-full rounded border border-black/10 bg-background px-3 py-2 text-base text-foreground dark:border-white/10 md:text-sm"
        />
        {showResults && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded border border-black/10 bg-background shadow-lg dark:border-white/10">
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onSelectResult(result.id)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {result.title}
              </button>
            ))}
          </div>
        )}
      </div>
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
});

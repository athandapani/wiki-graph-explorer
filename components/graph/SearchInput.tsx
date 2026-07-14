"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  hasResults: boolean;
}

export function SearchInput({ value, onChange, isActive, hasResults }: SearchInputProps) {
  return (
    <div className="p-4">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search the wiki…"
        aria-label="Search"
        className="w-full max-w-md rounded border border-black/10 bg-background px-3 py-2 text-sm text-foreground dark:border-white/10"
      />
      {isActive && !hasResults && (
        <p role="status" className="mt-2 text-sm text-foreground/60">
          No closely matching results found.
        </p>
      )}
    </div>
  );
}

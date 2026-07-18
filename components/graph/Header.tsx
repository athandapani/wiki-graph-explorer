import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

interface HeaderProps {
  // Optional because the home page renders this header too and has no vector index behind it —
  // only /graph fills this slot.
  search?: ReactNode;
  // Optional /graph-only hero copy: a one-line promise of what the map is and how to interact
  // with it (TOR-08-qBVi9Aa). Bumps the title to hero size/weight when present so the hero row
  // is the visibly largest text on /graph (TOR-07-DsHsIKN); the home page passes no tagline, so
  // its header is unchanged.
  tagline?: string;
  // Optional /graph-only slot for the Options & help control, same pattern as `search` — the
  // home page has nothing to put here.
  options?: ReactNode;
}

export function Header({ search, tagline, options }: HeaderProps = {}) {
  return (
    <header className="flex shrink-0 flex-col gap-1 border-b border-black/10 px-4 py-3 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo className="h-6 w-6 text-[var(--accent)]" />
          <span className={`font-heading ${tagline ? "text-xl font-bold" : "text-lg font-semibold"}`}>
            Wiki Graph Explorer
          </span>
        </Link>
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}
        {options ? <div className="shrink-0">{options}</div> : null}
      </div>
      {tagline ? <p className="text-sm text-foreground/70">{tagline}</p> : null}
    </header>
  );
}

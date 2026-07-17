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
}

export function Header({ search, tagline }: HeaderProps = {}) {
  return (
    <header className="flex shrink-0 flex-col gap-1 border-b border-black/10 px-4 py-3 dark:border-white/10">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo className="h-6 w-6 text-[var(--accent)]" />
          <span className={tagline ? "text-xl font-bold" : "text-lg font-semibold"}>
            Wiki Graph Explorer
          </span>
        </Link>
        {search}
      </div>
      {tagline ? <p className="text-sm text-foreground/70">{tagline}</p> : null}
    </header>
  );
}

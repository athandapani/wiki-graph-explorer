import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

interface HeaderProps {
  // Optional because the home page renders this header too and has no vector index behind it —
  // only /graph fills this slot.
  search?: ReactNode;
}

export function Header({ search }: HeaderProps = {}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-black/10 px-4 py-3 dark:border-white/10">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Logo className="h-6 w-6 text-blue-500" />
        <span className="text-lg font-semibold">Wiki Graph Explorer</span>
      </Link>
      {search}
    </header>
  );
}

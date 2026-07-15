import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-black/10 px-4 py-3 dark:border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-blue-500" />
        <span className="text-lg font-semibold">Wiki Graph Explorer</span>
      </Link>
    </header>
  );
}

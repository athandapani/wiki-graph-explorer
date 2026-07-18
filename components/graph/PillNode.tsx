"use client";

import { getFolderColor } from "./nodeColor";
import { StatusDot } from "./StatusDot";
import type { GraphNode } from "./GraphCanvas";

interface PillNodeProps {
  node: GraphNode;
  isActive: boolean;
  isDark: boolean;
  isRevealed?: boolean;
  isDimmed?: boolean;
  onClick: (node: GraphNode) => void;
  pillRef?: (element: HTMLButtonElement | null) => void;
}

export function PillNode({
  node,
  isActive,
  isDark,
  isRevealed = false,
  isDimmed = false,
  onClick,
  pillRef,
}: PillNodeProps) {
  const accent = getFolderColor(node.folder, isDark);

  return (
    <button
      ref={pillRef}
      type="button"
      onClick={() => onClick(node)}
      aria-pressed={isActive}
      className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
        isRevealed ? "border-dashed" : ""
      } ${isDimmed ? "opacity-30" : ""}`}
      style={{
        // An opaque `var(--background)` base beneath the translucent accent tint (painted via
        // background-image rather than a second backgroundColor, since CSS only allows one)
        // keeps the same pastel look as a plain backgroundColor would, but makes the pill
        // genuinely opaque — otherwise a same-alpha backgroundColor lets whatever paints behind
        // it (a connector line, correctly z-stacked behind but rendered at full opacity) bleed
        // through visually, even though the DOM paint order is already correct.
        backgroundColor: "var(--background)",
        backgroundImage: `linear-gradient(${accent}${isDark ? "33" : "1f"}, ${accent}${isDark ? "33" : "1f"})`,
        borderColor: `${accent}${isActive ? "ff" : "80"}`,
        boxShadow: isActive ? `0 0 0 2px ${accent}55` : undefined,
      }}
    >
      <StatusDot status={node.status} />
      <span>{node.title}</span>
    </button>
  );
}

"use client";

import { getFolderColor } from "./nodeColor";
import { StatusDot } from "./StatusDot";
import type { GraphNode } from "./GraphCanvas";

interface PillNodeProps {
  node: GraphNode;
  isActive: boolean;
  isDark: boolean;
  isRevealed?: boolean;
  // Partial fade (TOR-03-Z3ApPfB: "dimmed", not hidden) — used for search results below the
  // relevance threshold. Kept as a distinct, lighter treatment from isHiddenBySelection below so
  // an active search query still reads as "dimmed" even when no node is selected.
  isDimmed?: boolean;
  // True when a node selection is active (a pill was clicked) and this node is neither the
  // selection itself nor directly connected to it. Fully invisible rather than faded, so a
  // selection reads as "only this cluster exists" — the connector-line layer sits beneath every
  // pill (see SwimLaneCanvas's svg), so an opacity-0 pill also stops blocking the line that used
  // to terminate at it, letting lines read clearly against the now-untinted lane background.
  // Takes precedence over isDimmed: once a selection is active, the board is in focus mode and
  // search-relevance fading is superseded by cluster-exclusion.
  isHiddenBySelection?: boolean;
  // True for a node that is not the active selection itself but is directly connected to it —
  // rendered at full visibility alongside the active pill (not just "not dimmed"), with a
  // lighter version of the active glow, so the connected cluster reads as one elevated group.
  isConnected?: boolean;
  onClick: (node: GraphNode) => void;
  pillRef?: (element: HTMLButtonElement | null) => void;
}

export function PillNode({
  node,
  isActive,
  isDark,
  isRevealed = false,
  isDimmed = false,
  isHiddenBySelection = false,
  isConnected = false,
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
      className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight transition-all duration-300 ${
        isRevealed ? "border-dashed" : ""
      } ${isHiddenBySelection ? "pointer-events-none opacity-0" : isDimmed ? "opacity-30" : ""} ${isActive || isConnected ? "z-10" : ""}`}
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
        boxShadow: isActive
          ? `0 0 0 2px ${accent}55, 0 0 16px 2px ${accent}66`
          : isConnected
            ? `0 0 0 1px ${accent}40, 0 0 10px 1px ${accent}33`
            : undefined,
      }}
    >
      <StatusDot status={node.status} size={6} />
      <span>{node.title}</span>
    </button>
  );
}

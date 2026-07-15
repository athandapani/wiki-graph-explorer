"use client";

import { getFolderColor } from "./nodeColor";
import { StatusDot } from "./StatusDot";
import type { GraphNode } from "./GraphCanvas";

interface PillNodeProps {
  node: GraphNode;
  isActive: boolean;
  isDark: boolean;
  isRevealed?: boolean;
  onClick: (node: GraphNode) => void;
  pillRef?: (element: HTMLButtonElement | null) => void;
}

export function PillNode({
  node,
  isActive,
  isDark,
  isRevealed = false,
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
      className={`flex max-w-[150px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
        isRevealed ? "border-dashed" : ""
      }`}
      style={{
        backgroundColor: `${accent}${isDark ? "33" : "1f"}`,
        borderColor: `${accent}${isActive ? "ff" : "80"}`,
        boxShadow: isActive ? `0 0 0 2px ${accent}55` : undefined,
      }}
    >
      <StatusDot status={node.status} />
      <span className="truncate">{node.title}</span>
    </button>
  );
}

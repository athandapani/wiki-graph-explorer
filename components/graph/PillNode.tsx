"use client";

import { getFolderColor } from "./nodeColor";
import { StatusDot } from "./StatusDot";
import type { GraphNode } from "./GraphCanvas";

interface PillNodeProps {
  node: GraphNode;
  isActive: boolean;
  onClick: (node: GraphNode) => void;
  pillRef?: (element: HTMLButtonElement | null) => void;
}

export function PillNode({ node, isActive, onClick, pillRef }: PillNodeProps) {
  return (
    <button
      ref={pillRef}
      type="button"
      onClick={() => onClick(node)}
      aria-pressed={isActive}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
        isActive ? "border-black/40 dark:border-white/40" : "border-black/10 dark:border-white/10"
      }`}
      style={{ backgroundColor: getFolderColor(node.folder) + "26" }}
    >
      <StatusDot status={node.status} />
      <span>{node.title}</span>
    </button>
  );
}

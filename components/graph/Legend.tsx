"use client";

import { getFolderColor } from "./nodeColor";
import { StatusDot } from "./StatusDot";

const STATUS_VALUES = ["active", "revisiting", "dormant"] as const;

interface LegendProps {
  folders: string[];
  isDark: boolean;
}

export function Legend({ folders, isDark }: LegendProps) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Folders</h4>
      <ul className="mt-1 space-y-1">
        {folders.map((folder) => (
          <li key={folder} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getFolderColor(folder, isDark) }}
            />
            {folder || "Other"}
          </li>
        ))}
      </ul>
      <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/60">Status</h4>
      <ul className="mt-1 space-y-1">
        {STATUS_VALUES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-sm">
            <StatusDot status={status} />
            {status}
          </li>
        ))}
      </ul>
    </div>
  );
}

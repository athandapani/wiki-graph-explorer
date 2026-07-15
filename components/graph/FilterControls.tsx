"use client";

import type { GraphNode } from "./GraphCanvas";

export const ALL_FILTER_VALUE = "";

interface FilterControlsProps {
  nodes: GraphNode[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  folderFilter: string;
  onFolderFilterChange: (folder: string) => void;
}

function distinctSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

// Options are derived from the current dataset rather than hardcoded (e.g. to
// active/revisiting/dormant), since GraphNode.status/folder are free-form strings and different
// vaults may use different taxonomy/status values.
export function FilterControls({
  nodes,
  statusFilter,
  onStatusFilterChange,
  folderFilter,
  onFolderFilterChange,
}: FilterControlsProps) {
  const statusOptions = distinctSorted(nodes.map((node) => node.status));
  const folderOptions = distinctSorted(nodes.map((node) => node.folder));

  return (
    <div className="flex flex-wrap gap-3 px-4 pb-2 text-sm">
      <label className="flex items-center gap-1.5">
        <span className="text-foreground/60">Status</span>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="rounded border border-black/10 bg-background px-2 py-1 text-foreground dark:border-white/10"
        >
          <option value={ALL_FILTER_VALUE}>All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5">
        <span className="text-foreground/60">Folder</span>
        <select
          aria-label="Filter by folder"
          value={folderFilter}
          onChange={(event) => onFolderFilterChange(event.target.value)}
          className="rounded border border-black/10 bg-background px-2 py-1 text-foreground dark:border-white/10"
        >
          <option value={ALL_FILTER_VALUE}>All</option>
          {folderOptions.map((folder) => (
            <option key={folder} value={folder}>
              {folder}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function computeFilteredOutNodeIds(
  nodes: GraphNode[],
  statusFilter: string,
  folderFilter: string,
): Set<string> {
  const filteredOut = new Set<string>();
  for (const node of nodes) {
    const matchesStatus = statusFilter === ALL_FILTER_VALUE || node.status === statusFilter;
    const matchesFolder = folderFilter === ALL_FILTER_VALUE || node.folder === folderFilter;
    if (!matchesStatus || !matchesFolder) {
      filteredOut.add(node.id);
    }
  }
  return filteredOut;
}

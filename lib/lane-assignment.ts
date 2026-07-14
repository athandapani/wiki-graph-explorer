const MAX_NAMED_LANES = 4;
const OTHER_LANE_NAME = "Other";

export interface Lane {
  name: string;
  nodeIds: string[];
}

export function assignLanes(nodes: { id: string; folder: string }[]): Lane[] {
  const byFolder = new Map<string, string[]>();
  for (const node of nodes) {
    const nodeIds = byFolder.get(node.folder) ?? [];
    nodeIds.push(node.id);
    byFolder.set(node.folder, nodeIds);
  }

  const sortedFolders = [...byFolder.keys()].sort((a, b) => {
    const countDiff = byFolder.get(b)!.length - byFolder.get(a)!.length;
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  const namedFolders = sortedFolders.slice(0, MAX_NAMED_LANES);
  const overflowFolders = sortedFolders.slice(MAX_NAMED_LANES);

  const lanes: Lane[] = namedFolders.map((folder) => ({
    name: folder,
    nodeIds: byFolder.get(folder)!,
  }));

  if (overflowFolders.length > 0) {
    lanes.push({
      name: OTHER_LANE_NAME,
      nodeIds: overflowFolders.flatMap((folder) => byFolder.get(folder)!),
    });
  }

  return lanes;
}

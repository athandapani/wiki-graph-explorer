const MAX_NAMED_LANES = 4;
const OTHER_LANE_NAME = "Other";

export interface Lane {
  name: string;
  nodeIds: string[];
  hiddenNodeIds: string[];
}

function groupByFolder(nodes: { id: string; folder: string }[]): Map<string, string[]> {
  const byFolder = new Map<string, string[]>();
  for (const node of nodes) {
    const nodeIds = byFolder.get(node.folder) ?? [];
    nodeIds.push(node.id);
    byFolder.set(node.folder, nodeIds);
  }
  return byFolder;
}

// hiddenNodes carries nodes the caller has decided not to render yet (e.g. low-connectivity
// swim-lane nodes) but that still belong to a folder/taxonomy — counted toward that lane's
// total so a lane whose members are entirely hidden still gets a lane (heading + "+N more")
// rather than silently vanishing (TOR-06-BxA7IRn).
export function assignLanes(
  nodes: { id: string; folder: string }[],
  hiddenNodes: { id: string; folder: string }[] = [],
  excludeFromRanking: Set<string> = new Set(),
): Lane[] {
  const byFolder = groupByFolder(nodes);
  const hiddenByFolder = groupByFolder(hiddenNodes);
  const allFolders = new Set([...byFolder.keys(), ...hiddenByFolder.keys()]);

  const sortedFolders = [...allFolders].sort((a, b) => {
    const totalA = (byFolder.get(a)?.length ?? 0) + (hiddenByFolder.get(a)?.length ?? 0);
    const totalB = (byFolder.get(b)?.length ?? 0) + (hiddenByFolder.get(b)?.length ?? 0);
    const countDiff = totalB - totalA;
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  // TOR-06-KruzYET: a folder excluded from ranking (e.g. every node zero-degree, hence
  // permanently hidden from the board) never wins one of the 4 named slots regardless of its
  // raw count — it always folds into "Other", the same as any value beyond the top 4. Splitting
  // after sortedFolders (rather than filtering before) preserves each subset's relative order for
  // deterministic overflow content.
  const eligibleFolders = sortedFolders.filter((folder) => !excludeFromRanking.has(folder));
  const rankExcludedFolders = sortedFolders.filter((folder) => excludeFromRanking.has(folder));

  const namedFolders = eligibleFolders.slice(0, MAX_NAMED_LANES);
  const overflowFolders = [...eligibleFolders.slice(MAX_NAMED_LANES), ...rankExcludedFolders];

  const lanes: Lane[] = namedFolders.map((folder) => ({
    name: folder,
    nodeIds: byFolder.get(folder) ?? [],
    hiddenNodeIds: hiddenByFolder.get(folder) ?? [],
  }));

  if (overflowFolders.length > 0) {
    lanes.push({
      name: OTHER_LANE_NAME,
      nodeIds: overflowFolders.flatMap((folder) => byFolder.get(folder) ?? []),
      hiddenNodeIds: overflowFolders.flatMap((folder) => hiddenByFolder.get(folder) ?? []),
    });
  }

  return lanes;
}

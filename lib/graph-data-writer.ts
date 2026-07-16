import * as fs from "node:fs";
import * as path from "node:path";
import type { EdgeRecord, NodeRecord } from "./graph-builder";

export function writeGraphData(
  outputDir: string,
  nodes: NodeRecord[],
  edges: EdgeRecord[],
  sourceCount: number | null,
): void {
  fs.mkdirSync(outputDir, { recursive: true });
  const graphData = { nodes, edges, meta: { sourceCount } };
  fs.writeFileSync(path.join(outputDir, "graph-data.json"), JSON.stringify(graphData, null, 2));
}

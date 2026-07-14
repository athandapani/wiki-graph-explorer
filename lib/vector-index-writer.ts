import * as fs from "node:fs";
import * as path from "node:path";
import type { VectorIndexEntry } from "./embeddings";

export function writeVectorIndex(outputDir: string, entries: VectorIndexEntry[]): void {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "vector-index.json"), JSON.stringify(entries, null, 2));
}

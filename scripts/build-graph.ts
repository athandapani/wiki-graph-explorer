import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "../lib/cli";
import { computeVectorIndexEntries } from "../lib/embeddings";
import { buildGraph } from "../lib/graph-builder";
import { writeGraphData } from "../lib/graph-data-writer";
import * as logger from "../lib/logger";
import { countRawSources, walkVault } from "../lib/vault-walker";
import { writeVectorIndex } from "../lib/vector-index-writer";

function readVersion(): string {
  const pkgPath = path.join(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string };
  return pkg.version;
}

async function main(): Promise<void> {
  const version = readVersion();
  const result = parseArgs(process.argv.slice(2));

  if (result.mode === "version") {
    process.stdout.write(`wiki-graph-explorer v${version}\n`);
    process.exit(0);
  }

  if (result.mode === "error") {
    process.stderr.write(`${result.message}\n`);
    process.exit(result.exitCode);
  }

  logger.info(`wiki-graph-explorer v${version} starting`);

  const vaultPath = result.vaultPath;
  const vaultExists = fs.existsSync(vaultPath) && fs.statSync(vaultPath).isDirectory();
  if (!vaultExists) {
    process.stderr.write(
      `Error: vault path not found at ${vaultPath}. Check --vault points to a valid wiki directory.\n`,
    );
    process.exit(1);
  }

  const filePaths = walkVault(vaultPath);
  const { nodes, edges, pageTexts } = buildGraph(vaultPath, filePaths, logger.warn);
  const entries = await computeVectorIndexEntries(pageTexts);
  const sourceCount = countRawSources(vaultPath);

  const outputDir = path.resolve(process.cwd(), result.outDir);
  writeGraphData(outputDir, nodes, edges, sourceCount);
  writeVectorIndex(outputDir, entries);

  process.stdout.write(`Wrote graph-data.json (${nodes.length} nodes, ${edges.length} edges)\n`);
  process.exit(0);
}

main().catch((error: unknown) => {
  process.stderr.write(`Unexpected error: ${String(error)}\n`);
  process.exit(1);
});

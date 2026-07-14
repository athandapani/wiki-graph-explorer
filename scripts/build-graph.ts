import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "../lib/cli";
import * as logger from "../lib/logger";

function readVersion(): string {
  const pkgPath = path.join(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string };
  return pkg.version;
}

function main(): void {
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

  // Vault walking / frontmatter parsing is implemented in a later epic (rTWYZfw). For now this
  // writes an empty stub so the build tool's output contract (TOR-01-847tYDS) is satisfiable.
  const outputDir = path.join(process.cwd(), "local-build");
  fs.mkdirSync(outputDir, { recursive: true });
  const graphData = { nodes: [], edges: [] };
  fs.writeFileSync(path.join(outputDir, "graph-data.json"), JSON.stringify(graphData, null, 2));

  process.stdout.write(
    `Wrote graph-data.json (${graphData.nodes.length} nodes, ${graphData.edges.length} edges)\n`,
  );
  process.exit(0);
}

main();

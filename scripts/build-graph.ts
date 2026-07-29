import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "../lib/cli";
import { computeVectorIndexEntries } from "../lib/embeddings";
import { buildGraph } from "../lib/graph-builder";
import { writeGraphData } from "../lib/graph-data-writer";
import * as logger from "../lib/logger";
import { openInBrowser, startPreviewServer } from "../lib/preview-server";
import { countRawSources, walkVault } from "../lib/vault-walker";
import { writeVectorIndex } from "../lib/vector-index-writer";

function readVersion(): string {
  const pkgPath = path.join(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string };
  return pkg.version;
}

// Resolves the bundled static web app this CLI can serve for --serve: the published npm package
// layout (dist/site, assembled by scripts/prepare-publish.ts) or, for local contributor
// development via tsx, this repo's own `npm run build` output (out/) — the same dual-layout
// fallback pattern readVersion() above uses for package.json.
function resolveSiteDir(): string | null {
  const candidates = [path.join(__dirname, "..", "site"), path.join(__dirname, "..", "out")];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  return null;
}

// Unlike the rest of this CLI's run-once-and-exit contract, --serve deliberately keeps the
// process alive (like `vite preview`/`npx serve`) until the visitor stops it with Ctrl+C.
function serveGraph(outputDir: string, port: number): void {
  const siteDir = resolveSiteDir();
  if (!siteDir) {
    process.stderr.write(
      "Error: --serve requires a bundled web app (dist/site) or a local build (out/ via `npm run build`), neither was found.\n",
    );
    process.exit(1);
  }

  fs.copyFileSync(path.join(outputDir, "graph-data.json"), path.join(siteDir, "graph-data.json"));
  fs.copyFileSync(
    path.join(outputDir, "vector-index.json"),
    path.join(siteDir, "vector-index.json"),
  );

  const server = startPreviewServer({ siteDir, port });
  const url = `http://localhost:${port}/graph`;
  logger.info(`Serving graph at ${url} — press Ctrl+C to stop`);
  openInBrowser(url);

  const shutdown = (): void => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
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
  const { nodes, edges, pageTexts } = buildGraph(vaultPath, filePaths, logger.warn, logger.debug);
  const entries = await computeVectorIndexEntries(pageTexts);
  const sourceCount = countRawSources(vaultPath);

  const outputDir = path.resolve(process.cwd(), result.outDir);
  writeGraphData(outputDir, nodes, edges, sourceCount);
  writeVectorIndex(outputDir, entries);

  process.stdout.write(`Wrote graph-data.json (${nodes.length} nodes, ${edges.length} edges)\n`);

  if (result.serve) {
    serveGraph(outputDir, result.port);
    return;
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  process.stderr.write(`Unexpected error: ${String(error)}\n`);
  process.exit(1);
});

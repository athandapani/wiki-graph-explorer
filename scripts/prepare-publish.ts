import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { findSecondBrainPathViolations, type ScannedFile } from "../lib/second-brain-path-check";

const REPO_URL = "https://github.com/athandapani/wiki-graph-explorer";
const DIST_DEPENDENCY_NAMES = ["@huggingface/transformers", "gray-matter"] as const;

// Text-like extensions worth scanning for the private-vault-path safety check below — binary
// assets (fonts, wasm) can't meaningfully contain that string and aren't worth reading as text.
const SCANNABLE_SITE_EXTENSIONS = new Set([".html", ".js", ".mjs", ".css", ".json", ".txt", ".map"]);

// The bundled preview site never needs real data baked in — scripts/build-graph.ts's --serve
// path always overwrites these two files with the visitor's freshly-built output before serving.
// Keeping them empty here means a build that happens to run right after local dev iteration
// against the private second-brain vault (CLAUDE.md's Important Reminders) can never leak its
// content into the published npm package via this route.
const NEUTRAL_GRAPH_DATA = `${JSON.stringify({ nodes: [], edges: [], meta: { sourceCount: null } }, null, 2)}\n`;
const NEUTRAL_VECTOR_INDEX = "[]\n";

interface RootPackageJson {
  version: string;
  dependencies: Record<string, string>;
}

function readRootPackageJson(repoRoot: string): RootPackageJson {
  const pkgPath = path.join(repoRoot, "package.json");
  return JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as RootPackageJson;
}

function writeDistPackageJson(repoRoot: string, distDir: string, root: RootPackageJson): void {
  const dependencies: Record<string, string> = {};
  for (const name of DIST_DEPENDENCY_NAMES) {
    const range = root.dependencies[name];
    if (!range) {
      throw new Error(`Expected root package.json to declare a "${name}" dependency.`);
    }
    dependencies[name] = range;
  }

  const distPackageJson = {
    name: "wiki-graph-explorer",
    version: root.version,
    description:
      "Build-time CLI that turns a Karpathy-pattern wiki's backlink structure into graph-data.json + vector-index.json for wiki-graph-explorer.",
    license: "MIT",
    // No leading "./" — npm's publish-time bin validation silently strips a leading "./" and
    // drops the whole entry as "invalid" (confirmed via `npm pkg fix`, which produces this exact
    // form), which would ship the package with no working `wiki-graph-explorer` command at all.
    bin: {
      "wiki-graph-explorer": "scripts/build-graph.js",
    },
    engines: {
      node: ">=20",
    },
    repository: {
      type: "git",
      url: `git+${REPO_URL}.git`,
    },
    homepage: REPO_URL,
    dependencies,
  };

  fs.writeFileSync(
    path.join(distDir, "package.json"),
    `${JSON.stringify(distPackageJson, null, 2)}\n`,
  );
}

function ensureShebang(entryPath: string): void {
  const content = fs.readFileSync(entryPath, "utf-8");
  if (content.startsWith("#!/usr/bin/env node")) {
    return;
  }
  fs.writeFileSync(entryPath, `#!/usr/bin/env node\n${content}`);
}

function writeDistReadme(distDir: string): void {
  const readme = `# wiki-graph-explorer

Build-time CLI that turns a Karpathy-pattern wiki's backlink structure into a
\`graph-data.json\` + \`vector-index.json\` pair — the static assets that power the
[wiki-graph-explorer](${REPO_URL}) web app.

## Usage

\`\`\`bash
npx wiki-graph-explorer --vault <path-to-your-wiki>
\`\`\`

This walks every Markdown file under \`<path>\`, parses YAML frontmatter
(\`title\`, \`tags\`, \`status\`) and \`## Related\` / \`## Referenced By\` wikilinks,
computes an embedding per page, and writes \`graph-data.json\` + \`vector-index.json\`
into \`./local-build\` (override with \`--out <dir>\`). Every run fully regenerates
both files.

Add \`--serve\` to also open the graph in your browser right away — no separate
clone of the web app required:

\`\`\`bash
npx wiki-graph-explorer --vault <path-to-your-wiki> --serve
npx wiki-graph-explorer --vault <path-to-your-wiki> --serve --port 5000
\`\`\`

\`\`\`bash
npx wiki-graph-explorer --version
\`\`\`

See ${REPO_URL} for the full project, including the web app that renders these
files as an explorable graph.
`;
  fs.writeFileSync(path.join(distDir, "README.md"), readme);
}

interface PublicDataBackup {
  graphData: string | null;
  vectorIndex: string | null;
}

function backupPublicData(publicDir: string): PublicDataBackup {
  const graphDataPath = path.join(publicDir, "graph-data.json");
  const vectorIndexPath = path.join(publicDir, "vector-index.json");
  return {
    graphData: fs.existsSync(graphDataPath) ? fs.readFileSync(graphDataPath, "utf-8") : null,
    vectorIndex: fs.existsSync(vectorIndexPath) ? fs.readFileSync(vectorIndexPath, "utf-8") : null,
  };
}

function writeNeutralPublicData(publicDir: string): void {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "graph-data.json"), NEUTRAL_GRAPH_DATA);
  fs.writeFileSync(path.join(publicDir, "vector-index.json"), NEUTRAL_VECTOR_INDEX);
}

// A build failure must never leave a contributor's public/ clobbered — callers run this in a
// finally block.
function restorePublicData(publicDir: string, backup: PublicDataBackup): void {
  const graphDataPath = path.join(publicDir, "graph-data.json");
  const vectorIndexPath = path.join(publicDir, "vector-index.json");

  if (backup.graphData === null) {
    fs.rmSync(graphDataPath, { force: true });
  } else {
    fs.writeFileSync(graphDataPath, backup.graphData);
  }

  if (backup.vectorIndex === null) {
    fs.rmSync(vectorIndexPath, { force: true });
  } else {
    fs.writeFileSync(vectorIndexPath, backup.vectorIndex);
  }
}

function buildStaticSite(repoRoot: string): void {
  const nextBin = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
  // Invoking Next's own bin file directly with `node` (not `npm`/`npx`) is cross-platform with no
  // shell involved — keeps to this project's execFile-only security rule (CLAUDE.md). An
  // explicitly empty NEXT_PUBLIC_BASE_PATH guarantees this build serves correctly from a local
  // server root, regardless of whatever basePath the GitHub Pages deploy workflow sets for its
  // own, separate build.
  execFileSync(process.execPath, [nextBin, "build"], {
    cwd: repoRoot,
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "" },
    stdio: "inherit",
  });
}

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

// Hard safety gate, not a manual step: the existing check:vault-safety script only scans
// `git ls-files` (tracked files), which never reaches dist/ (gitignored) — so this new bundling
// output needed its own automated check rather than relying on the pre-existing one to cover it.
function assertNoSecondBrainLeakage(siteDir: string): void {
  const files: ScannedFile[] = walkFiles(siteDir)
    .filter((filePath) => SCANNABLE_SITE_EXTENSIONS.has(path.extname(filePath)))
    .map((filePath) => ({ path: filePath, content: fs.readFileSync(filePath, "utf-8") }));

  const violations = findSecondBrainPathViolations(files);
  if (violations.length > 0) {
    throw new Error(
      `Refusing to publish: found the private second-brain vault path referenced in the bundled site:\n${violations
        .map((filePath) => `  - ${filePath}`)
        .join("\n")}`,
    );
  }
}

function bundleSite(repoRoot: string, distDir: string): void {
  const publicDir = path.join(repoRoot, "public");
  const backup = backupPublicData(publicDir);

  try {
    writeNeutralPublicData(publicDir);
    buildStaticSite(repoRoot);
    fs.cpSync(path.join(repoRoot, "out"), path.join(distDir, "site"), { recursive: true });
  } finally {
    restorePublicData(publicDir, backup);
  }

  assertNoSecondBrainLeakage(path.join(distDir, "site"));
}

function main(): void {
  const repoRoot = path.resolve(__dirname, "..");
  const distDir = path.join(repoRoot, "dist");

  if (!fs.existsSync(distDir)) {
    throw new Error(`${distDir} does not exist — run "npm run build:cli" first.`);
  }

  const root = readRootPackageJson(repoRoot);
  writeDistPackageJson(repoRoot, distDir, root);
  ensureShebang(path.join(distDir, "scripts", "build-graph.js"));
  fs.copyFileSync(path.join(repoRoot, "LICENSE"), path.join(distDir, "LICENSE"));
  writeDistReadme(distDir);
  bundleSite(repoRoot, distDir);

  process.stdout.write(`Prepared publishable package in ${distDir}\n`);
}

main();

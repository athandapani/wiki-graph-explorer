import * as fs from "node:fs";
import * as path from "node:path";

const REPO_URL = "https://github.com/athandapani/wiki-graph-explorer";
const DIST_DEPENDENCY_NAMES = ["@huggingface/transformers", "gray-matter"] as const;

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

\`\`\`bash
npx wiki-graph-explorer --version
\`\`\`

See ${REPO_URL} for the full project, including the web app that renders these
files as an explorable graph.
`;
  fs.writeFileSync(path.join(distDir, "README.md"), readme);
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

  process.stdout.write(`Prepared publishable package in ${distDir}\n`);
}

main();

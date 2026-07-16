import * as fs from "node:fs";
import * as path from "node:path";

export function walkVault(vaultPath: string): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(vaultPath);
  return results;
}

// The 'raw/' sibling is a convention of this project's own vaults, not a constraint the tool
// imposes on vaults it renders (Product Vision §5) — so its absence is an ordinary case (null),
// distinct from an empty-but-present directory (0), which asserts "ingested zero sources"
// (TOR-01-gi1qoBS vs TOR-01-gYbfrvE).
export function countRawSources(vaultPath: string): number | null {
  const rawDir = path.join(path.dirname(vaultPath), "raw");
  if (!fs.existsSync(rawDir) || !fs.statSync(rawDir).isDirectory()) {
    return null;
  }
  return walkVault(rawDir).length;
}

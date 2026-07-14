import * as fs from "node:fs";
import * as path from "node:path";
import { extractWikilinks, parseFrontmatter } from "./frontmatter-parser";

export interface NodeRecord {
  id: string;
  title: string;
  tags: string[];
  status: string;
  folder: string;
}

export interface EdgeRecord {
  source: string;
  target: string;
}

interface DirectionalLink {
  from: string;
  to: string;
}

export interface PageText {
  id: string;
  text: string;
}

export function buildGraph(
  vaultPath: string,
  filePaths: string[],
  warn: (message: string) => void,
): { nodes: NodeRecord[]; edges: EdgeRecord[]; pageTexts: PageText[] } {
  const nodes: NodeRecord[] = [];
  const pageTexts: PageText[] = [];
  const links: DirectionalLink[] = [];

  for (const filePath of filePaths) {
    const relPath = path.relative(vaultPath, filePath).split(path.sep).join("/");
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      warn(`skipping ${relPath}: missing or malformed frontmatter`);
      continue;
    }

    const id = path.basename(filePath, ".md");
    const dir = path.dirname(relPath);
    const folder = dir === "." ? "" : dir;

    nodes.push({
      id,
      title: parsed.title,
      tags: parsed.tags,
      status: parsed.status,
      folder,
    });

    pageTexts.push({
      id,
      text: [parsed.title, parsed.tags.join(" "), parsed.body].join("\n"),
    });

    for (const target of extractWikilinks(parsed.body, "Related")) {
      links.push({ from: id, to: target });
    }
    for (const target of extractWikilinks(parsed.body, "Referenced By")) {
      links.push({ from: id, to: target });
    }
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const seenPairs = new Set<string>();
  const edges: EdgeRecord[] = [];

  for (const link of links) {
    if (!nodeIds.has(link.to) || link.from === link.to) {
      continue;
    }
    const [a, b] = [link.from, link.to].sort();
    const key = `${a}::${b}`;
    if (seenPairs.has(key)) {
      continue;
    }
    seenPairs.add(key);
    edges.push({ source: a, target: b });
  }

  return { nodes, edges, pageTexts };
}

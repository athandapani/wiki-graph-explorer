import * as fs from "node:fs";
import * as path from "node:path";
import {
  extractAllWikilinks,
  extractFirstBodyParagraph,
  extractSourceLinks,
  parseFrontmatter,
} from "./frontmatter-parser";

export interface NodeRecord {
  id: string;
  title: string;
  tags: string[];
  status: string;
  description: string;
  sourceLinks: { text: string; url: string }[];
  folder: string;
  path: string;
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
  debug: (message: string) => void = () => {},
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
    const description = parsed.description || extractFirstBodyParagraph(parsed.body);
    const sourceLinks = extractSourceLinks(parsed.body);

    nodes.push({
      id,
      title: parsed.title,
      tags: parsed.tags,
      status: parsed.status,
      description,
      sourceLinks,
      folder,
      path: relPath,
    });

    pageTexts.push({
      id,
      text: [parsed.title, parsed.tags.join(" "), parsed.body].join("\n"),
    });

    for (const target of extractAllWikilinks(parsed.body)) {
      links.push({ from: id, to: target });
    }
  }

  // Resolves a wikilink target by filename or frontmatter title, case-insensitive, regardless of
  // folder — Obsidian's own resolution model (TOR-01-7lCwTjk), replacing exact-id matching. Built
  // once in vault-walk order; "first write wins" on a key collision gives a deterministic
  // tie-break for ambiguous same-titled notes (TOR-01-OgWxAs0) — walkVault()'s fs.readdirSync-
  // backed traversal is stable across repeated runs against an unchanged directory.
  const resolutionMap = new Map<string, string>();
  for (const node of nodes) {
    const idKey = node.id.toLowerCase();
    if (!resolutionMap.has(idKey)) {
      resolutionMap.set(idKey, node.id);
    }
    if (node.title) {
      const titleKey = node.title.toLowerCase();
      if (!resolutionMap.has(titleKey)) {
        resolutionMap.set(titleKey, node.id);
      }
    }
  }

  const seenPairs = new Set<string>();
  const edges: EdgeRecord[] = [];

  for (const link of links) {
    const resolved = resolutionMap.get(link.to.toLowerCase());
    if (!resolved) {
      // A wikilink with no matching note is an ordinary occurrence in real-world PKM vaults
      // (an unfulfilled/broken link), not a build error — dropped silently from the edge set
      // and surfaced only at DEBUG level, never WARN/ERROR (TOR-01-lgSvch6).
      debug(`unresolved wikilink "${link.to}" referenced by ${link.from}`);
      continue;
    }
    if (resolved === link.from) {
      continue;
    }
    const [a, b] = [link.from, resolved].sort();
    const key = `${a}::${b}`;
    if (seenPairs.has(key)) {
      continue;
    }
    seenPairs.add(key);
    edges.push({ source: a, target: b });
  }

  return { nodes, edges, pageTexts };
}

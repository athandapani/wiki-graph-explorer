import matter from "gray-matter";

export interface ParsedFrontmatter {
  title: string;
  tags: string[];
  status: string;
  body: string;
}

export function parseFrontmatter(content: string): ParsedFrontmatter | null {
  if (!content.trimStart().startsWith("---")) {
    return null;
  }

  try {
    const parsed = matter(content);
    if (!parsed.data || typeof parsed.data !== "object") {
      return null;
    }
    const data = parsed.data as Record<string, unknown>;
    return {
      title: typeof data.title === "string" ? data.title : "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      status: typeof data.status === "string" ? data.status : "",
      body: parsed.content,
    };
  } catch {
    return null;
  }
}

const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function extractWikilinks(body: string, heading: "Related" | "Referenced By"): string[] {
  const headingPattern = new RegExp(`^##\\s+${heading}\\s*$`, "m");
  const match = headingPattern.exec(body);
  if (!match) {
    return [];
  }

  const sectionStart = match.index + match[0].length;
  const rest = body.slice(sectionStart);
  const nextHeadingMatch = /^##\s+/m.exec(rest);
  const section = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest;

  const slugs: string[] = [];
  let linkMatch: RegExpExecArray | null;
  WIKILINK_PATTERN.lastIndex = 0;
  while ((linkMatch = WIKILINK_PATTERN.exec(section)) !== null) {
    slugs.push(linkMatch[1].trim());
  }
  return slugs;
}

import matter from "gray-matter";

export interface ParsedFrontmatter {
  title: string;
  tags: string[];
  status: string;
  description: string;
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
      description: typeof data.description === "string" ? data.description.trim() : "",
      body: parsed.content,
    };
  } catch {
    return null;
  }
}

const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
const WIKILINK_STRIP_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\([^)]+\)/g;
const BOLD_PATTERN = /(\*\*|__)([^*_]+)\1/g;
const ITALIC_PATTERN = /(\*|_)([^*_]+)\1/g;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(WIKILINK_STRIP_PATTERN, (_match, slug: string, title?: string) => title ?? slug)
    .replace(MARKDOWN_LINK_PATTERN, (_match, linkText: string) => linkText)
    .replace(BOLD_PATTERN, (_match, _marker: string, inner: string) => inner)
    .replace(ITALIC_PATTERN, (_match, _marker: string, inner: string) => inner);
}

// A line whose entire content (past an optional list marker) is a single wikilink — the shape of
// every "## Related" / "## Referenced By" bullet in this project's vaults. Such a line is
// structural cross-referencing, not prose, so it must not be picked up as the description
// fallback (TOR-01-l3K1BGM).
const BARE_WIKILINK_LINE_PATTERN = /^[-*+]?\s*\[\[[^\]]+\]\]\s*$/;

// "First body paragraph" is the first contiguous block of non-empty prose after frontmatter,
// excluding Markdown headings — used as the node description fallback when frontmatter declares
// none (TOR-01-r0LGd50). Inline markup is stripped so the side panel renders clean prose
// (TOR-01-r0LGd50 note 2), and a body with only headings/wikilinks yields "" rather than an error
// (TOR-01-l3K1BGM).
export function extractFirstBodyParagraph(body: string): string {
  const lines = body.split("\n");
  const paragraph: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isBoundary =
      trimmed.length === 0 || trimmed.startsWith("#") || BARE_WIKILINK_LINE_PATTERN.test(trimmed);
    if (isBoundary) {
      if (paragraph.length > 0) {
        break;
      }
      continue;
    }
    paragraph.push(trimmed);
  }

  if (paragraph.length === 0) {
    return "";
  }

  return stripInlineMarkdown(paragraph.join(" ")).trim();
}

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

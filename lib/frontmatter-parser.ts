import matter from "gray-matter";

export interface ParsedFrontmatter {
  title: string;
  tags: string[];
  status: string;
  description: string;
  body: string;
}

// Real-world Obsidian/PKM frontmatter writes tags as a YAML array (this project's own
// convention), a comma/space-separated string, or skips frontmatter tags entirely in favor of
// inline '#hashtag' markup in the body — all three are normalized into the same tags: string[]
// shape (TOR-01-ffBGE8z, TOR-01-TsGnx0g). A leading '#' immediately followed by a word character
// distinguishes an inline hashtag from a Markdown heading marker, which is always followed by a
// space.
const INLINE_HASHTAG_PATTERN = /#([A-Za-z0-9][\w-]*)/g;

function normalizeTags(rawTags: unknown, body: string): string[] {
  const tags = new Set<string>();

  if (Array.isArray(rawTags)) {
    for (const tag of rawTags) {
      tags.add(String(tag));
    }
  } else if (typeof rawTags === "string") {
    const parts = rawTags.includes(",") ? rawTags.split(",") : rawTags.split(/\s+/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        tags.add(trimmed);
      }
    }
  }

  let hashtagMatch: RegExpExecArray | null;
  INLINE_HASHTAG_PATTERN.lastIndex = 0;
  while ((hashtagMatch = INLINE_HASHTAG_PATTERN.exec(body)) !== null) {
    tags.add(hashtagMatch[1]);
  }

  return Array.from(tags);
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
      tags: normalizeTags(data.tags, parsed.content),
      // Real-world PKM vaults commonly declare no status/freshness field at all — that
      // convention is specific to this project's own vaults, not a general PKM standard, so an
      // absent status defaults to a neutral 'unknown' rather than failing the build
      // (TOR-01-HbBhSDW).
      status: typeof data.status === "string" ? data.status : "unknown",
      description: typeof data.description === "string" ? data.description.trim() : "",
      body: parsed.content,
    };
  } catch {
    return null;
  }
}

// Negative lookbehind excludes '![[Page Name]]' embed/transclusion syntax — the '!' immediately
// precedes '[[' for an embed, so this pattern matches every wikilink reference in the body
// (not just inside specific H2 sections), while never matching an embed (TOR-01-jCHtzGb,
// TOR-01-kCxBFeS).
const ALL_WIKILINKS_PATTERN = /(?<!!)\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
const WIKILINK_STRIP_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\([^)]+\)/g;
const SOURCE_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const SOURCE_LINK_CAP = 5;
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

// Standard "[text](url)" inline Markdown links, distinct from "[[slug|title]]" wikilink syntax
// (no "(" ever immediately follows a wikilink's closing "]]", so this pattern never engages
// there — no special-casing needed to keep the two syntaxes separate, TOR-01-BUr15UG). Capped
// at the first 5 found, in document order, with no deduplication (TOR-01-C9XWA4Y, TOR-01-wU3svpK).
export function extractSourceLinks(body: string): { text: string; url: string }[] {
  const links: { text: string; url: string }[] = [];
  let match: RegExpExecArray | null;
  SOURCE_LINK_PATTERN.lastIndex = 0;
  while ((match = SOURCE_LINK_PATTERN.exec(body)) !== null && links.length < SOURCE_LINK_CAP) {
    links.push({ text: match[1].trim(), url: match[2].trim() });
  }
  return links;
}

// Scans the entire page body for wikilink references, not just inside specific H2 sections —
// the generic Obsidian/PKM backlink model, superseding the old heading-gated extraction
// (TOR-01-jCHtzGb). A heading-scoped wikilink is a subset of "any wikilink in the body", so
// this is a strict superset of the retired extractWikilinks(body, heading) behavior
// (TOR-01-DPjgHwE — vaults using the '## Related'/'## Referenced By' convention keep working
// unchanged).
export function extractAllWikilinks(body: string): string[] {
  const targets: string[] = [];
  let match: RegExpExecArray | null;
  ALL_WIKILINKS_PATTERN.lastIndex = 0;
  while ((match = ALL_WIKILINKS_PATTERN.exec(body)) !== null) {
    targets.push(match[1].trim());
  }
  return targets;
}

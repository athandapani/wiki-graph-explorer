import { describe, expect, it } from "vitest";
import {
  extractAllWikilinks,
  extractFirstBodyParagraph,
  extractSourceLinks,
  parseFrontmatter,
} from "../lib/frontmatter-parser";

describe("parseFrontmatter", () => {
  it("TOR-01-NTPrx23: given valid frontmatter, when parsed, then title/tags/status match", () => {
    const content = `---
title: Deterministic Compiler Pipeline
status: current
tags: [llm-wiki, second-brain-methodology]
---

## Body
content here
`;
    const result = parseFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Deterministic Compiler Pipeline");
    expect(result?.status).toBe("current");
    expect(result?.tags).toEqual(["llm-wiki", "second-brain-methodology"]);
  });

  it("TOR-01-FQuBqe1: given frontmatter with a description key, when parsed, then description matches", () => {
    const content = `---
title: Example
status: current
tags: []
description: A short summary of this page.
---

## Body
content here
`;
    const result = parseFrontmatter(content);
    expect(result?.description).toBe("A short summary of this page.");
  });

  it("given frontmatter with no description key, when parsed, then description is an empty string", () => {
    const content = `---
title: Example
status: current
tags: []
---

## Body
content here
`;
    const result = parseFrontmatter(content);
    expect(result?.description).toBe("");
  });

  it("TOR-01-dEUM3Pp: given syntactically invalid YAML frontmatter, when parsed, then returns null", () => {
    const content = `---
title: [unclosed
status: current
---

body
`;
    expect(parseFrontmatter(content)).toBeNull();
  });

  it("TOR-01-dEUM3Pp: given content with no frontmatter delimiter, when parsed, then returns null", () => {
    const content = "# Just a heading\nno frontmatter here\n";
    expect(parseFrontmatter(content)).toBeNull();
  });

  it("TOR-01-HbBhSDW: given frontmatter with no status key, when parsed, then status is 'unknown'", () => {
    const content = `---
title: Example
tags: []
---

## Body
content here
`;
    const result = parseFrontmatter(content);
    expect(result?.status).toBe("unknown");
  });

  it("TOR-01-ffBGE8z: given frontmatter tags as a comma-separated string, when parsed, then tags is the normalized array", () => {
    const content = `---
title: Example
tags: ai, change-management, research
status: current
---

## Body
content here
`;
    const result = parseFrontmatter(content);
    expect(result?.tags).toEqual(["ai", "change-management", "research"]);
  });

  it("TOR-01-TsGnx0g: given no tags key and body hashtags, when parsed, then tags includes the hashtags", () => {
    const content = `---
title: Example
status: current
---

This relates to #change-management and #adoption.
`;
    const result = parseFrontmatter(content);
    expect(result?.tags).toEqual(["change-management", "adoption"]);
  });
});

describe("extractAllWikilinks", () => {
  it("given a body with a ## Related section containing piped and bare wikilinks, when extracted, then returns all the slugs, regardless of heading", () => {
    const body = `## Related
- [[foo|Foo]]
- [[bar]]

## Referenced By
- [[baz|Baz]]
`;
    expect(extractAllWikilinks(body)).toEqual(["foo", "bar", "baz"]);
  });

  it("given a body with no wikilinks at all, when extracted, then returns an empty array", () => {
    const body = "## Body\nno links here\n";
    expect(extractAllWikilinks(body)).toEqual([]);
  });

  it("TOR-01-jCHtzGb: given a wikilink outside any heading, when extracted, then it is included", () => {
    const body = "This builds on [[Change Management]] directly.";
    expect(extractAllWikilinks(body)).toEqual(["Change Management"]);
  });

  it("TOR-01-kCxBFeS: given an embed and a wikilink in the same body, when extracted, then only the wikilink is returned", () => {
    const body = "![[project-diagram.png]]\n\nSee also [[some-page]].";
    expect(extractAllWikilinks(body)).toEqual(["some-page"]);
  });
});

describe("extractSourceLinks", () => {
  it("TOR-01-VpUINkL: given a body containing a standard [text](url) link, when extracted, then returns an entry with that text and url", () => {
    const body = "See [this report](https://example.com/report) for details.";
    expect(extractSourceLinks(body)).toEqual([
      { text: "this report", url: "https://example.com/report" },
    ]);
  });

  it("TOR-01-C9XWA4Y: given a body with 7 sequential links, when extracted, then returns only the first 5 in document order", () => {
    const links = Array.from({ length: 7 }, (_, i) => `[link${i}](https://example.com/${i})`);
    const body = links.join(" ");
    expect(extractSourceLinks(body)).toEqual(
      Array.from({ length: 5 }, (_, i) => ({ text: `link${i}`, url: `https://example.com/${i}` })),
    );
  });

  it("TOR-01-BUr15UG: given a body containing only wikilinks under ## Related, when extracted, then returns an empty array", () => {
    const body = `## Related\n- [[foo|Foo]]\n- [[bar]]\n`;
    expect(extractSourceLinks(body)).toEqual([]);
  });

  it("TOR-01-wU3svpK: given a body containing the same link twice, when extracted, then returns two separate entries for that url", () => {
    const body = "[first mention](https://example.com/dup) and [second mention](https://example.com/dup)";
    expect(extractSourceLinks(body)).toEqual([
      { text: "first mention", url: "https://example.com/dup" },
      { text: "second mention", url: "https://example.com/dup" },
    ]);
  });

  it("TOR-01-6VVefyP: given a body with no inline Markdown links, when extracted, then returns an empty array", () => {
    const body = "# Title\n\nJust prose, no links here.\n";
    expect(extractSourceLinks(body)).toEqual([]);
  });
});

describe("extractFirstBodyParagraph", () => {
  it("TOR-01-r0LGd50: given a heading then a wrapped paragraph then a Related section, when called, then returns the joined paragraph text", () => {
    const body = `# Change Management

Adoption stalls when process change outpaces training. This page collects
evidence on sequencing the two.

## Related
- [[training-programs]]
`;
    expect(extractFirstBodyParagraph(body)).toBe(
      "Adoption stalls when process change outpaces training. This page collects evidence on sequencing the two.",
    );
  });

  it("TOR-01-l3K1BGM: given a body with only headings and wikilinks, when called, then returns an empty string", () => {
    const body = `# Title

## Related
- [[foo|Foo]]

## Referenced By
- [[bar]]
`;
    expect(extractFirstBodyParagraph(body)).toBe("");
  });

  it("given a paragraph containing an inline wikilink, bold, and italic markup, when called, then the markup is stripped", () => {
    const body = `# Title

See [[deterministic-compiler-pipeline|the compiler pipeline]] for **more** detail on *this*.
`;
    expect(extractFirstBodyParagraph(body)).toBe(
      "See the compiler pipeline for more detail on this.",
    );
  });
});

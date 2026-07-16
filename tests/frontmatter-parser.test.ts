import { describe, expect, it } from "vitest";
import {
  extractFirstBodyParagraph,
  extractWikilinks,
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
});

describe("extractWikilinks", () => {
  it("given a body with a ## Related section containing piped and bare wikilinks, when extracted, then returns the slugs", () => {
    const body = `## Related
- [[foo|Foo]]
- [[bar]]

## Referenced By
- [[baz|Baz]]
`;
    expect(extractWikilinks(body, "Related")).toEqual(["foo", "bar"]);
    expect(extractWikilinks(body, "Referenced By")).toEqual(["baz"]);
  });

  it("given a body with no matching heading, when extracted, then returns an empty array", () => {
    const body = "## Body\nno related section here\n";
    expect(extractWikilinks(body, "Related")).toEqual([]);
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

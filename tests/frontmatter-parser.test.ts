import { describe, expect, it } from "vitest";
import { extractWikilinks, parseFrontmatter } from "../lib/frontmatter-parser";

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

import { describe, expect, it } from "vitest";
import { getGithubSourceUrl } from "../lib/github-source-link";

describe("getGithubSourceUrl", () => {
  it("TOR-04-JCORp98: builds the raw githubusercontent URL for a node path", () => {
    expect(getGithubSourceUrl("concepts/example.md")).toBe(
      "https://raw.githubusercontent.com/athandapani/ai-adoption-wiki/master/wiki/concepts/example.md",
    );
  });
});

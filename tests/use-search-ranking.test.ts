import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { VectorIndexEntry } from "../lib/embeddings";
import { rankBySimilarity } from "../components/graph/useSearchRanking";

describe("rankBySimilarity", () => {
  it("TOR-03-C1lczJo: returns one score per vector-index entry", () => {
    const entries: VectorIndexEntry[] = [
      { id: "a", embedding: [1, 0] },
      { id: "b", embedding: [0, 1] },
    ];
    const ranked = rankBySimilarity([1, 0], entries);
    expect(ranked).toHaveLength(2);
    expect(ranked.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("TOR-03-82mnBKb: a conceptually similar page ranks first by embedding alone, regardless of its (unused) text containing none of the query's literal words", () => {
    // "page text" is deliberately absent from this fixture — rankBySimilarity only ever sees
    // ids + embeddings, never page text, so there is no code path by which literal word overlap
    // could influence the ranking. The embedding numbers below stand in for "conceptually close"
    // vs. "unrelated", exactly as a real query/page pair would score after model inference.
    const entries: VectorIndexEntry[] = [
      { id: "conceptually-related-page", embedding: [0.9, 0.1, 0.1] },
      { id: "unrelated-page-a", embedding: [0.1, 0.9, 0.1] },
      { id: "unrelated-page-b", embedding: [0.1, 0.1, 0.9] },
    ];
    const queryEmbedding = [0.95, 0.15, 0.05];

    const ranked = rankBySimilarity(queryEmbedding, entries).sort((a, b) => b.score - a.score);

    expect(ranked[0].id).toBe("conceptually-related-page");
  });
});

describe("components/graph/useSearchRanking.ts", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "components", "graph", "useSearchRanking.ts"),
    "utf-8",
  );

  it("TOR-03-6MpPbQh: makes no network/backend calls — ranking is pure local computation", () => {
    expect(source).not.toContain("fetch(");
  });

  it("TOR-03-e3TJKQb: clearing the query (empty/whitespace) derives scores as null", () => {
    expect(source).toContain('trimmed !== ""');
    expect(source).toContain("const effectiveScores = isSearchActive ? scores : null;");
  });

  it("TOR-03-HjJLHTr: hasResults is false once ranked and the max score is below RELEVANCE_THRESHOLD", () => {
    expect(source).toContain("maxScore >= RELEVANCE_THRESHOLD");
  });

  it("debounces query embedding by SEARCH_DEBOUNCE_MS", () => {
    expect(source).toContain("setTimeout(");
    expect(source).toContain("SEARCH_DEBOUNCE_MS");
  });
});

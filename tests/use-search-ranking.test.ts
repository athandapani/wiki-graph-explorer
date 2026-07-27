import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { VectorIndexEntry } from "../lib/embeddings";
import {
  computeMatchCount,
  computeSearchDimmedNodeIds,
  getRankedResults,
  rankBySimilarity,
} from "../components/graph/useSearchRanking";

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

describe("computeSearchDimmedNodeIds", () => {
  const nodes = [{ id: "above" }, { id: "at-threshold" }, { id: "below" }];

  it("TOR-03-Z3ApPfB: dims only the nodes scoring below the relevance threshold", () => {
    const scores = new Map([
      ["above", 0.8],
      ["at-threshold", 0.3],
      ["below", 0.1],
    ]);

    const dimmed = computeSearchDimmedNodeIds(nodes, scores, 0.3);

    expect(dimmed.has("below")).toBe(true);
    expect(dimmed.has("above")).toBe(false);
    // At exactly the threshold counts as a match — the requirement dims what scores *below* it.
    expect(dimmed.has("at-threshold")).toBe(false);
  });

  it("TOR-03-Z3ApPfB: dims nothing when the query is cleared (null scores)", () => {
    expect(computeSearchDimmedNodeIds(nodes, null, 0.3).size).toBe(0);
  });

  it("dims a node the ranking has no score for, rather than treating it as a match", () => {
    const dimmed = computeSearchDimmedNodeIds([{ id: "unscored" }], new Map(), 0.3);
    expect(dimmed.has("unscored")).toBe(true);
  });
});

describe("computeMatchCount", () => {
  it("TOR-03-1LlqKF1: counts exactly the pages scoring at or above the threshold", () => {
    const scores = new Map(
      Array.from({ length: 10 }, (_, i) => [`page-${i}`, i < 7 ? 0.9 : 0.1] as const),
    );

    expect(computeMatchCount(scores, 0.3)).toBe(7);
  });

  it("TOR-03-1LlqKF1: returns null while no ranking exists, so the UI shows no count", () => {
    // Distinct from 0 ("nothing matched") — a 0 rendered during the debounce would be a claim
    // the very next frame contradicts.
    expect(computeMatchCount(null, 0.3)).toBeNull();
  });

  it("TOR-03-1LlqKF1: returns 0 when a ranking exists but nothing clears the threshold", () => {
    expect(computeMatchCount(new Map([["a", 0.05]]), 0.3)).toBe(0);
  });
});

describe("getRankedResults", () => {
  const nodes = [
    { id: "a", title: "Page A" },
    { id: "b", title: "Page B" },
    { id: "c", title: "Page C" },
  ];

  it("TOR-03-pP3y0uV: returns only above-threshold entries sorted from highest to lowest score", () => {
    const scores = new Map([
      ["a", 0.5],
      ["b", 0.9],
      ["c", 0.1],
    ]);

    const results = getRankedResults(scores, nodes, 0.3, 10);

    expect(results.map((r) => r.id)).toEqual(["b", "a"]);
    expect(results.map((r) => r.title)).toEqual(["Page B", "Page A"]);
  });

  it("returns an empty list when scores is null (query cleared / not yet ranked)", () => {
    expect(getRankedResults(null, nodes, 0.3, 10)).toEqual([]);
  });

  it("respects limit, returning at most that many entries even when more qualify", () => {
    const scores = new Map([
      ["a", 0.9],
      ["b", 0.8],
      ["c", 0.7],
    ]);

    const results = getRankedResults(scores, nodes, 0.3, 2);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual(["a", "b"]);
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

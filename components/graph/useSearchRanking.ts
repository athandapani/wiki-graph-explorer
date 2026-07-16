"use client";

import { useEffect, useRef, useState } from "react";
import { cosineSimilarity } from "../../lib/cosine-similarity";
import type { VectorIndexEntry } from "../../lib/embeddings";

export const RELEVANCE_THRESHOLD = 0.3;
export const SEARCH_DEBOUNCE_MS = 250;

export function rankBySimilarity(
  queryEmbedding: number[],
  entries: VectorIndexEntry[],
): Array<{ id: string; score: number }> {
  return entries.map((entry) => ({
    id: entry.id,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));
}

// Both canvases resolve "is this node dimmed by the current query?" through this one function
// rather than each deciding for itself — the force-directed and swim-lane boards are required to
// dim identically (TOR-03-Z3ApPfB), and duplicated logic is exactly how the swim-lane board ended
// up ignoring search entirely (issue #4 finding A1).
export function computeSearchDimmedNodeIds(
  nodes: Array<{ id: string }>,
  scores: Map<string, number> | null,
  threshold: number,
): Set<string> {
  const dimmed = new Set<string>();
  if (scores == null) {
    return dimmed;
  }
  for (const node of nodes) {
    if ((scores.get(node.id) ?? 0) < threshold) {
      dimmed.add(node.id);
    }
  }
  return dimmed;
}

// Returns null rather than 0 while no ranking exists yet, so the UI can distinguish "still
// computing" from "genuinely nothing matched" and avoid flashing a count that is about to be
// contradicted.
export function computeMatchCount(
  scores: Map<string, number> | null,
  threshold: number,
): number | null {
  if (scores == null) {
    return null;
  }
  let count = 0;
  for (const score of scores.values()) {
    if (score >= threshold) {
      count++;
    }
  }
  return count;
}

interface UseSearchRankingResult {
  query: string;
  setQuery: (query: string) => void;
  scores: Map<string, number> | null;
  isSearchActive: boolean;
  hasResults: boolean;
  matchCount: number | null;
}

export function useSearchRanking(vectorIndex: VectorIndexEntry[]): UseSearchRankingResult {
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<Map<string, number> | null>(null);
  const requestIdRef = useRef(0);

  const trimmed = query.trim();
  const isSearchActive = trimmed !== "";

  useEffect(() => {
    if (trimmed === "") {
      // Invalidate any in-flight request rather than calling setState synchronously here —
      // the empty-query case is instead handled below by deriving effectiveScores from
      // isSearchActive, so no state write is needed on this path.
      requestIdRef.current++;
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(() => {
      void (async () => {
        const { embedQuery } = await import("../../lib/query-embedding");
        const queryEmbedding = await embedQuery(trimmed);
        if (requestIdRef.current !== requestId) {
          return;
        }
        const ranked = rankBySimilarity(queryEmbedding, vectorIndex);
        setScores(new Map(ranked.map(({ id, score }) => [id, score])));
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [trimmed, vectorIndex]);

  const effectiveScores = isSearchActive ? scores : null;
  const maxScore = effectiveScores ? Math.max(0, ...Array.from(effectiveScores.values())) : 0;
  // While isSearchActive but effectiveScores is still null (debounce/embedding in flight), treat
  // as "has results" so the no-results message doesn't flash before the first ranking resolves.
  const hasResults = !isSearchActive || effectiveScores === null || maxScore >= RELEVANCE_THRESHOLD;
  const matchCount = computeMatchCount(effectiveScores, RELEVANCE_THRESHOLD);

  return { query, setQuery, scores: effectiveScores, isSearchActive, hasResults, matchCount };
}

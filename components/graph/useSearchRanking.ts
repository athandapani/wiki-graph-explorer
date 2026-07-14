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

interface UseSearchRankingResult {
  query: string;
  setQuery: (query: string) => void;
  scores: Map<string, number> | null;
  isSearchActive: boolean;
  hasResults: boolean;
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

  return { query, setQuery, scores: effectiveScores, isSearchActive, hasResults };
}

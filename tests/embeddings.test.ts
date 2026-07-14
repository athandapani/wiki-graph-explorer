import { describe, expect, it } from "vitest";
import { computeEmbedding } from "../lib/embeddings";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

describe("computeEmbedding (real model)", () => {
  it(
    "TOR-01-EsImTv8: given two semantically similar texts and one unrelated text, when embeddings are computed, then the similar pair scores higher cosine similarity than either unrelated pair",
    async () => {
      const [catA, catB, unrelated] = await Promise.all([
        computeEmbedding("The cat sat on the mat."),
        computeEmbedding("A feline rested on the rug."),
        computeEmbedding("Quarterly revenue grew by twelve percent."),
      ]);

      expect(catA.length).toBeGreaterThan(0);
      expect(catA.length).toBe(catB.length);
      expect(catA.length).toBe(unrelated.length);

      const similarPairScore = cosineSimilarity(catA, catB);
      const unrelatedPairScoreA = cosineSimilarity(catA, unrelated);
      const unrelatedPairScoreB = cosineSimilarity(catB, unrelated);

      expect(similarPairScore).toBeGreaterThan(unrelatedPairScoreA);
      expect(similarPairScore).toBeGreaterThan(unrelatedPairScoreB);
    },
    60000,
  );
});

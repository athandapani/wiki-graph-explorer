import { computeEmbedding } from "./embeddings";

export async function embedQuery(query: string): Promise<number[]> {
  return computeEmbedding(query);
}

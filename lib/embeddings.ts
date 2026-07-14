import { pipeline } from "@huggingface/transformers";
import type { PageText } from "./graph-builder";

type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline<"feature-extraction">>>;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

function fakeEmbedding(text: string): number[] {
  const dimensions = 8;
  const vector = new Array<number>(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const bucket = i % dimensions;
    vector[bucket] += text.charCodeAt(i);
  }
  return vector.map((value) => value / 1000);
}

export async function computeEmbedding(text: string): Promise<number[]> {
  if (process.env.WGE_FAKE_EMBEDDINGS === "1") {
    return fakeEmbedding(text);
  }

  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as unknown as ArrayLike<number>);
}

export interface VectorIndexEntry {
  id: string;
  embedding: number[];
}

export async function computeVectorIndexEntries(pageTexts: PageText[]): Promise<VectorIndexEntry[]> {
  const entries: VectorIndexEntry[] = [];
  for (const page of pageTexts) {
    const embedding = await computeEmbedding(page.text);
    entries.push({ id: page.id, embedding });
  }
  return entries;
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computeEmbedding } from "../lib/embeddings";
import { embedQuery } from "../lib/query-embedding";

describe("embedQuery", () => {
  const originalFakeEmbeddings = process.env.WGE_FAKE_EMBEDDINGS;

  beforeEach(() => {
    process.env.WGE_FAKE_EMBEDDINGS = "1";
  });

  afterEach(() => {
    process.env.WGE_FAKE_EMBEDDINGS = originalFakeEmbeddings;
  });

  it("TOR-03-C1lczJo: delegates to computeEmbedding so the query embedding uses the same model/config as the build-time vector-index entries", async () => {
    const query = "change management";
    expect(await embedQuery(query)).toEqual(await computeEmbedding(query));
  });
});

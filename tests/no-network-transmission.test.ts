import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const networkCallCounts = { http: 0, https: 0 };

vi.mock("node:http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:http")>();
  return {
    ...actual,
    request: (...args: unknown[]) => {
      networkCallCounts.http++;
      throw new Error(`http.request should not be called (args: ${JSON.stringify(args[0])})`);
    },
  };
});

vi.mock("node:https", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:https")>();
  return {
    ...actual,
    request: (...args: unknown[]) => {
      networkCallCounts.https++;
      throw new Error(`https.request should not be called (args: ${JSON.stringify(args[0])})`);
    },
  };
});

import { computeVectorIndexEntries } from "../lib/embeddings";
import { buildGraph } from "../lib/graph-builder";
import { writeGraphData } from "../lib/graph-data-writer";
import { walkVault } from "../lib/vault-walker";
import { writeVectorIndex } from "../lib/vector-index-writer";

describe("no network transmission of vault content", () => {
  let vaultDir: string;
  let outputDir: string;
  const originalFakeEmbeddings = process.env.WGE_FAKE_EMBEDDINGS;

  beforeEach(() => {
    process.env.WGE_FAKE_EMBEDDINGS = "1";
    networkCallCounts.http = 0;
    networkCallCounts.https = 0;
    vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-network-vault-"));
    outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-network-out-"));

    fs.writeFileSync(
      path.join(vaultDir, "example.md"),
      "---\ntitle: Example\ntags: [foo]\nstatus: current\n---\n\n## Body\ncontent\n",
    );
  });

  afterEach(() => {
    fs.rmSync(vaultDir, { recursive: true, force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });
    process.env.WGE_FAKE_EMBEDDINGS = originalFakeEmbeddings;
  });

  it("TOR-01-p7AxyYn: given a local vault, when the tool runs, then no network connection is initiated and output is written only to the local output directory", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch should not be called");
    });

    const filePaths = walkVault(vaultDir);
    const { nodes, edges, pageTexts } = buildGraph(vaultDir, filePaths, () => {});
    const entries = await computeVectorIndexEntries(pageTexts);
    writeGraphData(outputDir, nodes, edges, null);
    writeVectorIndex(outputDir, entries);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(networkCallCounts.http).toBe(0);
    expect(networkCallCounts.https).toBe(0);

    expect(fs.existsSync(path.join(outputDir, "graph-data.json"))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, "vector-index.json"))).toBe(true);

    fetchSpy.mockRestore();
  });
});

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/graph/page.tsx", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "graph", "page.tsx"),
    "utf-8",
  );

  it("TOR-01-ly1VpL1: is a client component that fetches graph-data.json and vector-index.json for client-side rendering", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain('fetch("/graph-data.json")');
    expect(source).toContain('fetch("/vector-index.json")');
  });
});

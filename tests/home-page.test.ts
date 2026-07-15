import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("app/page.tsx", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "app", "page.tsx"), "utf-8");

  it("TOR-07-Yp2cVxJ: introduces the tool with a how-to-use write-up and a link into /graph, not the create-next-app boilerplate", () => {
    expect(source).toContain("<Header");
    expect(source).toContain("How to use it");
    expect(source).toContain('href="/graph"');
    expect(source).not.toContain("Create Next App");
    expect(source).not.toContain("create-next-app");
  });
});

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { walkVault } from "../lib/vault-walker";

describe("walkVault", () => {
  let vaultDir: string;

  beforeEach(() => {
    vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-walker-"));
  });

  afterEach(() => {
    fs.rmSync(vaultDir, { recursive: true, force: true });
  });

  it("given a vault with nested subdirectories and a dotdir, when walked, then all .md files are found and dotdir contents are excluded", () => {
    fs.mkdirSync(path.join(vaultDir, "concepts"));
    fs.mkdirSync(path.join(vaultDir, "concepts", "nested"));
    fs.mkdirSync(path.join(vaultDir, ".obsidian"));

    fs.writeFileSync(path.join(vaultDir, "root.md"), "# root");
    fs.writeFileSync(path.join(vaultDir, "concepts", "a.md"), "# a");
    fs.writeFileSync(path.join(vaultDir, "concepts", "nested", "b.md"), "# b");
    fs.writeFileSync(path.join(vaultDir, "concepts", "ignore.txt"), "not markdown");
    fs.writeFileSync(path.join(vaultDir, ".obsidian", "config.md"), "should be excluded");

    const results = walkVault(vaultDir).map((p) => path.relative(vaultDir, p).split(path.sep).join("/"));

    expect(results.sort()).toEqual(["concepts/a.md", "concepts/nested/b.md", "root.md"].sort());
  });
});

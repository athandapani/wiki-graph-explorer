import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { countRawSources, walkVault } from "../lib/vault-walker";

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

describe("countRawSources", () => {
  let parentDir: string;
  let wikiDir: string;

  beforeEach(() => {
    parentDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-vault-parent-"));
    wikiDir = path.join(parentDir, "wiki");
    fs.mkdirSync(wikiDir);
  });

  afterEach(() => {
    fs.rmSync(parentDir, { recursive: true, force: true });
  });

  it("TOR-01-vhBOpOz: given a sibling raw/ directory with 3 Markdown files, when counted, then returns 3", () => {
    const rawDir = path.join(parentDir, "raw");
    fs.mkdirSync(rawDir);
    fs.writeFileSync(path.join(rawDir, "a.md"), "a");
    fs.writeFileSync(path.join(rawDir, "b.md"), "b");
    fs.writeFileSync(path.join(rawDir, "c.md"), "c");

    expect(countRawSources(wikiDir)).toBe(3);
  });

  it("TOR-01-gi1qoBS: given no sibling raw/ directory, when counted, then returns null", () => {
    expect(countRawSources(wikiDir)).toBeNull();
  });

  it("TOR-01-gYbfrvE: given a sibling raw/ directory that exists but contains no Markdown files, when counted, then returns 0", () => {
    fs.mkdirSync(path.join(parentDir, "raw"));

    expect(countRawSources(wikiDir)).toBe(0);
  });
});

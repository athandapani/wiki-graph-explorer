import { describe, expect, it } from "vitest";
import { parseArgs } from "../lib/cli";

describe("parseArgs", () => {
  it("TOR-01-LplbdUv: given an unrecognized flag, when parsed, then it is an invalid invocation (exit code 2)", () => {
    const result = parseArgs(["--bogus-flag"]);
    expect(result.mode).toBe("error");
    if (result.mode === "error") {
      expect(result.exitCode).toBe(2);
    }
  });

  it("TOR-01-Z0d0o1e: given no args, when parsed, then the message names --vault as required and exit code is 2", () => {
    const result = parseArgs([]);
    expect(result.mode).toBe("error");
    if (result.mode === "error") {
      expect(result.message).toContain("--vault is required");
      expect(result.exitCode).toBe(2);
    }
  });

  it("TOR-01-igqi4aJ: given no --vault flag, when parsed, then no vault path is ever returned and exit code is 2", () => {
    const result = parseArgs(["--version", "--vault"]);
    // "--vault" present with no following value must not be treated as a usable path either.
    expect(result.mode).not.toBe("run");

    const noVaultResult = parseArgs([]);
    expect(noVaultResult.mode).toBe("error");
    if (noVaultResult.mode === "error") {
      expect(noVaultResult.exitCode).toBe(2);
    }
    // No 'run' mode result means no vaultPath was ever produced for this invocation.
    expect("vaultPath" in noVaultResult).toBe(false);
  });

  it("given a valid --vault <path>, when parsed, then mode is run with that path", () => {
    const result = parseArgs(["--vault", "/some/path"]);
    expect(result).toEqual({ mode: "run", vaultPath: "/some/path" });
  });

  it("given --version, when parsed, then mode is version", () => {
    const result = parseArgs(["--version"]);
    expect(result).toEqual({ mode: "version" });
  });
});

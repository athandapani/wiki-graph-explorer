import { describe, expect, it, vi } from "vitest";
import * as logger from "../lib/logger";

describe("logger (TOR-01-ZkmB8Qn)", () => {
  it.each([
    ["DEBUG", logger.debug],
    ["INFO", logger.info],
    ["WARN", logger.warn],
    ["ERROR", logger.error],
  ] as const)(
    "given the tool logs at %s level, when called, then stderr matches the level-prefixed format and stdout is untouched",
    (level, fn) => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      fn("a message");

      expect(stderrSpy).toHaveBeenCalledTimes(1);
      const written = stderrSpy.mock.calls[0][0] as string;
      expect(written).toMatch(/^\[(DEBUG|INFO|WARN|ERROR)\] /);
      expect(written.startsWith(`[${level}] `)).toBe(true);
      expect(stdoutSpy).not.toHaveBeenCalled();

      stderrSpy.mockRestore();
      stdoutSpy.mockRestore();
    },
  );
});

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import { findSecondBrainPathViolations } from "../lib/second-brain-path-check";

const SELF_PATH = "scripts/check-no-second-brain-path.ts";

function main(): void {
  const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf-8" })
    .split("\n")
    .filter((file) => file.length > 0 && file !== SELF_PATH);

  const files = trackedFiles
    .filter((file) => fs.existsSync(file) && fs.statSync(file).isFile())
    .map((file) => ({ path: file, content: fs.readFileSync(file, "utf-8") }));

  const violations = findSecondBrainPathViolations(files);

  if (violations.length > 0) {
    process.stderr.write(
      `Error: found committed file(s) referencing the second-brain private vault's filesystem path:\n${violations
        .map((file) => `  - ${file}`)
        .join("\n")}\nRemove these references before committing.\n`,
    );
    process.exit(1);
  }

  process.stdout.write("No committed files reference the second-brain private vault path.\n");
  process.exit(0);
}

main();

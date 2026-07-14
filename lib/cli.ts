export type ParsedArgs =
  | { mode: "version" }
  | { mode: "error"; exitCode: 1 | 2; message: string }
  | { mode: "run"; vaultPath: string; outDir: string };

const RECOGNIZED_FLAGS = new Set(["--version", "--vault", "--out"]);
const DEFAULT_OUT_DIR = "local-build";

export function parseArgs(argv: string[]): ParsedArgs {
  for (const arg of argv) {
    if (arg.startsWith("--") && !RECOGNIZED_FLAGS.has(arg)) {
      return {
        mode: "error",
        exitCode: 2,
        message: `Error: unrecognized flag '${arg}'. Run with --vault <path> or --version.`,
      };
    }
  }

  if (argv.includes("--version")) {
    return { mode: "version" };
  }

  const vaultFlagIndex = argv.indexOf("--vault");
  if (vaultFlagIndex === -1) {
    return {
      mode: "error",
      exitCode: 2,
      message: "Error: --vault is required. Usage: build-graph --vault <path>",
    };
  }

  const vaultPath = argv[vaultFlagIndex + 1];
  if (!vaultPath) {
    return {
      mode: "error",
      exitCode: 2,
      message: "Error: --vault is required. Usage: build-graph --vault <path>",
    };
  }

  const outFlagIndex = argv.indexOf("--out");
  const outDir = outFlagIndex === -1 ? DEFAULT_OUT_DIR : argv[outFlagIndex + 1] || DEFAULT_OUT_DIR;

  return { mode: "run", vaultPath, outDir };
}

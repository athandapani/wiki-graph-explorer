export type ParsedArgs =
  | { mode: "version" }
  | { mode: "error"; exitCode: 1 | 2; message: string }
  | { mode: "run"; vaultPath: string; outDir: string; serve: boolean; port: number };

const RECOGNIZED_FLAGS = new Set(["--version", "--vault", "--out", "--serve", "--port"]);
const DEFAULT_OUT_DIR = "local-build";
const DEFAULT_PORT = 4173;

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

  const serve = argv.includes("--serve");

  const portFlagIndex = argv.indexOf("--port");
  let port = DEFAULT_PORT;
  if (portFlagIndex !== -1) {
    const portValue = argv[portFlagIndex + 1];
    const parsedPort = Number(portValue);
    if (!portValue || !Number.isInteger(parsedPort) || parsedPort <= 0) {
      return {
        mode: "error",
        exitCode: 2,
        message: `Error: --port requires a positive integer. Got '${portValue ?? ""}'.`,
      };
    }
    port = parsedPort;
  }

  return { mode: "run", vaultPath, outDir, serve, port };
}

# Epic 41CLei9 — Implemented

## What Was Built

Bootstrapped the project scaffold (Next.js + TypeScript + Tailwind + ESLint via `create-next-app`,
plus Vitest/`tsx` for the CLI test/run path) and implemented the build tool's CLI operability
contract: `--version`, stamped INFO startup logging, the DEBUG/INFO/WARN/ERROR stderr-only
logging convention, 0/1/2 exit-code discipline, strict `--vault`-required validation with no
fallback path, and user-facing error messages that name the problem and the next action. Vault
walking and real `graph-data.json` content are out of scope — a stub `{ nodes: [], edges: [] }`
write satisfies the output-contract TOR until Epic rTWYZfw adds real parsing.

## Key Files

| File | Change |
|------|--------|
| `package.json` | Created via scaffold; renamed to `wiki-graph-explorer`, added `build:graph`/`test`/`typecheck` scripts, `vitest`/`tsx` devDependencies |
| `app/`, `public/`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `next-env.d.ts` | Created — Next.js/TS/Tailwind/ESLint scaffold |
| `vitest.config.ts` | Created — node-environment test config, `tests/**/*.test.ts` |
| `lib/logger.ts` | Created — `debug`/`info`/`warn`/`error`, all writing `[LEVEL] ...` to stderr only |
| `lib/cli.ts` | Created — `parseArgs()`; recognizes `--version`/`--vault`, requires explicit `--vault`, never defaults |
| `scripts/build-graph.ts` | Created — CLI entry point; version reporting, startup log stamp, vault-path validation, stub `graph-data.json` write, exit codes |
| `tests/logger.test.ts` | Created — TOR-01-ZkmB8Qn |
| `tests/cli.test.ts` | Created — `parseArgs` unit tests for TOR-01-LplbdUv, TOR-01-Z0d0o1e, TOR-01-igqi4aJ |
| `tests/build-graph.test.ts` | Created — process-spawn integration tests for all 8 TOR IDs |
| `.gitignore` | Updated — added `*.tsbuildinfo`, `next-env.d.ts`, `.vercel` (stock Next.js scaffold entries; existing `node_modules/`, `.next/`, `out/`, `local-build/`, `coverage/` entries already covered the rest) |

## Spec Deviations

None. All 8 TOR IDs implemented exactly as written.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-01-Oequ51V | PASS | `scripts/build-graph.ts:16-19`; test `tests/build-graph.test.ts` "TOR-01-Oequ51V" |
| TOR-01-pWeHInR | PASS | `scripts/build-graph.ts:26` (info() called first, before any other stderr write in the run path); test `tests/build-graph.test.ts` "TOR-01-pWeHInR" |
| TOR-01-ZkmB8Qn | PASS | `lib/logger.ts:3-4` (all four levels route through the same `[LEVEL] ` stderr-only writer); test `tests/logger.test.ts` |
| TOR-01-LplbdUv | PASS | `lib/cli.ts:9-17` (unrecognized flag → exit 2), `scripts/build-graph.ts:21-24`; test `tests/cli.test.ts` + `tests/build-graph.test.ts` "TOR-01-LplbdUv" |
| TOR-01-Z0d0o1e | PASS | `lib/cli.ts:23-30` (message contains "--vault is required", exitCode 2); test `tests/cli.test.ts` + `tests/build-graph.test.ts` "TOR-01-Z0d0o1e" |
| TOR-01-847tYDS | PASS | `scripts/build-graph.ts:44-46` (single stdout line, exact pattern); test `tests/build-graph.test.ts` "TOR-01-847tYDS" |
| TOR-01-FPff1RV | PASS | `scripts/build-graph.ts:30-35` (both required substrings, exit 1); test `tests/build-graph.test.ts` "TOR-01-FPff1RV" |
| TOR-01-igqi4aJ | PASS | `lib/cli.ts:23-39` (no vault path is ever produced without an explicit `--vault <path>` in `argv`; no default/env/cache read anywhere in `lib/cli.ts` or `scripts/build-graph.ts`); test `tests/cli.test.ts` + `tests/build-graph.test.ts` "TOR-01-igqi4aJ" |

## Verification Results

| Gate | Result |
|------|--------|
| `npm run build` | PASS — `next build` compiles and prerenders successfully |
| `npm test` | PASS — 16/16 tests passing across 3 test files |
| `npm run lint` | PASS — no output, no errors |
| `npm run typecheck` | PASS — `tsc --noEmit` clean |
| `playwright-cli` UI verification | N/A — this epic has no UI surface (CLI-only) |

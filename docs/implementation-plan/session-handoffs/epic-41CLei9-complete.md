# Epic 41CLei9: CLI Foundation & Build Tool Hygiene — Complete

**Completed:** 2026-07-14
**Verified by:** Independent review via `/peak-workflow:wrapup-epic 41CLei9`

## What Was Built

Bootstrapped the project scaffold (Next.js + TypeScript + Tailwind + ESLint) and implemented
the build tool's CLI operability contract: `--version`, stamped INFO startup logging, the
DEBUG/INFO/WARN/ERROR stderr-only logging convention, 0/1/2 exit-code discipline, strict
`--vault`-required validation with no fallback, and user-facing error messages that name the
problem and the next action. Vault walking and real `graph-data.json` content are out of scope
for this epic — a stub `{ nodes: [], edges: [] }` write satisfies the output-contract TOR until
Epic rTWYZfw adds real parsing.

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Version single source of truth; `build:graph`/`test`/`typecheck` scripts |
| `lib/logger.ts` | DEBUG/INFO/WARN/ERROR structured logger, stderr-only, `[LEVEL] ...` format |
| `lib/cli.ts` | `parseArgs()` — recognizes `--version`/`--vault`, requires explicit `--vault`, never defaults |
| `scripts/build-graph.ts` | CLI entry point — version reporting, startup log stamp, vault-path validation, stub `graph-data.json` write, exit codes |
| `tests/logger.test.ts` | Logging convention coverage (TOR-01-ZkmB8Qn) |
| `tests/cli.test.ts` | `parseArgs` unit tests (TOR-01-LplbdUv, TOR-01-Z0d0o1e, TOR-01-igqi4aJ) |
| `tests/build-graph.test.ts` | Process-spawn integration tests for all 8 TOR IDs |

## Key Decisions

- Vault-walking/frontmatter parsing deliberately deferred to Epic rTWYZfw — this epic only
  establishes the CLI operability skeleton (version, logging, exit codes, error messaging)
  that later build-pipeline epics run inside of.
- `--version` short-circuits before any startup log line is emitted, so it stays silent on
  stderr — consistent with TOR-01-pWeHInR's Given clause (`--vault`-argument invocations only).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-Oequ51V | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:34 |
| TOR-01-pWeHInR | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:40 |
| TOR-01-ZkmB8Qn | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/logger.test.ts:4 |
| TOR-01-LplbdUv | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/cli.test.ts:5, tests/build-graph.test.ts:63 |
| TOR-01-Z0d0o1e | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/cli.test.ts:13, tests/build-graph.test.ts:68 |
| TOR-01-847tYDS | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:46 |
| TOR-01-FPff1RV | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:55 |
| TOR-01-igqi4aJ | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/cli.test.ts:22, tests/build-graph.test.ts:74 |

## Verification Summary

### Counts
- TOR Requirements: 8/8 PASS, 0 CANNOT VERIFY
- Quality Gates: 3/3 PASS (build, lint, typecheck) — 1 N/A (playwright-cli; no UI surface)
- Tests: 16 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-01-igqi4aJ — `--vault` is strictly required with no fallback; confirmed by code inspection (no default/env/cache path anywhere in `lib/cli.ts`) and by tests asserting no `graph-data.json` mutation on omission (`lib/cli.ts:23-39`, `tests/build-graph.test.ts`)
- ✅ TOR-01-pWeHInR — startup INFO log is provably the first stderr write (readVersion/parseArgs don't log; `logger.info` is called before any other stderr write in the run path) — `scripts/build-graph.ts:26`
- ✅ TOR-01-FPff1RV — error message names both the problem ("vault path not found") and the next action ("Check --vault points to a valid wiki directory"), exit 1 — `scripts/build-graph.ts:30-35`
- ✅ TOR-01-847tYDS — stdout carries exactly one build-confirmation line matching the required regex; all else routes to stderr — `scripts/build-graph.ts:44-46`
- ✅ TOR-01-ZkmB8Qn — all four log levels funnel through one stderr-only writer, verified by a parametrized test spying on both streams — `lib/logger.ts:3-4`

### Conclusion
All 8 TOR IDs are independently confirmed by both a passing test that faithfully mirrors the
Given/When/Then and direct source inspection showing the cited line ranges actually implement
the behavior. Quality gates are clean. This epic deliberately stubs `graph-data.json` as
`{nodes: [], edges: []}` — vault-walking is out of scope here and is spec'd for Epic rTWYZfw,
consistent with both the epic spec and design docs.

### Manual verification performed: Yes
Ran `npm run build:graph -- --vault <path>` by hand against a real vault and inspected the
emitted `graph-data.json` and CLI stdout/stderr output.

## Known Issues / Follow-ups

- None. Vault walking, frontmatter parsing, and real graph content are intentionally deferred
  to Epic rTWYZfw per this epic's declared scope.

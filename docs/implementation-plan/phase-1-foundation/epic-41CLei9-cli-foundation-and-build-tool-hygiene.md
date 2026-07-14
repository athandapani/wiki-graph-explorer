# Epic 41CLei9: CLI Foundation & Build Tool Hygiene

**Phase:** 1 — Foundation
**Status:** Not Started
**Dependencies:** None

---

## Description

Scaffold the build-time CLI tool (`scripts/build-graph.ts`) and establish the tool-hygiene
conventions declared in `CLAUDE.md` — version exposure, startup log stamping, the four-level
logging convention, exit-code discipline, stdout/stderr separation, and user-facing error
messaging. This epic produces no graph or search behavior yet; it establishes the operable
skeleton every later build-pipeline epic runs inside of, so `--vault`/`--version` invocation,
logging, and error paths are correct before any vault-parsing logic is added.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|-----------------|
| TOR-01-Oequ51V | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall report its name and semantic version to standard output when invoked with --version, exiting with code 0 |
| TOR-01-pWeHInR | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit a log line at startup containing its name and semantic version at INFO level |
| TOR-01-ZkmB8Qn | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit log records at the levels DEBUG, INFO, WARN, and ERROR in human-readable prefixed plain-text format written to standard error |
| TOR-01-LplbdUv | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall exit with code 0 on success, code 1 on operational failure, and code 2 on invalid invocation |
| TOR-01-Z0d0o1e | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall reject invocation without a --vault argument with exit code 2 and a usage hint |
| TOR-01-847tYDS | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall write primary build output confirmation to standard output and shall write diagnostics, progress, and log output to standard error |
| TOR-01-FPff1RV | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit user-facing error messages to standard error that name the problem and name the next user action |
| TOR-01-igqi4aJ | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall require an explicit --vault path argument for every invocation and shall never fall back to a default or previously used vault path |

## Key Components

### Backend (build tool)

- `scripts/build-graph.ts` — CLI entry point; arg parsing for `--vault` and `--version`; wires
  exit-code handling (0/1/2)
- `lib/logger.ts` — DEBUG/INFO/WARN/ERROR structured logger, human-readable `[LEVEL] ...`
  format, writes exclusively to stderr
- `lib/cli.ts` — argument validation, usage hints, and the error-message standard (names the
  problem and the next user action)
- `package.json` — `version` field as the single source of truth for the version string
  surfaced by `--version` and the startup log line; `build:graph` npm script entry

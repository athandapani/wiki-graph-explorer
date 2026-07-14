# Epic rTWYZfw: Vault Walking & Graph Data Generation

**Phase:** 2 — Build Pipeline
**Status:** Not Started
**Dependencies:** Epic 41CLei9 (CLI Foundation & Build Tool Hygiene)

---

## Description

Implement the core vault-parsing logic that walks every Markdown file under the `--vault` path,
parses Karpathy-pattern YAML frontmatter (`title`, `tags`, `status`, `Related`, `Referenced By`),
and emits `graph-data.json` — the node/edge artifact the `/graph` page later fetches client-side.
This is the heart of the "generic, point-at-a-repo tool" goal (Product Vision §5): it must handle
real-world vault messiness (malformed frontmatter, empty vaults) gracefully, derive folder
taxonomy from directory structure, and collapse directional `Related`/`Referenced By` links into
single undirected edges — all with zero tool-code changes required per vault.

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
| TOR-01-NTPrx23 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall walk every Markdown file under the vault path and parse its YAML frontmatter (title, tags, status, Related, Referenced By) into a node record |
| TOR-01-IBry2Oi | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall collapse directional Related and Referenced By frontmatter links between two pages into a single undirected edge in graph-data.json |
| TOR-01-aqsjUxj | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall assign each node a folder/taxonomy value derived from the page's directory path within the vault |
| TOR-01-dEUM3Pp | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall skip a Markdown file with missing or malformed frontmatter, emit a WARN log identifying the file, and continue processing the remaining vault |
| TOR-01-6H0EK6c | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall produce zero nodes and zero edges in graph-data.json, without error, when run against a vault directory containing no Markdown files |
| TOR-01-cqloSLI | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall write graph-data.json as a single valid JSON document containing top-level nodes and edges arrays |
| TOR-01-FFu6OJ3 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall regenerate graph-data.json and vector-index.json fully on every run, with no incremental/partial update |

## Key Components

### Backend (build tool)

- `lib/vault-walker.ts` — recursive Markdown file discovery under the `--vault` path
- `lib/frontmatter-parser.ts` — YAML frontmatter parsing (`title`, `tags`, `status`, `Related`,
  `Referenced By`); malformed-frontmatter detection and WARN-and-continue handling
- `lib/graph-builder.ts` — node record construction, folder/taxonomy derivation from directory
  path, and directional-link collapse into single undirected edges
- `lib/graph-data-writer.ts` — `graph-data.json` serialization (full regeneration every run, no
  incremental state)

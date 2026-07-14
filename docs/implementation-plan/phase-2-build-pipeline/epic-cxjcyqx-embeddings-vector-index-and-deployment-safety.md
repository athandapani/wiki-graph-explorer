# Epic cxjcyqx: Embeddings, Vector Index & Deployment Safety

**Phase:** 2 — Build Pipeline
**Status:** Not Started
**Dependencies:** Epic rTWYZfw (Vault Walking & Graph Data Generation)

---

## Description

Complete the build pipeline by computing per-page embeddings (title/body/tags) into
`vector-index.json`, and lock in the safe-by-construction deployment boundary that is a headline
MVP success criterion (Product Vision §5): the tool must never transmit vault content over the
network, the production build configuration must hardcode the public-vault path with no override
mechanism, and the repository must never contain a committed reference to the private
`second-brain` vault's filesystem path. This epic also delivers the Next.js static-export
packaging that makes `graph-data.json`/`vector-index.json` deployable with no server runtime.
The specific embedding mechanism is an **open risk** (ConOps §8) — this epic must either resolve
it via a spike or explicitly flag it as unresolved before implementation, per `CLAUDE.md`'s
instruction not to silently pick an approach mid-epic.

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
| TOR-01-EsImTv8 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall compute a precomputed embedding for each vault page's title, body, and tags and write it to vector-index.json alongside the page id |
| TOR-01-p7AxyYn | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall write its output assets only to the local path specified by the user and shall never transmit vault content to any network destination |
| TOR-01-5d0lrAs | `docs/requirements/01-build-pipeline.feature.md` | The deployed production build configuration shall reference a single hardcoded --vault path pointing at the dedicated public vault, with no build-time flag or environment variable able to override it |
| TOR-01-lgzWfrv | `docs/requirements/01-build-pipeline.feature.md` | The repository shall never contain a committed file referencing the second-brain private vault's filesystem path |
| TOR-01-uY4K5t1 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall include newly added vault pages in graph-data.json and vector-index.json on the next run without any tool-code changes |
| TOR-01-ly1VpL1 | `docs/requirements/01-build-pipeline.feature.md` | The build pipeline shall support producing a full Next.js static export that embeds the current graph-data.json and vector-index.json, deployable with no server runtime |

## Key Components

### Backend (build tool)

- `lib/embeddings.ts` — per-page embedding computation over title/body/tags (mechanism subject
  to the open risk noted above — resolve or explicitly flag before implementation)
- `lib/vector-index-writer.ts` — `vector-index.json` serialization, keyed by page id matching
  `graph-data.json` node ids
- `next.config.js` — `output: 'export'` static export configuration
- CI/CD build configuration (e.g. `.github/workflows/deploy.yml`) — hardcoded public-vault
  `--vault` path with no overriding flag or environment variable
- Repository-wide check (lint rule or CI grep step) ensuring no committed file references the
  `second-brain` private vault's filesystem path

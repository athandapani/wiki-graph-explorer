# Epic Dj3m8aH: Node Description & Source-Count Emission

**Phase:** 5 — Core Interaction Fixes
**Status:** Not Started
**Dependencies:** None

---

## Description

Extend the build tool to emit two new pieces of data into `graph-data.json`: a per-page
`description` (frontmatter `description:` with a first-body-paragraph fallback) and a top-level
`meta.sourceCount` counting the vault's ingested `raw/` entries. These feed the side panel's page
summary (Epic nQJ8Ofz) and the stats footer's provenance clause (Epic TakRqyO) respectively, so this
epic gates both.

The `raw/` sibling is a convention of this project's own vaults, not a constraint the tool imposes on
vaults it renders — the tool's headline claim is that any Karpathy-pattern wiki builds with zero
per-vault code changes (Product Vision §5). So `meta.sourceCount` is `null` when no `raw/` sibling
exists and `0` when one exists but is empty; the two are deliberately distinct, because `0` asserts
"ingested zero sources", a fact the tool cannot know when the directory is simply absent.

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
| TOR-01-FQuBqe1 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit a description field on each node in graph-data.json sourced from that page's frontmatter description field when present |
| TOR-01-r0LGd50 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall fall back to a page's first body paragraph as the node description when the page's frontmatter declares no description field |
| TOR-01-l3K1BGM | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit an empty description for a page that has neither a frontmatter description nor any body paragraph, without error and without omitting the node |
| TOR-01-vhBOpOz | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit a top-level meta.sourceCount field in graph-data.json reporting the number of raw source entries ingested into the vault |
| TOR-01-gi1qoBS | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit meta.sourceCount as null and continue the build when no sibling raw directory exists for the given vault path |
| TOR-01-gYbfrvE | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall emit meta.sourceCount as 0 when a sibling raw directory exists for the given vault path but contains no Markdown files |

## Key Components

### Backend

- `lib/frontmatter-parser.ts` — surface the optional `description:` frontmatter key
- `lib/graph-builder.ts` — description resolution: frontmatter value, else first body paragraph with inline Markdown stripped and headings/wikilinks excluded, else empty string
- `lib/vault-walker.ts` — locate the `raw/` directory sibling to the `--vault` path and count its Markdown entries
- `lib/graph-data-writer.ts` — emit `description` per node and the top-level `meta.sourceCount` (null / 0 / N)

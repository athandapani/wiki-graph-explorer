# Epic 0utMknV: Generic Wikilink Vault-Parsing

**Phase:** 2 — Build Pipeline
**Status:** Not Started
**Dependencies:** Epic rTWYZfw (Vault Walking & Graph Data Generation)

---

## Description

Broaden the build tool's vault-parsing beyond this project's own bespoke `## Related`/`## Referenced
By` H2-heading convention (established in Epic rTWYZfw) so it works generically against
real-world Obsidian/PKM vaults, which scatter `[[wikilinks]]` freely through ordinary prose with
no such heading convention (Product Vision §5 Cycle 5, ConOps Scenario 16). Edge extraction moves
from a heading-gated scan of `lib/frontmatter-parser.ts#extractWikilinks()` to a full-body scan,
link resolution moves from exact-id matching to case-insensitive filename/title matching, and the
frontmatter parser becomes tolerant of vaults with no `status` field and of `tags` written as a
string or inline `#hashtag`s rather than only a YAML array. The change is additive and
backward-compatible by construction: the existing `second-brain` and `ai-adoption-wiki` vaults'
heading-scoped wikilinks are a strict subset of what the generalized full-body scan finds, so no
vault migration is required.

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
| TOR-01-jCHtzGb | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall extract [[Page Name]] wikilinks found anywhere in a page's Markdown body as graph edges, not only within '## Related' or '## Referenced By' sections |
| TOR-01-DPjgHwE | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall produce at least the same edge set for a vault using the '## Related'/'## Referenced By' body-section convention as the previous heading-gated extractor produced |
| TOR-01-7lCwTjk | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall resolve a [[Page Name]] wikilink against any note in the vault whose filename or frontmatter title matches, case-insensitively, regardless of folder |
| TOR-01-OgWxAs0 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall resolve an ambiguous wikilink — one matching more than one note's filename or title — to the first such note encountered during the vault walk, deterministically |
| TOR-01-kCxBFeS | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall recognize '![[Page Name]]' embed syntax and exclude it from graph edges |
| TOR-01-lgSvch6 | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall silently drop a wikilink whose target note does not exist in the vault, logging the skip at DEBUG level only |
| TOR-01-HbBhSDW | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall assign a neutral 'unknown' status to a node whose page frontmatter declares no status field, without error |
| TOR-01-ffBGE8z | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall normalize a page's tags frontmatter written as a comma-separated or space-separated string into the same tags array shape used for YAML list tags |
| TOR-01-TsGnx0g | `docs/requirements/01-build-pipeline.feature.md` | The build tool shall extract inline '#hashtag' tags from a page's Markdown body and merge them into that page's tags array |

## Key Components

### Backend (build tool)

- `lib/frontmatter-parser.ts` — retire the heading-gated `extractWikilinks(body, heading)`
  function; add a full-body wikilink scanner that finds `[[Page Name]]` / `[[Page Name|Alias]]`
  anywhere in the body (superset of the old heading-scoped scan) and excludes `![[Page Name]]`
  embed syntax; extend `parseFrontmatter()` to default `status` to `"unknown"` when absent and to
  normalize `tags` from a comma/space-separated string; add inline `#hashtag` extraction from the
  body, merged into the tags array.
- `lib/graph-builder.ts` — replace exact-id link matching with a case-insensitive filename/title
  lookup built once per build (covers TOR-01-7lCwTjk); apply a deterministic first-encountered
  tie-break for ambiguous title matches (TOR-01-OgWxAs0); route unresolved wikilinks through a new
  DEBUG-level log call (`lib/logger.ts#debug`) instead of silently dropping with no signal, keeping
  the existing `warn` callback reserved for malformed frontmatter.
- `scripts/build-graph.ts` — thread a `logger.debug` callback into `buildGraph()` alongside the
  existing `logger.warn` callback.

### Tests

- `lib/frontmatter-parser.test.ts` / `lib/graph-builder.test.ts` (or equivalent existing test
  files) — regression fixtures covering the existing `second-brain`/`ai-adoption-wiki`-style
  heading-scoped vaults (TOR-01-DPjgHwE) alongside new fixtures for plain-prose Obsidian-style
  vaults with no `## Related`/`## Referenced By` headings, missing `status`, string/hashtag tags,
  embeds, and unresolved links.

# Epic iv5GPN9: External Vault Wiring & Verification

**Phase:** 8 — Demo Vault & Public Release
**Status:** Not Started
**Dependencies:** Epic Dj3m8aH (description and meta.sourceCount emission)

---

## Description

Retarget the build and source links from the in-repo `public-vault/` placeholder to the external
`ai-adoption-wiki` vault, which is authored in a separate session, and verify the vault this repo is
handed actually conforms to what the build needs.

The vault moving out of this repo breaks two shipped assumptions. CI runs `--vault public-vault/wiki`
and GitHub Actions checks out only this repository, so a sibling directory does not exist in the
runner — the workflow needs the vault repo checked out explicitly. And `lib/github-source-link.ts`
hardcodes `athandapani/wiki-graph-explorer` + `public-vault/wiki`, so every source link would point at
a repo that no longer holds the pages; fixing the A3 path join alone would not help while the URL aims
at the wrong repository.

This epic verifies rather than authors the vault: `ai-adoption-wiki` owns its own content. But the
build hard-depends on that content's shape — `description:` frontmatter, `## Related` /
`## Referenced By` wikilinks, and a `raw/` directory holding one entry per ingested source — so a
malformed vault must fail loudly here rather than surface as blank panels, a sparse board, or a
provenance sentence with a source count nobody can trust in production. **TOR-01-5d0lrAs is
re-verified**, not newly implemented: it was satisfied by Epic cxjcyqx against the very `deploy.yml`
line this epic rewrites, so its evidence goes stale the moment the vault path changes. The
no-override property must still hold in the new cross-repo topology.

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
| TOR-10-RJsxsqn | `docs/requirements/10-demo-vault.feature.md` | The demo-vault ingestion shall produce one raw entry in the public vault's raw directory for each source link in the author-provided deep-research Markdown file |
| TOR-10-sFT4xQU | `docs/requirements/10-demo-vault.feature.md` | The public vault shall build into a graph whose node and edge counts demonstrate demo-scale density rather than the placeholder vault's near-empty board |
| TOR-10-WYqcBSs | `docs/requirements/10-demo-vault.feature.md` | The demo-vault ingestion shall produce interlinked wiki pages carrying title, tags, status, and description frontmatter with Related and Referenced By wikilink sections |
| TOR-10-pNUhGW1 | `docs/requirements/10-demo-vault.feature.md` | The public vault shall contain only original research content, with no confidential organizational, family, or health material from the private second-brain vault |
| TOR-01-5d0lrAs | `docs/requirements/01-build-pipeline.feature.md` | The deployed production build configuration shall reference a single hardcoded --vault path pointing at the dedicated public vault, with no build-time flag or environment variable able to override it |

## Key Components

### Backend

- `.github/workflows/deploy.yml` — check out the `ai-adoption-wiki` repo alongside this one; point `--vault` at its `wiki/` directory with no override mechanism (re-verifying TOR-01-5d0lrAs)
- `lib/github-source-link.ts` — retarget `GITHUB_REPO` / `VAULT_SUBPATH` at the vault repo; fix the A3 path join so no duplicated `wiki/wiki` segment is produced
- `scripts/check-no-second-brain-path.ts` — confirm the safety check still covers the new vault wiring
- `public-vault/` — retire the 2-page in-repo placeholder once the external vault is wired
- `npm run build:graph -- --vault ../ai-adoption-wiki/wiki` — verify node/edge counts, that every node carries a non-empty description, that `meta.sourceCount` reads from `../ai-adoption-wiki/raw`, and that `../ai-adoption-wiki/raw`'s entry count matches the number of distinct source links in the author-provided deep-research file (TOR-10-RJsxsqn)

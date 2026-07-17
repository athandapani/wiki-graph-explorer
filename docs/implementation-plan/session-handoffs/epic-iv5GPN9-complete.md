# Epic iv5GPN9: External Vault Wiring & Verification — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic iv5GPN9`

## What Was Built

The build and source-link config now target the external `ai-adoption-wiki` demo vault instead of
the 2-page in-repo `public-vault/` placeholder. `.github/workflows/deploy.yml` checks out
`athandapani/ai-adoption-wiki` as a sibling directory and builds against its `wiki/` folder;
`lib/github-source-link.ts` was retargeted so "View source on GitHub" links point at the vault's
actual repo with no duplicated path segment. A content gap was found and fixed in the vault
itself: none of its 110 pages declared `description:` in frontmatter (required by
`TOR-10-WYqcBSs`) — fixed by promoting each page's existing `## TLDR` line into frontmatter,
committed and pushed on the `ai-adoption-wiki` repo separately from this epic.

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Added a second `actions/checkout@v4` step for `athandapani/ai-adoption-wiki` at `path: ../ai-adoption-wiki`; `--vault` retargeted from `public-vault/wiki` to `../ai-adoption-wiki/wiki` |
| `lib/github-source-link.ts` | `GITHUB_REPO`: `wiki-graph-explorer` → `ai-adoption-wiki`; `VAULT_SUBPATH`: `public-vault/wiki` → `wiki` |
| `tests/github-source-link.test.ts` | Updated URL assertion to match the new owner/repo/subpath |
| `public-vault/` | Removed (2-page placeholder retired) |
| `README.md` | Corrected stale claim that builds deploy from `public-vault/wiki` |
| `../ai-adoption-wiki/wiki/**/*.md` (110 files, separate repo) | Added `description:` frontmatter sourced from each page's `## TLDR` line |

## Key Decisions

- The content fix (adding `description:` to 110 pages) was done as a raw-text line insertion,
  not a `gray-matter` parse+stringify round trip — the latter reformatted the entire frontmatter
  block, producing a far noisier diff than the single-line addition intended.
- `ai-adoption-wiki` being already public (ahead of epic `zeoBwQJ`'s formal `TOR-10-VQAEhzb`
  audit gate) was surfaced to the user and confirmed as fine — single-commit repo of clean public
  research content, nothing to audit. Not re-litigated by this epic.
- `scripts/check-no-second-brain-path.ts` needed no code change — re-verified independently
  during wrapup, still zero violations.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-5d0lrAs | `docs/requirements/01-build-pipeline.feature.md` | PASS | `.github/workflows/deploy.yml:38` inspection |
| TOR-10-RJsxsqn | `docs/requirements/10-demo-vault.feature.md` | PASS | `../ai-adoption-wiki/log.md`, `raw/2026-07/` (44 files) |
| TOR-10-sFT4xQU | `docs/requirements/10-demo-vault.feature.md` | PASS WITH EXCEPTIONS (Spec Deviation) | real build output, re-run independently |
| TOR-10-WYqcBSs | `docs/requirements/10-demo-vault.feature.md` | PASS | content inspection (0/110 missing frontmatter) |
| TOR-10-pNUhGW1 | `docs/requirements/10-demo-vault.feature.md` | PASS | content spot-check across all 4 folders |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS (1 with a documented Spec Deviation)
- Quality Gates: 4/4 PASS (lint, typecheck, build, vault-safety check)
- Tests: 236 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-01-5d0lrAs — `.github/workflows/deploy.yml:38` contains a single literal `--vault ../ai-adoption-wiki/wiki` string, no override mechanism
- ✅ TOR-10-RJsxsqn — independently confirmed: `raw/2026-07/` contains exactly 44 files, `log.md` records "43/43 references, 44 raw files"
- ✅ TOR-10-sFT4xQU — independently re-ran the real build: 110 nodes, 553 edges, 0 empty descriptions, `meta.sourceCount: 44` — reproduces the implementer's reported numbers exactly
- ✅ TOR-10-WYqcBSs — independently confirmed 0/110 pages missing frontmatter fields, 110/110 have `## Related`
- ✅ TOR-10-pNUhGW1 — spot-checked content across all 4 folders; uniformly public research, no private material
- ⚠️ `docs/design-notes.md` §10 still describes the old `--vault public-vault/wiki` value — deferred to Step 4 doc refresh

### Conclusion
All 5 TORs are independently confirmed against real code and a freshly re-run build against the
actual external vault, not just the implementer's self-reported numbers. The one Spec Deviation
is correctly documented rather than silently rewritten into the feature file, and the substantive
thresholds it verifies are unaffected. Sufficient for sign-off.

### Manual verification performed: No

## Known Issues / Follow-ups

- `TOR-04-Pc0DlQe` (every "View source on GitHub" link resolves HTTP 200 for an anonymous
  visitor) remains epic `zeoBwQJ`'s responsibility — it depends on `wiki-graph-explorer` itself
  going public, which hasn't happened yet.
- `TOR-10-VQAEhzb` / `TOR-10-vaZLdHp` (formal history audit + visibility flip for
  `wiki-graph-explorer` itself) remain epic `zeoBwQJ`'s responsibility.
- `docs/design-notes.md` §10 and the `github-source-link.ts` rationale section need updating for
  the new vault path — handled by this wrapup's Step 4 automated doc refresh.

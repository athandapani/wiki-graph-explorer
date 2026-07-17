# Epic iv5GPN9: External Vault Wiring & Verification — Implemented

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
  block (flow arrays → block arrays, plain date strings → ISO timestamps), producing a far
  noisier diff than the single-line addition intended. The final approach preserves every
  original line byte-for-byte and only appends one new `description: "..."` line before the
  closing `---`.
- The persisted description text is byte-identical to what `lib/frontmatter-parser.ts`'s
  `extractFirstBodyParagraph` would have derived at build time anyway (the fix script reused that
  exact extraction logic), so this change is purely a frontmatter-completeness fix, not a content
  change to what visitors would have seen either way.
- `ai-adoption-wiki` being already public (ahead of epic `zeoBwQJ`'s formal `TOR-10-VQAEhzb`
  audit gate) was surfaced to the user and confirmed as fine — single-commit repo of clean public
  research content, nothing to audit. Not re-litigated by this epic; `TOR-10-VQAEhzb` remains
  `zeoBwQJ`'s TOR.
- `scripts/check-no-second-brain-path.ts` needed no code change — its pattern matches literal
  `second-brain` path segments, unrelated to vault location. Re-ran it against the new wiring;
  still zero violations.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-5d0lrAs | `docs/requirements/01-build-pipeline.feature.md` | PASS | `.github/workflows/deploy.yml` inspection |
| TOR-10-RJsxsqn | `docs/requirements/10-demo-vault.feature.md` | PASS | `../ai-adoption-wiki/log.md`, `raw/2026-07/` inspection |
| TOR-10-sFT4xQU | `docs/requirements/10-demo-vault.feature.md` | PASS WITH EXCEPTIONS (Spec Deviation) | real build output |
| TOR-10-WYqcBSs | `docs/requirements/10-demo-vault.feature.md` | PASS | content inspection post-fix |
| TOR-10-pNUhGW1 | `docs/requirements/10-demo-vault.feature.md` | PASS | content spot-check |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|-----------------|--------|
| TOR-10-sFT4xQU | Given/When clause cites `--vault public-vault/wiki` | Verified against `--vault ../ai-adoption-wiki/wiki` | The vault was externalized to a separate repo by this epic's own explicit scope (Key Components: "retire the 2-page in-repo placeholder once the external vault is wired"). The literal path string predates that decision; the substantive thresholds (node/edge/description counts) are unchanged and are what's actually verified. |

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-01-5d0lrAs | `docs/requirements/01-build-pipeline.feature.md` | PASS | `.github/workflows/deploy.yml`: single literal `--vault ../ai-adoption-wiki/wiki` string, no env var or `inputs:` capable of overriding it |
| TOR-10-RJsxsqn | `docs/requirements/10-demo-vault.feature.md` | PASS | `../ai-adoption-wiki/log.md`: "43/43 references, 44 raw files" — 44 raw entries = 43 cited sources + the playbook document itself; `raw/2026-07/` contains exactly 44 `.md` files |
| TOR-10-sFT4xQU | `docs/requirements/10-demo-vault.feature.md` | PASS (see Spec Deviation above) | Real build: `npm run build:graph -- --vault ../ai-adoption-wiki/wiki` → `graph-data.json`: 110 nodes (≥40 ✓), 553 edges (≥60 ✓), 0 nodes with empty description (✓), `meta.sourceCount: 44` |
| TOR-10-WYqcBSs | `docs/requirements/10-demo-vault.feature.md` | PASS | Post-fix: 0/110 pages missing `description:` frontmatter (was 110/110 before this epic's content fix); `title`/`tags`/`status` confirmed present in every sampled page; `## Related` present in all 110 pages (`grep -rl` count) |
| TOR-10-pNUhGW1 | `docs/requirements/10-demo-vault.feature.md` | PASS | Spot-checked pages across `concepts/`, `entities/`, `sources/`, `synthesis/` — uniformly AI-adoption research content with full source attribution, no personal/family/health/org-private material found. Per the TOR's own note, final responsibility for this rests with author review before commit — this epic's check is a supporting spot-check, not a substitute for that review. |

## Verification Results

- `npx vitest run tests/github-source-link.test.ts` — PASS (1/1)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (236/236)
- `npm run check:vault-safety` — PASS, zero violations
- `npm run build:graph -- --vault ../ai-adoption-wiki/wiki` (real vault, scratch output, never
  committed) — `Wrote graph-data.json (110 nodes, 553 edges)`; `meta.sourceCount: 44`; 0 nodes
  with empty description

## Known Issues / Follow-ups

- `TOR-04-Pc0DlQe` (every "View source on GitHub" link resolves HTTP 200 for an anonymous
  visitor) remains epic `zeoBwQJ`'s responsibility — it depends on `wiki-graph-explorer` itself
  going public (`TOR-10-vaZLdHp`), which hasn't happened yet. This epic only fixed the URL
  construction (no duplicated path segment); end-to-end resolution is unverified until the
  `wiki-graph-explorer` repo is public.
- `TOR-10-VQAEhzb` / `TOR-10-vaZLdHp` (formal history audit + visibility flip for
  `wiki-graph-explorer` itself) remain epic `zeoBwQJ`'s responsibility. `ai-adoption-wiki`'s own
  early public visibility was reviewed and accepted during this epic (see Key Decisions) but that
  review is not a substitute for `zeoBwQJ`'s formal process on the `wiki-graph-explorer` repo.
- The `ai-adoption-wiki` content fix (`description:` frontmatter, 110 pages) is committed and
  pushed on that repo's `master` (commit `e19fae5`) — a cross-repo change made in service of this
  epic's `TOR-10-WYqcBSs`, done with explicit user confirmation before pushing.

# Epic Dj3m8aH: Node Description & Source-Count Emission — Complete

**Completed:** 2026-07-16
**Verified by:** Independent review via `/peak-workflow:wrapup-epic Dj3m8aH`

## What Was Built

The build tool now emits two new pieces of data into `graph-data.json`: a per-page `description`
(sourced from frontmatter `description:`, falling back to the page's first body paragraph with
inline Markdown stripped, or `""` when neither exists) and a top-level `meta.sourceCount` counting
the vault's ingested `raw/` sibling entries (`null` when no sibling `raw/` exists, `0` when empty,
`N` otherwise). This is a pure data-emission epic with no UI surface — it gates the side panel's
page summary (Epic nQJ8Ofz) and the stats footer's provenance clause (Epic TakRqyO).

## Key Files

| File | Purpose |
|------|---------|
| `lib/frontmatter-parser.ts` | Added `description` to `ParsedFrontmatter`; added exported `extractFirstBodyParagraph()` (first-paragraph extraction, heading/bare-wikilink-bullet exclusion, inline markup stripping) |
| `lib/graph-builder.ts` | Resolves `description` per node: frontmatter value, else `extractFirstBodyParagraph` fallback |
| `lib/vault-walker.ts` | Added exported `countRawSources()`, reusing `walkVault` on the sibling `raw/` directory |
| `lib/graph-data-writer.ts` | `writeGraphData()` now writes a top-level `meta: { sourceCount }` object |
| `scripts/build-graph.ts` | Threads `countRawSources(vaultPath)` into `writeGraphData()` |

## Key Decisions

- Bare-wikilink bullet lines (`- [[foo|Foo]]`) are excluded from paragraph detection, not just
  headings — caught by the epic's own `TOR-01-l3K1BGM` test before this review, which initially
  failed because such lines were leaking stripped text into the description.
- `countRawSources` reuses the existing `walkVault` recursion rather than a separate counting
  routine, so the `raw/` sibling and the wiki directory can't drift in how they count `.md` files.
- No new dependency was added for Markdown stripping — a small self-contained regex helper
  (`stripInlineMarkdown`) handles wikilinks, standard links, bold, and italic.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-FQuBqe1 | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-01-r0LGd50 | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-01-l3K1BGM | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts, tests/build-graph.test.ts |
| TOR-01-vhBOpOz | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/vault-walker.test.ts, tests/build-graph.test.ts |
| TOR-01-gi1qoBS | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/vault-walker.test.ts, tests/build-graph.test.ts |
| TOR-01-gYbfrvE | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/vault-walker.test.ts, tests/build-graph.test.ts |

## Verification Summary

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, typecheck, build, test — no UI changed, no playwright pass needed)
- Tests: 183 passed, 0 skipped, 0 failed (35 test files)

### Highlights
- ✅ TOR-01-FQuBqe1 — frontmatter description threaded through (`lib/frontmatter-parser.ts:26`, `lib/graph-builder.ts`); live-verified against `../second-brain/wiki` — 41/41 real nodes emitted a non-empty description.
- ✅ TOR-01-r0LGd50 — `extractFirstBodyParagraph` reproduces the TOR's own fixture exactly; live-verified zero leftover Markdown syntax across all 41 real descriptions.
- ✅ TOR-01-l3K1BGM — bare-wikilink-bullet exclusion bug caught and fixed by its own test during implementation.
- ✅ TOR-01-vhBOpOz / TOR-01-gi1qoBS / TOR-01-gYbfrvE — `countRawSources` live-verified: `meta.sourceCount: 6` matched the actual `.md` count under `../second-brain/raw` exactly.

### Conclusion
All 6 TORs are confirmed by test (183/183 passing) and by live inspection of real build output against the actual `second-brain` vault, not a fixture. The implementation reuses existing recursion/parsing primitives rather than introducing parallel logic. No blocking issues found.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/architecture.md`'s Backend Architecture module table doesn't yet mention `description`/`meta.sourceCount`/`countRawSources` — stale as of this epic; corrected by the automatic doc refresh that follows this handoff.

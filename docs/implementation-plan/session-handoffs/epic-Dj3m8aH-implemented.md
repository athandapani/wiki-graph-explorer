# Epic Dj3m8aH: Node Description & Source-Count Emission — Implemented

## What Was Built

Extended the build tool to emit two new pieces of data into `graph-data.json`: a per-page
`description` (sourced from frontmatter `description:`, falling back to the page's first body
paragraph with inline Markdown stripped, or `""` when neither exists) and a top-level
`meta.sourceCount` counting the vault's ingested `raw/` sibling entries (`null` when no sibling
`raw/` directory exists, `0` when it exists but is empty, `N` otherwise). Both gate downstream UI
epics (`nQJ8Ofz`'s side-panel summary, `TakRqyO`'s stats-footer provenance clause) with no UI
surface of their own.

## Key Files

| File | Change |
|---|---|
| `lib/frontmatter-parser.ts` | Added `description: string` to `ParsedFrontmatter` (trimmed frontmatter value, `""` if absent). Added exported `extractFirstBodyParagraph()`: collects the first contiguous block of non-blank, non-heading, non-bare-wikilink-bullet lines after frontmatter, strips inline wikilinks/links/emphasis via a new `stripInlineMarkdown()` helper, returns `""` if no such block exists |
| `lib/graph-builder.ts` | Added `description: string` to `NodeRecord`; resolves `parsed.description \|\| extractFirstBodyParagraph(parsed.body)` per node |
| `lib/vault-walker.ts` | Added exported `countRawSources(vaultPath)`: locates the sibling `raw/` directory (`path.dirname(vaultPath) + "/raw"`) and reuses the existing `walkVault()` recursive `.md` count; returns `null` if the sibling doesn't exist |
| `lib/graph-data-writer.ts` | `writeGraphData()` now takes a 4th `sourceCount: number \| null` argument and writes a top-level `meta: { sourceCount }` object |
| `scripts/build-graph.ts` | Calls `countRawSources(vaultPath)` and threads the result into `writeGraphData()` |
| `tests/frontmatter-parser.test.ts` | **New** — unit tests for the `description` field and `extractFirstBodyParagraph()` (heading/wikilink exclusion, inline markup stripping, empty-body case) |
| `tests/vault-walker.test.ts` | **New** — `countRawSources()` unit tests for the N/null/0 cases |
| `tests/build-graph.test.ts` | Extended `writePage()` helper with an optional `description` frontmatter field; added CLI integration tests for all 6 TORs; updated the existing JSON-shape test to assert `meta` is present |
| `tests/no-network-transmission.test.ts` | Updated the `writeGraphData()` call site for the new 4th argument (`null`) |

## Key Decisions

- **Bare-wikilink bullet lines are excluded from paragraph detection**, not just headings. The
  TOR's "only headings and wikilinks" case (`## Related\n- [[foo|Foo]]`) initially leaked the
  bullet's stripped text (`"- Foo"`) into the description before this was caught by the
  `TOR-01-l3K1BGM` unit test — a line matching `^[-*+]?\s*\[\[...\]\]\s*$` (i.e., a bullet whose
  entire content is one wikilink) is now treated as a structural boundary like a heading or blank
  line, consistent with how `## Related`/`## Referenced By` sections are already parsed elsewhere
  in this codebase (`extractWikilinks`).
- **`countRawSources` reuses `walkVault` rather than a separate counting routine** — the `raw/`
  sibling is walked with the exact same recursive `.md`-discovery and dotdir-skipping semantics
  already tested for the wiki directory itself, so the two counting behaviors can't drift apart.
- **No new dependency for Markdown stripping.** `stripInlineMarkdown()` is a small self-contained
  regex helper (wikilinks, standard links, bold, italic) rather than pulling in a Markdown AST
  library, matching the project's existing minimal-dependency footprint for this module.

## Spec Deviations

None. All six TORs were implemented as written.

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-01-FQuBqe1 | PASS | `tests/frontmatter-parser.test.ts`, `tests/build-graph.test.ts` | `lib/frontmatter-parser.ts`, `lib/graph-builder.ts` — verified against the real `second-brain` vault: all 41 nodes received a non-empty description, frontmatter-sourced where present |
| TOR-01-r0LGd50 | PASS | `tests/frontmatter-parser.test.ts`, `tests/build-graph.test.ts` | `lib/frontmatter-parser.ts::extractFirstBodyParagraph` — reproduces the TOR's own "Change Management" fixture verbatim; verified against real vault data with zero leftover Markdown syntax (`[[`, `**`, `](`) in any of the 41 emitted descriptions |
| TOR-01-l3K1BGM | PASS | `tests/frontmatter-parser.test.ts`, `tests/build-graph.test.ts` | `lib/frontmatter-parser.ts::extractFirstBodyParagraph` — bare-wikilink-bullet exclusion fix (see Key Decisions); node still emitted, exit code 0 |
| TOR-01-vhBOpOz | PASS | `tests/vault-walker.test.ts`, `tests/build-graph.test.ts` | `lib/vault-walker.ts::countRawSources` — live-verified: `../second-brain/raw` (6 real `.md` files) produced `meta.sourceCount: 6` exactly |
| TOR-01-gi1qoBS | PASS | `tests/vault-walker.test.ts`, `tests/build-graph.test.ts` | `lib/vault-walker.ts::countRawSources` — returns `null` and exit code 0 when no sibling `raw/` exists |
| TOR-01-gYbfrvE | PASS | `tests/vault-walker.test.ts`, `tests/build-graph.test.ts` | `lib/vault-walker.ts::countRawSources` — returns `0` and exit code 0 for an existing-but-empty sibling `raw/` |

## Verification Results

- `npm test` — PASS (35 test files, 183 tests; 14 new tests added for this epic)
- `npm run lint` — PASS (no output/errors)
- `npx tsc --noEmit` — PASS (no output/errors; also caught and fixed a stale 3-argument
  `writeGraphData()` call in `tests/no-network-transmission.test.ts`)
- `npm run build` — PASS (`next build`, static export succeeded, `/` and `/graph` prerendered)
- `npm run build:graph -- --vault ../second-brain/wiki` — PASS. Real vault (41 nodes, 96 edges,
  matching the count already documented in `docs/design-notes.md` §12). Manually inspected
  `local-build/graph-data.json` (gitignored, not committed): all 41 nodes carry a non-empty
  `description` with no leftover Markdown syntax; `meta.sourceCount` is `6`, matching the actual
  count of `.md` files under `../second-brain/raw`.
- No UI changed by this epic, so no `playwright-cli` pass was needed.

## Known Issues / Follow-ups

None identified during this epic's implementation or verification.

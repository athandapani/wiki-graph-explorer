# Epic 0utMknV: Generic Wikilink Vault-Parsing — Implemented

## What Was Built

Generalized the build tool's vault-parsing beyond this project's own bespoke `## Related`/`##
Referenced By` H2-heading convention so it works against real-world Obsidian/PKM vaults. Edge
extraction now scans a page's entire Markdown body for `[[wikilinks]]` (not just specific
headings), resolves targets by case-insensitive filename/title match instead of exact-id match,
excludes `![[embed]]` syntax, and drops unresolved links silently with a DEBUG-only log. Frontmatter
parsing now tolerates a missing `status` field (defaults to `"unknown"`) and accepts `tags` as a
YAML array, a comma/space-separated string, or inline `#hashtag`s in the body.

## Key Files

| File | Change |
|---|---|
| `lib/frontmatter-parser.ts` | Added `extractAllWikilinks()` (full-body scan, embed-excluding via negative lookbehind), removed the retired heading-gated `extractWikilinks()`; added `normalizeTags()` helper and inline-hashtag extraction; `parseFrontmatter()` now defaults `status` to `"unknown"` |
| `lib/graph-builder.ts` | Replaced exact-id edge resolution with a case-insensitive id/title `resolutionMap` (first-write-wins tie-break); wired `extractAllWikilinks()` into link collection; added optional `debug` callback (default no-op) that logs unresolved wikilinks |
| `scripts/build-graph.ts` | Threaded `logger.debug` into the `buildGraph()` call alongside the existing `logger.warn` |
| `tests/frontmatter-parser.test.ts` | Replaced `extractWikilinks` test block with `extractAllWikilinks`; added tests for TOR-01-jCHtzGb, TOR-01-kCxBFeS, TOR-01-HbBhSDW, TOR-01-ffBGE8z, TOR-01-TsGnx0g |
| `tests/graph-builder.test.ts` | Added `debugSpy`/`debugCalls` fixture alongside existing `warnSpy`; added tests for TOR-01-DPjgHwE, TOR-01-7lCwTjk, TOR-01-OgWxAs0, TOR-01-lgSvch6 |

## Spec Deviations

None — all 9 TOR IDs implemented exactly as specified, no Given/When/Then adjustments required.

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-01-jCHtzGb | PASS | `tests/frontmatter-parser.test.ts:129` | `lib/frontmatter-parser.ts:76,147` (`ALL_WIKILINKS_PATTERN`, `extractAllWikilinks`) |
| TOR-01-DPjgHwE | PASS | `tests/graph-builder.test.ts:101` | `lib/graph-builder.ts:78` (wired into edge extraction); confirmed on real data — `second-brain` vault edge count went 96→104 (superset, not a regression) |
| TOR-01-7lCwTjk | PASS | `tests/graph-builder.test.ts:113` | `lib/graph-builder.ts:87-99` (`resolutionMap`, case-insensitive id/title keys) |
| TOR-01-OgWxAs0 | PASS | `tests/graph-builder.test.ts:125` | `lib/graph-builder.ts:90-98` (`if (!resolutionMap.has(key))` first-write-wins) |
| TOR-01-kCxBFeS | PASS | `tests/frontmatter-parser.test.ts:134` | `lib/frontmatter-parser.ts:76` (negative lookbehind `(?<!!)`) |
| TOR-01-lgSvch6 | PASS | `tests/graph-builder.test.ts:145` | `lib/graph-builder.ts:106-112` (`debug()` call, no `warn`) |
| TOR-01-HbBhSDW | PASS | `tests/frontmatter-parser.test.ts:72` | `lib/frontmatter-parser.ts:63` |
| TOR-01-ffBGE8z | PASS | `tests/frontmatter-parser.test.ts:85` | `lib/frontmatter-parser.ts:19-36` (`normalizeTags`) |
| TOR-01-TsGnx0g | PASS | `tests/frontmatter-parser.test.ts:99` | `lib/frontmatter-parser.ts:17,37-38` (`INLINE_HASHTAG_PATTERN`) |

## Verification Results

| Gate | Result |
|---|---|
| `npm test` | PASS — 397/397 tests, 52/52 files |
| `npm run lint` | PASS — clean (removed a dead `WIKILINK_PATTERN` constant flagged mid-implementation) |
| `npm run typecheck` | PASS — clean |
| `npm run build` | PASS — Next.js static export succeeded |
| `npm run build:graph -- --vault ../second-brain/wiki --out local-build` | PASS — 41 nodes, 104 edges (up from the previously-documented 96 under the old heading-gated extractor — confirms the generalized scan is a strict superset on real data); `status` values sane (`current`/`superseded`); no stray DEBUG/WARN noise; stdout carried only the one-line summary; `local-build/` stayed gitignored, not committed |

No regressions: pre-existing `TOR-01-IBry2Oi`, `TOR-01-NTPrx23`, `TOR-01-aqsjUxj`, `TOR-01-dEUM3Pp`
tests in both `tests/graph-builder.test.ts` and `tests/build-graph.test.ts` pass unmodified.

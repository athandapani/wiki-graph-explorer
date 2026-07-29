# Epic 0utMknV: Generic Wikilink Vault-Parsing — Complete

**Completed:** 2026-07-29
**Verified by:** Independent review via `/peak-workflow:wrapup-epic 0utMknV`

## What Was Built

Generalized the build tool's vault-parsing beyond this project's own bespoke `## Related`/`##
Referenced By` H2-heading convention so it works against real-world Obsidian/PKM vaults. Edge
extraction now scans a page's entire Markdown body for `[[wikilinks]]`, resolves targets by
case-insensitive filename/title match instead of exact-id match, excludes `![[embed]]` syntax, and
drops unresolved links silently with a DEBUG-only log. Frontmatter parsing now tolerates a missing
`status` field (defaults to `"unknown"`) and accepts `tags` as a YAML array, a comma/space-separated
string, or inline `#hashtag`s in the body.

## Key Files

| File | Purpose |
|------|---------|
| `lib/frontmatter-parser.ts` | Added `extractAllWikilinks()` (full-body scan, embed-excluding via negative lookbehind), removed the retired heading-gated `extractWikilinks()`; added `normalizeTags()` helper and inline-hashtag extraction; `parseFrontmatter()` now defaults `status` to `"unknown"` |
| `lib/graph-builder.ts` | Replaced exact-id edge resolution with a case-insensitive id/title `resolutionMap` (first-write-wins tie-break); wired `extractAllWikilinks()` into link collection; added optional `debug` callback (default no-op) that logs unresolved wikilinks |
| `scripts/build-graph.ts` | Threaded `logger.debug` into the `buildGraph()` call alongside the existing `logger.warn` |
| `tests/frontmatter-parser.test.ts` | Replaced `extractWikilinks` test block with `extractAllWikilinks`; added tests for TOR-01-jCHtzGb, TOR-01-kCxBFeS, TOR-01-HbBhSDW, TOR-01-ffBGE8z, TOR-01-TsGnx0g |
| `tests/graph-builder.test.ts` | Added `debugSpy`/`debugCalls` fixture alongside existing `warnSpy`; added tests for TOR-01-DPjgHwE, TOR-01-7lCwTjk, TOR-01-OgWxAs0, TOR-01-lgSvch6 |

## Key Decisions

- Wikilink resolution keys are built once per build from vault-walk order, keyed by lowercased id
  and lowercased title, with first-write-wins on collision — gives a deterministic tie-break for
  ambiguous same-titled notes without needing a stable sort or secondary heuristic.
- Unresolved wikilinks are logged at DEBUG (not WARN) since broken links are an ordinary
  occurrence in real-world PKM vaults, not an operational failure — keeps the existing `warn`
  callback reserved for malformed frontmatter only.
- The full-body wikilink scan is a strict superset of the retired heading-gated scan, so no vault
  migration was required for `second-brain` or `ai-adoption-wiki`; confirmed by re-running the
  build against `second-brain` (96→104 edges, same 41 nodes).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-jCHtzGb | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts:129 |
| TOR-01-DPjgHwE | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:101 |
| TOR-01-7lCwTjk | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:113 |
| TOR-01-OgWxAs0 | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:125 |
| TOR-01-kCxBFeS | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts:134 |
| TOR-01-lgSvch6 | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:145 |
| TOR-01-HbBhSDW | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts:72 |
| TOR-01-ffBGE8z | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts:85 |
| TOR-01-TsGnx0g | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/frontmatter-parser.test.ts:99 |

## Verification Summary

### Counts
- TOR Requirements: 9/9 PASS
- Quality Gates: 4/4 PASS
- Tests: 397 passed, 0 skipped, 0 failed (52/52 files)

### Highlights
- ✅ TOR-01-jCHtzGb / TOR-01-kCxBFeS — full-body wikilink scan with embed exclusion via negative lookbehind, confirmed by both unit tests and real-data build (lib/frontmatter-parser.ts:76,147)
- ✅ TOR-01-7lCwTjk / TOR-01-OgWxAs0 — case-insensitive id/title resolution map with deterministic first-write-wins tie-break (lib/graph-builder.ts:88-100)
- ✅ TOR-01-lgSvch6 — unresolved wikilinks drop silently with DEBUG-only logging; test explicitly asserts zero WARN calls (tests/graph-builder.test.ts:145-155)
- ✅ TOR-01-DPjgHwE — regression-verified on real data: second-brain vault edge count went 96→104 (strict superset, not a regression), reproduced live during this wrapup
- ✅ TOR-01-HbBhSDW / TOR-01-ffBGE8z / TOR-01-TsGnx0g — optional status defaulting and tag normalization (string, comma-separated, inline hashtag) all covered with matching unit tests

### Conclusion
All 9 TOR requirements are independently confirmed: tests faithfully mirror each Given/When/Then,
source inspection confirms the tests exercise the real code paths, and a live run against the real
`second-brain` vault reproduces the exact node/edge counts (41 nodes, 104 edges) claimed in the
implementation handoff. Sufficient to close the epic.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/architecture.md` / `docs/design-notes.md` still describe the retired heading-gated
  `extractWikilinks()` — refreshed automatically in Step 4 of this wrapup.
- An unrelated, unstaged `README.md` change (adds a live-demo link) was present in the working
  tree during this wrapup — not part of this epic's diff, left untouched.

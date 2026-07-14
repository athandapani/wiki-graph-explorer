# Epic rTWYZfw: Vault Walking & Graph Data Generation — Complete

**Completed:** 2026-07-14
**Verified by:** Independent review via `/peak-workflow:wrapup-epic rTWYZfw`

## What Was Built

The core vault-parsing pipeline: a recursive Markdown walker, a YAML frontmatter parser, a graph
builder that constructs node records (id, title, tags, status, folder) and collapses directional
`Related`/`Referenced By` links into deduplicated undirected edges, and a writer that fully
regenerates `graph-data.json` on every run. Verified end-to-end against the real `second-brain`
wiki (41 nodes, 96 edges, correct folder derivation, zero WARNs).

## Key Files

| File | Purpose |
|------|---------|
| `lib/vault-walker.ts` | Recursive `.md` file discovery under the `--vault` path, skips dotdirs |
| `lib/frontmatter-parser.ts` | YAML frontmatter parsing (gray-matter based) + body-section wikilink extraction for `## Related`/`## Referenced By` |
| `lib/graph-builder.ts` | Node construction, folder/taxonomy derivation, directional-link collection and undirected-edge dedup |
| `lib/graph-data-writer.ts` | Full-overwrite `graph-data.json` serialization |
| `scripts/build-graph.ts` | Wires `walkVault` → `buildGraph` → `writeGraphData` |

## Key Decisions

- `Related`/`Referenced By` are parsed from `## Related`/`## Referenced By` Markdown body sections
  (containing `[[slug|Title]]` wikilinks), not from YAML frontmatter as the TOR wording literally
  states. Verified against the real `second-brain/wiki` vault — every real page stores these links
  as body H2 sections, never frontmatter keys. Implementing the literal TOR wording would produce
  zero edges against real data. User confirmed this deviation via `AskUserQuestion` during
  implementation; independently re-confirmed during this wrapup by reading
  `../second-brain/wiki/concepts/deterministic-compiler-pipeline.md` directly.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-NTPrx23 | `docs/requirements/01-build-pipeline.feature.md` | PASS WITH EXCEPTIONS | tests/graph-builder.test.ts:43, tests/build-graph.test.ts:114 |
| TOR-01-IBry2Oi | `docs/requirements/01-build-pipeline.feature.md` | PASS WITH EXCEPTIONS | tests/graph-builder.test.ts:63, tests/build-graph.test.ts:130 |
| TOR-01-aqsjUxj | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:55, tests/build-graph.test.ts:143 |
| TOR-01-dEUM3Pp | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/graph-builder.test.ts:74, tests/build-graph.test.ts:153 |
| TOR-01-6H0EK6c | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:170 |
| TOR-01-cqloSLI | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:179 |
| TOR-01-FFu6OJ3 | `docs/requirements/01-build-pipeline.feature.md` | PASS | tests/build-graph.test.ts:192 |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS (2 PASS WITH EXCEPTIONS)
- Quality Gates: 4/4 PASS
- Tests: 33 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-01-aqsjUxj, TOR-01-dEUM3Pp, TOR-01-6H0EK6c, TOR-01-cqloSLI, TOR-01-FFu6OJ3 — verified by code inspection, passing tests, and a real-vault run (41 nodes, 96 edges, 5 correct folders, no WARNs)
- ⚠️ TOR-01-NTPrx23 / TOR-01-IBry2Oi — Related/Referenced By sourced from body-section wikilinks rather than frontmatter as the TOR literally states; disclosed, user-approved deviation confirmed correct against real vault data
- ⚠️ `docs/architecture.md:42` still describes Related/Referenced By as frontmatter fields — same stale wording as the TOR text; non-blocking doc-consistency gap

### Conclusion
All 7 TOR requirements are functionally satisfied — reproduced independently against real vault
data rather than trusting the test suite alone. The two exceptions are a disclosed, well-reasoned,
user-approved deviation from the literal Gherkin wording, driven by how the real Karpathy-pattern
vault actually stores links. Sufficient to ship; requirements baseline should be corrected via a
follow-up capture-requirements pass to prevent future drift.

### Manual verification performed: Yes
Spot-checked graph-data.json against second-brain vault — manually opened the generated
graph-data.json and cross-referenced a few nodes/edges against the actual second-brain wiki pages
to confirm correctness.

## Known Issues / Follow-ups

- `docs/requirements/01-build-pipeline.feature.md` (TOR-01-NTPrx23, TOR-01-IBry2Oi) and
  `docs/architecture.md:42` describe `Related`/`Referenced By` as frontmatter fields; reality is
  body-section wikilinks. Recommend a follow-up `/peak-workflow:capture-requirements` (brownfield)
  pass to correct the requirements baseline.

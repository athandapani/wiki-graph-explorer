# Epic rTWYZfw — Implemented

## What Was Built

Replaced the stub `graph-data.json` writer from Epic 41CLei9 with the real vault-parsing
pipeline: a recursive Markdown walker, a frontmatter/wikilink parser, a graph builder that
constructs node records (id, title, tags, status, folder) and collapses directional
`Related`/`Referenced By` links into deduplicated undirected edges, and a writer that fully
regenerates `graph-data.json` on every run.

## Key Files

| File | Change |
|------|--------|
| `lib/vault-walker.ts` | Created — `walkVault()`, recursive `.md` discovery, skips dotdirs |
| `lib/frontmatter-parser.ts` | Created — `parseFrontmatter()` (gray-matter based, returns `null` on missing/malformed YAML), `extractWikilinks()` (parses `## Related`/`## Referenced By` body sections for `[[slug\|Title]]` wikilinks) |
| `lib/graph-builder.ts` | Created — `buildGraph()`: node construction (id = filename without `.md`, folder = vault-relative dirname), directional-link collection, undirected-edge dedup |
| `lib/graph-data-writer.ts` | Created — `writeGraphData()`: full-overwrite JSON serialization |
| `scripts/build-graph.ts` | Modified — wired `walkVault` → `buildGraph` → `writeGraphData` in place of the `{nodes: [], edges: []}` stub |
| `package.json` / `package-lock.json` | Added `gray-matter` dependency |
| `tests/vault-walker.test.ts` | Created — unit tests for recursive walk + dotdir exclusion |
| `tests/frontmatter-parser.test.ts` | Created — TOR-01-NTPrx23, TOR-01-dEUM3Pp unit coverage + wikilink extraction |
| `tests/graph-builder.test.ts` | Created — TOR-01-NTPrx23, TOR-01-aqsjUxj, TOR-01-IBry2Oi, TOR-01-dEUM3Pp unit coverage |
| `tests/build-graph.test.ts` | Extended — CLI-level (spawnSync) integration tests for all 7 new TOR IDs |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|-----------------|--------|
| TOR-01-NTPrx23 | "parse its YAML frontmatter (title, tags, status, Related, Referenced By) into a node record" — implies all 5 fields live in YAML frontmatter | `title`/`tags`/`status` are parsed from YAML frontmatter; `Related`/`Referenced By` are parsed from `## Related`/`## Referenced By` Markdown body sections containing `[[slug\|Title]]` wikilinks | Verified against the real `../second-brain/wiki` vault (the actual Karpathy-pattern data this tool targets) — every real page has `Related`/`Referenced By` as body H2 sections, never as frontmatter keys. Implementing literally would produce zero edges against real data, defeating the tool's purpose. User confirmed this deviation via `AskUserQuestion` during planning this session. |
| TOR-01-IBry2Oi | "collapse directional Related and Referenced By frontmatter links" | Same collapse logic, but sourced from body-section wikilinks rather than frontmatter arrays | Same root cause as above — the Given/When/Then behavior (collapse directional links into one undirected edge) is fully satisfied; only the field's storage location differs from the TOR's literal wording. |

**Follow-up recommended:** run `/peak-workflow:capture-requirements` (brownfield) to correct the
TOR-01-NTPrx23 / TOR-01-IBry2Oi wording in `docs/requirements/01-build-pipeline.feature.md` and
`concept-of-operations.md` to describe `Related`/`Referenced By` as body-section wikilinks rather
than frontmatter fields, so the requirements baseline matches reality going forward.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-01-NTPrx23 | PASS | `lib/graph-builder.ts:41-51`; tests `tests/graph-builder.test.ts` "TOR-01-NTPrx23", `tests/build-graph.test.ts` "TOR-01-NTPrx23" |
| TOR-01-IBry2Oi | PASS | `lib/graph-builder.ts:61-76`; tests `tests/graph-builder.test.ts` "TOR-01-IBry2Oi", `tests/build-graph.test.ts` "TOR-01-IBry2Oi" |
| TOR-01-aqsjUxj | PASS | `lib/graph-builder.ts:42-43`; tests `tests/graph-builder.test.ts` "TOR-01-aqsjUxj", `tests/build-graph.test.ts` "TOR-01-aqsjUxj" |
| TOR-01-dEUM3Pp | PASS | `lib/graph-builder.ts:36-39`; tests `tests/graph-builder.test.ts` "TOR-01-dEUM3Pp", `tests/build-graph.test.ts` "TOR-01-dEUM3Pp" |
| TOR-01-6H0EK6c | PASS | `lib/graph-builder.ts:23-28` (empty filePaths → empty nodes/edges by construction), `scripts/build-graph.ts:40-46`; test `tests/build-graph.test.ts` "TOR-01-6H0EK6c" |
| TOR-01-cqloSLI | PASS | `lib/graph-data-writer.ts:6-9`; test `tests/build-graph.test.ts` "TOR-01-cqloSLI" |
| TOR-01-FFu6OJ3 | PASS | `lib/graph-data-writer.ts:6-9` (full overwrite, no read-modify-merge of prior output); test `tests/build-graph.test.ts` "TOR-01-FFu6OJ3" |

## Verification Results

| Gate | Result |
|------|--------|
| `npm run build` | PASS — `next build` compiles and prerenders successfully |
| `npm test` | PASS — 33/33 tests passing across 6 test files |
| `npm run lint` | PASS — no output, no errors |
| `npm run typecheck` | PASS — `tsc --noEmit` clean |
| Manual verification against real data | PASS — `npm run build:graph -- --vault "../second-brain/wiki"` produced 41 nodes / 96 edges, no WARNs, folders correctly derived (`concepts`, `entities`, `people`, `sources`, `synthesis`), edges correctly deduplicated for reciprocal Related/Referenced By pairs (spot-checked `deterministic-compiler-pipeline`) |
| `playwright-cli` UI verification | N/A — this epic has no UI surface (CLI-only) |

# Epic TBZJM0j: Client-Side Semantic Search — Implemented

**Implemented:** 2026-07-14

## What Was Built

The `/graph` page now has a live search box: typing a query embeds it client-side (reusing the
exact model/config already used to build `vector-index.json`), scores every page by cosine
similarity, and dims non-matching nodes in real time as the visitor types — with no page reload
and no backend call. This is the "not a keyword filter" proof from Product Vision §2 and ConOps
Scenario 2.

## Key Decisions (open-risk resolution)

`docs/design-notes.md` and the epic spec flagged the client-side query-embedding mechanism as an
unresolved technical spike. Resolved this session rather than silently picked:

- **Model reuse, not a new choice**: `lib/query-embedding.ts` delegates directly to the existing
  `computeEmbedding()` in `lib/embeddings.ts` (same `Xenova/all-MiniLM-L6-v2` model, same
  `{pooling: "mean", normalize: true}` config settled by Epic cxjcyqx). This guarantees
  embedding-space parity with `vector-index.json` by construction, not by convention.
- **Browser execution confirmed feasible by design, not guesswork**:
  `node_modules/@huggingface/transformers/package.json`'s `exports` map resolves to
  `dist/transformers.web.js` for any non-Node bundler target — the package is purpose-built by
  Hugging Face for in-browser use. No webpack/Next.js config changes were needed.
- **Main thread + 250ms debounce, not a Web Worker**: justified by scope (portfolio demo, small
  vault, sub-100ms WASM inference on short queries once the model is loaded) — flagged explicitly
  rather than silently decided; can be revisited if perf becomes an issue on a much larger vault.
- **`RELEVANCE_THRESHOLD = 0.3`** (`components/graph/useSearchRanking.ts`): validated empirically
  in a real browser against both the 2-page `public-vault` and the richer 41-page local
  `second-brain` vault (see Verification Results) — a conceptually related query with zero literal
  word overlap correctly surfaced a match with no false "no results", and a nonsense query
  correctly triggered the no-results indicator. No adjustment needed from the initial estimate.
- The `@huggingface/transformers` client bundle stays out of the initial page chunk: it's only
  reached via a dynamic `import()` inside `useSearchRanking`'s debounced effect, mirroring the
  existing `dynamic(() => import(...), { ssr: false })` pattern already used for `GraphCanvas`.

## Key Files

| File | Purpose |
|------|---------|
| `lib/cosine-similarity.ts` | `cosineSimilarity(a, b)` — pure cosine similarity |
| `lib/query-embedding.ts` | `embedQuery()` — thin client-safe wrapper around `computeEmbedding()` |
| `components/graph/useSearchRanking.ts` | `rankBySimilarity()` (pure), `useSearchRanking()` hook — debounced query embedding, live scores, `RELEVANCE_THRESHOLD`, `SEARCH_DEBOUNCE_MS` |
| `components/graph/SearchInput.tsx` | Controlled search box + no-results indicator |
| `components/graph/GraphCanvas.tsx` | Extended with `searchScores`/`relevanceThreshold` props; dims non-matching nodes via `ctx.globalAlpha` |
| `app/graph/page.tsx` | Wires `vector-index.json` (previously fetched and discarded) into `useSearchRanking`, renders `SearchInput` above `GraphCanvas` |
| `tests/cosine-similarity.test.ts`, `tests/query-embedding.test.ts`, `tests/use-search-ranking.test.ts`, `tests/search-input.test.ts` | New TOR coverage |
| `tests/graph-canvas.test.ts`, `tests/graph-page.test.ts` | Extended with new TOR coverage |

## Spec Deviations

None — all 7 TOR IDs implemented as written.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-03-TOtRRhr | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/search-input.test.ts`, `tests/graph-page.test.ts` |
| TOR-03-C1lczJo | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/query-embedding.test.ts`, `tests/cosine-similarity.test.ts`, `tests/use-search-ranking.test.ts` |
| TOR-03-6MpPbQh | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts`, `tests/graph-canvas.test.ts`, live browser session |
| TOR-03-UH4yx26 | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/graph-canvas.test.ts`, live browser session |
| TOR-03-82mnBKb | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts` (fixture proof), live browser session against real embeddings |
| TOR-03-e3TJKQb | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts`, live browser session |
| TOR-03-HjJLHTr | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/search-input.test.ts`, `tests/use-search-ranking.test.ts`, live browser session |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS
- Quality Gates: 4/4 PASS (typecheck, lint, test suite, build)
- Tests: 90/90 passed, 0 skipped, 0 failed

### Highlights
- Real headless-Chromium session (Playwright) against `/graph`, twice: once built from the
  2-page `public-vault`, once from the 41-page local `second-brain` vault (gitignored, not
  committed — never deployed). In both cases: a conceptually related query with zero literal word
  overlap surfaced a real match (no false no-results), a nonsense query correctly showed "No
  closely matching results found.", clearing the input restored all nodes to full opacity, and
  zero console/page errors were observed — confirming the `@huggingface/transformers` browser
  bundle loads and runs cleanly under Next.js's client-side build.
- `npm run build` (static export) succeeds with the new dynamic-import-gated search code present,
  confirming it doesn't break the build-time prerender pass.

### Manual verification performed: Yes
Live Playwright browser sessions (headless Chromium) against a running `next dev` server, driven
by this session — not just automated test suites.

## Known Issues / Follow-ups

- `docs/design-notes.md` §"Client-side query embedding" / "Semantic search UI" still describe this
  as deferred to a future epic — expected to be picked up by a `/peak-workflow:refresh-docs` pass.
- No Web Worker: acceptable at current vault scale per the Key Decisions above; worth revisiting
  if a much larger public vault makes main-thread inference noticeably janky.

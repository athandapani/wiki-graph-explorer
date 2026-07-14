# Epic TBZJM0j: Client-Side Semantic Search — Complete

**Completed:** 2026-07-14
**Verified by:** Independent review via `/peak-workflow:wrapup-epic TBZJM0j`

## What Was Built

The `/graph` page now has a live search box: typing a query embeds it client-side, scores every
page by cosine similarity against its precomputed embedding, and dims non-matching nodes in real
time as the visitor types — with no page reload and no backend call. This is the "not a keyword
filter" proof from Product Vision §2 and ConOps Scenario 2.

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

## Key Decisions

- **Open-risk resolution**: the client-side query-embedding mechanism (flagged in the epic spec
  and `docs/design-notes.md`) was resolved, not silently picked. `lib/query-embedding.ts`
  delegates directly to the existing `computeEmbedding()` (`lib/embeddings.ts`) — same
  `Xenova/all-MiniLM-L6-v2` model, same `{pooling: "mean", normalize: true}` config settled by
  Epic cxjcyqx — guaranteeing embedding-space parity with `vector-index.json` by construction.
- **Browser feasibility confirmed by package design**: `@huggingface/transformers`'s `exports`
  map resolves to `dist/transformers.web.js` for any non-Node bundler target — no webpack/Next.js
  config changes were needed. Verified empirically via `npm run build` (static export succeeds)
  and independently via a live network-request capture: during a search, this app's own origin
  serves only static JS chunks (`onnxruntime-web`, `transformers.web.js`, lib chunks) — no calls
  to a same-origin `/api/*` path. The only external calls are to `huggingface.co`'s public model
  CDN (one-time model-weight download, cached thereafter), not a backend search endpoint.
- **Main thread + 250ms debounce, not a Web Worker**: justified by scope (portfolio demo, small
  vault, sub-100ms WASM inference on short queries once the model is loaded).
- **`RELEVANCE_THRESHOLD = 0.3`**: validated empirically in a live browser against both the
  2-page `public-vault` and the richer 41-page local `second-brain` vault — held up without
  adjustment.
- The `@huggingface/transformers` client bundle stays out of the initial page chunk via a dynamic
  `import()` inside `useSearchRanking`'s debounced effect, mirroring the existing
  `dynamic(() => import(...), { ssr: false })` pattern already used for `GraphCanvas`.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-03-TOtRRhr | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/search-input.test.ts:11`, live browser |
| TOR-03-C1lczJo | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/query-embedding.test.ts`, `tests/use-search-ranking.test.ts:8` |
| TOR-03-6MpPbQh | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts:42`, independent network capture, live browser |
| TOR-03-UH4yx26 | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/graph-canvas.test.ts`, live browser |
| TOR-03-82mnBKb | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts:18`, live browser (real embeddings) |
| TOR-03-e3TJKQb | `docs/requirements/03-semantic-search.feature.md` | PASS | `tests/use-search-ranking.test.ts:46`, live browser |
| TOR-03-HjJLHTr | `docs/requirements/03-semantic-search.feature.md` | PASS WITH EXCEPTIONS | `tests/search-input.test.ts:17`, live browser |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS (1 PASS WITH EXCEPTIONS)
- Quality Gates: 4/4 PASS (lint, typecheck, build, test suite)
- Tests: 90 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-03-TOtRRhr — search input renders above the canvas; confirmed in source and live in a real browser (input's bounding box sits above the canvas's).
- ✅ TOR-03-C1lczJo — query embedding delegates to the existing build-time function; every `vector-index.json` entry is scored.
- ✅ TOR-03-6MpPbQh — independently re-verified with a network-request capture: during a live search, this app's own origin served only static JS chunks, zero calls to any `/api/*` path — the `huggingface.co` calls are the public model CDN fetch, not a backend search endpoint.
- ✅ TOR-03-UH4yx26 / TOR-03-82mnBKb — reproduced live with an independent Playwright session and a different conceptual query than the implementer used: one node stayed fully opaque, the other visibly dimmed, zero literal word overlap between query and page title.
- ✅ TOR-03-e3TJKQb / TOR-03-HjJLHTr — clearing the input restored full opacity and removed the no-results message; a nonsense query correctly triggered "No closely matching results found." Zero console/page errors throughout.
- ⚠️ TOR-03-HjJLHTr — functionally correct and verified live, but the underlying `embedQuery()` call has no `catch` for a failed/unsupported model load; on that failure the UI silently stays in "still searching" state instead of surfacing an error. No TOR describes this failure scenario, so this is not a requirements gap, but is worth a follow-up.

### Conclusion
All 7 TOR Given/When/Then were independently reproduced with fresh Playwright sessions (different
queries than the implementer used) plus an additional network-capture check. The "not a keyword
filter" core claim held up against real embeddings on two different vaults, not just a fixture.
Sufficient to close the epic.

### Manual verification performed: No
Automated gates plus independent live Playwright browser sessions were run by the reviewer in
this session; no additional manual verification was performed by the user beyond that.

## Known Issues / Follow-ups

- No error handling for `embedQuery()` rejection in `useSearchRanking.ts` (offline first visit,
  unsupported browser) — recommend a small follow-up to surface a visible error state instead of
  silently stalling.
- No Web Worker: acceptable at current vault scale; worth revisiting if a much larger public vault
  makes main-thread inference noticeably janky.
- `docs/architecture.md` / `docs/design-notes.md` still describe semantic search as deferred —
  will be corrected by the automatic `/peak-workflow:refresh-docs` pass that follows this handoff.

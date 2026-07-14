# Epic TBZJM0j: Client-Side Semantic Search

**Phase:** 3 — Frontend
**Status:** Not Started
**Dependencies:** Epic baPTSK2 (Graph Canvas Rendering), Epic cxjcyqx (Embeddings, Vector Index & Deployment Safety)

> **Brand:** Use the project's brand guidelines skill for the search input/results treatment if
> one is configured.

---

## Description

Deliver the search box above the graph canvas: client-side query embedding, cosine-similarity
ranking against `vector-index.json`, and live re-ranking/dimming as the visitor types. This is
the epic that proves the "not a keyword filter" claim (Product Vision §2, ConOps Scenario 2) — a
discerning technical evaluator must see a page surface as a top result even when the query's
literal words never appear in that page's text. **Open risk:** the client-side query-embedding
mechanism (ConOps §8) is unresolved as of this writing — `/peak-workflow:start-epic` must either
run a spike (e.g. transformers.js/WASM) to settle it or explicitly surface it to the user before
implementing TOR-03-C1lczJo, rather than silently picking an approach.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|-----------------|
| TOR-03-TOtRRhr | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall provide a visible search input above the graph canvas |
| TOR-03-C1lczJo | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall embed a visitor's typed query client-side and compute cosine similarity against each page's precomputed embedding from vector-index.json |
| TOR-03-6MpPbQh | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall re-rank and visually highlight graph nodes by similarity score in real time as the visitor types, without a page reload or backend call |
| TOR-03-UH4yx26 | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall dim or fade nodes below a relevance threshold out of the active view when a search query is active |
| TOR-03-82mnBKb | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall surface a page as a top-ranked search result when the query is conceptually related to that page's content even if the query's exact words do not appear in the page text |
| TOR-03-e3TJKQb | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall restore the full unfiltered graph view when the visitor clears the search input |
| TOR-03-HjJLHTr | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall display a no-results indication when a query's highest similarity score falls below the relevance threshold for every page |

## Key Components

### Frontend

- `components/graph/SearchInput.tsx` — search box rendered above the graph canvas
- `lib/query-embedding.ts` — client-side query embedding (open risk — resolve mechanism before
  or at the start of this epic; see Description)
- `lib/cosine-similarity.ts` — similarity scoring between query embedding and each
  `vector-index.json` entry
- `components/graph/useSearchRanking.ts` — live re-rank/dim/no-results state driving
  `GraphCanvas.tsx` node highlighting as the visitor types

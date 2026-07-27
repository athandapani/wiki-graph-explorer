# Epic wle4Fpe: Ranked Search Results & Semantic Neighbors

**Phase:** 11 — Search Depth, Tour Robustness & Polish
**Status:** Not Started
**Dependencies:** Epic TBZJM0j (Client-Side Semantic Search), Epic V3PlLFL (Side Panel & Source Transparency)

> **Brand:** Use the project's brand guidelines skill for the results-list and semantic-neighbors
> panel treatment if one is configured.

---

## Description

Search currently proves relevance only by dimming/highlighting the graph and showing a bare
match count (TOR-03-UH4yx26, TOR-03-1LlqKF1) — a visitor can see *how many* pages matched but not
*which* ones without hunting across the canvas. This epic surfaces a ranked, clickable results
list for an active query, and adds a complementary "Semantically similar pages" panel to the side
panel that runs the same embedding-similarity machinery starting from whichever node is currently
selected, rather than from a typed query. Both are new capabilities requested directly by the
user (not sourced from product-vision.md/ConOps — see the TOR sidecars' `source` field) and close
the gap between "the graph re-ranks" and "the visitor can actually read the ranking."

The underlying similarity math already exists and needs no changes: `rankBySimilarity()` in
`components/graph/useSearchRanking.ts` already returns per-node cosine-similarity scores for the
active query, and `cosineSimilarity()` in `lib/cosine-similarity.ts` is the same function that
will drive node-to-node comparisons for the neighbors panel — both source and target embeddings
are already present in `vector-index.json`, so the neighbors panel needs no new embedding
computation.

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
| TOR-03-pP3y0uV | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall display a ranked list of the top matching pages, ordered by descending similarity score, when a search query is active |
| TOR-03-buN9A2Q | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall select a node in the graph and open its side panel detail when a visitor activates an entry in the ranked results list |
| TOR-03-zOzfWVb | `docs/requirements/03-semantic-search.feature.md` | The side panel shall display a "Semantically similar pages" panel listing other pages ranked by embedding cosine similarity to the currently selected node |
| TOR-03-bTe5Zva | `docs/requirements/03-semantic-search.feature.md` | The side panel shall omit the "Semantically similar pages" panel when no other page's similarity score to the selected node meets the relevance threshold |

## Key Components

### Frontend

- `components/graph/SearchInput.tsx` — render a ranked results list (page title, descending
  similarity order) beneath/beside the input when a query is active; each entry click calls
  through to node selection
- `components/graph/useSearchRanking.ts` — `rankBySimilarity()` already returns per-node scores;
  add a helper that joins those scores with node titles (from the loaded `graph-data.json` nodes)
  and returns the sorted top-N list the results list renders
- `components/graph/SidePanel.tsx` — add a "Semantically similar pages" section rendered
  alongside the existing "Connected pages" section (`groupNodesByFolder`/`getRelatedNodeIds`);
  requires a new `vectorIndex` prop so the panel can compute similarity for the selected node
- `lib/cosine-similarity.ts` — reused as-is (`cosineSimilarity()`) for node-to-node comparison;
  no changes needed

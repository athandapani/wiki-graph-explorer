# wiki-graph-explorer — Concept of Operations (ConOps)

**Document Version:** 1.0
**Date:** 2026-07-12
**Status:** Draft

---

## 1. Purpose & Scope

This document is the operational companion to
[product-vision.md](product-vision.md). It describes current-state pain points, the proposed
system's behavior, user roles, detailed operational scenarios, data flows, and constraints for the
wiki-graph-explorer MVP.

## 2. Current State ("As-Is")

| Current Method | Limitation |
|---|---|
| Static portfolio prose/case studies | Depth claims are unverifiable — entirely trust-based |
| Screenshots of the private `second-brain` wiki | Can't be published (privacy risk); even redacted, static images aren't interactive |
| Generic "digital transformation leader" resume language | Doesn't demonstrate applied-AI technical craft specifically |
| No existing public tool for backlink-graph visualization of arbitrary Markdown wikis | Would require a one-off, non-reusable script each time |

**Core pain points:**

1. Depth claims in case studies are unverifiable by a visitor.
2. The vault with real proof of the technique (`second-brain`) is permanently private.
3. No safe, generic tool exists to render a Markdown-wiki backlink graph as a public artifact.
4. Fake "AI search" demos (keyword filters mislabeled as semantic search) are common enough that a
   discerning technical evaluator would penalize rather than credit one.

## 3. Proposed System ("To-Be")

wiki-graph-explorer is a build-time tool + Next.js page. Given a local filesystem path to a
Markdown-wiki repo (Karpathy-pattern frontmatter with `Related`/`Referenced By` links), it emits two
static assets — `graph-data.json` (nodes/edges/folder-taxonomy/status) and a precomputed embedding
vector-index (`vector-index.json`) — fetched client-side by a `/graph` page built on
`react-force-graph`.

Visitors interact directly: clicking a node centers/zooms (~900ms animated) and opens a side panel
with page detail plus a GitHub source link; typing a query into the search box re-ranks and
live-filters the graph via client-side cosine similarity against the precomputed embeddings — no
backend calls after page load.

The deployed instance always points at a dedicated, always-public vault — seeded initially with
original research on AI adoption in medium-sized enterprises (40+ sourced references) — never at
the private `second-brain` vault, which is used only for local, unpublished dev iteration.

## 4. User Roles & Profiles

| Role | Question they bring |
|---|---|
| Recruiter / hiring manager | "Is this applied-AI experience real, or resume padding?" |
| Technical evaluator / peer engineer | "Is the 'semantic search' actually semantic, or a keyword filter with marketing language?" |
| Tool author (dev/maintainer) | "Does this render correctly against messy real-world wiki data before I trust it on the public vault?" |
| Casual visitor | "What is this, and why does exploring a graph matter?" |

## 5. Operational Scenarios

### Scenario 1: Recruiter exploration
**Actor:** Recruiter / hiring manager
**Trigger:** Visitor clicks a "see it live" link (or nav item) from a career case-study page to `/graph`
**Goal:** Verify hands-on applied-AI and engineering depth by exploring a real artifact

**Steps:**
1. Visitor lands on `/graph`; the page fetches `graph-data.json` and `vector-index.json` client-side
2. Force-directed graph renders, nodes colored by folder/taxonomy cluster
3. Visitor hovers over nodes and sees title tooltips
4. Visitor clicks a node; the graph centers and zooms (~900ms) on it
5. Side panel opens showing page detail and a "View source on GitHub" link
6. Visitor explores 3–4 more nodes across different folder clusters
7. Visitor reads the "why build this" explainer section

**Outcome:** Visitor leaves having directly interacted with a real, working artifact demonstrating applied-AI craft, not a static claim

### Scenario 2: Semantic search demo
**Actor:** Technical evaluator
**Trigger:** Visitor notices the search input above the graph canvas on `/graph`
**Goal:** Confirm the search is real semantic matching, not a keyword filter

**Steps:**
1. Visitor types "change management" into the search box
2. Client-side JS embeds the typed query *(open question — see Section 8)*
3. Cosine similarity is computed against the precomputed per-page vector-index
4. Graph nodes are re-ranked/highlighted by similarity score in real time as the visitor types
5. Nodes below a relevance threshold dim or fade out of the active view
6. Visitor clicks a highlighted node to confirm its content is actually about the query topic, not just keyword-adjacent

**Outcome:** Visitor sees live re-ranking that reflects semantic meaning (e.g. a page never containing the literal words "change management" still surfaces if conceptually related), confirming this isn't a keyword filter

### Scenario 3: Node deep-dive
**Actor:** Any visitor
**Trigger:** Visitor clicks a graph node
**Goal:** Read detail on that page's content and verify it's backed by real sourced material

**Steps:**
1. Visitor clicks a node in the graph
2. Graph centers/zooms on the node (~900ms)
3. Side panel slides in showing page title, tags, status dot, and related-node list
4. Side panel shows a "View source on GitHub" link
5. Visitor clicks the GitHub link
6. The raw `.md` file opens in a new tab, showing genuine sourced content/citations
7. Visitor returns to the graph tab; side panel state is preserved

**Outcome:** Visitor confirms the page detail is backed by real, citable source material, not placeholder text

### Scenario 4: Local dev iteration
**Actor:** Tool author
**Trigger:** Author runs the build tool locally pointed at the `second-brain` filesystem path
**Goal:** Validate graph/search quality against rich, messy real data without any publish risk

**Steps:**
1. Author points the CLI at the local `second-brain` filesystem path
2. Tool walks the vault, parses frontmatter, builds `graph-data.json`
3. Tool computes embeddings per page, builds `vector-index.json`
4. Author runs the Next.js dev server locally and opens `/graph`
5. Author clicks through nodes, tests search queries, checks status-dot/folder-coloring against real content
6. Author iterates on the build script or UI based on what breaks against real data
7. Output JSON assets stay in a local/gitignored build directory — never committed or deployed

**Outcome:** Tool is validated against realistic data volume/messiness before ever touching the public vault

### Scenario 5: Public-vault rebuild & publish
**Actor:** Tool author as site maintainer
**Trigger:** Author adds new research pages to the public vault
**Goal:** Get new content live on the deployed graph

**Steps:**
1. Author authors/ingests new research pages into the public vault's `wiki/` directory via the Karpathy-pattern raw→wiki workflow
2. Author sets frontmatter (`title`, `tags`, `status`, `Related`/`Referenced By`) on new pages
3. Author runs the build command pointed at the public vault path
4. Build regenerates `graph-data.json` and `vector-index.json` to include the new pages
5. Author runs the Next.js static export build
6. Author deploys the updated static site
7. Author opens the live `/graph` page and confirms new nodes appear, correctly linked and colored

**Outcome:** New research content is live in the deployed graph with no dynamic backend involved

### Scenario 6: Missing-link discovery
**Actor:** A visitor unfamiliar with the domain, or the author revisiting old content
**Trigger:** Visitor browses the graph's clusters/folders, or filters by status
**Goal:** Understand how a connected knowledge base surfaces missing links and fresh ideas

**Steps:**
1. Visitor reads the "why build this" explainer section describing second-brain benefits
2. Visitor filters/sorts nodes by status (e.g. `dormant`) or by folder
3. Visitor notices a node with very few edges compared to its cluster peers
4. Visitor clicks the under-connected node and reads its content in the side panel
5. Visitor recognizes a concept that logically should connect to other nodes but doesn't yet
6. Visitor walks away with a concrete example of how visualizing the graph reveals a content gap

**Outcome:** The explainer's abstract claim ("visualizing surfaces missing links") is demonstrated concretely through a real example in the live data

## 6. System Interfaces & Data Flows

| Source | Format | Produced By |
|---|---|---|
| Public vault markdown files | `.md` + YAML frontmatter (title, tags, status, Related, Referenced By) | Karpathy-pattern raw→wiki ingestion of AI-in-enterprises research |
| `graph-data.json` | Nodes (id, title, folder/taxonomy, status) + undirected edges | Build-time graph-builder script |
| `vector-index.json` | Per-page precomputed embedding + metadata | Build-time embedding script |
| GitHub source links | URL to raw `.md` per node | Derived from vault repo path at build time |

```
[public vault repo: wiki/*.md]
        │  (local filesystem path input)
        ▼
[wiki-graph-explorer build tool]
    │                  │
    ▼                  ▼
[graph-data.json]  [vector-index.json]
    │                  │
    └────────┬─────────┘
             ▼
   [/graph Next.js page — client-side fetch]
             │
             ▼
[react-force-graph render + cosine-similarity search]
```

## 7. Functional Summary

| Area | Features |
|---|---|
| Graph rendering | Force-directed layout, folder/taxonomy coloring, status dots, undirected edges, click-to-center-zoom (~900ms) |
| Search | Build-time embeddings, static vector-index, client-side cosine similarity, live graph filtering |
| Side panel | Page detail, GitHub source link |
| Explainer | "Why build this" static content section |
| Build pipeline | `graph-data.json` + `vector-index.json` generation from a local vault path |

## 8. Operational Constraints & Assumptions

| Constraint | Description |
|---|---|
| Deployment | Static export (Next.js `output: 'export'`), no server runtime in production |
| Users | Anonymous, unauthenticated visitors; unlisted-URL access model |
| Auth | None for MVP |
| Data freshness | Rebuild-on-publish only |
| Content ownership | Public vault authored via Karpathy-pattern raw→wiki workflow minus confidentiality guardrails — nothing private ever enters this vault |
| Licensing | `react-force-graph` chosen partly to avoid `Cosmograph`'s CC BY-NC 4.0 ambiguity |
| Input scope | Local filesystem path only; no remote-clone support yet |
| **Open risk** | Client-side query embedding (Scenario 2, step 2) has no settled technical approach yet — needs a spike (e.g. transformers.js/WASM) before Scenario 2 is buildable as specified |

## 9. Glossary

| Term | Definition |
|---|---|
| Karpathy pattern | raw/ → wiki/ workflow: raw sources compiled into a maintained wiki by an LLM, human-confirmed |
| Public vault | The always-public wiki content this tool renders in production (AI-in-enterprises research) |
| Node | A single wiki page, rendered as a graph vertex |
| Edge | Undirected link between two pages, collapsed from directional `Related`/`Referenced By` frontmatter |
| Status dot | Per-page engagement/freshness indicator, explicit frontmatter field |
| `graph-data.json` | Static build artifact: nodes/edges/taxonomy/status |
| `vector-index.json` | Static build artifact: precomputed per-page embeddings |
| Rebuild-on-publish | New content requires a rebuild+redeploy; no real-time backend |

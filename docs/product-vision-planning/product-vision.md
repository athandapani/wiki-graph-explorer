# wiki-graph-explorer — Product Vision & Brief

**Document Version:** 1.0
**Date:** 2026-07-12
**Status:** Draft

---

## 1. Product Name

**wiki-graph-explorer** — *"Turn your second-brain's backlinks into a living, explorable graph."*

## 2. Problem Statement

Portfolio sites built around career case studies rely on screenshots and prose to claim applied-AI
depth — but a recruiter or hiring manager has no way to verify that "I built a personal knowledge
system" is real engineering rather than resume language. At the same time, the actual private
knowledge vault (`second-brain`) that would prove it contains org-sensitive and family/health
material that can never be made public — a risk surfaced directly when a large batch of sensitive
Archer and family data landed in that vault in a single session.

There's no existing tool that takes an arbitrary Markdown-wiki repo (Obsidian-style,
Karpathy-pattern backlinks) and turns it into something a stranger can actually click through, zoom
into, and search live — inspired by Nate Herk's "AI Stack, Connected" interactive graph demo, but
generalized into a reusable tool rather than a one-off.

**Current pain points:**

- Static case-study prose/screenshots are unverifiable — no way for a visitor to independently
  confirm depth.
- The rich private vault can never be shown publicly, and "exporting a filtered public subset" is a
  failure-prone step, not a safe one.
- No generic, point-at-a-repo tool exists that renders a live wiki-graph + real semantic search over
  arbitrary Markdown-wiki content.
- Fake "AI search" demos (keyword filters in disguise) are common enough that a discerning
  evaluator would penalize rather than credit one.

## 3. Target Users

| User Group | Primary Need |
|---|---|
| Portfolio-site visitors (recruiters, hiring managers, technical evaluators) | Interact directly with a real artifact to verify applied-AI/engineering depth, not read a claim |
| Tool author (dogfooding user) | Iterate locally against the rich private `second-brain` vault first (best test data, never published), before pointing the same tool at any public vault |
| Future: other wiki/second-brain practitioners (stretch, not MVP) | Point the tool at their own Markdown-wiki repo for an instant explorable graph |

## 4. Vision Statement

wiki-graph-explorer turns any Karpathy-pattern Markdown wiki into a living, explorable graph — a
static-site artifact that any visitor can click, zoom, and semantically search in real time, proving
in seconds what a paragraph of prose can only claim.

## 5. Goals & Success Criteria (MVP)

| Goal | Success Criteria |
|---|---|
| Generic point-at-a-repo tool | Running the tool against a local path to `second-brain` (private, never published) produces a valid `graph-data.json` with zero tool-code changes needed per-vault |
| Live-feeling static graph | Next.js page fetches `graph-data.json` client-side and renders all nodes/edges via `react-force-graph` |
| Click-to-node animation | Clicking a node calls `centerAt`/`zoom` with a ~900ms duration; visually confirmed smooth |
| Real semantic search | Typed query ranks pages by cosine similarity over build-time-precomputed embeddings, live-filtering the graph — not a keyword filter |
| Node grouping + status | Nodes colored by folder taxonomy; status dot (`active`/`revisiting`/`dormant`) visible, sortable, filterable |
| Source transparency | Side panel on node click shows page detail + working link to that page's source on GitHub |
| Safe-by-construction boundary | The deployed instance only ever points at the dedicated public vault; zero path by which private-vault content reaches the built page |

## 6. MVP Scope Summary

- **Graph view**: force-directed layout (`react-force-graph`), node color by folder/taxonomy,
  status-dot per node, `Related`/`Referenced By` collapsed into single undirected edges,
  click-to-center-and-zoom (~900ms)
- **Search**: build-time embeddings per page (title/body/tags) → static vector-index JSON asset;
  client-side cosine-similarity ranking as the user types
- **Side panel**: page detail + GitHub source link on node click
- **Explainer section**: "why build this" — second-brain/dynamic-context benefits, how graph
  visualization surfaces missing links
- **Build pipeline**: static `graph-data.json` + vector-index JSON, fetched client-side;
  rebuild-on-publish, no dynamic backend
- **Input**: local filesystem path only (no git-clone/URL support yet)
- **Verification workflow**: run locally against private `second-brain` first (rich real data,
  output never published) → then point at the dedicated public vault for the real deployed artifact
- **Seed/demo public vault content**: original research on **AI adoption in medium-sized
  enterprises** — target 40+ sourced references, gathered via a dedicated deep-research pass and
  ingested into the vault using the Karpathy-pattern raw→wiki workflow minus confidentiality
  guardrails. Chosen deliberately over movies/hobbies/travel content (the original
  `second-brain-site` plan's placeholder) because it ties directly back into the applied-AI career
  positioning while remaining original research — never confidential org data.

*Cross-cutting concerns:* content isolation (tool only ever deployed against a vault that's
public-by-construction, never a filtered export); placement as a secondary page (e.g. `/graph`), not
the homepage; `react-force-graph` chosen over `sigma.js`/`Cosmograph` partly to sidestep
`Cosmograph`'s CC BY-NC 4.0 license risk on a job-seeking site.

## 7. Out of Scope for MVP

- GitHub-URL / remote-clone input (local filesystem path only, for now)
- Making the graph a homepage/centerpiece (secondary page only)
- A live backend/API for real-time updates (rebuild-on-publish only)
- Password/real authentication (unlisted-URL access model, inherited from the portfolio-site track)
- CMS or dynamic content backend
- Multi-repo/multi-vault rendering in a single graph view
- Any tooling to help *author* vault content beyond the initial research-ingestion pass (this tool
  reads/renders existing wiki content only)
- Career case-study content itself (separate `second-brain-site` portfolio track)

## 8. Key Business Scenarios

1. **Recruiter exploration** — a hiring manager clicks through from a case study to `/graph`,
   explores the live force-directed graph of the AI-in-enterprises research vault, and leaves
   convinced this is a working artifact, not a mockup.
2. **Semantic search demo** — a technical evaluator types a query like "change management" and
   watches the graph live-filter via real cosine-similarity ranking, not keyword matching.
3. **Node deep-dive** — any visitor clicks a node, the side panel opens with page detail and a
   GitHub source link, and they click through to the raw markdown to verify real sourced content.
4. **Local dev iteration** — the tool author runs the tool against a local `second-brain` path to
   iterate on graph/search quality using rich real data, with output never published.
5. **Public-vault rebuild & publish** — the author adds new research pages to the public vault,
   reruns the build, and the new nodes appear in the live deployed graph.
6. **Missing-link discovery** — a visitor reads the "why build this" explainer and notices an
   under-connected node or isolated cluster, illustrating how graph visualization surfaces content
   gaps.

## 9. Design Direction

- Force-directed graph as the primary visual, on a secondary page (`/graph`), not the
  homepage/centerpiece
- Node color-coding by folder/taxonomy cluster, mirroring the reference demo's category clusters
- Status dot (`active`/`revisiting`/`dormant`) as a small distinct indicator — not a rating scale
- Click interactions feel snappy: ~900ms center/zoom, not instant jump-cut, not sluggish
- Side panel slides in without a full page navigation, keeping graph context visible
- Overall aesthetic reads as real webapp engineering (per the companion portfolio-site plan) — not
  a templated digital-garden look

## 10. Data Strategy

Vault content is git-committed Markdown, frontmatter-driven (`Related`/`Referenced By`, `status`,
`tags`). Two static derived artifacts are computed at build time — `graph-data.json` and
`vector-index.json` — both regenerated fully on each build; no database, no incremental updates. No
dynamic backend/CMS: "freshness" means whatever was true at the last deploy. Local dev builds point
at the `second-brain` path for testing only; only builds against the dedicated public vault are ever
deployed.

## 11. Backlog / Future Vision

- GitHub-URL / remote-clone input support (point the tool at any public repo URL, not just a local
  path)
- Homepage/centerpiece graduation if `/graph` proves compelling
- Live backend/API for real-time updates beyond rebuild-on-publish
- Multi-vault/multi-repo comparison view
- Author-side tooling to help populate/curate vault content (currently render-only beyond the
  initial research-ingestion pass)
- Real authentication (e.g. Cloudflare Access) if a non-public mode is ever needed
- Generalizing the taxonomy/status framework for other wiki practitioners to point the tool at
  their own vaults
- Analytics on which nodes/queries visitors actually explore

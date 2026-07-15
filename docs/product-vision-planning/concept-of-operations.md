# wiki-graph-explorer — Concept of Operations (ConOps)

**Document Version:** 1.2
**Date:** 2026-07-15
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

**Cycle 2 As-Is — the shipped MVP `/graph` page vs the "AI Stack, Connected" reference (issue #4
critical review):**

| Shipped Behavior | Gap |
|---|---|
| Semantic search only wired to force-directed canvas | Search does nothing in the default swim-lane view — the headline feature is dead where visitors land (A1) |
| Side panel shows title, raw tags, plain-text related list | Related pages are not clickable (navigation dead end); no description, no folder badge (B4) |
| Panel empty state is one gray sentence | Strongest onboarding real estate wasted; no legend anywhere for folder colors or status dots (B2/B3) |
| Page opens straight into the canvas | No hero/tagline, no invitation to interact, no stats footer (B1/B7) |
| No keyboard handlers | Esc is dead; Options popover backdrop swallows clicks (A4) |
| Fixed `w-80` panel, non-responsive columns | 390px viewport crushes the board to a ~50px sliver (A5) |
| `zoomToFit` only on `onEngineStop`; `centerAt`+`zoom(6)` on click | Force-directed opens as a tiny clump; clicked node lands off-center with no selection feedback (A2/A6) |
| Source-link path joins `public-vault/wiki` + vault-root-relative path; repo private | All "View source on GitHub" links 404 (A3) |
| Swim-lane hides zero-degree nodes permanently, degree-1 until revealed | 8 of 47 nodes silently invisible with no count or affordance (A7) |
| Explainer references filters/node-sizing | Those exist only in force-directed mode, two clicks deep (A8) |
| `globals.css` hardcodes Arial; default-Tailwind gray | Geist loaded but unused; page reads as an unstyled prototype (A9/B10) |
| Committed `public-vault` has 2 pages | Deployed page would be a nearly empty board (B11) |

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

A layout-mode toggle lets a visitor switch between this force-directed view and a swim-lane view.
In swim-lane mode, the graph renders as a fixed board (no camera pan/zoom) of up to 4 horizontal
lanes grouped by folder/taxonomy (folders beyond 4 collapse into a shared "Other" lane), with
nodes rendered as labeled pill shapes. Edges are hidden by default in this mode; clicking a node
animates curved connector lines from it to each related node and opens the side panel — the same
side panel used in force-directed mode. Force-directed mode itself is unchanged: always-visible
edges, click-to-zoom, no line animation.

The deployed instance always points at a dedicated, always-public vault — seeded initially with
original research on AI adoption in medium-sized enterprises (40+ sourced references) — never at
the private `second-brain` vault, which is used only for local, unpublished dev iteration.

**Cycle 2 (demo-quality upgrade):** `/graph` is reframed from "a page that renders the graph"
into a self-explanatory demo. A hero/tagline row states what the page is and invites
interaction; the side panel's empty state becomes a "start anywhere" onboarding card with
folder and status legends; a stats footer shows `Built from K raw sources → Y wiki pages and
Z connections` plus an "Esc to reset" hint. The detail panel gains a folder badge, a per-page
description (frontmatter `description` with first-paragraph fallback, emitted by
`build-graph`), and clickable connected-page chips grouped by folder. Search moves to an
always-visible header slot, works in both layout modes, shows a result count, and focuses on
Ctrl+K. A single "Take a tour" control steps through 4–5 curated nodes. The layout is
responsive down to 390px (panel as bottom sheet), the visual identity commits to Geist
typography and a deliberate palette, and the review's A-series bugs are fixed. The deployed
dataset is replaced by a demo-scale vault produced by a dedicated research-ingestion epic, and
the repo goes public (after a history audit) so source links resolve.

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
1. Visitor sees the search box in the always-visible header (or presses Ctrl+K / `/` to focus it)
2. Visitor types "change management" into the search box
3. Client-side JS embeds the typed query *(resolved — `@huggingface/transformers`, same model as build-time)*
4. Cosine similarity is computed against the precomputed per-page vector-index
5. Graph nodes are re-ranked/highlighted by similarity score in real time as the visitor types — **in whichever layout mode is active** (swim-lane pills dim/highlight exactly as force-directed nodes do)
6. Nodes below a relevance threshold dim or fade out of the active view, and a visible result count reports how many pages match
7. Visitor clicks a highlighted node to confirm its content is actually about the query topic, not just keyword-adjacent

**Outcome:** Visitor sees live re-ranking that reflects semantic meaning (e.g. a page never containing the literal words "change management" still surfaces if conceptually related), confirming this isn't a keyword filter

### Scenario 3: Node deep-dive
**Actor:** Any visitor
**Trigger:** Visitor clicks a graph node
**Goal:** Read detail on that page's content and verify it's backed by real sourced material

**Steps:**
1. Visitor clicks a node in the graph
2. Graph centers/zooms on the node (~900ms), landing it visually centered, with a selection ring/halo on the node, its connections highlighted, and unrelated nodes dimmed
3. Side panel shows a colored folder badge, page title, status dot, tags, and a 1–3 sentence page description (frontmatter `description` or first-paragraph fallback)
4. Below the description, a "Connected pages" section lists directly linked pages grouped by folder as clickable chips
5. Visitor clicks a connected-page chip; that node becomes the selected node (graph focus and panel content update) — the panel is a navigation surface, not a dead end
6. Side panel shows a "View source on GitHub" link
7. Visitor clicks the GitHub link
8. The raw `.md` file opens in a new tab (repo is public; the link resolves), showing genuine sourced content/citations
9. Visitor returns to the graph tab; side panel state is preserved

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

### Scenario 7: Layout mode exploration
**Actor:** Any visitor
**Trigger:** Visitor clicks the layout-mode toggle on `/graph`
**Goal:** Explore the graph in the presentation-style swim-lane layout, mirroring the Nate Herk "AI Stack, Connected" reference demo

**Steps:**
1. Visitor lands on `/graph` in the default force-directed mode
2. Visitor clicks the layout-mode toggle
3. The board re-renders as up to 4 horizontal lanes of pill-shaped nodes, grouped by folder/taxonomy (edges hidden, no camera movement); pills render their full label text (no ellipsis truncation) inside tinted, descriptor-labeled lane containers
4. Low-connectivity pages not shown on the board are surfaced via a visible "+N more" affordance/count per lane (nothing is silently dropped)
5. Visitor clicks a pill node
6. Curved connector lines animate from the clicked node to each related node across lanes
7. The side panel opens showing the same page detail as force-directed mode
8. Visitor clicks another pill node; the prior connector lines clear and new ones animate from the newly clicked node
9. Visitor toggles back to force-directed mode; the camera re-fits to the graph on switch (no tiny off-screen clump), and a "reset view" control is available

**Outcome:** Visitor experiences both the original reference-demo-style tiered layout and the familiar force-directed exploration, confirming the tool offers both without conflicting behavior

### Scenario 8: Cold-visitor onboarding
**Actor:** Casual visitor (no prior context)
**Trigger:** Visitor lands on `/graph` for the first time
**Goal:** Understand what the page is and how to start exploring within seconds

**Steps:**
1. Visitor lands on `/graph`; above the board a hero row shows the page identity and a one-line promise (e.g. "Every page of the research vault in one map. Click anything to see what it is and how it connects.")
2. The side panel's empty state shows a "Start anywhere" onboarding card: one line on what the map is built from, a color-coded legend of the folder categories, and a status-dot legend (`active`/`revisiting`/`dormant`)
3. The card suggests where to begin (e.g. "try a hub node, or search for a topic")
4. At the bottom of the page, a stats footer reads `Built from K raw sources → Y wiki pages and Z connections` alongside an "Esc to reset" hint and the version string — one provenance sentence, not three loose counts, so the raw→wiki derivation the vault was built by is legible at a glance and K is spot-checkable against the source links. Vaults declaring no `raw/` provenance (fixtures, third-party vaults) omit the clause and the footer reads `Y wiki pages · Z connections`
5. Visitor clicks a suggested node; the onboarding card is replaced by that node's detail
6. Visitor presses Esc; the selection clears and the panel returns to the onboarding card

**Outcome:** A cold visitor is oriented, invited, and exploring within ~10 seconds — the page explains itself without requiring the below-the-fold explainer

### Scenario 9: Guided tour
**Actor:** Any visitor
**Trigger:** Visitor clicks the "Take a tour" control on `/graph`
**Goal:** Experience a curated path through the graph demonstrating navigation and content depth

**Steps:**
1. Visitor clicks "Take a tour"
2. The tour selects its first curated node: the graph focuses it (center/zoom or connector animation per active mode) and the side panel shows its detail plus a short tour caption
3. Visitor clicks "Next"; the tour advances to the next node in the curated 4–5 node path, each step following a real edge in the graph
4. Step indicator shows progress (e.g. "2 of 5")
5. At the final step, the tour offers "Explore on your own" and exits cleanly
6. At any step, Esc (or a close control) exits the tour and leaves the current node selected

**Outcome:** A visitor with no idea where to start experiences a representative, connected slice of the vault and understands how to keep exploring

### Scenario 10: Mobile visit
**Actor:** Any visitor on a phone-sized viewport (~390px)
**Trigger:** Visitor opens `/graph` on a mobile device
**Goal:** Explore the graph usably on a small screen

**Steps:**
1. Visitor opens `/graph` at 390px width; the board lays out single-column with readable pills (no crushed ~50px sliver)
2. The side panel is not a fixed sidebar; it appears as a bottom sheet/overlay when a node is selected
3. Visitor taps a pill node; the bottom sheet slides up with the node's detail
4. Visitor taps a connected-page chip in the sheet; selection moves to that node
5. Visitor dismisses the sheet (swipe/close); the board remains usable
6. Header, search, and hero remain readable and tappable at this width

**Outcome:** A recruiter opening the link on their phone gets a working demo, not a broken layout

### Scenario 11: Keyboard interaction
**Actor:** Any visitor
**Trigger:** Visitor uses the keyboard while on `/graph`
**Goal:** Drive the page's reset/close/search affordances without the mouse

**Steps:**
1. Visitor presses Ctrl+K (or `/`); the header search input receives focus
2. Visitor types a query, then presses Esc; the search clears and focus leaves the input
3. Visitor clicks a node, then presses Esc; the node selection clears (panel returns to the onboarding card, connector lines/dimming reset)
4. Visitor opens the Options popover, then presses Esc; the popover closes and the underlying page immediately accepts the next click (no dead backdrop)
5. During a guided tour, Esc exits the tour
6. The stats footer's "Esc to reset" hint matches this behavior

**Outcome:** Esc always de-escalates the most recent UI state, matching the reference demo's advertised affordance

### Scenario 12: Demo-vault research ingestion
**Actor:** Tool author
**Trigger:** Author completes a deep-research pass (e.g. Perplexity) on AI adoption in medium-sized enterprises and saves the output as a Markdown file with ~40 source links
**Goal:** Populate the public demo vault at demo scale via the Karpathy-pattern raw→wiki workflow

**Steps:**
1. Author places the deep-research Markdown file (source list + findings) into the ingestion workspace
2. An ingestion pass (author + LLM assistance, per the Karpathy pattern minus confidentiality guardrails) creates one `raw/` entry per source
3. From the raw entries, interlinked `wiki/` pages are authored: concept, source, and synthesis pages with `title`, `tags`, `status`, `description` frontmatter and `## Related` / `## Referenced By` wikilinks — fanning out to potentially a few hundred pages/connections
4. Author runs `npm run build:graph -- --vault public-vault/wiki` and inspects `graph-data.json` for expected node/edge counts and descriptions
5. Author reviews every page for public-safety (original research only, no confidential org data)
6. Author commits the vault, pushes, and the deploy workflow rebuilds the site
7. The deployed `/graph` shows demo-scale density; the stats footer's "Built from K raw sources" clause reflects the ingested source count

**Outcome:** The deployed demo carries the same visual and content richness as the local `second-brain` build, without any private content

## 6. System Interfaces & Data Flows

| Source | Format | Produced By |
|---|---|---|
| Public vault markdown files | `.md` + YAML frontmatter (title, tags, status, Related, Referenced By) | Karpathy-pattern raw→wiki ingestion of AI-in-enterprises research |
| `graph-data.json` | Nodes (id, title, folder/taxonomy, status, **description**) + undirected edges + **`meta.sourceCount`** | Build-time graph-builder script; description from frontmatter `description:` with first-body-paragraph fallback. `meta.sourceCount` counts `.md` files in the `raw/` directory sibling to the `--vault` path — `null` when no `raw/` sibling exists (vault declares no provenance), `0` when it exists but is empty |
| `vector-index.json` | Per-page precomputed embedding + metadata | Build-time embedding script |
| GitHub source links | URL to raw `.md` per node | Derived from vault repo path at build time (repo public; path join verified against the deployed vault layout) |
| Deep-research Markdown file | Author-provided `.md` with ~40 source links + findings (e.g. Perplexity output) | Manual deep-research pass; input to the raw→wiki ingestion epic, never processed by the build tool directly |
| Tour definition | Curated ordered list of 4–5 node ids + captions | Hand-authored static asset/config for the guided tour |

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
| Graph rendering | Layout-mode toggle: force-directed (always-visible edges, folder/taxonomy coloring, status dots, click-to-center-zoom ~900ms with centered landing, selection ring, connection highlighting, theme-aware link colors, camera re-fit on layout switch + reset-view control) OR swim-lane (up to 4 folder/taxonomy lanes in tinted descriptor-labeled containers, full-text pill nodes, "+N more" affordance for low-connectivity pages, edges hidden until click, then animated connector-line draw, no camera movement) |
| Search | Build-time embeddings, static vector-index, client-side cosine similarity, live filtering in **both** layout modes, always-visible header placement, result count, Ctrl+K / `/` focus |
| Side panel | Onboarding "start anywhere" empty state (legend + pointers), folder badge, description, clickable connected-page chips grouped by folder, GitHub source link; bottom sheet on mobile |
| Onboarding & identity | Hero/tagline row, stats footer (`Built from K raw sources → Y wiki pages and Z connections` + Esc hint; provenance clause omitted for vaults with no `raw/` sibling), guided tour (single 4–5 node path), Geist typography + deliberate palette |
| Keyboard | Esc de-escalates (tour → popover → search → selection); Ctrl+K / `/` focuses search |
| Explainer | "Why build this" static content section, copy matched to the UI that exists per mode |
| Build pipeline | `graph-data.json` (incl. per-page `description`) + `vector-index.json` generation from a local vault path |
| Demo vault | One-time research-ingestion epic: deep-research MD → `raw/` → interlinked `wiki/` pages at demo scale |

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
| Repo visibility | Repo becomes public in Cycle 2 so raw GitHub source links resolve — **precondition:** a full history audit confirms no private (`second-brain`, org, family) content exists anywhere in git history before flipping visibility |
| Tour content | The guided tour path and captions are hand-curated against the demo vault (static config), not auto-generated |
| Research input | The deep-research step is manual and author-provided (e.g. Perplexity export); the tool never performs automated research or fetches remote content |
| Responsive floor | 390px viewport width is the design floor for `/graph` usability |
| ~~Open risk~~ (resolved) | Client-side query embedding — resolved in Epic TBZJM0j via `@huggingface/transformers` with the same `Xenova/all-MiniLM-L6-v2` model as build time |
| ~~Open risk~~ (resolved) | Swim-lane rendering — resolved in Epic scQi8pt as a custom SVG/CSS renderer (`SwimLaneCanvas`), separate from `react-force-graph` |

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
| Swim lane | A horizontal band in the swim-lane layout mode grouping nodes by folder/taxonomy; capped at 4 visible lanes, with overflow folders collapsed into an "Other" lane |
| Pill node | A rounded, labeled node shape used in swim-lane mode (vs. the bare colored dot used in force-directed mode) |
| Rebuild-on-publish | New content requires a rebuild+redeploy; no real-time backend |
| Layout mode | Force-directed and swim-lane are both client-side rendering modes over the same `graph-data.json`; no separate data fetch or build artifact per mode |
| Hero row | The identity/tagline strip at the top of `/graph` stating what the page is and inviting interaction |
| Start-anywhere panel | The side panel's empty-state onboarding card: data provenance line, folder legend, status legend, and starting-point suggestions |
| Legend | The color-coded key mapping folder colors and status-dot colors to their meanings, shown in the start-anywhere panel |
| Stats footer | Footer strip showing `Built from K raw sources → Y wiki pages and Z connections`, the "Esc to reset" hint, and the version string. K comes from `meta.sourceCount`; the provenance clause is omitted (leaving `Y wiki pages · Z connections`) when the vault declares no `raw/` sibling |
| Description | Per-page 1–3 sentence summary in `graph-data.json`, from frontmatter `description:` or the page's first body paragraph |
| Connected-page chip | A clickable pill in the side panel representing a directly linked page; clicking it selects that node |
| Guided tour | A hand-curated, ordered walk through 4–5 linked nodes with captions, driven by a static tour definition |
| Bottom sheet | The mobile presentation of the side panel — an overlay sliding up from the bottom edge on small viewports |
| "+N more" affordance | Per-lane control in swim-lane mode surfacing low-connectivity pages that are not initially rendered as pills |
| Deep-research MD | The author-provided Markdown file (source links + findings) that seeds the demo-vault ingestion epic |

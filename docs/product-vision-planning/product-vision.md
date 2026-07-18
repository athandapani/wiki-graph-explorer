# wiki-graph-explorer — Product Vision & Brief

**Document Version:** 1.3
**Date:** 2026-07-18
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

**Demo-quality goals (Cycle 2 — from the issue #4 critical review vs the "AI Stack, Connected"
reference):**

| Goal | Success Criteria |
|---|---|
| Cold-visitor onboarding | A first-time visitor understands what the page is and how to start within ~10 seconds: hero/tagline row, "start anywhere" empty-state panel with folder + status legend, stats footer showing the raw→wiki provenance chain |
| Browsable detail panel | Every connected page in the side panel is a clickable chip that selects that node; panel shows a per-page description (frontmatter `description` or first-paragraph fallback) and a colored folder badge |
| Search works everywhere | Semantic search visibly filters/highlights in **both** layout modes, with a result count; Ctrl+K (or `/`) focuses search; search promoted to an always-visible header position |
| Keyboard support | Esc closes popovers and clears the node selection ("Esc to reset" hinted in the stats footer) |
| Responsive layout | `/graph` is usable at 390px viewport width — side panel becomes a bottom sheet/overlay, board stays readable |
| Deliberate visual identity | Geist typography actually applied (no Arial fallback); committed surface palette + folder-accent system; full pill labels (no ellipsis truncation); tinted lane containers with descriptors |
| Guided tour | One "Take a tour" control steps through 4–5 curated linked nodes with captions; Esc exits |
| Demo-scale deployed dataset | Deployed public vault built from ~40 ingested research sources (fanning out to potentially a few hundred wiki pages/connections), replacing the 2-page placeholder |
| Source transparency actually works | Repo made public after a history audit for private content; GitHub source links resolve (path-join bug fixed and verified against the deployed vault) |

## 6. MVP Scope Summary

- **Graph view**: two selectable layout modes via a visible toggle —
  - *Force-directed* (existing/default): `react-force-graph`, node color by folder/taxonomy,
    status-dot per node, `Related`/`Referenced By` collapsed into single undirected edges, all
    edges always visible, click-to-center-and-zoom (~900ms), no line animation
  - *Swim-lane* (new): static board (no camera pan/zoom), nodes grouped into up to 4 horizontal
    lanes by folder/taxonomy (folders beyond 4 collapse into a shared "Other" lane; the
    largest/most-populated folders each get their own lane), nodes rendered as labeled pill
    shapes rather than bare dots, edges hidden by default — clicking a node animates curved
    connector lines drawn from it to each connected node and opens the side panel
  - Both modes share the same node coloring, status dots, hover tooltips, and
    side-panel/search integration; switching modes is instant, no data refetch
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

### Demo-Quality Upgrade (Cycle 2)

Post-MVP scope driven by the issue #4 critical review of `/graph` against the "AI Stack,
Connected" reference demo:

- **Hero row**: bold page identity + one-line promise inviting interaction, above the graph
- **Onboarding / "start anywhere" panel**: the side panel's empty state becomes an onboarding
  card — what the map is built from, a color-coded folder legend, a status-dot legend, and
  pointers on where to begin
- **Rich detail panel**: colored folder badge, per-page description (frontmatter `description`
  field with first-paragraph fallback, emitted by `build-graph`), and "Connected pages" grouped
  by folder as clickable chips — clicking a chip selects that node (panel becomes a navigation
  surface, not a dead end)
- **Stats footer**: `Built from K raw sources → Y wiki pages and Z connections` + "Esc to reset" hint.
  Presented as one provenance sentence rather than three loose counts — the raw→wiki derivation is
  the technique the artifact exists to prove, and K is spot-checkable against the source links.
  Vaults with no `raw/` sibling (fixtures, third-party vaults) declare no provenance, so the clause
  is omitted entirely and the footer reads `Y wiki pages · Z connections` — never "built from 0"
- **Keyboard support**: Esc closes the Options popover / clears selection / exits the tour;
  Ctrl+K (or `/`) focuses search
- **Search promotion**: always-visible header placement, works in both layout modes, shows a
  result count
- **Responsive layout**: breakpoints so 390px-wide viewports get a usable board with the side
  panel as a bottom sheet/overlay
- **Visual identity pass**: Geist fonts applied, deliberate background/surface palette with the
  folder-color accent system, full pill labels sized to their text, tinted rounded lane
  containers with short lane descriptors, consistent hover/focus states, typographic hierarchy
- **Guided tour**: a single "Take a tour" control stepping through 4–5 curated linked nodes
  with captions
- **Hidden-node transparency**: swim-lane mode surfaces zero/low-degree nodes via a "+N more"
  affordance/count instead of silently dropping them
- **Explainer accuracy**: explainer copy corrected to match the UI that actually exists per mode
- **Review bug fixes**: search live in the default swim-lane view (A1), force-directed camera
  re-fit on layout switch + reset-view control (A2), source-link path join fixed (A3),
  click-to-zoom centering + selection ring/halo + connection highlighting/dimming in
  force-directed mode (A6), theme-aware edge/link colors and label decluttering at zoom (A6),
  Geist font actually applied (A9)
- **Demo-vault research ingestion (separate epic)**: the author provides a deep-research
  Markdown file (e.g. Perplexity output) with ~40 source links on AI adoption in medium-sized
  enterprises; an ingestion pass creates `raw/` entries and interlinked wiki pages
  Karpathy-style, replacing the 2-page placeholder vault
- **Repo goes public**: after a history audit confirms no private content, so raw GitHub source
  links resolve for anonymous visitors

*Cross-cutting concerns:* content isolation (tool only ever deployed against a vault that's
public-by-construction, never a filtered export); placement as a secondary page (e.g. `/graph`), not
the homepage; `react-force-graph` chosen over `sigma.js`/`Cosmograph` partly to sidestep
`Cosmograph`'s CC BY-NC 4.0 license risk on a job-seeking site.

### Dual-Pane & Theming (Cycle 3)

Post-Cycle-2 scope, driven by direct feedback on the shipped visual refresh:

- **Dual-pane graph view**: an independent pane-count control (1-pane / 2-pane), positioned
  beside the "Options & help" hamburger in the header, orthogonal to the existing
  force-directed/swim-lane mode toggle. In 2-pane mode both layouts render simultaneously,
  side by side at roughly half width each; node selection is synced across both panes and the
  shared side panel. Available only above a wide-screen breakpoint — below it, the control is
  hidden and the page behaves exactly as it does today (1-pane, mode-toggle only), consistent
  with the existing 390px responsive-floor precedent.
- **Theme chooser**: extends the existing Color theme section (light/dark toggle) with 3
  curated font+accent-color presets, each CVD-validated as a set via the dataviz skill's
  palette validator — same process used for the shipped teal/Manrope refresh — plus a 4th
  "Custom" option where the visitor picks an arbitrary accent color via a color picker. The 3
  curated presets keep the existing chrome-accent/graph-node-palette sync (picking a preset
  re-themes both together); the custom option is chrome-only (header, buttons, focus ring) — a
  visitor-chosen color isn't re-validated into the 8-hue categorical node palette, so the UI
  discloses this rather than implying the same accessibility guarantee as the presets. Selection
  persists via localStorage, the same pattern as the existing dark/light preference.

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
- Persona-based multi-tours ("I'm new here" / "I build things" / "I run a business") — one
  single guided tour only for Cycle 2
- Arrow-key node-to-node graph traversal (keyboard scope is Esc + search focus only)
- Automated research pipeline — the deep-research step for the demo vault is manual/user-provided
  (Perplexity or similar), never automated in-tool
- In-app raw-markdown reader (source transparency stays a GitHub link)

## 8. Key Business Scenarios

1. **Recruiter exploration** — a hiring manager clicks through from a case study to `/graph`,
   explores the live force-directed graph of the AI-in-enterprises research vault, and leaves
   convinced this is a working artifact, not a mockup.
2. **Semantic search demo** — a technical evaluator types a query like "change management" and
   watches the graph live-filter via real cosine-similarity ranking, not keyword matching — in
   whichever layout mode is active, with a visible result count and a Ctrl+K focus affordance.
3. **Node deep-dive** — any visitor clicks a node, the side panel opens with a folder badge,
   per-page description, and connected pages as clickable chips grouped by folder; a working
   GitHub source link lets them click through to the raw markdown to verify real sourced content.
4. **Local dev iteration** — the tool author runs the tool against a local `second-brain` path to
   iterate on graph/search quality using rich real data, with output never published.
5. **Public-vault rebuild & publish** — the author adds new research pages to the public vault,
   reruns the build, and the new nodes appear in the live deployed graph.
6. **Missing-link discovery** — a visitor reads the "why build this" explainer and notices an
   under-connected node or isolated cluster, illustrating how graph visualization surfaces content
   gaps.
7. **Layout mode exploration** — a visitor toggles from the default force-directed view to the
   swim-lane view (tiered pill nodes, animated on-click connection lines, directly mirroring the
   Nate Herk "AI Stack, Connected" reference demo), explores clustered lanes, then toggles back —
   confirming the tool offers both a familiar force-directed explorer and a more structured,
   presentation-style layout.
8. **Cold-visitor onboarding** — a first-time visitor lands on `/graph`, reads the hero/tagline,
   sees the "start anywhere" panel with folder and status legends, notes the stats footer
   ("Built from K raw sources → Y wiki pages and Z connections"), and starts exploring within seconds
   without any prior context.
9. **Guided tour** — a visitor clicks "Take a tour" and is stepped through 4–5 curated linked
   nodes with short captions, experiencing both the graph's navigation and the content's depth
   without having to choose where to start; Esc exits at any point.
10. **Demo-vault research ingestion** — the author brings a deep-research Markdown file
    (~40 source links on AI adoption in medium-sized enterprises), runs the Karpathy-pattern
    ingestion pass to produce `raw/` entries and interlinked wiki pages, and the rebuilt deployed
    graph shows demo-scale density instead of the 2-page placeholder.
11. **Dual-pane exploration** — a visitor on a wide screen toggles to 2-pane mode and sees the
    swim-lane and force-directed views side by side, exploring the same dataset through both
    lenses simultaneously without losing pan/zoom or selection state in either.
12. **Theme selection** — a visitor opens the theme chooser, previews the 3 curated presets, and
    either picks one or opens the custom option to set their own accent color, with the choice
    persisting across visits.

## 9. Design Direction

- Two selectable layout modes on a secondary page (`/graph`), not the homepage/centerpiece:
  force-directed (default) and swim-lane
- Force-directed mode is unchanged from the original design: node color-coding by
  folder/taxonomy cluster, always-visible edges, ~900ms click-to-center/zoom, no line animation
- Swim-lane mode more literally mirrors the Nate Herk "AI Stack, Connected" reference demo:
  fixed board (no camera pan/zoom), up to 4 horizontal lanes grouped by folder/taxonomy, nodes
  as labeled pill shapes, edges hidden until a node is clicked, then animated connector lines
  draw from the clicked node to each related node
- The 4-lane cap is a hard visual constraint (the board must be fully visible with no
  scrollbar), not just a preference — folders beyond 4 collapse into a shared "Other" lane
- The mode toggle is a persistent, obvious control — switching feels instant, no data refetch
- Status dot (`active`/`revisiting`/`dormant`) as a small distinct indicator — not a rating
  scale — present in both modes
- Side panel slides in without a full page navigation, keeping graph context visible — shared
  behavior across both modes
- Overall aesthetic reads as real webapp engineering (per the companion portfolio-site plan) — not
  a templated digital-garden look
- **Visual identity (Cycle 2):** Geist typography applied throughout (never the Arial fallback);
  a deliberate background/surface palette with the folder-color system doubling as the accent
  system; clear typographic hierarchy for the hero, lane headings, and panel
- Pills sized to their full label text — no ellipsis truncation on the board
- Lanes as tinted rounded containers with a short descriptor next to each heading, no large
  empty voids
- Search lives in the header, always visible, with a Ctrl+K affordance and a result count
- Consistent hover/focus transitions on pills, chips, and controls
- Onboarding surfaces (hero, start-anywhere panel, legend, stats footer) frame the graph so a
  cold visitor never faces an unexplained canvas
- **Dual-pane & theming (Cycle 3):** pane-count control sits beside the Options & help hamburger
  — always visible above the wide-screen breakpoint, absent below it; the theme chooser extends
  the existing Color theme section in the Options panel, with curated presets CVD-validated as a
  set and the custom option visibly disclosed as unvalidated

## 10. Data Strategy

Vault content is git-committed Markdown, frontmatter-driven (`Related`/`Referenced By`, `status`,
`tags`). Two static derived artifacts are computed at build time — `graph-data.json` and
`vector-index.json` — both regenerated fully on each build; no database, no incremental updates. No
dynamic backend/CMS: "freshness" means whatever was true at the last deploy. Local dev builds point
at the `second-brain` path for testing only; only builds against the dedicated public vault are ever
deployed.

**Cycle 2 additions:** `graph-data.json` gains a per-page `description` field, sourced from an
optional frontmatter `description:` with a first-body-paragraph fallback (emitted by
`build-graph`). It also gains a top-level `meta.sourceCount`, counting the `raw/` entries the vault
was ingested from, which feeds the stats footer's provenance clause. `raw/` is a convention of this
project's own vaults, not a constraint the tool imposes on vaults it renders: `meta.sourceCount` is
`null` when a vault has no `raw/` sibling and `0` when it has an empty one, and the footer omits its
provenance clause in both cases rather than claiming a pipeline that does not exist. The public demo
vault is populated via a one-time research-ingestion epic: the
author supplies a deep-research Markdown file (~40 source links, AI adoption in medium-sized
enterprises); the ingestion pass creates `raw/` entries and interlinked `wiki/` pages
Karpathy-style. The repo becomes public (after a history audit) so raw GitHub source links
resolve for anonymous visitors.

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
- Analytics on which nodes/queries visitors actually explore (including tour completion)
- Persona-based tour paths ("I'm new here" / "I build things" / "I run a business") beyond the
  single Cycle 2 tour
- Arrow-key node-to-node keyboard traversal of the graph
- In-app raw-markdown reader as an alternative to GitHub source links

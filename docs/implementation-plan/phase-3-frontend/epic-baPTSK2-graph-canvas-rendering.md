# Epic baPTSK2: Graph Canvas Rendering

**Phase:** 3 — Frontend
**Status:** Not Started
**Dependencies:** Epic cxjcyqx (Embeddings, Vector Index & Deployment Safety)

> **Brand:** Use the project's brand guidelines skill for the `/graph` page visual treatment if
> one is configured.

---

## Description

Build the `/graph` page itself: client-side fetch of `graph-data.json` and `vector-index.json`,
force-directed rendering via `react-force-graph`, folder/taxonomy color-coding, status dots,
hover tooltips, and the signature click-to-center-zoom (~900ms) interaction that recruiters and
technical evaluators experience first (ConOps Scenario 1). This is the largest single epic
because every TOR here touches the same canvas component and rendering pipeline — splitting it
would create awkward same-file dependencies between epics. It must also handle the empty-graph
and 40+-node edge cases so the page never appears broken regardless of vault size.

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
| TOR-02-k4HmFPL | `docs/requirements/02-graph-rendering.feature.md` | The /graph page footer shall display the application name and current semantic version matching the value declared in package.json |
| TOR-02-rG2HTvc | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall display a user-facing error message naming the problem and the next user action when graph-data.json or vector-index.json fails to load |
| TOR-02-TW7XEms | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall fetch graph-data.json and vector-index.json client-side on load and render all nodes and edges via react-force-graph without requiring any backend call after page load |
| TOR-02-Hja6xEo | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render each edge from graph-data.json as a visible connecting line between the corresponding node pair |
| TOR-02-AyzgOJs | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall color each node according to its folder/taxonomy value, using a visually distinct color per distinct taxonomy cluster |
| TOR-02-VIOZzEK | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render a small distinct status dot per node reflecting its status value (active, revisiting, or dormant), styled separately from the node's taxonomy color |
| TOR-02-6fwdtOM | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall display a title tooltip when a visitor hovers over a node |
| TOR-02-VLOPcgD | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall center and zoom the view on a clicked node with an animated transition lasting approximately 900 milliseconds |
| TOR-02-mqgZkBc | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render correctly with an empty graph (zero nodes) without a visible error, displaying an empty-state message instead |
| TOR-02-pRzSHQL | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall remain interactive (pannable, zoomable, clickable) when rendering a graph of at least 40 nodes matching the seed public vault's target scale |

## Key Components

### Frontend

- `app/graph/page.tsx` — `/graph` route; client-side fetch of `graph-data.json` and
  `vector-index.json`; error and empty-state handling
- `components/graph/GraphCanvas.tsx` — `react-force-graph` wrapper rendering nodes and edges,
  hover tooltips, and click-to-center-zoom (~900ms) behavior
- `components/graph/nodeColor.ts` — folder/taxonomy → color mapping
- `components/graph/StatusDot.tsx` — status indicator (`active`/`revisiting`/`dormant`) styled
  distinctly from taxonomy color
- `components/graph/EmptyState.tsx` — zero-node empty-state message
- `components/graph/ErrorState.tsx` — data-load failure message naming the problem and next
  action
- `components/graph/Footer.tsx` — version string sourced from `package.json`

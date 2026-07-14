# Epic scQi8pt: Swim-Lane Layout Mode

**Phase:** 3 — Frontend
**Status:** Not Started
**Dependencies:** Epic baPTSK2 (Graph Canvas Rendering), Epic V3PlLFL (Side Panel & Source Transparency)

> **Brand:** Use the project's brand guidelines skill for the swim-lane board, pill nodes, and
> toggle control if one is configured.

---

## Description

Add a second, selectable graph rendering mode — a static, tiered swim-lane board directly
mirroring the Nate Herk "AI Stack, Connected" reference demo that originally inspired this tool
(Product Vision §2). Nodes group into up to 4 horizontal lanes by folder/taxonomy, render as
labeled pill shapes instead of bare dots, and hide their edges until clicked — at which point
curved connector lines animate from the clicked node to each related node over ~950ms. A
persistent toggle switches between this mode and the existing force-directed mode (unchanged)
without refetching data. This is additive, not a replacement: force-directed mode (epic baPTSK2)
keeps its current behavior exactly as built and verified.

**Open risk:** the swim-lane rendering technical approach is unresolved as of this writing
(ConOps §8) — `/peak-workflow:start-epic` must either run a spike to determine whether
`react-force-graph`'s fixed-position mode (`fx`/`fy`) plus custom line-draw animation is
sufficient, or whether a separate custom-built (SVG/Canvas) tiered renderer is required, and
must explicitly surface the decision to the user before implementing TOR-06-6dbr9Jn and
TOR-06-pbVYver rather than silently picking an approach. The exact >4-folder "Other" lane
bucketing rule (tie-breaking when node counts are equal) should also be confirmed with the user
during this spike, since it's currently untestable against real vault taxonomy data (the public
vault is still seed/placeholder content).

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
| TOR-06-DRtjcOk | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall display a layout-mode toggle control that switches between force-directed and swim-lane rendering modes |
| TOR-06-mvJp8Oa | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall switch between layout modes without making a new network request for graph-data.json or vector-index.json |
| TOR-06-AFMTHM6 | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall restore the force-directed view's prior pan/zoom state when a visitor toggles from swim-lane mode back to force-directed mode |
| TOR-06-6dbr9Jn | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render nodes in swim-lane mode grouped into horizontal lanes by folder/taxonomy value, with at most 4 lanes visible |
| TOR-06-a3pVfbc | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall collapse folder/taxonomy values beyond the 4 largest into a single shared "Other" lane in swim-lane mode |
| TOR-06-hCQUwZW | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render each node in swim-lane mode as a labeled pill shape displaying the node's title |
| TOR-06-0ZRtILL | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall display all swim-lane mode lanes within the viewport without a vertical scrollbar at default viewport size |
| TOR-06-RlMt9hc | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall NOT pan or zoom the camera view when a visitor clicks a node in swim-lane mode |
| TOR-06-tq70ta7 | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall hide edges by default in swim-lane mode until a node is clicked |
| TOR-06-pbVYver | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall animate a curved connector line from a clicked node to each of its related nodes, drawing smoothly from source to destination over approximately 950 milliseconds |
| TOR-06-baMJL3X | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall clear previously animated connector lines and draw new ones when a different node is clicked in swim-lane mode |
| TOR-06-n4fJkbK | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall open a side panel displaying the clicked node's page detail and a "View source on GitHub" link when a node is clicked in swim-lane mode |
| TOR-06-NJmtnhV | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall remain interactive (clickable) in swim-lane mode when rendering a graph of at least 40 nodes |
| TOR-06-M0SNN90 | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render swim-lane mode correctly with an empty graph (zero nodes), displaying an empty-state message instead of a blank canvas |

## Key Components

### Frontend

- `components/graph/LayoutModeToggle.tsx` — persistent toggle control switching between
  force-directed and swim-lane modes; owns/reads the mode state that `app/graph/page.tsx` uses
  to decide which canvas to render
- `components/graph/SwimLaneCanvas.tsx` — swim-lane board renderer (implementation approach
  pending the open-risk spike in Description — either a fixed-position `react-force-graph`
  configuration or a custom SVG/Canvas renderer)
- `components/graph/PillNode.tsx` — labeled pill node shape used only in swim-lane mode
- `lib/lane-assignment.ts` — folder/taxonomy → lane bucketing: largest 4 folders get their own
  lane, remainder collapse into "Other"; deterministic tie-breaking
- `lib/connector-line-animation.ts` — curved source→destination line-draw animation logic
  (~950ms), triggered on node click, cleared on re-click
- `app/graph/page.tsx` — modified to host the layout-mode toggle and switch between
  `GraphCanvas.tsx` (existing, unchanged) and `SwimLaneCanvas.tsx` (new), sharing one
  `graph-data.json`/`vector-index.json` fetch and reusing `components/graph/SidePanel.tsx`
  (from epic V3PlLFL) and `components/graph/EmptyState.tsx` (existing) for the empty-graph case

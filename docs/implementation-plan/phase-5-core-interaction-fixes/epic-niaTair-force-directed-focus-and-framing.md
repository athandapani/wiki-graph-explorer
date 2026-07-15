# Epic niaTair: Force-Directed Focus & Framing

**Phase:** 5 — Core Interaction Fixes
**Status:** Not Started
**Dependencies:** None

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Make the force-directed view demo-worthy: fit the graph on initial render at a legible zoom, land
clicked nodes dead-center, add a selection ring, highlight a selection's connections while dimming the
rest, make link colors theme-aware, and declutter labels at low zoom (issue #4 findings A2/A6). The
shipped page opened as a tiny unreadable clump and dropped clicked nodes off-center with no selection
feedback — the first impression contradicted the claim the page exists to make.

This epic also **re-implements `TOR-06-AFMTHM6`**, which was inverted during the Cycle 2 requirements
amendment: it previously required restoring the prior pan/zoom on layout switch, and now requires a
camera re-fit, because restoring a stale pan/zoom is precisely what produced the off-screen clump.
Epic scQi8pt implemented the pre-amendment behavior and is Complete; its shipped code does not satisfy
the amended requirement, so the behavior is re-done here.

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
| TOR-02-lcYAVDz | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall fit the force-directed graph to the viewport on initial render so that every node is visible without the visitor panning or zooming |
| TOR-02-3eqveD9 | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render the force-directed graph at a zoom level where node labels are legible on initial load |
| TOR-02-IrF7v8x | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall provide a visible reset-view control that re-fits the force-directed camera so every node is visible when activated |
| TOR-02-XgckKbI | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall land a clicked node at the visual center of the graph canvas when its click-to-zoom animation completes |
| TOR-02-dO7evaS | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render a selection ring or halo around the currently selected node, distinguishing it from every unselected node |
| TOR-02-D3bxP8j | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall highlight a selected node's directly connected nodes and edges while dimming nodes unrelated to the selection |
| TOR-02-q6cZSCD | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall render force-directed edge and link colors that remain visible against the active theme's canvas background in both dark and light themes |
| TOR-02-NyPLTRl | `docs/requirements/02-graph-rendering.feature.md` | The /graph page shall hide force-directed node labels below a zoom threshold so that a zoomed-out view renders as readable nodes rather than overlapping text |
| TOR-06-AFMTHM6 | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall re-fit the force-directed camera to the graph bounds when a visitor toggles from swim-lane mode back to force-directed mode |

## Key Components

### Frontend

- `components/graph/GraphCanvas.tsx` — initial `zoomToFit` on mount and on layout-switch re-entry; centered click landing; selection ring; connection highlight/dim; zoom-threshold label gating
- `components/graph/nodeColor.ts` — theme-aware link/edge colors resolved against the active theme
- `components/graph/OptionsPanel.tsx` — reset-view control
- `app/graph/page.tsx` — drop the retained pan/zoom restore path on mode switch (superseded by the AFMTHM6 amendment)

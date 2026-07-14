# Epic IbQ9Rr1: Explainer & Missing-Link Discovery

**Phase:** 4 — Integration
**Status:** Not Started
**Dependencies:** Epic baPTSK2 (Graph Canvas Rendering), Epic V3PlLFL (Side Panel & Source Transparency)

> **Brand:** Use the project's brand guidelines skill for the explainer section treatment if one
> is configured.

---

## Description

Tie the graph canvas, filtering, and side panel together into the "why build this" narrative
(ConOps Scenario 6): a static explainer section describing second-brain/dynamic-context benefits,
plus status and folder/taxonomy filters that let a visitor isolate a cluster and visually spot an
under-connected node relative to its peers. This epic depends on both the graph canvas (for
filter application and edge-count visual indicators) and the side panel (its related-node list is
reused to let a visitor confirm a node's sparse connections directly) — it is the last epic in the
recommended session order because it integrates output from both.

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
| TOR-05-G72S3H4 | `docs/requirements/05-explainer-and-discovery.feature.md` | The /graph page shall display a static "why build this" explainer section describing second-brain/dynamic-context benefits and how graph visualization surfaces missing links |
| TOR-05-dfhLAbM | `docs/requirements/05-explainer-and-discovery.feature.md` | The /graph page shall allow a visitor to filter the visible nodes by status value (active, revisiting, dormant) |
| TOR-05-UPr1Am6 | `docs/requirements/05-explainer-and-discovery.feature.md` | The /graph page shall allow a visitor to filter or sort the visible nodes by folder/taxonomy cluster |
| TOR-05-02VIaa3 | `docs/requirements/05-explainer-and-discovery.feature.md` | The /graph page shall visually indicate a node's edge count so a visitor can identify under-connected nodes relative to their cluster peers |
| TOR-05-EmhMDFS | `docs/requirements/05-explainer-and-discovery.feature.md` | The side panel shall display a node's full related-node list so a visitor can recognize when a concept that logically should connect to other nodes currently does not |

## Key Components

### Frontend

- `components/graph/ExplainerSection.tsx` — static "why build this" content (second-brain /
  dynamic-context benefits, missing-link discovery narrative)
- `components/graph/FilterControls.tsx` — status and folder/taxonomy filter UI, applied against
  `GraphCanvas.tsx` node visibility/dimming
- `components/graph/edgeCountIndicator.ts` — under-connected node visual sizing/indicator logic,
  relative to cluster peers

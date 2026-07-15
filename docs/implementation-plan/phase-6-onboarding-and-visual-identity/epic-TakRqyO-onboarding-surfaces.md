# Epic TakRqyO: Onboarding Surfaces

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** Epic Dj3m8aH (meta.sourceCount for the footer), Epic nQJ8Ofz (panel detail state)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Make the page explain itself. The side panel's empty state becomes a "Start anywhere" onboarding card
carrying a folder legend, a status legend, and a concrete first move; the footer becomes a stats strip
reading `Built from K raw sources → Y wiki pages and Z connections` plus an "Esc to reset" hint (issue
#4 findings B2/B3/B7). The shipped page color-coded every node with no key anywhere, and wasted its
largest uncommitted surface on one gray sentence at the exact moment a visitor needs orientation.

The footer's three figures are presented as one provenance sentence rather than three loose counts,
because the raw→wiki derivation is the technique the artifact exists to evidence — "40 sources became
142 interlinked pages" is a claim a visitor can check, while "142 nodes" is trivia. Vaults declaring no
provenance omit the clause entirely rather than rendering "Built from 0 raw sources".

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
| TOR-08-LuQzsEi | `docs/requirements/08-onboarding-and-tour.feature.md` | The side panel shall display a "Start anywhere" onboarding card, naming what the map is built from, whenever no node is selected |
| TOR-08-xZxrwfj | `docs/requirements/08-onboarding-and-tour.feature.md` | The start-anywhere card shall display a folder legend mapping each folder/taxonomy color rendered in the graph to that folder's name |
| TOR-08-hTq5dSY | `docs/requirements/08-onboarding-and-tour.feature.md` | The start-anywhere card shall display a status legend mapping each status dot style to its meaning for the values active, revisiting, and dormant |
| TOR-08-Z2By5L0 | `docs/requirements/08-onboarding-and-tour.feature.md` | The start-anywhere card shall suggest at least one concrete starting point for a visitor who does not know where to begin |
| TOR-08-zwMqZzr | `docs/requirements/08-onboarding-and-tour.feature.md` | The side panel shall replace the start-anywhere card with the selected node's detail when a visitor selects a node |
| TOR-08-r0Nam2Q | `docs/requirements/08-onboarding-and-tour.feature.md` | The side panel shall restore the start-anywhere card when the visitor clears the current node selection |
| TOR-08-LQAbYTw | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page shall display a stats footer presenting the vault's ingested source count, wiki page count, and connection count as a single derivation reading "Built from K raw sources → Y wiki pages and Z connections" |
| TOR-08-dkecfj5 | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page's stats footer shall omit the provenance clause entirely, displaying only the page and connection counts, when the vault declares no ingested sources |
| TOR-08-AzJ7BQu | `docs/requirements/08-onboarding-and-tour.feature.md` | The stats footer shall display an "Esc to reset" hint describing the Esc key's behavior on the page |

## Key Components

### Frontend

- `components/graph/SidePanel.tsx` — start-anywhere card as the empty state; swap to node detail on selection and back on clear
- `components/graph/Legend.tsx` — new: folder and status legends driven by the live taxonomy
- `components/graph/Footer.tsx` — provenance sentence with null/0 clause omission; Esc hint alongside the existing version string
- `components/graph/StatusDot.tsx` — reuse the dot styling in the status legend so key and graph agree

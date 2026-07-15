# Epic nQJ8Ofz: Rich Browsable Detail Panel

**Phase:** 5 — Core Interaction Fixes
**Status:** Not Started
**Dependencies:** Epic Dj3m8aH (node description emission)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Turn the side panel from a dead end into a navigation surface: a colored folder badge, the page's
description, and connected pages rendered as clickable chips grouped by folder, where clicking a chip
selects that node (issue #4 finding B4). The shipped panel listed related pages as plain text, so the
one obvious next move a curious visitor wanted to make — follow a link — was not available.

Depends on Epic Dj3m8aH for the `description` field. When a page has no description the area is
omitted entirely rather than rendering an empty gap, so sparse vaults do not look broken.

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
| TOR-04-iI9aJNn | `docs/requirements/04-side-panel.feature.md` | The side panel shall display a folder badge for the selected node, colored to match that folder's color in the graph |
| TOR-04-0igGafN | `docs/requirements/04-side-panel.feature.md` | The side panel shall display the selected node's description from graph-data.json |
| TOR-04-olJvPNV | `docs/requirements/04-side-panel.feature.md` | The side panel shall omit the description area entirely, without rendering an empty gap or placeholder, when the selected node's description is empty |
| TOR-04-xeqtJpo | `docs/requirements/04-side-panel.feature.md` | The side panel shall render the selected node's connected pages as clickable chips grouped under their folder/taxonomy headings |
| TOR-04-1iMsnYq | `docs/requirements/04-side-panel.feature.md` | The side panel shall select the target node, updating both the graph focus and the panel content, when a visitor clicks a connected-page chip |

## Key Components

### Frontend

- `components/graph/SidePanel.tsx` — folder badge, description block with empty-case omission, connected-page chips grouped under folder headings
- `components/graph/nodeColor.ts` — share the folder color with the badge so panel and graph agree
- `app/graph/page.tsx` — chip click selects the target node, driving both panel content and graph focus through the existing selection path

# Epic nB4iwQu: Responsive Layout

**Phase:** 7 — Access & Responsiveness
**Status:** Not Started
**Dependencies:** Epic nQJ8Ofz (connected-page chips in the sheet), Epic xvzgc4Z (hero and header to lay out)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Make `/graph` work at the 390px design floor: the board takes the majority of the viewport instead of
being crushed to a ~50px sliver by a fixed `w-80` panel, and the side panel becomes a bottom sheet
overlay that opens on tap, navigates via chips, and dismisses cleanly (issue #4 finding A5).

This is not an edge case. A recruiter opening the link from a phone is among the most likely ways this
artifact is ever seen, and today that visitor gets a broken layout rather than a demo.

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
| TOR-09-ULogLhW | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall render the graph board at a usable width occupying the majority of the viewport at a 390px viewport width |
| TOR-09-Gx908bc | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall present the side panel as a bottom sheet overlay, rather than a side column, when a node is selected at a 390px viewport width |
| TOR-09-FSqHlRx | `docs/requirements/09-keyboard-and-responsive.feature.md` | The bottom sheet shall select the target node when a visitor taps a connected-page chip within it at a 390px viewport width |
| TOR-09-rOB5DZW | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall leave the board interactive after the visitor dismisses the bottom sheet at a 390px viewport width |
| TOR-09-kMjRcRb | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall render the header, search input, and hero row legibly and within the viewport at a 390px viewport width |

## Key Components

### Frontend

- `app/graph/page.tsx` — responsive breakpoints; panel-as-sheet below the floor, side column above
- `components/graph/SidePanel.tsx` — bottom-sheet presentation with a dismiss control
- `components/graph/Header.tsx` — header, search, and hero reflow at 390px with tap-sized targets
- `components/graph/SwimLaneCanvas.tsx` — single-column board layout at narrow widths

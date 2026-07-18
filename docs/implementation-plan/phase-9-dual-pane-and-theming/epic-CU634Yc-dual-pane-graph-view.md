# Epic CU634Yc: Dual-Pane Graph View

**Phase:** 9 — Dual-Pane & Theming
**Status:** Not Started
**Dependencies:** Epic vH3Ls3h (Icon-Only Options Menu — the pane-count control sits beside its
hamburger), Epic scQi8pt (Swim-Lane Layout Mode — one of the two panes rendered), Epic niaTair
(Force-Directed Focus & Framing — the other pane, plus the selection/highlight behavior synced
across panes)

> **Brand:** Use the project's brand guidelines skill for the pane-count control and the
> split-pane layout in this epic if one is configured.

---

## Description

Add an independent pane-count control (1-pane / 2-pane), positioned beside the Options & help
hamburger, orthogonal to the existing force-directed/swim-lane mode toggle. In 2-pane mode both
layouts render simultaneously side by side at roughly half width each, with node selection
synced across both panes and the shared side panel — a click in either pane focuses the same
node in the other pane (connector lines/highlighting activate there) and updates the shared
panel. Available only above a wide-screen breakpoint (exact px value to be confirmed during
implementation); below it, the control is hidden and the page behaves exactly as it does today
(1-pane, mode-toggle only), consistent with the existing 390px responsive-floor precedent from
epic nB4iwQu. Switching pane count never triggers a new `graph-data.json`/`vector-index.json`
fetch, matching the existing layout-mode-switch contract (TOR-06-mvJp8Oa).

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
| TOR-11-45utBRH | `docs/requirements/11-dual-pane-layout.feature.md` | Above the wide-screen breakpoint, the /graph page shall display a pane-count control positioned beside the Options & help hamburger, independent of the layout-mode toggle |
| TOR-11-6XjR1qm | `docs/requirements/11-dual-pane-layout.feature.md` | Activating the pane-count control shall switch the board from 1-pane to 2-pane mode, rendering both the swim-lane and force-directed layouts side by side at approximately half width each |
| TOR-11-XOBsafW | `docs/requirements/11-dual-pane-layout.feature.md` | In 2-pane mode, whichever layout mode was active before switching shall render as the primary pane, with the other mode filling the second pane |
| TOR-11-y75iqea | `docs/requirements/11-dual-pane-layout.feature.md` | Clicking a node in one pane while in 2-pane mode shall focus that same node in the other pane and update the shared side panel with that node's detail |
| TOR-11-edqY3uP | `docs/requirements/11-dual-pane-layout.feature.md` | Clicking a different node in the other pane shall update focus in both panes and the side panel together |
| TOR-11-qzGSh7K | `docs/requirements/11-dual-pane-layout.feature.md` | Deactivating the pane-count control while in 2-pane mode shall return the board to 1-pane mode, showing whichever layout mode was last focused or interacted with |
| TOR-11-TFakQZA | `docs/requirements/11-dual-pane-layout.feature.md` | Below the wide-screen breakpoint, the pane-count control shall be hidden and the board shall render in 1-pane mode only |
| TOR-11-Umq6yH6 | `docs/requirements/11-dual-pane-layout.feature.md` | If a visitor resizes the browser below the wide-screen breakpoint while in 2-pane mode, the board shall automatically fall back to 1-pane mode |
| TOR-11-73Scw5U | `docs/requirements/11-dual-pane-layout.feature.md` | Switching between 1-pane and 2-pane mode shall not trigger a new network request for graph-data.json or vector-index.json |

## Key Components

### Frontend

- `app/graph/page.tsx` — own the pane-count state, the shared selected-node state fed to both
  panes and the side panel, and the wide-screen breakpoint media query
- New: `components/graph/PaneCountControl.tsx` — the 1-pane/2-pane toggle rendered beside the
  Options & help hamburger
- New: a split-pane layout wrapper (e.g. `components/graph/DualPaneBoard.tsx`) rendering
  `GraphCanvas` and `SwimLaneCanvas` side by side at ~half width each
- `components/graph/GraphCanvas.tsx` — accept an externally-controlled selected-node id so
  selection can be driven by the other pane, not only its own clicks
- `components/graph/SwimLaneCanvas.tsx` — same externally-controlled selection wiring
- `components/graph/SidePanel.tsx` — no change expected beyond continuing to read the single
  shared selected-node state, now potentially set from either pane

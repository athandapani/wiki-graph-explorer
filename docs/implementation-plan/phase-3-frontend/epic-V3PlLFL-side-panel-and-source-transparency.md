# Epic V3PlLFL: Side Panel & Source Transparency

**Phase:** 3 — Frontend
**Status:** Not Started
**Dependencies:** Epic baPTSK2 (Graph Canvas Rendering)

> **Brand:** Use the project's brand guidelines skill for the side panel treatment if one is
> configured.

---

## Description

Implement the slide-in side panel that opens on node click, showing page title, tags, status
dot, related-node list, and a "View source on GitHub" link to the raw Markdown file — the
mechanism that lets a skeptical visitor verify page content is genuine sourced material, not
placeholder text (ConOps Scenario 3). The panel must open/close without a full page navigation
and must preserve its state when the visitor returns from the GitHub tab, keeping the graph's
centered/zoomed view intact throughout.

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
| TOR-04-I0T4GDu | `docs/requirements/04-side-panel.feature.md` | The /graph page shall open a side panel showing page detail when a visitor clicks a node |
| TOR-04-GOmpoij | `docs/requirements/04-side-panel.feature.md` | The side panel shall slide in without triggering a full page navigation, keeping the graph visible and in its current center/zoom state |
| TOR-04-tgCQzbT | `docs/requirements/04-side-panel.feature.md` | The side panel shall close when the visitor explicitly dismisses it, returning full focus to the graph canvas |
| TOR-04-OSiZDmK | `docs/requirements/04-side-panel.feature.md` | The side panel shall display the node's title, tags, and status dot |
| TOR-04-p0sfy0j | `docs/requirements/04-side-panel.feature.md` | The side panel shall display a list of the node's related nodes derived from its graph edges |
| TOR-04-JCORp98 | `docs/requirements/04-side-panel.feature.md` | The side panel shall display a "View source on GitHub" link that opens the raw Markdown file for that page in a new tab |
| TOR-04-ldlbRRl | `docs/requirements/04-side-panel.feature.md` | The side panel shall preserve its open state and displayed content when a visitor returns to the /graph browser tab after visiting the GitHub source link in a separate tab |

## Key Components

### Frontend

- `components/graph/SidePanel.tsx` — slide-in panel; title/tags/status-dot display; related-node
  list; open/close state that survives tab switches without full page navigation
- `lib/github-source-link.ts` — raw `.md` file URL derivation from the vault's GitHub repository
  path for a given node id

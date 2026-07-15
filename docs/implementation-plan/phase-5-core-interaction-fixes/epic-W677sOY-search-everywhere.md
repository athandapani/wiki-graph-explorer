# Epic W677sOY: Search Everywhere

**Phase:** 5 — Core Interaction Fixes
**Status:** Not Started
**Dependencies:** None

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Wire semantic search into the swim-lane board and promote it to an always-visible header slot with a
live result count and a Ctrl+K / `/` focus shortcut. This is the highest-priority item of the cycle:
search was wired only to the force-directed canvas, so a visitor landing on the default swim-lane
board and typing a query saw nothing happen (issue #4 finding A1). The headline feature — the one a
technical evaluator came to stress-test — is dead exactly where visitors arrive.

The ranking pipeline already exists and is unchanged; this epic reuses `useSearchRanking` and binds
its output to the swim-lane renderer, so pills dim and highlight exactly as force-directed nodes do,
and an active query survives a layout-mode switch intact.

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
| TOR-03-Z3ApPfB | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall apply the active search query's similarity ranking to the swim-lane board, highlighting and dimming pill nodes exactly as it does force-directed nodes |
| TOR-03-PzdJnrT | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall preserve the active search query and its resulting filtering when the visitor switches layout modes |
| TOR-03-LgIpadO | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall display the search input in a persistently visible header position that remains reachable without scrolling in both layout modes |
| TOR-03-1LlqKF1 | `docs/requirements/03-semantic-search.feature.md` | The /graph page shall display a count of how many pages match the active search query, updating live as the query changes |
| TOR-09-O0Wu0vg | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall move keyboard focus to the header search input when the visitor presses Ctrl+K or the forward-slash key |

## Key Components

### Frontend

- `components/graph/SwimLaneCanvas.tsx` — consume the shared ranking; highlight/dim pills by score
- `components/graph/useSearchRanking.ts` — lift ranking state so both renderers read one source of truth; expose the above-threshold match count
- `components/graph/SearchInput.tsx` — result-count display; Ctrl+K / `/` focus handling, ignoring `/` while focus is already in a text input
- `components/graph/Header.tsx` — host the search input in the persistent header slot
- `app/graph/page.tsx` — hoist query state above the layout-mode switch so it survives toggling

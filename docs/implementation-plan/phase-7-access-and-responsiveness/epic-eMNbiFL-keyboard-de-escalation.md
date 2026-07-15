# Epic eMNbiFL: Keyboard De-escalation

**Phase:** 7 — Access & Responsiveness
**Status:** Not Started
**Dependencies:** Epic W677sOY (search state), Epic TakRqyO (onboarding card as the cleared state), Epic 2Ze47tg (tour state)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Make Esc reliably undo the most recent UI state, peeling exactly one layer per press in the order tour
→ Options popover → search → node selection. The shipped page had no keyboard handlers at all: Esc was
dead, and the Options popover's backdrop stayed mounted and swallowed the next click, so the first click
after dismissing did nothing (issue #4 finding A4).

Sequenced last among the interaction epics because the de-escalation chain can only be implemented and
verified once every state it de-escalates exists. The stats footer's "Esc to reset" hint
(TOR-08-AzJ7BQu) advertises this behavior, so this epic is what makes that hint true rather than a
second broken promise.

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
| TOR-09-gEPQ6wm | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall clear the search query and remove focus from the search input when the visitor presses Esc while the search input is focused |
| TOR-09-a6cppkl | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall clear the current node selection when the visitor presses Esc while a node is selected, returning the side panel to the start-anywhere card |
| TOR-09-4BewmC1 | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall close the Options popover when the visitor presses Esc, leaving the underlying page immediately clickable |
| TOR-09-L9qGFOu | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall exit the guided tour when the visitor presses Esc during a tour step |
| TOR-09-YrywFkB | `docs/requirements/09-keyboard-and-responsive.feature.md` | The /graph page shall de-escalate exactly one UI state per Esc press, in the order tour, then Options popover, then search, then node selection |

## Key Components

### Frontend

- `hooks/useEscapeChain.ts` — new: single keydown listener resolving the de-escalation precedence
- `components/graph/OptionsPanel.tsx` — close on Esc; unmount the backdrop so the next click lands
- `components/graph/SearchInput.tsx` — Esc clears the query and blurs
- `app/graph/page.tsx` — register the chain against tour, popover, search, and selection state

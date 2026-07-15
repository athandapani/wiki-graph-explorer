# Epic 2Ze47tg: Guided Tour

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** Epic nQJ8Ofz (panel detail for captions), Epic niaTair (force-directed focus behavior), Epic H0q48k8 (swim-lane connector behavior)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Add a single "Take a tour" control that walks a visitor through 4–5 hand-curated linked nodes with
captions and a step indicator, exiting cleanly and leaving the current node selected. It answers the
question a cold visitor actually has — not "how does this control work" but "where do I even start" —
without making them choose.

Each consecutive pair of steps follows a real edge in the graph, which is what makes the tour
demonstrate the graph rather than slideshow through it: the visitor watches connections carry them
forward. The path is a static hand-curated asset (ConOps §8), never auto-generated, so a build against
a different vault cannot silently produce a nonsense tour. Depends on both renderers being final, since
the tour rides each mode's existing selection behavior rather than defining a third.

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
| TOR-08-NtvwEKk | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page shall display a persistent "Take a tour" control that starts the guided tour when activated |
| TOR-08-8EHbtf3 | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall be driven by a static hand-curated tour definition of between 4 and 5 node ids with a caption for each step |
| TOR-08-5Vj2zkG | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall focus each step's node in the active layout mode and display that node's detail alongside the step's tour caption |
| TOR-08-CE4svkF | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall advance to the next node in the curated path when the visitor activates the "Next" control, with each consecutive pair of steps connected by a real edge in the graph |
| TOR-08-XeNIfIf | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall display a step indicator reporting the current step number and the total number of steps |
| TOR-08-GvZKcLR | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall offer an "Explore on your own" control at its final step that exits the tour when activated |
| TOR-08-RCP0xbr | `docs/requirements/08-onboarding-and-tour.feature.md` | The guided tour shall leave the current step's node selected in the graph and side panel when the tour is exited |

## Key Components

### Frontend

- `components/graph/GuidedTour.tsx` — new: tour controls, step indicator, caption surface, exit paths
- `lib/tour-definition.ts` — new: static curated node-id/caption list, validated against graph-data.json edges
- `components/graph/SidePanel.tsx` — render the tour caption alongside node detail
- `app/graph/page.tsx` — tour state driving the shared selection path per active layout mode

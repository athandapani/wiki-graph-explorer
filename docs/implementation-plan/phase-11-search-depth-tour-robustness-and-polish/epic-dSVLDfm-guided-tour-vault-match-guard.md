# Epic dSVLDfm: Guided Tour Vault-Match Guard

**Phase:** 11 — Search Depth, Tour Robustness & Polish
**Status:** Not Started
**Dependencies:** Epic 2Ze47tg (Guided Tour)

> **Brand:** Use the project's brand guidelines skill for the "Take a tour" control's
> hidden/disabled treatment if one is configured.

---

## Description

`TOUR_DEFINITION` (`lib/tour-definition.ts`) is a static, hand-curated list of 4-5 node ids
specific to the demo vault (ConOps §8) — by design, never auto-generated. The npm-distributed
CLI's `--serve` flag (and any local build) can point `graph-data.json` at a completely different
vault, in which case none of those curated node ids exist in the loaded data. Today,
`GuidedTour.tsx` renders its "Take a tour" button unconditionally whenever `stepIndex === null`,
with no check against the loaded graph — starting the tour against a mismatched vault would
attempt to focus a node that doesn't exist. This epic adds the missing guard: the control is
omitted whenever the loaded `graph-data.json` doesn't contain every tour-definition node id, and
displays normally otherwise.

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
| TOR-08-6uTWvws | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page shall omit its "Take a tour" control when one or more node ids in the static tour definition are absent from the loaded graph-data.json |
| TOR-08-rfVJZHR | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page shall display its "Take a tour" control normally when every node id in the static tour definition is present in the loaded graph-data.json |

## Key Components

### Frontend

- `lib/tour-definition.ts` — add an `isTourAvailable(tour, nodeIds)` helper alongside the
  existing `validateTourDefinition()`, checking every `TourStep.nodeId` is present in the
  loaded node id set
- `app/graph/page.tsx` — compute tour availability from the fetched `graph-data.json` nodes and
  `TOUR_DEFINITION`, and pass the result down to `GuidedTour`
- `components/graph/GuidedTour.tsx` — accept an `available` prop; render nothing (instead of the
  "Take a tour" button) when `available` is false, unchanged otherwise

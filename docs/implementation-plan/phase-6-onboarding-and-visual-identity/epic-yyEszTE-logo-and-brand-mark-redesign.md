# Epic yyEszTE: Logo & Brand Mark Redesign

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** —

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Replace the current logo (`components/graph/Logo.tsx`) — a small abstract line/dot SVG rendered at
24×24px — with a more distinctive, modern mark. A design-flair review of the live app (2026-07-16)
flagged the existing mark as functional but forgettable: at 24px it reads as generic geometry
rather than a recognizable brand element, and the browser tab still shows the default Next.js
favicon rather than a matching icon. `TOR-07-Ht6rMqL` already requires a header logo and title —
this epic satisfies that requirement with a more considered mark rather than changing what's
required.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|----------------|
| TOR-07-Ht6rMqL | `docs/requirements/07-product-shell-and-theming.feature.md` | The / and /graph pages shall display a header with the product logo and title, and the browser tab title shall reflect the product |

## Key Components

### Frontend

- `components/graph/Logo.tsx` — replace the current abstract line/dot SVG with a new mark; keep the
  `role="img"`/`aria-label` accessibility contract and `currentColor` theming (so it still adapts to
  dark/light and to the `text-blue-500` accent class applied in `Header.tsx`)
- `components/graph/Header.tsx` — adjust logo sizing/spacing if the new mark's proportions differ
  from the current 24×24 viewBox
- `app/favicon.ico` — replace the default Next.js favicon with an icon derived from the new mark, so
  the browser tab matches the in-page logo (currently mismatched: the tab shows the generic Next.js
  icon while the header shows the app's own mark)

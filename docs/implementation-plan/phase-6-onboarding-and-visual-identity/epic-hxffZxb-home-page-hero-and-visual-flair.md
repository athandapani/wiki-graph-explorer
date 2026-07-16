# Epic hxffZxb: Home Page Hero & Visual Flair

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** —

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Give the home page (`app/page.tsx`) a real first impression instead of a floating text column. A
design-flair review of the live app (2026-07-16) found the page rendering as a narrow centered
column on an otherwise-empty 1440px-wide viewport — roughly 200px of dead space above the heading,
the entire right half of the screen empty, and no visual proof of what the tool does before a
visitor clicks through to `/graph`. For a job-seeking artifact, the home page is the first few
seconds of impression, and today it's plain text on black. `TOR-07-Yp2cVxJ` already requires a
product description, "how to use it" content, and a CTA into `/graph` — this epic satisfies that
requirement with a considered visual layout rather than changing what's required. The exact
treatment (hero imagery, a static graph preview/teaser, or another visual device) is an
implementation-time design decision, not fixed by this spec.

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
| TOR-07-Yp2cVxJ | `docs/requirements/07-product-shell-and-theming.feature.md` | The / page shall present a product introduction and call-to-action into /graph instead of the default Next.js starter content |

## Key Components

### Frontend

- `app/page.tsx` — replace the centered-column-on-empty-viewport layout with a real hero
  composition (e.g. a two-column or full-bleed layout using the currently-unused viewport space);
  keep the existing product description, "how to use it" list, and CTA content — this is a layout
  and visual-treatment change, not a content rewrite
- `app/globals.css` — any new layout primitives (grid/flex containers) the hero composition needs,
  consistent with whatever surface-palette tokens exist at implementation time (see epic xvzgc4Z,
  which owns the declared palette and folder-color accent system this hero should draw from if that
  epic has landed first)

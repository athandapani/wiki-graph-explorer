# Epic xvzgc4Z: Visual Identity, Typography & Hero

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** Epic H0q48k8 (lane containers and headings to style)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Commit the page to a deliberate visual identity: actually apply Geist (it was loaded via next/font but
`globals.css` hardcoded Arial, so it was paid for in bundle size and never seen — issue #4 A9), adopt a
declared surface palette that reuses the folder colors as the accent system (B10), establish a
typographic hierarchy, and add the hero row stating what the page is and inviting interaction (B1).

Also adds visible keyboard focus indicators across every interactive control. That is an accessibility
floor rather than polish: a keyboard visitor who cannot see where focus sits cannot use the page at
all.

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
| TOR-07-37VPhrV | `docs/requirements/07-product-shell-and-theming.feature.md` | The / and /graph pages shall render body and heading text in the Geist typeface, never falling back to Arial or a generic sans-serif default |
| TOR-07-DsHsIKN | `docs/requirements/07-product-shell-and-theming.feature.md` | The /graph page shall render a visible typographic hierarchy in which the hero heading, section and lane headings, and side-panel body text are distinguishable by size and weight |
| TOR-07-7ha0SK5 | `docs/requirements/07-product-shell-and-theming.feature.md` | The / and /graph pages shall render surfaces from a declared palette in which the graph's folder colors serve as the interface accent colors |
| TOR-07-juwVT2o | `docs/requirements/07-product-shell-and-theming.feature.md` | The /graph page shall render a visible focus indicator on every interactive control when that control receives keyboard focus |
| TOR-08-qBVi9Aa | `docs/requirements/08-onboarding-and-tour.feature.md` | The /graph page shall display a hero row above the board stating the page's identity and a one-line promise inviting interaction |

## Key Components

### Frontend

- `app/globals.css` — remove the hardcoded Arial stack; declare the surface palette and folder-accent tokens; focus-visible treatment
- `app/layout.tsx` — bind the Geist next/font variables to the body
- `components/graph/Header.tsx` — hero row: page identity and one-line promise
- `components/graph/nodeColor.ts` — folder colors exported as the shared accent source

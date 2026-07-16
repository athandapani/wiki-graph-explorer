# Epic vH3Ls3h: Icon-Only Options Menu

**Phase:** 6 — Onboarding & Visual Identity
**Status:** Not Started
**Dependencies:** —

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Replace the text-label "Options & help" button (`components/graph/OptionsPanel.tsx`) with an
icon-only hamburger control (three horizontal lines) in the top-right corner, matching the
icon-menu convention used by most modern sites. A design-flair review of the live app
(2026-07-16) flagged the current button as a plain bordered rectangle with text — the only piece
of page chrome using a text label where an icon convention is now standard. `TOR-06-DRtjcOk`
already requires only "a visible, persistent control for opening layout-mode options" — it does
not mandate a text label, so an icon-only button satisfies the existing requirement as written.

This epic covers the icon conversion only. It does **not** relocate the "Why build this" explainer
section (`components/graph/ExplainerSection.tsx`) into this menu — `TOR-05-G72S3H4` requires a
visitor be able to "scroll to" the explainer section, and moving it fully behind a click-to-open
menu would contradict that scenario as written. That relocation is deferred pending a
`/peak-workflow:capture-requirements` pass to either amend `TOR-05-G72S3H4` or settle on a
dual-surface approach (explainer stays in the page flow, with a shortcut link added to this menu).

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
| TOR-06-DRtjcOk | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall provide a persistent control for switching between force-directed and swim-lane rendering modes |

## Key Components

### Frontend

- `components/graph/OptionsPanel.tsx` — replace the text button (`"Options & help"`) with an
  icon-only hamburger button (three horizontal lines), keeping the existing `aria-expanded` state,
  click-outside-to-close backdrop, and the panel's Diagram Style / Color Theme / Help sections
  unchanged; add an `aria-label` (e.g. `"Options & help"`) so the icon-only button remains
  accessible to screen readers and keeps a discoverable name for `TOR-07-juwVT2o`'s focus-indicator
  requirement

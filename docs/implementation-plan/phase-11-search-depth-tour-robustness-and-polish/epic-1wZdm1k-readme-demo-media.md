# Epic 1wZdm1k: README Demo Media

**Phase:** 11 — Search Depth, Tour Robustness & Polish
**Status:** Not Started
**Dependencies:** —

---

## Description

`README.md` already carries static per-feature screenshots (swim-lane, force-directed, search,
dual-pane, theme chooser — see the "Screenshots" section), but a cold visitor evaluating the
project from GitHub or npm sees those only after scrolling past the Features list. An animated
demo (GIF or video) placed near the top, before "Getting Started," proves the graph is genuinely
interactive before the visitor has clicked anything themselves — closing the same "verifiable
artifact, not a case-study screenshot" gap the project's other transparency features (GitHub
source links, provenance footer) exist to close.

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
| TOR-12-a4ESHYa | `docs/requirements/12-repository-documentation.feature.md` | The README shall embed an animated demo (GIF or video) positioned before the "Getting Started" section, showing the /graph page's core click-to-explore interaction |
| TOR-12-T1Bb2fG | `docs/requirements/12-repository-documentation.feature.md` | The README shall reference only demo media assets that exist in the repository, with no broken embed links |

## Key Components

- `README.md` — insert an animated demo embed (Markdown image/video syntax) before the
  "## Getting Started" heading, after the existing intro paragraph and Features list
- `docs/images/` — new demo asset file (GIF or short video) alongside the existing static
  screenshots already stored there

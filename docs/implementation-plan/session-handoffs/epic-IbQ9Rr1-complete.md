# Epic IbQ9Rr1: Explainer & Missing-Link Discovery — Complete

**Completed:** 2026-07-15
**Verified by:** Independent review via `/peak-workflow:wrapup-epic IbQ9Rr1`

## What Was Built

A static "why build this" explainer section below the graph on `/graph`, status and folder/taxonomy
filters that dim non-matching nodes in force-directed mode, and a visual edge-count indicator that
shrinks a node's radius relative to its folder cluster's best-connected peer — letting a visitor
isolate a cluster, spot an under-connected node by its visibly smaller size, click it, and see its
full (never truncated) related-node list in the existing side panel.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/ExplainerSection.tsx` | Static "why build this" content: second-brain/dynamic-context benefits, missing-link narrative, "Try it yourself" walkthrough |
| `components/graph/FilterControls.tsx` | Status/folder `<select>` dropdowns (dataset-derived options) plus pure helper `computeFilteredOutNodeIds()` |
| `components/graph/edgeCountIndicator.ts` | `computeDegrees()` and `computeRadiusScale()` — scales each node's radius relative to its own folder/taxonomy cluster's max-degree peer |
| `components/graph/GraphCanvas.tsx` | `filteredOutNodeIds` and `radiusScaleByNodeId` props drive node dimming, radius, label offset, and click hit-area |
| `app/graph/page.tsx` | Renders `<FilterControls>` (force-directed mode only) and `<ExplainerSection>`; page wrapper restructured to scroll to the explainer without breaking canvas auto-sizing |
| `components/graph/PillNode.tsx` | **Fixed during wrapup** — added `isDimmed` prop (opacity-30) so swim-lane pills dim when a node is active and they're not part of its connection set |
| `components/graph/SwimLaneCanvas.tsx` | **Fixed during wrapup** — computes `highlightedIds` (active node + its related nodes) to drive pill dimming; connector-line SVG moved to `-z-10` so lines render behind pills instead of over their text |
| `tests/explainer-section.test.ts`, `tests/filter-controls.test.ts`, `tests/edge-count-indicator.test.ts` | Test coverage for the three new modules |
| `tests/graph-page.test.ts`, `tests/graph-canvas.test.ts`, `tests/side-panel.test.ts` | Extended with TOR-05-* coverage |
| `tests/pill-node.test.ts`, `tests/swim-lane-canvas.test.ts` | Extended with coverage for the dimming/z-order fix |

## Key Decisions

- **Scope: force-directed mode only** for the epic's own TOR-05 filtering/edge-count work. Confirmed
  with the user before planning — mirrors the existing swim-lane search-filtering gap precedent in
  `docs/design-notes.md` §27.
- **TOR-05-EmhMDFS required no new production code.** `SidePanel.tsx` (epic V3PlLFL) already
  rendered every related-node entry untruncated — confirmed by direct source inspection and live
  click (28-item related list). Only a formal test citing the TOR was added.
- **Radius scaling is continuous, not binary** — `computeRadiusScale()` scales each node between
  `MIN_RADIUS_SCALE` (0.5) and `MAX_RADIUS_SCALE` (1.0) proportional to `degree / maxDegreeInCluster`
  within its own folder.
- **Post-verification correction (user-directed, swim-lane mode):** during the Step 2.0 manual-
  verification disclosure, the user identified two swim-lane UX issues found through hands-on use —
  unconnected pills weren't dimmed when a node was clicked, and connector lines rendered on top of
  pill text, hurting readability. Neither is a TOR-06 requirement (that feature file only specifies
  connector-line drawing/clearing and low-degree node reveal, not dimming or explicit z-order), but
  both were fixed in this epic's wrapup session at the user's direction: `SwimLaneCanvas` now computes
  a `highlightedIds` set (active node + its direct connections) and passes `isDimmed` to every
  non-matching `PillNode`; the connector-line `<svg>` moved from implicit stacking-order (painted
  above in-flow content) to `-z-10`, placing it behind the pills.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-05-G72S3H4 | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | tests/explainer-section.test.ts:11 |
| TOR-05-dfhLAbM | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | tests/filter-controls.test.ts:17 |
| TOR-05-UPr1Am6 | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | tests/filter-controls.test.ts:22 |
| TOR-05-02VIaa3 | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | tests/edge-count-indicator.test.ts:41 |
| TOR-05-EmhMDFS | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | tests/side-panel.test.ts:68 |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS
- Quality Gates: 4/4 PASS
- Tests: 144 passed, 0 skipped, 0 failed (33 test files)

### Highlights
- ✅ TOR-05-G72S3H4 — explainer section renders "Why build this" with second-brain/dynamic-context/missing-link narrative; live-confirmed reachable by scrolling (tests/explainer-section.test.ts:11, components/graph/ExplainerSection.tsx)
- ✅ TOR-05-dfhLAbM / TOR-05-UPr1Am6 — status/folder filters computed via pure `computeFilteredOutNodeIds()`; live-confirmed with real dataset-derived dropdown options in force-directed mode (components/graph/FilterControls.tsx:70)
- ✅ TOR-05-02VIaa3 — `computeRadiusScale()` scales node radius by degree relative to folder-cluster max; live-confirmed via screenshot, a real hub node rendered visibly larger than its cluster peers (components/graph/edgeCountIndicator.ts:41)
- ✅ TOR-05-EmhMDFS — side panel's pre-existing `relatedNodes.map(...)` renders the complete list, no truncation; live-confirmed clicking a real hub node opened a full 13-item related list (components/graph/SidePanel.tsx)
- ⚠️ **Found and fixed during verification**: `npm test` initially failed 1/141 — the new `tests/explainer-section.test.ts` used `expect(source).toMatch(/second-brain/i)`, whose regex-literal source text `/second-brain/` is itself path-shaped and tripped the pre-existing TOR-01-lgzWfrv vault-safety guard (a regression this epic introduced into an already-Verified requirement from a prior epic). Fixed by rewriting the assertion as `expect(source.toLowerCase()).toContain("second-brain")` — test-only change, no production-code impact. Full suite now passes clean.

### Conclusion
All five TOR-05 requirements are independently confirmed via test + source inspection + live Playwright verification against the real `second-brain` vault (dev server, zero console errors). One real regression in the implementer's own quality-gate claim was found and fixed (a false-positive trip of an unrelated, already-verified TOR-01 guard test). All CLAUDE.md quality gates (test, lint, typecheck, build) pass.

### Manual verification performed: Yes
User reported two swim-lane-mode UX issues from hands-on use of the running app: (1) clicking a node did not dim unconnected pills, so the active node's connections didn't visually stand out; (2) the animated connector line rendered on top of pill text, hurting readability. Both were fixed during this wrapup session (see Key Decisions) and re-verified live via Playwright against the real vault — dimming and below-pill z-order confirmed working, zero console errors.

## Known Issues / Follow-ups

- **Swim-lane filtering/edge-count indicator remain deferred** (scope decision) — same precedent as the existing swim-lane search-filtering gap noted in `docs/design-notes.md` §27.
- **A `status: ""` (empty string) value exists in the real `second-brain` dataset**, surfaced by the status filter dropdown showing a blank option alongside `current`/`superseded`. Real-data quality artifact from the build pipeline, out of scope for this epic — `FilterControls` faithfully reflects whatever distinct status values exist rather than hardcoding a fixed set. Worth a follow-up in the build-pipeline epics if a cleaner default status is desired.
- **Swim-lane layout mode does not persist the visitor's force-directed/swim-lane selection across a full page reload** — observed during this wrapup's live verification (reloading always lands back in swim-lane mode). Not a TOR-06 requirement (only pan/zoom-state restoration within a session is specified) and pre-dates this epic, but worth a follow-up if a persistent layout-mode preference is desired.

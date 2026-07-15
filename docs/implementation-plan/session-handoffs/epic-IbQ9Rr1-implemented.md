# Epic IbQ9Rr1: Explainer & Missing-Link Discovery — Implemented

## What Was Built

Added a static "why build this" explainer section below the graph on `/graph` (reachable by
scroll), status and folder/taxonomy filters that dim non-matching nodes in force-directed mode,
and a visual edge-count indicator that shrinks a node's radius relative to its folder cluster's
best-connected peer — letting a visitor isolate a cluster, spot an under-connected node by its
visibly smaller size, click it, and see its full (never truncated) related-node list in the
existing side panel.

## Key Files

| File | Change |
|---|---|
| `components/graph/ExplainerSection.tsx` | **New** — static "why build this" content: second-brain/dynamic-context benefits, how graph visualization surfaces missing links, "Try it yourself" walkthrough tying filters + edge-count indicator + side panel together |
| `components/graph/FilterControls.tsx` | **New** — status/folder `<select>` dropdowns (options derived from the live dataset, not hardcoded) plus exported pure helper `computeFilteredOutNodeIds()` |
| `components/graph/edgeCountIndicator.ts` | **New** — `computeDegrees()` and `computeRadiusScale()`; scales each node's radius relative to its own folder/taxonomy cluster's max-degree peer |
| `components/graph/GraphCanvas.tsx` | Added `filteredOutNodeIds` prop (OR'd into the existing search-dimming boolean) and `radiusScaleByNodeId` prop (drives node radius in the canvas draw, label offset, and click hit-area) |
| `app/graph/page.tsx` | Renders `<FilterControls>` (force-directed mode only) and `<ExplainerSection>`; restructured the page wrapper so the graph section keeps its original fixed-height sizing (`h-full` + `overflow-hidden` + `shrink-0`) inside a new scrollable outer container, letting the page scroll to the explainer without breaking `GraphCanvas`/`SwimLaneCanvas` auto-sizing |
| `tests/explainer-section.test.ts`, `tests/filter-controls.test.ts`, `tests/edge-count-indicator.test.ts` | **New** — test coverage for the three new modules |
| `tests/graph-page.test.ts`, `tests/graph-canvas.test.ts`, `tests/side-panel.test.ts` | Extended with TOR-05-* coverage |
| `tests/swim-lane-canvas.test.ts`, `tests/graph-canvas.test.ts` | Fixed two pre-existing CRLF/LF multi-line string-match failures unrelated to this epic's scope (see Known Issues) |

## Key Decisions

- **Scope: force-directed mode only.** Filtering and the edge-count indicator apply only to
  `GraphCanvas` (force-directed), not `SwimLaneCanvas`. Confirmed with the user before planning —
  this mirrors the existing precedent in `docs/design-notes.md` §27, which already defers
  swim-lane search-filtering as a known gap. Swim-lane filtering/indicator support remains a
  documented follow-up, not a silent omission.
- **TOR-05-EmhMDFS required no new production code.** `components/graph/SidePanel.tsx` (built in
  epic V3PlLFL) already renders every related-node entry untruncated and shows "No related pages."
  when empty — confirmed by direct source inspection and live click (28-item related list rendered
  in full for a real high-degree node). Only a formal test citing the TOR was added.
- **Radius scaling is continuous, not binary.** `computeRadiusScale()` scales each node between
  `MIN_RADIUS_SCALE` (0.5) and `MAX_RADIUS_SCALE` (1.0) proportional to `degree / maxDegreeInCluster`
  within its own folder — this satisfies the TOR's "relative to their cluster peers" wording more
  directly than a single hardcoded under-connected/not-under-connected threshold, and lets peers be
  visually compared by size rather than just flagging one node as anomalous.
- **Real-world layout bug found and fixed during verification.** The initial page restructuring
  (needed to let the page scroll past the graph to reach the explainer) accidentally broke
  `GraphCanvas`'s auto-sizing by swapping the wrapper's fixed `h-full` for `min-h-screen`/`h-screen`
  — flexbox only forces a `flex-1` child to shrink when its ancestor has a genuinely fixed height,
  not just a `min-height` floor. Root-caused via a live Playwright diagnostic comparing the same
  measurement against unmodified `master` (confirmed a related, pre-existing, harmless
  react-force-graph-2d canvas-oversizing quirk that's silently clipped by `overflow-hidden` either
  way). Fixed by keeping the original proven-working `h-full flex-col overflow-hidden` wrapper
  byte-identical, nesting it inside a new scrollable outer container with `shrink-0` so flexbox
  can't compress it to fit.

## Spec Deviations

None. All five TORs were implemented as written; the force-directed-only scope is a scope
decision made before implementation (the TORs don't specify a layout mode), not a deviation from
any TOR's literal Given/When/Then.

## TOR Coverage

| TOR ID | Verdict | Test | Implementation |
|---|---|---|---|
| TOR-05-G72S3H4 | PASS | `tests/explainer-section.test.ts`, `tests/graph-page.test.ts` | `components/graph/ExplainerSection.tsx`, `app/graph/page.tsx` — live-verified: scrolling the outer container reveals the explainer heading/text below the graph |
| TOR-05-dfhLAbM | PASS | `tests/filter-controls.test.ts` | `components/graph/FilterControls.tsx`, `components/graph/GraphCanvas.tsx` — live-verified: status dropdown options reflect real dataset values (`current`/`superseded`), selecting one re-renders without error |
| TOR-05-UPr1Am6 | PASS | `tests/filter-controls.test.ts` | `components/graph/FilterControls.tsx`, `components/graph/GraphCanvas.tsx` — live-verified: folder dropdown options reflect real folder taxonomy, selecting one re-renders without error |
| TOR-05-02VIaa3 | PASS | `tests/edge-count-indicator.test.ts`, `tests/graph-canvas.test.ts` | `components/graph/edgeCountIndicator.ts`, `components/graph/GraphCanvas.tsx` — live-verified via screenshot: a folder cluster's hub node renders visibly larger than its lower-degree peers |
| TOR-05-EmhMDFS | PASS | `tests/side-panel.test.ts` | `components/graph/SidePanel.tsx` (pre-existing, epic V3PlLFL) — live-verified: clicking a high-degree node opened the side panel with all 28 related pages listed, no truncation |

## Verification Results

- `npm test` — PASS (33 test files, 141 tests)
- `npm run lint` — PASS (no output/errors)
- `npm run typecheck` — PASS (no output/errors)
- `npm run build` — PASS (`next build`, static export succeeded, `/` and `/graph` prerendered)
- Live verification: `npm run dev` against the existing local build output for the real
  `second-brain` vault (47 nodes / 96 edges, gitignored, not committed), driven with the
  `playwright` package directly (the `plugin_playwright` MCP server had disconnected mid-session —
  see Known Issues) at 1280×800. Confirmed: FilterControls dropdowns present with dataset-derived
  options, filter selection doesn't crash the canvas, explainer section reachable and readable by
  scrolling the page, edge-count radius variance visible between a cluster's hub and peripheral
  nodes, and a full 28-item untruncated related-node list rendered in the side panel after
  clicking a real high-degree node. Zero console errors across the session. Scratch screenshots
  and a temporary verification script were deleted after review; nothing from this verification
  was committed.

## Known Issues / Follow-ups

- **Swim-lane filtering/edge-count indicator remain deferred** (scope decision, see Key
  Decisions) — same precedent as the existing swim-lane search-filtering gap noted in
  `docs/design-notes.md` §27.
- **Two pre-existing CRLF/LF test bugs fixed as a side effect of this epic's `npm test` gate.**
  `tests/swim-lane-canvas.test.ts` and one assertion in `tests/graph-canvas.test.ts` (both from
  epic scQi8pt) used multi-line string literals with `\n` that never matched the repo's CRLF
  (`core.autocrlf=true`) line endings on this Windows checkout. Fixed by splitting into
  single-line assertions — no production code was affected, purely a test-fragility fix required
  to get a clean `npm test` baseline for this epic's own gate.
- **A `status: ""` (empty string) value exists in the real `second-brain` dataset**, surfaced by
  the new status filter dropdown showing a blank option alongside `current`/`superseded`. This is
  a real-data quality artifact from the build pipeline (some page's frontmatter is missing/empty
  `status`), out of scope for this epic — `FilterControls` faithfully reflects whatever distinct
  status values exist rather than hardcoding a fixed set, per design. Worth a follow-up in the
  build-pipeline epics if a cleaner default status is desired.

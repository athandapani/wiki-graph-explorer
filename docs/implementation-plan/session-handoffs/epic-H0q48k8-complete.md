# Epic H0q48k8: Swim-Lane Board Completion — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic H0q48k8`

## What Was Built

The swim-lane board (the `/graph` default view) now surfaces every hidden low-connectivity node
behind a per-lane "+N more" affordance instead of silently dropping them, sizes pills to their
full title text with no ellipsis truncation, renders each lane as a tinted rounded container with
a heading and a page-count descriptor, and the "Why build this" explainer now names
force-directed mode as where the filter and node-sizing affordances it describes actually live.

## Key Files

| File | Purpose |
|------|---------|
| `lib/lane-assignment.ts` | `assignLanes` gains an optional `hiddenNodes` second parameter; folders are ranked by combined visible+hidden count; each `Lane` gains a `hiddenNodeIds` field |
| `components/graph/SwimLaneCanvas.tsx` | New `zeroDegreeIds` and `hiddenCandidateNodes` memos feed `assignLanes`'s hidden-nodes parameter; `expandedLaneNames` state drives the "+N more" affordance and its expansion; lanes render as tinted rounded containers with a heading + page-count descriptor; `MIN_LANE_HEIGHT_PX` raised from 52 to 84 to fit the new descriptor line without clipping the affordance |
| `components/graph/PillNode.tsx` | Removed `max-w-[150px]` + `truncate`, added `whitespace-nowrap` — pills now size to their full title |
| `components/graph/ExplainerSection.tsx` | "Try it yourself" paragraph now opens with "In **force-directed** mode (switch via Options & help), ..." |
| `tests/lane-assignment.test.ts`, `tests/swim-lane-canvas.test.ts`, `tests/pill-node.test.ts`, `tests/explainer-section.test.ts` | New/updated coverage for all 6 TORs |

## Key Decisions

- Hidden nodes (zero-degree and low-degree/degree-1) are counted toward a folder's total when
  deciding which 4 folders get named lanes vs. collapsing into "Other" — a folder whose members
  are entirely hidden still earns its own lane (heading + "+N more") rather than vanishing
  silently, per TOR-06-BxA7IRn's transparency intent.
- Lane expansion state (`expandedLaneNames`) is local, per-session UI state — not persisted —
  and once a lane is expanded it stays expanded for the rest of the session (no collapse
  affordance was scoped).
- `MIN_LANE_HEIGHT_PX` was raised from 52 to 84 during implementation to accommodate the new
  descriptor line without clipping the "+N more" button on zero-visible-node lanes — caught and
  fixed during the implementer's own verification pass, confirmed still correct during this
  independent review (live-rendered `raw/2026-07 (0)` lane fully shows its "+5 more" button).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-06-BxA7IRn | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/lane-assignment.test.ts`, `tests/swim-lane-canvas.test.ts`; live-verified |
| TOR-06-YjETzyC | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified |
| TOR-06-ihpx0Ya | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified |
| TOR-06-cSCqVtt | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/pill-node.test.ts`; live-verified |
| TOR-06-JuNSwaW | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified (both themes) |
| TOR-05-OMWVZWL | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | `tests/explainer-section.test.ts`; live-verified |

## Verification Summary

### Counts
- TOR Requirements: 6/6 PASS
- Quality Gates: 4/4 PASS (build, lint, typecheck, full test suite 227/227)
- Tests: 227 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-06-BxA7IRn — live against real `second-brain` data (47 nodes/96 edges): `raw/2026-07` lane showed "+5 more", `wiki/sources` showed "+2 more", `Other` showed "+1 more" — all exact counts (`lib/lane-assignment.ts:24-57`, `components/graph/SwimLaneCanvas.tsx:351-360`)
- ✅ TOR-06-YjETzyC — clicked "+2 more" in `wiki/sources`; both hidden nodes rendered as dashed pills, and clicking one opened the side panel with title/tags/status dot/"View source on GitHub" link identically to a normal pill (`SwimLaneCanvas.tsx:281-283,300`)
- ✅ TOR-06-ihpx0Ya — `wiki/people` and `wiki/concepts` (fully-connected lanes) never showed an affordance; `wiki/sources`'s affordance disappeared immediately once expanded
- ✅ TOR-06-cSCqVtt — long titles (e.g. "Your LLM Has Been Forgetting Everything — Karpathy's Wiki Pattern Is the Fix") rendered in full with no ellipsis, confirmed visually in both themes (`PillNode.tsx:34`, no `max-w`/`truncate`)
- ✅ TOR-06-JuNSwaW — every lane rendered as a distinctly-tinted rounded container with folder heading + "N pages total" descriptor, confirmed visually in light and dark themes
- ✅ TOR-05-OMWVZWL — explainer names "force-directed" explicitly; independently confirmed in `app/graph/page.tsx:119-127` that `FilterControls` and `radiusScaleByNodeId` (node-sizing) are exclusively wired to force-directed mode, and live-confirmed the Options panel only exposes the mode toggle there, not filters

### Conclusion
All 6 TOR Given/When/Then behaviors are independently confirmed both by source inspection and live
interaction against real second-brain-derived data, in both themes, with zero console errors.
Quality gates are clean. This is sufficient for sign-off.

### Manual verification performed: No

## Known Issues / Follow-ups

- The 6 new TORs' automated test coverage in `tests/*.test.ts` is source-string assertion
  (`toContain`/regex against raw component source) rather than rendered-DOM interaction tests.
  This is consistent with this codebase's existing convention for most swim-lane TORs (not a new
  gap introduced by this epic), but it means test-level confidence alone is weaker than a DOM
  test would give — live `playwright-cli` verification was relied on as the primary evidence
  during this review rather than the test pass alone.
- `docs/architecture.md` and `docs/design-notes.md` predate this epic's new affordances (the
  "+N more" reveal, tinted lane containers, full-title pill sizing) — addressed by the automatic
  doc refresh that follows this handoff.

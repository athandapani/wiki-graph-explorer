# Epic H0q48k8: Swim-Lane Board Completion — Implemented

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

## Spec Deviations

None. Implemented exactly as scoped.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-06-BxA7IRn | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/lane-assignment.test.ts`, `tests/swim-lane-canvas.test.ts`; live-verified against real `second-brain` data (47 nodes) — "raw/2026-07" lane (0 visible, 5 hidden) and "wiki/sources" lane (4 visible, 2 hidden) both showed exact-count "+N more" affordances |
| TOR-06-YjETzyC | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified — clicking "+2 more" in wiki/sources rendered both hidden nodes as dashed, clickable pills that opened the side panel identically to a normal pill click |
| TOR-06-ihpx0Ya | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified — the affordance disappeared immediately after activation, and fully-connected lanes never showed one |
| TOR-06-cSCqVtt | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/pill-node.test.ts`; live-verified — a 78-character title ("Your LLM Has Been Forgetting Everything — Karpathy's Wiki Pattern Is the Fix") rendered in full with no ellipsis |
| TOR-06-JuNSwaW | `docs/requirements/06-swim-lane-layout.feature.md` | PASS | `tests/swim-lane-canvas.test.ts`; live-verified in both themes — every lane renders as a tinted rounded container with its folder heading and a "{N} pages total" descriptor |
| TOR-05-OMWVZWL | `docs/requirements/05-explainer-and-discovery.feature.md` | PASS | `tests/explainer-section.test.ts`; live-verified — the explainer names "force-directed mode," and switching to that mode confirmed both the status/folder filters and node-size-by-degree affordance are genuinely present there |

## Verification Results

- `npx vitest run tests/lane-assignment.test.ts tests/swim-lane-canvas.test.ts tests/pill-node.test.ts tests/explainer-section.test.ts` — PASS (all new + existing tests)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (227/227, up from 217 — 10 new tests added)
- Live `playwright-cli` verification against real `second-brain` vault data (47 nodes, 96 edges —
  matches the exact dataset the issue #4 design-flair review was based on): confirmed tinted lane
  containers with headings/descriptors in both themes, "+N more" affordances with exact counts,
  expansion revealing hidden nodes as clickable dashed pills, full-title pill rendering, and the
  explainer's mode-accurate copy — plus confirmed live that the named affordances (filters,
  node-sizing) are genuinely present in force-directed mode. Zero console errors throughout.

## Known Issues / Follow-ups

- Caught and fixed during verification (not shipped as a bug): the new descriptor line initially
  required a larger `MIN_LANE_HEIGHT_PX` than the pre-existing constant provided, which clipped
  the "+N more" button for zero-visible-node lanes. Fixed by raising the constant from 52 to 84
  before this handoff was written — confirmed via bounding-box inspection that the affordance is
  now fully within its lane's rendered bounds.

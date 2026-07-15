# Epic scQi8pt: Swim-Lane Layout Mode — Session Handoff (Paused)

**Paused:** 2026-07-15
**Reason:** End of session, after a `/peak-workflow:wrapup-epic scQi8pt` run was interrupted mid-flow by a large round of user-driven UX feedback and follow-up implementation work that has not yet been re-verified.

## Important: this is not a normal mid-epic pause

The epic's sidecar (`docs/implementation-plan/status/epic-scQi8pt.md`) says `status: Implemented`,
not `In Progress` — there is no "current task" in the usual `start-epic` sense. What actually
happened this session:

1. Ran `/peak-workflow:wrapup-epic scQi8pt` Phase 1 (Verify) to completion. **All 14 original
   TOR IDs independently verified PASS** (2 marked PASS WITH EXCEPTIONS for a test-style nuance
   that turned out not to be a real gap — this codebase has no DOM testing library, so component
   tests are source-string assertions by design, not a shortcut). Full verification report was
   presented and the user was about to be asked to confirm before Phase 2 (Complete).
2. Before confirming, the user gave a large round of live UX feedback instead (dark theme
   default, swim-lane layout redesign, connector styling, color palette, force-graph
   readability). I implemented all of it directly, outside the peak-workflow ceremony.
3. The user then gave a **second** round of corrections (lanes should be vertical bands not
   columns, fixed always-on side panel, hide disconnected nodes, dotted-line reveal for
   low-connectivity nodes) plus a reference photo of a similar tool. I implemented that too.
4. **None of this has been committed.** The working tree currently holds all of it uncommitted.
5. **None of this has been re-verified against the original TOR Given/When/Then**, and some of
   it actively changes behavior the original TORs describe (see Open Questions below).

## Progress Snapshot

### Original TOR IDs — last formally verified PASS, but stale
All 14 TORs (`TOR-06-DRtjcOk` through `TOR-06-M0SNN90`, see the epic spec's Requirements
Anchors table) were independently verified against real `second-brain` data in Phase 1 of this
session's wrapup-epic run — **before** the subsequent redesign work. The verification report is
no longer trustworthy as-is because the implementation it describes has since changed
substantially (see below). Treat these as "last known good, needs re-verification," not "done."

### New functionality this session — implemented and manually verified live, not covered by any TOR
- Dark-theme-by-default with a light/dark toggle (`ThemeToggle.tsx`, class-based Tailwind dark
  mode, anti-flash inline script, `suppressHydrationWarning`)
- Swim lanes redesigned twice: horizontal-scrolling strips (original) → columns (my
  misreading of "distributed horizontally") → full-width horizontal bands stacked vertically,
  each wrapping pills into rows (the corrected, current, user-confirmed direction)
- Pill colors: real colored border + tint from the dataviz-skill categorical palette
  (light/dark variants), replacing a neutral-gray border with a barely-visible tint
- Connector lines: anchor at each pill's top/bottom mid-point (not center), smooth
  cubic-bezier curve, stroke colored by the **destination** node's folder
- Force-directed mode: removed the small status-dot icon overlay on nodes, added always-visible
  text labels under each node, tightened `d3Force` charge/link-distance so connected clusters
  pack closer together
- `Header` component (logo + "Wiki Graph Explorer" title) on both `/` and `/graph`; fixed the
  browser tab title (was still literally "Create Next App")
- `/` (root page) rewritten from unedited `create-next-app` boilerplate into a real product
  intro + "how to use it" write-up + CTA into `/graph`
- `OptionsPanel` component: consolidates layout-mode toggle + theme toggle + a help write-up
  behind a single persistent "Options & help" button; **default layout mode changed from
  force-directed to swim-lane**
- `SidePanel` converted from a `fixed`/overlay slide-in panel to a real flex-layout column that
  is **always visible** (placeholder text when nothing is selected) and never blocks/covers
  other content
- Swim-lane node hiding: nodes with 0 edges are hidden from the board entirely (permanently —
  nothing can ever link to them); nodes with exactly 1 edge (`LOW_DEGREE_THRESHOLD = 1`) are
  also hidden by default but get dynamically pulled into their lane (dashed pill border) and
  connected with a dashed/dotted line when a clicked node links to them
- Lane sizing: proportional `flexGrow` by node count, with a guaranteed minimum flex-basis
  (`MIN_LANE_HEIGHT_PX = 52`) per lane so small lanes don't get starved to nothing
- **Real bug found and fixed mid-session:** `body`/`/graph` page root used `min-h-full`
  (`min-height: 100%`), which stopped reliably resolving through the flex ancestor chain once
  `Header` was added above the content row — the whole board collapsed to ~270px. Fixed by
  switching to `h-full` (`height: 100%`, definite) at both levels.

All of the above was verified live via Playwright against the real `second-brain` vault
(47 nodes / 96 edges) — connector anchor points, colors, animation timing, no-scrollbar
layout at default viewport, theme toggle + persistence, reveal-on-click dashed styling, and
console-error-free operation in every case tested. `npm test` (124 tests), `npm run lint`,
`npm run typecheck`, and `npm run build` all pass as of the last edit this session.

### Not started
- Re-verification of the 14 original TOR Given/When/Then statements against the current code
- Any reconciliation of TOR wording that the new behavior no longer literally matches (see below)
- Phase 2+ of `/peak-workflow:wrapup-epic` (Complete/Orient/Ship) — never reached
- `/peak-workflow:refresh-docs` — `docs/architecture.md` and `docs/design-notes.md` do not
  reflect any of this session's changes yet

## Files Created/Modified So Far

**New:**
- `components/graph/Header.tsx`, `components/graph/Logo.tsx`, `components/graph/OptionsPanel.tsx`,
  `components/graph/ThemeToggle.tsx`
- `tests/header.test.ts`, `tests/home-page.test.ts`, `tests/options-panel.test.ts`

**Modified:**
- `app/globals.css`, `app/graph/page.tsx`, `app/layout.tsx`, `app/page.tsx`
- `components/graph/GraphCanvas.tsx`, `components/graph/PillNode.tsx`,
  `components/graph/SidePanel.tsx`, `components/graph/SwimLaneCanvas.tsx`,
  `components/graph/nodeColor.ts`
- `lib/connector-line-animation.ts`
- `tests/connector-line-animation.test.ts`, `tests/graph-canvas.test.ts`,
  `tests/graph-page.test.ts`, `tests/pill-node.test.ts`, `tests/side-panel.test.ts`,
  `tests/swim-lane-canvas.test.ts`

All of the above is **uncommitted** in the working tree as of pause time.

## Key Decisions Made So Far

- Dark palette values came from the dataviz skill's `references/palette.md` dark column — the
  codebase previously only had light-mode hex values in `nodeColor.ts`, reused unchanged
  regardless of theme.
- `LOW_DEGREE_THRESHOLD = 1` and `MIN_LANE_HEIGHT_PX = 52` are judgment calls made to fit the
  real `second-brain` dataset on one screen without scrollbars — not user-specified numbers.
  Flag as tunable if the deployed public vault's shape differs.
- `CHARGE_STRENGTH = -6` / `LINK_DISTANCE = 16` for the force-directed simulation were tuned
  empirically against the real vault, not derived analytically.
- `OptionsPanel` reuses the existing `LayoutModeToggle`/`ThemeToggle` components internally
  rather than duplicating their logic — both still have their own tests, now exercised as a
  composed unit.

## Resume Instructions

When resuming this epic, start by:
1. Reading this handoff file.
2. Reading the epic spec: `docs/implementation-plan/phase-3-frontend/epic-scQi8pt-swim-lane-layout-mode.md`
   and its Requirements Anchors table.
3. **The next task is: decide how to reconcile the TOR requirements baseline with the actual
   shipped behavior**, then re-run `/peak-workflow:wrapup-epic scQi8pt` Phase 1 (Verify) against
   whichever baseline is chosen. See Open Questions below — this decision should probably
   involve the user, not be made unilaterally.
4. Nothing is committed yet. Before doing anything destructive (`git checkout`, `git reset`,
   etc.), confirm this uncommitted work is preserved — it represents this entire session.

## Open Questions / Blockers

- **TOR-06-DRtjcOk** literally requires "a visible, persistent toggle control" on the page for
  switching layout modes. The toggle now lives inside a click-to-open "Options & help" panel
  triggered by a persistent button — arguably still "persistent" (the button is always visible)
  but no longer a directly-visible toggle. This is a real product decision the user made
  explicitly, but it diverges from the TOR's literal wording. Needs reconciliation: either amend
  the TOR via `/peak-workflow:capture-requirements` (or a targeted edit) to describe the new
  behavior, or treat it as an intentional, documented exception.
- The default layout mode changed from force-directed to swim-lane. No TOR currently specifies a
  default — worth confirming this isn't implicitly assumed elsewhere (e.g., in ConOps).
- Zero/low-connection node hiding and the dotted-line reveal mechanic are **entirely new
  behavior** with no TOR coverage at all. Per this project's requirements-driven convention (TOR
  is the ground truth for acceptance criteria), this probably needs its own TOR entries before
  the epic can be considered formally complete — or an explicit decision that it's accepted as
  out-of-band UX polish.
- The always-visible `SidePanel` and the `Header`/logo/title/home-page work are also new
  behavior without TOR coverage, for the same reason.
- No visual regression check has been done for narrower viewports (e.g., laptop 1024px width or
  below) — all verification this session used a 1280px-wide viewport. The "no scrollbars"
  guarantee for swim lanes is tuned against that width and the real `second-brain` node counts;
  it has not been stress-tested at other sizes or against the much smaller public/deployed
  vault.

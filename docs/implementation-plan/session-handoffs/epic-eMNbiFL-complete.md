# Epic eMNbiFL: Keyboard De-escalation — Complete

**Completed:** 2026-07-20
**Verified by:** Independent review via `/peak-workflow:wrapup-epic eMNbiFL`

## What Was Built

A single `useEscapeChain` hook resolves Esc precedence across `/graph`'s four dismissible UI
states (guided tour, Options popover, search query, node selection), peeling exactly one layer
per press in that order. `OptionsPanel` became a controlled component so its backdrop unmounts
immediately on close (fixing issue #4 finding A4's click-swallowing bug), and `SearchInput`
forwards its input ref so the chain can command both from `app/graph/page.tsx`.

## Key Files

| File | Purpose |
|------|---------|
| `hooks/useEscapeChain.ts` | New. Ordered `{isActive, onEscape}[]` precedence hook; one `document` keydown listener, ref-latest layers updated via effect (not during render, to satisfy `react-hooks/refs`). |
| `components/graph/OptionsPanel.tsx` | Converted from internal `useState` to controlled `isOpen`/`onOpenChange` props; backdrop button unmounts when closed. |
| `components/graph/SearchInput.tsx` | Wrapped in `forwardRef`, merging the forwarded ref with the existing internal Ctrl+K/`/` focus ref. |
| `components/graph/SwimLaneCanvas.tsx` | New `forceClearSignal` prop — an explicit override for the pre-existing null-blind `focusedNodeId` sync (documented in `docs/design-notes.md` §47), so Esc (unlike the panel's own Close button) actually clears the board's highlight. |
| `components/graph/DualPaneBoard.tsx` | Forwards `swimLaneClearSignal` to its internal `SwimLaneCanvas`. |
| `app/graph/page.tsx` | `isOptionsOpen`/`searchInputRef`/`swimLaneClearSignal` state; `useEscapeChain` call wiring all four layers in priority order. |
| `tests/use-escape-chain.test.tsx`, `tests/options-panel.test.tsx` | New, jsdom+RTL behavioral tests. |
| `tests/options-panel.test.ts`, `tests/search-input.test.tsx`, `tests/graph-page.test.ts`, `tests/dual-pane-board.test.ts`, `tests/swim-lane-canvas.test.tsx` | Extended with new assertions for the controlled/forwarded/wired props and the `forceClearSignal` behavior. |

## Key Decisions

- Esc precedence (tour → Options popover → search → node selection) is expressed as an ordered
  array passed to `useEscapeChain`; the hook itself has no knowledge of what the layers mean, so
  future de-escalatable states can be added by inserting another `{isActive, onEscape}` entry at
  the correct priority position.
- `SwimLaneCanvas`'s `focusedNodeId` sync stays deliberately null-blind (preserves the board
  highlight when the panel's own Close button clears selection — a pinned, tested behavior).
  `forceClearSignal` is an additive, explicit override channel for Esc specifically, not a
  change to that existing invariant.
- The guided tour's node IDs are hand-curated against the deployed public `ai-adoption-wiki`
  vault (`lib/tour-definition.ts`), not the private `second-brain` dev vault — a pre-existing
  constraint from Epic 2Ze47tg, not something this epic changed. Live verification of the
  tour-exit's "node stays selected" sub-clause (TOR-09-L9qGFOu) against `second-brain` could
  only confirm the tour itself exits; the node-retention behavior was confirmed instead by
  reading `handleTourExit`, which deliberately never touches `selectedNode` (the same invariant
  already established under TOR-08-RCP0xbr).

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-09-gEPQ6wm | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/search-input.test.tsx` |
| TOR-09-a6cppkl | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/swim-lane-canvas.test.tsx` |
| TOR-09-4BewmC1 | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/options-panel.test.tsx` |
| TOR-09-L9qGFOu | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS WITH EXCEPTIONS | live (tour-exit confirmed; node-retention verified via code inspection, not live) |
| TOR-09-YrywFkB | `docs/requirements/09-keyboard-and-responsive.feature.md` | PASS | `tests/use-escape-chain.test.tsx` |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS (1 PASS WITH EXCEPTIONS), 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (`npm test`: 328/328; `npm run lint`: clean; `npm run build`: succeeds;
  `npm run typecheck`: clean)
- Tests: 328 passed, 0 skipped, 0 failed (47 test files)

### Highlights
- ✅ TOR-09-YrywFkB — live composite chain run against real second-brain data (47 nodes/96
  edges): node selected + query typed + Options popover open → three sequential Esc presses
  peeled exactly one layer each, in the specified order (`tests/use-escape-chain.test.tsx`,
  `hooks/useEscapeChain.ts`).
- ✅ TOR-09-4BewmC1 — after the popover-closing Esc, an immediate click on a different node
  registered and selected it (not swallowed) — confirms the backdrop unmounts rather than
  lingering (`components/graph/OptionsPanel.tsx`).
- ✅ TOR-09-a6cppkl — independently confirmed the swim-lane pill's `aria-pressed` attribute
  actually cleared on the selection-clearing Esc press, not just the side panel content —
  read directly from the live DOM rather than trusting the test suite alone.
- ⚠️ TOR-09-L9qGFOu — tour exit (caption/step-indicator disappearing) verified live; the
  node-retention sub-clause could not be observed live because this vault's node IDs don't
  match the tour's hand-curated IDs (a pre-existing, documented constraint unrelated to this
  epic) — verified instead by code inspection of `handleTourExit`.

### Conclusion
All 5 TOR Given/When/Then clauses are satisfied by the implementation, independently confirmed
via both source inspection and live `playwright-cli` runs against real second-brain data. The
one partial item is a live-environment limitation from an unrelated, pre-existing tour/vault ID
mismatch, not a gap in the Esc-chain logic itself.

### Manual verification performed: No

## Known Issues / Follow-ups

- None blocking. The tour/vault ID mismatch (TOR-09-L9qGFOu live coverage) is pre-existing from
  Epic 2Ze47tg and only affects local dev verification against `second-brain`; the tour is
  correct against its intended deployed vault.

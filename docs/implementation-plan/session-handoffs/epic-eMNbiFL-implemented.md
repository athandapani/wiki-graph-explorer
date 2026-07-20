# Epic eMNbiFL: Keyboard De-escalation — Implemented

**Implemented:** 2026-07-20

## What Was Built

A single `useEscapeChain` hook resolves Esc precedence across `/graph`'s four dismissible UI
states (guided tour, Options popover, search query, node selection), peeling exactly one layer
per press in that order. `OptionsPanel` became a controlled component and `SearchInput` forwards
its input ref so the chain can command both from `app/graph/page.tsx`. Live verification against
the second-brain build surfaced a real gap beyond the spec's Key Components list: `SwimLaneCanvas`
intentionally never clears its board highlight when `focusedNodeId` goes to `null` (a pinned,
tested behavior for the SidePanel's own Close button), so Esc's node-selection layer needed an
explicit `forceClearSignal` override to actually satisfy TOR-09-a6cppkl's "connector lines,
selection ring, and connection dimming should be removed from the graph."

## Key Files

| File | Purpose |
|------|---------|
| `hooks/useEscapeChain.ts` | New. Ordered `{isActive, onEscape}[]` precedence hook; one `document` keydown listener, ref-latest layers updated via effect (not during render, to satisfy `react-hooks/refs`). |
| `components/graph/OptionsPanel.tsx` | Converted from internal `useState` to controlled `isOpen`/`onOpenChange` props. |
| `components/graph/SearchInput.tsx` | Wrapped in `forwardRef`, merging the forwarded ref with the existing internal Ctrl+K/`/` focus ref. |
| `components/graph/SwimLaneCanvas.tsx` | New `forceClearSignal` prop — an explicit override for the pre-existing null-blind `focusedNodeId` sync, so Esc (unlike the panel's Close button) actually clears the board's highlight. |
| `components/graph/DualPaneBoard.tsx` | Forwards `swimLaneClearSignal` to its internal `SwimLaneCanvas`. |
| `app/graph/page.tsx` | `isOptionsOpen`/`searchInputRef`/`swimLaneClearSignal` state; `useEscapeChain` call wiring all four layers in priority order. |
| `tests/use-escape-chain.test.tsx`, `tests/options-panel.test.tsx` | New, jsdom+RTL behavioral tests. |
| `tests/options-panel.test.ts`, `tests/search-input.test.tsx`, `tests/graph-page.test.ts`, `tests/dual-pane-board.test.ts`, `tests/swim-lane-canvas.test.tsx` | Extended with new assertions for the controlled/forwarded/wired props and the `forceClearSignal` behavior. |

## Spec Deviations

None against any TOR's Given/When/Then. Implementation note (not a deviation): the epic spec's
Key Components list did not name `SwimLaneCanvas.tsx` or `DualPaneBoard.tsx` — both needed a
small addition (`forceClearSignal`/`swimLaneClearSignal`) discovered only through live
`playwright-cli` verification of TOR-09-a6cppkl, not from static analysis alone.

## TOR Coverage

| TOR ID | Verdict | Test Reference | Live Verification |
|--------|---------|-----------------|--------------------|
| TOR-09-gEPQ6wm | PASS | `tests/search-input.test.tsx` ("SearchInput ref forwarding") | 2nd Esc press: query cleared, input blurred |
| TOR-09-a6cppkl | PASS | `tests/swim-lane-canvas.test.tsx` (forceClearSignal case) | 3rd Esc press: panel → "Start anywhere", pill `aria-pressed` → false |
| TOR-09-4BewmC1 | PASS | `tests/options-panel.test.tsx` | 1st Esc press: popover closed; immediate next click selected a node (not swallowed) |
| TOR-09-L9qGFOu | PASS | live only (tour-exit is page-level state, not independently unit-tested) | Esc during tour step: caption/indicator gone, node stayed selected |
| TOR-09-YrywFkB | PASS | `tests/use-escape-chain.test.tsx` (composite precedence case) | Full 3-press sequence run live: popover → query → selection, exactly one layer per press |

## Verification Summary

### Counts
- TOR Requirements: 5/5 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (`npm test`: 328/328; `npm run lint`: clean; `npm run build`: succeeds;
  `npm run typecheck`: clean)
- Tests: 328 passed, 0 skipped, 0 failed (47 test files, 6 new)

### Highlights
- Live `playwright-cli` run against a real second-brain build (47 nodes/96 edges) exercised the
  exact composite TOR-09-YrywFkB scenario end to end: node selected + query typed + Options
  popover open → Esc → only popover closes → Esc → only query clears → Esc → only selection
  clears.
- The `SwimLaneCanvas` gap (TOR-09-a6cppkl) was caught specifically because verification used
  real data and read the actual DOM `aria-pressed` attribute rather than trusting a passing test
  suite — a source-text or shallow-render check would have missed it.
- `react-hooks/refs` (updating a ref during render) caught during `npm run lint`, fixed by moving
  the "always keep the ref current" write into a plain `useEffect`.

### Manual verification performed: Yes — `playwright-cli` against `npm run dev`, live second-brain
build, covering the full de-escalation chain, the popover backdrop/click-through case, and the
guided-tour exit case.

## Known Issues / Follow-ups

- None. No spec deviations; no CANNOT VERIFY items.

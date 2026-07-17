# Epic TakRqyO: Onboarding Surfaces — Complete

**Completed:** 2026-07-17
**Verified by:** Independent review via `/peak-workflow:wrapup-epic TakRqyO`

## What Was Built

The side panel's empty state ("Select a node to see its details...") is now a "Start anywhere"
onboarding card: a built-from line naming the page/folder count, a folder legend (colored to
match the graph) and a status legend (active/revisiting/dormant), and a concrete first-move
suggestion. The footer now presents a single checkable provenance sentence — "Built from K raw
sources → Y wiki pages and Z connections" — that omits the "Built from" clause entirely when the
vault declares no ingested sources, plus an "Esc to reset" hint. Both are scoped to `/graph`
only — the home page's parameterless `<Footer />` is unaffected.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/Legend.tsx` | New — folder legend + status legend |
| `components/graph/SidePanel.tsx` | Empty-state branch replaced with the start-anywhere card |
| `components/graph/Footer.tsx` | Gained optional `nodeCount`/`edgeCount`/`sourceCount` props |
| `app/graph/page.tsx` | `GraphData` interface gained `meta: { sourceCount }` |
| `tests/legend.test.ts`, `tests/legend.test.tsx`, `tests/side-panel.test.ts`, `tests/side-panel.test.tsx`, `tests/footer.test.ts`, `tests/footer.test.tsx` | New/updated coverage for all 9 TORs |

## Key Decisions

- The start-anywhere card's "built from" line is a general framing sentence, distinct from the
  footer's precise `meta.sourceCount`-derived provenance sentence.
- The status legend shows only the status name (not a description) to stay vault-agnostic.
- The "concrete starting point" suggestion is static copy, not a dynamically-computed hub node.
- `Footer`'s stats/Esc-hint content is gated behind optional props so the home page is unaffected.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-08-LuQzsEi | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/side-panel.test.ts, tests/side-panel.test.tsx |
| TOR-08-xZxrwfj | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/legend.test.ts, tests/legend.test.tsx |
| TOR-08-hTq5dSY | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/legend.test.ts, tests/legend.test.tsx |
| TOR-08-Z2By5L0 | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/side-panel.test.ts |
| TOR-08-zwMqZzr | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/side-panel.test.tsx |
| TOR-08-r0Nam2Q | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/side-panel.test.tsx |
| TOR-08-LQAbYTw | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/footer.test.ts, tests/footer.test.tsx |
| TOR-08-dkecfj5 | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/footer.test.ts, tests/footer.test.tsx |
| TOR-08-AzJ7BQu | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | tests/footer.test.ts, tests/footer.test.tsx |

## Verification Summary

### Counts
- TOR Requirements: 9/9 PASS
- Quality Gates: 4/4 PASS (lint, typecheck, build, live playwright)
- Tests: 255 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-08-LuQzsEi, TOR-08-Z2By5L0 — live-verified: start-anywhere card shows title, built-from line, and suggestion whenever no node is selected
- ✅ TOR-08-xZxrwfj, TOR-08-hTq5dSY — live-verified: folder legend (4 real folders) and status legend (3 values) both present
- ✅ TOR-08-zwMqZzr, TOR-08-r0Nam2Q — live-verified: select/deselect swap confirmed against real DOM
- ✅ TOR-08-LQAbYTw, TOR-08-dkecfj5, TOR-08-AzJ7BQu — live-verified exact footer text reproducing the implementer's numbers exactly; home page regression confirmed
- ⚠️ `docs/design-notes.md` §21 is stale (describes the pre-epic placeholder) — deferred to Step 4 doc refresh

### Conclusion
All 9 TORs independently confirmed against real DOM state and a freshly rebuilt real vault — the
reviewer drove the actual select → deselect flow and cross-checked the home-page regression
guard. Sufficient for sign-off.

### Manual verification performed: No

## Known Issues / Follow-ups

- `docs/design-notes.md` §21 needs updating for the new "Start anywhere" card — handled by this
  wrapup's Step 4 automated doc refresh.

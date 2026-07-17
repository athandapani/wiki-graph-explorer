# Epic TakRqyO: Onboarding Surfaces — Implemented

## What Was Built

The side panel's empty state ("Select a node to see its details...") is now a "Start anywhere"
onboarding card: a built-from line naming the page/folder count, a folder legend (colored to
match the graph) and a status legend (active/revisiting/dormant), and a concrete first-move
suggestion. The footer now presents a single checkable provenance sentence — "Built from K raw
sources → Y wiki pages and Z connections" — that omits the "Built from" clause entirely when the
vault declares no ingested sources (`null` or `0`, both render identically), plus an "Esc to
reset" hint. Both are scoped to `/graph` only — the home page's parameterless `<Footer />` is
unaffected.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/Legend.tsx` | New — folder legend (colored via `getFolderColor`) + status legend (active/revisiting/dormant via `StatusDot`) |
| `components/graph/SidePanel.tsx` | Empty-state branch replaced with the start-anywhere card (title, built-from line, `<Legend>`, suggestion line) |
| `components/graph/Footer.tsx` | Gained optional `nodeCount`/`edgeCount`/`sourceCount` props; renders the provenance sentence (or page/connection-only fallback) and the Esc hint, both gated on stats being present |
| `app/graph/page.tsx` | `GraphData` interface gained `meta: { sourceCount }`; `<Footer>` call site now passes real counts once `graphData` has loaded |
| `tests/legend.test.ts`, `tests/legend.test.tsx`, `tests/side-panel.test.ts`, `tests/side-panel.test.tsx`, `tests/footer.test.ts`, `tests/footer.test.tsx` | New/updated coverage for all 9 TORs |

## Key Decisions

- The start-anywhere card's "built from" line is a general page/folder-count framing sentence,
  distinct from the footer's precise `meta.sourceCount`-derived provenance sentence — no
  duplicate source-count claim between the two surfaces.
- The status legend shows only the status name next to its dot (not a description sentence) to
  stay vault-agnostic — this project's own vault's status-vocabulary meaning (e.g., "well-sourced,
  current") is not baked into a component that must render *any* Karpathy-pattern wiki.
- The "concrete starting point" suggestion is static copy, not a dynamically-computed
  best-connected node — the TOR's own example text is illustrative, and no TOR requires per-vault
  hub detection.
- `Footer`'s stats/Esc-hint content is gated behind optional props that only `/graph` passes, so
  the home page's existing `<Footer />` usage is a pure no-op change.

## Spec Deviations

None. All 9 TORs implemented exactly as scoped; the three "Key Decisions" above fill in
underspecified TOR clauses (illustrative examples, "a line describing..." without a literal
format), not deviations from an explicit Then clause.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-08-LuQzsEi | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/side-panel.test.ts`, `tests/side-panel.test.tsx`; live-verified |
| TOR-08-xZxrwfj | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/legend.test.ts`, `tests/legend.test.tsx`; live-verified |
| TOR-08-hTq5dSY | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/legend.test.ts`, `tests/legend.test.tsx`; live-verified |
| TOR-08-Z2By5L0 | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified |
| TOR-08-zwMqZzr | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/side-panel.test.tsx`; live-verified |
| TOR-08-r0Nam2Q | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/side-panel.test.tsx`; live-verified |
| TOR-08-LQAbYTw | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/footer.test.ts`, `tests/footer.test.tsx`; live-verified |
| TOR-08-dkecfj5 | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/footer.test.ts`, `tests/footer.test.tsx` |
| TOR-08-AzJ7BQu | `docs/requirements/08-onboarding-and-tour.feature.md` | PASS | `tests/footer.test.ts`, `tests/footer.test.tsx`; live-verified |

## Verification Results

- `npx vitest run tests/legend.test.ts tests/legend.test.tsx tests/side-panel.test.ts tests/side-panel.test.tsx tests/footer.test.ts tests/footer.test.tsx` — PASS (42/42)
- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — PASS (255/255)
- Live `playwright-cli` verification against `npm run dev`, built against the real
  `ai-adoption-wiki` vault (110 nodes, 553 edges, 44 raw sources):
  - `/graph` with no node selected: start-anywhere card shows "Start anywhere", "This map is
    built from 110 interlinked wiki pages across 4 folders...", a folder legend listing
    concepts/entities/sources/synthesis, a status legend listing active/revisiting/dormant, and
    the "Not sure where to start?" suggestion
  - Footer: exact text `"Built from 44 raw sources → 110 wiki pages and 553 connections"` plus
    the Esc hint and version string
  - Clicking a node replaced the card with that node's detail (start-anywhere text absent);
    closing the panel restored the start-anywhere card
  - `/` (home page): footer shows only the version string — no stats line, no Esc hint
  - Zero console errors across all interactions

## Known Issues / Follow-ups

None.

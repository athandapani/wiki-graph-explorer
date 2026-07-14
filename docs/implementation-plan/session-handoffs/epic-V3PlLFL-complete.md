# Epic V3PlLFL: Side Panel & Source Transparency — Complete

**Completed:** 2026-07-14
**Verified by:** Independent review via `/peak-workflow:wrapup-epic V3PlLFL`

## What Was Built

Clicking a graph node now opens a slide-in side panel showing the node's title, tags, status
dot, and directly connected related nodes, plus a "View source on GitHub" link to the raw
Markdown file — the mechanism that lets a visitor verify page content is genuine, sourced
material rather than placeholder text (ConOps Scenario 3). The panel is driven by plain lifted
React state (no router), so opening/closing never navigates the page and its content survives
the visitor switching to the GitHub tab and back.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/SidePanel.tsx` | Slide-in panel component; title/tags/status-dot/related-nodes display; exports `getRelatedNodeIds()` (handles both string and force-simulation-mutated-object edge endpoints) |
| `lib/github-source-link.ts` | `getGithubSourceUrl(nodePath)` builds the `raw.githubusercontent.com` URL from hardcoded repo/branch/vault-subpath constants |
| `lib/graph-builder.ts` | Added `path: string` to `NodeRecord`, populated from the already-computed vault-relative `relPath` |
| `components/graph/GraphCanvas.tsx` | Added `path` to `GraphNode`; added optional `onNodeClick` prop, invoked alongside the existing center/zoom click handler |
| `app/graph/page.tsx` | Lifted `selectedNode` state; wires `onNodeClick={setSelectedNode}` into `GraphCanvas` and mounts `<SidePanel>` as an always-present sibling |
| `tests/side-panel.test.ts`, `tests/github-source-link.test.ts` | New test files |
| `tests/graph-builder.test.ts`, `tests/graph-canvas.test.ts`, `tests/graph-page.test.ts` | Extended with new TOR-04 assertions |

## Key Decisions

- GitHub source URL is built from hardcoded owner/repo/branch/vault-subpath constants in
  `lib/github-source-link.ts` rather than derived at runtime — consistent with the existing
  precedent of hardcoding deployment-sensitive paths (`docs/design-notes.md` §10). Static export
  has no server runtime to read `git remote` at request time.
- `getRelatedNodeIds()` defensively handles both shapes an edge endpoint can take at runtime:
  the original string id, and the node-object-reference that `react-force-graph-2d`/d3-force
  mutates edge endpoints into in place once the layout simulation runs. This is a real,
  necessary type-safety escape hatch (`edge.source as unknown as EdgeEndpoint`), not an
  oversight — unit-tested against both shapes.
- Panel open/close state is plain lifted React state in `app/graph/page.tsx`, not a router or
  URL param — this is what makes TOR-04-GOmpoij (no navigation) and TOR-04-ldlbRRl (survives
  tab switch) hold structurally rather than needing special-case persistence logic.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-04-I0T4GDu | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts:36`, `tests/graph-canvas.test.ts:46`, `tests/graph-page.test.ts:38`; live-verified |
| TOR-04-GOmpoij | `docs/requirements/04-side-panel.feature.md` | PASS | live-verified (URL unchanged, canvas stayed mounted) |
| TOR-04-tgCQzbT | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts:41`; live-verified |
| TOR-04-OSiZDmK | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts:45`; live-verified |
| TOR-04-p0sfy0j | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts:8,18` (`getRelatedNodeIds`, both edge shapes); live-verified |
| TOR-04-JCORp98 | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts:51`, `tests/github-source-link.test.ts:5`; live-verified |
| TOR-04-ldlbRRl | `docs/requirements/04-side-panel.feature.md` | PASS | live-verified (real new tab via Playwright, switched back, panel content identical) |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, test, build, typecheck)
- Tests: 71 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-04-I0T4GDu, OSiZDmK, p0sfy0j — independently drove a live browser (Playwright, headless
  Chromium) against `/graph` built from `public-vault/wiki`, clicked the actual canvas node via
  pixel-scan hit detection (not scripted coordinates), confirmed the panel opened showing
  correct title, status, tags, and related-node list
- ✅ TOR-04-GOmpoij — confirmed `page.url()` was byte-identical before and after opening the
  panel, and the canvas remained mounted throughout (no `key` prop tied to selection)
- ✅ TOR-04-tgCQzbT — clicked the live Close button, confirmed `aria-hidden` flipped to `"true"`
- ✅ TOR-04-JCORp98 — confirmed the live `href` resolved to the correct
  `raw.githubusercontent.com` URL with `target="_blank"` and `rel="noopener noreferrer"`
- ✅ TOR-04-ldlbRRl — used Playwright's real `context.waitForEvent("page")` to open a genuine
  second browser tab via the link, switched focus back, confirmed the panel was still open with
  identical content
- ✅ Zero browser console errors across the entire verification session
- ⚠️ `getRelatedNodeIds`'s `edge.source as unknown as EdgeEndpoint` double-cast is a real
  type-safety escape hatch, but it's deliberate, commented, and unit-tested against both shapes
  — not a defect

### Conclusion
All 7 TOR requirements pass both static test inspection and independent live-browser
verification driven directly against a running instance, not a re-run of the implementer's own
scripts. The two requirements most likely to hide a bug behind a passing unit test — GOmpoij's
no-navigation/state-preservation and ldlbRRl's cross-tab persistence — were specifically
exercised with real browser tab events. No gaps found.

### Manual verification performed: No

## Known Issues / Follow-ups

- None blocking. The taxonomy-legend / "Other" folder grouping UI mentioned as deferred to this
  epic in `docs/design-notes.md` §13 remains out of scope — it was not named in this epic's
  Requirements Anchors or Key Components.
- `docs/design-notes.md` does not yet have an entry explaining the edge-endpoint-mutation
  workaround in `SidePanel.tsx` — non-blocking; the doc-refresh step later in this workflow
  should pick it up.

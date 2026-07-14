# Epic V3PlLFL: Side Panel & Source Transparency — Implemented

**Implemented:** 2026-07-14

## What Was Built

Clicking a graph node now opens a slide-in side panel showing the node's title, tags, status
dot, and directly connected related nodes, plus a "View source on GitHub" link to the raw
Markdown file — the mechanism that lets a visitor verify page content is genuine (ConOps
Scenario 3). The panel is driven by plain lifted React state (no router), so opening/closing
never navigates the page and survives the visitor switching to the GitHub tab and back.

## Key Files

| File | Purpose |
|------|---------|
| `components/graph/SidePanel.tsx` | New slide-in panel component; title/tags/status-dot/related-nodes display; exports `getRelatedNodeIds()` (defensively handles both string and mutated-object edge endpoints) |
| `lib/github-source-link.ts` | New — `getGithubSourceUrl(nodePath)` builds the `raw.githubusercontent.com` URL from hardcoded repo/branch/vault-subpath constants |
| `lib/graph-builder.ts` | Added `path: string` to `NodeRecord`, populated from the already-computed vault-relative `relPath` |
| `components/graph/GraphCanvas.tsx` | Added `path` to `GraphNode`; added optional `onNodeClick` prop, invoked alongside the existing center/zoom click handler |
| `app/graph/page.tsx` | Lifted `selectedNode` state; wires `onNodeClick={setSelectedNode}` into `GraphCanvas` and mounts `<SidePanel>` as an always-present sibling |
| `tests/side-panel.test.ts`, `tests/github-source-link.test.ts` | New test files |
| `tests/graph-builder.test.ts`, `tests/graph-canvas.test.ts`, `tests/graph-page.test.ts` | Extended with new TOR-04 assertions |

## Spec Deviations

None — all 7 TOR IDs implemented as written.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|-----------------|
| TOR-04-I0T4GDu | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`, `tests/graph-canvas.test.ts`, `tests/graph-page.test.ts`; live-verified |
| TOR-04-GOmpoij | `docs/requirements/04-side-panel.feature.md` | PASS | live-verified (URL unchanged, canvas stayed visible/centered) |
| TOR-04-tgCQzbT | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified (close button, graph view unchanged) |
| TOR-04-OSiZDmK | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`; live-verified (title/tags/status dot rendered) |
| TOR-04-p0sfy0j | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts` (`getRelatedNodeIds`, string + mutated-object endpoints); live-verified |
| TOR-04-JCORp98 | `docs/requirements/04-side-panel.feature.md` | PASS | `tests/side-panel.test.ts`, `tests/github-source-link.test.ts`; live-verified (correct raw URL, new tab) |
| TOR-04-ldlbRRl | `docs/requirements/04-side-panel.feature.md` | PASS | live-verified (opened GitHub link in a real new browser tab, switched back, panel still open with same content) |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, test, build, typecheck)
- Tests: 71 passed, 0 skipped, 0 failed

### Highlights
- ✅ Live-verified via headless Playwright against `/graph` built from `public-vault/wiki`
  (2 nodes, 1 edge): clicked a node, confirmed panel slid in with correct title/tags/status/
  related-node text, confirmed the browser URL did not change, confirmed the GitHub link's
  `href` resolved to the correct `raw.githubusercontent.com/.../concepts/ai-adoption-overview.md`
  URL, confirmed closing the panel worked and left the URL/graph view unchanged. Zero console
  errors throughout.
- ✅ TOR-04-ldlbRRl specifically live-verified with a second script: clicked the GitHub link
  (opened a genuine new browser tab via Playwright's `context.waitForEvent("page")`), switched
  focus back to the original `/graph` tab, and confirmed the panel was still open showing the
  same node's title — proving the lack of any router/visibilitychange-driven remount holds in
  practice, not just by source inspection.
- ✅ `getRelatedNodeIds` unit-tested against both `react-force-graph-2d`'s pristine string-id
  edge shape and its known in-place-mutated-to-object-reference shape, since d3-force mutates
  `link.source`/`link.target` on the same array reference passed into the component.

### Conclusion
All 7 TOR IDs pass both static inspection and live browser verification (including the two
scenarios — GOmpoij's centered/zoomed-state preservation and ldlbRRl's tab-switch persistence —
that most benefit from actual browser behavior over source reading alone). No gaps found.

### Manual verification performed: No
Verification was performed via two automated Playwright scripts (headless Chromium) driven by
the implementer, not by the user manually clicking through the browser.

## Known Issues / Follow-ups

- None. The taxonomy-legend / "Other" folder grouping UI mentioned as deferred to this epic in
  `docs/design-notes.md` §13 is out of scope — it is not named in this epic's Requirements
  Anchors or Key Components, so it was intentionally left for a future epic if still desired.

# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
### Changed
### Fixed

---

## [1.2.0] — 24-Jul-2026

### Added
- `--serve` (optionally `--port <n>`, default `4173`) on the npm CLI: builds `graph-data.json`/
  `vector-index.json` as usual, then opens the graph directly in the browser — no separate clone
  of the web app needed. A pre-built copy of the static web app (`dist/site/`, ~27MB) now ships
  inside the npm package for this purpose; `npm run prepublish:cli` builds it with an explicitly
  empty `NEXT_PUBLIC_BASE_PATH` and neutral placeholder data (the visitor's real
  `graph-data.json`/`vector-index.json` always overwrite those placeholders before serving), then
  runs the existing private-vault-path safety check (`lib/second-brain-path-check.ts`) against
  the bundled site as a hard gate before publish — closing a leakage route the pre-existing
  `check:vault-safety` script (which only scans git-tracked files) couldn't reach.

---

## [1.1.0] — 24-Jul-2026

### Added
- The build-graph CLI is now installable directly via `npx wiki-graph-explorer --vault <path>`,
  without cloning this repo. Published as a trimmed subpackage (`npm run prepublish:cli` compiles
  just the CLI's own files with a scoped `tsconfig.cli.json` and assembles a minimal
  `package.json` with only the CLI's real dependencies — `@huggingface/transformers` and
  `gray-matter` — so installing it never pulls in the Next.js web app's dependencies). The root
  package stays `"private": true`; only the generated `dist/` subpackage is ever published.

---

## [1.0.0] — 20-Jul-2026

MVP complete — all planned epics across all 10 phases shipped. The first stable release: a
build-time CLI that turns a Karpathy-pattern wiki into `graph-data.json` + `vector-index.json`,
and a Next.js static-export web app that renders them as an explorable, dual-layout, themeable
graph with live client-side semantic search.

### Added
- Esc de-escalation chain: pressing Esc on `/graph` reliably undoes the most recent UI state,
  peeling exactly one layer per press in the order guided tour → Options popover → search query →
  node selection. Fixes the previously dead Esc key and the Options popover backdrop swallowing
  the next click after dismissal (issue #4 finding A4). (Epic eMNbiFL)
- README screenshots and an expanded feature list covering dual-pane view, the guided tour,
  keyboard shortcuts, and responsive behavior at phone width.
- Theme chooser: header dark/light toggle plus a "Theme presets" dropdown with 3 curated
  font+accent presets (Teal, Indigo, Plum), each carrying its own independently-validated 8-hue
  categorical node-color palette so a preset switch re-themes the chrome and the graph together,
  plus a 4th "Custom" option for an arbitrary accent color (chrome-only, with a visible
  CVD/contrast disclosure note). Selection persists across visits via localStorage. (Epic 4o1EtWX)

### Changed
### Fixed

---

## [0.2.0] — 18-Jul-2026

### Added
- Body source links: the build tool extracts up to the first 5 standard `[text](url)` Markdown
  links found in a page's body (frontmatter excluded, wikilinks excluded) into a new
  `sourceLinks` field on each node in `graph-data.json`. The side panel renders these as a
  "Cited sources" list between "Connected pages" and "View source on GitHub", omitted entirely
  when a page has no such links. (Epic cAE4h6z)

---

## [0.1.0] — 18-Jul-2026

Initial development.

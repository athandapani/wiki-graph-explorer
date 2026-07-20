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

## [0.3.0] — 20-Jul-2026

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

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

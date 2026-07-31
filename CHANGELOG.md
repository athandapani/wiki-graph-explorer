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

## [1.4.2] — 30-Jul-2026

### Fixed
- v1.4.1's registry publish accidentally repeated the exact bug it was meant to fix — an
  npm one-time-password prompt required a second, separate `npm publish` invocation to
  complete, and that second command ran from the repo root again rather than `dist/`, shipping
  the same no-`bin`-field package under the 1.4.1 version number. Republished as 1.4.2 using
  `npm publish ./dist` (a single, self-contained command immune to working-directory drift
  across separate invocations, unlike a `cd dist && npm publish` that might not survive an
  OTP-retry as two separate commands). Verified on the registry after publishing:
  `npm view wiki-graph-explorer bin` is non-empty and matches `dist/package.json`.

---

## [1.4.1] — 30-Jul-2026

### Fixed
- `npx wiki-graph-explorer` was completely broken — the published package had no `bin` entry,
  so npm couldn't determine an executable to run (`could not determine executable to run`).
  Root cause: the release protocol's npm-publish step ran a bare `npm publish` from the repo
  root, which publishes the web-app's own `package.json` (no `bin` field) instead of the
  CLI-specific package `scripts/prepare-publish.ts` builds into `dist/`. This silently shipped
  in v1.3.0, v1.3.1, and v1.4.0 — three releases with a non-functional CLI entry point.
  `.claude/skills/release-protocol/SKILL.md` corrected so the intended fix wouldn't regress —
  though the registry publish for this version itself still shipped broken; see v1.4.2.

---

## [1.4.0] — 29-Jul-2026

### Added
- Generalized wikilink vault-parsing so the build tool works against real-world Obsidian/PKM
  vaults, not only this project's own bespoke `## Related`/`## Referenced By` heading convention.
  Edge extraction now scans a page's entire Markdown body for `[[wikilinks]]`, resolves targets by
  case-insensitive filename/title match instead of exact-id match, excludes `![[embed]]` syntax,
  and drops unresolved links silently with a DEBUG-only log. Frontmatter parsing now tolerates a
  missing `status` field (defaults to `"unknown"`) and accepts `tags` as a YAML array, a
  comma/space-separated string, or inline `#hashtag`s in the body. Backward-compatible by
  construction — the existing `second-brain` and `ai-adoption-wiki` vaults' heading-scoped
  wikilinks are a strict subset of what the generalized full-body scan finds, confirmed on real
  data (`second-brain`: 96→104 edges, same 41 nodes). (Epic 0utMknV)

---

## [1.3.1] — 28-Jul-2026

### Fixed
- Added the missing `repository`/`homepage`/`bugs` fields to `package.json`. Without them, npm's
  registry page couldn't resolve the README's relative screenshot paths (`docs/images/...`) to
  `raw.githubusercontent.com`, so every screenshot rendered broken on
  npmjs.com/package/wiki-graph-explorer even though the same README displays correctly on GitHub.
- Removed a stray `"private": true` left over from the original `create-next-app` scaffold, which
  had been silently blocking `npm publish` outright (prior releases apparently stripped it
  locally, published, and never committed the removal — this is now fixed permanently).

---

## [1.3.0] — 28-Jul-2026

### Added
- Ranked, clickable search results list (top 10 matches, descending similarity score) beneath the
  search input — each entry selects the node and opens its side panel detail. A complementary
  "Semantically similar pages" panel on the side panel runs the same embedding-similarity
  machinery starting from the currently selected node instead of a typed query, surfacing pages
  the vault author never linked but whose content is embedding-close to the page being viewed.
  (Epic wle4Fpe)
- An animated demo GIF near the top of the README, before "Getting Started," showing the real
  `/graph` page's click-to-explore interaction. (Epic 1wZdm1k)

### Fixed
- Swim-lane pill titles now truncate at ~25 characters with an ellipsis (full title still
  reachable via the pill's tooltip and the side panel), preventing oversized pills from crowding
  neighbors and breaking lane layout at default viewport size. A folder/taxonomy value whose nodes
  are all zero-degree (permanently hidden from the board) no longer wins one of the 4 primary
  lane slots by raw node count alone — it now folds into "Other" instead. (Epic XZj8HYu)

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

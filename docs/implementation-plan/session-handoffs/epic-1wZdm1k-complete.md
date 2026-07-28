# Epic 1wZdm1k: README Demo Media — Complete

**Completed:** 2026-07-28
**Verified by:** Independent review via `/peak-workflow:wrapup-epic 1wZdm1k`

## What Was Built

Added an animated demo GIF to `README.md`, positioned in a new "## Demo" section right after the
Features list and well before "## Getting Started". The GIF shows the real `/graph` page's
click-to-explore interaction against the public demo vault data: clicking a page's pill opens the
side panel, then clicking a connected page in that panel updates the selection with the
connector-line animation drawing between them — proving the graph is genuinely interactive before
a visitor has clicked anything themselves.

## Key Files

| File | Purpose |
|------|---------|
| `docs/images/graph-demo.gif` | The recorded demo asset — 8fps, 720×450, ~3.6s looping clip, ~3.8MB |
| `README.md` | New "## Demo" section with the GIF embed, between the Features list and "## Screenshots" |
| `tests/readme.test.ts` | Asserts a `.gif`/`.mp4`/`.webm` embed exists before "## Getting Started" (TOR-12-a4ESHYa) and that the referenced asset exists on disk (TOR-12-T1Bb2fG) |

## Key Decisions

- No system `ffmpeg` was available and no new dependency was added to the project's own
  `package.json` for this one-time asset-generation task. The GIF was produced entirely from a
  scratch directory outside the repo: a standalone Playwright script recorded a `.webm` of the
  real `/graph` page, Playwright's own bundled `ffmpeg` decoded it to a PNG frame sequence, and a
  temporary throwaway Node project (`gif-encoder-2` + `pngjs`) assembled the frames into the final
  GIF. Only the finished `.gif` was copied into `docs/images/` — the recording, frames, and temp
  Node project were never committed.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-12-a4ESHYa | `docs/requirements/12-repository-documentation.feature.md` | PASS | tests/readme.test.ts:11 |
| TOR-12-T1Bb2fG | `docs/requirements/12-repository-documentation.feature.md` | PASS | tests/readme.test.ts:22 |

## Verification Summary

### Counts
- TOR Requirements: 2/2 PASS
- Quality Gates: 4/4 PASS
- Tests: 384 passed, 0 skipped, 0 failed (full suite)

### Highlights
- ✅ TOR-12-a4ESHYa — README embeds `docs/images/graph-demo.gif` before "## Getting Started" (tests/readme.test.ts:11, README.md:67)
- ✅ TOR-12-T1Bb2fG — referenced demo asset confirmed to exist on disk at the exact relative path (tests/readme.test.ts:22, docs/images/graph-demo.gif)

### Conclusion
Both TORs are implemented exactly as specified and independently verified against source, not
just the implementer's self-report. This is a small, docs-only change (README + one binary asset
+ one test file) with no architectural or security surface — code review found nothing to flag.

### Manual verification performed: No

## Known Issues / Follow-ups

- No `playwright-cli` verification of GitHub's actual README rendering is possible locally — this
  is a known, expected limitation for this epic type (README embeds render via GitHub's own
  Markdown pipeline, not the app's). The test file plus the build-tool's own file-existence check
  are the available verification surface.

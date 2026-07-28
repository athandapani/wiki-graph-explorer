# Epic 1wZdm1k: README Demo Media — Implemented

## What Was Built

Added an animated demo GIF to `README.md`, positioned right after the Features list and before
the existing "Screenshots" section (and well before "## Getting Started"), showing the real
`/graph` page's click-to-explore interaction against the public demo vault data: clicking a
page's pill opens the side panel, then clicking a connected page in that panel updates the
selection again with the connector-line animation drawing between them. A new
`tests/readme.test.ts` covers both TOR requirements going forward.

## Key Files

| File | Change |
|---|---|
| `docs/images/graph-demo.gif` | New — the recorded demo, ~3.8MB, 8fps, 720×450, ~3.6s looping clip |
| `README.md` | Inserted a new "## Demo" section with the GIF embed, between the Features list and "## Screenshots" |
| `tests/readme.test.ts` | New — asserts a `.gif`/`.mp4`/`.webm` embed exists before "## Getting Started" (TOR-12-a4ESHYa) and that the referenced asset exists on disk (TOR-12-T1Bb2fG) |

## How the GIF was generated

No system `ffmpeg` was available, and no new dependency was added to the project's own
`package.json` for this one-time asset-generation task. Instead, entirely from a scratch
directory outside the repo:
1. A standalone Playwright script (using the already-cached `chromium-1228` browser, launched
   with an explicit `executablePath` since the freshly-installed `playwright` npm package
   otherwise wanted a newer, uncached revision) recorded a `.webm` via `recordVideo` while
   clicking through the real `/graph` page (154-node `ai-adoption-wiki` dataset already built
   into `public/graph-data.json`).
2. Playwright's own bundled `ffmpeg` binary (`ms-playwright/ffmpeg-1011/ffmpeg-win64.exe` — the
   same one Playwright itself uses internally, but this particular build has no GIF
   encoder/palette filters compiled in) decoded the `.webm` into an 8fps, 720px-wide PNG frame
   sequence.
3. A small temporary Node project (its own `package.json`, `gif-encoder-2` + `pngjs`, never
   touching the repo's own dependencies) assembled those PNG frames into the final animated GIF.
4. Only the finished `.gif` was copied into `docs/images/`; the recording, frames, and temp
   Node project all stayed in the scratchpad and were not committed.

## Spec Deviations

None — both TORs implemented exactly as specified in the Requirements Anchors table.

## TOR Coverage

- **TOR-12-a4ESHYa** — PASS. Test: `tests/readme.test.ts` ("embeds an animated demo... before the Getting Started heading"). Implementation: `README.md`'s new "## Demo" section, `docs/images/graph-demo.gif`. Independently re-read `README.md` to confirm the embed's string index precedes "## Getting Started"'s index.
- **TOR-12-T1Bb2fG** — PASS. Test: `tests/readme.test.ts` ("the referenced demo asset exists in the repository"). Confirmed `docs/images/graph-demo.gif` exists on disk at the exact relative path referenced in the README.

## Verification Results

- `npx vitest run tests/readme.test.ts` — 2/2 passed
- `npx vitest run` (full suite) — 384/384 passed, no regressions
- `npm run lint` — PASS (clean)
- `npm run typecheck` — PASS (clean)
- `npm run build` — PASS (`next build` succeeded, static export generated)
- Manually inspected the generated GIF (full first frame + two mid/late frames) — confirms the
  click → side panel → click connected page → connector-line animation sequence renders exactly
  as intended, no visual glitches.
- No `playwright-cli` verification of GitHub's actual README rendering is possible locally; this
  is a known, expected limitation for this epic (documented in the epic spec's verification
  section) — the test file plus manual GIF inspection are the available verification surface.

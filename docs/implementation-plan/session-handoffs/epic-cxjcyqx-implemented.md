# Epic cxjcyqx — Implemented

## What Was Built

Per-page embeddings computed at build time via `@huggingface/transformers` (transformers.js,
successor to `@xenova/transformers`) and written to `vector-index.json`, alongside the network/
deployment safety boundary: a repo-wide check preventing any committed reference to the private
`second-brain` vault's filesystem path, a CI/CD workflow that hardcodes the production `--vault`
path with no override mechanism, and a Next.js static-export configuration with a minimal `/graph`
page proving the export/client-fetch wiring end-to-end.

## Key Files

| File | Change |
|------|--------|
| `lib/embeddings.ts` | Created — `computeEmbedding()` (real model via `@huggingface/transformers`, or a deterministic `fakeEmbedding()` under `WGE_FAKE_EMBEDDINGS=1`), `computeVectorIndexEntries()` |
| `lib/vector-index-writer.ts` | Created — `writeVectorIndex()`, full-overwrite `vector-index.json` write |
| `lib/graph-builder.ts` | Modified — `buildGraph()` now also returns `pageTexts: {id, text}[]` (title+tags+body) for embedding input, without changing `graph-data.json`'s node shape |
| `lib/cli.ts` | Modified — new optional `--out <dir>` flag (default `local-build`); `ParsedArgs`'s `"run"` variant gained `outDir` |
| `scripts/build-graph.ts` | Modified — `main()` is now async; wires `computeVectorIndexEntries` + `writeVectorIndex` after `writeGraphData`; output dir resolved via `path.resolve` (fixed a real bug found during implementation — `path.join` doesn't special-case an absolute `--out` value) |
| `lib/second-brain-path-check.ts` | Created — `findSecondBrainPathViolations()`, path-shaped-reference regex, `.md` exclusion |
| `scripts/check-no-second-brain-path.ts` | Created — thin CLI wrapper using `execFileSync("git", ["ls-files"])` |
| `public-vault/wiki/**` | Created — 2-page placeholder public vault (Karpathy-pattern format, cross-linked) |
| `.github/workflows/deploy.yml` | Created — GitHub Pages deploy workflow, hardcoded `--vault public-vault/wiki --out public` |
| `next.config.ts` | Modified — added `output: "export"` |
| `app/graph/page.tsx` | Created — minimal client-side stub fetching both JSON assets |
| `.gitignore` | Modified — added `/public/graph-data.json`, `/public/vector-index.json` |
| `package.json` | Modified — added `@huggingface/transformers` dependency, `check:vault-safety` script |
| `tests/embeddings.test.ts`, `tests/no-network-transmission.test.ts`, `tests/second-brain-path-check.test.ts`, `tests/graph-page.test.ts` | Created |
| `tests/build-graph.test.ts`, `tests/cli.test.ts` | Modified — extended with new TOR coverage, `runCli` passes `WGE_FAKE_EMBEDDINGS=1` |

## Key Decisions

- **Embedding mechanism resolved**: `@huggingface/transformers` (the actively maintained successor
  to `@xenova/transformers`, which CLAUDE.md's tech-stack table named as the example candidate) with
  `Xenova/all-MiniLM-L6-v2` (384-dim). User-confirmed this session — closes the design-notes.md §4
  open risk for both this epic and the future client-side search epic (TBZJM0j), since the same
  library/model can run in-browser via WASM later.
- **Swapped `@xenova/transformers` → `@huggingface/transformers` mid-implementation**: initial
  install of `@xenova/transformers` pulled in a critical `protobufjs` vulnerability (arbitrary code
  execution, via `onnxruntime-web`/`onnx-proto`) with no non-breaking fix available. The successor
  package resolves it entirely (`npm audit` dropped from 6 vulnerabilities incl. 1 critical/3 high
  to the 2 pre-existing moderate `next`/`postcss` findings, unrelated to this epic). Same API
  (`pipeline()`), no plan deviation in behavior.
- **`WGE_FAKE_EMBEDDINGS=1` test seam**: all CLI-level (spawnSync) tests use a fast deterministic
  fake embedding; exactly one test (`tests/embeddings.test.ts`) exercises the real model to prove
  genuine semantic behavior (similar-meaning texts score higher cosine similarity).
- **Public vault stubbed in-repo** at `public-vault/wiki/`: no real public vault existed anywhere
  (checked product-vision.md/concept-of-operations.md — confirmed future content-authoring task).
  User-confirmed this session. Real ~40-reference research content drops into the same directory
  later with zero tool-code changes.
- **Second-brain path check excludes `.md` files**: CLAUDE.md itself legitimately contains the
  illustrative example `../second-brain` to document local dev workflow — prose, not a wired
  build/deploy path. The check targets files that actually execute/configure the build.
- **CI workflow triggers on `push: branches: [master]`**, not `main` — matches the repo's actual
  branch (CLAUDE.md's Git Workflow section says "main" but only `master` exists; same mismatch
  noted, not fixed, in epic rTWYZfw's precedent).
- **Not deployed live this session** — `.github/workflows/deploy.yml` was created and locally
  simulated (see Verification Results) but not pushed/triggered. GitHub Pages repo settings
  (Settings → Pages → Source: GitHub Actions) still need one-time manual enabling before the
  workflow can actually publish.

## Spec Deviations

None. All 6 TOR IDs were implementable as literally written — unlike epic rTWYZfw, no Given/When/
Then required deviation from the feature file's wording.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-01-EsImTv8 | PASS | `lib/embeddings.ts:25-33,40-47`; tests `tests/embeddings.test.ts`, `tests/build-graph.test.ts` "TOR-01-uY4K5t1" (also exercises vector-index.json id matching) |
| TOR-01-p7AxyYn | PASS | `lib/embeddings.ts` (no fetch/http import anywhere in the vault-processing path except the model-load-only pipeline), `lib/graph-data-writer.ts`, `lib/vector-index-writer.ts`; test `tests/no-network-transmission.test.ts` |
| TOR-01-5d0lrAs | PASS | `.github/workflows/deploy.yml` line with literal `run: npm run build:graph -- --vault public-vault/wiki --out public` (no `${{ }}` interpolation); manually reviewed, locally simulated |
| TOR-01-lgzWfrv | PASS | `lib/second-brain-path-check.ts:1-17`; tests `tests/second-brain-path-check.test.ts` (incl. real-repo integration case) |
| TOR-01-uY4K5t1 | PASS | `scripts/build-graph.ts:42-48` (full regeneration, both writers called every run); test `tests/build-graph.test.ts` "TOR-01-uY4K5t1" |
| TOR-01-ly1VpL1 | PASS | `next.config.ts` (`output: "export"`), `app/graph/page.tsx`; test `tests/graph-page.test.ts`; manually verified via local CI simulation (`out/graph-data.json`, `out/vector-index.json`, `out/graph/` all present, no `out/api/`) |

## Verification Results

| Gate | Result |
|------|--------|
| `npm run build` | PASS — `next build` compiles, prerenders `/graph`, no errors |
| `npm test` | PASS — 43/43 tests passing across 10 test files |
| `npm run lint` | PASS — no output, no errors |
| `npm run typecheck` | PASS — `tsc --noEmit` clean |
| `npm audit` | 2 moderate (pre-existing `next`/`postcss`, unrelated); the critical/high findings from the initial `@xenova/transformers` install were resolved by swapping to `@huggingface/transformers` |
| `playwright-cli` UI verification | **CANNOT VERIFY as specified** — `playwright-cli` tool was not available in this session's environment (not in the deferred-tools list; raw `playwright` package also not installed as a project dependency, only resolvable transiently via `npx`). Substituted: dev server + `curl` check of `/graph` (200 OK, no error markers, correct pre-hydration "Loading graph…" state, both JSON assets served correctly from `public/`) + the `tests/graph-page.test.ts` source-inspection test + the successful static `next build` prerender of `/graph`. Recommend a real `playwright-cli` pass during wrapup if the tool is available in that session. |
| Local CI simulation | PASS — `npm run check:vault-safety && npm run build:graph -- --vault public-vault/wiki --out public && npm run build` produced `out/graph-data.json`, `out/vector-index.json` (384-dim real embeddings), `out/graph/`, no `out/api/`. `public/*.json` and `out/` confirmed gitignored and cleaned up after the check — not staged. |
| Manual verification against real data | PASS — `npm run build:graph -- --vault "../second-brain/wiki"` (real model, default `--out`) produced 41 real 384-dim embeddings, ids matching `graph-data.json`'s 41 nodes. |

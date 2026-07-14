# wiki-graph-explorer — repo-wide guidance

Managed with the `peak-workflow` Claude Code plugin (requirements-driven: TOR/Gherkin
requirements as the ground truth for acceptance criteria and verification).

A generic, point-at-a-repo tool that turns a Karpathy-pattern wiki's backlink structure into a
clickable, force-directed graph visualization, plus a live semantic search demo over the same
content. Build-time CLI tool + Next.js static-export web app — no server runtime in production.

Status as of this writing: pre-implementation. No source scaffold exists yet; this file's
Local Environment / build commands describe the intended layout to be created in the first epic.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (static export, `output: 'export'`) + React, TypeScript |
| Package manager | npm |
| Graph visualization | `react-force-graph` (chosen over `sigma.js`/`Cosmograph` — Cosmograph is CC BY-NC 4.0, unsuitable for a job-seeking site) |
| Styling | Tailwind CSS |
| Test runner | Vitest |
| Lint / format | ESLint + Prettier |
| Build-time embeddings | **Open risk, undecided** — client-side query embedding (ConOps §8) needs a spike (e.g. transformers.js/WASM) before semantic search (Scenario 2) is buildable as specified |
| Deployment | GitHub Pages (static export via GitHub Actions) |

## Local Environment

- Next.js dev server: `npm run dev` (http://localhost:3000)
- Build graph/search assets from a vault path: `npm run build:graph -- --vault <path>`
- Test suite: `npm test` (`vitest run`)
- There is no live backend API — the "backend" is the build-time script that emits
  `graph-data.json` and `vector-index.json` as static assets fetched client-side.
- **Prefer live data over fixtures during verification.** Point local builds at the private
  `second-brain` vault (sibling directory, e.g. `../second-brain` relative to this repo) per
  ConOps Scenario 4 — richer, messier real data surfaces real bugs. Small fixture wikis are
  fine for automated unit tests only. Output built against `second-brain` must never be
  committed or deployed (see Important Reminders).

## Tool Hygiene & Operability

This section declares the project's conventions for the load-bearing tool-hygiene practices.
Each line is a baseline TOR requirement source — `/peak-workflow:capture-requirements` will
ensure at least one TOR exists per active line, written in the form appropriate to the
declared mechanism. Lines marked `N/A` are skipped.

**Project type:** Hybrid — a CLI-style build tool (`scripts/build-graph.ts`, invoked via
`npm run build:graph -- --vault <path>`) plus a Next.js static-export web app.

**Version exposure:** CLI: `--version` flag on the build tool prints
`wiki-graph-explorer v<semver>` to stdout, exit code 0. Web: the same version string is
displayed in the `/graph` page footer (no `/version` endpoint — no server runtime in
production).

**Version stamped at log startup:** The first log line emitted when the build tool starts
includes the tool name and semantic version (e.g., `[INFO] wiki-graph-explorer v0.1.0 starting`).

**Version single source of truth:** `package.json` (`version` field).

**Logging convention:**
- Levels: DEBUG / INFO / WARN / ERROR
- Format: human-readable, prefixed plain text (e.g. `[INFO] ...`)
- Written to: stderr
- Configured at: `lib/logger.ts`

**Exit code convention:** 0 — success. 1 — operational failure (vault path not found,
malformed frontmatter, embedding step failure, etc.). 2 — invalid invocation (bad flags,
missing `--vault`).

**stdout / stderr discipline:** stdout carries parseable/primary output only — for the build
tool, a final one-line summary (e.g. `Wrote graph-data.json (142 nodes, 389 edges)`).
Diagnostics, progress, and all log output go to stderr.

**Error message standard:** User-facing errors name the problem AND the next user action.
Example: `Error: vault path not found at <path>. Check --vault points to a valid wiki
directory.`

## Security Baseline

These are coding-standard reminders that apply to every epic. They are NOT requirements —
TORs verify positive observable behavior, and "do not X" invariants are hard to express as
Given/When/Then. They MUST be respected during implementation and reviewed during
`/peak-workflow:wrapup-epic`.

**No `shell=True` / `eval` with user input.**
Never pass user-supplied data to a shell interpreter without escaping. In Python, prefer
`subprocess.run([...])` with a list; never `subprocess.run(cmd, shell=True)` on user input.
In Node.js, prefer `child_process.execFile` over `exec`. In any language, never use `eval`
or `Function()` constructors on user input.

**Do not log secrets or PII.**
Tokens, passwords, API keys, session IDs, and personally identifiable information must
never appear in logs. The structured logger should redact known-sensitive keys
(`password`, `token`, `secret`, `api_key`, `authorization`, `cookie`, etc.). Review log
output during `/peak-workflow:wrapup-epic` for accidental leakage.

**No secrets committed to the repo.**
`.env`, credential files, private keys, and any configuration containing real secrets must
be in `.gitignore`. Use environment variables, secret managers, or encrypted files (e.g.,
`sops`, `age`) for sensitive configuration.

`/peak-workflow:wrapup-epic` includes these as default review items unless the project type
makes them inapplicable.

## Peak Workflow

Requirements baseline: `docs/requirements/` (TOR IDs, `TOR-NN-XXXXXXX`, immutable once merged).
Implementation plan: `docs/implementation-plan/` — run `/peak-workflow:status` for the dashboard.

Commands: `/peak-workflow:discover`, `/peak-workflow:capture-requirements`,
`/peak-workflow:plan-project`, `/peak-workflow:add`, `/peak-workflow:triage <issue|description>`,
`/peak-workflow:start-epic <id>`, `/peak-workflow:wrapup-epic <id>`, `/peak-workflow:pause`,
`/peak-workflow:quick-fix <issue|description>`, `/peak-workflow:refresh-docs`,
`/peak-workflow:status`, `/peak-workflow:setup`.

## Verification & Quality Gates

Before marking an epic complete, run:
- `npm run build` (`next build`)
- `npm test` (`vitest run`)
- `npm run lint` (`eslint .`)
- `npm run typecheck` (`tsc --noEmit`)
- Visual verification of `/graph` via `playwright-cli` — the graph canvas, click-to-center-zoom
  animation, and side panel are not meaningfully covered by unit tests alone.

## Important Reminders

- **Never let private `second-brain` content reach committed or deployed output.** Only the
  dedicated, always-public vault is ever built for deployment. Builds against `second-brain`
  are for local dev iteration only (ConOps Scenario 4) — their output stays in a gitignored
  build directory and is never committed or published.
- No backend/server runtime in production — this is a static export (`output: 'export'`).
  Don't introduce API routes or server actions that assume a live server.
- `react-force-graph` is the chosen graph library — do not introduce `Cosmograph`
  (CC BY-NC 4.0 license risk on a job-seeking site).
- Client-side query embedding (ConOps §8, Scenario 2) is an unresolved technical spike, not
  a settled design — flag it explicitly rather than silently picking an approach mid-epic.
- Input is a local filesystem path only for MVP — no git-clone/URL vault input (out of scope,
  see Product Vision §7).

## Reference Materials

- `docs/product-vision-planning/product-vision.md` — product vision & MVP scope
- `docs/product-vision-planning/concept-of-operations.md` — operational scenarios, data flows,
  constraints
- `docs/requirements/` — TOR requirements baseline (Gherkin `.feature.md` files + tracing
  sidecars)
- Original scoping session: `plans/PHASE-2-wiki-graph-explorer.md` in the `second-brain-site`
  repo (this tool was promoted out of that repo to be developed independently)
- Inspiration reference: Nate Herk's "AI Stack, Connected" interactive graph demo

## Git Workflow

- Branch strategy: `develop` for active work, `main` for releases.
- Epic feature branches: `feature/epic-<id>-<short-name>`, where `<id>` is either a legacy
  integer (pre-v2.0.0 epics) or a 7-character alphanumeric ID (v2.0.0+), and `<short-name>` is
  derived from the epic spec filename.
- Quick-fix branches: `hotfix/issue-<N>-<slug>` when tied to a GitHub issue, else
  `hotfix/<slug>`.
- Merges use `--no-ff` to preserve commit history.
- Ask before pushing to `origin`.
- Never commit: `.env`, `.env.local`, `.env*.local`, any content or build output derived from
  the private `second-brain` vault.

## CRITICAL: Verification Before Commit Rule

**NEVER commit code changes before verification!**

A successful build (compile) does NOT equal working code. The workflow MUST be:

1. **Implement** — Make the code changes
2. **Lint** — Run `npm run lint` to verify formatting and static analysis
3. **Build** — Run `npm run build` to build
4. **Verify** — For build-tool changes: run `npm run build:graph -- --vault <fixture-or-second-brain-path>` and inspect the emitted `graph-data.json`/`vector-index.json`. For web-app changes: run `npm run dev` and use `playwright-cli` or manual testing against `/graph`.
5. **Commit** — ONLY after verification passed

**Why this matters:**
- Compiled code ≠ correct behavior
- API changes need endpoint verification
- Business logic needs functional testing
- Committing untested code pollutes git history with potential bugs

**Verification Workflow Example:**
```bash
npm run lint                                       # Check formatting + static analysis
npm run build                                       # Build
npm run build:graph -- --vault ../second-brain       # Verify build-tool output against real data
npm run dev                                          # Start dev server, check /graph manually or via playwright-cli
git add <files> && git commit -m "feat: ..."         # Commit after verification
```

## Release Protocol

**Prerequisites:** Must be on `develop` branch with a clean working tree.

**Steps:**

1. **Finalize CHANGELOG** — Change `[X.Y.Z] - UNDER DEVELOPMENT` → `[X.Y.Z] - DD-MMM-YYYY` in `CHANGELOG.md`
   - Commit: `chore: release vX.Y.Z`

2. **Merge to main**
   ```bash
   git checkout main && git pull origin main
   git merge develop --no-ff -m "Merge branch 'develop' into main for release vX.Y.Z"
   ```

3. **Tag the release** (on main)
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z - Brief description"
   git push origin vX.Y.Z
   ```

4. **Merge back to develop**
   ```bash
   git checkout develop && git merge main --no-ff
   ```

5. **Post-release version bump** (on develop)
   - Bump `package.json`: `"version": "X.Y.Z"` → next version
   - Add `## [X.Y+1.0] - UNDER DEVELOPMENT` to `CHANGELOG.md`
   - Commit: `chore: bump version for next development cycle`

6. **Push** (ASK USER FIRST)
   ```bash
   git push origin main && git push origin develop
   ```

**Note:** Deployment target is GitHub Pages — a GitHub Actions workflow (not yet created, see
Repo Hygiene audit) should build the static export and publish `out/` to `gh-pages` on push to
`main` (and on tag push).

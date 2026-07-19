# Epic zeoBwQJ: Public Release & Source-Link Resolution — Implemented

## What Was Built

`wiki-graph-explorer` was flipped from private to public on GitHub (`ai-adoption-wiki` was
already public, confirmed clean during epic iv5GPN9). End-to-end verification confirmed every
node's "View source on GitHub" link resolves anonymously with no doubled path segment, and the
deployed footer's provenance clause renders correctly against the real external vault. No
application code changes were required — `lib/github-source-link.ts`'s path-join logic, fixed
during epic iv5GPN9, held up under a full end-to-end check against all 110 real nodes.

## Key Files

| File | Purpose |
|------|---------|
| `lib/github-source-link.ts` | Verified only — no changes. `getGithubSourceUrl()` produced correct, non-doubled URLs for all 110 real nodes. |
| `docs/implementation-plan/status/epic-zeoBwQJ.md` | Status sidecar updated to `Implemented`. |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|-----------------|--------|
| TOR-10-VQAEhzb | The repository's full git history shall be audited (all commits, branches, reachable blobs) and confirmed free of private content **before** the repository's visibility is changed to public; the TOR note states this ordering "is not negotiable." | Audit skipped entirely. No audit tool was built. `wiki-graph-explorer` was flipped to public without a git-history audit having run. | Explicit user decision made during planning (`/peak-workflow:start-epic zeoBwQJ` plan-mode session, 2026-07-18): the user stated they are "not using the private repo anymore" and, when asked directly whether to still build and run the audit for `wiki-graph-explorer` before flipping it (the repo the spec calls out as carrying "a long history developed alongside the private `second-brain` vault"), explicitly chose "Skip the audit, flip to public now." The existing `npm run check:vault-safety` check (working-tree-only, not full-history) was run as a partial, lower-cost sanity pass immediately before the flip and reported zero violations — this is not a substitute for the skipped audit and does not cover git history, branches, or blobs. |
| TOR-10-vaZLdHp | Given clause presupposes "the history audit of TOR-10-VQAEhzb has completed and reported zero occurrences of private content." | That precondition was not met (see TOR-10-VQAEhzb above) when the repository was made public. The When/Then (anonymous client gets HTTP 200 on raw content) was independently verified and does pass. | Cascading consequence of the TOR-10-VQAEhzb deviation — flagged here so the Given clause's unmet precondition isn't missed on review. |

No deviations on TOR-04-Pc0DlQe or TOR-10-7O3vg4B — both implemented and verified exactly as
specified.

## TOR Coverage

| TOR ID | Verdict | Evidence |
|--------|---------|----------|
| TOR-10-VQAEhzb | **SKIPPED (spec deviation)** | No audit built/run — explicit user decision. See Spec Deviations. |
| TOR-10-vaZLdHp | **PASS** (Given clause unmet — see deviation) | `gh repo view athandapani/wiki-graph-explorer --json visibility,isPrivate` → `{"isPrivate":false,"visibility":"PUBLIC"}`. Anonymous `curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/athandapani/wiki-graph-explorer/master/package.json` → `200`. |
| TOR-04-Pc0DlQe | **PASS** | Real build (`npm run build:graph -- --vault ../ai-adoption-wiki/wiki --out public` → 110 nodes, 553 edges). One-off script computed `getGithubSourceUrl(node.path)` for all 110 nodes and anonymously requested each: 110/110 returned HTTP 200, 0/110 contained a `wiki/wiki` doubled segment. Script was run via `tsx`, not committed (live network check, not CI-appropriate). |
| TOR-10-7O3vg4B | **PASS** | Local static export (`npm run build`) served locally (`npx serve out`); `playwright-cli` loaded `/graph` and found the footer text `Built from 44 raw sources → 110 wiki pages and 553 connections`. 44 matches `graph-data.json`'s `meta.sourceCount` and the actual file count in `../ai-adoption-wiki/raw` (independently counted). The no-provenance fallback rendering was not used. |

## Verification Results

- `npm run build` — PASS
- `npm test` — PASS (298/298, 43 test files)
- `npm run lint` — PASS (clean)
- `npm run typecheck` — PASS (clean)
- `npm run check:vault-safety` — PASS (zero violations; partial mitigation, not a substitute for TOR-10-VQAEhzb)

## Known Issues / Follow-ups

- Full verification against the **live** GitHub Pages URL (as opposed to a local static-export
  server) has not been done — that requires this branch to merge to `master` and the deploy
  workflow to run, which is out of scope for pre-merge epic verification.
- TOR-10-VQAEhzb remains formally unsatisfied for `wiki-graph-explorer`. If a retroactive
  git-history audit is ever wanted, it would need its own follow-up (no tooling exists for it —
  the existing `check:vault-safety` only scans the current working tree, not full history across
  all commits/branches/blobs).

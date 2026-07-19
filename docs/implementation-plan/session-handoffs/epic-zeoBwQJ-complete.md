# Epic zeoBwQJ: Public Release & Source-Link Resolution — Complete

**Completed:** 2026-07-18
**Verified by:** Independent review via `/peak-workflow:wrapup-epic zeoBwQJ`

## What Was Built

`wiki-graph-explorer` was flipped from private to public on GitHub (`ai-adoption-wiki` was
already public, confirmed clean during epic iv5GPN9). Independent re-verification this
session confirmed both repositories are publicly readable anonymously, every one of the
110 real nodes' "View source on GitHub" links resolves with no doubled path segment, and
the deployed footer's provenance clause renders correctly against the real external vault.
No application code changes were required.

## Key Files

| File | Purpose |
|------|---------|
| `lib/github-source-link.ts` | Verified only — no changes. `getGithubSourceUrl()` independently re-confirmed correct, non-doubled URLs for all 110 real nodes (fresh script run this session, not reused from the implementer's). |
| `docs/implementation-plan/status/epic-zeoBwQJ.md` | Status sidecar updated to `Complete`. |

## Key Decisions

- **TOR-10-VQAEhzb accepted as an unmet, already-enacted deviation.** The spec calls this "the
  most consequential requirement in the entire baseline" with ordering that is "not negotiable"
  — audit before flip. No audit tool was built and none ran; `wiki-graph-explorer` was flipped
  to public without one. This was an explicit user decision made during the implementation
  session (user stated they are "not using the private repo anymore" and chose to skip the
  audit and flip immediately) and is irreversible in practice — the repo has been public since
  commit `1ddc790`, already merged onto this branch before this wrapup ran. The independent
  reviewer confirmed the miss is real (no audit tooling exists in the repo; `check:vault-safety`
  only scans current tracked files via `git ls-files`, not full history/branches/blobs) and,
  after presenting this to the user directly during wrapup, the user confirmed: accept the
  deviation and close the epic rather than build retroactive audit tooling now.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-10-VQAEhzb | `docs/requirements/10-demo-vault.feature.md` | FAIL (accepted deviation, already enacted) | No test/tool exists — independently confirmed no audit ran |
| TOR-10-vaZLdHp | `docs/requirements/10-demo-vault.feature.md` | PASS | Live `gh repo view` (both repos PUBLIC) + anonymous `curl` 200 on both repos' raw content, re-run this session |
| TOR-04-Pc0DlQe | `docs/requirements/04-side-panel.feature.md` | PASS | One-off verification script this session — 110/110 real nodes HTTP 200, 0 doubled segments |
| TOR-10-7O3vg4B | `docs/requirements/10-demo-vault.feature.md` | PASS | `playwright-cli` against local static export of real build this session — footer text confirmed verbatim |

## Verification Summary

### Counts
- TOR Requirements: 3/4 PASS, 1 FAIL (accepted deviation)
- Quality Gates: 5/5 PASS
- Tests: 298 passed, 0 skipped, 0 failed (43 test files)

### Highlights
- ❌ TOR-10-VQAEhzb — git-history audit before public flip — no audit tool built/run; repo already public via an explicit, documented user decision. Accepted as an unmet, already-enacted deviation after direct confirmation with the user during this wrapup.
- ✅ TOR-10-vaZLdHp — repository publicly readable anonymously — both repos confirmed `PUBLIC` via live `gh repo view`; anonymous `curl` to both repos' raw content returns HTTP 200.
- ✅ TOR-04-Pc0DlQe — source links resolve for every node — fresh build against the real public vault (110 nodes, 553 edges) + one-off script hit all 110 real node source URLs anonymously: 110/110 HTTP 200, 0 doubled `wiki/wiki` segments.
- ✅ TOR-10-7O3vg4B — deployed footer provenance clause — real static export served locally, `playwright-cli` confirmed footer text `"Built from 44 raw sources → 110 wiki pages and 553 connections"` verbatim, 44 independently cross-checked against `find ../ai-adoption-wiki/raw -name '*.md' | wc -l`.

### Conclusion
Three of four TORs are cleanly satisfied and were independently re-verified against live,
real data rather than trusted from the implementer's self-report. The fourth,
TOR-10-VQAEhzb, is a genuine, spec-flagged miss — but it is already irreversible in practice
and was a conscious decision made and documented by the user in the implementation session.
After surfacing this plainly during wrapup, the user confirmed accepting the deviation and
closing the epic, so this verification is sufficient to close Epic zeoBwQJ as PASS WITH
EXCEPTIONS.

### Manual verification performed: No

## Known Issues / Follow-ups

- TOR-10-VQAEhzb remains formally unsatisfied for `wiki-graph-explorer`. If a retroactive
  git-history audit is ever wanted, it needs its own follow-up — no tooling exists for it (the
  existing `check:vault-safety` only scans the current working tree via `git ls-files`, not
  full history across all commits/branches/blobs).
- Full verification against the **live** GitHub Pages URL (as opposed to a local static-export
  server) has not been done — that requires this branch to merge to `master` and the deploy
  workflow to run, which is out of scope for pre-merge epic verification.

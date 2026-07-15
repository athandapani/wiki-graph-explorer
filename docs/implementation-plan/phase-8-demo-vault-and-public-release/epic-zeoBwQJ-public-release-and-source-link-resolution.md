# Epic zeoBwQJ: Public Release & Source-Link Resolution

**Phase:** 8 — Demo Vault & Public Release
**Status:** Not Started
**Dependencies:** Epic iv5GPN9 (external vault wired and verified), Epic TakRqyO (footer provenance clause)

---

## Description

Audit git history for private content and flip both repositories to public once their audits pass, then
verify every node's "View source on GitHub" link resolves for an anonymous visitor — closing issue #4
finding A3, where the path join produced a doubled segment and the private repo made every source link
404 regardless.

**Two repositories, audited separately, because their risk profiles are not comparable.**
`ai-adoption-wiki` must be public for source links to resolve at all; it is newly created with no
history and has never held private material, so its audit is short. `wiki-graph-explorer` should be
public because it is the portfolio artifact a recruiter is meant to inspect — the engineering *is* the
evidence (Product Vision §2) — but it carries a long history developed alongside the private
`second-brain` vault, which is why `check:vault-safety` exists at all. Its audit is the real one.

**This epic contains the most consequential requirement in the baseline.** Publishing is irreversible in
practice: anything exposed can be cloned or indexed within seconds, and deleting it afterward does not
retract it. TOR-10-VQAEhzb gates TOR-10-vaZLdHp and the ordering is not negotiable — the audit covers
all commits, branches, and reachable blobs, not merely the working tree, because content deleted in a
later commit remains readable in history. It is scoped as its own epic so the audit gets a focused
session and an independent wrapup review rather than sharing one with wiring work.

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|-----------------|
| TOR-10-VQAEhzb | `docs/requirements/10-demo-vault.feature.md` | The repository's full git history shall be audited and confirmed free of private content before the repository's visibility is changed to public |
| TOR-10-vaZLdHp | `docs/requirements/10-demo-vault.feature.md` | The repository shall be publicly readable by an anonymous, unauthenticated client once its history audit has passed |
| TOR-04-Pc0DlQe | `docs/requirements/04-side-panel.feature.md` | The side panel's "View source on GitHub" link shall resolve to an existing file for every node in the deployed public vault build |
| TOR-10-7O3vg4B | `docs/requirements/10-demo-vault.feature.md` | The deployed /graph page's stats footer shall render its full provenance clause, reporting a source count equal to the number of sources ingested into the public vault |

## Key Components

### Verification

- Git history audit — `wiki-graph-explorer`: all commits, branches, and reachable blobs scanned for `second-brain`, organizational, and family/health content; must report zero before visibility changes
- Git history audit — `ai-adoption-wiki`: same scan; low expected risk (newly created, no prior history)
- Repository visibility — each repo flipped to public only after its own audit passes; `ai-adoption-wiki` is required for source links, `wiki-graph-explorer` for the portfolio claim
- Deployed verification — every node's source-link href returns HTTP 200 anonymously; footer renders its full provenance clause

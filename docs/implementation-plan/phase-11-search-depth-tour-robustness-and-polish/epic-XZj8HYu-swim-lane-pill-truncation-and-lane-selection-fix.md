# Epic XZj8HYu: Swim-Lane Pill Truncation & Lane Selection Fix

**Phase:** 11 — Search Depth, Tour Robustness & Polish
**Status:** Not Started
**Dependencies:** Epic H0q48k8 (Swim-Lane Board Completion), Epic scQi8pt (Swim-Lane Layout Mode)

> **Brand:** Use the project's brand guidelines skill for pill/lane treatment if one is
> configured.

---

## Description

Two swim-lane change-control fixes captured together during `/peak-workflow:capture-requirements`
(both approved by the user as reversals/additions to merged TORs, not silent drift):

1. **Pill truncation.** `TOR-06-cSCqVtt` previously required full, untruncated pill titles
   (issue #4 finding B5) and was shipped that way by Epic H0q48k8 (`PillNode.tsx`,
   `whitespace-nowrap`, no truncation). In practice this produced the opposite failure —
   oversized pills crowding neighbors and breaking lane layout at default viewport size
   (TOR-06-0ZRtILL). TOR-06-cSCqVtt has been amended in place to require truncation at ~25
   characters with an ellipsis, while keeping the full title reachable via the pill's tooltip and
   the side panel. **This epic re-implements TOR-06-cSCqVtt's amended text — Epic H0q48k8's
   `requirements:` sidecar has been updated to drop it (see `released:` note there) so
   `/peak-workflow:status` doesn't double-count or misreport it.**
2. **Empty Raw lane.** The largest folder/taxonomy value in the deployed demo vault
   (`raw/2026-07`, 44 nodes) is dominated by zero-degree nodes that TOR-06-nQ4vXsD hides
   permanently (unlike the exactly-one-edge case TOR-06-Zk8pLwR covers, nothing links to a
   zero-degree node, so no click ever reveals it). That lets it win one of the 4 primary lane
   slots by raw node count (`lib/lane-assignment.ts`) while rendering with few or no visible
   pills — reading as broken rather than sparse. New TOR-06-KruzYET excludes a folder/taxonomy
   value from the "4 largest" ranking when every one of its nodes is hidden, folding it into the
   "Other" lane instead.

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
| TOR-06-cSCqVtt | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall truncate a swim-lane pill's title text with an ellipsis when it exceeds approximately 25 characters, surfacing the full title via the pill's tooltip and the side panel |
| TOR-06-yzcZ7CL | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render a swim-lane pill's title in full, without an ellipsis, when that title is within approximately 25 characters |
| TOR-06-KruzYET | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall exclude a folder/taxonomy value from the "4 largest" lane-selection ranking when every one of its nodes is hidden from the board by default |

## Key Components

### Frontend

- `components/graph/PillNode.tsx` — replace `whitespace-nowrap`/full-width sizing with
  truncation at ~25 characters (ellipsis) plus a native `title` attribute tooltip carrying the
  full text; titles within ~25 characters remain unaffected
- `lib/lane-assignment.ts` — pre-filter the top-4-by-count ranking to exclude any folder/taxonomy
  value whose nodes are all zero-degree (fully hidden), folding it into the "Other" lane instead
  of occupying one of the 4 primary slots
- `components/graph/SwimLaneCanvas.tsx` — no behavioral change expected beyond consuming the
  updated `lane-assignment.ts` output and `PillNode.tsx`'s new sizing

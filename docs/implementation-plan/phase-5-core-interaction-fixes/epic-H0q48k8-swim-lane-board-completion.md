# Epic H0q48k8: Swim-Lane Board Completion

**Phase:** 5 — Core Interaction Fixes
**Status:** Not Started
**Dependencies:** Epic niaTair (force-directed affordances finalized)

> **Brand:** Use the project's brand guidelines skill for the UI treatment in this epic
> if one is configured.

---

## Description

Finish the swim-lane board: surface hidden low-connectivity nodes behind a per-lane "+N more"
affordance, size pills to their full label text, and render lanes as tinted containers with descriptors
(issue #4 findings A7/B5/B6). The board silently dropped 8 of 47 nodes with no count and truncated pill
labels to ellipses — a visitor auditing whether the artifact is honest could see neither what was
withheld nor what a node was without clicking it.

Also corrects the explainer copy to name the layout mode each affordance actually lives in (A8). Copy
that points at a control the reader cannot find reads as a broken promise, which costs more trust than
saying nothing. Depends on Epic niaTair so the explainer describes the force-directed affordances as
they finally ship.

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
| TOR-06-BxA7IRn | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall display a "+N more" affordance in each swim-lane whose hidden low-connectivity nodes number at least one, reporting the exact count hidden from that lane |
| TOR-06-YjETzyC | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render every hidden low-connectivity node of a lane onto the board when a visitor activates that lane's "+N more" affordance |
| TOR-06-ihpx0Ya | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall omit the "+N more" affordance from any swim-lane that has no hidden nodes |
| ~~TOR-06-cSCqVtt~~ | `docs/requirements/06-swim-lane-layout.feature.md` | **Superseded — see note below.** Current scenario title: The /graph page shall truncate a swim-lane pill's title text with an ellipsis when it exceeds approximately 25 characters, surfacing the full title via the pill's tooltip and the side panel |
| TOR-06-JuNSwaW | `docs/requirements/06-swim-lane-layout.feature.md` | The /graph page shall render each swim-lane as a tinted rounded container carrying its folder/taxonomy heading and a short lane descriptor |
| TOR-05-OMWVZWL | `docs/requirements/05-explainer-and-discovery.feature.md` | The /graph page's explainer section shall name the layout mode in which each affordance it describes actually exists, and shall not describe an affordance as available in a mode that does not offer it |

> **Note (2026-07-27) — `TOR-06-cSCqVtt` superseded, coverage withdrawn.**
> This epic shipped the requirement as it then read: size each pill to its full title, no
> ellipsis truncation. A `/peak-workflow:capture-requirements` change-control event amended it
> in place — it now requires truncation at ~25 characters (with the full title reachable via
> the pill's tooltip and the side panel), because unrestricted-width pills were crowding
> neighbors and breaking lane layout at default viewport size (TOR-06-0ZRtILL).
>
> This epic's shipped code therefore satisfies a requirement that no longer exists, and does
> **not** satisfy the amended one. `TOR-06-cSCqVtt` has been removed from this epic's status
> sidecar `requirements:` field so `/peak-workflow:status` stops reporting it as covered, and
> reassigned to **Epic XZj8HYu** (Phase 11 — Swim-Lane Pill Truncation & Lane Selection Fix) for
> re-implementation. Nothing about this epic's other 5 TORs changed; its `status: Complete`
> stands for those. Do not treat the strikethrough row above as implementable work — the
> current requirement text lives only in the feature file and Epic XZj8HYu's spec.

## Key Components

### Frontend

- `components/graph/SwimLaneCanvas.tsx` — per-lane hidden-node count, "+N more" reveal, tinted lane containers with descriptors
- `components/graph/PillNode.tsx` — width sized to full label text at time of shipping; truncation
  behavior superseded, see note above and Epic XZj8HYu
- `lib/lane-assignment.ts` — expose per-lane hidden-node counts to the renderer
- `components/graph/ExplainerSection.tsx` — per-mode copy accuracy

// Hand-curated against the deployed public vault (ai-adoption-wiki/wiki, checked out by
// .github/workflows/deploy.yml) per ConOps §8 — never auto-generated, so a build against a
// different vault cannot silently produce a nonsense tour. Each consecutive pair of node ids is
// connected by a real edge in that vault's build (see tests/fixtures/tour-edges.json), which is
// what makes the tour demonstrate the graph rather than merely slideshow through it.
export interface TourStep {
  nodeId: string;
  caption: string;
}

export const TOUR_DEFINITION: TourStep[] = [
  {
    nodeId: "digital-second-brain",
    caption:
      "This whole map is a Digital Second Brain — a living, AI-maintained knowledge system built directly from real research. Click Next to see how it holds up its own claims to scrutiny.",
  },
  {
    nodeId: "attribution-problems-in-the-playbook",
    caption:
      "Verifying every one of a source playbook's 43 references against its captured sources surfaced real citation problems — this is what happens when claims get checked instead of just trusted.",
  },
  {
    nodeId: "ai-spending-benchmarks",
    caption:
      "Some figures hold up under scrutiny and some don't: BCG's 1.7%-of-revenue benchmark is well-corroborated across three sources, unlike the finer-grained numbers built on top of it.",
  },
  {
    nodeId: "roi-measurement-problem",
    caption:
      "94% of enterprises plan to keep spending on AI without measurable ROI — mostly because almost no one captured a pre-AI baseline to measure against in the first place.",
  },
  {
    nodeId: "adoption-is-a-leadership-problem",
    caption:
      "Across five independent sources, AI initiatives stall on people and process rather than model capability — the throughline of this whole map. Explore on your own to keep pulling the thread.",
  },
];

export function isTourAvailable(tour: TourStep[], nodeIds: Set<string> | string[]): boolean {
  const ids = nodeIds instanceof Set ? nodeIds : new Set(nodeIds);
  return tour.every((step) => ids.has(step.nodeId));
}

export interface TourValidationResult {
  valid: boolean;
  errors: string[];
}

interface ValidationEdge {
  source: string;
  target: string;
}

export function validateTourDefinition(
  tour: TourStep[],
  edges: ValidationEdge[],
): TourValidationResult {
  const errors: string[] = [];

  if (tour.length < 4 || tour.length > 5) {
    errors.push(`Tour must have 4 or 5 steps, got ${tour.length}`);
  }

  for (const step of tour) {
    if (!step.caption.trim()) {
      errors.push(`Step "${step.nodeId}" has an empty caption`);
    }
  }

  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(`${edge.source}|${edge.target}`);
    connected.add(`${edge.target}|${edge.source}`);
  }

  for (let i = 0; i < tour.length - 1; i++) {
    const a = tour[i].nodeId;
    const b = tour[i + 1].nodeId;
    if (!connected.has(`${a}|${b}`)) {
      errors.push(`No edge connects consecutive tour steps "${a}" and "${b}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}

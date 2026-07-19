"use client";

import type { TourStep } from "../../lib/tour-definition";

interface GuidedTourProps {
  tourDefinition: TourStep[];
  stepIndex: number | null;
  onStart: () => void;
  onNext: () => void;
  onExit: () => void;
}

export function GuidedTour({ tourDefinition, stepIndex, onStart, onNext, onExit }: GuidedTourProps) {
  if (stepIndex === null) {
    return (
      <button type="button" onClick={onStart} className="text-sm underline">
        Take a tour
      </button>
    );
  }

  const isFinalStep = stepIndex === tourDefinition.length - 1;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        Step {stepIndex + 1} of {tourDefinition.length}
      </span>
      {isFinalStep ? (
        <button type="button" onClick={onExit} className="underline">
          Explore on your own
        </button>
      ) : (
        <button type="button" onClick={onNext} className="underline">
          Next
        </button>
      )}
      <button type="button" onClick={onExit} aria-label="Exit tour" className="text-foreground/60">
        ×
      </button>
    </div>
  );
}

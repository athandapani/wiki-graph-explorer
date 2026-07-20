// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuidedTour } from "../components/graph/GuidedTour";
import type { TourStep } from "../lib/tour-definition";

afterEach(() => {
  cleanup();
});

const tourDefinition: TourStep[] = [
  { nodeId: "a", caption: "Caption A" },
  { nodeId: "b", caption: "Caption B" },
  { nodeId: "c", caption: "Caption C" },
  { nodeId: "d", caption: "Caption D" },
  { nodeId: "e", caption: "Caption E" },
];

describe("GuidedTour", () => {
  it('TOR-08-NtvwEKk: renders a "Take a tour" control when inactive, which calls onStart when activated', () => {
    const onStart = vi.fn();
    render(
      <GuidedTour
        tourDefinition={tourDefinition}
        stepIndex={null}
        onStart={onStart}
        onNext={() => {}}
        onExit={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("Take a tour"));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("TOR-08-XeNIfIf: displays a step indicator reporting the current step number and total steps", () => {
    render(
      <GuidedTour
        tourDefinition={tourDefinition}
        stepIndex={1}
        onStart={() => {}}
        onNext={() => {}}
        onExit={() => {}}
      />,
    );

    expect(screen.getByText("Step 2 of 5")).toBeTruthy();
  });

  it('TOR-08-CE4svkF: on a non-final step, renders "Next" which calls onNext when activated', () => {
    const onNext = vi.fn();
    render(
      <GuidedTour
        tourDefinition={tourDefinition}
        stepIndex={1}
        onStart={() => {}}
        onNext={onNext}
        onExit={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledOnce();
    expect(screen.queryByText("Explore on your own")).toBeNull();
  });

  it('TOR-08-GvZKcLR: on the final step, renders "Explore on your own" which calls onExit when activated', () => {
    const onExit = vi.fn();
    render(
      <GuidedTour
        tourDefinition={tourDefinition}
        stepIndex={4}
        onStart={() => {}}
        onNext={() => {}}
        onExit={onExit}
      />,
    );

    expect(screen.queryByText("Next")).toBeNull();
    fireEvent.click(screen.getByText("Explore on your own"));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("TOR-08-RCP0xbr: the close control is present on any active step and calls onExit when activated", () => {
    const onExit = vi.fn();
    render(
      <GuidedTour
        tourDefinition={tourDefinition}
        stepIndex={2}
        onStart={() => {}}
        onNext={() => {}}
        onExit={onExit}
      />,
    );

    fireEvent.click(screen.getByLabelText("Exit tour"));
    expect(onExit).toHaveBeenCalledOnce();
  });
});

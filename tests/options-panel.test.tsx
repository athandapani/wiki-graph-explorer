// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OptionsPanel } from "../components/graph/OptionsPanel";

// Real DOM behavior for the controlled-open contract app/graph/page.tsx's Esc chain relies on —
// source-text assertions (tests/options-panel.test.ts) cannot see whether the backdrop actually
// unmounts, which is exactly the gap issue #4 finding A4 fell through.

function renderPanel(overrides: Partial<Parameters<typeof OptionsPanel>[0]> = {}) {
  return render(
    <OptionsPanel
      isOpen={false}
      onOpenChange={() => {}}
      layoutMode="swim-lane"
      onLayoutModeChange={() => {}}
      isDark={false}
      onThemeChange={() => {}}
      {...overrides}
    />,
  );
}

afterEach(cleanup);

describe("OptionsPanel controlled open state", () => {
  it("TOR-09-4BewmC1: clicking the toggle button reports the flipped open state via onOpenChange", () => {
    const onOpenChange = vi.fn();
    renderPanel({ isOpen: false, onOpenChange });

    fireEvent.click(screen.getByLabelText("Options & help"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("TOR-09-4BewmC1: clicking the backdrop reports closed via onOpenChange", () => {
    const onOpenChange = vi.fn();
    renderPanel({ isOpen: true, onOpenChange });

    fireEvent.click(screen.getByLabelText("Close options"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("TOR-09-4BewmC1: the backdrop unmounts once isOpen flips to false from outside, so the next click is not swallowed", () => {
    const { rerender } = renderPanel({ isOpen: true });
    expect(screen.getByLabelText("Close options")).toBeTruthy();

    // Simulates the Esc chain closing the popover externally (setIsOptionsOpen(false) in
    // app/graph/page.tsx), not a click on the backdrop itself.
    rerender(
      <OptionsPanel
        isOpen={false}
        onOpenChange={() => {}}
        layoutMode="swim-lane"
        onLayoutModeChange={() => {}}
        isDark={false}
        onThemeChange={() => {}}
      />,
    );

    expect(screen.queryByLabelText("Close options")).toBeNull();
  });
});

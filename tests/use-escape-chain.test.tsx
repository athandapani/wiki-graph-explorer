// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEscapeChain, type EscapeChainLayer } from "../hooks/useEscapeChain";

// Real DOM, real key events — precedence bugs here are exactly the kind of thing a source-text
// assertion cannot catch (issue #4 finding A4: Esc was dead because no listener existed at all).

function Harness({ layers }: { layers: EscapeChainLayer[] }) {
  useEscapeChain(layers);
  return null;
}

function pressEscape(): void {
  fireEvent.keyDown(document, { key: "Escape" });
}

afterEach(cleanup);

describe("useEscapeChain", () => {
  it("TOR-09-YrywFkB: calls only the first active layer's onEscape, not later active layers", () => {
    const first = vi.fn();
    const second = vi.fn();
    render(
      <Harness
        layers={[
          { isActive: true, onEscape: first },
          { isActive: true, onEscape: second },
        ]}
      />,
    );

    pressEscape();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it("skips inactive layers and calls the first active one further down the list", () => {
    const inactive = vi.fn();
    const active = vi.fn();
    render(
      <Harness
        layers={[
          { isActive: false, onEscape: inactive },
          { isActive: true, onEscape: active },
        ]}
      />,
    );

    pressEscape();

    expect(inactive).not.toHaveBeenCalled();
    expect(active).toHaveBeenCalledTimes(1);
  });

  it("does nothing when no layer is active", () => {
    const onEscape = vi.fn();
    render(<Harness layers={[{ isActive: false, onEscape }]} />);

    pressEscape();

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("TOR-09-YrywFkB: peels one layer per press as layers change across renders, matching the composite de-escalation scenario", () => {
    // Given a node selected, a query typed, and the Options popover open (all three active)
    const closePopover = vi.fn();
    const clearSearch = vi.fn();
    const clearSelection = vi.fn();
    const { rerender } = render(
      <Harness
        layers={[
          { isActive: true, onEscape: closePopover },
          { isActive: true, onEscape: clearSearch },
          { isActive: true, onEscape: clearSelection },
        ]}
      />,
    );

    // When Esc is pressed once, Then only the popover closes
    pressEscape();
    expect(closePopover).toHaveBeenCalledTimes(1);
    expect(clearSearch).not.toHaveBeenCalled();
    expect(clearSelection).not.toHaveBeenCalled();

    // And a second Esc press clears the search query while leaving the node selected
    rerender(
      <Harness
        layers={[
          { isActive: false, onEscape: closePopover },
          { isActive: true, onEscape: clearSearch },
          { isActive: true, onEscape: clearSelection },
        ]}
      />,
    );
    pressEscape();
    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(clearSelection).not.toHaveBeenCalled();

    // And a third Esc press clears the node selection
    rerender(
      <Harness
        layers={[
          { isActive: false, onEscape: closePopover },
          { isActive: false, onEscape: clearSearch },
          { isActive: true, onEscape: clearSelection },
        ]}
      />,
    );
    pressEscape();
    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it("removes its keydown listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Harness layers={[{ isActive: true, onEscape: vi.fn() }]} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("ignores non-Escape keys", () => {
    const onEscape = vi.fn();
    render(<Harness layers={[{ isActive: true, onEscape }]} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onEscape).not.toHaveBeenCalled();
  });
});

// @vitest-environment jsdom
import { createRef, type ComponentProps } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "../components/graph/SearchInput";

// Real DOM, real key events — the focus and count behavior below cannot be verified by reading
// source text, which is the gap that let issue #4's search bugs ship.

function renderInput(overrides: Partial<ComponentProps<typeof SearchInput>> = {}) {
  return render(
    <SearchInput
      value=""
      onChange={() => {}}
      isActive={false}
      hasResults
      matchCount={null}
      {...overrides}
    />,
  );
}

afterEach(cleanup);

describe("SearchInput result count", () => {
  it("TOR-03-1LlqKF1: reports the number of matching pages", () => {
    // Given a query matching exactly 7 pages above the relevance threshold
    renderInput({ value: "change management", isActive: true, matchCount: 7 });

    // Then a visible count reports 7
    expect(screen.getByText("7 matching pages")).toBeTruthy();
  });

  it("TOR-03-1LlqKF1: updates the count as the query changes", () => {
    const { rerender } = renderInput({ value: "a", isActive: true, matchCount: 7 });
    expect(screen.getByText("7 matching pages")).toBeTruthy();

    rerender(
      <SearchInput value="ab" onChange={() => {}} isActive hasResults matchCount={2} />,
    );

    expect(screen.queryByText("7 matching pages")).toBeNull();
    expect(screen.getByText("2 matching pages")).toBeTruthy();
  });

  it("TOR-03-1LlqKF1: shows no count once the query is cleared", () => {
    renderInput({ value: "", isActive: false, matchCount: 7 });
    expect(screen.queryByText(/matching page/)).toBeNull();
  });

  it("TOR-03-1LlqKF1: shows no count while a ranking is still in flight", () => {
    // null (not 0) means "not ranked yet" — rendering "0 matching pages" here would state
    // something the next frame contradicts.
    renderInput({ value: "typing", isActive: true, matchCount: null });
    expect(screen.queryByText(/matching page/)).toBeNull();
  });

  it("says 'page' rather than 'pages' for a single match", () => {
    renderInput({ value: "q", isActive: true, matchCount: 1 });
    expect(screen.getByText("1 matching page")).toBeTruthy();
  });
});

describe("SearchInput ranked results", () => {
  const results = [
    { id: "b", title: "Page B", score: 0.9 },
    { id: "a", title: "Page A", score: 0.5 },
  ];

  it("TOR-03-pP3y0uV: renders result titles in the given (descending-score) order", () => {
    renderInput({ value: "query", isActive: true, results });

    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(["Page B", "Page A"]);
  });

  it("TOR-03-buN9A2Q: clicking a result invokes onSelectResult with that result's id", () => {
    const onSelectResult = vi.fn();
    renderInput({ value: "query", isActive: true, results, onSelectResult });

    fireEvent.click(screen.getByText("Page A"));

    expect(onSelectResult).toHaveBeenCalledWith("a");
  });

  it("omits the results dropdown when isActive is false", () => {
    renderInput({ value: "query", isActive: false, results });
    expect(screen.queryByText("Page B")).toBeNull();
  });

  it("omits the results dropdown when results is empty", () => {
    renderInput({ value: "query", isActive: true, results: [] });
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("SearchInput focus shortcuts", () => {
  it("TOR-09-O0Wu0vg: Ctrl+K focuses the search input from outside any text input", () => {
    // Given focus is outside any text input
    renderInput();
    const input = screen.getByLabelText("Search");
    expect(document.activeElement).not.toBe(input);

    // When the visitor presses Ctrl+K
    fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });

    // Then the input receives keyboard focus
    expect(document.activeElement).toBe(input);
  });

  it("TOR-09-O0Wu0vg: the forward-slash key focuses the search input from the same state", () => {
    renderInput();
    const input = screen.getByLabelText("Search");

    fireEvent.keyDown(document.body, { key: "/" });

    expect(document.activeElement).toBe(input);
  });

  it("TOR-09-O0Wu0vg: forward-slash inside a text input types the character instead of moving focus", () => {
    renderInput();
    const input = screen.getByLabelText("Search");

    const other = document.createElement("input");
    other.type = "text";
    document.body.appendChild(other);
    other.focus();
    expect(document.activeElement).toBe(other);

    // When "/" is pressed while focus is already in a text field
    const notPrevented = fireEvent.keyDown(other, { key: "/" });

    // Then focus does not move, and the event is left alone so the character types through
    expect(document.activeElement).toBe(other);
    expect(document.activeElement).not.toBe(input);
    expect(notPrevented).toBe(true);

    other.remove();
  });

  it("TOR-09-O0Wu0vg: Ctrl+K still works while focus is already in the search input", () => {
    renderInput();
    const input = screen.getByLabelText("Search") as HTMLInputElement;
    input.focus();

    fireEvent.keyDown(input, { key: "k", ctrlKey: true });

    expect(document.activeElement).toBe(input);
  });

  it("removes its keydown listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderInput();
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    removeSpy.mockRestore();
  });
});

describe("SearchInput ref forwarding", () => {
  it("TOR-09-gEPQ6wm: forwards a ref to the underlying input so a parent can blur() it", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <SearchInput value="query" onChange={() => {}} isActive hasResults ref={ref} />,
    );
    const input = screen.getByLabelText("Search");
    expect(ref.current).toBe(input);

    // Given the input is focused (e.g. by the visitor typing)
    ref.current?.focus();
    expect(document.activeElement).toBe(input);

    // When the parent's Esc handler blurs it via the forwarded ref
    ref.current?.blur();

    // Then it no longer holds keyboard focus
    expect(document.activeElement).not.toBe(input);
  });
});

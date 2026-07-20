// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../components/graph/ThemeToggle";

afterEach(cleanup);

describe("ThemeToggle", () => {
  it("TOR-07-6nVdgBJ: shows a sun icon and 'Switch to light mode' label when dark mode is active", () => {
    render(<ThemeToggle isDark={true} onChange={() => {}} />);
    const button = screen.getByLabelText("Switch to light mode");
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("TOR-07-6nVdgBJ: shows a moon icon and 'Switch to dark mode' label when light mode is active", () => {
    render(<ThemeToggle isDark={false} onChange={() => {}} />);
    const button = screen.getByLabelText("Switch to dark mode");
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking the toggle calls onChange with the flipped value", () => {
    const onChange = vi.fn();
    render(<ThemeToggle isDark={false} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Switch to dark mode"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});

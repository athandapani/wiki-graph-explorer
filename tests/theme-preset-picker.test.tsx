// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemePresetPicker } from "../components/graph/ThemePresetPicker";

function renderPicker(overrides: Partial<Parameters<typeof ThemePresetPicker>[0]> = {}) {
  return render(
    <ThemePresetPicker
      isOpen={true}
      onOpenChange={() => {}}
      activePreset="teal"
      customAccent={null}
      onPresetChange={() => {}}
      onCustomAccentChange={() => {}}
      {...overrides}
    />,
  );
}

afterEach(cleanup);

describe("ThemePresetPicker", () => {
  it("TOR-07-6nVdgBJ: renders the 3 curated presets plus a Custom option, with the active one aria-pressed", () => {
    renderPicker({ activePreset: "indigo" });

    expect(screen.getByRole("button", { name: "Teal" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Indigo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Plum" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Custom" })).toBeTruthy();

    expect(screen.getByRole("button", { name: "Indigo" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Teal" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("TOR-07-VBZZx0f: clicking a curated preset fires onPresetChange with that preset's id", () => {
    const onPresetChange = vi.fn();
    renderPicker({ onPresetChange });

    fireEvent.click(screen.getByRole("button", { name: "Plum" }));

    expect(onPresetChange).toHaveBeenCalledWith("plum");
  });

  it("TOR-09-4BewmC1-style: the backdrop unmounts once isOpen flips to false from outside", () => {
    const { rerender } = renderPicker({ isOpen: true });
    expect(screen.getByLabelText("Close theme presets")).toBeTruthy();

    rerender(
      <ThemePresetPicker
        isOpen={false}
        onOpenChange={() => {}}
        activePreset="teal"
        customAccent={null}
        onPresetChange={() => {}}
        onCustomAccentChange={() => {}}
      />,
    );

    expect(screen.queryByLabelText("Close theme presets")).toBeNull();
  });

  it("TOR-07-LquSsD5: selecting Custom reveals a color picker and does not itself fire onCustomAccentChange", () => {
    const onCustomAccentChange = vi.fn();
    const onPresetChange = vi.fn();
    renderPicker({ activePreset: "teal", onPresetChange, onCustomAccentChange });

    expect(screen.queryByLabelText("Custom accent color")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(onPresetChange).toHaveBeenCalledWith("custom");
    expect(onCustomAccentChange).not.toHaveBeenCalled();
  });

  it("TOR-07-HKyFd0T: shows the CVD/contrast disclosure note only when Custom is active", () => {
    const { rerender } = renderPicker({ activePreset: "teal" });
    expect(screen.queryByText(/not checked for color-vision-deficiency/i)).toBeNull();

    rerender(
      <ThemePresetPicker
        isOpen={true}
        onOpenChange={() => {}}
        activePreset="custom"
        customAccent={null}
        onPresetChange={() => {}}
        onCustomAccentChange={() => {}}
      />,
    );

    expect(screen.getByText(/not checked for color-vision-deficiency/i)).toBeTruthy();
  });

  it("TOR-07-p18cpcx: changing the color input fires onCustomAccentChange with the picked hex, not onPresetChange", () => {
    const onCustomAccentChange = vi.fn();
    const onPresetChange = vi.fn();
    renderPicker({
      activePreset: "custom",
      onCustomAccentChange,
      onPresetChange,
    });

    fireEvent.change(screen.getByLabelText("Custom accent color"), {
      target: { value: "#a13d8f" },
    });

    expect(onCustomAccentChange).toHaveBeenCalledWith("#a13d8f");
    expect(onPresetChange).not.toHaveBeenCalled();
  });

  it("TOR-07-dttI7qm: selecting a curated preset while Custom was active fires onPresetChange", () => {
    const onPresetChange = vi.fn();
    renderPicker({ activePreset: "custom", onPresetChange });

    fireEvent.click(screen.getByRole("button", { name: "Teal" }));

    expect(onPresetChange).toHaveBeenCalledWith("teal");
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "../components/graph/Footer";

afterEach(() => {
  cleanup();
});

describe("Footer stats", () => {
  it("TOR-08-LQAbYTw: renders the exact provenance sentence when sourceCount is a positive number", () => {
    render(<Footer nodeCount={142} edgeCount={389} sourceCount={40} />);

    expect(
      screen.getByText("Built from 40 raw sources → 142 wiki pages and 389 connections"),
    ).toBeTruthy();
  });

  it("TOR-08-dkecfj5: renders only page and connection counts, with no 'Built from' or '0'/'null' as a source count, when sourceCount is null", () => {
    render(<Footer nodeCount={142} edgeCount={389} sourceCount={null} />);

    const statsLine = screen.getByText("142 wiki pages · 389 connections");
    expect(statsLine).toBeTruthy();
    expect(statsLine.textContent).not.toContain("Built from");
    expect(statsLine.textContent).not.toMatch(/\b0\b/);
    expect(statsLine.textContent).not.toContain("null");
  });

  it("TOR-08-dkecfj5: renders the identical footer text when sourceCount is 0 as when it is null", () => {
    render(<Footer nodeCount={142} edgeCount={389} sourceCount={0} />);

    expect(screen.getByText("142 wiki pages · 389 connections")).toBeTruthy();
  });

  it("TOR-08-AzJ7BQu: displays the Esc-to-reset hint when stats are present", () => {
    render(<Footer nodeCount={142} edgeCount={389} sourceCount={40} />);

    expect(screen.getByText(/Esc to reset/)).toBeTruthy();
  });

  it("renders no stats line and no Esc hint on the home page's parameterless <Footer />, keeping the version string (regression guard)", () => {
    render(<Footer />);

    expect(screen.queryByText(/Built from/)).toBeNull();
    expect(screen.queryByText(/wiki pages ·/)).toBeNull();
    expect(screen.queryByText(/Esc to reset/)).toBeNull();
    expect(screen.getByText(/wiki-graph-explorer v/)).toBeTruthy();
  });
});

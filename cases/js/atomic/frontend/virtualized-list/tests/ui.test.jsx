import { describe, it, expect } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { App } from "../src/App";

describe("Virtualized list", () => {
  it("renders the virtual list container", () => {
    render(<App />);

    expect(screen.getByTestId("virtual-list")).toBeInTheDocument();
  });

  it("renders only a small number of rows", () => {
    render(<App />);

    const rows = screen
      .getByTestId("virtual-list")
      .querySelectorAll('[data-testid^="virtual-row-"]');

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(15);
    expect(rows.length).toBeLessThan(10000);
  });

  it("renders the first items initially", () => {
    render(<App />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders different rows after scrolling", async () => {
    const listRef = createRef();
    const { container } = render(<App ref={listRef} />);

    act(() => {
      listRef.current.scrollToItem(142, "start");
    });

    await waitFor(() => {
      expect(screen.getByTestId("virtual-row-142")).toBeInTheDocument();
      expect(screen.queryByTestId("virtual-row-0")).not.toBeInTheDocument();
    });

    const rows = container.querySelectorAll('[data-testid^="virtual-row-"]');
    expect(rows.length).toBeLessThanOrEqual(15);
  });

  it("renders the last items when scrolled to the bottom", async () => {
    const listRef = createRef();
    const { container } = render(<App ref={listRef} />);

    act(() => {
      listRef.current.scrollToItem(9999, "end");
    });

    await waitFor(() => {
      expect(screen.getByTestId("virtual-row-9999")).toBeInTheDocument();
    });

    const rows = container.querySelectorAll('[data-testid^="virtual-row-"]');
    expect(rows.length).toBeLessThanOrEqual(15);
  });

  it("can scroll back to the first items", async () => {
    const listRef = createRef();

    render(<App ref={listRef} />);

    act(() => {
      listRef.current.scrollToItem(142, "start");
    });

    await waitFor(() => {
      expect(screen.getByTestId("virtual-row-142")).toBeInTheDocument();
    });

    act(() => {
      listRef.current.scrollTo(0);
    });

    await waitFor(() => {
      expect(screen.getByTestId("virtual-row-0")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });
});

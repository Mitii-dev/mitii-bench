import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { App } from "../src/App.jsx";

describe("Hierarchical Tree Select", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the tree and initially expanded top-level branches", () => {
    render(<App />);

    expect(screen.getByTestId("tree-select")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("UX Research")).toBeInTheDocument();
  });

  it("selects every descendant when a parent is selected", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Engineering"));

    const summary = screen.getByTestId("selection-summary");

    expect(within(summary).getByText("4 selected")).toBeInTheDocument();
    expect(within(summary).getAllByTestId("selected-item")).toHaveLength(4);

    expect(screen.getByLabelText("Engineering")).toBeChecked();
    expect(screen.getByLabelText("Frontend")).toBeChecked();
    expect(screen.getByLabelText("Backend")).toBeChecked();
  });

  it("updates ancestor state when a single leaf is selected", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("React"));

    expect(screen.getByLabelText("React")).toBeChecked();
    expect(screen.getByLabelText("Engineering")).not.toBeChecked();
    expect(screen.getByLabelText("Frontend")).not.toBeChecked();

    expect(screen.getByTestId("selection-summary")).toHaveTextContent(
      "1 selected",
    );

    expect(screen.getByLabelText("Engineering").indeterminate).toBe(true);
    expect(screen.getByLabelText("Frontend").indeterminate).toBe(true);
  });

  it("checks a parent when all its children are selected individually", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("React"));
    fireEvent.click(screen.getByLabelText("Vue"));

    expect(screen.getByLabelText("Frontend")).toBeChecked();
    expect(screen.getByLabelText("Engineering").indeterminate).toBe(true);
  });

  it("clears all selections and resets partial states", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("React"));

    expect(screen.getByLabelText("Engineering").indeterminate).toBe(true);

    fireEvent.click(screen.getByTestId("clear-selection"));

    expect(screen.getByTestId("selection-summary")).toHaveTextContent(
      "0 selected",
    );

    expect(screen.getByLabelText("React")).not.toBeChecked();
    expect(screen.getByLabelText("Engineering")).not.toBeChecked();
    expect(screen.getByLabelText("Engineering").indeterminate).toBe(false);
  });

  it("collapses and expands branches without changing their selections", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("React"));
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse Engineering" }),
    );

    expect(
      screen.queryByRole("checkbox", { name: "React" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("selection-summary")).toHaveTextContent(
      "1 selected",
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand Engineering" }));

    expect(screen.getByRole("checkbox", { name: "React" })).toBeInTheDocument();

    expect(screen.getByLabelText("React")).toBeChecked();
  });

  it("deselects all descendants when a selected parent is unchecked", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Engineering"));
    fireEvent.click(screen.getByLabelText("Engineering"));

    expect(screen.getByTestId("selection-summary")).toHaveTextContent(
      "0 selected",
    );

    expect(screen.getByLabelText("React")).not.toBeChecked();
    expect(screen.getByLabelText("Vue")).not.toBeChecked();
    expect(screen.getByLabelText("Node.js")).not.toBeChecked();
    expect(screen.getByLabelText("Python")).not.toBeChecked();
  });

  it("keeps selections in separate branches independent", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("React"));
    fireEvent.click(screen.getByLabelText("UX Research"));

    expect(screen.getByTestId("selection-summary")).toHaveTextContent(
      "2 selected",
    );

    expect(screen.getByLabelText("Engineering").indeterminate).toBe(true);
    expect(screen.getByLabelText("Design").indeterminate).toBe(true);
  });

  it("disables Clear All when there are no selections", () => {
    render(<App />);

    expect(screen.getByTestId("clear-selection")).toBeDisabled();
  });
});

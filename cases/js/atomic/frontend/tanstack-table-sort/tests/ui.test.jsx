import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";

describe("TanStack Table sorting", () => {
  it("renders the table with initial data", () => {
    render(<App />);

    expect(screen.getByText("Sortable Data Table")).toBeInTheDocument();
    expect(screen.getByTestId("sort-header-name")).toBeInTheDocument();

    expect(screen.getByTestId("table-row-0")).toHaveTextContent("Charlie");
    expect(screen.getByTestId("table-row-1")).toHaveTextContent("Alice");
    expect(screen.getByTestId("table-row-2")).toHaveTextContent("David");
  });

  it("sorts names in ascending order when clicked once", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("sort-header-name"));

    const expectedOrder = ["Alice", "Bob", "Charlie", "David", "Eve"];

    expectedOrder.forEach((name, index) => {
      expect(screen.getByTestId(`table-row-${index}`)).toHaveTextContent(name);
    });
  });

  it("sorts names in descending order when clicked twice", async () => {
    const user = userEvent.setup();
    render(<App />);

    const header = screen.getByTestId("sort-header-name");

    await user.click(header);
    await user.click(header);

    const expectedOrder = ["Eve", "David", "Charlie", "Bob", "Alice"];

    expectedOrder.forEach((name, index) => {
      expect(screen.getByTestId(`table-row-${index}`)).toHaveTextContent(name);
    });
  });

  it("toggles back to ascending order after the third click", async () => {
    const user = userEvent.setup();
    render(<App />);

    const header = screen.getByTestId("sort-header-name");

    await user.click(header);
    await user.click(header);
    await user.click(header);

    expect(screen.getByTestId("table-row-0")).toHaveTextContent("Alice");
    expect(screen.getByTestId("table-row-4")).toHaveTextContent("Eve");
  });
});

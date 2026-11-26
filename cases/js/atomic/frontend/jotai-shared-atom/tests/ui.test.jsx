import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("Jotai Shared Atomic State", () => {
  it("displays the initial atom value", () => {
    render(<App />);

    expect(screen.getByTestId("atom-value-display")).toHaveTextContent(
      "Count: 0",
    );
  });

  it("increments the shared atom value", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("atom-inc-btn"));

    expect(screen.getByTestId("atom-value-display")).toHaveTextContent(
      "Count: 1",
    );
  });

  it("updates the display after multiple increments", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByTestId("atom-inc-btn");

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(screen.getByTestId("atom-value-display")).toHaveTextContent(
      "Count: 3",
    );
  });

  it("keeps the incrementer and display as independent components", () => {
    render(<App />);

    expect(screen.getByTestId("atom-inc-btn")).toBeInTheDocument();
    expect(screen.getByTestId("atom-value-display")).toBeInTheDocument();
  });
});

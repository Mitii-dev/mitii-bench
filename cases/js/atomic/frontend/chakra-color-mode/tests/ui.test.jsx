import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("Chakra UI color mode", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the responsive card", () => {
    render(<App />);

    expect(screen.getByTestId("chakra-card")).toBeInTheDocument();
  });

  it("renders the color mode toggle", () => {
    render(<App />);

    expect(screen.getByTestId("chakra-theme-btn")).toBeInTheDocument();
  });

  it("starts in light mode", () => {
    render(<App />);

    expect(screen.getByTestId("chakra-theme-btn")).toHaveTextContent(
      "Switch to Dark Mode",
    );
  });

  it("switches from light mode to dark mode", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByTestId("chakra-theme-btn"));

    expect(screen.getByTestId("chakra-theme-btn")).toHaveTextContent(
      "Switch to Light Mode",
    );
  });

  it("switches back to light mode", async () => {
    const user = userEvent.setup();

    render(<App />);

    const toggle = screen.getByTestId("chakra-theme-btn");

    await user.click(toggle);
    await user.click(toggle);

    expect(toggle).toHaveTextContent("Switch to Dark Mode");
  });
});

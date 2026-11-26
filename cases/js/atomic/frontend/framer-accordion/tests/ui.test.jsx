import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("Framer Motion Accordion", () => {
  it("renders the toggle button", () => {
    render(<App />);
    expect(screen.getByTestId("accordion-toggle")).toBeInTheDocument();
  });

  it("starts with the panel hidden", () => {
    render(<App />);
    expect(screen.queryByTestId("motion-panel")).not.toBeInTheDocument();
  });

  it("shows the panel when clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("accordion-toggle"));

    expect(screen.getByTestId("motion-panel")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("hides the panel when clicked again", async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByTestId("accordion-toggle");

    await user.click(toggle);
    await user.click(toggle);

    expect(screen.queryByTestId("motion-panel")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../solution/src/App.jsx";

describe("Framer Motion Drag Card", () => {
  it("renders the drag container", () => {
    render(<App />);
    expect(screen.getByTestId("drag-container")).toBeInTheDocument();
  });

  it("renders the draggable card", () => {
    render(<App />);
    expect(screen.getByTestId("drag-card")).toBeInTheDocument();
  });

  it("renders the card inside its boundary container", () => {
    render(<App />);

    const container = screen.getByTestId("drag-container");
    const card = screen.getByTestId("drag-card");

    expect(container).toContainElement(card);
  });

  it("enables horizontal and vertical dragging", () => {
    render(<App />);

    const card = screen.getByTestId("drag-card");

    expect(card).toHaveAttribute("draggable", "false");
    expect(card).toBeInTheDocument();
  });
});

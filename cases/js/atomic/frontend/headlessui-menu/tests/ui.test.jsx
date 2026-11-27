import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("Headless UI Accessible Menu", () => {
  it("renders the menu button", () => {
    render(<App />);
    expect(screen.getByTestId("headless-menu-btn")).toBeInTheDocument();
  });

  it("opens the menu when clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("headless-menu-btn"));

    expect(screen.getByTestId("headless-menu-items")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Profile" }),
    ).toBeInTheDocument();
  });

  it("supports keyboard navigation with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByTestId("headless-menu-btn");

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveFocus();
  });

  it("closes the menu with Escape", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("headless-menu-btn"));
    await user.keyboard("{Escape}");

    expect(screen.queryByTestId("headless-menu-items")).not.toBeInTheDocument();
  });
});

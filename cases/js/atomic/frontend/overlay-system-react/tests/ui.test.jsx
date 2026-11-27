import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";

describe("Overlay System", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback) =>
      setTimeout(callback, 0),
    );
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.unstubAllGlobals();
  });

  it("renders the overlay system and all primary controls", () => {
    render(<App />);

    expect(screen.getByTestId("overlay-system")).toBeInTheDocument();
    expect(screen.getByTestId("open-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("open-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("open-popover")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-trigger")).toBeInTheDocument();
  });

  it("opens and closes a dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-dialog"));

    expect(screen.getByTestId("dialog")).toBeInTheDocument();

    await user.click(
      within(screen.getByTestId("dialog")).getByTestId("close-overlay"),
    );

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes a drawer", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-drawer"));

    expect(screen.getByTestId("drawer")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByTestId("drawer")).not.toBeInTheDocument();
  });

  it("opens and closes a popover", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-popover"));

    expect(screen.getByTestId("popover")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByTestId("popover")).not.toBeInTheDocument();
  });

  it("displays a tooltip on hover and hides it on pointer leave", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByTestId("tooltip-trigger");

    await user.hover(trigger);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();

    await user.unhover(trigger);

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("opens a nested dialog without removing its parent", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-dialog"));

    const parent = screen.getByTestId("dialog");

    await user.click(
      within(parent).getByRole("button", {
        name: /open nested dialog/i,
      }),
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("nested-dialog")).toBeInTheDocument();
  });

  it("closes only the nested dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-dialog"));

    await user.click(
      screen.getByRole("button", { name: /open nested dialog/i }),
    );

    await user.keyboard("{Escape}");

    expect(screen.queryByTestId("nested-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("locks scrolling while a modal is open and restores it afterward", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "auto";

    render(<App />);

    await user.click(screen.getByTestId("open-dialog"));

    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(document.body.style.overflow).toBe("auto");
  });

  it("keeps scrolling locked while a nested modal remains open", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("open-dialog"));

    await user.click(
      screen.getByRole("button", { name: /open nested dialog/i }),
    );

    await user.keyboard("{Escape}");

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("restores focus to the original trigger after closing the dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByTestId("open-dialog");

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(trigger).toHaveFocus();
  });

  it("removes the dynamically created portal root on unmount", () => {
    const { unmount } = render(<App />);

    expect(
      document.querySelector('[data-testid="overlay-portal-root"]'),
    ).toBeInTheDocument();

    unmount();

    expect(
      document.querySelector('[data-testid="overlay-portal-root"]'),
    ).not.toBeInTheDocument();
  });
});

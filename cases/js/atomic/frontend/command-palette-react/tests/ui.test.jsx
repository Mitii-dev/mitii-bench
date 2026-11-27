import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";

describe("command-palette-react", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("opens with Ctrl+K and focuses the search input", async () => {
    render(<App />);
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("command-palette")).toBeInTheDocument();
    expect(screen.getByTestId("command-palette-search")).toHaveFocus();
  });

  it("filters commands without case sensitivity", async () => {
    render(<App />);
    await user.click(screen.getByTestId("command-palette-trigger"));
    const search = screen.getByTestId("command-palette-search");
    await user.type(search, "SETT");
    const options = screen.getByTestId("command-palette-options");
    expect(within(options).getByText("Open Settings")).toBeInTheDocument();
    expect(
      within(options).queryByText("Go to Dashboard"),
    ).not.toBeInTheDocument();
  });

  it("moves through results with arrow keys and executes with Enter", async () => {
    render(<App />);
    await user.click(screen.getByTestId("command-palette-trigger"));
    const search = screen.getByTestId("command-palette-search");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("command-result")).toHaveTextContent(
      "Settings opened",
    );
    expect(screen.queryByTestId("command-palette")).not.toBeInTheDocument();
  });

  it("shows an empty state when no command matches", async () => {
    render(<App />);
    await user.click(screen.getByTestId("command-palette-trigger"));
    await user.type(
      screen.getByTestId("command-palette-search"),
      "not-a-command",
    );
    expect(screen.getByTestId("command-palette-empty")).toBeInTheDocument();
  });

  it("closes with Escape and restores focus to the trigger", async () => {
    render(<App />);
    const trigger = screen.getByTestId("command-palette-trigger");
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("command-palette")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("executes a command selected with the mouse", async () => {
    render(<App />);
    await user.click(screen.getByTestId("command-palette-trigger"));
    await user.click(screen.getByTestId("command-option-help"));
    expect(screen.getByTestId("command-result")).toHaveTextContent(
      "Help opened",
    );
  });

  it("supports Cmd+K as well as Ctrl+K", async () => {
    render(<App />);
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByTestId("command-palette")).toBeInTheDocument();
  });
});

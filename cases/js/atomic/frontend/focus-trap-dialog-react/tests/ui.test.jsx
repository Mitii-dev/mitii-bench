import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";

describe("Focus Trap Dialog", () => {
  it("renders the dialog trigger", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "Open Dialog" }),
    ).toBeInTheDocument();
  });

  it("opens the dialog and moves focus inside", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Welcome aboard",
        }),
      ).toHaveFocus();
    });
  });

  it("keeps focus inside when pressing Tab on the last element", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    const closeButton = screen.getByTestId("close-dialog");
    const saveButton = screen.getByRole("button", { name: "Save" });
    saveButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it("wraps focus backwards when pressing Shift+Tab on the first element", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    const closeButton = screen.getByTestId("close-dialog");
    const saveButton = screen.getByRole("button", { name: "Save" });
    closeButton.focus();
    await user.tab({ shift: true });
    expect(saveButton).toHaveFocus();
  });

  it("does not focus disabled controls", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    const emailInput = screen.getByTestId("email-input");
    emailInput.focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("closes the dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("restores focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByTestId("open-dialog");
    await user.click(trigger);
    await user.click(screen.getByTestId("close-dialog"));
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the dialog using the Cancel button", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("makes background content inert while the dialog is open", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    expect(screen.getByRole("main")).toHaveAttribute("inert");
  });

  it("allows reopening the dialog after closing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("open-dialog"));
    await user.keyboard("{Escape}");
    await user.click(screen.getByTestId("open-dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

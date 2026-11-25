import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "../app/page.jsx";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusablesIn(modal) {
  return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR));
}

describe("accessible-modal", () => {
  afterEach(() => cleanup());
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it("opens modal and closes on Escape", async () => {
    render(<Page />);
    expect(screen.queryByTestId("accessible-modal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open modal/i }));
    expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("accessible-modal")).not.toBeInTheDocument();
  });

  it("traps focus with Tab inside the open modal", async () => {
    render(<Page />);
    await user.click(screen.getByRole("button", { name: /open modal/i }));
    const modal = screen.getByTestId("accessible-modal");
    const items = focusablesIn(modal);
    expect(items.length).toBeGreaterThanOrEqual(2);

    const first = items[0];
    const last = items[items.length - 1];
    expect(first).toHaveFocus();

    last.focus();
    expect(last).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    expect(modal.contains(document.activeElement)).toBe(true);

    first.focus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
    expect(modal.contains(document.activeElement)).toBe(true);

    // Focus must not escape to page chrome outside the dialog.
    const openTrigger = screen.getByRole("button", { name: /open modal/i });
    expect(openTrigger).not.toHaveFocus();
    expect(within(modal).getAllByRole("button").length).toBeGreaterThan(0);
  });
});

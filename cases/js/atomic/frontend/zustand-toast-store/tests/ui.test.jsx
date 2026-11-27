import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App, useNotificationStore } from "../src/App";

describe("Zustand notification store", () => {
  beforeEach(() => {
    cleanup();
    useNotificationStore.setState({ notifications: [] });
  });

  it("renders the trigger button and empty toast list", () => {
    render(<App />);

    expect(screen.getByTestId("trigger-toast")).toBeInTheDocument();
    expect(screen.getByTestId("toast-list")).toBeEmptyDOMElement();
  });

  it("adds a Hello notification when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("trigger-toast"));

    expect(screen.getByTestId("toast-list")).toHaveTextContent("Hello");
  });

  it("supports multiple notifications in the global store", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByTestId("trigger-toast");

    await user.click(trigger);
    await user.click(trigger);

    const toastList = screen.getByTestId("toast-list");

    expect(within(toastList).getAllByText("Hello")).toHaveLength(2);
  });

  it("removes a notification when dismissed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("trigger-toast"));

    const toastList = screen.getByTestId("toast-list");

    expect(within(toastList).getByText("Hello")).toBeInTheDocument();

    await user.click(
      within(toastList).getByRole("button", {
        name: "Dismiss notification",
      }),
    );

    expect(toastList).toBeEmptyDOMElement();
  });
});

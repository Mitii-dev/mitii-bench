import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";

describe("Notification Center", () => {
  it("renders notifications and the initial unread count", () => {
    render(<App />);

    expect(screen.getByTestId("notification-center")).toBeInTheDocument();

    expect(screen.getByTestId("notification-list")).toBeInTheDocument();

    expect(screen.getByTestId("unread-count")).toHaveTextContent("2");

    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("filters unread notifications", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("notification-filter-unread"));

    const list = screen.getByTestId("notification-list");

    expect(within(list).getAllByRole("article")).toHaveLength(2);

    expect(within(list).getByText("New message received")).toBeInTheDocument();

    expect(
      within(list).getByText("Account security alert"),
    ).toBeInTheDocument();
  });

  it("marks an individual notification as read", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Mark as read: New message received",
      }),
    );

    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");

    expect(
      screen.getByRole("button", {
        name: "Mark as unread: New message received",
      }),
    ).toBeInTheDocument();
  });

  it("marks a read notification as unread", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Mark as unread: Payment successful",
      }),
    );

    expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("mark-all-read"));

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");

    await user.click(screen.getByTestId("notification-filter-unread"));

    expect(screen.getByRole("status")).toHaveTextContent(
      "No notifications to display.",
    );
  });

  it("preserves notification status when switching filters", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Mark as read: New message received",
      }),
    );

    await user.click(screen.getByTestId("notification-filter-unread"));

    expect(screen.getAllByRole("article")).toHaveLength(1);

    await user.click(screen.getByTestId("notification-filter-all"));

    expect(screen.getAllByRole("article")).toHaveLength(4);

    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
  });

  it("disables mark all as read when no unread notifications remain", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("mark-all-read"));

    expect(screen.getByTestId("mark-all-read")).toBeDisabled();
  });
});

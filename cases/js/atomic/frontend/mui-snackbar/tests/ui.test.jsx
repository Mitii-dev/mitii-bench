import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import { App } from "../src/App";

describe("MUI Snackbar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the trigger button", () => {
    render(<App />);
    expect(screen.getByTestId("show-alert-btn")).toBeInTheDocument();
  });

  it("opens the success notification when clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("show-alert-btn"));

    expect(screen.getByText("Action Successful")).toBeInTheDocument();
  });

  it("automatically closes after 3 seconds", async () => {
    vi.useFakeTimers();
    render(<App />);

    act(() => {
      screen.getByTestId("show-alert-btn").click();
    });

    expect(screen.getByText("Action Successful")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Action Successful")).not.toBeInTheDocument();
  });
});

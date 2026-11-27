import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";

describe("optimistic-update-react", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders initial tasks and completion states", () => {
    render(<App />);
    expect(screen.getByText("Review pull request")).toBeInTheDocument();
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Not completed",
    );
    expect(screen.getByTestId("task-status-task-2")).toHaveTextContent(
      "Completed",
    );
  });

  it("updates immediately and retains the value after API success", async () => {
    render(<App />);
    await user.click(screen.getByTestId("task-toggle-task-1"));
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Saving...",
    );
    expect(screen.getByTestId("task-toggle-task-1")).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
        "Completed",
      ),
    );
    expect(screen.queryByTestId("task-error-task-1")).not.toBeInTheDocument();
  });

  it("rolls back to the previous value when the API fails", async () => {
    render(<App />);
    await user.click(screen.getByTestId("fail-next-request"));
    await user.click(screen.getByTestId("task-toggle-task-1"));
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Saving...",
    );
    await screen.findByTestId("task-error-task-1");
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Not completed",
    );
    expect(screen.getByTestId("task-toggle-task-1")).toHaveTextContent(
      "Mark complete",
    );
  });

  it("retries the failed intended change", async () => {
    render(<App />);
    await user.click(screen.getByTestId("fail-next-request"));
    await user.click(screen.getByTestId("task-toggle-task-1"));
    await screen.findByTestId("task-error-task-1");
    await user.click(screen.getByTestId("task-retry-task-1"));
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Saving...",
    );
    await waitFor(() =>
      expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
        "Completed",
      ),
    );
    expect(screen.queryByTestId("task-error-task-1")).not.toBeInTheDocument();
  });

  it("prevents duplicate submissions while an update is pending", async () => {
    render(<App />);
    const toggle = screen.getByTestId("task-toggle-task-1");
    await user.click(toggle);
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveTextContent("Saving...");
  });

  it("keeps unrelated task state unchanged after a failure", async () => {
    render(<App />);
    await user.click(screen.getByTestId("fail-next-request"));
    await user.click(screen.getByTestId("task-toggle-task-1"));
    await screen.findByTestId("task-error-task-1");
    expect(screen.getByTestId("task-status-task-1")).toHaveTextContent(
      "Not completed",
    );
    expect(screen.getByTestId("task-status-task-2")).toHaveTextContent(
      "Completed",
    );
  });
});

import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/App";

afterEach(cleanup);

describe("Radix Accessible Dialog", () => {
  it("renders the dialog trigger", () => {
    render(<App />);

    expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
  });

  it("opens the dialog when the trigger is clicked", async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("dialog-trigger"));

    expect(await screen.findByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the dialog and restores focus to the trigger", async () => {
    render(<App />);

    const trigger = screen.getByTestId("dialog-trigger");

    fireEvent.click(trigger);

    const closeButton = await screen.findByTestId("dialog-close");

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the dialog with the Escape key", async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("dialog-trigger"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
      code: "Escape",
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByTestId("dialog-trigger")).toHaveFocus();
    });
  });
});

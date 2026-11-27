import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Form Dirty State", () => {
  it("renders the form as clean initially", () => {
    render(<App />);
    expect(screen.getByTestId("dirty-indicator")).toHaveTextContent(
      "All changes saved",
    );
  });

  it("detects changes to form fields", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("name-input"), "Dyer");

    expect(screen.getByTestId("dirty-indicator")).toHaveTextContent(
      "Unsaved changes",
    );
  });

  it("clears dirty state after saving", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("name-input"), "Dyer");
    await user.click(screen.getByTestId("save-button"));

    expect(screen.getByTestId("dirty-indicator")).toHaveTextContent(
      "All changes saved",
    );
  });

  it("restores the last saved values when resetting", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("name-input");

    await user.type(input, "Dyer");
    await user.click(screen.getByTestId("save-button"));
    await user.clear(input);
    await user.type(input, "Another Name");
    await user.click(screen.getByTestId("reset-button"));

    expect(input).toHaveValue("Dyer");
    expect(screen.getByTestId("dirty-indicator")).toHaveTextContent(
      "All changes saved",
    );
  });

  it("prevents navigation when the user cancels confirmation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);

    await user.type(screen.getByTestId("name-input"), "Dyer");

    const link = screen.getByTestId("navigation-link");
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(event);

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByTestId("name-input")).toHaveValue("Dyer");
  });

  it("allows navigation without confirmation when clean", () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<App />);

    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    screen.getByTestId("navigation-link").dispatchEvent(event);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents browser navigation while dirty", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("email-input"), "test@example.com");

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent browser navigation when clean", () => {
    render(<App />);

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("removes the beforeunload handler after saving", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("name-input"), "Dyer");

    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    await user.click(screen.getByTestId("save-button"));

    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });
});

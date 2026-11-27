import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { App } from "../src/App.jsx";

const STORAGE_KEY = "cross-tab-sync-react:state";

const DEFAULT_STATE = {
  displayName: "Guest",
  theme: "light",
  notifications: true,
};

function createEnvelope({
  updatedAt = 100,
  sourceId = "remote-tab",
  state = DEFAULT_STATE,
  version = 1,
} = {}) {
  return JSON.stringify({
    version,
    updatedAt,
    sourceId,
    state,
  });
}

function dispatchStorageEvent(newValue, key = STORAGE_KEY) {
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue,
        storageArea: window.localStorage,
      }),
    );
  });
}

describe("Cross-Tab State Synchronization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders default preferences", () => {
    render(<App />);

    expect(screen.getByLabelText("Display name")).toHaveValue("Guest");
    expect(screen.getByLabelText("Theme")).toHaveValue("light");
    expect(screen.getByLabelText("Enable notifications")).toBeChecked();
  });

  it("persists local preference changes", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Dyer" },
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));

    expect(stored.version).toBe(1);
    expect(stored.sourceId).toBeTruthy();
    expect(stored.state.displayName).toBe("Dyer");
  });

  it("applies a newer update received from another tab", () => {
    render(<App />);

    dispatchStorageEvent(
      createEnvelope({
        updatedAt: 100,
        state: {
          displayName: "Alex",
          theme: "dark",
          notifications: false,
        },
      }),
    );

    expect(screen.getByLabelText("Display name")).toHaveValue("Alex");
    expect(screen.getByLabelText("Theme")).toHaveValue("dark");
    expect(screen.getByLabelText("Enable notifications")).not.toBeChecked();
  });

  it("ignores stale incoming updates", () => {
    render(<App />);

    dispatchStorageEvent(
      createEnvelope({
        updatedAt: 200,
        state: {
          ...DEFAULT_STATE,
          displayName: "Newer",
        },
      }),
    );

    dispatchStorageEvent(
      createEnvelope({
        updatedAt: 100,
        state: {
          ...DEFAULT_STATE,
          displayName: "Older",
        },
      }),
    );

    expect(screen.getByLabelText("Display name")).toHaveValue("Newer");
  });

  it("uses sourceId to resolve equal timestamps", () => {
    render(<App />);

    dispatchStorageEvent(
      createEnvelope({
        updatedAt: 200,
        sourceId: "tab-a",
        state: {
          ...DEFAULT_STATE,
          displayName: "First",
        },
      }),
    );

    dispatchStorageEvent(
      createEnvelope({
        updatedAt: 200,
        sourceId: "tab-z",
        state: {
          ...DEFAULT_STATE,
          displayName: "Last",
        },
      }),
    );

    expect(screen.getByLabelText("Display name")).toHaveValue("Last");
  });

  it("ignores malformed and unsupported storage data", () => {
    render(<App />);

    dispatchStorageEvent("{invalid-json");

    dispatchStorageEvent(
      createEnvelope({
        version: 2,
        state: {
          ...DEFAULT_STATE,
          displayName: "Unsupported",
        },
      }),
    );

    dispatchStorageEvent(
      createEnvelope({
        state: {
          ...DEFAULT_STATE,
          theme: "blue",
        },
      }),
    );

    expect(screen.getByLabelText("Display name")).toHaveValue("Guest");
    expect(screen.getByLabelText("Theme")).toHaveValue("light");
  });

  it("resets preferences and persists the reset", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Alex" },
    });

    fireEvent.change(screen.getByLabelText("Theme"), {
      target: { value: "dark" },
    });

    fireEvent.click(screen.getByLabelText("Enable notifications"));

    fireEvent.click(screen.getByRole("button", { name: "Reset Settings" }));

    expect(screen.getByLabelText("Display name")).toHaveValue("Guest");
    expect(screen.getByLabelText("Theme")).toHaveValue("light");
    expect(screen.getByLabelText("Enable notifications")).toBeChecked();

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));

    expect(stored.state).toEqual(DEFAULT_STATE);
  });

  it("removes the storage listener when unmounted", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<App />);

    unmount();

    expect(removeListener).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );
  });
});

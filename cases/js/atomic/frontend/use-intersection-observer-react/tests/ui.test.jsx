import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { App } from "../src/App.jsx";

let observerInstances = [];

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();

    observerInstances.push(this);
  }

  trigger(isIntersecting) {
    act(() => {
      this.callback([
        {
          isIntersecting,
          target: this.observe.mock.calls[0]?.[0],
          intersectionRatio: isIntersecting ? 1 : 0,
        },
      ]);
    });
  }
}

beforeEach(() => {
  observerInstances = [];
  globalThis.IntersectionObserver = MockIntersectionObserver;
});

afterEach(() => {
  cleanup();
  delete globalThis.IntersectionObserver;
  vi.restoreAllMocks();
});

describe("useIntersectionObserver", () => {
  it("renders the initial non-visible state", () => {
    render(<App />);

    expect(screen.getByTestId("intersection-status").textContent).toBe(
      "Not visible",
    );
  });

  it("observes the target element after mounting", () => {
    render(<App />);

    const target = screen.getByTestId("observed-element");
    const observer = observerInstances[0];

    expect(observer).toBeDefined();
    expect(observer.observe).toHaveBeenCalledWith(target);
  });

  it("updates the status when the element enters the viewport", () => {
    render(<App />);

    observerInstances[0].trigger(true);

    expect(screen.getByTestId("intersection-status").textContent).toBe(
      "Visible",
    );
  });

  it("updates the status when the element leaves the viewport", () => {
    render(<App />);

    observerInstances[0].trigger(true);
    observerInstances[0].trigger(false);

    expect(screen.getByTestId("intersection-status").textContent).toBe(
      "Not visible",
    );
  });

  it("cleans up the observer when the component unmounts", () => {
    const { unmount } = render(<App />);

    const observer = observerInstances[0];
    const target = screen.getByTestId("observed-element");

    unmount();

    expect(observer.unobserve).toHaveBeenCalledWith(target);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("does not crash when IntersectionObserver is unavailable", () => {
    delete globalThis.IntersectionObserver;

    expect(() => render(<App />)).not.toThrow();

    expect(screen.getByTestId("intersection-status").textContent).toBe(
      "Not visible",
    );
  });
});

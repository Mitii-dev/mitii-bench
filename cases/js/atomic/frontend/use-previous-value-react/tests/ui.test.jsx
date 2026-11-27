import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { App, usePrevious } from "../src/App.jsx";

afterEach(() => {
  cleanup();
});

let observedPrevious;

function HookProbe({ value }) {
  observedPrevious = usePrevious(value);

  return (
    <div data-testid="previous">
      {observedPrevious === undefined ? "undefined" : String(observedPrevious)}
    </div>
  );
}

describe("usePrevious", () => {
  it("returns undefined on the initial render", () => {
    render(<HookProbe value={10} />);

    expect(observedPrevious).toBeUndefined();
  });

  it("returns the previous committed value after updates", () => {
    const { rerender } = render(<HookProbe value={10} />);

    rerender(<HookProbe value={20} />);
    expect(observedPrevious).toBe(10);

    rerender(<HookProbe value={30} />);
    expect(observedPrevious).toBe(20);

    rerender(<HookProbe value={40} />);
    expect(observedPrevious).toBe(30);
  });

  it("preserves the previous value when the current value is unchanged", () => {
    const { rerender } = render(<HookProbe value={10} />);

    expect(observedPrevious).toBeUndefined();

    rerender(<HookProbe value={10} />);
    expect(observedPrevious).toBe(10);

    rerender(<HookProbe value={20} />);
    expect(observedPrevious).toBe(10);

    rerender(<HookProbe value={20} />);
    expect(observedPrevious).toBe(20);
  });

  it("supports null and undefined values", () => {
    const { rerender } = render(<HookProbe value="initial" />);

    rerender(<HookProbe value={null} />);
    expect(observedPrevious).toBe("initial");

    rerender(<HookProbe value={undefined} />);
    expect(observedPrevious).toBeNull();
  });

  it("preserves object reference identity", () => {
    const first = { value: 1 };
    const second = { value: 2 };

    const { rerender } = render(<HookProbe value={first} />);

    rerender(<HookProbe value={second} />);

    expect(observedPrevious).toBe(first);
  });

  it("works with boolean values", () => {
    const { rerender } = render(<HookProbe value={true} />);

    rerender(<HookProbe value={false} />);

    expect(observedPrevious).toBe(true);
  });
});

describe("Previous Value Hook interface", () => {
  it("renders current and previous values", () => {
    render(<App />);

    expect(screen.getByTestId("current-value").textContent).toBe("0");
    expect(screen.getByTestId("previous-value").textContent).toBe("None");
  });

  it("updates the previous value when incrementing", () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("increment-button"));

    expect(screen.getByTestId("current-value").textContent).toBe("1");
    expect(screen.getByTestId("previous-value").textContent).toBe("0");

    fireEvent.click(screen.getByTestId("increment-button"));

    expect(screen.getByTestId("current-value").textContent).toBe("2");
    expect(screen.getByTestId("previous-value").textContent).toBe("1");
  });

  it("tracks the previous value when decrementing", () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("decrement-button"));

    expect(screen.getByTestId("current-value").textContent).toBe("-1");
    expect(screen.getByTestId("previous-value").textContent).toBe("0");
  });

  it("tracks the previous value when resetting", () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("increment-button"));
    fireEvent.click(screen.getByTestId("increment-button"));
    fireEvent.click(screen.getByTestId("reset-button"));

    expect(screen.getByTestId("current-value").textContent).toBe("0");
    expect(screen.getByTestId("previous-value").textContent).toBe("2");
  });
});

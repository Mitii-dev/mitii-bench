import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App.jsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setViewportSize(width, height) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });

  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
}

describe("useWindowSize", () => {
  it("renders the initial viewport dimensions", () => {
    setViewportSize(1280, 720);

    render(<App />);

    expect(screen.getByTestId("window-width").textContent).toBe("1280");
    expect(screen.getByTestId("window-height").textContent).toBe("720");
  });

  it("updates dimensions when the window is resized", () => {
    setViewportSize(1280, 720);

    render(<App />);

    setViewportSize(1024, 768);
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("window-width").textContent).toBe("1024");
    expect(screen.getByTestId("window-height").textContent).toBe("768");
  });

  it("updates dimensions across multiple resize events", () => {
    setViewportSize(1280, 720);

    render(<App />);

    setViewportSize(900, 600);
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("window-width").textContent).toBe("900");
    expect(screen.getByTestId("window-height").textContent).toBe("600");

    setViewportSize(1440, 900);
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("window-width").textContent).toBe("1440");
    expect(screen.getByTestId("window-height").textContent).toBe("900");
  });

  it("removes the resize listener when the component unmounts", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<App />);

    unmount();

    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});

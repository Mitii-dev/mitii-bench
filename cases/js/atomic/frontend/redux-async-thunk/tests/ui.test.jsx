import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/App";

const mockProducts = [
  { id: 1, title: "Wireless Headphones", price: 99.99 },
  { id: 2, title: "Mechanical Keyboard", price: 149.5 },
];

function createDeferred() {
  let resolve;

  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe("Redux Toolkit Async Thunk", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("displays idle status initially", () => {
    render(<App />);

    expect(screen.getByTestId("thunk-status")).toHaveTextContent("idle");
    expect(screen.getByTestId("thunk-data-list")).toBeEmptyDOMElement();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("displays loading while fetching products", async () => {
    const deferred = createDeferred();
    fetch.mockReturnValue(deferred.promise);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /load products/i }));

    expect(screen.getByTestId("thunk-status")).toHaveTextContent("loading");

    deferred.resolve({
      ok: true,
      json: async () => ({ products: mockProducts }),
    });

    await waitFor(() => {
      expect(screen.getByTestId("thunk-status")).toHaveTextContent("succeeded");
    });
  });

  it("displays products after successful fetching", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ products: mockProducts }),
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /load products/i }));

    expect(await screen.findByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Mechanical Keyboard")).toBeInTheDocument();

    expect(screen.getByTestId("thunk-status")).toHaveTextContent("succeeded");
    expect(screen.getByTestId("thunk-data-list")).toBeInTheDocument();
  });

  it("displays failed status when the request rejects", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /load products/i }));

    await waitFor(() => {
      expect(screen.getByTestId("thunk-status")).toHaveTextContent("failed");
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });

  it("displays failed status when the API returns an unsuccessful response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /load products/i }));

    await waitFor(() => {
      expect(screen.getByTestId("thunk-status")).toHaveTextContent("failed");
    });
  });
});

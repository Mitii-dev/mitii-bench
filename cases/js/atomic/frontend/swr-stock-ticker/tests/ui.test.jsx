import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import useSWR from "swr";
import { App } from "../src/App";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SWR Stock Ticker", () => {
  it("displays the stock price", () => {
    useSWR.mockReturnValue({
      data: { symbol: "AAPL", price: 195.25 },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("stock-price")).toHaveTextContent("$195.25");
  });

  it("displays Updating while SWR is validating", () => {
    useSWR.mockReturnValue({
      data: { symbol: "AAPL", price: 195.25 },
      error: undefined,
      isLoading: false,
      isValidating: true,
      mutate: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("swr-validating")).toHaveTextContent(
      "Updating...",
    );
  });

  it("displays the up-to-date status when validation finishes", () => {
    useSWR.mockReturnValue({
      data: { symbol: "AAPL", price: 195.25 },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("swr-validating")).toHaveTextContent(
      "Up to date",
    );
  });

  it("triggers manual revalidation when refresh is clicked", () => {
    const mutate = vi.fn();

    useSWR.mockReturnValue({
      data: { symbol: "AAPL", price: 195.25 },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /refresh price/i }));

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("configures automatic revalidation", () => {
    useSWR.mockReturnValue({
      data: { symbol: "AAPL", price: 195.25 },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<App />);

    expect(useSWR).toHaveBeenCalledWith(
      "AAPL",
      expect.any(Function),
      expect.objectContaining({
        refreshInterval: 5000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }),
    );
  });
});

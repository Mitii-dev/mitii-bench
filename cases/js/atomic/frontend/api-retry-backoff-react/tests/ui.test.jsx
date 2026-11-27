import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { App } from "../src/App";
import { requestWithRetry } from "../src/retry";

afterEach(() => {
  vi.useRealTimers();
});

describe("API Retry with Exponential Backoff", () => {
  it("retries failed requests with exponentially increasing delays", async () => {
    vi.useFakeTimers();

    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ success: true });

    const retryDelays = [];

    const promise = requestWithRetry(request, {
      maxRetries: 3,
      baseDelay: 100,
      onRetry: ({ delay }) => retryDelays.push(delay),
    });

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ success: true });

    expect(request).toHaveBeenCalledTimes(3);
    expect(retryDelays).toEqual([100, 200]);
  });

  it("stops after the maximum retry count", async () => {
    vi.useFakeTimers();

    const request = vi.fn().mockRejectedValue(new Error("Server unavailable"));

    const promise = requestWithRetry(request, {
      maxRetries: 2,
      baseDelay: 100,
    });

    const assertion = expect(promise).rejects.toThrow("Server unavailable");

    await vi.runAllTimersAsync();
    await assertion;

    expect(request).toHaveBeenCalledTimes(3);
  });

  it("does not retry successful requests", async () => {
    const request = vi.fn().mockResolvedValue("success");

    const result = await requestWithRetry(request, {
      maxRetries: 3,
      baseDelay: 100,
    });

    expect(result).toBe("success");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("executes immediately when maximum retries is zero", async () => {
    const request = vi.fn().mockRejectedValue(new Error("Failure"));

    await expect(
      requestWithRetry(request, {
        maxRetries: 0,
        baseDelay: 100,
      }),
    ).rejects.toThrow("Failure");

    expect(request).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending retry when aborted", async () => {
    vi.useFakeTimers();

    const controller = new AbortController();

    const request = vi.fn().mockRejectedValue(new Error("Network error"));

    const promise = requestWithRetry(request, {
      maxRetries: 3,
      baseDelay: 1000,
      signal: controller.signal,
    });

    const assertion = expect(promise).rejects.toThrow("Request aborted");

    await vi.advanceTimersByTimeAsync(0);

    controller.abort();

    await assertion;

    expect(request).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders the retry interface", () => {
    render(<App />);

    expect(screen.getByTestId("retry-app")).toBeInTheDocument();
    expect(screen.getByTestId("start-request")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum retries")).toBeInTheDocument();
    expect(screen.getByLabelText("Base delay")).toBeInTheDocument();
  });

  it("successfully executes a request without retries", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Failures before success"), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByTestId("start-request"));

    expect(
      await screen.findByText("Request completed successfully"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("retry-count")).toHaveTextContent("Retries: 0");
    expect(screen.getByTestId("attempt-count")).toHaveTextContent(
      "Current attempt: 1",
    );
  });

  it("prevents duplicate submissions while a request is running", async () => {
    render(<App />);

    const button = screen.getByTestId("start-request");

    fireEvent.click(button);

    expect(button.disabled).toBe(true);
  });
});

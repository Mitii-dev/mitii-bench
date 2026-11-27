import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("TanStack Query optimistic comment mutation", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the comment form and initial comments", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "Alex", body: "Great work!" }],
    });

    render(<App />);

    expect(screen.getByTestId("comment-input")).toBeInTheDocument();
    expect(screen.getByTestId("comment-submit")).toBeInTheDocument();

    expect(await screen.findByText("Great work!")).toBeInTheDocument();
  });

  it("inserts the comment optimistically before the server responds", async () => {
    const user = userEvent.setup();
    const postRequest = createDeferred();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockReturnValueOnce(postRequest.promise);

    render(<App />);

    const input = screen.getByTestId("comment-input");
    const submit = screen.getByTestId("comment-submit");

    await user.type(input, "This is an optimistic comment");
    await user.click(submit);

    // The comment must appear while the POST request is still pending.
    expect(
      await screen.findByText("This is an optimistic comment"),
    ).toBeInTheDocument();

    expect(screen.getByText("Sending...")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].method).toBe("POST");

    // Resolve the server request only after verifying optimistic insertion.
    postRequest.resolve({
      ok: true,
      json: async () => ({
        id: 101,
        name: "You",
        body: "This is an optimistic comment",
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText("Sending...")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("This is an optimistic comment"),
    ).toBeInTheDocument();

    expect(input).toHaveValue("");
  });

  it("rolls back the optimistic comment when submission fails", async () => {
    const user = userEvent.setup();
    const postRequest = createDeferred();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "Alex", body: "Existing comment" }],
      })
      .mockReturnValueOnce(postRequest.promise);

    render(<App />);

    await screen.findByText("Existing comment");

    const input = screen.getByTestId("comment-input");

    await user.type(input, "Comment that will fail");
    await user.click(screen.getByTestId("comment-submit"));

    expect(
      await screen.findByText("Comment that will fail"),
    ).toBeInTheDocument();

    postRequest.resolve({
      ok: false,
      json: async () => ({}),
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to submit comment",
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Comment that will fail"),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Existing comment")).toBeInTheDocument();
  });

  it("does not submit an empty comment", async () => {
    render(<App />);

    const submit = screen.getByTestId("comment-submit");

    expect(submit).toBeDisabled();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/comments?_limit=5",
      );
    });

    expect(
      fetch.mock.calls.some(([, options]) => options?.method === "POST"),
    ).toBe(false);
  });
});

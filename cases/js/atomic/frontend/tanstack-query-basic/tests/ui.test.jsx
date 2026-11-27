import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/App";

const mockPosts = [
  {
    id: 1,
    title: "First post",
    body: "First post content",
  },
  {
    id: 2,
    title: "Second post",
    body: "Second post content",
  },
];

describe("TanStack Query Posts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("displays loading UI while fetching posts", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    render(<App />);

    expect(screen.getByTestId("rq-loading")).toHaveTextContent(
      "Loading posts...",
    );
  });

  it("displays fetched posts", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockPosts,
    });

    render(<App />);

    expect(await screen.findByTestId("rq-data")).toBeInTheDocument();
    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(screen.getByText("Second post")).toBeInTheDocument();
  });

  it("refetches posts when the button is clicked", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockPosts,
    });

    render(<App />);

    await screen.findByText("First post");

    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("rq-refetch-btn"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("displays an error when fetching fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to fetch posts",
    );
  });
});

/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const mocks = vi.hoisted(() => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: mocks.useSearchParams,
  useRouter: mocks.useRouter,
  usePathname: mocks.usePathname,
}));

import Page from "../app/page";

describe("Next.js Search Query Parameters", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useSearchParams.mockReturnValue(new URLSearchParams());
    mocks.useRouter.mockReturnValue({ replace: mocks.replace });
    mocks.usePathname.mockReturnValue("/");
  });

  it("renders the search input and results", () => {
    render(<Page />);

    expect(screen.getByTestId("query-input")).toBeInTheDocument();
    expect(screen.getByTestId("search-results")).toHaveTextContent(
      "Results for:",
    );
  });

  it("reads the initial query from the URL", () => {
    mocks.useSearchParams.mockReturnValue(new URLSearchParams("q=react"));

    render(<Page />);

    expect(screen.getByTestId("query-input")).toHaveValue("react");
    expect(screen.getByTestId("search-results")).toHaveTextContent(
      "Results for: react",
    );
  });

  it("updates the URL when the user types", () => {
    render(<Page />);

    fireEvent.change(screen.getByTestId("query-input"), {
      target: { value: "nextjs" },
    });

    expect(mocks.replace).toHaveBeenCalledWith("/?q=nextjs");
  });

  it("preserves other query parameters", () => {
    mocks.useSearchParams.mockReturnValue(
      new URLSearchParams("category=frontend"),
    );

    render(<Page />);

    fireEvent.change(screen.getByTestId("query-input"), {
      target: { value: "react" },
    });

    expect(mocks.replace).toHaveBeenCalledWith("/?category=frontend&q=react");
  });

  it("removes q when the search input is cleared", () => {
    mocks.useSearchParams.mockReturnValue(
      new URLSearchParams("q=react&category=frontend"),
    );

    render(<Page />);

    fireEvent.change(screen.getByTestId("query-input"), {
      target: { value: "" },
    });

    expect(mocks.replace).toHaveBeenCalledWith("/?category=frontend");
  });
});

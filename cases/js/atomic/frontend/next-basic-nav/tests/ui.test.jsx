/** @vitest-environment jsdom */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Nav from "../components/Nav";
import HomePage from "../app/page";
import DashboardPage from "../app/dashboard/page";

// Mock Next.js Link for component-level tests.
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));


describe("Next.js App Router Navigation", () => {
  it("renders Home and Dashboard navigation links", () => {
    render(<Nav />);

    expect(screen.getByTestId("link-home")).toHaveTextContent("Home");
    expect(screen.getByTestId("link-dashboard")).toHaveTextContent("Dashboard");
  });

  it("links Home to / and Dashboard to /dashboard", () => {
    render(<Nav />);

    expect(screen.getByTestId("link-home")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("link-dashboard")).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("renders the Home route view with navigation", () => {
    render(<HomePage />);

    expect(screen.getByTestId("view-home")).toHaveTextContent("Home View");
    expect(screen.getByTestId("link-dashboard")).toBeInTheDocument();
  });

  it("renders the Dashboard route view with navigation", () => {
    render(<DashboardPage />);

    expect(screen.getByTestId("view-dashboard")).toHaveTextContent(
      "Dashboard View",
    );
    expect(screen.getByTestId("link-home")).toBeInTheDocument();
  });
});

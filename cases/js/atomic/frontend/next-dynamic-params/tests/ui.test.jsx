/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const mockUseParams = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ProductPage from "../app/products/[id]/page";
import HomePage from "../app/page";

describe("Next.js Dynamic Route Parameters", () => {
  beforeEach(() => {
    mockUseParams.mockReset();
  });

  it("renders the product ID from the URL parameters", () => {
    mockUseParams.mockReturnValue({ id: "42" });

    render(<ProductPage />);

    expect(screen.getByTestId("product-detail")).toHaveTextContent(
      "Product Details for ID: 42",
    );
  });

  it("renders different product IDs correctly", () => {
    mockUseParams.mockReturnValue({ id: "105" });

    render(<ProductPage />);

    expect(screen.getByTestId("product-detail")).toHaveTextContent(
      "Product Details for ID: 105",
    );
  });

  it("renders the product detail container", () => {
    mockUseParams.mockReturnValue({ id: "42" });

    render(<ProductPage />);

    expect(screen.getByTestId("product-detail")).toBeInTheDocument();
  });

  it("provides a link to product 42 on the home page", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: "View product 42" }),
    ).toHaveAttribute("href", "/products/42");
  });
});

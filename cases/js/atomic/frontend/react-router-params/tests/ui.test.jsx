import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import { App } from "../src/App";

describe("React Router Dynamic URL Parameters", () => {
  it("renders a link to a sample product", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("product-link")).toHaveAttribute(
      "href",
      "/products/42",
    );
  });

  it("navigates to the sample product and displays its ID", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByTestId("product-link"));

    expect(screen.getByTestId("product-detail")).toHaveTextContent(
      "Product Details for ID: 42",
    );
  });

  it("reads a dynamic product ID directly from the URL", () => {
    render(
      <MemoryRouter initialEntries={["/products/99"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("product-detail")).toHaveTextContent(
      "Product Details for ID: 99",
    );
  });

  it("does not display product details on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("product-detail")).not.toBeInTheDocument();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App";

afterEach(cleanup);

describe("Redux Cart Slice", () => {
  it("renders an initial cart count of zero", () => {
    render(<App />);

    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
  });

  it("increments the cart count when adding items", () => {
    render(<App />);

    const addButton = screen.getByTestId("add-to-cart-btn");

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId("cart-count")).toHaveTextContent("2");
  });

  it("decrements the cart count when removing an item", () => {
    render(<App />);

    fireEvent.click(screen.getByTestId("add-to-cart-btn"));
    fireEvent.click(screen.getByTestId("add-to-cart-btn"));

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("Formik and Yup Zip Code validation", () => {
  it("renders the Zip Code input", () => {
    render(<App />);
    expect(screen.getByTestId("zip-input")).toBeInTheDocument();
  });

  it("shows an error when an invalid zip code loses focus", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("zip-input");

    await user.type(input, "123");
    await user.tab();

    expect(
      await screen.findByText("Zip Code must be exactly 5 digits"),
    ).toBeInTheDocument();
  });

  it("does not show an error for a valid 5-digit zip code", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("zip-input");

    await user.type(input, "12345");
    await user.tab();

    expect(
      screen.queryByText("Zip Code must be exactly 5 digits"),
    ).not.toBeInTheDocument();
  });

  it("shows a required error when an empty input loses focus", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("zip-input");

    await user.click(input);
    await user.tab();

    expect(await screen.findByText("Zip Code is required")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";

describe("conditional-form-fields", () => {
  it("shows only common fields for Individual accounts", () => {
    render(<App />);
    expect(screen.getByTestId("account-type")).toHaveValue("individual");
    expect(screen.getByTestId("fullName")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();

    expect(screen.queryByTestId("business-fields")).not.toBeInTheDocument();
  });

  it("displays business fields when Business is selected", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByTestId("account-type"), "business");
    expect(screen.getByTestId("business-fields")).toBeInTheDocument();
    expect(screen.getByTestId("companyName")).toBeInTheDocument();
    expect(screen.getByTestId("taxId")).toBeInTheDocument();
  });

  it("hides and clears business fields when switching to Individual", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByTestId("account-type"), "business");
    await user.type(screen.getByTestId("companyName"), "Acme Technologies");
    await user.type(screen.getByTestId("taxId"), "TAX12345");
    await user.selectOptions(screen.getByTestId("account-type"), "individual");
    expect(screen.queryByTestId("business-fields")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByTestId("account-type"), "business");
    expect(screen.getByTestId("companyName")).toHaveValue("");
    expect(screen.getByTestId("taxId")).toHaveValue("");
  });

  it("validates common required fields", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("submit-btn"));
    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email address is required.")).toBeInTheDocument();
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
  });

  it("validates business-specific fields only for Business accounts", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByTestId("account-type"), "business");
    await user.click(screen.getByTestId("submit-btn"));
    expect(screen.getByText("Company name is required.")).toBeInTheDocument();
    expect(screen.getByText("Tax ID is required.")).toBeInTheDocument();
  });

  it("does not require business fields for Individual accounts", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByTestId("fullName"), "John Doe");
    await user.type(screen.getByTestId("email"), "john@example.com");
    await user.click(screen.getByTestId("submit-btn"));
    expect(screen.getByTestId("success-message")).toHaveTextContent(
      "Registration successful!",
    );
  });

  it("successfully submits a valid Business registration", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByTestId("account-type"), "business");
    await user.type(screen.getByTestId("fullName"), "John Doe");
    await user.type(screen.getByTestId("email"), "john@example.com");
    await user.type(screen.getByTestId("companyName"), "Acme Technologies");
    await user.type(screen.getByTestId("taxId"), "TAX12345");
    await user.click(screen.getByTestId("submit-btn"));
    expect(screen.getByTestId("success-message")).toHaveTextContent(
      "Registration successful!",
    );
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByTestId("fullName"), "John Doe");
    await user.type(screen.getByTestId("email"), "invalid-email");
    await user.click(screen.getByTestId("submit-btn"));
    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
  });

  it("clears a field error when the user corrects the input", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId("submit-btn"));
    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    await user.type(screen.getByTestId("fullName"), "John Doe");
    expect(
      screen.queryByText("Full name is required."),
    ).not.toBeInTheDocument();
  });
});

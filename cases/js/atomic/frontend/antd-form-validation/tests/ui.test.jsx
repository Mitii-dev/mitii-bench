import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";

describe("Ant Design Form Validation", () => {
  afterEach(() => cleanup());

  it("renders the registration form", () => {
    render(<App />);

    expect(screen.getByTestId("antd-form")).toBeInTheDocument();
    expect(screen.getByTestId("antd-submit")).toBeInTheDocument();
  });

  it("shows required field errors", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("antd-submit"));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("rejects invalid email addresses", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByTestId("antd-submit"));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
  });

  it("submits valid form data", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByTestId("antd-submit"));

    expect(
      await screen.findByText("Registration successful"),
    ).toBeInTheDocument();
  });
});

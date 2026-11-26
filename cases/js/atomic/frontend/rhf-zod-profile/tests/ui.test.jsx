import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/App";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("React Hook Form + Zod Profile", () => {
  it("renders email and age inputs", () => {
    render(<App />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
  });

  it("displays validation errors for invalid email and age", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });

    fireEvent.change(screen.getByLabelText("Age"), {
      target: { value: "16" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    const errorList = await screen.findByTestId("zod-error-list");

    expect(errorList).toHaveTextContent("valid email");
    expect(errorList).toHaveTextContent("at least 18");
  });

  it("displays an error when age is not a number", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "dev@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Age"), {
      target: { value: "abc" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByTestId("zod-error-list")).toHaveTextContent(
      "Age must be a number",
    );
  });

  it("submits valid profile data", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "dev@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Age"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("Profile submitted:", {
        email: "dev@example.com",
        age: 25,
      });
    });
  });
});

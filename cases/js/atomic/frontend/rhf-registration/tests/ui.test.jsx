import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("React Hook Form Registration", () => {
  it("renders username and password inputs", () => {
    render(<App />);

    expect(screen.getByTestId("input-username")).toBeInTheDocument();
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
  });

  it("shows required errors when submitted empty", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("validates password minimum length", async () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("input-username"), {
      target: { value: "developer" },
    });

    fireEvent.change(screen.getByTestId("input-password"), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("submits valid registration data", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<App />);

    fireEvent.change(screen.getByTestId("input-username"), {
      target: { value: "developer" },
    });

    fireEvent.change(screen.getByTestId("input-password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByTestId("input-password")).toHaveValue(
      "password123",
    );
    expect(logSpy).toHaveBeenCalledWith("Registration successful:", {
      username: "developer",
      password: "password123",
    });
  });
});

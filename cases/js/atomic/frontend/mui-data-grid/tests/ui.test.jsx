import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { App } from "../src/App";

describe("MUI DataGrid", () => {
  it("renders the data grid and required columns", () => {
    render(<App />);

    expect(screen.getByTestId("mui-data-grid")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders seeded user records", () => {
    render(<App />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("filters rows by name", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("grid-search"), "alice");

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("filters names case-insensitively", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("grid-search"), "CHARLIE");

    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });

  it("shows all rows again when search is cleared", async () => {
    const user = userEvent.setup();
    render(<App />);

    const search = screen.getByTestId("grid-search");
    await user.type(search, "alice");
    await user.clear(search);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });
});

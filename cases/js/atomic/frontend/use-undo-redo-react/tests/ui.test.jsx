import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App.jsx";

afterEach(() => {
  cleanup();
});

describe("useUndoRedo interface", () => {
  it("renders the initial value with undo and redo disabled", () => {
    render(<App />);

    expect(screen.getByTestId("editor")).toHaveValue("Hello, world!");
    expect(screen.getByTestId("undo-button")).toBeDisabled();
    expect(screen.getByTestId("redo-button")).toBeDisabled();
  });

  it("undoes an edit", () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "First edit" },
    });

    fireEvent.click(screen.getByTestId("undo-button"));

    expect(screen.getByTestId("editor")).toHaveValue("Hello, world!");
    expect(screen.getByTestId("redo-button")).toBeEnabled();
  });

  it("redoes an undone edit", () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "First edit" },
    });
    fireEvent.click(screen.getByTestId("undo-button"));
    fireEvent.click(screen.getByTestId("redo-button"));

    expect(screen.getByTestId("editor")).toHaveValue("First edit");
    expect(screen.getByTestId("undo-button")).toBeEnabled();
    expect(screen.getByTestId("redo-button")).toBeDisabled();
  });

  it("discards redo history after a new edit", () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "First edit" },
    });
    fireEvent.click(screen.getByTestId("undo-button"));

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "New branch" },
    });

    expect(screen.getByTestId("editor")).toHaveValue("New branch");
    expect(screen.getByTestId("redo-button")).toBeDisabled();

    fireEvent.click(screen.getByTestId("undo-button"));
    expect(screen.getByTestId("editor")).toHaveValue("Hello, world!");
  });

  it("resets the editor and clears its history", () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "Changed text" },
    });
    fireEvent.click(screen.getByTestId("reset-button"));

    expect(screen.getByTestId("editor")).toHaveValue("Hello, world!");
    expect(screen.getByTestId("undo-button")).toBeDisabled();
    expect(screen.getByTestId("redo-button")).toBeDisabled();
  });

  it("supports multiple undo and redo operations", () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "Version 1" },
    });
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "Version 2" },
    });

    fireEvent.click(screen.getByTestId("undo-button"));
    expect(screen.getByTestId("editor")).toHaveValue("Version 1");

    fireEvent.click(screen.getByTestId("undo-button"));
    expect(screen.getByTestId("editor")).toHaveValue("Hello, world!");

    fireEvent.click(screen.getByTestId("redo-button"));
    expect(screen.getByTestId("editor")).toHaveValue("Version 1");

    fireEvent.click(screen.getByTestId("redo-button"));
    expect(screen.getByTestId("editor")).toHaveValue("Version 2");
  });
});

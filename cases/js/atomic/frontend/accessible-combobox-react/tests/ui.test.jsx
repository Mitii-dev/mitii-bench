import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("Accessible Combobox", () => {
  it("renders a closed accessible combobox initially", () => {
    render(<App />);

    const input = screen.getByRole("combobox");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens the listbox when the input receives focus", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("filters options when typing", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "rea");

    expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Angular" }),
    ).not.toBeInTheDocument();
  });

  it("navigates options using ArrowDown and ArrowUp", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "combobox-option-react",
    );

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "combobox-option-angular",
    );

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "combobox-option-react",
    );
  });

  it("navigates to the first and last options using Home and End", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}{End}");

    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "combobox-option-next",
    );

    await user.keyboard("{Home}");

    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "combobox-option-react",
    );
  });

  it("selects the active option using Enter", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("React");
    expect(screen.getByTestId("selected-value")).toHaveTextContent("React");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the listbox using Escape without changing the selection", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("React");

    await user.click(input);
    await user.keyboard("{ArrowDown}{Escape}");

    expect(input).toHaveValue("React");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option using the mouse", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);

    await user.click(screen.getByRole("option", { name: "Angular" }));

    expect(input).toHaveValue("Angular");
    expect(screen.getByTestId("selected-value")).toHaveTextContent("Angular");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("displays an empty state when no options match", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "unknown");

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByTestId("combobox-empty-state")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("keeps DOM focus on the input during keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowDown}");

    expect(input).toHaveFocus();
  });

  it("closes the listbox when Tab is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Tab}");

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});

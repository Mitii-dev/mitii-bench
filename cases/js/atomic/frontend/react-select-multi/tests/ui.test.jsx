import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("React Select multi-select", () => {
  it("renders a searchable multi-select input", () => {
    render(<App />);

    expect(screen.getByTestId("react-select-input")).toBeInTheDocument();
    expect(screen.getByTestId("selected-values")).toHaveTextContent(
      "No options selected",
    );
  });

  it("filters options when the user types", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("react-select-input"), "rea");

    expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Angular" }),
    ).not.toBeInTheDocument();
  });

  it("allows selecting multiple options and displays them outside the control", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("react-select-input");

    await user.type(input, "React");
    await user.click(screen.getByRole("option", { name: "React" }));

    await user.type(input, "Vue");
    await user.click(screen.getByRole("option", { name: "Vue" }));

    const output = screen.getByTestId("selected-values");

    expect(output).toHaveTextContent("React");
    expect(output).toHaveTextContent("Vue");
    expect(
      output.querySelectorAll('[data-testid="selected-tag"]'),
    ).toHaveLength(2);
  });

  it("removes a selected option when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("react-select-input");

    await user.type(input, "React");
    await user.click(screen.getByRole("option", { name: "React" }));

    await user.click(screen.getByLabelText("Remove React"));

    expect(screen.getByTestId("selected-values")).toHaveTextContent(
      "No options selected",
    );
  });
});

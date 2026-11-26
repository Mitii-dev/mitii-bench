import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("Recharts dynamic bar chart", () => {
  it("renders the chart and defaults to monthly data", () => {
    render(<App />);

    expect(screen.getByTestId("recharts-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("chart-filter")).toHaveValue("Monthly");
    expect(screen.getByTestId("chart-data-summary")).toHaveTextContent(
      "Monthly data: Jan: 120",
    );
  });

  it("switches the dataset to yearly when selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByTestId("chart-filter"), "Yearly");

    expect(screen.getByTestId("chart-filter")).toHaveValue("Yearly");
    expect(screen.getByTestId("chart-data-summary")).toHaveTextContent(
      "Yearly data: 2021: 1400",
    );
    expect(screen.getByTestId("chart-data-summary")).toHaveTextContent(
      "2025: 2800",
    );
  });

  it("switches back to monthly data", async () => {
    const user = userEvent.setup();
    render(<App />);

    const filter = screen.getByTestId("chart-filter");

    await user.selectOptions(filter, "Yearly");
    await user.selectOptions(filter, "Monthly");

    expect(filter).toHaveValue("Monthly");
    expect(screen.getByTestId("chart-data-summary")).toHaveTextContent(
      "Monthly data: Jan: 120",
    );
  });
});

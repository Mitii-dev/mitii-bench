import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { App } from "../src/App.jsx";

afterEach(() => {
  cleanup();
});

const selectCountry = (value) => {
  fireEvent.change(screen.getByTestId("country-select"), {
    target: { value },
  });
};

const selectState = (value) => {
  fireEvent.change(screen.getByTestId("state-select"), {
    target: { value },
  });
};

const selectCity = (value) => {
  fireEvent.change(screen.getByTestId("city-select"), {
    target: { value },
  });
};

const getOptions = (testId) => {
  return within(screen.getByTestId(testId))
    .getAllByRole("option")
    .map((option) => option.textContent);
};

describe("Dependent Select Fields", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all selects with their initial states", () => {
    render(<App />);

    expect(screen.getByTestId("country-select")).toBeEnabled();
    expect(screen.getByTestId("state-select")).toBeDisabled();
    expect(screen.getByTestId("city-select")).toBeDisabled();

    expect(getOptions("country-select")).toEqual([
      "Select country",
      "India",
      "United States",
      "Canada",
    ]);
  });

  it("displays states based on the selected country", () => {
    render(<App />);

    selectCountry("India");

    expect(screen.getByTestId("state-select")).toBeEnabled();

    expect(getOptions("state-select")).toEqual([
      "Select state",
      "Karnataka",
      "Maharashtra",
    ]);
  });

  it("displays cities based on the selected state", () => {
    render(<App />);

    selectCountry("India");
    selectState("Karnataka");

    expect(screen.getByTestId("city-select")).toBeEnabled();

    expect(getOptions("city-select")).toEqual([
      "Select city",
      "Bengaluru",
      "Mysuru",
    ]);
  });

  it("resets state and city when the country changes", () => {
    render(<App />);

    selectCountry("India");
    selectState("Karnataka");
    selectCity("Bengaluru");

    selectCountry("Canada");

    expect(screen.getByTestId("state-select")).toHaveValue("");
    expect(screen.getByTestId("city-select")).toHaveValue("");

    expect(getOptions("state-select")).toEqual([
      "Select state",
      "Ontario",
      "Quebec",
    ]);

    expect(screen.getByTestId("city-select")).toBeDisabled();
  });

  it("resets city when the state changes", () => {
    render(<App />);

    selectCountry("United States");
    selectState("California");
    selectCity("Los Angeles");

    selectState("Texas");

    expect(screen.getByTestId("city-select")).toHaveValue("");

    expect(getOptions("city-select")).toEqual([
      "Select city",
      "Austin",
      "Dallas",
    ]);
  });

  it("updates the selection summary", () => {
    render(<App />);

    selectCountry("Canada");
    selectState("Ontario");
    selectCity("Toronto");

    const summary = screen.getByTestId("selection-summary");

    expect(summary).toHaveTextContent("Country: Canada");
    expect(summary).toHaveTextContent("State: Ontario");
    expect(summary).toHaveTextContent("City: Toronto");
  });

  it("resets all dependent selections when country is cleared", () => {
    render(<App />);

    selectCountry("India");
    selectState("Maharashtra");
    selectCity("Mumbai");

    selectCountry("");

    expect(screen.getByTestId("state-select")).toBeDisabled();
    expect(screen.getByTestId("city-select")).toBeDisabled();

    expect(screen.getByTestId("state-select")).toHaveValue("");
    expect(screen.getByTestId("city-select")).toHaveValue("");
  });
});

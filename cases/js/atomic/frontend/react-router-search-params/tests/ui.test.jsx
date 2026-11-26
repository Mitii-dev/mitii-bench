import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "../src/App";

function LocationProbe() {
  const location = useLocation();

  return (
    <output data-testid="current-search">{location.search}</output>
  );
}

function renderSearch(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("Search query parameters", () => {
  it("updates the URL when the user types", async () => {
    const user = userEvent.setup();
    renderSearch("/");

    await user.type(screen.getByTestId("query-input"), "react");

    expect(screen.getByTestId("query-input")).toHaveValue("react");
    expect(
      new URLSearchParams(
        screen.getByTestId("current-search").textContent
      ).get("q")
    ).toBe("react");
    expect(screen.getByTestId("search-results")).toHaveTextContent(
      "Results for: react"
    );
  });

  it("reads the query from the URL on initial render", () => {
    renderSearch("/?q=router");

    expect(screen.getByTestId("query-input")).toHaveValue("router");
    expect(screen.getByTestId("search-results")).toHaveTextContent(
      "Results for: router"
    );
  });

  it("removes q from the URL when the input is cleared", async () => {
    const user = userEvent.setup();
    renderSearch("/?q=react");

    await user.clear(screen.getByTestId("query-input"));

    expect(screen.getByTestId("query-input")).toHaveValue("");
    expect(
      new URLSearchParams(
        screen.getByTestId("current-search").textContent
      ).has("q")
    ).toBe(false);
  });
});

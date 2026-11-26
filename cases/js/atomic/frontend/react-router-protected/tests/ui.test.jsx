import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../src/App";

function renderApp(
  initialEntry = "/dashboard",
  initiallyAuthenticated = false,
) {
  function TestApp() {
    const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);

    return (
      <AppRoutes
        isAuthenticated={authenticated}
        onLogin={() => setAuthenticated(true)}
        onLogout={() => setAuthenticated(false)}
      />
    );
  }

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TestApp />
    </MemoryRouter>,
  );
}

describe("Protected routes", () => {
  it("redirects unauthenticated users to login", () => {
    renderApp("/dashboard");

    expect(screen.getByTestId("login-view")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-view")).not.toBeInTheDocument();
  });

  it("renders the protected outlet for authenticated users", () => {
    renderApp("/dashboard", true);

    expect(screen.getByTestId("protected-view")).toBeInTheDocument();
    expect(screen.queryByTestId("login-view")).not.toBeInTheDocument();
  });

  it("logs in and navigates to the protected dashboard", async () => {
    const user = userEvent.setup();
    renderApp("/dashboard");

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByTestId("protected-view")).toBeInTheDocument();
  });

  it("logs out and redirects to login", async () => {
    const user = userEvent.setup();
    renderApp("/dashboard", true);

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByTestId("login-view")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-view")).not.toBeInTheDocument();
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import App from "../src/App";

describe("React Router Basic Navigation", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders both navigation links", () => {
    render(<App />);

    expect(screen.getByTestId("link-home")).toBeInTheDocument();
    expect(screen.getByTestId("link-dashboard")).toBeInTheDocument();
  });

  it("displays the Home view initially", () => {
    render(<App />);

    expect(screen.getByTestId("view-home")).toHaveTextContent("Home View");
    expect(screen.queryByTestId("view-dashboard")).not.toBeInTheDocument();
  });

  it("navigates to Dashboard when its link is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("link-dashboard"));

    expect(screen.getByTestId("view-dashboard")).toHaveTextContent(
      "Dashboard View",
    );
    expect(screen.queryByTestId("view-home")).not.toBeInTheDocument();
  });

  it("navigates back to Home when its link is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("link-dashboard"));
    await user.click(screen.getByTestId("link-home"));

    expect(screen.getByTestId("view-home")).toHaveTextContent("Home View");
    expect(screen.queryByTestId("view-dashboard")).not.toBeInTheDocument();
  });
});

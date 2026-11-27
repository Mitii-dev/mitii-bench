import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("React i18next Greeting", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders the language selector", () => {
    render(<App />);
    expect(screen.getByTestId("lang-select")).toBeInTheDocument();
  });

  it("displays the English greeting by default", () => {
    render(<App />);
    expect(screen.getByTestId("translated-greeting")).toHaveTextContent(
      "Hello",
    );
  });

  it("switches the greeting to Spanish", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByTestId("lang-select"), "es");

    await waitFor(() => {
      expect(screen.getByTestId("translated-greeting")).toHaveTextContent(
        "Hola",
      );
    });
  });

  it("switches back to English", async () => {
    const user = userEvent.setup();
    render(<App />);

    const selector = screen.getByTestId("lang-select");

    await user.selectOptions(selector, "es");
    await user.selectOptions(selector, "en");

    await waitFor(() => {
      expect(screen.getByTestId("translated-greeting")).toHaveTextContent(
        "Hello",
      );
    });
  });
});

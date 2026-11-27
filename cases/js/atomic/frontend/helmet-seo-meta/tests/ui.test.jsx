import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

describe("React Helmet Async SEO Manager", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head
      .querySelectorAll('meta[name="description"]')
      .forEach((element) => element.remove());
  });

  it("renders both metadata inputs", () => {
    render(<App />);

    expect(screen.getByTestId("seo-title-input")).toBeInTheDocument();
    expect(screen.getByTestId("seo-description-input")).toBeInTheDocument();
  });

  it("sets the initial document title and description", async () => {
    render(<App />);

    await waitFor(() => {
      expect(document.title).toBe("My Website");
      expect(
        document.querySelector('meta[name="description"]'),
      ).toHaveAttribute("content", "Welcome to my website.");
    });
  });

  it("updates the document title dynamically", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("seo-title-input");

    await user.clear(input);
    await user.type(input, "Updated SEO Title");

    await waitFor(() => {
      expect(document.title).toBe("Updated SEO Title");
    });
  });

  it("updates the meta description dynamically", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByTestId("seo-description-input");

    await user.clear(input);
    await user.type(input, "Updated page description");

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="description"]'),
      ).toHaveAttribute("content", "Updated page description");
    });
  });
});

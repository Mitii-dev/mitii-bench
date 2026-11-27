import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const { routerBack } = vi.hoisted(() => ({
  routerBack: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: routerBack,
  }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import PhotoModal from "../app/components/PhotoModal";
import FullPagePhoto from "../app/photos/[id]/page";
import InterceptedPhoto from "../app/@modal/(.)photos/[id]/page";

describe("Next.js Intercepting Route Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the photo inside an accessible modal", async () => {
    const page = await InterceptedPhoto({
      params: { id: "1" },
    });

    render(page);

    expect(screen.getByTestId("photo-modal")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Mountain Lake")).toBeInTheDocument();
  });

  it("closes the modal when the Close button is clicked", () => {
    render(
      <PhotoModal
        photo={{
          id: "1",
          title: "Mountain Lake",
          description: "A peaceful mountain lake.",
          location: "Alps",
          background: "linear-gradient(135deg, #2563eb, #0f172a)",
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("close-modal"));

    expect(routerBack).toHaveBeenCalledTimes(1);
  });

  it("closes the modal when Escape is pressed", () => {
    render(
      <PhotoModal
        photo={{
          id: "1",
          title: "Mountain Lake",
          description: "A peaceful mountain lake.",
          location: "Alps",
          background: "linear-gradient(135deg, #2563eb, #0f172a)",
        }}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(routerBack).toHaveBeenCalledTimes(1);
  });

  it("renders a full-page detail view for direct navigation", async () => {
    const page = await FullPagePhoto({
      params: { id: "1" },
    });

    render(page);

    expect(screen.getByTestId("photo-detail-page")).toBeInTheDocument();
    expect(screen.queryByTestId("photo-modal")).not.toBeInTheDocument();
    expect(screen.getByText("Mountain Lake")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to gallery/i }),
    ).toHaveAttribute("href", "/");
  });

  it("renders the not-found state for an unknown photo ID", async () => {
    await expect(FullPagePhoto({ params: { id: "unknown" } })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("renders the not-found state for an unknown intercepted photo ID", async () => {
    await expect(
      InterceptedPhoto({ params: { id: "unknown" } }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

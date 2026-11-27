import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../solution/src/App.jsx";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  get: vi.fn(),
  use: vi.fn(),
  eject: vi.fn(),
  responseErrorHandler: null,
}));

vi.mock("axios", () => ({
  default: {
    create: mocks.create,
  },
}));

describe("Axios global authentication interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.responseErrorHandler = null;

    mocks.use.mockImplementation((_onSuccess, onError) => {
      mocks.responseErrorHandler = onError;
      return 1;
    });

    mocks.create.mockReturnValue({
      get: mocks.get,
      interceptors: {
        response: {
          use: mocks.use,
          eject: mocks.eject,
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the fetch button", () => {
    render(<App />);

    expect(screen.getByTestId("axios-fetch-btn")).toBeInTheDocument();
  });

  it("registers an Axios response interceptor", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mocks.use).toHaveBeenCalledTimes(1);
    });

    expect(mocks.responseErrorHandler).toEqual(expect.any(Function));
  });

  it("displays Session Expired when the API returns 401", async () => {
    const user = userEvent.setup();

    mocks.get.mockImplementation(() =>
      Promise.reject({
        response: { status: 401 },
      }).catch((error) => mocks.responseErrorHandler(error)),
    );

    render(<App />);

    await user.click(screen.getByTestId("axios-fetch-btn"));

    expect(mocks.get).toHaveBeenCalledTimes(1);

    expect(await screen.findByTestId("global-auth-error")).toHaveTextContent(
      "Session Expired",
    );
  });

  it("does not display the session error for non-401 responses", async () => {
    const user = userEvent.setup();

    mocks.get.mockImplementation(() =>
      Promise.reject({
        response: { status: 500 },
      }).catch((error) => mocks.responseErrorHandler(error)),
    );

    render(<App />);

    await user.click(screen.getByTestId("axios-fetch-btn"));

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByTestId("global-auth-error")).not.toBeInTheDocument();
  });

  it("ejects the response interceptor when the component unmounts", async () => {
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(mocks.use).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(mocks.eject).toHaveBeenCalledWith(1);
  });
});

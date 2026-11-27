import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { App } from "../src/App.jsx";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;

    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({});
  }

  sendMessage(data) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  sendRaw(data) {
    this.onmessage?.({ data });
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({});
  }
}

describe("WebSocket Live Updates Dashboard", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("connects to the configured WebSocket endpoint", () => {
    render(<App />);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe("ws://localhost:8080");

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Connecting",
    );
  });

  it("updates the connection status when connected", () => {
    render(<App />);

    act(() => {
      MockWebSocket.instances[0].open();
    });

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Connected",
    );
  });

  it("adds and updates metrics from WebSocket events", () => {
    render(<App />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.sendMessage({
        type: "metric:update",
        eventId: "event-1",
        id: "cpu",
        label: "CPU Usage",
        value: 45,
        unit: "%",
      });
    });

    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
    expect(screen.getByText("45 %")).toBeInTheDocument();

    act(() => {
      socket.sendMessage({
        type: "metric:update",
        eventId: "event-2",
        id: "cpu",
        label: "CPU Usage",
        value: 90,
        unit: "%",
      });
    });

    expect(screen.getByText("90 %")).toBeInTheDocument();
    expect(screen.queryAllByTestId("metric-item")).toHaveLength(1);
  });

  it("displays alerts without removing previous alerts", () => {
    render(<App />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.sendMessage({
        type: "alert:new",
        eventId: "event-1",
        id: "alert-1",
        message: "High CPU usage",
        severity: "warning",
      });

      socket.sendMessage({
        type: "alert:new",
        eventId: "event-2",
        id: "alert-2",
        message: "Memory limit exceeded",
        severity: "critical",
      });
    });

    expect(screen.getByText("High CPU usage")).toBeInTheDocument();
    expect(screen.getByText("Memory limit exceeded")).toBeInTheDocument();

    expect(screen.getAllByTestId("alert-item")).toHaveLength(2);
  });

  it("ignores duplicate event IDs", () => {
    render(<App />);

    const socket = MockWebSocket.instances[0];

    const event = {
      type: "alert:new",
      eventId: "duplicate-1",
      id: "alert-1",
      message: "Duplicate alert",
      severity: "warning",
    };

    act(() => {
      socket.sendMessage(event);
      socket.sendMessage(event);
    });

    expect(screen.getAllByTestId("alert-item")).toHaveLength(1);
  });

  it("ignores malformed JSON and unsupported events", () => {
    render(<App />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.sendRaw("{invalid-json");

      socket.sendMessage({
        type: "unsupported:event",
        eventId: "event-1",
      });
    });

    expect(screen.queryByTestId("alert-item")).not.toBeInTheDocument();
    expect(screen.queryByTestId("metric-item")).not.toBeInTheDocument();
  });

  it("ignores events with invalid payloads", () => {
    render(<App />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.sendMessage({
        type: "metric:update",
        eventId: "event-1",
        id: "cpu",
        label: "CPU",
        value: "invalid",
        unit: "%",
      });

      socket.sendMessage({
        type: "alert:new",
        eventId: "event-2",
        id: "alert-1",
        message: "",
        severity: "unknown",
      });
    });

    expect(screen.queryByTestId("metric-item")).not.toBeInTheDocument();
    expect(screen.queryByTestId("alert-item")).not.toBeInTheDocument();
  });

  it("reconnects after an unexpected disconnection", () => {
    vi.useFakeTimers();

    render(<App />);

    const firstSocket = MockWebSocket.instances[0];

    act(() => {
      firstSocket.open();
      firstSocket.close();
    });

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Reconnecting",
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("does not exceed five automatic reconnection attempts", () => {
    vi.useFakeTimers();

    render(<App />);

    act(() => {
      MockWebSocket.instances[0].close();
    });

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
        MockWebSocket.instances.at(-1).close();
      });
    }

    expect(MockWebSocket.instances).toHaveLength(6);

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Disconnected",
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(MockWebSocket.instances).toHaveLength(6);
  });

  it("supports manual reconnection", () => {
    render(<App />);

    const firstSocket = MockWebSocket.instances[0];

    act(() => {
      screen.getByTestId("reconnect-button").click();
    });

    expect(firstSocket.readyState).toBe(MockWebSocket.CLOSED);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("closes the WebSocket connection on unmount", () => {
    const { unmount } = render(<App />);

    const socket = MockWebSocket.instances[0];

    unmount();

    expect(socket.readyState).toBe(MockWebSocket.CLOSED);
  });

  it("does not reconnect after unmounting", () => {
    vi.useFakeTimers();

    const { unmount } = render(<App />);

    act(() => {
      MockWebSocket.instances[0].close();
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

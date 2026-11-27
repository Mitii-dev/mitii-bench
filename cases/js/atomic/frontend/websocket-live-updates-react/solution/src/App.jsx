import { useCallback, useEffect, useRef, useState } from "react";

const SOCKET_URL = "ws://localhost:8080";
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

export function App() {
  const [status, setStatus] = useState("Connecting");
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [retrySignal, setRetrySignal] = useState(0);

  const socketRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const processedEventsRef = useRef(new Set());

  const handleMessage = useCallback((rawMessage) => {
    let event;

    try {
      event = JSON.parse(rawMessage.data);
    } catch {
      return;
    }

    if (
      !event ||
      typeof event !== "object" ||
      typeof event.eventId !== "string" ||
      !event.eventId.trim()
    ) {
      return;
    }

    if (processedEventsRef.current.has(event.eventId)) {
      return;
    }

    if (event.type === "metric:update") {
      if (
        typeof event.id !== "string" ||
        !event.id.trim() ||
        typeof event.label !== "string" ||
        typeof event.value !== "number" ||
        !Number.isFinite(event.value) ||
        typeof event.unit !== "string"
      ) {
        return;
      }

      processedEventsRef.current.add(event.eventId);

      setMetrics((previous) => {
        const exists = previous.some((metric) => metric.id === event.id);

        if (!exists) {
          return [
            ...previous,
            {
              id: event.id,
              label: event.label,
              value: event.value,
              unit: event.unit,
            },
          ];
        }

        return previous.map((metric) =>
          metric.id === event.id
            ? {
                ...metric,
                label: event.label,
                value: event.value,
                unit: event.unit,
              }
            : metric,
        );
      });

      return;
    }

    if (event.type === "alert:new") {
      if (
        typeof event.id !== "string" ||
        !event.id.trim() ||
        typeof event.message !== "string" ||
        !event.message.trim() ||
        !["info", "warning", "critical"].includes(event.severity)
      ) {
        return;
      }

      processedEventsRef.current.add(event.eventId);

      setAlerts((previous) => [
        ...previous,
        {
          id: event.id,
          message: event.message,
          severity: event.severity,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let socket = null;

    const connect = () => {
      if (!active) return;

      setStatus(retryCountRef.current > 0 ? "Reconnecting" : "Connecting");

      try {
        socket = new WebSocket(SOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
          if (!active) return;

          retryCountRef.current = 0;
          setStatus("Connected");
        };

        socket.onmessage = (event) => {
          if (active) handleMessage(event);
        };

        socket.onerror = () => {
          if (active) setStatus("Disconnected");
        };

        socket.onclose = () => {
          if (!active) return;

          socketRef.current = null;

          if (retryCountRef.current >= MAX_RETRIES) {
            setStatus("Disconnected");
            return;
          }

          retryCountRef.current += 1;
          setStatus("Reconnecting");

          retryTimerRef.current = setTimeout(connect, RETRY_DELAY);
        };
      } catch {
        if (!active) return;

        if (retryCountRef.current >= MAX_RETRIES) {
          setStatus("Disconnected");
          return;
        }

        retryCountRef.current += 1;
        setStatus("Reconnecting");

        retryTimerRef.current = setTimeout(connect, RETRY_DELAY);
      }
    };

    connect();

    return () => {
      active = false;

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (
          socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN
        ) {
          socket.close();
        }
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [handleMessage, retrySignal]);

  const reconnect = () => {
    retryCountRef.current = 0;
    setStatus("Connecting");
    setRetrySignal((previous) => previous + 1);
  };

  const styles = {
    container: {
      maxWidth: "900px",
      margin: "40px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#1f2937",
    },
    panel: {
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "20px",
      marginTop: "20px",
    },
    item: {
      padding: "12px",
      borderBottom: "1px solid #e5e7eb",
    },
    button: {
      padding: "9px 16px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
  };

  return (
    <main data-testid="websocket-dashboard" style={styles.container}>
      <h1>Live Operations Dashboard</h1>

      <section style={styles.panel}>
        <div data-testid="connection-status" role="status" aria-live="polite">
          Connection: {status}
        </div>

        <button
          data-testid="reconnect-button"
          style={styles.button}
          onClick={reconnect}
          type="button"
        >
          Reconnect
        </button>
      </section>

      <section style={styles.panel}>
        <h2>Live Metrics</h2>

        <div data-testid="metrics-list">
          {metrics.length === 0 ? (
            <p>No metrics received yet.</p>
          ) : (
            metrics.map((metric) => (
              <div
                key={metric.id}
                data-testid="metric-item"
                style={styles.item}
              >
                <strong>{metric.label}</strong>
                <p>
                  {metric.value} {metric.unit}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={styles.panel}>
        <h2>Live Alerts</h2>

        <div data-testid="alerts-list">
          {alerts.length === 0 ? (
            <p>No alerts received yet.</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} data-testid="alert-item" style={styles.item}>
                <strong>{alert.message}</strong>
                <p>Severity: {alert.severity}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

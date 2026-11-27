import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "cross-tab-sync-react:state";

const DEFAULT_STATE = {
  displayName: "Guest",
  theme: "light",
  notifications: true,
};

function createSourceId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidState(state) {
  return (
    state !== null &&
    typeof state === "object" &&
    typeof state.displayName === "string" &&
    ["light", "dark"].includes(state.theme) &&
    typeof state.notifications === "boolean"
  );
}

function parseEnvelope(value) {
  try {
    const parsed = JSON.parse(value);

    if (
      parsed?.version !== 1 ||
      !Number.isFinite(parsed.updatedAt) ||
      typeof parsed.sourceId !== "string" ||
      !parsed.sourceId ||
      !isValidState(parsed.state)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function readStoredEnvelope() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return null;

    return parseEnvelope(stored);
  } catch {
    return null;
  }
}

function compareEnvelopes(incoming, current) {
  if (!current) return 1;

  if (incoming.updatedAt !== current.updatedAt) {
    return incoming.updatedAt > current.updatedAt ? 1 : -1;
  }

  if (incoming.sourceId === current.sourceId) return 0;

  return incoming.sourceId > current.sourceId ? 1 : -1;
}

export function App() {
  const sourceIdRef = useRef(null);

  if (!sourceIdRef.current) {
    sourceIdRef.current = createSourceId();
  }

  const [envelope, setEnvelope] = useState(() => {
    const stored = readStoredEnvelope();

    return (
      stored || {
        version: 1,
        updatedAt: 0,
        sourceId: "",
        state: DEFAULT_STATE,
      }
    );
  });

  const envelopeRef = useRef(envelope);
  const [syncStatus, setSyncStatus] = useState("Synced");

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      const incoming = parseEnvelope(event.newValue);

      if (!incoming || incoming.sourceId === sourceIdRef.current) {
        return;
      }

      if (compareEnvelopes(incoming, envelopeRef.current) <= 0) {
        return;
      }

      envelopeRef.current = incoming;
      setEnvelope(incoming);
      setSyncStatus("Synced");
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updatePreferences = (patch) => {
    const current = envelopeRef.current;
    const next = {
      version: 1,
      updatedAt: Math.max(Date.now(), current.updatedAt + 1),
      sourceId: sourceIdRef.current,
      state: {
        ...current.state,
        ...patch,
      },
    };

    envelopeRef.current = next;
    setEnvelope(next);
    setSyncStatus("Synced");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setSyncStatus("Local changes only");
    }
  };

  const resetPreferences = () => {
    updatePreferences(DEFAULT_STATE);
  };

  const { displayName, theme, notifications } = envelope.state;

  const dark = theme === "dark";

  return (
    <main
      data-testid="cross-tab-sync"
      style={{
        ...styles.container,
        background: dark ? "#111827" : "#f9fafb",
        color: dark ? "#f9fafb" : "#111827",
      }}
    >
      <section
        style={{
          ...styles.panel,
          background: dark ? "#1f2937" : "#ffffff",
          borderColor: dark ? "#374151" : "#e5e7eb",
        }}
      >
        <h1>Shared Preferences</h1>
        <p>Changes are synchronized across browser tabs.</p>

        <div style={styles.field}>
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            data-testid="display-name"
            value={displayName}
            onChange={(event) =>
              updatePreferences({ displayName: event.target.value })
            }
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            data-testid="theme-select"
            value={theme}
            onChange={(event) =>
              updatePreferences({ theme: event.target.value })
            }
            style={styles.input}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div style={styles.checkboxField}>
          <input
            id="notifications-toggle"
            data-testid="notifications-toggle"
            type="checkbox"
            checked={notifications}
            onChange={(event) =>
              updatePreferences({ notifications: event.target.checked })
            }
          />
          <label htmlFor="notifications-toggle">Enable notifications</label>
        </div>

        <div data-testid="sync-status" role="status" style={styles.status}>
          {syncStatus}
        </div>

        <button
          type="button"
          data-testid="reset-settings"
          onClick={resetPreferences}
          style={styles.button}
        >
          Reset Settings
        </button>
      </section>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    transition: "background 150ms ease, color 150ms ease",
  },
  panel: {
    maxWidth: "520px",
    margin: "40px auto",
    padding: "28px",
    border: "1px solid",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "20px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #9ca3af",
    borderRadius: "6px",
    fontSize: "14px",
  },
  checkboxField: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
  },
  status: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#16a34a",
  },
  button: {
    marginTop: "20px",
    padding: "10px 16px",
    border: 0,
    borderRadius: "6px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },
};

import { useEffect, useState } from "react";

const INITIAL_VALUES = {
  name: "",
  email: "",
  message: "",
};

export function App() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [savedValues, setSavedValues] = useState(INITIAL_VALUES);

  const isDirty =
    values.name !== savedValues.name ||
    values.email !== savedValues.email ||
    values.message !== savedValues.message;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedValues({ ...values });
  };

  const handleReset = () => {
    setValues({ ...savedValues });
  };

  const handleNavigation = (event) => {
    if (!isDirty) return;

    const shouldLeave = window.confirm(
      "You have unsaved changes. Are you sure you want to leave?",
    );

    if (!shouldLeave) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "40px 20px",
      background: "#f4f6fa",
      fontFamily: "Arial, sans-serif",
      color: "#202938",
    },
    container: {
      maxWidth: "560px",
      margin: "0 auto",
      padding: "28px",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "18px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #cbd2dc",
      borderRadius: "6px",
      fontSize: "15px",
    },
    button: {
      padding: "11px 16px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
    },
  };

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <h1>Profile Settings</h1>

        <p
          data-testid="dirty-indicator"
          role="status"
          aria-live="polite"
          style={{
            color: isDirty ? "#b45309" : "#15803d",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          {isDirty ? "Unsaved changes" : "All changes saved"}
        </p>

        <form onSubmit={handleSave}>
          <div style={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              data-testid="name-input"
              type="text"
              value={values.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              data-testid="email-input"
              type="email"
              value={values.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              data-testid="message-input"
              value={values.message}
              onChange={handleChange}
              rows={4}
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="submit"
              data-testid="save-button"
              style={{
                ...styles.button,
                background: "#2563eb",
                color: "#ffffff",
              }}
            >
              Save Changes
            </button>

            <button
              type="button"
              data-testid="reset-button"
              onClick={handleReset}
              disabled={!isDirty}
              style={{
                ...styles.button,
                background: "#e5e7eb",
                color: "#202938",
                opacity: isDirty ? 1 : 0.6,
              }}
            >
              Reset Changes
            </button>
          </div>
        </form>

        <hr
          style={{
            margin: "28px 0",
            border: "none",
            borderTop: "1px solid #e5e7eb",
          }}
        />

        <a
          href="/dashboard"
          data-testid="navigation-link"
          onClick={handleNavigation}
          style={{ color: "#2563eb", fontWeight: 600 }}
        >
          Go to Dashboard
        </a>
      </section>
    </main>
  );
}

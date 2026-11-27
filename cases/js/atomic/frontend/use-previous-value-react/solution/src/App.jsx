import { useEffect, useRef, useState } from "react";

export function usePrevious(value) {
  const previousRef = useRef();

  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  return previousRef.current;
}

export function App() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "60px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        color: "#1e293b",
      }}
    >
      <h1>Previous Value Hook</h1>

      <section
        style={{
          padding: "24px",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <p>
          Current value: <strong data-testid="current-value">{count}</strong>
        </p>

        <p>
          Previous value:{" "}
          <strong data-testid="previous-value">
            {previousCount === undefined ? "None" : previousCount}
          </strong>
        </p>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          data-testid="increment-button"
          onClick={() => setCount((current) => current + 1)}
        >
          Increment
        </button>

        <button
          data-testid="decrement-button"
          onClick={() => setCount((current) => current - 1)}
        >
          Decrement
        </button>

        <button data-testid="reset-button" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </main>
  );
}

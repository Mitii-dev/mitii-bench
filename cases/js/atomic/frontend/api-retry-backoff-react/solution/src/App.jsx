import { useEffect, useRef, useState } from "react";
import { requestWithRetry } from "./retry";

export function App() {
  const [maxRetries, setMaxRetries] = useState(3);
  const [baseDelay, setBaseDelay] = useState(500);
  const [failureCount, setFailureCount] = useState(2);

  const [status, setStatus] = useState("idle");
  const [attempt, setAttempt] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [nextDelay, setNextDelay] = useState(null);
  const [result, setResult] = useState("");

  const controllerRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  async function handleRequest() {
    if (runningRef.current) return;

    runningRef.current = true;

    const controller = new AbortController();
    controllerRef.current = controller;

    let simulatedAttempts = 0;

    setStatus("loading");
    setAttempt(0);
    setRetryCount(0);
    setNextDelay(null);
    setResult("");

    try {
      const response = await requestWithRetry(
        async () => {
          simulatedAttempts++;

          if (simulatedAttempts <= failureCount) {
            throw new Error("Simulated network failure");
          }

          return {
            message: "Request completed successfully",
          };
        },
        {
          maxRetries,
          baseDelay,
          signal: controller.signal,

          onAttempt: (currentAttempt) => {
            setAttempt(currentAttempt);
            setNextDelay(null);
          },

          onRetry: ({ delay }) => {
            setRetryCount((count) => count + 1);
            setNextDelay(delay);
          },
        },
      );

      setStatus("success");
      setResult(response.message);
    } catch (error) {
      if (!controller.signal.aborted) {
        setStatus("error");
        setResult(error.message);
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        runningRef.current = false;
      }
    }
  }

  return (
    <main
      data-testid="retry-app"
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>API Retry Simulator</h1>

      <p>Test automatic request retries with exponential backoff.</p>

      <section>
        <label>
          Maximum retries
          <input
            aria-label="Maximum retries"
            type="number"
            min="0"
            max="10"
            value={maxRetries}
            disabled={status === "loading"}
            onChange={(event) =>
              setMaxRetries(
                Math.max(0, Math.min(10, Number(event.target.value) || 0)),
              )
            }
          />
        </label>

        <label>
          Base delay (ms)
          <input
            aria-label="Base delay"
            type="number"
            min="1"
            max="30000"
            value={baseDelay}
            disabled={status === "loading"}
            onChange={(event) =>
              setBaseDelay(
                Math.max(1, Math.min(30000, Number(event.target.value) || 1)),
              )
            }
          />
        </label>

        <label>
          Failures before success
          <input
            aria-label="Failures before success"
            type="number"
            min="0"
            max="10"
            value={failureCount}
            disabled={status === "loading"}
            onChange={(event) =>
              setFailureCount(
                Math.max(0, Math.min(10, Number(event.target.value) || 0)),
              )
            }
          />
        </label>
      </section>

      <button
        type="button"
        data-testid="start-request"
        onClick={handleRequest}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Requesting..." : "Start Request"}
      </button>

      <section
        data-testid="request-status"
        aria-live="polite"
        style={{ marginTop: 24 }}
      >
        <h2>Request Status</h2>

        <p>
          Status: <strong>{status}</strong>
        </p>

        <p data-testid="attempt-count">Current attempt: {attempt}</p>

        <p data-testid="retry-count">Retries: {retryCount}</p>

        <p data-testid="next-delay">
          Next retry delay: {nextDelay === null ? "None" : `${nextDelay} ms`}
        </p>

        {result && <p data-testid="request-result">{result}</p>}
      </section>
    </main>
  );
}

export default App;

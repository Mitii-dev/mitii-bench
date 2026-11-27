import { useCallback, useState } from "react";

export function useUndoRedo(initialValue, options = {}) {
  const requestedLimit = options.limit ?? 50;
  const historyLimit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.floor(requestedLimit)
      : 50;

  const [history, setHistory] = useState({
    past: [],
    present: initialValue,
    future: [],
  });

  const setValue = useCallback(
    (nextValue) => {
      setHistory((current) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? nextValue(current.present)
            : nextValue;

        if (Object.is(resolvedValue, current.present)) {
          return current;
        }

        return {
          past: [...current.past, current.present].slice(-historyLimit),
          present: resolvedValue,
          future: [],
        };
      });
    },
    [historyLimit],
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) {
        return current;
      }

      const previousValue = current.past[current.past.length - 1];

      return {
        past: current.past.slice(0, -1),
        present: previousValue,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) {
        return current;
      }

      const nextValue = current.future[0];

      return {
        past: [...current.past, current.present].slice(-historyLimit),
        present: nextValue,
        future: current.future.slice(1),
      };
    });
  }, [historyLimit]);

  const reset = useCallback(() => {
    setHistory({
      past: [],
      present: initialValue,
      future: [],
    });
  }, [initialValue]);

  return {
    value: history.present,
    setValue,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
  };
}

export function App() {
  const { value, setValue, undo, redo, canUndo, canRedo, reset } =
    useUndoRedo("Hello, world!");

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "48px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#202124",
      }}
    >
      <h1>Undo / Redo Editor</h1>
      <p>Edit the text and use undo or redo to navigate its history.</p>

      <label
        htmlFor="editor"
        style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
      >
        Editor
      </label>

      <textarea
        id="editor"
        data-testid="editor"
        aria-label="Editor"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={6}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 8,
          font: "inherit",
          resize: "vertical",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 16,
        }}
      >
        <button
          type="button"
          data-testid="undo-button"
          onClick={undo}
          disabled={!canUndo}
        >
          Undo
        </button>

        <button
          type="button"
          data-testid="redo-button"
          onClick={redo}
          disabled={!canRedo}
        >
          Redo
        </button>

        <button type="button" data-testid="reset-button" onClick={reset}>
          Reset
        </button>
      </div>

      <p aria-live="polite" style={{ marginTop: 16 }}>
        {canUndo ? "Undo available" : "Nothing to undo"} ·{" "}
        {canRedo ? "Redo available" : "Nothing to redo"}
      </p>
    </main>
  );
}

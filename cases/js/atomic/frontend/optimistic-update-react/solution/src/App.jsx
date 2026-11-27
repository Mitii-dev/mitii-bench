import { useRef, useState } from "react";

const INITIAL_TASKS = [
  { id: "task-1", title: "Review pull request", completed: false },
  { id: "task-2", title: "Update project documentation", completed: true },
  { id: "task-3", title: "Prepare release notes", completed: false },
];

function updateTaskOnServer({ taskId, completed, shouldFail }) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail)
        reject(
          new Error("The server could not save this change. Please try again."),
        );
      else resolve({ taskId, completed });
    }, 450);
  });
}

export function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [pendingIds, setPendingIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [failNextRequest, setFailNextRequest] = useState(false);
  const failNextRef = useRef(false);
  const retryTargets = useRef({});

  const setPending = (id, pending) =>
    setPendingIds((current) =>
      pending
        ? [...current.filter((item) => item !== id), id]
        : current.filter((item) => item !== id),
    );

  const updateTask = async (id, nextCompleted) => {
    if (pendingIds.includes(id)) return;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const previousCompleted = task.completed;
    const shouldFail = failNextRef.current;
    if (shouldFail) {
      failNextRef.current = false;
      setFailNextRequest(false);
    }
    retryTargets.current[id] = nextCompleted;
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    // Optimistically update before awaiting the API.
    setTasks((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed: nextCompleted } : item,
      ),
    );
    setPending(id, true);
    try {
      await updateTaskOnServer({
        taskId: id,
        completed: nextCompleted,
        shouldFail,
      });
      setErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      delete retryTargets.current[id];
    } catch (error) {
      // Restore the exact value captured before this request started.
      setTasks((current) =>
        current.map((item) =>
          item.id === id ? { ...item, completed: previousCompleted } : item,
        ),
      );
      setErrors((current) => ({
        ...current,
        [id]: error.message || "Unable to save this change.",
      }));
    } finally {
      setPending(id, false);
    }
  };

  return (
    <main className="task-app">
      <header className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE / TASKS</p>
          <h1>Task manager</h1>
          <p className="subtitle">Changes save automatically as you work.</p>
        </div>
        <label className="failure-control">
          <input
            type="checkbox"
            data-testid="fail-next-request"
            checked={failNextRequest}
            onChange={(event) => {
              failNextRef.current = event.target.checked;
              setFailNextRequest(event.target.checked);
            }}
          />
          Simulate next API failure
        </label>
      </header>
      <section className="task-card" aria-labelledby="task-heading">
        <div className="card-heading">
          <div>
            <h2 id="task-heading">Your tasks</h2>
            <p>Toggle a task to update its completion status.</p>
          </div>
          <span className="task-count">
            {tasks.filter((task) => task.completed).length} / {tasks.length}{" "}
            complete
          </span>
        </div>
        <ul className="task-list" data-testid="task-list">
          {tasks.map((task) => {
            const pending = pendingIds.includes(task.id);
            const error = errors[task.id];
            return (
              <li
                key={task.id}
                className={`task-row ${task.completed ? "is-complete" : ""}`}
                data-testid={`task-row-${task.id}`}
              >
                <div className="task-main">
                  <span
                    className={`status-dot ${task.completed ? "done" : ""}`}
                    aria-hidden="true"
                  />
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <span
                      data-testid={`task-status-${task.id}`}
                      className="task-status"
                      role="status"
                      aria-live="polite"
                    >
                      {pending
                        ? "Saving..."
                        : task.completed
                          ? "Completed"
                          : "Not completed"}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    type="button"
                    data-testid={`task-toggle-${task.id}`}
                    disabled={pending}
                    onClick={() => updateTask(task.id, !task.completed)}
                  >
                    {pending
                      ? "Saving..."
                      : task.completed
                        ? "Mark incomplete"
                        : "Mark complete"}
                  </button>
                </div>
                {error && (
                  <div
                    className="task-error"
                    role="alert"
                    data-testid={`task-error-${task.id}`}
                  >
                    <span>{error}</span>
                    <button
                      type="button"
                      data-testid={`task-retry-${task.id}`}
                      onClick={() =>
                        updateTask(task.id, retryTargets.current[task.id])
                      }
                    >
                      Retry
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="helper-text">
          Updates appear immediately. If saving fails, the previous task status
          is restored.
        </p>
      </section>
    </main>
  );
}

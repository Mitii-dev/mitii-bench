import { useState } from "react";

const INITIAL_TASKS = [
  { id: "task-1", title: "Design homepage" },
  { id: "task-2", title: "Implement authentication" },
  { id: "task-3", title: "Create dashboard" },
  { id: "task-4", title: "Write unit tests" },
  { id: "task-5", title: "Deploy application" },
];

export function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (event, id) => {
    setDraggedId(id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (event, id) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();

    const sourceId = event.dataTransfer.getData("text/plain") || draggedId;

    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    setTasks((prevTasks) => {
      const sourceIndex = prevTasks.findIndex((task) => task.id === sourceId);
      const targetIndex = prevTasks.findIndex((task) => task.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return prevTasks;
      }

      const updatedTasks = [...prevTasks];
      const [draggedTask] = updatedTasks.splice(sourceIndex, 1);

      const insertionIndex =
        targetIndex === prevTasks.length - 1
          ? updatedTasks.length
          : sourceIndex < targetIndex
            ? targetIndex - 1
            : targetIndex;

      updatedTasks.splice(insertionIndex, 0, draggedTask);

      return updatedTasks;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <main
      style={{
        maxWidth: "520px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <h1>Task Manager</h1>

      <p>Drag and drop tasks to change their order.</p>

      <ul
        data-testid="task-list"
        aria-label="Reorderable tasks"
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {tasks.map((task, index) => {
          const isDragging = draggedId === task.id;
          const isDragOver = dragOverId === task.id;

          return (
            <li
              key={task.id}
              data-testid="draggable-item"
              data-task-id={task.id}
              draggable
              onDragStart={(event) => handleDragStart(event, task.id)}
              onDragOver={(event) => handleDragOver(event, task.id)}
              onDrop={(event) => handleDrop(event, task.id)}
              onDragEnd={handleDragEnd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                border: "1px solid",
                borderColor: isDragOver ? "#2563eb" : "#d1d5db",
                borderRadius: "8px",
                background: isDragOver ? "#eff6ff" : "#ffffff",
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
                transition: "background 0.15s, opacity 0.15s",
              }}
            >
              <span
                aria-hidden="true"
                style={{ color: "#9ca3af", cursor: "grab" }}
              >
                ⠿
              </span>

              <span style={{ flex: 1 }}>{task.title}</span>

              <span
                data-testid="task-position"
                style={{ color: "#6b7280", fontSize: "13px" }}
              >
                {index + 1}
              </span>
            </li>
          );
        })}
      </ul>

      <p
        data-testid="task-count"
        style={{ color: "#6b7280", fontSize: "14px" }}
      >
        Total tasks: {tasks.length}
      </p>
    </main>
  );
}

import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now() + Math.random(),
          message,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
}));

export function App() {
  const notifications = useNotificationStore((state) => state.notifications);

  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  return (
    <main>
      <h1>Notification Store</h1>

      <button
        type="button"
        data-testid="trigger-toast"
        onClick={() => addNotification("Hello")}
      >
        Show Notification
      </button>

      <ul data-testid="toast-list">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <span>{notification.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeNotification(notification.id)}
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

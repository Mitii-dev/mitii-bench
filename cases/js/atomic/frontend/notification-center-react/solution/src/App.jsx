import { useMemo, useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "New message received",
    message: "You have received a new message from Alex.",
    timestamp: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Payment successful",
    message: "Your payment of $120 was completed successfully.",
    timestamp: "30 minutes ago",
    read: true,
  },
  {
    id: 3,
    title: "Account security alert",
    message: "A new login was detected on your account.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    title: "Weekly report available",
    message: "Your weekly activity report is ready.",
    timestamp: "Yesterday",
    read: true,
  },
];

export function App() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.read);
    }

    return notifications;
  }, [notifications, activeFilter]);

  function toggleReadStatus(id) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  }

  const styles = {
    container: {
      maxWidth: "760px",
      margin: "40px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#1f2937",
      background: "#ffffff",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },
    count: {
      background: "#dbeafe",
      color: "#1d4ed8",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "bold",
    },
    filters: {
      display: "flex",
      gap: "10px",
      margin: "24px 0",
    },
    button: {
      padding: "9px 15px",
      borderRadius: "7px",
      border: "1px solid #d1d5db",
      background: "#ffffff",
      cursor: "pointer",
    },
    activeButton: {
      background: "#2563eb",
      color: "#ffffff",
      borderColor: "#2563eb",
    },
    notification: {
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "18px",
      marginBottom: "12px",
    },
    unread: {
      background: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    status: {
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    message: {
      color: "#6b7280",
      fontSize: "14px",
      margin: "8px 0",
    },
    timestamp: {
      color: "#9ca3af",
      fontSize: "12px",
    },
    empty: {
      padding: "40px 15px",
      textAlign: "center",
      color: "#6b7280",
    },
  };

  return (
    <main data-testid="notification-center" style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Notifications</h1>
          <p>
            You have <strong data-testid="unread-count">{unreadCount}</strong>{" "}
            unread notifications
          </p>
        </div>

        <button
          type="button"
          data-testid="mark-all-read"
          style={styles.button}
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </header>

      <nav aria-label="Notification filters" style={styles.filters}>
        <button
          type="button"
          data-testid="notification-filter-all"
          aria-pressed={activeFilter === "all"}
          style={{
            ...styles.button,
            ...(activeFilter === "all" ? styles.activeButton : {}),
          }}
          onClick={() => setActiveFilter("all")}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          data-testid="notification-filter-unread"
          aria-pressed={activeFilter === "unread"}
          style={{
            ...styles.button,
            ...(activeFilter === "unread" ? styles.activeButton : {}),
          }}
          onClick={() => setActiveFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
      </nav>

      <section data-testid="notification-list" aria-label="Notification list">
        {filteredNotifications.length === 0 ? (
          <div role="status" style={styles.empty}>
            No notifications to display.
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              data-testid={`notification-item-${notification.id}`}
              style={{
                ...styles.notification,
                ...(notification.read ? {} : styles.unread),
              }}
            >
              <div
                style={{
                  ...styles.status,
                  color: notification.read ? "#6b7280" : "#2563eb",
                }}
              >
                {notification.read ? "Read" : "Unread"}
              </div>

              <h3>{notification.title}</h3>

              <p style={styles.message}>{notification.message}</p>

              <div style={styles.timestamp}>{notification.timestamp}</div>

              <button
                type="button"
                style={{
                  ...styles.button,
                  marginTop: "12px",
                }}
                aria-label={`${notification.read ? "Mark as unread" : "Mark as read"}: ${notification.title}`}
                onClick={() => toggleReadStatus(notification.id)}
              >
                {notification.read ? "Mark as unread" : "Mark as read"}
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default App;

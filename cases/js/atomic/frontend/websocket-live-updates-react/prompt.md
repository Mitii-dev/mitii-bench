# WebSocket Live Updates Dashboard

Build a real-time Live Operations Dashboard using React and the native
WebSocket API.

The application must receive live metric updates and alerts from a
WebSocket server without requiring page reloads.

## Requirements

### 1. WebSocket Connection

- Connect to `ws://localhost:8080` when the component mounts.
- Display the current connection state.
- Support Connecting, Connected, Disconnected, and Reconnecting states.
- Provide a manual reconnect button.
- Automatically reconnect after unexpected disconnections.
- Retry at one-second intervals, with a maximum of five automatic retries.
- Stop retrying after the maximum number of attempts.

### 2. Metric Events

Support the following event format:

{
"type": "metric:update",
"eventId": "event-001",
"id": "cpu",
"label": "CPU Usage",
"value": 75,
"unit": "%"
}

- Add a metric when it is received for the first time.
- Update an existing metric when another event references the same metric ID.
- Display its label, value, and unit.
- Ignore duplicate event IDs.

### 3. Alert Events

Support the following event format:

{
"type": "alert:new",
"eventId": "event-002",
"id": "alert-001",
"message": "High CPU usage detected",
"severity": "warning"
}

- Display incoming alerts without replacing previous alerts.
- Show their message and severity.
- Ignore duplicate event IDs.

### 4. Event Validation

- Ignore malformed JSON.
- Ignore unsupported event types.
- Ignore events with missing required fields.
- Do not allow invalid events to crash the application.
- Do not process duplicate event IDs.

### 5. Resource Management

- Close the WebSocket connection when the component unmounts.
- Clear pending reconnection timers.
- Prevent reconnect attempts after unmounting.
- Avoid duplicate WebSocket connections.
- Prevent stale event handlers from updating the interface.

## Interface

Provide:

- A dashboard heading.
- A connection status indicator.
- A manual reconnect button.
- A metrics section.
- An alerts section.
- An appropriate empty state when no events have been received.

Required test IDs:

- `websocket-dashboard`
- `connection-status`
- `reconnect-button`
- `metrics-list`
- `metric-item`
- `alerts-list`
- `alert-item`

## Implementation Constraints

- Use React in `src/App.jsx`.
- Use the native browser WebSocket API.
- Do not use Socket.IO or third-party WebSocket libraries.
- Keep styling inside the main component.
- Do not create additional CSS files.

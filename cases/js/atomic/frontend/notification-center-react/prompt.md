# Notification Center

Build a notification center using React that allows users to manage
read and unread notifications.

## Requirements

1. Display a list of notifications containing a title, message,
   timestamp, and read/unread status.
2. Provide filters for:
   - All notifications
   - Unread notifications
3. Allow users to mark an individual unread notification as read.
4. Allow users to mark an individual read notification as unread.
5. Provide a "Mark all as read" action.
6. Display the total unread notification count.
7. Update the notification list and unread count immediately
   whenever a notification's status changes.
8. Preserve notification status when switching between filters.

## Behavior

- Initialize the notification center with multiple notifications
  containing both read and unread items.
- The All filter displays every notification.
- The Unread filter displays only unread notifications.
- Individual read/unread actions must update the corresponding
  notification without affecting other notifications.
- Mark all as read must update every unread notification.
- The unread count must always reflect the current unread items.
- When a filter has no matching notifications, display an empty state.
- Switching filters must not reset notification state.

## Interface

Include:

- Notification list.
- All and Unread filter controls.
- Individual read/unread action buttons.
- Mark all as read button.
- Unread notification counter.
- Empty state.

Required data-testid attributes:

- notification-center
- notification-list
- unread-count
- notification-filter-all
- notification-filter-unread
- mark-all-read

Use accessible button labels and semantic HTML.

Implement the application in `src/App.jsx` using the
`react-js` starter.

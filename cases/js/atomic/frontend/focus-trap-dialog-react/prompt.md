# Task: Accessible Focus Trap Dialog

Build an accessible modal dialog in React that keeps keyboard focus within the dialog while it is open.

## Requirements

1. Display an Open Dialog button on the main page.
2. Clicking the button opens a modal dialog.
3. Move keyboard focus into the dialog when it opens.
4. Keep keyboard focus inside the dialog while it is open.
5. Pressing Tab on the last focusable element must move focus to the first focusable element.
6. Pressing Shift + Tab on the first focusable element must move focus to the last focusable element.
7. Disabled elements must not receive keyboard focus.
8. Pressing Escape must close the dialog.
9. Provide a Close button inside the dialog.
10. Restore keyboard focus to the original Open Dialog button when the dialog closes.
11. Prevent keyboard navigation into the background while the dialog is open.

## Dialog Content

Include:

- Dialog title
- Short description
- Name input
- Email input
- Cancel button
- Save button
- Close button

## Technical Requirements

- Use React.
- Use the focus-trap-react package for focus management.
- Use appropriate dialog accessibility attributes.
- Ensure the dialog works with keyboard navigation.
- Keep the UI responsive and visually clear.

## Expected Behavior

The dialog must behave like an accessible modal: keyboard users should be able to navigate only within the dialog until it closes, after which focus returns to the element that opened it.

# Form Dirty State

Build a React form that detects unsaved changes and warns users before they leave the page.

Implement the feature in `src/App.jsx`.

## Form

Create a form with these fields:

- Name
- Email
- Message

Provide the following controls:

- Save Changes
- Reset Changes
- A navigation link labeled "Go to Dashboard"

## Dirty State

- Initially, the form must be clean.
- Mark the form as dirty when any field differs from its last saved value.
- Display `Unsaved changes` when the form is dirty.
- Display `All changes saved` when the form is clean.
- Update the dirty state immediately when fields change.
- Saving must update the saved baseline and clear the dirty state.
- Resetting must restore the last saved values and clear the dirty state.

## Navigation Warning

- When the form is dirty, clicking "Go to Dashboard" must display a confirmation using `window.confirm`.
- If the user cancels, prevent navigation and preserve all unsaved values.
- If the user confirms, allow navigation.
- If the form is clean, allow navigation without displaying a confirmation.
- Register a `beforeunload` handler while the form is dirty.
- The handler must prevent accidental browser navigation or page closing.
- Remove the `beforeunload` handler when the form becomes clean or the component unmounts.

## Required Test IDs

- `dirty-indicator`
- `name-input`
- `email-input`
- `message-input`
- `save-button`
- `reset-button`
- `navigation-link`

Use accessible labels for all form fields and implement the UI in `src/App.jsx`.

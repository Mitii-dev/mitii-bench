# Focus Trap Dialog: Keyboard Focus Management

## Goal

Build an accessible React modal dialog using focus-trap-react that keeps keyboard focus inside the dialog while it is open and restores focus when closed.

## Starter

`react-js` — Vite + React — implement in `src/App.jsx`.

## Packages

- `focus-trap-react`

```bash
pnpm case:dry-run focus-trap-dialog-react
```

## How we check

- Build succeeds.
- `src/App.jsx` integrates `focus-trap-react`.
- Dialog has appropriate accessibility attributes.
- Dialog opens and closes correctly.
- Keyboard focus remains inside the dialog.
- Tab and Shift+Tab wrap focus correctly.
- Escape closes the dialog.
- Focus returns to the original trigger.
- Background content cannot receive keyboard focus while the dialog is open.

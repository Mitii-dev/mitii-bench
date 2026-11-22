Build an application with two independent components sharing an atomic state (`countAtom`).

* **Component A** (`data-testid="atom-inc-btn"`): Increments atom.
* **Component B** (`data-testid="atom-value-display"`): Displays atom value.

Use `jotai` `atom` and `useAtom` so both components stay in sync without prop drilling.

For `base-react-js`, implement the UI in `src/App.jsx`.

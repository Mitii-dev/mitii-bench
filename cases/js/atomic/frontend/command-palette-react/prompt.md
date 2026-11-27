# Searchable Command Palette with Keyboard Navigation

Build a searchable command palette for a React application. The palette should let users quickly find and execute available application commands using either the keyboard or mouse.

## Required behavior

- Open the palette with `Ctrl+K` on Windows/Linux and `Cmd+K` on macOS. Provide a visible trigger button as an alternative.
- Focus the search input when the palette opens.
- Filter commands as the user types. Matching should be case-insensitive and should consider the command name and useful descriptive terms.
- Move the active result with `ArrowDown` and `ArrowUp`. Navigation should wrap at the beginning and end of the result list.
- Execute the active command with `Enter`.
- Allow users to execute a command by clicking its result.
- Close the palette with `Escape` and restore focus to the trigger.
- Clearly indicate the active result.
- Show a helpful empty state when no commands match.
- Display an observable confirmation after a command executes.

## Accessibility

Use an accessible dialog pattern for the open palette, provide an accessible name for the search input, expose the results as a listbox with selectable options, and ensure keyboard interactions work without a mouse.

## Constraints

- Implement the application in `src/App.jsx`.
- Use React state and browser keyboard events; no native select element.
- No additional third-party packages are required.
- Keep the command list deterministic so command search and execution can be tested reliably.

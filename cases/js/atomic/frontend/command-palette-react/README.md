# Searchable Command Palette with Keyboard Navigation

## Overview

This case demonstrates a searchable command palette in React. Users can open the palette with a keyboard shortcut or visible trigger, filter commands, navigate results, and execute a command.

## Starter

- Ecosystem: JavaScript
- Starter: `react-js` (Vite + React)
- Implementation entry: `src/App.jsx`
- Additional packages: none

## Interactions

- `Ctrl+K` / `Cmd+K`: toggle the command palette
- `ArrowDown` / `ArrowUp`: move the active result, wrapping at either end
- `Enter`: execute the active command
- `Escape`: close the palette and return focus to the trigger
- Mouse click: execute a command

Search is case-insensitive and matches command labels, descriptions, and keywords. An empty state appears when there are no matches.

## Validation

The case is validated with the repository's build check, focused Vitest/Testing Library tests, and source-content checks declared in `task.yaml`.

Run from the repository root:

```bash
pnpm case:dry-run command-palette-react
```

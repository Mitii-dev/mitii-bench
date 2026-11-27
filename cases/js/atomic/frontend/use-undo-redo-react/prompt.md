# Custom Undo/Redo State Hook

Build a React application that demonstrates a reusable custom `useUndoRedo` hook. The hook must maintain a value history and allow users to undo and redo changes through a simple text editor.

## Requirements

1. Implement and export a custom hook named `useUndoRedo` in `src/App.jsx`.
2. The hook must accept an initial value and an optional history limit (default: 50).
3. The hook must expose:
   - `value`: the current value.
   - `setValue`: update the current value and record its previous value.
   - `undo`: restore the previous value.
   - `redo`: restore the next value.
   - `canUndo`: indicate whether undo is available.
   - `canRedo`: indicate whether redo is available.
   - `reset`: restore the initial value and clear the history.
4. Support both direct values and functional updates through `setValue`.
5. Do not create duplicate history entries when the new value equals the current value.
6. When a new value is set after undoing, discard the abandoned redo history.
7. Keep the history within the configured limit.
8. Disable undo and redo controls when their respective operations are unavailable.

## Behavior

- Initialize the editor with `Hello, world!`.
- Editing the text records the previous value.
- Undo restores the previous text.
- Redo restores the text that was undone.
- Making a new edit after undo creates a new history branch.
- Reset restores the initial text and clears undo/redo history.
- Undo and redo at their boundaries must not change the current value.
- Updating the editor with an unchanged value must not create a history entry.

## Interface

Provide:

- A textarea labeled `Editor`.
- An Undo button with `data-testid="undo-button"`.
- A Redo button with `data-testid="redo-button"`.
- A Reset button with `data-testid="reset-button"`.
- The current text in the textarea with `data-testid="editor"`.
- Undo and redo availability reflected through the buttons' disabled states.

Implement everything in `src/App.jsx`. Do not create separate CSS files.

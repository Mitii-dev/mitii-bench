# Window Size Hook

Build a React component that tracks the browser viewport dimensions using a custom hook.

## Requirements

1. Create a custom `useWindowSize` hook.
2. Track the viewport width and height using `window.innerWidth` and `window.innerHeight`.
3. Initialize the hook with the current viewport dimensions.
4. Register a `resize` event listener to detect viewport changes.
5. Update the width and height whenever the viewport is resized.
6. Remove the resize event listener when the component unmounts.
7. Avoid unnecessary event listeners and memory leaks.

## Behavior

- Display the current viewport width and height.
- Update the displayed dimensions when the browser window is resized.
- Ensure the displayed values reflect the latest viewport dimensions.
- Clean up the registered event listener when the component unmounts.

## Interface

- Main container: `data-testid="window-size"`
- Width value: `data-testid="window-width"`
- Height value: `data-testid="window-height"`

Implement the component in `src/App.jsx` using React.

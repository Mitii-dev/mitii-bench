# Intersection Observer Hook

Build a React component that uses a custom `useIntersectionObserver` hook
to detect when an element enters or leaves the browser viewport.

## Requirements

1. Create a custom `useIntersectionObserver` hook.
2. Accept a React ref pointing to the element that should be observed.
3. Use the browser's native `IntersectionObserver` API.
4. Start with the element's intersection state set to `false`.
5. Update the state whenever the observer reports an intersection change.
6. Detect both entering and leaving the viewport using `entry.isIntersecting`.
7. Start observing the target element after it is mounted.
8. Stop observing and disconnect the observer when the component unmounts.
9. Handle an unavailable `IntersectionObserver` API without crashing.

## Interface

- Observed element: `data-testid="observed-element"`
- Intersection status: `data-testid="intersection-status"`

## Behavior

- Initially display `Not visible`.
- When the element enters the viewport, display `Visible`.
- When the element leaves the viewport, display `Not visible`.
- Keep the status synchronized with the latest observer notification.
- Clean up the observer when the component unmounts.

Implement the component in `src/App.jsx` using React.

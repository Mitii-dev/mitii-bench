# React Previous Value Hook

Implement a reusable React hook named `usePrevious` that returns the previous committed value of a variable whenever its value changes.

## Requirements

1. Implement `usePrevious(value)` in `src/App.jsx`.
2. Return `undefined` on the initial render because no previous value exists.
3. After a value changes, return the value from the previous committed render.
4. Preserve the previous value when the current value has not changed.
5. Support all JavaScript values, including:
   - Numbers and strings
   - `null`
   - `undefined`
   - Objects and arrays
   - Boolean values
6. Preserve object reference identity. Do not clone or serialize values.
7. Do not update the stored previous value during rendering.
8. Ensure the hook works across consecutive renders without returning stale or incorrectly advanced values.

## Behavior

For the following sequence:

| Render | Current value | Previous value |
| ------ | ------------: | -------------: |
| 1      |            10 |      undefined |
| 2      |            20 |             10 |
| 3      |            30 |             20 |
| 4      |            30 |             20 |
| 5      |            40 |             30 |

The previous value must represent the value from the preceding committed render.

## Interface

Create a small demonstration interface in `src/App.jsx` containing:

- A current value display.
- A previous value display.
- An Increment button.
- A Decrement button.
- A Reset button.

Required test IDs:

- `current-value`
- `previous-value`
- `increment-button`
- `decrement-button`
- `reset-button`

Display `None` when the previous value is `undefined`.

## Constraints

- Use React built-in hooks only.
- Do not install additional packages.
- Export `usePrevious` as a named export from `src/App.jsx`.
- Keep the implementation in `src/App.jsx`.

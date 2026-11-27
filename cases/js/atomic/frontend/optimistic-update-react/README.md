# Optimistic UI Updates with Rollback on API Failure

## Overview

This case evaluates optimistic React state updates. Task completion changes immediately, then either persists after a successful simulated API request or rolls back after a failure.

## Starter

- Ecosystem: JavaScript
- Starter: `react-js` (Vite + React)
- Implementation: `src/App.jsx`
- Additional packages: none

## Interactions

- Toggle a task to optimistically change its completion state.
- A saving state is shown while the simulated request is pending.
- Enable **Simulate next API failure** before toggling to reject the next request.
- A failed request restores the previous state and displays an error with Retry.
- Retry reattempts the intended change; other tasks remain independent.

## Validation

```bash
pnpm case:dry-run optimistic-update-react
```

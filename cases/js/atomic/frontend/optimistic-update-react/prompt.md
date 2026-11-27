# Optimistic UI Updates with Rollback on API Failure

Build a React task manager that demonstrates robust optimistic updates. When a user changes a task's completion state, update the UI immediately while an asynchronous API request is pending. If the request succeeds, retain the new state. If it fails, restore the exact state that existed before that request and explain the failure.

## Required behavior
- Render a deterministic list of tasks with visible completion states.
- Toggling a task updates its visible state immediately, before the API request resolves.
- Show a pending/saving indicator while the request is in flight.
- Prevent duplicate submissions for a task while its request is pending.
- On success, retain the optimistic value and clear pending/error state.
- On failure, roll back that task to its previous completion value and show an actionable error.
- Provide a retry action that retries the failed intended change.
- A failure for one task must not change other tasks.
- Include a deterministic control to make the next API request fail; it must affect only the next request and reset after consumption.
- Simulate asynchronous latency so the pending state is observable.

## Accessibility and testability
Use semantic buttons and labels. Expose pending and failure feedback to assistive technology. Provide stable `data-testid` attributes for task rows, status, actions, failure simulation, and retry controls.

## Constraints
- Implement in `src/App.jsx`.
- Use React state and an asynchronous mock API; no external packages are required.
- Keep initial task data and API outcomes deterministic.
- Do not wait for the API before updating the UI.
- Roll back to the state captured before the failed operation, not a hard-coded default.

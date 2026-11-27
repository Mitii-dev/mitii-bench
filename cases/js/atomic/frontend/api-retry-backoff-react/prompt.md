# API Retry with Exponential Backoff

Build a React application that demonstrates automatic retries for
failed API requests using an exponential backoff strategy.

Implement the application in `src/App.jsx`.

## Requirements

1. Provide a button to initiate an API request.
2. Automatically retry failed requests up to a configurable maximum
   number of retries.
3. Implement exponential backoff using the formula:

   delay = baseDelay \* 2 ^ retryIndex

4. Support configurable maximum retries and base delay.
5. Display the current request attempt.
6. Display the delay before the next retry.
7. Display request progress, success, and final failure states.
8. Do not retry successful requests.
9. Prevent multiple requests from running simultaneously.
10. Allow a running request and its pending retry timer to be
    cancelled when the component unmounts.
11. Do not retry an aborted request.
12. Reset request progress when a new request starts.

## Behavior

- The initial request must execute immediately.
- The first retry must occur after the base delay.
- Each subsequent retry delay must double.
- Stop retrying when the configured retry limit is reached.
- A successful retry must terminate the retry sequence.
- A failed request must not cause additional retries after the
  retry limit is exhausted.
- Pending retry timers must be cleaned up when cancelled.

## Interface

Provide controls for:

- Maximum retries
- Base delay in milliseconds
- Number of simulated failures before success

Display:

- Current request status
- Current attempt number
- Retry count
- Next retry delay
- Final request result or error

Use accessible controls and meaningful status messages.

Keep the implementation focused on retry behavior rather than
unrelated API management features.

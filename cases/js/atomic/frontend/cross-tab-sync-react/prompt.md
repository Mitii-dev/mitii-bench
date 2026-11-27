# Cross-Tab State Synchronization

Build a React preferences panel that synchronizes application state across multiple browser tabs opened on the same origin.

Implement the feature in `src/App.jsx`.

## Preferences

The application must provide:

- A display name text input, defaulting to `Guest`.
- A theme selector with `Light` and `Dark` options, defaulting to `Light`.
- A notifications checkbox, enabled by default.
- A Reset Settings button.

## Persistence and Synchronization

1. Persist preferences in `localStorage` using this key:

   `cross-tab-sync-react:state`

2. When a preference changes, update the current tab immediately and persist the complete preference state.

3. Listen for the browser `storage` event and apply valid updates originating from other tabs.

4. Changes received from another tab must update the visible controls without writing the received value back to storage.

5. Use a versioned storage envelope with this structure:

   ```json
   {
     "version": 1,
     "updatedAt": 1700000000000,
     "sourceId": "tab-identifier",
     "state": {
       "displayName": "Guest",
       "theme": "light",
       "notifications": true
     }
   }
   ```

6. Resolve competing updates using `updatedAt`. If timestamps are equal, compare `sourceId` lexicographically. The greater envelope wins.

7. Ignore malformed JSON, unsupported versions, invalid preference values, and stale or duplicate incoming updates.

8. Generate a unique source ID for each mounted tab and keep it stable for that tab's lifetime.

9. Reset Settings must restore all default preferences and synchronize the reset with other tabs.

10. Remove the storage event listener when the component unmounts.

## UI Contract

Use these exact test IDs:

- `cross-tab-sync` — root container
- `display-name` — display name input
- `theme-select` — theme selector
- `notifications-toggle` — notifications checkbox
- `sync-status` — synchronization status
- `reset-settings` — reset button

Use accessible labels for all controls.

The interface must display the current preferences and remain usable when stored data is missing or invalid.

## Constraints

- Use React and native browser APIs.
- Do not use third-party state synchronization libraries.
- Implement the feature in `src/App.jsx`.
- Keep styling in the component; do not add a separate CSS file.

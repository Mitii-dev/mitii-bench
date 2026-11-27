# Overlay System

Build a complete, reusable overlay system in React that supports dialogs, drawers, popovers, tooltips, and nested overlays through a consistent overlay management mechanism.

## Requirements

### 1. Overlay types

Implement the following overlay types:

- Dialog: centered modal with a backdrop, title, content, and close action.
- Drawer: side panel that slides in from the right with a backdrop.
- Popover: contextual floating panel anchored to its trigger.
- Tooltip: lightweight contextual information displayed on hover and keyboard focus.

Each overlay must have appropriate accessible semantics and independent open/close behavior.

### 2. Overlay management

- Maintain a centralized overlay stack.
- Support opening an overlay from another overlay.
- Ensure the newest overlay appears above earlier overlays.
- Assign increasing stacking order to nested overlays.
- Closing an overlay must not unintentionally close its parent.
- Only the topmost dismissible overlay should respond to Escape.
- Support closing overlays individually and clearing the entire stack.

### 3. Focus management

- Move focus into an overlay when it opens.
- Trap Tab and Shift+Tab navigation inside modal dialogs and drawers.
- Keep focus inside the topmost modal when nested overlays are open.
- Restore focus to the element that opened an overlay when it closes.
- Prevent focus from returning to an element belonging to a removed overlay.

### 4. Dismissal behavior

- Escape closes only the topmost dismissible overlay.
- Clicking the backdrop closes the associated overlay when outside dismissal is enabled.
- Clicking inside an overlay must not trigger outside-click dismissal.
- Provide a visible close action.
- Support overlays that disable Escape or outside-click dismissal.

### 5. Scroll locking

- Lock document scrolling while modal overlays are active.
- Preserve the original body overflow value.
- Keep scrolling locked while another modal remains open.
- Restore the original overflow value after the last modal closes.

### 6. Portals and cleanup

- Render overlays through React portals.
- Use a dedicated overlay portal root.
- Remove dynamically created portal elements when the application unmounts.
- Clean up keyboard, pointer, and focus listeners.
- Ensure no stale overlay elements remain after closing or unmounting.

### 7. Interaction demonstration

The application must demonstrate:

- Opening and closing a dialog.
- Opening and closing a drawer.
- Opening and closing a popover.
- Showing and hiding a tooltip.
- Opening a nested dialog from another dialog.
- Closing nested overlays independently.
- Demonstrating Escape dismissal and outside-click dismissal.
- Demonstrating focus trapping and restoration.

## Interface

Provide clearly identifiable controls for each overlay type.

Use the following required test IDs:

- `overlay-system`
- `open-dialog`
- `open-drawer`
- `open-popover`
- `tooltip-trigger`
- `dialog`
- `drawer`
- `popover`
- `tooltip`
- `nested-dialog`
- `close-overlay`
- `overlay-portal-root`

Use accessible roles, labels, and keyboard interactions.

## Behavior and edge cases

- Opening multiple overlays must preserve their stacking order.
- Escape must never close a parent while a nested overlay is active.
- A non-dismissible topmost overlay must not allow Escape to dismiss an underlying overlay.
- Clicking inside a panel must not close it.
- Closing the final modal must restore document scrolling.
- Unmounting the application must release all resources.
- Reopening overlays must not create duplicate portal roots or stale event listeners.

## Implementation

Implement the complete application in `src/App.jsx` using the existing React starter.

Use native React functionality and browser APIs. Do not introduce third-party overlay libraries.

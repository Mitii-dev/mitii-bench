Build an interactive task list that allows users to reorder
items using drag and drop.

### Requirements

1. Task List
   - Display a predefined list of tasks.
   - Each task must have a unique ID and a title.
   - Use `data-testid="task-list"` for the list container.

2. Draggable Items
   - Make every task draggable using the HTML5 Drag and Drop API.
   - Use `data-testid="draggable-item"` for each task.
   - Each item must support drag start and drop interactions.

3. Reordering
   - Allow users to drag an item and drop it at another item's position.
   - Update the list order immediately after dropping.
   - Remove the dragged item from its previous position.
   - Do not create duplicate items during reordering.

4. Visual Feedback
   - Indicate which item is currently being dragged.
   - Highlight the item currently targeted for dropping.
   - Reset drag-related visual states after dropping.

5. State Management
   - Manage the list using React state.
   - Ensure the rendered order reflects the updated state.
   - Preserve the new order during subsequent drag-and-drop operations.

### Implementation

Implement the complete functionality in `src/App.jsx`.

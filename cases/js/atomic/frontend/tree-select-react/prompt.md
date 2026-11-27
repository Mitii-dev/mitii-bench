# Hierarchical Tree Select

Build a reusable hierarchical multi-select component in React.

The component must allow users to select and deselect individual nodes
or entire parent branches while keeping parent and child selection
states synchronized.

## Tree Data

Use the following hierarchy:

- Engineering
  - Frontend
    - React
    - Vue
  - Backend
    - Node.js
    - Python
- Design
  - Product Design
  - UX Research

## Requirements

### 1. Hierarchical Selection

- Display the hierarchy using nested tree nodes.
- Every node must have a checkbox.
- Selecting a parent selects all its descendants.
- Deselecting a parent deselects all its descendants.
- Selecting a child updates the selection state of its ancestors.
- Deselecting a child updates the selection state of its ancestors.
- Selecting all children must automatically mark their parent as selected.

### 2. Parent Checkbox States

Parent checkboxes must support three states:

- Checked: all descendant leaf nodes are selected.
- Unchecked: no descendant leaf nodes are selected.
- Indeterminate: some, but not all, descendant leaf nodes are selected.

Use the checkbox's native indeterminate property for the partial state.

### 3. Expand and Collapse

- Parent nodes must be expandable and collapsible.
- Expanding a node reveals its direct children.
- Collapsing a node hides its descendants without changing selection.
- The initial tree must show the top-level branches.

### 4. Selection Summary

- Display the selected leaf nodes.
- Display the total number of selected leaf nodes.
- Update the summary immediately after every selection change.
- Provide a Clear All action that removes every selection.
- Clearing selections must reset all parent and child checkbox states.

### 5. Interface and Accessibility

- Provide a tree-select control with a visible heading.
- Provide an accessible label for every checkbox.
- Use semantic buttons for expand/collapse and Clear All actions.
- Indicate expanded state using `aria-expanded`.
- Provide an appropriate empty state when no nodes are selected.

## Required Test IDs

- `tree-select`
- `tree-node`
- `tree-checkbox`
- `expand-button`
- `selection-summary`
- `selected-item`
- `clear-selection`

## Implementation Constraints

- Implement the application in `src/App.jsx`.
- Use React state to manage selections.
- Do not use third-party tree-select or checkbox libraries.
- Keep styling inside the main component.
- Do not create additional CSS files.

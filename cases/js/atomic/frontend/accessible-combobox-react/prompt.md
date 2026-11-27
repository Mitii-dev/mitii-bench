# Accessible Combobox

Build an accessible, searchable combobox using React.

## Requirements

1. Render a labeled text input that acts as an ARIA combobox.
2. Display a list of available options in a listbox.
3. Filter the available options as the user types.
4. Allow users to navigate options using the keyboard.
5. Allow users to select an option using the keyboard or mouse.
6. Display the currently selected value.
7. Display an empty state when no options match the search.
8. Keep keyboard navigation accessible to assistive technologies.

## Accessibility

The combobox must:

- Use `role="combobox"` on the input.
- Use `aria-expanded` to indicate whether the listbox is open.
- Use `aria-controls` to reference the listbox.
- Use `aria-autocomplete="list"`.
- Use `aria-activedescendant` to reference the currently active option.
- Use `role="listbox"` on the options container.
- Use `role="option"` on each option.
- Expose the active option using `aria-selected`.

## Keyboard Behavior

- ArrowDown:
  - Open the listbox if closed.
  - Move to the next option if open.
- ArrowUp:
  - Open the listbox if closed and activate the last option.
  - Move to the previous option if open.
- Home: activate the first option when the listbox is open.
- End: activate the last option when the listbox is open.
- Enter: select the active option and close the listbox.
- Escape: close the listbox without changing the current selection.
- Typing: update the search query, filter options, and open the listbox.
- Tab: allow normal browser focus navigation and close the listbox.

Navigation must not move DOM focus away from the input.

## Selection Behavior

- Selecting an option updates the input value.
- Selecting an option updates the displayed selected value.
- Selecting an option closes the listbox.
- Selecting an option clears the active descendant.
- Changing the search query must not change the selected value until an option is selected.

## Empty State

When no options match the query:

- Display a message indicating that no options are available.
- Do not expose the empty-state message as a listbox option.
- Clear the active descendant.

## Required Test IDs

- `accessible-combobox`
- `combobox-listbox`
- `combobox-option-{id}`
- `selected-value`
- `combobox-empty-state`

## Implementation

Implement the application in `src/App.jsx` using the `react-js`
starter. Use semantic HTML and accessible interaction patterns.

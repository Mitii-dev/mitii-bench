# Country, State, and City Dependent Selects

Build a React form containing three dependent select fields:
Country, State, and City.

Implement the application in `src/App.jsx`.

## Requirements

### Country Select

- Display a list of countries.
- The available countries must be:
  - India
  - United States
  - Canada
- Country must be enabled by default.
- Initially show a placeholder: "Select country".

### State Select

- Keep the state select disabled until a country is selected.
- Display only states belonging to the selected country.
- Initially show a placeholder: "Select state".

### City Select

- Keep the city select disabled until a state is selected.
- Display only cities belonging to the selected state.
- Initially show a placeholder: "Select city".

## Location Data

Use the following data:

India:

- Karnataka: Bengaluru, Mysuru
- Maharashtra: Mumbai, Pune

United States:

- California: Los Angeles, San Francisco
- Texas: Austin, Dallas

Canada:

- Ontario: Toronto, Ottawa
- Quebec: Montreal, Quebec City

## Dependent Selection Behavior

- Selecting a country must populate its corresponding states.
- Changing the country must reset the selected state and city.
- Selecting a state must populate its corresponding cities.
- Changing the state must reset the selected city.
- The city options must always correspond to the selected state.
- The state and city selects must become enabled only when their
  respective parent selections are available.
- Selecting a different parent option must never preserve an invalid
  child selection.

## Selection Summary

Display the currently selected country, state, and city.

Show "Not selected" for any field without a selection.

The summary must update whenever a selection changes.

## Required Test IDs

Use these exact test IDs:

- `country-select`
- `state-select`
- `city-select`
- `selection-summary`

## Implementation Constraints

- Use React state to manage selections.
- Use native HTML select elements.
- Implement the UI in `src/App.jsx`.
- Export the main component using a named export:

  `export function App()`

- Do not add external dependencies.
- Keep styling inside the main component.

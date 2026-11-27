# Country, State, and City Dependent Selects

## Overview

This benchmark evaluates the implementation of dependent select fields
using React state management.

The application contains three hierarchical selections:

1. Country
2. State
3. City

Each selection determines the available options in the next field.

## Objective

Implement a location selection form that correctly manages dependencies
between country, state, and city selections.

## Feature Requirements

- Display country, state, and city select fields.
- Populate state options based on the selected country.
- Populate city options based on the selected state.
- Disable dependent fields until their parent selection is available.
- Reset dependent selections when a parent selection changes.
- Display the currently selected location.
- Prevent invalid parent-child selection combinations.

## Location Dataset

| Country       | State       | Cities                     |
| ------------- | ----------- | -------------------------- |
| India         | Karnataka   | Bengaluru, Mysuru          |
| India         | Maharashtra | Mumbai, Pune               |
| United States | California  | Los Angeles, San Francisco |
| United States | Texas       | Austin, Dallas             |
| Canada        | Ontario     | Toronto, Ottawa            |
| Canada        | Quebec      | Montreal, Quebec City      |

## Technical Requirements

- Starter: `react-js`
- Framework: React
- Language: JavaScript
- Main implementation: `src/App.jsx`
- Main component: Named export `App`
- State management: React `useState`
- UI controls: Native HTML select elements

## Required Test IDs

| Element           | Test ID             |
| ----------------- | ------------------- |
| Country select    | `country-select`    |
| State select      | `state-select`      |
| City select       | `city-select`       |
| Selection summary | `selection-summary` |

## Validation

Run the following commands from the repository root:

```bash
pnpm case:dry-run frontend-dependent-select-fields-react
```

Build a registration form with conditional fields based on the
selected account type.

### Requirements

1. Account Type
   - Provide an account type selector with Individual and Business options.
   - Use `data-testid="account-type"`.

2. Common Fields
   - Full Name (required).
   - Email Address (required).

3. Conditional Business Fields
   - When Business is selected, display a business section.
   - Include Company Name (required).
   - Include Tax ID (required).
   - Wrap these fields in an element with
     `data-testid="business-fields"`.

4. Conditional Behavior
   - Business fields must remain hidden for Individual accounts.
   - Switching from Business to Individual must hide the business fields.
   - Clear business field values when switching to Individual.

5. Validation
   - Validate all required visible fields on submission.
   - Business fields must only be validated when Business is selected.
   - Display appropriate inline validation messages.
   - Clear field-specific errors when the user corrects the input.

6. Submission
   - Display a success message when all required fields are valid.
   - Do not display the success message when validation fails.

### Implementation

Implement the complete functionality in `src/App.jsx`.

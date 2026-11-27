# Next.js Intercepting Route Modal

Build a photo gallery using the Next.js App Router. When a user opens a photo from the gallery, display its detail page inside a modal while keeping the gallery visible behind it.

Implement the application using the `next-js` starter.

## Gallery

- Display at least three photo cards.
- Each card must have a title and a link to its detail page.
- Each photo must have a unique ID.
- Opening a photo must update the browser URL to `/photos/[id]`.

## Intercepting modal behavior

- When a user navigates to a photo from the gallery using client-side navigation, intercept the photo route and display its content in a modal.
- Keep the gallery visible behind the modal.
- The modal must display the selected photo's title and details.
- Provide a Close button.
- Pressing Escape must close the modal.
- Closing the modal must return the user to the gallery and restore the gallery URL.
- The modal must expose `role="dialog"` and `aria-modal="true"`.

## Direct navigation behavior

- Opening `/photos/[id]` directly in the browser must display a full-page photo detail view, not a modal.
- Refreshing a photo detail URL must continue to display the full-page detail view.
- Provide a link from the full-page detail view back to the gallery.

## Invalid photo IDs

- An unknown photo ID must display Next.js's not-found page rather than an empty modal or broken detail view.

## Required test IDs

Use these exact test IDs:

- `photo-gallery` — gallery container
- `photo-link` — each photo navigation link
- `photo-modal` — modal container
- `close-modal` — modal close button
- `photo-detail-page` — full-page photo detail container

## Implementation constraints

- Use the Next.js App Router and its intercepting route and parallel route capabilities.
- Implement the application in the `app/` directory.
- Use client components only where browser interactions or client-side navigation behavior require them.
- Do not use third-party modal or routing libraries.
- Keep styling inline in the relevant components; do not create separate CSS files.

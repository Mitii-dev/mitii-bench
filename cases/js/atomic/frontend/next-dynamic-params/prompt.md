Build a product detail page using Next.js App Router dynamic segments and `useParams`.

* **URL**: `/products/[id]` (App Router dynamic route)
* **Component**: Reads `id` from the URL and renders "Product Details for ID: [id]" (`data-testid="product-detail"`).

Use `app/products/[id]/page.js` (or equivalent) and `next/navigation` `useParams` (client) or the page `params` prop.

For `base-next-js`, implement the UI in `app/page.js` as a client component (`"use client"`).

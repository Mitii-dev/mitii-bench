# Site nav + footer pages

## Goal

Top nav: **Home**, **About**, **Careers**.  
Footer: **Terms and Conditions**, **Privacy Policy**.  
Each destination shows dummy content when opened.

## Ecosystem

`js` — bases under `fixtures/js/`.

## Bases (matrix)

| Base | Approach |
|---|---|
| `base-react-js` | Client-side views in `src/App.jsx` |
| `base-next-js` | App Router pages under `app/` |

```bash
pnpm case:dry-run frontend-site-nav-pages-react
pnpm case:dry-run frontend-site-nav-pages-react@base-react-js
```

## How we grade

- Per-base source asserts for nav/footer labels + page content markers
- `npm run build`

`solution/` is only for dry-run (apply known-good files → run grades). Agent evals never compare to it. See [docs/AUTHORING.md](../../../../../docs/AUTHORING.md).

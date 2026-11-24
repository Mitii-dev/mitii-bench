# Single Sign-On (SSO) SAML Identity Provider Consumer

## Goal

Build a SAML 2.0 consumer authentication endpoint validating incoming SAML Assertions from an identity provider (e.g., Okta/Ping).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `passport-saml`

```bash
pnpm case:dry-run backend-saml-sso-consumer
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)

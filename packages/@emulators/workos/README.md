# @emulators/workos

WorkOS emulation backed by [@workos/emulate](https://github.com/workos/emulate) (WorkOS's own emulator), run in-process behind emulate's port so `emulate run` starts, resets, and stops it like the other services. API paths are served at the root, as on `api.workos.com`.

## Seed

The `workos:` block takes @workos/emulate's seed format (`users`, `organizations`, `roles`, `permissions`, `apiKeys`, `connections`, `invitations`, `webhookEndpoints`, ...) plus its `issuer`, `signingKey`, `allowedRedirectHosts`, and `interactiveAuth` options. The default API key is `sk_test_default`.

```yaml
workos:
  users:
    - { id: user_dev, email: dev@example.com, first_name: Dev, email_verified: true }
  organizations:
    - name: Example Org
env:
  WORKOS_API_HOSTNAME: localhost
  WORKOS_API_PORT: "{workos.port}"
  WORKOS_API_HTTPS: "false"
  WORKOS_API_KEY: sk_test_default
  WORKOS_CLIENT_ID: client_local
```

## AuthKit

`GET /user_management/authorize` redirects straight back with a code: with no `login_hint` it signs in the first seeded user, a `login_hint` matches an email case-insensitively, and an unknown hint redirects with `error=user_not_found`. `POST /user_management/authenticate` handles `authorization_code` and `refresh_token`, access tokens verify against `GET /sso/jwks/:client_id`, and `GET /user_management/sessions/logout` redirects to `return_to`. Token `iss` defaults to this service's URL. A reset starts a fresh instance, so earlier sessions and refresh tokens end. See the [@workos/emulate supported features](https://github.com/workos/emulate/blob/main/SUPPORTED.md) for the full surface.

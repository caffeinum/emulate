---
name: emulate-setup
description: Wire an existing project to run fully offline against emulate. Use when asked to set up emulate in a repo, run an app or its tests without real third-party APIs or keys, replace .env secrets with local emulators, or create an emulate.config.yaml with an env block and `npx emulate run`.
allowed-tools: Bash(npx emulate:*)
---

# Set up a project to run against emulate

Goal: one committed `emulate.config.yaml` that seeds every third-party service the app uses and maps the app's environment variables onto them, so `npx emulate run -- <dev or test command>` runs the app with no real credentials and no outside network.

## 1. Work where no secrets exist

Create a worktree (`git worktree add ../<repo>-emulate -b emulate-local`) and confirm it has no `.env`, `.env.local`, or `.env.*.local` files. Frameworks load those files themselves, so any key left in them bypasses emulate.

## 2. Inventory every external dependency

List every variable the app reads: `.env.example`, `process.env.` / `import.meta.env.` in code, framework config, CI files. For each, record what it is (API base URL, API key or secret, webhook secret, OAuth client, database URL, unrelated setting) and which service it belongs to. Also find hosts the code calls without a variable (`api.stripe.com`, `api.github.com`, `api.telegram.org`, SDK defaults).

## 3. Classify each service

- A built-in emulator exists (`npx emulate list`): use it.
- No emulator: write a custom one (see the custom-apis skill), or keep a local container for databases and caches.
- Cannot be emulated (a hosting runtime, a browser-only feature): note it and stub around it.

## 4. Write emulate.config.yaml

```yaml
github:
  users: [{ login: octocat }]
stripe: {}
env:
  GITHUB_API_URL: "{github.url}"                  # emulator url, port, or host
  STRIPE_SECRET_KEY: sk_test_emulate               # literal
  SLACK_SIGNING_SECRET: "{slack.signing_secret}"   # a value from that service's seed
  OPENAI_API_KEY: "${OPENAI_API_KEY:-sk-fake}"     # from the shell, with a default
  DATABASE_URL: postgres://postgres:postgres@localhost:5432/app
prepare: docker compose up -d --wait   # optional: after emulators start, before the command
cleanup: docker compose down           # optional: after the command exits
```

Put every variable from step 2 in `env`. `emulate run` passes only that block plus `PATH`, `HOME`, `USER`, `SHELL`, `TERM`, `TMPDIR`, `LANG`, `NODE_OPTIONS`, and `CI`, so anything missing is simply absent. Seed the users, repos, channels, products, and webhooks the app expects; each service's skill lists its seed fields.

## 5. Make hardcoded hosts configurable

Where code or an SDK default points at a real host, read a base URL from an env variable instead and map it in `env`. Usually this is the only code change. Check file download URLs and OAuth endpoints too, not just the main API client.

## 6. Add scripts and prove it works

```json
"dev:emulated": "emulate run --port 0 -- next dev",
"test:emulated": "emulate run --port 0 -- bun test"
```

Run the app's main flows through `emulate run`. Assert the emulators saw the calls with `GET {service.url}/_emulate/requests`, and add `strict_tokens: true` to a service when a test needs unknown tokens rejected. Report what works, what is stubbed, and which services have no emulator.

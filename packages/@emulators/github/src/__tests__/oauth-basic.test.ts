import { expect, it } from "vitest";
import { Hono, Store, WebhookDispatcher, authMiddleware, type TokenMap } from "@emulators/core";
import { githubPlugin, seedFromConfig } from "../index.js";

const base = "http://localhost:4000";

async function exchange(headers: Record<string, string>, body: Record<string, string>) {
  const store = new Store();
  const tokenMap: TokenMap = new Map();
  const app = new Hono();
  app.use("*", authMiddleware(tokenMap));
  githubPlugin.register(app as any, store, new WebhookDispatcher(), base, tokenMap);
  githubPlugin.seed?.(store, base);
  seedFromConfig(store, base, {
    users: [{ login: "octocat" }],
    oauth_apps: [{ client_id: "Iv1 app", client_secret: "s3:cret", name: "App", redirect_uris: ["http://app/cb"] }],
  });
  const callback = await app.request(`${base}/login/oauth/callback`, {
    method: "POST",
    body: new URLSearchParams({ login: "octocat", redirect_uri: "http://app/cb", client_id: "Iv1 app", state: "x" }),
  });
  const code = new URL(callback.headers.get("Location")!).searchParams.get("code")!;
  const response = await app.request(`${base}/login/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", ...headers },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: "http://app/cb", ...body }),
  });
  return (await response.json()) as Record<string, string>;
}

const basic = (id: string, secret: string) =>
  `Basic ${Buffer.from(`${encodeURIComponent(id)}:${encodeURIComponent(secret)}`).toString("base64")}`;

it("accepts client credentials in an HTTP Basic header, form-encoded per RFC 6749", async () => {
  expect(await exchange({ Authorization: basic("Iv1 app", "s3:cret") }, {})).toMatchObject({
    access_token: expect.any(String),
  });
  expect(await exchange({ Authorization: basic("Iv1 app", "wrong") }, {})).toMatchObject({
    error: "incorrect_client_credentials",
  });
  expect(await exchange({}, { client_id: "Iv1 app", client_secret: "s3:cret" })).toMatchObject({
    access_token: expect.any(String),
  });
});

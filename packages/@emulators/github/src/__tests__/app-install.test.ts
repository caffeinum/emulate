import { generateKeyPairSync } from "crypto";
import { describe, expect, it } from "vitest";
import {
  Hono,
  Store,
  WebhookDispatcher,
  authMiddleware,
  createApiErrorHandler,
  createErrorHandler,
  type TokenMap,
} from "@emulators/core";
import { githubPlugin, seedFromConfig } from "../index.js";

const base = "http://localhost:4000";
const callbackUrl = "http://app.test/api/github/setup";
const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs1", format: "pem" },
  publicKeyEncoding: { type: "pkcs1", format: "pem" },
});

function createTestApp(appOverrides: Record<string, unknown> = {}) {
  const store = new Store();
  const tokenMap: TokenMap = new Map();
  const app = new Hono();
  app.onError(createApiErrorHandler());
  app.use("*", createErrorHandler());
  app.use("*", authMiddleware(tokenMap));
  githubPlugin.register(app as any, store, new WebhookDispatcher(), base, tokenMap);
  githubPlugin.seed?.(store, base);
  seedFromConfig(store, base, {
    users: [{ login: "octocat" }, { login: "hubot" }],
    orgs: [
      {
        login: "acme",
        members: [
          { login: "octocat", role: "admin" },
          { login: "hubot", role: "member" },
        ],
      },
    ],
    apps: [
      {
        app_id: 1001,
        slug: "firegoat",
        name: "Firegoat",
        private_key: privateKey,
        permissions: { contents: "read" },
        client_id: "Iv1.firegoat",
        client_secret: "app-secret",
        callback_url: callbackUrl,
        ...appOverrides,
      },
    ],
  });
  return { app, store, tokenMap };
}

type TestApp = ReturnType<typeof createTestApp>["app"];

async function install(app: TestApp, login: string, account: string, state = "st-123") {
  const response = await app.request(`${base}/apps/firegoat/installations/new`, {
    method: "POST",
    body: new URLSearchParams({ login, account, state }),
  });
  expect(response.status).toBe(302);
  return new URL(response.headers.get("Location")!);
}

async function exchange(app: TestApp, body: Record<string, string>) {
  const response = await app.request(`${base}/login/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(body),
  });
  return (await response.json()) as Record<string, string | number>;
}

async function userInstallations(app: TestApp, token: string, query = "") {
  const response = await app.request(`${base}/user/installations${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: response.status,
    link: response.headers.get("Link"),
    body: (await response.json()) as { total_count: number; installations: Array<Record<string, any>> },
  };
}

const appCredentials = { client_id: "Iv1.firegoat", client_secret: "app-secret" };

describe("GitHub App install flow", () => {
  it("walks the install link from user and account pickers to the callback with state", async () => {
    const { app } = createTestApp();

    const userPicker = await app.request(`${base}/apps/firegoat/installations/new?state=st-123`);
    expect(userPicker.status).toBe(200);
    const userPage = await userPicker.text();
    expect(userPage).toContain("Install Firegoat");
    expect(userPage).toContain('name="state" value="st-123"');

    const accountPicker = await app.request(`${base}/apps/firegoat/installations/new`, {
      method: "POST",
      body: new URLSearchParams({ login: "octocat", state: "st-123" }),
    });
    const accountPage = await accountPicker.text();
    expect(accountPage).toContain('name="account" value="octocat"');
    expect(accountPage).toContain('name="account" value="acme"');

    const redirect = await install(app, "octocat", "octocat");
    expect(`${redirect.origin}${redirect.pathname}`).toBe(callbackUrl);
    expect(redirect.searchParams.get("setup_action")).toBe("install");
    expect(redirect.searchParams.get("state")).toBe("st-123");
    expect(redirect.searchParams.get("installation_id")).toMatch(/^\d+$/);
    expect(redirect.searchParams.get("code")).toBeTruthy();
  });

  it("exchanges the install code for an expiring ghu_ token that lists the installation", async () => {
    const { app } = createTestApp();
    const redirect = await install(app, "octocat", "octocat");

    const token = await exchange(app, { ...appCredentials, code: redirect.searchParams.get("code")! });
    expect(token).toMatchObject({ token_type: "bearer", expires_in: 28800, refresh_token_expires_in: 15897600 });
    expect(String(token.access_token)).toMatch(/^ghu_/);
    expect(String(token.refresh_token)).toMatch(/^ghr_/);

    const { status, body } = await userInstallations(app, String(token.access_token));
    expect(status).toBe(200);
    expect(body.total_count).toBe(1);
    expect(body.installations[0]).toMatchObject({
      id: Number(redirect.searchParams.get("installation_id")),
      app_slug: "firegoat",
      account: { login: "octocat", type: "User" },
    });
  });

  it("rejects app codes exchanged without the app's client credentials", async () => {
    const { app } = createTestApp();
    const code = (await install(app, "octocat", "octocat")).searchParams.get("code")!;

    expect(await exchange(app, { client_id: "Iv1.firegoat", client_secret: "wrong", code })).toMatchObject({
      error: "incorrect_client_credentials",
    });
    expect(await exchange(app, { client_id: "someone-else", client_secret: "x", code })).toMatchObject({
      error: "bad_verification_code",
    });
  });

  it("installs on an org the user owns and pages /user/installations with a Link header", async () => {
    const { app } = createTestApp();
    await install(app, "octocat", "octocat");
    const orgRedirect = await install(app, "octocat", "acme");
    expect(orgRedirect.searchParams.get("setup_action")).toBe("install");

    const token = await exchange(app, { ...appCredentials, code: orgRedirect.searchParams.get("code")! });
    const first = await userInstallations(app, String(token.access_token), "?per_page=1");
    expect(first.body.total_count).toBe(2);
    expect(first.body.installations).toHaveLength(1);
    expect(first.link).toContain('rel="next"');

    const second = await userInstallations(app, String(token.access_token), "?per_page=1&page=2");
    expect(second.body.installations[0].account).toMatchObject({ login: "acme", type: "Organization" });
  });

  it("sends an org member back with setup_action=request and no installation_id", async () => {
    const { app } = createTestApp();
    const redirect = await install(app, "hubot", "acme", "st-request");
    expect(redirect.searchParams.get("setup_action")).toBe("request");
    expect(redirect.searchParams.get("state")).toBe("st-request");
    expect(redirect.searchParams.has("installation_id")).toBe(false);
    expect(redirect.searchParams.get("code")).toBeTruthy();

    const token = await exchange(app, { ...appCredentials, code: redirect.searchParams.get("code")! });
    expect((await userInstallations(app, String(token.access_token))).body.total_count).toBe(0);
  });

  it("reports a reinstall as setup_action=update without a code once the user has authorized", async () => {
    const { app } = createTestApp();
    const first = await install(app, "octocat", "octocat");
    await exchange(app, { ...appCredentials, code: first.searchParams.get("code")! });

    const again = await install(app, "octocat", "octocat", "st-again");
    expect(again.searchParams.get("setup_action")).toBe("update");
    expect(again.searchParams.get("installation_id")).toBe(first.searchParams.get("installation_id"));
    expect(again.searchParams.get("state")).toBe("st-again");
    expect(again.searchParams.has("code")).toBe(false);
  });

  it("rotates the refresh token and rejects the used one", async () => {
    const { app } = createTestApp();
    const code = (await install(app, "octocat", "octocat")).searchParams.get("code")!;
    const token = await exchange(app, { ...appCredentials, code });

    const refreshed = await exchange(app, {
      ...appCredentials,
      grant_type: "refresh_token",
      refresh_token: String(token.refresh_token),
    });
    expect(String(refreshed.access_token)).toMatch(/^ghu_/);
    expect(refreshed.refresh_token).not.toBe(token.refresh_token);

    expect(
      await exchange(app, {
        ...appCredentials,
        grant_type: "refresh_token",
        refresh_token: String(token.refresh_token),
      }),
    ).toMatchObject({ error: "bad_refresh_token" });
  });

  it("refuses an install on an org the user does not belong to", async () => {
    const { app, store } = createTestApp();
    seedFromConfig(store, base, { orgs: [{ login: "other" }] });
    const response = await app.request(`${base}/apps/firegoat/installations/new`, {
      method: "POST",
      body: new URLSearchParams({ login: "hubot", account: "other", state: "x" }),
    });
    expect(response.status).toBe(403);
  });

  it("fails the seed when an app sets client_id without client_secret", () => {
    expect(() => createTestApp({ slug: "half", client_secret: undefined })).toThrow(/client_id without client_secret/);
  });
});

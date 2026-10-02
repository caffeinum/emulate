import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createServer, serve } from "@emulators/core";
import { seedFromConfig, workosPlugin } from "../index.js";

const CLIENT_ID = "client_test";
const REDIRECT = "http://localhost:3000/callback";
let url: string;
let close: () => Promise<void>;
let reseed: () => void;

beforeEach(async () => {
  const server = createServer(workosPlugin, { port: 0, baseUrl: "https://workos.emulate.localhost" });
  reseed = () => {
    server.store.reset();
    workosPlugin.seed?.(server.store, "");
    seedFromConfig(server.store, "", {
      users: [
        { id: "user_first", email: "First@Example.com", first_name: "First", email_verified: true },
        { id: "user_second", email: "second@example.com", first_name: "Second", email_verified: true },
      ],
    });
  };
  reseed();
  const http = serve({ fetch: server.app.fetch, port: 0, hostname: "127.0.0.1" }) as unknown as Server;
  await new Promise<void>((resolve) => (http.listening ? resolve() : http.once("listening", () => resolve())));
  url = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;
  close = async () => {
    await server.close();
    http.closeAllConnections();
    await new Promise<void>((resolve) => http.close(() => resolve()));
  };
});

afterEach(() => close());

async function authorize(loginHint?: string) {
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    provider: "authkit",
    state: "s1",
    ...(loginHint ? { login_hint: loginHint } : {}),
  });
  const response = await fetch(`${url}/user_management/authorize?${query}`, { redirect: "manual" });
  expect(response.status).toBe(302);
  return new URL(response.headers.get("location")!);
}

async function authenticate(body: Record<string, string>) {
  const response = await fetch(`${url}/user_management/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer sk_test_default" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: "sk_test_default", ...body }),
  });
  return (await response.json()) as Record<string, any>;
}

it("signs in the first seeded user, a hinted user case-insensitively, and refuses unknown hints", async () => {
  const first = await authorize();
  expect(first.origin + first.pathname).toBe(REDIRECT);
  expect(first.searchParams.get("state")).toBe("s1");
  expect(
    (await authenticate({ grant_type: "authorization_code", code: first.searchParams.get("code")! })).user,
  ).toMatchObject({
    id: "user_first",
  });

  const hinted = await authorize("SECOND@example.com");
  expect(
    (await authenticate({ grant_type: "authorization_code", code: hinted.searchParams.get("code")! })).user,
  ).toMatchObject({
    id: "user_second",
  });

  expect((await authorize("nobody@example.com")).searchParams.get("error")).toBe("user_not_found");
});

it("issues tokens verifiable with the JWKS, refreshes them, and logs out", async () => {
  const code = (await authorize()).searchParams.get("code")!;
  const auth = await authenticate({ grant_type: "authorization_code", code });
  expect(auth).toMatchObject({ access_token: expect.any(String), refresh_token: expect.any(String) });

  const [header, payload] = auth.access_token
    .split(".")
    .slice(0, 2)
    .map((part: string) => JSON.parse(Buffer.from(part, "base64url").toString()));
  expect(payload.iss).toBe(`https://workos.emulate.localhost/user_management/${CLIENT_ID}`);
  const jwks = (await (await fetch(`${url}/sso/jwks/${CLIENT_ID}`)).json()) as { keys: Array<{ kid: string }> };
  expect(jwks.keys.map((key) => key.kid)).toContain(header.kid);

  const refreshed = await authenticate({ grant_type: "refresh_token", refresh_token: auth.refresh_token });
  expect(refreshed).toMatchObject({ access_token: expect.any(String), user: { id: "user_first" } });

  const logout = await fetch(
    `${url}/user_management/sessions/logout?session_id=${payload.sid}&return_to=${encodeURIComponent("http://localhost:3000/")}`,
    { redirect: "manual" },
  );
  expect(logout.status).toBe(302);
  expect(logout.headers.get("location")).toBe("http://localhost:3000/");
});

it("starts a fresh instance on reset", async () => {
  const before = await authenticate({
    grant_type: "authorization_code",
    code: (await authorize()).searchParams.get("code")!,
  });
  reseed();
  const stale = await authenticate({ grant_type: "refresh_token", refresh_token: before.refresh_token });
  expect(stale.access_token).toBeUndefined();
  expect((await authorize()).searchParams.get("code")).toEqual(expect.any(String));
});

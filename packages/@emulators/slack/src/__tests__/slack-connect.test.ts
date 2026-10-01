import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Hono,
  Store,
  WebhookDispatcher,
  authMiddleware,
  createApiErrorHandler,
  createErrorHandler,
} from "@emulators/core";
import type { AppEnv, TokenMap } from "@emulators/core";
import { seedFromConfig, slackPlugin, type SlackSeedConfig } from "../index.js";
import { captureFetchRequests, slackTestBaseUrl as base } from "./helpers.js";

const connectSeed: SlackSeedConfig = {
  team: { id: "THOME00001", name: "Home Co", domain: "home" },
  teams: [{ id: "TPARTNER01", name: "Partner Inc", domain: "partner" }],
  users: [
    { id: "UHOMEUSER1", name: "home-user", email: "home@home.example" },
    { id: "UPARTNER01", name: "partner-user", team: "TPARTNER01", email: "pat@partner.example" },
  ],
  oauth_apps: [
    {
      client_id: "home.app",
      client_secret: "secret",
      name: "Home Bot",
      redirect_uris: ["http://localhost/callback"],
      bot_id: "BHOMEBOT01",
      bot_user_id: "UHOMEBOT01",
      bot_name: "homebot",
    },
  ],
  channels: [
    { id: "CSHARED001", name: "partner-shared", shared_with: ["TPARTNER01"] },
    { id: "CHOMEONLY1", name: "home-only" },
    {
      id: "CSHAREDBOT",
      name: "shared-with-bot",
      shared_with: ["partner"],
      members: ["home-user", "partner-user", "homebot"],
    },
  ],
  tokens: [
    {
      token: "xoxb-home-bot",
      type: "bot",
      user: "homebot",
      bot_id: "BHOMEBOT01",
      bot_user_id: "UHOMEBOT01",
      app_id: undefined,
    },
    { token: "xoxp-partner-user", type: "user", user: "partner-user" },
  ],
  event_subscriptions: [{ url: "https://home.example/slack/events" }],
};

function createConnectApp() {
  const store = new Store();
  const webhooks = new WebhookDispatcher();
  const tokenMap: TokenMap = new Map();
  const app = new Hono<AppEnv>();
  app.onError(createApiErrorHandler());
  app.use("*", createErrorHandler());
  app.use("*", (authMiddleware as (tokens: TokenMap) => ReturnType<typeof authMiddleware>)(tokenMap));
  slackPlugin.register!(app, store, webhooks, base, tokenMap);
  slackPlugin.seed?.(store, base);
  seedFromConfig(store, base, connectSeed, webhooks);
  const call = async (token: string, method: string, body: Record<string, unknown> = {}) => {
    const res = await app.request(`${base}/api/${method}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as Record<string, any>;
  };
  return { call };
}

describe("Slack Connect shared channels", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports the home team for the home bot token", async () => {
    const { call } = createConnectApp();
    const auth = await call("xoxb-home-bot", "auth.test");
    expect(auth).toMatchObject({ ok: true, team_id: "THOME00001", user_id: "UHOMEBOT01" });
  });

  it("returns shared team ids for shared channels and none for home-only channels", async () => {
    const { call } = createConnectApp();
    const shared = await call("xoxb-home-bot", "conversations.info", { channel: "CSHARED001" });
    expect(shared.channel).toMatchObject({
      id: "CSHARED001",
      is_shared: true,
      is_ext_shared: true,
      shared_team_ids: ["TPARTNER01"],
      connected_team_ids: ["THOME00001", "TPARTNER01"],
      context_team_id: "THOME00001",
    });
    const homeOnly = await call("xoxb-home-bot", "conversations.info", { channel: "CHOMEONLY1" });
    expect(homeOnly.channel).toMatchObject({ is_shared: false, is_ext_shared: false });
    expect(homeOnly.channel.shared_team_ids).toBeUndefined();
  });

  it("returns the partner team and email for partner users", async () => {
    const { call } = createConnectApp();
    const info = await call("xoxb-home-bot", "users.info", { user: "UPARTNER01" });
    expect(info.user).toMatchObject({
      id: "UPARTNER01",
      team_id: "TPARTNER01",
      profile: { email: "pat@partner.example" },
    });
  });

  it("only adds users from member teams to seeded channel members", async () => {
    const { call } = createConnectApp();
    const homeOnly = await call("xoxb-home-bot", "conversations.members", { channel: "CHOMEONLY1" });
    const shared = await call("xoxb-home-bot", "conversations.members", { channel: "CSHARED001" });
    expect(homeOnly.members).not.toContain("UPARTNER01");
    expect(shared.members).toEqual(expect.arrayContaining(["UHOMEUSER1", "UPARTNER01"]));
  });

  it("delivers partner mentions in shared channels to the home workspace", async () => {
    const { call } = createConnectApp();
    const capture = captureFetchRequests();

    const posted = await call("xoxp-partner-user", "chat.postMessage", {
      channel: "CSHAREDBOT",
      text: "<@UHOMEBOT01> can you help?",
    });
    expect(posted.ok).toBe(true);

    const bodies = capture.jsonBodies() as Array<Record<string, any>>;
    expect(bodies.map((body) => body.event.type)).toEqual(["message", "app_mention"]);
    for (const body of bodies) {
      expect(body).toMatchObject({
        type: "event_callback",
        team_id: "THOME00001",
        is_ext_shared_channel: true,
        event: {
          user: "UPARTNER01",
          team: "TPARTNER01",
          user_team: "TPARTNER01",
          source_team: "TPARTNER01",
          channel: "CSHAREDBOT",
          text: "<@UHOMEBOT01> can you help?",
          ts: posted.ts,
        },
      });
    }
    expect(bodies[0]!.event.channel_type).toBe("channel");
  });

  it("skips app_mention when the home bot is not in the shared channel", async () => {
    const { call } = createConnectApp();
    const capture = captureFetchRequests();

    const posted = await call("xoxp-partner-user", "chat.postMessage", {
      channel: "CSHARED001",
      text: "<@UHOMEBOT01> hi",
    });
    expect(posted.ok).toBe(true);
    expect((capture.jsonBodies() as Array<Record<string, any>>).map((body) => body.event.type)).toEqual(["message"]);
  });

  it("lets the home bot post into the shared channel", async () => {
    const { call } = createConnectApp();
    const capture = captureFetchRequests();

    const posted = await call("xoxb-home-bot", "chat.postMessage", { channel: "CSHAREDBOT", text: "on it" });
    expect(posted).toMatchObject({ ok: true, channel: "CSHAREDBOT" });
    expect(capture.jsonBodies()[0]).toMatchObject({
      team_id: "THOME00001",
      event: { type: "message", user: "UHOMEBOT01", team: "THOME00001", user_team: "THOME00001" },
    });
  });

  it("rejects seed references to unknown teams and members", () => {
    const store = new Store();
    slackPlugin.seed?.(store, base);
    expect(() => seedFromConfig(store, base, { users: [{ name: "ghost", team: "TNOPE" }] })).toThrow(
      "Slack seed user ghost references unknown team TNOPE",
    );
    expect(() => seedFromConfig(store, base, { channels: [{ name: "x", members: ["nobody"] }] })).toThrow(
      "Slack seed channel x lists unknown member nobody",
    );
  });
});

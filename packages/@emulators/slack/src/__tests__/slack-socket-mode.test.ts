import { afterEach, expect, it } from "vitest";
import WebSocket from "ws";
import { LogLevel, SocketModeClient } from "@slack/socket-mode";
import { seedFromConfig } from "../index.js";
import { startSlackTestEmulator, type SlackTestEmulator } from "./helpers.js";

let emulator: SlackTestEmulator;
afterEach(() => emulator.close());

async function start() {
  emulator = await startSlackTestEmulator(({ store, webhooks }) =>
    seedFromConfig(
      store,
      "",
      {
        oauth_apps: [
          {
            client_id: "relay.client",
            client_secret: "secret",
            name: "Relay",
            redirect_uris: [],
            app_id: "A0RELAY",
            bot_id: "B0RELAY",
            bot_user_id: "U0RELAYBOT",
          },
        ],
        tokens: [
          { token: "xapp-1-relay", type: "app", app_id: "A0RELAY" },
          { token: "xoxb-relay", type: "bot", bot_id: "B0RELAY", user_id: "U0RELAYBOT" },
        ],
      },
      webhooks,
    ),
  );
  const call = async (method: string, token: string, body: Record<string, unknown> = {}) =>
    (await (
      await fetch(`${emulator.url}/api/${method}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ).json()) as any;
  const state = async () => (await (await fetch(`${emulator.url}/_slack/socket_mode`)).json()) as any;
  return { call, state };
}

const until = async (check: () => Promise<boolean> | boolean) => {
  for (let i = 0; i < 100; i++) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("timed out");
};

it("delivers events to the Slack SDK socket client, tracks acks, and reconnects on refresh_requested", async () => {
  const { call, state } = await start();
  const client = new SocketModeClient({
    appToken: "xapp-1-relay",
    logLevel: LogLevel.ERROR,
    clientPingTimeout: 50,
    clientOptions: { slackApiUrl: `${emulator.url}/api/` },
  });
  const received: any[] = [];
  client.on("message", async ({ event, body, ack }) => {
    received.push({ event, body });
    if (event.text !== "do not ack") await ack();
  });
  client.on("reaction_added", async ({ ack }) => ack());
  await client.start();
  try {
    const posted = await call("chat.postMessage", "xoxb-relay", { channel: "C000000001", text: "hello socket" });
    await call("chat.postMessage", "xoxb-relay", { channel: "C000000001", text: "do not ack" });
    await until(() => received.length === 2);
    expect(received[0].body).toMatchObject({ type: "event_callback", api_app_id: "A0RELAY" });
    expect(received[0].event).toMatchObject({ type: "message", text: "hello socket", channel: "C000000001" });
    await until(async () => (await state()).unacked.length === 1);

    const before = (await state()).connections;
    expect(before).toEqual([expect.objectContaining({ app_id: "A0RELAY" })]);
    const disconnect = await fetch(`${emulator.url}/_slack/socket_mode/disconnect`, { method: "POST" });
    expect(await disconnect.json()).toEqual({ disconnected: 1 });
    await until(async () => {
      const now = (await state()).connections;
      return now.length === 1 && now[0].id !== before[0].id;
    });

    await call("chat.update", "xoxb-relay", { channel: "C000000001", ts: posted.ts, text: "edited" });
    await until(() => received.length === 3);
    expect(received[2].event).toMatchObject({ subtype: "message_changed", message: { text: "edited" } });
  } finally {
    await client.disconnect();
  }
});

it("rejects other token types and unknown tickets, and sends hello then disconnect frames", async () => {
  const { call } = await start();
  expect(await call("apps.connections.open", "xoxb-relay")).toEqual({ ok: false, error: "not_allowed_token_type" });
  expect(await call("apps.connections.open", "xapp-1-unknown")).toEqual({ ok: false, error: "invalid_auth" });

  const { url } = await call("apps.connections.open", "xapp-1-relay");
  await expect(
    new Promise((resolve, reject) => {
      const bad = new WebSocket(url.replace(/ticket=[^&]+/, "ticket=nope"));
      bad.on("open", resolve);
      bad.on("error", reject);
    }),
  ).rejects.toThrow("401");

  const socket = new WebSocket(url);
  const frames: any[] = [];
  const closed = new Promise((resolve) => socket.on("close", resolve));
  socket.on("message", (data) => frames.push(JSON.parse(String(data))));
  await until(() => frames.length === 1);
  expect(frames[0]).toMatchObject({ type: "hello", num_connections: 1, connection_info: { app_id: "A0RELAY" } });
  await expect(
    new Promise((resolve, reject) => {
      const reused = new WebSocket(url);
      reused.on("open", resolve);
      reused.on("error", reject);
    }),
  ).rejects.toThrow("401");

  await fetch(`${emulator.url}/_slack/socket_mode/disconnect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "link_disabled" }),
  });
  await closed;
  expect(frames[1]).toMatchObject({ type: "disconnect", reason: "link_disabled" });
});

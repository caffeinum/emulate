import { expect, it } from "vitest";
import { seedFromConfig } from "../index.js";
import {
  authHeaders,
  captureFetchRequests,
  createSlackTestApp,
  registerSlackEventSubscription,
  slackTestBaseUrl as base,
} from "./helpers.js";

function setup(config: Parameters<typeof seedFromConfig>[2] = {}) {
  const { app, store, webhooks } = createSlackTestApp();
  seedFromConfig(store, base, config, webhooks);
  const call = async (method: string, body: Record<string, unknown> = {}, token?: string) =>
    (await (
      await app.request(`${base}/api/${method}`, {
        method: "POST",
        headers: token ? { ...authHeaders(), Authorization: `Bearer ${token}` } : authHeaders(),
        body: JSON.stringify(body),
      })
    ).json()) as any;
  return { call, webhooks };
}

it("lists seeded emoji and announces admin changes as emoji_changed", async () => {
  const { call, webhooks } = setup({ emoji: { party: "https://img.test/party.gif", tada: "alias:party" } });
  expect((await call("emoji.list")).emoji).toEqual({ party: "https://img.test/party.gif", tada: "alias:party" });

  registerSlackEventSubscription(webhooks, ["emoji_changed"]);
  const { jsonBodies } = captureFetchRequests();
  expect(await call("admin.emoji.add", { name: "ship", url: "https://img.test/ship.png" })).toEqual({ ok: true });
  expect((await call("admin.emoji.add", { name: "ship", url: "x" })).error).toBe("error_name_taken");
  expect((await call("admin.emoji.addAlias", { name: "boat", alias_for: "nope" })).error).toBe("emoji_not_found");
  expect(await call("admin.emoji.remove", { name: "party" })).toEqual({ ok: true });
  expect((await call("emoji.list")).emoji).toEqual({ ship: "https://img.test/ship.png" });
  expect(jsonBodies().map((body: any) => body.event)).toEqual([
    expect.objectContaining({
      type: "emoji_changed",
      subtype: "add",
      name: "ship",
      value: "https://img.test/ship.png",
    }),
    expect.objectContaining({ type: "emoji_changed", subtype: "remove", names: ["party", "tada"] }),
  ]);
});

it("lists usergroups with their users", async () => {
  const { call } = setup({
    users: [{ name: "alice" }, { name: "bob" }],
    usergroups: [
      { id: "S0ENG", handle: "eng", name: "Engineering", users: ["alice", "bob"] },
      { handle: "old", disabled: true },
    ],
  });
  const plain = await call("usergroups.list");
  expect(plain.usergroups).toEqual([expect.objectContaining({ id: "S0ENG", handle: "eng", name: "Engineering" })]);
  expect(plain.usergroups[0].users).toBeUndefined();
  const withUsers = await call("usergroups.list", { include_users: true, include_disabled: true });
  expect(withUsers.usergroups.map((group: any) => group.handle)).toEqual(["eng", "old"]);
  expect(withUsers.usergroups[0].users).toHaveLength(2);
  expect((await call("usergroups.users.list", { usergroup: "S0ENG" })).users).toEqual(withUsers.usergroups[0].users);
  expect((await call("usergroups.users.list", { usergroup: "S0NOPE" })).error).toBe("no_such_subteam");
  expect(() => setup({ usergroups: [{ handle: "x", users: ["ghost"] }] })).toThrow("lists unknown user ghost");
});

it("adds bot_profile to bot messages, with the seeded icon", async () => {
  const { call } = setup({
    oauth_apps: [
      {
        client_id: "c",
        client_secret: "s",
        name: "Relay",
        redirect_uris: [],
        app_id: "A0RELAY",
        bot_id: "B0RELAY",
        bot_user_id: "U0RELAYBOT",
        bot_icon: "https://img.test/relay.png",
      },
    ],
    tokens: [{ token: "xoxb-relay", type: "bot", bot_id: "B0RELAY", user_id: "U0RELAYBOT" }],
  });
  const { message } = await call("chat.postMessage", { channel: "C000000001", text: "beep" }, "xoxb-relay");
  expect(message).toMatchObject({
    bot_id: "B0RELAY",
    app_id: "A0RELAY",
    bot_profile: { id: "B0RELAY", app_id: "A0RELAY", name: "relay", icons: { image_48: "https://img.test/relay.png" } },
  });
  expect((await call("users.info", { user: "U0RELAYBOT" })).user.profile.image_48).toBe("https://img.test/relay.png");
  expect((await call("bots.info", { bot: "B0RELAY" })).bot.icons.image_48).toBe("https://img.test/relay.png");
});

it("turns reply_broadcast into a thread_broadcast that shows in history", async () => {
  const { call } = setup();
  const root = await call("chat.postMessage", { channel: "C000000001", text: "root" });
  await call("chat.postMessage", { channel: "C000000001", text: "quiet reply", thread_ts: root.ts });
  const broadcast = await call("chat.postMessage", {
    channel: "C000000001",
    text: "loud reply",
    thread_ts: root.ts,
    reply_broadcast: true,
  });
  expect(broadcast.message.subtype).toBe("thread_broadcast");
  const history = await call("conversations.history", { channel: "C000000001" });
  expect(history.messages.map((m: any) => m.text)).toEqual(["loud reply", "root"]);
});

it("refuses edits outside the edit window", async () => {
  const { call } = setup({ edit_window_minutes: 0 });
  const posted = await call("chat.postMessage", { channel: "C000000001", text: "hi" });
  expect(await call("chat.update", { channel: "C000000001", ts: posted.ts, text: "edit" })).toEqual({
    ok: false,
    error: "edit_window_closed",
  });
  const open = setup({ edit_window_minutes: 10 });
  const fresh = await open.call("chat.postMessage", { channel: "C000000001", text: "hi" });
  expect((await open.call("chat.update", { channel: "C000000001", ts: fresh.ts, text: "edit" })).ok).toBe(true);
});

it("reports conversations.mark in conversations.info last_read", async () => {
  const { call } = setup();
  const posted = await call("chat.postMessage", { channel: "C000000001", text: "hi" });
  expect(await call("conversations.mark", { channel: "C000000001", ts: posted.ts })).toEqual({ ok: true });
  expect((await call("conversations.info", { channel: "C000000001" })).channel.last_read).toBe(posted.ts);
});

import { expect, it } from "vitest";
import { getSlackStore } from "../index.js";
import { authHeaders, createSlackTestApp, slackTestBaseUrl as base } from "./helpers.js";

async function setup() {
  const { app, store } = createSlackTestApp();
  const ss = getSlackStore(store);
  const general = ss.channels.findOneBy("name", "general")!;
  const random = ss.channels.findOneBy("name", "random")!;
  const call = async (method: string, body: Record<string, unknown> = {}) =>
    (await (
      await app.request(`${base}/api/${method}`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) })
    ).json()) as any;
  return { ss, general, random, call };
}

it("searches messages by words, in:, from: and pages them newest first", async () => {
  const { general, random, call } = await setup();
  for (const [channel, text] of [
    [general, "deploy finished OK"],
    [random, "deploy failed again"],
    [general, "lunch?"],
    [general, "Deploy rollback done"],
  ] as const) {
    expect((await call("chat.postMessage", { channel: channel.channel_id, text })).ok).toBe(true);
  }
  const all = await call("search.messages", { query: "deploy" });
  expect(all.messages.total).toBe(3);
  expect(all.messages.matches.map((m: any) => m.text)).toEqual([
    "Deploy rollback done",
    "deploy failed again",
    "deploy finished OK",
  ]);
  expect(all.messages.matches[0]).toMatchObject({
    channel: { id: general.channel_id, name: "general" },
    user: "U000000001",
    username: "admin",
    permalink: expect.stringContaining(`/archives/${general.channel_id}/p`),
  });

  expect(
    (await call("search.messages", { query: "deploy in:#random" })).messages.matches.map((m: any) => m.text),
  ).toEqual(["deploy failed again"]);
  expect(
    (await call("search.messages", { query: `deploy in:<#${general.channel_id}|general> from:@admin` })).messages.total,
  ).toBe(2);
  expect((await call("search.messages", { query: "deploy from:@nobody" })).messages.total).toBe(0);

  const paged = await call("search.messages", { query: "deploy", count: 2, page: 2, sort_dir: "asc" });
  expect(paged.messages.matches.map((m: any) => m.text)).toEqual(["Deploy rollback done"]);
  expect(paged.messages.paging).toEqual({ count: 2, total: 3, page: 2, pages: 2 });
  expect(await call("search.messages", {})).toMatchObject({ ok: false, error: "no_query" });
});

it("lists only the user's conversations with users.conversations", async () => {
  const { ss, general, random, call } = await setup();
  ss.channels.update(random.id, { members: [] });
  const mine = await call("users.conversations", { types: "public_channel" });
  expect(mine.channels.map((ch: any) => ch.id)).toEqual([general.channel_id]);
  const all = await call("conversations.list", { types: "public_channel" });
  expect(all.channels.map((ch: any) => ch.id)).toEqual(expect.arrayContaining([general.channel_id, random.channel_id]));
  expect(await call("users.conversations", { user: "U_NOPE" })).toMatchObject({ ok: false, error: "user_not_found" });
});

it("reports unread counts after the read cursor in conversations.info", async () => {
  const { ss, general, call } = await setup();
  const other = ss.users.insert({ ...ss.users.all()[0]!, id: undefined as never, user_id: "U000000002", name: "bob" });
  const first = await call("chat.postMessage", { channel: general.channel_id, text: "mine" });
  expect((await call("conversations.mark", { channel: general.channel_id, ts: first.ts })).ok).toBe(true);
  for (const text of ["one", "two"]) {
    ss.messages.insert({
      ts: `${Number(first.ts) + Math.random() + 1}`,
      channel_id: general.channel_id,
      user: other.user_id,
      text,
      type: "message",
      reply_count: 0,
      reply_users: [],
      reactions: [],
    });
  }
  await call("chat.postMessage", { channel: general.channel_id, text: "my reply" });
  const info = await call("conversations.info", { channel: general.channel_id });
  expect(info.channel).toMatchObject({ last_read: first.ts, unread_count: 3, unread_count_display: 2 });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Bot, InputFile } from "grammy";
import {
  BOT_TOKEN,
  OTHER_BOT_TOKEN,
  PNG_1X1,
  startTelegramEmulator,
  startWebhookReceiver,
  type TelegramTestEmulator,
} from "./helpers.js";

let emu: TelegramTestEmulator;
let ids: { bots: Record<string, number>; users: Record<string, number>; chats: Record<string, number>; topics: any };

beforeEach(async () => {
  emu = await startTelegramEmulator();
  ids = await emu.control("GET", "ids");
});

afterEach(async () => {
  await emu.close();
});

function grammyBot(token = BOT_TOKEN) {
  return new Bot(token, { client: { apiRoot: emu.apiRoot } });
}

describe("telegram emulator", () => {
  it("answers getMe for each seeded bot and rejects unknown tokens", async () => {
    const me = await grammyBot().api.getMe();
    expect(me).toMatchObject({ id: 7000000001, is_bot: true, username: "test_bot" });
    expect(ids.bots).toEqual({ test_bot: 7000000001, other_bot: expect.any(Number) });
    expect((await emu.bot("getMe", {}, OTHER_BOT_TOKEN)).result.username).toBe("other_bot");
    expect(await emu.bot("getMe", {}, "1:unknown")).toMatchObject({ ok: false, error_code: 401 });
    expect(await emu.bot("getMyDescription", {}, "1:unknown")).toMatchObject({ ok: false, error_code: 401 });
  });

  it("starts with empty update queues after seeding", async () => {
    expect(await emu.bot("getUpdates", { timeout: 0 })).toEqual({ ok: true, result: [] });
  });

  it("long-polls getUpdates and confirms with offset", async () => {
    const poll = emu.bot("getUpdates", { timeout: 5 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const started = Date.now();
    await emu.control("POST", "chats/team/messages", { from: "bob", text: "hello bot", topic: "ideas" });
    const first = await poll;
    expect(Date.now() - started).toBeLessThan(2000);
    expect(first.result).toHaveLength(1);
    const update = first.result[0];
    expect(update.message).toMatchObject({
      text: "hello bot",
      from: { id: ids.users.bob },
      chat: { id: ids.chats.team, type: "supergroup", is_forum: true },
      message_thread_id: ids.topics.team.ideas,
      is_topic_message: true,
    });

    const again = await emu.bot("getUpdates", { timeout: 0 });
    expect(again.result.map((u: any) => u.update_id)).toEqual([update.update_id]);
    const confirmed = await emu.bot("getUpdates", { timeout: 0, offset: update.update_id + 1 });
    expect(confirmed.result).toEqual([]);
  });

  it("delivers to a webhook with the secret token, honours allowed_updates and drop_pending_updates", async () => {
    const receiver = await startWebhookReceiver();
    try {
      await emu.control("POST", "users/bob/messages", { text: "queued before webhook" });
      expect(
        await emu.bot("setWebhook", {
          url: receiver.url,
          secret_token: "s3cret",
          allowed_updates: ["message"],
          drop_pending_updates: true,
        }),
      ).toEqual({ ok: true, result: true });
      const info = await emu.bot("getWebhookInfo");
      expect(info.result).toMatchObject({ url: receiver.url, pending_update_count: 0 });
      expect(await emu.bot("getUpdates", { timeout: 0 })).toMatchObject({ ok: false, error_code: 409 });

      await emu.control("POST", "chats/plain/messages", { from: "bob", text: "via webhook" });
      const delivery = await receiver.next();
      expect(delivery.headers["x-telegram-bot-api-secret-token"]).toBe("s3cret");
      expect(delivery.body.message).toMatchObject({ text: "via webhook", chat: { id: ids.chats.plain } });
      expect(receiver.requests.some((r) => r.body.message?.text === "queued before webhook")).toBe(false);

      expect(await emu.bot("deleteWebhook", { drop_pending_updates: true })).toEqual({ ok: true, result: true });
      expect((await emu.bot("getWebhookInfo")).result.url).toBe("");
    } finally {
      await receiver.close();
    }
  });

  it("sends, replies in topics, edits, reacts and answers callback queries through grammy", async () => {
    const bot = grammyBot();
    const chatId = ids.chats.team;
    const userMessage = await emu.control("POST", "chats/team/messages", {
      from: "bob",
      text: "question",
      topic: "ideas",
    });

    const reply = await bot.api.sendMessage(chatId, "answer", {
      message_thread_id: ids.topics.team.ideas,
      reply_parameters: { message_id: userMessage.message_id },
      reply_markup: { inline_keyboard: [[{ text: "More", callback_data: "more" }]] },
    });
    expect(reply).toMatchObject({
      text: "answer",
      message_thread_id: ids.topics.team.ideas,
      is_topic_message: true,
      reply_markup: { inline_keyboard: [[{ text: "More", callback_data: "more" }]] },
    });

    const edited = await bot.api.editMessageText(chatId, reply.message_id, "answer v2");
    expect(edited).toMatchObject({ text: "answer v2", edit_date: expect.any(Number) });

    expect(await bot.api.sendChatAction(chatId, "typing", { message_thread_id: ids.topics.team.ideas })).toBe(true);
    expect(
      await bot.api.setMessageReaction(chatId, userMessage.message_id, [{ type: "emoji", emoji: "\u{1F44D}" }]),
    ).toBe(true);

    await bot.api.getUpdates({ offset: -1, timeout: 0 }).then(async (updates) => {
      const last = updates.at(-1);
      if (last) await bot.api.getUpdates({ offset: last.update_id + 1, timeout: 0 });
    });
    const menu = await bot.api.sendMessage(chatId, "menu", {
      reply_markup: { inline_keyboard: [[{ text: "More", callback_data: "more" }]] },
    });
    const press = emu.control("POST", `chats/team/messages/${menu.message_id}/buttons`, { from: "bob", data: "more" });
    const updates = await bot.api.getUpdates({ timeout: 5, allowed_updates: ["callback_query"] });
    const query = updates.find((u) => u.callback_query)?.callback_query;
    expect(query).toMatchObject({ data: "more", from: { id: ids.users.bob } });
    expect(await bot.api.answerCallbackQuery(query!.id, { text: "ok" })).toBe(true);
    expect(await press).toMatchObject({ answered: true, text: "ok" });

    const calls = await emu.control("GET", "calls");
    expect(calls.calls.map((call: any) => call.method)).toEqual(
      expect.arrayContaining([
        "sendMessage",
        "editMessageText",
        "sendChatAction",
        "setMessageReaction",
        "answerCallbackQuery",
      ]),
    );
  });

  it("uploads photos, voice and documents, edits captions, and serves files through getFile", async () => {
    const bot = grammyBot();
    const chatId = ids.chats.plain;

    const photo = await bot.api.sendPhoto(chatId, new InputFile(PNG_1X1, "dot.png"), { caption: "a dot" });
    expect(photo.photo?.length).toBeGreaterThan(0);
    expect(photo.photo![0]).toMatchObject({ file_id: expect.any(String), file_unique_id: expect.any(String) });

    const captioned = await bot.api.editMessageCaption(chatId, photo.message_id, { caption: "a bigger dot" });
    expect(captioned).toMatchObject({ caption: "a bigger dot" });

    const voice = await bot.api.sendVoice(chatId, new InputFile(Buffer.from("OggS fake voice"), "note.ogg"));
    expect(voice.voice).toMatchObject({ file_id: expect.any(String), file_unique_id: expect.any(String) });

    const docBytes = Buffer.from("hello document");
    const doc = await bot.api.sendDocument(chatId, new InputFile(docBytes, "hello.txt"));
    expect(doc.document).toMatchObject({ file_id: expect.any(String), file_size: docBytes.length });

    const file = await bot.api.getFile(doc.document!.file_id);
    expect(file.file_path).toEqual(expect.any(String));
    const download = await fetch(`${emu.url}/file/bot${BOT_TOKEN}/${file.file_path}`);
    expect(download.status).toBe(200);
    expect(Buffer.from(await download.arrayBuffer())).toEqual(docBytes);

    const reused = await bot.api.sendPhoto(chatId, photo.photo!.at(-1)!.file_id);
    expect(reused.photo?.at(-1)?.file_unique_id).toBe(photo.photo!.at(-1)!.file_unique_id);

    await emu.control("POST", "chats/plain/messages", {
      from: "bob",
      caption: "from bob",
      media: { type: "document", base64: Buffer.from("user upload").toString("base64"), file_name: "u.txt" },
    });
    const updates = await bot.api.getUpdates({ timeout: 0 });
    const userDoc = updates.find((u) => u.message?.document)?.message?.document;
    expect(userDoc).toMatchObject({ file_name: "u.txt" });
    const userFile = await bot.api.getFile(userDoc!.file_id);
    const userDownload = await fetch(`${emu.url}/file/bot${BOT_TOKEN}/${userFile.file_path}`);
    expect(await userDownload.text()).toBe("user upload");
  });

  it("answers getChat and stores commands", async () => {
    const bot = grammyBot();
    expect(await bot.api.getChat(ids.chats.team)).toMatchObject({ id: ids.chats.team, title: "Team", is_forum: true });
    expect(await bot.api.setMyCommands([{ command: "start", description: "Start" }])).toBe(true);
    expect(await bot.api.getMyCommands()).toEqual([{ command: "start", description: "Start" }]);
  });

  it("creates, edits and posts into forum topics through the adapter", async () => {
    const bot = grammyBot();
    const chatId = ids.chats.team;
    const topic = await bot.api.createForumTopic(chatId, "Release plan", { icon_color: 0xffd67e });
    expect(topic).toMatchObject({ message_thread_id: expect.any(Number), name: "Release plan", icon_color: 0xffd67e });

    const inTopic = await bot.api.sendMessage(chatId, "kickoff", { message_thread_id: topic.message_thread_id });
    expect(inTopic).toMatchObject({ message_thread_id: topic.message_thread_id, is_topic_message: true });

    expect(await bot.api.editForumTopic(chatId, topic.message_thread_id, { name: "Release plan v2" })).toBe(true);
    const messages = await emu.control("GET", "chats/team/messages");
    expect(messages.some((m: any) => m.forum_topic_edited?.name === "Release plan v2")).toBe(true);

    await expect(bot.api.editForumTopic(chatId, 999999, { name: "x" })).rejects.toThrow("TOPIC_ID_INVALID");
    await expect(bot.api.createForumTopic(ids.chats.plain, "nope")).rejects.toThrow(/forum/);

    const stickers = await bot.api.getForumTopicIconStickers();
    expect(stickers.length).toBeGreaterThan(0);
    expect(stickers[0]).toMatchObject({ type: "custom_emoji", custom_emoji_id: expect.any(String) });
  });

  it("stores bot descriptions per language with a default fallback", async () => {
    const bot = grammyBot();
    expect(await bot.api.getMyDescription()).toEqual({ description: "seeded description" });
    expect(await bot.api.setMyDescription("english", { language_code: "en" })).toBe(true);
    expect(await bot.api.getMyDescription({ language_code: "en" })).toEqual({ description: "english" });
    expect(await bot.api.getMyDescription({ language_code: "de" })).toEqual({ description: "seeded description" });

    expect(await bot.api.getMyShortDescription()).toEqual({ short_description: "" });
    expect(await bot.api.setMyShortDescription("short")).toBe(true);
    expect(await bot.api.getMyShortDescription()).toEqual({ short_description: "short" });
    await expect(bot.api.setMyShortDescription("x".repeat(121))).rejects.toThrow("SHORT_DESCRIPTION_TOO_LONG");

    const other = grammyBot(OTHER_BOT_TOKEN);
    expect(await other.api.getMyShortDescription()).toEqual({ short_description: "" });
  });

  it("runs a grammy long-polling bot end to end", async () => {
    const bot = grammyBot();
    bot.on("message:text", (ctx) => ctx.reply(`echo: ${ctx.message.text}`));
    const running = bot.start({ timeout: 1 });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await emu.control("POST", "users/alice/messages", { text: "ping" });
    let replies: any[] = [];
    for (let attempt = 0; attempt < 40 && replies.length === 0; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      replies = (await emu.control("GET", "users/alice/messages")).filter((m: any) => m.text === "echo: ping");
    }
    await bot.stop();
    await running;
    expect(replies).toHaveLength(1);
  });

  it("restarts with fresh state when the emulator is reset", async () => {
    await emu.control("POST", "users/alice/messages", { text: "before reset" });
    emu.reseed();
    expect(await emu.bot("getUpdates", { timeout: 0 })).toEqual({ ok: true, result: [] });
    expect(await emu.control("GET", "users/alice/messages")).toEqual([]);
  });

  it("rejects seed references to unknown users", async () => {
    await expect(
      startTelegramEmulator({ chats: [{ name: "x", owner: "nobody" }] }).then((bad) => bad.control("GET", "ids")),
    ).rejects.toThrow();
  });

  describe("known telegram-bot-test-server 0.9.0 gaps (flip to passing when fixed upstream)", () => {
    it.fails("echoes reply_to_message for reply_parameters on bot sends", async () => {
      const userMessage = await emu.control("POST", "chats/plain/messages", { from: "bob", text: "q" });
      const reply = await grammyBot().api.sendMessage(ids.chats.plain, "a", {
        reply_parameters: { message_id: userMessage.message_id },
      });
      expect(reply.reply_to_message?.message_id).toBe(userMessage.message_id);
    });

    it.fails("applies parse_mode to text and entities", async () => {
      const sent = await grammyBot().api.sendMessage(ids.chats.plain, "<b>bold</b>", { parse_mode: "HTML" });
      expect(sent.text).toBe("bold");
    });

    it.fails("keeps file_name and mime_type on uploaded documents", async () => {
      const doc = await grammyBot().api.sendDocument(ids.chats.plain, new InputFile(Buffer.from("x"), "x.txt"));
      expect(doc.document?.file_name).toBe("x.txt");
    });
  });
});

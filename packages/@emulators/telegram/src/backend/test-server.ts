import { startTestServer } from "telegram-bot-test-server";
import { TelegramBackendError } from "./types.js";
import type { TelegramBackend, TelegramBackendFactory, TelegramMessage } from "./types.js";

/** The only module that talks to telegram-bot-test-server. */
export const createTestServerBackend: TelegramBackendFactory = async (primaryBot) => {
  const server = await startTestServer({
    botToken: primaryBot.token,
    botUsername: primaryBot.username,
    botName: primaryBot.first_name ?? primaryBot.username,
    port: 0,
    host: "127.0.0.1",
    log: () => {},
  });

  const fakeControl = async <T>(method: string, path: string): Promise<T> => {
    const response = await fetch(`${server.origin}/_fake/${path}`, { method });
    const payload = (await response.json()) as T & { error?: string };
    if (!response.ok) throw new TelegramBackendError(payload.error ?? `telegram backend ${method} ${path} failed`);
    return payload;
  };

  const backend: TelegramBackend = {
    origin: server.origin,
    async addBot(bot) {
      const added = await server.addBot({ token: bot.token, username: bot.username, firstName: bot.first_name });
      return { id: added.id, username: added.username };
    },
    createUser: (user) => server.createUser(user),
    createChat: (chat) =>
      server.createChat({ title: chat.title, type: chat.type, ownerId: chat.owner_id, isForum: chat.forum }),
    async setBotMembership(chatId, botId, membership) {
      await server.setBotMembership(chatId, botId, membership);
    },
    async join(chatId, userId) {
      await server.join(chatId, userId);
    },
    createTopic: (chatId, name, by) => server.createTopic(chatId, name, { by }),
    async renameTopic(chatId, threadId, name, by) {
      await server.renameTopic(chatId, threadId, name, { by });
    },
    listTopics: (chatId) => fakeControl("GET", `chats/${chatId}/topics`),
    async chatOwner(chatId) {
      const chat = await server.getChat(chatId);
      const creator = chat.members.find((member) => member.status === "creator");
      if (!creator) throw new Error(`telegram chat ${chatId} has no creator`);
      return creator.user_id;
    },
    post: (chatId, userId, message) =>
      server.post(chatId, userId, {
        text: message.text,
        caption: message.caption,
        replyTo: message.reply_to,
        threadId: message.thread_id,
        ...(message.media?.type === "photo" ? { photo: message.media.bytes } : {}),
        ...(message.media && message.media.type !== "photo"
          ? {
              media: {
                type: message.media.type,
                bytes: message.media.bytes,
                fileName: message.media.file_name,
                mimeType: message.media.mime_type,
              },
            }
          : {}),
      }),
    sendDirectMessage: (userId, text) => server.sendDirectMessage(userId, text),
    async editMessage(chatId, messageId, userId, edit) {
      await server.editMessage(chatId, messageId, userId, edit);
    },
    async react(chatId, messageId, userId, emoji) {
      await server.react(chatId, messageId, userId, emoji);
    },
    pressButton: (chatId, messageId, userId, data) => server.pressButton(chatId, messageId, userId, data),
    pressDirectButton: (userId, messageId, data) => server.pressDirectButton(userId, messageId, data),
    getMessages: (chatId) => server.getMessages(chatId) as Promise<TelegramMessage[]>,
    getDirectMessages: (userId) => server.getDirectMessages(userId) as Promise<TelegramMessage[]>,
    getCalls: () => server.getCalls(),
    stop: () => server.stop(),
  };
  return refusalsAsBackendErrors(backend);
};

/** The test server rejects control calls with plain Errors; tag them so routes can answer 400. */
function refusalsAsBackendErrors(backend: TelegramBackend): TelegramBackend {
  const wrapped = { origin: backend.origin } as TelegramBackend;
  for (const key of Object.keys(backend) as Array<keyof TelegramBackend>) {
    const value = backend[key];
    if (typeof value !== "function" || key === "stop") {
      Object.assign(wrapped, { [key]: value });
      continue;
    }
    Object.assign(wrapped, {
      [key]: async (...args: unknown[]) => {
        try {
          return await (value as (...a: unknown[]) => Promise<unknown>)(...args);
        } catch (error) {
          if (error instanceof Error && !(error instanceof TelegramBackendError)) {
            throw new TelegramBackendError(error.message);
          }
          throw error;
        }
      },
    });
  }
  return wrapped;
}

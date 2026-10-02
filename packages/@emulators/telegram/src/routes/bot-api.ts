import type { Context, Hono, AppEnv } from "@emulators/core";
import { TelegramBackendError } from "../backend/types.js";
import { recordTopic, type TelegramRuntime, type TelegramWorld } from "../runtime.js";

type Params = Record<string, unknown>;
type MethodHandler = (world: TelegramWorld, botId: number, params: Params) => Promise<unknown>;

class BotApiError extends Error {
  constructor(
    readonly errorCode: number,
    readonly description: string,
  ) {
    super(description);
  }
}

const BOT_METHOD_PATH = /^\/bot([^/]+)\/([A-Za-z]+)$/;
const FILE_PATH = /^\/file\/bot([^/]+)\/(.+)$/;
const DEFAULT_TOPIC_ICON_COLOR = 7322096;
const DESCRIPTION_LIMIT = 512;
const SHORT_DESCRIPTION_LIMIT = 120;

const FORUM_TOPIC_ICON_STICKERS = [
  ["5312536423851630001", "\u{1F4A1}"],
  ["5312016608254762256", "\u{2764}"],
  ["5377544228505134960", "\u{1F4CA}"],
  ["5309965701241379366", "\u{1F4F0}"],
].map(([customEmojiId, emoji], index) => ({
  file_id: `CAACAgIAAxUAAWfakeTopicIcon${index}`,
  file_unique_id: `AgADfakeTopicIcon${index}`,
  type: "custom_emoji",
  width: 512,
  height: 512,
  is_animated: false,
  is_video: false,
  emoji,
  custom_emoji_id: customEmojiId,
}));

/** Methods telegram-bot-test-server lacks or only stubs, answered from adapter state. */
const ADAPTER_METHODS: Record<string, MethodHandler> = {
  getForumTopicIconStickers: async () => FORUM_TOPIC_ICON_STICKERS,

  async createForumTopic(world, _botId, params) {
    const chatId = requireChatId(params);
    const name = requireString(params, "name");
    const owner = await backendCall(() => world.backend.chatOwner(chatId));
    const threadId = await backendCall(() => world.backend.createTopic(chatId, name, owner));
    recordTopic(world, chatId, name, threadId);
    const iconColor = params.icon_color === undefined ? DEFAULT_TOPIC_ICON_COLOR : Number(params.icon_color);
    const iconCustomEmojiId = optionalString(params, "icon_custom_emoji_id");
    world.topicMeta.set(topicKey(chatId, threadId), {
      icon_color: iconColor,
      ...(iconCustomEmojiId ? { icon_custom_emoji_id: iconCustomEmojiId } : {}),
    });
    return {
      message_thread_id: threadId,
      name,
      icon_color: iconColor,
      ...(iconCustomEmojiId ? { icon_custom_emoji_id: iconCustomEmojiId } : {}),
    };
  },

  async editForumTopic(world, _botId, params) {
    const chatId = requireChatId(params);
    const threadId = requireInteger(params, "message_thread_id");
    const topics = await backendCall(() => world.backend.listTopics(chatId));
    if (!topics.some((topic) => topic.message_thread_id === threadId)) {
      throw new BotApiError(400, "Bad Request: TOPIC_ID_INVALID");
    }
    const name = optionalString(params, "name");
    if (name !== undefined) {
      const owner = await backendCall(() => world.backend.chatOwner(chatId));
      await backendCall(() => world.backend.renameTopic(chatId, threadId, name, owner));
    }
    const iconCustomEmojiId = optionalString(params, "icon_custom_emoji_id");
    if (iconCustomEmojiId !== undefined) {
      const key = topicKey(chatId, threadId);
      const meta = world.topicMeta.get(key) ?? { icon_color: DEFAULT_TOPIC_ICON_COLOR };
      world.topicMeta.set(key, { ...meta, icon_custom_emoji_id: iconCustomEmojiId || undefined });
    }
    return true;
  },

  setMyDescription: async (world, botId, params) =>
    setProfileText(world, botId, params, "description", DESCRIPTION_LIMIT),
  getMyDescription: async (world, botId, params) => ({
    description: profileText(world, botId, params, "description"),
  }),
  setMyShortDescription: async (world, botId, params) =>
    setProfileText(world, botId, params, "short_description", SHORT_DESCRIPTION_LIMIT),
  getMyShortDescription: async (world, botId, params) => ({
    short_description: profileText(world, botId, params, "short_description"),
  }),
};

export const TELEGRAM_ADAPTER_METHODS = Object.freeze(Object.keys(ADAPTER_METHODS));

export function botApiRoutes(app: Hono<AppEnv>, runtime: TelegramRuntime, controlRoutes: string[]): void {
  for (const httpMethod of ["GET", "POST"]) {
    app.on(httpMethod, "/*", async (c, next) => {
      const path = new URL(c.req.url).pathname;
      const method = BOT_METHOD_PATH.exec(path);
      if (method) return handleBotMethod(c, runtime, decodeURIComponent(method[1]!), method[2]!);
      if (FILE_PATH.test(path)) return proxy(c, await runtime.world(), path);
      if (path.startsWith("/_telegram/")) {
        return c.json({ error: `no control route ${httpMethod} ${path}`, routes: controlRoutes }, 404);
      }
      return next();
    });
  }
}

async function handleBotMethod(c: Context, runtime: TelegramRuntime, token: string, method: string) {
  const world = await runtime.world();
  const handler = ADAPTER_METHODS[method];
  if (!handler) return proxy(c, world, new URL(c.req.url).pathname);

  const botId = world.botIdsByToken.get(token);
  if (botId === undefined) return botError(c, new BotApiError(401, "Unauthorized"));
  try {
    const params = await readParams(c);
    world.adapterCalls.push({ method, bot_id: botId, params, at: Date.now() });
    return c.json({ ok: true, result: await handler(world, botId, params) });
  } catch (error) {
    if (error instanceof BotApiError) return botError(c, error);
    throw error;
  }
}

async function proxy(c: Context, world: TelegramWorld, path: string): Promise<Response> {
  const incoming = new URL(c.req.url);
  const headers = new Headers();
  const contentType = c.req.header("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  const hasBody = c.req.method !== "GET" && c.req.method !== "HEAD";
  let body: ArrayBuffer | FormData | undefined = hasBody ? await c.req.arrayBuffer() : undefined;
  if (body && contentType?.includes("multipart/form-data")) {
    body = await inlineAttachedFiles(body, contentType);
    headers.delete("Content-Type");
  }
  const upstream = await fetch(`${world.backend.origin}${path}${incoming.search}`, {
    method: c.req.method,
    headers,
    body,
  });
  const responseHeaders = new Headers();
  for (const name of ["Content-Type", "Content-Length", "Content-Disposition", "Retry-After"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

/**
 * Clients such as grammy upload a top-level InputFile as `photo=attach://<part>`
 * plus a separate file part, which the Bot API accepts. The backend only reads
 * a file sent directly in the field, so the referenced part is moved there.
 */
async function inlineAttachedFiles(body: ArrayBuffer, contentType: string): Promise<FormData> {
  const form = await new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  }).formData();
  const out = new FormData();
  const moved = new Set<string>();
  for (const value of form.values()) {
    if (typeof value !== "string" || !value.startsWith("attach://")) continue;
    const part = form.get(value.slice("attach://".length));
    if (part && typeof part !== "string") moved.add(value.slice("attach://".length));
  }
  for (const [key, value] of form.entries()) {
    if (moved.has(key)) continue;
    const attached = typeof value === "string" && value.startsWith("attach://") ? form.get(value.slice(9)) : null;
    if (attached && typeof attached !== "string") out.append(key, attached, attached.name);
    else out.append(key, value);
  }
  return out;
}

async function readParams(c: Context): Promise<Params> {
  const params: Params = Object.fromEntries(new URL(c.req.url).searchParams);
  if (c.req.method === "GET" || c.req.method === "HEAD") return params;
  const contentType = c.req.header("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await c.req.text();
    if (!text) return params;
    const body = JSON.parse(text) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BotApiError(400, "Bad Request: request body must be a JSON object");
    }
    return { ...params, ...(body as Params) };
  }
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return { ...params, ...(await c.req.parseBody()) };
  }
  return params;
}

function botError(c: Context, error: BotApiError): Response {
  return c.json(
    { ok: false, error_code: error.errorCode, description: error.description },
    error.errorCode as 400 | 401 | 404,
  );
}

async function backendCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (!(error instanceof TelegramBackendError)) throw error;
    throw new BotApiError(
      400,
      error.message.startsWith("Bad Request") ? error.message : `Bad Request: ${error.message}`,
    );
  }
}

function requireChatId(params: Params): number {
  const value = params.chat_id;
  if (value === undefined || value === "") throw new BotApiError(400, "Bad Request: chat_id is empty");
  const chatId = Number(value);
  if (!Number.isInteger(chatId)) throw new BotApiError(400, "Bad Request: chat not found");
  return chatId;
}

function requireInteger(params: Params, field: string): number {
  const value = Number(params[field]);
  if (params[field] === undefined || !Number.isInteger(value)) {
    throw new BotApiError(400, `Bad Request: ${field} is invalid`);
  }
  return value;
}

function requireString(params: Params, field: string): string {
  const value = optionalString(params, field);
  if (!value) throw new BotApiError(400, `Bad Request: ${field} is empty`);
  return value;
}

function optionalString(params: Params, field: string): string | undefined {
  const value = params[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new BotApiError(400, `Bad Request: ${field} must be a string`);
  return value;
}

function topicKey(chatId: number, threadId: number): string {
  return `${chatId}:${threadId}`;
}

function setProfileText(
  world: TelegramWorld,
  botId: number,
  params: Params,
  field: "description" | "short_description",
  limit: number,
): true {
  const value = optionalString(params, field) ?? "";
  if (value.length > limit) throw new BotApiError(400, `Bad Request: ${field.toUpperCase()}_TOO_LONG`);
  const language = optionalString(params, "language_code") ?? "";
  const profile = world.profiles.get(botId);
  if (!profile) throw new Error(`telegram bot ${botId} has no profile`);
  if (value) profile[field][language] = value;
  else delete profile[field][language];
  return true;
}

function profileText(
  world: TelegramWorld,
  botId: number,
  params: Params,
  field: "description" | "short_description",
): string {
  const language = optionalString(params, "language_code") ?? "";
  const profile = world.profiles.get(botId);
  if (!profile) throw new Error(`telegram bot ${botId} has no profile`);
  return profile[field][language] ?? profile[field][""] ?? "";
}

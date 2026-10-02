import type { Context, Hono, AppEnv } from "@emulators/core";
import { TelegramBackendError, type TelegramMedia, type TelegramPostedMessage } from "../backend/types.js";
import type { TelegramRuntime, TelegramWorld } from "../runtime.js";

type Body = Record<string, unknown>;

class ControlError extends Error {
  constructor(
    readonly status: 400 | 404,
    message: string,
  ) {
    super(message);
  }
}

const MEDIA_TYPES = new Set<TelegramMedia["type"]>([
  "photo",
  "video",
  "animation",
  "sticker",
  "voice",
  "audio",
  "video_note",
  "document",
]);

/**
 * The emulate control API for acting on Telegram's side. Chats and users are
 * referenced by seed name or numeric id.
 */
/** Registers the control API and returns its routes, for the error an unknown control path gets. */
export function controlRoutes(app: Hono<AppEnv>, runtime: TelegramRuntime): string[] {
  const route = (handler: (world: TelegramWorld, c: Context, body: Body) => Promise<unknown>) => async (c: Context) => {
    try {
      const world = await runtime.world();
      const body = c.req.method === "GET" ? {} : await readJson(c);
      return c.json(await handler(world, c, body));
    } catch (error) {
      if (error instanceof ControlError) return c.json({ error: error.message }, error.status);
      if (error instanceof TelegramBackendError) return c.json({ error: error.message }, 400);
      throw error;
    }
  };

  const routes: string[] = [];
  const get = (path: string, handler: (c: Context) => Promise<Response>) => {
    routes.push(`GET ${path}`);
    app.get(path, handler);
  };
  const post = (path: string, handler: (c: Context) => Promise<Response>) => {
    routes.push(`POST ${path}`);
    app.post(path, handler);
  };

  get(
    "/_telegram/ids",
    route(async (world) => world.ids),
  );

  post(
    "/_telegram/users",
    route(async (world, _c, body) => {
      const name = requireString(body, "name");
      if (world.ids.users[name] !== undefined) throw new ControlError(400, `user ${name} already exists`);
      const id = await world.backend.createUser({
        first_name: optionalString(body, "first_name") ?? name,
        last_name: optionalString(body, "last_name"),
        username: optionalString(body, "username"),
        language_code: optionalString(body, "language_code"),
        is_premium: body.is_premium === true,
      });
      world.ids.users[name] = id;
      return { id };
    }),
  );

  post(
    "/_telegram/chats/:chat/topics",
    route(async (world, c, body) => {
      const chatId = chatRef(world, c.req.param("chat")!);
      const name = requireString(body, "name");
      const by = body.by === undefined ? await world.backend.chatOwner(chatId) : userRef(world, body.by);
      const threadId = await world.backend.createTopic(chatId, name, by);
      const chatName = Object.entries(world.ids.chats).find(([, id]) => id === chatId)?.[0];
      if (chatName) (world.ids.topics[chatName] ??= {})[name] = threadId;
      return { message_thread_id: threadId };
    }),
  );

  post(
    "/_telegram/chats/:chat/members",
    route(async (world, c, body) => {
      await world.backend.join(chatRef(world, c.req.param("chat")!), userRef(world, body.user));
      return { ok: true };
    }),
  );

  post(
    "/_telegram/chats/:chat/messages",
    route(async (world, c, body) => {
      const chatId = chatRef(world, c.req.param("chat")!);
      const messageId = await world.backend.post(chatId, userRef(world, body.from), postedMessage(world, chatId, body));
      return { message_id: messageId };
    }),
  );

  get(
    "/_telegram/chats/:chat/messages",
    route(async (world, c) => world.backend.getMessages(chatRef(world, c.req.param("chat")!))),
  );

  post(
    "/_telegram/chats/:chat/messages/:message/edit",
    route(async (world, c, body) => {
      await world.backend.editMessage(
        chatRef(world, c.req.param("chat")!),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        { text: optionalString(body, "text"), caption: optionalString(body, "caption") },
      );
      return { ok: true };
    }),
  );

  post(
    "/_telegram/chats/:chat/messages/:message/reactions",
    route(async (world, c, body) => {
      const emoji = body.emoji === null ? null : requireString(body, "emoji");
      await world.backend.react(
        chatRef(world, c.req.param("chat")!),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        emoji,
      );
      return { ok: true };
    }),
  );

  post(
    "/_telegram/chats/:chat/messages/:message/buttons",
    route(async (world, c, body) =>
      world.backend.pressButton(
        chatRef(world, c.req.param("chat")!),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        requireString(body, "data"),
      ),
    ),
  );

  post(
    "/_telegram/users/:user/messages",
    route(async (world, c, body) => ({
      message_id: await world.backend.sendDirectMessage(
        userRef(world, c.req.param("user")),
        postedMessage(world, undefined, body),
      ),
    })),
  );

  get(
    "/_telegram/users/:user/messages",
    route(async (world, c) => world.backend.getDirectMessages(userRef(world, c.req.param("user")))),
  );

  post(
    "/_telegram/users/:user/messages/:message/buttons",
    route(async (world, c, body) =>
      world.backend.pressDirectButton(
        userRef(world, c.req.param("user")),
        integer(c.req.param("message"), "message"),
        requireString(body, "data"),
      ),
    ),
  );

  get(
    "/_telegram/calls",
    route(async (world) => {
      const { calls, unimplemented } = await world.backend.getCalls();
      return {
        calls: [...calls.slice(world.seedCallCount), ...world.adapterCalls].sort((a, b) => a.at - b.at),
        unimplemented,
      };
    }),
  );

  return routes;
}

async function readJson(c: Context): Promise<Body> {
  const text = await c.req.text();
  if (!text) return {};
  const body = JSON.parse(text) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ControlError(400, "request body must be a JSON object");
  }
  return body as Body;
}

function postedMessage(world: TelegramWorld, chatId: number | undefined, body: Body): TelegramPostedMessage {
  const media = body.media === undefined ? undefined : mediaRef(body.media);
  const text = optionalString(body, "text");
  if (text === undefined && !media) throw new ControlError(400, "message needs text or media");
  return {
    text,
    caption: optionalString(body, "caption"),
    reply_to: body.reply_to === undefined ? undefined : integer(body.reply_to, "reply_to"),
    thread_id: chatId === undefined ? undefined : threadRef(world, chatId, body.topic),
    media,
  };
}

function mediaRef(value: unknown): TelegramMedia {
  if (!value || typeof value !== "object") throw new ControlError(400, "media must be an object");
  const media = value as Body;
  const type = media.type as TelegramMedia["type"];
  if (!MEDIA_TYPES.has(type)) throw new ControlError(400, `media.type must be one of ${[...MEDIA_TYPES].join(", ")}`);
  const base64 = requireString(media, "base64");
  return {
    type,
    bytes: Buffer.from(base64, "base64"),
    file_name: optionalString(media, "file_name"),
    mime_type: optionalString(media, "mime_type"),
  };
}

function threadRef(world: TelegramWorld, chatId: number, topic: unknown): number | undefined {
  if (topic === undefined) return undefined;
  if (typeof topic === "number") return topic;
  if (typeof topic !== "string") throw new ControlError(400, "topic must be a thread id or topic name");
  const chatName = Object.entries(world.ids.chats).find(([, id]) => id === chatId)?.[0];
  const threadId = chatName ? world.ids.topics[chatName]?.[topic] : undefined;
  if (threadId === undefined) throw new ControlError(404, `unknown topic ${topic}`);
  return threadId;
}

function chatRef(world: TelegramWorld, ref: string): number {
  const named = world.ids.chats[ref];
  if (named !== undefined) return named;
  const id = Number(ref);
  if (!Number.isInteger(id)) throw new ControlError(404, `unknown chat ${ref}`);
  return id;
}

function userRef(world: TelegramWorld, ref: unknown): number {
  if (typeof ref === "number") return ref;
  if (typeof ref !== "string" || !ref) throw new ControlError(400, "user reference is required");
  const named = world.ids.users[ref];
  if (named !== undefined) return named;
  const id = Number(ref);
  if (!Number.isInteger(id)) throw new ControlError(404, `unknown user ${ref}`);
  return id;
}

function integer(value: unknown, field: string): number {
  const number = Number(value);
  if (!Number.isInteger(number)) throw new ControlError(400, `${field} must be an integer`);
  return number;
}

function requireString(body: Body, field: string): string {
  const value = optionalString(body, field);
  if (!value) throw new ControlError(400, `${field} is required`);
  return value;
}

function optionalString(body: Body, field: string): string | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new ControlError(400, `${field} must be a string`);
  return value;
}

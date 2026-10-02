import { randomUUID } from "node:crypto";
import type { Store } from "@emulators/core";
import type { TelegramBackend, TelegramBackendFactory, TelegramBotMembership, TelegramCall } from "./backend/types.js";

export interface TelegramSeedBot {
  token: string;
  username: string;
  first_name?: string;
  description?: string;
  short_description?: string;
  /** Deliver this bot's updates to a webhook from startup, as if it had called setWebhook. */
  webhook?: TelegramSeedWebhook;
}

export interface TelegramSeedWebhook {
  url: string;
  secret_token?: string;
  allowed_updates?: string[];
}

export interface TelegramSeedUser {
  name: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramSeedChatBot {
  bot: string;
  status?: "administrator" | "member";
  rights?: Record<string, boolean>;
}

export interface TelegramSeedChat {
  name: string;
  title?: string;
  type?: "supergroup" | "group" | "channel";
  owner: string;
  forum?: boolean;
  members?: string[];
  bots?: Array<string | TelegramSeedChatBot>;
  topics?: string[];
}

export interface TelegramSeedConfig {
  port?: number;
  bots?: TelegramSeedBot[];
  users?: TelegramSeedUser[];
  chats?: TelegramSeedChat[];
}

export interface ResolvedTelegramSeed {
  bots: TelegramSeedBot[];
  users: TelegramSeedUser[];
  chats: TelegramSeedChat[];
}

export const DEFAULT_TELEGRAM_BOT: TelegramSeedBot = {
  token: "1000000001:emulate-telegram-bot-token",
  username: "emulate_bot",
  first_name: "Emulate Bot",
};

export const DEFAULT_TELEGRAM_USER: TelegramSeedUser = {
  name: "developer",
  first_name: "Developer",
  username: "developer",
};

const SEED_KEY = "telegram.seed";
const GENERATION_KEY = "telegram.generation";

export function writeTelegramSeed(store: Store, seed: ResolvedTelegramSeed): void {
  store.setData(SEED_KEY, seed);
  store.setData(GENERATION_KEY, randomUUID());
}

export function readTelegramSeed(store: Store): ResolvedTelegramSeed {
  const seed = store.getData<ResolvedTelegramSeed>(SEED_KEY);
  if (!seed) throw new Error("telegram emulator was not seeded");
  return seed;
}

export interface TelegramIds {
  bots: Record<string, number>;
  users: Record<string, number>;
  chats: Record<string, number>;
  topics: Record<string, Record<string, number>>;
}

export interface TelegramBotProfile {
  description: Record<string, string>;
  short_description: Record<string, string>;
}

export interface TelegramTopicMeta {
  icon_color: number;
  icon_custom_emoji_id?: string;
}

export interface TelegramWorld {
  generation: string;
  backend: TelegramBackend;
  ids: TelegramIds;
  botIdsByToken: Map<string, number>;
  profiles: Map<number, TelegramBotProfile>;
  topicMeta: Map<string, TelegramTopicMeta>;
  adapterCalls: TelegramCall[];
  seedCallCount: number;
}

export function botIdFromToken(token: string): number {
  const match = /^(\d+):[A-Za-z0-9_-]+$/.exec(token);
  if (!match) throw new Error(`telegram bot token ${token} must look like <numeric id>:<secret>`);
  return Number(match[1]);
}

export class TelegramRuntime {
  private current: Promise<TelegramWorld> | undefined;
  private currentGeneration: string | undefined;

  constructor(
    private readonly store: Store,
    private readonly createBackend: TelegramBackendFactory,
  ) {}

  world(): Promise<TelegramWorld> {
    const generation = this.store.getData<string>(GENERATION_KEY);
    if (!generation) throw new Error("telegram emulator was not seeded");
    if (this.current && this.currentGeneration === generation) return this.current;

    const previous = this.current;
    this.currentGeneration = generation;
    this.current = (async () => {
      if (previous) await (await previous.catch(() => undefined))?.backend.stop();
      return buildWorld(generation, readTelegramSeed(this.store), this.createBackend);
    })();
    return this.current;
  }

  async close(): Promise<void> {
    const current = this.current;
    this.current = undefined;
    this.currentGeneration = undefined;
    if (current) await (await current.catch(() => undefined))?.backend.stop();
  }
}

async function buildWorld(
  generation: string,
  seed: ResolvedTelegramSeed,
  createBackend: TelegramBackendFactory,
): Promise<TelegramWorld> {
  const primary = seed.bots[0];
  if (!primary) throw new Error("telegram seed needs at least one bot");
  const backend = await createBackend(primary);
  try {
    const ids: TelegramIds = { bots: {}, users: {}, chats: {}, topics: {} };
    const botIdsByToken = new Map<string, number>();
    const profiles = new Map<number, TelegramBotProfile>();

    for (const bot of seed.bots) {
      if (ids.bots[bot.username] !== undefined) throw new Error(`telegram seed bot ${bot.username} is listed twice`);
      const id = bot === primary ? botIdFromToken(bot.token) : (await backend.addBot(bot)).id;
      ids.bots[bot.username] = id;
      botIdsByToken.set(bot.token, id);
      profiles.set(id, {
        description: bot.description === undefined ? {} : { "": bot.description },
        short_description: bot.short_description === undefined ? {} : { "": bot.short_description },
      });
    }
    for (const user of seed.users) {
      if (ids.users[user.name] !== undefined) throw new Error(`telegram seed user ${user.name} is listed twice`);
      ids.users[user.name] = await backend.createUser({
        first_name: user.first_name ?? user.name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
      });
    }

    const userId = (ref: string, owner: string) => {
      const id = ids.users[ref];
      if (id === undefined) throw new Error(`telegram seed ${owner} references unknown user ${ref}`);
      return id;
    };
    const botId = (ref: string, owner: string) => {
      const id = ids.bots[ref];
      if (id === undefined) throw new Error(`telegram seed ${owner} references unknown bot ${ref}`);
      return id;
    };

    for (const chat of seed.chats) {
      if (ids.chats[chat.name] !== undefined) throw new Error(`telegram seed chat ${chat.name} is listed twice`);
      const owner = userId(chat.owner, `chat ${chat.name}`);
      const chatId = await backend.createChat({
        title: chat.title ?? chat.name,
        type: chat.type,
        owner_id: owner,
        forum: chat.forum,
      });
      ids.chats[chat.name] = chatId;
      for (const member of chat.members ?? []) {
        const memberId = userId(member, `chat ${chat.name}`);
        if (memberId !== owner) await backend.join(chatId, memberId);
      }
      if (chat.topics?.length) {
        if (!chat.forum) throw new Error(`telegram seed chat ${chat.name} has topics but is not a forum`);
        ids.topics[chat.name] = {};
        for (const topic of chat.topics) {
          ids.topics[chat.name]![topic] = await backend.createTopic(chatId, topic, owner);
        }
      }
      for (const entry of chat.bots ?? []) {
        const spec: TelegramSeedChatBot = typeof entry === "string" ? { bot: entry } : entry;
        const membership: TelegramBotMembership = { status: spec.status ?? "administrator", rights: spec.rights };
        await backend.setBotMembership(chatId, botId(spec.bot, `chat ${chat.name}`), membership);
      }
    }

    await drainSeedUpdates(backend, seed.bots);
    await registerSeedWebhooks(backend, seed.bots);
    const { calls } = await backend.getCalls();

    return {
      generation,
      backend,
      ids,
      botIdsByToken,
      profiles,
      topicMeta: new Map(),
      adapterCalls: [],
      seedCallCount: calls.length,
    };
  } catch (error) {
    await backend.stop();
    throw error;
  }
}

/** Seeding adds bots to chats, which queues my_chat_member updates; a fresh emulator starts with empty queues. */
async function drainSeedUpdates(backend: TelegramBackend, bots: TelegramSeedBot[]): Promise<void> {
  for (const bot of bots) {
    const call = async (params: Record<string, unknown>) => {
      const response = await fetch(`${backend.origin}/bot${bot.token}/getUpdates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const body = (await response.json()) as {
        ok: boolean;
        result?: Array<{ update_id: number }>;
        description?: string;
      };
      if (!body.ok || !body.result) throw new Error(`telegram seed could not drain updates: ${body.description}`);
      return body.result;
    };
    const pending = await call({ timeout: 0 });
    const last = pending.at(-1);
    if (last) await call({ timeout: 0, offset: last.update_id + 1 });
  }
}

async function registerSeedWebhooks(backend: TelegramBackend, bots: TelegramSeedBot[]): Promise<void> {
  for (const bot of bots) {
    if (!bot.webhook) continue;
    if (!bot.webhook.url) throw new Error(`telegram seed bot ${bot.username} has a webhook without a url`);
    const response = await fetch(`${backend.origin}/bot${bot.token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bot.webhook),
    });
    const body = (await response.json()) as { ok: boolean; description?: string };
    if (!body.ok) throw new Error(`telegram seed bot ${bot.username} webhook was refused: ${body.description}`);
  }
}

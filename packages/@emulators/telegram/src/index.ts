import type { AppEnv, Hono, ServicePlugin, ServicePluginDisposer, Store, WebhookDispatcher } from "@emulators/core";
import { renderInspectorPage, renderJsonDetails } from "@emulators/core";
import { createTestServerBackend } from "./backend/test-server.js";
import type { TelegramBackendFactory } from "./backend/types.js";
import { botApiRoutes } from "./routes/bot-api.js";
import { controlRoutes } from "./routes/control.js";
import {
  DEFAULT_TELEGRAM_BOT,
  DEFAULT_TELEGRAM_USER,
  TelegramRuntime,
  botIdFromToken,
  readTelegramSeed,
  writeTelegramSeed,
  type TelegramSeedConfig,
} from "./runtime.js";

export type * from "./backend/types.js";
export { TelegramBackendError } from "./backend/types.js";
export { TELEGRAM_ADAPTER_METHODS } from "./routes/bot-api.js";
export {
  DEFAULT_TELEGRAM_BOT,
  DEFAULT_TELEGRAM_USER,
  type TelegramSeedBot,
  type TelegramSeedChat,
  type TelegramSeedChatBot,
  type TelegramSeedConfig,
  type TelegramSeedUser,
  type TelegramSeedWebhook,
  type TelegramIds,
} from "./runtime.js";

function seedDefaults(store: Store): void {
  writeTelegramSeed(store, { bots: [DEFAULT_TELEGRAM_BOT], users: [DEFAULT_TELEGRAM_USER], chats: [] });
}

/** Configured bots replace the default bot; configured users and chats add to the defaults. */
export function seedFromConfig(
  store: Store,
  _baseUrl: string,
  config: TelegramSeedConfig,
  _webhooks?: WebhookDispatcher,
): void {
  const current = readTelegramSeed(store);
  const bots = config.bots?.length ? config.bots : current.bots;
  for (const bot of bots) botIdFromToken(bot.token);
  writeTelegramSeed(store, {
    bots,
    users: [
      ...current.users.filter((user) => !config.users?.some((configured) => configured.name === user.name)),
      ...(config.users ?? []),
    ],
    chats: [...current.chats, ...(config.chats ?? [])],
  });
}

export function createTelegramPlugin(createBackend: TelegramBackendFactory = createTestServerBackend): ServicePlugin {
  return {
    name: "telegram",
    rateLimit: false,
    register(app: Hono<AppEnv>, store: Store): ServicePluginDisposer {
      const runtime = new TelegramRuntime(store, createBackend);

      app.get("/", async (c) => {
        const world = await runtime.world();
        const { calls, unimplemented } = await world.backend.getCalls();
        const tab = c.req.query("tab") === "calls" ? "calls" : "seed";
        const body =
          tab === "calls"
            ? renderJsonDetails("Bot API calls", { calls: calls.slice(world.seedCallCount), unimplemented }, true)
            : renderJsonDetails("Seeded ids", world.ids, true);
        return c.html(
          renderInspectorPage(
            "Telegram Inspector",
            [
              { id: "seed", label: "Seed", href: "/?tab=seed" },
              { id: "calls", label: "Calls", href: "/?tab=calls" },
            ],
            tab,
            body,
            "Telegram Bot API emulator",
          ),
        );
      });
      botApiRoutes(app, runtime, controlRoutes(app, runtime));

      return () => runtime.close();
    },
    seed(store: Store): void {
      seedDefaults(store);
    },
  };
}

export const telegramPlugin = createTelegramPlugin();

export default telegramPlugin;

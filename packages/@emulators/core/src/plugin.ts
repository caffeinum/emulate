import type { Hono } from "./http.js";
import type { Store } from "./store.js";
import type { WebhookDispatcher } from "./webhooks.js";
import type { TokenMap, AppEnv } from "./middleware/auth.js";

export interface RouteContext {
  app: Hono<AppEnv>;
  store: Store;
  webhooks: WebhookDispatcher;
  baseUrl: string;
  tokenMap?: TokenMap;
}

export type ServicePluginDisposer = () => Promise<void>;

export interface ServicePlugin {
  name: string;
  /** Set to false for APIs that authenticate in the path and have no rate limit of their own. */
  rateLimit?: boolean;
  /** May return a disposer that the host awaits when the emulator closes. */
  register(
    app: Hono<AppEnv>,
    store: Store,
    webhooks: WebhookDispatcher,
    baseUrl: string,
    tokenMap?: TokenMap,
  ): void | ServicePluginDisposer;
  seed?(store: Store, baseUrl: string): void;
}

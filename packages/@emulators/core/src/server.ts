import { Hono, cors } from "./http.js";
import { Store } from "./store.js";
import { WebhookDispatcher } from "./webhooks.js";
import { createApiErrorHandler, createErrorHandler } from "./middleware/error-handler.js";
import {
  authMiddleware,
  type AuthFallback,
  type TokenMap,
  type AppKeyResolver,
  type AppEnv,
} from "./middleware/auth.js";
import type { ServicePlugin } from "./plugin.js";
import { registerFontRoutes } from "./fonts.js";

export interface ServerOptions {
  port?: number;
  baseUrl?: string;
  docsUrl?: string;
  tokens?: Record<string, { login: string; id: number; scopes?: string[] }>;
  appKeyResolver?: AppKeyResolver;
  fallbackUser?: AuthFallback;
}

export function createServer(plugin: ServicePlugin, options: ServerOptions = {}) {
  const port = options.port ?? 4000;
  const baseUrl = options.baseUrl ?? `http://localhost:${port}`;

  const app = new Hono<AppEnv>();
  const store = new Store();
  const webhooks = new WebhookDispatcher();

  const tokenMap: TokenMap = new Map();
  if (options.tokens) {
    for (const [token, user] of Object.entries(options.tokens)) {
      tokenMap.set(token, {
        login: user.login,
        id: user.id,
        scopes: user.scopes ?? ["repo", "user", "admin:org", "admin:repo_hook"],
      });
    }
  }

  const docsUrl = options.docsUrl ?? `https://emulate.dev/${plugin.name}`;

  registerFontRoutes(app);

  app.onError(createApiErrorHandler(docsUrl));
  app.use("*", cors());
  app.use("*", createErrorHandler(docsUrl));
  app.use("*", authMiddleware(tokenMap, options.appKeyResolver, options.fallbackUser));

  const rateLimitCounters = new Map<string, { remaining: number; resetAt: number }>();
  let lastPruneAt = Math.floor(Date.now() / 1000);

  app.use("*", async (c, next) => {
    if (plugin.rateLimit === false) return next();
    const token = c.get("authToken") ?? "__anonymous__";
    const now = Math.floor(Date.now() / 1000);

    if (now - lastPruneAt > 3600) {
      for (const [key, val] of rateLimitCounters) {
        if (val.resetAt <= now) rateLimitCounters.delete(key);
      }
      lastPruneAt = now;
    }

    let counter = rateLimitCounters.get(token);
    if (!counter || counter.resetAt <= now) {
      counter = { remaining: 5000, resetAt: now + 3600 };
      rateLimitCounters.set(token, counter);
    }

    counter.remaining = Math.max(0, counter.remaining - 1);

    c.header("X-RateLimit-Limit", "5000");
    c.header("X-RateLimit-Remaining", String(counter.remaining));
    c.header("X-RateLimit-Reset", String(counter.resetAt));
    c.header("X-RateLimit-Resource", "core");

    if (counter.remaining === 0) {
      return c.json(
        {
          message: "API rate limit exceeded",
          documentation_url: docsUrl,
        },
        403,
      );
    }

    await next();
  });

  // A JSON log of recent requests so tests can assert what the emulator saw.
  const requests: Array<{ at: string; method: string; path: string; query: string; status: number; body?: string }> =
    [];
  app.get("/_emulate/requests", (c) => c.json(requests));
  app.delete("/_emulate/requests", (c) => {
    requests.length = 0;
    return c.body(null, 204);
  });
  const handle = app.fetch;
  app.fetch = async (request) => {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/_emulate/")) return handle(request);
    const textual = !/multipart|octet-stream/.test(request.headers.get("Content-Type") ?? "");
    const body = request.body && textual ? (await request.clone().text()).slice(0, 10_000) : undefined;
    const response = await handle(request);
    requests.push({
      at: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      query: url.search,
      status: response.status,
      ...(body ? { body } : {}),
    });
    if (requests.length > 1000) requests.shift();
    return response;
  };

  const close = plugin.register(app, store, webhooks, baseUrl, tokenMap) ?? (async () => {});

  app.notFound((c) =>
    c.json(
      {
        message: "Not Found",
        documentation_url: docsUrl,
      },
      404,
    ),
  );

  return { app, store, webhooks, port, baseUrl, tokenMap, close };
}

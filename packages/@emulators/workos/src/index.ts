import { randomUUID } from "node:crypto";
import type { AppEnv, Hono, ServicePlugin, Store, WebhookDispatcher } from "@emulators/core";
import { createEmulator, type EmulatorOptions, type EmulatorSeedConfig } from "@workos/emulate";

/** `workos:` config: @workos/emulate's seed (users, organizations, apiKeys, ...) plus its emulator options. */
export type WorkOSSeedConfig = EmulatorSeedConfig &
  Pick<EmulatorOptions, "issuer" | "signingKey" | "allowedRedirectHosts" | "interactiveAuth"> & {
    port?: number;
    baseUrl?: string;
  };

const CONFIG_KEY = "workos.config";
const GENERATION_KEY = "workos.generation";
type Instance = Awaited<ReturnType<typeof createEmulator>>;

export function seedFromConfig(
  store: Store,
  _baseUrl: string,
  config: WorkOSSeedConfig,
  _webhooks?: WebhookDispatcher,
) {
  store.setData(CONFIG_KEY, config);
  store.setData(GENERATION_KEY, randomUUID());
}

/**
 * Runs @workos/emulate in-process on a private port and proxies this service's port to it.
 * A reset starts a fresh instance, since @workos/emulate's own reset() stops authentication events.
 */
export const workosPlugin: ServicePlugin = {
  name: "workos",
  rateLimit: false,
  register(app: Hono<AppEnv>, store: Store, _webhooks: WebhookDispatcher, baseUrl: string) {
    let current: { generation: string; instance: Promise<Instance> } | undefined;
    const stop = async () => (await current?.instance.catch(() => undefined))?.close();
    const instance = async () => {
      const generation = store.getData<string>(GENERATION_KEY);
      if (!generation) throw new Error("workos emulator was not seeded");
      if (current?.generation !== generation) {
        const previous = stop();
        const {
          port: _port,
          baseUrl: _baseUrl,
          issuer,
          signingKey,
          allowedRedirectHosts,
          interactiveAuth,
          ...seed
        } = store.getData<WorkOSSeedConfig>(CONFIG_KEY) ?? {};
        current = {
          generation,
          instance: previous.then(() =>
            createEmulator({
              port: 0,
              seed,
              issuer: issuer ?? baseUrl,
              signingKey,
              allowedRedirectHosts,
              interactiveAuth,
            }),
          ),
        };
      }
      return current.instance;
    };
    for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
      app.on(method, "/*", async (c) => {
        const { url } = await instance();
        const incoming = new URL(c.req.url);
        const headers = new Headers(c.req.raw.headers);
        headers.delete("host");
        const upstream = await fetch(`${url}${incoming.pathname}${incoming.search}`, {
          method,
          headers,
          body: method === "GET" ? undefined : await c.req.arrayBuffer(),
          redirect: "manual",
        });
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
      });
    }
    return stop;
  },
  seed(store: Store) {
    seedFromConfig(store, "", {});
  },
};

export default workosPlugin;

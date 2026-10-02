import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createServer as createHttpServer } from "node:http";
import { createServer, serve } from "@emulators/core";
import { seedFromConfig, telegramPlugin, type TelegramSeedConfig } from "../index.js";

export const BOT_TOKEN = "7000000001:test-bot-secret";
export const OTHER_BOT_TOKEN = "7000000002:other-bot-secret";

export const SEED: TelegramSeedConfig = {
  bots: [
    { token: BOT_TOKEN, username: "test_bot", first_name: "Test Bot", description: "seeded description" },
    { token: OTHER_BOT_TOKEN, username: "other_bot" },
  ],
  users: [
    { name: "alice", first_name: "Alice", username: "alice" },
    { name: "bob", first_name: "Bob" },
  ],
  chats: [
    {
      name: "team",
      title: "Team",
      owner: "alice",
      forum: true,
      members: ["bob"],
      bots: ["test_bot"],
      topics: ["ideas"],
    },
    { name: "plain", owner: "alice", members: ["bob"], bots: [{ bot: "test_bot", status: "member" }] },
  ],
};

export interface TelegramTestEmulator {
  url: string;
  apiRoot: string;
  bot(method: string, params?: Record<string, unknown>, token?: string): Promise<any>;
  control(method: "GET" | "POST", path: string, body?: Record<string, unknown>): Promise<any>;
  reseed(): void;
  close(): Promise<void>;
}

export async function startTelegramEmulator(seed: TelegramSeedConfig = SEED): Promise<TelegramTestEmulator> {
  const server = createServer(telegramPlugin, { port: 0 });
  const seedStore = () => {
    telegramPlugin.seed?.(server.store, "");
    seedFromConfig(server.store, "", seed);
  };
  seedStore();
  const http = serve({ fetch: server.app.fetch, port: 0, hostname: "127.0.0.1" }) as unknown as Server;
  await new Promise<void>((resolve) => (http.listening ? resolve() : http.once("listening", () => resolve())));
  const url = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;

  return {
    url,
    apiRoot: url,
    async bot(method, params = {}, token = BOT_TOKEN) {
      const response = await fetch(`${url}/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return response.json();
    },
    async control(method, path, body) {
      const response = await fetch(`${url}/_telegram/${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(`control ${method} ${path} failed: ${JSON.stringify(payload)}`);
      return payload;
    },
    reseed: () => {
      server.store.reset();
      seedStore();
    },
    async close() {
      await server.close();
      http.closeAllConnections();
      await new Promise<void>((resolve) => http.close(() => resolve()));
    },
  };
}

export interface WebhookReceiver {
  url: string;
  requests: Array<{ headers: Record<string, string | string[] | undefined>; body: any }>;
  next(): Promise<{ headers: Record<string, string | string[] | undefined>; body: any }>;
  close(): Promise<void>;
}

export async function startWebhookReceiver(): Promise<WebhookReceiver> {
  const requests: WebhookReceiver["requests"] = [];
  const waiters: Array<() => void> = [];
  const server = createHttpServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      requests.push({ headers: req.headers, body: JSON.parse(raw) });
      res.end("ok");
      waiters.splice(0).forEach((wake) => wake());
    });
  }).listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  let consumed = 0;
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/hook`,
    requests,
    async next() {
      while (requests.length <= consumed) await new Promise<void>((resolve) => waiters.push(resolve));
      return requests[consumed++]!;
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

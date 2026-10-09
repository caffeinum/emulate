import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { WebSocketServer, type WebSocket } from "ws";
import type { Context, RouteContext } from "@emulators/core";
import { getSlackStore } from "./store.js";
import { parseSlackBody, slackError, slackOk } from "./helpers.js";

interface Connection {
  id: string;
  appId: string;
  socket: WebSocket;
  connectedAt: number;
}

const DISCONNECT_REASONS = ["refresh_requested", "warning", "link_disabled"];

/**
 * Socket Mode: apps.connections.open hands out a one-time ws:// url on a private port.
 * Every event_callback the emulator dispatches is also sent to one connection per app as an
 * events_api envelope. Acks are tracked and visible at GET /_slack/socket_mode.
 */
export function socketModeRoutes({ app, store, webhooks }: RouteContext): () => Promise<void> {
  const tickets = new Map<string, string>();
  const connections: Connection[] = [];
  const unacked = new Map<string, { app_id: string; event_type: unknown }>();
  const nextIndex = new Map<string, number>();
  let listening: Promise<{ http: Server; port: number }> | undefined;

  const listen = () =>
    (listening ??= new Promise((resolve, reject) => {
      const wss = new WebSocketServer({ noServer: true });
      const http = createServer((_req, res) => res.writeHead(426).end());
      http.on("upgrade", (req, socket, head) => {
        const url = new URL(req.url ?? "/", "ws://localhost");
        const ticket = url.searchParams.get("ticket") ?? "";
        const appId = tickets.get(ticket);
        if (url.pathname !== "/link/" || !appId) {
          socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
          return;
        }
        tickets.delete(ticket);
        wss.handleUpgrade(req, socket, head, (ws) => accept(ws, appId));
      });
      http.once("error", reject);
      http.listen(0, "127.0.0.1", () => resolve({ http, port: (http.address() as AddressInfo).port }));
    }));

  const accept = (socket: WebSocket, appId: string) => {
    const connection = { id: randomUUID(), appId, socket, connectedAt: Math.floor(Date.now() / 1000) };
    connections.push(connection);
    const ping = setInterval(() => socket.ping(), 10_000).unref();
    socket.on("message", (data) => {
      let frame: { envelope_id?: string };
      try {
        frame = JSON.parse(String(data));
      } catch {
        socket.close(1007, "frames must be JSON");
        return;
      }
      if (frame.envelope_id) unacked.delete(frame.envelope_id);
    });
    socket.on("close", () => {
      clearInterval(ping);
      const index = connections.indexOf(connection);
      if (index >= 0) connections.splice(index, 1);
    });
    socket.send(
      JSON.stringify({
        type: "hello",
        num_connections: connections.filter((c) => c.appId === appId).length,
        debug_info: { host: "emulate", build_number: 1, approximate_connection_time: 18060 },
        connection_info: { app_id: appId },
      }),
    );
  };

  const deliver = (payload: Record<string, unknown>) => {
    for (const appId of new Set(connections.map((c) => c.appId))) {
      const candidates = connections.filter((c) => c.appId === appId);
      const index = (nextIndex.get(appId) ?? 0) % candidates.length;
      nextIndex.set(appId, index + 1);
      const envelopeId = randomUUID();
      unacked.set(envelopeId, { app_id: appId, event_type: (payload.event as { type?: unknown })?.type });
      candidates[index].socket.send(
        JSON.stringify({
          envelope_id: envelopeId,
          payload: { ...payload, api_app_id: appId },
          type: "events_api",
          accepts_response_payload: false,
          retry_attempt: 0,
          retry_reason: "",
        }),
      );
    }
  };

  const dispatch = webhooks.dispatch.bind(webhooks);
  webhooks.dispatch = async (event, action, payload, owner, repo) => {
    const envelope = payload as Record<string, unknown> | undefined;
    if (owner === "slack" && envelope?.type === "event_callback") deliver(envelope);
    return dispatch(event, action, payload, owner, repo);
  };

  const appIdForToken = (c: Context) => {
    const token = (c.req.header("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!token.startsWith("xapp-")) return { error: token ? "not_allowed_token_type" : "not_authed" };
    const ss = getSlackStore(store);
    const record = ss.tokens.findOneBy("token", token);
    const appId =
      record?.app_id ?? (record?.client_id ? ss.oauthApps.findOneBy("client_id", record.client_id)?.app_id : undefined);
    return appId ? { appId } : { error: "invalid_auth" };
  };

  app.post("/api/apps.connections.open", async (c) => {
    const { appId, error } = appIdForToken(c);
    if (!appId) return slackError(c, error!);
    const { port } = await listen();
    const ticket = randomUUID();
    tickets.set(ticket, appId);
    return slackOk(c, { url: `ws://127.0.0.1:${port}/link/?ticket=${ticket}&app_id=${appId}` });
  });

  app.get("/_slack/socket_mode", (c) =>
    c.json({
      connections: connections.map((conn) => ({ id: conn.id, app_id: conn.appId, connected_at: conn.connectedAt })),
      unacked: [...unacked].map(([envelope_id, info]) => ({ envelope_id, ...info })),
    }),
  );

  app.post("/_slack/socket_mode/disconnect", async (c) => {
    const body = await parseSlackBody(c);
    const reason = typeof body.reason === "string" ? body.reason : "refresh_requested";
    if (!DISCONNECT_REASONS.includes(reason)) {
      return c.json({ error: `reason must be one of ${DISCONNECT_REASONS.join(", ")}` }, 400);
    }
    const targets = connections.filter((conn) => !body.app_id || conn.appId === body.app_id);
    for (const conn of targets) {
      conn.socket.send(JSON.stringify({ type: "disconnect", reason, debug_info: { host: "emulate" } }));
      if (reason !== "warning") conn.socket.close();
    }
    return c.json({ disconnected: targets.length });
  });

  return async () => {
    for (const conn of [...connections]) conn.socket.terminate();
    const server = await listening?.catch(() => undefined);
    if (server) await new Promise<void>((resolve) => server.http.close(() => resolve()));
  };
}

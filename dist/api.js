import {
  jwtVerify
} from "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// ../@emulators/core/dist/index.js
import { createServer as createNodeServer } from "http";
import { createHmac } from "crypto";
import { createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile, mkdir, open, link, rename, unlink } from "fs/promises";
import { dirname as dirname2 } from "path";
import { randomUUID } from "crypto";
function serializeValue(value) {
  if (value instanceof Map) {
    return { __type: "Map", entries: [...value.entries()].map(([k, v]) => [k, serializeValue(v)]) };
  }
  if (value instanceof Set) {
    return { __type: "Set", values: [...value.values()] };
  }
  return value;
}
function deserializeValue(value) {
  if (value !== null && typeof value === "object" && "__type" in value) {
    const tagged = value;
    if (tagged.__type === "Map") {
      const entries = tagged.entries;
      return new Map(entries.map(([k, v]) => [k, deserializeValue(v)]));
    }
    if (tagged.__type === "Set") {
      return new Set(tagged.values);
    }
  }
  return value;
}
var Collection = class {
  constructor(indexFields = []) {
    this.indexFields = indexFields;
    this.fieldNames = indexFields.map(String).sort();
    for (const field of indexFields) {
      this.indexes.set(String(field), /* @__PURE__ */ new Map());
    }
  }
  items = /* @__PURE__ */ new Map();
  indexes = /* @__PURE__ */ new Map();
  autoId = 1;
  fieldNames;
  addToIndex(item) {
    for (const field of this.indexFields) {
      const value = item[field];
      if (value === void 0 || value === null) continue;
      const indexMap = this.indexes.get(String(field));
      const key = String(value);
      if (!indexMap.has(key)) {
        indexMap.set(key, /* @__PURE__ */ new Set());
      }
      indexMap.get(key).add(item.id);
    }
  }
  removeFromIndex(item) {
    for (const field of this.indexFields) {
      const value = item[field];
      if (value === void 0 || value === null) continue;
      const indexMap = this.indexes.get(String(field));
      const key = String(value);
      indexMap.get(key)?.delete(item.id);
    }
  }
  insert(data) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const explicitId = data.id != null && data.id > 0 ? data.id : void 0;
    const id = explicitId ?? this.autoId++;
    if (id >= this.autoId) {
      this.autoId = id + 1;
    }
    const item = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };
    this.items.set(id, item);
    this.addToIndex(item);
    return item;
  }
  get(id) {
    return this.items.get(id);
  }
  findBy(field, value) {
    if (this.indexes.has(String(field))) {
      const ids = this.indexes.get(String(field)).get(String(value));
      if (!ids) return [];
      return Array.from(ids).map((id) => this.items.get(id)).filter(Boolean);
    }
    return this.all().filter((item) => item[field] === value);
  }
  findOneBy(field, value) {
    return this.findBy(field, value)[0];
  }
  update(id, data) {
    const existing = this.items.get(id);
    if (!existing) return void 0;
    this.removeFromIndex(existing);
    const updated = {
      ...existing,
      ...data,
      id,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.items.set(id, updated);
    this.addToIndex(updated);
    return updated;
  }
  delete(id) {
    const existing = this.items.get(id);
    if (!existing) return false;
    this.removeFromIndex(existing);
    return this.items.delete(id);
  }
  all() {
    return Array.from(this.items.values());
  }
  query(options = {}) {
    let results = this.all();
    if (options.filter) {
      results = results.filter(options.filter);
    }
    const total_count = results.length;
    if (options.sort) {
      results.sort(options.sort);
    }
    const page = options.page ?? 1;
    const per_page = Math.min(options.per_page ?? 30, 100);
    const start = (page - 1) * per_page;
    const paged = results.slice(start, start + per_page);
    return {
      items: paged,
      total_count,
      page,
      per_page,
      has_next: start + per_page < total_count,
      has_prev: page > 1
    };
  }
  count(filter) {
    if (!filter) return this.items.size;
    return this.all().filter(filter).length;
  }
  clear() {
    this.items.clear();
    for (const indexMap of this.indexes.values()) {
      indexMap.clear();
    }
    this.autoId = 1;
  }
  snapshot() {
    return {
      items: this.all(),
      autoId: this.autoId,
      indexFields: this.fieldNames
    };
  }
  restore(snap) {
    this.clear();
    this.autoId = snap.autoId;
    for (const item of snap.items) {
      this.items.set(item.id, item);
      this.addToIndex(item);
    }
  }
};
var Store = class {
  collections = /* @__PURE__ */ new Map();
  _data = /* @__PURE__ */ new Map();
  collection(name, indexFields = []) {
    const existing = this.collections.get(name);
    if (existing) {
      if (indexFields.length > 0) {
        const requested = indexFields.map(String).sort();
        if (existing.fieldNames.length !== requested.length || existing.fieldNames.some((f, i) => f !== requested[i])) {
          throw new Error(
            `Collection "${name}" already exists with indexes [${existing.fieldNames}] but was requested with [${requested}]`
          );
        }
      }
      return existing;
    }
    const col = new Collection(indexFields);
    this.collections.set(name, col);
    return col;
  }
  getData(key) {
    return this._data.get(key);
  }
  setData(key, value) {
    this._data.set(key, value);
  }
  reset() {
    for (const collection of this.collections.values()) {
      collection.clear();
    }
    this._data.clear();
  }
  snapshot() {
    const collections = {};
    for (const [name, col] of this.collections) {
      collections[name] = col.snapshot();
    }
    const data = {};
    for (const [key, value] of this._data) {
      data[key] = serializeValue(value);
    }
    return { collections, data };
  }
  restore(snap) {
    const snapshotNames = new Set(Object.keys(snap.collections));
    for (const name of this.collections.keys()) {
      if (!snapshotNames.has(name)) {
        this.collections.delete(name);
      }
    }
    for (const [name, colSnap] of Object.entries(snap.collections)) {
      const indexFields = colSnap.indexFields;
      const col = this.collection(name, indexFields);
      col.restore(colSnap);
    }
    this._data.clear();
    for (const [key, value] of Object.entries(snap.data)) {
      this._data.set(key, deserializeValue(value));
    }
  }
};
var HonoRequest = class {
  constructor(request, params, strictJson = false) {
    this.params = params;
    this.strictJson = strictJson;
    this.raw = request;
    this.url = request.url;
    this.method = request.method;
    this.path = new URL(request.url).pathname;
  }
  raw;
  url;
  method;
  path;
  header(name) {
    if (name) return this.raw.headers.get(name) ?? void 0;
    const headers = {};
    this.raw.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
  query(name) {
    return new URL(this.url).searchParams.get(name) ?? void 0;
  }
  queries(name) {
    const values = new URL(this.url).searchParams.getAll(name);
    return values.length > 0 ? values : void 0;
  }
  param(name) {
    if (!name) return { ...this.params };
    return this.params[name] ?? "";
  }
  async json() {
    try {
      return await this.raw.json();
    } catch (error) {
      if (!this.strictJson) throw error;
      throw Object.assign(new Error("Invalid JSON request body", { cause: error }), { status: 400 });
    }
  }
  text() {
    return this.raw.text();
  }
  arrayBuffer() {
    return this.raw.arrayBuffer();
  }
  async parseBody() {
    const contentType = this.header("Content-Type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      return formDataToObject(await this.raw.formData());
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(await this.raw.text());
      const out = {};
      for (const [key, value] of params) {
        appendBodyValue(out, key, value);
      }
      return out;
    }
    if (contentType.includes("application/json")) {
      const body = this.strictJson ? await this.json() : await this.raw.json().catch(() => ({}));
      return body && typeof body === "object" && !Array.isArray(body) ? body : {};
    }
    return {};
  }
};
var Context = class {
  constructor(request, params, notFoundHandler, strictJson = false) {
    this.notFoundHandler = notFoundHandler;
    this.req = new HonoRequest(request, params, strictJson);
  }
  req;
  vars = /* @__PURE__ */ new Map();
  responseHeaders = new Headers();
  headerOperations = [];
  appliedHeaders = /* @__PURE__ */ new WeakMap();
  responseStatus = 200;
  get(key) {
    return this.vars.get(key);
  }
  set(key, value) {
    this.vars.set(key, value);
  }
  header(name, value, options) {
    if (options?.append) this.responseHeaders.append(name, value);
    else this.responseHeaders.set(name, value);
    this.headerOperations.push({ name, value, append: options?.append === true });
  }
  status(status) {
    this.responseStatus = status;
  }
  json(data, status, headers) {
    return this.response(JSON.stringify(data), status, defaultContentType(headers, "application/json; charset=UTF-8"));
  }
  text(text, status, headers) {
    return this.response(text, status, defaultContentType(headers, "text/plain; charset=UTF-8"));
  }
  html(html, status, headers) {
    return this.response(html, status, defaultContentType(headers, "text/html; charset=UTF-8"));
  }
  body(body, status, headers) {
    return this.response(body, status, headers);
  }
  redirect(location, status = 302) {
    return this.response(null, status, { Location: location });
  }
  notFound() {
    return this.notFoundHandler(this);
  }
  finalize(response) {
    const applied = this.appliedHeaders.get(response) ?? 0;
    if (applied === this.headerOperations.length) return response;
    const headers = new Headers(response.headers);
    mergeHeaders(headers, this.headerOperations.slice(applied));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  response(body, status, headers) {
    const merged = new Headers(headers);
    mergeHeaders(merged, this.headerOperations);
    const response = new Response(body, {
      status: status ?? this.responseStatus,
      headers: merged
    });
    this.appliedHeaders.set(response, this.headerOperations.length);
    return response;
  }
};
function mergeHeaders(target, operations) {
  for (const { name, value, append } of operations) {
    if (append) target.append(name, value);
    else target.set(name, value);
  }
}
var Hono = class {
  constructor(options = {}) {
    this.options = options;
  }
  get routeTable() {
    return this.routes.map((r) => ({ method: r.method, path: r.compiled.pattern, source: r.source }));
  }
  matchedRoute(method, path) {
    const route = this.routes.find((r) => r.method === method && matchPath(r.compiled, path)) ?? (method === "HEAD" ? this.routes.find((r) => r.method === "GET" && matchPath(r.compiled, path)) : void 0);
    return route && { method: route.method, path: route.compiled.pattern, source: route.source };
  }
  middleware = [];
  routes = [];
  errorHandler = (err) => {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(message, { status: 500 });
  };
  notFoundHandler = () => new Response("404 Not Found", { status: 404 });
  use(pathOrHandler, ...handlers) {
    if (typeof pathOrHandler === "string") {
      this.middleware.push({ method: "ALL", compiled: compilePath(pathOrHandler), handlers });
    } else {
      this.middleware.push({ method: "ALL", compiled: compilePath("*"), handlers: [pathOrHandler, ...handlers] });
    }
    return this;
  }
  on(method, path, ...handlers) {
    const compiled = compilePath(path);
    const source = this.options.strictRoutes ? new Error().stack?.split("\n").slice(2).join("\n") : void 0;
    if (this.options.strictRoutes) {
      if (path === "/_emulate" || path.startsWith("/_emulate/"))
        throw new Error(`Route ${method} ${path} uses the reserved /_emulate namespace`);
      const existing = this.routes.find(
        (r) => r.method === method.toUpperCase() && r.compiled.regex.source === compiled.regex.source
      );
      if (existing)
        throw new Error(
          `Duplicate route ${method} ${path}
First registration:${existing.source}
Second registration:${source}`
        );
    }
    this.routes.push({ method: method.toUpperCase(), compiled, handlers, source });
    return this;
  }
  get(path, ...handlers) {
    return this.on("GET", path, ...handlers);
  }
  post(path, ...handlers) {
    return this.on("POST", path, ...handlers);
  }
  put(path, ...handlers) {
    return this.on("PUT", path, ...handlers);
  }
  patch(path, ...handlers) {
    return this.on("PATCH", path, ...handlers);
  }
  delete(path, ...handlers) {
    return this.on("DELETE", path, ...handlers);
  }
  onError(handler) {
    this.errorHandler = handler;
    return this;
  }
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }
  async request(input, init) {
    if (input instanceof Request) return this.fetch(input);
    const url = input.startsWith("/") ? `http://localhost${input}` : input;
    return this.fetch(new Request(url, init));
  }
  fetch = async (request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const matched = this.match(method, path);
    const context = new Context(request, matched.params, this.notFoundHandler, this.options.strictJson);
    try {
      const response = await this.dispatch(context, matched.handlers);
      return context.finalize(response ?? await this.notFoundHandler(context));
    } catch (err) {
      this.options.onError?.(err, request);
      return context.finalize(await this.errorHandler(err, context));
    }
  };
  match(method, path) {
    const handlers = [];
    const params = {};
    for (const route2 of this.middleware) {
      const match = matchPath(route2.compiled, path);
      if (!match) continue;
      Object.assign(params, match);
      for (const handler of route2.handlers) {
        handlers.push({ handler, params: match });
      }
    }
    const route = this.routes.find((candidate) => candidate.method === method && matchPath(candidate.compiled, path) != null) ?? (method === "HEAD" ? this.routes.find((candidate) => candidate.method === "GET" && matchPath(candidate.compiled, path) != null) : void 0);
    if (route) {
      const match = matchPath(route.compiled, path) ?? {};
      Object.assign(params, match);
      for (const handler of route.handlers) {
        handlers.push({ handler, params: match });
      }
    }
    return { handlers, params };
  }
  async dispatch(context, handlers) {
    let index = -1;
    const run = async (nextIndex) => {
      if (nextIndex <= index) throw new Error("next() called multiple times");
      index = nextIndex;
      const matched = handlers[nextIndex];
      if (!matched) return void 0;
      const originalParams = context.req.param();
      Object.assign(originalParams, matched.params);
      let nextResponse = void 0;
      let nextCalled = false;
      const next = async () => {
        nextCalled = true;
        nextResponse = await run(nextIndex + 1);
      };
      const response = await matched.handler(context, next);
      if (response instanceof Response) return response;
      if (nextCalled) return nextResponse;
      return response;
    };
    return run(0);
  }
};
function cors(options = {}) {
  const origin = options.origin ?? "*";
  const allowMethods = options.allowMethods ?? ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"];
  return async (c, next) => {
    c.header("Access-Control-Allow-Origin", origin);
    if (options.credentials) c.header("Access-Control-Allow-Credentials", "true");
    if (c.req.method.toUpperCase() === "OPTIONS") {
      c.header("Access-Control-Allow-Methods", allowMethods.join(","));
      const allowHeaders = options.allowHeaders?.join(",") ?? c.req.header("Access-Control-Request-Headers");
      if (allowHeaders) c.header("Access-Control-Allow-Headers", allowHeaders);
      if (options.maxAge != null) c.header("Access-Control-Max-Age", String(options.maxAge));
      return c.body(null, 204);
    }
    await next();
  };
}
function serve(options) {
  const port = options.port ?? 3e3;
  const server = createNodeServer(async (req, res) => {
    try {
      const request = nodeRequestToFetchRequest(req);
      const response = await options.fetch(request);
      await writeFetchResponse(res, response, req.method?.toUpperCase() === "HEAD");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal Server Error";
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=UTF-8");
      res.end(message);
    }
  });
  server.listen(port, options.hostname ?? "127.0.0.1");
  return server;
}
function compilePath(pattern) {
  if (pattern === "*" || pattern === "/*") {
    return { pattern, regex: /^.*$/, paramNames: [] };
  }
  const paramNames = [];
  let source = "^";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char !== ":") {
      source += escapeRegex(char);
      continue;
    }
    let name = "";
    i++;
    while (i < pattern.length && /[A-Za-z0-9_]/.test(pattern[i])) {
      name += pattern[i];
      i++;
    }
    i--;
    paramNames.push(name);
    if (pattern[i + 1] === "{") {
      const close = pattern.indexOf("}", i + 2);
      if (close < 0) throw new Error(`Invalid route pattern: ${pattern}`);
      const expr = pattern.slice(i + 2, close);
      source += `(${expr})`;
      i = close;
    } else {
      source += "([^/]+)";
    }
  }
  source += "$";
  return { pattern, regex: new RegExp(source), paramNames };
}
function matchPath(compiled, path) {
  const match = compiled.regex.exec(path);
  if (!match) return null;
  const params = {};
  for (let i = 0; i < compiled.paramNames.length; i++) {
    params[compiled.paramNames[i]] = decodePathParam(match[i + 1] ?? "");
  }
  return params;
}
function decodePathParam(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
function defaultContentType(headers, contentType) {
  const out = new Headers(headers);
  if (!out.has("Content-Type")) {
    out.set("Content-Type", contentType);
  }
  return out;
}
function formDataToObject(formData) {
  const out = {};
  for (const [key, value] of formData) {
    appendBodyValue(out, key, value);
  }
  return out;
}
function appendBodyValue(target, key, value) {
  const existing = target[key];
  if (existing === void 0) {
    target[key] = value;
  } else if (Array.isArray(existing)) {
    existing.push(value);
  } else {
    target[key] = [existing, value];
  }
}
function nodeRequestToFetchRequest(req) {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  return new Request(url.toString(), {
    method,
    headers,
    body: hasBody ? req : void 0,
    duplex: "half"
  });
}
async function writeFetchResponse(res, response, headOnly) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;
  const headersWithCookies = response.headers;
  const cookies = headersWithCookies.getSetCookie?.();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie" && cookies && cookies.length > 0) return;
    res.setHeader(key, value);
  });
  if (cookies && cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
  if (headOnly || !response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(value)) {
        await new Promise((resolve) => res.once("drain", resolve));
      }
    }
    res.end();
  } catch (err) {
    res.destroy(err instanceof Error ? err : void 0);
  }
}
var MAX_DELIVERIES = 1e3;
function githubHeaders({ event, body, subscription, deliveryId }) {
  const headers = {
    "Content-Type": "application/json",
    "X-GitHub-Event": event,
    "X-GitHub-Delivery": String(deliveryId)
  };
  if (subscription.secret) {
    const hmac = createHmac("sha256", subscription.secret).update(body).digest("hex");
    headers["X-Hub-Signature-256"] = `sha256=${hmac}`;
  }
  return headers;
}
var WebhookDispatcher = class {
  constructor(options = {}) {
    this.options = options;
    if (options.neutral) this.headerFactory = () => ({ "Content-Type": "application/json" });
  }
  subscriptions = [];
  deliveries = [];
  subscriptionIdCounter = 1;
  deliveryIdCounter = 1;
  headerFactory = githubHeaders;
  setHeaderFactory(factory) {
    this.headerFactory = factory;
  }
  register(sub) {
    const { id: explicitId, ...rest } = sub;
    const id = explicitId !== void 0 ? explicitId : this.subscriptionIdCounter++;
    if (id >= this.subscriptionIdCounter) {
      this.subscriptionIdCounter = id + 1;
    }
    const subscription = { ...rest, id };
    this.subscriptions.push(subscription);
    return subscription;
  }
  unregister(id) {
    const idx = this.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.subscriptions.splice(idx, 1);
    return true;
  }
  getSubscription(id) {
    return this.subscriptions.find((s) => s.id === id);
  }
  getSubscriptions(owner, repo) {
    return this.subscriptions.filter((s) => {
      if (owner && s.owner !== owner) return false;
      if (repo !== void 0 && s.repo !== repo) return false;
      return true;
    });
  }
  updateSubscription(id, data) {
    const sub = this.subscriptions.find((s) => s.id === id);
    if (!sub) return void 0;
    Object.assign(sub, data);
    return sub;
  }
  async dispatch(event, action, payload, owner, repo) {
    const matchingSubs = this.subscriptions.filter((s) => {
      if (!s.active) return false;
      if (s.owner !== owner) return false;
      if (repo !== void 0) {
        if (s.repo !== repo) return false;
      } else if (s.repo !== void 0) {
        return false;
      }
      return event === "ping" || s.events.includes("*") || s.events.includes(event);
    });
    for (const sub of matchingSubs) {
      const delivery = {
        id: this.deliveryIdCounter++,
        hook_id: sub.id,
        event,
        action,
        payload,
        status_code: null,
        delivered_at: (/* @__PURE__ */ new Date()).toISOString(),
        duration: null,
        success: false
      };
      const body = JSON.stringify(payload);
      try {
        const headers = this.headerFactory({ event, action, body, subscription: sub, deliveryId: delivery.id });
        const start = Date.now();
        const response = await fetch(sub.url, {
          method: "POST",
          headers,
          body,
          signal: this.options.signal ? AbortSignal.any([this.options.signal, AbortSignal.timeout(1e4)]) : AbortSignal.timeout(1e4)
        });
        delivery.duration = Date.now() - start;
        delivery.status_code = response.status;
        delivery.success = response.ok;
      } catch {
        delivery.duration = 0;
        delivery.success = false;
      }
      this.deliveries.push(delivery);
      if (this.deliveries.length > MAX_DELIVERIES) {
        this.deliveries.splice(0, this.deliveries.length - MAX_DELIVERIES);
      }
    }
  }
  getDeliveries(hookId) {
    if (hookId !== void 0) {
      return this.deliveries.filter((d) => d.hook_id === hookId);
    }
    return [...this.deliveries];
  }
  clear() {
    this.subscriptions.length = 0;
    this.deliveries.length = 0;
    this.subscriptionIdCounter = 1;
    this.deliveryIdCounter = 1;
  }
};
var DEFAULT_DOCS_URL = "https://emulate.dev";
function getDocsUrl(c) {
  return c.get("docsUrl") ?? DEFAULT_DOCS_URL;
}
function errorStatus(err) {
  if (err && typeof err === "object" && "status" in err) {
    const s = err.status;
    if (typeof s === "number" && Number.isFinite(s)) return s;
  }
  return 500;
}
function createApiErrorHandler(documentationUrl) {
  return (err, c) => {
    if (documentationUrl) {
      c.set("docsUrl", documentationUrl);
    }
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return c.json(
      {
        message,
        documentation_url: getDocsUrl(c)
      },
      status
    );
  };
}
function createErrorHandler(documentationUrl) {
  return async (c, next) => {
    if (documentationUrl) {
      c.set("docsUrl", documentationUrl);
    }
    await next();
  };
}
var errorHandler = createErrorHandler();
var isDebug = typeof process !== "undefined" && (process.env.DEBUG === "1" || process.env.DEBUG === "true" || process.env.EMULATE_DEBUG === "1");
function debug(label, ...args) {
  if (isDebug) {
    console.log(`[${label}]`, ...args);
  }
}
function authMiddleware(tokens, appKeyResolver, fallbackUser) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
      const token = authHeader.replace(/^(Bearer|token)\s+/i, "").trim();
      if (token.startsWith("eyJ") && appKeyResolver) {
        try {
          const [, payloadB64] = token.split(".");
          const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
          const appId = typeof payload.iss === "string" ? parseInt(payload.iss, 10) : payload.iss;
          if (typeof appId === "number" && !isNaN(appId)) {
            const appInfo = appKeyResolver(appId);
            if (appInfo) {
              const publicKey = createPublicKey(appInfo.privateKey);
              await jwtVerify(token, publicKey, { algorithms: ["RS256"] });
              c.set("authApp", {
                appId,
                slug: appInfo.slug,
                name: appInfo.name
              });
            }
          }
        } catch {
        }
      } else {
        let user = tokens.get(token);
        if (!user && fallbackUser && token.length > 0) {
          debug("auth", "fallback user for unknown token", { login: fallbackUser.login, id: fallbackUser.id });
          user = { login: fallbackUser.login, id: fallbackUser.id, scopes: fallbackUser.scopes };
        }
        if (user) {
          c.set("authUser", user);
          c.set("authToken", token);
          c.set("authScopes", user.scopes);
        }
      }
    }
    await next();
  };
}
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS = {
  "geist-sans.woff2": readFileSync(join(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join(__dirname, "fonts", "favicon.ico"));
function registerFontRoutes(app) {
  app.get("/_emulate/fonts/:name", (c) => {
    const name = c.req.param("name");
    const buf = FONTS[name];
    if (!buf) return c.notFound();
    return new Response(buf, {
      headers: {
        "Content-Type": "font/woff2",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*"
      }
    });
  });
  app.get("/_emulate/favicon.ico", (c) => {
    return new Response(FAVICON, {
      headers: {
        "Content-Type": "image/x-icon",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  });
}
function createServer(plugin, options = {}) {
  const port = options.port ?? 4e3;
  const baseUrl = options.baseUrl ?? `http://localhost:${port}`;
  const app = new Hono();
  const store = new Store();
  const webhooks = new WebhookDispatcher();
  const tokenMap = /* @__PURE__ */ new Map();
  if (options.tokens) {
    for (const [token, user] of Object.entries(options.tokens)) {
      tokenMap.set(token, {
        login: user.login,
        id: user.id,
        scopes: user.scopes ?? ["repo", "user", "admin:org", "admin:repo_hook"]
      });
    }
  }
  const docsUrl = options.docsUrl ?? `https://emulate.dev/${plugin.name}`;
  registerFontRoutes(app);
  app.onError(createApiErrorHandler(docsUrl));
  app.use("*", cors());
  app.use("*", createErrorHandler(docsUrl));
  app.use("*", authMiddleware(tokenMap, options.appKeyResolver, options.fallbackUser));
  const rateLimitCounters = /* @__PURE__ */ new Map();
  let lastPruneAt = Math.floor(Date.now() / 1e3);
  app.use("*", async (c, next) => {
    if (plugin.rateLimit === false) return next();
    const token = c.get("authToken") ?? "__anonymous__";
    const now = Math.floor(Date.now() / 1e3);
    if (now - lastPruneAt > 3600) {
      for (const [key, val] of rateLimitCounters) {
        if (val.resetAt <= now) rateLimitCounters.delete(key);
      }
      lastPruneAt = now;
    }
    let counter = rateLimitCounters.get(token);
    if (!counter || counter.resetAt <= now) {
      counter = { remaining: 5e3, resetAt: now + 3600 };
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
          documentation_url: docsUrl
        },
        403
      );
    }
    await next();
  });
  const close = plugin.register(app, store, webhooks, baseUrl, tokenMap) ?? (async () => {
  });
  app.notFound(
    (c) => c.json(
      {
        message: "Not Found",
        documentation_url: docsUrl
      },
      404
    )
  );
  return { app, store, webhooks, port, baseUrl, tokenMap, close };
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
var CSS = `
.inspector-json{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8125rem;line-height:1.6;max-height:70vh;overflow:auto}
.inspector-detail{padding:14px 0;border-bottom:1px solid #0a3300}
.inspector-detail summary{cursor:pointer;overflow-wrap:anywhere}
.inspector-action{display:inline-block;margin-top:12px;padding:8px 12px;border:1px solid #0a3300;border-radius:6px;background:#001a00;color:#33ff00;font:inherit;font-size:.8125rem;cursor:pointer}
.inspector-action:hover{background:#0a3300}
.inspector-scroll{overflow-x:auto}
@font-face{
  font-family:'Geist';font-style:normal;font-weight:100 900;font-display:swap;
  src:url('/_emulate/fonts/geist-sans.woff2') format('woff2');
}
@font-face{
  font-family:'Geist Pixel';font-style:normal;font-weight:400;font-display:swap;
  src:url('/_emulate/fonts/GeistPixel-Square.woff2') format('woff2');
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;
  background:#000;color:#33ff00;min-height:100vh;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.emu-bar{
  border-bottom:1px solid #0a3300;padding:10px 20px;
  display:flex;align-items:center;gap:10px;font-size:.8125rem;color:#1a8c00;
}
.emu-bar-title{font-weight:600;color:#33ff00;font-family:'Geist Pixel',monospace;}
.emu-bar-links{margin-left:auto;display:flex;gap:16px;}
.emu-bar-links a{
  color:#1a8c00;font-size:.75rem;text-decoration:none;transition:color .15s;
}
.emu-bar-links a:hover{color:#33ff00;}
.emu-bar-links a .full{display:inline;}
.emu-bar-links a .short{display:none;}
@media(max-width:600px){
  .emu-bar-links a .full{display:none;}
  .emu-bar-links a .short{display:inline;}
}

.content{
  display:flex;align-items:center;justify-content:center;
  min-height:calc(100vh - 42px);padding:24px 16px;
}
.content-inner{width:100%;max-width:420px;}
.card-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.125rem;font-weight:600;margin-bottom:4px;color:#33ff00;
}
.card-subtitle{color:#1a8c00;font-size:.8125rem;margin-bottom:18px;line-height:1.45;}
.powered-by{
  position:fixed;bottom:0;left:0;right:0;
  text-align:center;padding:12px;font-size:.6875rem;color:#0a3300;
  font-family:'Geist Pixel',monospace;
}
.powered-by a{color:#1a8c00;text-decoration:none;transition:color .15s;}
.powered-by a:hover{color:#33ff00;}

.error-title{
  font-family:'Geist Pixel',monospace;
  color:#ff4444;font-size:1.125rem;font-weight:600;margin-bottom:8px;
}
.error-msg{color:#1a8c00;font-size:.875rem;line-height:1.5;}
.error-card{text-align:center;}

.user-form{margin-bottom:8px;}
.user-form:last-of-type{margin-bottom:0;}
.user-btn{
  width:100%;display:flex;align-items:center;gap:12px;
  padding:10px 12px;border:1px solid #0a3300;border-radius:8px;
  background:#000;color:inherit;cursor:pointer;text-align:left;
  font:inherit;transition:border-color .15s;
}
.user-btn:hover{border-color:#33ff00;}
.avatar{
  width:36px;height:36px;border-radius:50%;
  background:#0a3300;color:#33ff00;font-weight:600;font-size:.875rem;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.user-text{min-width:0;}
.user-login{font-weight:600;font-size:.875rem;display:block;color:#33ff00;}
.user-meta{color:#1a8c00;font-size:.75rem;margin-top:1px;}
.user-email{font-size:.6875rem;color:#116600;word-break:break-all;margin-top:1px;}

.settings-layout{
  max-width:920px;margin:0 auto;padding:28px 20px;
  display:flex;gap:28px;
}
.settings-sidebar{width:200px;flex-shrink:0;}
.settings-sidebar a{
  display:block;padding:6px 10px;border-radius:6px;color:#1a8c00;
  text-decoration:none;font-size:.8125rem;transition:color .15s;
}
.settings-sidebar a:hover{color:#33ff00;}
.settings-sidebar a.active{color:#33ff00;font-weight:600;}
.settings-main{flex:1;min-width:0;}

.s-card{
  padding:18px 0;margin-bottom:14px;border-bottom:1px solid #0a3300;
}
.s-card:last-child{border-bottom:none;}
.s-card-header{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.s-icon{
  width:42px;height:42px;border-radius:8px;
  background:#0a3300;display:flex;align-items:center;justify-content:center;
  font-size:1.125rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.s-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.25rem;font-weight:600;color:#33ff00;
}
.s-subtitle{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.section-heading{
  font-size:.9375rem;font-weight:600;margin-bottom:10px;color:#33ff00;
  display:flex;align-items:center;justify-content:space-between;
}
.perm-list{list-style:none;}
.perm-list li{padding:5px 0;font-size:.8125rem;display:flex;align-items:center;gap:6px;color:#1a8c00;}
.check{color:#33ff00;}
.org-row{
  display:flex;align-items:center;gap:8px;padding:7px 0;
  border-bottom:1px solid #0a3300;font-size:.8125rem;
}
.org-row:last-child{border-bottom:none;}
.org-icon{
  width:22px;height:22px;border-radius:4px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;
  font-size:.625rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.org-name{font-weight:600;color:#33ff00;}
.badge{font-size:.6875rem;padding:1px 7px;border-radius:999px;font-weight:500;}
.badge-granted{background:#0a3300;color:#33ff00;}
.badge-denied{background:#1a0a0a;color:#ff4444;}
.badge-requested{background:#0a3300;color:#1a8c00;}
.btn-revoke{
  display:inline-block;padding:5px 14px;border-radius:6px;
  border:1px solid #0a3300;background:transparent;color:#ff4444;
  font-size:.75rem;font-weight:600;cursor:pointer;transition:border-color .15s;
}
.btn-revoke:hover{border-color:#ff4444;}
.info-text{color:#1a8c00;font-size:.75rem;line-height:1.5;margin-top:10px;}
.app-link{
  display:flex;align-items:center;gap:12px;padding:12px;
  border:1px solid #0a3300;border-radius:8px;background:#000;
  text-decoration:none;color:inherit;margin-bottom:8px;transition:border-color .15s;
}
.app-link:hover{border-color:#33ff00;}
.app-link-name{font-weight:600;font-size:.875rem;color:#33ff00;}
.app-link-scopes{font-size:.6875rem;color:#1a8c00;margin-top:1px;}
.empty{color:#1a8c00;text-align:center;padding:28px 0;font-size:.875rem;}

.inspector-layout{max-width:960px;margin:0 auto;padding:28px 20px;}
.inspector-tabs{display:flex;gap:4px;margin-bottom:20px;}
.inspector-tabs a{
  padding:7px 16px;border-radius:6px;text-decoration:none;
  font-size:.8125rem;color:#1a8c00;border:1px solid transparent;
  transition:color .15s,border-color .15s;
}
.inspector-tabs a:hover{color:#33ff00;}
.inspector-tabs a.active{color:#33ff00;font-weight:600;border-color:#0a3300;background:#0a3300;}
.inspector-section{margin-bottom:24px;}
.inspector-section h2{
  font-family:'Geist Pixel',monospace;
  font-size:1rem;font-weight:600;color:#33ff00;margin-bottom:10px;
}
.inspector-section h3{
  font-family:'Geist Pixel',monospace;
  font-size:.875rem;font-weight:600;color:#1a8c00;margin:16px 0 8px;
}
.inspector-table{width:100%;border-collapse:collapse;margin-bottom:12px;}
.inspector-table th,.inspector-table td{
  text-align:left;padding:8px 12px;border-bottom:1px solid #0a3300;
  font-size:.8125rem;
}
.inspector-table th{color:#1a8c00;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;}
.inspector-table td{color:#33ff00;}
.inspector-table tbody tr{transition:background .1s;}
.inspector-table tbody tr:hover{background:#0a3300;}
.inspector-empty{color:#1a8c00;text-align:center;padding:20px 0;font-size:.8125rem;}

.checkout-layout{
  display:flex;min-height:calc(100vh - 42px);
}
.checkout-summary{
  flex:1;background:#020;padding:48px 40px 48px 10%;
  display:flex;flex-direction:column;justify-content:center;
  border-right:1px solid #0a3300;
}
.checkout-form-side{
  flex:1;background:#000;padding:48px 10% 48px 40px;
  display:flex;flex-direction:column;justify-content:center;
}
.checkout-merchant{
  display:flex;align-items:center;gap:10px;margin-bottom:6px;
}
.checkout-merchant-name{
  font-family:'Geist Pixel',monospace;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-test-badge{
  font-size:.625rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
  background:#0a3300;color:#1a8c00;padding:2px 8px;border-radius:4px;
}
.checkout-total{
  font-family:'Geist Pixel',monospace;
  font-size:2rem;font-weight:700;color:#33ff00;margin:8px 0 28px;
}
.checkout-line-item{
  display:flex;align-items:center;gap:14px;padding:14px 0;
  border-bottom:1px solid #0a3300;
}
.checkout-line-item:first-child{border-top:1px solid #0a3300;}
.checkout-item-icon{
  width:42px;height:42px;border-radius:6px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;font-size:.875rem;font-weight:700;color:#116600;
}
.checkout-item-details{flex:1;min-width:0;}
.checkout-item-name{font-size:.875rem;font-weight:600;color:#33ff00;}
.checkout-item-qty{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.checkout-item-price{
  font-size:.875rem;font-weight:600;color:#33ff00;text-align:right;white-space:nowrap;
}
.checkout-item-unit{font-size:.6875rem;color:#1a8c00;text-align:right;margin-top:2px;}
.checkout-totals{margin-top:20px;}
.checkout-totals-row{
  display:flex;justify-content:space-between;padding:6px 0;
  font-size:.8125rem;color:#1a8c00;
}
.checkout-totals-row.total{
  border-top:1px solid #0a3300;margin-top:8px;padding-top:14px;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-form-section{margin-bottom:24px;}
.checkout-form-label{
  font-size:.8125rem;font-weight:600;color:#33ff00;margin-bottom:8px;display:block;
}
.checkout-input{
  width:100%;padding:10px 12px;border:1px solid #0a3300;border-radius:6px;
  background:#020;color:#33ff00;font:inherit;font-size:.875rem;
  transition:border-color .15s;outline:none;
}
.checkout-input:focus{border-color:#33ff00;}
.checkout-input::placeholder{color:#116600;}
.checkout-card-box{
  border:1px solid #0a3300;border-radius:6px;padding:14px;
  background:#020;
}
.checkout-card-row{
  display:flex;gap:12px;margin-top:10px;
}
.checkout-card-row .checkout-input{flex:1;}
.checkout-sim-note{
  font-size:.6875rem;color:#1a8c00;margin-top:10px;text-align:center;
  font-style:italic;
}
.checkout-pay-btn{
  width:100%;padding:14px;border:none;border-radius:8px;
  background:#33ff00;color:#000;font:inherit;font-size:.9375rem;font-weight:700;
  cursor:pointer;transition:background .15s;
  font-family:'Geist Pixel',monospace;
}
.checkout-pay-btn:hover{background:#44ff22;}
.checkout-cancel{
  text-align:center;margin-top:14px;
}
.checkout-cancel a{
  color:#1a8c00;text-decoration:none;font-size:.8125rem;
  transition:color .15s;
}
.checkout-cancel a:hover{color:#33ff00;}
@media(max-width:768px){
  .checkout-layout{flex-direction:column;}
  .checkout-summary{padding:32px 20px;border-right:none;border-bottom:1px solid #0a3300;}
  .checkout-form-side{padding:32px 20px;}
}
`;
var POWERED_BY = `<div class="powered-by">Powered by <a href="https://emulate.dev" target="_blank" rel="noopener">emulate</a></div>`;
function emuBar(service) {
  const title = service ? `${escapeHtml(service)} Emulator` : "Emulator";
  return `<div class="emu-bar">
  <span class="emu-bar-title">${title}</span>
  <nav class="emu-bar-links">
    <a href="https://github.com/vercel-labs/emulate/issues" target="_blank" rel="noopener"><span class="full">Report Issue</span><span class="short">Report</span></a>
    <a href="https://github.com/vercel-labs/emulate" target="_blank" rel="noopener"><span class="full">Source Code</span><span class="short">Source</span></a>
    <a href="https://emulate.dev" target="_blank" rel="noopener"><span class="full">Learn More</span><span class="short">Learn</span></a>
  </nav>
</div>`;
}
function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="icon" href="/_emulate/favicon.ico"/>
<title>${escapeHtml(title)} | emulate</title>
<style>${CSS}</style>
</head>`;
}
function renderJsonDetails(label, value, open2 = false) {
  const text = JSON.stringify(value, null, 2) ?? "";
  const bounded2 = text.length > 65536 ? `${text.slice(0, 65536)}
[remaining data omitted from preview]` : text;
  return `<details class="inspector-detail"${open2 ? " open" : ""}><summary>${escapeHtml(label)}</summary><pre class="inspector-json">${escapeHtml(bounded2)}</pre></details>`;
}
function renderStateView(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return renderJsonDetails("Current state", value, true);
  return Object.entries(value).map(([key, item]) => {
    if (Array.isArray(item) && item.length && item.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
      const columns = [...new Set(item.slice(0, 100).flatMap(Object.keys))].slice(0, 12);
      const rows = item.slice(0, 100).map(
        (row) => `<tr>${columns.map((column) => `<td>${escapeHtml((typeof row[column] === "string" ? row[column] : JSON.stringify(row[column]))?.slice(0, 500) ?? "")}</td>`).join("")}</tr>`
      ).join("");
      return `<div class="s-card"><h2 class="section-heading">${escapeHtml(key)} <span class="badge">${item.length}</span></h2><div class="inspector-scroll"><table class="inspector-table"><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>${item.length > 100 ? '<p class="s-subtitle">Showing the first 100 records.</p>' : ""}</div>`;
    }
    return renderJsonDetails(key, item, true);
  }).join("");
}
function renderInspectorPage(title, tabs, activeTab, body, service) {
  const tabLinks = tabs.map(
    (t) => `<a href="${escapeAttr(t.href)}" class="${t.id === activeTab ? "active" : ""}">${escapeHtml(t.label)}</a>`
  ).join("");
  return `${head(title)}
<body>
${emuBar(service)}
<div class="inspector-layout">
  <nav class="inspector-tabs">${tabLinks}</nav>
  ${body}
</div>
${POWERED_BY}
</body></html>`;
}
function filePersistence(path) {
  return {
    async load() {
      try {
        return await readFile(path, "utf-8");
      } catch {
        return null;
      }
    },
    async save(data) {
      await mkdir(dirname2(path), { recursive: true });
      const temporaryPath = `${path}.${randomUUID()}.tmp`;
      try {
        const file = await open(temporaryPath, "wx", 384);
        try {
          await file.chmod(384);
          await file.writeFile(data, "utf-8");
          await file.sync();
        } finally {
          await file.close();
        }
        await rename(temporaryPath, path);
      } finally {
        await unlink(temporaryPath).catch(() => {
        });
      }
    },
    async initialize(data) {
      await mkdir(dirname2(path), { recursive: true });
      const temporaryPath = `${path}.${randomUUID()}.tmp`;
      try {
        const file = await open(temporaryPath, "wx", 384);
        try {
          await file.chmod(384);
          await file.writeFile(data, "utf-8");
          await file.sync();
        } finally {
          await file.close();
        }
        try {
          await link(temporaryPath, path);
          return data;
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
          return await readFile(path, "utf-8");
        }
      } catch (error) {
        throw error;
      } finally {
        await unlink(temporaryPath).catch(() => {
        });
      }
    }
  };
}
function createCustomInspector(name, baseUrl, options) {
  for (const key of Object.keys(options))
    if (!["maxRequests", "maxBodyBytes", "redact"].includes(key)) throw new Error(`Unknown inspector option: ${key}`);
  for (const key of ["maxRequests", "maxBodyBytes"])
    if (options[key] !== void 0 && (!Number.isSafeInteger(options[key]) || options[key] < (key === "maxRequests" ? 1 : 0)))
      throw new Error(`inspector.${key} must be ${key === "maxRequests" ? "a positive" : "a nonnegative"} integer`);
  if (options.redact !== void 0 && (!Array.isArray(options.redact) || options.redact.some((key) => typeof key !== "string")))
    throw new Error("inspector.redact must be an array of field names");
  const maxRequests = Math.max(1, Math.min(options.maxRequests ?? 100, 1e3));
  const maxBytes = Math.max(0, Math.min(options.maxBodyBytes ?? 8192, 65536));
  const sensitive = /* @__PURE__ */ new Set([
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "password",
    "secret",
    "token",
    "api_key",
    "apikey",
    "private_key",
    ...(options.redact ?? []).map((s) => s.toLowerCase())
  ]);
  function isSensitive(key) {
    if (sensitive.has(key.toLowerCase())) return true;
    const normalized = key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[-\s]/g, "_").toLowerCase();
    return sensitive.has(normalized) || /(?:^|_)(?:token|secret|password|api_key|private_key|cookie)$/.test(normalized);
  }
  const traces = [];
  const active = /* @__PURE__ */ new WeakMap();
  let epoch = 0;
  let nextId = 1;
  const assets = new Hono();
  registerFontRoutes(assets);
  const root = `${baseUrl}/_emulate`;
  function redact(value) {
    if (Array.isArray(value)) return value.map(redact);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, isSensitive(key) ? "[redacted]" : redact(item)])
    );
  }
  function headers(value) {
    return Object.fromEntries(
      [...value].map(([key, val]) => [key, isSensitive(key) ? "[redacted]" : val.slice(0, maxBytes)])
    );
  }
  async function preview(value) {
    if (!value.body || maxBytes === 0) return void 0;
    const type = value.headers.get("content-type") ?? "";
    if (!/application\/(json|[^;]+\+json)|text\/(plain|html)|application\/x-www-form-urlencoded/.test(type))
      return `[${type || "binary/streaming"} body omitted]`;
    if (Number(value.headers.get("content-length")) > maxBytes) return "[body exceeds preview limit]";
    const reader = value.clone().body.getReader();
    const parts = [];
    let size = 0;
    let timer;
    try {
      const bytes = await Promise.race([
        (async () => {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.length;
            if (size > maxBytes) throw new Error("limit");
            parts.push(chunk.value);
          }
          return Buffer.concat(parts);
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("stream")), 50);
        })
      ]);
      const text = bytes.toString("utf8");
      if (type.includes("json")) {
        try {
          return redact(JSON.parse(text));
        } catch {
          return "[invalid JSON omitted]";
        }
      }
      if (type.includes("x-www-form-urlencoded")) return redact(Object.fromEntries(new URLSearchParams(text)));
      return text;
    } catch {
      return "[large or streaming body omitted]";
    } finally {
      clearTimeout(timer);
      void reader.cancel().catch(() => {
      });
    }
  }
  function safePath(url) {
    for (const key of [...url.searchParams.keys()]) if (isSensitive(key)) url.searchParams.set(key, "[redacted]");
    return `${url.pathname}${url.search}`;
  }
  const api = {
    clear() {
      epoch++;
      traces.length = 0;
    },
    begin(request, route) {
      const trace = {
        id: nextId++,
        method: request.method,
        path: safePath(new URL(request.url)),
        route: route?.path,
        request: { headers: headers(request.headers) }
      };
      active.set(request, { trace, start: performance.now(), preview: preview(request), epoch });
      return trace.id;
    },
    recordError(request, error) {
      const entry = active.get(request);
      if (entry)
        entry.trace.error = (error instanceof Error ? error.stack ?? error.message : String(error)).slice(
          0,
          maxBytes
        );
    },
    async finish(request, response, _started) {
      const entry = active.get(request);
      if (!entry) return;
      entry.trace.duration = Math.round((performance.now() - entry.start) * 100) / 100;
      entry.trace.status = response.status;
      entry.trace.request.body = await entry.preview;
      entry.trace.response = { headers: headers(response.headers), body: await preview(response) };
      if (entry.epoch !== epoch) return;
      traces.push(entry.trace);
      if (traces.length > maxRequests) traces.splice(0, traces.length - maxRequests);
      active.delete(request);
    },
    async handle(request, runtime) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/_emulate/fonts/") || url.pathname === "/_emulate/favicon.ico")
        return assets.fetch(request);
      if (request.method === "POST" && url.pathname === "/_emulate/reset") {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(baseUrl).origin)
          return Response.json({ error: "Origin does not match this emulator" }, { status: 403 });
        await runtime.reset();
        return new Response(null, { status: 303, headers: { Location: `${root}?tab=state` } });
      }
      if (request.method !== "GET" || url.pathname !== "/_emulate" && url.pathname !== "/_emulate/")
        return Response.json({ error: "Not Found" }, { status: 404 });
      const tab = ["requests", "routes", "state"].includes(url.searchParams.get("tab") ?? "") ? url.searchParams.get("tab") : "requests";
      const tabs = ["requests", "routes", "state"].map((id) => ({
        id,
        label: id[0].toUpperCase() + id.slice(1),
        href: `${root}?tab=${id}`
      }));
      let body = `<div class="s-card"><div class="s-title">${escapeHtml(name)}</div><p class="s-subtitle">${escapeHtml(baseUrl)}</p><form method="post" action="${escapeAttr(root)}/reset"><button type="submit" class="inspector-action">Reset to seed</button></form></div>`;
      if (tab === "state") body += renderStateView(redact(runtime.snapshot().state));
      if (tab === "routes") {
        body += `<div class="inspector-scroll"><table class="inspector-table"><thead><tr><th>Method</th><th>Path</th><th>Request</th></tr></thead><tbody>${runtime.routes().map((route) => {
          const target = `${baseUrl}${route.path.replace(/:([a-zA-Z0-9_]+)/g, "example")}`;
          const command = `curl -X ${route.method} '${target.replace(/'/g, "'\\''")}'`;
          return `<tr><td>${escapeHtml(route.method)}</td><td>${escapeHtml(route.path)}</td><td><code>${escapeHtml(command)}</code></td></tr>`;
        }).join("")}</tbody></table></div>`;
      }
      if (tab === "requests")
        body += traces.length ? [...traces].reverse().map(
          (trace) => renderJsonDetails(
            `${trace.method} ${trace.path} \xB7 ${trace.status} \xB7 ${trace.duration} ms${trace.route ? "" : " \xB7 unmatched"}`,
            trace
          )
        ).join("") : `<div class="empty">No API requests yet. Send a request to ${escapeHtml(baseUrl)} to see it here.</div>`;
      let html = renderInspectorPage(`${name} inspector`, tabs, tab, body, name);
      html = html.replaceAll('"/_emulate/', `"${root}/`).replaceAll("'/_emulate/", `'${root}/`);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
  };
  return api;
}
function defineEmulator(definition) {
  const result = { ...definition, kind: "emulate.http", apiVersion: 1 };
  assertEmulatorDefinition(result);
  return Object.freeze(result);
}
function isEmulatorDefinition(value) {
  return !!value && typeof value === "object" && "kind" in value && value.kind === "emulate.http";
}
function assertEmulatorDefinition(value) {
  if (!isEmulatorDefinition(value)) throw new Error("Expected a default export created with defineEmulator()");
  if (value.apiVersion !== 1)
    throw new Error(`Unsupported emulator API version ${value.apiVersion}. Update emulate to match this plugin.`);
  if (typeof value.name !== "string" || !/^[a-z][a-z0-9-]*$/.test(value.name))
    throw new Error(
      "Emulator name must start with a lowercase letter and contain only lowercase letters, digits, and hyphens"
    );
  if (typeof value.state !== "function" || typeof value.setup !== "function")
    throw new Error(`Emulator ${value.name} must provide state() and setup()`);
  if (value.validateSeed !== void 0 && typeof value.validateSeed !== "function")
    throw new Error("validateSeed must be a function");
  if (value.cors !== void 0 && value.cors !== false && (!value.cors || typeof value.cors !== "object" || Array.isArray(value.cors)))
    throw new Error("cors must be false or a CORS options object");
  if (value.stateVersion !== void 0 && (!Number.isSafeInteger(value.stateVersion) || value.stateVersion < 1))
    throw new Error("stateVersion must be a positive integer");
}
function cloneState(value) {
  const ancestors = /* @__PURE__ */ new Set();
  function check(item, path) {
    if (item === null || typeof item === "string" || typeof item === "boolean") return;
    if (typeof item === "number" && Number.isFinite(item)) return;
    if (!item || typeof item !== "object") throw new Error(`State at ${path} must be JSON-compatible`);
    if (ancestors.has(item)) throw new Error(`Circular state at ${path}`);
    const proto = Object.getPrototypeOf(item);
    if (!Array.isArray(item) && proto !== Object.prototype && proto !== null)
      throw new Error(`State at ${path} must be a plain object or array`);
    ancestors.add(item);
    for (const key of Reflect.ownKeys(item)) {
      if (Array.isArray(item) && key === "length") continue;
      if (typeof key !== "string") throw new Error(`Symbol state key at ${path}`);
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (!descriptor.enumerable || !("value" in descriptor))
        throw new Error(`State at ${path}.${key} must be an enumerable data property`);
      check(descriptor.value, `${path}.${key}`);
    }
    if (Array.isArray(item)) {
      for (let i = 0; i < item.length; i++) if (!(i in item)) throw new Error(`Sparse state array at ${path}[${i}]`);
      if (Object.keys(item).length !== item.length) throw new Error(`Extra array properties at ${path}`);
    }
    ancestors.delete(item);
  }
  check(value, "state");
  return JSON.parse(JSON.stringify(value));
}
async function bounded(promise, milliseconds, description) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${description} exceeded ${milliseconds}ms`)), milliseconds);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
async function createCustomRuntime(definition, options = {}) {
  assertEmulatorDefinition(definition);
  const baseUrl = (options.baseUrl ?? `http://${definition.name}.localhost`).replace(/\/$/, "");
  const timeout = options.shutdownTimeout ?? 5e3;
  if (!Number.isFinite(timeout) || timeout < 1) throw new Error("shutdownTimeout must be a positive number");
  if (options.inspector !== void 0 && typeof options.inspector !== "boolean" && (!options.inspector || typeof options.inspector !== "object" || Array.isArray(options.inspector)))
    throw new Error("inspector must be a boolean or an inspector options object");
  function validate(value) {
    const state = cloneState(definition.validateSeed ? definition.validateSeed(cloneState(value)) : value);
    if (!state || typeof state !== "object" || Array.isArray(state))
      throw new Error("Initial state must be a JSON-compatible object");
    return state;
  }
  const baseline = validate(options.seed === void 0 ? definition.state() : options.seed);
  function readSnapshot(value) {
    const snap = value;
    if (!snap || snap.formatVersion !== 1 || snap.definition !== definition.name || snap.stateVersion !== (definition.stateVersion ?? 1))
      throw new Error(
        `Incompatible snapshot for ${definition.name}. Supply a matching stateVersion or migrate the saved snapshot.`
      );
    return validate(snap.state);
  }
  const inspector = options.inspector ? createCustomInspector(definition.name, baseUrl, typeof options.inspector === "object" ? options.inspector : {}) : void 0;
  function dispose(gen) {
    return gen.disposed ??= disposeGeneration(gen);
  }
  async function disposeGeneration(gen) {
    gen.controller.abort();
    const errors = [];
    try {
      await bounded(
        (async () => {
          while (gen.active.size) await Promise.allSettled([...gen.active]);
        })(),
        timeout,
        "Requests draining"
      );
    } catch (error) {
      errors.push(error);
    }
    for (const callback of [...gen.disposers].reverse()) {
      try {
        await bounded(Promise.resolve().then(callback), timeout, "Emulator cleanup");
      } catch (error) {
        errors.push(error);
      }
    }
    gen.webhooks.clear();
    if (errors.length) throw new AggregateError(errors, `Cleanup failed for ${definition.name}`);
  }
  async function makeGeneration(state) {
    const controller = new AbortController();
    const gen = {
      app: new Hono({
        strictRoutes: true,
        strictJson: true,
        onError(error, req) {
          inspector?.recordError(req, error);
          if (!(error && typeof error === "object" && "status" in error && Number(error.status) < 500))
            console.error(`[${definition.name}]`, error);
        }
      }),
      state: cloneState(state),
      controller,
      disposers: [],
      active: /* @__PURE__ */ new Set(),
      webhooks: new WebhookDispatcher({ signal: controller.signal, neutral: true })
    };
    gen.app.onError((error, c) => {
      const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 500;
      return c.json(
        { error: error instanceof Error ? error.message : "Internal Server Error" },
        Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500
      );
    });
    gen.app.notFound((c) => c.json({ error: "Not Found" }, 404));
    if (definition.cors !== false) gen.app.use(cors(definition.cors));
    try {
      const result = definition.setup({
        app: gen.app,
        state: gen.state,
        baseUrl,
        signal: controller.signal,
        webhooks: gen.webhooks,
        onDispose: (fn) => gen.disposers.push(fn)
      });
      if (result && typeof result.then === "function") {
        void Promise.resolve(result).catch(() => {
        });
        throw new Error("setup() must be synchronous; register asynchronous cleanup with onDispose()");
      }
      cloneState(gen.state);
      return gen;
    } catch (error) {
      await dispose(gen).catch((cleanup) => console.error(cleanup));
      throw error;
    }
  }
  let initial = baseline;
  if (options.persistence && !options.resetPersistence) {
    const raw = await options.persistence.load();
    if (raw !== null) {
      try {
        initial = readSnapshot(JSON.parse(raw));
      } catch (error) {
        throw new Error(`Cannot restore ${definition.name}: ${error instanceof Error ? error.message : error}`, {
          cause: error
        });
      }
    }
  }
  let generation = await makeGeneration(initial);
  let closed = false;
  let transition = Promise.resolve();
  let saving = Promise.resolve();
  let saveRevision = 0;
  let closing;
  const snapshot = () => ({
    formatVersion: 1,
    definition: definition.name,
    stateVersion: definition.stateVersion ?? 1,
    state: cloneState(generation.state)
  });
  function save(serialized) {
    if (!options.persistence) return Promise.resolve();
    const data = serialized ?? JSON.stringify(snapshot());
    saveRevision++;
    saving = saving.catch(() => {
    }).then(() => options.persistence.save(data));
    return saving;
  }
  function trackBody(gen, response, savedSnapshot, savedRevision) {
    if (!response.body) return response;
    const reader = response.body.getReader();
    let resolveDone;
    const done = new Promise((resolve) => {
      resolveDone = resolve;
    });
    gen.active.add(done);
    void done.then(() => gen.active.delete(done));
    let settled = false;
    let stopped = false;
    let abort;
    async function finish(persist) {
      if (settled) return;
      settled = true;
      gen.controller.signal.removeEventListener("abort", abort);
      try {
        if (persist && savedSnapshot !== void 0 && gen === generation && !gen.controller.signal.aborted) {
          const current = JSON.stringify(snapshot());
          if (current !== savedSnapshot || saveRevision !== savedRevision) await save(current);
        }
      } catch (error) {
        console.error(`[${definition.name}] persistence failed`, error);
        throw new Error("Could not persist emulator state", { cause: error });
      } finally {
        resolveDone();
      }
    }
    const body = new ReadableStream({
      start(controller) {
        abort = () => {
          if (stopped) return;
          stopped = true;
          controller.error(gen.controller.signal.reason);
          void reader.cancel(gen.controller.signal.reason).catch(() => {
          }).finally(() => {
            void finish(false);
          });
        };
        gen.controller.signal.addEventListener("abort", abort, { once: true });
        if (gen.controller.signal.aborted) abort();
      },
      async pull(controller) {
        try {
          const chunk = await reader.read();
          if (stopped) return;
          if (chunk.done) {
            await finish(true);
            controller.close();
          } else controller.enqueue(chunk.value);
        } catch (error) {
          if (stopped) return;
          await finish(true).catch(() => {
          });
          controller.error(error);
        }
      },
      async cancel(reason) {
        stopped = true;
        try {
          await reader.cancel(reason);
        } finally {
          await finish(true);
        }
      }
    });
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  }
  function replace(state) {
    if (closed) return Promise.reject(new Error("Emulator is closed"));
    const pending = transition.catch(() => {
    }).then(async () => {
      const next = await makeGeneration(state);
      const old = generation;
      let cleanupError;
      try {
        await dispose(old);
      } catch (error) {
        cleanupError = error;
      }
      generation = next;
      inspector?.clear();
      await save();
      if (cleanupError) throw cleanupError;
    });
    transition = pending.catch(() => {
    });
    return pending;
  }
  const runtime = {
    baseUrl,
    inspectorUrl: inspector ? `${baseUrl}/_emulate` : void 0,
    snapshot,
    reset: () => replace(baseline),
    restore(value) {
      try {
        return replace(readSnapshot(value));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async fetch(request) {
      if (closed) return Response.json({ error: "Emulator is closed" }, { status: 503 });
      let observed;
      do {
        observed = transition;
        await observed;
      } while (observed !== transition);
      if (closed) return Response.json({ error: "Emulator is closed" }, { status: 503 });
      const pathname = new URL(request.url).pathname;
      if (pathname === "/_emulate" || pathname.startsWith("/_emulate/")) {
        return inspector ? inspector.handle(request, { snapshot, reset: runtime.reset, routes: () => generation.app.routeTable }) : Response.json({ error: "Not Found" }, { status: 404 });
      }
      const gen = generation;
      const task = (async () => {
        const req = new Request(request, { signal: AbortSignal.any([request.signal, gen.controller.signal]) });
        const started = inspector?.begin(req, gen.app.matchedRoute(req.method, pathname));
        let response = await gen.app.fetch(req);
        let savedSnapshot;
        let savedRevision;
        if (gen === generation && !gen.controller.signal.aborted) {
          try {
            savedSnapshot = options.persistence ? JSON.stringify(snapshot()) : void 0;
            const pendingSave = save(savedSnapshot);
            savedRevision = saveRevision;
            await pendingSave;
          } catch (error) {
            console.error(`[${definition.name}] persistence failed`, error);
            void response.body?.cancel().catch(() => {
            });
            savedSnapshot = void 0;
            savedRevision = void 0;
            response = Response.json({ error: "Could not persist emulator state" }, { status: 500 });
          }
        }
        response = trackBody(gen, response, savedSnapshot, savedRevision);
        if (request.method === "HEAD") {
          void response.body?.cancel().catch(() => {
          });
          response = new Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
        if (gen === generation && !gen.controller.signal.aborted) await inspector?.finish(req, response, started);
        return response;
      })();
      gen.active.add(task);
      try {
        return await task;
      } finally {
        gen.active.delete(task);
      }
    },
    request(path, init) {
      return runtime.fetch(new Request(new URL(path, `${baseUrl}/`), init));
    },
    close() {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        await transition.catch(() => {
        });
        const errors = [];
        try {
          await dispose(generation);
        } catch (error) {
          errors.push(error);
        }
        try {
          await bounded(save(), timeout, "Persistence flush");
        } catch (error) {
          errors.push(error);
        }
        if (errors.length) throw new AggregateError(errors, `Could not close ${definition.name}`);
      })();
      return closing;
    }
  };
  if (options.persistence) {
    try {
      await save();
    } catch (error) {
      await runtime.close().catch(() => {
      });
      throw error;
    }
  }
  return runtime;
}

// src/config.ts
function defineConfig(config) {
  return config;
}

// src/registry.ts
var SERVICE_REGISTRY = {
  vercel: {
    label: "Vercel REST API emulator",
    endpoints: "projects, deployments, domains, env vars, users, teams, file uploads, protection bypass, blob storage",
    async load() {
      const mod = await import("./dist-TDYEHKI2.js");
      return { plugin: mod.vercelPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstLogin = cfg?.users?.[0]?.username ?? "admin";
      return { login: firstLogin, id: 1, scopes: [] };
    },
    initConfig: {
      vercel: {
        users: [{ username: "developer", name: "Developer", email: "dev@example.com" }],
        teams: [{ slug: "my-team", name: "My Team" }],
        projects: [{ name: "my-app", team: "my-team", framework: "nextjs" }],
        integrations: [
          {
            client_id: "oac_example_client_id",
            client_secret: "example_client_secret",
            name: "My Vercel App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/vercel"]
          }
        ]
      }
    }
  },
  github: {
    label: "GitHub REST API emulator",
    endpoints: "users, repos, issues, PRs, comments, reviews, labels, milestones, branches, git data, orgs, teams, releases, webhooks, search, actions, checks, rate limit",
    async load() {
      const mod = await import("./dist-7UAM2PMU.js");
      return {
        plugin: mod.githubPlugin,
        seedFromConfig: mod.seedFromConfig,
        prepareSeed: mod.prepareSeed,
        createAppKeyResolver: mod.createAppKeyResolver
      };
    },
    defaultFallback(cfg) {
      const firstLogin = cfg?.users?.[0]?.login ?? "admin";
      return { login: firstLogin, id: 1, scopes: ["repo", "user", "admin:org", "admin:repo_hook"] };
    },
    initConfig: {
      github: {
        users: [
          {
            login: "octocat",
            name: "The Octocat",
            email: "octocat@github.com",
            bio: "I am the Octocat",
            company: "GitHub",
            location: "San Francisco"
          }
        ],
        orgs: [
          {
            login: "my-org",
            name: "My Organization",
            description: "A test organization",
            members: [{ login: "octocat", role: "admin" }]
          }
        ],
        repos: [
          {
            owner: "octocat",
            name: "hello-world",
            description: "My first repository",
            language: "JavaScript",
            topics: ["hello", "world"],
            auto_init: true
          },
          {
            owner: "my-org",
            name: "org-repo",
            description: "An organization repository",
            language: "TypeScript",
            auto_init: true
          }
        ],
        oauth_apps: [
          {
            client_id: "Iv1.example_client_id",
            client_secret: "example_client_secret",
            name: "My App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/github"]
          }
        ]
      }
    }
  },
  google: {
    label: "Google OAuth 2.0 / OpenID Connect + Gmail, Calendar, and Drive emulator",
    endpoints: "OAuth authorize, token exchange, userinfo, RS256 OIDC discovery and JWKS, token revocation, Gmail messages/drafts/threads/labels/history/settings, Calendar discovery/lists/events/freebusy, Drive files/uploads",
    async load() {
      const mod = await import("./dist-CSAYDQIO.js");
      return { plugin: mod.googlePlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstEmail = cfg?.users?.[0]?.email ?? "testuser@gmail.com";
      return { login: firstEmail, id: 1, scopes: ["openid", "email", "profile"] };
    },
    initConfig: {
      google: {
        users: [
          {
            email: "testuser@example.com",
            name: "Test User",
            picture: "https://lh3.googleusercontent.com/a/default-user",
            email_verified: true
          }
        ],
        oauth_clients: [
          {
            client_id: "example-client-id.apps.googleusercontent.com",
            client_secret: "GOCSPX-example_secret",
            name: "Code App (Google)",
            redirect_uris: ["http://localhost:3000/api/auth/callback/google"]
          }
        ],
        labels: [
          {
            id: "Label_ops",
            user_email: "testuser@example.com",
            name: "Ops/Review",
            color_background: "#DDEEFF",
            color_text: "#111111"
          }
        ],
        messages: [
          {
            id: "msg_welcome",
            user_email: "testuser@example.com",
            from: "welcome@example.com",
            to: "testuser@example.com",
            subject: "Welcome to the Gmail emulator",
            body_text: "You can now test Gmail, Calendar, and Drive flows locally.",
            label_ids: ["INBOX", "UNREAD", "CATEGORY_UPDATES"],
            date: "2025-01-04T10:00:00.000Z"
          }
        ],
        calendars: [
          {
            id: "primary",
            user_email: "testuser@example.com",
            summary: "testuser@example.com",
            primary: true,
            selected: true,
            time_zone: "UTC"
          }
        ],
        calendar_events: [
          {
            id: "evt_kickoff",
            user_email: "testuser@example.com",
            calendar_id: "primary",
            summary: "Project Kickoff",
            start_date_time: "2025-01-10T09:00:00.000Z",
            end_date_time: "2025-01-10T09:30:00.000Z"
          }
        ],
        drive_items: [
          {
            id: "drv_docs",
            user_email: "testuser@example.com",
            name: "Docs",
            mime_type: "application/vnd.google-apps.folder",
            parent_ids: ["root"]
          }
        ]
      }
    }
  },
  slack: {
    label: "Slack API emulator",
    endpoints: "auth, chat, conversations, users, profiles, presence, files, pins, bookmarks, views, reactions, team, OAuth, incoming webhooks, inspector",
    async load() {
      const mod = await import("./dist-MR3R7P6U.js");
      return { plugin: mod.slackPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return {
        login: "U000000001",
        id: 1,
        scopes: []
      };
    },
    initConfig: {
      slack: {
        team: { name: "My Workspace", domain: "my-workspace" },
        users: [
          {
            name: "developer",
            real_name: "Developer",
            email: "dev@example.com",
            profile: {
              title: "Local Developer",
              status_text: "Testing locally",
              status_emoji: ":computer:"
            },
            presence: "active"
          }
        ],
        channels: [
          { name: "general", topic: "General discussion" },
          { name: "random", topic: "Random stuff" }
        ],
        bots: [{ name: "my-bot" }],
        oauth_apps: [
          {
            client_id: "12345.67890",
            client_secret: "example_client_secret",
            app_id: "A000000001",
            name: "My Slack App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/slack"],
            scopes: [
              "chat:write",
              "channels:read",
              "channels:history",
              "channels:join",
              "channels:manage",
              "channels:write",
              "groups:read",
              "groups:history",
              "groups:write",
              "im:read",
              "im:history",
              "im:write",
              "mpim:read",
              "mpim:history",
              "mpim:write",
              "users:read",
              "users:read.email",
              "users.profile:read",
              "users.profile:write",
              "users:write",
              "files:read",
              "files:write",
              "pins:read",
              "pins:write",
              "bookmarks:read",
              "bookmarks:write",
              "reactions:read",
              "reactions:write",
              "team:read"
            ],
            user_scopes: ["users:read", "users.profile:read"],
            bot_name: "my-bot"
          }
        ],
        strict_scopes: false
      }
    }
  },
  apple: {
    label: "Apple Sign In / OAuth emulator",
    endpoints: "OAuth authorize, token exchange, JWKS",
    async load() {
      const mod = await import("./dist-LZDZJ6NT.js");
      return { plugin: mod.applePlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstEmail = cfg?.users?.[0]?.email ?? "testuser@icloud.com";
      return { login: firstEmail, id: 1, scopes: ["openid", "email", "name"] };
    },
    initConfig: {
      apple: {
        users: [{ email: "testuser@icloud.com", name: "Test User" }],
        oauth_clients: [
          {
            client_id: "com.example.app",
            team_id: "TEAM001",
            name: "My Apple App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/apple"]
          }
        ]
      }
    }
  },
  microsoft: {
    label: "Microsoft Entra ID OAuth 2.0 / OpenID Connect emulator",
    endpoints: "OAuth authorize, token exchange, userinfo, OIDC discovery, Graph /me, logout, token revocation",
    async load() {
      const mod = await import("./dist-XR557IF3.js");
      return { plugin: mod.microsoftPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstEmail = cfg?.users?.[0]?.email ?? "testuser@outlook.com";
      return { login: firstEmail, id: 1, scopes: ["openid", "email", "profile", "User.Read"] };
    },
    initConfig: {
      microsoft: {
        users: [{ email: "testuser@outlook.com", name: "Test User" }],
        oauth_clients: [
          {
            client_id: "example-client-id",
            client_secret: "example-client-secret",
            name: "My Microsoft App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/microsoft-entra-id"]
          }
        ]
      }
    }
  },
  okta: {
    label: "Okta OAuth 2.0 / OpenID Connect + management API emulator",
    endpoints: "OIDC discovery, JWKS, OAuth authorize/token/userinfo/introspect/revoke/logout, users, groups, apps, authorization servers",
    async load() {
      const mod = await import("./dist-WF35VR6L.js");
      return { plugin: mod.oktaPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstLogin = cfg?.users?.[0]?.login ?? cfg?.users?.[0]?.email ?? "testuser@okta.local";
      return { login: firstLogin, id: 1, scopes: ["openid", "profile", "email", "groups"] };
    },
    initConfig: {
      okta: {
        users: [{ login: "testuser@okta.local", email: "testuser@okta.local", first_name: "Test", last_name: "User" }],
        groups: [{ name: "Everyone", description: "All users", type: "BUILT_IN", okta_id: "00g_everyone" }],
        authorization_servers: [{ id: "default", name: "default", audiences: ["api://default"] }],
        oauth_clients: [
          {
            client_id: "okta-test-client",
            client_secret: "okta-test-secret",
            name: "Sample OIDC Client",
            redirect_uris: ["http://localhost:3000/callback"],
            auth_server_id: "default"
          }
        ]
      }
    }
  },
  aws: {
    label: "AWS cloud service emulator",
    endpoints: "S3 (buckets, objects), SQS (queues, messages), IAM (users, roles, access keys), STS (assume role, caller identity)",
    async load() {
      const mod = await import("./dist-TPU46F5J.js");
      return { plugin: mod.awsPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return { login: "admin", id: 1, scopes: ["s3:*", "sqs:*", "iam:*", "sts:*"] };
    },
    initConfig: {
      aws: {
        region: "us-east-1",
        s3: { buckets: [{ name: "my-app-bucket" }, { name: "my-app-uploads" }] },
        sqs: { queues: [{ name: "my-app-events" }, { name: "my-app-dlq" }] },
        iam: {
          users: [{ user_name: "developer", create_access_key: true }],
          roles: [{ role_name: "lambda-execution-role", description: "Role for Lambda function execution" }]
        }
      }
    }
  },
  resend: {
    label: "Resend email API emulator",
    endpoints: "emails with 24-hour Idempotency-Key replay, domains, contacts, API keys, inbox UI",
    async load() {
      const mod = await import("./dist-BIXXNFKI.js");
      return { plugin: mod.resendPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return { login: "re_test_admin", id: 1, scopes: [] };
    },
    initConfig: {
      resend: {
        domains: [{ name: "example.com", region: "us-east-1" }],
        contacts: [{ email: "test@example.com", first_name: "Test", last_name: "User" }]
      }
    }
  },
  stripe: {
    label: "Stripe payments emulator",
    endpoints: "customers, payment methods, customer sessions, payment intents, charges, products, prices, checkout sessions, webhooks",
    async load() {
      const mod = await import("./dist-SNXHPNFU.js");
      return { plugin: mod.stripePlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return { login: "sk_test_admin", id: 1, scopes: [] };
    },
    initConfig: {
      stripe: {
        customers: [{ email: "test@example.com", name: "Test Customer" }],
        products: [{ name: "Pro Plan", description: "Monthly pro subscription" }],
        prices: [{ product_name: "Pro Plan", currency: "usd", unit_amount: 2e3 }]
      }
    }
  },
  mongoatlas: {
    label: "MongoDB Atlas service emulator",
    endpoints: "Atlas Admin API v2 (projects, clusters, database users, databases, collections), Atlas Data API v1 (findOne, find, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany, aggregate)",
    async load() {
      const mod = await import("./dist-NDJDEDCT.js");
      return { plugin: mod.mongoatlasPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return { login: "admin", id: 1, scopes: [] };
    },
    initConfig: {
      mongoatlas: {
        projects: [{ name: "Project0" }],
        clusters: [{ name: "Cluster0", project: "Project0" }],
        database_users: [{ username: "admin", project: "Project0" }],
        databases: [{ cluster: "Cluster0", name: "test", collections: ["items"] }]
      }
    }
  },
  clerk: {
    label: "Clerk authentication and user management emulator",
    endpoints: "OIDC discovery, JWKS, OAuth authorize/token/userinfo, users, email addresses, organizations, memberships, invitations, sessions",
    async load() {
      const mod = await import("./dist-EAAQMUXA.js");
      return { plugin: mod.clerkPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstEmail = cfg?.users?.[0]?.email_addresses?.[0] ?? "test@example.com";
      return { login: firstEmail, id: 1, scopes: [] };
    },
    initConfig: {
      clerk: {
        users: [
          {
            first_name: "Test",
            last_name: "User",
            email_addresses: ["test@example.com"],
            password: "clerk_test_password"
          }
        ],
        organizations: [
          {
            name: "My Company",
            slug: "my-company",
            members: [{ email: "test@example.com", role: "admin" }]
          }
        ],
        oauth_applications: [
          {
            client_id: "clerk_emulate_client",
            client_secret: "clerk_emulate_secret",
            name: "Emulate App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/clerk"]
          }
        ]
      }
    }
  },
  linear: {
    label: "Linear GraphQL API emulator",
    endpoints: "GraphQL, OAuth, issues, teams, users, workflow states, comments, labels, projects, cycles, webhooks, agents, inspector",
    async load() {
      const mod = await import("./dist-QHTJXXNG.js");
      return { plugin: mod.linearPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const firstEmail = cfg?.users?.[0]?.email ?? "admin@linear.local";
      return { login: firstEmail, id: 1, scopes: [] };
    },
    initConfig: {
      linear: {
        organization: { name: "Acme", url_key: "acme" },
        users: [
          { email: "admin@example.com", name: "Admin User", admin: true },
          { email: "dev@example.com", name: "Developer" }
        ],
        teams: [
          {
            key: "ENG",
            name: "Engineering",
            states: [
              { name: "Backlog", type: "backlog" },
              { name: "Todo", type: "unstarted" },
              { name: "In Progress", type: "started" },
              { name: "Done", type: "completed" }
            ]
          }
        ],
        labels: [
          { name: "Bug", color: "#d92d20", team: "ENG" },
          { name: "Feature", color: "#2563eb", team: "ENG" }
        ],
        issues: [
          {
            team: "ENG",
            title: "Fix local checkout test",
            description: "Reproduce and fix the checkout failure.",
            state: "Todo",
            assignee: "dev@example.com",
            labels: ["Bug"]
          }
        ],
        oauth_apps: [
          {
            client_id: "lin_example_client_id",
            client_secret: "example_client_secret",
            name: "My Linear App",
            redirect_uris: ["http://localhost:3000/api/auth/callback/linear"],
            scopes: ["read", "write", "issues:create", "comments:create"],
            actor: "user"
          }
        ],
        tokens: [
          {
            token: "lin_test_admin",
            user: "admin@example.com",
            scopes: ["read", "write", "issues:create", "comments:create", "admin"]
          }
        ],
        strict_scopes: false
      }
    }
  },
  twilio: {
    label: "Twilio API emulator",
    endpoints: "accounts, API keys, phone numbers, Programmable Messaging, Messaging Services, Verify, Voice, webhooks, simulator, inspector",
    async load() {
      const mod = await import("./dist-N3LK2QRW.js");
      return { plugin: mod.twilioPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback(cfg) {
      const account = cfg?.account;
      return {
        login: account?.sid ?? "AC00000000000000000000000000000000",
        id: 1,
        scopes: []
      };
    },
    initConfig: {
      twilio: {
        account: {
          sid: "AC00000000000000000000000000000000",
          auth_token: "twilio_test_auth_token",
          friendly_name: "Local Twilio Account"
        },
        api_keys: [
          {
            sid: "SK00000000000000000000000000000000",
            secret: "twilio_test_api_secret",
            friendly_name: "Local API Key"
          }
        ],
        phone_numbers: [
          {
            phone_number: "+15551234567",
            friendly_name: "Local SMS and Voice Number",
            sms_url: "http://localhost:3000/api/twilio/sms",
            voice_url: "http://localhost:3000/api/twilio/voice"
          }
        ],
        messaging_services: [
          {
            friendly_name: "Local Messaging Service",
            phone_numbers: ["+15551234567"]
          }
        ],
        verify_services: [
          {
            friendly_name: "Local Verify Service",
            code: "123456",
            default_channel: "sms"
          }
        ],
        conversations: {
          services: [{ friendly_name: "Local Conversations" }]
        }
      }
    }
  },
  telegram: {
    label: "Telegram Bot API emulator",
    endpoints: "Bot API at /bot<token>/<method> (messages, media, files, webhooks, getUpdates, forum topics, commands, descriptions), control API, inspector",
    async load() {
      const mod = await import("./dist-SKCN57BD.js");
      return { plugin: mod.telegramPlugin, seedFromConfig: mod.seedFromConfig };
    },
    defaultFallback() {
      return { login: "telegram", id: 1, scopes: [] };
    },
    initConfig: {
      telegram: {
        bots: [{ token: "1000000001:emulate-telegram-bot-token", username: "emulate_bot", first_name: "Emulate Bot" }],
        users: [{ name: "alice", first_name: "Alice", username: "alice" }],
        chats: [
          {
            name: "team",
            title: "Team",
            owner: "alice",
            forum: true,
            members: ["developer"],
            bots: ["emulate_bot"],
            topics: ["general-ideas"]
          }
        ]
      }
    }
  }
};

// src/base-url.ts
function resolveBaseUrl(opts) {
  if (opts.seedBaseUrl) {
    return opts.seedBaseUrl.replace(/\{service\}/g, opts.service);
  }
  if (opts.baseUrl) {
    return opts.baseUrl.replace(/\{service\}/g, opts.service);
  }
  const envBaseUrl = process.env.EMULATE_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\{service\}/g, opts.service);
  }
  const portlessUrl = process.env.PORTLESS_URL;
  if (portlessUrl) {
    return portlessUrl.replace(/\{service\}/g, opts.service);
  }
  return `http://localhost:${opts.port}`;
}

// src/api.ts
async function createEmulator(options) {
  if (typeof options.service === "string") return createBuiltinEmulator(options);
  const opts = options;
  if (opts.listen === false)
    return { ...await createCustomRuntime(opts.service, opts), generatedSecrets: Object.freeze([]) };
  let runtime;
  const server = serve({
    fetch: (request) => runtime ? runtime.fetch(request) : Response.json({ error: "Starting" }, { status: 503 }),
    port: opts.port ?? 4e3,
    hostname: opts.hostname
  });
  try {
    await waitForListening(server);
    const address = server.address();
    const port = address && typeof address === "object" ? address.port : opts.port ?? 4e3;
    const baseUrl = resolveBaseUrl({ service: opts.service.name, port, baseUrl: opts.baseUrl });
    runtime = await createCustomRuntime(opts.service, { ...opts, baseUrl });
    let closing;
    return {
      ...runtime,
      url: baseUrl,
      generatedSecrets: Object.freeze([]),
      close() {
        return closing ??= (async () => {
          const stopping = closeHttpServer(server);
          const results = await Promise.allSettled([runtime.close(), stopping]);
          const failures = results.filter((r) => r.status === "rejected");
          if (failures.length)
            throw new AggregateError(
              failures.map((r) => r.reason),
              "Could not close emulator"
            );
        })();
      }
    };
  } catch (error) {
    await closeHttpServer(server);
    throw error;
  }
}
function waitForListening(server) {
  if (server.listening) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const ready = () => {
      server.off("error", fail);
      resolve();
    };
    const fail = (error) => {
      server.off("listening", ready);
      reject(error);
    };
    server.once("listening", ready);
    server.once("error", fail);
  });
}
function closeHttpServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error && error.code !== "ERR_SERVER_NOT_RUNNING") reject(error);
      else resolve();
    });
    server.closeAllConnections();
  });
}
async function createBuiltinEmulator(options) {
  const { service, port = 4e3, seed: seedConfig } = options;
  const entry = SERVICE_REGISTRY[service];
  if (!entry) {
    throw new Error(`Unknown service: ${service}`);
  }
  const loaded = await entry.load();
  let handler;
  const httpServer = serve({
    fetch: (request) => handler ? handler(request) : new Response("Starting", { status: 503 }),
    port,
    hostname: options.hostname
  });
  try {
    await waitForListening(httpServer);
    const address = httpServer.address();
    const actualPort = address && typeof address === "object" ? address.port : port;
    const tokens = {};
    if (seedConfig?.tokens) {
      let tokenId = 100;
      for (const [token, user] of Object.entries(seedConfig.tokens)) {
        tokens[token] = { login: user.login, id: tokenId++, scopes: user.scopes };
      }
    } else {
      tokens["test_token_admin"] = { login: "admin", id: 2, scopes: ["repo", "user", "admin:org", "admin:repo_hook"] };
    }
    const inputSvcSeedConfig = seedConfig?.[service];
    const preparedSeed = inputSvcSeedConfig && loaded.prepareSeed ? await loaded.prepareSeed(inputSvcSeedConfig) : void 0;
    const svcSeedConfig = preparedSeed?.config ?? inputSvcSeedConfig;
    const generatedSecrets = Object.freeze(
      (preparedSeed?.generatedSecrets ?? []).map((secret) => Object.freeze({ service, ...secret }))
    );
    const seedBaseUrl = typeof svcSeedConfig?.baseUrl === "string" && svcSeedConfig.baseUrl.length > 0 ? svcSeedConfig.baseUrl : void 0;
    const baseUrl = resolveBaseUrl({ service, port: actualPort, baseUrl: options.baseUrl, seedBaseUrl });
    let cachedResolver;
    const appKeyResolver = loaded.createAppKeyResolver ? (appId) => cachedResolver(appId) : void 0;
    const fallbackUser = entry.defaultFallback(svcSeedConfig);
    const {
      app,
      store,
      webhooks,
      tokenMap,
      close: closePlugin
    } = createServer(loaded.plugin, {
      port,
      baseUrl,
      tokens,
      appKeyResolver,
      fallbackUser
    });
    cachedResolver = loaded.createAppKeyResolver?.(store);
    const seed = () => {
      loaded.plugin.seed?.(store, baseUrl);
      if (svcSeedConfig && loaded.seedFromConfig) {
        loaded.seedFromConfig(store, baseUrl, svcSeedConfig, webhooks);
      }
    };
    seed();
    handler = app.fetch;
    let closing;
    return {
      url: baseUrl,
      generatedSecrets,
      reset() {
        for (const [token, user] of tokenMap) {
          if (user.installation) tokenMap.delete(token);
        }
        store.reset();
        webhooks.clear();
        seed();
      },
      close() {
        return closing ??= closePlugin().then(() => closeHttpServer(httpServer));
      }
    };
  } catch (error) {
    await closeHttpServer(httpServer);
    throw error;
  }
}
export {
  closeHttpServer,
  createEmulator,
  defineConfig,
  defineEmulator,
  filePersistence,
  waitForListening
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=api.js.map
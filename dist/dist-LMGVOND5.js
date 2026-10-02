import "./chunk-PZ5AY32C.js";

// ../@emulators/resend/dist/index.js
import { randomUUID } from "crypto";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
function getResendStore(store) {
  return {
    emails: store.collection("resend.emails", ["uuid"]),
    idempotencyKeys: store.collection("resend.idempotency_keys", ["idempotency_key"]),
    domains: store.collection("resend.domains", ["uuid", "name"]),
    apiKeys: store.collection("resend.api_keys", ["uuid"]),
    audiences: store.collection("resend.audiences", ["uuid"]),
    contacts: store.collection("resend.contacts", ["uuid", "audience_id"])
  };
}
function generateUuid() {
  return randomUUID();
}
function resendError(c, statusCode, name, message) {
  return c.json({ statusCode, name, message }, statusCode);
}
function resendList(data) {
  return { object: "list", data };
}
async function parseResendBody(c) {
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await c.req.text();
    const params = new URLSearchParams(text);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }
  try {
    const body = await c.req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body;
    }
    return {};
  } catch {
    return {};
  }
}
var IDEMPOTENCY_KEY_TTL_MS = 24 * 60 * 60 * 1e3;
var IDEMPOTENCY_KEY_MAX_LENGTH = 256;
function emailRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const rs = () => getResendStore(store);
  app.post("/emails/batch", async (c) => {
    const idempotencyKey = c.req.header("Idempotency-Key");
    if (idempotencyKey !== void 0 && !isValidIdempotencyKey(idempotencyKey)) {
      return invalidIdempotencyKey(c);
    }
    let emails;
    try {
      const raw = await c.req.json();
      if (!Array.isArray(raw)) {
        return resendError(c, 422, "validation_error", "Request body must be an array");
      }
      emails = raw;
    } catch {
      return resendError(c, 422, "validation_error", "Request body must be an array");
    }
    if (emails.length > 100) {
      return resendError(c, 422, "validation_error", "Batch size cannot exceed 100 emails");
    }
    for (const emailData of emails) {
      if (!emailData.from) return resendError(c, 422, "validation_error", "Missing required field: from");
      if (!emailData.to) return resendError(c, 422, "validation_error", "Missing required field: to");
      if (!emailData.subject) return resendError(c, 422, "validation_error", "Missing required field: subject");
    }
    const normalizedEmails = emails.map(normalizeEmailInput);
    const fingerprint = requestFingerprint(normalizedEmails);
    if (idempotencyKey !== void 0) {
      const replay = findIdempotencyReplay(c, rs(), idempotencyKey, "emails/batch", fingerprint);
      if (replay) return replay;
    }
    if (idempotencyKey === void 0) {
      const results = [];
      for (const input of normalizedEmails) {
        const prepared = prepareEmail(input);
        insertPreparedEmail(rs().emails, prepared);
        await dispatchPreparedEmail(webhooks, prepared);
        results.push({ id: prepared.uuid });
      }
      return c.json({ data: results }, 200);
    }
    const preparedEmails = normalizedEmails.map(prepareEmail);
    for (const prepared of preparedEmails) {
      insertPreparedEmail(rs().emails, prepared);
    }
    const response = { data: preparedEmails.map(({ uuid }) => ({ id: uuid })) };
    cacheIdempotencyRecord(
      rs().idempotencyKeys,
      idempotencyKey,
      "emails/batch",
      fingerprint,
      response.data.map((r) => r.id)
    );
    for (const prepared of preparedEmails) {
      await dispatchPreparedEmail(webhooks, prepared);
    }
    return c.json(response, 200);
  });
  app.post("/emails", async (c) => {
    const idempotencyKey = c.req.header("Idempotency-Key");
    if (idempotencyKey !== void 0 && !isValidIdempotencyKey(idempotencyKey)) {
      return invalidIdempotencyKey(c);
    }
    const body = await parseResendBody(c);
    const from = body.from;
    const to = body.to;
    const subject = body.subject;
    if (!from) return resendError(c, 422, "validation_error", "Missing required field: from");
    if (!to) return resendError(c, 422, "validation_error", "Missing required field: to");
    if (!subject) return resendError(c, 422, "validation_error", "Missing required field: subject");
    const normalizedInput = normalizeEmailInput(body);
    const fingerprint = requestFingerprint(normalizedInput);
    if (idempotencyKey !== void 0) {
      const replay = findIdempotencyReplay(c, rs(), idempotencyKey, "emails", fingerprint);
      if (replay) return replay;
    }
    const prepared = prepareEmail(normalizedInput);
    insertPreparedEmail(rs().emails, prepared);
    const response = { id: prepared.uuid };
    if (idempotencyKey !== void 0) {
      cacheIdempotencyRecord(rs().idempotencyKeys, idempotencyKey, "emails", fingerprint, [prepared.uuid]);
    }
    await dispatchPreparedEmail(webhooks, prepared);
    return c.json(response, 200);
  });
  app.get("/emails", (c) => {
    const allEmails = rs().emails.all();
    return c.json(resendList(allEmails.map(formatEmail)));
  });
  app.get("/emails/:id", (c) => {
    const id = c.req.param("id");
    const email = rs().emails.findOneBy("uuid", id);
    if (!email) return resendError(c, 404, "not_found", "Email not found");
    return c.json(formatEmail(email));
  });
  app.post("/emails/:id/cancel", (c) => {
    const id = c.req.param("id");
    const email = rs().emails.findOneBy("uuid", id);
    if (!email) return resendError(c, 404, "not_found", "Email not found");
    if (email.status !== "scheduled") {
      return resendError(c, 422, "validation_error", "Only scheduled emails can be canceled");
    }
    rs().emails.update(email.id, {
      status: "canceled",
      last_event: "email.canceled"
    });
    return c.json({ id: email.uuid, object: "email", canceled: true });
  });
}
function isValidIdempotencyKey(key) {
  return key.length >= 1 && key.length <= IDEMPOTENCY_KEY_MAX_LENGTH;
}
function invalidIdempotencyKey(c) {
  return resendError(c, 400, "invalid_idempotency_key", "Idempotency-Key must be between 1 and 256 characters");
}
function requestFingerprint(payload) {
  return stableStringify(payload);
}
function stableStringify(value) {
  if (value === void 0) return "null";
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(",")}}`;
}
function findIdempotencyReplay(c, resendStore, key, endpoint, fingerprint) {
  pruneExpiredIdempotencyRecords(resendStore);
  const record = resendStore.idempotencyKeys.findOneBy("idempotency_key", key);
  if (!record) return void 0;
  if (record.endpoint !== endpoint || record.request_fingerprint !== fingerprint) {
    return resendError(c, 409, "invalid_idempotent_request", "The idempotency key was used with a different request");
  }
  if (endpoint === "emails") {
    return c.json({ id: record.response_email_ids[0] }, 200);
  }
  return c.json({ data: record.response_email_ids.map((id) => ({ id })) }, 200);
}
function pruneExpiredIdempotencyRecords(resendStore) {
  const cutoff = Date.now() - IDEMPOTENCY_KEY_TTL_MS;
  for (const record of resendStore.idempotencyKeys.all()) {
    if (Date.parse(record.created_at) < cutoff) {
      resendStore.idempotencyKeys.delete(record.id);
    }
  }
}
function cacheIdempotencyRecord(idempotencyKeys, key, endpoint, fingerprint, responseEmailIds) {
  idempotencyKeys.insert({
    idempotency_key: key,
    endpoint,
    request_fingerprint: fingerprint,
    response_email_ids: responseEmailIds
  });
}
function normalizeEmailInput(emailData) {
  const to = emailData.to;
  return {
    from: emailData.from,
    to: Array.isArray(to) ? to : [to],
    subject: emailData.subject,
    html: emailData.html ?? null,
    text: emailData.text ?? null,
    cc: normalizeStringArray(emailData.cc),
    bcc: normalizeStringArray(emailData.bcc),
    reply_to: normalizeStringArray(emailData.reply_to),
    headers: emailData.headers ?? {},
    tags: emailData.tags ?? [],
    scheduled_at: emailData.scheduled_at ?? null
  };
}
function prepareEmail(input) {
  return {
    uuid: generateUuid(),
    input,
    scheduled: Boolean(input.scheduled_at)
  };
}
function insertPreparedEmail(emails, prepared) {
  const status = prepared.scheduled ? "scheduled" : "delivered";
  emails.insert({
    uuid: prepared.uuid,
    ...prepared.input,
    status,
    last_event: prepared.scheduled ? "email.scheduled" : "email.delivered"
  });
}
async function dispatchPreparedEmail(webhooks, prepared) {
  if (prepared.scheduled) return;
  const { uuid, input } = prepared;
  await webhooks.dispatch(
    "email.sent",
    void 0,
    { type: "email.sent", data: { email_id: uuid, to: input.to, from: input.from, subject: input.subject } },
    "resend"
  );
  await webhooks.dispatch(
    "email.delivered",
    void 0,
    { type: "email.delivered", data: { email_id: uuid, to: input.to, from: input.from, subject: input.subject } },
    "resend"
  );
}
function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}
function formatEmail(email) {
  return {
    id: email.uuid,
    object: "email",
    from: email.from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    cc: email.cc,
    bcc: email.bcc,
    reply_to: email.reply_to,
    headers: email.headers,
    tags: email.tags,
    status: email.status,
    scheduled_at: email.scheduled_at,
    last_event: email.last_event,
    created_at: email.created_at
  };
}
function domainRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const rs = () => getResendStore(store);
  app.post("/domains", async (c) => {
    const body = await parseResendBody(c);
    const name = body.name;
    if (!name) return resendError(c, 422, "validation_error", "Missing required field: name");
    const region = body.region ?? "us-east-1";
    const uuid = generateUuid();
    const records = [
      {
        record: "SPF",
        name,
        type: "MX",
        ttl: "Auto",
        status: "pending",
        value: `feedback-smtp.${region}.amazonses.com`,
        priority: 10
      },
      {
        record: "SPF",
        name,
        type: "TXT",
        ttl: "Auto",
        status: "pending",
        value: "v=spf1 include:amazonses.com ~all"
      },
      {
        record: "DKIM",
        name: `resend._domainkey.${name}`,
        type: "CNAME",
        ttl: "Auto",
        status: "pending",
        value: `resend.domainkey.${region}.amazonses.com`
      }
    ];
    const domain = rs().domains.insert({
      uuid,
      name,
      status: "pending",
      region,
      records
    });
    await webhooks.dispatch(
      "domain.created",
      void 0,
      { type: "domain.created", data: { id: uuid, name } },
      "resend"
    );
    return c.json(formatDomain(domain), 200);
  });
  app.get("/domains", (c) => {
    const allDomains = rs().domains.all();
    return c.json(resendList(allDomains.map(formatDomain)));
  });
  app.get("/domains/:id", (c) => {
    const id = c.req.param("id");
    const domain = rs().domains.findOneBy("uuid", id);
    if (!domain) return resendError(c, 404, "not_found", "Domain not found");
    return c.json(formatDomain(domain));
  });
  app.delete("/domains/:id", async (c) => {
    const id = c.req.param("id");
    const domain = rs().domains.findOneBy("uuid", id);
    if (!domain) return resendError(c, 404, "not_found", "Domain not found");
    rs().domains.delete(domain.id);
    await webhooks.dispatch(
      "domain.deleted",
      void 0,
      { type: "domain.deleted", data: { id: domain.uuid, name: domain.name } },
      "resend"
    );
    return c.json({ object: "domain", id: domain.uuid, deleted: true });
  });
  app.post("/domains/:id/verify", (c) => {
    const id = c.req.param("id");
    const domain = rs().domains.findOneBy("uuid", id);
    if (!domain) return resendError(c, 404, "not_found", "Domain not found");
    const verifiedRecords = domain.records.map((r) => ({ ...r, status: "verified" }));
    rs().domains.update(domain.id, {
      status: "verified",
      records: verifiedRecords
    });
    return c.json({ object: "domain", id: domain.uuid, status: "verified" });
  });
}
function formatDomain(domain) {
  return {
    id: domain.uuid,
    object: "domain",
    name: domain.name,
    status: domain.status,
    region: domain.region,
    records: domain.records,
    created_at: domain.created_at
  };
}
function apiKeyRoutes(ctx) {
  const { app, store } = ctx;
  const rs = () => getResendStore(store);
  app.post("/api-keys", async (c) => {
    const body = await parseResendBody(c);
    const name = body.name;
    if (!name) return resendError(c, 422, "validation_error", "Missing required field: name");
    const uuid = generateUuid();
    const token = `re_${randomBytes(16).toString("hex")}`;
    const apiKey = rs().apiKeys.insert({
      uuid,
      name,
      token
    });
    return c.json(
      {
        id: apiKey.uuid,
        token: apiKey.token
      },
      200
    );
  });
  app.get("/api-keys", (c) => {
    const allKeys = rs().apiKeys.all();
    return c.json(
      resendList(
        allKeys.map((key) => ({
          id: key.uuid,
          name: key.name,
          created_at: key.created_at
        }))
      )
    );
  });
  app.delete("/api-keys/:id", (c) => {
    const id = c.req.param("id");
    const apiKey = rs().apiKeys.findOneBy("uuid", id);
    if (!apiKey) return resendError(c, 404, "not_found", "API key not found");
    rs().apiKeys.delete(apiKey.id);
    return c.json({ deleted: true });
  });
}
function contactRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const rs = () => getResendStore(store);
  app.post("/audiences", async (c) => {
    const body = await parseResendBody(c);
    const name = body.name;
    if (!name) return resendError(c, 422, "validation_error", "Missing required field: name");
    const uuid = generateUuid();
    const audience = rs().audiences.insert({ uuid, name });
    return c.json(
      {
        id: audience.uuid,
        object: "audience",
        name: audience.name,
        created_at: audience.created_at
      },
      200
    );
  });
  app.get("/audiences", (c) => {
    const allAudiences = rs().audiences.all();
    return c.json(
      resendList(
        allAudiences.map((a) => ({
          id: a.uuid,
          object: "audience",
          name: a.name,
          created_at: a.created_at
        }))
      )
    );
  });
  app.delete("/audiences/:id", (c) => {
    const id = c.req.param("id");
    const audience = rs().audiences.findOneBy("uuid", id);
    if (!audience) return resendError(c, 404, "not_found", "Audience not found");
    rs().audiences.delete(audience.id);
    return c.json({ object: "audience", id: audience.uuid, deleted: true });
  });
  app.post("/audiences/:audience_id/contacts", async (c) => {
    const audienceId = c.req.param("audience_id");
    const audience = rs().audiences.findOneBy("uuid", audienceId);
    if (!audience) return resendError(c, 404, "not_found", "Audience not found");
    const body = await parseResendBody(c);
    const email = body.email;
    if (!email) return resendError(c, 422, "validation_error", "Missing required field: email");
    const uuid = generateUuid();
    const contact = rs().contacts.insert({
      uuid,
      audience_id: audienceId,
      email,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      unsubscribed: body.unsubscribed ?? false
    });
    await webhooks.dispatch(
      "contact.created",
      void 0,
      { type: "contact.created", data: { id: uuid, email, audience_id: audienceId } },
      "resend"
    );
    return c.json(
      {
        id: contact.uuid,
        object: "contact",
        email: contact.email
      },
      200
    );
  });
  app.get("/audiences/:audience_id/contacts", (c) => {
    const audienceId = c.req.param("audience_id");
    const audience = rs().audiences.findOneBy("uuid", audienceId);
    if (!audience) return resendError(c, 404, "not_found", "Audience not found");
    const contacts = rs().contacts.findBy("audience_id", audienceId);
    return c.json(
      resendList(
        contacts.map((ct) => ({
          id: ct.uuid,
          object: "contact",
          email: ct.email,
          first_name: ct.first_name,
          last_name: ct.last_name,
          unsubscribed: ct.unsubscribed,
          created_at: ct.created_at
        }))
      )
    );
  });
  app.delete("/audiences/:audience_id/contacts/:id", async (c) => {
    const audienceId = c.req.param("audience_id");
    const contactId = c.req.param("id");
    const contact = rs().contacts.findOneBy("uuid", contactId);
    if (!contact || contact.audience_id !== audienceId) {
      return resendError(c, 404, "not_found", "Contact not found");
    }
    rs().contacts.delete(contact.id);
    await webhooks.dispatch(
      "contact.deleted",
      void 0,
      { type: "contact.deleted", data: { id: contact.uuid, email: contact.email, audience_id: audienceId } },
      "resend"
    );
    return c.json({ object: "contact", id: contact.uuid, deleted: true });
  });
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
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS = {
  "geist-sans.woff2": readFileSync(join(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join(__dirname, "fonts", "favicon.ico"));
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
function renderCardPage(title, subtitle, body, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner">
    <div class="card-title">${escapeHtml(title)}</div>
    <div class="card-subtitle">${subtitle}</div>
    ${body}
  </div>
</div>
${POWERED_BY}
</body></html>`;
}
var SERVICE_LABEL = "Resend";
function inboxRoutes(ctx) {
  const { app, store } = ctx;
  const rs = () => getResendStore(store);
  app.get("/inbox", (c) => {
    const emails = rs().emails.all().reverse();
    let body = "";
    if (emails.length === 0) {
      body = `<div class="empty">No emails sent yet. Use POST /emails to send one.</div>`;
    } else {
      for (const email of emails) {
        const letter = (email.from?.[0] ?? "?").toUpperCase();
        const statusClass = email.status === "delivered" ? "badge-granted" : email.status === "bounced" ? "badge-denied" : "badge-requested";
        body += `<a href="/inbox/${escapeAttr(email.uuid)}" class="app-link">
  <span class="org-icon">${escapeHtml(letter)}</span>
  <span class="user-text">
    <span class="org-name">${escapeHtml(email.subject)}</span>
    <span class="user-meta">${escapeHtml(email.from)} &rarr; ${escapeHtml(email.to.join(", "))}</span>
  </span>
  <span class="badge ${statusClass}">${escapeHtml(email.status)}</span>
</a>`;
      }
    }
    const html = renderCardPage(
      "Inbox",
      `${emails.length} email${emails.length !== 1 ? "s" : ""} sent`,
      body,
      SERVICE_LABEL
    );
    return c.html(html);
  });
  app.get("/inbox/:id", (c) => {
    const id = c.req.param("id");
    const email = rs().emails.findOneBy("uuid", id);
    if (!email) {
      const html2 = renderCardPage(
        "Not Found",
        "The requested email was not found.",
        `<div class="empty">Email not found</div>`,
        SERVICE_LABEL
      );
      return c.html(html2, 404);
    }
    const statusClass = email.status === "delivered" ? "badge-granted" : email.status === "bounced" ? "badge-denied" : "badge-requested";
    let tagsHtml = "";
    if (email.tags.length > 0) {
      tagsHtml = `<div class="info-text">`;
      for (const tag of email.tags) {
        tagsHtml += `<span class="badge badge-requested">${escapeHtml(tag.name)}: ${escapeHtml(tag.value)}</span> `;
      }
      tagsHtml += `</div>`;
    }
    const recipientLines = [];
    recipientLines.push(`<strong>To:</strong> ${escapeHtml(email.to.join(", "))}`);
    if (email.cc.length > 0) {
      recipientLines.push(`<strong>Cc:</strong> ${escapeHtml(email.cc.join(", "))}`);
    }
    if (email.bcc.length > 0) {
      recipientLines.push(`<strong>Bcc:</strong> ${escapeHtml(email.bcc.join(", "))}`);
    }
    const srcdocHtml = email.html ? escapeAttr(`<base target="_blank">${email.html}`) : null;
    const previewContent = srcdocHtml ? `<iframe
  sandbox="allow-popups allow-popups-to-escape-sandbox"
  srcdoc="${srcdocHtml}"
  class="s-card"
  style="width:100%;min-height:300px;border:1px solid #0a3300;border-radius:8px;background:#fff;"
></iframe>` : email.text ? `<div class="s-card"><pre class="info-text">${escapeHtml(email.text)}</pre></div>` : `<div class="empty">No content</div>`;
    const body = `
<div class="org-row">
  <span class="badge ${statusClass}">${escapeHtml(email.status)}</span>
  <span class="user-meta">${escapeHtml(email.created_at)}</span>
</div>
<div class="s-card">
  <div class="perm-list">
    <li><strong>From:</strong> ${escapeHtml(email.from)}</li>
    ${recipientLines.map((line) => `<li>${line}</li>`).join("\n    ")}
  </div>
</div>
${tagsHtml}
<div class="section-heading">Preview</div>
${previewContent}
<div class="info-text">
  <strong>Last event:</strong> ${escapeHtml(email.last_event)}
  ${email.scheduled_at ? ` | <strong>Scheduled:</strong> ${escapeHtml(email.scheduled_at)}` : ""}
</div>`;
    const html = renderCardPage(email.subject, `Email ${escapeHtml(email.uuid)}`, body, SERVICE_LABEL);
    return c.html(html);
  });
}
function seedFromConfig(store, _baseUrl, config) {
  const rs = getResendStore(store);
  if (config.domains) {
    for (const d of config.domains) {
      const existing = rs.domains.findOneBy("name", d.name);
      if (existing) continue;
      const region = d.region ?? "us-east-1";
      rs.domains.insert({
        uuid: generateUuid(),
        name: d.name,
        status: "verified",
        region,
        records: [
          {
            record: "SPF",
            name: d.name,
            type: "MX",
            ttl: "Auto",
            status: "verified",
            value: `feedback-smtp.${region}.amazonses.com`,
            priority: 10
          },
          {
            record: "SPF",
            name: d.name,
            type: "TXT",
            ttl: "Auto",
            status: "verified",
            value: "v=spf1 include:amazonses.com ~all"
          },
          {
            record: "DKIM",
            name: `resend._domainkey.${d.name}`,
            type: "CNAME",
            ttl: "Auto",
            status: "verified",
            value: `resend.domainkey.${region}.amazonses.com`
          }
        ]
      });
    }
  }
  if (config.contacts) {
    let defaultAudience = rs.audiences.findOneBy("name", "Default");
    if (!defaultAudience) {
      defaultAudience = rs.audiences.insert({ uuid: generateUuid(), name: "Default" });
    }
    for (const ct of config.contacts) {
      let audienceId = defaultAudience.uuid;
      if (ct.audience) {
        let audience = rs.audiences.findOneBy("name", ct.audience);
        if (!audience) {
          audience = rs.audiences.insert({ uuid: generateUuid(), name: ct.audience });
        }
        audienceId = audience.uuid;
      }
      rs.contacts.insert({
        uuid: generateUuid(),
        audience_id: audienceId,
        email: ct.email,
        first_name: ct.first_name ?? null,
        last_name: ct.last_name ?? null,
        unsubscribed: false
      });
    }
  }
}
var resendPlugin = {
  name: "resend",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    emailRoutes(ctx);
    domainRoutes(ctx);
    apiKeyRoutes(ctx);
    contactRoutes(ctx);
    inboxRoutes(ctx);
  },
  seed(_store, _baseUrl) {
  }
};
var index_default = resendPlugin;
export {
  index_default as default,
  getResendStore,
  resendPlugin,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-LMGVOND5.js.map
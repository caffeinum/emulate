import "./chunk-PZ5AY32C.js";

// ../@emulators/twilio/dist/index.js
import { randomBytes } from "crypto";
import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
function twilioSid(prefix) {
  return `${prefix}${randomBytes(16).toString("hex")}`;
}
function fixedSid(prefix) {
  return `${prefix}${"0".repeat(32)}`;
}
function getTwilioStore(store) {
  return {
    accounts: store.collection("twilio.accounts", ["sid"]),
    apiKeys: store.collection("twilio.api_keys", ["sid", "account_sid"]),
    applications: store.collection("twilio.applications", ["sid", "account_sid"]),
    phoneNumbers: store.collection("twilio.phone_numbers", [
      "sid",
      "account_sid",
      "phone_number"
    ]),
    messagingServices: store.collection("twilio.messaging_services", ["sid", "account_sid"]),
    messagingServicePhoneNumbers: store.collection(
      "twilio.messaging_service_phone_numbers",
      ["sid", "account_sid", "service_sid", "phone_number_sid"]
    ),
    messages: store.collection("twilio.messages", [
      "sid",
      "account_sid",
      "to",
      "from",
      "status",
      "messaging_service_sid"
    ]),
    media: store.collection("twilio.media", ["sid", "account_sid", "message_sid"]),
    verifyServices: store.collection("twilio.verify_services", ["sid", "account_sid"]),
    verifications: store.collection("twilio.verifications", [
      "sid",
      "service_sid",
      "account_sid",
      "to",
      "status"
    ]),
    calls: store.collection("twilio.calls", ["sid", "account_sid", "to", "from", "status"]),
    webhookDeliveries: store.collection("twilio.webhook_deliveries", [
      "twilio_id",
      "account_sid",
      "event"
    ]),
    conversationServices: store.collection("twilio.conversation_services", [
      "sid",
      "account_sid"
    ]),
    conversations: store.collection("twilio.conversations", [
      "sid",
      "account_sid",
      "service_sid",
      "unique_name"
    ]),
    conversationParticipants: store.collection("twilio.conversation_participants", [
      "sid",
      "account_sid",
      "service_sid",
      "conversation_sid",
      "identity"
    ]),
    conversationMessages: store.collection("twilio.conversation_messages", [
      "sid",
      "account_sid",
      "service_sid",
      "conversation_sid"
    ])
  };
}
async function parseTwilioBody(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  const rawText = await c.req.text();
  if (!rawText) return {};
  if (contentType.includes("application/json")) {
    const parsed = JSON.parse(rawText);
    const out2 = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) out2[key] = value.map(String);
      else if (value !== void 0 && value !== null) out2[key] = String(value);
    }
    return out2;
  }
  const params = new URLSearchParams(rawText);
  const out = {};
  for (const [key, value] of params) {
    const existing = out[key];
    if (Array.isArray(existing)) existing.push(value);
    else if (existing !== void 0) out[key] = [existing, value];
    else out[key] = value;
  }
  return out;
}
function bodyString(body, key) {
  const direct = body[key];
  if (Array.isArray(direct)) return direct[0];
  if (direct !== void 0) return direct;
  const lower = key.toLowerCase();
  const found = Object.entries(body).find(([candidate]) => candidate.toLowerCase() === lower);
  if (!found) return void 0;
  return Array.isArray(found[1]) ? found[1][0] : found[1];
}
function bodyStrings(body, key) {
  const value = body[key] ?? body[`${key}[]`];
  if (Array.isArray(value)) return value;
  if (value !== void 0) return [value];
  return [];
}
function twilioError(c, status, message, code) {
  return c.json(
    {
      code,
      message,
      more_info: code ? `https://www.twilio.com/docs/errors/${code}` : void 0,
      status
    },
    status
  );
}
function decodeBasicAuth(c) {
  const header = c.req.header("Authorization") ?? "";
  if (!header.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx === -1) return null;
    return { username: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}
function constantTimeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
function requireTwilioAuth(c, ts) {
  const auth = decodeBasicAuth(c);
  if (!auth) return twilioError(c, 401, "Authenticate", 20003);
  const account = ts.accounts.findOneBy("sid", auth.username);
  if (account && constantTimeEqual(auth.password, account.auth_token)) return account;
  const key = ts.apiKeys.findOneBy("sid", auth.username);
  if (key && key.active && constantTimeEqual(auth.password, key.secret)) {
    const keyAccount = ts.accounts.findOneBy("sid", key.account_sid);
    if (keyAccount) return keyAccount;
  }
  return twilioError(c, 401, "Authenticate", 20003);
}
function accountFromParam(c, ts, authenticated) {
  const accountSid = c.req.param("accountSid");
  const account = ts.accounts.findOneBy("sid", accountSid);
  if (!account) return twilioError(c, 404, "The requested resource was not found", 20404);
  if (account.sid !== authenticated.sid) return twilioError(c, 403, "Account access denied", 20003);
  return account;
}
function twilioDate(iso) {
  if (!iso) return null;
  return new Date(iso).toUTCString().replace("GMT", "+0000");
}
function normalizeMethod(method) {
  return (method ?? "POST").toUpperCase();
}
function normalizePhoneNumber(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("whatsapp:")) {
    const number = normalizePhoneNumber(trimmed.slice("whatsapp:".length));
    return number ? `whatsapp:${number}` : null;
  }
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) return trimmed;
  return null;
}
function messageSegments(body) {
  if (!body) return "0";
  return String(Math.max(1, Math.ceil(body.length / 160)));
}
function signTwilioRequest(url, params, authToken) {
  const sorted = Object.keys(params).sort().map((key) => `${key}${params[key]}`).join("");
  return createHmac("sha1", authToken).update(`${url}${sorted}`).digest("base64");
}
function pageSize(c) {
  const requested = Number(c.req.query("PageSize") ?? c.req.query("pageSize") ?? 50);
  if (!Number.isFinite(requested)) return 50;
  return Math.min(Math.max(1, requested), 1e3);
}
function pageNumber(c) {
  const requested = Number(c.req.query("Page") ?? c.req.query("page") ?? 0);
  if (!Number.isFinite(requested)) return 0;
  return Math.max(0, requested);
}
function twilioList(c, key, items, uri, formatter) {
  const size = pageSize(c);
  const page = pageNumber(c);
  const start = page * size;
  const records = items.slice(start, start + size);
  const firstPageUri = `${uri}?PageSize=${size}&Page=0`;
  const previousPageUri = page > 0 ? `${uri}?PageSize=${size}&Page=${page - 1}` : null;
  const nextPageUri = start + size < items.length ? `${uri}?PageSize=${size}&Page=${page + 1}` : null;
  return c.json({
    [key]: records.map(formatter),
    end: start + records.length,
    first_page_uri: firstPageUri,
    next_page_uri: nextPageUri,
    page,
    page_size: size,
    previous_page_uri: previousPageUri,
    start,
    uri
  });
}
async function dispatchTwilioWebhook(ts, account, event, url, method, params) {
  if (!url) return;
  const normalizedMethod = normalizeMethod(method);
  let requestUrl = url;
  let headers = {};
  let responseStatus = null;
  let responseBody = null;
  let success = false;
  let error = null;
  try {
    if (normalizedMethod === "GET") {
      const parsedUrl = new URL(url);
      for (const [key, value] of Object.entries(params)) parsedUrl.searchParams.append(key, value);
      requestUrl = parsedUrl.toString();
    }
    const signatureParams = normalizedMethod === "GET" ? {} : params;
    headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": signTwilioRequest(requestUrl, signatureParams, account.auth_token)
    };
    const response = await fetch(requestUrl, {
      method: normalizedMethod,
      headers,
      body: normalizedMethod === "GET" ? void 0 : new URLSearchParams(params).toString(),
      signal: AbortSignal.timeout(1e4)
    });
    responseStatus = response.status;
    responseBody = await response.text();
    success = response.ok;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  ts.webhookDeliveries.insert({
    twilio_id: `TW${String(Date.now())}${String(ts.webhookDeliveries.all().length + 1).padStart(6, "0")}`,
    account_sid: account.sid,
    event,
    url: requestUrl,
    method: normalizedMethod,
    request_body: params,
    request_headers: headers,
    response_status: responseStatus,
    response_body: responseBody,
    success,
    error
  });
}
function maskSecret(value) {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
var API_VERSION = "2010-04-01";
function formatAccount(account) {
  return {
    sid: account.sid,
    date_created: twilioDate(account.created_at),
    date_updated: twilioDate(account.updated_at),
    friendly_name: account.friendly_name,
    owner_account_sid: account.owner_account_sid,
    status: account.status,
    type: account.owner_account_sid ? "SubAccount" : "Full",
    uri: `/${API_VERSION}/Accounts/${account.sid}.json`,
    subresource_uris: {
      available_phone_numbers: `/${API_VERSION}/Accounts/${account.sid}/AvailablePhoneNumbers.json`,
      calls: `/${API_VERSION}/Accounts/${account.sid}/Calls.json`,
      incoming_phone_numbers: `/${API_VERSION}/Accounts/${account.sid}/IncomingPhoneNumbers.json`,
      messages: `/${API_VERSION}/Accounts/${account.sid}/Messages.json`,
      recordings: `/${API_VERSION}/Accounts/${account.sid}/Recordings.json`
    }
  };
}
function formatPhoneNumber(number) {
  return {
    sid: number.sid,
    account_sid: number.account_sid,
    friendly_name: number.friendly_name,
    phone_number: number.phone_number,
    voice_url: number.voice_url,
    voice_method: number.voice_method,
    sms_url: number.sms_url,
    sms_method: number.sms_method,
    status_callback: number.status_callback,
    capabilities: number.capabilities,
    date_created: twilioDate(number.created_at),
    date_updated: twilioDate(number.updated_at),
    uri: `/${API_VERSION}/Accounts/${number.account_sid}/IncomingPhoneNumbers/${number.sid}.json`
  };
}
function formatMessagingService(service) {
  return {
    sid: service.sid,
    account_sid: service.account_sid,
    friendly_name: service.friendly_name,
    inbound_request_url: service.inbound_request_url,
    status_callback: service.status_callback,
    date_created: service.created_at,
    date_updated: service.updated_at,
    url: `https://messaging.twilio.com/v1/Services/${service.sid}`,
    links: {
      phone_numbers: `https://messaging.twilio.com/v1/Services/${service.sid}/PhoneNumbers`
    }
  };
}
function formatMessagingServicePhoneNumber(item, phoneNumber) {
  return {
    sid: item.sid,
    account_sid: item.account_sid,
    service_sid: item.service_sid,
    phone_number_sid: item.phone_number_sid,
    phone_number: phoneNumber?.phone_number ?? null,
    date_created: item.created_at,
    date_updated: item.updated_at,
    url: `https://messaging.twilio.com/v1/Services/${item.service_sid}/PhoneNumbers/${item.sid}`
  };
}
function formatMessage(message) {
  return {
    sid: message.sid,
    date_created: twilioDate(message.created_at),
    date_updated: twilioDate(message.updated_at),
    date_sent: twilioDate(message.date_sent),
    account_sid: message.account_sid,
    to: message.to,
    from: message.from,
    messaging_service_sid: message.messaging_service_sid,
    body: message.body,
    status: message.status,
    num_segments: message.num_segments,
    num_media: message.num_media,
    direction: message.direction,
    api_version: message.api_version,
    price: message.price,
    price_unit: message.price_unit,
    error_code: message.error_code,
    error_message: message.error_message,
    uri: `/${API_VERSION}/Accounts/${message.account_sid}/Messages/${message.sid}.json`,
    subresource_uris: {
      media: `/${API_VERSION}/Accounts/${message.account_sid}/Messages/${message.sid}/Media.json`,
      feedback: `/${API_VERSION}/Accounts/${message.account_sid}/Messages/${message.sid}/Feedback.json`
    }
  };
}
function formatMedia(media) {
  return {
    sid: media.sid,
    account_sid: media.account_sid,
    parent_sid: media.message_sid,
    content_type: media.content_type,
    date_created: twilioDate(media.created_at),
    date_updated: twilioDate(media.updated_at),
    uri: media.uri
  };
}
function formatVerifyService(service) {
  return {
    sid: service.sid,
    account_sid: service.account_sid,
    friendly_name: service.friendly_name,
    code_length: service.code.length,
    default_template_sid: null,
    date_created: service.created_at,
    date_updated: service.updated_at,
    url: `https://verify.twilio.com/v2/Services/${service.sid}`,
    links: {
      verifications: `https://verify.twilio.com/v2/Services/${service.sid}/Verifications`,
      verification_checks: `https://verify.twilio.com/v2/Services/${service.sid}/VerificationCheck`
    }
  };
}
function formatVerification(verification) {
  return {
    sid: verification.sid,
    service_sid: verification.service_sid,
    account_sid: verification.account_sid,
    to: verification.to,
    channel: verification.channel,
    status: verification.status,
    valid: verification.valid,
    lookup: verification.lookup,
    amount: null,
    payee: null,
    send_code_attempts: verification.send_code_attempts,
    date_created: verification.created_at,
    date_updated: verification.updated_at,
    url: `https://verify.twilio.com/v2/Services/${verification.service_sid}/Verifications/${verification.sid}`
  };
}
function formatVerificationCheck(verification) {
  return {
    sid: verification.sid,
    service_sid: verification.service_sid,
    account_sid: verification.account_sid,
    to: verification.to,
    channel: verification.channel,
    status: verification.status,
    valid: verification.valid,
    date_created: verification.created_at,
    date_updated: verification.updated_at
  };
}
function formatCall(call) {
  return {
    sid: call.sid,
    parent_call_sid: call.parent_call_sid,
    date_created: twilioDate(call.created_at),
    date_updated: twilioDate(call.updated_at),
    account_sid: call.account_sid,
    to: call.to,
    from: call.from,
    phone_number_sid: call.phone_number_sid,
    status: call.status,
    start_time: twilioDate(call.start_time),
    end_time: twilioDate(call.end_time),
    duration: call.duration,
    price: call.price,
    price_unit: call.price_unit,
    direction: call.direction,
    answered_by: null,
    api_version: call.api_version,
    annotation: null,
    forwarded_from: null,
    group_sid: null,
    caller_name: null,
    queue_time: "0",
    trunk_sid: null,
    uri: `/${API_VERSION}/Accounts/${call.account_sid}/Calls/${call.sid}.json`,
    subresource_uris: {
      notifications: `/${API_VERSION}/Accounts/${call.account_sid}/Calls/${call.sid}/Notifications.json`,
      recordings: `/${API_VERSION}/Accounts/${call.account_sid}/Calls/${call.sid}/Recordings.json`
    }
  };
}
function formatConversationService(service) {
  return {
    sid: service.sid,
    account_sid: service.account_sid,
    friendly_name: service.friendly_name,
    date_created: service.created_at,
    date_updated: service.updated_at,
    url: `https://conversations.twilio.com/v1/Services/${service.sid}`,
    links: {
      conversations: `https://conversations.twilio.com/v1/Services/${service.sid}/Conversations`,
      users: `https://conversations.twilio.com/v1/Services/${service.sid}/Users`
    }
  };
}
function formatConversation(conversation) {
  return {
    sid: conversation.sid,
    account_sid: conversation.account_sid,
    chat_service_sid: conversation.service_sid,
    messaging_service_sid: null,
    friendly_name: conversation.friendly_name,
    unique_name: conversation.unique_name,
    attributes: conversation.attributes,
    state: conversation.state,
    date_created: conversation.created_at,
    date_updated: conversation.updated_at,
    url: `https://conversations.twilio.com/v1/Services/${conversation.service_sid}/Conversations/${conversation.sid}`,
    links: {
      participants: `https://conversations.twilio.com/v1/Services/${conversation.service_sid}/Conversations/${conversation.sid}/Participants`,
      messages: `https://conversations.twilio.com/v1/Services/${conversation.service_sid}/Conversations/${conversation.sid}/Messages`
    }
  };
}
function formatConversationParticipant(participant) {
  return {
    sid: participant.sid,
    account_sid: participant.account_sid,
    chat_service_sid: participant.service_sid,
    conversation_sid: participant.conversation_sid,
    identity: participant.identity,
    attributes: participant.attributes,
    messaging_binding: {
      address: participant.messaging_binding_address,
      proxy_address: participant.messaging_binding_proxy_address
    },
    date_created: participant.created_at,
    date_updated: participant.updated_at,
    url: `https://conversations.twilio.com/v1/Services/${participant.service_sid}/Conversations/${participant.conversation_sid}/Participants/${participant.sid}`
  };
}
function formatConversationMessage(message) {
  return {
    sid: message.sid,
    account_sid: message.account_sid,
    chat_service_sid: message.service_sid,
    conversation_sid: message.conversation_sid,
    author: message.author,
    body: message.body,
    index: message.index,
    attributes: message.attributes,
    date_created: message.created_at,
    date_updated: message.updated_at,
    url: `https://conversations.twilio.com/v1/Services/${message.service_sid}/Conversations/${message.conversation_sid}/Messages/${message.sid}`
  };
}
function accountRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/2010-04-01/Accounts.json", (c) => {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    const accounts = ts.accounts.all().filter((account) => account.sid === auth.sid || account.owner_account_sid === auth.sid);
    return twilioList(c, "accounts", accounts, "/2010-04-01/Accounts.json", formatAccount);
  });
  app.get("/2010-04-01/Accounts/:accountSid.json", (c) => {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    const account = accountFromParam(c, ts, auth);
    if (account instanceof Response) return account;
    return c.json(formatAccount(account));
  });
  app.post("/2010-04-01/Accounts/:accountSid.json", async (c) => {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    const account = accountFromParam(c, ts, auth);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const friendlyName = bodyString(body, "FriendlyName");
    const status = bodyString(body, "Status");
    if (status && !["active", "suspended", "closed"].includes(status)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const updated = ts.accounts.update(account.id, {
      friendly_name: friendlyName ?? account.friendly_name,
      status: status ?? account.status
    });
    return c.json(formatAccount(updated));
  });
}
function phoneNumberRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/2010-04-01/Accounts/:accountSid/IncomingPhoneNumbers.json", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    let numbers = ts.phoneNumbers.findBy("account_sid", account.sid);
    const phoneNumber = c.req.query("PhoneNumber");
    const friendlyName = c.req.query("FriendlyName");
    if (phoneNumber) numbers = numbers.filter((number) => number.phone_number === phoneNumber);
    if (friendlyName) numbers = numbers.filter((number) => number.friendly_name === friendlyName);
    return twilioList(
      c,
      "incoming_phone_numbers",
      numbers,
      `/2010-04-01/Accounts/${account.sid}/IncomingPhoneNumbers.json`,
      formatPhoneNumber
    );
  });
  app.post("/2010-04-01/Accounts/:accountSid/IncomingPhoneNumbers.json", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const phoneNumber = normalizePhoneNumber(bodyString(body, "PhoneNumber"));
    if (!phoneNumber) return twilioError(c, 400, "PhoneNumber is invalid", 21421);
    const existing = ts.phoneNumbers.findOneBy("phone_number", phoneNumber);
    if (existing) return twilioError(c, 400, "Phone number is already owned by this account", 21452);
    const inserted = ts.phoneNumbers.insert({
      sid: twilioSid("PN"),
      account_sid: account.sid,
      phone_number: phoneNumber,
      friendly_name: bodyString(body, "FriendlyName") ?? phoneNumber,
      capabilities: { sms: true, mms: true, voice: true },
      sms_url: bodyString(body, "SmsUrl") ?? null,
      sms_method: normalizeMethod(bodyString(body, "SmsMethod")),
      voice_url: bodyString(body, "VoiceUrl") ?? null,
      voice_method: normalizeMethod(bodyString(body, "VoiceMethod")),
      status_callback: bodyString(body, "StatusCallback") ?? null,
      application_sid: bodyString(body, "ApplicationSid") ?? null
    });
    return c.json(formatPhoneNumber(inserted), 201);
  });
  app.get("/2010-04-01/Accounts/:accountSid/IncomingPhoneNumbers/:sid.json", (c) => {
    const number = authenticatedPhoneNumber(c);
    if (number instanceof Response) return number;
    return c.json(formatPhoneNumber(number));
  });
  app.post("/2010-04-01/Accounts/:accountSid/IncomingPhoneNumbers/:sid.json", async (c) => {
    const number = authenticatedPhoneNumber(c);
    if (number instanceof Response) return number;
    const body = await parseTwilioBody(c);
    const friendlyName = bodyString(body, "FriendlyName");
    const updated = ts.phoneNumbers.update(number.id, {
      friendly_name: friendlyName ?? number.friendly_name,
      sms_url: bodyString(body, "SmsUrl") ?? number.sms_url,
      sms_method: bodyString(body, "SmsMethod") ? normalizeMethod(bodyString(body, "SmsMethod")) : number.sms_method,
      voice_url: bodyString(body, "VoiceUrl") ?? number.voice_url,
      voice_method: bodyString(body, "VoiceMethod") ? normalizeMethod(bodyString(body, "VoiceMethod")) : number.voice_method,
      status_callback: bodyString(body, "StatusCallback") ?? number.status_callback,
      application_sid: bodyString(body, "ApplicationSid") ?? number.application_sid
    });
    return c.json(formatPhoneNumber(updated));
  });
  app.delete("/2010-04-01/Accounts/:accountSid/IncomingPhoneNumbers/:sid.json", (c) => {
    const number = authenticatedPhoneNumber(c);
    if (number instanceof Response) return number;
    for (const assignment of ts.messagingServicePhoneNumbers.findBy("phone_number_sid", number.sid)) {
      ts.messagingServicePhoneNumbers.delete(assignment.id);
    }
    ts.phoneNumbers.delete(number.id);
    return c.body(null, 204);
  });
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return accountFromParam(c, ts, auth);
  }
  function authenticatedPhoneNumber(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const number = ts.phoneNumbers.findOneBy("sid", c.req.param("sid"));
    if (!number || number.account_sid !== account.sid)
      return twilioError(c, 404, "The requested resource was not found", 20404);
    return number;
  }
}
function messagingServiceRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/messaging/v1/Services", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const services = ts.messagingServices.findBy("account_sid", account.sid);
    return twilioList(c, "services", services, "/v1/Services", formatMessagingService);
  });
  app.post("/messaging/v1/Services", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const friendlyName = bodyString(body, "FriendlyName");
    if (!friendlyName) return twilioError(c, 400, "FriendlyName is required", 20001);
    const service = ts.messagingServices.insert({
      sid: twilioSid("MG"),
      account_sid: account.sid,
      friendly_name: friendlyName,
      inbound_request_url: bodyString(body, "InboundRequestUrl") ?? null,
      status_callback: bodyString(body, "StatusCallback") ?? null
    });
    return c.json(formatMessagingService(service), 201);
  });
  app.get("/messaging/v1/Services/:serviceSid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    return c.json(formatMessagingService(service));
  });
  app.post("/messaging/v1/Services/:serviceSid", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const updated = ts.messagingServices.update(service.id, {
      friendly_name: bodyString(body, "FriendlyName") ?? service.friendly_name,
      inbound_request_url: bodyString(body, "InboundRequestUrl") ?? service.inbound_request_url,
      status_callback: bodyString(body, "StatusCallback") ?? service.status_callback
    });
    return c.json(formatMessagingService(updated));
  });
  app.delete("/messaging/v1/Services/:serviceSid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    for (const assignment of ts.messagingServicePhoneNumbers.findBy("service_sid", service.sid)) {
      ts.messagingServicePhoneNumbers.delete(assignment.id);
    }
    ts.messagingServices.delete(service.id);
    return c.body(null, 204);
  });
  app.get("/messaging/v1/Services/:serviceSid/PhoneNumbers", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const assignments = ts.messagingServicePhoneNumbers.findBy("service_sid", service.sid);
    return twilioList(
      c,
      "phone_numbers",
      assignments,
      `/v1/Services/${service.sid}/PhoneNumbers`,
      (assignment) => formatMessagingServicePhoneNumber(assignment, ts.phoneNumbers.findOneBy("sid", assignment.phone_number_sid))
    );
  });
  app.post("/messaging/v1/Services/:serviceSid/PhoneNumbers", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const phoneNumberSid = bodyString(body, "PhoneNumberSid");
    const phoneNumberValue = normalizePhoneNumber(bodyString(body, "PhoneNumber"));
    const phoneNumber = phoneNumberSid ? ts.phoneNumbers.findOneBy("sid", phoneNumberSid) : phoneNumberValue ? ts.phoneNumbers.findOneBy("phone_number", phoneNumberValue) : void 0;
    if (!phoneNumber || phoneNumber.account_sid !== service.account_sid) {
      return twilioError(c, 404, "Phone number was not found", 20404);
    }
    const existing = ts.messagingServicePhoneNumbers.findBy("service_sid", service.sid).find((assignment2) => assignment2.phone_number_sid === phoneNumber.sid);
    if (existing) return c.json(formatMessagingServicePhoneNumber(existing, phoneNumber), 200);
    const assignment = ts.messagingServicePhoneNumbers.insert({
      sid: twilioSid("PN"),
      account_sid: service.account_sid,
      service_sid: service.sid,
      phone_number_sid: phoneNumber.sid
    });
    return c.json(formatMessagingServicePhoneNumber(assignment, phoneNumber), 201);
  });
  app.delete("/messaging/v1/Services/:serviceSid/PhoneNumbers/:sid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const assignment = ts.messagingServicePhoneNumbers.findOneBy("sid", c.req.param("sid"));
    if (!assignment || assignment.service_sid !== service.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    ts.messagingServicePhoneNumbers.delete(assignment.id);
    return c.body(null, 204);
  });
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return auth;
  }
  function authenticatedService(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const service = ts.messagingServices.findOneBy("sid", c.req.param("serviceSid"));
    if (!service || service.account_sid !== account.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return service;
  }
}
function messageRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/2010-04-01/Accounts/:accountSid/Messages.json", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    let messages = ts.messages.findBy("account_sid", account.sid);
    const to = c.req.query("To");
    const from = c.req.query("From");
    if (to) messages = messages.filter((message) => message.to === to);
    if (from) messages = messages.filter((message) => message.from === from);
    messages = messages.sort((a, b) => b.id - a.id);
    return twilioList(c, "messages", messages, `/2010-04-01/Accounts/${account.sid}/Messages.json`, formatMessage);
  });
  app.post("/2010-04-01/Accounts/:accountSid/Messages.json", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const to = normalizePhoneNumber(bodyString(body, "To"));
    if (!to) return twilioError(c, 400, "A 'To' phone number is required.", 21201);
    const bodyText = bodyString(body, "Body") ?? null;
    const mediaUrls = bodyStrings(body, "MediaUrl");
    const serviceSid = bodyString(body, "MessagingServiceSid") ?? null;
    const explicitFrom = normalizePhoneNumber(bodyString(body, "From") ?? void 0);
    const sender = resolveSender(c, account, explicitFrom, serviceSid);
    if (sender instanceof Response) return sender;
    const statusCallback = bodyString(body, "StatusCallback") ?? sender.statusCallback;
    const message = ts.messages.insert({
      sid: twilioSid(mediaUrls.length > 0 ? "MM" : "SM"),
      account_sid: account.sid,
      to,
      from: sender.from,
      body: bodyText,
      direction: "outbound-api",
      status: bodyString(body, "ScheduleType") ? "scheduled" : "queued",
      messaging_service_sid: serviceSid,
      num_segments: messageSegments(bodyText),
      num_media: String(mediaUrls.length),
      media_urls: mediaUrls,
      error_code: null,
      error_message: null,
      price: null,
      price_unit: "USD",
      api_version: "2010-04-01",
      status_callback: statusCallback,
      date_sent: null
    });
    for (const mediaUrl of mediaUrls) {
      ts.media.insert({
        sid: twilioSid("ME"),
        account_sid: account.sid,
        message_sid: message.sid,
        content_type: "application/octet-stream",
        uri: mediaUrl
      });
    }
    await dispatchMessageCallback(account, message.status, message);
    return c.json(formatMessage(message), 201);
  });
  app.get("/2010-04-01/Accounts/:accountSid/Messages/:messageSid.json", (c) => {
    const message = authenticatedMessage(c);
    if (message instanceof Response) return message;
    return c.json(formatMessage(message));
  });
  app.post("/2010-04-01/Accounts/:accountSid/Messages/:messageSid.json", async (c) => {
    const message = authenticatedMessage(c);
    if (message instanceof Response) return message;
    const body = await parseTwilioBody(c);
    const requestedStatus = bodyString(body, "Status");
    const bodyText = bodyString(body, "Body");
    if (requestedStatus && !["canceled", "failed", "delivered", "sent", "undelivered"].includes(requestedStatus)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const updated = ts.messages.update(message.id, {
      body: bodyText ?? message.body,
      num_segments: bodyText !== void 0 ? messageSegments(bodyText) : message.num_segments,
      status: requestedStatus ?? message.status,
      date_sent: requestedStatus === "sent" || requestedStatus === "delivered" ? (/* @__PURE__ */ new Date()).toISOString() : message.date_sent
    });
    const account = ts.accounts.findOneBy("sid", updated.account_sid);
    if (requestedStatus) await dispatchMessageCallback(account, requestedStatus, updated);
    return c.json(formatMessage(updated));
  });
  app.delete("/2010-04-01/Accounts/:accountSid/Messages/:messageSid.json", (c) => {
    const message = authenticatedMessage(c);
    if (message instanceof Response) return message;
    for (const media of ts.media.findBy("message_sid", message.sid)) ts.media.delete(media.id);
    ts.messages.delete(message.id);
    return c.body(null, 204);
  });
  app.get("/2010-04-01/Accounts/:accountSid/Messages/:messageSid/Media.json", (c) => {
    const message = authenticatedMessage(c);
    if (message instanceof Response) return message;
    const media = ts.media.findBy("message_sid", message.sid);
    return twilioList(
      c,
      "media_list",
      media,
      `/2010-04-01/Accounts/${message.account_sid}/Messages/${message.sid}/Media.json`,
      formatMedia
    );
  });
  app.get("/2010-04-01/Accounts/:accountSid/Messages/:messageSid/Media/:mediaSid.json", (c) => {
    const message = authenticatedMessage(c);
    if (message instanceof Response) return message;
    const media = ts.media.findOneBy("sid", c.req.param("mediaSid"));
    if (!media || media.message_sid !== message.sid)
      return twilioError(c, 404, "The requested resource was not found", 20404);
    return c.json(formatMedia(media));
  });
  async function dispatchMessageCallback(account, status, message) {
    await dispatchTwilioWebhook(ts, account, `message.${status}`, message.status_callback, "POST", {
      AccountSid: account.sid,
      MessageSid: message.sid,
      SmsSid: message.sid,
      SmsStatus: status,
      MessageStatus: status,
      To: message.to,
      From: message.from ?? "",
      Body: message.body ?? "",
      NumMedia: message.num_media,
      NumSegments: message.num_segments,
      ApiVersion: message.api_version
    });
  }
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return accountFromParam(c, ts, auth);
  }
  function authenticatedMessage(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const message = ts.messages.findOneBy("sid", c.req.param("messageSid"));
    if (!message || message.account_sid !== account.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return message;
  }
  function resolveSender(c, account, explicitFrom, serviceSid) {
    const service = serviceSid ? ts.messagingServices.findOneBy("sid", serviceSid) : null;
    if (serviceSid && (!service || service.account_sid !== account.sid)) {
      return twilioError(c, 400, "Messaging Service was not found", 20404);
    }
    if (explicitFrom) {
      const number = ts.phoneNumbers.findOneBy("phone_number", explicitFrom);
      if (!number || number.account_sid !== account.sid)
        return twilioError(c, 400, "From phone number is not owned by this account", 21606);
      return { from: explicitFrom, statusCallback: number.status_callback ?? service?.status_callback ?? null };
    }
    if (service && serviceSid) {
      for (const assignment of ts.messagingServicePhoneNumbers.findBy("service_sid", serviceSid)) {
        const number = ts.phoneNumbers.findOneBy("sid", assignment.phone_number_sid);
        if (number && number.account_sid === account.sid) {
          return { from: number.phone_number, statusCallback: service.status_callback };
        }
      }
      return twilioError(c, 400, "Messaging Service has no senders", 21712);
    }
    return twilioError(c, 400, "A 'From' phone number or MessagingServiceSid is required.", 21603);
  }
}
function verifyRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/verify/v2/Services", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const services = ts.verifyServices.findBy("account_sid", account.sid);
    return twilioList(c, "services", services, "/v2/Services", formatVerifyService);
  });
  app.post("/verify/v2/Services", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const friendlyName = bodyString(body, "FriendlyName");
    if (!friendlyName) return twilioError(c, 400, "FriendlyName is required", 20001);
    const service = ts.verifyServices.insert({
      sid: twilioSid("VA"),
      account_sid: account.sid,
      friendly_name: friendlyName,
      code: bodyString(body, "Code") ?? "123456",
      default_channel: bodyString(body, "DefaultChannel") ?? "sms"
    });
    return c.json(formatVerifyService(service), 201);
  });
  app.get("/verify/v2/Services/:serviceSid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    return c.json(formatVerifyService(service));
  });
  app.post("/verify/v2/Services/:serviceSid", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const updated = ts.verifyServices.update(service.id, {
      friendly_name: bodyString(body, "FriendlyName") ?? service.friendly_name,
      code: bodyString(body, "Code") ?? service.code,
      default_channel: bodyString(body, "DefaultChannel") ?? service.default_channel
    });
    return c.json(formatVerifyService(updated));
  });
  app.delete("/verify/v2/Services/:serviceSid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    ts.verifyServices.delete(service.id);
    return c.body(null, 204);
  });
  app.post("/verify/v2/Services/:serviceSid/Verifications", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const to = bodyString(body, "To");
    const channel = bodyString(body, "Channel") ?? service.default_channel;
    if (!to) return twilioError(c, 400, "To is required", 60200);
    if (!["sms", "call", "email", "whatsapp", "sna", "auto"].includes(channel)) {
      return twilioError(c, 400, "Channel is invalid", 60200);
    }
    const existingPending = ts.verifications.findBy("service_sid", service.sid).find((verification2) => verification2.to === to && verification2.status === "pending");
    if (existingPending) return c.json(formatVerification(existingPending), 201);
    const code = bodyString(body, "CustomCode") ?? service.code;
    const verification = ts.verifications.insert({
      sid: twilioSid("VE"),
      service_sid: service.sid,
      account_sid: service.account_sid,
      to,
      channel,
      status: "pending",
      code,
      attempts: 0,
      max_attempts: 3,
      lookup: {},
      send_code_attempts: [
        {
          time: (/* @__PURE__ */ new Date()).toISOString(),
          channel,
          attempt_sid: twilioSid("VL")
        }
      ],
      tags: bodyString(body, "Tags") ?? null,
      valid: false
    });
    return c.json(formatVerification(verification), 201);
  });
  app.get("/verify/v2/Services/:serviceSid/Verifications/:verificationSid", (c) => {
    const verification = authenticatedVerification(c);
    if (verification instanceof Response) return verification;
    return c.json(formatVerification(verification));
  });
  app.post("/verify/v2/Services/:serviceSid/Verifications/:verificationSid", async (c) => {
    const verification = authenticatedVerification(c);
    if (verification instanceof Response) return verification;
    const body = await parseTwilioBody(c);
    const status = bodyString(body, "Status");
    if (status !== "canceled") return twilioError(c, 400, "Status is invalid", 60200);
    const updated = ts.verifications.update(verification.id, { status: "canceled", valid: false });
    return c.json(formatVerification(updated));
  });
  app.post("/verify/v2/Services/:serviceSid/VerificationCheck", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const to = bodyString(body, "To");
    const sid = bodyString(body, "VerificationSid");
    const code = bodyString(body, "Code");
    if (!code) return twilioError(c, 400, "Code is required", 60200);
    const verification = sid ? ts.verifications.findOneBy("sid", sid) : ts.verifications.findBy("service_sid", service.sid).filter((candidate) => candidate.to === to).sort((a, b) => b.id - a.id)[0];
    if (!verification || verification.service_sid !== service.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    if (!["pending", "failed"].includes(verification.status)) {
      return c.json(formatVerificationCheck(verification));
    }
    const attempts = verification.attempts + 1;
    const approved = code === verification.code;
    const status = approved ? "approved" : attempts >= verification.max_attempts ? "max_attempts_reached" : "pending";
    const updated = ts.verifications.update(verification.id, {
      attempts,
      status,
      valid: approved
    });
    return c.json(formatVerificationCheck(updated));
  });
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return auth;
  }
  function authenticatedService(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const service = ts.verifyServices.findOneBy("sid", c.req.param("serviceSid"));
    if (!service || service.account_sid !== account.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return service;
  }
  function authenticatedVerification(c) {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const verification = ts.verifications.findOneBy("sid", c.req.param("verificationSid"));
    if (!verification || verification.service_sid !== service.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return verification;
  }
}
function callRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/2010-04-01/Accounts/:accountSid/Calls.json", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    let calls = ts.calls.findBy("account_sid", account.sid);
    const to = c.req.query("To");
    const from = c.req.query("From");
    if (to) calls = calls.filter((call) => call.to === to);
    if (from) calls = calls.filter((call) => call.from === from);
    calls = calls.sort((a, b) => b.id - a.id);
    return twilioList(c, "calls", calls, `/2010-04-01/Accounts/${account.sid}/Calls.json`, formatCall);
  });
  app.post("/2010-04-01/Accounts/:accountSid/Calls.json", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const to = normalizePhoneNumber(bodyString(body, "To"));
    const from = normalizePhoneNumber(bodyString(body, "From"));
    if (!to) return twilioError(c, 400, "To is required", 21201);
    if (!from) return twilioError(c, 400, "From is required", 21201);
    const ownedNumber = ts.phoneNumbers.findOneBy("phone_number", from);
    if (!ownedNumber || ownedNumber.account_sid !== account.sid) {
      return twilioError(c, 400, "From phone number is not owned by this account", 21210);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const call = ts.calls.insert({
      sid: twilioSid("CA"),
      account_sid: account.sid,
      to,
      from,
      status: "queued",
      direction: "outbound-api",
      api_version: "2010-04-01",
      price: null,
      price_unit: "USD",
      parent_call_sid: null,
      phone_number_sid: ownedNumber.sid,
      start_time: null,
      end_time: null,
      duration: "0",
      url: bodyString(body, "Url") ?? null,
      method: normalizeMethod(bodyString(body, "Method")),
      twiml: bodyString(body, "Twiml") ?? null,
      twiml_steps: parseTwimlSteps(bodyString(body, "Twiml") ?? ""),
      status_callback: bodyString(body, "StatusCallback") ?? null,
      status_callback_event: bodyStrings(body, "StatusCallbackEvent")
    });
    await dispatchCallCallback(account, "queued", call);
    const updated = ts.calls.update(call.id, { status: "ringing", start_time: now });
    await dispatchCallCallback(account, "ringing", updated);
    return c.json(formatCall(updated), 201);
  });
  app.get("/2010-04-01/Accounts/:accountSid/Calls/:callSid.json", (c) => {
    const call = authenticatedCall(c);
    if (call instanceof Response) return call;
    return c.json(formatCall(call));
  });
  app.post("/2010-04-01/Accounts/:accountSid/Calls/:callSid.json", async (c) => {
    const call = authenticatedCall(c);
    if (call instanceof Response) return call;
    const body = await parseTwilioBody(c);
    const status = bodyString(body, "Status");
    if (status && !["completed", "canceled", "busy", "failed", "no-answer", "in-progress"].includes(status)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const terminal = status && ["completed", "canceled", "busy", "failed", "no-answer"].includes(status);
    const updated = ts.calls.update(call.id, {
      status: status ?? call.status,
      url: bodyString(body, "Url") ?? call.url,
      method: bodyString(body, "Method") ? normalizeMethod(bodyString(body, "Method")) : call.method,
      twiml: bodyString(body, "Twiml") ?? call.twiml,
      twiml_steps: bodyString(body, "Twiml") ? parseTwimlSteps(bodyString(body, "Twiml") ?? "") : call.twiml_steps,
      end_time: terminal ? (/* @__PURE__ */ new Date()).toISOString() : call.end_time,
      duration: terminal ? durationSeconds(call.start_time, (/* @__PURE__ */ new Date()).toISOString()) : call.duration
    });
    const account = ts.accounts.findOneBy("sid", updated.account_sid);
    if (status) await dispatchCallCallback(account, status, updated);
    return c.json(formatCall(updated));
  });
  app.delete("/2010-04-01/Accounts/:accountSid/Calls/:callSid.json", (c) => {
    const call = authenticatedCall(c);
    if (call instanceof Response) return call;
    ts.calls.delete(call.id);
    return c.body(null, 204);
  });
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return accountFromParam(c, ts, auth);
  }
  function authenticatedCall(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const call = ts.calls.findOneBy("sid", c.req.param("callSid"));
    if (!call || call.account_sid !== account.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return call;
  }
  async function dispatchCallCallback(account, status, call) {
    if (call.status_callback_event.length > 0 && !call.status_callback_event.includes(status)) return;
    await dispatchTwilioWebhook(ts, account, `call.${status}`, call.status_callback, "POST", {
      AccountSid: account.sid,
      CallSid: call.sid,
      CallStatus: status,
      To: call.to,
      From: call.from,
      Direction: call.direction,
      ApiVersion: call.api_version
    });
  }
}
function parseTwimlSteps(twiml) {
  if (!twiml) return [];
  const steps = [];
  const regex = /<([A-Z][A-Za-z0-9]*)\b/g;
  let match;
  while (match = regex.exec(twiml)) {
    if (match[1] !== "Response") steps.push(match[1]);
  }
  return steps;
}
function durationSeconds(start, end) {
  if (!start) return "0";
  return String(Math.max(0, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1e3)));
}
function conversationRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.get("/conversations/v1/Services", (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const services = ts.conversationServices.findBy("account_sid", account.sid);
    return twilioList(c, "services", services, "/v1/Services", formatConversationService);
  });
  app.post("/conversations/v1/Services", async (c) => {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const friendlyName = bodyString(body, "FriendlyName");
    if (!friendlyName) return twilioError(c, 400, "FriendlyName is required", 20001);
    const service = ts.conversationServices.insert({
      sid: twilioSid("IS"),
      account_sid: account.sid,
      friendly_name: friendlyName
    });
    return c.json(formatConversationService(service), 201);
  });
  app.get("/conversations/v1/Services/:serviceSid", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    return c.json(formatConversationService(service));
  });
  app.post("/conversations/v1/Services/:serviceSid/Conversations", async (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const body = await parseTwilioBody(c);
    const uniqueName = bodyString(body, "UniqueName") ?? null;
    if (uniqueName) {
      const existing = ts.conversations.findBy("service_sid", service.sid).find((conversation2) => conversation2.unique_name === uniqueName);
      if (existing) return twilioError(c, 409, "Conversation unique name already exists", 50353);
    }
    const conversation = ts.conversations.insert({
      sid: twilioSid("CH"),
      account_sid: service.account_sid,
      service_sid: service.sid,
      friendly_name: bodyString(body, "FriendlyName") ?? null,
      unique_name: uniqueName,
      state: "active",
      attributes: bodyString(body, "Attributes") ?? "{}"
    });
    return c.json(formatConversation(conversation), 201);
  });
  app.get("/conversations/v1/Services/:serviceSid/Conversations", (c) => {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const conversations = ts.conversations.findBy("service_sid", service.sid);
    return twilioList(
      c,
      "conversations",
      conversations,
      `/v1/Services/${service.sid}/Conversations`,
      formatConversation
    );
  });
  app.get("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid", (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    return c.json(formatConversation(conversation));
  });
  app.post("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid", async (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    const body = await parseTwilioBody(c);
    const state = bodyString(body, "State");
    if (state && !["active", "inactive", "closed"].includes(state))
      return twilioError(c, 400, "State is invalid", 20001);
    const updated = ts.conversations.update(conversation.id, {
      friendly_name: bodyString(body, "FriendlyName") ?? conversation.friendly_name,
      unique_name: bodyString(body, "UniqueName") ?? conversation.unique_name,
      attributes: bodyString(body, "Attributes") ?? conversation.attributes,
      state: state ?? conversation.state
    });
    return c.json(formatConversation(updated));
  });
  app.delete("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid", (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    for (const participant of ts.conversationParticipants.findBy("conversation_sid", conversation.sid)) {
      ts.conversationParticipants.delete(participant.id);
    }
    for (const message of ts.conversationMessages.findBy("conversation_sid", conversation.sid)) {
      ts.conversationMessages.delete(message.id);
    }
    ts.conversations.delete(conversation.id);
    return c.body(null, 204);
  });
  app.post("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid/Participants", async (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    const body = await parseTwilioBody(c);
    const identity = bodyString(body, "Identity") ?? null;
    const address = bodyString(body, "MessagingBinding.Address") ?? bodyString(body, "MessagingBindingAddress") ?? null;
    if (!identity && !address) return twilioError(c, 400, "Identity or MessagingBinding.Address is required", 20001);
    const participant = ts.conversationParticipants.insert({
      sid: twilioSid("MB"),
      account_sid: conversation.account_sid,
      service_sid: conversation.service_sid,
      conversation_sid: conversation.sid,
      identity,
      messaging_binding_address: address,
      messaging_binding_proxy_address: bodyString(body, "MessagingBinding.ProxyAddress") ?? bodyString(body, "MessagingBindingProxyAddress") ?? null,
      attributes: bodyString(body, "Attributes") ?? "{}"
    });
    return c.json(formatConversationParticipant(participant), 201);
  });
  app.get("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid/Participants", (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    const participants = ts.conversationParticipants.findBy("conversation_sid", conversation.sid);
    return twilioList(
      c,
      "participants",
      participants,
      `/v1/Services/${conversation.service_sid}/Conversations/${conversation.sid}/Participants`,
      formatConversationParticipant
    );
  });
  app.post("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid/Messages", async (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    const body = await parseTwilioBody(c);
    const index = ts.conversationMessages.count((message2) => message2.conversation_sid === conversation.sid);
    const message = ts.conversationMessages.insert({
      sid: twilioSid("IM"),
      account_sid: conversation.account_sid,
      service_sid: conversation.service_sid,
      conversation_sid: conversation.sid,
      author: bodyString(body, "Author") ?? null,
      body: bodyString(body, "Body") ?? null,
      index,
      attributes: bodyString(body, "Attributes") ?? "{}"
    });
    return c.json(formatConversationMessage(message), 201);
  });
  app.get("/conversations/v1/Services/:serviceSid/Conversations/:conversationSid/Messages", (c) => {
    const conversation = authenticatedConversation(c);
    if (conversation instanceof Response) return conversation;
    const messages = ts.conversationMessages.findBy("conversation_sid", conversation.sid).sort((a, b) => a.index - b.index);
    return twilioList(
      c,
      "messages",
      messages,
      `/v1/Services/${conversation.service_sid}/Conversations/${conversation.sid}/Messages`,
      formatConversationMessage
    );
  });
  function authenticatedAccount(c) {
    const auth = requireTwilioAuth(c, ts);
    if (auth instanceof Response) return auth;
    return auth;
  }
  function authenticatedService(c) {
    const account = authenticatedAccount(c);
    if (account instanceof Response) return account;
    const service = ts.conversationServices.findOneBy("sid", c.req.param("serviceSid"));
    if (!service || service.account_sid !== account.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return service;
  }
  function authenticatedConversation(c) {
    const service = authenticatedService(c);
    if (service instanceof Response) return service;
    const conversationSid = c.req.param("conversationSid");
    const conversation = ts.conversations.findOneBy("sid", conversationSid) ?? ts.conversations.findBy("service_sid", service.sid).find((item) => item.unique_name === conversationSid);
    if (!conversation || conversation.service_sid !== service.sid) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return conversation;
  }
}
var VERIFICATION_STATUSES = [
  "pending",
  "approved",
  "canceled",
  "max_attempts_reached",
  "deleted",
  "failed",
  "expired"
];
var MESSAGE_STATUSES = [
  "accepted",
  "scheduled",
  "canceled",
  "queued",
  "sending",
  "sent",
  "failed",
  "delivered",
  "undelivered",
  "receiving",
  "received",
  "read"
];
var CALL_STATUSES = [
  "queued",
  "ringing",
  "in-progress",
  "completed",
  "busy",
  "failed",
  "no-answer",
  "canceled"
];
var TERMINAL_CALL_STATUSES = ["completed", "busy", "failed", "no-answer", "canceled"];
function simulatorRoutes({ app, store }) {
  const ts = getTwilioStore(store);
  app.post("/_twilio/simulate/inbound-message", async (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const to = normalizePhoneNumber(bodyString(body, "To"));
    const from = normalizePhoneNumber(bodyString(body, "From"));
    if (!to || !from) return twilioError(c, 400, "To and From are required", 20001);
    const number = ts.phoneNumbers.findOneBy("phone_number", to);
    if (!number || number.account_sid !== account.sid) return twilioError(c, 404, "Phone number was not found", 20404);
    const messagingServiceAssignment = ts.messagingServicePhoneNumbers.findOneBy("phone_number_sid", number.sid);
    const messagingService = messagingServiceAssignment ? ts.messagingServices.findOneBy("sid", messagingServiceAssignment.service_sid) : void 0;
    const messageBody = bodyString(body, "Body") ?? "";
    const message = ts.messages.insert({
      sid: twilioSid("SM"),
      account_sid: account.sid,
      to,
      from,
      body: messageBody,
      direction: "inbound",
      status: "received",
      messaging_service_sid: messagingService?.sid ?? null,
      num_segments: messageSegments(messageBody),
      num_media: "0",
      media_urls: [],
      error_code: null,
      error_message: null,
      price: null,
      price_unit: "USD",
      api_version: "2010-04-01",
      status_callback: null,
      date_sent: (/* @__PURE__ */ new Date()).toISOString()
    });
    const inboundUrl = messagingService?.inbound_request_url ?? number.sms_url;
    const inboundMethod = messagingService?.inbound_request_url ? "POST" : number.sms_method;
    await dispatchTwilioWebhook(ts, account, "message.inbound", inboundUrl, inboundMethod, {
      AccountSid: account.sid,
      MessageSid: message.sid,
      SmsSid: message.sid,
      SmsStatus: "received",
      MessagingServiceSid: messagingService?.sid ?? "",
      To: message.to,
      From: message.from ?? "",
      Body: message.body ?? "",
      NumMedia: "0",
      NumSegments: message.num_segments,
      ApiVersion: message.api_version
    });
    return c.json(formatMessage(message), 201);
  });
  app.post("/_twilio/simulate/message-status", async (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const sid = bodyString(body, "MessageSid");
    const status = bodyString(body, "Status");
    if (!sid || !status) return twilioError(c, 400, "MessageSid and Status are required", 20001);
    if (!MESSAGE_STATUSES.includes(status)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const message = ts.messages.findOneBy("sid", sid);
    if (!message || message.account_sid !== account.sid)
      return twilioError(c, 404, "The requested resource was not found", 20404);
    const updated = ts.messages.update(message.id, {
      status,
      date_sent: ["sent", "delivered"].includes(status) ? (/* @__PURE__ */ new Date()).toISOString() : message.date_sent
    });
    await dispatchTwilioWebhook(ts, account, `message.${status}`, updated.status_callback, "POST", {
      AccountSid: account.sid,
      MessageSid: updated.sid,
      SmsSid: updated.sid,
      SmsStatus: updated.status,
      MessageStatus: updated.status,
      To: updated.to,
      From: updated.from ?? "",
      Body: updated.body ?? "",
      NumMedia: updated.num_media,
      NumSegments: updated.num_segments,
      ApiVersion: updated.api_version
    });
    return c.json(formatMessage(updated));
  });
  app.post("/_twilio/simulate/inbound-call", async (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const to = normalizePhoneNumber(bodyString(body, "To"));
    const from = normalizePhoneNumber(bodyString(body, "From"));
    if (!to || !from) return twilioError(c, 400, "To and From are required", 20001);
    const number = ts.phoneNumbers.findOneBy("phone_number", to);
    if (!number || number.account_sid !== account.sid) return twilioError(c, 404, "Phone number was not found", 20404);
    const call = ts.calls.insert({
      sid: twilioSid("CA"),
      account_sid: account.sid,
      to,
      from,
      status: "in-progress",
      direction: "inbound",
      api_version: "2010-04-01",
      price: null,
      price_unit: "USD",
      parent_call_sid: null,
      phone_number_sid: number.sid,
      start_time: (/* @__PURE__ */ new Date()).toISOString(),
      end_time: null,
      duration: "0",
      url: number.voice_url,
      method: number.voice_method,
      twiml: null,
      twiml_steps: [],
      status_callback: number.status_callback,
      status_callback_event: []
    });
    await dispatchTwilioWebhook(ts, account, "call.inbound", number.voice_url, number.voice_method, {
      AccountSid: account.sid,
      CallSid: call.sid,
      CallStatus: call.status,
      To: call.to,
      From: call.from,
      Direction: call.direction,
      ApiVersion: call.api_version
    });
    return c.json(formatCall(call), 201);
  });
  app.post("/_twilio/simulate/call-status", async (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const sid = bodyString(body, "CallSid");
    const status = bodyString(body, "Status");
    const twiml = bodyString(body, "Twiml");
    if (!sid || !status) return twilioError(c, 400, "CallSid and Status are required", 20001);
    if (!CALL_STATUSES.includes(status)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const call = ts.calls.findOneBy("sid", sid);
    if (!call || call.account_sid !== account.sid)
      return twilioError(c, 404, "The requested resource was not found", 20404);
    const terminal = TERMINAL_CALL_STATUSES.includes(status);
    const updated = ts.calls.update(call.id, {
      status,
      twiml: twiml ?? call.twiml,
      twiml_steps: twiml ? parseTwimlSteps(twiml) : call.twiml_steps,
      end_time: terminal ? (/* @__PURE__ */ new Date()).toISOString() : call.end_time
    });
    await dispatchTwilioWebhook(ts, account, `call.${status}`, updated.status_callback, "POST", {
      AccountSid: account.sid,
      CallSid: updated.sid,
      CallStatus: updated.status,
      To: updated.to,
      From: updated.from,
      Direction: updated.direction,
      ApiVersion: updated.api_version
    });
    return c.json(formatCall(updated));
  });
  app.post("/_twilio/simulate/verification-status", async (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const body = await parseTwilioBody(c);
    const sid = bodyString(body, "VerificationSid");
    const to = normalizePhoneNumber(bodyString(body, "To"));
    const serviceSid = bodyString(body, "ServiceSid");
    const status = bodyString(body, "Status");
    if (!status) return twilioError(c, 400, "Status is required", 20001);
    if (!sid && !to) return twilioError(c, 400, "VerificationSid or To is required", 20001);
    if (!VERIFICATION_STATUSES.includes(status)) {
      return twilioError(c, 400, "Status is invalid", 20001);
    }
    const verification = findVerification(account.sid, sid, to, serviceSid);
    if (!verification) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    const updated = ts.verifications.update(verification.id, {
      status,
      valid: status === "approved"
    });
    return c.json(formatVerification(updated));
  });
  app.get("/_twilio/simulate/verification-code", (c) => {
    const account = requireTwilioAuth(c, ts);
    if (account instanceof Response) return account;
    const sid = c.req.query("VerificationSid");
    const to = normalizePhoneNumber(c.req.query("To"));
    const serviceSid = c.req.query("ServiceSid");
    if (!sid && !to) return twilioError(c, 400, "VerificationSid or To is required", 20001);
    const verification = findVerification(account.sid, sid, to, serviceSid);
    if (!verification) {
      return twilioError(c, 404, "The requested resource was not found", 20404);
    }
    return c.json({
      account_sid: verification.account_sid,
      service_sid: verification.service_sid,
      verification_sid: verification.sid,
      to: verification.to,
      channel: verification.channel,
      status: verification.status,
      code: verification.code,
      attempts: verification.attempts,
      valid: verification.valid,
      date_created: verification.created_at,
      date_updated: verification.updated_at
    });
  });
  function findVerification(accountSid, verificationSid, to, serviceSid) {
    const candidates = verificationSid ? [ts.verifications.findOneBy("sid", verificationSid)].filter((item) => Boolean(item)) : ts.verifications.all().filter((verification) => verification.to === to).sort((a, b) => b.id - a.id);
    return candidates.find(
      (verification) => verification.account_sid === accountSid && (!serviceSid || verification.service_sid === serviceSid)
    ) ?? null;
  }
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
var SERVICE_LABEL = "Twilio";
var TABS = [
  { id: "messages", label: "Messages", href: "/?tab=messages" },
  { id: "verify", label: "Verify", href: "/?tab=verify" },
  { id: "calls", label: "Calls", href: "/?tab=calls" },
  { id: "conversations", label: "Conversations", href: "/?tab=conversations" },
  { id: "numbers", label: "Numbers", href: "/?tab=numbers" },
  { id: "services", label: "Services", href: "/?tab=services" },
  { id: "auth", label: "Auth", href: "/?tab=auth" },
  { id: "webhooks", label: "Webhooks", href: "/?tab=webhooks" }
];
function inspectorRoutes({ app, store }) {
  const ts = () => getTwilioStore(store);
  app.get("/", (c) => {
    const requested = c.req.query("tab") ?? "messages";
    const active = TABS.some((tab) => tab.id === requested) ? requested : "messages";
    const body = active === "verify" ? verifyView() : active === "calls" ? callsView() : active === "conversations" ? conversationsView() : active === "numbers" ? numbersView() : active === "services" ? servicesView() : active === "auth" ? authView() : active === "webhooks" ? webhooksView() : messagesView();
    return c.html(renderInspectorPage("Twilio Inspector", TABS, active, body, SERVICE_LABEL));
  });
  function messagesView() {
    const rows = ts().messages.all().sort((a, b) => b.id - a.id).map((message) => [
      escapeHtml(message.sid),
      escapeHtml(message.direction),
      escapeHtml(message.status),
      escapeHtml(message.from ?? ""),
      escapeHtml(message.to),
      escapeHtml(message.body ?? ""),
      escapeHtml(message.created_at)
    ]);
    return section(
      "Messages",
      table(["SID", "Direction", "Status", "From", "To", "Body", "Created"], rows, "No messages.")
    );
  }
  function verifyView() {
    const serviceRows = ts().verifyServices.all().map((service) => [escapeHtml(service.sid), escapeHtml(service.friendly_name), escapeHtml(service.code)]);
    const verificationRows = ts().verifications.all().sort((a, b) => b.id - a.id).map((verification) => [
      escapeHtml(verification.sid),
      escapeHtml(verification.to),
      escapeHtml(verification.channel),
      escapeHtml(verification.status),
      escapeHtml(verification.code),
      escapeHtml(String(verification.attempts))
    ]);
    return section("Verify Services", table(["SID", "Name", "Code"], serviceRows, "No Verify services.")) + section(
      "Verifications",
      table(["SID", "To", "Channel", "Status", "Code", "Attempts"], verificationRows, "No verifications.")
    );
  }
  function callsView() {
    const rows = ts().calls.all().sort((a, b) => b.id - a.id).map((call) => [
      escapeHtml(call.sid),
      escapeHtml(call.direction),
      escapeHtml(call.status),
      escapeHtml(call.from),
      escapeHtml(call.to),
      escapeHtml(call.twiml_steps.join(", ")),
      escapeHtml(call.created_at)
    ]);
    return section("Calls", table(["SID", "Direction", "Status", "From", "To", "TwiML", "Created"], rows, "No calls."));
  }
  function numbersView() {
    const rows = ts().phoneNumbers.all().map((number) => [
      escapeHtml(number.sid),
      escapeHtml(number.phone_number),
      escapeHtml(number.friendly_name),
      escapeHtml(number.sms_url ?? ""),
      escapeHtml(number.voice_url ?? "")
    ]);
    return section(
      "Phone Numbers",
      table(["SID", "Number", "Name", "SMS URL", "Voice URL"], rows, "No phone numbers.")
    );
  }
  function conversationsView() {
    const serviceRows = ts().conversationServices.all().map((service) => [
      escapeHtml(service.sid),
      escapeHtml(service.friendly_name),
      escapeHtml(String(ts().conversations.count((item) => item.service_sid === service.sid)))
    ]);
    const conversationRows = ts().conversations.all().map((conversation) => [
      escapeHtml(conversation.sid),
      escapeHtml(conversation.friendly_name ?? ""),
      escapeHtml(conversation.unique_name ?? ""),
      escapeHtml(conversation.state),
      escapeHtml(String(ts().conversationParticipants.count((item) => item.conversation_sid === conversation.sid))),
      escapeHtml(String(ts().conversationMessages.count((item) => item.conversation_sid === conversation.sid)))
    ]);
    return section(
      "Conversation Services",
      table(["SID", "Name", "Conversations"], serviceRows, "No Conversation Services.")
    ) + section(
      "Conversations",
      table(
        ["SID", "Name", "Unique Name", "State", "Participants", "Messages"],
        conversationRows,
        "No conversations."
      )
    );
  }
  function servicesView() {
    const messagingRows = ts().messagingServices.all().map((service) => [
      escapeHtml(service.sid),
      escapeHtml(service.friendly_name),
      escapeHtml(String(ts().messagingServicePhoneNumbers.count((item) => item.service_sid === service.sid))),
      escapeHtml(service.status_callback ?? "")
    ]);
    return section(
      "Messaging Services",
      table(["SID", "Name", "Senders", "Status Callback"], messagingRows, "No Messaging Services.")
    );
  }
  function authView() {
    const accountRows = ts().accounts.all().map((account) => [
      escapeHtml(account.sid),
      escapeHtml(account.friendly_name),
      escapeHtml(account.status),
      escapeHtml(maskSecret(account.auth_token))
    ]);
    const keyRows = ts().apiKeys.all().map((key) => [
      escapeHtml(key.sid),
      escapeHtml(key.friendly_name),
      escapeHtml(key.account_sid),
      escapeHtml(key.active ? "active" : "inactive"),
      escapeHtml(maskSecret(key.secret))
    ]);
    return section("Accounts", table(["SID", "Name", "Status", "Auth Token"], accountRows, "No accounts.")) + section("API Keys", table(["SID", "Name", "Account", "Status", "Secret"], keyRows, "No API keys."));
  }
  function webhooksView() {
    const rows = ts().webhookDeliveries.all().slice(-50).reverse().map((delivery) => [
      escapeHtml(delivery.event),
      escapeHtml(delivery.url),
      escapeHtml(String(delivery.response_status ?? "")),
      escapeHtml(delivery.success ? "ok" : "failed"),
      escapeHtml(delivery.error ?? ""),
      escapeHtml(delivery.created_at)
    ]);
    return section(
      "Webhook Deliveries",
      table(["Event", "URL", "Status", "Result", "Error", "Created"], rows, "No webhook deliveries.")
    );
  }
}
function section(title, body) {
  return `<section class="inspector-section">
  <h2>${escapeHtml(title)}</h2>
  ${body}
</section>`;
}
function table(headers, rows, empty) {
  if (rows.length === 0) return `<p class="inspector-empty">${escapeHtml(empty)}</p>`;
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowHtml = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n");
  return `<table class="inspector-table">
  <thead><tr>${headerHtml}</tr></thead>
  <tbody>
${rowHtml}
  </tbody>
</table>`;
}
var DEFAULT_ACCOUNT_SID = fixedSid("AC");
var DEFAULT_API_KEY_SID = fixedSid("SK");
var DEFAULT_PHONE_NUMBER_SID = fixedSid("PN");
var DEFAULT_MESSAGING_SERVICE_SID = fixedSid("MG");
var DEFAULT_VERIFY_SERVICE_SID = fixedSid("VA");
var DEFAULT_AUTH_TOKEN = "twilio_test_auth_token";
var DEFAULT_API_KEY_SECRET = "twilio_test_api_secret";
var DEFAULT_PHONE_NUMBER = "+15551234567";
function seedDefaults(store) {
  seedFromConfig(store, "", {
    account: {
      sid: DEFAULT_ACCOUNT_SID,
      auth_token: DEFAULT_AUTH_TOKEN,
      friendly_name: "Local Twilio Account",
      status: "active"
    },
    api_keys: [{ sid: DEFAULT_API_KEY_SID, secret: DEFAULT_API_KEY_SECRET, friendly_name: "Local API Key" }],
    phone_numbers: [
      {
        sid: DEFAULT_PHONE_NUMBER_SID,
        phone_number: DEFAULT_PHONE_NUMBER,
        friendly_name: "Local SMS and Voice Number"
      }
    ],
    messaging_services: [
      {
        sid: DEFAULT_MESSAGING_SERVICE_SID,
        friendly_name: "Local Messaging Service",
        phone_numbers: [DEFAULT_PHONE_NUMBER]
      }
    ],
    verify_services: [
      {
        sid: DEFAULT_VERIFY_SERVICE_SID,
        friendly_name: "Local Verify Service",
        code: "123456",
        default_channel: "sms"
      }
    ],
    conversations: {
      services: [{ friendly_name: "Local Conversations" }]
    }
  });
}
function seedFromConfig(store, _baseUrl, config) {
  const ts = getTwilioStore(store);
  const accountSid = config.account?.sid ?? DEFAULT_ACCOUNT_SID;
  let account = ts.accounts.findOneBy("sid", accountSid);
  if (!account) {
    account = ts.accounts.insert({
      sid: accountSid,
      friendly_name: config.account?.friendly_name ?? "Local Twilio Account",
      auth_token: config.account?.auth_token ?? DEFAULT_AUTH_TOKEN,
      status: config.account?.status ?? "active",
      owner_account_sid: null
    });
  } else {
    account = ts.accounts.update(account.id, {
      friendly_name: config.account?.friendly_name ?? account.friendly_name,
      auth_token: config.account?.auth_token ?? account.auth_token,
      status: config.account?.status ?? account.status
    });
  }
  for (const key of config.api_keys ?? []) {
    const existing = key.sid ? ts.apiKeys.findOneBy("sid", key.sid) : void 0;
    if (existing) {
      ts.apiKeys.update(existing.id, {
        account_sid: account.sid,
        secret: key.secret,
        friendly_name: key.friendly_name ?? existing.friendly_name,
        active: true
      });
      continue;
    }
    ts.apiKeys.insert({
      sid: key.sid ?? twilioSid("SK"),
      account_sid: account.sid,
      secret: key.secret,
      friendly_name: key.friendly_name ?? "Local API Key",
      active: true
    });
  }
  for (const number of config.phone_numbers ?? []) {
    const existing = (number.sid ? ts.phoneNumbers.findOneBy("sid", number.sid) : void 0) ?? ts.phoneNumbers.findOneBy("phone_number", number.phone_number);
    if (existing) {
      ts.phoneNumbers.update(existing.id, {
        account_sid: account.sid,
        phone_number: number.phone_number,
        friendly_name: number.friendly_name ?? existing.friendly_name,
        sms_url: number.sms_url ?? existing.sms_url,
        sms_method: number.sms_method ? number.sms_method.toUpperCase() : existing.sms_method,
        voice_url: number.voice_url ?? existing.voice_url,
        voice_method: number.voice_method ? number.voice_method.toUpperCase() : existing.voice_method,
        status_callback: number.status_callback ?? existing.status_callback
      });
      continue;
    }
    ts.phoneNumbers.insert({
      sid: number.sid ?? twilioSid("PN"),
      account_sid: account.sid,
      phone_number: number.phone_number,
      friendly_name: number.friendly_name ?? number.phone_number,
      capabilities: { sms: true, mms: true, voice: true },
      sms_url: number.sms_url ?? null,
      sms_method: (number.sms_method ?? "POST").toUpperCase(),
      voice_url: number.voice_url ?? null,
      voice_method: (number.voice_method ?? "POST").toUpperCase(),
      status_callback: number.status_callback ?? null,
      application_sid: null
    });
  }
  for (const serviceCfg of config.messaging_services ?? []) {
    let service = serviceCfg.sid ? ts.messagingServices.findOneBy("sid", serviceCfg.sid) : ts.messagingServices.findBy("account_sid", account.sid).find((candidate) => candidate.friendly_name === serviceCfg.friendly_name);
    if (!service) {
      service = ts.messagingServices.insert({
        sid: serviceCfg.sid ?? twilioSid("MG"),
        account_sid: account.sid,
        friendly_name: serviceCfg.friendly_name,
        inbound_request_url: serviceCfg.inbound_request_url ?? null,
        status_callback: serviceCfg.status_callback ?? null
      });
    } else {
      service = ts.messagingServices.update(service.id, {
        friendly_name: serviceCfg.friendly_name,
        inbound_request_url: serviceCfg.inbound_request_url ?? service.inbound_request_url,
        status_callback: serviceCfg.status_callback ?? service.status_callback
      });
    }
    for (const numberRef of serviceCfg.phone_numbers ?? []) {
      const phoneNumber = ts.phoneNumbers.findOneBy("phone_number", numberRef) ?? ts.phoneNumbers.findOneBy("sid", numberRef);
      if (!phoneNumber) continue;
      const alreadyAssigned = ts.messagingServicePhoneNumbers.findBy("service_sid", service.sid).some((item) => item.phone_number_sid === phoneNumber.sid);
      if (alreadyAssigned) continue;
      ts.messagingServicePhoneNumbers.insert({
        sid: twilioSid("PN"),
        account_sid: account.sid,
        service_sid: service.sid,
        phone_number_sid: phoneNumber.sid
      });
    }
  }
  for (const service of config.verify_services ?? []) {
    const existing = service.sid ? ts.verifyServices.findOneBy("sid", service.sid) : ts.verifyServices.findBy("account_sid", account.sid).find((candidate) => candidate.friendly_name === service.friendly_name);
    if (existing) {
      ts.verifyServices.update(existing.id, {
        friendly_name: service.friendly_name,
        code: service.code ?? existing.code,
        default_channel: service.default_channel ?? existing.default_channel
      });
      continue;
    }
    ts.verifyServices.insert({
      sid: service.sid ?? twilioSid("VA"),
      account_sid: account.sid,
      friendly_name: service.friendly_name,
      code: service.code ?? "123456",
      default_channel: service.default_channel ?? "sms"
    });
  }
  for (const service of config.conversations?.services ?? []) {
    const existing = service.sid ? ts.conversationServices.findOneBy("sid", service.sid) : ts.conversationServices.findBy("account_sid", account.sid).find((candidate) => candidate.friendly_name === service.friendly_name);
    if (existing) {
      ts.conversationServices.update(existing.id, { friendly_name: service.friendly_name });
      continue;
    }
    ts.conversationServices.insert({
      sid: service.sid ?? twilioSid("IS"),
      account_sid: account.sid,
      friendly_name: service.friendly_name
    });
  }
}
var twilioPlugin = {
  name: "twilio",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    accountRoutes(ctx);
    phoneNumberRoutes(ctx);
    messagingServiceRoutes(ctx);
    messageRoutes(ctx);
    verifyRoutes(ctx);
    callRoutes(ctx);
    conversationRoutes(ctx);
    simulatorRoutes(ctx);
    inspectorRoutes(ctx);
  },
  seed(store) {
    seedDefaults(store);
  }
};
var index_default = twilioPlugin;
export {
  DEFAULT_ACCOUNT_SID,
  DEFAULT_API_KEY_SECRET,
  DEFAULT_API_KEY_SID,
  DEFAULT_AUTH_TOKEN,
  DEFAULT_MESSAGING_SERVICE_SID,
  DEFAULT_PHONE_NUMBER,
  DEFAULT_PHONE_NUMBER_SID,
  DEFAULT_VERIFY_SERVICE_SID,
  index_default as default,
  getTwilioStore,
  seedFromConfig,
  twilioPlugin
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-UFHJYTT3.js.map
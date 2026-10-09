import "./chunk-PZ5AY32C.js";

// ../@emulators/slack/dist/index.js
import { createHmac } from "crypto";
import { randomBytes } from "crypto";
import { randomUUID } from "crypto";
import { randomBytes as randomBytes2 } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
function getSlackStore(store) {
  return {
    teams: store.collection("slack.teams", ["team_id"]),
    users: store.collection("slack.users", ["user_id", "email"]),
    channels: store.collection("slack.channels", ["channel_id", "name"]),
    messages: store.collection("slack.messages", ["ts", "channel_id"]),
    ephemeralMessages: store.collection("slack.ephemeral_messages", [
      "ts",
      "channel_id",
      "target_user"
    ]),
    scheduledMessages: store.collection("slack.scheduled_messages", [
      "scheduled_message_id",
      "channel_id"
    ]),
    bots: store.collection("slack.bots", ["bot_id"]),
    oauthApps: store.collection("slack.oauth_apps", ["client_id"]),
    installations: store.collection("slack.installations", [
      "installation_id",
      "app_id",
      "client_id",
      "team_id"
    ]),
    tokens: store.collection("slack.tokens", ["token", "user_id", "app_id", "team_id"]),
    incomingWebhooks: store.collection("slack.incoming_webhooks", ["token"]),
    files: store.collection("slack.files", ["file_id", "user"]),
    fileUploadSessions: store.collection("slack.file_upload_sessions", ["file_id"]),
    pins: store.collection("slack.pins", ["pin_id", "channel_id", "message_ts"]),
    bookmarks: store.collection("slack.bookmarks", ["bookmark_id", "channel_id"]),
    views: store.collection("slack.views", ["view_id", "user_id", "external_id", "root_view_id"]),
    viewTriggers: store.collection("slack.view_triggers", ["trigger_id", "user_id", "view_id"])
  };
}
var SLACK_MESSAGE_TEXT_LIMIT = 4e4;
var SLACK_MESSAGE_TRUNCATED_WARNING = "message_truncated";
var SLACK_MESSAGE_TRUNCATED_MESSAGE = "[WARN] Your message was truncated but still posted";
var tsCounter = 0;
function generateSlackId(prefix) {
  return prefix + randomBytes(5).toString("hex").toUpperCase().slice(0, 9);
}
function generateTs() {
  const now = Math.floor(Date.now() / 1e3);
  tsCounter++;
  return `${now}.${String(tsCounter).padStart(6, "0")}`;
}
function slackOk(c, data) {
  return c.json({ ok: true, ...data });
}
function slackError(c, error, status = 200) {
  return c.json({ ok: false, error }, status);
}
function normalizeSlackMessageText(text) {
  const characters = Array.from(text);
  if (characters.length <= SLACK_MESSAGE_TEXT_LIMIT) return { text };
  return {
    text: characters.slice(0, SLACK_MESSAGE_TEXT_LIMIT).join(""),
    warning: SLACK_MESSAGE_TRUNCATED_WARNING,
    responseMetadata: {
      warnings: [SLACK_MESSAGE_TRUNCATED_WARNING],
      messages: [SLACK_MESSAGE_TRUNCATED_MESSAGE]
    }
  };
}
function slackMessageTextResponseMetadata(result) {
  if (!result?.warning || !result.responseMetadata) return {};
  return {
    warning: result.warning,
    response_metadata: result.responseMetadata
  };
}
function isSlackStrictScopes(store) {
  return store.getData("slack.strict_scopes") === true;
}
function requireSlackScopes(c, store, requirements) {
  if (!isSlackStrictScopes(store)) return void 0;
  const provided = slackProvidedScopes(c);
  const providedSet = new Set(provided);
  const missing = requirements.filter((requirement) => {
    if (Array.isArray(requirement)) {
      return !requirement.some((scope) => providedSet.has(scope));
    }
    return !providedSet.has(requirement);
  });
  if (missing.length === 0) return void 0;
  return c.json({
    ok: false,
    error: "missing_scope",
    needed: missing.map((requirement) => Array.isArray(requirement) ? requirement.join("|") : requirement).join(","),
    provided: provided.join(",")
  });
}
function hasSlackScope(c, scope) {
  return slackProvidedScopes(c).includes(scope);
}
function slackProvidedScopes(c) {
  return c.get("authScopes") ?? c.get("authUser")?.scopes ?? [];
}
function slackConversationReadScope(ch) {
  if (ch.is_im) return "im:read";
  if (ch.is_mpim) return "mpim:read";
  if (ch.is_private) return "groups:read";
  return "channels:read";
}
function slackConversationHistoryScope(ch) {
  if (ch.is_im) return "im:history";
  if (ch.is_mpim) return "mpim:history";
  if (ch.is_private) return "groups:history";
  return "channels:history";
}
function slackConversationWriteScope(ch) {
  if (ch.is_im) return "im:write";
  if (ch.is_mpim) return "mpim:write";
  if (ch.is_private) return "groups:write";
  return ["channels:manage", "channels:write"];
}
function slackConversationJoinScope(ch) {
  if (ch.is_private) return "groups:write";
  return ["channels:join", "channels:write"];
}
async function parseSlackBody(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  const rawText = await c.req.text();
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(rawText);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
function slackMessageChannelType(ch) {
  if (ch.is_im) return "im";
  if (ch.is_mpim) return "mpim";
  if (ch.is_private) return "group";
  return "channel";
}
function formatSlackMessage(msg) {
  return {
    type: msg.type,
    user: msg.user,
    text: msg.text,
    ts: msg.ts,
    ...msg.subtype ? { subtype: msg.subtype } : {},
    ...msg.bot_id ? { bot_id: msg.bot_id } : {},
    ...msg.app_id ? { app_id: msg.app_id } : {},
    ...msg.username ? { username: msg.username } : {},
    ...msg.icon_url ? { icon_url: msg.icon_url } : {},
    ...msg.icon_emoji ? { icon_emoji: msg.icon_emoji } : {},
    ...msg.client_msg_id ? { client_msg_id: msg.client_msg_id } : {},
    ...msg.topic !== void 0 ? { topic: msg.topic } : {},
    ...msg.purpose !== void 0 ? { purpose: msg.purpose } : {},
    ...msg.old_name !== void 0 ? { old_name: msg.old_name } : {},
    ...msg.name !== void 0 ? { name: msg.name } : {},
    ...msg.files !== void 0 ? { files: msg.files.map(formatSlackFile) } : {},
    ...msg.upload !== void 0 ? { upload: msg.upload } : {},
    ...msg.blocks !== void 0 ? { blocks: msg.blocks } : {},
    ...msg.attachments !== void 0 ? { attachments: msg.attachments } : {},
    ...msg.metadata !== void 0 ? { metadata: msg.metadata } : {},
    ...msg.mrkdwn !== void 0 ? { mrkdwn: msg.mrkdwn } : {},
    ...msg.parse !== void 0 ? { parse: msg.parse } : {},
    ...msg.link_names !== void 0 ? { link_names: msg.link_names } : {},
    ...msg.unfurl_links !== void 0 ? { unfurl_links: msg.unfurl_links } : {},
    ...msg.unfurl_media !== void 0 ? { unfurl_media: msg.unfurl_media } : {},
    ...msg.reply_broadcast !== void 0 ? { reply_broadcast: msg.reply_broadcast } : {},
    ...msg.edited ? { edited: msg.edited } : {},
    ...msg.thread_ts ? { thread_ts: msg.thread_ts } : {},
    ...msg.reply_count > 0 ? { reply_count: msg.reply_count, reply_users: msg.reply_users } : {},
    ...msg.reactions.length > 0 ? { reactions: msg.reactions } : {}
  };
}
function formatSlackFile(file) {
  return {
    id: file.file_id,
    created: file.created,
    timestamp: file.timestamp,
    name: file.name,
    title: file.title,
    mimetype: file.mimetype,
    filetype: file.filetype,
    pretty_type: file.pretty_type,
    user: file.user,
    user_team: file.team_id,
    editable: file.editable,
    size: file.size,
    mode: file.mode,
    is_external: file.is_external,
    external_type: file.external_type,
    is_public: file.is_public,
    public_url_shared: file.public_url_shared,
    display_as_bot: file.display_as_bot,
    url_private: file.url_private,
    url_private_download: file.url_private_download,
    permalink: file.permalink,
    channels: file.channels,
    groups: file.groups,
    ims: file.ims,
    shares: file.shares,
    comments_count: 0,
    is_starred: false,
    has_rich_preview: false,
    ...file.alt_txt ? { alt_txt: file.alt_txt } : {},
    ...file.initial_comment ? { initial_comment: file.initial_comment } : {},
    ...file.thread_ts ? { thread_ts: file.thread_ts } : {}
  };
}
function formatSlackPermalink(baseUrl, channel, msg) {
  const permalink = `${baseUrl.replace(/\/$/, "")}/archives/${channel}/p${msg.ts.replace(".", "")}`;
  if (!msg.thread_ts || msg.thread_ts === msg.ts) return permalink;
  const params = new URLSearchParams({ thread_ts: msg.thread_ts, cid: channel });
  return `${permalink}?${params.toString()}`;
}
function formatSlackScheduledMessage(msg) {
  return {
    text: msg.text,
    type: msg.type,
    subtype: msg.subtype,
    ...msg.username ? { username: msg.username } : {},
    ...msg.bot_id ? { bot_id: msg.bot_id } : {},
    ...msg.app_id ? { app_id: msg.app_id } : {},
    ...msg.icon_url ? { icon_url: msg.icon_url } : {},
    ...msg.icon_emoji ? { icon_emoji: msg.icon_emoji } : {},
    ...msg.client_msg_id ? { client_msg_id: msg.client_msg_id } : {},
    ...msg.blocks !== void 0 ? { blocks: msg.blocks } : {},
    ...msg.attachments !== void 0 ? { attachments: msg.attachments } : {},
    ...msg.metadata !== void 0 ? { metadata: msg.metadata } : {},
    ...msg.mrkdwn !== void 0 ? { mrkdwn: msg.mrkdwn } : {},
    ...msg.parse !== void 0 ? { parse: msg.parse } : {},
    ...msg.link_names !== void 0 ? { link_names: msg.link_names } : {},
    ...msg.unfurl_links !== void 0 ? { unfurl_links: msg.unfurl_links } : {},
    ...msg.unfurl_media !== void 0 ? { unfurl_media: msg.unfurl_media } : {},
    ...msg.reply_broadcast !== void 0 ? { reply_broadcast: msg.reply_broadcast } : {},
    ...msg.thread_ts ? { thread_ts: msg.thread_ts } : {}
  };
}
function formatSlackScheduledMessageListItem(msg) {
  return {
    id: msg.scheduled_message_id,
    channel_id: msg.channel_id,
    post_at: msg.post_at,
    date_created: msg.date_created,
    text: msg.text
  };
}
function formatSlackView(view) {
  return {
    id: view.view_id,
    team_id: view.team_id,
    type: view.type,
    title: view.title,
    close: view.close,
    submit: view.submit,
    blocks: view.blocks,
    private_metadata: view.private_metadata,
    callback_id: view.callback_id,
    external_id: view.external_id,
    state: view.state,
    hash: view.hash,
    clear_on_close: view.clear_on_close,
    notify_on_close: view.notify_on_close,
    root_view_id: view.root_view_id,
    previous_view_id: view.previous_view_id ?? null,
    app_id: view.app_id,
    bot_id: view.bot_id
  };
}
function getSlackConversationOpenState(ch, userId) {
  if ((ch.is_im || ch.is_mpim) && userId && ch.is_open_by_user) {
    return ch.is_open_by_user[userId] === true;
  }
  return ch.is_open ?? false;
}
function setSlackConversationOpenState(ch, userId, isOpen) {
  if (!ch.is_im && !ch.is_mpim) return { is_open: isOpen };
  return { is_open_by_user: { ...ch.is_open_by_user ?? {}, [userId]: isOpen } };
}
function parseSlackRichMessageFields(body) {
  const fields = {};
  const providedFields = [];
  const blocks = parseSlackObjectArray(body.blocks, "invalid_blocks");
  if (blocks.error) return { fields, providedFields, error: blocks.error };
  if (hasBodyField(body, "blocks")) {
    providedFields.push("blocks");
    if (blocks.value !== void 0) fields.blocks = blocks.value;
  }
  const attachments = parseSlackObjectArray(body.attachments, "invalid_attachments");
  if (attachments.error) return { fields, providedFields, error: attachments.error };
  if (hasBodyField(body, "attachments")) {
    providedFields.push("attachments");
    if (attachments.value !== void 0) fields.attachments = attachments.value;
  }
  const metadata = parseSlackObject(body.metadata, "invalid_metadata_format");
  if (metadata.error) return { fields, providedFields, error: metadata.error };
  if (hasBodyField(body, "metadata")) {
    providedFields.push("metadata");
    if (metadata.value !== void 0) fields.metadata = metadata.value;
  }
  setOptionalStringField(body, fields, providedFields, "parse");
  setOptionalStringField(body, fields, providedFields, "username");
  setOptionalStringField(body, fields, providedFields, "icon_url");
  setOptionalStringField(body, fields, providedFields, "icon_emoji");
  setOptionalStringField(body, fields, providedFields, "bot_id");
  setOptionalStringField(body, fields, providedFields, "app_id");
  setOptionalStringField(body, fields, providedFields, "client_msg_id");
  setOptionalBooleanField(body, fields, providedFields, "mrkdwn");
  setOptionalBooleanField(body, fields, providedFields, "link_names");
  setOptionalBooleanField(body, fields, providedFields, "unfurl_links");
  setOptionalBooleanField(body, fields, providedFields, "unfurl_media");
  setOptionalBooleanField(body, fields, providedFields, "reply_broadcast");
  return { fields, providedFields };
}
function hasSlackMessageContent(text, fields) {
  return text.length > 0 || (fields.blocks?.length ?? 0) > 0 || (fields.attachments?.length ?? 0) > 0;
}
function hasBodyField(body, field) {
  return Object.prototype.hasOwnProperty.call(body, field);
}
function isSlackJsonObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function parseSlackJsonString(value) {
  if (value.length === 0) return {};
  try {
    return { value: JSON.parse(value) };
  } catch {
    return { error: "invalid_json" };
  }
}
function parseSlackObjectArray(value, error) {
  let parsed = value;
  if (parsed === void 0 || parsed === null || parsed === "") return {};
  if (typeof parsed === "string") {
    const result = parseSlackJsonString(parsed);
    if (result.error) return { error };
    parsed = result.value;
  }
  if (!Array.isArray(parsed) || !parsed.every(isSlackJsonObject)) {
    return { error };
  }
  return { value: parsed };
}
function parseSlackObject(value, error) {
  let parsed = value;
  if (parsed === void 0 || parsed === null || parsed === "") return {};
  if (typeof parsed === "string") {
    const result = parseSlackJsonString(parsed);
    if (result.error) return { error };
    parsed = result.value;
  }
  if (!isSlackJsonObject(parsed)) {
    return { error };
  }
  return { value: parsed };
}
function parseSlackBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return void 0;
}
function setOptionalStringField(body, fields, providedFields, field) {
  if (!hasBodyField(body, field)) return;
  providedFields.push(field);
  const value = body[field];
  if (typeof value === "string" && value.length > 0) {
    fields[field] = value;
  }
}
function setOptionalBooleanField(body, fields, providedFields, field) {
  if (!hasBodyField(body, field)) return;
  providedFields.push(field);
  const value = parseSlackBoolean(body[field]);
  if (value !== void 0) {
    fields[field] = value;
  }
}
function authRoutes(ctx) {
  const { app, store } = ctx;
  const ss = () => getSlackStore(store);
  app.post("/api/auth.test", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return slackError(c, "not_authed");
    }
    const user = ss().users.findOneBy("user_id", authUser.login) ?? ss().users.all().find((u) => u.name === authUser.login);
    if (!user) {
      return slackError(c, "invalid_auth");
    }
    const team = ss().teams.all()[0];
    const token = c.get("authToken");
    const tokenRecord = token ? ss().tokens.findOneBy("token", token) : void 0;
    const bot = (tokenRecord?.bot_id ? ss().bots.findOneBy("bot_id", tokenRecord.bot_id) : void 0) ?? (user.is_bot ? ss().bots.all().find((item) => item.user_id === user.user_id) : void 0);
    const installation = tokenRecord?.installation_id ? ss().installations.findOneBy("installation_id", tokenRecord.installation_id) : void 0;
    return slackOk(c, {
      url: `https://${team?.domain ?? "emulate"}.slack.com/`,
      team: team?.name ?? "Emulate",
      user: user.name,
      team_id: team?.team_id ?? "T000000001",
      user_id: user.user_id,
      bot_id: bot?.bot_id,
      app_id: tokenRecord?.app_id,
      app_name: installation?.app_name
    });
  });
}
function buildSlackEventEnvelope(teamId, event, channel) {
  return {
    type: "event_callback",
    team_id: teamId,
    event_id: `Ev${randomUUID().replaceAll("-", "")}`,
    event_time: Math.floor(Date.now() / 1e3),
    ...channel ? { is_ext_shared_channel: isSlackExtSharedChannel(channel) } : {},
    event
  };
}
function isSlackExtSharedChannel(channel) {
  return (channel.shared_team_ids?.length ?? 0) > 1;
}
function resolveSlackChannelEventTeamId(c, store, channel) {
  if (isSlackExtSharedChannel(channel)) return channel.team_id;
  return resolveSlackEventTeamId(c, store, channel.team_id);
}
function slackMessageTeamFields(store, channel, authorUserId) {
  const authorTeamId = authorUserId ? getSlackStore(store).users.findOneBy("user_id", authorUserId)?.team_id : void 0;
  const team = authorTeamId ?? channel.team_id;
  return isSlackExtSharedChannel(channel) ? { team, user_team: team, source_team: team } : { team };
}
function resolveSlackEventTeamId(c, store, fallbackTeamId) {
  const slackStore = getSlackStore(store);
  const token = c.get("authToken");
  const tokenTeamId = token ? slackStore.tokens.findOneBy("token", token)?.team_id : void 0;
  return tokenTeamId ?? fallbackTeamId ?? slackStore.teams.all()[0]?.team_id ?? "T000000001";
}
var USER_MENTION_PATTERN = /<@([UW][A-Z0-9]+)(?:\|[^>]*)?>/g;
function findMentionedSlackBotUserIds(store, text) {
  const ss = getSlackStore(store);
  const mentioned = new Set([...text.matchAll(USER_MENTION_PATTERN)].map((match) => match[1]));
  return [...mentioned].filter((userId) => {
    const user = ss.users.findOneBy("user_id", userId);
    if (user) return user.is_bot && !user.deleted;
    const bot = ss.bots.findOneBy("user_id", userId);
    return bot !== void 0 && !bot.deleted;
  });
}
async function dispatchSlackAppMention(webhooks, store, teamId, channel, message) {
  if (channel.is_im) return;
  const authorBotUserId = message.bot_id ? getSlackStore(store).bots.findOneBy("bot_id", message.bot_id)?.user_id : void 0;
  const mentionsOtherBot = findMentionedSlackBotUserIds(store, message.text).some(
    (userId) => userId !== message.user && userId !== authorBotUserId && channel.members.includes(userId)
  );
  if (!mentionsOtherBot) return;
  const { reactions: _reactions, reply_count: _replyCount, reply_users: _replyUsers, ...event } = message;
  await webhooks.dispatch(
    "app_mention",
    void 0,
    buildSlackEventEnvelope(
      teamId,
      {
        ...event,
        type: "app_mention",
        channel: channel.channel_id,
        ...slackMessageTeamFields(store, channel, message.user),
        event_ts: message.ts
      },
      channel
    ),
    "slack"
  );
}
function chatRoutes(ctx) {
  const { app, store, webhooks, baseUrl } = ctx;
  const ss = () => getSlackStore(store);
  const findChannel = (channel) => ss().channels.findOneBy("channel_id", channel) ?? ss().channels.all().find((ch) => !ch.is_im && !ch.is_mpim && ch.name === channel);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const isAuthChannelMember = (channel, authUser) => {
    const user = getAuthSlackUser(authUser);
    const userId = user?.user_id ?? authUser.login;
    return channel.members.includes(userId) || (user ? channel.members.includes(user.name) : false);
  };
  const canAccessConversation = (channel, authUser) => !channel.is_private || isAuthChannelMember(channel, authUser);
  const isAuthoredByUser = (msg, authUser) => {
    const user = getAuthSlackUser(authUser);
    return msg.user === authUser.login || msg.user === user?.user_id || msg.user === user?.name;
  };
  const isChannelMember = (channel, user) => channel.members.includes(user.user_id) || channel.members.includes(user.name);
  const deletePinsForMessage = (channel, ts) => {
    for (const pin of ss().pins.findBy("message_ts", ts).filter((pin2) => pin2.channel_id === channel)) {
      ss().pins.delete(pin.id);
    }
  };
  const dispatchConversationEvent = async (c, type, event, teamId) => {
    await webhooks.dispatch(
      type,
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, teamId), { type, ...event }),
      "slack"
    );
  };
  const findOrCreateDirectMessage = async (c, authUser, userId) => {
    const targetUser = ss().users.findOneBy("user_id", userId);
    if (!targetUser || targetUser.deleted) return void 0;
    const authUserId = getAuthUserId(authUser);
    if (targetUser.user_id === authUserId) return void 0;
    const members = [authUserId, targetUser.user_id].sort();
    const existing = ss().channels.all().find(
      (ch) => ch.is_im && ch.members.length === members.length && [...ch.members].sort().join(",") === members.join(",")
    );
    if (existing) {
      if (!getSlackConversationOpenState(existing, authUserId)) {
        const updated = ss().channels.update(existing.id, setSlackConversationOpenState(existing, authUserId, true));
        if (updated) await dispatchConversationEvent(c, "im_open", { channel: updated.channel_id }, updated.team_id);
        return updated;
      }
      return existing;
    }
    const team = ss().teams.all()[0];
    const now = Math.floor(Date.now() / 1e3);
    const created = ss().channels.insert({
      channel_id: generateSlackId("D"),
      team_id: team?.team_id ?? "T000000001",
      name: targetUser.name,
      is_channel: false,
      is_private: true,
      is_im: true,
      is_mpim: false,
      is_open_by_user: { [authUserId]: true },
      user: targetUser.user_id,
      is_archived: false,
      topic: { value: "", creator: authUserId, last_set: now },
      purpose: { value: "", creator: authUserId, last_set: now },
      members,
      creator: authUserId,
      num_members: members.length,
      last_read: {}
    });
    await dispatchConversationEvent(
      c,
      "im_created",
      { channel: formatDirectMessageChannel(created, authUserId, targetUser.user_id) },
      created.team_id
    );
    await dispatchConversationEvent(c, "im_open", { channel: created.channel_id }, created.team_id);
    return created;
  };
  const findWritableConversation = async (c, authUser, channel) => findChannel(channel) ?? await findOrCreateDirectMessage(c, authUser, channel);
  app.post("/api/chat.postMessage", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const text = typeof body.text === "string" ? body.text : "";
    const normalizedText = normalizeSlackMessageText(text);
    const thread_ts = typeof body.thread_ts === "string" ? body.thread_ts : void 0;
    const richMessage = parseSlackRichMessageFields(body);
    if (richMessage.error) return slackError(c, richMessage.error);
    if (!channel) return slackError(c, "channel_not_found");
    if (!hasSlackMessageContent(text, richMessage.fields)) return slackError(c, "no_text");
    const ch = await findWritableConversation(c, authUser, channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (ch.is_archived) return slackError(c, "is_archived");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const authUserId = getAuthUserId(authUser);
    const ts = generateTs();
    const msg = ss().messages.insert({
      ts,
      channel_id: ch.channel_id,
      user: authUserId,
      text: normalizedText.text,
      type: "message",
      thread_ts,
      ...richMessage.fields,
      reply_count: 0,
      reply_users: [],
      reactions: []
    });
    if (thread_ts) {
      const parent = ss().messages.all().find((m) => m.ts === thread_ts && m.channel_id === ch.channel_id);
      if (parent) {
        const replyUsers = parent.reply_users.includes(authUserId) ? parent.reply_users : [...parent.reply_users, authUserId];
        ss().messages.update(parent.id, {
          reply_count: parent.reply_count + 1,
          reply_users: replyUsers
        });
      }
    }
    await webhooks.dispatch(
      "message",
      void 0,
      buildSlackEventEnvelope(
        resolveSlackChannelEventTeamId(c, store, ch),
        {
          ...formatSlackMessage(msg),
          type: "message",
          channel: ch.channel_id,
          channel_type: slackMessageChannelType(ch),
          ...slackMessageTeamFields(store, ch, msg.user)
        },
        ch
      ),
      "slack"
    );
    await dispatchSlackAppMention(
      webhooks,
      store,
      resolveSlackChannelEventTeamId(c, store, ch),
      ch,
      formatSlackMessage(msg)
    );
    return slackOk(c, {
      channel: ch.channel_id,
      ts,
      message: formatSlackMessage(msg),
      ...slackMessageTextResponseMetadata(normalizedText)
    });
  });
  app.post("/api/chat.postEphemeral", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const user = typeof body.user === "string" ? body.user : "";
    const text = typeof body.text === "string" ? body.text : "";
    const normalizedText = normalizeSlackMessageText(text);
    const thread_ts = typeof body.thread_ts === "string" ? body.thread_ts : void 0;
    const richMessage = parseSlackRichMessageFields(body);
    if (richMessage.error) return slackError(c, richMessage.error);
    if (!channel) return slackError(c, "channel_not_found");
    if (!user) return slackError(c, "user_not_found");
    if (!hasSlackMessageContent(text, richMessage.fields)) return slackError(c, "no_text");
    const ch = findChannel(channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (ch.is_archived) return slackError(c, "is_archived");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const targetUser = ss().users.findOneBy("user_id", user);
    if (!targetUser) return slackError(c, "user_not_found");
    if (!isChannelMember(ch, targetUser)) return slackError(c, "user_not_in_channel");
    const authUserId = getAuthUserId(authUser);
    const ts = generateTs();
    ss().ephemeralMessages.insert({
      ts,
      channel_id: ch.channel_id,
      user: authUserId,
      target_user: targetUser.user_id,
      text: normalizedText.text,
      type: "message",
      thread_ts,
      ...richMessage.fields,
      reply_count: 0,
      reply_users: [],
      reactions: []
    });
    return slackOk(c, { message_ts: ts, ...slackMessageTextResponseMetadata(normalizedText) });
  });
  app.post("/api/chat.update", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ts = typeof body.ts === "string" ? body.ts : "";
    const hasText = typeof body.text === "string";
    const text = hasText ? body.text : "";
    const normalizedText = hasText ? normalizeSlackMessageText(text) : void 0;
    const richMessage = parseSlackRichMessageFields(body);
    if (richMessage.error) return slackError(c, richMessage.error);
    if (!channel || !ts) return slackError(c, "message_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === ts && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    if (!isAuthoredByUser(msg, authUser)) return slackError(c, "cant_update_message");
    const updates = { ...richMessage.fields };
    if (hasText) {
      updates.text = normalizedText.text;
      if (!richMessage.providedFields.includes("blocks")) updates.blocks = void 0;
      if (!richMessage.providedFields.includes("attachments")) updates.attachments = void 0;
    }
    if (!hasText && Object.keys(updates).length === 0) {
      return slackError(c, "no_text");
    }
    const authUserId = getAuthUserId(authUser);
    const eventTs = generateTs();
    const updated = ss().messages.update(msg.id, {
      ...updates,
      edited: { user: authUserId, ts: eventTs }
    });
    await webhooks.dispatch(
      "message",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, ch?.team_id), {
        type: "message",
        subtype: "message_changed",
        hidden: true,
        channel,
        ...ch ? { channel_type: slackMessageChannelType(ch) } : {},
        ts: eventTs,
        event_ts: eventTs,
        message: formatSlackMessage(updated),
        previous_message: formatSlackMessage(msg)
      }),
      "slack"
    );
    return slackOk(c, {
      channel,
      ts,
      text: updated.text,
      message: formatSlackMessage(updated),
      ...slackMessageTextResponseMetadata(normalizedText)
    });
  });
  app.post("/api/chat.delete", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ts = typeof body.ts === "string" ? body.ts : "";
    if (!channel || !ts) return slackError(c, "message_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === ts && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    if (!isAuthoredByUser(msg, authUser)) return slackError(c, "cant_delete_message");
    ss().messages.delete(msg.id);
    deletePinsForMessage(channel, ts);
    const eventTs = generateTs();
    await webhooks.dispatch(
      "message",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, ch?.team_id), {
        type: "message",
        subtype: "message_deleted",
        hidden: true,
        channel,
        ...ch ? { channel_type: slackMessageChannelType(ch) } : {},
        ts: eventTs,
        event_ts: eventTs,
        deleted_ts: ts,
        previous_message: formatSlackMessage(msg)
      }),
      "slack"
    );
    return slackOk(c, { channel, ts });
  });
  async function getPermalink(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = c.req.method === "GET" ? {} : await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : c.req.query("channel") ?? "";
    const messageTs = typeof body.message_ts === "string" ? body.message_ts : c.req.query("message_ts") ?? "";
    if (!channel) return slackError(c, "channel_not_found");
    if (!messageTs) return slackError(c, "message_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === messageTs && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    return slackOk(c, {
      channel,
      permalink: formatSlackPermalink(baseUrl, ch.channel_id, msg)
    });
  }
  app.get("/api/chat.getPermalink", getPermalink);
  app.post("/api/chat.getPermalink", getPermalink);
  app.post("/api/chat.scheduleMessage", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const text = typeof body.text === "string" ? body.text : "";
    const normalizedText = normalizeSlackMessageText(text);
    const postAt = Number(body.post_at);
    const thread_ts = typeof body.thread_ts === "string" ? body.thread_ts : void 0;
    const richMessage = parseSlackRichMessageFields(body);
    if (richMessage.error) return slackError(c, richMessage.error);
    if (!channel) return slackError(c, "channel_not_found");
    if (!hasSlackMessageContent(text, richMessage.fields)) return slackError(c, "no_text");
    if (!Number.isFinite(postAt) || postAt <= 0) return slackError(c, "invalid_time");
    const now = Math.floor(Date.now() / 1e3);
    const postAtSeconds = Math.floor(postAt);
    if (postAtSeconds <= now) return slackError(c, "time_in_past");
    if (postAtSeconds > now + 120 * 24 * 60 * 60) return slackError(c, "time_too_far");
    const ch = findChannel(channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (ch.is_archived) return slackError(c, "is_archived");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const authUserId = getAuthUserId(authUser);
    const scheduled = ss().scheduledMessages.insert({
      scheduled_message_id: generateSlackId("Q"),
      channel_id: ch.channel_id,
      user: authUserId,
      text: normalizedText.text,
      type: "delayed_message",
      subtype: "bot_message",
      thread_ts,
      ...richMessage.fields,
      post_at: postAtSeconds,
      date_created: now
    });
    return slackOk(c, {
      channel: ch.channel_id,
      scheduled_message_id: scheduled.scheduled_message_id,
      post_at: scheduled.post_at,
      message: formatSlackScheduledMessage(scheduled),
      ...slackMessageTextResponseMetadata(normalizedText)
    });
  });
  app.post("/api/chat.deleteScheduledMessage", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const scheduledMessageId = typeof body.scheduled_message_id === "string" ? body.scheduled_message_id : "";
    if (!channel) return slackError(c, "channel_not_found");
    if (!scheduledMessageId) return slackError(c, "invalid_scheduled_message_id");
    const ch = findChannel(channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const scheduled = ss().scheduledMessages.all().find((m) => m.channel_id === ch.channel_id && m.scheduled_message_id === scheduledMessageId);
    if (!scheduled) return slackError(c, "invalid_scheduled_message_id");
    if (!isAuthoredByUser(scheduled, authUser)) return slackError(c, "cant_delete_message");
    ss().scheduledMessages.delete(scheduled.id);
    return slackOk(c, {});
  });
  app.post("/api/chat.scheduledMessages.list", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const cursor = typeof body.cursor === "string" ? body.cursor : "";
    const requestedLimit = body.limit === void 0 ? 100 : Number(body.limit);
    const oldest = body.oldest === void 0 ? void 0 : Number(body.oldest);
    const latest = body.latest === void 0 ? void 0 : Number(body.latest);
    if (!Number.isFinite(requestedLimit) || requestedLimit < 1) {
      return slackError(c, "invalid_arguments");
    }
    if (oldest !== void 0 && !Number.isFinite(oldest) || latest !== void 0 && !Number.isFinite(latest)) {
      return slackError(c, "invalid_arguments");
    }
    if (oldest !== void 0 && latest !== void 0 && oldest > latest) {
      return slackError(c, "invalid_arguments");
    }
    const limit = Math.min(Math.floor(requestedLimit), 1e3);
    const ch = channel ? findChannel(channel) : void 0;
    if (channel && !ch) return slackError(c, "channel_not_found");
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const allScheduled = ss().scheduledMessages.all().filter((msg) => isAuthoredByUser(msg, authUser)).filter((msg) => !ch || msg.channel_id === ch.channel_id).filter((msg) => {
      const messageChannel = ss().channels.findOneBy("channel_id", msg.channel_id);
      return messageChannel ? canAccessConversation(messageChannel, authUser) : false;
    }).filter((msg) => oldest === void 0 || msg.post_at >= oldest).filter((msg) => latest === void 0 || msg.post_at <= latest).sort((a, b) => a.post_at - b.post_at || a.scheduled_message_id.localeCompare(b.scheduled_message_id));
    let startIndex = 0;
    if (cursor) {
      const idx = allScheduled.findIndex((msg) => msg.scheduled_message_id === cursor);
      if (idx < 0) return slackError(c, "invalid_cursor");
      if (idx >= 0) startIndex = idx;
    }
    const page = allScheduled.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < allScheduled.length ? allScheduled[startIndex + limit].scheduled_message_id : "";
    return slackOk(c, {
      scheduled_messages: page.map(formatSlackScheduledMessageListItem),
      response_metadata: { next_cursor: nextCursor }
    });
  });
  app.post("/api/chat.meMessage", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["chat:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const text = typeof body.text === "string" ? body.text : "";
    const normalizedText = normalizeSlackMessageText(text);
    if (!channel) return slackError(c, "channel_not_found");
    const ch = findChannel(channel);
    if (!ch) return slackError(c, "channel_not_found");
    if (ch.is_archived) return slackError(c, "is_archived");
    if (!canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const authUserId = getAuthUserId(authUser);
    const ts = generateTs();
    ss().messages.insert({
      ts,
      channel_id: ch.channel_id,
      user: authUserId,
      text: normalizedText.text,
      type: "message",
      subtype: "me_message",
      reply_count: 0,
      reply_users: [],
      reactions: []
    });
    return slackOk(c, { channel: ch.channel_id, ts, ...slackMessageTextResponseMetadata(normalizedText) });
  });
}
function formatDirectMessageChannel(ch, viewer, user) {
  return {
    id: ch.channel_id,
    name: ch.name,
    name_normalized: ch.name,
    is_channel: ch.is_channel,
    is_group: false,
    is_im: true,
    is_mpim: false,
    is_private: ch.is_private,
    is_archived: ch.is_archived,
    is_open: getSlackConversationOpenState(ch, viewer),
    user,
    is_member: true,
    last_read: ch.last_read?.[viewer] ?? "0000000000.000000",
    topic: ch.topic,
    purpose: ch.purpose,
    creator: ch.creator,
    num_members: ch.num_members,
    created: Math.floor(new Date(ch.created_at).getTime() / 1e3)
  };
}
function conversationsRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const ss = () => getSlackStore(store);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const memberAliases = (user, userId) => new Set([userId, user?.name].filter((value) => Boolean(value)));
  const getChannelMemberKey = (channel, user, userId) => {
    const aliases = memberAliases(user, userId);
    return channel.members.find((member) => aliases.has(member));
  };
  const isChannelMember = (channel, user, userId) => getChannelMemberKey(channel, user, userId) !== void 0;
  const canReadConversation = (channel, user, userId) => !channel.is_private || isChannelMember(channel, user, userId);
  const visibleFileChannelIds = (file, authUser) => {
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = authSlackUser?.user_id ?? authUser.login;
    return fileChannels(file).filter((channelId) => {
      const channel = ss().channels.findOneBy("channel_id", channelId);
      return channel ? canReadConversation(channel, authSlackUser, authUserId) : false;
    });
  };
  const visibleFileForAuth = (file, authUser) => {
    const visibleIds = new Set(visibleFileChannelIds(file, authUser));
    const publicShares = filterVisibleShares(file.shares.public, visibleIds);
    const privateShares = filterVisibleShares(file.shares.private, visibleIds);
    const shares = {};
    if (publicShares) shares.public = publicShares;
    if (privateShares) shares.private = privateShares;
    return {
      ...file,
      channels: file.channels.filter((channelId) => visibleIds.has(channelId)),
      groups: file.groups.filter((channelId) => visibleIds.has(channelId)),
      ims: file.ims.filter((channelId) => visibleIds.has(channelId)),
      shares
    };
  };
  const formatSlackMessageForAuth = (msg, authUser) => formatSlackMessage({
    ...msg,
    ...msg.files ? {
      files: msg.files.map((file) => ss().files.findOneBy("file_id", file.file_id) ?? file).filter((file) => !file.deleted).map((file) => visibleFileForAuth(file, authUser))
    } : {}
  });
  const dispatchConversationEvent = async (c, channel, type, event) => {
    await webhooks.dispatch(
      type,
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, channel.team_id), { type, ...event }),
      "slack"
    );
  };
  const insertAndDispatchMessageEvent = async (c, channel, user, message) => {
    const msg = ss().messages.insert({
      ts: generateTs(),
      channel_id: channel.channel_id,
      user,
      type: "message",
      ...message,
      reply_count: 0,
      reply_users: [],
      reactions: []
    });
    await webhooks.dispatch(
      "message",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, channel.team_id), {
        ...formatSlackMessage(msg),
        channel: channel.channel_id,
        channel_type: slackMessageChannelType(channel),
        event_ts: msg.ts
      }),
      "slack"
    );
    return msg;
  };
  const dispatchMemberJoined = async (c, channel, user, inviter) => {
    await dispatchConversationEvent(c, channel, "member_joined_channel", {
      user,
      channel: channel.channel_id,
      channel_type: channelTypeLetter(channel),
      team: channel.team_id,
      ...inviter ? { inviter } : {}
    });
  };
  const dispatchMemberLeft = async (c, channel, user) => {
    await dispatchConversationEvent(c, channel, "member_left_channel", {
      user,
      channel: channel.channel_id,
      channel_type: channelTypeLetter(channel),
      team: channel.team_id
    });
  };
  const listConversations = (membersOnly) => async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const limit = Math.min(Number(body.limit) || 100, 1e3);
    const cursor = typeof body.cursor === "string" ? body.cursor : "";
    const excludeArchived = isTruthySlackBoolean(body.exclude_archived);
    const types = parseConversationTypes(body.types);
    const scopeError = requireSlackScopes(c, store, readScopesForConversationTypes(types));
    if (scopeError) return scopeError;
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    const member = membersOnly && typeof body.user === "string" ? ss().users.findOneBy("user_id", body.user) : void 0;
    if (membersOnly && typeof body.user === "string" && !member) return slackError(c, "user_not_found");
    const allChannels = ss().channels.all().filter((ch) => matchesConversationTypes(ch, types)).filter((ch) => canReadConversation(ch, authSlackUser, authUserId)).filter((ch) => !membersOnly || isChannelMember(ch, member ?? authSlackUser, member?.user_id ?? authUserId)).filter((ch) => !excludeArchived || !ch.is_archived);
    let startIndex = 0;
    if (cursor) {
      const idx = allChannels.findIndex((ch) => ch.channel_id === cursor);
      if (idx >= 0) startIndex = idx;
    }
    const page = allChannels.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < allChannels.length ? allChannels[startIndex + limit].channel_id : "";
    return slackOk(c, {
      channels: page.map((ch) => formatChannel(ch, authUserId, authSlackUser?.name)),
      response_metadata: { next_cursor: nextCursor }
    });
  };
  app.post("/api/conversations.list", listConversations(false));
  app.post("/api/users.conversations", listConversations(true));
  app.post("/api/conversations.info", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationReadScope(ch)]);
    if (scopeError) return scopeError;
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const channelInfo = formatChannel(ch, authUserId, authSlackUser?.name);
    if (!channelInfo.is_member) return slackOk(c, { channel: channelInfo });
    const lastRead = ch.last_read?.[authUserId] ?? "0000000000.000000";
    const unread = ss().messages.findBy("channel_id", ch.channel_id).filter((m) => m.ts > lastRead && (!m.thread_ts || m.thread_ts === m.ts));
    const display = unread.filter((m) => m.user !== authUserId && !m.subtype?.startsWith("channel_")).length;
    return slackOk(c, { channel: { ...channelInfo, unread_count: unread.length, unread_count_display: display } });
  });
  app.post("/api/search.messages", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["search:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) return slackError(c, "no_query");
    const count = Math.min(Math.max(Number(body.count) || 20, 1), 100);
    const page = Math.max(Number(body.page) || 1, 1);
    const ascending = body.sort_dir === "asc";
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    const words = [];
    const inChannels = [];
    const fromUsers = [];
    for (const token of query.split(/\s+/)) {
      const [, key, value] = /^(in|from):<?[#@]?([^>|]+)(?:\|[^>]*)?>?$/i.exec(token) ?? [];
      if (key?.toLowerCase() === "in") inChannels.push(value.toLowerCase());
      else if (key?.toLowerCase() === "from") fromUsers.push(value.toLowerCase());
      else words.push(token.toLowerCase());
    }
    const channels = new Map(
      ss().channels.all().filter((ch) => canReadConversation(ch, authSlackUser, authUserId)).filter((ch) => !ch.is_im || isChannelMember(ch, authSlackUser, authUserId)).filter(
        (ch) => !inChannels.length || inChannels.some((ref) => [ch.channel_id.toLowerCase(), ch.name.toLowerCase()].includes(ref))
      ).map((ch) => [ch.channel_id, ch])
    );
    const userName = (id) => ss().users.findOneBy("user_id", id)?.name ?? id;
    const matches = ss().messages.all().filter((m) => channels.has(m.channel_id) && !m.subtype?.startsWith("channel_")).filter((m) => words.every((word) => m.text.toLowerCase().includes(word))).filter(
      (m) => !fromUsers.length || fromUsers.some((ref) => [m.user.toLowerCase(), userName(m.user).toLowerCase()].includes(ref))
    ).sort((a, b) => ascending ? a.ts.localeCompare(b.ts) : b.ts.localeCompare(a.ts));
    const pages = Math.max(Math.ceil(matches.length / count), 1);
    return slackOk(c, {
      query,
      messages: {
        total: matches.length,
        matches: matches.slice((page - 1) * count, page * count).map((m) => {
          const ch = channels.get(m.channel_id);
          return {
            type: "message",
            channel: {
              id: ch.channel_id,
              name: ch.name,
              is_private: ch.is_private,
              is_im: ch.is_im ?? false,
              is_mpim: ch.is_mpim ?? false
            },
            user: m.user,
            username: userName(m.user),
            ts: m.ts,
            text: m.text,
            team: ch.team_id,
            permalink: formatSlackPermalink(ctx.baseUrl, ch.channel_id, m)
          };
        }),
        paging: { count, total: matches.length, page, pages },
        pagination: {
          total_count: matches.length,
          page,
          per_page: count,
          page_count: pages,
          first: matches.length ? (page - 1) * count + 1 : 0,
          last: Math.min(page * count, matches.length)
        }
      }
    });
  });
  app.post("/api/conversations.create", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const name = normalizeChannelName(typeof body.name === "string" ? body.name : "");
    const isPrivate = body.is_private === true || body.is_private === "true";
    const scopeError = requireSlackScopes(c, store, [
      isPrivate ? "groups:write" : ["channels:manage", "channels:write"]
    ]);
    if (scopeError) return scopeError;
    if (!name) return slackError(c, "invalid_name_specials");
    const nameError = validateChannelName(name);
    if (nameError) return slackError(c, nameError);
    const existing = findNamedChannel(ss().channels.all(), name);
    if (existing) return slackError(c, "name_taken");
    const team = ss().teams.all()[0];
    const channelId = generateSlackId("C");
    const now = Math.floor(Date.now() / 1e3);
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    const ch = ss().channels.insert({
      channel_id: channelId,
      team_id: team?.team_id ?? "T000000001",
      name,
      is_channel: !isPrivate,
      is_private: isPrivate,
      is_archived: false,
      topic: { value: "", creator: "", last_set: 0 },
      purpose: { value: "", creator: authUserId, last_set: now },
      members: [authUserId],
      creator: authUserId,
      num_members: 1
    });
    return slackOk(c, { channel: formatChannel(ch, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.archive", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    if (!channel) return slackError(c, "channel_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (isDirectConversation(ch)) return slackError(c, "method_not_supported_for_channel_type");
    if (isGeneralChannel(ch)) return slackError(c, "cant_archive_general");
    if (ch.is_archived) return slackError(c, "already_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const updated = ss().channels.update(ch.id, { is_archived: true });
    await dispatchConversationEvent(c, updated, lifecycleEventType(updated, "archive"), {
      channel: updated.channel_id,
      user: authUserId
    });
    await insertAndDispatchMessageEvent(c, updated, authUserId, {
      subtype: lifecycleEventType(updated, "archive"),
      text: `<@${authUserId}> archived the ${conversationNoun(updated)}`
    });
    return slackOk(c, {});
  });
  app.post("/api/conversations.unarchive", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    if (!channel) return slackError(c, "channel_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (isDirectConversation(ch)) return slackError(c, "method_not_supported_for_channel_type");
    if (!ch.is_archived) return slackError(c, "not_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    const isMember = isChannelMember(ch, authSlackUser, authUserId);
    if (ch.is_private && !isMember) return slackError(c, "not_in_channel");
    const members = isMember ? ch.members : [...ch.members, authUserId];
    const updated = ss().channels.update(ch.id, {
      is_archived: false,
      members,
      num_members: members.length
    });
    await dispatchConversationEvent(c, updated, lifecycleEventType(updated, "unarchive"), {
      channel: updated.channel_id,
      user: authUserId
    });
    await insertAndDispatchMessageEvent(c, updated, authUserId, {
      subtype: lifecycleEventType(updated, "unarchive"),
      text: `<@${authUserId}> unarchived the ${conversationNoun(updated)}`
    });
    return slackOk(c, {});
  });
  app.post("/api/conversations.rename", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const name = normalizeChannelName(typeof body.name === "string" ? body.name : "");
    if (!channel) return slackError(c, "channel_not_found");
    const nameError = validateChannelName(name);
    if (nameError) return slackError(c, nameError);
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (isDirectConversation(ch)) return slackError(c, "method_not_supported_for_channel_type");
    if (ch.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    if (ch.creator !== authUserId && ch.creator !== authUser.login && !authSlackUser?.is_admin) {
      return slackError(c, "not_authorized");
    }
    const existing = findNamedChannel(ss().channels.all(), name);
    if (existing && existing.id !== ch.id) return slackError(c, "name_taken");
    if (name === ch.name) return slackOk(c, { channel: formatChannel(ch, authUserId, authSlackUser?.name) });
    const oldName = ch.name;
    const updated = ss().channels.update(ch.id, { name });
    await dispatchConversationEvent(c, updated, lifecycleEventType(updated, "rename"), {
      channel: {
        id: updated.channel_id,
        name: updated.name,
        created: createdSeconds(updated)
      }
    });
    await insertAndDispatchMessageEvent(c, updated, authUserId, {
      subtype: lifecycleMessageSubtype(updated, "name"),
      text: `<@${authUserId}> renamed the ${conversationNoun(updated)} from "${oldName}" to "${updated.name}"`,
      old_name: oldName,
      name: updated.name
    });
    return slackOk(c, { channel: formatChannel(updated, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.setTopic", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const topic = typeof body.topic === "string" ? body.topic : void 0;
    if (!channel) return slackError(c, "channel_not_found");
    if (topic === void 0) return slackError(c, "invalid_arguments");
    if (topic.length > 250) return slackError(c, "too_long");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (isDirectConversation(ch)) return slackError(c, "method_not_supported_for_channel_type");
    if (ch.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const now = Math.floor(Date.now() / 1e3);
    const updated = ss().channels.update(ch.id, {
      topic: { value: topic, creator: authUserId, last_set: now }
    });
    await insertAndDispatchMessageEvent(c, updated, authUserId, {
      subtype: lifecycleMessageSubtype(updated, "topic"),
      text: `<@${authUserId}> set the ${conversationNoun(updated)} topic: ${topic}`,
      topic
    });
    return slackOk(c, { channel: formatChannel(updated, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.setPurpose", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const purpose = typeof body.purpose === "string" ? body.purpose : void 0;
    if (!channel) return slackError(c, "channel_not_found");
    if (purpose === void 0) return slackError(c, "invalid_arguments");
    if (purpose.length > 250) return slackError(c, "too_long");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (isDirectConversation(ch)) return slackError(c, "method_not_supported_for_channel_type");
    if (ch.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const now = Math.floor(Date.now() / 1e3);
    const updated = ss().channels.update(ch.id, {
      purpose: { value: purpose, creator: authUserId, last_set: now }
    });
    await insertAndDispatchMessageEvent(c, updated, authUserId, {
      subtype: lifecycleMessageSubtype(updated, "purpose"),
      text: `<@${authUserId}> set the ${conversationNoun(updated)} purpose: ${purpose}`,
      purpose
    });
    return slackOk(c, { purpose, channel: formatChannel(updated, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.history", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const limit = Math.min(Number(body.limit) || 100, 1e3);
    const cursor = typeof body.cursor === "string" ? body.cursor : "";
    if (!channel) return slackError(c, "channel_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationHistoryScope(ch)]);
    if (scopeError) return scopeError;
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const allMessages = ss().messages.findBy("channel_id", channel).filter((m) => !m.thread_ts || m.thread_ts === m.ts).sort((a, b) => b.ts > a.ts ? 1 : -1);
    let startIndex = 0;
    if (cursor) {
      const idx = allMessages.findIndex((m) => m.ts === cursor);
      if (idx >= 0) startIndex = idx;
    }
    const page = allMessages.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < allMessages.length;
    const nextCursor = hasMore ? allMessages[startIndex + limit].ts : "";
    return slackOk(c, {
      messages: page.map((message) => formatSlackMessageForAuth(message, authUser)),
      has_more: hasMore,
      response_metadata: { next_cursor: nextCursor }
    });
  });
  app.post("/api/conversations.replies", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ts = typeof body.ts === "string" ? body.ts : "";
    if (!channel || !ts) return slackError(c, "channel_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationHistoryScope(ch)]);
    if (scopeError) return scopeError;
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const allMessages = ss().messages.findBy("channel_id", channel).filter((m) => m.ts === ts || m.thread_ts === ts).sort((a, b) => a.ts > b.ts ? 1 : -1);
    return slackOk(c, {
      messages: allMessages.map((message) => formatSlackMessageForAuth(message, authUser)),
      has_more: false
    });
  });
  app.post("/api/conversations.join", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationJoinScope(ch)]);
    if (scopeError) return scopeError;
    if (ch.is_archived) return slackError(c, "is_archived");
    if (ch.is_im || ch.is_mpim) return slackError(c, "method_not_supported_for_channel_type");
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (ch.is_private && !isChannelMember(ch, authSlackUser, authUserId)) {
      return slackError(c, "not_in_channel");
    }
    const memberKey = getChannelMemberKey(ch, authSlackUser, authUserId);
    if (!memberKey) {
      const updated2 = ss().channels.update(ch.id, {
        members: [...ch.members, authUserId],
        num_members: ch.num_members + 1
      });
      await dispatchMemberJoined(c, updated2, authUserId);
    }
    const updated = ss().channels.findOneBy("channel_id", channel);
    return slackOk(c, { channel: formatChannel(updated, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.leave", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (ch.is_im) return slackError(c, "method_not_supported_for_channel_type");
    if (isGeneralChannel(ch)) return slackError(c, "cant_leave_general");
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    const memberKey = getChannelMemberKey(ch, authSlackUser, authUserId);
    if (!memberKey) return c.json({ ok: false, not_in_channel: true });
    const aliases = memberAliases(authSlackUser, authUserId);
    const updatedMembers = ch.members.filter((m) => !aliases.has(m));
    if (updatedMembers.length === 0) return slackError(c, "last_member");
    const updated = ss().channels.update(ch.id, {
      members: updatedMembers,
      num_members: updatedMembers.length
    });
    await dispatchMemberLeft(c, updated, authUserId);
    return slackOk(c, {});
  });
  app.post("/api/conversations.invite", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const users = parseUserList(body.users);
    if (!channel) return slackError(c, "channel_not_found");
    if (users.length === 0) return slackError(c, "user_not_found");
    if (users.length > 100) return slackError(c, "too_many_users");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (ch.is_archived) return slackError(c, "is_archived");
    if (ch.is_im) return slackError(c, "method_not_supported_for_channel_type");
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const errors = [];
    const validUsers = [];
    for (const userId of users) {
      const user = ss().users.findOneBy("user_id", userId);
      if (!user || user.deleted) {
        errors.push({ user: userId, ok: false, error: "user_not_found" });
      } else if (userId === authUserId) {
        errors.push({ user: userId, ok: false, error: "cant_invite_self" });
      } else if (isChannelMember(ch, user, userId)) {
        errors.push({ user: userId, ok: false, error: "already_in_channel" });
      } else {
        validUsers.push(userId);
      }
    }
    if (errors.length > 0) {
      return c.json({ ok: false, error: errors[0].error, errors });
    }
    const updatedMembers = [...ch.members, ...validUsers];
    const updated = ss().channels.update(ch.id, {
      members: updatedMembers,
      num_members: updatedMembers.length
    });
    for (const user of validUsers) {
      await dispatchMemberJoined(c, updated, user, authUserId);
    }
    return slackOk(c, { channel: formatChannel(updated, authUserId, authSlackUser?.name) });
  });
  app.post("/api/conversations.kick", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const user = typeof body.user === "string" ? body.user : "";
    if (!channel) return slackError(c, "channel_not_found");
    if (!user) return slackError(c, "user_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    if (ch.is_archived) return slackError(c, "is_archived");
    if (isGeneralChannel(ch)) return slackError(c, "cant_kick_from_general");
    if (ch.is_im) return slackError(c, "method_not_supported_for_channel_type");
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    if (user === authUserId) return slackError(c, "cant_kick_self");
    const targetUser = ss().users.findOneBy("user_id", user);
    if (!targetUser) return slackError(c, "user_not_found");
    const targetMemberKey = getChannelMemberKey(ch, targetUser, user);
    if (!targetMemberKey) return slackError(c, "user_not_in_channel");
    const targetAliases = memberAliases(targetUser, user);
    const updatedMembers = ch.members.filter((member) => !targetAliases.has(member));
    const updated = ss().channels.update(ch.id, {
      members: updatedMembers,
      num_members: updatedMembers.length
    });
    await dispatchMemberLeft(c, updated, user);
    return slackOk(c, { errors: {} });
  });
  app.post("/api/conversations.open", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const users = parseUserList(body.users);
    const returnIm = isTruthySlackBoolean(body.return_im);
    const preventCreation = isTruthySlackBoolean(body.prevent_creation);
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (channel) {
      const existing2 = ss().channels.findOneBy("channel_id", channel);
      if (!existing2 || !existing2.is_im && !existing2.is_mpim) return slackError(c, "channel_not_found");
      const scopeError2 = requireSlackScopes(c, store, [slackConversationWriteScope(existing2)]);
      if (scopeError2) return scopeError2;
      if (!isChannelMember(existing2, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
      const alreadyOpen = getSlackConversationOpenState(existing2, authUserId);
      const updated = alreadyOpen ? existing2 : ss().channels.update(existing2.id, setSlackConversationOpenState(existing2, authUserId, true));
      if (!alreadyOpen)
        await dispatchConversationEvent(c, updated, openEventType(updated), { channel: updated.channel_id });
      return slackOk(c, {
        ...alreadyOpen ? { no_op: true, already_open: true } : {},
        channel: returnIm ? formatChannel(updated, authUserId, authSlackUser?.name) : { id: updated.channel_id }
      });
    }
    if (users.length === 0) return slackError(c, "users_list_not_supplied");
    if (users.length > 8) return slackError(c, "too_many_users");
    const targetUsers = [];
    for (const userId of users) {
      if (userId === authUserId) continue;
      const user = ss().users.findOneBy("user_id", userId);
      if (!user || user.deleted) return slackError(c, "user_not_found");
      targetUsers.push(user);
    }
    if (targetUsers.length === 0) return slackError(c, "users_list_not_supplied");
    const memberIds = [.../* @__PURE__ */ new Set([authUserId, ...targetUsers.map((user) => user.user_id)])];
    const isMpim = memberIds.length > 2;
    const scopeError = requireSlackScopes(c, store, [isMpim ? "mpim:write" : "im:write"]);
    if (scopeError) return scopeError;
    const existing = findConversationByMembers(ss().channels.all(), memberIds, isMpim);
    if (existing) {
      const alreadyOpen = getSlackConversationOpenState(existing, authUserId);
      const updated = alreadyOpen ? existing : ss().channels.update(existing.id, setSlackConversationOpenState(existing, authUserId, true));
      if (!alreadyOpen)
        await dispatchConversationEvent(c, updated, openEventType(updated), { channel: updated.channel_id });
      return slackOk(c, {
        ...alreadyOpen ? { no_op: true, already_open: true } : {},
        channel: returnIm ? formatChannel(updated, authUserId, authSlackUser?.name) : { id: updated.channel_id }
      });
    }
    if (preventCreation) return slackError(c, "channel_not_found");
    const team = ss().teams.all()[0];
    const now = Math.floor(Date.now() / 1e3);
    const created = ss().channels.insert({
      channel_id: generateSlackId(isMpim ? "G" : "D"),
      team_id: team?.team_id ?? "T000000001",
      name: isMpim ? `mpdm-${targetUsers.map((user) => user.name).join("-")}` : targetUsers[0]?.name ?? "direct-message",
      is_channel: false,
      is_private: true,
      is_im: !isMpim,
      is_mpim: isMpim,
      is_open_by_user: { [authUserId]: true },
      user: isMpim ? void 0 : targetUsers[0]?.user_id,
      is_archived: false,
      topic: { value: "", creator: authUserId, last_set: now },
      purpose: { value: "", creator: authUserId, last_set: now },
      members: memberIds,
      creator: authUserId,
      num_members: memberIds.length,
      last_read: {}
    });
    await dispatchConversationEvent(c, created, created.is_im ? "im_created" : "group_joined", {
      channel: formatChannel(created, authUserId, authSlackUser?.name)
    });
    await dispatchConversationEvent(c, created, openEventType(created), { channel: created.channel_id });
    return slackOk(c, {
      channel: returnIm ? formatChannel(created, authUserId, authSlackUser?.name) : { id: created.channel_id }
    });
  });
  app.post("/api/conversations.close", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    if (!channel) return slackError(c, "channel_not_found");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch || !ch.is_im && !ch.is_mpim) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    if (!getSlackConversationOpenState(ch, authUserId)) {
      return slackOk(c, { no_op: true, already_closed: true });
    }
    const updated = ss().channels.update(ch.id, setSlackConversationOpenState(ch, authUserId, false));
    await dispatchConversationEvent(c, updated, closeEventType(updated), { channel: updated.channel_id });
    return slackOk(c, {});
  });
  app.post("/api/conversations.mark", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ts = typeof body.ts === "string" ? body.ts : "";
    if (!channel) return slackError(c, "channel_not_found");
    if (!ts) return slackError(c, "invalid_ts");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationWriteScope(ch)]);
    if (scopeError) return scopeError;
    const authUserId = getAuthUserId(authUser);
    const authSlackUser = getAuthSlackUser(authUser);
    if (!isChannelMember(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    ss().channels.update(ch.id, {
      last_read: { ...ch.last_read ?? {}, [authUserId]: ts }
    });
    await dispatchConversationEvent(c, ch, markEventType(ch), { channel: ch.channel_id, ts });
    return slackOk(c, {});
  });
  app.post("/api/conversations.members", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (!ch) return slackError(c, "channel_not_found");
    const scopeError = requireSlackScopes(c, store, [slackConversationReadScope(ch)]);
    if (scopeError) return scopeError;
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(ch, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    return slackOk(c, {
      members: ch.members,
      response_metadata: { next_cursor: "" }
    });
  });
}
function formatChannel(ch, viewer, viewerName) {
  const imUser = ch.is_im && viewer ? ch.members.find((member) => member !== viewer) : ch.user;
  const isMember = viewer ? ch.members.includes(viewer) || viewerName !== void 0 && ch.members.includes(viewerName) : void 0;
  return {
    id: ch.channel_id,
    name: ch.name,
    name_normalized: ch.name,
    is_channel: ch.is_channel,
    is_group: ch.is_private && !ch.is_im && !ch.is_mpim,
    is_im: ch.is_im ?? false,
    is_mpim: ch.is_mpim ?? false,
    is_private: ch.is_private,
    is_archived: ch.is_archived,
    is_open: getSlackConversationOpenState(ch, viewer),
    ...imUser ? { user: imUser } : {},
    is_member: viewer ? isMember : void 0,
    last_read: viewer ? ch.last_read?.[viewer] ?? "0000000000.000000" : void 0,
    topic: ch.topic,
    purpose: ch.purpose,
    creator: ch.creator,
    num_members: ch.num_members,
    created: createdSeconds(ch),
    ...formatSharedChannelFields(ch)
  };
}
function formatSharedChannelFields(ch) {
  const sharedTeamIds = ch.shared_team_ids ?? [];
  const isExtShared = sharedTeamIds.length > 1;
  return {
    is_shared: isExtShared,
    is_ext_shared: isExtShared,
    is_org_shared: false,
    context_team_id: ch.team_id,
    ...isExtShared ? {
      shared_team_ids: sharedTeamIds.filter((teamId) => teamId !== ch.team_id),
      connected_team_ids: sharedTeamIds,
      conversation_host_id: ch.team_id
    } : {}
  };
}
function createdSeconds(ch) {
  return Math.floor(new Date(ch.created_at).getTime() / 1e3);
}
function normalizeChannelName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}
function validateChannelName(name) {
  if (!name) return "invalid_name_required";
  if (name.length > 80) return "invalid_name_maxlength";
  if (!/[a-z0-9]/.test(name)) return "invalid_name_punctuation";
  if (!/^[a-z0-9_-]+$/.test(name)) return "invalid_name_specials";
  return void 0;
}
function isTruthySlackBoolean(value) {
  if (value === true || value === 1) return true;
  if (typeof value !== "string") return false;
  const normalized = value.toLowerCase();
  return normalized === "true" || normalized === "1";
}
function isGeneralChannel(ch) {
  return ch.channel_id === "C000000001" || ch.name === "general";
}
function isDirectConversation(ch) {
  return Boolean(ch.is_im || ch.is_mpim);
}
function lifecycleEventType(ch, action) {
  return `${conversationEventPrefix(ch)}_${action}`;
}
function lifecycleMessageSubtype(ch, action) {
  return `${conversationEventPrefix(ch)}_${action}`;
}
function conversationEventPrefix(ch) {
  return ch.is_private ? "group" : "channel";
}
function conversationNoun(ch) {
  return ch.is_private ? "group" : "channel";
}
function parseConversationTypes(value) {
  const raw = typeof value === "string" && value.length > 0 ? value : "public_channel";
  return new Set(
    raw.split(",").map((type) => type.trim()).filter(Boolean)
  );
}
function readScopesForConversationTypes(types) {
  const scopes = [];
  if (types.has("public_channel")) scopes.push("channels:read");
  if (types.has("private_channel")) scopes.push("groups:read");
  if (types.has("im")) scopes.push("im:read");
  if (types.has("mpim")) scopes.push("mpim:read");
  return scopes.length > 0 ? scopes : ["channels:read"];
}
function matchesConversationTypes(ch, types) {
  if (types.has("public_channel") && !ch.is_private && !ch.is_im && !ch.is_mpim) return true;
  if (types.has("private_channel") && ch.is_private && !ch.is_im && !ch.is_mpim) return true;
  if (types.has("im") && ch.is_im) return true;
  if (types.has("mpim") && ch.is_mpim) return true;
  return false;
}
function parseUserList(value) {
  const users = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(users.map((user) => String(user).trim()).filter(Boolean))];
}
function sameMembers(left, right) {
  if (left.length !== right.length) return false;
  const leftKey = [...left].sort().join(",");
  const rightKey = [...right].sort().join(",");
  return leftKey === rightKey;
}
function findConversationByMembers(channels, members, isMpim) {
  return channels.find(
    (ch) => Boolean(ch.is_mpim) === isMpim && Boolean(ch.is_im) === !isMpim && sameMembers(ch.members, members)
  );
}
function findNamedChannel(channels, name) {
  return channels.find((ch) => !ch.is_im && !ch.is_mpim && ch.name === name);
}
function fileChannels(file) {
  return [...file.channels, ...file.groups, ...file.ims];
}
function filterVisibleShares(shares, visibleIds) {
  const entries = Object.entries(shares ?? {}).filter(([channelId]) => visibleIds.has(channelId));
  return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
function channelTypeLetter(ch) {
  if (ch.is_im) return "D";
  if (ch.is_private || ch.is_mpim) return "G";
  return "C";
}
function openEventType(ch) {
  return ch.is_im ? "im_open" : "group_open";
}
function closeEventType(ch) {
  return ch.is_im ? "im_close" : "group_close";
}
function markEventType(ch) {
  if (ch.is_im) return "im_marked";
  if (ch.is_private || ch.is_mpim) return "group_marked";
  return "channel_marked";
}
function usersRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const ss = () => getSlackStore(store);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  app.post("/api/users.list", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const limit = Math.min(Number(body.limit) || 100, 1e3);
    const cursor = typeof body.cursor === "string" ? body.cursor : "";
    const allUsers = ss().users.all().filter((u) => !u.deleted);
    let startIndex = 0;
    if (cursor) {
      const idx = allUsers.findIndex((u) => u.user_id === cursor);
      if (idx >= 0) startIndex = idx;
    }
    const page = allUsers.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < allUsers.length ? allUsers[startIndex + limit].user_id : "";
    return slackOk(c, {
      members: page.map((user) => formatUser(user, canExposeEmail(c))),
      response_metadata: { next_cursor: nextCursor }
    });
  });
  app.post("/api/users.info", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const userId = typeof body.user === "string" ? body.user : "";
    const user = ss().users.findOneBy("user_id", userId);
    if (!user) return slackError(c, "user_not_found");
    return slackOk(c, { user: formatUser(user, canExposeEmail(c)) });
  });
  app.post("/api/users.lookupByEmail", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:read.email"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const email = typeof body.email === "string" ? body.email : "";
    if (!email) return slackError(c, "users_not_found");
    const user = ss().users.findOneBy("email", email);
    if (!user) return slackError(c, "users_not_found");
    return slackOk(c, { user: formatUser(user, true) });
  });
  async function profileGet(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users.profile:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackRequest(c);
    const requestedUserId = typeof body.user === "string" && body.user ? body.user : getAuthUserId(authUser);
    const user = ss().users.findOneBy("user_id", requestedUserId);
    if (!user || user.deleted) return slackError(c, "user_not_found");
    return slackOk(c, { profile: formatProfile(user.profile, canExposeEmail(c)) });
  }
  async function profileSet(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users.profile:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const requestedUserId = typeof body.user === "string" && body.user ? body.user : getAuthUserId(authUser);
    const user = ss().users.findOneBy("user_id", requestedUserId);
    if (!user || user.deleted) return slackError(c, "user_not_found");
    const updates = parseProfileUpdates(body);
    if (!updates) return slackError(c, "invalid_arguments");
    const nextProfile = mergeProfile(user.profile, updates);
    const userUpdates = { profile: nextProfile };
    if (updates.real_name !== void 0) userUpdates.real_name = nextProfile.real_name;
    if (updates.email !== void 0) userUpdates.email = nextProfile.email;
    const updated = ss().users.update(user.id, userUpdates);
    await webhooks.dispatch(
      "user_change",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, updated.team_id), {
        type: "user_change",
        user: formatUser(updated),
        cache_ts: Number(generateTs().replace(".", ""))
      }),
      "slack"
    );
    return slackOk(c, { profile: formatProfile(updated.profile, canExposeEmail(c)) });
  }
  async function getPresence(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackRequest(c);
    const authUserId = getAuthUserId(authUser);
    const requestedUserId = typeof body.user === "string" && body.user ? body.user : authUserId;
    const user = ss().users.findOneBy("user_id", requestedUserId);
    if (!user || user.deleted) return slackError(c, "user_not_found");
    const presence = user.presence ?? "active";
    if (requestedUserId !== authUserId) {
      return slackOk(c, { presence });
    }
    const manualPresence = user.manual_presence ?? (presence === "away" ? "away" : "auto");
    return slackOk(c, {
      presence,
      online: presence === "active",
      auto_away: false,
      manual_away: manualPresence === "away",
      connection_count: user.connection_count ?? (presence === "active" ? 1 : 0),
      ...user.last_activity ? { last_activity: user.last_activity } : {}
    });
  }
  async function setPresence(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const presence = typeof body.presence === "string" ? body.presence : "";
    if (presence !== "auto" && presence !== "away") return slackError(c, "invalid_presence");
    const authUserId = getAuthUserId(authUser);
    const user = ss().users.findOneBy("user_id", authUserId);
    if (!user || user.deleted) return slackError(c, "user_not_found");
    const now = Math.floor(Date.now() / 1e3);
    const nextPresence = presence === "away" ? "away" : "active";
    const manualPresence = presence === "away" ? "away" : "auto";
    const updated = ss().users.update(user.id, {
      presence: nextPresence,
      manual_presence: manualPresence,
      connection_count: nextPresence === "active" ? 1 : 0,
      last_activity: nextPresence === "active" ? now : user.last_activity
    });
    await webhooks.dispatch(
      "presence_change",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, updated.team_id), {
        type: "presence_change",
        user: updated.user_id,
        presence: nextPresence
      }),
      "slack"
    );
    return slackOk(c, {});
  }
  function canExposeEmail(c) {
    return !isSlackStrictScopes(store) || hasSlackScope(c, "users:read.email");
  }
  app.get("/api/users.profile.get", profileGet);
  app.post("/api/users.profile.get", profileGet);
  app.post("/api/users.profile.set", profileSet);
  app.get("/api/users.getPresence", getPresence);
  app.post("/api/users.getPresence", getPresence);
  app.post("/api/users.setPresence", setPresence);
}
function formatUser(u, includeEmail = true) {
  const profile = formatProfile(u.profile, includeEmail);
  return {
    id: u.user_id,
    team_id: u.team_id,
    name: u.name,
    real_name: u.real_name,
    is_admin: u.is_admin,
    is_bot: u.is_bot,
    deleted: u.deleted,
    profile
  };
}
function formatProfile(profile, includeEmail = true) {
  const formatted = normalizeProfile(profile);
  return includeEmail ? formatted : omitEmail(formatted);
}
function normalizeProfile(profile) {
  return {
    title: "",
    phone: "",
    skype: "",
    ...profile,
    real_name_normalized: profile.real_name_normalized ?? profile.real_name,
    display_name_normalized: profile.display_name_normalized ?? profile.display_name,
    status_text: profile.status_text ?? "",
    status_emoji: profile.status_emoji ?? "",
    status_emoji_display_info: profile.status_emoji_display_info ?? [],
    status_expiration: profile.status_expiration ?? 0,
    huddle_state: profile.huddle_state ?? "default_unset",
    huddle_state_expiration_ts: profile.huddle_state_expiration_ts ?? 0
  };
}
function omitEmail(profile) {
  const { email: _email, ...rest } = profile;
  return rest;
}
async function parseSlackRequest(c) {
  if (c.req.method === "GET") {
    return Object.fromEntries(new URL(c.req.url).searchParams.entries());
  }
  return parseSlackBody(c);
}
function parseProfileUpdates(body) {
  const profile = parseProfileObject(body.profile);
  if (profile) return profile;
  const name = typeof body.name === "string" ? body.name : "";
  if (!name) return void 0;
  if (!Object.prototype.hasOwnProperty.call(body, "value")) return void 0;
  return { [name]: String(body.value ?? "") };
}
function parseProfileObject(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isProfileObject(parsed) ? parsed : void 0;
    } catch {
      return void 0;
    }
  }
  return isProfileObject(value) ? value : void 0;
}
function isProfileObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function mergeProfile(profile, updates) {
  const next = normalizeProfile({ ...profile, ...updates });
  if (updates.real_name !== void 0) {
    next.real_name = String(updates.real_name);
    next.real_name_normalized = next.real_name;
    const [firstName = "", ...rest] = next.real_name.trim().split(/\s+/);
    next.first_name = firstName;
    next.last_name = rest.join(" ");
  }
  if (updates.display_name !== void 0) {
    next.display_name = String(updates.display_name);
    next.display_name_normalized = next.display_name;
  }
  if (updates.email !== void 0) {
    next.email = String(updates.email);
  }
  if (updates.fields !== void 0) {
    next.fields = updates.fields;
  }
  return next;
}
function reactionsRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const ss = () => getSlackStore(store);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const getAuthUserAliases = (authUser) => {
    const user = getAuthSlackUser(authUser);
    return new Set([authUser.login, user?.user_id, user?.name].filter((value) => Boolean(value)));
  };
  const isAuthChannelMember = (channel, authUser) => {
    const user = getAuthSlackUser(authUser);
    const userId = user?.user_id ?? authUser.login;
    return channel.members.includes(userId) || (user ? channel.members.includes(user.name) : false);
  };
  const canAccessConversation = (channel, authUser) => !channel.is_private || isAuthChannelMember(channel, authUser);
  app.post("/api/reactions.add", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["reactions:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : "";
    const name = typeof body.name === "string" ? body.name : "";
    if (!name) return slackError(c, "invalid_name");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === timestamp && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    const reactions = [...msg.reactions];
    const existing = reactions.find((r) => r.name === name);
    const authUserId = getAuthUserId(authUser);
    const aliases = getAuthUserAliases(authUser);
    if (existing) {
      if (existing.users.some((user) => aliases.has(user))) {
        return slackError(c, "already_reacted");
      }
      existing.users.push(authUserId);
      existing.count++;
    } else {
      reactions.push({ name, users: [authUserId], count: 1 });
    }
    ss().messages.update(msg.id, { reactions });
    await webhooks.dispatch(
      "reaction_added",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, ch?.team_id), {
        type: "reaction_added",
        user: authUserId,
        reaction: name,
        item: { type: "message", channel, ts: timestamp }
      }),
      "slack"
    );
    return slackOk(c, {});
  });
  app.post("/api/reactions.remove", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["reactions:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : "";
    const name = typeof body.name === "string" ? body.name : "";
    if (!name) return slackError(c, "invalid_name");
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === timestamp && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    const reactions = [...msg.reactions];
    const existing = reactions.find((r) => r.name === name);
    const authUserId = getAuthUserId(authUser);
    const aliases = getAuthUserAliases(authUser);
    if (!existing || !existing.users.some((user) => aliases.has(user))) {
      return slackError(c, "no_reaction");
    }
    existing.users = existing.users.filter((u) => !aliases.has(u));
    existing.count = existing.users.length;
    const filtered = reactions.filter((r) => r.count > 0);
    ss().messages.update(msg.id, { reactions: filtered });
    await webhooks.dispatch(
      "reaction_removed",
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, ch?.team_id), {
        type: "reaction_removed",
        user: authUserId,
        reaction: name,
        item: { type: "message", channel, ts: timestamp }
      }),
      "slack"
    );
    return slackOk(c, {});
  });
  app.post("/api/reactions.get", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["reactions:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : "";
    const ch = ss().channels.findOneBy("channel_id", channel);
    if (ch && !canAccessConversation(ch, authUser)) return slackError(c, "not_in_channel");
    const msg = ss().messages.all().find((m) => m.ts === timestamp && m.channel_id === channel);
    if (!msg) return slackError(c, "message_not_found");
    return slackOk(c, {
      type: "message",
      message: { ...formatSlackMessage(msg), reactions: msg.reactions }
    });
  });
}
function teamRoutes(ctx) {
  const { app, store } = ctx;
  const ss = () => getSlackStore(store);
  app.post("/api/team.info", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["team:read"]);
    if (scopeError) return scopeError;
    const team = ss().teams.all()[0];
    if (!team) return slackError(c, "team_not_found");
    return slackOk(c, {
      team: {
        id: team.team_id,
        name: team.name,
        domain: team.domain
      }
    });
  });
  app.post("/api/bots.info", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["users:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const botId = typeof body.bot === "string" ? body.bot : "";
    const bot = ss().bots.findOneBy("bot_id", botId);
    if (!bot) return slackError(c, "bot_not_found");
    return slackOk(c, {
      bot: {
        id: bot.bot_id,
        name: bot.name,
        deleted: bot.deleted,
        icons: bot.icons
      }
    });
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
function debug(label, ...args) {
  if (isDebug) {
    console.log(`[${label}]`, ...args);
  }
}
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
function renderErrorPage(title, message, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner error-card">
    <div class="error-title">${escapeHtml(title)}</div>
    <div class="error-msg">${escapeHtml(message)}</div>
  </div>
</div>
${POWERED_BY}
</body></html>`;
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
function renderUserButton(opts) {
  const hiddens = Object.entries(opts.hiddenFields).map(([k, v]) => `<input type="hidden" name="${escapeAttr(k)}" value="${escapeAttr(v)}"/>`).join("");
  const nameLine = opts.name ? `<div class="user-meta">${escapeHtml(opts.name)}</div>` : "";
  const emailLine = opts.email ? `<div class="user-email">${escapeHtml(opts.email)}</div>` : "";
  return `<form class="user-form" method="post" action="${escapeAttr(opts.formAction)}">
${hiddens}
<button type="submit" class="user-btn">
  <span class="avatar">${escapeHtml(opts.letter)}</span>
  <span class="user-text">
    <span class="user-login">${escapeHtml(opts.login)}</span>
    ${nameLine}${emailLine}
  </span>
</button>
</form>`;
}
function normalizeUri(uri) {
  try {
    const u = new URL(uri);
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return uri.replace(/\/+$/, "").split("?")[0];
  }
}
function matchesRedirectUri(incoming, registered) {
  const normalized = normalizeUri(incoming);
  return registered.some((r) => normalizeUri(r) === normalized);
}
function constantTimeSecretEqual(a, b) {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
function bodyStr(v) {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}
var PENDING_CODE_TTL_MS = 10 * 60 * 1e3;
var SERVICE_LABEL = "Slack";
function getPendingCodes(store) {
  let map = store.getData("slack.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("slack.oauth.pendingCodes", map);
  }
  return map;
}
function isPendingCodeExpired(p) {
  return Date.now() - p.created_at > PENDING_CODE_TTL_MS;
}
function oauthRoutes({ app, store, tokenMap }) {
  const ss = () => getSlackStore(store);
  app.get("/oauth/v2/authorize", (c) => {
    const client_id = c.req.query("client_id") ?? "";
    const redirect_uri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const user_scope = c.req.query("user_scope") ?? "";
    const state = c.req.query("state") ?? "";
    const appsConfigured = ss().oauthApps.all().length > 0;
    let appName = "";
    if (appsConfigured) {
      const oauthApp = ss().oauthApps.findOneBy("client_id", client_id);
      if (!oauthApp) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${client_id}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (redirect_uri && !matchesRedirectUri(redirect_uri, oauthApp.redirect_uris)) {
        return c.html(
          renderErrorPage(
            "Redirect URI mismatch",
            "The redirect_uri is not registered for this application.",
            SERVICE_LABEL
          ),
          400
        );
      }
      appName = oauthApp.name;
    }
    const subtitleText = appName ? `Authorize <strong>${escapeHtml(appName)}</strong> to access your Slack workspace.` : "Choose a user to authorize.";
    const users = ss().users.all().filter((u) => !u.deleted && !u.is_bot);
    const userButtons = users.map((user) => {
      return renderUserButton({
        letter: (user.name[0] ?? "?").toUpperCase(),
        login: user.name,
        name: user.real_name,
        email: user.email,
        formAction: "/oauth/v2/authorize/callback",
        hiddenFields: {
          user_id: user.user_id,
          redirect_uri,
          scope,
          user_scope,
          state,
          client_id
        }
      });
    }).join("\n");
    const body = users.length === 0 ? '<p class="empty">No users in the emulator store.</p>' : userButtons;
    return c.html(renderCardPage("Sign in to Slack", subtitleText, body, SERVICE_LABEL));
  });
  app.post("/oauth/v2/authorize/callback", async (c) => {
    const body = await c.req.parseBody();
    const userId = bodyStr(body.user_id);
    const redirect_uri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope);
    const userScope = bodyStr(body.user_scope);
    const state = bodyStr(body.state);
    const client_id = bodyStr(body.client_id);
    const code = randomBytes2(20).toString("hex");
    getPendingCodes(store).set(code, {
      userId,
      scope,
      userScope,
      redirectUri: redirect_uri,
      clientId: client_id,
      created_at: Date.now()
    });
    debug("slack.oauth", `[Slack callback] code=${code.slice(0, 8)}... user=${userId}`);
    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  });
  app.post("/api/oauth.v2.access", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    const rawText = await c.req.text();
    let body;
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText);
      } catch {
        body = {};
      }
    } else {
      body = Object.fromEntries(new URLSearchParams(rawText));
    }
    const code = typeof body.code === "string" ? body.code : "";
    const basicAuth = parseBasicAuth(c.req.header("Authorization"));
    const client_id = typeof body.client_id === "string" ? body.client_id : basicAuth?.clientId ?? "";
    const client_secret = typeof body.client_secret === "string" ? body.client_secret : basicAuth?.clientSecret ?? "";
    const redirect_uri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
    const appsConfigured = ss().oauthApps.all().length > 0;
    let oauthApp;
    if (appsConfigured) {
      oauthApp = ss().oauthApps.findOneBy("client_id", client_id);
      if (!oauthApp) {
        return c.json({ ok: false, error: "invalid_client_id" });
      }
      if (!constantTimeSecretEqual(client_secret, oauthApp.client_secret)) {
        return c.json({ ok: false, error: "invalid_client_id" });
      }
    }
    const pendingMap = getPendingCodes(store);
    const pending = pendingMap.get(code);
    if (!pending) {
      return c.json({ ok: false, error: "invalid_code" });
    }
    if (isPendingCodeExpired(pending)) {
      pendingMap.delete(code);
      return c.json({ ok: false, error: "invalid_code" });
    }
    pendingMap.delete(code);
    if (client_id && pending.clientId && client_id !== pending.clientId) {
      return c.json({ ok: false, error: "invalid_client_id" });
    }
    if (redirect_uri && pending.redirectUri && redirect_uri !== pending.redirectUri) {
      return c.json({ ok: false, error: "bad_redirect_uri" });
    }
    const user = ss().users.findOneBy("user_id", pending.userId);
    if (!user) {
      return c.json({ ok: false, error: "invalid_code" });
    }
    const accessToken = "xoxb-" + randomBytes2(20).toString("base64url");
    const userAccessToken = "xoxp-" + randomBytes2(20).toString("base64url");
    const team = ss().teams.all()[0];
    const teamId = team?.team_id ?? "T000000001";
    const appId = ensureOAuthAppId(ss(), oauthApp, client_id || pending.clientId);
    const requestedScopes = normalizeScopes(pending.scope, oauthApp?.scopes ?? ["chat:write", "channels:read"]);
    const userScopes = pending.userScope ? normalizeScopes(pending.userScope, []) : [];
    const bot = ensureBotForApp(ss(), oauthApp, appId, teamId);
    const installation = upsertInstallation(ss(), {
      appId,
      clientId: client_id || pending.clientId,
      teamId,
      appName: oauthApp?.name ?? "Slack App",
      installerUserId: user.user_id,
      bot,
      scopes: requestedScopes,
      userScopes
    });
    ss().tokens.insert({
      token: accessToken,
      token_type: "bot",
      team_id: teamId,
      user_id: bot.user.user_id,
      scopes: requestedScopes,
      app_id: appId,
      client_id: client_id || pending.clientId,
      installation_id: installation.installation_id,
      bot_id: bot.bot.bot_id,
      bot_user_id: bot.user.user_id,
      authed_user_id: user.user_id
    });
    if (tokenMap) {
      tokenMap.set(accessToken, { login: bot.user.user_id, id: bot.user.id, scopes: requestedScopes });
    }
    if (userScopes.length > 0) {
      ss().tokens.insert({
        token: userAccessToken,
        token_type: "user",
        team_id: teamId,
        user_id: user.user_id,
        scopes: userScopes,
        app_id: appId,
        client_id: client_id || pending.clientId,
        installation_id: installation.installation_id,
        bot_id: bot.bot.bot_id,
        bot_user_id: bot.user.user_id,
        authed_user_id: user.user_id
      });
      tokenMap?.set(userAccessToken, { login: user.user_id, id: user.id, scopes: userScopes });
    }
    debug("slack.oauth", `[Slack token] issued token for ${oauthApp?.name ?? "Slack App"} as ${bot.user.name}`);
    return c.json({
      ok: true,
      access_token: accessToken,
      token_type: "bot",
      scope: requestedScopes.join(","),
      bot_user_id: bot.user.user_id,
      app_id: appId,
      team: {
        id: teamId,
        name: team?.name ?? "Emulate"
      },
      enterprise: null,
      is_enterprise_install: false,
      authed_user: {
        id: user.user_id,
        ...userScopes.length > 0 ? { scope: userScopes.join(","), access_token: userAccessToken, token_type: "user" } : {}
      }
    });
  });
}
function parseBasicAuth(value) {
  if (!value?.startsWith("Basic ")) return void 0;
  try {
    const decoded = Buffer.from(value.slice("Basic ".length), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return void 0;
    return {
      clientId: decoded.slice(0, separator),
      clientSecret: decoded.slice(separator + 1)
    };
  } catch {
    return void 0;
  }
}
function ensureOAuthAppId(ss, oauthApp, fallback) {
  if (!oauthApp) return fallback || generateSlackId("A");
  if (oauthApp.app_id) return oauthApp.app_id;
  const appId = generateSlackId("A");
  ss.oauthApps.update(oauthApp.id, { app_id: appId });
  return appId;
}
function ensureBotForApp(ss, oauthApp, appId, teamId) {
  const botId = oauthApp?.bot_id ?? generateSlackId("B");
  const botUserId = oauthApp?.bot_user_id ?? generateSlackId("U");
  const botName = oauthApp?.bot_name ?? slugifyBotName(oauthApp?.name ?? "Slack App");
  if (oauthApp && (!oauthApp.bot_id || !oauthApp.bot_user_id || !oauthApp.bot_name)) {
    ss.oauthApps.update(oauthApp.id, {
      bot_id: botId,
      bot_user_id: botUserId,
      bot_name: botName
    });
  }
  const existingBot = ss.bots.findOneBy("bot_id", botId);
  const bot = existingBot ?? ss.bots.insert({
    bot_id: botId,
    app_id: appId,
    user_id: botUserId,
    name: botName,
    deleted: false,
    icons: { image_48: "" }
  });
  if (existingBot && (existingBot.app_id !== appId || existingBot.user_id !== botUserId)) {
    ss.bots.update(existingBot.id, { app_id: appId, user_id: botUserId });
  }
  const existingUser = ss.users.findOneBy("user_id", botUserId);
  const user = existingUser ?? ss.users.insert({
    user_id: botUserId,
    team_id: teamId,
    name: botName,
    real_name: oauthApp?.name ?? botName,
    email: `${botName}@bots.emulate.dev`,
    is_admin: false,
    is_bot: true,
    deleted: false,
    profile: {
      display_name: botName,
      real_name: oauthApp?.name ?? botName,
      email: `${botName}@bots.emulate.dev`,
      image_48: "",
      image_192: "",
      real_name_normalized: oauthApp?.name ?? botName,
      display_name_normalized: botName,
      status_text: "",
      status_emoji: "",
      status_emoji_display_info: [],
      status_expiration: 0
    },
    presence: "active",
    manual_presence: "auto",
    connection_count: 1,
    last_activity: Math.floor(Date.now() / 1e3)
  });
  return {
    bot: ss.bots.findOneBy("bot_id", bot.bot_id) ?? bot,
    user
  };
}
function upsertInstallation(ss, input) {
  const existing = ss.installations.all().find((item) => item.app_id === input.appId && item.team_id === input.teamId);
  const data = {
    app_id: input.appId,
    client_id: input.clientId,
    team_id: input.teamId,
    app_name: input.appName,
    installer_user_id: input.installerUserId,
    bot_id: input.bot.bot.bot_id,
    bot_user_id: input.bot.user.user_id,
    scopes: input.scopes,
    user_scopes: input.userScopes
  };
  if (existing) {
    return ss.installations.update(existing.id, data);
  }
  return ss.installations.insert({
    installation_id: generateSlackId("I"),
    ...data
  });
}
function normalizeScopes(value, fallback) {
  if (!value) return [...fallback];
  return value.split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean);
}
function slugifyBotName(value) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "slack-app";
}
function webhookRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const ss = () => getSlackStore(store);
  const findChannel = (channel) => ss().channels.findOneBy("channel_id", channel) ?? ss().channels.all().find((ch) => !ch.is_im && !ch.is_mpim && ch.name === channel);
  app.post("/services/:teamId/:botId/:token", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    const rawText = await c.req.text();
    let body;
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText);
      } catch {
        return c.text("invalid_payload", 400);
      }
    } else {
      const params = new URLSearchParams(rawText);
      const payload = params.get("payload");
      if (payload) {
        try {
          body = JSON.parse(payload);
        } catch {
          return c.text("invalid_payload", 400);
        }
      } else {
        body = {};
      }
    }
    const text = typeof body.text === "string" ? body.text : "";
    const normalizedText = normalizeSlackMessageText(text);
    const channelName = typeof body.channel === "string" ? body.channel : "";
    const threadTs = typeof body.thread_ts === "string" ? body.thread_ts : void 0;
    const richMessage = parseSlackRichMessageFields(body);
    if (richMessage.error) {
      return c.text(richMessage.error, 400);
    }
    if (!hasSlackMessageContent(text, richMessage.fields)) {
      return c.text("no_text", 400);
    }
    const webhook = ss().incomingWebhooks.all().find((w) => w.token === c.req.param("token"));
    let targetChannel = channelName ? findChannel(channelName) : null;
    if (!targetChannel && webhook) {
      targetChannel = findChannel(webhook.default_channel);
    }
    if (!targetChannel) {
      targetChannel = findChannel("general");
    }
    if (!targetChannel) {
      return c.text("channel_not_found", 404);
    }
    const ts = generateTs();
    const botId = c.req.param("botId");
    const msg = ss().messages.insert({
      ts,
      channel_id: targetChannel.channel_id,
      user: botId,
      text: normalizedText.text,
      type: "message",
      subtype: "bot_message",
      thread_ts: threadTs,
      ...richMessage.fields,
      bot_id: botId,
      reply_count: 0,
      reply_users: [],
      reactions: []
    });
    const { user: _user, ...eventMessage } = formatSlackMessage(msg);
    await webhooks.dispatch(
      "message",
      void 0,
      buildSlackEventEnvelope(
        webhook?.team_id ?? targetChannel.team_id,
        {
          ...eventMessage,
          type: "message",
          subtype: "bot_message",
          channel: targetChannel.channel_id,
          channel_type: slackMessageChannelType(targetChannel),
          ...slackMessageTeamFields(store, targetChannel),
          bot_id: botId
        },
        targetChannel
      ),
      "slack"
    );
    await dispatchSlackAppMention(webhooks, store, webhook?.team_id ?? targetChannel.team_id, targetChannel, {
      ...eventMessage,
      subtype: "bot_message",
      bot_id: botId
    });
    return c.text("ok");
  });
}
function filesRoutes(ctx) {
  const { app, store, webhooks, baseUrl } = ctx;
  const ss = () => getSlackStore(store);
  const serviceBaseUrl = baseUrl.replace(/\/$/, "");
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const isChannelMember = (channel, user, userId) => channel.members.includes(userId) || (user ? channel.members.includes(user.name) : false);
  const canReadConversation = (channel, user, userId) => !channel.is_private || isChannelMember(channel, user, userId);
  const visibleFileChannelIds = (file, authUser) => {
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = authSlackUser?.user_id ?? authUser.login;
    return fileChannels2(file).filter((channelId) => {
      const channel = ss().channels.findOneBy("channel_id", channelId);
      return channel ? canReadConversation(channel, authSlackUser, authUserId) : false;
    });
  };
  const canAccessFile = (file, authUser) => {
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = authSlackUser?.user_id ?? authUser.login;
    if (file.user === authUserId || authSlackUser && file.user === authSlackUser.name) return true;
    return visibleFileChannelIds(file, authUser).length > 0;
  };
  const canAccessFileInChannel = (file, authUser, channelId) => {
    return visibleFileChannelIds(file, authUser).includes(channelId);
  };
  const formatSlackFileForAuth = (file, authUser) => {
    const visibleIds = new Set(visibleFileChannelIds(file, authUser));
    const publicShares = filterVisibleShares2(file.shares.public, visibleIds);
    const privateShares = filterVisibleShares2(file.shares.private, visibleIds);
    const shares = {};
    if (publicShares) shares.public = publicShares;
    if (privateShares) shares.private = privateShares;
    return formatSlackFile({
      ...file,
      channels: file.channels.filter((channelId) => visibleIds.has(channelId)),
      groups: file.groups.filter((channelId) => visibleIds.has(channelId)),
      ims: file.ims.filter((channelId) => visibleIds.has(channelId)),
      shares
    });
  };
  const canDeleteFile = (file, authUser) => {
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = authSlackUser?.user_id ?? authUser.login;
    return file.user === authUserId || authSlackUser?.is_admin === true;
  };
  const findChannel = (channel) => ss().channels.findOneBy("channel_id", channel) ?? ss().channels.all().find((ch) => !ch.is_im && !ch.is_mpim && ch.name === channel);
  const findDirectMessage = (authUserId, userId) => {
    const members = [authUserId, userId].sort();
    return ss().channels.all().find(
      (ch) => ch.is_im && ch.members.length === members.length && [...ch.members].sort().join(",") === members.join(",")
    );
  };
  const findOrCreateDirectMessage = (authUser, userId) => {
    const targetUser = ss().users.findOneBy("user_id", userId);
    if (!targetUser || targetUser.deleted) return void 0;
    const authUserId = getAuthUserId(authUser);
    if (targetUser.user_id === authUserId) return void 0;
    const members = [authUserId, targetUser.user_id].sort();
    const existing = findDirectMessage(authUserId, targetUser.user_id);
    if (existing) return existing;
    const team = ss().teams.all()[0];
    const now = Math.floor(Date.now() / 1e3);
    return ss().channels.insert({
      channel_id: generateSlackId("D"),
      team_id: team?.team_id ?? "T000000001",
      name: targetUser.name,
      is_channel: false,
      is_private: true,
      is_im: true,
      is_mpim: false,
      is_open_by_user: { [authUserId]: true },
      user: targetUser.user_id,
      is_archived: false,
      topic: { value: "", creator: authUserId, last_set: now },
      purpose: { value: "", creator: authUserId, last_set: now },
      members,
      creator: authUserId,
      num_members: members.length,
      last_read: {}
    });
  };
  const resolveShareTarget = (authUser, channel) => {
    const existingChannel = findChannel(channel);
    if (existingChannel) return { key: existingChannel.channel_id, channel: existingChannel };
    if (!channel.startsWith("U")) return void 0;
    const targetUser = ss().users.findOneBy("user_id", channel);
    if (!targetUser || targetUser.deleted) return void 0;
    const authUserId = getAuthUserId(authUser);
    if (targetUser.user_id === authUserId) return void 0;
    const existingDirectMessage = findDirectMessage(authUserId, targetUser.user_id);
    if (existingDirectMessage) return { key: existingDirectMessage.channel_id, channel: existingDirectMessage };
    return { key: `user:${targetUser.user_id}`, directUserId: targetUser.user_id };
  };
  app.post("/api/files.getUploadURLExternal", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["files:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    const length = Number(body.length);
    const altTxt = typeof body.alt_text === "string" ? body.alt_text : void 0;
    const snippetType = typeof body.snippet_type === "string" ? body.snippet_type : void 0;
    if (!filename || !Number.isFinite(length) || length < 0) return slackError(c, "invalid_arguments");
    const team = ss().teams.all()[0];
    const fileId = generateSlackId("F");
    const uploadUrl = `${serviceBaseUrl}/upload/v1/${fileId}`;
    ss().fileUploadSessions.insert({
      file_id: fileId,
      team_id: team?.team_id ?? "T000000001",
      user: getAuthUserId(authUser),
      filename,
      title: filename,
      length: Math.floor(length),
      upload_url: uploadUrl,
      alt_txt: altTxt,
      snippet_type: snippetType,
      uploaded: false,
      completed: false
    });
    return slackOk(c, { upload_url: uploadUrl, file_id: fileId });
  });
  app.post("/upload/v1/:fileId", async (c) => {
    const session = ss().fileUploadSessions.findOneBy("file_id", c.req.param("fileId"));
    if (!session || session.completed) return c.text("file_not_found", 404);
    const data = await readUploadBytes(c);
    if (!data) return c.text("invalid_upload", 400);
    ss().fileUploadSessions.update(session.id, {
      uploaded: true,
      uploaded_size: data.byteLength,
      content_base64: data.toString("base64")
    });
    return c.text("OK");
  });
  app.post("/api/files.completeUploadExternal", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["files:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const requestedFiles = parseCompleteFiles(body.files);
    if (!requestedFiles || requestedFiles.length === 0) return slackError(c, "invalid_arguments");
    if (new Set(requestedFiles.map((file) => file.id)).size !== requestedFiles.length) {
      return slackError(c, "invalid_arguments");
    }
    const authUserId = getAuthUserId(authUser);
    const initialCommentText = typeof body.initial_comment === "string" ? body.initial_comment : "";
    const normalizedInitialComment = normalizeSlackMessageText(initialCommentText);
    const initialComment = normalizedInitialComment.text;
    const threadTs = typeof body.thread_ts === "string" ? body.thread_ts : void 0;
    const blocks = initialComment ? void 0 : parseBlocks(body.blocks);
    if (!initialComment && body.blocks !== void 0 && blocks === void 0) return slackError(c, "invalid_blocks");
    const requestedSessions = [];
    for (const requestedFile of requestedFiles) {
      const session = ss().fileUploadSessions.findOneBy("file_id", requestedFile.id);
      if (!session || !session.uploaded || session.completed || session.user !== authUserId) {
        return slackError(c, "file_not_found");
      }
      requestedSessions.push(session);
    }
    const rawChannelIds = parseDestinationChannels(body.channel_id, body.channels);
    const targetRefs = [];
    const targetKeys = /* @__PURE__ */ new Set();
    for (const channelId of rawChannelIds) {
      const target = resolveShareTarget(authUser, channelId);
      if (!target) return slackError(c, "channel_not_found");
      if (target.channel?.is_archived) return slackError(c, "is_archived");
      if (target.channel && !canReadConversation(target.channel, getAuthSlackUser(authUser), authUserId)) {
        return slackError(c, "not_in_channel");
      }
      if (!targetKeys.has(target.key)) {
        targetKeys.add(target.key);
        targetRefs.push(target);
      }
    }
    const targets = [];
    for (const target of targetRefs) {
      const channel = target.channel ?? findOrCreateDirectMessage(authUser, target.directUserId ?? "");
      if (!channel) return slackError(c, "channel_not_found");
      targets.push(channel);
    }
    const completedFiles = [];
    for (let index = 0; index < requestedFiles.length; index++) {
      const requestedFile = requestedFiles[index];
      const session = requestedSessions[index];
      const file = ss().files.insert(
        buildSlackFile(session, {
          title: requestedFile.title ?? session.title,
          user: authUserId,
          baseUrl: serviceBaseUrl,
          initialComment,
          threadTs
        })
      );
      ss().fileUploadSessions.update(session.id, { completed: true });
      await dispatchFileEvent(webhooks, "file_created", file, resolveSlackEventTeamId(c, store, file.team_id));
      completedFiles.push(file);
    }
    const sharedFiles = targets.length > 0 ? await shareFiles(targets, completedFiles) : completedFiles;
    return slackOk(c, {
      files: sharedFiles.map((file) => formatSlackFileForAuth(file, authUser)),
      ...slackMessageTextResponseMetadata(normalizedInitialComment)
    });
    async function shareFiles(channels, files) {
      const updatedFiles = [...files];
      for (const channel of channels) {
        const msg = ss().messages.insert({
          ts: generateTs(),
          channel_id: channel.channel_id,
          user: authUserId,
          text: initialComment,
          type: "message",
          subtype: "file_share",
          thread_ts: threadTs,
          blocks,
          files: updatedFiles,
          upload: true,
          reply_count: 0,
          reply_users: [],
          reactions: []
        });
        updateParentThread(channel.channel_id, threadTs, authUserId);
        const messageFiles = [];
        for (const file of updatedFiles) {
          const shared = updateFileShare(file, channel, msg, authUserId);
          messageFiles.push(shared);
          await dispatchFileEvent(webhooks, "file_shared", shared, resolveSlackEventTeamId(c, store, shared.team_id), {
            channel_id: channel.channel_id
          });
        }
        const updatedMessage = ss().messages.update(msg.id, { files: messageFiles });
        await webhooks.dispatch(
          "message",
          void 0,
          buildSlackEventEnvelope(
            resolveSlackChannelEventTeamId(c, store, channel),
            {
              ...formatSlackMessage(updatedMessage),
              type: "message",
              subtype: "file_share",
              channel: channel.channel_id,
              channel_type: slackMessageChannelType(channel),
              ...slackMessageTeamFields(store, channel, updatedMessage.user)
            },
            channel
          ),
          "slack"
        );
        await dispatchSlackAppMention(
          webhooks,
          store,
          resolveSlackChannelEventTeamId(c, store, channel),
          channel,
          formatSlackMessage(updatedMessage)
        );
        for (const shared of messageFiles) {
          const index = updatedFiles.findIndex((file) => file.file_id === shared.file_id);
          if (index >= 0) updatedFiles[index] = shared;
        }
      }
      return updatedFiles;
    }
  });
  async function fileInfo(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["files:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackRequest2(c);
    const fileId = typeof body.file === "string" ? body.file : "";
    const file = fileId ? ss().files.findOneBy("file_id", fileId) : void 0;
    if (!file || file.deleted || !canAccessFile(file, authUser)) return slackError(c, "file_not_found");
    return slackOk(c, {
      file: formatSlackFileForAuth(file, authUser),
      comments: [],
      paging: { count: 0, total: 0, page: 1, pages: 0 }
    });
  }
  async function fileList(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["files:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackRequest2(c);
    const channel = typeof body.channel === "string" ? body.channel : "";
    const user = typeof body.user === "string" ? body.user : "";
    const types = typeof body.types === "string" ? body.types : "all";
    const tsFrom = body.ts_from === void 0 ? void 0 : Number(body.ts_from);
    const tsTo = body.ts_to === void 0 ? void 0 : Number(body.ts_to);
    const page = Math.max(1, Math.floor(Number(body.page) || 1));
    const count = Math.min(Math.max(1, Math.floor(Number(body.count) || 100)), 1e3);
    const files = ss().files.all().filter((file) => !file.deleted).filter((file) => canAccessFile(file, authUser)).filter((file) => !channel || canAccessFileInChannel(file, authUser, channel)).filter((file) => !user || file.user === user).filter((file) => tsFrom === void 0 || file.created >= tsFrom).filter((file) => tsTo === void 0 || file.created <= tsTo).filter((file) => matchesFileTypes(file, types)).sort((a, b) => b.created - a.created || b.file_id.localeCompare(a.file_id));
    const start = (page - 1) * count;
    const paged = files.slice(start, start + count);
    return slackOk(c, {
      files: paged.map((file) => formatSlackFileForAuth(file, authUser)),
      paging: {
        count,
        total: files.length,
        page,
        pages: Math.ceil(files.length / count)
      }
    });
  }
  app.get("/api/files.info", fileInfo);
  app.post("/api/files.info", fileInfo);
  app.get("/api/files.list", fileList);
  app.post("/api/files.list", fileList);
  app.get("/files-pri/:fileId/:filename", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return c.text("not_authed", 401);
    const scopeError = requireSlackScopes(c, store, ["files:read"]);
    if (scopeError) return scopeError;
    const file = ss().files.findOneBy("file_id", c.req.param("fileId"));
    if (!file || file.deleted) return c.text("file_not_found", 404);
    if (!canAccessFile(file, authUser)) return c.text("file_not_found", 404);
    const data = Buffer.from(file.content_base64 ?? "", "base64");
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": file.mimetype,
        ...c.req.query("download") ? { "Content-Disposition": `attachment; filename="${file.name}"` } : {}
      }
    });
  });
  app.post("/api/files.delete", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["files:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const fileId = typeof body.file === "string" ? body.file : "";
    const file = fileId ? ss().files.findOneBy("file_id", fileId) : void 0;
    if (!file || file.deleted || !canAccessFile(file, authUser)) return slackError(c, "file_not_found");
    if (!canDeleteFile(file, authUser)) return slackError(c, "cant_delete_file");
    const deleted = ss().files.update(file.id, { deleted: true });
    removeFileFromMessages(deleted.file_id);
    await dispatchFileEvent(webhooks, "file_deleted", deleted, resolveSlackEventTeamId(c, store, deleted.team_id));
    return slackOk(c, {});
  });
  function removeFileFromMessages(fileId) {
    for (const message of ss().messages.all()) {
      if (!message.files?.some((file) => file.file_id === fileId)) continue;
      ss().messages.update(message.id, {
        files: message.files.filter((file) => file.file_id !== fileId)
      });
    }
  }
  function updateParentThread(channelId, threadTs, userId) {
    if (!threadTs) return;
    const parent = ss().messages.all().find((message) => message.channel_id === channelId && message.ts === threadTs);
    if (!parent) return;
    const replyUsers = parent.reply_users.includes(userId) ? parent.reply_users : [...parent.reply_users, userId];
    ss().messages.update(parent.id, {
      reply_count: parent.reply_count + 1,
      reply_users: replyUsers
    });
  }
  function updateFileShare(file, channel, msg, userId) {
    const share = {
      ts: msg.ts,
      channel_name: channel.name,
      team_id: channel.team_id,
      share_user_id: userId,
      source: "UPLOAD",
      thread_ts: msg.thread_ts,
      reply_count: 0,
      reply_users: [],
      reply_users_count: 0,
      is_silent_share: false
    };
    const shareBucket = channel.is_private ? "private" : "public";
    const shares = {
      ...file.shares,
      [shareBucket]: {
        ...file.shares[shareBucket] ?? {},
        [channel.channel_id]: [...file.shares[shareBucket]?.[channel.channel_id] ?? [], share]
      }
    };
    const channelFields = nextFileChannelFields(file, channel);
    return ss().files.update(file.id, {
      ...channelFields,
      shares,
      is_public: channelFields.channels.length > 0
    });
  }
}
async function parseSlackRequest2(c) {
  if (c.req.method === "GET") {
    return Object.fromEntries(new URL(c.req.url).searchParams.entries());
  }
  return parseSlackBody(c);
}
async function readUploadBytes(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return Buffer.from(await c.req.arrayBuffer());
  }
  const body = await c.req.parseBody();
  const values = orderedUploadFormValues(body);
  for (const value of values) {
    const data = await formValueToBuffer(value, "file");
    if (data) return data;
  }
  for (const value of values) {
    const data = await formValueToBuffer(value, "string");
    if (data) return data;
  }
  return void 0;
}
function orderedUploadFormValues(body) {
  const preferredFields = /* @__PURE__ */ new Set(["filename", "file", "body"]);
  const values = [...preferredFields].flatMap((field) => formValues(body[field]));
  const fallbackValues = Object.entries(body).filter(([field]) => !preferredFields.has(field)).flatMap(([, value]) => formValues(value));
  return [...values, ...fallbackValues];
}
function formValues(value) {
  if (value === void 0) return [];
  return Array.isArray(value) ? value : [value];
}
async function formValueToBuffer(value, kind) {
  if (kind === "string" && typeof value === "string") return Buffer.from(value);
  if (kind === "file" && value && typeof value === "object" && "arrayBuffer" in value) {
    const arrayBuffer = value.arrayBuffer;
    if (typeof arrayBuffer === "function") return Buffer.from(await arrayBuffer.call(value));
  }
  return void 0;
}
function parseCompleteFiles(value) {
  const parsed = parseJsonMaybe(value);
  if (!Array.isArray(parsed)) return void 0;
  const files = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return void 0;
    const record = entry;
    if (typeof record.id !== "string" || !record.id) return void 0;
    if (record.title !== void 0 && typeof record.title !== "string") return void 0;
    if (record.highlight_type !== void 0 && typeof record.highlight_type !== "string") return void 0;
    files.push({
      id: record.id,
      title: record.title,
      highlight_type: record.highlight_type
    });
  }
  return files;
}
function parseDestinationChannels(channelId, channels) {
  const values = [];
  if (typeof channelId === "string" && channelId.trim()) values.push(channelId.trim());
  if (typeof channels === "string" && channels.trim()) {
    values.push(...channels.split(",").map((channel) => channel.trim()));
  }
  return [...new Set(values.filter(Boolean))];
}
function parseBlocks(value) {
  const parsed = parseJsonMaybe(value);
  if (parsed === void 0 || parsed === "") return void 0;
  if (!Array.isArray(parsed)) return void 0;
  if (!parsed.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) return void 0;
  return parsed;
}
function parseJsonMaybe(value) {
  if (typeof value !== "string") return value;
  if (!value.trim()) return void 0;
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
}
function buildSlackFile(session, options) {
  const created = Math.floor(Date.now() / 1e3);
  const fileType = fileTypeFor(session.filename, session.snippet_type);
  const root = options.baseUrl.replace(/\/$/, "");
  return {
    file_id: session.file_id,
    team_id: session.team_id,
    user: options.user,
    name: session.filename,
    title: options.title || session.filename,
    mimetype: mimeTypeFor(session.filename, session.snippet_type),
    filetype: fileType,
    pretty_type: prettyTypeFor(fileType),
    mode: session.snippet_type ? "snippet" : "hosted",
    size: session.uploaded_size ?? session.length,
    created,
    timestamp: created,
    url_private: `${root}/files-pri/${session.file_id}/${encodeURIComponent(session.filename)}`,
    url_private_download: `${root}/files-pri/${session.file_id}/${encodeURIComponent(session.filename)}?download=1`,
    permalink: `${root}/files/${session.file_id}`,
    is_external: false,
    external_type: "",
    is_public: false,
    public_url_shared: false,
    display_as_bot: false,
    editable: session.snippet_type !== void 0,
    deleted: false,
    channels: [],
    groups: [],
    ims: [],
    shares: {},
    initial_comment: options.initialComment || void 0,
    thread_ts: options.threadTs,
    alt_txt: session.alt_txt,
    snippet_type: session.snippet_type,
    content_base64: session.content_base64
  };
}
function nextFileChannelFields(file, channel) {
  const channels = new Set(file.channels);
  const groups = new Set(file.groups);
  const ims = new Set(file.ims);
  if (channel.is_im || channel.is_mpim) ims.add(channel.channel_id);
  else if (channel.is_private) groups.add(channel.channel_id);
  else channels.add(channel.channel_id);
  return { channels: [...channels], groups: [...groups], ims: [...ims] };
}
function fileChannels2(file) {
  return [...file.channels, ...file.groups, ...file.ims];
}
function filterVisibleShares2(shares, visibleIds) {
  const entries = Object.entries(shares ?? {}).filter(([channelId]) => visibleIds.has(channelId));
  return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
function matchesFileTypes(file, types) {
  const requested = types.split(",").map((type) => type.trim()).filter(Boolean);
  if (requested.length === 0 || requested.includes("all")) return true;
  if (requested.includes(file.filetype)) return true;
  if (requested.includes("snippets") && file.mode === "snippet") return true;
  if (requested.includes("images") && file.mimetype.startsWith("image/")) return true;
  if (requested.includes("zips") && file.filetype === "zip") return true;
  if (requested.includes("pdfs") && file.filetype === "pdf") return true;
  return false;
}
function fileTypeFor(filename, snippetType) {
  if (snippetType) return snippetType;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ext || ext === filename) return "auto";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "md" || ext === "markdown") return "markdown";
  return ext;
}
function mimeTypeFor(filename, snippetType) {
  if (snippetType) return "text/plain";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const byExt = {
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    md: "text/markdown",
    pdf: "application/pdf",
    png: "image/png",
    txt: "text/plain",
    zip: "application/zip"
  };
  return byExt[ext] ?? "application/octet-stream";
}
function prettyTypeFor(filetype) {
  const byType = {
    auto: "File",
    gif: "GIF",
    jpg: "JPEG",
    markdown: "Markdown",
    pdf: "PDF",
    png: "PNG",
    txt: "Plain Text",
    zip: "Zip"
  };
  return byType[filetype] ?? filetype.toUpperCase();
}
async function dispatchFileEvent(webhooks, type, file, teamId, extra = {}) {
  await webhooks.dispatch(
    type,
    void 0,
    buildSlackEventEnvelope(teamId, {
      type,
      file_id: file.file_id,
      file: formatSlackFile(file),
      ...extra
    }),
    "slack"
  );
}
function pinsRoutes(ctx) {
  const { app, store, webhooks, baseUrl } = ctx;
  const ss = () => getSlackStore(store);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const isChannelMember = (channel, user, userId) => channel.members.includes(userId) || (user ? channel.members.includes(user.name) : false);
  const canReadConversation = (channel, user, userId) => !channel.is_private || isChannelMember(channel, user, userId);
  const findPinnedMessage = (channelId, timestamp) => ss().messages.all().find((message) => message.channel_id === channelId && message.ts === timestamp);
  const findPin = (channelId, timestamp) => ss().pins.all().find((pin) => pin.channel_id === channelId && pin.message_ts === timestamp);
  app.post("/api/pins.add", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["pins:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = typeof body.channel === "string" ? body.channel : "";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : "";
    if (!channelId) return slackError(c, "channel_not_found");
    if (!timestamp) return slackError(c, "no_item_specified");
    if (!isSlackTimestamp(timestamp)) return slackError(c, "bad_timestamp");
    const channel = ss().channels.findOneBy("channel_id", channelId);
    if (!channel) return slackError(c, "channel_not_found");
    if (channel.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const message = findPinnedMessage(channel.channel_id, timestamp);
    if (!message) return slackError(c, "message_not_found");
    if (findPin(channel.channel_id, timestamp)) return slackError(c, "already_pinned");
    const pin = ss().pins.insert({
      pin_id: generateSlackId("P"),
      team_id: channel.team_id,
      channel_id: channel.channel_id,
      message_ts: timestamp,
      created: Math.floor(Date.now() / 1e3),
      created_by: authUserId
    });
    await dispatchPinEvent(c, channel, "pin_added", {
      user: authUserId,
      channel_id: channel.channel_id,
      item: formatPinItem(pin, message),
      event_ts: generateTs()
    });
    return slackOk(c, {});
  });
  async function pinList(c) {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["pins:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackRequest3(c);
    const channelId = typeof body.channel === "string" ? body.channel : "";
    if (!channelId) return slackError(c, "channel_not_found");
    const channel = ss().channels.findOneBy("channel_id", channelId);
    if (!channel) return slackError(c, "channel_not_found");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const items = ss().pins.findBy("channel_id", channel.channel_id).sort((a, b) => b.created - a.created).flatMap((pin) => {
      const message = findPinnedMessage(pin.channel_id, pin.message_ts);
      return message ? [formatPinItem(pin, message)] : [];
    });
    return slackOk(c, { items });
  }
  app.get("/api/pins.list", pinList);
  app.post("/api/pins.list", pinList);
  app.post("/api/pins.remove", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["pins:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = typeof body.channel === "string" ? body.channel : "";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : "";
    if (!channelId) return slackError(c, "channel_not_found");
    if (!timestamp) return slackError(c, "no_item_specified");
    if (!isSlackTimestamp(timestamp)) return slackError(c, "bad_timestamp");
    const channel = ss().channels.findOneBy("channel_id", channelId);
    if (!channel) return slackError(c, "channel_not_found");
    if (channel.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const pin = findPin(channel.channel_id, timestamp);
    const message = findPinnedMessage(channel.channel_id, timestamp);
    if (!pin) return slackError(c, "no_pin");
    ss().pins.delete(pin.id);
    if (!message) return slackOk(c, {});
    const hasPins = ss().pins.findBy("channel_id", channel.channel_id).length > 0;
    await dispatchPinEvent(c, channel, "pin_removed", {
      user: authUserId,
      channel_id: channel.channel_id,
      item: formatPinItem(pin, message),
      has_pins: hasPins,
      event_ts: generateTs()
    });
    return slackOk(c, {});
  });
  function formatPinItem(pin, message) {
    return {
      type: "message",
      channel: pin.channel_id,
      created: pin.created,
      created_by: pin.created_by,
      message: {
        ...formatSlackMessage(message),
        pinned_to: [pin.channel_id],
        permalink: formatSlackPermalink(baseUrl, pin.channel_id, message)
      }
    };
  }
  async function dispatchPinEvent(c, channel, type, event) {
    await webhooks.dispatch(
      type,
      void 0,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store, channel.team_id), { type, ...event }),
      "slack"
    );
  }
}
async function parseSlackRequest3(c) {
  if (c.req.method === "GET") {
    return Object.fromEntries(new URL(c.req.url).searchParams.entries());
  }
  return parseSlackBody(c);
}
function isSlackTimestamp(value) {
  return /^\d{1,16}\.\d{1,16}$/.test(value);
}
function bookmarksRoutes(ctx) {
  const { app, store } = ctx;
  const ss = () => getSlackStore(store);
  const getAuthSlackUser = (authUser) => ss().users.findOneBy("user_id", authUser.login) ?? ss().users.findOneBy("name", authUser.login);
  const getAuthUserId = (authUser) => getAuthSlackUser(authUser)?.user_id ?? authUser.login;
  const isChannelMember = (channel, user, userId) => channel.members.includes(userId) || (user ? channel.members.includes(user.name) : false);
  const canReadConversation = (channel, user, userId) => !channel.is_private || isChannelMember(channel, user, userId);
  app.post("/api/bookmarks.add", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["bookmarks:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = stringField(body.channel_id) || stringField(body.channel);
    const channel = findBookmarkChannel(channelId);
    if (!channel) return slackError(c, "channel_not_found");
    if (channel.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const title = stringField(body.title).trim();
    const type = stringField(body.type);
    const link = stringField(body.link) || stringField(body.url);
    if (type !== "link") return slackError(c, "invalid_bookmark_type");
    if (!title || !link) return slackError(c, "invalid_arguments");
    if (!isValidBookmarkLink(link)) return slackError(c, "invalid_link");
    if (ss().bookmarks.findBy("channel_id", channel.channel_id).length >= 100) {
      return slackError(c, "too_many_bookmarks");
    }
    const now = Math.floor(Date.now() / 1e3);
    const team = ss().teams.all()[0];
    const bookmark = ss().bookmarks.insert({
      bookmark_id: generateSlackId("Bk"),
      team_id: team?.team_id ?? channel.team_id,
      channel_id: channel.channel_id,
      title,
      type: "link",
      link,
      emoji: stringField(body.emoji),
      icon_url: bookmarkIconUrl(link),
      entity_id: null,
      date_created: now,
      date_updated: 0,
      rank: bookmarkRank(channel.channel_id),
      last_updated_by_user_id: authUserId,
      last_updated_by_team_id: team?.team_id ?? channel.team_id,
      shortcut_id: null,
      app_id: null,
      ...accessLevel(body.access_level) ? { access_level: accessLevel(body.access_level) } : {},
      ...stringField(body.parent_id) ? { parent_id: stringField(body.parent_id) } : {}
    });
    return slackOk(c, { bookmark: formatBookmark(bookmark) });
  });
  app.post("/api/bookmarks.edit", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["bookmarks:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = stringField(body.channel_id) || stringField(body.channel);
    const bookmarkId = stringField(body.bookmark_id);
    const channel = findBookmarkChannel(channelId);
    if (!channel) return slackError(c, "channel_not_found");
    if (channel.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const bookmark = findBookmark(channel.channel_id, bookmarkId);
    if (!bookmark) return slackError(c, "not_found");
    const updates = {
      date_updated: Math.floor(Date.now() / 1e3),
      last_updated_by_user_id: authUserId
    };
    const title = stringField(body.title).trim();
    const link = stringField(body.link) || stringField(body.url);
    const emoji = stringField(body.emoji);
    if (title) updates.title = title;
    if (link) {
      if (!isValidBookmarkLink(link)) return slackError(c, "invalid_link");
      updates.link = link;
      updates.icon_url = bookmarkIconUrl(link);
    }
    if (Object.prototype.hasOwnProperty.call(body, "emoji")) updates.emoji = emoji;
    const updated = ss().bookmarks.update(bookmark.id, updates);
    return slackOk(c, { bookmark: formatBookmark(updated) });
  });
  app.post("/api/bookmarks.list", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["bookmarks:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = stringField(body.channel_id) || stringField(body.channel);
    const channel = findBookmarkChannel(channelId);
    if (!channel) return slackError(c, "channel_not_found");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!canReadConversation(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const bookmarks = ss().bookmarks.findBy("channel_id", channel.channel_id).sort(compareSlackBookmarks).map(formatBookmark);
    return slackOk(c, { bookmarks });
  });
  app.post("/api/bookmarks.remove", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["bookmarks:write"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const channelId = stringField(body.channel_id) || stringField(body.channel);
    const bookmarkId = stringField(body.bookmark_id);
    const channel = findBookmarkChannel(channelId);
    if (!channel) return slackError(c, "channel_not_found");
    if (channel.is_archived) return slackError(c, "is_archived");
    const authSlackUser = getAuthSlackUser(authUser);
    const authUserId = getAuthUserId(authUser);
    if (!isChannelMember(channel, authSlackUser, authUserId)) return slackError(c, "not_in_channel");
    const bookmark = findBookmark(channel.channel_id, bookmarkId);
    if (!bookmark) return slackError(c, "not_found");
    ss().bookmarks.delete(bookmark.id);
    return slackOk(c, {});
  });
  function findBookmarkChannel(channelId) {
    if (!channelId) return void 0;
    return ss().channels.findOneBy("channel_id", channelId);
  }
  function findBookmark(channelId, bookmarkId) {
    if (!bookmarkId) return void 0;
    return ss().bookmarks.all().find((bookmark) => bookmark.channel_id === channelId && bookmark.bookmark_id === bookmarkId);
  }
  function bookmarkRank(channelId) {
    const maxRank = ss().bookmarks.findBy("channel_id", channelId).reduce((max, bookmark) => Math.max(max, validBookmarkRankNumber(bookmark) ?? 0), 0);
    return (maxRank + 1).toString(36);
  }
}
function compareSlackBookmarks(a, b) {
  return bookmarkRankNumber(a) - bookmarkRankNumber(b) || a.date_created - b.date_created || a.id - b.id || a.bookmark_id.localeCompare(b.bookmark_id);
}
function formatBookmark(bookmark) {
  return {
    id: bookmark.bookmark_id,
    channel_id: bookmark.channel_id,
    title: bookmark.title,
    link: bookmark.link,
    emoji: bookmark.emoji,
    icon_url: bookmark.icon_url,
    type: bookmark.type,
    entity_id: bookmark.entity_id,
    date_created: bookmark.date_created,
    date_updated: bookmark.date_updated,
    rank: bookmark.rank,
    last_updated_by_user_id: bookmark.last_updated_by_user_id,
    last_updated_by_team_id: bookmark.last_updated_by_team_id,
    shortcut_id: bookmark.shortcut_id,
    app_id: bookmark.app_id
  };
}
function stringField(value) {
  return typeof value === "string" ? value : "";
}
function accessLevel(value) {
  if (value === "read" || value === "write") return value;
  return void 0;
}
function bookmarkRankNumber(bookmark) {
  return validBookmarkRankNumber(bookmark) ?? Number.MAX_SAFE_INTEGER;
}
function validBookmarkRankNumber(bookmark) {
  if (!/^[0-9a-z]+$/i.test(bookmark.rank)) return void 0;
  const rank = parseInt(bookmark.rank, 36);
  return Number.isSafeInteger(rank) ? rank : void 0;
}
function bookmarkIconUrl(link) {
  try {
    const url = new URL(link);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}
function isValidBookmarkLink(link) {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
var VIEW_TRIGGER_TTL_SECONDS = 3;
var MAX_MODAL_STACK_DEPTH = 3;
function viewsRoutes(ctx) {
  const { app, store } = ctx;
  const ss = () => getSlackStore(store);
  const teamId = () => ss().teams.all()[0]?.team_id ?? "T000000001";
  app.post("/api/views.publish", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const userId = resolveUserId(stringField2(body.user_id));
    if (!userId) return slackError(c, "user_not_found");
    const parsed = parseViewPayload(body.view, "home");
    if (parsed.error || !parsed.view) return slackError(c, parsed.error ?? "invalid_view");
    const viewPayload = parsed.view;
    const actor = viewActor(c);
    const existing = ss().views.all().find((view2) => view2.type === "home" && view2.user_id === userId && view2.app_id === actor.app_id);
    const hash = stringField2(body.hash);
    if (existing && hash && hash !== existing.hash) return slackError(c, "hash_conflict");
    if (findDuplicateExternalId(viewPayload.external_id, existing?.view_id)) {
      return slackError(c, "duplicate_external_id");
    }
    const now = nowSeconds();
    const view = existing ?? ss().views.insert({
      ...viewPayload,
      view_id: generateSlackId("V"),
      team_id: teamId(),
      user_id: userId,
      hash: generateTs(),
      root_view_id: "",
      app_id: actor.app_id,
      bot_id: actor.bot_id,
      created: now,
      updated: now
    });
    const updated = ss().views.update(view.id, {
      ...viewPayload,
      root_view_id: view.root_view_id || view.view_id,
      hash: generateTs(),
      updated: now
    });
    return slackOk(c, { view: formatSlackView(updated) });
  });
  app.post("/api/views.open", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const parsed = parseViewPayload(body.view, "modal");
    if (parsed.error || !parsed.view) return slackError(c, parsed.error ?? "invalid_view");
    const viewPayload = parsed.view;
    const actor = viewActor(c);
    const trigger = consumeTrigger(viewExchangeId(body), actor.app_id);
    if (trigger.error) return slackError(c, trigger.error);
    const userId = trigger.value.user_id;
    if (!resolveUserId(userId)) return slackError(c, "user_not_found");
    if (findDuplicateExternalId(viewPayload.external_id)) return slackError(c, "duplicate_external_id");
    const view = createView(viewPayload, {
      user_id: userId,
      app_id: actor.app_id,
      bot_id: actor.bot_id
    });
    return slackOk(c, { view: formatSlackView(view) });
  });
  app.post("/api/views.update", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const view = findView(stringField2(body.view_id), stringField2(body.external_id));
    if (!view) return slackError(c, "not_found");
    const actor = viewActor(c);
    if (view.app_id !== actor.app_id) return slackError(c, "not_found");
    const hash = stringField2(body.hash);
    if (hash && hash !== view.hash) return slackError(c, "hash_conflict");
    const parsed = parseViewPayload(body.view, view.type, view.type);
    if (parsed.error || !parsed.view) return slackError(c, parsed.error ?? "invalid_view");
    const viewPayload = parsed.view;
    if (findDuplicateExternalId(viewPayload.external_id, view.view_id)) {
      return slackError(c, "duplicate_external_id");
    }
    const updated = ss().views.update(view.id, {
      ...viewPayload,
      hash: generateTs(),
      updated: nowSeconds()
    });
    return slackOk(c, { view: formatSlackView(updated) });
  });
  app.post("/api/views.push", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const parsed = parseViewPayload(body.view, "modal");
    if (parsed.error || !parsed.view) return slackError(c, parsed.error ?? "invalid_view");
    const viewPayload = parsed.view;
    const actor = viewActor(c);
    const trigger = consumeTrigger(viewExchangeId(body), actor.app_id);
    if (trigger.error) return slackError(c, trigger.error);
    const userId = trigger.value.user_id;
    if (!resolveUserId(userId)) return slackError(c, "user_not_found");
    if (findDuplicateExternalId(viewPayload.external_id)) return slackError(c, "duplicate_external_id");
    const parent = trigger.value?.view_id ? ss().views.findOneBy("view_id", trigger.value.view_id) : void 0;
    if (!parent || parent.type !== "modal" || parent.user_id !== userId) return slackError(c, "view_not_found");
    if (modalStackDepth(parent) >= MAX_MODAL_STACK_DEPTH) return slackError(c, "push_limit_reached");
    const view = createView(viewPayload, {
      user_id: userId,
      app_id: actor.app_id,
      bot_id: actor.bot_id,
      previous_view_id: parent?.view_id,
      root_view_id: parent?.root_view_id ?? parent?.view_id
    });
    return slackOk(c, { view: formatSlackView(view) });
  });
  app.post("/api/views.generateTriggerId", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) return slackError(c, "not_authed");
    const body = await parseSlackBody(c);
    const referencedView = stringField2(body.view_id) ? ss().views.findOneBy("view_id", stringField2(body.view_id)) : void 0;
    if (stringField2(body.view_id) && !referencedView) return slackError(c, "view_not_found");
    const actor = viewActor(c);
    if (referencedView && referencedView.app_id !== actor.app_id) return slackError(c, "view_not_found");
    const userId = resolveUserId(stringField2(body.user_id)) ?? referencedView?.user_id ?? resolveUserId(authUser.login);
    if (!userId || !resolveUserId(userId)) return slackError(c, "user_not_found");
    const triggerId = generateTriggerId();
    const expiresAt = nowSeconds() + VIEW_TRIGGER_TTL_SECONDS;
    ss().viewTriggers.insert({
      trigger_id: triggerId,
      team_id: teamId(),
      user_id: userId,
      app_id: actor.app_id,
      expires_at: expiresAt,
      used: false,
      ...referencedView ? { view_id: referencedView.view_id } : {}
    });
    return slackOk(c, { trigger_id: triggerId, expires_at: expiresAt });
  });
  function createView(parsed, options) {
    const now = nowSeconds();
    const viewId = generateSlackId("V");
    return ss().views.insert({
      ...parsed,
      view_id: viewId,
      team_id: teamId(),
      user_id: options.user_id,
      hash: generateTs(),
      root_view_id: options.root_view_id ?? viewId,
      ...options.previous_view_id ? { previous_view_id: options.previous_view_id } : {},
      app_id: options.app_id,
      bot_id: options.bot_id,
      created: now,
      updated: now
    });
  }
  function findView(viewId, externalId) {
    if (viewId) return ss().views.findOneBy("view_id", viewId);
    if (externalId) return ss().views.findOneBy("external_id", externalId);
    return void 0;
  }
  function findDuplicateExternalId(externalId, currentViewId) {
    if (!externalId) return void 0;
    return ss().views.all().find((view) => view.team_id === teamId() && view.external_id === externalId && view.view_id !== currentViewId);
  }
  function resolveUserId(value) {
    if (!value) return void 0;
    return ss().users.findOneBy("user_id", value)?.user_id ?? ss().users.findOneBy("name", value)?.user_id;
  }
  function modalStackDepth(view) {
    const rootViewId = view.root_view_id || view.view_id;
    return ss().views.all().filter((candidate) => candidate.type === "modal" && candidate.root_view_id === rootViewId).length;
  }
  function viewActor(c) {
    const token = authTokenRecord(c);
    const appId = token?.app_id ?? ss().oauthApps.all()[0]?.app_id ?? "A000000001";
    const botId = token?.bot_id ?? ss().bots.all()[0]?.bot_id ?? "B000000001";
    return { app_id: appId, bot_id: botId };
  }
  function authTokenRecord(c) {
    const token = c.get("authToken");
    return token ? ss().tokens.findOneBy("token", token) : void 0;
  }
  function consumeTrigger(triggerId, appId) {
    if (!triggerId) return { error: "invalid_trigger_id" };
    const trigger = ss().viewTriggers.findOneBy("trigger_id", triggerId);
    if (!trigger) return { error: "invalid_trigger_id" };
    if (trigger.app_id !== appId) return { error: "invalid_trigger_id" };
    if (trigger.used) return { error: "exchanged_trigger_id" };
    if (trigger.expires_at <= nowSeconds()) return { error: "expired_trigger_id" };
    const updated = ss().viewTriggers.update(trigger.id, { used: true }) ?? trigger;
    return { value: { user_id: updated.user_id, app_id: updated.app_id, view_id: updated.view_id } };
  }
  function parseViewPayload(value, expectedType, fallbackType) {
    const view = parseViewObject(value);
    if (!view) return { error: "invalid_view" };
    const type = typeof view.type === "string" ? view.type : fallbackType;
    if (type !== expectedType) return { error: "invalid_view" };
    const blocks = view.blocks;
    if (!Array.isArray(blocks) || !blocks.every(isSlackJsonObject2)) return { error: "invalid_view" };
    const title = optionalObject(view.title);
    const submit = optionalObject(view.submit);
    const close = optionalObject(view.close);
    const state = optionalObject(view.state) ?? { values: {} };
    if (title === false || submit === false || close === false || state === false) return { error: "invalid_view" };
    if (expectedType === "modal" && title === null) return { error: "invalid_view" };
    return {
      view: {
        type: expectedType,
        blocks,
        private_metadata: stringField2(view.private_metadata),
        callback_id: stringField2(view.callback_id),
        external_id: stringField2(view.external_id),
        title,
        submit,
        close,
        state,
        clear_on_close: booleanField(view.clear_on_close, false),
        notify_on_close: booleanField(view.notify_on_close, false)
      }
    };
  }
}
function parseViewObject(value) {
  let parsed = value;
  if (typeof parsed === "string") {
    if (!parsed) return void 0;
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return void 0;
    }
  }
  if (!isSlackJsonObject2(parsed)) return void 0;
  return parsed;
}
function optionalObject(value) {
  if (value === void 0 || value === null || value === "") return null;
  return isSlackJsonObject2(value) ? value : false;
}
function isSlackJsonObject2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function stringField2(value) {
  return typeof value === "string" ? value : "";
}
function viewExchangeId(body) {
  return stringField2(body.trigger_id) || stringField2(body.interactivity_pointer);
}
function booleanField(value, fallback) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
}
function nowSeconds() {
  return Math.floor(Date.now() / 1e3);
}
function generateTriggerId() {
  const first = Math.floor(Date.now() / 1e3);
  const second = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  return `${first}.${second}.${generateSlackId("trg").toLowerCase()}`;
}
var SERVICE_LABEL2 = "Slack";
var INSPECTOR_TABS = [
  { id: "messages", label: "Messages", href: "/?tab=messages" },
  { id: "channels", label: "Channels", href: "/?tab=channels" },
  { id: "files", label: "Files", href: "/?tab=files" },
  { id: "views", label: "Views", href: "/?tab=views" },
  { id: "auth", label: "Auth", href: "/?tab=auth" },
  { id: "events", label: "Events", href: "/?tab=events" }
];
function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1e3);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
function collectTextValues(value, output) {
  if (Array.isArray(value)) {
    for (const item of value) collectTextValues(item, output);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const record = value;
  const text = record.text;
  if (typeof text === "string" && text.trim().length > 0) {
    output.push(text);
  } else {
    collectTextValues(text, output);
  }
  collectTextValues(record.fields, output);
  collectTextValues(record.elements, output);
  collectTextValues(record.accessory, output);
}
function richMessagePreview(msg) {
  if (msg.text.trim().length > 0) return msg.text;
  const blockText = [];
  collectTextValues(msg.blocks, blockText);
  if (blockText.length > 0) return blockText.join(" ");
  const attachmentText = msg.attachments?.flatMap((attachment) => [attachment.text, attachment.title]).filter((value) => typeof value === "string" && value.trim().length > 0) ?? [];
  if (attachmentText.length > 0) return attachmentText.join(" ");
  const files = "files" in msg ? msg.files : void 0;
  const fileText = files?.map((file) => file.title || file.name).filter((value) => value.trim().length > 0) ?? [];
  if (fileText.length > 0) return fileText.join(" ");
  if (msg.blocks?.length) return `${msg.blocks.length} ${msg.blocks.length === 1 ? "block" : "blocks"}`;
  if (msg.attachments?.length) {
    return `${msg.attachments.length} ${msg.attachments.length === 1 ? "attachment" : "attachments"}`;
  }
  if (files?.length) return `${files.length} ${files.length === 1 ? "file" : "files"}`;
  return msg.text;
}
function viewPreview(view) {
  const blockText = [];
  collectTextValues(view.blocks, blockText);
  if (blockText.length > 0) return blockText.join(" ");
  const title = view.title?.text;
  if (typeof title === "string" && title.trim().length > 0) return title;
  if (view.callback_id) return view.callback_id;
  if (view.external_id) return view.external_id;
  return `${view.blocks.length} ${view.blocks.length === 1 ? "block" : "blocks"}`;
}
function renderSection(title, body) {
  return `<section class="inspector-section">
  <h2>${escapeHtml(title)}</h2>
  ${body}
</section>`;
}
function renderTable(headers, rows, empty) {
  if (rows.length === 0) return `<p class="inspector-empty">${escapeHtml(empty)}</p>`;
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowsHtml = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n");
  return `<table class="inspector-table">
  <thead><tr>${headerHtml}</tr></thead>
  <tbody>
${rowsHtml}
  </tbody>
</table>`;
}
function badge(label, tone = "requested") {
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}
function renderReactionBadges(reactions) {
  if (reactions.length === 0) return "";
  return reactions.map((reaction) => badge(`:${reaction.name}: ${reaction.count}`, "granted")).join(" ");
}
function linkCell(href, label) {
  return `<a href="${escapeAttr(href)}">${escapeHtml(label)}</a>`;
}
function scopePreview(scopes) {
  if (!scopes || scopes.length === 0) return "";
  return scopes.join(", ");
}
function userLabel(users, id) {
  return users.get(id) ?? id;
}
function channelLabel(ch) {
  if (ch.is_im) return `DM ${ch.name}`;
  if (ch.is_mpim) return `MPIM ${ch.name}`;
  if (ch.is_private) return `private ${ch.name}`;
  return `# ${ch.name}`;
}
function channelKind(ch) {
  if (ch.is_im) return "DM";
  if (ch.is_mpim) return "MPIM";
  if (ch.is_private) return "Private";
  return "Public";
}
function openStateLabel(ch, users) {
  if (ch.is_open_by_user) {
    const openUsers = Object.entries(ch.is_open_by_user).filter(([, isOpen]) => isOpen === true).map(([userId]) => userLabel(users, userId));
    return openUsers.length > 0 ? openUsers.join(", ") : "closed";
  }
  return ch.is_open ? "open" : "closed";
}
function maskToken(value) {
  if (value.length <= 10) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
function sortedChannels(channels) {
  return [...channels].sort(
    (a, b) => Number(a.is_archived) - Number(b.is_archived) || channelKind(a).localeCompare(channelKind(b)) || a.name.localeCompare(b.name)
  );
}
function inspectorRoutes(ctx) {
  const { app, store, webhooks } = ctx;
  const ss = () => getSlackStore(store);
  app.get("/", (c) => {
    const team = ss().teams.all()[0];
    const requestedTab = c.req.query("tab") ?? "messages";
    const activeTab = INSPECTOR_TABS.some((tab) => tab.id === requestedTab) ? requestedTab : "messages";
    const users = buildUserMap();
    const body = activeTab === "channels" ? renderChannelsView(users) : activeTab === "files" ? renderFilesView(users) : activeTab === "views" ? renderViewsView(users) : activeTab === "auth" ? renderAuthView() : activeTab === "events" ? renderEventsView() : renderMessagesView(c.req.query("channel") ?? "", users);
    return c.html(
      renderInspectorPage(
        `${team?.name ?? "Slack"} - Message Inspector`,
        INSPECTOR_TABS,
        activeTab,
        body,
        SERVICE_LABEL2
      )
    );
  });
  function buildUserMap() {
    const userMap = /* @__PURE__ */ new Map();
    for (const u of ss().users.all()) {
      userMap.set(u.user_id, u.name);
      userMap.set(u.name, u.name);
    }
    for (const b of ss().bots.all()) {
      userMap.set(b.bot_id, b.name);
      if (b.user_id) userMap.set(b.user_id, b.name);
    }
    return userMap;
  }
  function renderMessagesView(requestedChannel, users) {
    const channels = sortedChannels(ss().channels.all());
    const visibleChannels = channels.filter((ch) => !ch.is_archived);
    const activeChannel = channels.find((ch) => ch.channel_id === requestedChannel) ?? visibleChannels[0] ?? channels[0];
    if (!activeChannel) {
      return renderSection("Messages", '<p class="inspector-empty">No conversations in the emulator store.</p>');
    }
    const channelMessages = ss().messages.findBy("channel_id", activeChannel.channel_id).sort((a, b) => b.ts > a.ts ? 1 : -1);
    const messages = channelMessages.slice(0, 50);
    const threads = channelMessages.filter((message) => message.thread_ts && message.thread_ts !== message.ts).slice(0, 20);
    const ephemeralMessages = ss().ephemeralMessages.findBy("channel_id", activeChannel.channel_id).sort((a, b) => b.ts > a.ts ? 1 : -1).slice(0, 20);
    const scheduledMessages = ss().scheduledMessages.findBy("channel_id", activeChannel.channel_id).sort((a, b) => a.post_at - b.post_at).slice(0, 20);
    const pins = ss().pins.findBy("channel_id", activeChannel.channel_id).filter((pin) => channelMessages.some((message) => message.ts === pin.message_ts)).sort((a, b) => b.created - a.created).slice(0, 20);
    const bookmarks = ss().bookmarks.findBy("channel_id", activeChannel.channel_id).sort(compareSlackBookmarks).slice(0, 20);
    const views = ss().views.all().sort((a, b) => b.updated - a.updated || b.id - a.id);
    const homeViews = views.filter((view) => view.type === "home").slice(0, 20);
    const modalViews = views.filter((view) => view.type === "modal").slice(0, 20);
    const stats = `${ss().users.all().length} users, ${channels.length} conversations, ${ss().messages.all().length} messages, ${ss().views.all().length} views`;
    const body = [
      renderConversationSelector(channels, activeChannel.channel_id),
      renderSection(
        `Messages In ${channelLabel(activeChannel)}`,
        `<p class="info-text">${escapeHtml(activeChannel.topic.value || "No topic set")} - ${escapeHtml(stats)}</p>` + renderMessagesTable(
          messages,
          users,
          "No messages yet. Post one with chat.postMessage or an incoming webhook."
        )
      ),
      renderSection("Threads", renderMessagesTable(threads, users, "No thread replies for this conversation.")),
      renderSection(
        "Ephemeral",
        renderEphemeralTable(ephemeralMessages, users, "No ephemeral messages for this conversation.")
      ),
      renderSection(
        "Scheduled",
        renderScheduledTable(scheduledMessages, users, "No scheduled messages for this conversation.")
      ),
      renderSection("Pins", renderPinsTable(pins, channelMessages, users, "No pins for this conversation.")),
      renderSection("Bookmarks", renderBookmarksTable(bookmarks, "No bookmarks for this conversation.")),
      renderSection("App Home", renderViewsTable(homeViews, users, "No App Home views have been published.")),
      renderSection("Modals", renderViewsTable(modalViews, users, "No modal views have been opened."))
    ];
    return body.join("\n");
  }
  function renderConversationSelector(channels, activeChannelId) {
    const rows = channels.map((ch) => [
      ch.channel_id === activeChannelId ? badge("active", "granted") : "",
      linkCell(`/?tab=messages&channel=${encodeURIComponent(ch.channel_id)}`, channelLabel(ch)),
      escapeHtml(channelKind(ch)),
      escapeHtml(String(ch.num_members)),
      ch.is_archived ? badge("archived", "denied") : badge("open", "granted")
    ]);
    return renderSection(
      "Conversations",
      renderTable(["", "Name", "Type", "Members", "State"], rows, "No conversations in the emulator store.")
    );
  }
  function renderChannelsView(users) {
    const channels = sortedChannels(ss().channels.all());
    const conversations = channels.filter((channel) => !channel.is_im && !channel.is_mpim);
    const dms = channels.filter((channel) => channel.is_im || channel.is_mpim);
    return [
      renderSection(
        "Channels",
        renderTable(
          ["ID", "Name", "Type", "Members", "Topic", "Purpose", "State"],
          conversations.map((ch) => [
            escapeHtml(ch.channel_id),
            linkCell(`/?tab=messages&channel=${encodeURIComponent(ch.channel_id)}`, channelLabel(ch)),
            escapeHtml(channelKind(ch)),
            escapeHtml(ch.members.map((member) => userLabel(users, member)).join(", ")),
            escapeHtml(ch.topic.value),
            escapeHtml(ch.purpose.value),
            ch.is_archived ? badge("archived", "denied") : badge("open", "granted")
          ]),
          "No channels in the emulator store."
        )
      ),
      renderSection(
        "Direct Messages",
        renderTable(
          ["ID", "Name", "Type", "Members", "Open State"],
          dms.map((ch) => [
            escapeHtml(ch.channel_id),
            linkCell(`/?tab=messages&channel=${encodeURIComponent(ch.channel_id)}`, channelLabel(ch)),
            escapeHtml(channelKind(ch)),
            escapeHtml(ch.members.map((member) => userLabel(users, member)).join(", ")),
            escapeHtml(openStateLabel(ch, users))
          ]),
          "No DMs or MPIMs in the emulator store."
        )
      )
    ].join("\n");
  }
  function renderFilesView(users) {
    const files = ss().files.all().sort((a, b) => b.created - a.created || b.id - a.id);
    const sessions = ss().fileUploadSessions.all().filter((session) => !session.completed).sort((a, b) => b.id - a.id);
    return [
      renderSection(
        "Files",
        renderTable(
          ["ID", "Title", "User", "Channels", "Size", "State", "Created"],
          files.map((file) => [
            escapeHtml(file.file_id),
            escapeHtml(file.title || file.name),
            escapeHtml(userLabel(users, file.user)),
            escapeHtml([...file.channels, ...file.groups, ...file.ims].join(", ")),
            escapeHtml(String(file.size)),
            file.deleted ? badge("deleted", "denied") : badge("available", "granted"),
            escapeHtml(new Date(file.created * 1e3).toISOString())
          ]),
          "No completed files in the emulator store."
        )
      ),
      renderSection(
        "Pending Uploads",
        renderTable(
          ["File ID", "Filename", "Title", "Length", "Uploaded", "Completed"],
          sessions.map((session) => [
            escapeHtml(session.file_id),
            escapeHtml(session.filename),
            escapeHtml(session.title),
            escapeHtml(String(session.length)),
            session.uploaded ? badge("uploaded", "granted") : badge("pending"),
            session.completed ? badge("complete", "granted") : badge("pending")
          ]),
          "No pending external upload sessions."
        )
      )
    ].join("\n");
  }
  function renderViewsView(users) {
    const views = ss().views.all().sort((a, b) => b.updated - a.updated || b.id - a.id);
    const homeViews = views.filter((view) => view.type === "home");
    const modalViews = views.filter((view) => view.type === "modal");
    const triggers = ss().viewTriggers.all().sort((a, b) => b.expires_at - a.expires_at || b.id - a.id);
    return [
      renderSection("App Home", renderViewsTable(homeViews, users, "No App Home views have been published.")),
      renderSection("Modals", renderViewsTable(modalViews, users, "No modal views have been opened.")),
      renderSection("Trigger IDs", renderTriggerTable(triggers, users))
    ].join("\n");
  }
  function renderAuthView() {
    const subscriptions = webhooks.getSubscriptions("slack");
    return [
      renderSection("OAuth Apps", renderOAuthAppsTable(ss().oauthApps.all())),
      renderSection("Installations", renderInstallationsTable(ss().installations.all())),
      renderSection("Tokens", renderTokensTable(ss().tokens.all())),
      renderSection("Incoming Webhooks", renderIncomingWebhooksTable(ss().incomingWebhooks.all())),
      renderSection("Event Subscriptions", renderSubscriptionsTable(subscriptions))
    ].join("\n");
  }
  function renderEventsView() {
    const subscriptions = webhooks.getSubscriptions("slack");
    const slackHookIds = new Set(subscriptions.map((subscription) => subscription.id));
    const allDeliveries = webhooks.getDeliveries().filter((delivery) => slackHookIds.has(delivery.hook_id)).sort((a, b) => b.id - a.id);
    const deliveries = allDeliveries.slice(0, 100);
    const failed = allDeliveries.filter((delivery) => !delivery.success).slice(0, 100);
    return [
      renderSection("Event Subscriptions", renderSubscriptionsTable(subscriptions)),
      renderSection(
        "Event Deliveries",
        renderDeliveriesTable(deliveries, subscriptions, "No Slack event deliveries yet.")
      ),
      renderSection("Last Errors", renderDeliveriesTable(failed, subscriptions, "No failed Slack event deliveries."))
    ].join("\n");
  }
}
function renderMessagesTable(messages, users, empty) {
  return renderTable(
    ["Time", "User", "Message", "Reactions", "TS"],
    messages.map((msg) => {
      const isBot = msg.subtype === "bot_message";
      const richBadge = msg.text.length === 0 && ((msg.blocks?.length ?? 0) > 0 || (msg.attachments?.length ?? 0) > 0) ? ` ${badge("rich", "granted")}` : "";
      const threadBadge = msg.reply_count > 0 ? ` ${badge(`${msg.reply_count} ${msg.reply_count === 1 ? "reply" : "replies"}`, "requested")}` : "";
      const fileBadge = msg.files?.length ? ` ${badge(`${msg.files.length} ${msg.files.length === 1 ? "file" : "files"}`, "granted")}` : "";
      const threadIndicator = msg.thread_ts && msg.thread_ts !== msg.ts ? `${badge("thread", "denied")} ` : "";
      return [
        escapeHtml(timeAgo(msg.created_at)),
        `${escapeHtml(userLabel(users, msg.user))}${isBot ? ` ${badge("bot", "granted")}` : ""}`,
        `${threadIndicator}${escapeHtml(richMessagePreview(msg))}${richBadge}${fileBadge}${threadBadge}`,
        renderReactionBadges(msg.reactions),
        escapeHtml(msg.ts)
      ];
    }),
    empty
  );
}
function renderEphemeralTable(messages, users, empty) {
  return renderTable(
    ["Time", "Target", "Message", "TS"],
    messages.map((msg) => [
      escapeHtml(timeAgo(msg.created_at)),
      `${escapeHtml(userLabel(users, msg.target_user))} ${badge("ephemeral", "requested")}`,
      escapeHtml(richMessagePreview(msg)),
      escapeHtml(msg.ts)
    ]),
    empty
  );
}
function renderScheduledTable(messages, users, empty) {
  return renderTable(
    ["Post At", "User", "Message", "ID"],
    messages.map((msg) => [
      escapeHtml(new Date(msg.post_at * 1e3).toISOString()),
      escapeHtml(userLabel(users, msg.user)),
      escapeHtml(richMessagePreview(msg)),
      escapeHtml(msg.scheduled_message_id)
    ]),
    empty
  );
}
function renderPinsTable(pins, channelMessages, users, empty) {
  return renderTable(
    ["Created", "Creator", "Message", "TS"],
    pins.map((pin) => {
      const message = channelMessages.find((candidate) => candidate.ts === pin.message_ts);
      return [
        escapeHtml(new Date(pin.created * 1e3).toISOString()),
        escapeHtml(userLabel(users, pin.created_by)),
        escapeHtml(message ? richMessagePreview(message) : pin.message_ts),
        escapeHtml(pin.message_ts)
      ];
    }),
    empty
  );
}
function renderBookmarksTable(bookmarks, empty) {
  return renderTable(
    ["Title", "Type", "Link", "Rank"],
    bookmarks.map((bookmark) => [
      escapeHtml(bookmark.title),
      escapeHtml(bookmark.type),
      escapeHtml(bookmark.link),
      escapeHtml(bookmark.rank)
    ]),
    empty
  );
}
function renderViewsTable(views, users, empty) {
  return renderTable(
    ["ID", "Type", "User", "App", "Preview", "Hash", "Root", "Previous"],
    views.map((view) => [
      escapeHtml(view.view_id),
      view.type === "home" ? badge("app home", "granted") : badge("modal", "requested"),
      escapeHtml(userLabel(users, view.user_id)),
      escapeHtml(view.app_id),
      escapeHtml(viewPreview(view)),
      escapeHtml(view.hash),
      escapeHtml(view.root_view_id),
      escapeHtml(view.previous_view_id ?? "")
    ]),
    empty
  );
}
function renderTriggerTable(triggers, users) {
  const now = Math.floor(Date.now() / 1e3);
  return renderTable(
    ["Trigger ID", "User", "App", "View", "Expires", "State"],
    triggers.map((trigger) => [
      escapeHtml(trigger.trigger_id),
      escapeHtml(userLabel(users, trigger.user_id)),
      escapeHtml(trigger.app_id),
      escapeHtml(trigger.view_id ?? ""),
      escapeHtml(new Date(trigger.expires_at * 1e3).toISOString()),
      trigger.used ? badge("used", "denied") : trigger.expires_at <= now ? badge("expired", "denied") : badge("active", "granted")
    ]),
    "No local trigger ids have been generated."
  );
}
function renderOAuthAppsTable(apps) {
  return renderTable(
    ["App ID", "Client ID", "Name", "Bot", "Scopes", "User Scopes"],
    apps.map((app) => [
      escapeHtml(app.app_id ?? ""),
      escapeHtml(app.client_id),
      escapeHtml(app.name),
      escapeHtml(app.bot_id ?? app.bot_name ?? ""),
      escapeHtml(scopePreview(app.scopes)),
      escapeHtml(scopePreview(app.user_scopes))
    ]),
    "No OAuth apps are configured."
  );
}
function renderInstallationsTable(installations) {
  return renderTable(
    ["Installation", "App", "Team", "Bot User", "Installer", "Scopes"],
    installations.map((installation) => [
      escapeHtml(installation.installation_id),
      escapeHtml(installation.app_id),
      escapeHtml(installation.team_id),
      escapeHtml(installation.bot_user_id),
      escapeHtml(installation.installer_user_id),
      escapeHtml(scopePreview(installation.scopes))
    ]),
    "No OAuth installations have been recorded."
  );
}
function renderTokensTable(tokens) {
  return renderTable(
    ["Token", "Type", "Team", "User", "App", "Bot", "Scopes"],
    tokens.map((token) => [
      escapeHtml(maskToken(token.token)),
      escapeHtml(token.token_type),
      escapeHtml(token.team_id),
      escapeHtml(token.user_id),
      escapeHtml(token.app_id ?? ""),
      escapeHtml(token.bot_id ?? token.bot_user_id ?? ""),
      escapeHtml(scopePreview(token.scopes))
    ]),
    "No Slack token records have been seeded or exchanged."
  );
}
function renderIncomingWebhooksTable(webhooks) {
  return renderTable(
    ["Token", "Team", "Bot", "Default Channel", "Label", "URL"],
    webhooks.map((webhook) => [
      escapeHtml(maskToken(webhook.token)),
      escapeHtml(webhook.team_id),
      escapeHtml(webhook.bot_id),
      escapeHtml(webhook.default_channel),
      escapeHtml(webhook.label),
      escapeHtml(webhook.url)
    ]),
    "No incoming webhooks are configured."
  );
}
function renderSubscriptionsTable(subscriptions) {
  return renderTable(
    ["ID", "URL", "Events", "State"],
    subscriptions.map((subscription) => [
      escapeHtml(String(subscription.id)),
      escapeHtml(subscription.url),
      escapeHtml(subscription.events.join(", ")),
      subscription.active ? badge("active", "granted") : badge("inactive", "denied")
    ]),
    "No Slack event subscriptions are registered."
  );
}
function renderDeliveriesTable(deliveries, subscriptions, empty) {
  const subscriptionsById = new Map(subscriptions.map((subscription) => [subscription.id, subscription]));
  return renderTable(
    ["ID", "Event", "Hook", "URL", "Status", "Duration", "Delivered"],
    deliveries.map((delivery) => {
      const subscription = subscriptionsById.get(delivery.hook_id);
      return [
        escapeHtml(String(delivery.id)),
        escapeHtml(delivery.event),
        escapeHtml(String(delivery.hook_id)),
        escapeHtml(subscription?.url ?? ""),
        delivery.success ? badge(String(delivery.status_code ?? "ok"), "granted") : badge(String(delivery.status_code ?? "failed"), "denied"),
        escapeHtml(delivery.duration === null ? "" : `${delivery.duration}ms`),
        escapeHtml(delivery.delivered_at)
      ];
    }),
    empty
  );
}
var DEFAULT_SLACK_SCOPES = [
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
  "team:read",
  "search:read"
];
function slackWebhookHeaders(store, { body }) {
  const headers = {
    "Content-Type": "application/json"
  };
  const signingSecret = store.getData("slack.signing_secret");
  if (signingSecret) {
    const timestamp = Math.floor(Date.now() / 1e3);
    const signature = createHmac("sha256", signingSecret).update(`v0:${timestamp}:${body}`).digest("hex");
    headers["X-Slack-Request-Timestamp"] = String(timestamp);
    headers["X-Slack-Signature"] = `v0=${signature}`;
  }
  return headers;
}
function seedDefaults(store, _baseUrl) {
  const ss = getSlackStore(store);
  const teamId = "T000000001";
  ss.teams.insert({
    team_id: teamId,
    name: "Emulate",
    domain: "emulate"
  });
  const userId = "U000000001";
  ss.users.insert({
    user_id: userId,
    team_id: teamId,
    name: "admin",
    real_name: "Admin User",
    email: "admin@emulate.dev",
    is_admin: true,
    is_bot: false,
    deleted: false,
    profile: {
      display_name: "admin",
      real_name: "Admin User",
      email: "admin@emulate.dev",
      image_48: "",
      image_192: "",
      real_name_normalized: "Admin User",
      display_name_normalized: "admin",
      status_text: "",
      status_emoji: "",
      status_emoji_display_info: [],
      status_expiration: 0
    },
    presence: "active",
    manual_presence: "auto",
    connection_count: 1,
    last_activity: Math.floor(Date.now() / 1e3)
  });
  ss.channels.insert({
    channel_id: "C000000001",
    team_id: teamId,
    name: "general",
    is_channel: true,
    is_private: false,
    is_archived: false,
    topic: { value: "General discussion", creator: userId, last_set: Math.floor(Date.now() / 1e3) },
    purpose: { value: "A place for general discussion", creator: userId, last_set: Math.floor(Date.now() / 1e3) },
    members: [userId],
    creator: userId,
    num_members: 1
  });
  ss.channels.insert({
    channel_id: "C000000002",
    team_id: teamId,
    name: "random",
    is_channel: true,
    is_private: false,
    is_archived: false,
    topic: { value: "Random stuff", creator: userId, last_set: Math.floor(Date.now() / 1e3) },
    purpose: {
      value: "A place for non-work-related chatter",
      creator: userId,
      last_set: Math.floor(Date.now() / 1e3)
    },
    members: [userId],
    creator: userId,
    num_members: 1
  });
  ss.incomingWebhooks.insert({
    token: "X000000001",
    team_id: teamId,
    bot_id: "B000000001",
    default_channel: "general",
    label: "Default Webhook",
    url: `/services/${teamId}/B000000001/X000000001`
  });
}
function seedFromConfig(store, _baseUrl, config, webhooks) {
  const ss = getSlackStore(store);
  if (config.team) {
    const existing = ss.teams.all()[0];
    if (existing) {
      if (config.team.id && config.team.id !== existing.team_id) {
        renameSlackTeamId(ss, existing.team_id, config.team.id);
      }
      ss.teams.update(existing.id, {
        name: config.team.name ?? existing.name,
        domain: config.team.domain ?? existing.domain
      });
    }
  }
  const team = ss.teams.all()[0];
  const teamId = team?.team_id ?? "T000000001";
  if (config.teams) {
    for (const t of config.teams) {
      if (t.id && ss.teams.findOneBy("team_id", t.id)) continue;
      ss.teams.insert({
        team_id: t.id ?? generateSlackId("T"),
        name: t.name,
        domain: t.domain ?? slugifySlackBotName(t.name)
      });
    }
  }
  if (config.users) {
    for (const u of config.users) {
      const existing = ss.users.all().find((eu) => eu.name === u.name);
      if (existing) continue;
      const userId = u.id ?? generateSlackId("U");
      const email = u.profile?.email ?? u.email ?? `${u.name}@emulate.dev`;
      const realName = u.real_name ?? u.name;
      const profile = normalizeSeedProfile({
        display_name: u.name,
        real_name: realName,
        email,
        image_48: "",
        image_192: "",
        ...u.profile
      });
      ss.users.insert({
        user_id: userId,
        team_id: u.team ? resolveSeedTeamId(ss, u.team, `user ${u.name}`) : teamId,
        name: u.name,
        real_name: profile.real_name,
        email: profile.email,
        is_admin: u.is_admin ?? false,
        is_bot: false,
        deleted: false,
        profile,
        presence: u.presence ?? "active",
        manual_presence: u.presence === "away" ? "away" : "auto",
        connection_count: u.presence === "away" ? 0 : 1,
        last_activity: u.presence === "away" ? void 0 : Math.floor(Date.now() / 1e3)
      });
    }
  }
  if (config.channels) {
    for (const ch of config.channels) {
      const existing = ss.channels.findOneBy("name", ch.name);
      if (existing) continue;
      const hostTeamId = ch.team ? resolveSeedTeamId(ss, ch.team, `channel ${ch.name}`) : teamId;
      const sharedTeamIds = (ch.shared_with ?? []).map((ref) => resolveSeedTeamId(ss, ref, `channel ${ch.name}`));
      const memberTeams = /* @__PURE__ */ new Set([hostTeamId, ...sharedTeamIds]);
      const members = ss.users.all().filter((u) => memberTeams.has(u.team_id)).map((u) => u.user_id);
      const creator = ss.users.all().find((u) => u.team_id === hostTeamId)?.user_id ?? ss.users.all()[0]?.user_id ?? "U000000001";
      const now = Math.floor(Date.now() / 1e3);
      const isPrivate = ch.is_private ?? false;
      ss.channels.insert({
        channel_id: ch.id ?? generateSlackId("C"),
        team_id: hostTeamId,
        name: ch.name,
        is_channel: !isPrivate,
        is_private: isPrivate,
        is_archived: false,
        topic: { value: ch.topic ?? "", creator, last_set: now },
        purpose: { value: ch.purpose ?? "", creator, last_set: now },
        members,
        creator,
        num_members: members.length,
        ...sharedTeamIds.length > 0 ? { shared_team_ids: [hostTeamId, ...sharedTeamIds] } : {}
      });
    }
  }
  if (config.bots) {
    for (const b of config.bots) {
      const existing = ss.bots.all().find((eb) => eb.name === b.name);
      if (existing) continue;
      ss.bots.insert({
        bot_id: generateSlackId("B"),
        name: b.name,
        deleted: false,
        icons: { image_48: "" }
      });
    }
  }
  if (config.oauth_apps) {
    for (const oa of config.oauth_apps) {
      const existing = ss.oauthApps.findOneBy("client_id", oa.client_id);
      if (existing) {
        if (!existing.app_id) {
          ss.oauthApps.update(existing.id, { app_id: oa.app_id ?? generateSlackId("A") });
        }
        continue;
      }
      ss.oauthApps.insert({
        app_id: oa.app_id ?? generateSlackId("A"),
        client_id: oa.client_id,
        client_secret: oa.client_secret,
        name: oa.name,
        redirect_uris: oa.redirect_uris,
        scopes: normalizeScopes2(oa.scopes),
        user_scopes: normalizeScopes2(oa.user_scopes),
        bot_id: oa.bot_id,
        bot_user_id: oa.bot_user_id,
        bot_name: oa.bot_name
      });
    }
    const installer = ss.users.all().find((user) => !user.deleted && !user.is_bot) ?? ss.users.all()[0];
    for (const appRecord of ss.oauthApps.all()) {
      seedOAuthInstallation(ss, teamId, installer?.user_id ?? "U000000001", appRecord);
    }
  }
  if (config.tokens) {
    for (const token of config.tokens) {
      const value = token.token.trim();
      if (!value || ss.tokens.findOneBy("token", value)) continue;
      const userId = resolveSeedTokenUserId(ss, token.user_id ?? token.user) ?? ss.users.all()[0]?.user_id ?? "U000000001";
      ss.tokens.insert({
        token: value,
        token_type: token.type ?? "test",
        team_id: token.team_id ?? ss.users.findOneBy("user_id", userId)?.team_id ?? teamId,
        user_id: userId,
        scopes: normalizeScopes2(token.scopes, DEFAULT_SLACK_SCOPES),
        app_id: token.app_id,
        client_id: token.client_id,
        bot_id: token.bot_id,
        bot_user_id: token.bot_user_id,
        authed_user_id: token.authed_user_id
      });
    }
  }
  if (config.incoming_webhooks) {
    const firstBot = ss.bots.all()[0];
    const botId = firstBot?.bot_id ?? "B000000001";
    for (const wh of config.incoming_webhooks) {
      const token = generateSlackId("X");
      ss.incomingWebhooks.insert({
        token,
        team_id: teamId,
        bot_id: botId,
        default_channel: wh.channel,
        label: wh.label ?? wh.channel,
        url: `/services/${teamId}/${botId}/${token}`
      });
    }
  }
  for (const ch of config.channels ?? []) {
    if (!ch.members) continue;
    const channel = ss.channels.findOneBy("name", ch.name);
    if (!channel) throw new Error(`Slack seed channel ${ch.name} was not created`);
    const members = ch.members.map((ref) => {
      const user = ss.users.findOneBy("user_id", ref) ?? ss.users.findOneBy("name", ref);
      if (!user) throw new Error(`Slack seed channel ${ch.name} lists unknown member ${ref}`);
      return user.user_id;
    });
    ss.channels.update(channel.id, { members, num_members: members.length });
  }
  if (config.signing_secret !== void 0) {
    store.setData("slack.signing_secret", config.signing_secret);
  }
  if (config.strict_scopes !== void 0) {
    store.setData("slack.strict_scopes", config.strict_scopes);
  }
  if (config.event_subscriptions) {
    if (!webhooks) throw new Error("slack.event_subscriptions requires a webhook dispatcher");
    for (const subscription of config.event_subscriptions) {
      if (typeof subscription.url !== "string" || !subscription.url) {
        throw new Error("slack.event_subscriptions entries require a url");
      }
      webhooks.register({
        url: subscription.url,
        events: subscription.events ?? ["*"],
        active: true,
        owner: "slack"
      });
    }
  }
}
var slackPlugin = {
  name: "slack",
  register(app, store, webhooks, baseUrl, tokenMap) {
    webhooks.setHeaderFactory((context) => slackWebhookHeaders(store, context));
    app.use("*", async (c, next) => {
      applySlackTokenAuth(c, store);
      await next();
    });
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    authRoutes(ctx);
    chatRoutes(ctx);
    conversationsRoutes(ctx);
    usersRoutes(ctx);
    reactionsRoutes(ctx);
    teamRoutes(ctx);
    oauthRoutes(ctx);
    webhookRoutes(ctx);
    filesRoutes(ctx);
    pinsRoutes(ctx);
    bookmarksRoutes(ctx);
    viewsRoutes(ctx);
    inspectorRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = slackPlugin;
function normalizeScopes2(value, fallback = []) {
  if (Array.isArray(value)) return value.map((scope) => scope.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean);
  }
  return [...fallback];
}
function applySlackTokenAuth(c, store) {
  const token = slackRequestToken(c);
  if (!token) return;
  const record = getSlackStore(store).tokens.findOneBy("token", token);
  if (!record) return;
  c.set("authToken", record.token);
  c.set("authScopes", record.scopes);
  c.set("authUser", {
    login: record.user_id,
    id: record.id,
    scopes: record.scopes
  });
}
function slackRequestToken(c) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return void 0;
  const token = authHeader.replace(/^(Bearer|token)\s+/i, "").trim();
  return token || void 0;
}
function seedOAuthInstallation(ss, teamId, installerUserId, app) {
  const appId = app.app_id ?? generateSlackId("A");
  if (!app.app_id) ss.oauthApps.update(app.id, { app_id: appId });
  const botName = app.bot_name ?? slugifySlackBotName(app.name);
  const existingBot = (app.bot_id ? ss.bots.findOneBy("bot_id", app.bot_id) : void 0) ?? ss.bots.all().find((bot2) => bot2.name === botName);
  const botId = app.bot_id ?? existingBot?.bot_id ?? generateSlackId("B");
  const botUserId = app.bot_user_id ?? existingBot?.user_id ?? generateSlackId("U");
  const bot = existingBot ?? ss.bots.insert({
    bot_id: botId,
    app_id: appId,
    user_id: botUserId,
    name: botName,
    deleted: false,
    icons: { image_48: "" }
  });
  if (bot.app_id !== appId || bot.user_id !== botUserId) {
    ss.bots.update(bot.id, { app_id: appId, user_id: botUserId });
  }
  if (!app.bot_id || !app.bot_user_id || !app.bot_name) {
    ss.oauthApps.update(app.id, {
      bot_id: botId,
      bot_user_id: botUserId,
      bot_name: botName
    });
  }
  if (!ss.users.findOneBy("user_id", botUserId)) {
    ss.users.insert({
      user_id: botUserId,
      team_id: teamId,
      name: botName,
      real_name: app.name,
      email: `${botName}@bots.emulate.dev`,
      is_admin: false,
      is_bot: true,
      deleted: false,
      profile: {
        display_name: botName,
        real_name: app.name,
        email: `${botName}@bots.emulate.dev`,
        image_48: "",
        image_192: "",
        real_name_normalized: app.name,
        display_name_normalized: botName,
        status_text: "",
        status_emoji: "",
        status_emoji_display_info: [],
        status_expiration: 0
      },
      presence: "active",
      manual_presence: "auto",
      connection_count: 1,
      last_activity: Math.floor(Date.now() / 1e3)
    });
  }
  const existingInstallation = ss.installations.all().find((installation) => installation.app_id === appId && installation.team_id === teamId);
  const data = {
    app_id: appId,
    client_id: app.client_id,
    team_id: teamId,
    app_name: app.name,
    installer_user_id: installerUserId,
    bot_id: botId,
    bot_user_id: botUserId,
    scopes: app.scopes ?? [],
    user_scopes: app.user_scopes ?? []
  };
  if (existingInstallation) {
    ss.installations.update(existingInstallation.id, data);
  } else {
    ss.installations.insert({
      installation_id: generateSlackId("I"),
      ...data
    });
  }
}
function resolveSeedTeamId(ss, ref, owner) {
  const team = ss.teams.findOneBy("team_id", ref) ?? ss.teams.findOneBy("domain", ref) ?? ss.teams.findOneBy("name", ref);
  if (!team) throw new Error(`Slack seed ${owner} references unknown team ${ref}`);
  return team.team_id;
}
function renameSlackTeamId(ss, from, to) {
  for (const team of ss.teams.findBy("team_id", from)) ss.teams.update(team.id, { team_id: to });
  for (const user of ss.users.findBy("team_id", from)) ss.users.update(user.id, { team_id: to });
  for (const channel of ss.channels.findBy("team_id", from)) ss.channels.update(channel.id, { team_id: to });
  for (const webhook of ss.incomingWebhooks.findBy("team_id", from)) {
    ss.incomingWebhooks.update(webhook.id, {
      team_id: to,
      url: webhook.url.replace(`/services/${from}/`, `/services/${to}/`)
    });
  }
}
function resolveSeedTokenUserId(ss, userRef) {
  if (!userRef) return void 0;
  return ss.users.findOneBy("user_id", userRef)?.user_id ?? ss.users.findOneBy("name", userRef)?.user_id ?? userRef;
}
function slugifySlackBotName(value) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "slack-app";
}
function normalizeSeedProfile(profile) {
  return {
    ...profile,
    real_name_normalized: profile.real_name_normalized ?? profile.real_name,
    display_name_normalized: profile.display_name_normalized ?? profile.display_name,
    status_text: profile.status_text ?? "",
    status_emoji: profile.status_emoji ?? "",
    status_emoji_display_info: profile.status_emoji_display_info ?? [],
    status_expiration: profile.status_expiration ?? 0
  };
}
export {
  index_default as default,
  getSlackStore,
  normalizeScopes2 as normalizeScopes,
  seedFromConfig,
  slackPlugin
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-4XOYIXLQ.js.map
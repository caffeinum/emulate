import {
  SignJWT,
  exportJWK,
  generateKeyPair
} from "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// ../@emulators/google/dist/index.js
import { randomBytes } from "crypto";
import { createHash, randomBytes as randomBytes2 } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
var HISTORY_CHANGE_TYPES = /* @__PURE__ */ new Set([
  "messageAdded",
  "messageDeleted",
  "labelAdded",
  "labelRemoved"
]);
function isHistoryChangeType(value) {
  return HISTORY_CHANGE_TYPES.has(value);
}
var SYSTEM_LABELS = [
  { gmail_id: "INBOX", name: "INBOX", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "SENT", name: "SENT", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "UNREAD", name: "UNREAD", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "STARRED", name: "STARRED", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "IMPORTANT", name: "IMPORTANT", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "TRASH", name: "TRASH", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "SPAM", name: "SPAM", message_list_visibility: "show", label_list_visibility: "labelShow" },
  { gmail_id: "DRAFT", name: "DRAFT", message_list_visibility: "hide", label_list_visibility: "labelHide" },
  {
    gmail_id: "CATEGORY_PERSONAL",
    name: "CATEGORY_PERSONAL",
    message_list_visibility: "hide",
    label_list_visibility: "labelHide"
  },
  {
    gmail_id: "CATEGORY_SOCIAL",
    name: "CATEGORY_SOCIAL",
    message_list_visibility: "hide",
    label_list_visibility: "labelHide"
  },
  {
    gmail_id: "CATEGORY_PROMOTIONS",
    name: "CATEGORY_PROMOTIONS",
    message_list_visibility: "hide",
    label_list_visibility: "labelHide"
  },
  {
    gmail_id: "CATEGORY_UPDATES",
    name: "CATEGORY_UPDATES",
    message_list_visibility: "hide",
    label_list_visibility: "labelHide"
  },
  {
    gmail_id: "CATEGORY_FORUMS",
    name: "CATEGORY_FORUMS",
    message_list_visibility: "hide",
    label_list_visibility: "labelHide"
  }
];
var SYSTEM_LABEL_IDS = new Set(SYSTEM_LABELS.map((label) => label.gmail_id));
var LABEL_ALIASES = {
  inbox: "INBOX",
  sent: "SENT",
  draft: "DRAFT",
  drafts: "DRAFT",
  unread: "UNREAD",
  starred: "STARRED",
  important: "IMPORTANT",
  spam: "SPAM",
  trash: "TRASH",
  personal: "CATEGORY_PERSONAL",
  social: "CATEGORY_SOCIAL",
  promotions: "CATEGORY_PROMOTIONS",
  updates: "CATEGORY_UPDATES",
  forums: "CATEGORY_FORUMS"
};
var lastGeneratedHistoryId = 0n;
function generateUid(prefix = "") {
  const id = randomBytes(12).toString("base64url").slice(0, 20);
  return prefix ? `${prefix}_${id}` : id;
}
function generateDraftId() {
  const entropy = randomBytes(4).readUInt32BE(0).toString();
  return `r-${Date.now()}${entropy}`;
}
function generateHistoryId() {
  const entropy = randomBytes(3).readUIntBE(0, 3).toString().padStart(8, "0");
  let next = BigInt(`${Date.now()}${entropy}`);
  if (next <= lastGeneratedHistoryId) {
    next = lastGeneratedHistoryId + 1n;
  }
  lastGeneratedHistoryId = next;
  return next.toString();
}
function getAuthenticatedEmail(c) {
  const authUser = c.get("authUser");
  return authUser?.login ?? null;
}
function matchesRequestedUser(userId, authEmail) {
  return userId === "me" || userId === authEmail;
}
function googleApiError(c, code, message, reason, status) {
  return c.json(
    {
      error: {
        code,
        message,
        errors: [
          {
            message,
            domain: "global",
            reason
          }
        ],
        status
      }
    },
    code
  );
}
function parseFormat(value) {
  if (value === "metadata" || value === "minimal" || value === "raw") return value;
  return "full";
}
function parseOffset(value) {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}
function normalizeLimit(value, fallback, max = 500) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.min(max, parsed));
}
function parseBooleanParam(value) {
  return value === "true" || value === "1";
}
function ensureSystemLabels(gs, userEmail) {
  const existingIds = new Set(gs.labels.findBy("user_email", userEmail).map((row) => row.gmail_id));
  for (const label of SYSTEM_LABELS) {
    if (existingIds.has(label.gmail_id)) continue;
    gs.labels.insert({
      gmail_id: label.gmail_id,
      user_email: userEmail,
      name: label.name,
      type: "system",
      message_list_visibility: label.message_list_visibility,
      label_list_visibility: label.label_list_visibility,
      color_background: null,
      color_text: null
    });
  }
}
function ensureCustomLabel(gs, userEmail, labelId, name = labelId) {
  ensureSystemLabels(gs, userEmail);
  const existing = findLabelById(gs, userEmail, labelId);
  if (existing) return existing;
  return gs.labels.insert({
    gmail_id: labelId,
    user_email: userEmail,
    name,
    type: "user",
    message_list_visibility: "show",
    label_list_visibility: "labelShow",
    color_background: null,
    color_text: null
  });
}
function createLabelRecord(gs, input) {
  ensureSystemLabels(gs, input.user_email);
  const labelId = input.gmail_id ?? `Label_${randomBytes(8).toString("hex")}`;
  return gs.labels.insert({
    gmail_id: labelId,
    user_email: input.user_email,
    name: input.name,
    type: input.type ?? "user",
    message_list_visibility: input.message_list_visibility ?? "show",
    label_list_visibility: input.label_list_visibility ?? "labelShow",
    color_background: input.color_background ?? null,
    color_text: input.color_text ?? null
  });
}
function updateLabelRecord(gs, label, input) {
  return gs.labels.update(label.id, {
    name: input.name !== void 0 ? input.name : label.name,
    message_list_visibility: input.message_list_visibility !== void 0 ? input.message_list_visibility : label.message_list_visibility,
    label_list_visibility: input.label_list_visibility !== void 0 ? input.label_list_visibility : label.label_list_visibility,
    color_background: input.color_background !== void 0 ? input.color_background : label.color_background,
    color_text: input.color_text !== void 0 ? input.color_text : label.color_text
  }) ?? label;
}
function isSystemLabelId(labelId) {
  return SYSTEM_LABEL_IDS.has(labelId);
}
function findLabelById(gs, userEmail, labelId) {
  return gs.labels.findBy("user_email", userEmail).find((label) => label.gmail_id === labelId);
}
function findLabelByName(gs, userEmail, name) {
  const normalized = name.trim().toLowerCase();
  return gs.labels.findBy("user_email", userEmail).find((label) => label.name.trim().toLowerCase() === normalized);
}
function listLabelsForUser(gs, userEmail) {
  ensureSystemLabels(gs, userEmail);
  return gs.labels.findBy("user_email", userEmail).sort((a, b) => {
    if (a.type !== b.type) return a.type === "system" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
function computeLabelStats(gs, userEmail) {
  const stats = /* @__PURE__ */ new Map();
  const messages = gs.messages.findBy("user_email", userEmail);
  const isUnread = (message) => message.label_ids.includes("UNREAD");
  for (const message of messages) {
    for (const labelId of message.label_ids) {
      let entry = stats.get(labelId);
      if (!entry) {
        entry = { messagesTotal: 0, messagesUnread: 0, threadsTotal: /* @__PURE__ */ new Set(), threadsUnread: /* @__PURE__ */ new Set() };
        stats.set(labelId, entry);
      }
      entry.messagesTotal++;
      entry.threadsTotal.add(message.thread_id);
      if (isUnread(message)) {
        entry.messagesUnread++;
        entry.threadsUnread.add(message.thread_id);
      }
    }
  }
  return stats;
}
function formatLabelWithStats(label, stats) {
  return {
    id: label.gmail_id,
    name: label.name,
    type: label.type === "system" ? "system" : "user",
    messageListVisibility: label.message_list_visibility ?? void 0,
    labelListVisibility: label.label_list_visibility ?? void 0,
    messagesTotal: stats?.messagesTotal ?? 0,
    messagesUnread: stats?.messagesUnread ?? 0,
    threadsTotal: stats?.threadsTotal.size ?? 0,
    threadsUnread: stats?.threadsUnread.size ?? 0,
    color: label.color_background || label.color_text ? {
      backgroundColor: label.color_background ?? void 0,
      textColor: label.color_text ?? void 0
    } : void 0
  };
}
function formatLabelResource(gs, label) {
  const stats = computeLabelStats(gs, label.user_email);
  return formatLabelWithStats(label, stats.get(label.gmail_id));
}
function formatLabelResources(gs, labels) {
  if (labels.length === 0) return [];
  const stats = computeLabelStats(gs, labels[0].user_email);
  return labels.map((label) => formatLabelWithStats(label, stats.get(label.gmail_id)));
}
function normalizeLabelQuery(value) {
  const cleaned = cleanToken(value);
  const alias = LABEL_ALIASES[cleaned.toLowerCase()];
  return alias ?? cleaned;
}
function findMissingLabelIds(gs, userEmail, labelIds) {
  ensureSystemLabels(gs, userEmail);
  return labelIds.filter((labelId) => !findLabelById(gs, userEmail, labelId));
}
function dedupeLabelIds(labelIds) {
  return [...new Set(labelIds.filter(Boolean))];
}
function createStoredMessage(gs, input, options) {
  ensureSystemLabels(gs, input.user_email);
  const parsedRaw = input.raw ? parseRawMessage(input.raw) : null;
  const merged = {
    raw: input.raw ?? null,
    from: input.from ?? parsedRaw?.from ?? "",
    to: input.to ?? parsedRaw?.to ?? "",
    cc: input.cc ?? parsedRaw?.cc ?? null,
    bcc: input.bcc ?? parsedRaw?.bcc ?? null,
    reply_to: input.reply_to ?? parsedRaw?.reply_to ?? null,
    subject: input.subject ?? parsedRaw?.subject ?? "",
    body_text: input.body_text ?? parsedRaw?.body_text ?? null,
    body_html: input.body_html ?? parsedRaw?.body_html ?? null,
    message_id: input.message_id ?? parsedRaw?.message_id ?? null,
    references: input.references ?? parsedRaw?.references ?? null,
    in_reply_to: input.in_reply_to ?? parsedRaw?.in_reply_to ?? null,
    date_header: input.date ?? parsedRaw?.date_header ?? null
  };
  const internalDateMs = resolveInternalDate(input.internal_date ?? input.date ?? parsedRaw?.date_header ?? void 0);
  const gmailId = input.gmail_id ?? generateUid("msg");
  const threadId = resolveThreadId(gs, input.user_email, input.thread_id, merged.in_reply_to, merged.references);
  const messageId = merged.message_id ?? `<${gmailId}@emulate.google.local>`;
  const baseLabelIds = dedupeLabelIds(input.label_ids ?? options?.defaultLabelIds ?? []);
  if (options?.createMissingCustomLabels) {
    for (const labelId of baseLabelIds.filter((labelId2) => !isSystemLabelId(labelId2))) {
      ensureCustomLabel(gs, input.user_email, labelId);
    }
  }
  const labelIds = applyFiltersToLabelIds(gs, input.user_email, merged.from, baseLabelIds);
  const snippet = input.snippet?.trim() || deriveSnippet(merged.body_text ?? merged.body_html ?? merged.subject) || merged.subject;
  const raw = merged.raw ?? buildRawMessage({
    from: merged.from,
    to: merged.to,
    cc: merged.cc,
    bcc: merged.bcc,
    reply_to: merged.reply_to,
    subject: merged.subject,
    body_text: merged.body_text,
    body_html: merged.body_html,
    message_id: messageId,
    references: merged.references,
    in_reply_to: merged.in_reply_to,
    date_header: new Date(internalDateMs).toUTCString()
  });
  const historyId = generateHistoryId();
  const message = gs.messages.insert({
    gmail_id: gmailId,
    thread_id: threadId,
    user_email: input.user_email,
    history_id: historyId,
    internal_date: String(internalDateMs),
    raw,
    label_ids: labelIds,
    snippet,
    subject: merged.subject,
    from: merged.from,
    to: merged.to,
    cc: merged.cc,
    bcc: merged.bcc,
    reply_to: merged.reply_to,
    message_id: messageId,
    references: merged.references,
    in_reply_to: merged.in_reply_to,
    date_header: new Date(internalDateMs).toUTCString(),
    body_text: merged.body_text,
    body_html: merged.body_html
  });
  replaceMessageAttachments(gs, message, parsedRaw?.attachments ?? []);
  recordHistoryEvents(gs, message.user_email, historyId, [
    {
      change_type: "messageAdded",
      message_gmail_id: message.gmail_id,
      thread_id: message.thread_id,
      label_ids: message.label_ids
    }
  ]);
  syncDraftState(gs, message);
  return message;
}
function updateStoredMessage(gs, message, input) {
  const parsedRaw = input.raw ? parseRawMessage(input.raw) : null;
  const internalDateMs = resolveInternalDate(
    input.internal_date ?? input.date ?? parsedRaw?.date_header ?? Date.now().toString()
  );
  const merged = {
    raw: input.raw ?? message.raw,
    from: input.from ?? parsedRaw?.from ?? message.from,
    to: input.to ?? parsedRaw?.to ?? message.to,
    cc: input.cc ?? parsedRaw?.cc ?? message.cc,
    bcc: input.bcc ?? parsedRaw?.bcc ?? message.bcc,
    reply_to: input.reply_to ?? parsedRaw?.reply_to ?? message.reply_to,
    subject: input.subject ?? parsedRaw?.subject ?? message.subject,
    body_text: input.body_text ?? parsedRaw?.body_text ?? message.body_text,
    body_html: input.body_html ?? parsedRaw?.body_html ?? message.body_html,
    message_id: input.message_id ?? parsedRaw?.message_id ?? message.message_id,
    references: input.references ?? parsedRaw?.references ?? message.references,
    in_reply_to: input.in_reply_to ?? parsedRaw?.in_reply_to ?? message.in_reply_to,
    date_header: input.date ?? parsedRaw?.date_header ?? message.date_header
  };
  const snippet = input.snippet?.trim() || deriveSnippet(merged.body_text ?? merged.body_html ?? merged.subject) || merged.subject;
  const labelIds = dedupeLabelIds(input.label_ids ?? message.label_ids);
  const raw = merged.raw ?? buildRawMessage({
    from: merged.from,
    to: merged.to,
    cc: merged.cc,
    bcc: merged.bcc,
    reply_to: merged.reply_to,
    subject: merged.subject,
    body_text: merged.body_text,
    body_html: merged.body_html,
    message_id: merged.message_id,
    references: merged.references,
    in_reply_to: merged.in_reply_to,
    date_header: new Date(internalDateMs).toUTCString()
  });
  const updated = gs.messages.update(message.id, {
    thread_id: input.thread_id ?? message.thread_id,
    history_id: generateHistoryId(),
    internal_date: String(internalDateMs),
    raw,
    label_ids: labelIds,
    snippet,
    subject: merged.subject,
    from: merged.from,
    to: merged.to,
    cc: merged.cc,
    bcc: merged.bcc,
    reply_to: merged.reply_to,
    message_id: merged.message_id,
    references: merged.references,
    in_reply_to: merged.in_reply_to,
    date_header: new Date(internalDateMs).toUTCString(),
    body_text: merged.body_text,
    body_html: merged.body_html
  }) ?? message;
  replaceMessageAttachments(gs, updated, parsedRaw?.attachments ?? []);
  syncDraftState(gs, updated);
  return updated;
}
function getMessageById(gs, userEmail, messageId) {
  return gs.messages.findBy("user_email", userEmail).find((message) => message.gmail_id === messageId);
}
function getDraftById(gs, userEmail, draftId) {
  return gs.drafts.findBy("user_email", userEmail).find((draft) => draft.gmail_id === draftId);
}
function getDraftMessage(gs, draft) {
  return getMessageById(gs, draft.user_email, draft.message_gmail_id);
}
function getAttachmentById(gs, userEmail, messageId, attachmentId) {
  return gs.attachments.findBy("message_gmail_id", messageId).find((attachment) => attachment.user_email === userEmail && attachment.gmail_id === attachmentId);
}
function listDraftsForUser(gs, userEmail) {
  const drafts = gs.drafts.findBy("user_email", userEmail);
  const messageMap = /* @__PURE__ */ new Map();
  for (const draft of drafts) {
    messageMap.set(draft.gmail_id, getDraftMessage(gs, draft));
  }
  return drafts.filter((draft) => {
    const message = messageMap.get(draft.gmail_id);
    return Boolean(message && message.label_ids.includes("DRAFT") && !message.label_ids.includes("SENT"));
  }).sort((a, b) => {
    const aMessage = messageMap.get(a.gmail_id);
    const bMessage = messageMap.get(b.gmail_id);
    return Number(bMessage?.internal_date ?? 0) - Number(aMessage?.internal_date ?? 0);
  });
}
function formatDraftResource(gs, draft, format, metadataHeaders = []) {
  const message = getDraftMessage(gs, draft);
  if (!message) return { id: draft.gmail_id };
  return {
    id: draft.gmail_id,
    message: formatMessageResource(gs, message, format, metadataHeaders)
  };
}
function createDraftMessage(gs, input) {
  const message = createStoredMessage(gs, {
    ...input,
    label_ids: dedupeLabelIds([...(input.label_ids ?? []).filter((labelId) => labelId !== "SENT"), "DRAFT"])
  });
  const draft = syncDraftState(gs, message);
  return { draft, message };
}
function updateDraftMessage(gs, draft, input) {
  const message = getDraftMessage(gs, draft);
  if (!message) return null;
  const updated = updateStoredMessage(gs, message, {
    ...input,
    label_ids: dedupeLabelIds([...(message.label_ids ?? []).filter((labelId) => labelId !== "SENT"), "DRAFT"])
  });
  return { draft: syncDraftState(gs, updated, draft.gmail_id) ?? draft, message: updated };
}
function sendDraftMessage(gs, draft) {
  const message = getDraftMessage(gs, draft);
  if (!message) {
    gs.drafts.delete(draft.id);
    return null;
  }
  const sent = markMessageModified(
    gs,
    message,
    message.label_ids.filter((labelId) => labelId !== "DRAFT").concat("SENT")
  );
  clearDraftRecordsForMessage(gs, message.user_email, message.gmail_id);
  return sent;
}
function deleteDraftMessage(gs, draft) {
  const message = getDraftMessage(gs, draft);
  if (!message) return gs.drafts.delete(draft.id);
  return deleteMessage(gs, message);
}
function getCurrentHistoryId(gs, userEmail) {
  const historyIds = [
    ...gs.messages.findBy("user_email", userEmail).map((message) => message.history_id),
    ...gs.history.findBy("user_email", userEmail).map((event) => event.gmail_id)
  ].filter(Boolean);
  if (historyIds.length === 0) return "0";
  return historyIds.reduce((latest, current) => compareHistoryIds(current, latest) > 0 ? current : latest);
}
function listHistoryForUser(gs, userEmail, options) {
  const requestedTypes = options.historyTypes?.length ? new Set(options.historyTypes) : null;
  const events = gs.history.findBy("user_email", userEmail).filter((event) => compareHistoryIds(event.gmail_id, options.startHistoryId) > 0).filter((event) => !requestedTypes || requestedTypes.has(event.change_type)).filter((event) => !options.labelId || event.label_ids.includes(options.labelId)).sort((a, b) => compareHistoryIds(a.gmail_id, b.gmail_id) || a.id - b.id);
  const grouped = /* @__PURE__ */ new Map();
  for (const event of events) {
    const existing = grouped.get(event.gmail_id);
    if (existing) existing.push(event);
    else grouped.set(event.gmail_id, [event]);
  }
  const historyEntries = Array.from(grouped.entries()).map(
    ([historyId, entries]) => formatHistoryEntry(gs, userEmail, historyId, entries)
  );
  const offset = parseOffset(options.pageToken);
  const limit = Math.max(1, Math.min(options.maxResults ?? 100, 500));
  const page = historyEntries.slice(offset, offset + limit);
  const nextPageToken = offset + limit < historyEntries.length ? String(offset + limit) : void 0;
  return {
    history: page,
    historyId: getCurrentHistoryId(gs, userEmail),
    nextPageToken
  };
}
function getFilterById(gs, userEmail, filterId) {
  return gs.filters.findBy("user_email", userEmail).find((filter) => filter.gmail_id === filterId);
}
function listFiltersForUser(gs, userEmail) {
  return gs.filters.findBy("user_email", userEmail).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.gmail_id.localeCompare(b.gmail_id));
}
function findMatchingFilter(gs, input) {
  const criteriaFrom = normalizeFilterFrom(input.criteria_from);
  const addLabelIds = sortStrings(dedupeLabelIds(input.add_label_ids ?? []));
  const removeLabelIds = sortStrings(dedupeLabelIds(input.remove_label_ids ?? []));
  return gs.filters.findBy("user_email", input.user_email).find(
    (filter) => normalizeFilterFrom(filter.criteria_from) === criteriaFrom && arrayEquals(sortStrings(filter.add_label_ids), addLabelIds) && arrayEquals(sortStrings(filter.remove_label_ids), removeLabelIds)
  );
}
function createFilterRecord(gs, input) {
  return gs.filters.insert({
    gmail_id: input.gmail_id ?? generateUid("filter"),
    user_email: input.user_email,
    criteria_from: normalizeFilterFrom(input.criteria_from),
    add_label_ids: dedupeLabelIds(input.add_label_ids ?? []),
    remove_label_ids: dedupeLabelIds(input.remove_label_ids ?? [])
  });
}
function formatFilterResource(filter) {
  return {
    id: filter.gmail_id,
    criteria: filter.criteria_from ? { from: filter.criteria_from } : {},
    action: {
      ...filter.add_label_ids.length > 0 ? { addLabelIds: filter.add_label_ids } : {},
      ...filter.remove_label_ids.length > 0 ? { removeLabelIds: filter.remove_label_ids } : {}
    }
  };
}
function listForwardingAddressesForUser(gs, userEmail) {
  return gs.forwardingAddresses.findBy("user_email", userEmail).sort((a, b) => a.forwarding_email.localeCompare(b.forwarding_email));
}
function formatForwardingAddressResource(entry) {
  return {
    forwardingEmail: entry.forwarding_email,
    verificationStatus: entry.verification_status
  };
}
function listSendAsForUser(gs, userEmail) {
  ensureDefaultSendAs(gs, userEmail);
  return gs.sendAs.findBy("user_email", userEmail).sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.send_as_email.localeCompare(b.send_as_email));
}
function formatSendAsResource(entry) {
  return {
    sendAsEmail: entry.send_as_email,
    displayName: entry.display_name ?? void 0,
    replyToAddress: entry.send_as_email,
    signature: entry.signature,
    isPrimary: entry.is_default,
    isDefault: entry.is_default,
    treatAsAlias: false,
    verificationStatus: "accepted"
  };
}
function listMessagesForUser(gs, userEmail, options) {
  let messages = gs.messages.findBy("user_email", userEmail);
  if (!options?.includeSpamTrash) {
    messages = messages.filter(
      (message) => !message.label_ids.includes("TRASH") && !message.label_ids.includes("SPAM")
    );
  }
  if (options?.labelIds?.length) {
    messages = messages.filter((message) => options.labelIds.every((labelId) => message.label_ids.includes(labelId)));
  }
  if (options?.query) {
    const matcher = buildMessageQueryMatcher(gs, userEmail, options.query);
    messages = messages.filter(matcher);
  }
  return sortMessagesByDateDesc(messages);
}
function groupThreads(messages) {
  const threadMap = /* @__PURE__ */ new Map();
  for (const message of messages) {
    const existing = threadMap.get(message.thread_id);
    if (existing) existing.push(message);
    else threadMap.set(message.thread_id, [message]);
  }
  return Array.from(threadMap.entries()).map(([threadId, entries]) => {
    const ordered = sortMessagesByDateAsc(entries);
    const latest = ordered.at(-1);
    return {
      id: threadId,
      snippet: latest.snippet,
      historyId: latest.history_id,
      messages: ordered
    };
  }).sort((a, b) => Number(b.messages.at(-1)?.internal_date ?? 0) - Number(a.messages.at(-1)?.internal_date ?? 0));
}
function getThreadMessages(gs, userEmail, threadId, options) {
  let messages = gs.messages.findBy("user_email", userEmail).filter((message) => message.thread_id === threadId);
  if (!options?.includeSpamTrash) {
    messages = messages.filter(
      (message) => !message.label_ids.includes("TRASH") && !message.label_ids.includes("SPAM")
    );
  }
  return sortMessagesByDateAsc(messages);
}
function formatMessageResource(gs, message, format, metadataHeaders = []) {
  const headers = buildHeaders(message);
  const filteredHeaders = format === "metadata" && metadataHeaders.length > 0 ? headers.filter((header) => metadataHeaders.includes(header.name)) : headers;
  const base = {
    id: message.gmail_id,
    threadId: message.thread_id,
    labelIds: message.label_ids,
    snippet: message.snippet,
    historyId: message.history_id,
    internalDate: message.internal_date,
    sizeEstimate: estimateSize(message, headers)
  };
  if (format === "minimal") return base;
  if (format === "raw") return { ...base, raw: message.raw ?? void 0 };
  return {
    ...base,
    payload: buildPayload(gs, message, filteredHeaders, format)
  };
}
function formatThreadResource(gs, messages, format, metadataHeaders = []) {
  const ordered = sortMessagesByDateAsc(messages);
  const latest = ordered.at(-1);
  return {
    id: latest.thread_id,
    historyId: latest.history_id,
    snippet: latest.snippet,
    messages: ordered.map((message) => formatMessageResource(gs, message, format, metadataHeaders))
  };
}
function applyLabelMutation(labelIds, addLabelIds = [], removeLabelIds = []) {
  const next = new Set(labelIds);
  for (const labelId of addLabelIds) next.add(labelId);
  for (const labelId of removeLabelIds) next.delete(labelId);
  return [...next];
}
function markMessageModified(gs, message, nextLabelIds) {
  const dedupedLabelIds = dedupeLabelIds(nextLabelIds);
  if (arrayEquals(message.label_ids, dedupedLabelIds)) {
    syncDraftState(gs, message);
    return message;
  }
  const historyId = generateHistoryId();
  const addedLabelIds = dedupedLabelIds.filter((labelId) => !message.label_ids.includes(labelId));
  const removedLabelIds = message.label_ids.filter((labelId) => !dedupedLabelIds.includes(labelId));
  const updated = gs.messages.update(message.id, {
    label_ids: dedupedLabelIds,
    history_id: historyId
  }) ?? message;
  const historyEvents = [];
  if (addedLabelIds.length > 0) {
    historyEvents.push({
      change_type: "labelAdded",
      message_gmail_id: updated.gmail_id,
      thread_id: updated.thread_id,
      label_ids: addedLabelIds
    });
  }
  if (removedLabelIds.length > 0) {
    historyEvents.push({
      change_type: "labelRemoved",
      message_gmail_id: updated.gmail_id,
      thread_id: updated.thread_id,
      label_ids: removedLabelIds
    });
  }
  if (historyEvents.length > 0) {
    recordHistoryEvents(gs, updated.user_email, historyId, historyEvents);
  }
  syncDraftState(gs, updated);
  return updated;
}
function deleteMessage(gs, message) {
  const historyId = generateHistoryId();
  recordHistoryEvents(gs, message.user_email, historyId, [
    {
      change_type: "messageDeleted",
      message_gmail_id: message.gmail_id,
      thread_id: message.thread_id,
      label_ids: message.label_ids
    }
  ]);
  clearDraftRecordsForMessage(gs, message.user_email, message.gmail_id);
  clearMessageAttachments(gs, message.user_email, message.gmail_id);
  return gs.messages.delete(message.id);
}
function trashLabelIds(labelIds) {
  const next = new Set(labelIds);
  next.add("TRASH");
  next.delete("INBOX");
  return [...next];
}
function untrashLabelIds(labelIds) {
  const next = new Set(labelIds);
  next.delete("TRASH");
  if (!next.has("SENT") && !next.has("DRAFT")) {
    next.add("INBOX");
  }
  return [...next];
}
function buildMessageQueryMatcher(gs, userEmail, query) {
  const terms = query.match(/"[^"]+"|\S+/g) ?? [];
  const predicates = terms.flatMap((term) => buildQueryPredicates(gs, userEmail, term));
  if (!predicates.length) return () => true;
  return (message) => predicates.every((predicate) => predicate(message));
}
function buildRawMessage(message) {
  const headers = [
    `From: ${message.from}`,
    `To: ${message.to}`,
    ...message.cc ? [`Cc: ${message.cc}`] : [],
    ...message.bcc ? [`Bcc: ${message.bcc}`] : [],
    ...message.reply_to ? [`Reply-To: ${message.reply_to}`] : [],
    `Subject: ${message.subject}`,
    ...message.message_id ? [`Message-ID: ${message.message_id}`] : [],
    ...message.references ? [`References: ${message.references}`] : [],
    ...message.in_reply_to ? [`In-Reply-To: ${message.in_reply_to}`] : [],
    `Date: ${message.date_header ?? (/* @__PURE__ */ new Date()).toUTCString()}`,
    "MIME-Version: 1.0"
  ];
  const attachments = message.attachments ?? [];
  if (attachments.length > 0) {
    const mixedBoundary = `emulate-mixed-${randomBytes(8).toString("hex")}`;
    headers.push(`Content-Type: multipart/mixed; boundary="${mixedBoundary}"`);
    const parts = [];
    const bodyPart2 = buildMimeBodyPart({
      body_text: message.body_text,
      body_html: message.body_html
    });
    if (bodyPart2) {
      parts.push(`--${mixedBoundary}`, bodyPart2);
    }
    for (const attachment of attachments) {
      const disposition = attachment.disposition ?? "attachment";
      const contentId = attachment.content_id ? ensureWrappedContentId(attachment.content_id) : null;
      parts.push(`--${mixedBoundary}`);
      parts.push(`Content-Type: ${attachment.mime_type}; name="${escapeMimeParameter(attachment.filename)}"`);
      parts.push(`Content-Disposition: ${disposition}; filename="${escapeMimeParameter(attachment.filename)}"`);
      if (contentId) parts.push(`Content-ID: ${contentId}`);
      parts.push("Content-Transfer-Encoding: base64");
      parts.push("");
      parts.push(wrapBase64(encodeAttachmentContent(attachment.content)));
    }
    parts.push(`--${mixedBoundary}--`, "");
    return Buffer.from(`${headers.join("\r\n")}\r
\r
${parts.join("\r\n")}`, "utf8").toString("base64url");
  }
  const bodyPart = buildMimeBodyPart({
    body_text: message.body_text,
    body_html: message.body_html
  });
  if (bodyPart) {
    return Buffer.from(`${headers.join("\r\n")}\r
\r
${bodyPart}`, "utf8").toString("base64url");
  }
  headers.push("Content-Type: text/plain; charset=utf-8");
  return Buffer.from(`${headers.join("\r\n")}\r
\r
`, "utf8").toString("base64url");
}
function buildQueryPredicates(gs, userEmail, term) {
  const cleaned = cleanToken(term);
  if (!cleaned) return [];
  const lower = cleaned.toLowerCase();
  if (lower === "or" || lower === "and") return [];
  if (lower.startsWith("-label:")) {
    const labelQuery = cleaned.slice(7);
    return [(message) => !messageMatchesLabelQuery(gs, userEmail, message, labelQuery)];
  }
  if (lower.startsWith("label:")) {
    const labelQuery = cleaned.slice(6);
    return [(message) => messageMatchesLabelQuery(gs, userEmail, message, labelQuery)];
  }
  if (lower.startsWith("in:")) {
    const labelQuery = cleaned.slice(3);
    return [(message) => messageMatchesLabelQuery(gs, userEmail, message, labelQuery)];
  }
  if (lower.startsWith("is:")) {
    const state = cleaned.slice(3).toLowerCase();
    if (state === "read") return [(message) => !message.label_ids.includes("UNREAD")];
    return [(message) => messageMatchesLabelQuery(gs, userEmail, message, state)];
  }
  if (lower.startsWith("from:")) {
    const value2 = cleaned.slice(5).toLowerCase();
    return value2 ? [(message) => message.from.toLowerCase().includes(value2)] : [];
  }
  if (lower.startsWith("to:")) {
    const value2 = cleaned.slice(3).toLowerCase();
    return value2 ? [(message) => message.to.toLowerCase().includes(value2)] : [];
  }
  if (lower.startsWith("subject:")) {
    const value2 = cleaned.slice(8).toLowerCase();
    return value2 ? [(message) => message.subject.toLowerCase().includes(value2)] : [];
  }
  if (lower.startsWith("rfc822msgid:")) {
    const value2 = cleaned.slice(11).replace(/[<>]/g, "").toLowerCase();
    return value2 ? [(message) => message.message_id.replace(/[<>]/g, "").toLowerCase() === value2] : [];
  }
  if (lower.startsWith("before:")) {
    const timestamp = parseDateFilter(cleaned.slice(7));
    return timestamp != null ? [(message) => Number(message.internal_date) < timestamp] : [];
  }
  if (lower.startsWith("after:")) {
    const timestamp = parseDateFilter(cleaned.slice(6));
    return timestamp != null ? [(message) => Number(message.internal_date) > timestamp] : [];
  }
  if (lower === "has:attachment") {
    return [(message) => hasMessageAttachments(gs, message)];
  }
  const value = cleaned.toLowerCase();
  return value ? [(message) => searchableText(message).includes(value)] : [];
}
function resolveInternalDate(value) {
  if (!value) return Date.now();
  if (/^\d+$/.test(value)) {
    const parsed2 = Number.parseInt(value, 10);
    if (String(parsed2).length >= 13) return parsed2;
    return parsed2 * 1e3;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}
function formatHistoryEntry(gs, userEmail, historyId, events) {
  const messages = /* @__PURE__ */ new Map();
  const messagesAdded = [];
  const messagesDeleted = [];
  const labelsAdded = [];
  const labelsRemoved = [];
  for (const event of events) {
    const message = formatHistoryMessageRef(gs, userEmail, event);
    messages.set(event.message_gmail_id, message);
    if (event.change_type === "messageAdded") {
      messagesAdded.push({ message });
    } else if (event.change_type === "messageDeleted") {
      messagesDeleted.push({ message });
    } else if (event.change_type === "labelAdded") {
      labelsAdded.push({ message, labelIds: event.label_ids });
    } else if (event.change_type === "labelRemoved") {
      labelsRemoved.push({ message, labelIds: event.label_ids });
    }
  }
  return {
    id: historyId,
    messages: Array.from(messages.values()),
    ...messagesAdded.length > 0 ? { messagesAdded } : {},
    ...messagesDeleted.length > 0 ? { messagesDeleted } : {},
    ...labelsAdded.length > 0 ? { labelsAdded } : {},
    ...labelsRemoved.length > 0 ? { labelsRemoved } : {}
  };
}
function formatHistoryMessageRef(gs, userEmail, event) {
  const message = getMessageById(gs, userEmail, event.message_gmail_id);
  return {
    id: event.message_gmail_id,
    threadId: message?.thread_id ?? event.thread_id,
    labelIds: message?.label_ids ?? event.label_ids,
    historyId: message?.history_id ?? event.gmail_id,
    ...message?.internal_date ? { internalDate: message.internal_date } : {}
  };
}
function compareHistoryIds(left, right) {
  try {
    const leftValue = BigInt(left);
    const rightValue = BigInt(right);
    if (leftValue === rightValue) return 0;
    return leftValue > rightValue ? 1 : -1;
  } catch {
    return left.localeCompare(right);
  }
}
function resolveThreadId(gs, userEmail, explicitThreadId, inReplyTo, references) {
  if (explicitThreadId) return explicitThreadId;
  const linkedIds = [inReplyTo, references].flatMap((value) => value ? value.split(/\s+/) : []).map((value) => value.trim()).filter(Boolean);
  for (const headerMessageId of linkedIds) {
    const linkedMessage = gs.messages.findBy("user_email", userEmail).find((message) => message.message_id === headerMessageId);
    if (linkedMessage) return linkedMessage.thread_id;
  }
  return generateUid("thr");
}
function replaceMessageAttachments(gs, message, attachments) {
  clearMessageAttachments(gs, message.user_email, message.gmail_id);
  for (const attachment of attachments) {
    gs.attachments.insert({
      gmail_id: generateUid("att"),
      user_email: message.user_email,
      message_gmail_id: message.gmail_id,
      filename: attachment.filename,
      mime_type: attachment.mime_type,
      disposition: attachment.disposition,
      content_id: attachment.content_id,
      transfer_encoding: attachment.transfer_encoding,
      data: attachment.data,
      size: attachment.size
    });
  }
}
function recordHistoryEvents(gs, userEmail, historyId, events) {
  for (const event of events) {
    gs.history.insert({
      gmail_id: historyId,
      user_email: userEmail,
      change_type: event.change_type,
      message_gmail_id: event.message_gmail_id,
      thread_id: event.thread_id,
      label_ids: dedupeLabelIds(event.label_ids)
    });
  }
}
function applyFiltersToLabelIds(gs, userEmail, from, labelIds) {
  if (!from) return labelIds;
  let nextLabelIds = dedupeLabelIds(labelIds);
  for (const filter of gs.filters.findBy("user_email", userEmail)) {
    if (!matchesFilter(filter, from)) continue;
    nextLabelIds = applyLabelMutation(nextLabelIds, filter.add_label_ids, filter.remove_label_ids);
  }
  return nextLabelIds;
}
function syncDraftState(gs, message, preferredDraftId) {
  const shouldHaveDraft = message.label_ids.includes("DRAFT") && !message.label_ids.includes("SENT");
  const existing = gs.drafts.findBy("message_gmail_id", message.gmail_id).filter((draft) => draft.user_email === message.user_email);
  if (!shouldHaveDraft) {
    for (const draft of existing) {
      gs.drafts.delete(draft.id);
    }
    return void 0;
  }
  if (existing[0]) return existing[0];
  return gs.drafts.insert({
    gmail_id: preferredDraftId ?? generateDraftId(),
    user_email: message.user_email,
    message_gmail_id: message.gmail_id
  });
}
function clearDraftRecordsForMessage(gs, userEmail, messageId) {
  const drafts = gs.drafts.findBy("message_gmail_id", messageId).filter((draft) => draft.user_email === userEmail);
  for (const draft of drafts) {
    gs.drafts.delete(draft.id);
  }
}
function clearMessageAttachments(gs, userEmail, messageId) {
  const attachments = gs.attachments.findBy("message_gmail_id", messageId).filter((attachment) => attachment.user_email === userEmail);
  for (const attachment of attachments) {
    gs.attachments.delete(attachment.id);
  }
}
function listAttachmentsForMessage(gs, message) {
  return gs.attachments.findBy("message_gmail_id", message.gmail_id).filter((attachment) => attachment.user_email === message.user_email).sort((a, b) => a.created_at.localeCompare(b.created_at));
}
function hasMessageAttachments(gs, message) {
  return gs.attachments.findBy("message_gmail_id", message.gmail_id).some((attachment) => attachment.user_email === message.user_email);
}
function ensureDefaultSendAs(gs, userEmail) {
  const existing = gs.sendAs.findBy("user_email", userEmail);
  if (existing.length > 0) {
    if (!existing.some((entry) => entry.is_default)) {
      gs.sendAs.update(existing[0].id, { is_default: true });
    }
    return;
  }
  const user = gs.users.findOneBy("email", userEmail);
  gs.sendAs.insert({
    user_email: userEmail,
    send_as_email: userEmail,
    display_name: user?.name?.trim() || userEmail.split("@")[0],
    is_default: true,
    signature: ""
  });
}
function matchesFilter(filter, from) {
  if (filter.criteria_from) {
    return from.toLowerCase().includes(filter.criteria_from.toLowerCase());
  }
  return true;
}
function normalizeFilterFrom(value) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
function sortStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}
function arrayEquals(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}
function messageMatchesLabelQuery(gs, userEmail, message, query) {
  const normalized = normalizeLabelQuery(query);
  if (message.label_ids.includes(normalized)) return true;
  return message.label_ids.some((labelId) => {
    const label = findLabelById(gs, userEmail, labelId);
    return label?.name.toLowerCase() === cleanToken(query).toLowerCase();
  });
}
function parseDateFilter(value) {
  const trimmed = cleanToken(value);
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const parsed2 = Number.parseInt(trimmed, 10);
    return String(parsed2).length >= 13 ? parsed2 : parsed2 * 1e3;
  }
  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
function searchableText(message) {
  return [
    message.subject,
    message.from,
    message.to,
    message.cc ?? "",
    message.bcc ?? "",
    message.snippet,
    message.body_text ?? "",
    stripHtml(message.body_html ?? "")
  ].join(" ").toLowerCase();
}
function cleanToken(token) {
  return token.trim().replace(/^[()]+/, "").replace(/[()]+$/, "").replace(/^"(.*)"$/, "$1");
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function buildHeaders(message) {
  const headers = [
    { name: "From", value: message.from },
    { name: "To", value: message.to },
    { name: "Cc", value: message.cc },
    { name: "Bcc", value: message.bcc },
    { name: "Reply-To", value: message.reply_to },
    { name: "Subject", value: message.subject },
    { name: "Date", value: message.date_header },
    { name: "Message-ID", value: message.message_id },
    { name: "References", value: message.references },
    { name: "In-Reply-To", value: message.in_reply_to }
  ];
  return headers.filter((header) => Boolean(header.value));
}
function buildPayload(gs, message, headers, format) {
  const textBody = message.body_text ?? null;
  const htmlBody = message.body_html ?? null;
  const attachments = listAttachmentsForMessage(gs, message);
  if (format === "metadata") {
    return {
      partId: "",
      mimeType: attachments.length > 0 ? "multipart/mixed" : htmlBody ? "text/html" : "text/plain",
      filename: "",
      headers,
      body: { size: 0 }
    };
  }
  if (attachments.length === 0) {
    if (textBody && htmlBody) {
      return {
        partId: "",
        mimeType: "multipart/alternative",
        filename: "",
        headers,
        body: { size: 0 },
        parts: [createTextBodyPart("0", "text/plain", textBody), createTextBodyPart("1", "text/html", htmlBody)]
      };
    }
    if (htmlBody) return createTextBodyPart("", "text/html", htmlBody, headers);
    if (textBody) return createTextBodyPart("", "text/plain", textBody, headers);
    return {
      partId: "",
      mimeType: "text/plain",
      filename: "",
      headers,
      body: { size: 0 }
    };
  }
  const parts = [];
  if (textBody && htmlBody) {
    parts.push({
      partId: "0",
      mimeType: "multipart/alternative",
      filename: "",
      headers: [],
      body: { size: 0 },
      parts: [createTextBodyPart("0.0", "text/plain", textBody), createTextBodyPart("0.1", "text/html", htmlBody)]
    });
  } else if (htmlBody) {
    parts.push(createTextBodyPart("0", "text/html", htmlBody));
  } else if (textBody) {
    parts.push(createTextBodyPart("0", "text/plain", textBody));
  }
  for (const [index, attachment] of attachments.entries()) {
    parts.push(createAttachmentPart(String(parts.length + index), attachment));
  }
  return {
    partId: "",
    mimeType: "multipart/mixed",
    filename: "",
    headers,
    body: { size: 0 },
    parts
  };
}
function createTextBodyPart(partId, mimeType, content, headers = []) {
  return {
    partId,
    mimeType,
    filename: "",
    headers,
    body: {
      size: Buffer.byteLength(content, "utf8"),
      data: Buffer.from(content, "utf8").toString("base64url")
    }
  };
}
function createAttachmentPart(partId, attachment) {
  const headers = [
    {
      name: "Content-Type",
      value: attachment.filename ? `${attachment.mime_type}; name="${attachment.filename}"` : attachment.mime_type
    },
    {
      name: "Content-Disposition",
      value: `${attachment.disposition ?? "attachment"}; filename="${attachment.filename}"`
    }
  ];
  if (attachment.transfer_encoding) {
    headers.push({ name: "Content-Transfer-Encoding", value: attachment.transfer_encoding });
  }
  if (attachment.content_id) {
    headers.push({ name: "Content-ID", value: attachment.content_id });
  }
  return {
    partId,
    mimeType: attachment.mime_type,
    filename: attachment.filename,
    headers,
    body: {
      attachmentId: attachment.gmail_id,
      size: attachment.size
    }
  };
}
function estimateSize(message, preBuiltHeaders) {
  if (message.raw) {
    return Buffer.byteLength(message.raw, "utf8");
  }
  const headers = (preBuiltHeaders ?? buildHeaders(message)).map((header) => `${header.name}: ${header.value}`).join("\n");
  const body = `${message.body_text ?? ""}
${message.body_html ?? ""}`;
  return Buffer.byteLength(`${headers}

${body}`, "utf8");
}
function deriveSnippet(value) {
  return stripHtml(value).slice(0, 140);
}
function sortMessagesByDateDesc(messages) {
  return [...messages].sort((a, b) => Number(b.internal_date) - Number(a.internal_date));
}
function sortMessagesByDateAsc(messages) {
  return [...messages].sort((a, b) => Number(a.internal_date) - Number(b.internal_date));
}
function buildMimeBodyPart(input) {
  if (input.body_text && input.body_html) {
    const boundary = `emulate-alt-${randomBytes(8).toString("hex")}`;
    return [
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      input.body_text,
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      input.body_html,
      `--${boundary}--`,
      ""
    ].join("\r\n");
  }
  if (input.body_html) {
    return ["Content-Type: text/html; charset=utf-8", "", input.body_html].join("\r\n");
  }
  if (input.body_text) {
    return ["Content-Type: text/plain; charset=utf-8", "", input.body_text].join("\r\n");
  }
  return null;
}
function encodeAttachmentContent(content) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  return buffer.toString("base64");
}
function wrapBase64(value) {
  return value.replace(/.{1,76}/g, "$&\r\n").trimEnd();
}
function escapeMimeParameter(value) {
  return value.replace(/"/g, '\\"');
}
function ensureWrappedContentId(value) {
  if (value.startsWith("<") && value.endsWith(">")) return value;
  return `<${value}>`;
}
function parseRawMessage(raw) {
  const decoded = decodeBase64Like(raw).toString("utf8").replace(/\r\n/g, "\n");
  const root = parseMimeEntity(decoded);
  const attachments = collectMimeNodes(root).filter((node) => isAttachmentNode(node)).map((node) => ({
    filename: node.filename || "attachment",
    mime_type: node.mimeType || "application/octet-stream",
    disposition: node.disposition,
    content_id: node.contentId,
    transfer_encoding: node.transferEncoding,
    data: (node.body ?? Buffer.alloc(0)).toString("base64url"),
    size: node.body?.length ?? 0
  }));
  return {
    raw,
    from: root.headers.get("from") ?? "",
    to: root.headers.get("to") ?? "",
    cc: root.headers.get("cc") ?? null,
    bcc: root.headers.get("bcc") ?? null,
    reply_to: root.headers.get("reply-to") ?? null,
    subject: root.headers.get("subject") ?? "",
    message_id: root.headers.get("message-id") ?? null,
    references: root.headers.get("references") ?? null,
    in_reply_to: root.headers.get("in-reply-to") ?? null,
    date_header: root.headers.get("date") ?? null,
    body_text: findFirstTextPart(root, "text/plain"),
    body_html: findFirstTextPart(root, "text/html"),
    attachments
  };
}
function parseMimeEntity(source) {
  const normalized = source.replace(/\r\n/g, "\n");
  const separatorIndex = normalized.indexOf("\n\n");
  const headerText = separatorIndex >= 0 ? normalized.slice(0, separatorIndex) : normalized;
  const bodyText = separatorIndex >= 0 ? normalized.slice(separatorIndex + 2) : "";
  const headers = parseHeaders(headerText);
  const contentType = parseHeaderWithParams(headers.get("content-type") ?? "text/plain; charset=utf-8");
  const disposition = parseHeaderWithParams(headers.get("content-disposition") ?? "");
  const boundary = contentType.params.boundary;
  const mimeType = contentType.value.toLowerCase() || "text/plain";
  const filename = disposition.params.filename ?? contentType.params.name ?? "";
  if (mimeType.startsWith("multipart/") && boundary) {
    return {
      mimeType,
      filename,
      headers,
      body: null,
      parts: splitMultipartBody(bodyText, boundary).map((part) => parseMimeEntity(part)),
      disposition: disposition.value || null,
      contentId: headers.get("content-id") ?? null,
      transferEncoding: headers.get("content-transfer-encoding")?.toLowerCase() ?? null,
      charset: contentType.params.charset ?? null
    };
  }
  return {
    mimeType,
    filename,
    headers,
    body: decodeMimeBody(bodyText, headers.get("content-transfer-encoding") ?? null),
    parts: [],
    disposition: disposition.value || null,
    contentId: headers.get("content-id") ?? null,
    transferEncoding: headers.get("content-transfer-encoding")?.toLowerCase() ?? null,
    charset: contentType.params.charset ?? null
  };
}
function parseHeaders(headerText) {
  const headers = /* @__PURE__ */ new Map();
  let currentKey = null;
  for (const line of headerText.split("\n")) {
    if (!line.trim()) continue;
    if ((line.startsWith(" ") || line.startsWith("	")) && currentKey) {
      headers.set(currentKey, `${headers.get(currentKey) ?? ""} ${line.trim()}`.trim());
      continue;
    }
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    currentKey = line.slice(0, separator).trim().toLowerCase();
    headers.set(currentKey, line.slice(separator + 1).trim());
  }
  return headers;
}
function parseHeaderWithParams(value) {
  const [base, ...rest] = value.split(";");
  const params = {};
  for (const token of rest) {
    const separator = token.indexOf("=");
    if (separator < 0) continue;
    const key = token.slice(0, separator).trim().toLowerCase();
    const rawValue = token.slice(separator + 1).trim();
    params[key] = rawValue.replace(/^"(.*)"$/, "$1");
  }
  return {
    value: base.trim(),
    params
  };
}
function splitMultipartBody(body, boundary) {
  const marker = `--${boundary}`;
  const chunks = [];
  for (const segment of body.split(marker)) {
    const trimmed = segment.trim();
    if (!trimmed || trimmed === "--") continue;
    chunks.push(trimmed.replace(/^\n+/, "").replace(/\n+$/, ""));
  }
  return chunks;
}
function decodeMimeBody(body, transferEncoding) {
  const normalizedEncoding = transferEncoding?.toLowerCase() ?? "";
  if (normalizedEncoding === "base64") {
    const compact = body.replace(/\s+/g, "");
    return compact ? Buffer.from(compact, "base64") : Buffer.alloc(0);
  }
  if (normalizedEncoding === "quoted-printable") {
    return decodeQuotedPrintable(body);
  }
  return Buffer.from(body, "utf8");
}
function decodeQuotedPrintable(value) {
  const normalized = value.replace(/=\r?\n/g, "");
  const bytes = [];
  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index];
    if (current === "=" && /^[A-Fa-f0-9]{2}$/.test(normalized.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(normalized.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    bytes.push(normalized.charCodeAt(index));
  }
  return Buffer.from(bytes);
}
function findFirstTextPart(root, mimeType) {
  for (const node of collectMimeNodes(root)) {
    if (node.parts.length > 0) continue;
    if (!node.mimeType.includes(mimeType)) continue;
    if (isAttachmentNode(node)) continue;
    const content = decodeTextNode(node).trim();
    if (content) return content;
  }
  return null;
}
function decodeTextNode(node) {
  const encoding = normalizeCharset(node.charset);
  return (node.body ?? Buffer.alloc(0)).toString(encoding);
}
function normalizeCharset(value) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "utf-8" || normalized === "us-ascii") return "utf8";
  if (normalized === "iso-8859-1" || normalized === "latin1") return "latin1";
  return "utf8";
}
function collectMimeNodes(root) {
  const nodes = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    nodes.push(node);
    if (node.parts.length > 0) {
      queue.push(...node.parts);
    }
  }
  return nodes;
}
function isAttachmentNode(node) {
  if (node.parts.length > 0) return false;
  const disposition = node.disposition?.toLowerCase() ?? "";
  if (node.filename) return true;
  if (disposition.includes("attachment")) return true;
  if (disposition.includes("inline") && !node.mimeType.startsWith("text/")) return true;
  return false;
}
function decodeBase64Like(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - normalized.length % 4);
  return Buffer.from(normalized + padding, "base64");
}
function ensureDefaultCalendars(gs, userEmail) {
  const existing = gs.calendars.findBy("user_email", userEmail);
  if (existing.length > 0) {
    if (!existing.some((calendar) => calendar.primary)) {
      gs.calendars.update(existing[0].id, { primary: true });
    }
    return;
  }
  gs.calendars.insert({
    google_id: "primary",
    user_email: userEmail,
    summary: userEmail,
    description: null,
    time_zone: "UTC",
    primary: true,
    selected: true,
    access_role: "owner",
    background_color: null,
    foreground_color: null
  });
}
function createCalendarRecord(gs, input) {
  const calendarId = input.google_id ?? generateUid("cal");
  const existing = gs.calendars.findBy("user_email", input.user_email).find((calendar) => calendar.google_id === calendarId);
  if (existing) return existing;
  const inserted = gs.calendars.insert({
    google_id: calendarId,
    user_email: input.user_email,
    summary: input.summary,
    description: input.description ?? null,
    time_zone: input.time_zone ?? "UTC",
    primary: input.primary ?? false,
    selected: input.selected ?? true,
    access_role: input.access_role ?? "owner",
    background_color: input.background_color ?? null,
    foreground_color: input.foreground_color ?? null
  });
  if (inserted.primary) {
    for (const calendar of gs.calendars.findBy("user_email", input.user_email)) {
      if (calendar.id !== inserted.id && calendar.primary) {
        gs.calendars.update(calendar.id, { primary: false });
      }
    }
  }
  return inserted;
}
function listCalendarsForUser(gs, userEmail) {
  ensureDefaultCalendars(gs, userEmail);
  return gs.calendars.findBy("user_email", userEmail).sort((a, b) => Number(b.primary) - Number(a.primary) || a.summary.localeCompare(b.summary));
}
function getCalendarById(gs, userEmail, calendarId) {
  ensureDefaultCalendars(gs, userEmail);
  if (calendarId === "primary") {
    const calendars = listCalendarsForUser(gs, userEmail);
    return calendars.find((calendar) => calendar.primary) ?? calendars[0];
  }
  return gs.calendars.findBy("user_email", userEmail).find((calendar) => calendar.google_id === calendarId);
}
function formatCalendarResource(calendar) {
  return {
    kind: "calendar#calendarListEntry",
    etag: `"${calendar.google_id}"`,
    id: calendar.google_id,
    summary: calendar.summary,
    description: calendar.description ?? void 0,
    timeZone: calendar.time_zone,
    selected: calendar.selected,
    primary: calendar.primary || void 0,
    accessRole: calendar.access_role,
    backgroundColor: calendar.background_color ?? void 0,
    foregroundColor: calendar.foreground_color ?? void 0
  };
}
function createCalendarEventRecord(gs, input) {
  const calendar = getCalendarById(gs, input.user_email, input.calendar_google_id);
  if (!calendar) {
    throw new Error("Calendar not found");
  }
  const eventId = input.google_id ?? generateUid("evt");
  const existing = gs.calendarEvents.findBy("user_email", input.user_email).find((event) => event.google_id === eventId);
  if (existing) return existing;
  const hangoutLink = input.hangout_link ?? input.conference_entry_points?.find((entry) => entry.entry_point_type === "video")?.uri ?? null;
  return gs.calendarEvents.insert({
    google_id: eventId,
    user_email: input.user_email,
    calendar_google_id: calendar.google_id,
    status: input.status ?? "confirmed",
    summary: input.summary ?? "Untitled Event",
    description: input.description ?? null,
    location: input.location ?? null,
    html_link: buildCalendarEventLink(calendar.google_id, eventId),
    hangout_link: hangoutLink,
    start_date_time: input.start_date_time ?? null,
    start_date: input.start_date ?? null,
    end_date_time: input.end_date_time ?? null,
    end_date: input.end_date ?? null,
    attendees: input.attendees ?? [],
    conference_entry_points: input.conference_entry_points ?? [],
    transparency: input.transparency ?? null
  });
}
function getCalendarEventById(gs, userEmail, calendarId, eventId) {
  const calendar = getCalendarById(gs, userEmail, calendarId);
  if (!calendar) return void 0;
  return gs.calendarEvents.findBy("user_email", userEmail).find((event) => event.calendar_google_id === calendar.google_id && event.google_id === eventId);
}
function deleteCalendarEventRecord(gs, event) {
  return gs.calendarEvents.delete(event.id);
}
function listCalendarEvents(gs, userEmail, calendarId, options) {
  const calendar = getCalendarById(gs, userEmail, calendarId);
  if (!calendar) return { items: [] };
  let events = gs.calendarEvents.findBy("user_email", userEmail).filter((event) => event.calendar_google_id === calendar.google_id).filter((event) => event.status !== "cancelled");
  if (options.timeMin || options.timeMax) {
    const min = options.timeMin ? Date.parse(options.timeMin) : null;
    const max = options.timeMax ? Date.parse(options.timeMax) : null;
    events = events.filter((event) => eventOverlapsRange(event, min, max));
  }
  if (options.q?.trim()) {
    const needle = options.q.trim().toLowerCase();
    events = events.filter((event) => searchableCalendarEvent(event).includes(needle));
  }
  events.sort((a, b) => getEventSortTime(a) - getEventSortTime(b));
  if (options.orderBy && options.orderBy !== "startTime") {
    events.sort((a, b) => a.summary.localeCompare(b.summary));
  }
  const offset = parseOffset(options.pageToken);
  const limit = normalizeLimit(options.maxResults, 10, 250);
  return {
    items: events.slice(offset, offset + limit),
    nextPageToken: offset + limit < events.length ? String(offset + limit) : void 0
  };
}
function formatCalendarEventResource(gs, event) {
  const calendar = getCalendarById(gs, event.user_email, event.calendar_google_id);
  return {
    kind: "calendar#event",
    etag: `"${event.google_id}"`,
    id: event.google_id,
    status: event.status,
    htmlLink: event.html_link ?? void 0,
    hangoutLink: event.hangout_link ?? void 0,
    summary: event.summary,
    description: event.description ?? void 0,
    location: event.location ?? void 0,
    created: event.created_at,
    updated: event.updated_at,
    start: formatCalendarDateRange(event, "start", calendar?.time_zone ?? "UTC"),
    end: formatCalendarDateRange(event, "end", calendar?.time_zone ?? "UTC"),
    attendees: event.attendees.map((attendee) => ({
      email: attendee.email,
      displayName: attendee.display_name ?? void 0,
      responseStatus: attendee.response_status ?? void 0,
      organizer: attendee.organizer || void 0,
      self: attendee.self || void 0
    })),
    conferenceData: event.conference_entry_points.length > 0 ? {
      entryPoints: event.conference_entry_points.map((entry) => ({
        entryPointType: entry.entry_point_type,
        uri: entry.uri,
        label: entry.label ?? void 0
      }))
    } : void 0
  };
}
function buildFreeBusyResponse(gs, userEmail, request) {
  const calendars = {};
  const min = Date.parse(request.timeMin);
  const max = Date.parse(request.timeMax);
  for (const item of request.items) {
    const calendar = getCalendarById(gs, userEmail, item.id);
    if (!calendar) continue;
    const busy = gs.calendarEvents.findBy("user_email", userEmail).filter((event) => event.calendar_google_id === calendar.google_id).filter((event) => event.status !== "cancelled" && event.transparency !== "transparent").filter((event) => eventOverlapsRange(event, min, max)).sort((a, b) => getEventSortTime(a) - getEventSortTime(b)).map((event) => ({
      start: event.start_date_time ?? `${event.start_date}T00:00:00.000Z`,
      end: event.end_date_time ?? `${event.end_date}T00:00:00.000Z`
    }));
    calendars[item.id] = { busy };
  }
  return {
    kind: "calendar#freeBusy",
    timeMin: request.timeMin,
    timeMax: request.timeMax,
    calendars
  };
}
function buildCalendarEventLink(calendarId, eventId) {
  return `https://calendar.google.com/calendar/u/0/r/eventedit/${calendarId}/${eventId}`;
}
function formatCalendarDateRange(event, prefix, timeZone) {
  const dateTime = prefix === "start" ? event.start_date_time : event.end_date_time;
  const date = prefix === "start" ? event.start_date : event.end_date;
  if (dateTime) {
    return {
      dateTime,
      timeZone
    };
  }
  return {
    date: date ?? void 0,
    timeZone
  };
}
function searchableCalendarEvent(event) {
  return [
    event.summary,
    event.description ?? "",
    event.location ?? "",
    ...event.attendees.map((attendee) => attendee.email),
    ...event.attendees.map((attendee) => attendee.display_name ?? "")
  ].join(" ").toLowerCase();
}
function eventOverlapsRange(event, min, max) {
  const start = getEventSortTime(event);
  const end = getEventEndTime(event);
  if (min != null && end <= min) return false;
  if (max != null && start >= max) return false;
  return true;
}
function getEventSortTime(event) {
  return parseCalendarTimestamp(event.start_date_time, event.start_date);
}
function getEventEndTime(event) {
  return parseCalendarTimestamp(event.end_date_time, event.end_date);
}
function parseCalendarTimestamp(dateTime, date) {
  if (dateTime) {
    const parsed = Date.parse(dateTime);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (date) {
    const parsed = Date.parse(`${date}T00:00:00.000Z`);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}
var GOOGLE_DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
function createDriveItemRecord(gs, input) {
  const itemId = input.google_id ?? generateUid("drv");
  const existing = gs.driveItems.findBy("user_email", input.user_email).find((item2) => item2.google_id === itemId);
  if (existing) return existing;
  const item = gs.driveItems.insert({
    google_id: itemId,
    user_email: input.user_email,
    name: input.name,
    mime_type: input.mime_type,
    parent_google_ids: normalizeParentIds(input.parent_google_ids),
    web_view_link: input.web_view_link ?? buildDriveWebViewLink(itemId, input.mime_type),
    size: input.size ?? null,
    trashed: input.trashed ?? false,
    data: input.data ?? null
  });
  return item;
}
function getDriveItemById(gs, userEmail, fileId) {
  return gs.driveItems.findBy("user_email", userEmail).find((item) => item.google_id === fileId);
}
function listDriveItems(gs, userEmail, options) {
  let items = gs.driveItems.findBy("user_email", userEmail);
  const parsed = parseDriveQuery(options.q ?? null);
  if (parsed.parentId) {
    items = items.filter((item) => item.parent_google_ids.includes(parsed.parentId));
  }
  if (parsed.requireNotTrashed) {
    items = items.filter((item) => !item.trashed);
  }
  if (parsed.mimeTypes.length > 0) {
    items = items.filter((item) => parsed.mimeTypes.includes(item.mime_type));
  }
  if (parsed.excludeMimeTypes.length > 0) {
    items = items.filter((item) => !parsed.excludeMimeTypes.includes(item.mime_type));
  }
  if (options.orderBy?.includes("name")) {
    items = items.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    items = items.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  const offset = parseOffset(options.pageToken);
  const limit = normalizeLimit(options.pageSize, 100, 1e3);
  return {
    files: items.slice(offset, offset + limit),
    nextPageToken: offset + limit < items.length ? String(offset + limit) : void 0
  };
}
function updateDriveItemRecord(gs, item, input) {
  const nextParents = new Set(item.parent_google_ids);
  for (const parentId of input.addParents ?? []) {
    nextParents.add(parentId);
  }
  for (const parentId of input.removeParents ?? []) {
    nextParents.delete(parentId);
  }
  return gs.driveItems.update(item.id, {
    name: input.name ?? item.name,
    parent_google_ids: normalizeParentIds(Array.from(nextParents)),
    trashed: input.trashed ?? item.trashed,
    web_view_link: buildDriveWebViewLink(item.google_id, item.mime_type)
  }) ?? item;
}
function formatDriveItemResource(item) {
  return {
    kind: "drive#file",
    id: item.google_id,
    name: item.name,
    mimeType: item.mime_type,
    parents: item.parent_google_ids,
    webViewLink: item.web_view_link ?? void 0,
    createdTime: item.created_at,
    modifiedTime: item.updated_at,
    size: item.size != null ? String(item.size) : void 0,
    trashed: item.trashed || void 0
  };
}
function parseDriveMultipartUpload(contentType, rawBody) {
  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
  const boundary = boundaryMatch?.[1];
  if (!boundary) {
    return {
      requestBody: {},
      media: void 0
    };
  }
  const raw = rawBody.toString("latin1");
  const parts = raw.split(`--${boundary}`).slice(1).filter((part) => part !== "--" && part !== "--\r\n" && part !== "--\n");
  let requestBody = {};
  let media;
  for (const part of parts) {
    const normalized = stripMultipartBoundaryPadding(part);
    const headerSeparator = normalized.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n";
    const separatorIndex = normalized.indexOf(headerSeparator);
    if (separatorIndex < 0) continue;
    const headers = normalized.slice(0, separatorIndex).toLowerCase();
    const bodyText = normalized.slice(separatorIndex + headerSeparator.length);
    if (headers.includes("application/json")) {
      try {
        const parsed = JSON.parse(bodyText);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          requestBody = parsed;
        }
      } catch {
        requestBody = {};
      }
      continue;
    }
    const mimeTypeMatch = headers.match(/content-type:\s*([^\r\n;]+)/i);
    media = {
      mimeType: mimeTypeMatch?.[1]?.trim() ?? "application/octet-stream",
      body: Buffer.from(bodyText, "latin1")
    };
  }
  return {
    requestBody,
    media
  };
}
function parseDriveQuery(query) {
  const source = query ?? "";
  const parentMatch = source.match(/'([^']+)' in parents/i);
  const mimeTypes = Array.from(source.matchAll(/mimeType = '([^']+)'/g)).map((match) => match[1]);
  const excludeMimeTypes = Array.from(source.matchAll(/mimeType != '([^']+)'/g)).map((match) => match[1]);
  return {
    parentId: parentMatch?.[1] ?? null,
    mimeTypes,
    excludeMimeTypes,
    requireNotTrashed: source.includes("trashed = false")
  };
}
function buildDriveWebViewLink(itemId, mimeType) {
  if (mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE) {
    return `https://drive.google.com/drive/folders/${itemId}`;
  }
  return `https://drive.google.com/file/d/${itemId}/view`;
}
function normalizeParentIds(parentIds) {
  const normalized = [...new Set((parentIds ?? ["root"]).filter(Boolean))];
  return normalized.length > 0 ? normalized : ["root"];
}
function stripMultipartBoundaryPadding(part) {
  let normalized = part;
  if (normalized.startsWith("\r\n")) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith("\n")) {
    normalized = normalized.slice(1);
  }
  if (normalized.endsWith("\r\n")) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith("\n")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}
var commonParameters = {
  alt: {
    type: "string",
    description: "Data format for the response.",
    enum: ["json"],
    default: "json",
    location: "query"
  },
  fields: {
    type: "string",
    description: "Selector specifying which fields to include in a partial response.",
    location: "query"
  },
  key: {
    type: "string",
    description: "API key for the current project.",
    location: "query"
  },
  oauth_token: {
    type: "string",
    description: "OAuth 2.0 token for the current user.",
    location: "query"
  },
  prettyPrint: {
    type: "boolean",
    description: "Returns the response with indentations and line breaks.",
    default: "true",
    location: "query"
  },
  quotaUser: {
    type: "string",
    description: "An opaque string that represents a user for quota purposes.",
    location: "query"
  },
  userIp: {
    type: "string",
    description: "Deprecated. Please use quotaUser instead.",
    location: "query"
  }
};
var calendarScopes = {
  "https://www.googleapis.com/auth/calendar": {
    description: "See, edit, share, and permanently delete all the calendars you can access using Google Calendar"
  },
  "https://www.googleapis.com/auth/calendar.acls": {
    description: "See and change the sharing permissions of Google calendars you own"
  },
  "https://www.googleapis.com/auth/calendar.acls.readonly": {
    description: "See the sharing permissions of Google calendars you own"
  },
  "https://www.googleapis.com/auth/calendar.app.created": {
    description: "Make secondary Google calendars, and see, create, change, and delete events on them"
  },
  "https://www.googleapis.com/auth/calendar.calendars": {
    description: "See and change the properties of Google calendars you have access to, and create secondary calendars"
  },
  "https://www.googleapis.com/auth/calendar.calendars.readonly": {
    description: "See the title, description, default time zone, and other properties of Google calendars you have access to"
  },
  "https://www.googleapis.com/auth/calendar.calendarlist": {
    description: "See, add, and remove Google calendars you are subscribed to"
  },
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly": {
    description: "See the list of Google calendars you are subscribed to"
  },
  "https://www.googleapis.com/auth/calendar.events": {
    description: "View and edit events on all your calendars"
  },
  "https://www.googleapis.com/auth/calendar.events.freebusy": {
    description: "See the availability on Google calendars you have access to"
  },
  "https://www.googleapis.com/auth/calendar.events.owned": {
    description: "See, create, change, and delete events on Google calendars you own"
  },
  "https://www.googleapis.com/auth/calendar.events.owned.readonly": {
    description: "See the events on Google calendars you own"
  },
  "https://www.googleapis.com/auth/calendar.events.public.readonly": {
    description: "See the events on public calendars"
  },
  "https://www.googleapis.com/auth/calendar.events.readonly": {
    description: "View events on all your calendars"
  },
  "https://www.googleapis.com/auth/calendar.freebusy": {
    description: "View your availability in your calendars"
  },
  "https://www.googleapis.com/auth/calendar.readonly": {
    description: "See and download any calendar you can access using your Google Calendar"
  }
};
var calendarIdParameter = {
  type: "string",
  description: 'Calendar identifier. Use the "primary" keyword to access the primary calendar.',
  location: "path",
  required: true
};
var userIdParameter = {
  type: "string",
  description: 'User identifier. Use the "me" keyword to refer to the authenticated user.',
  location: "path",
  required: true
};
var eventListParameters = {
  calendarId: calendarIdParameter,
  maxResults: {
    type: "integer",
    format: "int32",
    minimum: "1",
    location: "query",
    description: "Maximum number of events returned on one result page."
  },
  orderBy: {
    type: "string",
    enum: ["startTime", "updated"],
    location: "query",
    description: "The order of the events returned in the result."
  },
  pageToken: {
    type: "string",
    location: "query",
    description: "Token specifying which result page to return."
  },
  q: {
    type: "string",
    location: "query",
    description: "Free text search terms to find events."
  },
  timeMax: {
    type: "string",
    format: "date-time",
    location: "query",
    description: "Upper bound for an event's start time to filter by."
  },
  timeMin: {
    type: "string",
    format: "date-time",
    location: "query",
    description: "Lower bound for an event's end time to filter by."
  }
};
function buildCalendarDiscoveryDocument(baseUrl) {
  const rootUrl = `${baseUrl.replace(/\/$/, "")}/`;
  return {
    kind: "discovery#restDescription",
    discoveryVersion: "v1",
    id: "calendar:v3",
    name: "calendar",
    version: "v3",
    revision: "local",
    title: "Calendar API",
    description: "Manipulates events and other calendar data.",
    documentationLink: "https://developers.google.com/workspace/calendar/firstapp",
    protocol: "rest",
    rootUrl,
    servicePath: "calendar/v3/",
    basePath: "/calendar/v3/",
    baseUrl: `${rootUrl}calendar/v3/`,
    parameters: commonParameters,
    auth: {
      oauth2: {
        scopes: calendarScopes
      }
    },
    resources: {
      calendarList: {
        methods: {
          list: {
            id: "calendar.calendarList.list",
            path: "users/{userId}/calendarList",
            httpMethod: "GET",
            description: "Returns the calendars on the user's calendar list.",
            parameterOrder: ["userId"],
            parameters: {
              userId: userIdParameter
            },
            response: { $ref: "CalendarList" },
            scopes: [
              "https://www.googleapis.com/auth/calendar",
              "https://www.googleapis.com/auth/calendar.calendarlist",
              "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
              "https://www.googleapis.com/auth/calendar.readonly"
            ]
          }
        }
      },
      events: {
        methods: {
          list: {
            id: "calendar.events.list",
            path: "calendars/{calendarId}/events",
            httpMethod: "GET",
            description: "Returns events on the specified calendar.",
            parameterOrder: ["calendarId"],
            parameters: eventListParameters,
            response: { $ref: "Events" },
            scopes: [
              "https://www.googleapis.com/auth/calendar",
              "https://www.googleapis.com/auth/calendar.app.created",
              "https://www.googleapis.com/auth/calendar.events",
              "https://www.googleapis.com/auth/calendar.events.freebusy",
              "https://www.googleapis.com/auth/calendar.events.owned",
              "https://www.googleapis.com/auth/calendar.events.owned.readonly",
              "https://www.googleapis.com/auth/calendar.events.public.readonly",
              "https://www.googleapis.com/auth/calendar.events.readonly",
              "https://www.googleapis.com/auth/calendar.readonly"
            ]
          },
          insert: {
            id: "calendar.events.insert",
            path: "calendars/{calendarId}/events",
            httpMethod: "POST",
            description: "Creates an event.",
            parameterOrder: ["calendarId"],
            parameters: { calendarId: calendarIdParameter },
            request: { $ref: "Event" },
            response: { $ref: "Event" },
            scopes: [
              "https://www.googleapis.com/auth/calendar",
              "https://www.googleapis.com/auth/calendar.app.created",
              "https://www.googleapis.com/auth/calendar.events",
              "https://www.googleapis.com/auth/calendar.events.owned"
            ]
          },
          delete: {
            id: "calendar.events.delete",
            path: "calendars/{calendarId}/events/{eventId}",
            httpMethod: "DELETE",
            description: "Deletes an event.",
            parameterOrder: ["calendarId", "eventId"],
            parameters: {
              calendarId: calendarIdParameter,
              eventId: {
                type: "string",
                description: "Event identifier.",
                location: "path",
                required: true
              }
            },
            scopes: [
              "https://www.googleapis.com/auth/calendar",
              "https://www.googleapis.com/auth/calendar.app.created",
              "https://www.googleapis.com/auth/calendar.events",
              "https://www.googleapis.com/auth/calendar.events.owned"
            ]
          }
        }
      },
      freebusy: {
        methods: {
          query: {
            id: "calendar.freebusy.query",
            path: "freeBusy",
            httpMethod: "POST",
            description: "Returns free/busy information for a set of calendars.",
            request: { $ref: "FreeBusyRequest" },
            response: { $ref: "FreeBusyResponse" },
            scopes: [
              "https://www.googleapis.com/auth/calendar",
              "https://www.googleapis.com/auth/calendar.events.freebusy",
              "https://www.googleapis.com/auth/calendar.freebusy",
              "https://www.googleapis.com/auth/calendar.readonly"
            ]
          }
        }
      }
    },
    schemas: {
      CalendarList: {
        id: "CalendarList",
        type: "object",
        properties: {
          kind: { type: "string" },
          nextPageToken: { type: "string" },
          items: { type: "array", items: { $ref: "CalendarListEntry" } }
        }
      },
      CalendarListEntry: {
        id: "CalendarListEntry",
        type: "object",
        properties: {
          kind: { type: "string" },
          id: { type: "string" },
          summary: { type: "string" },
          description: { type: "string" },
          timeZone: { type: "string" },
          primary: { type: "boolean" },
          selected: { type: "boolean" },
          accessRole: { type: "string" }
        }
      },
      Event: {
        id: "Event",
        type: "object",
        properties: {
          kind: { type: "string" },
          id: { type: "string" },
          status: { type: "string" },
          summary: { type: "string" },
          description: { type: "string" },
          location: { type: "string" },
          start: { $ref: "EventDateTime" },
          end: { $ref: "EventDateTime" },
          attendees: { type: "array", items: { $ref: "EventAttendee" } },
          hangoutLink: { type: "string" }
        }
      },
      EventAttendee: {
        id: "EventAttendee",
        type: "object",
        properties: {
          email: { type: "string" },
          displayName: { type: "string" },
          responseStatus: { type: "string" },
          organizer: { type: "boolean" },
          self: { type: "boolean" }
        }
      },
      EventDateTime: {
        id: "EventDateTime",
        type: "object",
        properties: {
          date: { type: "string", format: "date" },
          dateTime: { type: "string", format: "date-time" },
          timeZone: { type: "string" }
        }
      },
      Events: {
        id: "Events",
        type: "object",
        properties: {
          kind: { type: "string" },
          nextPageToken: { type: "string" },
          items: { type: "array", items: { $ref: "Event" } }
        }
      },
      FreeBusyCalendar: {
        id: "FreeBusyCalendar",
        type: "object",
        properties: {
          errors: { type: "array", items: { type: "object" } },
          busy: { type: "array", items: { $ref: "TimePeriod" } }
        }
      },
      FreeBusyRequest: {
        id: "FreeBusyRequest",
        type: "object",
        properties: {
          timeMin: { type: "string", format: "date-time" },
          timeMax: { type: "string", format: "date-time" },
          items: { type: "array", items: { $ref: "FreeBusyRequestItem" } }
        }
      },
      FreeBusyRequestItem: {
        id: "FreeBusyRequestItem",
        type: "object",
        properties: {
          id: { type: "string" }
        }
      },
      FreeBusyResponse: {
        id: "FreeBusyResponse",
        type: "object",
        properties: {
          kind: { type: "string" },
          timeMin: { type: "string", format: "date-time" },
          timeMax: { type: "string", format: "date-time" },
          calendars: {
            type: "object",
            additionalProperties: { $ref: "FreeBusyCalendar" }
          }
        }
      },
      TimePeriod: {
        id: "TimePeriod",
        type: "object",
        properties: {
          start: { type: "string", format: "date-time" },
          end: { type: "string", format: "date-time" }
        }
      }
    }
  };
}
function requireGoogleAuth(c) {
  const authEmail = getAuthenticatedEmail(c);
  if (!authEmail) {
    return googleApiError(c, 401, "Request had invalid authentication credentials.", "authError", "UNAUTHENTICATED");
  }
  return authEmail;
}
function requireGmailUser(c) {
  const authEmail = requireGoogleAuth(c);
  if (authEmail instanceof Response) {
    return authEmail;
  }
  if (!matchesRequestedUser(c.req.param("userId") ?? "", authEmail)) {
    return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
  }
  return authEmail;
}
async function parseGoogleBody(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  const rawText = await c.req.text();
  if (!rawText) return {};
  let parsed;
  if (contentType.includes("application/json")) {
    try {
      const json = JSON.parse(rawText);
      parsed = json && typeof json === "object" && !Array.isArray(json) ? json : {};
    } catch {
      return {};
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    parsed = Object.fromEntries(new URLSearchParams(rawText));
  } else {
    parsed = {
      raw: Buffer.from(rawText, "utf8").toString("base64url")
    };
  }
  const nestedBody = parsed.requestBody;
  if (nestedBody && typeof nestedBody === "object" && !Array.isArray(nestedBody)) {
    return nestedBody;
  }
  return parsed;
}
function getStringArray(body, field) {
  const value = body[field];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return [];
}
function getString(body, ...fields) {
  for (const field of fields) {
    const value = body[field];
    if (typeof value === "string") return value;
  }
  return void 0;
}
function getRecord(body, ...fields) {
  for (const field of fields) {
    const value = body[field];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  return void 0;
}
function getRecordArray(body, ...fields) {
  for (const field of fields) {
    const value = body[field];
    if (!Array.isArray(value)) continue;
    return value.filter(
      (item) => Boolean(item) && typeof item === "object" && !Array.isArray(item)
    );
  }
  return [];
}
function parseMessageInputFromBody(body, defaults) {
  return {
    raw: getString(body, "raw"),
    thread_id: getString(body, "threadId", "thread_id"),
    from: getString(body, "from") ?? defaults?.from,
    to: getString(body, "to"),
    cc: getString(body, "cc") ?? null,
    bcc: getString(body, "bcc") ?? null,
    reply_to: getString(body, "replyTo", "reply_to") ?? null,
    subject: getString(body, "subject"),
    snippet: getString(body, "snippet"),
    body_text: getString(body, "body_text", "text") ?? null,
    body_html: getString(body, "body_html", "html") ?? null,
    date: getString(body, "date"),
    internal_date: getString(body, "internalDate", "internal_date"),
    message_id: getString(body, "messageId", "message_id"),
    references: getString(body, "references") ?? null,
    in_reply_to: getString(body, "inReplyTo", "in_reply_to") ?? null
  };
}
function parseCalendarEventInputFromBody(body) {
  const start = getRecord(body, "start");
  const end = getRecord(body, "end");
  const conferenceData = getRecord(body, "conferenceData");
  const conferenceEntryPoints = getRecordArray(conferenceData ?? {}, "entryPoints").map((entry) => ({
    entry_point_type: getString(entry, "entryPointType") ?? "video",
    uri: getString(entry, "uri") ?? "",
    label: getString(entry, "label") ?? null
  })).filter((entry) => entry.uri.length > 0);
  return {
    status: getString(body, "status") ?? "confirmed",
    summary: getString(body, "summary"),
    description: getString(body, "description") ?? null,
    location: getString(body, "location") ?? null,
    start_date_time: getString(start ?? {}, "dateTime") ?? null,
    start_date: getString(start ?? {}, "date") ?? null,
    end_date_time: getString(end ?? {}, "dateTime") ?? null,
    end_date: getString(end ?? {}, "date") ?? null,
    attendees: getRecordArray(body, "attendees").map((entry) => ({
      email: getString(entry, "email") ?? "",
      display_name: getString(entry, "displayName") ?? null,
      response_status: getString(entry, "responseStatus") ?? null,
      organizer: entry.organizer === true,
      self: entry.self === true
    })).filter((attendee) => attendee.email.length > 0),
    conference_entry_points: conferenceEntryPoints,
    hangout_link: getString(body, "hangoutLink") ?? conferenceEntryPoints.find((entry) => entry.entry_point_type === "video")?.uri ?? null,
    transparency: getString(body, "transparency") ?? null
  };
}
function parseDriveItemInputFromBody(body, defaults) {
  const parentIds = getStringArray(body, "parents");
  return {
    name: getString(body, "name")?.trim() || "Untitled",
    mime_type: getString(body, "mimeType") ?? defaults?.mimeType ?? "application/octet-stream",
    parent_google_ids: parentIds.length > 0 ? parentIds : ["root"]
  };
}
function getGoogleStore(store) {
  return {
    users: store.collection("google.users", ["uid", "email"]),
    oauthClients: store.collection("google.oauth_clients", ["client_id"]),
    messages: store.collection("google.messages", ["gmail_id", "thread_id", "user_email"]),
    drafts: store.collection("google.drafts", ["gmail_id", "message_gmail_id", "user_email"]),
    attachments: store.collection("google.attachments", [
      "gmail_id",
      "message_gmail_id",
      "user_email"
    ]),
    history: store.collection("google.history", ["gmail_id", "message_gmail_id", "user_email"]),
    labels: store.collection("google.labels", ["gmail_id", "user_email", "name"]),
    filters: store.collection("google.filters", ["gmail_id", "user_email"]),
    forwardingAddresses: store.collection("google.forwarding_addresses", [
      "user_email",
      "forwarding_email"
    ]),
    sendAs: store.collection("google.send_as", ["user_email", "send_as_email"]),
    calendars: store.collection("google.calendars", ["google_id", "user_email"]),
    calendarEvents: store.collection("google.calendar_events", [
      "google_id",
      "calendar_google_id",
      "user_email"
    ]),
    driveItems: store.collection("google.drive_items", ["google_id", "user_email", "mime_type"])
  };
}
function calendarRoutes({ app, store, baseUrl }) {
  const gs = getGoogleStore(store);
  app.get("/discovery/v1/apis/calendar/v3/rest", (c) => {
    return c.json(buildCalendarDiscoveryDocument(baseUrl));
  });
  app.get("/calendar/v3/users/:userId/calendarList", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    return c.json({
      kind: "calendar#calendarList",
      items: listCalendarsForUser(gs, authEmail).map((calendar) => formatCalendarResource(calendar))
    });
  });
  app.get("/calendar/v3/calendars/:calendarId/events", (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const calendar = getCalendarById(gs, authEmail, c.req.param("calendarId"));
    if (!calendar) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const url = new URL(c.req.url);
    const response = listCalendarEvents(gs, authEmail, calendar.google_id, {
      timeMin: url.searchParams.get("timeMin"),
      timeMax: url.searchParams.get("timeMax"),
      maxResults: url.searchParams.get("maxResults"),
      pageToken: url.searchParams.get("pageToken"),
      q: url.searchParams.get("q"),
      orderBy: url.searchParams.get("orderBy")
    });
    return c.json({
      kind: "calendar#events",
      items: response.items.map((event) => formatCalendarEventResource(gs, event)),
      nextPageToken: response.nextPageToken
    });
  });
  app.post("/calendar/v3/calendars/:calendarId/events", async (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const calendar = getCalendarById(gs, authEmail, c.req.param("calendarId"));
    if (!calendar) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const body = await parseGoogleBody(c);
    const requestBody = getRecord(body, "requestBody") ?? body;
    const eventInput = parseCalendarEventInputFromBody(requestBody);
    if (!eventInput.start_date_time && !eventInput.start_date || !eventInput.end_date_time && !eventInput.end_date) {
      return googleApiError(c, 400, "Event start and end are required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    const event = createCalendarEventRecord(gs, {
      user_email: authEmail,
      calendar_google_id: calendar.google_id,
      ...eventInput
    });
    return c.json(formatCalendarEventResource(gs, event));
  });
  app.delete("/calendar/v3/calendars/:calendarId/events/:eventId", (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const event = getCalendarEventById(gs, authEmail, c.req.param("calendarId"), c.req.param("eventId"));
    if (!event) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    deleteCalendarEventRecord(gs, event);
    return c.body(null, 204);
  });
  app.post("/calendar/v3/freeBusy", async (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const requestBody = getRecord(body, "requestBody") ?? body;
    const timeMin = typeof requestBody.timeMin === "string" ? requestBody.timeMin : void 0;
    const timeMax = typeof requestBody.timeMax === "string" ? requestBody.timeMax : void 0;
    const items = getRecordArray(requestBody, "items").map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : ""
    })).filter((entry) => entry.id.length > 0);
    if (!timeMin || !timeMax) {
      return googleApiError(c, 400, "timeMin and timeMax are required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    return c.json(
      buildFreeBusyResponse(gs, authEmail, {
        timeMin,
        timeMax,
        items
      })
    );
  });
}
function draftRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  const createHandler = async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const messageBody = getRecord(body, "message") ?? body;
    try {
      const { draft } = createDraftMessage(gs, {
        user_email: authEmail,
        ...parseMessageInputFromBody(messageBody, { from: authEmail })
      });
      return c.json(formatDraftResource(gs, draft, "full"));
    } catch {
      return googleApiError(c, 400, "Invalid raw MIME message payload.", "invalidArgument", "INVALID_ARGUMENT");
    }
  };
  const sendHandler = async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const draftId = getString(body, "id") ?? getString(getRecord(body, "draft") ?? {}, "id");
    if (!draftId) {
      return googleApiError(c, 400, "Draft ID is required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    const draft = getDraftById(gs, authEmail, draftId);
    if (!draft) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const message = sendDraftMessage(gs, draft);
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json({
      id: message.gmail_id,
      threadId: message.thread_id,
      labelIds: message.label_ids,
      snippet: message.snippet,
      historyId: message.history_id,
      internalDate: message.internal_date
    });
  };
  app.get("/gmail/v1/users/:userId/drafts", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const drafts = listDraftsForUser(gs, authEmail);
    const url = new URL(c.req.url);
    const offset = parseOffset(url.searchParams.get("pageToken"));
    const limit = normalizeLimit(url.searchParams.get("maxResults"), 100, 500);
    const page = drafts.slice(offset, offset + limit);
    const nextPageToken = offset + limit < drafts.length ? String(offset + limit) : void 0;
    return c.json({
      drafts: page.map((draft) => {
        const resource = formatDraftResource(gs, draft, "minimal");
        return {
          id: resource.id,
          message: resource.message ? {
            id: resource.message.id,
            threadId: resource.message.threadId
          } : void 0
        };
      }),
      nextPageToken,
      resultSizeEstimate: drafts.length
    });
  });
  app.post("/gmail/v1/users/:userId/drafts", createHandler);
  app.post("/upload/gmail/v1/users/:userId/drafts", createHandler);
  app.get("/gmail/v1/users/:userId/drafts/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const draft = getDraftById(gs, authEmail, c.req.param("id"));
    if (!draft) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    if (!getDraftMessage(gs, draft)) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const url = new URL(c.req.url);
    return c.json(
      formatDraftResource(
        gs,
        draft,
        parseFormat(url.searchParams.get("format")),
        url.searchParams.getAll("metadataHeaders")
      )
    );
  });
  app.put("/gmail/v1/users/:userId/drafts/:id", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const draft = getDraftById(gs, authEmail, c.req.param("id"));
    if (!draft) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const body = await parseGoogleBody(c);
    const messageBody = getRecord(body, "message") ?? body;
    try {
      const updated = updateDraftMessage(gs, draft, parseMessageInputFromBody(messageBody));
      if (!updated) {
        return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
      }
      return c.json(formatDraftResource(gs, updated.draft, "full"));
    } catch {
      return googleApiError(c, 400, "Invalid raw MIME message payload.", "invalidArgument", "INVALID_ARGUMENT");
    }
  });
  app.post("/gmail/v1/users/:userId/drafts/send", sendHandler);
  app.post("/upload/gmail/v1/users/:userId/drafts/send", sendHandler);
  app.delete("/gmail/v1/users/:userId/drafts/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const draft = getDraftById(gs, authEmail, c.req.param("id"));
    if (!draft) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    deleteDraftMessage(gs, draft);
    return c.body(null, 204);
  });
}
function driveRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  const createHandler = async (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const contentType = c.req.header("Content-Type") ?? "";
    let requestBody = {};
    let media;
    if (contentType.includes("multipart/related")) {
      const rawBody = Buffer.from(await c.req.raw.arrayBuffer());
      const parsed = parseDriveMultipartUpload(contentType, rawBody);
      requestBody = parsed.requestBody;
      media = parsed.media;
    } else {
      const body = await parseGoogleBody(c);
      requestBody = getRecord(body, "requestBody") ?? body;
    }
    const item = createDriveItemRecord(gs, {
      user_email: authEmail,
      ...parseDriveItemInputFromBody(requestBody, {
        mimeType: media?.mimeType
      }),
      size: media ? media.body.length : null,
      data: media ? media.body.toString("base64url") : null
    });
    return c.json(formatDriveItemResource(item));
  };
  app.get("/drive/v3/files", (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const url = new URL(c.req.url);
    const response = listDriveItems(gs, authEmail, {
      q: url.searchParams.get("q"),
      pageSize: url.searchParams.get("pageSize"),
      pageToken: url.searchParams.get("pageToken"),
      orderBy: url.searchParams.get("orderBy")
    });
    return c.json({
      kind: "drive#fileList",
      files: response.files.map((item) => formatDriveItemResource(item)),
      nextPageToken: response.nextPageToken
    });
  });
  app.post("/drive/v3/files", createHandler);
  app.post("/upload/drive/v3/files", createHandler);
  app.get("/drive/v3/files/:fileId", (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const item = getDriveItemById(gs, authEmail, c.req.param("fileId"));
    if (!item) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const url = new URL(c.req.url);
    if (url.searchParams.get("alt") === "media") {
      return new Response(item.data ? Buffer.from(item.data, "base64url") : Buffer.alloc(0), {
        status: 200,
        headers: {
          "Content-Type": item.mime_type
        }
      });
    }
    return c.json(formatDriveItemResource(item));
  });
  const updateHandler = async (c) => {
    const authEmail = requireGoogleAuth(c);
    if (authEmail instanceof Response) return authEmail;
    const item = getDriveItemById(gs, authEmail, c.req.param("fileId"));
    if (!item) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const url = new URL(c.req.url);
    const body = await parseGoogleBody(c);
    const requestBody = getRecord(body, "requestBody") ?? body;
    const addParents = (url.searchParams.get("addParents") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const removeParents = (url.searchParams.get("removeParents") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    const updated = updateDriveItemRecord(gs, item, {
      addParents,
      removeParents,
      name: getString(requestBody, "name")
    });
    return c.json(formatDriveItemResource(updated));
  };
  app.patch("/drive/v3/files/:fileId", updateHandler);
  app.put("/drive/v3/files/:fileId", updateHandler);
}
var WATCH_STATE_KEY = "google.gmail.watchStates";
function historyRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  app.get("/gmail/v1/users/:userId/history", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const url = new URL(c.req.url);
    const startHistoryId = url.searchParams.get("startHistoryId")?.trim();
    if (!startHistoryId) {
      return googleApiError(c, 400, "Start history ID is required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    const historyTypes = url.searchParams.getAll("historyTypes").filter(isHistoryChangeType);
    return c.json(
      listHistoryForUser(gs, authEmail, {
        startHistoryId,
        historyTypes,
        labelId: url.searchParams.get("labelId") ?? void 0,
        maxResults: normalizeLimit(url.searchParams.get("maxResults"), 100, 500),
        pageToken: url.searchParams.get("pageToken")
      })
    );
  });
  app.post("/gmail/v1/users/:userId/watch", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const topicName = getString(body, "topicName")?.trim();
    if (!topicName) {
      return googleApiError(c, 400, "Topic name is required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    const labelIds = getStringArray(body, "labelIds");
    const missingLabelIds = findMissingLabelIds(gs, authEmail, labelIds);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    const expiration = String(Date.now() + 24 * 60 * 60 * 1e3);
    const states = store.getData(WATCH_STATE_KEY) ?? /* @__PURE__ */ new Map();
    states.set(authEmail, {
      topicName,
      labelIds,
      labelFilterBehavior: getString(body, "labelFilterBehavior", "labelFilterAction") ?? null,
      expiration
    });
    store.setData(WATCH_STATE_KEY, states);
    return c.json({
      historyId: getCurrentHistoryId(gs, authEmail),
      expiration
    });
  });
  app.post("/gmail/v1/users/:userId/stop", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const states = store.getData(WATCH_STATE_KEY) ?? /* @__PURE__ */ new Map();
    states.delete(authEmail);
    store.setData(WATCH_STATE_KEY, states);
    return c.body(null, 200);
  });
}
function labelRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  app.get("/gmail/v1/users/:userId/labels", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    return c.json({
      labels: formatLabelResources(gs, listLabelsForUser(gs, authEmail))
    });
  });
  app.get("/gmail/v1/users/:userId/labels/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const label = findLabelById(gs, authEmail, c.req.param("id"));
    if (!label) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json(formatLabelResource(gs, label));
  });
  app.post("/gmail/v1/users/:userId/labels", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const name = getString(body, "name")?.trim();
    if (!name) {
      return googleApiError(c, 400, "Invalid label name", "invalidArgument", "INVALID_ARGUMENT");
    }
    if (findLabelByName(gs, authEmail, name)) {
      return googleApiError(c, 400, "Label name exists or conflicts", "failedPrecondition", "FAILED_PRECONDITION");
    }
    const color = body.color && typeof body.color === "object" && !Array.isArray(body.color) ? body.color : void 0;
    const label = createLabelRecord(gs, {
      user_email: authEmail,
      name,
      type: "user",
      message_list_visibility: getString(body, "messageListVisibility", "message_list_visibility") ?? "show",
      label_list_visibility: getString(body, "labelListVisibility", "label_list_visibility") ?? "labelShow",
      color_background: typeof color?.backgroundColor === "string" ? color.backgroundColor : getString(body, "color_background"),
      color_text: typeof color?.textColor === "string" ? color.textColor : getString(body, "color_text")
    });
    return c.json(formatLabelResource(gs, label));
  });
  app.put("/gmail/v1/users/:userId/labels/:id", async (c) => {
    return saveLabel(c, gs, true);
  });
  app.patch("/gmail/v1/users/:userId/labels/:id", async (c) => {
    return saveLabel(c, gs, false);
  });
  app.delete("/gmail/v1/users/:userId/labels/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const label = findLabelById(gs, authEmail, c.req.param("id"));
    if (!label) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    if (isSystemLabelId(label.gmail_id)) {
      return googleApiError(c, 400, "System labels cannot be deleted.", "invalidArgument", "INVALID_ARGUMENT");
    }
    for (const message of gs.messages.findBy("user_email", authEmail)) {
      if (!message.label_ids.includes(label.gmail_id)) continue;
      markMessageModified(
        gs,
        message,
        message.label_ids.filter((labelId) => labelId !== label.gmail_id)
      );
    }
    gs.labels.delete(label.id);
    return c.body(null, 204);
  });
}
async function saveLabel(c, gs, replaceMissingFields) {
  const authEmail = requireGmailUser(c);
  if (authEmail instanceof Response) return authEmail;
  const label = findLabelById(gs, authEmail, c.req.param("id"));
  if (!label) {
    return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
  }
  if (isSystemLabelId(label.gmail_id)) {
    return googleApiError(c, 400, "System labels cannot be modified.", "invalidArgument", "INVALID_ARGUMENT");
  }
  const body = await parseGoogleBody(c);
  const name = getString(body, "name")?.trim();
  const color = body.color && typeof body.color === "object" && !Array.isArray(body.color) ? body.color : void 0;
  if (name) {
    const conflicting = findLabelByName(gs, authEmail, name);
    if (conflicting && conflicting.gmail_id !== label.gmail_id) {
      return googleApiError(c, 400, "Label name exists or conflicts", "failedPrecondition", "FAILED_PRECONDITION");
    }
  }
  const updated = updateLabelRecord(gs, label, {
    name: name ?? (replaceMissingFields ? label.name : void 0),
    message_list_visibility: getString(body, "messageListVisibility", "message_list_visibility") ?? (replaceMissingFields ? "show" : void 0),
    label_list_visibility: getString(body, "labelListVisibility", "label_list_visibility") ?? (replaceMissingFields ? "labelShow" : void 0),
    color_background: typeof color?.backgroundColor === "string" ? color.backgroundColor : getString(body, "color_background") ?? (replaceMissingFields ? null : void 0),
    color_text: typeof color?.textColor === "string" ? color.textColor : getString(body, "color_text") ?? (replaceMissingFields ? null : void 0)
  });
  return c.json(formatLabelResource(gs, updated));
}
function messageRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  const createHandler = (mode) => async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const labelIds = getStringArray(body, "labelIds");
    const defaultLabelIds = mode === "send" ? dedupeLabelIds([...labelIds, "SENT"]) : labelIds.length > 0 ? labelIds : mode === "import" ? ["INBOX", "UNREAD"] : [];
    const missingLabelIds = findMissingLabelIds(gs, authEmail, defaultLabelIds);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    const messageInput = parseMessageInputFromBody(body, {
      from: mode === "send" ? authEmail : void 0
    });
    if (!messageInput.raw && (!messageInput.from || !messageInput.to)) {
      return googleApiError(
        c,
        400,
        "A raw MIME message or explicit from/to fields are required.",
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    try {
      const message = createStoredMessage(gs, {
        user_email: authEmail,
        ...messageInput,
        label_ids: defaultLabelIds
      });
      return c.json(formatMessageResource(gs, message, "full"));
    } catch {
      return googleApiError(c, 400, "Invalid raw MIME message payload.", "invalidArgument", "INVALID_ARGUMENT");
    }
  };
  app.get("/gmail/v1/users/:userId/messages", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const url = new URL(c.req.url);
    const messages = listMessagesForUser(gs, authEmail, {
      labelIds: url.searchParams.getAll("labelIds"),
      query: url.searchParams.get("q")?.trim() ?? void 0,
      includeSpamTrash: parseBooleanParam(url.searchParams.get("includeSpamTrash"))
    });
    const offset = parseOffset(url.searchParams.get("pageToken"));
    const limit = normalizeLimit(url.searchParams.get("maxResults"), 100, 500);
    const page = messages.slice(offset, offset + limit);
    const nextPageToken = offset + limit < messages.length ? String(offset + limit) : void 0;
    return c.json({
      messages: page.map((message) => ({
        id: message.gmail_id,
        threadId: message.thread_id
      })),
      nextPageToken,
      resultSizeEstimate: messages.length
    });
  });
  app.post("/gmail/v1/users/:userId/messages/batchModify", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const ids = getStringArray(body, "ids");
    const addLabelIds = getStringArray(body, "addLabelIds");
    const removeLabelIds = getStringArray(body, "removeLabelIds");
    const missingLabelIds = findMissingLabelIds(gs, authEmail, [...addLabelIds, ...removeLabelIds]);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    for (const messageId of ids) {
      const message = getMessageById(gs, authEmail, messageId);
      if (!message) continue;
      markMessageModified(gs, message, applyLabelMutation(message.label_ids, addLabelIds, removeLabelIds));
    }
    return c.body(null, 204);
  });
  app.post("/gmail/v1/users/:userId/messages/batchDelete", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const ids = getStringArray(body, "ids");
    for (const messageId of ids) {
      const message = getMessageById(gs, authEmail, messageId);
      if (message) deleteMessage(gs, message);
    }
    return c.body(null, 204);
  });
  app.post("/gmail/v1/users/:userId/messages/import", createHandler("import"));
  app.post("/upload/gmail/v1/users/:userId/messages/import", createHandler("import"));
  app.post("/gmail/v1/users/:userId/messages/send", createHandler("send"));
  app.post("/upload/gmail/v1/users/:userId/messages/send", createHandler("send"));
  app.post("/gmail/v1/users/:userId/messages", createHandler("insert"));
  app.post("/upload/gmail/v1/users/:userId/messages", createHandler("insert"));
  app.get("/gmail/v1/users/:userId/messages/:messageId/attachments/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("messageId"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const attachment = getAttachmentById(gs, authEmail, message.gmail_id, c.req.param("id"));
    if (!attachment) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json({
      attachmentId: attachment.gmail_id,
      size: attachment.size,
      data: attachment.data
    });
  });
  app.get("/gmail/v1/users/:userId/messages/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("id"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const url = new URL(c.req.url);
    return c.json(
      formatMessageResource(
        gs,
        message,
        parseFormat(url.searchParams.get("format")),
        url.searchParams.getAll("metadataHeaders")
      )
    );
  });
  app.post("/gmail/v1/users/:userId/messages/:id/modify", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("id"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const body = await parseGoogleBody(c);
    const addLabelIds = getStringArray(body, "addLabelIds");
    const removeLabelIds = getStringArray(body, "removeLabelIds");
    const missingLabelIds = findMissingLabelIds(gs, authEmail, [...addLabelIds, ...removeLabelIds]);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    const updated = markMessageModified(
      gs,
      message,
      applyLabelMutation(message.label_ids, addLabelIds, removeLabelIds)
    );
    return c.json(formatMessageResource(gs, updated, "full"));
  });
  app.post("/gmail/v1/users/:userId/messages/:id/trash", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("id"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json(
      formatMessageResource(gs, markMessageModified(gs, message, trashLabelIds(message.label_ids)), "full")
    );
  });
  app.post("/gmail/v1/users/:userId/messages/:id/untrash", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("id"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json(
      formatMessageResource(gs, markMessageModified(gs, message, untrashLabelIds(message.label_ids)), "full")
    );
  });
  app.delete("/gmail/v1/users/:userId/messages/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const message = getMessageById(gs, authEmail, c.req.param("id"));
    if (!message) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    deleteMessage(gs, message);
    return c.body(null, 204);
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
var keyPairPromise = generateKeyPair("RS256");
var KID = "emulate-google-1";
var PENDING_CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("google.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("google.oauth.pendingCodes", map);
  }
  return map;
}
function getRefreshTokens(store) {
  let map = store.getData("google.oauth.refreshTokens");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("google.oauth.refreshTokens", map);
  }
  return map;
}
function isPendingCodeExpired(p) {
  return Date.now() - p.created_at > PENDING_CODE_TTL_MS;
}
var SERVICE_LABEL = "Google";
async function createIdToken(user, clientId, nonce, baseUrl) {
  const { privateKey } = await keyPairPromise;
  const builder = new SignJWT({
    sub: user.uid,
    email: user.email,
    email_verified: user.email_verified,
    name: user.name,
    given_name: user.given_name,
    family_name: user.family_name,
    picture: user.picture,
    locale: user.locale,
    ...user.hd ? { hd: user.hd } : {},
    ...nonce ? { nonce } : {}
  }).setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" }).setIssuer(baseUrl).setAudience(clientId).setIssuedAt().setExpirationTime("1h");
  return builder.sign(privateKey);
}
function oauthRoutes({ app, store, baseUrl, tokenMap }) {
  const gs = getGoogleStore(store);
  app.get("/.well-known/openid-configuration", (c) => {
    return c.json({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/o/oauth2/v2/auth`,
      token_endpoint: `${baseUrl}/oauth2/token`,
      userinfo_endpoint: `${baseUrl}/oauth2/v2/userinfo`,
      revocation_endpoint: `${baseUrl}/oauth2/revoke`,
      jwks_uri: `${baseUrl}/oauth2/v3/certs`,
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "email", "profile"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      claims_supported: [
        "sub",
        "email",
        "email_verified",
        "name",
        "given_name",
        "family_name",
        "picture",
        "locale",
        "hd"
      ],
      code_challenge_methods_supported: ["plain", "S256"]
    });
  });
  app.get("/oauth2/v3/certs", async (c) => {
    const { publicKey } = await keyPairPromise;
    const jwk = await exportJWK(publicKey);
    return c.json({
      keys: [
        {
          ...jwk,
          kid: KID,
          use: "sig",
          alg: "RS256"
        }
      ]
    });
  });
  app.get("/o/oauth2/v2/auth", (c) => {
    const client_id = c.req.query("client_id") ?? "";
    const redirect_uri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const state = c.req.query("state") ?? "";
    const nonce = c.req.query("nonce") ?? "";
    const code_challenge = c.req.query("code_challenge") ?? "";
    const code_challenge_method = c.req.query("code_challenge_method") ?? "";
    const clientsConfigured = gs.oauthClients.all().length > 0;
    let clientName = "";
    if (clientsConfigured) {
      const client = gs.oauthClients.findOneBy("client_id", client_id);
      if (!client) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${client_id}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (redirect_uri && !matchesRedirectUri(redirect_uri, client.redirect_uris)) {
        return c.html(
          renderErrorPage(
            "Redirect URI mismatch",
            "The redirect_uri is not registered for this application.",
            SERVICE_LABEL
          ),
          400
        );
      }
      clientName = client.name;
    }
    const subtitleText = clientName ? `Sign in to <strong>${escapeHtml(clientName)}</strong> with your Google account.` : "Choose a seeded user to continue.";
    const users = gs.users.all();
    const userButtons = users.map((user) => {
      return renderUserButton({
        letter: (user.email[0] ?? "?").toUpperCase(),
        login: user.email,
        name: user.name,
        email: user.email,
        formAction: "/o/oauth2/v2/auth/callback",
        hiddenFields: {
          email: user.email,
          redirect_uri,
          scope,
          state,
          nonce,
          client_id,
          code_challenge,
          code_challenge_method
        }
      });
    }).join("\n");
    const body = users.length === 0 ? '<p class="empty">No users in the emulator store.</p>' : userButtons;
    return c.html(renderCardPage("Sign in to Google", subtitleText, body, SERVICE_LABEL));
  });
  app.post("/o/oauth2/v2/auth/callback", async (c) => {
    const body = await c.req.parseBody();
    const email = bodyStr(body.email);
    const redirect_uri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope);
    const state = bodyStr(body.state);
    const client_id = bodyStr(body.client_id);
    const nonce = bodyStr(body.nonce);
    const code_challenge = bodyStr(body.code_challenge);
    const code_challenge_method = bodyStr(body.code_challenge_method);
    const code = randomBytes2(20).toString("hex");
    getPendingCodes(store).set(code, {
      email,
      scope,
      redirectUri: redirect_uri,
      clientId: client_id,
      nonce: nonce || null,
      codeChallenge: code_challenge || null,
      codeChallengeMethod: code_challenge_method || null,
      created_at: Date.now()
    });
    debug("google.oauth", `[Google callback] code=${code.slice(0, 8)}... email=${email}`);
    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  });
  app.post("/oauth2/token", async (c) => {
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
    const redirect_uri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
    const grant_type = typeof body.grant_type === "string" ? body.grant_type : "";
    const code_verifier = typeof body.code_verifier === "string" ? body.code_verifier : void 0;
    const bodyClientId = typeof body.client_id === "string" ? body.client_id : "";
    const bodyClientSecret = typeof body.client_secret === "string" ? body.client_secret : "";
    const clientsConfigured = gs.oauthClients.all().length > 0;
    if (clientsConfigured) {
      const client = gs.oauthClients.findOneBy("client_id", bodyClientId);
      if (!client) {
        return c.json({ error: "invalid_client", error_description: "The client_id is incorrect." }, 401);
      }
      if (!constantTimeSecretEqual(bodyClientSecret, client.client_secret)) {
        return c.json({ error: "invalid_client", error_description: "The client_secret is incorrect." }, 401);
      }
    }
    if (grant_type === "refresh_token") {
      const refreshToken2 = typeof body.refresh_token === "string" ? body.refresh_token : "";
      const record = getRefreshTokens(store).get(refreshToken2);
      if (!record) {
        return c.json({ error: "invalid_grant", error_description: "The refresh token is invalid." }, 400);
      }
      if (clientsConfigured && record.clientId !== bodyClientId) {
        return c.json({ error: "invalid_grant", error_description: "The refresh token is invalid." }, 400);
      }
      const user2 = gs.users.findOneBy("email", record.email);
      if (!user2) {
        return c.json({ error: "invalid_grant", error_description: "User not found." }, 400);
      }
      const accessToken2 = "google_" + randomBytes2(20).toString("base64url");
      const scopes2 = record.scope ? record.scope.split(/\s+/).filter(Boolean) : [];
      if (tokenMap) {
        tokenMap.set(accessToken2, { login: user2.email, id: user2.id, scopes: scopes2 });
      }
      return c.json({
        access_token: accessToken2,
        token_type: "Bearer",
        expires_in: 3600,
        scope: record.scope || "openid email profile"
      });
    }
    if (grant_type !== "authorization_code") {
      return c.json(
        {
          error: "unsupported_grant_type",
          error_description: "Only authorization_code and refresh_token are supported."
        },
        400
      );
    }
    const pendingMap = getPendingCodes(store);
    const pending = pendingMap.get(code);
    if (!pending) {
      return c.json({ error: "invalid_grant", error_description: "The code is incorrect or expired." }, 400);
    }
    if (isPendingCodeExpired(pending)) {
      pendingMap.delete(code);
      return c.json({ error: "invalid_grant", error_description: "The code is incorrect or expired." }, 400);
    }
    if (pending.codeChallenge != null) {
      if (code_verifier === void 0) {
        return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
      }
      const method = (pending.codeChallengeMethod ?? "plain").toLowerCase();
      if (method === "s256") {
        const expected = createHash("sha256").update(code_verifier).digest("base64url");
        if (expected !== pending.codeChallenge) {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
      } else if (method === "plain") {
        if (code_verifier !== pending.codeChallenge) {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
      } else {
        return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
      }
    }
    pendingMap.delete(code);
    const user = gs.users.findOneBy("email", pending.email);
    if (!user) {
      return c.json({ error: "invalid_grant", error_description: "User not found." }, 400);
    }
    const accessToken = "google_" + randomBytes2(20).toString("base64url");
    const refreshToken = "google_refresh_" + randomBytes2(24).toString("base64url");
    const scopes = pending.scope ? pending.scope.split(/\s+/).filter(Boolean) : [];
    if (tokenMap) {
      tokenMap.set(accessToken, { login: user.email, id: user.id, scopes });
    }
    getRefreshTokens(store).set(refreshToken, {
      email: user.email,
      scope: pending.scope,
      clientId: pending.clientId
    });
    const idToken = await createIdToken(user, pending.clientId, pending.nonce, baseUrl);
    debug("google.oauth", `[Google token] issued token for ${user.email}`);
    return c.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: pending.scope || "openid email profile"
    });
  });
  app.get("/oauth2/v2/userinfo", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: "invalid_token", error_description: "Authentication required." }, 401);
    }
    const user = gs.users.findOneBy("email", authUser.login);
    if (!user) {
      return c.json({ error: "invalid_token", error_description: "User not found." }, 401);
    }
    return c.json({
      sub: user.uid,
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      locale: user.locale,
      ...user.hd ? { hd: user.hd } : {}
    });
  });
  app.post("/oauth2/revoke", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    const rawText = await c.req.text();
    let token;
    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(rawText);
        token = typeof parsed.token === "string" ? parsed.token : "";
      } catch {
        token = "";
      }
    } else {
      const params = new URLSearchParams(rawText);
      token = params.get("token") ?? "";
    }
    if (token && tokenMap) {
      tokenMap.delete(token);
    }
    if (token) {
      getRefreshTokens(store).delete(token);
    }
    return c.body(null, 200);
  });
}
function settingsRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  app.get("/gmail/v1/users/:userId/settings/filters", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    return c.json({
      filter: listFiltersForUser(gs, authEmail).map((filter) => formatFilterResource(filter))
    });
  });
  app.post("/gmail/v1/users/:userId/settings/filters", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const body = await parseGoogleBody(c);
    const criteria = getRecord(body, "criteria") ?? {};
    const action = getRecord(body, "action") ?? {};
    const criteriaFrom = getString(criteria, "from") ?? null;
    const addLabelIds = getStringArray(action, "addLabelIds");
    const removeLabelIds = getStringArray(action, "removeLabelIds");
    if (addLabelIds.length === 0 && removeLabelIds.length === 0) {
      return googleApiError(c, 400, "Filter actions are required.", "invalidArgument", "INVALID_ARGUMENT");
    }
    const missingLabelIds = findMissingLabelIds(gs, authEmail, [...addLabelIds, ...removeLabelIds]);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    if (findMatchingFilter(gs, {
      user_email: authEmail,
      criteria_from: criteriaFrom,
      add_label_ids: addLabelIds,
      remove_label_ids: removeLabelIds
    })) {
      return googleApiError(c, 400, "Filter already exists", "failedPrecondition", "FAILED_PRECONDITION");
    }
    const filter = createFilterRecord(gs, {
      user_email: authEmail,
      criteria_from: criteriaFrom,
      add_label_ids: addLabelIds,
      remove_label_ids: removeLabelIds
    });
    return c.json(formatFilterResource(filter));
  });
  app.delete("/gmail/v1/users/:userId/settings/filters/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const filter = getFilterById(gs, authEmail, c.req.param("id"));
    if (!filter) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    gs.filters.delete(filter.id);
    return c.body(null, 204);
  });
  app.get("/gmail/v1/users/:userId/settings/forwardingAddresses", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    return c.json({
      forwardingAddresses: listForwardingAddressesForUser(gs, authEmail).map(
        (entry) => formatForwardingAddressResource(entry)
      )
    });
  });
  app.get("/gmail/v1/users/:userId/settings/sendAs", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    return c.json({
      sendAs: listSendAsForUser(gs, authEmail).map((entry) => formatSendAsResource(entry))
    });
  });
}
function threadRoutes({ app, store }) {
  const gs = getGoogleStore(store);
  app.get("/gmail/v1/users/:userId/threads", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const url = new URL(c.req.url);
    const threads = groupThreads(
      listMessagesForUser(gs, authEmail, {
        labelIds: url.searchParams.getAll("labelIds"),
        query: url.searchParams.get("q")?.trim() ?? void 0,
        includeSpamTrash: parseBooleanParam(url.searchParams.get("includeSpamTrash"))
      })
    );
    const offset = parseOffset(url.searchParams.get("pageToken"));
    const limit = normalizeLimit(url.searchParams.get("maxResults"), 100, 500);
    const page = threads.slice(offset, offset + limit);
    const nextPageToken = offset + limit < threads.length ? String(offset + limit) : void 0;
    return c.json({
      threads: page.map((thread) => ({
        id: thread.id,
        snippet: thread.snippet,
        historyId: thread.historyId
      })),
      nextPageToken,
      resultSizeEstimate: threads.length
    });
  });
  app.get("/gmail/v1/users/:userId/threads/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const url = new URL(c.req.url);
    const messages = getThreadMessages(gs, authEmail, c.req.param("id"), {
      includeSpamTrash: parseBooleanParam(url.searchParams.get("includeSpamTrash"))
    });
    if (messages.length === 0) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    return c.json(
      formatThreadResource(
        gs,
        messages,
        parseFormat(url.searchParams.get("format")),
        url.searchParams.getAll("metadataHeaders")
      )
    );
  });
  app.post("/gmail/v1/users/:userId/threads/:id/modify", async (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const messages = getThreadMessages(gs, authEmail, c.req.param("id"), { includeSpamTrash: true });
    if (messages.length === 0) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const body = await parseGoogleBody(c);
    const addLabelIds = getStringArray(body, "addLabelIds");
    const removeLabelIds = getStringArray(body, "removeLabelIds");
    const missingLabelIds = findMissingLabelIds(gs, authEmail, [...addLabelIds, ...removeLabelIds]);
    if (missingLabelIds.length > 0) {
      return googleApiError(
        c,
        400,
        `Invalid label IDs: ${missingLabelIds.join(", ")}`,
        "invalidArgument",
        "INVALID_ARGUMENT"
      );
    }
    const updated = messages.map(
      (message) => markMessageModified(gs, message, applyLabelMutation(message.label_ids, addLabelIds, removeLabelIds))
    );
    return c.json(formatThreadResource(gs, updated, "full"));
  });
  app.post("/gmail/v1/users/:userId/threads/:id/trash", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const messages = getThreadMessages(gs, authEmail, c.req.param("id"), { includeSpamTrash: true });
    if (messages.length === 0) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const updated = messages.map((message) => markMessageModified(gs, message, trashLabelIds(message.label_ids)));
    return c.json(formatThreadResource(gs, updated, "full"));
  });
  app.post("/gmail/v1/users/:userId/threads/:id/untrash", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const messages = getThreadMessages(gs, authEmail, c.req.param("id"), { includeSpamTrash: true });
    if (messages.length === 0) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    const updated = messages.map((message) => markMessageModified(gs, message, untrashLabelIds(message.label_ids)));
    return c.json(formatThreadResource(gs, updated, "full"));
  });
  app.delete("/gmail/v1/users/:userId/threads/:id", (c) => {
    const authEmail = requireGmailUser(c);
    if (authEmail instanceof Response) return authEmail;
    const messages = getThreadMessages(gs, authEmail, c.req.param("id"), { includeSpamTrash: true });
    if (messages.length === 0) {
      return googleApiError(c, 404, "Requested entity was not found.", "notFound", "NOT_FOUND");
    }
    for (const message of messages) {
      deleteMessage(gs, message);
    }
    return c.body(null, 204);
  });
}
function seedDefaults(store, _baseUrl) {
  const gs = getGoogleStore(store);
  const defaultEmail = "testuser@gmail.com";
  if (!gs.users.findOneBy("email", defaultEmail)) {
    gs.users.insert({
      uid: generateUid("goog"),
      email: defaultEmail,
      name: "Test User",
      given_name: "Test",
      family_name: "User",
      picture: null,
      email_verified: true,
      locale: "en",
      hd: null
    });
  }
  ensureSystemLabels(gs, defaultEmail);
  seedCalendars(
    store,
    [
      {
        id: "primary",
        user_email: defaultEmail,
        summary: defaultEmail,
        primary: true,
        selected: true,
        time_zone: "UTC"
      },
      {
        id: "cal_team",
        user_email: defaultEmail,
        summary: "Team Calendar",
        description: "Shared team events",
        selected: true,
        time_zone: "UTC"
      }
    ],
    defaultEmail
  );
  seedCalendarEvents(
    store,
    [
      {
        id: "evt_standup",
        user_email: defaultEmail,
        calendar_id: "primary",
        summary: "Daily Standup",
        description: "Team sync",
        start_date_time: new Date(Date.now() + 60 * 60 * 1e3).toISOString(),
        end_date_time: new Date(Date.now() + 90 * 60 * 1e3).toISOString(),
        attendees: [
          { email: defaultEmail, display_name: "Test User" },
          { email: "teammate@example.com", display_name: "Teammate" }
        ],
        conference_entry_points: [
          {
            entry_point_type: "video",
            uri: "https://meet.google.com/emulate-standup",
            label: "Google Meet"
          }
        ],
        hangout_link: "https://meet.google.com/emulate-standup"
      }
    ],
    defaultEmail
  );
  seedDriveItems(
    store,
    [
      {
        id: "drv_root_receipts",
        user_email: defaultEmail,
        name: "Receipts",
        mime_type: "application/vnd.google-apps.folder",
        parent_ids: ["root"]
      },
      {
        id: "drv_receipt_pdf",
        user_email: defaultEmail,
        name: "March Receipt.pdf",
        mime_type: "application/pdf",
        parent_ids: ["drv_root_receipts"],
        data: "receipt-pdf-data"
      }
    ],
    defaultEmail
  );
  seedMessages(
    store,
    [
      {
        id: "msg_welcome",
        thread_id: "thr_welcome",
        user_email: defaultEmail,
        from: "Welcome Team <welcome@example.com>",
        to: defaultEmail,
        subject: "Welcome to your local Gmail emulator",
        snippet: "Your OAuth flow is set up and Gmail message, thread, and label APIs are ready.",
        body_text: "Your OAuth flow is set up and Gmail message, thread, and label APIs are ready.\n\nUse this inbox to test Gmail automations locally.",
        label_ids: ["INBOX", "UNREAD", "CATEGORY_UPDATES"],
        date: new Date(Date.now() - 60 * 60 * 1e3).toISOString()
      },
      {
        id: "msg_build",
        thread_id: "thr_build",
        user_email: defaultEmail,
        from: "Build Bot <builds@example.com>",
        to: defaultEmail,
        subject: "Nightly build finished successfully",
        snippet: "The latest build completed successfully in 6 minutes.",
        body_text: "The latest build completed successfully in 6 minutes.\n\nArtifact upload finished and smoke checks passed.",
        label_ids: ["INBOX", "CATEGORY_UPDATES"],
        date: new Date(Date.now() - 2 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "msg_build_reply",
        thread_id: "thr_build",
        user_email: defaultEmail,
        from: defaultEmail,
        to: "Build Bot <builds@example.com>",
        subject: "Re: Nightly build finished successfully",
        snippet: "Thanks, I will review the artifact after lunch.",
        body_text: "Thanks, I will review the artifact after lunch.",
        label_ids: ["SENT"],
        date: new Date(Date.now() - 90 * 60 * 1e3).toISOString(),
        in_reply_to: "<msg_build@emulate.google.local>",
        references: "<msg_build@emulate.google.local>"
      },
      {
        id: "msg_draft",
        thread_id: "thr_draft",
        user_email: defaultEmail,
        from: defaultEmail,
        to: "someone@example.com",
        subject: "Draft follow-up",
        snippet: "Checking in on the open question from yesterday.",
        body_text: "Checking in on the open question from yesterday.",
        label_ids: ["DRAFT"],
        date: new Date(Date.now() - 30 * 60 * 1e3).toISOString()
      }
    ],
    defaultEmail
  );
}
var CONSUMER_EMAIL_DOMAINS = /* @__PURE__ */ new Set(["gmail.com", "googlemail.com"]);
function deriveHd(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  if (CONSUMER_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}
function resolveHd(user) {
  if (user.hd !== void 0) return user.hd || null;
  return deriveHd(user.email);
}
function seedFromConfig(store, _baseUrl, config) {
  const gs = getGoogleStore(store);
  if (config.users) {
    for (const user of config.users) {
      const existing = gs.users.findOneBy("email", user.email);
      if (!existing) {
        const nameParts = (user.name ?? "").split(/\s+/).filter(Boolean);
        gs.users.insert({
          uid: generateUid("goog"),
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          given_name: user.given_name ?? nameParts[0] ?? "",
          family_name: user.family_name ?? nameParts.slice(1).join(" "),
          picture: user.picture ?? null,
          email_verified: user.email_verified ?? true,
          locale: user.locale ?? "en",
          hd: resolveHd(user)
        });
      }
      ensureSystemLabels(gs, user.email);
    }
  }
  if (config.oauth_clients) {
    for (const client of config.oauth_clients) {
      const existing = gs.oauthClients.findOneBy("client_id", client.client_id);
      if (existing) continue;
      gs.oauthClients.insert({
        client_id: client.client_id,
        client_secret: client.client_secret,
        name: client.name ?? "Code App (Google)",
        redirect_uris: client.redirect_uris
      });
    }
  }
  const fallbackEmail = config.users?.[0]?.email ?? gs.users.all()[0]?.email ?? "testuser@gmail.com";
  ensureSystemLabels(gs, fallbackEmail);
  if (config.labels) {
    seedLabels(store, config.labels, fallbackEmail);
  }
  if (config.messages) {
    seedMessages(store, config.messages, fallbackEmail);
  }
  if (config.calendars) {
    seedCalendars(store, config.calendars, fallbackEmail);
  }
  if (config.calendar_events) {
    seedCalendarEvents(store, config.calendar_events, fallbackEmail);
  }
  if (config.drive_items) {
    seedDriveItems(store, config.drive_items, fallbackEmail);
  }
}
function seedLabels(store, labels, fallbackEmail) {
  const gs = getGoogleStore(store);
  for (const label of labels) {
    const userEmail = label.user_email ?? fallbackEmail;
    ensureSystemLabels(gs, userEmail);
    const existing = (label.id ? findLabelById(gs, userEmail, label.id) : void 0) ?? findLabelByName(gs, userEmail, label.name);
    if (existing) continue;
    createLabelRecord(gs, {
      gmail_id: label.id,
      user_email: userEmail,
      name: label.name,
      type: label.type ?? "user",
      message_list_visibility: label.message_list_visibility ?? "show",
      label_list_visibility: label.label_list_visibility ?? "labelShow",
      color_background: label.color_background ?? null,
      color_text: label.color_text ?? null
    });
  }
}
function seedMessages(store, messages, fallbackEmail) {
  const gs = getGoogleStore(store);
  for (const message of messages) {
    const userEmail = message.user_email ?? fallbackEmail;
    ensureSystemLabels(gs, userEmail);
    if (message.id && gs.messages.findOneBy("gmail_id", message.id)) continue;
    createStoredMessage(
      gs,
      {
        gmail_id: message.id,
        thread_id: message.thread_id,
        user_email: userEmail,
        raw: message.raw ?? null,
        from: message.from,
        to: message.to,
        cc: message.cc ?? null,
        bcc: message.bcc ?? null,
        reply_to: message.reply_to ?? null,
        subject: message.subject,
        snippet: message.snippet,
        body_text: message.body_text ?? null,
        body_html: message.body_html ?? null,
        label_ids: message.label_ids ?? ["INBOX", "UNREAD"],
        date: message.date,
        internal_date: message.internal_date,
        message_id: message.message_id,
        references: message.references ?? null,
        in_reply_to: message.in_reply_to ?? null
      },
      {
        createMissingCustomLabels: true
      }
    );
  }
}
function seedCalendars(store, calendars, fallbackEmail) {
  const gs = getGoogleStore(store);
  for (const calendar of calendars) {
    const userEmail = calendar.user_email ?? fallbackEmail;
    createCalendarRecord(gs, {
      google_id: calendar.id,
      user_email: userEmail,
      summary: calendar.summary,
      description: calendar.description ?? null,
      time_zone: calendar.time_zone ?? "UTC",
      primary: calendar.primary ?? false,
      selected: calendar.selected ?? true,
      access_role: calendar.access_role ?? "owner"
    });
  }
}
function seedCalendarEvents(store, events, fallbackEmail) {
  const gs = getGoogleStore(store);
  for (const event of events) {
    const userEmail = event.user_email ?? fallbackEmail;
    createCalendarEventRecord(gs, {
      google_id: event.id,
      user_email: userEmail,
      calendar_google_id: event.calendar_id ?? "primary",
      status: event.status ?? "confirmed",
      summary: event.summary,
      description: event.description ?? null,
      location: event.location ?? null,
      start_date_time: event.start_date_time ?? null,
      start_date: event.start_date ?? null,
      end_date_time: event.end_date_time ?? null,
      end_date: event.end_date ?? null,
      attendees: (event.attendees ?? []).map((attendee) => ({
        email: attendee.email,
        display_name: attendee.display_name ?? null,
        response_status: null,
        organizer: false,
        self: attendee.email === userEmail
      })),
      conference_entry_points: (event.conference_entry_points ?? []).map((entry) => ({
        entry_point_type: entry.entry_point_type,
        uri: entry.uri,
        label: entry.label ?? null
      })),
      hangout_link: event.hangout_link ?? null
    });
  }
}
function seedDriveItems(store, items, fallbackEmail) {
  const gs = getGoogleStore(store);
  for (const item of items) {
    const userEmail = item.user_email ?? fallbackEmail;
    if (item.id && gs.driveItems.findOneBy("google_id", item.id)) continue;
    createDriveItemRecord(gs, {
      google_id: item.id,
      user_email: userEmail,
      name: item.name,
      mime_type: item.mime_type,
      parent_google_ids: item.parent_ids ?? ["root"],
      size: item.data ? Buffer.byteLength(item.data, "utf8") : null,
      data: item.data ? Buffer.from(item.data, "utf8").toString("base64url") : null
    });
  }
}
var googlePlugin = {
  name: "google",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    oauthRoutes(ctx);
    calendarRoutes(ctx);
    driveRoutes(ctx);
    messageRoutes(ctx);
    draftRoutes(ctx);
    historyRoutes(ctx);
    threadRoutes(ctx);
    labelRoutes(ctx);
    settingsRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = googlePlugin;
export {
  index_default as default,
  getGoogleStore,
  googlePlugin,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-NGQCW5CM.js.map
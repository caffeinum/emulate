import "./chunk-PZ5AY32C.js";

// ../@emulators/telegram/dist/index.js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ../../node_modules/.pnpm/telegram-bot-test-server@https+++codeload.github.com+caffeinum+telegram-bot-test-server_e02bc4cb38ae96e5217d7463d9f50e79/node_modules/telegram-bot-test-server/src/owner.js
var MUTE_FOREVER = 2147483647;
var CHANNEL_PEER_OFFSET = 1e12;
var KINDS = /* @__PURE__ */ new Set(["private", "bot", "group", "supergroup", "channel"]);
var MAX_DELAY_MS = 3e4;
var REDACTED_KEY = /session|token|hash|password|phone|secret|key/i;
var FILTER_FLAGS = [
  "contacts",
  "nonContacts",
  "groups",
  "broadcasts",
  "bots",
  "excludeMuted",
  "excludeRead",
  "excludeArchived"
];
var REQUESTS = {
  connect: null,
  disconnect: null,
  isUserAuthorized: "updates.GetState",
  getMe: "users.GetUsers",
  getEntity: "users.GetUsers",
  getInputEntity: "users.GetUsers",
  getDialogs: "messages.GetDialogs",
  getMessages: "messages.GetHistory",
  invoke: null
};
var PRESETS = /* @__PURE__ */ new Set([
  "flood_wait",
  "permission_denied",
  "reconnect_required",
  "stale_entity",
  "malformed_page",
  "dropped"
]);
var OwnerError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function rpcError(errorMessage, code, request, seconds = null) {
  if (seconds != null) {
    return {
      name: "FloodWaitError",
      message: `A wait of ${seconds} seconds is required${request ? ` (caused by ${request})` : ""}`,
      // GramJS's FloodWaitError carries "FLOOD", not the raw FLOOD_WAIT_<n>.
      errorMessage: "FLOOD",
      code: 420,
      seconds
    };
  }
  return {
    name: "RPCError",
    message: `${code}: ${errorMessage}${request ? ` (caused by ${request})` : ""}`,
    errorMessage,
    code
  };
}
var RpcFailure = class extends Error {
  constructor(error) {
    super(error.message);
    this.error = error;
  }
};
function notModelled(what) {
  return new RpcFailure({
    name: "Error",
    message: `${what} is not modelled by telegram-bot-test-server`,
    code: "OWNER_CLIENT_UNSUPPORTED"
  });
}
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        REDACTED_KEY.test(key) ? "[redacted]" : redact(entry)
      ])
    );
  }
  return value;
}
function positiveInt(value, name) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new OwnerError(400, `${name} must be a positive whole number`);
  }
  return number;
}
function whole(value, name, { min = 0 } = {}) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min) {
    throw new OwnerError(
      400,
      `${name} must be a whole number of at least ${min}`
    );
  }
  return number;
}
function markedId(kind, rawId) {
  if (kind === "private" || kind === "bot") return rawId;
  if (kind === "group") return -rawId;
  return -(CHANNEL_PEER_OFFSET + rawId);
}
function accessHash(rawId) {
  return rawId * 2654435761 % 2147483647;
}
function createOwnerModel({ log = () => {
} } = {}) {
  const owners = /* @__PURE__ */ new Map();
  const startSeconds = Math.floor(Date.now() / 1e3);
  let nextOwnerId = 6e9 + startSeconds % 1e6;
  let pinSequence = 0;
  function requireOwner(ownerId) {
    const owner = owners.get(Number(ownerId));
    if (!owner) throw new OwnerError(404, `No owner ${ownerId}`);
    return owner;
  }
  function requirePeer(owner, peerId) {
    const peer = owner.peers.get(Number(peerId));
    if (!peer) {
      throw new OwnerError(404, `Owner ${owner.id} has no dialog ${peerId}`);
    }
    return peer;
  }
  function userEntity(owner, user) {
    return {
      className: "User",
      id: user.id,
      self: user.id === owner.id,
      bot: user.bot === true,
      firstName: user.firstName,
      lastName: user.lastName ?? null,
      username: user.username ?? null,
      accessHash: accessHash(user.id),
      photo: null
    };
  }
  function userById(owner, userId) {
    if (userId === owner.id) return owner.user;
    return owner.users.get(userId) ?? null;
  }
  function peerEntity(owner, peer) {
    if (peer.kind === "private" || peer.kind === "bot") {
      return userEntity(owner, owner.users.get(peer.rawId));
    }
    if (peer.kind === "group") {
      return {
        className: "Chat",
        id: peer.rawId,
        title: peer.title,
        participantsCount: peer.participantsCount,
        deactivated: false,
        photo: null
      };
    }
    return {
      className: "Channel",
      id: peer.rawId,
      title: peer.title,
      username: peer.username ?? null,
      megagroup: peer.kind === "supergroup",
      broadcast: peer.kind === "channel",
      participantsCount: peer.participantsCount,
      accessHash: accessHash(peer.rawId),
      photo: null
    };
  }
  function peerRef(peer) {
    if (peer.kind === "private" || peer.kind === "bot") {
      return { className: "PeerUser", userId: peer.rawId };
    }
    if (peer.kind === "group") {
      return { className: "PeerChat", chatId: peer.rawId };
    }
    return { className: "PeerChannel", channelId: peer.rawId };
  }
  function inputPeer(owner, markedPeerId) {
    if (markedPeerId === owner.id) return { className: "InputPeerSelf" };
    if (markedPeerId > 0) {
      return {
        className: "InputPeerUser",
        userId: markedPeerId,
        accessHash: accessHash(markedPeerId)
      };
    }
    if (markedPeerId > -CHANNEL_PEER_OFFSET) {
      return { className: "InputPeerChat", chatId: -markedPeerId };
    }
    const channelId = -markedPeerId - CHANNEL_PEER_OFFSET;
    return {
      className: "InputPeerChannel",
      channelId,
      accessHash: accessHash(channelId)
    };
  }
  function displayName(entity) {
    if (entity.className === "User") {
      return [entity.firstName, entity.lastName].filter(Boolean).join(" ");
    }
    return entity.title;
  }
  function mediaView(media, date) {
    if (!media) return null;
    if (media.type === "photo") {
      return {
        className: "MessageMediaPhoto",
        photo: {
          className: "Photo",
          id: media.id,
          date,
          sizes: [
            {
              className: "PhotoSize",
              type: "x",
              w: media.width ?? 800,
              h: media.height ?? 600,
              size: media.size ?? 0
            }
          ]
        }
      };
    }
    return {
      className: "MessageMediaDocument",
      document: {
        className: "Document",
        id: media.id,
        date,
        mimeType: media.mimeType ?? "application/octet-stream",
        size: media.size ?? 0,
        attributes: media.fileName ? [
          {
            className: "DocumentAttributeFilename",
            fileName: media.fileName
          }
        ] : []
      }
    };
  }
  function messageView(owner, peer, message) {
    const chat = peerEntity(owner, peer);
    let senderId;
    let fromId = null;
    if (message.fromId != null) {
      senderId = message.fromId;
      fromId = { className: "PeerUser", userId: message.fromId };
    } else if (peer.kind === "private" || peer.kind === "bot") {
      senderId = message.out ? owner.id : peer.rawId;
    } else {
      senderId = peer.id;
    }
    const senderUser = senderId > 0 ? userById(owner, senderId) : null;
    const base = {
      className: message.action ? "MessageService" : "Message",
      id: message.id,
      peerId: peerRef(peer),
      date: message.date,
      out: message.out === true,
      post: peer.kind === "channel",
      fromId,
      senderId,
      sender: senderUser ? userEntity(owner, senderUser) : chat,
      chatId: peer.id,
      chat,
      replyTo: message.replyTo == null ? null : { className: "MessageReplyHeader", replyToMsgId: message.replyTo },
      replyToMsgId: message.replyTo ?? null
    };
    if (message.action) {
      return { ...base, action: { ...message.action } };
    }
    const text = message.text ?? "";
    return {
      ...base,
      message: text,
      rawText: text,
      text,
      entities: [],
      editDate: message.editDate ?? null,
      media: mediaView(message.media, message.date),
      fwdFrom: null,
      groupedId: null,
      reactions: null
    };
  }
  function liveMessages(peer) {
    return [...peer.messages.values()].filter((message) => !message.deleted).sort((left, right) => right.id - left.id);
  }
  function dialogKey(peer) {
    const top = liveMessages(peer)[0];
    return {
      date: top?.date ?? peer.createdDate,
      messageId: top?.id ?? 0,
      peerId: peer.id,
      top
    };
  }
  function dialogView(owner, peer) {
    const entity = peerEntity(owner, peer);
    const { date, top } = dialogKey(peer);
    const muted = peer.muteUntil;
    const archived = peer.folder === 1;
    return {
      id: peer.id,
      entity,
      inputEntity: inputPeer(owner, peer.id),
      name: displayName(entity),
      title: displayName(entity),
      date,
      message: top ? messageView(owner, peer, top) : void 0,
      pinned: peer.pinnedAt != null,
      // GramJS's Dialog: folderId is only set for the archive.
      ...archived ? { folderId: 1 } : {},
      archived,
      unreadCount: peer.unreadCount,
      unreadMentionsCount: 0,
      isUser: entity.className === "User",
      isGroup: entity.className === "Chat" || entity.className === "Channel" && entity.megagroup === true,
      isChannel: entity.className === "Channel",
      dialog: {
        className: "Dialog",
        peer: peerRef(peer),
        topMessage: top?.id ?? 0,
        pinned: peer.pinnedAt != null,
        unreadCount: peer.unreadCount,
        unreadMentionsCount: 0,
        ...archived ? { folderId: 1 } : {},
        notifySettings: { className: "PeerNotifySettings", muteUntil: muted }
      }
    };
  }
  function filterView(owner, filter) {
    const peers = (ids) => ids.map((id) => inputPeer(owner, id));
    return {
      className: "DialogFilter",
      id: filter.id,
      title: {
        className: "TextWithEntities",
        text: filter.title,
        entities: []
      },
      ...filter.emoticon ? { emoticon: filter.emoticon } : {},
      ...filter.color != null ? { color: filter.color } : {},
      titleNoanimate: false,
      ...Object.fromEntries(
        FILTER_FLAGS.map((flag) => [flag, filter[flag] === true])
      ),
      pinnedPeers: peers(filter.pinnedPeers),
      includePeers: peers(filter.includePeers),
      excludePeers: peers(filter.excludePeers)
    };
  }
  function markedFromRef(owner, ref) {
    if (ref == null) return null;
    if (typeof ref === "number") return ref;
    if (typeof ref === "string") {
      if (ref === "me" || ref === "self") return owner.id;
      if (/^-?\d+$/.test(ref)) return Number(ref);
      const username = ref.replace(/^@/, "").toLowerCase();
      if (owner.user.username?.toLowerCase() === username) return owner.id;
      for (const user of owner.users.values()) {
        if (user.username?.toLowerCase() === username) return user.id;
      }
      for (const peer of owner.peers.values()) {
        if (peer.username?.toLowerCase() === username) return peer.id;
      }
      return null;
    }
    switch (ref.className) {
      case "User":
      case "PeerUser":
      case "InputPeerUser":
        return Number(ref.id ?? ref.userId);
      case "Chat":
      case "PeerChat":
      case "InputPeerChat":
        return -Number(ref.id ?? ref.chatId);
      case "Channel":
      case "PeerChannel":
      case "InputPeerChannel":
        return -(CHANNEL_PEER_OFFSET + Number(ref.id ?? ref.channelId));
      case "InputPeerSelf":
        return owner.id;
      case "InputPeerEmpty":
        return null;
      default:
        return null;
    }
  }
  function notFound(ref) {
    return new RpcFailure({
      name: "Error",
      // GramJS's wording when an entity is not known to the client.
      message: `Could not find the input entity for ${JSON.stringify(ref)}`
    });
  }
  function resolveEntity(owner, ref) {
    const id = markedFromRef(owner, ref);
    if (id === owner.id) return userEntity(owner, owner.user);
    if (id != null && owner.peers.has(id)) {
      return peerEntity(owner, owner.peers.get(id));
    }
    if (id != null && id > 0 && owner.users.has(id)) {
      return userEntity(owner, owner.users.get(id));
    }
    throw notFound(ref);
  }
  function resolvePeer(owner, ref) {
    const id = markedFromRef(owner, ref);
    if (id != null && owner.peers.has(id)) return owner.peers.get(id);
    throw notFound(ref);
  }
  const handlers = {
    connect: () => true,
    disconnect: () => true,
    isUserAuthorized: (owner) => owner.authorized,
    getMe: (owner) => userEntity(owner, owner.user),
    getEntity: (owner, args) => resolveEntity(owner, args.peer),
    getInputEntity: (owner, args) => {
      const entity = resolveEntity(owner, args.peer);
      return inputPeer(owner, markedFromRef(owner, entity));
    },
    getDialogs: (owner, args) => {
      const allowed = /* @__PURE__ */ new Set([
        "folder",
        "archived",
        "limit",
        "ignorePinned",
        "ignoreMigrated",
        "offsetDate",
        "offsetId",
        "offsetPeer"
      ]);
      for (const key of Object.keys(args)) {
        if (!allowed.has(key)) throw notModelled(`getDialogs option ${key}`);
      }
      const folder = args.archived != null ? args.archived ? 1 : 0 : Number(args.folder ?? 0);
      if (folder !== 0 && folder !== 1) {
        throw new RpcFailure(
          rpcError("FOLDER_ID_INVALID", 400, "messages.GetDialogs")
        );
      }
      const inFolder = [...owner.peers.values()].filter(
        (peer) => peer.folder === folder
      );
      const offsetPeer = markedFromRef(owner, args.offsetPeer);
      const offsetDate = Number(args.offsetDate ?? 0);
      const offsetId = Number(args.offsetId ?? 0);
      const hasOffset = offsetDate > 0 || offsetId > 0 || offsetPeer != null;
      const pinned = hasOffset || args.ignorePinned === true ? [] : inFolder.filter((peer) => peer.pinnedAt != null).sort((left, right) => right.pinnedAt - left.pinnedAt);
      const compare = (left, right) => right.date - left.date || right.messageId - left.messageId || right.peerId - left.peerId;
      let rest = inFolder.filter((peer) => peer.pinnedAt == null).map((peer) => ({ peer, ...dialogKey(peer) })).sort(compare);
      if (hasOffset) {
        const offset = {
          date: offsetDate,
          messageId: offsetId,
          peerId: offsetPeer ?? Number.POSITIVE_INFINITY
        };
        rest = rest.filter((entry) => compare(offset, entry) < 0);
      }
      const ordered = [...pinned, ...rest.map((entry) => entry.peer)];
      const limit = args.limit == null ? ordered.length : whole(args.limit, "limit");
      return {
        total: inFolder.length,
        dialogs: ordered.slice(0, limit).map((peer) => dialogView(owner, peer))
      };
    },
    getMessages: (owner, args) => {
      const allowed = /* @__PURE__ */ new Set(["entity", "limit", "offsetId", "ids"]);
      for (const key of Object.keys(args)) {
        if (!allowed.has(key)) throw notModelled(`getMessages option ${key}`);
      }
      const peer = resolvePeer(owner, args.entity);
      if (args.ids != null) {
        const ids = Array.isArray(args.ids) ? args.ids : [args.ids];
        return {
          total: ids.length,
          messages: ids.map((id) => {
            const message = peer.messages.get(Number(id));
            return message && !message.deleted ? messageView(owner, peer, message) : null;
          })
        };
      }
      const all = liveMessages(peer);
      const offsetId = Number(args.offsetId ?? 0);
      const older = offsetId > 0 ? all.filter((message) => message.id < offsetId) : all;
      const limit = args.limit == null ? older.length : whole(args.limit, "limit");
      return {
        total: all.length,
        messages: older.slice(0, limit).map((message) => messageView(owner, peer, message))
      };
    },
    invoke: (owner, args) => {
      const className = args.request?.className;
      if (className !== "messages.GetDialogFilters") {
        throw notModelled(`the ${className ?? "unnamed"} request`);
      }
      return {
        className: "messages.DialogFilters",
        tagsEnabled: false,
        filters: owner.filterOrder.map(
          (id) => id === 0 ? { className: "DialogFilterDefault" } : filterView(owner, owner.filters.get(id))
        )
      };
    }
  };
  function takeFault(owner, method, args) {
    const target = args.peer ?? args.entity ?? args.offsetPeer ?? null;
    const peerId = target == null ? null : markedFromRef(owner, target);
    const index = owner.faults.findIndex(
      (fault2) => fault2.method === method && (fault2.peerId == null || fault2.peerId === peerId)
    );
    if (index < 0) return null;
    const fault = owner.faults[index];
    fault.remaining -= 1;
    if (fault.remaining <= 0) owner.faults.splice(index, 1);
    return fault;
  }
  function faultError(fault, method, args) {
    const request = method === "invoke" ? args.request?.className : REQUESTS[method];
    switch (fault.preset) {
      case "flood_wait":
        return rpcError("FLOOD", 420, request, fault.seconds ?? 30);
      case "permission_denied":
        return rpcError("CHAT_WRITE_FORBIDDEN", 403, request);
      case "reconnect_required":
        return rpcError("AUTH_KEY_UNREGISTERED", 401, request);
      case "stale_entity":
        return rpcError("PEER_ID_INVALID", 400, request);
      default:
        return fault.errorMessage ? rpcError(fault.errorMessage, fault.code ?? 400, request) : null;
    }
  }
  function malformed(result) {
    if (Array.isArray(result?.dialogs)) {
      return {
        ...result,
        dialogs: result.dialogs.map(
          ({ entity: _entity, message: _message, ...rest }) => rest
        )
      };
    }
    if (Array.isArray(result?.messages)) {
      return {
        ...result,
        messages: result.messages.map(
          (message) => message && { className: message.className, id: message.id }
        )
      };
    }
    return result;
  }
  async function rpc(ownerId, method, args = {}) {
    const owner = owners.get(Number(ownerId));
    if (!owner) {
      return {
        status: 404,
        body: { error: { name: "Error", message: `No owner ${ownerId}` } }
      };
    }
    const call = {
      owner_id: owner.id,
      method,
      args: redact(args),
      at: (/* @__PURE__ */ new Date()).toISOString(),
      outcome: "ok"
    };
    owner.calls.push(call);
    const started = Date.now();
    const finish = (outcome, extra = {}) => {
      Object.assign(
        call,
        { outcome, duration_ms: Date.now() - started },
        extra
      );
    };
    if (!Object.hasOwn(handlers, method)) {
      const failure = notModelled(`owner client method ${method}`);
      finish("error", { error_message: failure.error.message });
      return { status: 200, body: { error: failure.error } };
    }
    const fault = takeFault(owner, method, args);
    if (fault?.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, fault.delayMs));
    }
    const injected = fault ? faultError(fault, method, args) : null;
    if (injected) {
      finish("error", { error_message: injected.errorMessage });
      return { status: 200, body: { error: injected } };
    }
    try {
      const needsAuthorization = ![
        "connect",
        "disconnect",
        "isUserAuthorized"
      ].includes(method);
      if (needsAuthorization && !owner.authorized) {
        throw new RpcFailure(
          rpcError(
            "AUTH_KEY_UNREGISTERED",
            401,
            REQUESTS[method] ?? args.request?.className
          )
        );
      }
      let result = handlers[method](owner, args);
      if (fault?.preset === "dropped") {
        finish("dropped");
        return { drop: true };
      }
      if (fault?.preset === "malformed_page") {
        result = malformed(result);
        finish("malformed");
      } else {
        finish("ok");
      }
      return { status: 200, body: { result } };
    } catch (error) {
      if (!(error instanceof RpcFailure)) throw error;
      finish("error", {
        error_message: error.error.errorMessage ?? error.error.message
      });
      return { status: 200, body: { error: error.error } };
    }
  }
  function createOwner(body) {
    const id = body.user_id == null ? nextOwnerId++ : positiveInt(body.user_id, "user_id");
    if (owners.has(id)) throw new OwnerError(409, `Owner ${id} already exists`);
    const user = {
      id,
      firstName: String(body.first_name ?? "Owner"),
      lastName: body.last_name ?? null,
      username: body.username ?? null,
      bot: false
    };
    owners.set(id, {
      id,
      user,
      authorized: true,
      users: /* @__PURE__ */ new Map(),
      peers: /* @__PURE__ */ new Map(),
      filters: /* @__PURE__ */ new Map(),
      filterOrder: [0],
      faults: [],
      calls: [],
      nextRawId: 1e4
    });
    return { id };
  }
  function addUser(owner, body) {
    const id = body.id == null ? owner.nextRawId++ : positiveInt(body.id, "id");
    if (id === owner.id) throw new OwnerError(409, `${id} is the owner`);
    const existing = owner.users.get(id);
    const user = {
      id,
      firstName: String(body.first_name ?? existing?.firstName ?? "User"),
      lastName: body.last_name ?? existing?.lastName ?? null,
      username: body.username ?? existing?.username ?? null,
      bot: body.bot === true || existing?.bot === true
    };
    owner.users.set(id, user);
    return user;
  }
  function applyDialogState(peer, body) {
    if (body.folder !== void 0) {
      const folder = Number(body.folder);
      if (folder !== 0 && folder !== 1) {
        throw new OwnerError(400, "folder must be 0 (main) or 1 (archive)");
      }
      peer.folder = folder;
    }
    if (body.pinned !== void 0) {
      peer.pinnedAt = body.pinned === true ? ++pinSequence : null;
    }
    if (body.muted !== void 0)
      peer.muteUntil = body.muted === true ? MUTE_FOREVER : 0;
    if (body.mute_until !== void 0)
      peer.muteUntil = whole(body.mute_until, "mute_until");
    if (body.unread_count !== void 0) {
      peer.unreadCount = whole(body.unread_count, "unread_count");
    }
  }
  function addDialog(owner, body) {
    const kind = String(body.kind ?? "");
    if (!KINDS.has(kind)) {
      throw new OwnerError(400, `kind must be one of ${[...KINDS].join(", ")}`);
    }
    const rawId = body.id == null ? owner.nextRawId++ : positiveInt(body.id, "id");
    const id = markedId(kind, rawId);
    if (owner.peers.has(id)) {
      throw new OwnerError(409, `Owner ${owner.id} already has dialog ${id}`);
    }
    if (kind === "private" || kind === "bot") {
      addUser(owner, { ...body, id: rawId, bot: kind === "bot" });
    } else if (typeof body.title !== "string" || !body.title) {
      throw new OwnerError(400, `a ${kind} needs a title`);
    }
    const peer = {
      id,
      kind,
      rawId,
      title: body.title ?? null,
      username: kind === "private" || kind === "bot" ? null : body.username ?? null,
      participantsCount: body.participants_count == null ? null : whole(body.participants_count, "participants_count"),
      folder: 0,
      pinnedAt: null,
      muteUntil: 0,
      unreadCount: 0,
      createdDate: body.date == null ? Math.floor(Date.now() / 1e3) : whole(body.date, "date"),
      messages: /* @__PURE__ */ new Map()
    };
    applyDialogState(peer, body);
    owner.peers.set(id, peer);
    return { id };
  }
  function addMessages(owner, peer, list) {
    if (!Array.isArray(list) || list.length === 0) {
      throw new OwnerError(400, "messages must be a non-empty array");
    }
    const added = [];
    for (const item of list) {
      const id = positiveInt(item.id, "message id");
      if (peer.messages.has(id)) {
        throw new OwnerError(
          409,
          `Dialog ${peer.id} already has message ${id}`
        );
      }
      const fromId = item.from_id == null ? null : Number(item.from_id);
      if (fromId != null && fromId !== owner.id && !owner.users.has(fromId)) {
        throw new OwnerError(
          400,
          `from_id ${fromId} is not a user of owner ${owner.id}`
        );
      }
      const replyTo = item.reply_to == null ? null : Number(item.reply_to);
      if (replyTo != null && !peer.messages.has(replyTo) && !list.some((other) => Number(other.id) === replyTo)) {
        throw new OwnerError(
          400,
          `reply_to ${replyTo} is not a message in dialog ${peer.id}`
        );
      }
      if (item.action != null && typeof item.action?.className !== "string") {
        throw new OwnerError(
          400,
          "action needs a className, such as MessageActionChatAddUser"
        );
      }
      if (item.media != null && !["photo", "document"].includes(item.media?.type)) {
        throw new OwnerError(400, 'media.type must be "photo" or "document"');
      }
      peer.messages.set(id, {
        id,
        date: whole(item.date, "date"),
        fromId,
        out: item.out === true || fromId != null && fromId === owner.id,
        text: item.action ? null : String(item.text ?? ""),
        action: item.action ?? null,
        replyTo,
        media: item.media ?? null,
        editDate: item.edit_date == null ? null : whole(item.edit_date, "edit_date"),
        deleted: false
      });
      added.push(id);
    }
    return { ids: added };
  }
  function setFilter(owner, body) {
    const id = whole(body.id, "filter id", { min: 2 });
    const existing = owner.filters.get(id);
    const peersOf = (key) => {
      const ids = body[key] ?? existing?.[camel(key)] ?? [];
      if (!Array.isArray(ids))
        throw new OwnerError(400, `${key} must be an array of dialog ids`);
      return ids.map((peerId) => requirePeer(owner, peerId).id);
    };
    const title = body.title ?? existing?.title;
    if (typeof title !== "string" || !title.trim()) {
      throw new OwnerError(400, "a filter needs a title");
    }
    const filter = {
      id,
      title,
      emoticon: body.emoticon ?? existing?.emoticon ?? null,
      color: body.color ?? existing?.color ?? null,
      pinnedPeers: peersOf("pinned_peers"),
      includePeers: peersOf("include_peers"),
      excludePeers: peersOf("exclude_peers")
    };
    for (const flag of FILTER_FLAGS) {
      const key = snake(flag);
      filter[flag] = body[key] !== void 0 ? body[key] === true : existing?.[flag] === true;
    }
    owner.filters.set(id, filter);
    if (!owner.filterOrder.includes(id)) owner.filterOrder.push(id);
    return filterView(owner, filter);
  }
  function summary(owner) {
    return {
      id: owner.id,
      authorized: owner.authorized,
      dialogs: [...owner.peers.values()].map((peer) => ({
        id: peer.id,
        kind: peer.kind,
        folder: peer.folder,
        pinned: peer.pinnedAt != null,
        mute_until: peer.muteUntil,
        unread_count: peer.unreadCount,
        messages: liveMessages(peer).length
      })),
      filter_order: [...owner.filterOrder]
    };
  }
  function control(method, parts, body) {
    const [ownerId, section, itemId, sub, subId] = parts;
    if (!ownerId) {
      if (method === "POST") return createOwner(body);
      if (method === "DELETE") {
        owners.clear();
        return { ok: true };
      }
      if (method === "GET") return [...owners.keys()].map((id) => ({ id }));
    }
    const owner = requireOwner(ownerId);
    if (!section) {
      if (method === "GET") return summary(owner);
      if (method === "DELETE") {
        owners.delete(owner.id);
        return { ok: true };
      }
      if (method === "POST") {
        if (body.authorized !== void 0)
          owner.authorized = body.authorized === true;
        return summary(owner);
      }
    }
    if (section === "users" && method === "POST" && !itemId) {
      return { id: addUser(owner, body).id };
    }
    if (section === "dialogs" && method === "POST" && !itemId) {
      return addDialog(owner, body);
    }
    if (section === "dialogs" && itemId) {
      const peer = requirePeer(owner, itemId);
      if (!sub && method === "POST") {
        applyDialogState(peer, body);
        return summary(owner).dialogs.find((dialog) => dialog.id === peer.id);
      }
      if (sub === "messages" && !subId && method === "POST") {
        return addMessages(owner, peer, body.messages);
      }
      if (sub === "messages" && subId) {
        const message = peer.messages.get(Number(subId));
        if (!message || message.deleted) {
          throw new OwnerError(
            404,
            `Dialog ${peer.id} has no message ${subId}`
          );
        }
        if (method === "DELETE") {
          message.deleted = true;
          return { ok: true };
        }
        if (method === "POST") {
          if (message.action)
            throw new OwnerError(400, "a service message cannot be edited");
          if (typeof body.text !== "string")
            throw new OwnerError(400, "an edit needs text");
          message.text = body.text;
          message.editDate = body.edit_date == null ? Math.floor(Date.now() / 1e3) : whole(body.edit_date, "edit_date");
          return messageView(owner, peer, message);
        }
      }
    }
    if (section === "filters") {
      if (method === "POST" && itemId === "order") {
        const ids = (body.ids ?? []).map(Number);
        const current = [...owner.filterOrder].sort((a, b) => a - b);
        if (JSON.stringify([...ids].sort((a, b) => a - b)) !== JSON.stringify(current)) {
          throw new OwnerError(
            400,
            `ids must list every filter once, with 0 for the default: ${owner.filterOrder.join(", ")}`
          );
        }
        owner.filterOrder = ids;
        return { order: ids };
      }
      if (method === "POST" && !itemId) return setFilter(owner, body);
      if (method === "DELETE" && itemId) {
        const id = Number(itemId);
        if (!owner.filters.delete(id))
          throw new OwnerError(404, `No filter ${itemId}`);
        owner.filterOrder = owner.filterOrder.filter((each) => each !== id);
        return { ok: true };
      }
    }
    if (section === "faults") {
      if (method === "DELETE") {
        owner.faults = [];
        return { ok: true };
      }
      if (method === "POST") {
        if (!Object.hasOwn(REQUESTS, body.method)) {
          throw new OwnerError(
            400,
            `method must be one of ${Object.keys(REQUESTS).join(", ")}`
          );
        }
        if (body.preset != null && !PRESETS.has(body.preset)) {
          throw new OwnerError(
            400,
            `preset must be one of ${[...PRESETS].join(", ")}`
          );
        }
        const delayMs = body.delay_ms == null ? 0 : whole(body.delay_ms, "delay_ms");
        if (delayMs > MAX_DELAY_MS) {
          throw new OwnerError(400, `delay_ms must be at most ${MAX_DELAY_MS}`);
        }
        if (body.preset == null && body.error_message == null && delayMs === 0) {
          throw new OwnerError(
            400,
            "a fault needs a preset, an error_message or a delay_ms"
          );
        }
        const fault = {
          method: body.method,
          peerId: body.peer_id == null ? null : Number(body.peer_id),
          remaining: body.times == null ? 1 : positiveInt(body.times, "times"),
          delayMs,
          preset: body.preset ?? null,
          seconds: body.seconds == null ? null : positiveInt(body.seconds, "seconds"),
          errorMessage: body.error_message ?? null,
          code: body.code == null ? null : Number(body.code)
        };
        owner.faults.push(fault);
        return { faults: owner.faults.length };
      }
    }
    if (section === "calls" && method === "GET") return owner.calls;
    log(`unknown owner control ${method} /${parts.join("/")}`);
    throw new OwnerError(
      404,
      `Unknown owner control ${method} /owners/${parts.join("/")}`
    );
  }
  return { rpc, control };
}
function snake(name) {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
function camel(name) {
  return name.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
}

// ../../node_modules/.pnpm/telegram-bot-test-server@https+++codeload.github.com+caffeinum+telegram-bot-test-server_e02bc4cb38ae96e5217d7463d9f50e79/node_modules/telegram-bot-test-server/src/formatting.js
var FormattingError = class extends Error {
};
var utf8Length = (text) => Buffer.byteLength(text, "utf8");
function fail(reason) {
  throw new FormattingError(`Bad Request: can't parse entities: ${reason}`);
}
function sortEntities(entities) {
  return entities.filter((entity) => entity.length > 0).sort(
    (left, right) => left.offset - right.offset || right.length - left.length
  );
}
function linkEntity(url, offset, length) {
  const mention = /^tg:\/\/user\?id=(\d+)$/.exec(url);
  if (mention) {
    return {
      type: "text_mention",
      offset,
      length,
      user: { id: Number(mention[1]) }
    };
  }
  return { type: "text_link", offset, length, url };
}
var HTML_ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"' };
var HTML_TAGS = {
  b: "bold",
  strong: "bold",
  i: "italic",
  em: "italic",
  u: "underline",
  ins: "underline",
  s: "strikethrough",
  strike: "strikethrough",
  del: "strikethrough",
  "tg-spoiler": "spoiler",
  code: "code",
  pre: "pre",
  a: "text_link",
  blockquote: "blockquote",
  "tg-emoji": "custom_emoji",
  span: "spoiler"
};
function decodeHtml(raw) {
  return raw.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name) => {
    if (name[0] === "#") {
      const code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 1114111 ? String.fromCodePoint(code) : match;
    }
    return HTML_ENTITIES[name.toLowerCase()] ?? match;
  });
}
function parseAttributes(source, offset) {
  const attributes = {};
  const pattern = /\s*([a-z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/giy;
  let index = 0;
  while (index < source.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(source);
    if (!match || match[0].length === 0) {
      if (/^\s*$/.test(source.slice(index))) break;
      fail(
        `Expected equal sign in declaration of an attribute of the tag at byte offset ${offset}`
      );
    }
    attributes[match[1].toLowerCase()] = decodeHtml(
      match[2] ?? match[3] ?? match[4] ?? ""
    );
    index = pattern.lastIndex;
  }
  return attributes;
}
function parseHtml(input) {
  let text = "";
  const entities = [];
  const stack = [];
  let index = 0;
  while (index < input.length) {
    const char = input[index];
    if (char === "&") {
      const match = /^&(#x[0-9a-f]+|#\d+|[a-z]+);/i.exec(input.slice(index));
      if (match) {
        text += decodeHtml(match[0]);
        index += match[0].length;
        continue;
      }
      text += char;
      index++;
      continue;
    }
    if (char !== "<") {
      text += char;
      index++;
      continue;
    }
    const byteOffset = utf8Length(input.slice(0, index));
    const end = input.indexOf(">", index);
    if (end < 0) fail(`Unclosed start tag at byte offset ${byteOffset}`);
    const tag = input.slice(index + 1, end);
    index = end + 1;
    if (tag.startsWith("/")) {
      const name2 = tag.slice(1).trim().toLowerCase();
      const open = stack.pop();
      if (!open) fail(`Unexpected end tag at byte offset ${byteOffset}`);
      if (open.name !== name2) {
        fail(
          `Unmatched end tag at byte offset ${byteOffset}, expected "</${open.name}>", found "</${name2}>"`
        );
      }
      const length = text.length - open.offset;
      if (open.entity)
        entities.push({ ...open.entity, offset: open.offset, length });
      continue;
    }
    const nameMatch = /^([a-z][a-z0-9-]*)/i.exec(tag);
    const name = nameMatch?.[1].toLowerCase();
    if (!name || !(name in HTML_TAGS)) {
      fail(
        `Unsupported start tag "${name ?? tag}" at byte offset ${byteOffset}`
      );
    }
    const attributes = parseAttributes(tag.slice(name.length), byteOffset);
    let entity = { type: HTML_TAGS[name] };
    if (name === "a") {
      if (!attributes.href) entity = null;
      else entity = linkEntity(attributes.href, 0, 0);
    } else if (name === "span") {
      if (attributes.class !== "tg-spoiler")
        fail(
          `Tag "span" must have class "tg-spoiler" at byte offset ${byteOffset}`
        );
    } else if (name === "tg-emoji") {
      if (!attributes["emoji-id"])
        fail(
          `Custom emoji entity must contain a tg://emoji URL at byte offset ${byteOffset}`
        );
      entity = {
        type: "custom_emoji",
        custom_emoji_id: attributes["emoji-id"]
      };
    } else if (name === "blockquote" && "expandable" in attributes) {
      entity = { type: "expandable_blockquote" };
    } else if (name === "code") {
      const pre = stack.at(-1);
      const language = /^language-(.+)$/.exec(attributes.class ?? "")?.[1];
      if (pre?.name === "pre" && pre.offset === text.length) {
        if (language) pre.entity.language = language;
        entity = null;
      }
    }
    stack.push({ name, offset: text.length, entity });
  }
  if (stack.length > 0)
    fail(
      `Can't find end tag corresponding to start tag "${stack.at(-1).name}"`
    );
  return { text, entities: sortEntities(entities) };
}
var V2_RESERVED = new Set("_*[]()~`>#+-=|{}.!".split(""));
var V2_ENTITY_NAMES = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  spoiler: "Spoiler"
};
function parseMarkdownV2(input) {
  let text = "";
  const entities = [];
  const open = [];
  let quote = null;
  let index = 0;
  const byteOffset = (at) => utf8Length(input.slice(0, at));
  const atLineStart = (at) => at === 0 || input[at - 1] === "\n";
  const toggle = (type, width, at) => {
    const top = open.findLastIndex((entry) => entry.type === type);
    if (top >= 0) {
      const [entry] = open.splice(top, 1);
      entities.push({
        type,
        offset: entry.offset,
        length: text.length - entry.offset
      });
    } else {
      open.push({ type, offset: text.length, at });
    }
    return at + width;
  };
  const closeQuote = () => {
    if (!quote) return;
    let length = text.length - quote.offset;
    if (text.endsWith("\n")) length--;
    entities.push({ type: quote.type, offset: quote.offset, length });
    quote = null;
  };
  while (index < input.length) {
    const char = input[index];
    if (atLineStart(index)) {
      if (input.startsWith("**>", index)) {
        closeQuote();
        quote = { type: "expandable_blockquote", offset: text.length };
        index += 3;
        continue;
      }
      if (char === ">") {
        if (!quote) quote = { type: "blockquote", offset: text.length };
        index++;
        continue;
      }
      if (quote && quote.type === "blockquote") closeQuote();
    }
    if (char === "\\") {
      const next = input[index + 1];
      if (next === void 0)
        fail(
          `Character '\\' is reserved and must be escaped with the preceding '\\'`
        );
      text += next;
      index += 2;
      continue;
    }
    if (char === "\n" && quote?.type === "expandable_blockquote" && input[index + 1] !== ">") {
      text += char;
      index++;
      closeQuote();
      continue;
    }
    if (input.startsWith("```", index)) {
      const close = findUnescaped(input, "```", index + 3);
      if (close < 0)
        fail(
          `Can't find end of Pre entity at byte offset ${byteOffset(index)}`
        );
      let body = input.slice(index + 3, close);
      let language;
      const newline = body.indexOf("\n");
      if (newline >= 0 && /^[^\s`]+$/.test(body.slice(0, newline))) {
        language = body.slice(0, newline);
        body = body.slice(newline + 1);
      }
      const offset = text.length;
      text += unescapeCode(body);
      entities.push({
        type: "pre",
        offset,
        length: text.length - offset,
        ...language ? { language } : {}
      });
      index = close + 3;
      continue;
    }
    if (char === "`") {
      const close = findUnescaped(input, "`", index + 1);
      if (close < 0)
        fail(
          `Can't find end of Code entity at byte offset ${byteOffset(index)}`
        );
      const offset = text.length;
      text += unescapeCode(input.slice(index + 1, close));
      entities.push({ type: "code", offset, length: text.length - offset });
      index = close + 1;
      continue;
    }
    if (input.startsWith("||", index)) {
      if (quote?.type === "expandable_blockquote" && (input[index + 2] === "\n" || index + 2 === input.length)) {
        index += 2;
        closeQuote();
        continue;
      }
      index = toggle("spoiler", 2, index);
      continue;
    }
    if (input.startsWith("__", index)) {
      index = toggle("underline", 2, index);
      continue;
    }
    if (char === "_") {
      index = toggle("italic", 1, index);
      continue;
    }
    if (char === "*") {
      index = toggle("bold", 1, index);
      continue;
    }
    if (char === "~") {
      index = toggle("strikethrough", 1, index);
      continue;
    }
    if (char === "[" || char === "!" && input[index + 1] === "[") {
      const emoji = char === "!";
      open.push({
        type: emoji ? "custom_emoji_link" : "link",
        offset: text.length,
        at: index
      });
      index += emoji ? 2 : 1;
      continue;
    }
    if (char === "]") {
      const top = open.findLastIndex(
        (entry2) => entry2.type === "link" || entry2.type === "custom_emoji_link"
      );
      if (top < 0 || input[index + 1] !== "(") {
        fail(
          `Character ']' is reserved and must be escaped with the preceding '\\'`
        );
      }
      const [entry] = open.splice(top, 1);
      let close = index + 2;
      let url = "";
      while (close < input.length && input[close] !== ")") {
        if (input[close] === "\\" && close + 1 < input.length) close++;
        url += input[close];
        close++;
      }
      if (close >= input.length)
        fail(`Can't find end of a URL at byte offset ${byteOffset(index + 2)}`);
      const length = text.length - entry.offset;
      if (entry.type === "custom_emoji_link") {
        const id = /^tg:\/\/emoji\?id=(\d+)$/.exec(url)?.[1];
        if (!id) fail(`Custom emoji entity must contain a tg://emoji URL`);
        entities.push({
          type: "custom_emoji",
          offset: entry.offset,
          length,
          custom_emoji_id: id
        });
      } else {
        entities.push(linkEntity(url, entry.offset, length));
      }
      index = close + 1;
      continue;
    }
    if (V2_RESERVED.has(char)) {
      fail(
        `Character '${char}' is reserved and must be escaped with the preceding '\\'`
      );
    }
    text += char;
    index++;
  }
  closeQuote();
  const unclosed = open[0];
  if (unclosed) {
    const name = V2_ENTITY_NAMES[unclosed.type];
    if (name)
      fail(
        `Can't find end of ${name} entity at byte offset ${byteOffset(unclosed.at)}`
      );
    fail(`Can't find end of a URL at byte offset ${byteOffset(unclosed.at)}`);
  }
  return { text, entities: sortEntities(entities) };
}
function findUnescaped(input, token, from) {
  for (let index = from; index < input.length; index++) {
    if (input[index] === "\\") {
      index++;
      continue;
    }
    if (input.startsWith(token, index)) return index;
  }
  return -1;
}
function unescapeCode(body) {
  return body.replace(/\\([\\`])/g, "$1");
}
function parseMarkdown(input) {
  let text = "";
  const entities = [];
  let index = 0;
  const byteOffset = (at) => utf8Length(input.slice(0, at));
  while (index < input.length) {
    const char = input[index];
    if (char === "\\" && "_*`[".includes(input[index + 1] ?? "")) {
      text += input[index + 1];
      index += 2;
      continue;
    }
    if (input.startsWith("```", index)) {
      const close = input.indexOf("```", index + 3);
      if (close < 0)
        fail(
          `Can't find end of the entity starting at byte offset ${byteOffset(index)}`
        );
      let body = input.slice(index + 3, close);
      let language;
      const newline = body.indexOf("\n");
      if (newline >= 0 && /^[^\s`]+$/.test(body.slice(0, newline))) {
        language = body.slice(0, newline);
        body = body.slice(newline + 1);
      }
      entities.push({
        type: "pre",
        offset: text.length,
        length: body.length,
        ...language ? { language } : {}
      });
      text += body;
      index = close + 3;
      continue;
    }
    const simple = { "*": "bold", _: "italic", "`": "code" }[char];
    if (simple) {
      const close = input.indexOf(char, index + 1);
      if (close < 0)
        fail(
          `Can't find end of the entity starting at byte offset ${byteOffset(index)}`
        );
      const body = input.slice(index + 1, close);
      entities.push({ type: simple, offset: text.length, length: body.length });
      text += body;
      index = close + 1;
      continue;
    }
    if (char === "[") {
      const match = /^\[([^\]]*)\]\(([^)]*)\)/.exec(input.slice(index));
      if (!match)
        fail(
          `Can't find end of the entity starting at byte offset ${byteOffset(index)}`
        );
      entities.push(linkEntity(match[2], text.length, match[1].length));
      text += match[1];
      index += match[0].length;
      continue;
    }
    text += char;
    index++;
  }
  return { text, entities: sortEntities(entities) };
}
function formatText(text, { parseMode, entities, detect }) {
  let parsed;
  if (Array.isArray(entities)) {
    parsed = {
      text,
      entities: sortEntities(entities.map((entity) => ({ ...entity })))
    };
  } else {
    const mode = typeof parseMode === "string" ? parseMode.toLowerCase() : "";
    if (mode === "html") parsed = parseHtml(text);
    else if (mode === "markdownv2") parsed = parseMarkdownV2(text);
    else if (mode === "markdown") parsed = parseMarkdown(text);
    else if (!mode) parsed = { text, entities: [] };
    else
      throw new FormattingError(
        `Bad Request: unsupported parse_mode "${parseMode}"`
      );
  }
  const overlaps = (candidate) => parsed.entities.some(
    (entity) => candidate.offset < entity.offset + entity.length && entity.offset < candidate.offset + candidate.length
  );
  const detected = detect(parsed.text).filter((entity) => !overlaps(entity));
  return {
    text: parsed.text,
    entities: sortEntities([...parsed.entities, ...detected])
  };
}

// ../../node_modules/.pnpm/telegram-bot-test-server@https+++codeload.github.com+caffeinum+telegram-bot-test-server_e02bc4cb38ae96e5217d7463d9f50e79/node_modules/telegram-bot-test-server/src/index.js
import http from "http";
import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
  timingSafeEqual
} from "crypto";

// ../../node_modules/.pnpm/telegram-bot-test-server@https+++codeload.github.com+caffeinum+telegram-bot-test-server_e02bc4cb38ae96e5217d7463d9f50e79/node_modules/telegram-bot-test-server/src/owner-client.js
var ownerApi = Object.freeze({
  messages: Object.freeze({
    GetDialogFilters: class GetDialogFilters {
      constructor(args = {}) {
        Object.assign(this, args);
        this.className = "messages.GetDialogFilters";
      }
    }
  })
});

// ../../node_modules/.pnpm/telegram-bot-test-server@https+++codeload.github.com+caffeinum+telegram-bot-test-server_e02bc4cb38ae96e5217d7463d9f50e79/node_modules/telegram-bot-test-server/src/index.js
var PERMISSION_KEYS = Object.freeze([
  "can_send_messages",
  "can_send_audios",
  "can_send_documents",
  "can_send_photos",
  "can_send_videos",
  "can_send_video_notes",
  "can_send_voice_notes",
  "can_send_polls",
  "can_send_other_messages",
  "can_add_web_page_previews",
  "can_react_to_messages",
  "can_change_info",
  "can_invite_users",
  "can_pin_messages",
  "can_manage_topics",
  "can_edit_tag"
]);
var MEDIA_PERMISSIONS = Object.freeze([
  "can_send_messages",
  "can_send_audios",
  "can_send_documents",
  "can_send_photos",
  "can_send_videos",
  "can_send_video_notes",
  "can_send_voice_notes"
]);
var ALL_PERMISSIONS = Object.freeze(
  Object.fromEntries(PERMISSION_KEYS.map((key) => [key, true]))
);
var NO_GIFTS = Object.freeze({
  unlimited_gifts: false,
  limited_gifts: false,
  unique_gifts: false,
  premium_subscription: false,
  gifts_from_channels: false
});
function normalizePermissions(input = {}, independent = false) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TelegramError(
      400,
      "Bad Request: can't parse permissions JSON object"
    );
  }
  const given = (key) => input[key] === true || input[key] === "true";
  const result = Object.fromEntries(
    PERMISSION_KEYS.map((key) => [key, given(key)])
  );
  if (!(independent === true || independent === "true")) {
    if (result.can_send_other_messages || result.can_add_web_page_previews) {
      for (const key of MEDIA_PERMISSIONS) result[key] = true;
    }
    if (result.can_send_polls) result.can_send_messages = true;
  }
  if (!("can_react_to_messages" in input)) {
    result.can_react_to_messages = result.can_send_messages;
  }
  if (!("can_edit_tag" in input)) result.can_edit_tag = result.can_pin_messages;
  return result;
}
var WEBHOOK_TIMEOUT_MS = 1e4;
var OBJECT_PARAMS = /* @__PURE__ */ new Set([
  "allowed_updates",
  "permissions",
  "reply_markup",
  "message_ids",
  "link_preview_options",
  "reply_parameters",
  "commands",
  "media",
  "scope",
  "ephemeral_message_parameters",
  "options",
  "entities",
  "caption_entities",
  "reaction"
]);
var ADMIN_RIGHTS = Object.freeze([
  "is_anonymous",
  "can_manage_chat",
  "can_delete_messages",
  "can_manage_video_chats",
  "can_restrict_members",
  "can_promote_members",
  "can_change_info",
  "can_invite_users",
  "can_post_stories",
  "can_edit_stories",
  "can_delete_stories",
  "can_post_messages",
  "can_edit_messages",
  "can_pin_messages",
  "can_manage_topics"
]);
var CHAT_ACTIONS = /* @__PURE__ */ new Set([
  "typing",
  "upload_photo",
  "record_video",
  "upload_video",
  "record_voice",
  "upload_voice",
  "upload_document",
  "choose_sticker",
  "find_location",
  "record_video_note",
  "upload_video_note"
]);
var DICE = Object.freeze({
  "\u{1F3B2}": 6,
  "\u{1F3AF}": 6,
  "\u{1F3B3}": 6,
  "\u{1F3C0}": 5,
  "\u26BD": 5,
  "\u{1F3B0}": 64
});
var MEMBER_MEDIA = Object.freeze({
  video: { permission: "can_send_videos", ext: "mp4", caption: true },
  animation: {
    permission: "can_send_other_messages",
    ext: "mp4",
    caption: true
  },
  sticker: { permission: "can_send_other_messages", ext: "webp" },
  voice: { permission: "can_send_voice_notes", ext: "ogg", caption: true },
  audio: { permission: "can_send_audios", ext: "mp3", caption: true },
  video_note: { permission: "can_send_video_notes", ext: "mp4" },
  document: { permission: "can_send_documents", ext: "bin", caption: true }
});
var MEDIA_KINDS = Object.freeze(["photo", "video", "animation", "document"]);
var TelegramError = class extends Error {
  constructor(code, description, parameters = null) {
    super(description);
    this.code = code;
    this.parameters = parameters;
  }
};
function numberParam(value, fallback) {
  const number = Number(value);
  return value != null && value !== "" && Number.isFinite(number) ? number : fallback;
}
function now() {
  return Math.floor(Date.now() / 1e3);
}
function fileUniqueId() {
  return `AgAD${randomBytes(6).toString("base64url")}`;
}
function userObject(user) {
  return {
    id: user.id,
    is_bot: user.is_bot === true,
    first_name: user.first_name,
    ...user.last_name ? { last_name: user.last_name } : {},
    ...user.username ? { username: user.username } : {},
    ...user.language_code ? { language_code: user.language_code } : {},
    ...user.is_premium === true ? { is_premium: true } : {}
  };
}
function messageEntities(text) {
  const entities = [];
  const add = (type, offset, length) => entities.push({ type, offset, length });
  const overlaps = (offset, length) => entities.some(
    (entity) => offset < entity.offset + entity.length && entity.offset < offset + length
  );
  for (const match of text.matchAll(
    /(?<![\w@])\/[A-Za-z0-9_]+(?:@[A-Za-z0-9_]+)?/g
  )) {
    if (match.index === 0) add("bot_command", match.index, match[0].length);
  }
  for (const match of text.matchAll(
    /(?<![\w.+-])[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/g
  )) {
    add("email", match.index, match[0].length);
  }
  for (const match of text.matchAll(
    /(?<![\w@/])@[A-Za-z][A-Za-z0-9_]{3,31}\b/g
  )) {
    if (!overlaps(match.index, match[0].length)) {
      add("mention", match.index, match[0].length);
    }
  }
  for (const match of text.matchAll(
    /\b(?:https?:\/\/[^\s]+|(?:t\.me|telegram\.me)\/[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi
  )) {
    const url = match[0].replace(/[.,!?;:)\]}'"]+$/, "");
    if (url && !overlaps(match.index, url.length)) {
      add("url", match.index, url.length);
    }
  }
  return entities.sort((left, right) => left.offset - right.offset);
}
function coerceParams(entries) {
  const params = {};
  for (const [key, value] of entries) {
    if (typeof value === "string" && OBJECT_PARAMS.has(key)) {
      try {
        params[key] = JSON.parse(value);
        continue;
      } catch {
      }
    }
    params[key] = value;
  }
  return params;
}
function parseJsonObject(body) {
  let value;
  try {
    value = JSON.parse(body.toString("utf8"));
  } catch {
    throw new TelegramError(400, "Bad Request: request body is not valid JSON");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TelegramError(
      400,
      "Bad Request: request body must be a JSON object"
    );
  }
  return value;
}
async function readRequestParams(request, body) {
  const url = new URL(request.url, "http://localhost");
  const params = coerceParams(url.searchParams.entries());
  if (!body.length) return params;
  const type = String(request.headers["content-type"] ?? "");
  if (type.includes("application/json")) {
    return { ...params, ...parseJsonObject(body) };
  }
  if (!type.includes("multipart/form-data") && !type.includes("application/x-www-form-urlencoded")) {
    throw new TelegramError(
      400,
      "Bad Request: send parameters as a query string, JSON, or form data"
    );
  }
  let form;
  try {
    form = await new Request("http://localhost/", {
      method: "POST",
      headers: { "content-type": type },
      body
    }).formData();
  } catch {
    throw new TelegramError(
      400,
      "Bad Request: request body is not valid form data"
    );
  }
  const entries = [];
  for (const [key, value] of form.entries()) {
    entries.push([
      key,
      typeof value === "string" ? value : await uploadedFile(value)
    ]);
  }
  return { ...params, ...coerceParams(entries) };
}
async function uploadedFile(file) {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.name) bytes.fileName = file.name;
  const type = file.type.split(";")[0].trim().toLowerCase();
  if (type && type !== "application/octet-stream") bytes.mimeType = type;
  return bytes;
}
var MIME_TYPES = {
  txt: "text/plain",
  csv: "text/csv",
  html: "text/html",
  md: "text/markdown",
  json: "application/json",
  pdf: "application/pdf",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  mp4: "video/mp4"
};
function guessMimeType(fileName) {
  const extension = /\.([a-z0-9]+)$/i.exec(fileName ?? "")?.[1]?.toLowerCase();
  return extension ? MIME_TYPES[extension] : void 0;
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}
function postedMessageBody(message) {
  return typeof message === "string" ? { text: message } : {
    ...message.text !== void 0 ? { text: message.text } : {},
    ...message.photo ? {
      photo_base64: Buffer.from(message.photo).toString("base64")
    } : {},
    ...message.media ? {
      media: {
        type: message.media.type,
        base64: Buffer.from(message.media.bytes ?? []).toString(
          "base64"
        ),
        ...message.media.fileName ? { file_name: message.media.fileName } : {},
        ...message.media.mimeType ? { mime_type: message.media.mimeType } : {}
      }
    } : {},
    ...message.forwardFrom ? {
      forward_from: {
        ...message.forwardFrom.userId != null ? { user_id: message.forwardFrom.userId } : {},
        ...message.forwardFrom.chatId != null ? { chat_id: message.forwardFrom.chatId } : {},
        ...message.forwardFrom.messageId != null ? { message_id: message.forwardFrom.messageId } : {},
        ...message.forwardFrom.senderName ? { sender_name: message.forwardFrom.senderName } : {}
      }
    } : {},
    ...message.caption ? { caption: message.caption } : {},
    ...message.replyTo != null ? { reply_to: message.replyTo } : {},
    ...message.threadId != null ? { message_thread_id: message.threadId } : {}
  };
}
async function startTestServer({
  port = 0,
  host = "127.0.0.1",
  botToken,
  botUsername = "fake_test_bot",
  botName = "Fake Test Bot",
  supportsJoinRequestQueries = false,
  chats: chatConfigs = [],
  publicChats = [],
  unimplemented: unimplementedMode = "error",
  loginClientSecret,
  log = () => {
  }
}) {
  if (unimplementedMode !== "error" && unimplementedMode !== "ok") {
    throw new TypeError('unimplemented must be "error" or "ok"');
  }
  const users = /* @__PURE__ */ new Map();
  const bots = /* @__PURE__ */ new Map();
  function addBot({
    token,
    username,
    firstName,
    joinRequestQueries = false,
    loginClientSecret: secret
  }) {
    const id = Number(String(token).split(":")[0]);
    if (!Number.isSafeInteger(id) || !String(token).includes(":")) {
      throw new TypeError(
        "Fake Telegram needs a bot token of the form <id>:<secret>"
      );
    }
    if (bots.has(token)) return bots.get(token);
    if (users.has(id)) throw new TypeError(`User ${id} already exists`);
    const record = {
      id,
      is_bot: true,
      first_name: firstName ?? username,
      username,
      photos: [],
      token,
      // The update types the bot subscribed to, set by setWebhook or getUpdates.
      webhook: null,
      subscription: null,
      // Updates waiting for getUpdates while no webhook is set, as on Telegram.
      queue: [],
      pollWaiters: /* @__PURE__ */ new Set(),
      delivery: Promise.resolve(),
      commands: [],
      // A guard bot that gets join request queries (Bot API 10.x).
      joinRequestQueries: joinRequestQueries === true,
      // The Telegram Login client secret BotFather shows for the bot.
      loginClientSecret: typeof secret === "string" && secret !== "" ? secret : randomBytes(24).toString("base64url")
    };
    bots.set(token, record);
    users.set(id, record);
    return record;
  }
  const bot = addBot({
    token: botToken,
    username: botUsername,
    firstName: botName,
    joinRequestQueries: supportsJoinRequestQueries,
    loginClientSecret
  });
  const joinQueries = /* @__PURE__ */ new Map();
  const files = /* @__PURE__ */ new Map();
  const ownerModel = createOwnerModel({ log });
  const chats = /* @__PURE__ */ new Map();
  const publicByUsername = /* @__PURE__ */ new Map();
  let nextPublicId = 1e6;
  for (const entry of publicChats) {
    const username = String(entry.username).replace(/^@/, "");
    nextPublicId += 1;
    publicByUsername.set(username.toLowerCase(), {
      id: entry.type === "bot" ? 6e9 + nextPublicId : -1002e9 - nextPublicId,
      type: entry.type,
      username,
      title: entry.title ?? username
    });
  }
  const privateChats = /* @__PURE__ */ new Map();
  const businessConnections = /* @__PURE__ */ new Map();
  const sentUpdates = /* @__PURE__ */ new Map();
  const callbackAnswers = /* @__PURE__ */ new Map();
  const openQueries = /* @__PURE__ */ new Set();
  const calls = [];
  const unimplemented = /* @__PURE__ */ new Set();
  const failures = [];
  const inFlight = /* @__PURE__ */ new Set();
  const startSeconds = Math.floor(Date.now() / 1e3);
  let updateId = startSeconds;
  let nextUserId = 7e9 + startSeconds;
  let nextChatId = startSeconds;
  let nextBasicGroupId = 4e9 + startSeconds % 1e8;
  let nextMediaGroupId = BigInt(startSeconds) * 1000000n;
  let nextPollId = BigInt(startSeconds) * 1000000n;
  for (const config of chatConfigs) {
    const owner = {
      id: config.ownerId,
      is_bot: false,
      first_name: config.ownerName ?? "Group Owner",
      bio: "",
      photos: []
    };
    users.set(owner.id, owner);
    chats.set(config.id, {
      id: config.id,
      title: config.title,
      type: "supergroup",
      members: /* @__PURE__ */ new Map([
        [owner.id, { status: "creator" }],
        [bot.id, { status: "administrator" }]
      ]),
      messages: /* @__PURE__ */ new Map(),
      nextMessageId: startSeconds - 17e8,
      inviteLinks: /* @__PURE__ */ new Map(),
      joinRequests: /* @__PURE__ */ new Map(),
      permissions: { ...ALL_PERMISSIONS }
    });
  }
  function requireChat(chatId) {
    const chat = chats.get(Number(chatId));
    if (!chat) throw new TelegramError(400, "Bad Request: chat not found");
    return chat;
  }
  function messageChat(chatId) {
    const id = Number(chatId);
    if (chats.has(id)) return chats.get(id);
    const user = users.get(id);
    if (!user || user.is_bot) {
      throw new TelegramError(400, "Bad Request: chat not found");
    }
    if (!privateChats.has(id)) {
      privateChats.set(id, {
        id,
        type: "private",
        user,
        messages: /* @__PURE__ */ new Map(),
        nextMessageId: 1
      });
    }
    return privateChats.get(id);
  }
  function botChat(chatId) {
    const id = Number(chatId);
    if (chats.has(id)) return chats.get(id);
    if (privateChats.has(id)) return privateChats.get(id);
    const user = users.get(id);
    if (user && !user.is_bot) {
      throw new TelegramError(
        403,
        "Forbidden: bot can't initiate conversation with a user"
      );
    }
    throw new TelegramError(400, "Bad Request: chat not found");
  }
  function requireUser(userId) {
    const user = users.get(Number(userId));
    if (!user) throw new TelegramError(400, "Bad Request: user not found");
    return user;
  }
  function chatObject(chat) {
    if (chat.type === "private") {
      return {
        id: chat.id,
        type: "private",
        first_name: chat.user.first_name,
        ...chat.user.last_name ? { last_name: chat.user.last_name } : {},
        ...chat.user.username ? { username: chat.user.username } : {}
      };
    }
    return {
      id: chat.id,
      title: chat.title,
      type: chat.type,
      ...chat.topics ? { is_forum: true } : {}
    };
  }
  function memberStatus(chat, userId) {
    return chat.members.get(Number(userId)) ?? { status: "left" };
  }
  function chatMemberObject(chat, userId) {
    const user = requireUser(userId);
    const member = memberStatus(chat, userId);
    const base = { user: userObject(user), status: member.status };
    if (member.status === "administrator") {
      const rights = chat.type === "channel" ? {
        can_manage_chat: true,
        can_delete_messages: true,
        can_restrict_members: true,
        can_promote_members: false,
        can_change_info: true,
        can_invite_users: true,
        can_post_messages: true,
        can_edit_messages: true,
        can_post_stories: false,
        can_edit_stories: false,
        can_delete_stories: false,
        can_manage_video_chats: false
      } : {
        can_manage_chat: true,
        can_delete_messages: true,
        can_restrict_members: true,
        can_promote_members: false,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true,
        can_post_stories: false,
        can_edit_stories: false,
        can_delete_stories: false,
        can_manage_video_chats: false,
        can_manage_topics: false,
        can_send_welcome_messages: false
      };
      return {
        ...base,
        // A bot can edit the administrators it promoted.
        can_be_edited: member.promotedBy != null,
        is_anonymous: false,
        ...rights,
        // Rights the owner granted or withheld when promoting.
        ...member.rights ?? {},
        ...member.customTitle ? { custom_title: member.customTitle } : {}
      };
    }
    if (member.status === "creator") return { ...base, is_anonymous: false };
    if (member.status === "restricted") {
      return {
        ...base,
        is_member: member.is_member !== false,
        until_date: member.until_date ?? 0,
        ...member.permissions
      };
    }
    if (member.status === "kicked") {
      return { ...base, until_date: member.until_date ?? 0 };
    }
    return base;
  }
  function isInChat(chat, userId) {
    const member = memberStatus(chat, userId);
    return ["member", "administrator", "creator"].includes(member.status) || member.status === "restricted" && member.is_member !== false;
  }
  function hasRight(chat, userId, right) {
    const member = memberStatus(chat, userId);
    if (member.status === "creator") return true;
    if (member.status !== "administrator") return false;
    return chatMemberObject(chat, userId)[right] === true;
  }
  function chatKind(chat) {
    return chat.type === "channel" || chat.type === "group" ? chat.type : "supergroup";
  }
  function requireCanSend(chat, caller) {
    if (chat.type === "private") {
      if (caller.id !== bot.id && !chat.openTo?.has(caller.id)) {
        throw new TelegramError(
          403,
          "Forbidden: bot can't initiate conversation with a user"
        );
      }
      return;
    }
    const member = memberStatus(chat, caller.id);
    if (member.status === "kicked") {
      throw new TelegramError(
        403,
        `Forbidden: bot was kicked from the ${chatKind(chat)} chat`
      );
    }
    if (!isInChat(chat, caller.id)) {
      throw new TelegramError(
        403,
        `Forbidden: bot is not a member of the ${chatKind(chat)} chat`
      );
    }
    if (chat.type === "channel" && !hasRight(chat, caller.id, "can_post_messages")) {
      throw new TelegramError(
        400,
        "Bad Request: need administrator rights in the channel chat"
      );
    }
    if (member.status === "restricted" && member.permissions?.can_send_messages !== true) {
      throw new TelegramError(
        400,
        "Bad Request: not enough rights to send text messages to the chat"
      );
    }
  }
  function requireTopic(chat, threadId) {
    if (!threadId || !chat.topics) return;
    if (!chat.topics.has(Number(threadId))) {
      throw new TelegramError(400, "Bad Request: message thread not found");
    }
  }
  function requirePinRights(chat, caller) {
    if (chat.type === "private") return;
    if (!isInChat(chat, caller.id)) {
      throw new TelegramError(
        403,
        `Forbidden: bot is not a member of the ${chatKind(chat)} chat`
      );
    }
    const right = chat.type === "channel" ? "can_edit_messages" : "can_pin_messages";
    if (!hasRight(chat, caller.id, right)) {
      throw new TelegramError(
        400,
        "Bad Request: not enough rights to manage pinned messages in the chat"
      );
    }
  }
  function canPost(chat, userId, permission = "can_send_messages") {
    const member = memberStatus(chat, userId);
    if (!isInChat(chat, userId)) return false;
    if (["creator", "administrator"].includes(member.status)) return true;
    if (member.status === "restricted" && member.permissions[permission] !== true) {
      return false;
    }
    return chat.permissions[permission] === true;
  }
  function assertCanModerate(chat, userId, { self, caller = bot } = {}) {
    if (Number(userId) === caller.id && self) {
      throw new TelegramError(400, `Bad Request: ${self}`);
    }
    const status = memberStatus(chat, userId).status;
    if (status === "creator") {
      throw new TelegramError(400, "Bad Request: can't remove chat owner");
    }
    if (status === "administrator") {
      throw new TelegramError(
        400,
        "Bad Request: user is an administrator of the chat"
      );
    }
  }
  function admit(chat, userId) {
    const current = memberStatus(chat, userId);
    chat.members.set(
      Number(userId),
      current.status === "restricted" ? { ...current, is_member: true } : { status: "member" }
    );
  }
  function memberChanged(chat, userId, before, actor, extra) {
    const after = chatMemberObject(chat, userId);
    if (JSON.stringify(before) === JSON.stringify(after))
      return Promise.resolve();
    return emitMemberChange(chat, userId, before, actor, extra);
  }
  function nextUpdateId() {
    updateId += 1;
    return updateId;
  }
  function allowed(record, type) {
    const list = record.subscription;
    if (!Array.isArray(list) || list.length === 0) {
      return ![
        "chat_member",
        "message_reaction",
        "message_reaction_count"
      ].includes(type);
    }
    return list.includes(type);
  }
  function emit(type, payload, { to = null, except = null } = {}) {
    const chatId = payload?.chat?.id ?? payload?.message?.chat?.id;
    const chat = chatId == null ? null : chats.get(Number(chatId));
    const recipients = to ?? (chat ? [...bots.values()].filter(
      (record) => record.id !== except && isInChat(chat, record.id)
    ) : [bot]);
    return Promise.all(
      recipients.map((record) => emitTo(record, type, payload))
    );
  }
  function emitTo(record, type, payload) {
    return emitOne(record, type, payload).delivered;
  }
  function emitOne(record, type, payload) {
    if (!allowed(record, type)) {
      return { updateId: null, delivered: Promise.resolve() };
    }
    const update = { update_id: nextUpdateId(), [type]: payload };
    sentUpdates.set(update.update_id, {
      record,
      body: JSON.stringify(update)
    });
    if (!record.webhook?.url) {
      record.queue.push(structuredClone(update));
      wakePollers(record);
      return { updateId: update.update_id, delivered: Promise.resolve() };
    }
    return {
      updateId: update.update_id,
      delivered: deliver(record, update)
    };
  }
  function wakePollers(record) {
    for (const waiter of record.pollWaiters) waiter.wake();
  }
  function deliver(record, update, sentBody = null) {
    const type = Object.keys(update).find((key) => key !== "update_id");
    const body = sentBody ?? JSON.stringify(update);
    record.delivery = record.delivery.then(async () => {
      const target = record.webhook;
      if (!target?.url) {
        record.queue.push(JSON.parse(body));
        wakePollers(record);
        return;
      }
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), WEBHOOK_TIMEOUT_MS);
      inFlight.add(abort);
      try {
        const response = await fetch(target.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...target.secret_token ? { "X-Telegram-Bot-Api-Secret-Token": target.secret_token } : {}
          },
          body,
          signal: abort.signal
        });
        await response.body?.cancel();
        if (!response.ok) {
          log(`webhook answered ${response.status} for ${type}`);
        }
      } catch (error) {
        log(`webhook delivery failed for ${type}: ${error.message}`);
      } finally {
        clearTimeout(timer);
        inFlight.delete(abort);
      }
    });
    return record.delivery;
  }
  function emitMemberChange(chat, userId, before, actor, extra = {}) {
    return emit(
      "chat_member",
      {
        chat: chatObject(chat),
        from: userObject(actor),
        date: now(),
        old_chat_member: before,
        new_chat_member: chatMemberObject(chat, userId),
        ...extra
      },
      // A bot hears of its own membership through my_chat_member alone.
      { except: users.get(Number(userId))?.is_bot ? Number(userId) : null }
    );
  }
  async function setBotMembership(chat, record, { status, rights, actor }) {
    const before = chatMemberObject(chat, record.id);
    const wasIn = isInChat(chat, record.id);
    const botsBefore = botsIn(chat);
    if (status === "left") chat.members.delete(record.id);
    else chat.members.set(record.id, { status, ...rights ? { rights } : {} });
    const after = chatMemberObject(chat, record.id);
    const change = {
      chat: chatObject(chat),
      from: userObject(actor),
      date: now(),
      old_chat_member: before,
      new_chat_member: after
    };
    await emitTo(record, "my_chat_member", change);
    await emit("chat_member", change, { except: record.id });
    const isIn = isInChat(chat, record.id);
    if (chat.type !== "channel" && wasIn !== isIn) {
      const service = addMessage(
        chat,
        actor,
        isIn ? { new_chat_members: [userObject(record)] } : { left_chat_member: userObject(record) }
      );
      await emit("message", service, {
        to: [.../* @__PURE__ */ new Set([...botsBefore, ...botsIn(chat)])]
      });
    }
    return after;
  }
  function canAddMembers(chat, userId) {
    const member = memberStatus(chat, userId);
    if (member.status === "creator") return true;
    if (member.status === "administrator") {
      return hasRight(chat, userId, "can_invite_users");
    }
    return canPost(chat, userId, "can_invite_users");
  }
  function canAddAdmins(chat, userId) {
    const member = memberStatus(chat, userId);
    return member.status === "creator" || member.status === "administrator" && hasRight(chat, userId, "can_promote_members");
  }
  function canChangeInfo(chat, userId) {
    const member = memberStatus(chat, userId);
    if (member.status === "creator") return true;
    if (member.status === "administrator") {
      return hasRight(chat, userId, "can_change_info");
    }
    return canPost(chat, userId, "can_change_info");
  }
  async function addBotViaLink(chat, record, { by, startParameter, rights }) {
    const actor = requireUser(by ?? creatorOf(chat));
    const asAdmin = rights != null;
    if (asAdmin ? !canAddAdmins(chat, actor.id) : !canAddMembers(chat, actor.id)) {
      throw new TelegramError(400, "CHAT_ADMIN_REQUIRED");
    }
    const current = memberStatus(chat, record.id);
    if (asAdmin) {
      const existing = current.status === "administrator" ? chatMemberObject(chat, record.id) : {};
      const combined = {};
      for (const [right, value] of Object.entries(rights)) {
        combined[right] = value === true || existing[right] === true;
      }
      for (const [right, value] of Object.entries(existing)) {
        if (right.startsWith("can_") && value === true) combined[right] = true;
      }
      await setBotMembership(chat, record, {
        status: "administrator",
        rights: combined,
        actor
      });
    } else if (!isInChat(chat, record.id)) {
      await setBotMembership(chat, record, { status: "member", actor });
    }
    const text = `/start@${record.username}` + (startParameter ? ` ${String(startParameter)}` : "");
    const message = addMessage(chat, actor, { text });
    const entities = messageEntities(text);
    if (entities.length > 0) message.entities = entities;
    await emit("message", message);
    return chatMemberObject(chat, record.id);
  }
  async function migrateToSupergroup(chat, { by }) {
    if (chat.type !== "group") {
      throw new TelegramError(400, "only a basic group can be upgraded");
    }
    if (chat.migratedTo != null) {
      throw new TelegramError(400, "the group was already upgraded");
    }
    const actor = requireUser(by ?? creatorOf(chat));
    if (!["creator", "administrator"].includes(
      memberStatus(chat, actor.id).status
    )) {
      throw new TelegramError(400, "CHAT_ADMIN_REQUIRED");
    }
    nextChatId += 1;
    const supergroup = {
      ...chat,
      id: -(1e12 + nextChatId),
      type: "supergroup",
      members: new Map(
        [...chat.members].map(([id, member]) => [id, structuredClone(member)])
      ),
      messages: /* @__PURE__ */ new Map(),
      inviteLinks: /* @__PURE__ */ new Map(),
      joinRequests: /* @__PURE__ */ new Map(),
      pinned: [],
      migratedFrom: chat.id
    };
    delete supergroup.migratedTo;
    chats.set(supergroup.id, supergroup);
    chat.migratedTo = supergroup.id;
    await emit(
      "message",
      addMessage(chat, actor, { migrate_to_chat_id: supergroup.id })
    );
    await emit(
      "message",
      addMessage(supergroup, actor, { migrate_from_chat_id: chat.id })
    );
    return chatObject(supergroup);
  }
  async function renameByPerson(chat, { by, title }) {
    const actor = requireUser(by ?? creatorOf(chat));
    if (!canChangeInfo(chat, actor.id)) {
      throw new TelegramError(400, "CHAT_ADMIN_REQUIRED");
    }
    const name = String(title ?? "").trim();
    if (!name || name.length > 128) {
      throw new TelegramError(400, "CHAT_TITLE_EMPTY");
    }
    if (name === chat.title) throw new TelegramError(400, "CHAT_NOT_MODIFIED");
    chat.title = name;
    const message = addMessage(chat, actor, { new_chat_title: name });
    await emit("message", message);
    return { message_id: message.message_id };
  }
  async function changePhotoByPerson(chat, { by, base64 }) {
    const actor = requireUser(by ?? creatorOf(chat));
    if (!canChangeInfo(chat, actor.id)) {
      throw new TelegramError(400, "CHAT_ADMIN_REQUIRED");
    }
    const bytes = Buffer.from(String(base64 ?? ""), "base64");
    if (bytes.length === 0) throw new TelegramError(400, "PHOTO_INVALID");
    chat.photo = registerPhoto(bytes);
    const message = addMessage(chat, actor, {
      new_chat_photo: photoSizes(chat.photo)
    });
    await emit("message", message);
    return { message_id: message.message_id };
  }
  function botsIn(chat) {
    return [...bots.values()].filter((record) => isInChat(chat, record.id));
  }
  function requireBot(botId) {
    const record = [...bots.values()].find(
      (entry) => entry.id === Number(botId)
    );
    if (!record) throw new TelegramError(400, "Bad Request: bot not found");
    return record;
  }
  function addMessage(chat, from, fields) {
    const message = {
      message_id: chat.nextMessageId++,
      from: userObject(from),
      chat: chatObject(chat),
      date: now(),
      ...fields
    };
    chat.messages.set(message.message_id, { message, deleted: false });
    return message;
  }
  function registerFile(bytes, folder, extension) {
    const data = bytes;
    const fileId = `AgACAgQAAx0Cfake${randomBytes(9).toString("base64url")}`;
    const uniqueId = fileUniqueId();
    const fileName = bytes.fileName;
    const mimeType = bytes.mimeType ?? (fileName ? guessMimeType(fileName) : void 0);
    files.set(fileId, {
      data,
      file_unique_id: uniqueId,
      file_path: `${folder}/${fileId}.${extension}`,
      ...fileName ? { file_name: fileName } : {},
      ...mimeType ? { mime_type: mimeType } : {}
    });
    return {
      file_id: fileId,
      file_unique_id: uniqueId,
      size: data.length,
      ...fileName ? { file_name: fileName } : {},
      ...mimeType ? { mime_type: mimeType } : {}
    };
  }
  function registerPhoto(bytes) {
    return registerFile(bytes, "photos", "jpg");
  }
  function sentFile(value, folder, extension) {
    if (typeof value === "string" && files.has(value)) {
      const file = files.get(value);
      return {
        file_id: value,
        file_unique_id: file.file_unique_id,
        size: file.data.length,
        ...file.file_name ? { file_name: file.file_name } : {},
        ...file.mime_type ? { mime_type: file.mime_type } : {}
      };
    }
    return registerFile(
      Buffer.isBuffer(value) ? value : Buffer.alloc(1),
      folder,
      extension
    );
  }
  function mediaField(type, file, { fileName, mimeType, duration = 1 } = {}) {
    const base = {
      file_id: file.file_id,
      file_unique_id: file.file_unique_id,
      file_size: file.size
    };
    switch (type) {
      case "photo":
        return photoSizes(file);
      case "video":
      case "animation":
        return {
          ...base,
          width: 1280,
          height: 720,
          duration,
          mime_type: mimeType ?? "video/mp4",
          ...fileName ? { file_name: fileName } : {}
        };
      case "sticker":
        return {
          ...base,
          type: "regular",
          width: 512,
          height: 512,
          is_animated: false,
          is_video: false
        };
      case "voice":
        return { ...base, duration, mime_type: mimeType ?? "audio/ogg" };
      case "audio":
        return {
          ...base,
          duration,
          mime_type: mimeType ?? "audio/mpeg",
          ...fileName ? { file_name: fileName } : {}
        };
      case "video_note":
        return { ...base, length: 240, duration };
      default:
        return {
          ...base,
          file_name: fileName ?? "file",
          mime_type: mimeType ?? "application/octet-stream"
        };
    }
  }
  function mediaFields(type, file, options) {
    const fields = { [type]: mediaField(type, file, options) };
    if (type === "animation") {
      fields.document = mediaField("document", file, {
        fileName: options?.fileName ?? "animation.mp4",
        mimeType: "video/mp4"
      });
    }
    return fields;
  }
  function photoSizes(photo) {
    return [
      {
        file_id: photo.file_id,
        file_unique_id: photo.file_unique_id,
        width: 800,
        height: 800,
        file_size: photo.size
      }
    ];
  }
  const methods = {
    getMe: (_p, caller) => ({
      ...userObject(caller),
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false,
      supports_join_request_queries: caller.joinRequestQueries,
      // Every bot here can be connected to a business account.
      can_connect_to_business: true
    }),
    setWebhook: (p, caller) => {
      if (!p.url) {
        caller.webhook = null;
        return true;
      }
      caller.webhook = {
        url: String(p.url),
        secret_token: p.secret_token ?? null
      };
      if (Array.isArray(p.allowed_updates)) {
        caller.subscription = p.allowed_updates;
      }
      const pending = isTrue(p.drop_pending_updates) ? [] : caller.queue.splice(0);
      caller.queue.length = 0;
      for (const update of pending) deliver(caller, update);
      return true;
    },
    deleteWebhook: (p, caller) => {
      caller.webhook = null;
      if (isTrue(p.drop_pending_updates)) caller.queue.length = 0;
      return true;
    },
    getWebhookInfo: (_p, caller) => ({
      url: caller.webhook?.url ?? "",
      has_custom_certificate: false,
      pending_update_count: caller.webhook?.url ? 0 : caller.queue.length,
      ...caller.subscription ? { allowed_updates: caller.subscription } : {}
    }),
    getUpdates: async (p, caller) => {
      const queue = caller.queue;
      if (caller.webhook?.url) {
        throw new TelegramError(
          409,
          "Conflict: can't use getUpdates method while webhook is active; use deleteWebhook to delete the webhook first"
        );
      }
      if (Array.isArray(p.allowed_updates)) {
        caller.subscription = p.allowed_updates;
      }
      const offset = numberParam(p.offset, 0);
      if (offset > 0) {
        while (queue.length && queue[0].update_id < offset) queue.shift();
      } else if (offset < 0) {
        queue.splice(0, Math.max(0, queue.length + offset));
      }
      const limit = Math.min(100, Math.max(1, numberParam(p.limit, 100)));
      const timeoutMs = Math.max(0, numberParam(p.timeout, 0)) * 1e3;
      if (queue.length === 0 && timeoutMs > 0) {
        await new Promise((resolve) => {
          const waiter = {
            wake: () => {
              clearTimeout(waiter.timer);
              caller.pollWaiters.delete(waiter);
              resolve();
            }
          };
          waiter.timer = setTimeout(waiter.wake, timeoutMs);
          caller.pollWaiters.add(waiter);
        });
      }
      return queue.slice(0, limit);
    },
    setMyCommands: (p, caller) => {
      caller.commands = Array.isArray(p.commands) ? p.commands : [];
      return true;
    },
    deleteMyCommands: (_p, caller) => {
      caller.commands = [];
      return true;
    },
    getMyCommands: (_p, caller) => caller.commands,
    setMyDescription: () => true,
    setMyShortDescription: () => true,
    setChatMenuButton: () => true,
    setMyDefaultAdministratorRights: () => true,
    answerCallbackQuery: (p) => {
      if (!openQueries.delete(String(p.callback_query_id))) {
        throw new TelegramError(
          400,
          "Bad Request: query is too old and response timeout expired or query ID is invalid"
        );
      }
      callbackAnswers.set(String(p.callback_query_id), {
        text: p.text ?? "",
        show_alert: String(p.show_alert) === "true"
      });
      return true;
    },
    getChat: (p) => {
      if (String(p.chat_id).startsWith("@")) {
        const entry = publicByUsername.get(
          String(p.chat_id).slice(1).toLowerCase()
        );
        if (!entry) throw new TelegramError(400, "Bad Request: chat not found");
        const common = {
          accent_color_id: 0,
          max_reaction_count: 11,
          accepted_gift_types: { ...NO_GIFTS }
        };
        return entry.type === "bot" ? {
          id: entry.id,
          type: "private",
          first_name: entry.title,
          username: entry.username,
          ...common
        } : {
          id: entry.id,
          type: entry.type,
          title: entry.title,
          username: entry.username,
          ...common
        };
      }
      const id = Number(p.chat_id);
      if (chats.has(id)) {
        const chat = chats.get(id);
        const pinned = chat.messages.get((chat.pinned ?? [])[0]);
        return {
          ...chatObject(chat),
          ...pinned && !pinned.deleted ? { pinned_message: pinned.message } : {},
          permissions: { ...chat.permissions },
          ...chat.description ? { description: chat.description } : {},
          ...chat.photo ? {
            photo: {
              small_file_id: chat.photo.file_id,
              small_file_unique_id: chat.photo.file_unique_id,
              big_file_id: chat.photo.file_id,
              big_file_unique_id: chat.photo.file_unique_id
            }
          } : {},
          accent_color_id: 0,
          max_reaction_count: 11,
          accepted_gift_types: { ...NO_GIFTS }
        };
      }
      const user = users.get(id);
      if (!user) throw new TelegramError(400, "Bad Request: chat not found");
      const photo = user.photos?.[0];
      return {
        id: user.id,
        type: "private",
        first_name: user.first_name,
        ...user.last_name ? { last_name: user.last_name } : {},
        ...user.username ? { username: user.username } : {},
        ...user.bio ? { bio: user.bio } : {},
        ...photo ? {
          photo: {
            small_file_id: photo.file_id,
            small_file_unique_id: photo.file_unique_id,
            big_file_id: photo.file_id,
            big_file_unique_id: photo.file_unique_id
          }
        } : {},
        accent_color_id: 0,
        max_reaction_count: 11,
        accepted_gift_types: { ...NO_GIFTS }
      };
    },
    getChatMember: (p) => chatMemberObject(requireChat(p.chat_id), p.user_id),
    getChatAdministrators: (p) => {
      const chat = requireChat(p.chat_id);
      return [...chat.members.entries()].filter(([, m]) => ["creator", "administrator"].includes(m.status)).map(([id]) => chatMemberObject(chat, id));
    },
    getChatMemberCount: (p) => {
      const chat = requireChat(p.chat_id);
      return [...chat.members.keys()].filter((id) => isInChat(chat, id)).length;
    },
    getUserProfilePhotos: (p) => {
      const user = requireUser(p.user_id);
      const offset = Math.max(0, numberParam(p.offset, 0));
      const limit = Math.min(100, Math.max(1, numberParam(p.limit, 100)));
      const photos = (user.photos ?? []).slice(offset, offset + limit);
      return {
        total_count: user.photos?.length ?? 0,
        photos: photos.map(photoSizes)
      };
    },
    getFile: (p) => {
      const file = files.get(String(p.file_id));
      if (!file) throw new TelegramError(400, "Bad Request: invalid file_id");
      return {
        file_id: p.file_id,
        file_unique_id: file.file_unique_id,
        file_size: file.data.length,
        file_path: file.file_path
      };
    },
    sendMessage: (p, caller) => p.business_connection_id ? sendBusinessMessage(p, caller) : sendFrom(p, caller, textFields(p)),
    getBusinessConnection: (p, caller) => businessConnectionObject(
      requireBusinessConnection(p.business_connection_id, caller)
    ),
    sendPhoto: async (p, caller) => {
      const photo = typeof p.photo === "string" && files.has(p.photo) ? {
        file_id: p.photo,
        ...files.get(p.photo),
        size: files.get(p.photo).data.length
      } : sentFile(p.photo, "photos", "jpg");
      return sendFrom(p, caller, {
        photo: photoSizes(photo),
        ...captionFields(p)
      });
    },
    sendDocument: (p, caller) => {
      const file = sentFile(p.document, "documents", "bin");
      return sendFrom(p, caller, {
        document: {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          file_size: file.size,
          file_name: file.file_name ?? "document",
          mime_type: file.mime_type ?? "application/octet-stream"
        },
        ...captionFields(p)
      });
    },
    sendVideo: (p, caller) => {
      const file = sentFile(p.video, "videos", "mp4");
      return sendFrom(p, caller, {
        video: {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          width: 640,
          height: 360,
          duration: 1,
          file_size: file.size
        },
        ...captionFields(p)
      });
    },
    sendAnimation: (p, caller) => {
      const file = sentFile(p.animation, "animations", "mp4");
      return sendFrom(p, caller, {
        animation: {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          width: 320,
          height: 240,
          duration: 1,
          file_size: file.size
        },
        ...captionFields(p)
      });
    },
    sendSticker: (p, caller) => {
      const file = sentFile(p.sticker, "stickers", "webp");
      return sendFrom(p, caller, {
        sticker: {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          type: "regular",
          width: 512,
          height: 512,
          is_animated: false,
          is_video: false,
          file_size: file.size
        }
      });
    },
    editMessageText: (p, caller) => {
      const formatted = textFields(p);
      return editMessage(p, caller, (message) => {
        message.text = formatted.text;
        if (formatted.entities) message.entities = formatted.entities;
        else delete message.entities;
      });
    },
    editMessageReplyMarkup: (p, caller) => editMessage(p, caller, () => {
    }),
    editMessageCaption: (p, caller) => {
      const formatted = captionFields(p);
      return editMessage(p, caller, (message) => {
        message.caption = formatted.caption ?? "";
        if (formatted.caption_entities) {
          message.caption_entities = formatted.caption_entities;
        } else delete message.caption_entities;
      });
    },
    // The new media is an upload attached as attach://<name>, or the file_id
    // of a file this server holds.
    editMessageMedia: (p, caller) => {
      const input = p.media ?? {};
      const type = input.type ?? "photo";
      if (!MEDIA_KINDS.includes(type)) {
        throw new TelegramError(400, "Bad Request: unsupported media type");
      }
      const reference = typeof input.media === "string" && input.media.startsWith("attach://") ? p[input.media.slice("attach://".length)] : input.media;
      if (!Buffer.isBuffer(reference) && !(typeof reference === "string" && files.has(reference))) {
        throw new TelegramError(
          400,
          "Bad Request: wrong file identifier/HTTP URL specified"
        );
      }
      const file = sentFile(
        reference,
        `${type}s`,
        type === "photo" ? "jpg" : "bin"
      );
      return editMessage(p, caller, (message) => {
        delete message.text;
        delete message.entities;
        for (const kind of MEDIA_KINDS) delete message[kind];
        message[type] = type === "photo" ? photoSizes(file) : {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          file_size: file.size
        };
        if (input.caption !== void 0) {
          message.caption = String(input.caption);
        } else {
          delete message.caption;
        }
      });
    },
    // A poll may carry a photo, uploaded with it as attach://<name>.
    sendPoll: (p, caller) => {
      const options = (Array.isArray(p.options) ? p.options : []).map(
        (option) => ({
          text: typeof option === "string" ? option : String(option?.text ?? ""),
          voter_count: 0
        })
      );
      if (!p.question) {
        throw new TelegramError(
          400,
          "Bad Request: poll question must be non-empty"
        );
      }
      if (options.length < 2) {
        throw new TelegramError(
          400,
          "Bad Request: poll must have at least 2 option"
        );
      }
      if (options.length > 12) {
        throw new TelegramError(
          400,
          "Bad Request: poll can't have more than 12 options"
        );
      }
      const attached = typeof p.media?.media === "string" && p.media.media.startsWith("attach://") ? p[p.media.media.slice("attach://".length)] : null;
      const photo = Buffer.isBuffer(attached) ? registerPhoto(attached) : null;
      nextPollId += 1n;
      return sendFrom(p, caller, {
        poll: {
          id: String(nextPollId),
          question: String(p.question),
          options,
          total_voter_count: 0,
          is_closed: false,
          is_anonymous: String(p.is_anonymous ?? "true") !== "false",
          type: p.type === "quiz" ? "quiz" : "regular",
          allows_multiple_answers: isTrue(p.allows_multiple_answers),
          ...p.description ? { description: String(p.description) } : {},
          ...photo ? { media: { photo: photoSizes(photo) } } : {}
        }
      });
    },
    stopPoll: (p, caller) => {
      const chat = botChat(p.chat_id);
      const entry = chat.messages.get(Number(p.message_id));
      if (!entry || entry.deleted || !entry.message.poll) {
        throw new TelegramError(
          400,
          "Bad Request: message with poll to stop not found"
        );
      }
      if (entry.message.from?.id !== caller.id) {
        throw new TelegramError(400, "Bad Request: message can't be edited");
      }
      if (entry.message.poll.is_closed) {
        throw new TelegramError(
          400,
          "Bad Request: poll has already been closed"
        );
      }
      entry.message.poll.is_closed = true;
      return entry.message.poll;
    },
    forwardMessage: (p, caller) => {
      const { source, content } = forwardable(p, caller);
      return sendFrom(
        { chat_id: p.chat_id, message_thread_id: p.message_thread_id },
        caller,
        {
          ...content,
          forward_origin: source.chat.type === "channel" ? {
            type: "channel",
            chat: source.message.chat,
            message_id: source.message.message_id,
            date: source.message.date
          } : {
            type: "user",
            sender_user: source.message.from,
            date: source.message.date
          }
        }
      );
    },
    copyMessage: (p, caller) => {
      const { content } = forwardable(p, caller);
      const copy = sendFrom(p, caller, {
        ...content,
        ...p.caption !== void 0 ? { caption: String(p.caption) } : {}
      });
      return { message_id: copy.message_id };
    },
    pinChatMessage: (p, caller) => {
      const chat = botChat(p.chat_id);
      requirePinRights(chat, caller);
      const id = Number(p.message_id);
      const entry = chat.messages.get(id);
      if (!entry || entry.deleted) {
        throw new TelegramError(400, "Bad Request: message to pin not found");
      }
      chat.pinned = [id, ...(chat.pinned ?? []).filter((each) => each !== id)];
      return true;
    },
    unpinChatMessage: (p, caller) => {
      const chat = botChat(p.chat_id);
      requirePinRights(chat, caller);
      const id = p.message_id == null ? (chat.pinned ?? [])[0] : Number(p.message_id);
      chat.pinned = (chat.pinned ?? []).filter((each) => each !== id);
      return true;
    },
    unpinAllChatMessages: (p, caller) => {
      const chat = botChat(p.chat_id);
      requirePinRights(chat, caller);
      chat.pinned = [];
      return true;
    },
    setChatPermissions: (p) => {
      const chat = requireChat(p.chat_id);
      chat.permissions = normalizePermissions(
        p.permissions,
        p.use_independent_chat_permissions
      );
      return true;
    },
    leaveChat: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      if (isInChat(chat, caller.id)) {
        await setBotMembership(chat, caller, { status: "left", actor: caller });
      }
      return true;
    },
    // A bot deletes its own messages, and others' with can_delete_messages.
    deleteMessage: (p, caller) => {
      const chat = botChat(p.chat_id);
      const entry = chat.messages.get(Number(p.message_id));
      if (!entry || entry.deleted) {
        throw new TelegramError(
          400,
          "Bad Request: message to delete not found"
        );
      }
      if (chat.type !== "private" && entry.message.from?.id !== caller.id && !hasRight(chat, caller.id, "can_delete_messages")) {
        throw new TelegramError(400, "Bad Request: message can't be deleted");
      }
      entry.deleted = true;
      return true;
    },
    deleteMessages: (p) => {
      const chat = botChat(p.chat_id);
      if (!Array.isArray(p.message_ids)) {
        throw new TelegramError(
          400,
          "Bad Request: message_ids must be a JSON array"
        );
      }
      for (const id of p.message_ids) {
        const entry = chat.messages.get(Number(id));
        if (entry) entry.deleted = true;
      }
      return true;
    },
    restrictChatMember: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      requireUser(userId);
      assertCanModerate(chat, userId, { self: "can't restrict self", caller });
      const before = chatMemberObject(chat, userId);
      const current = memberStatus(chat, userId);
      const permissions = normalizePermissions(
        p.permissions,
        p.use_independent_chat_permissions
      );
      const inChat = isInChat(chat, userId);
      if (PERMISSION_KEYS.every((key) => permissions[key])) {
        if (current.status === "restricted") {
          chat.members.set(userId, { status: inChat ? "member" : "left" });
        }
      } else {
        chat.members.set(userId, {
          status: "restricted",
          is_member: inChat,
          until_date: Number(p.until_date ?? 0),
          permissions
        });
      }
      memberChanged(chat, userId, before, caller);
      return true;
    },
    banChatMember: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      requireUser(userId);
      assertCanModerate(chat, userId, { caller });
      const before = chatMemberObject(chat, userId);
      chat.members.set(userId, {
        status: "kicked",
        until_date: Number(p.until_date ?? 0)
      });
      memberChanged(chat, userId, before, caller);
      return true;
    },
    unbanChatMember: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      requireUser(userId);
      const current = memberStatus(chat, userId);
      const before = chatMemberObject(chat, userId);
      if (current.status === "kicked") {
        chat.members.set(userId, { status: "left" });
      } else if (isTrue(p.only_if_banned)) {
        return true;
      } else {
        assertCanModerate(chat, userId, { caller });
        if (current.status === "restricted") {
          chat.members.set(userId, { ...current, is_member: false });
        } else if (current.status === "member") {
          chat.members.set(userId, { status: "left" });
        }
      }
      memberChanged(chat, userId, before, caller);
      return true;
    },
    approveChatJoinRequest: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      if (!chat.joinRequests.has(userId)) {
        throw new TelegramError(400, "Bad Request: HIDE_REQUESTER_MISSING");
      }
      const request = chat.joinRequests.get(userId);
      chat.joinRequests.delete(userId);
      const before = chatMemberObject(chat, userId);
      admit(chat, userId);
      emitMemberChange(chat, userId, before, caller, {
        ...request.invite_link ? { invite_link: request.invite_link } : { via_join_request: true }
      });
      const user = requireUser(userId);
      emit(
        "message",
        addMessage(chat, user, { new_chat_members: [userObject(user)] })
      );
      return true;
    },
    declineChatJoinRequest: (p) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      if (!chat.joinRequests.delete(userId)) {
        throw new TelegramError(400, "Bad Request: HIDE_REQUESTER_MISSING");
      }
      return true;
    },
    createChatInviteLink: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const link = `https://t.me/+fake${randomBytes(9).toString("base64url")}`;
      const invite = {
        invite_link: link,
        creator: userObject(caller),
        creates_join_request: String(p.creates_join_request) === "true",
        is_primary: false,
        is_revoked: false,
        ...p.name ? { name: String(p.name) } : {}
      };
      chat.inviteLinks.set(link, invite);
      return invite;
    },
    exportChatInviteLink: (p, caller) => {
      const chat = requireChat(p.chat_id);
      for (const invite2 of chat.inviteLinks.values()) {
        if (invite2.is_primary) invite2.is_revoked = true;
      }
      const invite = methods.createChatInviteLink(
        { chat_id: p.chat_id },
        caller
      );
      invite.is_primary = true;
      return invite.invite_link;
    },
    sendVoice: (p, caller) => sendMedia(p, caller, "voice"),
    sendAudio: (p, caller) => sendMedia(p, caller, "audio"),
    sendVideoNote: (p, caller) => sendMedia(p, caller, "video_note"),
    sendLocation: (p, caller) => sendFrom(p, caller, { location: coordinates(p) }),
    sendVenue: (p, caller) => {
      if (!p.title || !p.address) {
        throw new TelegramError(
          400,
          "Bad Request: venue needs title and address"
        );
      }
      const location = coordinates(p);
      return sendFrom(p, caller, {
        venue: { location, title: String(p.title), address: String(p.address) },
        location
      });
    },
    sendContact: (p, caller) => {
      if (!p.phone_number || !p.first_name) {
        throw new TelegramError(
          400,
          "Bad Request: contact needs phone_number and first_name"
        );
      }
      return sendFrom(p, caller, {
        contact: {
          phone_number: String(p.phone_number),
          first_name: String(p.first_name),
          ...p.last_name ? { last_name: String(p.last_name) } : {}
        }
      });
    },
    sendDice: (p, caller) => {
      const emoji = p.emoji ?? "\u{1F3B2}";
      if (!DICE[emoji]) {
        throw new TelegramError(400, "Bad Request: invalid dice emoji");
      }
      return sendFrom(p, caller, {
        dice: { emoji, value: 1 + Math.floor(Math.random() * DICE[emoji]) }
      });
    },
    sendChatAction: (p, caller) => {
      const chat = botChat(p.chat_id);
      if (!CHAT_ACTIONS.has(p.action)) {
        throw new TelegramError(
          400,
          "Bad Request: wrong parameter action in request"
        );
      }
      requireCanSend(chat, caller);
      return true;
    },
    // An album of 2 to 10 photos and videos, or of documents or audios alone.
    sendMediaGroup: (p, caller) => {
      const items = Array.isArray(p.media) ? p.media : [];
      if (items.length < 2 || items.length > 10) {
        throw new TelegramError(
          400,
          "Bad Request: media group must include 2-10 items"
        );
      }
      const types = items.map((item) => item?.type);
      if (types.some(
        (type) => !["photo", "video", "document", "audio"].includes(type)
      )) {
        throw new TelegramError(400, "Bad Request: unsupported media type");
      }
      for (const alone of ["document", "audio"]) {
        if (types.includes(alone) && types.some((type) => type !== alone)) {
          throw new TelegramError(
            400,
            `Bad Request: ${alone}s can't be mixed with other media types`
          );
        }
      }
      const chat = botChat(p.chat_id);
      requireCanSend(chat, caller);
      const mediaGroupId = String(nextMediaGroupId++);
      return items.map((item) => {
        const reference = typeof item.media === "string" && item.media.startsWith("attach://") ? p[item.media.slice("attach://".length)] : item.media;
        const file = typeof reference === "string" && files.has(reference) ? sentFile(reference) : Buffer.isBuffer(reference) ? item.type === "photo" ? registerPhoto(reference) : registerFile(reference, `${item.type}s`, "bin") : null;
        if (!file) {
          throw new TelegramError(
            400,
            "Bad Request: wrong file identifier/HTTP URL specified"
          );
        }
        return sendFrom(
          { chat_id: p.chat_id, message_thread_id: p.message_thread_id },
          caller,
          {
            ...mediaFields(item.type, file, {}),
            ...item.caption ? { caption: String(item.caption) } : {},
            media_group_id: mediaGroupId
          }
        );
      });
    },
    promoteChatMember: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      requireUser(userId);
      if (!hasRight(chat, caller.id, "can_promote_members")) {
        throw new TelegramError(400, "Bad Request: not enough rights");
      }
      const current = memberStatus(chat, userId);
      if (current.status === "creator") {
        throw new TelegramError(400, "Bad Request: USER_CREATOR");
      }
      if (!isInChat(chat, userId)) {
        throw new TelegramError(400, "Bad Request: USER_NOT_PARTICIPANT");
      }
      if (current.status === "administrator" && current.promotedBy !== caller.id) {
        throw new TelegramError(400, "Bad Request: CHAT_ADMIN_REQUIRED");
      }
      const rights = Object.fromEntries(
        ADMIN_RIGHTS.map((right) => [right, isTrue(p[right])])
      );
      for (const [right, granted] of Object.entries(rights)) {
        if (granted && right !== "is_anonymous" && right !== "can_manage_chat" && !hasRight(chat, caller.id, right)) {
          throw new TelegramError(400, "Bad Request: RIGHT_FORBIDDEN");
        }
      }
      const before = chatMemberObject(chat, userId);
      if (Object.values(rights).some(Boolean)) {
        chat.members.set(userId, {
          status: "administrator",
          rights: { ...rights, can_manage_chat: true },
          promotedBy: caller.id
        });
      } else {
        chat.members.set(userId, { status: "member" });
      }
      await memberChanged(chat, userId, before, caller);
      return true;
    },
    setChatAdministratorCustomTitle: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      const userId = Number(p.user_id);
      const member = memberStatus(chat, userId);
      if (member.status !== "administrator" || member.promotedBy !== caller.id) {
        throw new TelegramError(
          400,
          "Bad Request: not enough rights to change custom title of the user"
        );
      }
      const title = String(p.custom_title ?? "");
      if (/\p{Extended_Pictographic}/u.test(title)) {
        throw new TelegramError(
          400,
          "Bad Request: ADMIN_RANK_EMOJI_NOT_ALLOWED"
        );
      }
      if ([...title].length > 16) {
        throw new TelegramError(400, "Bad Request: ADMIN_RANK_INVALID");
      }
      const before = chatMemberObject(chat, userId);
      chat.members.set(userId, { ...member, customTitle: title || void 0 });
      await memberChanged(chat, userId, before, caller);
      return true;
    },
    setChatTitle: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      requireInfoRight(chat, caller, "title");
      const title = String(p.title ?? "").trim();
      if (!title || title.length > 128) {
        throw new TelegramError(400, "Bad Request: chat title can't be empty");
      }
      if (title === chat.title) {
        throw new TelegramError(400, "Bad Request: chat title is not modified");
      }
      chat.title = title;
      await emit(
        "message",
        addMessage(chat, caller, { new_chat_title: title }),
        { except: caller.id }
      );
      return true;
    },
    setChatDescription: (p, caller) => {
      const chat = requireChat(p.chat_id);
      requireInfoRight(chat, caller, "description");
      const description = String(p.description ?? "");
      if (description.length > 255) {
        throw new TelegramError(
          400,
          "Bad Request: chat description is too long"
        );
      }
      if (description === (chat.description ?? "")) {
        throw new TelegramError(
          400,
          "Bad Request: chat description is not modified"
        );
      }
      chat.description = description || void 0;
      return true;
    },
    setChatPhoto: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      requireInfoRight(chat, caller, "photo");
      if (!Buffer.isBuffer(p.photo)) {
        throw new TelegramError(
          400,
          "Bad Request: there is no photo in the request"
        );
      }
      chat.photo = registerPhoto(p.photo);
      await emit(
        "message",
        addMessage(chat, caller, { new_chat_photo: photoSizes(chat.photo) }),
        { except: caller.id }
      );
      return true;
    },
    deleteChatPhoto: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      requireInfoRight(chat, caller, "photo");
      if (!chat.photo) {
        throw new TelegramError(400, "Bad Request: CHAT_NOT_MODIFIED");
      }
      chat.photo = void 0;
      await emit(
        "message",
        addMessage(chat, caller, { delete_chat_photo: true }),
        { except: caller.id }
      );
      return true;
    },
    editChatInviteLink: (p, caller) => {
      const chat = requireChat(p.chat_id);
      const invite = chat.inviteLinks.get(String(p.invite_link));
      if (!invite || invite.is_revoked) {
        throw new TelegramError(400, "Bad Request: INVITE_HASH_EXPIRED");
      }
      if (invite.creator.id !== caller.id) {
        throw new TelegramError(400, "Bad Request: CHAT_ADMIN_REQUIRED");
      }
      const createsJoinRequest = p.creates_join_request !== void 0 ? isTrue(p.creates_join_request) : invite.creates_join_request;
      const memberLimit = p.member_limit !== void 0 ? p.member_limit : invite.member_limit;
      if (createsJoinRequest && memberLimit != null) {
        throw new TelegramError(
          400,
          "Bad Request: member limit can't be specified for links requiring administrator approval"
        );
      }
      if (p.name !== void 0) invite.name = String(p.name);
      if (p.expire_date !== void 0)
        invite.expire_date = Number(p.expire_date);
      if (p.member_limit !== void 0)
        invite.member_limit = Number(p.member_limit);
      invite.creates_join_request = createsJoinRequest;
      return { ...invite };
    },
    // A bot sets at most one reaction of its own on a message.
    setMessageReaction: (p, caller) => {
      const chat = botChat(p.chat_id);
      const entry = chat.messages.get(Number(p.message_id));
      if (!entry || entry.deleted) {
        throw new TelegramError(400, "Bad Request: MESSAGE_ID_INVALID");
      }
      const reactions = Array.isArray(p.reaction) ? p.reaction : [];
      if (reactions.length > 1) {
        throw new TelegramError(400, "Bad Request: REACTIONS_TOO_MANY");
      }
      entry.reactions ??= /* @__PURE__ */ new Map();
      if (reactions.length) {
        entry.reactions.set(
          caller.id,
          reactions.map((reaction) => String(reaction.emoji ?? ""))
        );
      } else entry.reactions.delete(caller.id);
      return true;
    },
    // Removes a user's reaction; needs can_delete_messages.
    deleteMessageReaction: async (p, caller) => {
      const chat = requireChat(p.chat_id);
      if (!hasRight(chat, caller.id, "can_delete_messages")) {
        throw new TelegramError(
          400,
          "Bad Request: not enough rights to delete reactions"
        );
      }
      const entry = chat.messages.get(Number(p.message_id));
      if (!entry || entry.deleted) {
        throw new TelegramError(400, "Bad Request: MESSAGE_ID_INVALID");
      }
      const user = requireUser(p.user_id);
      if (entry.reactions?.has(user.id)) {
        await changeReaction(chat, entry, user, []);
      }
      return true;
    },
    // A guard bot answers a join request query: approve, decline, or leave it
    // to the other administrators.
    answerChatJoinRequestQuery: (p, caller) => {
      const id = String(p.chat_join_request_query_id ?? "");
      const query = joinQueries.get(id);
      if (!query || query.botId !== caller.id) {
        throw new TelegramError(
          400,
          "Bad Request: query is too old and response timeout expired or query ID is invalid"
        );
      }
      if (!["approve", "decline", "queue"].includes(p.result)) {
        throw new TelegramError(
          400,
          'Bad Request: result must be "approve", "decline" or "queue"'
        );
      }
      joinQueries.delete(id);
      const target = { chat_id: query.chatId, user_id: query.userId };
      if (p.result === "approve")
        methods.approveChatJoinRequest(target, caller);
      if (p.result === "decline")
        methods.declineChatJoinRequest(target, caller);
      return true;
    },
    revokeChatInviteLink: (p) => {
      const chat = requireChat(p.chat_id);
      const invite = chat.inviteLinks.get(String(p.invite_link));
      if (invite) invite.is_revoked = true;
      return {
        ...invite ?? { invite_link: p.invite_link },
        is_revoked: true
      };
    }
  };
  const methodsByLowerName = new Map(
    Object.entries(methods).map(([name, handler]) => [
      name.toLowerCase(),
      handler
    ])
  );
  function isTrue(value) {
    return value === true || value === "true";
  }
  function inlineMarkup(markup) {
    return Array.isArray(markup?.inline_keyboard) && markup.inline_keyboard.length > 0 ? markup : void 0;
  }
  function sendFrom(p, caller, fields) {
    const markup = inlineMarkup(p.reply_markup);
    const receiverId = p.ephemeral_message_parameters?.receiver_user_id;
    const chat = botChat(p.chat_id);
    requireCanSend(chat, caller);
    requireTopic(chat, p.message_thread_id);
    const replyTo = replyTarget(chat, p);
    const message = addMessage(chat, caller, {
      ...fields,
      ...replyTo ? { reply_to_message: replyTo } : {},
      ...markup ? { reply_markup: markup } : {},
      ...p.message_thread_id && chat.topics ? {
        message_thread_id: Number(p.message_thread_id),
        is_topic_message: true
      } : {},
      ...receiverId != null ? { receiver_user: userObject(requireUser(receiverId)) } : {}
    });
    if (receiverId != null) message.ephemeral_message_id = message.message_id;
    return message;
  }
  function replyTarget(chat, p) {
    const parameters = p.reply_parameters ?? (p.reply_to_message_id != null ? {
      message_id: p.reply_to_message_id,
      allow_sending_without_reply: p.allow_sending_without_reply
    } : null);
    if (parameters?.message_id != null) {
      if (parameters.chat_id != null && String(parameters.chat_id) !== String(chat.id) && String(parameters.chat_id) !== String(p.chat_id)) {
        throw new TelegramError(
          400,
          "Bad Request: replies to other chats are not supported here"
        );
      }
      const entry = chat.messages.get(Number(parameters.message_id));
      if (entry && !entry.deleted) {
        const { reply_to_message: _nested, ...original } = entry.message;
        return original;
      }
      if (parameters.allow_sending_without_reply === true) return null;
      throw new TelegramError(
        400,
        "Bad Request: message to be replied not found"
      );
    }
    if (p.message_thread_id && chat.topics) {
      const topic = chat.messages.get(Number(p.message_thread_id));
      if (topic) {
        const { reply_to_message: _nested, ...original } = topic.message;
        return original;
      }
    }
    return null;
  }
  function textFields(p) {
    const formatted = formatOrFail(
      String(p.text ?? ""),
      p.parse_mode,
      p.entities
    );
    if (!formatted.text.trim()) {
      throw new TelegramError(400, "Bad Request: message text is empty");
    }
    return {
      text: formatted.text,
      ...formatted.entities.length > 0 ? { entities: formatted.entities } : {}
    };
  }
  function captionFields(p) {
    if (p.caption == null || p.caption === "") return {};
    const formatted = formatOrFail(
      String(p.caption),
      p.parse_mode,
      p.caption_entities
    );
    return {
      caption: formatted.text,
      ...formatted.entities.length > 0 ? { caption_entities: formatted.entities } : {}
    };
  }
  function formatOrFail(text, parseMode, entities) {
    try {
      return formatText(text, { parseMode, entities, detect: messageEntities });
    } catch (error) {
      if (error instanceof FormattingError) {
        throw new TelegramError(400, error.message);
      }
      throw error;
    }
  }
  function sendMedia(p, caller, type) {
    const file = sentFile(p[type], `${type}s`, MEMBER_MEDIA[type].ext);
    return sendFrom(p, caller, {
      ...mediaFields(type, file, {
        duration: p.duration == null ? 1 : Number(p.duration),
        fileName: file.file_name,
        mimeType: file.mime_type
      }),
      ...MEMBER_MEDIA[type].caption ? captionFields(p) : {}
    });
  }
  function coordinates(p) {
    const latitude = Number(p.latitude);
    const longitude = Number(p.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new TelegramError(400, "Bad Request: wrong latitude or longitude");
    }
    return { latitude, longitude };
  }
  function requireInfoRight(chat, caller, what) {
    if (!hasRight(chat, caller.id, "can_change_info")) {
      throw new TelegramError(
        400,
        `Bad Request: not enough rights to change chat ${what}`
      );
    }
  }
  function businessConnectionObject(connection) {
    return {
      id: connection.id,
      user: userObject(requireUser(connection.ownerId)),
      user_chat_id: connection.ownerId,
      date: connection.date,
      rights: { ...connection.rights },
      is_enabled: connection.isEnabled
    };
  }
  function requireBusinessConnection(id, caller) {
    const connection = businessConnections.get(String(id ?? ""));
    if (!connection || connection.botId !== caller.id) {
      throw new TelegramError(400, "Bad Request: BUSINESS_CONNECTION_INVALID");
    }
    return connection;
  }
  function businessChat(connection, userId) {
    const key = Number(userId);
    if (!connection.chats.has(key)) {
      connection.chats.set(key, {
        entries: [],
        nextMessageId: 1,
        lastInboundAt: null
      });
    }
    return connection.chats.get(key);
  }
  function businessChatObject(userId) {
    const user = requireUser(userId);
    return {
      id: user.id,
      type: "private",
      first_name: user.first_name,
      ...user.last_name ? { last_name: user.last_name } : {},
      ...user.username ? { username: user.username } : {}
    };
  }
  function addBusinessMessage(connection, userId, direction, from, fields) {
    const chat = businessChat(connection, userId);
    const message = {
      message_id: chat.nextMessageId++,
      from: userObject(from),
      chat: businessChatObject(userId),
      date: now(),
      business_connection_id: connection.id,
      ...fields
    };
    if (message.text) {
      const entities = messageEntities(message.text);
      if (entities.length > 0) message.entities = entities;
    }
    chat.entries.push({ direction, deleted: false, message });
    return message;
  }
  function sendBusinessMessage(p, caller) {
    const connection = requireBusinessConnection(
      p.business_connection_id,
      caller
    );
    if (!connection.isEnabled) {
      throw new TelegramError(400, "Bad Request: BUSINESS_CONNECTION_INVALID");
    }
    if (connection.rights.can_reply !== true) {
      throw new TelegramError(403, "Forbidden: BOT_ACCESS_FORBIDDEN");
    }
    const userId = Number(p.chat_id);
    requireUser(userId);
    const chat = businessChat(connection, userId);
    if (chat.lastInboundAt == null || Date.now() - chat.lastInboundAt > 24 * 60 * 60 * 1e3) {
      throw new TelegramError(400, "Bad Request: BUSINESS_PEER_USAGE_MISSING");
    }
    return addBusinessMessage(
      connection,
      userId,
      "bot",
      requireUser(connection.ownerId),
      {
        text: String(p.text ?? ""),
        sender_business_bot: userObject(caller)
      }
    );
  }
  function connectBusiness(body) {
    const existing = body.id != null ? businessConnections.get(String(body.id)) : null;
    const ownerId = Number(body.owner_id ?? existing?.ownerId);
    const owner = requireUser(ownerId);
    if (owner.is_bot) {
      throw new TelegramError(
        400,
        "a business account owner is a user, not a bot"
      );
    }
    const record = body.bot_id != null ? requireBot(body.bot_id) : existing ? requireBot(existing.botId) : bot;
    const connection = existing ?? {
      id: String(
        body.id ?? `fake-business-${randomBytes(9).toString("base64url")}`
      ),
      ownerId,
      botId: record.id,
      date: now(),
      chats: /* @__PURE__ */ new Map()
    };
    connection.ownerId = ownerId;
    connection.botId = record.id;
    connection.rights = { ...body.rights ?? existing?.rights ?? {} };
    connection.isEnabled = body.is_enabled !== void 0 ? body.is_enabled === true : existing?.isEnabled ?? true;
    businessConnections.set(connection.id, connection);
    const privateChat = messageChat(ownerId);
    privateChat.openTo ??= /* @__PURE__ */ new Set();
    privateChat.openTo.add(record.id);
    const sent = emitOne(
      record,
      "business_connection",
      businessConnectionObject(connection)
    );
    return {
      connection: businessConnectionObject(connection),
      update_id: sent.updateId,
      delivered: sent.delivered
    };
  }
  async function sayInBusinessChat(connectionId, userId, { sender, text }) {
    const connection = businessConnections.get(String(connectionId));
    if (!connection) {
      throw new TelegramError(404, `No business connection ${connectionId}`);
    }
    if (sender !== "person" && sender !== "owner") {
      throw new TelegramError(400, 'sender must be "person" or "owner"');
    }
    const from = requireUser(sender === "person" ? userId : connection.ownerId);
    requireUser(userId);
    const message = addBusinessMessage(
      connection,
      userId,
      sender === "person" ? "inbound" : "owner",
      from,
      { text: String(text ?? "") }
    );
    if (sender === "person")
      businessChat(connection, userId).lastInboundAt = Date.now();
    let updateId2 = null;
    if (connection.isEnabled) {
      const sent = emitOne(
        requireBot(connection.botId),
        "business_message",
        structuredClone(message)
      );
      updateId2 = sent.updateId;
      await sent.delivered;
    }
    return {
      message_id: message.message_id,
      date: message.date,
      update_id: updateId2
    };
  }
  function forwardable(p, caller) {
    const sourceChat = botChat(p.from_chat_id);
    const entry = sourceChat.messages.get(Number(p.message_id));
    if (!entry || entry.deleted || sourceChat.type !== "private" && !isInChat(sourceChat, caller.id)) {
      throw new TelegramError(400, "Bad Request: message to forward not found");
    }
    const {
      message_id: _id,
      from: _from,
      chat: _chat,
      date: _date,
      edit_date: _edited,
      reply_markup: _markup,
      reply_to_message: _reply,
      receiver_user: _receiver,
      ephemeral_message_id: _ephemeral,
      forward_origin: _origin,
      message_thread_id: _thread,
      is_topic_message: _topic,
      ...content
    } = structuredClone(entry.message);
    return { source: { chat: sourceChat, message: entry.message }, content };
  }
  function editMessage(p, caller, apply) {
    const chat = botChat(p.chat_id);
    const entry = chat.messages.get(Number(p.message_id));
    if (!entry || entry.deleted) {
      throw new TelegramError(400, "Bad Request: message to edit not found");
    }
    if (entry.message.from.id !== caller.id) {
      throw new TelegramError(400, "Bad Request: message can't be edited");
    }
    const previous = structuredClone(entry.message);
    const edited = structuredClone(entry.message);
    apply(edited);
    const markup = inlineMarkup(p.reply_markup);
    if (markup) edited.reply_markup = markup;
    else delete edited.reply_markup;
    const same = (message) => JSON.stringify([
      message.text,
      message.entities,
      message.caption,
      message.caption_entities,
      message.reply_markup,
      ...MEDIA_KINDS.map((kind) => message[kind])
    ]);
    if (same(edited) === same(previous)) {
      throw new TelegramError(
        400,
        "Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message"
      );
    }
    edited.edit_date = now();
    entry.message = edited;
    return edited;
  }
  function createChat({
    title,
    type,
    owner_id: ownerId,
    owner_name,
    is_forum
  }) {
    if (type !== void 0 && !["supergroup", "channel", "group"].includes(type)) {
      throw new TelegramError(
        400,
        'type must be "supergroup", "channel" or "group"'
      );
    }
    const kind = type ?? "supergroup";
    const owner = Number(ownerId);
    if (!Number.isSafeInteger(owner) || owner <= 0) {
      throw new TelegramError(400, "chat needs an owner_id");
    }
    if (!users.has(owner)) {
      users.set(owner, {
        id: owner,
        is_bot: false,
        first_name: owner_name ?? "Chat Owner",
        bio: "",
        photos: []
      });
    }
    nextChatId += 1;
    const chat = {
      id: kind === "group" ? -nextBasicGroupId++ : -(1e12 + nextChatId),
      title: String(title ?? (kind === "channel" ? "Channel" : "Group")),
      type: kind,
      members: /* @__PURE__ */ new Map([[owner, { status: "creator" }]]),
      messages: /* @__PURE__ */ new Map(),
      nextMessageId: startSeconds - 17e8,
      inviteLinks: /* @__PURE__ */ new Map(),
      joinRequests: /* @__PURE__ */ new Map(),
      permissions: { ...ALL_PERMISSIONS },
      // A forum keeps its topics by thread id.
      ...kind === "supergroup" && isTrue(is_forum) ? { topics: /* @__PURE__ */ new Map() } : {}
    };
    chats.set(chat.id, chat);
    return chat;
  }
  function creatorOf(chat) {
    return [...chat.members.entries()].find(
      ([, member]) => member.status === "creator"
    )?.[0];
  }
  async function control(method, parts, body) {
    const [resource, id, sub, subId] = parts;
    if (resource === "owners") {
      try {
        return ownerModel.control(method, parts.slice(1), body);
      } catch (error) {
        if (error instanceof OwnerError) {
          throw new TelegramError(error.status, error.message);
        }
        throw error;
      }
    }
    if (resource === "bots" && !id && method === "POST") {
      try {
        return userObject(
          addBot({
            token: String(body.token ?? ""),
            username: body.username,
            firstName: body.first_name,
            joinRequestQueries: body.supports_join_request_queries === true,
            loginClientSecret: body.login_client_secret
          })
        );
      } catch (error) {
        throw new TelegramError(400, error.message);
      }
    }
    if (resource === "bots" && !id && method === "GET") {
      return [...bots.values()].map((record) => ({
        ...userObject(record),
        webhook: record.webhook ? { url: record.webhook.url } : null,
        login_client_secret: record.loginClientSecret
      }));
    }
    if (resource === "chats" && !id && method === "POST") {
      return chatObject(createChat(body));
    }
    if (resource === "chats" && id && !sub && method === "GET") {
      const chat = requireChat(id);
      return {
        ...chatObject(chat),
        pinned: [...chat.pinned ?? []],
        members: [...chat.members.entries()].map(([userId, member]) => ({
          user_id: userId,
          status: member.status
        }))
      };
    }
    if (resource === "chats" && id && sub === "bots" && method === "POST") {
      const chat = requireChat(id);
      const record = requireBot(body.bot_id);
      if (body.start_parameter !== void 0) {
        return addBotViaLink(chat, record, {
          by: body.by,
          startParameter: body.start_parameter,
          rights: body.rights ?? null
        });
      }
      const status = body.status ?? "administrator";
      if (!["administrator", "member", "left", "kicked"].includes(status)) {
        throw new TelegramError(
          400,
          'status must be "administrator", "member", "left" or "kicked"'
        );
      }
      return setBotMembership(chat, record, {
        status,
        rights: body.rights ?? null,
        actor: requireUser(body.by ?? creatorOf(chat))
      });
    }
    if (resource === "chats" && id && sub === "migrate" && method === "POST") {
      return migrateToSupergroup(requireChat(id), body);
    }
    if (resource === "chats" && id && sub === "title" && method === "POST") {
      return renameByPerson(requireChat(id), body);
    }
    if (resource === "chats" && id && sub === "photo" && method === "POST") {
      return changePhotoByPerson(requireChat(id), body);
    }
    if (resource === "failures" && method === "POST") {
      if (typeof body.method !== "string" || body.method === "") {
        throw new TelegramError(
          400,
          "a failure needs the method it applies to"
        );
      }
      const rule = {
        method: body.method,
        chat_id: body.chat_id == null ? null : String(body.chat_id),
        bot_id: body.bot_id == null ? null : Number(body.bot_id),
        remaining: Math.max(1, numberParam(body.times, 1)),
        error_code: numberParam(body.error_code, 400),
        description: String(body.description ?? "Bad Request"),
        retry_after: body.retry_after == null ? null : numberParam(body.retry_after, 1),
        drop_after_apply: body.drop_after_apply === true
      };
      failures.push(rule);
      return rule;
    }
    if (resource === "failures" && method === "GET") return failures;
    if (resource === "failures" && method === "DELETE") {
      failures.length = 0;
      return { ok: true };
    }
    if (resource === "business" && id === "connections") {
      const [, , connectionId, chatsPart, userId, messagesPart] = parts;
      if (method === "POST" && !connectionId) {
        const { delivered, ...result } = connectBusiness(body);
        await delivered;
        return result;
      }
      if (method === "GET" && connectionId && !chatsPart) {
        const connection = businessConnections.get(String(connectionId));
        if (!connection) {
          throw new TelegramError(
            404,
            `No business connection ${connectionId}`
          );
        }
        return businessConnectionObject(connection);
      }
      if (chatsPart === "chats" && userId && messagesPart === "messages") {
        const connection = businessConnections.get(String(connectionId));
        if (!connection) {
          throw new TelegramError(
            404,
            `No business connection ${connectionId}`
          );
        }
        if (method === "POST")
          return sayInBusinessChat(connectionId, userId, body);
        if (method === "GET") {
          return [...businessChat(connection, userId).entries].reverse().map((entry) => structuredClone(entry));
        }
      }
    }
    if (resource === "updates" && id && sub === "redeliver" && method === "POST") {
      const sent = sentUpdates.get(Number(id));
      if (!sent) throw new TelegramError(404, `No update ${id}`);
      if (!sent.record.webhook?.url) {
        throw new TelegramError(409, `The bot for update ${id} has no webhook`);
      }
      await deliver(sent.record, JSON.parse(sent.body), sent.body);
      return { update_id: Number(id) };
    }
    if (resource === "users" && method === "POST" && !id) {
      const user = {
        id: nextUserId++,
        is_bot: body.is_bot === true,
        is_premium: body.is_premium === true,
        first_name: body.first_name ?? "Test Member",
        last_name: body.last_name ?? "",
        username: body.username ?? null,
        language_code: body.language_code ?? "en",
        bio: body.bio ?? "",
        photos: []
      };
      users.set(user.id, user);
      return { id: user.id };
    }
    if (resource === "users" && id) {
      const user = requireUser(id);
      if (!sub && method === "GET") {
        return { ...userObject(user), bio: user.bio, photos: user.photos };
      }
      if (sub === "profile" && method === "POST") {
        for (const key of ["first_name", "last_name", "bio", "username"]) {
          if (key in body) user[key] = body[key];
        }
        return { ok: true };
      }
      if (sub === "photos" && method === "POST") {
        if (typeof body.base64 !== "string" || body.base64 === "") {
          throw new TelegramError(400, "photo needs base64 image bytes");
        }
        const photo = registerPhoto(Buffer.from(body.base64, "base64"));
        user.photos.unshift(photo);
        return photo;
      }
      if (sub === "photos" && method === "DELETE") {
        user.photos = user.photos.filter((p) => p.file_id !== subId);
        return { ok: true };
      }
    }
    if (resource === "chats" && id) {
      const chat = requireChat(id);
      if (sub === "join" && method === "POST") return join2(chat, body);
      if (sub === "leave" && method === "POST") return leave(chat, body);
      if (sub === "messages" && method === "POST" && !subId)
        return post(chat, body);
      if (sub === "messages" && method === "GET" && !subId) {
        return [...chat.messages.values()].filter((entry) => !entry.deleted).map((entry) => entry.message).sort((left, right) => right.message_id - left.message_id);
      }
      if (sub === "messages" && method === "GET" && subId) {
        const entry = chat.messages.get(Number(subId));
        return entry ? {
          exists: true,
          deleted: entry.deleted,
          message: entry.message,
          reactions: Object.fromEntries(entry.reactions ?? [])
        } : { exists: false, deleted: false };
      }
      if (sub === "members" && method === "GET" && subId) {
        return chatMemberObject(chat, subId);
      }
      if (sub === "topics") {
        if (!chat.topics) {
          throw new TelegramError(400, "Bad Request: the chat is not a forum");
        }
        return topicControl(chat, method, subId, parts[4], body);
      }
      if (sub === "join-requests" && method === "GET") {
        return [...chat.joinRequests.keys()];
      }
    }
    if (resource === "invites" && id) {
      let hash;
      try {
        hash = decodeURIComponent(id);
      } catch {
        throw new TelegramError(400, "INVITE_HASH_INVALID");
      }
      const link = `https://t.me/+${hash}`;
      const chat = [...chats.values()].find((c) => c.inviteLinks.has(link));
      if (!chat) throw new TelegramError(400, "INVITE_HASH_INVALID");
      if (sub === "join" && method === "POST") {
        return {
          chat_id: chat.id,
          ...await join2(chat, { ...body, invite_link: link })
        };
      }
      if (sub === "check" && method === "POST") {
        return {
          chat_id: chat.id,
          title: chat.title,
          member: isInChat(chat, body.user_id)
        };
      }
    }
    if (resource === "bot" && method === "GET") {
      return { ...userObject(bot), login_client_secret: bot.loginClientSecret };
    }
    if (resource === "login" && (id === "approve" || id === "cancel")) {
      const request = loginRequest(
        new URL(String(body.auth_url ?? ""), "http://fake").searchParams
      );
      if (request.error) throw new TelegramError(400, request.error);
      return {
        redirect_url: id === "approve" ? approveLogin(request, requireUser(body.user_id)) : loginRedirect(request.redirectUri, {
          error: "access_denied",
          state: request.state
        })
      };
    }
    if (resource === "users" && id && sub === "dm") {
      const existing = privateChats.get(Number(id));
      if (method === "GET" && !subId) {
        requireUser(id);
        return existing ? [...existing.messages.values()].filter((entry) => !entry.deleted).map((entry) => entry.message).sort((left, right) => right.message_id - left.message_id) : [];
      }
      if (method === "POST" && subId && parts[4] === "callback") {
        if (!existing) throw new TelegramError(400, "MESSAGE_ID_INVALID");
        return pressButton(existing, requireUser(id), Number(subId), body.data);
      }
      const chat = messageChat(id);
      if (method === "POST" && !subId) {
        return post(chat, { ...body, user_id: Number(id) });
      }
    }
    if (resource === "chats" && id && sub === "albums" && method === "POST") {
      return postAlbum(requireChat(id), body);
    }
    if (resource === "chats" && id && sub === "messages" && subId && parts[4] === "edit" && method === "POST") {
      return editByMember(requireChat(id), subId, body);
    }
    if (resource === "chats" && id && sub === "messages" && subId && parts[4] === "reactions" && method === "POST") {
      return reactByMember(requireChat(id), subId, body);
    }
    if (resource === "chats" && id && sub === "messages" && subId && parts[4] === "callback") {
      const user = requireUser(body.user_id);
      return pressButton(requireChat(id), user, Number(subId), body.data);
    }
    if (resource === "chats" && id && sub === "guest-bot-reply" && method === "POST") {
      const chat = requireChat(id);
      const caller = requireUser(body.caller_user_id);
      const username = String(body.bot_username ?? "").replace(/^@/, "");
      if (!/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(username)) {
        throw new TelegramError(400, "guest bot needs a valid bot_username");
      }
      let guestBot = [...users.values()].find(
        (user) => user.is_bot && user.username === username
      );
      if (!guestBot) {
        guestBot = {
          id: nextUserId++,
          is_bot: true,
          first_name: username,
          username,
          photos: []
        };
        users.set(guestBot.id, guestBot);
      }
      const text = String(body.text ?? "");
      const entities = messageEntities(text);
      const message = addMessage(chat, guestBot, {
        text,
        ...entities.length > 0 ? { entities } : {},
        guest_bot_caller_user: userObject(caller)
      });
      await emit("message", message);
      return { message_id: message.message_id };
    }
    if (resource === "calls" && method === "GET") {
      return { calls, unimplemented: [...unimplemented] };
    }
    if (resource === "webhook" && method === "GET") return bot.webhook;
    throw new TelegramError(
      404,
      `Unknown fake control ${method} /${parts.join("/")}`
    );
  }
  async function topicControl(chat, method, threadId, action, body) {
    if (method === "GET" && !threadId) {
      return [...chat.topics.entries()].map(([id, topic]) => ({
        message_thread_id: id,
        name: topic.name
      }));
    }
    const actor = requireUser(body.by ?? creatorOf(chat));
    const name = body.name == null ? null : String(body.name).trim();
    if (name !== null && (name === "" || name.length > 128)) {
      throw new TelegramError(400, "Bad Request: TOPIC_TITLE_EMPTY");
    }
    if (method === "POST" && !threadId) {
      if (name === null) {
        throw new TelegramError(400, "Bad Request: TOPIC_TITLE_EMPTY");
      }
      const message = addMessage(chat, actor, {
        forum_topic_created: { name, icon_color: 7322096 },
        is_topic_message: true
      });
      message.message_thread_id = message.message_id;
      chat.topics.set(message.message_id, { name });
      await emit("message", message);
      return { message_thread_id: message.message_id, name };
    }
    if (method === "POST" && threadId && action === "edit") {
      const topic = chat.topics.get(Number(threadId));
      if (!topic) throw new TelegramError(400, "Bad Request: TOPIC_ID_INVALID");
      if (name !== null) topic.name = name;
      const message = addMessage(chat, actor, {
        forum_topic_edited: { name: topic.name },
        message_thread_id: Number(threadId),
        is_topic_message: true
      });
      await emit("message", message);
      return { message_thread_id: Number(threadId), name: topic.name };
    }
    throw new TelegramError(404, `Unknown topic control ${method}`);
  }
  async function pressButton(chat, user, messageId, data) {
    const entry = chat.messages.get(messageId);
    if (!entry || entry.deleted) {
      throw new TelegramError(400, "MESSAGE_ID_INVALID");
    }
    const buttons = entry.message.reply_markup?.inline_keyboard?.flat() ?? [];
    if (!buttons.some((button) => button.callback_data === String(data ?? ""))) {
      throw new TelegramError(
        400,
        "The message has no button with that callback data"
      );
    }
    const queryId = randomBytes(8).readBigUInt64BE().toString();
    openQueries.add(queryId);
    const sender = [...bots.values()].find(
      (record) => record.id === entry.message.from?.id
    );
    await emit(
      "callback_query",
      {
        id: queryId,
        from: userObject(user),
        message: entry.message,
        chat_instance: String(chat.id),
        data: String(data ?? "")
      },
      { to: sender ? [sender] : [bot] }
    );
    const deadline = Date.now() + 1e4;
    while (Date.now() < deadline) {
      if (callbackAnswers.has(queryId)) {
        const answer = callbackAnswers.get(queryId);
        callbackAnswers.delete(queryId);
        return { answered: true, ...answer };
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    openQueries.delete(queryId);
    return { answered: false };
  }
  async function join2(chat, { user_id: userId, invite_link: link }) {
    const user = requireUser(userId);
    const current = memberStatus(chat, userId);
    if (current.status === "kicked") {
      throw new TelegramError(400, "USER_BANNED_IN_CHANNEL");
    }
    if (isInChat(chat, userId)) {
      throw new TelegramError(400, "USER_ALREADY_PARTICIPANT");
    }
    const invite = link ? chat.inviteLinks.get(link) : null;
    if (link && (!invite || invite.is_revoked)) {
      throw new TelegramError(400, "INVITE_HASH_EXPIRED");
    }
    if (invite?.creates_join_request) {
      chat.joinRequests.set(user.id, {
        invite_link: { ...invite },
        date: now()
      });
      const request = {
        chat: chatObject(chat),
        from: userObject(user),
        user_chat_id: user.id,
        date: now(),
        ...user.bio ? { bio: user.bio } : {},
        invite_link: { ...invite }
      };
      const guard = [...bots.values()].find(
        (record) => record.joinRequestQueries && isInChat(chat, record.id)
      );
      const others = [...bots.values()].filter(
        (record) => record !== guard && isInChat(chat, record.id)
      );
      if (guard) {
        const queryId = randomBytes(8).readBigUInt64BE().toString();
        joinQueries.set(queryId, {
          chatId: chat.id,
          userId: user.id,
          botId: guard.id
        });
        await emit(
          "chat_join_request",
          { ...request, query_id: queryId },
          { to: [guard] }
        );
      }
      await emit("chat_join_request", request, { to: others });
      return { status: "requested" };
    }
    const before = chatMemberObject(chat, user.id);
    admit(chat, user.id);
    await emitMemberChange(chat, user.id, before, user, {
      ...invite ? { invite_link: { ...invite } } : {}
    });
    const service = addMessage(chat, user, {
      new_chat_members: [userObject(user)]
    });
    await emit("message", service);
    return { status: "member" };
  }
  async function leave(chat, { user_id: userId }) {
    const user = requireUser(userId);
    if (!isInChat(chat, userId))
      return { status: memberStatus(chat, userId).status };
    const before = chatMemberObject(chat, userId);
    const current = memberStatus(chat, userId);
    chat.members.set(
      user.id,
      current.status === "restricted" ? { ...current, is_member: false } : { status: "left" }
    );
    await emitMemberChange(chat, user.id, before, user);
    const service = addMessage(chat, user, {
      left_chat_member: userObject(user)
    });
    await emit("message", service);
    return { status: "left" };
  }
  function forwardOrigin(from) {
    const date = now();
    if (from.chat_id != null) {
      const source = requireChat(from.chat_id);
      if (source.type !== "channel") {
        throw new TelegramError(400, "forward_from.chat_id must be a channel");
      }
      const original = from.message_id != null ? source.messages.get(Number(from.message_id)) : null;
      return {
        type: "channel",
        chat: chatObject(source),
        message_id: Number(from.message_id ?? 1),
        date: original?.message.date ?? date
      };
    }
    if (from.user_id != null) {
      return {
        type: "user",
        sender_user: userObject(requireUser(from.user_id)),
        date
      };
    }
    if (from.sender_name) {
      return {
        type: "hidden_user",
        sender_user_name: String(from.sender_name),
        date
      };
    }
    throw new TelegramError(
      400,
      "forward_from needs user_id, sender_name, or a channel chat_id"
    );
  }
  async function postAlbum(chat, { user_id: userId, items, message_thread_id }) {
    if (!Array.isArray(items) || items.length < 2 || items.length > 10) {
      throw new TelegramError(400, "an album needs 2 to 10 items");
    }
    const mediaGroupId = String(nextMediaGroupId++);
    const ids = [];
    for (const item of items) {
      if (!["photo", "video"].includes(item?.type)) {
        throw new TelegramError(400, "album items are photos or videos");
      }
      const { message_id: id } = await post(
        chat,
        {
          user_id: userId,
          media: { type: item.type, base64: item.base64 },
          caption: item.caption,
          message_thread_id
        },
        { mediaGroupId }
      );
      ids.push(id);
    }
    return { media_group_id: mediaGroupId, message_ids: ids };
  }
  async function editByMember(chat, messageId, { user_id: userId, text, caption }) {
    const entry = chat.messages.get(Number(messageId));
    if (!entry || entry.deleted) {
      throw new TelegramError(400, "MESSAGE_ID_INVALID");
    }
    if (entry.message.from?.id !== Number(userId)) {
      throw new TelegramError(403, "MESSAGE_AUTHOR_REQUIRED");
    }
    const message = entry.message;
    const field = message.text !== void 0 ? "text" : "caption";
    const value = field === "text" ? text : caption;
    if (value === void 0 || value === null) {
      throw new TelegramError(400, `the edit needs ${field}`);
    }
    if (String(value) === (message[field] ?? "")) {
      throw new TelegramError(400, "MESSAGE_NOT_MODIFIED");
    }
    message[field] = String(value);
    const entities = messageEntities(message[field]);
    const entityField = field === "text" ? "entities" : "caption_entities";
    if (entities.length > 0) message[entityField] = entities;
    else delete message[entityField];
    message.edit_date = now();
    await emit("edited_message", structuredClone(message));
    return { message_id: message.message_id, edit_date: message.edit_date };
  }
  async function reactByMember(chat, messageId, { user_id: userId, emoji }) {
    const user = requireUser(userId);
    const entry = chat.messages.get(Number(messageId));
    if (!entry || entry.deleted) {
      throw new TelegramError(400, "MESSAGE_ID_INVALID");
    }
    if (!isInChat(chat, user.id)) {
      throw new TelegramError(403, "CHAT_WRITE_FORBIDDEN");
    }
    return changeReaction(chat, entry, user, emoji ? [String(emoji)] : []);
  }
  function reactionList(emojis) {
    return emojis.map((emoji) => ({ type: "emoji", emoji }));
  }
  async function changeReaction(chat, entry, user, emojis) {
    entry.reactions ??= /* @__PURE__ */ new Map();
    const before = entry.reactions.get(user.id) ?? [];
    if (emojis.length) entry.reactions.set(user.id, emojis);
    else entry.reactions.delete(user.id);
    const admins = [...bots.values()].filter(
      (record) => ["administrator", "creator"].includes(
        memberStatus(chat, record.id).status
      )
    );
    await emit(
      "message_reaction",
      {
        chat: chatObject(chat),
        message_id: entry.message.message_id,
        user: userObject(user),
        date: now(),
        old_reaction: reactionList(before),
        new_reaction: reactionList(emojis)
      },
      { to: admins }
    );
    return { reactions: Object.fromEntries(entry.reactions) };
  }
  async function post(chat, {
    user_id: userId,
    text,
    photo_base64: photoBase64,
    media,
    caption,
    reply_to: replyTo,
    message_thread_id: threadId,
    forward_from: forwardFrom
  }, { mediaGroupId = null } = {}) {
    const user = requireUser(userId);
    requireTopic(chat, threadId);
    const type = photoBase64 ? "photo" : media?.type ?? null;
    if (type && type !== "photo" && !MEMBER_MEDIA[type]) {
      throw new TelegramError(
        400,
        `media type must be photo or one of ${Object.keys(MEMBER_MEDIA).join(", ")}`
      );
    }
    const permission = type === "photo" ? "can_send_photos" : type ? MEMBER_MEDIA[type].permission : "can_send_messages";
    if (chat.type !== "private" && !canPost(chat, userId, permission)) {
      throw new TelegramError(403, "CHAT_WRITE_FORBIDDEN");
    }
    const fields = {};
    if (type) {
      const bytes = Buffer.from(photoBase64 ?? media.base64 ?? "", "base64");
      const file = type === "photo" ? registerPhoto(bytes) : registerFile(bytes, `${type}s`, MEMBER_MEDIA[type].ext);
      Object.assign(
        fields,
        mediaFields(type, file, {
          fileName: media?.file_name,
          mimeType: media?.mime_type,
          duration: media?.duration
        })
      );
      if (caption && (type === "photo" || MEMBER_MEDIA[type].caption)) {
        fields.caption = String(caption);
        const captionEntities = messageEntities(fields.caption);
        if (captionEntities.length > 0)
          fields.caption_entities = captionEntities;
      }
    } else {
      fields.text = String(text ?? "");
    }
    if (mediaGroupId) fields.media_group_id = mediaGroupId;
    if (forwardFrom) fields.forward_origin = forwardOrigin(forwardFrom);
    const replied = replyTo != null ? chat.messages.get(Number(replyTo)) : threadId ? chat.messages.get(Number(threadId)) : null;
    if (replied) {
      const { reply_to_message: _nested, ...original } = replied.message;
      fields.reply_to_message = original;
    }
    if (threadId && chat.topics) {
      fields.message_thread_id = Number(threadId);
      fields.is_topic_message = true;
    }
    if (fields.text) {
      const entities = messageEntities(fields.text);
      if (entities.length > 0) fields.entities = entities;
    }
    const message = addMessage(chat, user, fields);
    await emit("message", message);
    return { message_id: message.message_id };
  }
  const LOGIN_ISSUER = "https://oauth.telegram.org";
  const LOGIN_CODE_TTL_MS = 6e4;
  const LOGIN_TOKEN_TTL_S = 3600;
  const loginKey = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const loginKid = `fake-${randomBytes(6).toString("hex")}`;
  const loginCodes = /* @__PURE__ */ new Map();
  const subjectSalt = randomBytes(16);
  function loginSubject(userId) {
    const digest = createHash("sha256").update(subjectSalt).update(String(userId)).digest();
    return (digest.readBigUInt64BE(0) % 10n ** 19n).toString();
  }
  function base64url(value) {
    return Buffer.from(value).toString("base64url");
  }
  function signIdToken(claims) {
    const header = { alg: "RS256", typ: "JWT", kid: loginKid };
    const input = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
    const signature = sign("sha256", Buffer.from(input), loginKey.privateKey);
    return `${input}.${signature.toString("base64url")}`;
  }
  function discoveryDocument() {
    return {
      issuer: LOGIN_ISSUER,
      authorization_endpoint: `${origin}/auth`,
      token_endpoint: `${origin}/token`,
      jwks_uri: `${origin}/.well-known/jwks.json`,
      response_types_supported: ["code"],
      token_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_post"
      ],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "phone", "profile", "telegram:bot_access"],
      claims_supported: [
        "aud",
        "preferred_username",
        "phone_number",
        "exp",
        "iat",
        "iss",
        "name",
        "picture",
        "sub"
      ],
      code_challenge_methods_supported: ["plain", "S256"],
      grant_types_supported: ["authorization_code"]
    };
  }
  function jwks() {
    return {
      keys: [
        {
          ...loginKey.publicKey.export({ format: "jwk" }),
          alg: "RS256",
          use: "sig",
          kid: loginKid
        }
      ]
    };
  }
  function loginRedirect(redirectUri, params) {
    const url = new URL(redirectUri);
    for (const [key, value] of Object.entries(params)) {
      if (value != null) url.searchParams.set(key, value);
    }
    return url.toString();
  }
  function loginRequest(query) {
    const clientId = String(query.get("client_id") ?? "");
    const record = [...bots.values()].find(
      (entry) => String(entry.id) === clientId
    );
    if (!record) return { error: "unknown client_id" };
    const redirectUri = query.get("redirect_uri") ?? "";
    try {
      new URL(redirectUri);
    } catch {
      return { error: "redirect_uri must be an absolute URL" };
    }
    if (query.get("response_type") !== "code") {
      return { error: 'response_type must be "code"' };
    }
    const scopes = String(query.get("scope") ?? "").split(/\s+/).filter(Boolean);
    if (!scopes.includes("openid")) {
      return { error: 'scope must include "openid"' };
    }
    const challenge = query.get("code_challenge");
    const method = query.get("code_challenge_method") ?? (challenge ? "plain" : null);
    if (challenge && method !== "S256" && method !== "plain") {
      return { error: 'code_challenge_method must be "S256" or "plain"' };
    }
    if (!challenge && query.get("code_challenge_method")) {
      return { error: "code_challenge_method without code_challenge" };
    }
    return {
      bot: record,
      redirectUri,
      scopes,
      state: query.get("state"),
      nonce: query.get("nonce"),
      challenge,
      method
    };
  }
  function approveLogin(request, user) {
    if (user.is_bot) throw new TelegramError(400, "a bot cannot log in");
    const code = randomBytes(24).toString("base64url");
    loginCodes.set(code, {
      ...request,
      userId: user.id,
      expiresAt: Date.now() + LOGIN_CODE_TTL_MS,
      used: false
    });
    return loginRedirect(request.redirectUri, { code, state: request.state });
  }
  function escapeHtml2(value) {
    return String(value).replace(
      /[&<>"']/g,
      (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
  }
  function loginPage(url, request) {
    const action = escapeHtml2(`/auth${url.search}`);
    const people = [...users.values()].filter((user) => !user.is_bot);
    const buttons = people.map(
      (user) => `<form method="post" action="${action}"><input type="hidden" name="user_id" value="${user.id}"><button>Log in as ${escapeHtml2(
        [user.first_name, user.last_name].filter(Boolean).join(" ")
      )}</button></form>`
    ).join("\n");
    return `<!doctype html><html><head><meta charset="utf-8"><title>Log in to ${escapeHtml2(
      request.bot.first_name
    )}</title></head><body><h1>Log in to ${escapeHtml2(request.bot.first_name)}</h1>
${buttons}
<form method="post" action="${action}"><input type="hidden" name="cancel" value="1"><button>Cancel</button></form>
</body></html>`;
  }
  function sendOAuthError(response, status, error, description, headers = {}) {
    response.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers
    });
    response.end(JSON.stringify({ error, error_description: description }));
  }
  function exchangeCode(request, body, response) {
    const form = new URLSearchParams(body.toString("utf8"));
    let clientId = form.get("client_id");
    let secret = form.get("client_secret");
    const basic = String(request.headers.authorization ?? "").match(
      /^Basic\s+(.+)$/i
    );
    if (basic) {
      const decoded = Buffer.from(basic[1], "base64").toString("utf8");
      const colon = decoded.indexOf(":");
      clientId = decodeURIComponent(decoded.slice(0, colon));
      secret = decodeURIComponent(decoded.slice(colon + 1));
    }
    const record = [...bots.values()].find(
      (entry) => String(entry.id) === String(clientId ?? "")
    );
    const expected = Buffer.from(record?.loginClientSecret ?? "");
    const given = Buffer.from(String(secret ?? ""));
    if (!record || expected.length !== given.length || !timingSafeEqual(expected, given)) {
      sendOAuthError(
        response,
        401,
        "invalid_client",
        "Client authentication failed",
        {
          "WWW-Authenticate": 'Basic realm="oauth.telegram.org"'
        }
      );
      return;
    }
    if (form.get("grant_type") !== "authorization_code") {
      sendOAuthError(
        response,
        400,
        "unsupported_grant_type",
        'grant_type must be "authorization_code"'
      );
      return;
    }
    const code = loginCodes.get(String(form.get("code") ?? ""));
    const invalid = (description) => sendOAuthError(response, 400, "invalid_grant", description);
    if (!code || code.bot.id !== record.id) return invalid("Unknown code");
    if (code.used) return invalid("The code was already used");
    code.used = true;
    if (Date.now() > code.expiresAt) return invalid("The code has expired");
    if (form.get("redirect_uri") !== code.redirectUri) {
      return invalid("redirect_uri does not match the authorization request");
    }
    if (code.challenge) {
      const verifier = String(form.get("code_verifier") ?? "");
      const derived = code.method === "S256" ? createHash("sha256").update(verifier).digest("base64url") : verifier;
      if (!verifier || derived !== code.challenge) {
        return invalid("code_verifier does not match the code_challenge");
      }
    }
    const user = requireUser(code.userId);
    const issuedAt = Math.floor(Date.now() / 1e3);
    const claims = {
      iss: LOGIN_ISSUER,
      aud: String(record.id),
      sub: loginSubject(user.id),
      iat: issuedAt,
      exp: issuedAt + LOGIN_TOKEN_TTL_S,
      ...code.nonce ? { nonce: code.nonce } : {}
    };
    if (code.scopes.includes("profile")) {
      Object.assign(claims, {
        id: user.id,
        name: [user.first_name, user.last_name].filter(Boolean).join(" "),
        given_name: user.first_name,
        ...user.last_name ? { family_name: user.last_name } : {},
        ...user.username ? { preferred_username: user.username } : {},
        ...user.photos?.length ? { picture: `${origin}/userpic/${user.id}.jpg` } : {}
      });
    }
    if (code.scopes.includes("telegram:bot_access")) {
      const chat = messageChat(user.id);
      chat.openTo ??= /* @__PURE__ */ new Set();
      chat.openTo.add(record.id);
    }
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    });
    response.end(
      JSON.stringify({
        access_token: randomBytes(24).toString("base64url"),
        token_type: "Bearer",
        expires_in: LOGIN_TOKEN_TTL_S,
        id_token: signIdToken(claims)
      })
    );
  }
  function serveLogin(request, url, body, response) {
    const path = url.pathname;
    if (path === "/.well-known/openid-configuration" && request.method === "GET") {
      send(response, 200, discoveryDocument());
      return true;
    }
    if (path === "/.well-known/jwks.json" && request.method === "GET") {
      send(response, 200, jwks());
      return true;
    }
    if (path === "/token" && request.method === "POST") {
      exchangeCode(request, body, response);
      return true;
    }
    const picture = path.match(/^\/userpic\/(\d+)\.jpg$/);
    if (picture && request.method === "GET") {
      const file = files.get(
        users.get(Number(picture[1]))?.photos?.[0]?.file_id
      );
      if (!file) {
        response.writeHead(404).end();
        return true;
      }
      response.writeHead(200, { "Content-Type": "image/jpeg" });
      response.end(file.data);
      return true;
    }
    if (path !== "/auth" || !["GET", "POST"].includes(request.method)) {
      return false;
    }
    const loginQuery = loginRequest(url.searchParams);
    if (loginQuery.error) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Login refused: ${loginQuery.error}`);
      return true;
    }
    if (request.method === "GET") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(loginPage(url, loginQuery));
      return true;
    }
    const form = new URLSearchParams(body.toString("utf8"));
    let location;
    if (form.get("cancel")) {
      location = loginRedirect(loginQuery.redirectUri, {
        error: "access_denied",
        state: loginQuery.state
      });
    } else {
      const user = users.get(Number(form.get("user_id")));
      if (!user || user.is_bot) {
        response.writeHead(400, {
          "Content-Type": "text/plain; charset=utf-8"
        });
        response.end("Login refused: unknown user");
        return true;
      }
      location = approveLogin(loginQuery, user);
    }
    response.writeHead(302, { Location: location });
    response.end();
    return true;
  }
  function send(response, status, payload) {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(payload));
  }
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const body = await readBody(request);
      if (url.pathname.startsWith("/_fake/")) {
        const parts = url.pathname.slice("/_fake/".length).split("/").filter(Boolean);
        try {
          const payload = body.length ? parseJsonObject(body) : {};
          send(response, 200, await control(request.method, parts, payload));
        } catch (error) {
          if (!(error instanceof TelegramError)) throw error;
          send(response, error.code, { error: error.message });
        }
        return;
      }
      const ownerCall = url.pathname.match(/^\/_owner\/([^/]+)\/([A-Za-z]+)$/);
      if (ownerCall && request.method === "POST") {
        const args = body.length ? parseJsonObject(body) : {};
        const answer = await ownerModel.rpc(
          decodeURIComponent(ownerCall[1]),
          ownerCall[2],
          args
        );
        if (answer.drop) {
          request.socket.destroy();
          return;
        }
        send(response, answer.status, answer.body);
        return;
      }
      if (serveLogin(request, url, body, response)) return;
      const file = url.pathname.match(/^\/file\/bot([^/]+)\/(.+)$/);
      if (file) {
        const entry = [...files.values()].find((f) => f.file_path === file[2]);
        if (!entry || !bots.has(file[1])) {
          response.writeHead(404).end();
          return;
        }
        response.writeHead(200, {
          "Content-Type": entry.file_path.startsWith("photos/") ? "image/jpeg" : "application/octet-stream"
        });
        response.end(entry.data);
        return;
      }
      const call = url.pathname.match(/^\/bot([^/]+)\/([A-Za-z]+)$/);
      if (!call) {
        send(response, 404, {
          ok: false,
          error_code: 404,
          description: "Not Found"
        });
        return;
      }
      const caller = bots.get(call[1]);
      if (!caller) {
        send(response, 401, {
          ok: false,
          error_code: 401,
          description: "Unauthorized"
        });
        return;
      }
      const method = call[2];
      let params;
      try {
        params = await readRequestParams(request, body);
      } catch (error) {
        if (!(error instanceof TelegramError)) throw error;
        send(response, error.code, {
          ok: false,
          error_code: error.code,
          description: error.message
        });
        return;
      }
      const addressed = chats.get(Number(params.chat_id));
      if (addressed?.migratedTo != null) {
        calls.push({
          method,
          bot_id: caller.id,
          params: summarize(params),
          at: Date.now(),
          failed: 400
        });
        send(response, 400, {
          ok: false,
          error_code: 400,
          description: "Bad Request: group chat was upgraded to a supergroup chat",
          parameters: { migrate_to_chat_id: addressed.migratedTo }
        });
        return;
      }
      const failure = takeFailure(method, caller, params);
      calls.push({
        method,
        bot_id: caller.id,
        params: summarize(params),
        at: Date.now(),
        ...failure ? failure.drop_after_apply ? { dropped: true } : { failed: failure.error_code } : {}
      });
      if (failure && !failure.drop_after_apply) {
        send(response, failure.error_code, {
          ok: false,
          error_code: failure.error_code,
          description: failure.description,
          ...failure.retry_after != null ? { parameters: { retry_after: failure.retry_after } } : {}
        });
        return;
      }
      const handler = methodsByLowerName.get(method.toLowerCase());
      if (!handler) {
        if (!unimplemented.has(method)) {
          unimplemented.add(method);
          log(`unimplemented Bot API method ${method}`);
        }
        if (unimplementedMode === "ok") {
          send(response, 200, { ok: true, result: true });
        } else {
          send(response, 404, {
            ok: false,
            error_code: 404,
            description: `Not Found: method ${method} is not implemented by telegram-bot-test-server`
          });
        }
        return;
      }
      try {
        const result = await handler(params, caller);
        if (failure?.drop_after_apply) {
          request.socket.destroy();
          return;
        }
        send(response, 200, { ok: true, result });
      } catch (error) {
        if (!(error instanceof TelegramError)) throw error;
        send(response, error.code, {
          ok: false,
          error_code: error.code,
          description: error.message,
          ...error.parameters ? { parameters: error.parameters } : {}
        });
      }
    } catch (error) {
      log(`internal error: ${error.stack ?? error.message}`);
      send(response, 500, {
        ok: false,
        error_code: 500,
        description: error.message
      });
    }
  });
  function takeFailure(method, caller, params) {
    const index = failures.findIndex(
      (rule2) => rule2.method.toLowerCase() === method.toLowerCase() && (rule2.chat_id === null || rule2.chat_id === String(params.chat_id)) && (rule2.bot_id === null || rule2.bot_id === caller.id)
    );
    if (index < 0) return null;
    const rule = failures[index];
    rule.remaining -= 1;
    if (rule.remaining <= 0) failures.splice(index, 1);
    return rule;
  }
  function summarize(params) {
    const out = {};
    for (const [key, value] of Object.entries(params)) {
      out[key] = Buffer.isBuffer(value) ? `<${value.length} bytes>` : value;
    }
    return out;
  }
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  const origin = `http://${host.includes(":") ? `[${host}]` : host}:${address.port}`;
  async function act(method, path, body = {}) {
    try {
      return await control(method, path.split("/"), body);
    } catch (error) {
      if (error instanceof TelegramError) throw new Error(error.message);
      throw error;
    }
  }
  const inviteHash = (link) => encodeURIComponent(link.replace(/^https:\/\/t\.me\/\+/, ""));
  return {
    origin,
    addBot: ({ token, username, firstName, supportsJoinRequestQueries: supportsJoinRequestQueries2 } = {}) => act("POST", "bots", {
      token,
      username,
      first_name: firstName,
      supports_join_request_queries: supportsJoinRequestQueries2 === true
    }),
    createChat: async ({ title, type, ownerId, ownerName, isForum } = {}) => (await act("POST", "chats", {
      title,
      type,
      owner_id: ownerId,
      owner_name: ownerName,
      is_forum: isForum
    })).id,
    getChat: (chatId) => act("GET", `chats/${chatId}`),
    addBotViaLink: (chatId, botId, { by, startParameter, rights } = {}) => act("POST", `chats/${chatId}/bots`, {
      bot_id: botId,
      start_parameter: startParameter ?? "",
      ...by != null ? { by } : {},
      ...rights ? { rights } : {}
    }),
    migrateToSupergroup: async (chatId, { by } = {}) => (await act("POST", `chats/${chatId}/migrate`, by != null ? { by } : {})).id,
    renameChat: (chatId, { by, title } = {}) => act("POST", `chats/${chatId}/title`, { by, title }),
    changeChatPhoto: (chatId, { by, bytes } = {}) => act("POST", `chats/${chatId}/photo`, {
      by,
      base64: Buffer.from(bytes ?? []).toString("base64")
    }),
    setBotMembership: (chatId, botId, { status, rights, by } = {}) => act("POST", `chats/${chatId}/bots`, {
      bot_id: botId,
      status,
      rights,
      by
    }),
    createTopic: async (chatId, name, { by } = {}) => (await act("POST", `chats/${chatId}/topics`, { name, by })).message_thread_id,
    renameTopic: (chatId, threadId, name, { by } = {}) => act("POST", `chats/${chatId}/topics/${threadId}/edit`, { name, by }),
    failNext: (rule) => act("POST", "failures", {
      method: rule.method,
      chat_id: rule.chatId,
      bot_id: rule.botId,
      times: rule.times,
      error_code: rule.errorCode,
      description: rule.description,
      retry_after: rule.retryAfter,
      drop_after_apply: rule.dropAfterApply === true
    }),
    clearFailures: () => act("DELETE", "failures"),
    createUser: async (fields = {}) => (await act("POST", "users", fields)).id,
    createOwner: ({ userId, firstName, lastName, username } = {}) => act("POST", "owners", {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      username
    }),
    updateOwner: (ownerId, { authorized } = {}) => act("POST", `owners/${ownerId}`, { authorized }),
    getOwner: (ownerId) => act("GET", `owners/${ownerId}`),
    addOwnerUser: (ownerId, { id, firstName, lastName, username, bot: bot2 } = {}) => act("POST", `owners/${ownerId}/users`, {
      id,
      first_name: firstName,
      last_name: lastName,
      username,
      bot: bot2
    }),
    addOwnerDialog: (ownerId, fields = {}) => act("POST", `owners/${ownerId}/dialogs`, {
      kind: fields.kind,
      id: fields.id,
      title: fields.title,
      first_name: fields.firstName,
      last_name: fields.lastName,
      username: fields.username,
      participants_count: fields.participantsCount,
      folder: fields.folder,
      pinned: fields.pinned,
      muted: fields.muted,
      mute_until: fields.muteUntil,
      unread_count: fields.unreadCount,
      date: fields.date
    }),
    updateOwnerDialog: (ownerId, peerId, fields = {}) => act("POST", `owners/${ownerId}/dialogs/${peerId}`, {
      folder: fields.folder,
      pinned: fields.pinned,
      muted: fields.muted,
      mute_until: fields.muteUntil,
      unread_count: fields.unreadCount
    }),
    addOwnerMessages: (ownerId, peerId, messages) => act("POST", `owners/${ownerId}/dialogs/${peerId}/messages`, {
      messages: messages.map((message) => ({
        id: message.id,
        date: message.date,
        from_id: message.fromId,
        out: message.out,
        text: message.text,
        action: message.action,
        reply_to: message.replyTo,
        media: message.media,
        edit_date: message.editDate
      }))
    }),
    editOwnerMessage: (ownerId, peerId, messageId, { text, editDate } = {}) => act("POST", `owners/${ownerId}/dialogs/${peerId}/messages/${messageId}`, {
      text,
      edit_date: editDate
    }),
    deleteOwnerMessage: (ownerId, peerId, messageId) => act(
      "DELETE",
      `owners/${ownerId}/dialogs/${peerId}/messages/${messageId}`
    ),
    setOwnerFilter: (ownerId, filter) => act("POST", `owners/${ownerId}/filters`, {
      id: filter.id,
      title: filter.title,
      emoticon: filter.emoticon,
      color: filter.color,
      include_peers: filter.includePeers,
      exclude_peers: filter.excludePeers,
      pinned_peers: filter.pinnedPeers,
      contacts: filter.contacts,
      non_contacts: filter.nonContacts,
      groups: filter.groups,
      broadcasts: filter.broadcasts,
      bots: filter.bots,
      exclude_muted: filter.excludeMuted,
      exclude_read: filter.excludeRead,
      exclude_archived: filter.excludeArchived
    }),
    orderOwnerFilters: (ownerId, ids) => act("POST", `owners/${ownerId}/filters/order`, { ids }),
    deleteOwnerFilter: (ownerId, filterId) => act("DELETE", `owners/${ownerId}/filters/${filterId}`),
    failOwnerCall: (ownerId, fault) => act("POST", `owners/${ownerId}/faults`, {
      method: fault.method,
      peer_id: fault.peerId,
      times: fault.times,
      delay_ms: fault.delayMs,
      preset: fault.preset,
      seconds: fault.seconds,
      error_message: fault.errorMessage,
      code: fault.code
    }),
    clearOwnerFaults: (ownerId) => act("DELETE", `owners/${ownerId}/faults`),
    getOwnerCalls: (ownerId) => act("GET", `owners/${ownerId}/calls`),
    resetOwners: () => act("DELETE", "owners"),
    approveLogin: async (authUrl, userId) => (await act("POST", "login/approve", {
      auth_url: authUrl,
      user_id: userId
    })).redirect_url,
    cancelLogin: async (authUrl) => (await act("POST", "login/cancel", { auth_url: authUrl })).redirect_url,
    connectBusiness: ({ ownerId, rights, id, isEnabled, botId } = {}) => act("POST", "business/connections", {
      owner_id: ownerId,
      rights,
      ...id != null ? { id } : {},
      ...isEnabled !== void 0 ? { is_enabled: isEnabled } : {},
      ...botId != null ? { bot_id: botId } : {}
    }),
    getBusinessConnection: (connectionId) => act("GET", `business/connections/${connectionId}`),
    sayInBusinessChat: (connectionId, userId, sender, text) => act(
      "POST",
      `business/connections/${connectionId}/chats/${userId}/messages`,
      { sender, text }
    ),
    getBusinessChat: (connectionId, userId) => act(
      "GET",
      `business/connections/${connectionId}/chats/${userId}/messages`
    ),
    redeliverUpdate: (updateId2) => act("POST", `updates/${updateId2}/redeliver`),
    updateProfile: (userId, fields) => act("POST", `users/${userId}/profile`, fields),
    addProfilePhoto: (userId, bytes) => act("POST", `users/${userId}/photos`, {
      base64: Buffer.from(bytes).toString("base64")
    }),
    join: (chatId, userId) => act("POST", `chats/${chatId}/join`, { user_id: userId }),
    joinByLink: (inviteLink, userId) => act("POST", `invites/${inviteHash(inviteLink)}/join`, {
      user_id: userId
    }),
    leave: (chatId, userId) => act("POST", `chats/${chatId}/leave`, { user_id: userId }),
    post: async (chatId, userId, message) => {
      const fields = postedMessageBody(message);
      return (await act("POST", `chats/${chatId}/messages`, {
        user_id: userId,
        ...fields
      })).message_id;
    },
    postAlbum: async (chatId, userId, items, { threadId } = {}) => act("POST", `chats/${chatId}/albums`, {
      user_id: userId,
      items: items.map((item) => ({
        type: item.type,
        base64: Buffer.from(item.bytes ?? []).toString("base64"),
        ...item.caption ? { caption: item.caption } : {}
      })),
      ...threadId != null ? { message_thread_id: threadId } : {}
    }),
    editMessage: (chatId, messageId, userId, { text, caption } = {}) => act("POST", `chats/${chatId}/messages/${messageId}/edit`, {
      user_id: userId,
      text,
      caption
    }),
    react: (chatId, messageId, userId, emoji = null) => act("POST", `chats/${chatId}/messages/${messageId}/reactions`, {
      user_id: userId,
      emoji
    }),
    pressButton: (chatId, messageId, userId, data) => act("POST", `chats/${chatId}/messages/${messageId}/callback`, {
      user_id: userId,
      data
    }),
    sendDirectMessage: async (userId, message) => (await act("POST", `users/${userId}/dm`, postedMessageBody(message))).message_id,
    postGuestBotReply: async (chatId, callerUserId, botUsername2, text) => (await act("POST", `chats/${chatId}/guest-bot-reply`, {
      caller_user_id: callerUserId,
      bot_username: botUsername2,
      text
    })).message_id,
    pressDirectButton: (userId, messageId, data) => act("POST", `users/${userId}/dm/${messageId}/callback`, { data }),
    getMessages: (chatId) => act("GET", `chats/${chatId}/messages`),
    getMessage: (chatId, messageId) => act("GET", `chats/${chatId}/messages/${messageId}`),
    getDirectMessages: (userId) => act("GET", `users/${userId}/dm`),
    getMember: (chatId, userId) => act("GET", `chats/${chatId}/members/${userId}`),
    getJoinRequests: (chatId) => act("GET", `chats/${chatId}/join-requests`),
    getCalls: () => act("GET", "calls"),
    stop: () => new Promise((resolve) => {
      for (const record of bots.values()) wakePollers(record);
      for (const abort of inFlight) abort.abort();
      server.close(() => resolve());
      server.closeAllConnections();
    })
  };
}

// ../@emulators/telegram/dist/index.js
import { randomUUID } from "crypto";
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
function renderJsonDetails(label, value, open2 = false) {
  const text = JSON.stringify(value, null, 2) ?? "";
  const bounded2 = text.length > 65536 ? `${text.slice(0, 65536)}
[remaining data omitted from preview]` : text;
  return `<details class="inspector-detail"${open2 ? " open" : ""}><summary>${escapeHtml(label)}</summary><pre class="inspector-json">${escapeHtml(bounded2)}</pre></details>`;
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
var TelegramBackendError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TelegramBackendError";
  }
};
var createTestServerBackend = async (primaryBot) => {
  const server = await startTestServer({
    botToken: primaryBot.token,
    botUsername: primaryBot.username,
    botName: primaryBot.first_name ?? primaryBot.username,
    port: 0,
    host: "127.0.0.1",
    log: () => {
    }
  });
  const fakeControl = async (method, path) => {
    const response = await fetch(`${server.origin}/_fake/${path}`, { method });
    const payload = await response.json();
    if (!response.ok) throw new TelegramBackendError(payload.error ?? `telegram backend ${method} ${path} failed`);
    return payload;
  };
  const backend = {
    origin: server.origin,
    async addBot(bot) {
      const added = await server.addBot({ token: bot.token, username: bot.username, firstName: bot.first_name });
      return { id: added.id, username: added.username };
    },
    createUser: (user) => server.createUser(user),
    createChat: (chat) => server.createChat({ title: chat.title, type: chat.type, ownerId: chat.owner_id, isForum: chat.forum }),
    async setBotMembership(chatId, botId, membership) {
      await server.setBotMembership(chatId, botId, membership);
    },
    async join(chatId, userId) {
      await server.join(chatId, userId);
    },
    createTopic: (chatId, name, by) => server.createTopic(chatId, name, { by }),
    async renameTopic(chatId, threadId, name, by) {
      await server.renameTopic(chatId, threadId, name, { by });
    },
    listTopics: (chatId) => fakeControl("GET", `chats/${chatId}/topics`),
    async chatOwner(chatId) {
      const chat = await server.getChat(chatId);
      const creator = chat.members.find((member) => member.status === "creator");
      if (!creator) throw new Error(`telegram chat ${chatId} has no creator`);
      return creator.user_id;
    },
    post: (chatId, userId, message) => server.post(chatId, userId, postedMessage(message)),
    sendDirectMessage: (userId, message) => server.sendDirectMessage(userId, postedMessage(message)),
    async editMessage(chatId, messageId, userId, edit) {
      await server.editMessage(chatId, messageId, userId, edit);
    },
    async react(chatId, messageId, userId, emoji) {
      await server.react(chatId, messageId, userId, emoji);
    },
    pressButton: (chatId, messageId, userId, data) => server.pressButton(chatId, messageId, userId, data),
    pressDirectButton: (userId, messageId, data) => server.pressDirectButton(userId, messageId, data),
    getMessages: (chatId) => server.getMessages(chatId),
    getDirectMessages: (userId) => server.getDirectMessages(userId),
    getCalls: () => server.getCalls(),
    stop: () => server.stop()
  };
  return refusalsAsBackendErrors(backend);
};
function postedMessage(message) {
  const { media } = message;
  return {
    text: message.text,
    caption: message.caption,
    replyTo: message.reply_to,
    threadId: message.thread_id,
    ...media?.type === "photo" ? { photo: media.bytes } : {},
    ...media && media.type !== "photo" ? { media: { type: media.type, bytes: media.bytes, fileName: media.file_name, mimeType: media.mime_type } } : {}
  };
}
function refusalsAsBackendErrors(backend) {
  const wrapped = { origin: backend.origin };
  for (const key of Object.keys(backend)) {
    const value = backend[key];
    if (typeof value !== "function" || key === "stop") {
      Object.assign(wrapped, { [key]: value });
      continue;
    }
    Object.assign(wrapped, {
      [key]: async (...args) => {
        try {
          return await value(...args);
        } catch (error) {
          if (error instanceof Error && !(error instanceof TelegramBackendError)) {
            throw new TelegramBackendError(error.message);
          }
          throw error;
        }
      }
    });
  }
  return wrapped;
}
var BotApiError = class extends Error {
  constructor(errorCode, description) {
    super(description);
    this.errorCode = errorCode;
    this.description = description;
  }
};
var BOT_METHOD_PATH = /^\/bot([^/]+)\/([A-Za-z]+)$/;
var FILE_PATH = /^\/file\/bot([^/]+)\/(.+)$/;
var DEFAULT_TOPIC_ICON_COLOR = 7322096;
var DESCRIPTION_LIMIT = 512;
var SHORT_DESCRIPTION_LIMIT = 120;
var FORUM_TOPIC_ICON_STICKERS = [
  ["5312536423851630001", "\u{1F4A1}"],
  ["5312016608254762256", "\u2764"],
  ["5377544228505134960", "\u{1F4CA}"],
  ["5309965701241379366", "\u{1F4F0}"]
].map(([customEmojiId, emoji], index) => ({
  file_id: `CAACAgIAAxUAAWfakeTopicIcon${index}`,
  file_unique_id: `AgADfakeTopicIcon${index}`,
  type: "custom_emoji",
  width: 512,
  height: 512,
  is_animated: false,
  is_video: false,
  emoji,
  custom_emoji_id: customEmojiId
}));
var ADAPTER_METHODS = {
  getForumTopicIconStickers: async () => FORUM_TOPIC_ICON_STICKERS,
  async createForumTopic(world, _botId, params) {
    const chatId = requireChatId(params);
    const name = requireString(params, "name");
    const owner = await backendCall(() => world.backend.chatOwner(chatId));
    const threadId = await backendCall(() => world.backend.createTopic(chatId, name, owner));
    const iconColor = params.icon_color === void 0 ? DEFAULT_TOPIC_ICON_COLOR : Number(params.icon_color);
    const iconCustomEmojiId = optionalString(params, "icon_custom_emoji_id");
    world.topicMeta.set(topicKey(chatId, threadId), {
      icon_color: iconColor,
      ...iconCustomEmojiId ? { icon_custom_emoji_id: iconCustomEmojiId } : {}
    });
    return {
      message_thread_id: threadId,
      name,
      icon_color: iconColor,
      ...iconCustomEmojiId ? { icon_custom_emoji_id: iconCustomEmojiId } : {}
    };
  },
  async editForumTopic(world, _botId, params) {
    const chatId = requireChatId(params);
    const threadId = requireInteger(params, "message_thread_id");
    const topics = await backendCall(() => world.backend.listTopics(chatId));
    if (!topics.some((topic) => topic.message_thread_id === threadId)) {
      throw new BotApiError(400, "Bad Request: TOPIC_ID_INVALID");
    }
    const name = optionalString(params, "name");
    if (name !== void 0) {
      const owner = await backendCall(() => world.backend.chatOwner(chatId));
      await backendCall(() => world.backend.renameTopic(chatId, threadId, name, owner));
    }
    const iconCustomEmojiId = optionalString(params, "icon_custom_emoji_id");
    if (iconCustomEmojiId !== void 0) {
      const key = topicKey(chatId, threadId);
      const meta = world.topicMeta.get(key) ?? { icon_color: DEFAULT_TOPIC_ICON_COLOR };
      world.topicMeta.set(key, { ...meta, icon_custom_emoji_id: iconCustomEmojiId || void 0 });
    }
    return true;
  },
  setMyDescription: async (world, botId, params) => setProfileText(world, botId, params, "description", DESCRIPTION_LIMIT),
  getMyDescription: async (world, botId, params) => ({
    description: profileText(world, botId, params, "description")
  }),
  setMyShortDescription: async (world, botId, params) => setProfileText(world, botId, params, "short_description", SHORT_DESCRIPTION_LIMIT),
  getMyShortDescription: async (world, botId, params) => ({
    short_description: profileText(world, botId, params, "short_description")
  })
};
var TELEGRAM_ADAPTER_METHODS = Object.freeze(Object.keys(ADAPTER_METHODS));
function botApiRoutes(app, runtime, controlRoutes2) {
  for (const httpMethod of ["GET", "POST"]) {
    app.on(httpMethod, "/*", async (c, next) => {
      const path = new URL(c.req.url).pathname;
      const method = BOT_METHOD_PATH.exec(path);
      if (method) return handleBotMethod(c, runtime, decodeURIComponent(method[1]), method[2]);
      if (FILE_PATH.test(path)) return proxy(c, await runtime.world(), path);
      if (path.startsWith("/_telegram/")) {
        return c.json({ error: `no control route ${httpMethod} ${path}`, routes: controlRoutes2 }, 404);
      }
      return next();
    });
  }
}
async function handleBotMethod(c, runtime, token, method) {
  const world = await runtime.world();
  const handler = ADAPTER_METHODS[method];
  if (!handler) return proxy(c, world, new URL(c.req.url).pathname);
  const botId = world.botIdsByToken.get(token);
  if (botId === void 0) return botError(c, new BotApiError(401, "Unauthorized"));
  try {
    const params = await readParams(c);
    world.adapterCalls.push({ method, bot_id: botId, params, at: Date.now() });
    return c.json({ ok: true, result: await handler(world, botId, params) });
  } catch (error) {
    if (error instanceof BotApiError) return botError(c, error);
    throw error;
  }
}
async function proxy(c, world, path) {
  const incoming = new URL(c.req.url);
  const headers = new Headers();
  const contentType = c.req.header("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  const hasBody = c.req.method !== "GET" && c.req.method !== "HEAD";
  let body = hasBody ? await c.req.arrayBuffer() : void 0;
  if (body && contentType?.includes("multipart/form-data")) {
    body = await inlineAttachedFiles(body, contentType);
    headers.delete("Content-Type");
  }
  const upstream = await fetch(`${world.backend.origin}${path}${incoming.search}`, {
    method: c.req.method,
    headers,
    body
  });
  const responseHeaders = new Headers();
  for (const name of ["Content-Type", "Content-Length", "Content-Disposition", "Retry-After"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
async function inlineAttachedFiles(body, contentType) {
  const form = await new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body
  }).formData();
  const out = new FormData();
  const moved = /* @__PURE__ */ new Set();
  for (const value of form.values()) {
    if (typeof value !== "string" || !value.startsWith("attach://")) continue;
    const part = form.get(value.slice("attach://".length));
    if (part && typeof part !== "string") moved.add(value.slice("attach://".length));
  }
  for (const [key, value] of form.entries()) {
    if (moved.has(key)) continue;
    const attached = typeof value === "string" && value.startsWith("attach://") ? form.get(value.slice(9)) : null;
    if (attached && typeof attached !== "string") out.append(key, attached, attached.name);
    else out.append(key, value);
  }
  return out;
}
async function readParams(c) {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  if (c.req.method === "GET" || c.req.method === "HEAD") return params;
  const contentType = c.req.header("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await c.req.text();
    if (!text) return params;
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BotApiError(400, "Bad Request: request body must be a JSON object");
    }
    return { ...params, ...body };
  }
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return { ...params, ...await c.req.parseBody() };
  }
  return params;
}
function botError(c, error) {
  return c.json(
    { ok: false, error_code: error.errorCode, description: error.description },
    error.errorCode
  );
}
async function backendCall(call) {
  try {
    return await call();
  } catch (error) {
    if (!(error instanceof TelegramBackendError)) throw error;
    throw new BotApiError(
      400,
      error.message.startsWith("Bad Request") ? error.message : `Bad Request: ${error.message}`
    );
  }
}
function requireChatId(params) {
  const value = params.chat_id;
  if (value === void 0 || value === "") throw new BotApiError(400, "Bad Request: chat_id is empty");
  const chatId = Number(value);
  if (!Number.isInteger(chatId)) throw new BotApiError(400, "Bad Request: chat not found");
  return chatId;
}
function requireInteger(params, field) {
  const value = Number(params[field]);
  if (params[field] === void 0 || !Number.isInteger(value)) {
    throw new BotApiError(400, `Bad Request: ${field} is invalid`);
  }
  return value;
}
function requireString(params, field) {
  const value = optionalString(params, field);
  if (!value) throw new BotApiError(400, `Bad Request: ${field} is empty`);
  return value;
}
function optionalString(params, field) {
  const value = params[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string") throw new BotApiError(400, `Bad Request: ${field} must be a string`);
  return value;
}
function topicKey(chatId, threadId) {
  return `${chatId}:${threadId}`;
}
function setProfileText(world, botId, params, field, limit) {
  const value = optionalString(params, field) ?? "";
  if (value.length > limit) throw new BotApiError(400, `Bad Request: ${field.toUpperCase()}_TOO_LONG`);
  const language = optionalString(params, "language_code") ?? "";
  const profile = world.profiles.get(botId);
  if (!profile) throw new Error(`telegram bot ${botId} has no profile`);
  if (value) profile[field][language] = value;
  else delete profile[field][language];
  return true;
}
function profileText(world, botId, params, field) {
  const language = optionalString(params, "language_code") ?? "";
  const profile = world.profiles.get(botId);
  if (!profile) throw new Error(`telegram bot ${botId} has no profile`);
  return profile[field][language] ?? profile[field][""] ?? "";
}
var ControlError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
var MEDIA_TYPES = /* @__PURE__ */ new Set([
  "photo",
  "video",
  "animation",
  "sticker",
  "voice",
  "audio",
  "video_note",
  "document"
]);
function controlRoutes(app, runtime) {
  const route = (handler) => async (c) => {
    try {
      const world = await runtime.world();
      const body = c.req.method === "GET" ? {} : await readJson(c);
      return c.json(await handler(world, c, body));
    } catch (error) {
      if (error instanceof ControlError) return c.json({ error: error.message }, error.status);
      if (error instanceof TelegramBackendError) return c.json({ error: error.message }, 400);
      throw error;
    }
  };
  const routes = [];
  const get = (path, handler) => {
    routes.push(`GET ${path}`);
    app.get(path, handler);
  };
  const post = (path, handler) => {
    routes.push(`POST ${path}`);
    app.post(path, handler);
  };
  get(
    "/_telegram/ids",
    route(async (world) => world.ids)
  );
  post(
    "/_telegram/users",
    route(async (world, _c, body) => {
      const name = requireString2(body, "name");
      if (world.ids.users[name] !== void 0) throw new ControlError(400, `user ${name} already exists`);
      const id = await world.backend.createUser({
        first_name: optionalString2(body, "first_name") ?? name,
        last_name: optionalString2(body, "last_name"),
        username: optionalString2(body, "username"),
        language_code: optionalString2(body, "language_code"),
        is_premium: body.is_premium === true
      });
      world.ids.users[name] = id;
      return { id };
    })
  );
  post(
    "/_telegram/chats/:chat/topics",
    route(async (world, c, body) => {
      const chatId = chatRef(world, c.req.param("chat"));
      const name = requireString2(body, "name");
      const by = body.by === void 0 ? await world.backend.chatOwner(chatId) : userRef(world, body.by);
      const threadId = await world.backend.createTopic(chatId, name, by);
      const chatName = Object.entries(world.ids.chats).find(([, id]) => id === chatId)?.[0];
      if (chatName) (world.ids.topics[chatName] ??= {})[name] = threadId;
      return { message_thread_id: threadId };
    })
  );
  post(
    "/_telegram/chats/:chat/members",
    route(async (world, c, body) => {
      await world.backend.join(chatRef(world, c.req.param("chat")), userRef(world, body.user));
      return { ok: true };
    })
  );
  post(
    "/_telegram/chats/:chat/messages",
    route(async (world, c, body) => {
      const chatId = chatRef(world, c.req.param("chat"));
      const messageId = await world.backend.post(chatId, userRef(world, body.from), postedMessage2(world, chatId, body));
      return { message_id: messageId };
    })
  );
  get(
    "/_telegram/chats/:chat/messages",
    route(async (world, c) => world.backend.getMessages(chatRef(world, c.req.param("chat"))))
  );
  post(
    "/_telegram/chats/:chat/messages/:message/edit",
    route(async (world, c, body) => {
      await world.backend.editMessage(
        chatRef(world, c.req.param("chat")),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        { text: optionalString2(body, "text"), caption: optionalString2(body, "caption") }
      );
      return { ok: true };
    })
  );
  post(
    "/_telegram/chats/:chat/messages/:message/reactions",
    route(async (world, c, body) => {
      const emoji = body.emoji === null ? null : requireString2(body, "emoji");
      await world.backend.react(
        chatRef(world, c.req.param("chat")),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        emoji
      );
      return { ok: true };
    })
  );
  post(
    "/_telegram/chats/:chat/messages/:message/buttons",
    route(
      async (world, c, body) => world.backend.pressButton(
        chatRef(world, c.req.param("chat")),
        integer(c.req.param("message"), "message"),
        userRef(world, body.from),
        requireString2(body, "data")
      )
    )
  );
  post(
    "/_telegram/users/:user/messages",
    route(async (world, c, body) => ({
      message_id: await world.backend.sendDirectMessage(
        userRef(world, c.req.param("user")),
        postedMessage2(world, void 0, body)
      )
    }))
  );
  get(
    "/_telegram/users/:user/messages",
    route(async (world, c) => world.backend.getDirectMessages(userRef(world, c.req.param("user"))))
  );
  post(
    "/_telegram/users/:user/messages/:message/buttons",
    route(
      async (world, c, body) => world.backend.pressDirectButton(
        userRef(world, c.req.param("user")),
        integer(c.req.param("message"), "message"),
        requireString2(body, "data")
      )
    )
  );
  get(
    "/_telegram/calls",
    route(async (world) => {
      const { calls, unimplemented } = await world.backend.getCalls();
      return {
        calls: [...calls.slice(world.seedCallCount), ...world.adapterCalls].sort((a, b) => a.at - b.at),
        unimplemented
      };
    })
  );
  return routes;
}
async function readJson(c) {
  const text = await c.req.text();
  if (!text) return {};
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ControlError(400, "request body must be a JSON object");
  }
  return body;
}
function postedMessage2(world, chatId, body) {
  const media = body.media === void 0 ? void 0 : mediaRef(body.media);
  const text = optionalString2(body, "text");
  if (text === void 0 && !media) throw new ControlError(400, "message needs text or media");
  return {
    text,
    caption: optionalString2(body, "caption"),
    reply_to: body.reply_to === void 0 ? void 0 : integer(body.reply_to, "reply_to"),
    thread_id: chatId === void 0 ? void 0 : threadRef(world, chatId, body.topic),
    media
  };
}
function mediaRef(value) {
  if (!value || typeof value !== "object") throw new ControlError(400, "media must be an object");
  const media = value;
  const type = media.type;
  if (!MEDIA_TYPES.has(type)) throw new ControlError(400, `media.type must be one of ${[...MEDIA_TYPES].join(", ")}`);
  const base64 = requireString2(media, "base64");
  return {
    type,
    bytes: Buffer.from(base64, "base64"),
    file_name: optionalString2(media, "file_name"),
    mime_type: optionalString2(media, "mime_type")
  };
}
function threadRef(world, chatId, topic) {
  if (topic === void 0) return void 0;
  if (typeof topic === "number") return topic;
  if (typeof topic !== "string") throw new ControlError(400, "topic must be a thread id or topic name");
  const chatName = Object.entries(world.ids.chats).find(([, id]) => id === chatId)?.[0];
  const threadId = chatName ? world.ids.topics[chatName]?.[topic] : void 0;
  if (threadId === void 0) throw new ControlError(404, `unknown topic ${topic}`);
  return threadId;
}
function chatRef(world, ref) {
  const named = world.ids.chats[ref];
  if (named !== void 0) return named;
  const id = Number(ref);
  if (!Number.isInteger(id)) throw new ControlError(404, `unknown chat ${ref}`);
  return id;
}
function userRef(world, ref) {
  if (typeof ref === "number") return ref;
  if (typeof ref !== "string" || !ref) throw new ControlError(400, "user reference is required");
  const named = world.ids.users[ref];
  if (named !== void 0) return named;
  const id = Number(ref);
  if (!Number.isInteger(id)) throw new ControlError(404, `unknown user ${ref}`);
  return id;
}
function integer(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number)) throw new ControlError(400, `${field} must be an integer`);
  return number;
}
function requireString2(body, field) {
  const value = optionalString2(body, field);
  if (!value) throw new ControlError(400, `${field} is required`);
  return value;
}
function optionalString2(body, field) {
  const value = body[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string") throw new ControlError(400, `${field} must be a string`);
  return value;
}
var DEFAULT_TELEGRAM_BOT = {
  token: "1000000001:emulate-telegram-bot-token",
  username: "emulate_bot",
  first_name: "Emulate Bot"
};
var DEFAULT_TELEGRAM_USER = {
  name: "developer",
  first_name: "Developer",
  username: "developer"
};
var SEED_KEY = "telegram.seed";
var GENERATION_KEY = "telegram.generation";
function writeTelegramSeed(store, seed) {
  store.setData(SEED_KEY, seed);
  store.setData(GENERATION_KEY, randomUUID());
}
function readTelegramSeed(store) {
  const seed = store.getData(SEED_KEY);
  if (!seed) throw new Error("telegram emulator was not seeded");
  return seed;
}
function botIdFromToken(token) {
  const match = /^(\d+):[A-Za-z0-9_-]+$/.exec(token);
  if (!match) throw new Error(`telegram bot token ${token} must look like <numeric id>:<secret>`);
  return Number(match[1]);
}
var TelegramRuntime = class {
  constructor(store, createBackend) {
    this.store = store;
    this.createBackend = createBackend;
  }
  current;
  currentGeneration;
  world() {
    const generation = this.store.getData(GENERATION_KEY);
    if (!generation) throw new Error("telegram emulator was not seeded");
    if (this.current && this.currentGeneration === generation) return this.current;
    const previous = this.current;
    this.currentGeneration = generation;
    this.current = (async () => {
      if (previous) await (await previous.catch(() => void 0))?.backend.stop();
      return buildWorld(generation, readTelegramSeed(this.store), this.createBackend);
    })();
    return this.current;
  }
  async close() {
    const current = this.current;
    this.current = void 0;
    this.currentGeneration = void 0;
    if (current) await (await current.catch(() => void 0))?.backend.stop();
  }
};
async function buildWorld(generation, seed, createBackend) {
  const primary = seed.bots[0];
  if (!primary) throw new Error("telegram seed needs at least one bot");
  const backend = await createBackend(primary);
  try {
    const ids = { bots: {}, users: {}, chats: {}, topics: {} };
    const botIdsByToken = /* @__PURE__ */ new Map();
    const profiles = /* @__PURE__ */ new Map();
    for (const bot of seed.bots) {
      if (ids.bots[bot.username] !== void 0) throw new Error(`telegram seed bot ${bot.username} is listed twice`);
      const id = bot === primary ? botIdFromToken(bot.token) : (await backend.addBot(bot)).id;
      ids.bots[bot.username] = id;
      botIdsByToken.set(bot.token, id);
      profiles.set(id, {
        description: bot.description === void 0 ? {} : { "": bot.description },
        short_description: bot.short_description === void 0 ? {} : { "": bot.short_description }
      });
    }
    for (const user of seed.users) {
      if (ids.users[user.name] !== void 0) throw new Error(`telegram seed user ${user.name} is listed twice`);
      ids.users[user.name] = await backend.createUser({
        first_name: user.first_name ?? user.name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium
      });
    }
    const userId = (ref, owner) => {
      const id = ids.users[ref];
      if (id === void 0) throw new Error(`telegram seed ${owner} references unknown user ${ref}`);
      return id;
    };
    const botId = (ref, owner) => {
      const id = ids.bots[ref];
      if (id === void 0) throw new Error(`telegram seed ${owner} references unknown bot ${ref}`);
      return id;
    };
    for (const chat of seed.chats) {
      if (ids.chats[chat.name] !== void 0) throw new Error(`telegram seed chat ${chat.name} is listed twice`);
      const owner = userId(chat.owner, `chat ${chat.name}`);
      const chatId = await backend.createChat({
        title: chat.title ?? chat.name,
        type: chat.type,
        owner_id: owner,
        forum: chat.forum
      });
      ids.chats[chat.name] = chatId;
      for (const member of chat.members ?? []) {
        const memberId = userId(member, `chat ${chat.name}`);
        if (memberId !== owner) await backend.join(chatId, memberId);
      }
      if (chat.topics?.length) {
        if (!chat.forum) throw new Error(`telegram seed chat ${chat.name} has topics but is not a forum`);
        ids.topics[chat.name] = {};
        for (const topic of chat.topics) {
          ids.topics[chat.name][topic] = await backend.createTopic(chatId, topic, owner);
        }
      }
      for (const entry of chat.bots ?? []) {
        const spec = typeof entry === "string" ? { bot: entry } : entry;
        const membership = { status: spec.status ?? "administrator", rights: spec.rights };
        await backend.setBotMembership(chatId, botId(spec.bot, `chat ${chat.name}`), membership);
      }
    }
    await drainSeedUpdates(backend, seed.bots);
    await registerSeedWebhooks(backend, seed.bots);
    const { calls } = await backend.getCalls();
    return {
      generation,
      backend,
      ids,
      botIdsByToken,
      profiles,
      topicMeta: /* @__PURE__ */ new Map(),
      adapterCalls: [],
      seedCallCount: calls.length
    };
  } catch (error) {
    await backend.stop();
    throw error;
  }
}
async function drainSeedUpdates(backend, bots) {
  for (const bot of bots) {
    const call = async (params) => {
      const response = await fetch(`${backend.origin}/bot${bot.token}/getUpdates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const body = await response.json();
      if (!body.ok || !body.result) throw new Error(`telegram seed could not drain updates: ${body.description}`);
      return body.result;
    };
    const pending = await call({ timeout: 0 });
    const last = pending.at(-1);
    if (last) await call({ timeout: 0, offset: last.update_id + 1 });
  }
}
async function registerSeedWebhooks(backend, bots) {
  for (const bot of bots) {
    if (!bot.webhook) continue;
    if (!bot.webhook.url) throw new Error(`telegram seed bot ${bot.username} has a webhook without a url`);
    const response = await fetch(`${backend.origin}/bot${bot.token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bot.webhook)
    });
    const body = await response.json();
    if (!body.ok) throw new Error(`telegram seed bot ${bot.username} webhook was refused: ${body.description}`);
  }
}
function seedDefaults(store) {
  writeTelegramSeed(store, { bots: [DEFAULT_TELEGRAM_BOT], users: [DEFAULT_TELEGRAM_USER], chats: [] });
}
function seedFromConfig(store, _baseUrl, config, _webhooks) {
  const current = readTelegramSeed(store);
  const bots = config.bots?.length ? config.bots : current.bots;
  for (const bot of bots) botIdFromToken(bot.token);
  writeTelegramSeed(store, {
    bots,
    users: [
      ...current.users.filter((user) => !config.users?.some((configured) => configured.name === user.name)),
      ...config.users ?? []
    ],
    chats: [...current.chats, ...config.chats ?? []]
  });
}
function createTelegramPlugin(createBackend = createTestServerBackend) {
  return {
    name: "telegram",
    rateLimit: false,
    register(app, store) {
      const runtime = new TelegramRuntime(store, createBackend);
      app.get("/", async (c) => {
        const world = await runtime.world();
        const { calls, unimplemented } = await world.backend.getCalls();
        const tab = c.req.query("tab") === "calls" ? "calls" : "seed";
        const body = tab === "calls" ? renderJsonDetails("Bot API calls", { calls: calls.slice(world.seedCallCount), unimplemented }, true) : renderJsonDetails("Seeded ids", world.ids, true);
        return c.html(
          renderInspectorPage(
            "Telegram Inspector",
            [
              { id: "seed", label: "Seed", href: "/?tab=seed" },
              { id: "calls", label: "Calls", href: "/?tab=calls" }
            ],
            tab,
            body,
            "Telegram Bot API emulator"
          )
        );
      });
      botApiRoutes(app, runtime, controlRoutes(app, runtime));
      return () => runtime.close();
    },
    seed(store) {
      seedDefaults(store);
    }
  };
}
var telegramPlugin = createTelegramPlugin();
var index_default = telegramPlugin;
export {
  DEFAULT_TELEGRAM_BOT,
  DEFAULT_TELEGRAM_USER,
  TELEGRAM_ADAPTER_METHODS,
  TelegramBackendError,
  createTelegramPlugin,
  index_default as default,
  seedFromConfig,
  telegramPlugin
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-SKCN57BD.js.map
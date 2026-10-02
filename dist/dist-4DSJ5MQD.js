import "./chunk-PZ5AY32C.js";

// ../@emulators/workos/dist/index.js
import { randomUUID as randomUUID2 } from "crypto";

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/id.js
var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
var ENCODING_LEN = ENCODING.length;
var TIME_LEN = 10;
var RANDOM_LEN = 16;
var lastTime = 0;
function generateUlid() {
  let now = Date.now();
  if (now <= lastTime) {
    now = lastTime + 1;
  }
  lastTime = now;
  let timeStr = "";
  let t = now;
  for (let i = TIME_LEN - 1; i >= 0; i--) {
    timeStr = ENCODING[t % ENCODING_LEN] + timeStr;
    t = Math.floor(t / ENCODING_LEN);
  }
  let randStr = "";
  for (let i = 0; i < RANDOM_LEN; i++) {
    randStr += ENCODING[Math.floor(Math.random() * ENCODING_LEN)];
  }
  return `${timeStr}${randStr}`;
}
function generateId(prefix) {
  return `${prefix}_${generateUlid()}`;
}
var ID_PREFIXES = {
  user: "user",
  organization: "org",
  organization_membership: "om",
  organization_domain: "org_domain",
  group: "group",
  group_membership: "gm",
  connection: "conn",
  connection_domain: "conn_domain",
  directory: "directory",
  directory_user: "directory_user",
  directory_group: "directory_group",
  event: "event",
  invitation: "invitation",
  session: "session",
  email_verification: "email_verification",
  password_reset: "password_reset",
  magic_auth: "magic_auth",
  authentication_factor: "auth_factor",
  authentication_challenge: "auth_challenge",
  authorization_code: "auth_code",
  external_auth_session: "ext_auth",
  identity: "identity",
  sso_authorization: "sso_auth",
  refresh_token: "ref",
  device_authorization: "dev_auth",
  api_key: "api_key",
  profile: "prof",
  pipe_connection: "pipe_conn",
  redirect_uri: "redir",
  cors_origin: "cors_origin",
  authorized_application: "authorized_connect_app",
  // Connected-account ids are data installations (`data_installation_01…`) — the spec's
  // `ConnectedAccount.id` example agrees — because every account of one provider installs
  // the same environment-level data integration.
  connected_account: "data_installation",
  data_integration: "data_integration",
  role: "role",
  permission: "perm",
  role_permission: "rp",
  authorization_resource: "authz_resource",
  role_assignment: "role_assignment",
  audit_log_action: "audit_action",
  audit_log_event: "audit_event",
  audit_log_export: "audit_log_export",
  feature_flag: "flag",
  flag_target: "flag_target",
  connect_application: "conn_app",
  client_secret: "secret",
  data_integration_auth: "di_auth",
  radar_attempt: "radar_att",
  webhook_endpoint: "we",
  agent_blueprint: "agent_blueprint",
  agent_instance: "agent",
  agent_instance_session: "agent_session"
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/pagination.js
function parseListParams(url) {
  const limit = parseInt(url.searchParams.get("limit") ?? "10") || 10;
  const order2 = url.searchParams.get("order") ?? "desc";
  const before = url.searchParams.get("before") ?? void 0;
  const after = url.searchParams.get("after") ?? void 0;
  return { limit, order: order2, before, after };
}
function cursorPaginate(items, options = {}) {
  let filtered = options.filter ? items.filter(options.filter) : items;
  const order2 = options.order ?? "desc";
  const defaultSort = (a, b) => order2 === "desc" ? b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id) : a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
  filtered.sort(options.sort ?? defaultSort);
  const limit = Math.max(1, Math.min(options.limit ?? 10, 100));
  let startIndex = 0;
  let endIndex = filtered.length;
  if (options.after) {
    const afterIndex = filtered.findIndex((item) => item.id === options.after);
    if (afterIndex !== -1) {
      startIndex = afterIndex + 1;
    }
  }
  if (options.before) {
    const beforeIndex = filtered.findIndex((item) => item.id === options.before);
    if (beforeIndex !== -1) {
      endIndex = beforeIndex;
    }
  }
  const window = filtered.slice(startIndex, endIndex);
  const page = window.slice(0, limit);
  const hasMore = window.length > limit;
  const hasPrev = startIndex > 0;
  return {
    data: page,
    list_metadata: {
      before: page.length > 0 && hasPrev ? page[0].id : null,
      after: page.length > 0 && hasMore ? page[page.length - 1].id : null
    }
  };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/store.js
var Collection = class {
  prefix;
  indexFields;
  items = /* @__PURE__ */ new Map();
  indexes = /* @__PURE__ */ new Map();
  hooks = {};
  fieldNames;
  constructor(prefix, indexFields = []) {
    this.prefix = prefix;
    this.indexFields = indexFields;
    this.fieldNames = indexFields.map(String).sort();
    for (const field of indexFields) {
      this.indexes.set(String(field), /* @__PURE__ */ new Map());
    }
  }
  addToIndex(item) {
    for (const field of this.indexFields) {
      const value = item[field];
      if (value === void 0 || value === null)
        continue;
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
      if (value === void 0 || value === null)
        continue;
      const indexMap = this.indexes.get(String(field));
      const key = String(value);
      indexMap.get(key)?.delete(item.id);
    }
  }
  insert(data) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const id = data.id ?? generateId(this.prefix);
    const item = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };
    this.items.set(id, item);
    this.addToIndex(item);
    this.hooks.onInsert?.(item);
    return item;
  }
  get(id) {
    return this.items.get(id);
  }
  findBy(field, value) {
    if (this.indexes.has(String(field))) {
      const ids = this.indexes.get(String(field)).get(String(value));
      if (!ids)
        return [];
      return Array.from(ids).map((id) => this.items.get(id)).filter(Boolean);
    }
    return this.all().filter((item) => item[field] === value);
  }
  findOneBy(field, value) {
    return this.findBy(field, value)[0];
  }
  update(id, data) {
    const existing = this.items.get(id);
    if (!existing)
      return void 0;
    this.removeFromIndex(existing);
    const updated = {
      ...existing,
      ...data,
      id,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.items.set(id, updated);
    this.addToIndex(updated);
    this.hooks.onUpdate?.(updated, existing);
    return updated;
  }
  // Like update(), but silent: re-indexes the record without firing onUpdate or bumping
  // updated_at. Mirrors production's updateWithSignIn — a raw, debounced DB write that
  // stamps last_sign_in_at on sign-in without emitting a user.updated webhook or treating
  // the login as a user edit. See https://github.com/workos/emulate/issues/55.
  updateSilent(id, data) {
    const existing = this.items.get(id);
    if (!existing)
      return void 0;
    this.removeFromIndex(existing);
    const updated = {
      ...existing,
      ...data,
      id
    };
    this.items.set(id, updated);
    this.addToIndex(updated);
    return updated;
  }
  delete(id) {
    const existing = this.items.get(id);
    if (!existing)
      return false;
    this.hooks.onDelete?.(existing);
    this.removeFromIndex(existing);
    return this.items.delete(id);
  }
  deleteBy(field, value) {
    const items = this.findBy(field, value);
    for (const item of items)
      this.delete(item.id);
    return items.length;
  }
  setHooks(hooks) {
    this.hooks = hooks;
  }
  all() {
    return Array.from(this.items.values());
  }
  list(options = {}) {
    return cursorPaginate(this.all(), options);
  }
  count(filter) {
    if (!filter)
      return this.items.size;
    let n = 0;
    for (const item of this.items.values()) {
      if (filter(item))
        n++;
    }
    return n;
  }
  clear() {
    this.items.clear();
    for (const indexMap of this.indexes.values()) {
      indexMap.clear();
    }
  }
};
var Store = class {
  collections = /* @__PURE__ */ new Map();
  _data = /* @__PURE__ */ new Map();
  collection(name, prefix, indexFields = []) {
    const existing = this.collections.get(name);
    if (existing) {
      if (indexFields.length > 0) {
        const requested = indexFields.map(String).sort();
        if (existing.fieldNames.length !== requested.length || existing.fieldNames.some((f, i) => f !== requested[i])) {
          throw new Error(`Collection "${name}" already exists with indexes [${existing.fieldNames}] but was requested with [${requested}]`);
        }
      }
      return existing;
    }
    const col = new Collection(prefix, indexFields);
    this.collections.set(name, col);
    return col;
  }
  getData(key) {
    return this._data.get(key);
  }
  setData(key, value) {
    this._data.set(key, value);
  }
  /** Remove one data entry outright. `setData(key, undefined)` keeps the key allocated. */
  deleteData(key) {
    return this._data.delete(key);
  }
  /**
   * Remove every entry under a prefix, or only those `shouldDelete` selects. Deleting during
   * iteration is safe on a Map: a removed entry is simply not visited.
   */
  deleteDataByPrefix(prefix, shouldDelete) {
    let count = 0;
    for (const [key, value] of this._data) {
      if (!key.startsWith(prefix))
        continue;
      if (shouldDelete && !shouldDelete(value, key))
        continue;
      this._data.delete(key);
      count++;
    }
    return count;
  }
  reset() {
    for (const collection of this.collections.values()) {
      collection.clear();
    }
    this._data.clear();
  }
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/jwt.js
import { createHash, createPrivateKey, createPublicKey, createSign, createVerify, generateKeyPairSync } from "crypto";
var TEMPLATE_RESERVED_CLAIMS = /* @__PURE__ */ new Set(["iss", "sub", "exp", "iat", "nbf", "jti"]);
function base64url(input) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}
function base64urlDecode(input) {
  return Buffer.from(input, "base64url");
}
function loadPrivateKey(pem) {
  let key;
  try {
    key = createPrivateKey(pem);
  } catch (error2) {
    const detail = error2 instanceof Error ? error2.message : String(error2);
    throw new Error(`Invalid signing key: could not parse as a PEM private key (${detail})`);
  }
  if (key.asymmetricKeyType !== "rsa") {
    throw new Error(`Invalid signing key: expected an RSA key (tokens are signed RS256), got ${key.asymmetricKeyType}`);
  }
  return key;
}
function jwkThumbprint(publicKey) {
  const jwk = publicKey.export({ format: "jwk" });
  const canonical = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
  return createHash("sha256").update(canonical).digest("base64url");
}
var JWTManager = class {
  privateKey;
  publicKey;
  kid;
  _issuer = "";
  /**
   * Base the `iss` claim is built from. Trailing slashes are stripped on the way in, whichever
   * way it is set, because `authKitIssuer` concatenates: `--issuer https://api.workos.com/`
   * would otherwise mint `https://api.workos.com//user_management/client_x`, which equals
   * nothing production emits and nothing a verifier is comparing against. Settable because
   * `createEmulator` learns the bound URL only after listen() resolves an ephemeral port.
   */
  get issuer() {
    return this._issuer;
  }
  set issuer(value) {
    this._issuer = value.replace(/\/+$/, "");
  }
  constructor(issuer = "https://api.workos.com", signingKey) {
    this.issuer = issuer;
    if (signingKey?.privateKey) {
      this.privateKey = loadPrivateKey(signingKey.privateKey);
      this.publicKey = createPublicKey(this.privateKey);
    } else {
      const { privateKey, publicKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048
      });
      this.privateKey = privateKey;
      this.publicKey = publicKey;
    }
    this.kid = signingKey?.kid ?? `workos_emulate_${jwkThumbprint(this.publicKey).slice(0, 16)}`;
  }
  /**
   * The `iss` of an AuthKit access token, and the `issuer` its OIDC discovery document
   * advertises — one function so the two cannot drift.
   *
   * Production derives it from the environment's client id, not the bare API URL:
   * `${apiUrl}/user_management/${clientId}` (`getIssuer` in
   * `api-services/src/jwt-claims/build-access-token-claims.ts`, under the default
   * `issuerType: 'ClientId'`). Its `'Legacy'` issuer type returns the bare URL instead —
   * what the emulator used to mint for every token — so a verifier written against a
   * current WorkOS environment saw an `iss` it would have rejected in production.
   *
   * It also makes the discovery document valid: OIDC Discovery 1.0 §4.3 requires `issuer`
   * to equal the URL prefix the document was fetched from, and that prefix carries the
   * client id. Reach the emulator under a name other than its configured base URL and the
   * two diverge again — set `--issuer` to that name if a client enforces §4.3.
   */
  authKitIssuer(clientId) {
    return `${this.issuer}/user_management/${clientId}`;
  }
  sign(payload, options) {
    const now = Math.floor(Date.now() / 1e3);
    const expiresIn2 = options?.expiresIn ?? 3600;
    const templateClaims = {};
    for (const [key, value] of Object.entries(options?.claims ?? {})) {
      if (TEMPLATE_RESERVED_CLAIMS.has(key))
        continue;
      templateClaims[key] = value;
    }
    const fullPayload = {
      ...payload,
      // Template claims win over the claims the emulator resolves, matching WorkOS: only the
      // reserved claims below are off-limits, so a template may deliberately restate `role`,
      // `permissions`, or `org_id`.
      ...templateClaims,
      iss: options?.issuerClientId ? this.authKitIssuer(options.issuerClientId) : this.issuer,
      iat: now,
      exp: now + expiresIn2
    };
    const header = { alg: "RS256", typ: options?.typ ?? "JWT", kid: this.kid };
    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(fullPayload));
    const signingInput = `${headerB64}.${payloadB64}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer.sign(this.privateKey, "base64url");
    return `${signingInput}.${signature}`;
  }
  verify(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const [headerB64, payloadB64, signature] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;
    const verifier = createVerify("RSA-SHA256");
    verifier.update(signingInput);
    const valid = verifier.verify(this.publicKey, signature, "base64url");
    if (!valid) {
      throw new Error("Invalid token signature");
    }
    const payload = JSON.parse(base64urlDecode(payloadB64).toString("utf-8"));
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token has expired");
    }
    return payload;
  }
  getJWKS() {
    const jwk = this.publicKey.export({ format: "jwk" });
    return {
      keys: [
        {
          ...jwk,
          kid: this.kid,
          alg: "RS256",
          use: "sig"
        }
      ]
    };
  }
  getPublicKeyPem() {
    return this.publicKey.export({ type: "spki", format: "pem" });
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType2) => {
  return new Response(arrayBuffer, { headers: { "Content-Type": contentType2.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/body.js
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
    all,
    dot
  });
  return {};
};
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData) return convertFormDataToBodyData(formData, options);
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    if (!(options.all || key.endsWith("[]"))) form[key] = value;
    else handleParsingAllValues(form, key, value);
  });
  if (options.dot) Object.entries(form).forEach(([key, value]) => {
    if (key.includes(".")) {
      handleParsingNestedValues(form, key, value, nestingState);
      delete form[key];
    }
  });
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) form[key].push(value);
    else form[key] = [form[key], value];
  } else if (!key.endsWith("[]")) form[key] = value;
  else form[key] = [value];
};
var handleParsingNestedValues = (form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) return;
  let nestedForm = form;
  const keys = key.split(".", 34);
  if (keys.length > 33) throwNestingLimitExceeded();
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) nestedForm[key2] = value;
    else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var throwNestingLimitExceeded = () => {
  throw new Error("Nesting limit exceeded");
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") paths.shift();
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return {
    groups,
    path
  };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
      paths[j] = paths[j].replace(mark, groups[i][1]);
      break;
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") return "*";
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey2 = `${label}#${next}`;
    if (!patternCache[cacheKey2]) {
      if (match2[2]) patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [
        cacheKey2,
        match2[1],
        new RegExp(`^${match2[2]}(?=/${next})`)
      ] : [
        label,
        match2[1],
        new RegExp(`^${match2[2]}$`)
      ];
      else patternCache[cacheKey2] = [
        label,
        match2[1],
        true
      ];
    }
    return patternCache[cacheKey2];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) break;
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) sub = mergePath(sub, ...rest);
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
    else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") results.push("/");
        else results.push(basePath);
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else basePath += "/" + segment;
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
var _decodeURI = (value) => {
  if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
  return tryDecodeURIComponent(value);
};
var _getQueryParam = (url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) url = url.slice(0, hashIndex);
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) return;
    if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) return;
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
    if (encoded) name = _decodeURI(name);
    keyIndex = nextKeyIndex;
    if (name === "") continue;
    let value;
    if (valueIndex === -1) value = "";
    else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) value = _decodeURI(value);
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
      results[name].push(value);
    } else results[name] ??= value;
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request.js
var HonoRequest = class {
  /**
  * `.raw` can get the raw Request object.
  *
  * @see {@link https://hono.dev/docs/api/request#raw}
  *
  * @example
  * ```ts
  * // For Cloudflare Workers
  * app.post('/', async (c) => {
  *   const metadata = c.req.raw.cf?.hostMetadata?
  *   ...
  * })
  * ```
  */
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  /**
  * `.path` can get the pathname of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#path}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const pathname = c.req.path // `/about/me`
  * })
  * ```
  */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) return this.raw.headers.get(name) ?? void 0;
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) return cachedBody;
    for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
      if (anyCachedKey === "json") body = JSON.stringify(body);
      const contentType2 = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
      return new Response(body, { headers: contentType2 ? { "Content-Type": contentType2 } : void 0 })[key]();
    });
    return bodyCache[key] = raw2[key]();
  };
  /**
  * `.json()` can parse Request body of type `application/json`
  *
  * @see {@link https://hono.dev/docs/api/request#json}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.json()
  * })
  * ```
  */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
  * `.text()` can parse Request body of type `text/plain`
  *
  * @see {@link https://hono.dev/docs/api/request#text}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.text()
  * })
  * ```
  */
  text() {
    return this.#cachedBody("text");
  }
  /**
  * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
  *
  * @see {@link https://hono.dev/docs/api/request#arraybuffer}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.arrayBuffer()
  * })
  * ```
  */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
  * `.bytes()` parses the request body as a `Uint8Array`.
  *
  * @see {@link https://hono.dev/docs/api/request#bytes}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.bytes()
  * })
  * ```
  */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
  * Parses the request body as a `Blob`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.blob();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#blob
  */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
  * Parses the request body as `FormData`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.formData();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#formdata
  */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
  * Adds validated data to the request.
  *
  * @param target - The target of the validation.
  * @param data - The validated data to add.
  */
  addValidatedData(target, data) {
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
  * `.url()` can get the request url strings.
  *
  * @see {@link https://hono.dev/docs/api/request#url}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const url = c.req.url // `http://localhost:8787/about/me`
  *   ...
  * })
  * ```
  */
  get url() {
    return this.raw.url;
  }
  /**
  * `.method()` can get the method name of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#method}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const method = c.req.method // `GET`
  * })
  * ```
  */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
  * `.matchedRoutes()` can return a matched route in the handler
  *
  * @deprecated
  *
  * Use matchedRoutes helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#matchedroutes}
  *
  * @example
  * ```ts
  * app.use('*', async function logger(c, next) {
  *   await next()
  *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
  *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
  *     console.log(
  *       method,
  *       ' ',
  *       path,
  *       ' '.repeat(Math.max(10 - path.length, 0)),
  *       name,
  *       i === c.req.routeIndex ? '<- respond from here' : ''
  *     )
  *   })
  * })
  * ```
  */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
  * `routePath()` can retrieve the path registered within the handler
  *
  * @deprecated
  *
  * Use routePath helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#routepath}
  *
  * @example
  * ```ts
  * app.get('/posts/:id', (c) => {
  *   return c.json({ path: c.req.routePath })
  * })
  * ```
  */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) str = str.toString();
    if (str instanceof Promise) str = await str;
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) return Promise.resolve(str);
  if (buffer) buffer[0] += str;
  else buffer = [str];
  const resStr = Promise.all(callbacks.map((c) => c({
    phase,
    buffer,
    context
  }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) return raw(await resStr, callbacks);
  else return resStr;
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType2, headers) => {
  return {
    "Content-Type": contentType2,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
  * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
  *
  * @see {@link https://hono.dev/docs/api/context#env}
  *
  * @example
  * ```ts
  * // Environment object for Cloudflare Workers
  * app.get('*', async c => {
  *   const counter = c.env.COUNTER
  * })
  * ```
  */
  env = {};
  #var;
  finalized = false;
  /**
  * `.error` can get the error object from the middleware if the Handler throws an error.
  *
  * @see {@link https://hono.dev/docs/api/context#error}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   await next()
  *   if (c.error) {
  *     // do something...
  *   }
  * })
  * ```
  */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
  * Creates an instance of the Context class.
  *
  * @param req - The Request object.
  * @param options - Optional configuration options for the context.
  */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
  * `.req` is the instance of {@link HonoRequest}.
  */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#event}
  * The FetchEvent associated with the current request.
  *
  * @throws Will throw an error if the context does not have a FetchEvent.
  */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no FetchEvent");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#executionctx}
  * The ExecutionContext associated with the current request.
  *
  * @throws Will throw an error if the context does not have an ExecutionContext.
  */
  get executionCtx() {
    if (this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no ExecutionContext");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#res}
  * The Response object for the current request.
  */
  get res() {
    return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
  }
  /**
  * Sets the Response object for the current request.
  *
  * @param _res - The Response object to set.
  */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") continue;
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
        } else _res.headers.set(k, v);
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
  * `.render()` can create a response within a layout.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   return c.render('Hello!')
  * })
  * ```
  */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
  * Sets the layout for the response.
  *
  * @param layout - The layout to set.
  * @returns The layout function.
  */
  setLayout = (layout) => this.#layout = layout;
  /**
  * Gets the current layout for the response.
  *
  * @returns The current layout function.
  */
  getLayout = () => this.#layout;
  /**
  * `.setRenderer()` can set the layout in the custom middleware.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```tsx
  * app.use('*', async (c, next) => {
  *   c.setRenderer((content) => {
  *     return c.html(
  *       <html>
  *         <body>
  *           <p>{content}</p>
  *         </body>
  *       </html>
  *     )
  *   })
  *   await next()
  * })
  * ```
  */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
  * `.header()` can set headers.
  *
  * @see {@link https://hono.dev/docs/api/context#header}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *
  *   // Append multiple headers using the append option (e.g. Vary)
  *   c.header('Vary', 'Accept-Encoding', { append: true })
  *   c.header('Vary', 'User-Agent', { append: true })
  *
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  header = (name, value, options) => {
    if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) headers.delete(name);
    else if (options?.append) headers.append(name, value);
    else headers.set(name, value);
  };
  status = (status) => {
    this.#status = status;
  };
  /**
  * `.set()` can set the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   c.set('message', 'Hono is hot!!')
  *   await next()
  * })
  * ```
  */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
  * `.get()` can use the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   const message = c.get('message')
  *   return c.text(`The message is "${message}"`)
  * })
  * ```
  */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
  * `.var` can access the value of a variable.
  *
  * @see {@link https://hono.dev/docs/api/context#var}
  *
  * @example
  * ```ts
  * const result = c.var.client.oneMethod()
  * ```
  */
  get var() {
    if (!this.#var) return {};
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
      else responseHeaders.set(key, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) if (++count > 1 || typeof headers[k] !== "string") {
          responseHeaders = new Headers();
          break;
        }
      }
      if (responseHeaders) for (const k in headers) {
        const v = headers[k];
        if (typeof v === "string") responseHeaders.set(k, v);
        else {
          responseHeaders.delete(k);
          for (const v2 of v) responseHeaders.append(k, v2);
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
  * `.body()` can return the HTTP response.
  * You can set headers with `.header()` and set HTTP status code with `.status`.
  * This can also be set in `.text()`, `.json()` and so on.
  *
  * @see {@link https://hono.dev/docs/api/context#body}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *   // Set HTTP status code
  *   c.status(201)
  *
  *   // Return the response body
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
  * `.text()` can render text as `Content-Type:text/plain`.
  *
  * @see {@link https://hono.dev/docs/api/context#text}
  *
  * @example
  * ```ts
  * app.get('/say', (c) => {
  *   return c.text('Hello!')
  * })
  * ```
  */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  };
  /**
  * `.json()` can render JSON as `Content-Type:application/json`.
  *
  * @see {@link https://hono.dev/docs/api/context#json}
  *
  * @example
  * ```ts
  * app.get('/api', (c) => {
  *   return c.json({ message: 'Hello!' })
  * })
  * ```
  */
  json = (object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
  * `.redirect()` can Redirect, default status code is 302.
  *
  * @see {@link https://hono.dev/docs/api/context#redirect}
  *
  * @example
  * ```ts
  * app.get('/redirect', (c) => {
  *   return c.redirect('/')
  * })
  * app.get('/redirect-permanently', (c) => {
  *   return c.redirect('/', 301)
  * })
  * ```
  */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  };
  /**
  * `.notFound()` can return the Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/context#notfound}
  *
  * @example
  * ```ts
  * app.get('/notfound', (c) => {
  *   return c.notFound()
  * })
  * ```
  */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else handler = i === middleware.length && next || void 0;
      if (handler) try {
        res = await handler(context, () => dispatch(i + 1));
      } catch (err) {
        if (err instanceof Error && onError) {
          context.error = err;
          res = await onError(err, context);
          isError = true;
        } else throw err;
      }
      else if (context.finalized === false && onNotFound) res = await onNotFound(context);
      if (res && (context.finalized === false || isError)) context.res = res;
      return context;
    }
  };
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router.js
var METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "patch",
  "query"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class Hono2 {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    [...METHODS, "all"].forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") this.#path = args1;
        else this.#addRoute(methodName, this.#path, args1);
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") this.#path = arg1;
      else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute("ALL", this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono2({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  /**
  * `.route()` allows grouping other Hono instance in routes.
  *
  * @see {@link https://hono.dev/docs/api/routing#grouping}
  *
  * @param {string} path - base Path
  * @param {Hono} app - other Hono instance
  * @returns {Hono} routed Hono instance
  *
  * @example
  * ```ts
  * const app = new Hono()
  * const app2 = new Hono()
  *
  * app2.get("/user", (c) => c.text("user"))
  * app.route("/api", app2) // GET /api/user
  * ```
  */
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) handler = r.handler;
      else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
  * `.basePath()` allows base paths to be specified.
  *
  * @see {@link https://hono.dev/docs/api/routing#base-path}
  *
  * @param {string} path - base Path
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * const api = new Hono().basePath('/api')
  * ```
  */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
  * `.onError()` handles an error and returns a customized Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#error-handling}
  *
  * @param {ErrorHandler} handler - request Handler for error
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.onError((err, c) => {
  *   console.error(`${err}`)
  *   return c.text('Custom Error Message', 500)
  * })
  * ```
  */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
  * `.notFound()` allows you to customize a Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#not-found}
  *
  * @param {NotFoundHandler} handler - request handler for not-found
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.notFound((c) => {
  *   return c.text('Custom 404 Message', 404)
  * })
  * ```
  */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
  * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
  *
  * @see {@link https://hono.dev/docs/api/hono#mount}
  *
  * @param {string} path - base Path
  * @param {Function} applicationHandler - other Request Handler
  * @param {MountOptions} [options] - options of `.mount()`
  * @returns {Hono} mounted Hono instance
  *
  * @example
  * ```ts
  * import { Router as IttyRouter } from 'itty-router'
  * import { Hono } from 'hono'
  * // Create itty-router application
  * const ittyRouter = IttyRouter()
  * // GET /itty-router/hello
  * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
  *
  * const app = new Hono()
  * app.mount('/itty-router', ittyRouter.handle)
  * ```
  *
  * @example
  * ```ts
  * const app = new Hono()
  * // Send the request to another application without modification.
  * app.mount('/app', anotherApp, {
  *   replaceRequest: (req) => req,
  * })
  * ```
  */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") optionHandler = options;
      else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) replaceRequest = (request) => request;
        else replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) return res;
      await next();
    };
    this.#addRoute("ALL", mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) return this.errorHandler(err, c);
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
  * `.fetch()` will be entry point of your app.
  *
  * @see {@link https://hono.dev/docs/api/hono#fetch}
  *
  * @param {Request} request - request Object of request
  * @param {Env} env - env Object
  * @param {ExecutionContext} executionCtx - context of execution
  * @returns {Response | Promise<Response>} response of request
  *
  */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
  * `.request()` is a useful method for testing.
  * You can pass a URL or pathname to send a GET request.
  * app will return a Response object.
  * ```ts
  * test('GET /hello is ok', async () => {
  *   const res = await app.request('/hello')
  *   expect(res.status).toBe(200)
  * })
  * ```
  * @see https://hono.dev/docs/api/hono#request
  */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  };
  /**
  * `.fire()` automatically adds a global fetch event listener.
  * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
  * @deprecated
  * Use `fire` from `hono/service-worker` instead.
  * ```ts
  * import { Hono } from 'hono'
  * import { fire } from 'hono/service-worker'
  *
  * const app = new Hono()
  * // ...
  * fire(app)
  * ```
  * @see https://hono.dev/docs/api/hono#fire
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
  */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/utils.js
var createNullObject = () => /* @__PURE__ */ Object.create(null);

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch) return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3) return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1) return 1;
  if (a === ".*" || a === "(?:|/.*)") return b === "(?:|/.*)" ? -1 : 1;
  else if (b === ".*" || b === "(?:|/.*)") return -1;
  if (a === "[^/]+") return 1;
  else if (b === "[^/]+") return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class Node2 {
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
        "",
        "",
        ".*"
      ] : [
        "",
        "",
        LABEL_REG_EXP_STR
      ] : null : token === "/*" ? [
        "",
        "",
        TAIL_WILDCARD_REG_EXP_STR
      ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || "[^/]+";
        if (name && pattern[2]) {
          if (regexpStr === ".*") throw PATH_ERROR;
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ".*" && regexpStr !== "(?:|/.*)") {
            for (const k in node.#children) if ((regexpStr.length > 1 || k.length > 1) && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          }
          nextNode = node.#children[regexpStr] = new Node2();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) if (k.length > 1 && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          nextNode = node.#children[token] = new Node2();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) throw PATH_ERROR;
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) strList.unshift(`#${this.#index}`);
    if (strList.length === 0) return "";
    if (strList.length === 1) return strList[0];
    return "(?:" + strList.join("|") + ")";
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) break;
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
        tokens[j] = tokens[j].replace(mark, groups[i][1]);
        break;
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") return [
      /^$/,
      [],
      []
    ];
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [
      new RegExp(`^${regexp}`),
      indexReplacementMap,
      paramReplacementMap
    ];
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(`^${path.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g, (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ".*" : `/:${LABEL_REG_EXP_STR}`)}$`);
}
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { ["ALL"]: createNullObject() };
    this.#routes = { ["ALL"]: createNullObject() };
    this.#tries = { ["ALL"]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap["ALL"]) {
          handlerMap[method][p] = [...handlerMap["ALL"][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") path = "*";
    const methods = method === "ALL" ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) if (!middleware[m][path]) {
        this.#insertPath(m, path);
        middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
      }
      for (const handlerMap of [middleware, routes]) for (const m of methods) for (const p in handlerMap[m]) re.test(p) && handlerMap[m][p].push([handler, path]);
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) for (const m of methods) {
      if (!routes[m][path2]) {
        this.#insertPath(m, path2);
        routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || [];
      }
      routes[m][path2].push([handler, path2]);
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) matchers[method] = this.#buildMatcher(method);
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) for (const path in r) {
      const handlers = r[path];
      const pathData = trie.paths[path];
      if (!pathData) {
        staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
        continue;
      }
      handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [h, trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
        map[key] = paramReplacementMap[pathData[1][i][1]];
        return map;
      }, createNullObject())]);
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    this.#routes.push([
      method,
      path,
      handler
    ]);
  }
  match(method, path) {
    if (!this.#routes) throw new Error("Fatal error");
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) continue;
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) throw new Error("Fatal error");
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
    return this.#routers[0];
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node3 = class Node4 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new Node4();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) possibleKeys.add(pattern[1]);
    }
    curNode.#methods.push({ [method]: {
      handler,
      possibleKeys: [...possibleKeys],
      score: ++order
    } });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    let curNodes = [this];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else tempNodes.push(nextNode);
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) continue;
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                (curNodesQueue[componentCount] ||= []).push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node = new Node3();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) this.#node.insert(method, result, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono.js
var Hono3 = class extends Hono {
  /**
  * Creates an instance of the Hono class.
  *
  * @param options - Optional configuration options for the Hono instance.
  */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
  }
};

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const opts = {
    origin: "*",
    allowMethods: [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
      "QUERY"
    ],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") return () => optsOrigin;
      else return (origin) => optsOrigin === origin ? origin : null;
    } else if (typeof optsOrigin === "function") return optsOrigin;
    else return (origin) => optsOrigin.includes(origin) ? origin : null;
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else return () => "";
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) set("Access-Control-Allow-Origin", allowOrigin);
    if (opts.credentials) set("Access-Control-Allow-Credentials", "true");
    if (exposeHeadersStr) set("Access-Control-Expose-Headers", exposeHeadersStr);
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") c.res.headers.append("Vary", "Origin");
      if (opts.maxAge != null) set("Access-Control-Max-Age", opts.maxAge.toString());
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) set("Access-Control-Allow-Methods", allowMethods);
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") c.header("Vary", "Origin", { append: true });
  };
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/middleware/error-handler.js
var WorkOSApiError = class extends Error {
  status;
  code;
  errors;
  constructor(status, message, code, errors) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.name = "WorkOSApiError";
  }
};
var OauthApiError = class extends WorkOSApiError {
  constructor(status, error2, description) {
    super(status, description, error2);
    this.name = "OauthApiError";
  }
};
function createApiErrorHandler() {
  return (err, c) => {
    if (err instanceof OauthApiError) {
      return c.json({ error: err.code, error_description: err.message }, err.status);
    }
    if (err instanceof WorkOSApiError) {
      const body = {
        message: err.message,
        code: err.code
      };
      if (err.errors) {
        body.errors = err.errors;
      }
      return c.json(body, err.status);
    }
    const status = errorStatus(err);
    return c.json({
      message: "Internal Server Error",
      code: "server_error"
    }, status);
  };
}
function requestIdMiddleware() {
  return async (c, next) => {
    const requestId = c.req.header("X-Request-ID") ?? `req_${crypto.randomUUID()}`;
    c.set("requestId", requestId);
    c.header("X-Request-ID", requestId);
    await next();
  };
}
function notFound(resource) {
  return new WorkOSApiError(404, resource ? `${resource} not found` : "Not Found", "not_found");
}
function validationError(message, errors) {
  return new WorkOSApiError(422, message, "unprocessable_entity", errors);
}
function unauthorized() {
  return new WorkOSApiError(401, "Unauthorized", "unauthorized");
}
async function parseJsonBody(c) {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body;
    }
    return {};
  } catch {
    throw new WorkOSApiError(400, "Problems parsing JSON", "invalid_request_body");
  }
}
async function parseOAuthBody(c) {
  const contentType2 = (c.req.header("content-type") ?? "").toLowerCase();
  if (contentType2.includes("application/json")) {
    return parseJsonBody(c);
  }
  try {
    const body = await c.req.parseBody();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body;
    }
    return {};
  } catch {
    throw new WorkOSApiError(400, "Problems parsing body", "invalid_request_body");
  }
}
function errorStatus(err) {
  if (err && typeof err === "object" && "status" in err) {
    const s = err.status;
    if (typeof s === "number" && Number.isFinite(s))
      return s;
  }
  return 500;
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/middleware/auth.js
function isApiKeyEntryExpired(entry) {
  if (!entry.expiresAt)
    return false;
  const expiresAt = new Date(entry.expiresAt).getTime();
  return Number.isNaN(expiresAt) || expiresAt <= Date.now();
}
function authMiddleware(apiKeys) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader)
      throw unauthorized();
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token.startsWith("sk_"))
      throw unauthorized();
    const keyInfo = apiKeys[token];
    if (!keyInfo || isApiKeyEntryExpired(keyInfo))
      throw unauthorized();
    c.set("auth", { environment: keyInfo.environment, apiKey: token });
    await next();
  };
}
var WIDGET_TOKEN_AUDIENCE = "widgets";
function widgetForbidden(message) {
  return new WorkOSApiError(403, message, "forbidden");
}
function widgetAuthMiddleware(jwt) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader)
      throw widgetForbidden("Widget token is required");
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token)
      throw widgetForbidden("Widget token is required");
    let payload;
    try {
      payload = jwt.verify(token);
    } catch (error2) {
      const detail = error2 instanceof Error ? error2.message : "Invalid token";
      throw widgetForbidden(`Invalid widget token: ${detail}`);
    }
    if (payload.aud !== WIDGET_TOKEN_AUDIENCE)
      throw widgetForbidden("Token is not a widget token");
    if (typeof payload.org_id !== "string" || !payload.org_id) {
      throw widgetForbidden("Widget token does not carry an organization");
    }
    c.set("widgetAuth", {
      organizationId: payload.org_id,
      userId: payload.sub,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : []
    });
    await next();
  };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/error-hooks.js
var STORE_KEY = "errorHooks";
var RATE_LIMIT_STORE_KEY = "errorHookRateLimits";
function getErrorHooks(store) {
  return store.getData(STORE_KEY) ?? [];
}
function getRateLimitStore(store) {
  return store.getData(RATE_LIMIT_STORE_KEY) ?? /* @__PURE__ */ new Map();
}
function setRateLimitStore(store, rateLimits) {
  store.setData(RATE_LIMIT_STORE_KEY, rateLimits);
}
function setErrorHooks(store, hooks) {
  store.setData(STORE_KEY, hooks);
}
function addErrorHook(store, input) {
  if (!input.method || typeof input.method !== "string") {
    throw new Error("Error hook validation failed: method is required and must be a string");
  }
  if (!input.path || typeof input.path !== "string") {
    throw new Error("Error hook validation failed: path is required and must be a string");
  }
  if (!input.status || typeof input.status !== "number" || input.status < 100 || input.status > 599) {
    throw new Error("Error hook validation failed: status is required and must be a valid HTTP status code (100-599)");
  }
  if (input.body && typeof input.body !== "object") {
    throw new Error("Error hook validation failed: body must be an object if provided");
  }
  if (input.count !== void 0 && (typeof input.count !== "number" || input.count < 0)) {
    throw new Error("Error hook validation failed: count must be a non-negative number if provided");
  }
  if (input.rateLimit) {
    if (typeof input.rateLimit !== "object") {
      throw new Error("Error hook validation failed: rateLimit must be an object if provided");
    }
    if (typeof input.rateLimit.maxRequests !== "number" || input.rateLimit.maxRequests <= 0) {
      throw new Error("Error hook validation failed: rateLimit.maxRequests must be a positive number");
    }
    if (typeof input.rateLimit.windowMs !== "number" || input.rateLimit.windowMs <= 0) {
      throw new Error("Error hook validation failed: rateLimit.windowMs must be a positive number");
    }
  }
  const hooks = getErrorHooks(store);
  const hook = {
    id: `hook_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    ...input
  };
  hooks.push(hook);
  setErrorHooks(store, hooks);
  return hook;
}
function removeErrorHook(store, id) {
  const hooks = getErrorHooks(store);
  const idx = hooks.findIndex((h) => h.id === id);
  if (idx === -1)
    return false;
  hooks.splice(idx, 1);
  setErrorHooks(store, hooks);
  return true;
}
function matchPath(pattern, requestPath) {
  if (pattern === "*")
    return true;
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return requestPath === prefix || requestPath.startsWith(prefix + "/");
  }
  return pattern === requestPath;
}
function matchMethod(pattern, method) {
  return pattern === "*" || pattern.toUpperCase() === method.toUpperCase();
}
function defaultBody(status) {
  const bodies = {
    400: { message: "Bad Request", code: "bad_request" },
    401: { message: "Unauthorized", code: "unauthorized" },
    403: { message: "Forbidden", code: "forbidden" },
    404: { message: "Not Found", code: "not_found" },
    409: { message: "Conflict", code: "conflict" },
    422: { message: "Unprocessable Entity", code: "unprocessable_entity" },
    429: { message: "Too Many Requests", code: "rate_limit_exceeded" },
    500: { message: "Internal Server Error", code: "server_error" },
    503: { message: "Service Unavailable", code: "service_unavailable" }
  };
  return bodies[status] ?? { message: `Error ${status}`, code: "error" };
}
function errorHooksMiddleware(store) {
  return async (c, next) => {
    const path = new URL(c.req.url).pathname;
    if (path.startsWith("/_emulate/"))
      return next();
    const hooks = getErrorHooks(store);
    const rateLimits = getRateLimitStore(store);
    const now = Date.now();
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i];
      if (matchMethod(hook.method, c.req.method) && matchPath(hook.path, path)) {
        if (hook.rateLimit) {
          const key = `${hook.id}:${path}`;
          const entry = rateLimits.get(key);
          if (entry && now < entry.resetTime) {
            entry.count++;
            if (entry.count > hook.rateLimit.maxRequests) {
              return c.json({
                message: "Rate limit exceeded",
                code: "rate_limit_exceeded",
                retry_after: Math.ceil((entry.resetTime - now) / 1e3)
              }, 429);
            }
          } else {
            rateLimits.set(key, {
              count: 1,
              resetTime: now + hook.rateLimit.windowMs
            });
          }
          setRateLimitStore(store, rateLimits);
        }
        if (hook.count !== void 0) {
          hook.count--;
          if (hook.count <= 0) {
            hooks.splice(i, 1);
          }
          setErrorHooks(store, hooks);
        }
        const body = hook.body ?? defaultBody(hook.status);
        return c.json(body, hook.status);
      }
    }
    await next();
  };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/core/server.js
function createServer(plugin, options = {}) {
  const port = options.port ?? 4100;
  const baseUrl = (options.baseUrl ?? `http://localhost:${port}`).replace(/\/+$/, "");
  const app = new Hono3();
  const store = new Store();
  const jwt = new JWTManager(options.issuer ?? baseUrl, options.signingKey);
  const ctx = { app, store, jwt, baseUrl };
  const apiKeys = options.apiKeys ?? {
    sk_test_default: { environment: "test" }
  };
  app.onError(createApiErrorHandler());
  app.use("*", cors());
  app.use("*", requestIdMiddleware());
  app.get("/sso/jwks/:client_id", (c) => {
    return c.json(jwt.getJWKS());
  });
  const auth = authMiddleware(apiKeys);
  const WIDGETS_PREFIX = "/_widgets/";
  const widgetAuth = widgetAuthMiddleware(jwt);
  const PUBLIC_PATHS = /* @__PURE__ */ new Set([
    "/health",
    "/user_management/authorize",
    // Browser-facing device verification page; like the authorize login page it cannot carry a
    // bearer token, so it is public. The POST device-authorization endpoint still requires auth.
    "/user_management/authorize/device/verify",
    "/user_management/authenticate",
    "/user_management/sessions/logout"
  ]);
  const PUBLIC_PATH_PREFIXES = [
    "/sso/",
    "/oauth2/",
    "/user_management/sessions/jwks/",
    "/data-integrations/",
    "/_emulate/"
  ];
  const OPENID_CONFIGURATION = /^\/user_management\/[^/]+\/\.well-known\/openid-configuration\/?$/;
  app.use("*", async (c, next) => {
    const path = new URL(c.req.url).pathname;
    if (PUBLIC_PATHS.has(path))
      return next();
    if (OPENID_CONFIGURATION.test(path))
      return next();
    if (path.startsWith(WIDGETS_PREFIX))
      return widgetAuth(c, next);
    for (const prefix of PUBLIC_PATH_PREFIXES) {
      if (path.startsWith(prefix)) {
        if (prefix === "/data-integrations/" && !path.endsWith("/authorize"))
          break;
        return next();
      }
    }
    return auth(c, next);
  });
  const rateLimitCounters = /* @__PURE__ */ new Map();
  let lastPruneAt = Math.floor(Date.now() / 1e3);
  app.use("*", async (c, next) => {
    const auth2 = c.get("auth");
    const key = auth2?.apiKey ?? "__anonymous__";
    const now = Math.floor(Date.now() / 1e3);
    if (now - lastPruneAt > 3600) {
      for (const [k, val] of rateLimitCounters) {
        if (val.resetAt <= now)
          rateLimitCounters.delete(k);
      }
      lastPruneAt = now;
    }
    let counter = rateLimitCounters.get(key);
    if (!counter || counter.resetAt <= now) {
      counter = { remaining: 1e3, resetAt: now + 60 };
      rateLimitCounters.set(key, counter);
    }
    counter.remaining = Math.max(0, counter.remaining - 1);
    c.header("X-RateLimit-Limit", "1000");
    c.header("X-RateLimit-Remaining", String(counter.remaining));
    c.header("X-RateLimit-Reset", String(counter.resetAt));
    if (counter.remaining === 0) {
      c.header("Retry-After", String(counter.resetAt - now));
      return c.json({
        message: "Too Many Requests",
        code: "rate_limit_exceeded"
      }, 429);
    }
    await next();
  });
  app.use("*", errorHooksMiddleware(store));
  store.setData("apiKeyMap", apiKeys);
  plugin.register(ctx);
  app.notFound((c) => c.json({
    message: "Not Found",
    code: "not_found"
  }, 404));
  return { app, store, jwt, port, baseUrl, ctx };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/index.js
import { randomBytes as randomBytes3 } from "crypto";

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/organization-resource.js
function organizationResourceValues(organization) {
  return { name: organization.name, external_id: organization.external_id ?? organization.id };
}
function findOrCreateOrganizationResource(ws, organization) {
  const existing = ws.authorizationResources.findBy("organization_id", organization.id).find((resource) => resource.resource_type_slug === "organization");
  if (existing)
    return existing;
  return ws.authorizationResources.insert({
    object: "authorization_resource",
    organization_id: organization.id,
    resource_type_slug: "organization",
    ...organizationResourceValues(organization),
    description: null,
    parent_resource_id: null,
    metadata: {}
  });
}
function syncOrganizationResource(ws, organization) {
  const root = findOrCreateOrganizationResource(ws, organization);
  const values = organizationResourceValues(organization);
  if (root.name !== values.name || root.external_id !== values.external_id) {
    ws.authorizationResources.update(root.id, values);
  }
  for (const assignment of ws.roleAssignments.findBy("resource_id", root.id)) {
    if (assignment.resource_external_id !== values.external_id) {
      ws.roleAssignments.update(assignment.id, { resource_external_id: values.external_id });
    }
  }
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/generated/events.js
var EVENTS = {
  actionAuthenticationDenied: "action.authentication.denied",
  actionUserRegistrationDenied: "action.user_registration.denied",
  agentBlueprintCreated: "agent.blueprint.created",
  agentBlueprintDeleted: "agent.blueprint.deleted",
  agentBlueprintUpdated: "agent.blueprint.updated",
  agentInstanceCreated: "agent.instance.created",
  agentInstanceDeleted: "agent.instance.deleted",
  agentInstanceSessionCreated: "agent.instance.session.created",
  agentInstanceSessionRevoked: "agent.instance.session.revoked",
  agentRegistrationClaimAttemptCreated: "agent.registration.claim.attempt.created",
  agentRegistrationClaimCompleted: "agent.registration.claim.completed",
  agentRegistrationCreated: "agent.registration.created",
  agentRegistrationCredentialIssued: "agent.registration.credential.issued",
  agentRegistrationDeleted: "agent.registration.deleted",
  agentRegistrationExpired: "agent.registration.expired",
  agentRegistrationOrganizationSwitched: "agent.registration.organization.switched",
  agentRegistrationRefreshed: "agent.registration.refreshed",
  agentRegistrationRevoked: "agent.registration.revoked",
  apiKeyCreated: "api_key.created",
  apiKeyRevoked: "api_key.revoked",
  apiKeyUpdated: "api_key.updated",
  authenticationEmailVerificationFailed: "authentication.email_verification_failed",
  authenticationEmailVerificationSucceeded: "authentication.email_verification_succeeded",
  authenticationMagicAuthFailed: "authentication.magic_auth_failed",
  authenticationMagicAuthSucceeded: "authentication.magic_auth_succeeded",
  authenticationMfaFailed: "authentication.mfa_failed",
  authenticationMfaSucceeded: "authentication.mfa_succeeded",
  authenticationOauthFailed: "authentication.oauth_failed",
  authenticationOauthSucceeded: "authentication.oauth_succeeded",
  authenticationPasskeyFailed: "authentication.passkey_failed",
  authenticationPasskeySucceeded: "authentication.passkey_succeeded",
  authenticationPasswordFailed: "authentication.password_failed",
  authenticationPasswordSucceeded: "authentication.password_succeeded",
  authenticationRadarRiskDetected: "authentication.radar_risk_detected",
  authenticationReauthenticationSucceeded: "authentication.reauthentication_succeeded",
  authenticationSsoFailed: "authentication.sso_failed",
  authenticationSsoStarted: "authentication.sso_started",
  authenticationSsoSucceeded: "authentication.sso_succeeded",
  authenticationSsoTimedOut: "authentication.sso_timed_out",
  connectionActivated: "connection.activated",
  connectionDeactivated: "connection.deactivated",
  connectionDeleted: "connection.deleted",
  connectionSamlCertificateRenewalRequired: "connection.saml_certificate_renewal_required",
  connectionSamlCertificateRenewed: "connection.saml_certificate_renewed",
  dsyncActivated: "dsync.activated",
  dsyncDeleted: "dsync.deleted",
  dsyncGroupCreated: "dsync.group.created",
  dsyncGroupDeleted: "dsync.group.deleted",
  dsyncGroupUpdated: "dsync.group.updated",
  dsyncGroupUserAdded: "dsync.group.user_added",
  dsyncGroupUserRemoved: "dsync.group.user_removed",
  dsyncTokenCreated: "dsync.token.created",
  dsyncTokenRevoked: "dsync.token.revoked",
  dsyncUserCreated: "dsync.user.created",
  dsyncUserDeleted: "dsync.user.deleted",
  dsyncUserUpdated: "dsync.user.updated",
  emailVerificationCreated: "email_verification.created",
  flagCreated: "flag.created",
  flagDeleted: "flag.deleted",
  flagRuleUpdated: "flag.rule_updated",
  flagUpdated: "flag.updated",
  groupCreated: "group.created",
  groupDeleted: "group.deleted",
  groupMemberAdded: "group.member_added",
  groupMemberRemoved: "group.member_removed",
  groupUpdated: "group.updated",
  invitationAccepted: "invitation.accepted",
  invitationCreated: "invitation.created",
  invitationResent: "invitation.resent",
  invitationRevoked: "invitation.revoked",
  magicAuthCreated: "magic_auth.created",
  organizationCreated: "organization.created",
  organizationDeleted: "organization.deleted",
  organizationUpdated: "organization.updated",
  organizationDomainCreated: "organization_domain.created",
  organizationDomainDeleted: "organization_domain.deleted",
  organizationDomainUpdated: "organization_domain.updated",
  organizationDomainVerificationFailed: "organization_domain.verification_failed",
  organizationDomainVerified: "organization_domain.verified",
  organizationMembershipCreated: "organization_membership.created",
  organizationMembershipDeleted: "organization_membership.deleted",
  organizationMembershipUpdated: "organization_membership.updated",
  organizationRoleCreated: "organization_role.created",
  organizationRoleDeleted: "organization_role.deleted",
  organizationRoleUpdated: "organization_role.updated",
  passwordResetCreated: "password_reset.created",
  passwordResetSucceeded: "password_reset.succeeded",
  permissionCreated: "permission.created",
  permissionDeleted: "permission.deleted",
  permissionUpdated: "permission.updated",
  pipesAccountConnectionAddFailed: "pipes.account_connection.add_failed",
  pipesAccountConnectionConnected: "pipes.account_connection.connected",
  pipesAccountConnectionConnectionFailed: "pipes.account_connection.connection_failed",
  pipesAccountConnectionDisconnected: "pipes.account_connection.disconnected",
  pipesAccountConnectionReauthorizationNeeded: "pipes.account_connection.reauthorization_needed",
  pipesConnectedAccountConnected: "pipes.connected_account.connected",
  pipesConnectedAccountConnectionFailed: "pipes.connected_account.connection_failed",
  pipesConnectedAccountDisconnected: "pipes.connected_account.disconnected",
  pipesConnectedAccountReauthorizationNeeded: "pipes.connected_account.reauthorization_needed",
  radarChallengeCreated: "radar.challenge_created",
  resourceExportCompleted: "resource_export.completed",
  resourceExportCreated: "resource_export.created",
  resourceExportDownloaded: "resource_export.downloaded",
  resourceExportFailed: "resource_export.failed",
  roleCreated: "role.created",
  roleDeleted: "role.deleted",
  roleUpdated: "role.updated",
  sessionCreated: "session.created",
  sessionRevoked: "session.revoked",
  userCreated: "user.created",
  userDeleted: "user.deleted",
  userUpdated: "user.updated",
  vaultByokKeyDeleted: "vault.byok_key.deleted",
  vaultByokKeyVerificationCompleted: "vault.byok_key.verification_completed",
  vaultDataCreated: "vault.data.created",
  vaultDataDeleted: "vault.data.deleted",
  vaultDataRead: "vault.data.read",
  vaultDataUpdated: "vault.data.updated",
  vaultDekDecrypted: "vault.dek.decrypted",
  vaultDekRead: "vault.dek.read",
  vaultKekCreated: "vault.kek.created",
  vaultKekDeleted: "vault.kek.deleted",
  vaultMetadataRead: "vault.metadata.read",
  vaultNamesListed: "vault.names.listed",
  waitlistUserApproved: "waitlist_user.approved",
  waitlistUserCreated: "waitlist_user.created",
  waitlistUserDenied: "waitlist_user.denied"
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/constants.js
var STORE_KEYS = {
  workosStore: "_workos_store",
  eventBus: "eventBus",
  apiKeyMap: "apiKeyMap",
  jwtTemplate: "jwt_template",
  interactiveAuth: "interactiveAuth",
  /** Set alongside interactiveAuth when the AuthKit login page should also ask for a password. */
  interactivePassword: "interactivePassword",
  allowedRedirectHosts: "allowedRedirectHosts"
};
var STORE_KEY_PREFIXES = {
  pendingAuth: "pending_auth:",
  /** A password the interactive page has checked, carried across the organization page instead of the password itself. */
  interactiveLogin: "interactive_login:",
  ssoToken: "sso_token:",
  ssoLogout: "sso_logout:",
  auditSchema: "audit_schema_",
  radarIpList: "radar_ip_list"
};
var DEFAULT_RESOURCE_TYPE_SLUG = "organization";
function isValidResourceTypeSlug(value) {
  return value === void 0 || typeof value === "string" && value.length > 0;
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/store.js
function getWorkOSStore(store) {
  const cached = store.getData(STORE_KEYS.workosStore);
  if (cached)
    return cached;
  const ws = {
    organizations: store.collection("workos.organizations", ID_PREFIXES.organization, [
      "name",
      "external_id"
    ]),
    organizationDomains: store.collection("workos.organization_domains", ID_PREFIXES.organization_domain, ["organization_id", "domain"]),
    organizationMemberships: store.collection("workos.organization_memberships", ID_PREFIXES.organization_membership, ["organization_id", "user_id"]),
    groups: store.collection("workos.groups", ID_PREFIXES.group, ["organization_id"]),
    groupMemberships: store.collection("workos.group_memberships", ID_PREFIXES.group_membership, ["group_id", "organization_membership_id"]),
    users: store.collection("workos.users", ID_PREFIXES.user, ["email", "external_id"]),
    sessions: store.collection("workos.sessions", ID_PREFIXES.session, ["user_id"]),
    emailVerifications: store.collection("workos.email_verifications", ID_PREFIXES.email_verification, ["user_id"]),
    passwordResets: store.collection("workos.password_resets", ID_PREFIXES.password_reset, [
      "user_id"
    ]),
    magicAuths: store.collection("workos.magic_auths", ID_PREFIXES.magic_auth, ["user_id"]),
    authFactors: store.collection("workos.auth_factors", ID_PREFIXES.authentication_factor, ["user_id"]),
    authCodes: store.collection("workos.auth_codes", ID_PREFIXES.authorization_code, [
      "user_id",
      "code"
    ]),
    externalAuthSessions: store.collection("workos.external_auth_sessions", ID_PREFIXES.external_auth_session, ["client_id"]),
    identities: store.collection("workos.identities", ID_PREFIXES.identity, ["user_id"]),
    connections: store.collection("workos.connections", ID_PREFIXES.connection, ["organization_id"]),
    ssoProfiles: store.collection("workos.sso_profiles", ID_PREFIXES.profile, [
      "connection_id",
      "email"
    ]),
    ssoAuthorizations: store.collection("workos.sso_authorizations", ID_PREFIXES.sso_authorization, ["code"]),
    pipeConnections: store.collection("workos.pipe_connections", ID_PREFIXES.pipe_connection, [
      "user_id",
      "provider"
    ]),
    refreshTokens: store.collection("workos.refresh_tokens", ID_PREFIXES.refresh_token, [
      "token",
      "user_id",
      "session_id"
    ]),
    authChallenges: store.collection("workos.auth_challenges", ID_PREFIXES.authentication_challenge, ["user_id", "factor_id"]),
    deviceAuthorizations: store.collection("workos.device_authorizations", ID_PREFIXES.device_authorization, ["device_code", "user_code"]),
    invitations: store.collection("workos.invitations", ID_PREFIXES.invitation, [
      "email",
      "token",
      "organization_id"
    ]),
    redirectUris: store.collection("workos.redirect_uris", ID_PREFIXES.redirect_uri, ["uri"]),
    corsOrigins: store.collection("workos.cors_origins", ID_PREFIXES.cors_origin, ["origin"]),
    authorizedApplications: store.collection("workos.authorized_applications", ID_PREFIXES.authorized_application, ["user_id"]),
    connectedAccounts: store.collection("workos.connected_accounts", ID_PREFIXES.connected_account, ["user_id", "provider"]),
    roles: store.collection("workos.roles", ID_PREFIXES.role, ["slug", "organization_id"]),
    permissions: store.collection("workos.permissions", ID_PREFIXES.permission, ["slug"]),
    rolePermissions: store.collection("workos.role_permissions", ID_PREFIXES.role_permission, [
      "role_id",
      "permission_id"
    ]),
    authorizationResources: store.collection("workos.authorization_resources", ID_PREFIXES.authorization_resource, ["organization_id", "resource_type_slug"]),
    roleAssignments: store.collection("workos.role_assignments", ID_PREFIXES.role_assignment, [
      "organization_membership_id",
      "role_id"
    ]),
    directories: store.collection("workos.directories", ID_PREFIXES.directory, ["organization_id"]),
    directoryUsers: store.collection("workos.directory_users", ID_PREFIXES.directory_user, [
      "directory_id",
      "organization_id"
    ]),
    directoryGroups: store.collection("workos.directory_groups", ID_PREFIXES.directory_group, [
      "directory_id",
      "organization_id"
    ]),
    auditLogActions: store.collection("workos.audit_log_actions", ID_PREFIXES.audit_log_action, [
      "name"
    ]),
    auditLogEvents: store.collection("workos.audit_log_events", ID_PREFIXES.audit_log_event, [
      "organization_id"
    ]),
    auditLogExports: store.collection("workos.audit_log_exports", ID_PREFIXES.audit_log_export, [
      "organization_id"
    ]),
    featureFlags: store.collection("workos.feature_flags", ID_PREFIXES.feature_flag, ["slug"]),
    flagTargets: store.collection("workos.flag_targets", ID_PREFIXES.flag_target, [
      "flag_slug",
      "resource_id"
    ]),
    connectApplications: store.collection("workos.connect_applications", ID_PREFIXES.connect_application, ["client_id"]),
    clientSecrets: store.collection("workos.client_secrets", ID_PREFIXES.client_secret, [
      "application_id"
    ]),
    dataIntegrationAuths: store.collection("workos.data_integration_auths", ID_PREFIXES.data_integration_auth, ["code", "slug"]),
    radarAttempts: store.collection("workos.radar_attempts", ID_PREFIXES.radar_attempt, [
      "ip_address"
    ]),
    apiKeyRecords: store.collection("workos.api_keys", ID_PREFIXES.api_key, ["key", "environment"]),
    vaultObjects: store.collection("workos.vault_objects", "vault", ["name"]),
    events: store.collection("workos.events", ID_PREFIXES.event, ["event"]),
    webhookEndpoints: store.collection("workos.webhook_endpoints", ID_PREFIXES.webhook_endpoint, ["endpoint_url"]),
    agentBlueprints: store.collection("workos.agent_blueprints", ID_PREFIXES.agent_blueprint, [
      "name"
    ]),
    agentInstances: store.collection("workos.agent_instances", ID_PREFIXES.agent_instance, [
      "agent_blueprint_id",
      "organization_id",
      "organization_membership_id"
    ]),
    agentInstanceSessions: store.collection("workos.agent_instance_sessions", ID_PREFIXES.agent_instance_session, ["agent_instance_id", "refresh_token", "parent_session_id", "user_session_id"])
  };
  store.setData(STORE_KEYS.workosStore, ws);
  return ws;
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/helpers.js
import { randomBytes, createHash as createHash2 } from "crypto";
import { isIPv6 } from "net";
import { domainToASCII } from "url";
var INTERNAL_FIELDS = /* @__PURE__ */ new Set(["password_hash", "code_challenge", "code_challenge_method"]);
function formatEntity(entity, opts) {
  const exclude = opts?.exclude ?? INTERNAL_FIELDS;
  const result = {};
  for (const [key, value] of Object.entries(entity)) {
    if (!exclude.has(key))
      result[key] = value;
  }
  return result;
}
function formatListResponse(result, formatter) {
  return {
    object: "list",
    data: result.data.map(formatter),
    list_metadata: result.list_metadata
  };
}
function formatOrganization(org, ws, opts) {
  const domains = (opts?.domains ?? ws.organizationDomains.findBy("organization_id", org.id)).map(formatDomain);
  const result = {
    object: "organization",
    id: org.id,
    name: org.name,
    allow_profiles_outside_organization: org.allow_profiles_outside_organization,
    external_id: org.external_id,
    metadata: org.metadata,
    domains,
    created_at: org.created_at,
    updated_at: org.updated_at
  };
  if (org.stripe_customer_id !== null) {
    result.stripe_customer_id = org.stripe_customer_id;
  }
  return result;
}
var DOMAIN_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "verification_token", "verification_prefix"]);
function formatDomain(domain) {
  return formatEntity(domain, { exclude: DOMAIN_EXCLUDE });
}
function formatMembership(m, ws) {
  const user = ws.users.get(m.user_id);
  if (!user) {
    throw new Error(`No user '${m.user_id}' for membership '${m.id}': the user was deleted without cascading, or the membership was inserted without validation`);
  }
  return {
    ...formatEntity(m),
    directory_managed: m.directory_managed ?? false,
    custom_attributes: {},
    roles: [m.role],
    user: formatUser(user)
  };
}
function formatMembershipEvent(m) {
  return {
    ...formatEntity(m),
    directory_managed: m.directory_managed ?? false,
    custom_attributes: {}
  };
}
function formatMembershipBase(m) {
  return {
    object: "organization_membership",
    id: m.id,
    user_id: m.user_id,
    organization_id: m.organization_id,
    status: m.status,
    directory_managed: m.directory_managed ?? false,
    custom_attributes: {},
    created_at: m.created_at,
    updated_at: m.updated_at
  };
}
function formatGroup(g) {
  return formatEntity(g);
}
var USER_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "impersonator", "oauth_provider"]);
function formatUser(user) {
  return formatEntity(user, { exclude: USER_EXCLUDE });
}
function formatSession(s) {
  return formatEntity(s);
}
var AUTH_METHOD_EVENT_TYPES = {
  OAuth: "oauth",
  Password: "password",
  MagicAuth: "magic_auth",
  EmailVerification: "email_verification",
  MFA: "mfa",
  SSO: "sso"
};
var AUTH_METHOD_SESSION_VALUES = {
  OAuth: "oauth",
  Password: "password",
  MagicAuth: "magic_code",
  SSO: "sso",
  MFA: "unknown",
  EmailVerification: "unknown"
};
function resolveResponseAuthMethod(method, opts) {
  switch (method) {
    case "OAuth":
      return opts?.oauthProvider ?? void 0;
    case "MFA":
    case "EmailVerification":
      return void 0;
    default:
      return method;
  }
}
var SESSION_AUTH_METHOD_RESPONSE_VALUES = {
  password: "Password",
  magic_code: "MagicAuth",
  sso: "SSO",
  passkey: "Passkey",
  cross_app_auth: "CrossAppAuth",
  external_auth: "ExternalAuth",
  impersonation: "Impersonation",
  migrated_session: "MigratedSession"
};
function resolveSessionResponseAuthMethod(sessionAuthMethod, opts) {
  if (sessionAuthMethod === "oauth")
    return opts?.oauthProvider ?? void 0;
  return SESSION_AUTH_METHOD_RESPONSE_VALUES[sessionAuthMethod];
}
var AUTH_EVENTS = {
  OAuth: { succeeded: EVENTS.authenticationOauthSucceeded, failed: EVENTS.authenticationOauthFailed },
  Password: { succeeded: EVENTS.authenticationPasswordSucceeded, failed: EVENTS.authenticationPasswordFailed },
  MagicAuth: { succeeded: EVENTS.authenticationMagicAuthSucceeded, failed: EVENTS.authenticationMagicAuthFailed },
  EmailVerification: {
    succeeded: EVENTS.authenticationEmailVerificationSucceeded,
    failed: EVENTS.authenticationEmailVerificationFailed
  },
  MFA: { succeeded: EVENTS.authenticationMfaSucceeded, failed: EVENTS.authenticationMfaFailed },
  SSO: { succeeded: EVENTS.authenticationSsoSucceeded, failed: EVENTS.authenticationSsoFailed }
};
function buildAuthenticationEventData(opts) {
  const data = {
    type: AUTH_METHOD_EVENT_TYPES[opts.method] ?? opts.method.toLowerCase(),
    status: opts.status,
    user_id: opts.userId ?? null,
    email: opts.email ?? null,
    ip_address: opts.ipAddress ?? null,
    user_agent: opts.userAgent ?? null,
    ...opts.error ? { error: opts.error } : {},
    ...opts.sso ? { sso: opts.sso } : {}
  };
  return { ...data };
}
function emitAuthenticationEvent(opts) {
  const { eventBus, method, status, ...eventData } = opts;
  if (!eventBus)
    return;
  const authEvent = AUTH_EVENTS[method];
  if (!authEvent)
    return;
  const eventName = status === "succeeded" ? authEvent.succeeded : authEvent.failed;
  eventBus.emit({
    event: eventName,
    data: buildAuthenticationEventData({
      status,
      method,
      ...eventData
    })
  });
}
function formatEmailVerification(ev) {
  return formatEntity(ev);
}
var PASSWORD_RESET_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "updated_at"]);
function formatPasswordReset(pr) {
  return formatEntity(pr, { exclude: PASSWORD_RESET_EXCLUDE });
}
function formatMagicAuth(ma) {
  return formatEntity(ma);
}
var BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var BASE32_SECRET = /^[A-Z2-7]+=*$/;
function newTotp(issuer, user, secret) {
  secret ??= Array.from(randomBytes(32), (b) => BASE32_ALPHABET[b & 31]).join("");
  const issuerParam = encodeURIComponent(issuer);
  return {
    issuer,
    user,
    secret,
    uri: `otpauth://totp/${issuerParam}:${encodeURIComponent(user)}?secret=${secret}&issuer=${issuerParam}`
  };
}
var TOTP_QR_CODE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
function formatAuthFactor(f) {
  return { ...formatEntity(f), totp: { issuer: f.totp.issuer, user: f.totp.user } };
}
function formatAuthFactorEnrolled(f) {
  return { ...formatEntity(f), totp: { ...f.totp, qr_code: TOTP_QR_CODE } };
}
function formatIdentity(i) {
  return { idp_id: i.idp_id, type: i.type, provider: i.provider };
}
function linkOAuthIdentity(ws, userId, provider, idpId) {
  if (ws.identities.findBy("user_id", userId).some((i) => i.provider === provider))
    return;
  ws.identities.insert({
    object: "identity",
    user_id: userId,
    provider,
    idp_id: idpId,
    type: "OAuth"
  });
}
function generateVerificationToken() {
  return randomBytes(16).toString("hex");
}
function generateCode() {
  return String(Math.floor(1e5 + Math.random() * 9e5));
}
function isEmailShaped(value) {
  const at = value.indexOf("@");
  return at > 0 && at === value.lastIndexOf("@") && at < value.length - 1 && !/\s/.test(value);
}
var EMAIL_PROBLEM_MESSAGES = {
  missing: "email is required",
  not_a_string: "email must be a string",
  malformed: "email must be a valid email address"
};
var EMAIL_PROBLEM_FIELD_CODES = {
  missing: "required",
  not_a_string: "invalid_type",
  malformed: "invalid"
};
function normalizeEmail(value, opts) {
  if (value === void 0 || value === null)
    return { ok: false, problem: "missing" };
  if (typeof value !== "string")
    return { ok: false, problem: "not_a_string" };
  const email = value.trim();
  if (!email)
    return { ok: false, problem: "missing" };
  if (opts?.requireShape && !isEmailShaped(email))
    return { ok: false, problem: "malformed" };
  return { ok: true, email };
}
function requireEmailString(value, opts) {
  const result = normalizeEmail(value, opts);
  if (result.ok)
    return result.email;
  if (result.problem === "missing")
    return "";
  throw new WorkOSApiError(400, EMAIL_PROBLEM_MESSAGES[result.problem], "invalid_request");
}
function requireEmailField(value, opts) {
  const result = normalizeEmail(value, opts);
  if (result.ok)
    return result.email;
  throw validationError(EMAIL_PROBLEM_MESSAGES[result.problem], [
    { field: "email", code: EMAIL_PROBLEM_FIELD_CODES[result.problem] }
  ]);
}
function emailsMatch(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
function findUserByEmail(ws, email) {
  const exact = ws.users.findOneBy("email", email);
  if (exact)
    return exact;
  return ws.users.all().find((u) => emailsMatch(u.email, email));
}
function liveMembershipFor(ws, organizationId, userId) {
  return ws.organizationMemberships.findBy("organization_id", organizationId).find((m) => m.user_id === userId && m.status !== "inactive");
}
function hashPassword(password) {
  return createHash2("sha256").update(password).digest("hex");
}
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
function expiresIn(minutes) {
  return new Date(Date.now() + minutes * 60 * 1e3).toISOString();
}
function isExpired(expiresAt) {
  return new Date(expiresAt).getTime() < Date.now();
}
function formatConnection(conn) {
  return formatEntity(conn);
}
function formatSSOProfile(p) {
  return formatEntity(p);
}
function formatPipeConnection(pc) {
  return formatEntity(pc);
}
function formatInvitation(inv) {
  return formatEntity(inv);
}
function acceptInvitation(inv, user, ws, eventBus) {
  ws.invitations.update(inv.id, {
    state: "accepted",
    accepted_at: (/* @__PURE__ */ new Date()).toISOString(),
    accepted_user_id: user?.id ?? null
  });
  eventBus?.emit({ event: EVENTS.invitationAccepted, data: formatInvitation(ws.invitations.get(inv.id)) });
  if (!inv.organization_id)
    return null;
  if (user) {
    const roleSlug = inv.role_slug ?? "member";
    const existing = ws.organizationMemberships.findBy("organization_id", inv.organization_id).find((m) => m.user_id === user.id);
    if (!existing) {
      ws.organizationMemberships.insert({
        object: "organization_membership",
        organization_id: inv.organization_id,
        user_id: user.id,
        role: { slug: roleSlug },
        status: "active",
        external_id: null,
        metadata: {}
      });
    } else if (existing.status !== "active") {
      ws.organizationMemberships.update(existing.id, { status: "active", role: { slug: roleSlug } });
    }
  }
  return inv.organization_id;
}
function formatRedirectUri(r) {
  return formatEntity(r);
}
function formatCorsOrigin(o) {
  return formatEntity(o);
}
function formatAuthorizedApplication(a) {
  return formatEntity(a);
}
var CONNECTED_ACCOUNT_INTERNAL_FIELDS = /* @__PURE__ */ new Set([
  "provider",
  "data_integration_id",
  "access_token",
  "refresh_token",
  "token_expires_at"
]);
function formatConnectedAccount(a) {
  return formatEntity(a, { exclude: CONNECTED_ACCOUNT_INTERNAL_FIELDS });
}
function formatConnectedAccountEvent(a, state = a.state) {
  return {
    ...formatConnectedAccount(a),
    state,
    provider_slug: a.provider,
    data_integration_id: a.data_integration_id
  };
}
function dataIntegrationIdFor(ws, slug) {
  const existing = ws.connectedAccounts.findBy("provider", slug)[0];
  return existing?.data_integration_id ?? generateId(ID_PREFIXES.data_integration);
}
function findConnectedAccount(ws, userId, slug, organizationId) {
  const matches = ws.connectedAccounts.findBy("user_id", userId).filter((a) => a.provider === slug && (organizationId === null || a.organization_id === organizationId));
  if (matches.length > 1) {
    throw new WorkOSApiError(409, `Several connected accounts match provider '${slug}' for this user; name one with organization_id`, "conflict");
  }
  return matches[0];
}
var DEFAULT_ALLOWED_REDIRECT_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
var ANY_HOST = "*";
function normalizeRedirectHost(value) {
  let host = value.trim().toLowerCase();
  if (host === ANY_HOST)
    return host;
  if (host.includes("://")) {
    try {
      host = new URL(host).hostname;
    } catch {
      host = "";
    }
  } else if (host.startsWith("[")) {
    host = host.slice(0, host.indexOf("]") + 1);
  } else {
    if (host.includes(":")) {
      const portIndex = host.lastIndexOf(":");
      const port = host.slice(portIndex + 1);
      host = /^\d+$/.test(port) && !host.slice(0, portIndex).includes(":") ? host.slice(0, portIndex) : `[${host}]`;
    }
    if (!host.startsWith("["))
      host = toAsciiHost(host);
  }
  if (host.startsWith("["))
    host = canonicalizeIpv6Host(host);
  host = stripTrailingDot(host);
  if (host === ANY_HOST) {
    throw new Error(`Invalid redirect host: ${JSON.stringify(value)} \u2014 write "*" to allow any host`);
  }
  if (!isMatchableHostPattern(host))
    throw invalidRedirectHost(value);
  host = canonicalizeDnsHost(host);
  if (!isMatchableHostPattern(host))
    throw invalidRedirectHost(value);
  return host;
}
function invalidRedirectHost(value) {
  return new Error(`Invalid redirect host: ${JSON.stringify(value)}`);
}
function canonicalizeDnsHost(host) {
  if (host.startsWith("["))
    return host;
  const wildcard = host.startsWith("*.");
  const bare = wildcard ? host.slice(2) : host;
  let canonical;
  try {
    canonical = new URL(`http://${bare}/`).hostname;
  } catch {
    return "";
  }
  return wildcard ? `*.${canonical}` : canonical;
}
function canonicalizeIpv6Host(host) {
  try {
    return new URL(`http://${host}/`).hostname;
  } catch {
    return "";
  }
}
function stripTrailingDot(host) {
  if (host === `${ANY_HOST}.` || !host.endsWith("."))
    return host;
  return host.slice(0, -1);
}
function toAsciiHost(host) {
  if (/[/\\?#\s]/.test(host))
    return "";
  if (!/[^ -~]/.test(host))
    return host;
  const wildcard = host.startsWith("*.");
  const ascii = domainToASCII(wildcard ? host.slice(2) : host);
  if (!ascii)
    return "";
  return wildcard ? `*.${ascii}` : ascii;
}
var HOSTNAME = /^[a-z0-9_]([a-z0-9_-]*[a-z0-9_])?(\.[a-z0-9_]([a-z0-9_-]*[a-z0-9_])?)*$/;
function isMatchableHostPattern(host) {
  if (host === ANY_HOST)
    return true;
  const bare = host.startsWith("*.") ? host.slice(2) : host;
  if (!bare)
    return false;
  if (bare.startsWith("[")) {
    return bare.endsWith("]") && isIPv6(bare.slice(1, -1));
  }
  return HOSTNAME.test(bare);
}
function normalizeRedirectHosts(values) {
  return values.filter((value) => value.trim() !== "").map(normalizeRedirectHost);
}
var SCRIPT_REDIRECT_SCHEMES = /* @__PURE__ */ new Set(["javascript:", "data:", "vbscript:", "blob:", "file:"]);
function hasForbiddenUriChar(uri) {
  for (let i = 0; i < uri.length; i++) {
    const code = uri.charCodeAt(i);
    if (code < 32 || code === 127)
      return true;
  }
  return false;
}
function hostMatches(hostname, pattern) {
  if (pattern === ANY_HOST)
    return true;
  if (pattern.startsWith("*."))
    return hostname.endsWith(pattern.slice(1));
  return hostname === pattern;
}
function assertAllowedRedirectUri(uri, store) {
  if (hasForbiddenUriChar(uri)) {
    throw new WorkOSApiError(400, "Invalid redirect_uri", "invalid_redirect_uri");
  }
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new WorkOSApiError(400, "Invalid redirect_uri", "invalid_redirect_uri");
  }
  if (SCRIPT_REDIRECT_SCHEMES.has(parsed.protocol) || parsed.hostname === "") {
    throw new WorkOSApiError(400, `redirect_uri scheme ${parsed.protocol.slice(0, -1)} is not allowed`, "invalid_redirect_uri");
  }
  const configured = store.getData(STORE_KEYS.allowedRedirectHosts) ?? [];
  const allowed = [...DEFAULT_ALLOWED_REDIRECT_HOSTS, ...configured];
  const hostname = stripTrailingDot(parsed.hostname.toLowerCase());
  if (allowed.some((pattern) => hostMatches(hostname, pattern)))
    return;
  const howToWiden = "Pass --redirect-hosts (or allowedRedirectHosts) to allow other hosts.";
  throw new WorkOSApiError(400, configured.length > 0 ? `redirect_uri host ${parsed.hostname} is not allowed; allowed hosts: ${allowed.join(", ")}` : `redirect_uri must point to localhost, got ${parsed.hostname}. ${howToWiden}`, "invalid_redirect_uri");
}
var AUTH_CHALLENGE_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "code", "user_id", "factor_id"]);
function formatAuthChallenge(c) {
  return { ...formatEntity(c, { exclude: AUTH_CHALLENGE_EXCLUDE }), authentication_factor_id: c.factor_id };
}
function formatRole(role, ws) {
  const permissions = ws.rolePermissions.findBy("role_id", role.id).map((rp) => ws.permissions.get(rp.permission_id)?.slug).filter((slug) => typeof slug === "string");
  return {
    ...formatEntity(role),
    permissions,
    // Rows persisted before roles carried a scope still format with the default.
    resource_type_slug: role.resource_type_slug ?? DEFAULT_RESOURCE_TYPE_SLUG
  };
}
function formatPermission(p) {
  return {
    ...formatEntity(p),
    // The emulator has no WorkOS-managed system permissions; everything is user-defined.
    system: false,
    // Rows inserted without a scope (direct store inserts, pre-scope releases)
    // still format with the default so the spec-required key is always present.
    resource_type_slug: p.resource_type_slug ?? DEFAULT_RESOURCE_TYPE_SLUG
  };
}
function formatAuthorizationResource(r) {
  return {
    ...formatEntity(r),
    // Rows persisted by pre-0.11 releases predate these columns; the
    // production shape always carries the keys.
    name: r.name ?? null,
    description: r.description ?? null,
    parent_resource_id: r.parent_resource_id ?? null
  };
}
function formatRoleAssignment(ra) {
  return {
    object: "role_assignment",
    id: ra.id,
    organization_membership_id: ra.organization_membership_id,
    // role_id is not part of the production shape, but is kept for
    // compatibility with earlier emulator releases.
    role_id: ra.role_id,
    role: { slug: ra.role_slug ?? null },
    resource: {
      id: ra.resource_id ?? null,
      external_id: ra.resource_external_id ?? null,
      resource_type_slug: ra.resource_type_slug ?? null
    },
    source: { type: "direct", group_role_assignment_id: null },
    created_at: ra.created_at,
    updated_at: ra.updated_at
  };
}
function formatDeviceAuthorization(d, baseUrl) {
  return {
    device_code: d.device_code,
    user_code: d.user_code,
    verification_uri: `${baseUrl}/user_management/authorize/device/verify`,
    expires_in: Math.max(0, Math.floor((new Date(d.expires_at).getTime() - Date.now()) / 1e3)),
    interval: d.interval
  };
}
function formatDirectory(d) {
  return formatEntity(d);
}
function formatDirectoryUser(u) {
  return formatEntity(u);
}
function formatDirectoryGroup(g) {
  return formatEntity(g);
}
function formatAuditLogAction(a) {
  return formatEntity(a);
}
function formatAuditLogEvent(e) {
  return formatEntity(e);
}
function formatAuditLogExport(ex) {
  return formatEntity(ex);
}
function formatFeatureFlag(f) {
  return {
    object: "feature_flag",
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    owner: f.owner,
    tags: f.tags,
    enabled: f.enabled,
    default_value: f.default_value,
    created_at: f.created_at,
    updated_at: f.updated_at
  };
}
function formatFeatureFlagEvent(f, environmentId) {
  const { object, id, ...rest } = formatFeatureFlag(f);
  return { object, id, environment_id: environmentId, ...rest };
}
function apiKeyActor(ws, apiKey) {
  const record = apiKey ? ws.apiKeyRecords.findOneBy("key", apiKey) : void 0;
  return { id: record?.id ?? "api_key_emulator", name: record?.name ?? "Emulator API key" };
}
function generateClientId() {
  return `client_${generateId("").slice(1)}`;
}
function formatConnectApplication(a) {
  const base = {
    object: "connect_application",
    id: a.id,
    client_id: a.client_id,
    description: a.description,
    name: a.name,
    scopes: a.scopes,
    created_at: a.created_at,
    updated_at: a.updated_at
  };
  if (a.application_type === "m2m") {
    return { ...base, application_type: "m2m", organization_id: a.organization_id, audience: a.audience };
  }
  const oauth = {
    ...base,
    application_type: "oauth",
    redirect_uris: a.redirect_uris.map((uri) => ({ uri, default: false })),
    uses_pkce: a.uses_pkce
  };
  if (a.is_first_party)
    return { ...oauth, is_first_party: true };
  if (a.was_dynamically_registered)
    return { ...oauth, is_first_party: false, was_dynamically_registered: true };
  return {
    ...oauth,
    is_first_party: false,
    was_dynamically_registered: false,
    organization_id: a.organization_id
  };
}
var CLIENT_SECRET_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "value", "application_id"]);
function formatClientSecret(s) {
  return formatEntity(s, { exclude: CLIENT_SECRET_EXCLUDE });
}
function formatRadarAttempt(a) {
  return formatEntity(a);
}
function obfuscateApiKey(key) {
  const prefix = key.startsWith("sk_") ? "sk_" : key.slice(0, 3);
  return `${prefix}...${key.slice(-4)}`;
}
function revokeApiKeysForOwner(store, ws, matches) {
  const apiKeyMap = store.getData(STORE_KEYS.apiKeyMap);
  for (const key of ws.apiKeyRecords.all().filter((k) => matches(k.owner))) {
    ws.apiKeyRecords.delete(key.id);
    if (apiKeyMap)
      delete apiKeyMap[key.key];
  }
}
function apiKeyOrganizationId(k) {
  return k.owner.type === "organization" ? k.owner.id : k.owner.organization_id;
}
function issueApiKey(store, ws, input) {
  const value = `sk_${input.environment === "production" ? "live" : "test"}_${generateVerificationToken()}`;
  const record = ws.apiKeyRecords.insert({
    object: "api_key",
    name: input.name,
    key: value,
    environment: input.environment,
    owner: input.owner,
    permissions: input.permissions,
    last_used_at: null,
    expires_at: input.expiresAt
  });
  const apiKeyMap = store.getData(STORE_KEYS.apiKeyMap) ?? {};
  apiKeyMap[value] = { environment: input.environment, expiresAt: record.expires_at };
  store.setData(STORE_KEYS.apiKeyMap, apiKeyMap);
  return { record, value };
}
function deleteApiKey(store, ws, record) {
  ws.apiKeyRecords.delete(record.id);
  const apiKeyMap = store.getData(STORE_KEYS.apiKeyMap);
  if (apiKeyMap)
    delete apiKeyMap[record.key];
}
function isApiKeyExpired(record) {
  return record.expires_at !== null && Date.parse(record.expires_at) <= Date.now();
}
function expireApiKey(store, ws, record, expiresAt) {
  if (isApiKeyExpired(record)) {
    throw new WorkOSApiError(409, "API key is already expired", "api_key_already_expired");
  }
  const next = expiresAt === null ? null : typeof expiresAt === "string" && Date.parse(expiresAt) > Date.now() ? expiresAt : (/* @__PURE__ */ new Date()).toISOString();
  const updated = ws.apiKeyRecords.update(record.id, { expires_at: next });
  const apiKeyMap = store.getData(STORE_KEYS.apiKeyMap);
  if (apiKeyMap?.[record.key])
    apiKeyMap[record.key].expiresAt = next;
  return updated;
}
function formatApiKeyRecord(k) {
  return {
    object: "api_key",
    id: k.id,
    owner: k.owner,
    name: k.name,
    obfuscated_value: obfuscateApiKey(k.key),
    last_used_at: k.last_used_at,
    expires_at: k.expires_at,
    permissions: k.permissions,
    created_at: k.created_at,
    updated_at: k.updated_at
  };
}
var EVENT_EXCLUDE = /* @__PURE__ */ new Set([...INTERNAL_FIELDS, "updated_at", "organization_id"]);
function formatEvent(e) {
  return formatEntity(e, { exclude: EVENT_EXCLUDE });
}
function formatWebhookEndpoint(ep, opts) {
  return {
    object: "webhook_endpoint",
    id: ep.id,
    endpoint_url: ep.endpoint_url,
    secret: opts?.includeSecret ? ep.secret : `${ep.secret.slice(0, 8)}****`,
    enabled: ep.enabled,
    events: ep.events,
    description: ep.description,
    created_at: ep.created_at,
    updated_at: ep.updated_at
  };
}
function formatAgentBlueprint(b) {
  return {
    object: "agent_blueprint",
    id: b.id,
    name: b.name,
    description: b.description,
    permissions: b.permissions,
    invocable_by: {
      role_slugs: b.invocable_by.role_slugs,
      organization_ids: b.invocable_by.organization_ids
    },
    session_settings: {
      max_age_seconds: b.session_settings.max_age_seconds,
      access_token_ttl_seconds: b.session_settings.access_token_ttl_seconds,
      refresh_token_ttl_seconds: b.session_settings.refresh_token_ttl_seconds
    },
    created_at: b.created_at,
    updated_at: b.updated_at
  };
}
function formatAgentInstance(i) {
  return {
    object: "agent_instance",
    id: i.id,
    agent_blueprint_id: i.agent_blueprint_id,
    organization_id: i.organization_id,
    organization_membership_id: i.organization_membership_id,
    type: i.type,
    created_at: i.created_at,
    updated_at: i.updated_at
  };
}
function agentSessionStatus(s, now = Date.now()) {
  if (s.revoked_at !== null)
    return "revoked";
  if (new Date(s.expires_at).getTime() <= now)
    return "expired";
  return "active";
}
function formatAgentInstanceSession(s) {
  return {
    object: "agent_instance_session",
    id: s.id,
    agent_instance_id: s.agent_instance_id,
    status: agentSessionStatus(s),
    expires_at: s.expires_at,
    revoked_at: s.revoked_at,
    created_at: s.created_at,
    updated_at: s.updated_at
  };
}
function formatAgentInstanceSessionEvent(s, organizationId, opts) {
  return {
    object: "agent_instance_session",
    id: s.id,
    agent_instance_id: s.agent_instance_id,
    organization_id: organizationId,
    expires_at: s.expires_at,
    revoked_at: s.revoked_at,
    created_at: s.created_at,
    updated_at: s.updated_at,
    ...opts ? { permission_slugs: opts.permissionSlugs } : {}
  };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/role-helpers.js
function findEnvRole(ws, slug) {
  return ws.roles.findBy("slug", slug).find((r) => r.type === "EnvironmentRole" && r.organization_id === null);
}
function findOrgRole(ws, orgId, slug) {
  return ws.roles.findBy("organization_id", orgId).find((r) => r.slug === slug && r.type === "OrganizationRole");
}
function resolvePrimaryRole(ws, organizationId, slug) {
  const candidates = ws.roles.findBy("slug", slug);
  return candidates.find((r) => r.organization_id === organizationId) ?? candidates.find((r) => r.type === "EnvironmentRole" && r.organization_id === null);
}
function requireEnvRole(ws, slug) {
  const role = findEnvRole(ws, slug);
  if (!role)
    throw notFound("Role");
  return role;
}
function requireOrgRole(ws, orgId, slug) {
  const role = findOrgRole(ws, orgId, slug);
  if (!role)
    throw notFound("Role");
  return role;
}
function getRolePermissions(ws, roleId) {
  const rps = ws.rolePermissions.findBy("role_id", roleId);
  return rps.map((rp) => ws.permissions.get(rp.permission_id)).filter(Boolean);
}
function replaceRolePermissions(ws, roleId, permissionSlugs) {
  const next = /* @__PURE__ */ new Map();
  for (const permSlug of permissionSlugs) {
    const perm = ws.permissions.findOneBy("slug", permSlug);
    if (!perm)
      throw notFound("Permission");
    next.set(perm.id, perm);
  }
  const current = new Set(ws.rolePermissions.findBy("role_id", roleId).map((rp) => rp.permission_id));
  const changed = current.size !== next.size || [...next.keys()].some((id) => !current.has(id));
  if (!changed)
    return false;
  ws.rolePermissions.deleteBy("role_id", roleId);
  for (const perm of next.values()) {
    ws.rolePermissions.insert({ role_id: roleId, permission_id: perm.id });
  }
  return true;
}
function emitRolePermissionsUpdated(store, ws, role) {
  store.getData(STORE_KEYS.eventBus)?.emit({
    event: role.type === "OrganizationRole" ? EVENTS.organizationRoleUpdated : EVENTS.roleUpdated,
    data: formatRole(role, ws)
  });
}
function registerRoleRoutes(ctx, config) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const { pathPrefix } = config;
  app.post(pathPrefix, async (c) => {
    config.validateBeforeCreate?.(ws, c);
    const body = await parseJsonBody(c);
    const slug = body.slug;
    const name = body.name;
    const resourceTypeSlug = body.resource_type_slug;
    if (!slug || typeof slug !== "string") {
      throw validationError("slug is required", [{ field: "slug", code: "required" }]);
    }
    if (!name || typeof name !== "string") {
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    }
    if (!isValidResourceTypeSlug(resourceTypeSlug)) {
      throw validationError("resource_type_slug must be a non-empty string", [
        { field: "resource_type_slug", code: "invalid" }
      ]);
    }
    const existing = config.findRole(ws, c, slug);
    if (existing) {
      throw new WorkOSApiError(409, config.duplicateMessage, config.duplicateCode);
    }
    const defaults = config.insertDefaults(c);
    const role = ws.roles.insert({
      object: "role",
      slug,
      name,
      description: body.description ?? null,
      type: config.roleType,
      organization_id: defaults.organization_id ?? null,
      is_default_role: Boolean(body.is_default_role),
      priority: typeof body.priority === "number" ? body.priority : 0,
      resource_type_slug: resourceTypeSlug ?? DEFAULT_RESOURCE_TYPE_SLUG
    });
    return c.json(formatRole(role, ws), 201);
  });
  app.get(pathPrefix, (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.roles.list({
      ...params,
      filter: config.listFilter(c)
    });
    return c.json(formatListResponse(result, (r) => formatRole(r, ws)));
  });
  app.get(`${pathPrefix}/:slug`, (c) => {
    const role = config.requireRole(ws, c);
    return c.json(formatRole(role, ws));
  });
  app.patch(`${pathPrefix}/:slug`, async (c) => {
    const role = config.requireRole(ws, c);
    const body = await parseJsonBody(c);
    const updates = {};
    if ("name" in body)
      updates.name = body.name;
    if ("description" in body)
      updates.description = body.description ?? null;
    if ("is_default_role" in body)
      updates.is_default_role = Boolean(body.is_default_role);
    if ("priority" in body)
      updates.priority = body.priority;
    const updated = ws.roles.update(role.id, updates);
    return c.json(formatRole(updated, ws));
  });
  app.delete(`${pathPrefix}/:slug`, (c) => {
    const role = config.requireRole(ws, c);
    ws.roles.delete(role.id);
    ws.rolePermissions.deleteBy("role_id", role.id);
    ws.roleAssignments.deleteBy("role_id", role.id);
    return c.body(null, 204);
  });
  app.get(`${pathPrefix}/:slug/permissions`, (c) => {
    const role = config.requireRole(ws, c);
    const permissions = getRolePermissions(ws, role.id);
    return c.json({
      object: "list",
      data: permissions.map((p) => formatPermission(p)),
      list_metadata: { before: null, after: null }
    });
  });
  app.put(`${pathPrefix}/:slug/permissions`, async (c) => {
    const role = config.requireRole(ws, c);
    const body = await parseJsonBody(c);
    const permissionSlugs = body.permissions;
    if (!Array.isArray(permissionSlugs) || permissionSlugs.some((slug) => typeof slug !== "string")) {
      throw validationError("permissions must be an array of slugs", [{ field: "permissions", code: "invalid" }]);
    }
    if (replaceRolePermissions(ws, role.id, permissionSlugs)) {
      emitRolePermissionsUpdated(store, ws, role);
    }
    return c.json(formatRole(role, ws));
  });
  app.post(`${pathPrefix}/:slug/permissions`, async (c) => {
    const role = config.requireRole(ws, c);
    const body = await parseJsonBody(c);
    const slug = body.slug;
    if (!slug || typeof slug !== "string") {
      throw validationError("slug is required", [{ field: "slug", code: "required" }]);
    }
    const permission = ws.permissions.findOneBy("slug", slug);
    if (!permission)
      throw notFound("Permission");
    const attached = ws.rolePermissions.findBy("role_id", role.id).some((rp) => rp.permission_id === permission.id);
    if (!attached) {
      ws.rolePermissions.insert({ role_id: role.id, permission_id: permission.id });
      emitRolePermissionsUpdated(store, ws, role);
    }
    return c.json(formatRole(role, ws));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/agent-sessions.js
var MAX_AGENT_CHAIN_DEPTH = 32;
var AGENT_SUBJECT_PROFILE = "ai_agent";
var USER_SUBJECT_PROFILE = "user";
var AGENT_SESSION_SETTING_LIMITS = {
  max_age_seconds: 31536e3,
  access_token_ttl_seconds: 3600,
  refresh_token_ttl_seconds: 5184e3
};
var DEFAULT_AGENT_SESSION_SETTINGS = {
  max_age_seconds: 3600,
  access_token_ttl_seconds: 300,
  refresh_token_ttl_seconds: 3600
};
function isUserSessionLive(session, now = Date.now()) {
  return !!session && session.status === "active" && new Date(session.expires_at).getTime() > now;
}
function isOrganizationInvocable(blueprint, organizationId) {
  const ids = blueprint.invocable_by.organization_ids;
  return ids.length === 0 || ids.includes(organizationId);
}
function membershipPermissionSlugs(ws, organizationId, roleSlug) {
  const role = resolvePrimaryRole(ws, organizationId, roleSlug);
  return role ? getRolePermissions(ws, role.id).map((p) => p.slug) : [];
}
function isRoleInvocable(blueprint, roleSlug) {
  const slugs = blueprint.invocable_by.role_slugs;
  return slugs.length === 0 || slugs.includes(roleSlug);
}
function intersectPermissions(blueprint, granted) {
  const held = new Set(granted);
  return blueprint.permissions.filter((slug) => held.has(slug));
}
function findChainRoot(ws, session) {
  let current = session;
  let depth = 0;
  let ancestorRevoked = false;
  while (current.parent_session_id !== null && depth < MAX_AGENT_CHAIN_DEPTH) {
    const parent = ws.agentInstanceSessions.get(current.parent_session_id);
    if (!parent) {
      ancestorRevoked = true;
      break;
    }
    if (parent.revoked_at !== null)
      ancestorRevoked = true;
    current = parent;
    depth += 1;
  }
  return { root: current, depth, ancestorRevoked };
}
function isSessionLive(session, nowMs) {
  return session.revoked_at === null && new Date(session.expires_at).getTime() > nowMs;
}
function revokeAgentSessionTree(ws, sessionId, revokedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const nowMs = new Date(revokedAt).getTime();
  let count = 0;
  const pending = [sessionId];
  const seen = /* @__PURE__ */ new Set();
  while (pending.length > 0) {
    const id = pending.pop();
    if (seen.has(id))
      continue;
    seen.add(id);
    const session = ws.agentInstanceSessions.get(id);
    if (!session)
      continue;
    if (isSessionLive(session, nowMs)) {
      ws.agentInstanceSessions.update(id, { revoked_at: revokedAt });
      count += 1;
    }
    for (const child of ws.agentInstanceSessions.findBy("parent_session_id", id))
      pending.push(child.id);
  }
  return count;
}
function deleteAgentInstance(ws, instance) {
  const sessions = ws.agentInstanceSessions.findBy("agent_instance_id", instance.id);
  const revokedAt = (/* @__PURE__ */ new Date()).toISOString();
  for (const session of sessions) {
    if (isSessionLive(session, new Date(revokedAt).getTime())) {
      ws.agentInstanceSessions.update(session.id, { revoked_at: revokedAt });
    }
  }
  for (const session of sessions)
    ws.agentInstanceSessions.delete(session.id);
  ws.agentInstances.delete(instance.id);
}
function deleteAgentBlueprint(ws, blueprint) {
  for (const instance of ws.agentInstances.findBy("agent_blueprint_id", blueprint.id)) {
    deleteAgentInstance(ws, instance);
  }
  ws.agentBlueprints.delete(blueprint.id);
}
function deleteAgentInstancesForOrganization(ws, organizationId) {
  for (const instance of ws.agentInstances.findBy("organization_id", organizationId)) {
    deleteAgentInstance(ws, instance);
  }
}
function deleteAgentInstancesForMembership(ws, membershipId) {
  for (const instance of ws.agentInstances.findBy("organization_membership_id", membershipId)) {
    deleteAgentInstance(ws, instance);
  }
}
function revokeAgentSessionsForMembership(ws, membershipId) {
  for (const instance of ws.agentInstances.findBy("organization_membership_id", membershipId)) {
    for (const session of ws.agentInstanceSessions.findBy("agent_instance_id", instance.id)) {
      revokeAgentSessionTree(ws, session.id);
    }
  }
}
function removePermissionFromAgentBlueprints(ws, slug) {
  for (const blueprint of ws.agentBlueprints.all()) {
    if (!blueprint.permissions.includes(slug))
      continue;
    ws.agentBlueprints.update(blueprint.id, {
      permissions: blueprint.permissions.filter((p) => p !== slug)
    });
  }
}
function revokeAgentSessionsForUserSession(ws, userSessionId) {
  for (const root of ws.agentInstanceSessions.findBy("user_session_id", userSessionId)) {
    revokeAgentSessionTree(ws, root.id);
  }
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/organizations.js
function organizationRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/organizations", async (c) => {
    const body = await parseJsonBody(c);
    const name = body.name;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw validationError("Name is required", [{ field: "name", code: "required" }]);
    }
    const org = ws.organizations.insert({
      object: "organization",
      name: name.trim(),
      external_id: body.external_id ?? null,
      metadata: body.metadata ?? {},
      stripe_customer_id: null,
      allow_profiles_outside_organization: false,
      // Not in the spec's create shape; entitlements are seeded, not set over the API.
      entitlements: []
    });
    syncOrganizationResource(ws, org);
    const domainData = body.domain_data;
    if (domainData && Array.isArray(domainData)) {
      for (const dd of domainData) {
        ws.organizationDomains.insert({
          object: "organization_domain",
          organization_id: org.id,
          domain: dd.domain,
          state: dd.state === "verified" ? "verified" : "pending",
          verification_strategy: "manual",
          verification_token: generateVerificationToken(),
          verification_prefix: "workos-verify"
        });
      }
    }
    return c.json(formatOrganization(org, ws), 201);
  });
  app.get("/organizations", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const search = url.searchParams.get("search") ?? void 0;
    const domainsFilter = url.searchParams.get("domains") ?? void 0;
    const result = ws.organizations.list({
      ...params,
      filter: (org) => {
        if (search && !org.name.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (domainsFilter) {
          const orgDomains = ws.organizationDomains.findBy("organization_id", org.id);
          if (!orgDomains.some((d) => d.domain === domainsFilter)) {
            return false;
          }
        }
        return true;
      }
    });
    const allDomains = ws.organizationDomains.all();
    const domainsByOrg = /* @__PURE__ */ new Map();
    for (const d of allDomains) {
      const list = domainsByOrg.get(d.organization_id) ?? [];
      list.push(d);
      domainsByOrg.set(d.organization_id, list);
    }
    return c.json(formatListResponse(result, (org) => formatOrganization(org, ws, { domains: domainsByOrg.get(org.id) ?? [] })));
  });
  app.get("/organizations/:id", (c) => {
    const org = ws.organizations.get(c.req.param("id"));
    if (!org)
      throw notFound("Organization");
    return c.json(formatOrganization(org, ws));
  });
  app.get("/organizations/:id/authorized_applications", (c) => {
    const org = ws.organizations.get(c.req.param("id"));
    if (!org)
      throw notFound("Organization");
    const memberUserIds = new Set(ws.organizationMemberships.findBy("organization_id", org.id).map((m) => m.user_id));
    const apps = ws.authorizedApplications.all().filter((a) => memberUserIds.has(a.user_id));
    return c.json({
      object: "list",
      data: apps.map(formatAuthorizedApplication),
      list_metadata: { before: null, after: null }
    });
  });
  app.get("/organizations/external_id/:external_id", (c) => {
    const org = ws.organizations.findOneBy("external_id", c.req.param("external_id"));
    if (!org)
      throw notFound("Organization");
    return c.json(formatOrganization(org, ws));
  });
  app.put("/organizations/:id", async (c) => {
    const org = ws.organizations.get(c.req.param("id"));
    if (!org)
      throw notFound("Organization");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("name" in body) {
      if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
        throw validationError("Name is required", [{ field: "name", code: "required" }]);
      }
      updates.name = body.name.trim();
    }
    if ("external_id" in body)
      updates.external_id = body.external_id ?? null;
    if ("metadata" in body)
      updates.metadata = body.metadata ?? {};
    if ("allow_profiles_outside_organization" in body) {
      updates.allow_profiles_outside_organization = Boolean(body.allow_profiles_outside_organization);
    }
    if ("domain_data" in body && Array.isArray(body.domain_data)) {
      const existing = ws.organizationDomains.findBy("organization_id", org.id);
      const incoming = body.domain_data;
      const incomingDomains = new Set(incoming.map((d) => d.domain));
      for (const d of existing) {
        if (!incomingDomains.has(d.domain)) {
          ws.organizationDomains.delete(d.id);
        }
      }
      const existingDomains = new Set(existing.map((d) => d.domain));
      for (const dd of incoming) {
        if (!existingDomains.has(dd.domain)) {
          ws.organizationDomains.insert({
            object: "organization_domain",
            organization_id: org.id,
            domain: dd.domain,
            state: dd.state === "verified" ? "verified" : "pending",
            verification_strategy: "manual",
            verification_token: generateVerificationToken(),
            verification_prefix: "workos-verify"
          });
        }
      }
    }
    const updated = ws.organizations.update(org.id, updates);
    syncOrganizationResource(ws, updated);
    return c.json(formatOrganization(updated, ws));
  });
  app.delete("/organizations/:id", (c) => {
    const org = ws.organizations.get(c.req.param("id"));
    if (!org)
      throw notFound("Organization");
    ws.organizationDomains.deleteBy("organization_id", org.id);
    for (const membership of ws.organizationMemberships.findBy("organization_id", org.id)) {
      ws.roleAssignments.deleteBy("organization_membership_id", membership.id);
    }
    deleteAgentInstancesForOrganization(ws, org.id);
    ws.organizationMemberships.deleteBy("organization_id", org.id);
    ws.flagTargets.deleteBy("resource_id", org.id);
    revokeApiKeysForOwner(store, ws, (o) => (o.type === "organization" ? o.id : o.organization_id) === org.id);
    for (const resource of ws.authorizationResources.findBy("organization_id", org.id)) {
      ws.roleAssignments.deleteBy("resource_id", resource.id);
      ws.authorizationResources.delete(resource.id);
    }
    ws.organizations.delete(org.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/organization-domains.js
function organizationDomainRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/organization_domains", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    const domain = body.domain;
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (!domain) {
      throw validationError("domain is required", [{ field: "domain", code: "required" }]);
    }
    const org = ws.organizations.get(organizationId);
    if (!org)
      throw notFound("Organization");
    const existing = ws.organizationDomains.findBy("organization_id", organizationId).find((d) => d.domain === domain);
    if (existing) {
      throw new WorkOSApiError(409, "Domain already exists for this organization", "conflict");
    }
    const domainEntity = ws.organizationDomains.insert({
      object: "organization_domain",
      organization_id: organizationId,
      domain,
      state: "pending",
      verification_strategy: body.verification_strategy ?? "manual",
      verification_token: generateVerificationToken(),
      verification_prefix: "workos-verify"
    });
    return c.json(formatDomain(domainEntity), 201);
  });
  app.get("/organization_domains/:id", (c) => {
    const domain = ws.organizationDomains.get(c.req.param("id"));
    if (!domain)
      throw notFound("Organization Domain");
    return c.json(formatDomain(domain));
  });
  app.delete("/organization_domains/:id", (c) => {
    const domain = ws.organizationDomains.get(c.req.param("id"));
    if (!domain)
      throw notFound("Organization Domain");
    ws.organizationDomains.delete(domain.id);
    return c.body(null, 204);
  });
  app.post("/organization_domains/:id/verify", (c) => {
    const domain = ws.organizationDomains.get(c.req.param("id"));
    if (!domain)
      throw notFound("Organization Domain");
    const updated = ws.organizationDomains.update(domain.id, {
      state: "verified"
    });
    return c.json(formatDomain(updated));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/memberships.js
function membershipRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/user_management/organization_memberships", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    const userId = body.user_id;
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (!userId) {
      throw validationError("user_id is required", [{ field: "user_id", code: "required" }]);
    }
    const org = ws.organizations.get(organizationId);
    if (!org)
      throw notFound("Organization");
    const user = ws.users.get(userId);
    if (!user)
      throw notFound("User");
    const existing = ws.organizationMemberships.findBy("organization_id", organizationId).find((m) => m.user_id === userId && m.status !== "inactive");
    if (existing) {
      throw new WorkOSApiError(409, "Membership already exists", "conflict");
    }
    const roleSlug = body.role_slug ?? "member";
    const membership = ws.organizationMemberships.insert({
      object: "organization_membership",
      organization_id: organizationId,
      user_id: userId,
      role: { slug: roleSlug },
      status: "active",
      external_id: body.external_id ?? null,
      metadata: body.metadata ?? {}
    });
    return c.json(formatMembership(membership, ws), 201);
  });
  app.get("/user_management/organization_memberships", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const orgFilter = url.searchParams.get("organization_id") ?? void 0;
    const userFilter = url.searchParams.get("user_id") ?? void 0;
    const statusesParam = url.searchParams.getAll("statuses[]");
    const result = ws.organizationMemberships.list({
      ...params,
      filter: (m) => {
        if (orgFilter && m.organization_id !== orgFilter)
          return false;
        if (userFilter && m.user_id !== userFilter)
          return false;
        if (statusesParam.length > 0 && !statusesParam.includes(m.status))
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, (m) => formatMembership(m, ws)));
  });
  app.get("/user_management/organization_memberships/:id", (c) => {
    const m = ws.organizationMemberships.get(c.req.param("id"));
    if (!m)
      throw notFound("Organization Membership");
    return c.json(formatMembership(m, ws));
  });
  app.put("/user_management/organization_memberships/:id", async (c) => {
    const m = ws.organizationMemberships.get(c.req.param("id"));
    if (!m)
      throw notFound("Organization Membership");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("role_slug" in body) {
      updates.role = { slug: body.role_slug };
    }
    if ("external_id" in body) {
      updates.external_id = body.external_id ?? null;
    }
    if ("metadata" in body) {
      updates.metadata = body.metadata ?? {};
    }
    const updated = ws.organizationMemberships.update(m.id, updates);
    return c.json(formatMembership(updated, ws));
  });
  app.delete("/user_management/organization_memberships/:id", (c) => {
    const m = ws.organizationMemberships.get(c.req.param("id"));
    if (!m)
      throw notFound("Organization Membership");
    deleteAgentInstancesForMembership(ws, m.id);
    ws.roleAssignments.deleteBy("organization_membership_id", m.id);
    ws.organizationMemberships.delete(m.id);
    return c.body(null, 204);
  });
  app.put("/user_management/organization_memberships/:id/deactivate", (c) => {
    const m = ws.organizationMemberships.get(c.req.param("id"));
    if (!m)
      throw notFound("Organization Membership");
    if (m.status === "inactive") {
      throw validationError("Membership is already inactive");
    }
    const updated = ws.organizationMemberships.update(m.id, {
      status: "inactive"
    });
    revokeAgentSessionsForMembership(ws, m.id);
    return c.json(formatMembership(updated, ws));
  });
  app.put("/user_management/organization_memberships/:id/reactivate", (c) => {
    const m = ws.organizationMemberships.get(c.req.param("id"));
    if (!m)
      throw notFound("Organization Membership");
    if (m.status === "active") {
      throw validationError("Membership is already active");
    }
    const updated = ws.organizationMemberships.update(m.id, {
      status: "active"
    });
    return c.json(formatMembership(updated, ws));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/groups.js
function groupRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/organizations/:organizationId/groups", async (c) => {
    const organizationId = c.req.param("organizationId");
    if (!ws.organizations.get(organizationId))
      throw notFound("Organization");
    const body = await parseJsonBody(c);
    const name = body.name;
    if (typeof name !== "string" || name.length === 0) {
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    }
    const group = ws.groups.insert({
      object: "group",
      organization_id: organizationId,
      name,
      description: typeof body.description === "string" ? body.description : null
    });
    return c.json(formatGroup(group), 201);
  });
  app.get("/organizations/:organizationId/groups", (c) => {
    const organizationId = c.req.param("organizationId");
    if (!ws.organizations.get(organizationId))
      throw notFound("Organization");
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.groups.list({
      ...params,
      filter: (g) => g.organization_id === organizationId
    });
    return c.json(formatListResponse(result, formatGroup));
  });
  app.get("/organizations/:organizationId/groups/:groupId", (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    return c.json(formatGroup(group));
  });
  app.patch("/organizations/:organizationId/groups/:groupId", async (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("name" in body) {
      if (typeof body.name !== "string" || body.name.length === 0) {
        throw validationError("name must be a non-empty string", [{ field: "name", code: "invalid" }]);
      }
      updates.name = body.name;
    }
    if ("description" in body) {
      updates.description = typeof body.description === "string" ? body.description : null;
    }
    const updated = ws.groups.update(group.id, updates);
    return c.json(formatGroup(updated));
  });
  app.delete("/organizations/:organizationId/groups/:groupId", (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    ws.groups.delete(group.id);
    return c.body(null, 204);
  });
  app.post("/organizations/:organizationId/groups/:groupId/organization-memberships", async (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    const body = await parseJsonBody(c);
    const omId = body.organization_membership_id;
    if (typeof omId !== "string" || omId.length === 0) {
      throw validationError("organization_membership_id is required", [
        { field: "organization_membership_id", code: "required" }
      ]);
    }
    const membership = ws.organizationMemberships.get(omId);
    if (!membership)
      throw notFound("Organization Membership");
    if (membership.organization_id !== group.organization_id) {
      throw validationError("Organization Membership does not belong to this organization", [
        { field: "organization_membership_id", code: "invalid" }
      ]);
    }
    const existing = ws.groupMemberships.findBy("group_id", group.id).find((gm) => gm.organization_membership_id === omId);
    if (!existing) {
      ws.groupMemberships.insert({ group_id: group.id, organization_membership_id: omId });
    }
    return c.json(formatGroup(group));
  });
  app.get("/organizations/:organizationId/groups/:groupId/organization-memberships", (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const memberships = ws.groupMemberships.findBy("group_id", group.id).map((gm) => ws.organizationMemberships.get(gm.organization_membership_id)).filter((m) => m !== void 0);
    const result = cursorPaginate(memberships, params);
    return c.json(formatListResponse(result, formatMembershipBase));
  });
  app.delete("/organizations/:organizationId/groups/:groupId/organization-memberships/:omId", (c) => {
    const group = ws.groups.get(c.req.param("groupId"));
    if (!group || group.organization_id !== c.req.param("organizationId"))
      throw notFound("Group");
    const omId = c.req.param("omId");
    const gm = ws.groupMemberships.findBy("group_id", group.id).find((row) => row.organization_membership_id === omId);
    if (!gm)
      throw notFound("Organization Membership");
    ws.groupMemberships.delete(gm.id);
    return c.body(null, 204);
  });
  app.get("/user_management/organization_memberships/:omId/groups", (c) => {
    const omId = c.req.param("omId");
    if (!ws.organizationMemberships.get(omId))
      throw notFound("Organization Membership");
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const groups = ws.groupMemberships.findBy("organization_membership_id", omId).map((gm) => ws.groups.get(gm.group_id)).filter((g) => g !== void 0);
    const result = cursorPaginate(groups, params);
    return c.json(formatListResponse(result, formatGroup));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/users.js
function userRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/user_management/users", async (c) => {
    const body = await parseJsonBody(c);
    const email = requireEmailField(body.email, { requireShape: true });
    const existing = findUserByEmail(ws, email);
    if (existing) {
      throw new WorkOSApiError(400, "Could not create user.", "user_creation_error", [
        { code: "email_not_available", message: "This email is not available." }
      ]);
    }
    if (body.name !== void 0 && body.name !== null && typeof body.name !== "string") {
      throw validationError("name must be a string or null", [{ field: "name", code: "invalid_type" }]);
    }
    const password = body.password;
    const user = ws.users.insert({
      object: "user",
      email,
      name: body.name ?? null,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      email_verified: body.email_verified ?? false,
      profile_picture_url: null,
      last_sign_in_at: null,
      external_id: body.external_id ?? null,
      metadata: body.metadata ?? {},
      locale: null,
      password_hash: password ? hashPassword(password) : null,
      impersonator: null
    });
    return c.json(formatUser(user), 201);
  });
  app.get("/user_management/users", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const emailFilter = url.searchParams.get("email") ?? void 0;
    const orgFilter = url.searchParams.get("organization_id") ?? void 0;
    let orgUserIds;
    if (orgFilter) {
      orgUserIds = new Set(ws.organizationMemberships.findBy("organization_id", orgFilter).map((m) => m.user_id));
    }
    const result = ws.users.list({
      ...params,
      filter: (user) => {
        if (emailFilter && !emailsMatch(user.email, emailFilter))
          return false;
        if (orgUserIds && !orgUserIds.has(user.id))
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatUser));
  });
  app.get("/user_management/users/:id", (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    return c.json(formatUser(user));
  });
  app.get("/user_management/users/external_id/:external_id", (c) => {
    const user = ws.users.findOneBy("external_id", c.req.param("external_id"));
    if (!user)
      throw notFound("User");
    return c.json(formatUser(user));
  });
  app.put("/user_management/users/:id", async (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("name" in body) {
      if (typeof body.name !== "string" && body.name !== null) {
        throw validationError("name must be a string or null", [{ field: "name", code: "invalid_type" }]);
      }
      updates.name = body.name;
    }
    if ("first_name" in body)
      updates.first_name = body.first_name ?? null;
    if ("last_name" in body)
      updates.last_name = body.last_name ?? null;
    if ("email_verified" in body)
      updates.email_verified = body.email_verified;
    if ("external_id" in body)
      updates.external_id = body.external_id ?? null;
    if ("metadata" in body)
      updates.metadata = body.metadata ?? {};
    if ("password" in body && body.password) {
      updates.password_hash = hashPassword(body.password);
    }
    const updated = ws.users.update(user.id, updates);
    return c.json(formatUser(updated));
  });
  app.delete("/user_management/users/:id", (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    for (const s of ws.sessions.findBy("user_id", user.id)) {
      ws.sessions.delete(s.id);
    }
    for (const m of ws.organizationMemberships.findBy("user_id", user.id)) {
      deleteAgentInstancesForMembership(ws, m.id);
      ws.roleAssignments.deleteBy("organization_membership_id", m.id);
      ws.organizationMemberships.delete(m.id);
    }
    for (const f of ws.authFactors.findBy("user_id", user.id)) {
      ws.authFactors.delete(f.id);
    }
    ws.flagTargets.deleteBy("resource_id", user.id);
    for (const i of ws.identities.findBy("user_id", user.id)) {
      ws.identities.delete(i.id);
    }
    for (const pr of ws.passwordResets.findBy("user_id", user.id)) {
      ws.passwordResets.delete(pr.id);
    }
    for (const ev of ws.emailVerifications.findBy("user_id", user.id)) {
      ws.emailVerifications.delete(ev.id);
    }
    for (const ma of ws.magicAuths.findBy("user_id", user.id)) {
      ws.magicAuths.delete(ma.id);
    }
    for (const ca of ws.connectedAccounts.findBy("user_id", user.id)) {
      ws.connectedAccounts.delete(ca.id);
    }
    revokeApiKeysForOwner(store, ws, (o) => o.type === "user" && o.id === user.id);
    ws.users.delete(user.id);
    return c.body(null, 204);
  });
  app.get("/user_management/users/:id/identities", (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    return c.json(ws.identities.findBy("user_id", user.id).map(formatIdentity));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/email-verification.js
function emailVerificationRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/user_management/email_verification/:id", (c) => {
    const ev = ws.emailVerifications.get(c.req.param("id"));
    if (!ev)
      throw notFound("Email Verification");
    return c.json(formatEmailVerification(ev));
  });
  app.post("/user_management/users/:id/email_verification/send", (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    const ev = ws.emailVerifications.insert({
      object: "email_verification",
      user_id: user.id,
      email: user.email,
      code: generateCode(),
      expires_at: expiresIn(10)
    });
    return c.json(formatEmailVerification(ev), 201);
  });
  app.post("/user_management/users/:id/email_verification/confirm", async (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    const body = await parseJsonBody(c);
    const code = body.code;
    if (!code) {
      throw new WorkOSApiError(400, "code is required", "invalid_request");
    }
    const verifications = ws.emailVerifications.findBy("user_id", user.id);
    const ev = verifications.find((v) => v.code === code);
    if (!ev) {
      throw new WorkOSApiError(400, "Invalid code", "invalid_code");
    }
    if (isExpired(ev.expires_at)) {
      throw new WorkOSApiError(400, "Code has expired", "expired_code");
    }
    ws.users.update(user.id, { email_verified: true });
    ws.emailVerifications.delete(ev.id);
    const updated = ws.users.get(user.id);
    return c.json(formatUser(updated));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/password-reset.js
function passwordResetRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/user_management/password_reset/:id", (c) => {
    const pr = ws.passwordResets.get(c.req.param("id"));
    if (!pr)
      throw notFound("Password Reset");
    return c.json(formatPasswordReset(pr));
  });
  app.post("/user_management/password_reset", async (c) => {
    const body = await parseJsonBody(c);
    const email = requireEmailString(body.email);
    if (!email) {
      throw new WorkOSApiError(400, "email is required", "invalid_request");
    }
    const user = findUserByEmail(ws, email);
    if (!user)
      throw notFound("User");
    const token = generateVerificationToken();
    const pr = ws.passwordResets.insert({
      object: "password_reset",
      user_id: user.id,
      email: user.email,
      password_reset_token: token,
      // Production builds this link from the password-reset redirect configured in the dashboard.
      // The emulator has no such setting, so — like an invitation's accept_invitation_url — the
      // link points at the emulator itself, carrying the token under the `token` query parameter
      // the confirm endpoint documents.
      password_reset_url: `${ctx.baseUrl}/user_management/password_reset/confirm?token=${token}`,
      expires_at: expiresIn(60)
    });
    return c.json(formatPasswordReset(pr), 201);
  });
  app.post("/user_management/password_reset/confirm", async (c) => {
    const body = await parseJsonBody(c);
    const token = body.token;
    const newPassword = body.new_password;
    if (!token) {
      throw new WorkOSApiError(400, "token is required", "invalid_request");
    }
    if (!newPassword) {
      throw new WorkOSApiError(400, "new_password is required", "invalid_request");
    }
    const resets = ws.passwordResets.all();
    const pr = resets.find((r) => r.password_reset_token === token);
    if (!pr) {
      throw new WorkOSApiError(400, "Invalid token", "invalid_token");
    }
    if (isExpired(pr.expires_at)) {
      throw new WorkOSApiError(400, "Token has expired", "expired_token");
    }
    const user = ws.users.get(pr.user_id);
    if (!user) {
      ws.passwordResets.delete(pr.id);
      throw notFound("User");
    }
    ws.users.update(pr.user_id, {
      password_hash: hashPassword(newPassword)
    });
    ws.passwordResets.delete(pr.id);
    const eventBus = store.getData(STORE_KEYS.eventBus);
    eventBus?.emit({ event: EVENTS.passwordResetSucceeded, data: formatPasswordReset(pr) });
    return c.json({ user: { object: "user", id: user.id, email: user.email } });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/magic-auth.js
function magicAuthRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/user_management/magic_auth/:id", (c) => {
    const ma = ws.magicAuths.get(c.req.param("id"));
    if (!ma)
      throw notFound("Magic Auth");
    return c.json(formatMagicAuth(ma));
  });
  app.post("/user_management/magic_auth", async (c) => {
    const body = await parseJsonBody(c);
    const email = requireEmailString(body.email, { requireShape: true });
    if (!email) {
      throw new WorkOSApiError(400, "email is required", "invalid_request");
    }
    const user = findUserByEmail(ws, email) ?? ws.users.insert({
      object: "user",
      email,
      name: null,
      first_name: null,
      last_name: null,
      email_verified: false,
      profile_picture_url: null,
      last_sign_in_at: null,
      external_id: null,
      metadata: {},
      locale: null,
      password_hash: null,
      impersonator: null
    });
    const ma = ws.magicAuths.insert({
      object: "magic_auth",
      user_id: user.id,
      email: user.email,
      code: generateCode(),
      expires_at: expiresIn(10)
    });
    return c.json(formatMagicAuth(ma), 201);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/auth-factors.js
function authFactorRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/user_management/users/:userlandUserId/auth_factors", async (c) => {
    const userId = c.req.param("userlandUserId");
    const user = ws.users.get(userId);
    if (!user)
      throw notFound("User");
    const body = await parseJsonBody(c);
    const type = body.type ?? "totp";
    const secret = body.totp_secret;
    if (secret !== void 0 && (typeof secret !== "string" || !BASE32_SECRET.test(secret))) {
      throw new WorkOSApiError(422, "TOTP secret must be a valid Base32 string", "invalid_totp_secret");
    }
    const factor = ws.authFactors.insert({
      object: "authentication_factor",
      user_id: user.id,
      type,
      totp: newTotp(body.totp_issuer ?? "WorkOS Emulator", body.totp_user ?? user.email, secret)
    });
    const challenge = ws.authChallenges.insert({
      object: "authentication_challenge",
      user_id: user.id,
      factor_id: factor.id,
      expires_at: expiresIn(10),
      code: generateCode()
    });
    return c.json({
      authentication_factor: formatAuthFactorEnrolled(factor),
      authentication_challenge: formatAuthChallenge(challenge)
    }, 201);
  });
  app.get("/user_management/users/:userlandUserId/auth_factors", (c) => {
    const userId = c.req.param("userlandUserId");
    const user = ws.users.get(userId);
    if (!user)
      throw notFound("User");
    const factors = ws.authFactors.findBy("user_id", user.id);
    return c.json({
      object: "list",
      data: factors.map(formatAuthFactor),
      list_metadata: { before: null, after: null }
    });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/sessions.js
function sessionRoutes(ctx) {
  const { app, store, jwt } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/user_management/users/:id/sessions", (c) => {
    const user = ws.users.get(c.req.param("id"));
    if (!user)
      throw notFound("User");
    const sessions = ws.sessions.findBy("user_id", user.id);
    return c.json({
      object: "list",
      data: sessions.map(formatSession),
      list_metadata: { before: null, after: null }
    });
  });
  app.post("/user_management/sessions/revoke", async (c) => {
    const body = await parseJsonBody(c);
    const sessionId = body.session_id;
    if (!sessionId) {
      throw new WorkOSApiError(400, "session_id is required", "invalid_request");
    }
    const session = ws.sessions.get(sessionId);
    if (!session)
      throw notFound("Session");
    ws.sessions.update(session.id, { status: "revoked", ended_at: (/* @__PURE__ */ new Date()).toISOString() });
    ws.sessions.delete(session.id);
    return c.json({ success: true });
  });
  app.get("/user_management/sessions/logout", (c) => {
    const url = new URL(c.req.url);
    const sessionId = url.searchParams.get("session_id");
    const returnTo = url.searchParams.get("return_to");
    if (!sessionId) {
      throw new WorkOSApiError(422, "session_id is required", "invalid_request");
    }
    const session = ws.sessions.get(sessionId);
    if (session) {
      ws.sessions.update(session.id, { status: "revoked", ended_at: (/* @__PURE__ */ new Date()).toISOString() });
      ws.sessions.delete(session.id);
    }
    if (returnTo) {
      assertAllowedRedirectUri(returnTo, store);
      return c.redirect(new URL(returnTo).toString());
    }
    return c.json({ success: true });
  });
  app.get("/user_management/sessions/jwks/:clientId", (c) => {
    return c.json(jwt.getJWKS());
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/auth.js
import { createHash as createHash3 } from "crypto";

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/flag-context.js
function environmentIdFor(environment) {
  return `environment_${environment ?? "test"}`;
}
var PLACEHOLDER_ACTOR = { id: "api_key_emulator", name: "Emulator API key" };
function flagAccessType(ws, flag) {
  if (!flag.enabled)
    return "none";
  if (flag.default_value)
    return "all";
  return ws.flagTargets.findBy("flag_slug", flag.slug).length > 0 ? "some" : "none";
}
function flagEventContext(actor = PLACEHOLDER_ACTOR) {
  return {
    client_id: "workos-emulate",
    actor: { id: actor.id, source: "api", name: actor.name }
  };
}
function flagRuleState(ws, flag) {
  const targets = ws.flagTargets.findBy("flag_slug", flag.slug);
  return {
    access_type: flagAccessType(ws, flag),
    configured_targets: {
      organizations: targets.filter((t) => t.resource_type === "organization").flatMap((t) => {
        const org = ws.organizations.get(t.resource_id);
        return org ? [{ id: org.id, name: org.name }] : [];
      }),
      users: targets.filter((t) => t.resource_type === "user").flatMap((t) => {
        const user = ws.users.get(t.resource_id);
        return user ? [{ id: user.id, email: user.email }] : [];
      })
    }
  };
}
function flagRuleUpdatedContext(ws, flag, previous, actor) {
  return {
    ...flagEventContext(actor),
    ...flagRuleState(ws, flag),
    previous_attributes: { context: previous }
  };
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/feature-flags.js
function resourceKind(resourceId) {
  if (resourceId.startsWith("user_"))
    return "user";
  if (resourceId.startsWith("org_"))
    return "organization";
  return null;
}
function invalidResourceId() {
  return new WorkOSApiError(400, "Invalid resource id", "invalid_resource_id_format");
}
function isTargeted(ws, slug, resourceIds) {
  const targets = ws.flagTargets.findBy("flag_slug", slug);
  return targets.some((t) => t.enabled && resourceIds.includes(t.resource_id));
}
function flagIsOn(ws, flag, resourceIds) {
  if (!flag.enabled)
    return false;
  return isTargeted(ws, flag.slug, resourceIds) || flag.default_value === true;
}
function organizationIdsForUser(ws, userId) {
  return ws.organizationMemberships.findBy("user_id", userId).filter((m) => m.status === "active").map((m) => m.organization_id);
}
function enabledFlagsFor(ws, resourceIds) {
  return ws.featureFlags.all().filter((flag) => flagIsOn(ws, flag, resourceIds));
}
function tokenFeatureFlags(ws, userId, organizationId) {
  const resourceIds = organizationId ? [userId, organizationId] : [userId];
  return enabledFlagsFor(ws, resourceIds).map((flag) => flag.slug);
}
function featureFlagRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const flagBySlug = (slug) => {
    const flag = ws.featureFlags.findOneBy("slug", slug);
    if (!flag)
      throw notFound("FeatureFlag");
    return flag;
  };
  const emitRuleUpdated = (flag, previous, apiKey) => {
    const environmentId = environmentIdFor();
    store.getData(STORE_KEYS.eventBus)?.emit({
      event: EVENTS.flagRuleUpdated,
      data: formatFeatureFlagEvent(flag, environmentId),
      environment_id: environmentId,
      context: flagRuleUpdatedContext(ws, flag, previous, apiKeyActor(ws, apiKey))
    });
  };
  const setEnabled = (slug, enabled) => {
    const flag = flagBySlug(slug);
    if (flag.enabled === enabled)
      return formatFeatureFlag(flag);
    return formatFeatureFlag(ws.featureFlags.update(flag.id, { enabled }));
  };
  app.get("/feature-flags", (c) => {
    const params = parseListParams(new URL(c.req.url));
    return c.json(formatListResponse(ws.featureFlags.list({ ...params }), formatFeatureFlag));
  });
  app.get("/feature-flags/:slug", (c) => c.json(formatFeatureFlag(flagBySlug(c.req.param("slug")))));
  app.put("/feature-flags/:slug/enable", (c) => c.json(setEnabled(c.req.param("slug"), true)));
  app.post("/feature-flags/:slug/enable", (c) => c.json(setEnabled(c.req.param("slug"), true)));
  app.put("/feature-flags/:slug/disable", (c) => c.json(setEnabled(c.req.param("slug"), false)));
  app.post("/feature-flags/:slug/disable", (c) => c.json(setEnabled(c.req.param("slug"), false)));
  const addTarget = (slug, resourceId) => {
    const flag = flagBySlug(slug);
    const kind = resourceKind(resourceId);
    if (!kind)
      throw invalidResourceId();
    if (kind === "user" && !ws.users.get(resourceId))
      throw notFound("User");
    if (kind === "organization" && !ws.organizations.get(resourceId))
      throw notFound("Organization");
    const existing = ws.flagTargets.findBy("flag_slug", flag.slug).find((t) => t.resource_id === resourceId);
    if (existing)
      return { flag, changed: false, previous: void 0 };
    const previous = flagRuleState(ws, flag);
    ws.flagTargets.insert({
      object: "flag_target",
      flag_slug: flag.slug,
      resource_id: resourceId,
      resource_type: kind,
      enabled: true
    });
    return { flag, changed: true, previous };
  };
  app.post("/feature-flags/:slug/targets/:resourceId", (c) => {
    const { flag, changed, previous } = addTarget(c.req.param("slug"), c.req.param("resourceId"));
    if (changed && previous)
      emitRuleUpdated(flag, previous, c.get("auth")?.apiKey);
    return c.body(null, 204);
  });
  app.put("/feature-flags/:slug/targets/:resourceId", (c) => {
    const { flag, changed, previous } = addTarget(c.req.param("slug"), c.req.param("resourceId"));
    if (changed && previous)
      emitRuleUpdated(flag, previous, c.get("auth")?.apiKey);
    return c.body(null, 204);
  });
  app.delete("/feature-flags/:slug/targets/:resourceId", (c) => {
    const flag = flagBySlug(c.req.param("slug"));
    const resourceId = c.req.param("resourceId");
    const kind = resourceKind(resourceId);
    if (!kind)
      throw invalidResourceId();
    if (kind === "user" && !ws.users.get(resourceId))
      throw notFound("User");
    if (kind === "organization" && !ws.organizations.get(resourceId))
      throw notFound("Organization");
    const target = ws.flagTargets.findBy("flag_slug", flag.slug).find((t) => t.resource_id === resourceId);
    if (target) {
      const previous = flagRuleState(ws, flag);
      ws.flagTargets.delete(target.id);
      emitRuleUpdated(flag, previous, c.get("auth")?.apiKey);
    }
    return c.body(null, 204);
  });
  app.get("/sdk/feature-flags", (c) => {
    const body = /* @__PURE__ */ Object.create(null);
    for (const flag of ws.featureFlags.all()) {
      const targets = ws.flagTargets.findBy("flag_slug", flag.slug);
      const byKind = (kind) => targets.filter((t) => t.resource_type === kind).map((t) => ({ id: t.resource_id, enabled: t.enabled }));
      body[flag.slug] = {
        slug: flag.slug,
        enabled: flag.enabled,
        default_value: flag.default_value,
        // `custom_targets` is omitted deliberately: the SDK documents it as absent until the
        // API's custom-targets rollout, and its evaluator defaults it to [].
        targets: { users: byKind("user"), organizations: byKind("organization") }
      };
    }
    return c.json(body);
  });
  const listEnabled = (requestUrl, resourceIds) => {
    const params = parseListParams(new URL(requestUrl));
    return formatListResponse(cursorPaginate(enabledFlagsFor(ws, resourceIds), params), formatFeatureFlag);
  };
  app.get("/organizations/:organizationId/feature-flags", (c) => {
    const orgId = c.req.param("organizationId");
    if (!ws.organizations.get(orgId))
      throw notFound("Organization");
    return c.json(listEnabled(c.req.url, [orgId]));
  });
  app.get("/user_management/users/:userId/feature-flags", (c) => {
    const userId = c.req.param("userId");
    if (!ws.users.get(userId))
      throw notFound("User");
    return c.json(listEnabled(c.req.url, [userId, ...organizationIdsForUser(ws, userId)]));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/jwt-template.js
var RESERVED_JWT_CLAIMS = ["iss", "sub", "exp", "iat", "nbf", "jti"];
var MAX_RENDERED_CLAIMS_BYTES = 3072;
var TEMPLATE_ROOTS = ["user", "organization", "organization_membership"];
var JwtTemplateError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "JwtTemplateError";
  }
};
function isStringLiteral(token) {
  return token.length >= 2 && token.startsWith("'") && token.endsWith("'");
}
function resolvePath(path, context) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/.test(path)) {
    throw new JwtTemplateError(`invalid variable path \`${path}\``);
  }
  const segments = path.split(".");
  const root = segments[0];
  if (!TEMPLATE_ROOTS.includes(root)) {
    throw new JwtTemplateError(`unknown template variable \`${root}\` (available: ${TEMPLATE_ROOTS.join(", ")})`);
  }
  let current = context[root];
  for (const segment of segments.slice(1)) {
    if (current === null || current === void 0)
      return null;
    if (typeof current !== "object")
      return null;
    current = current[segment];
  }
  return current ?? null;
}
function evaluateExpression(expression, context) {
  const alternatives = expression.split("||").map((part) => part.trim()).filter((part) => part.length > 0);
  if (alternatives.length === 0) {
    throw new JwtTemplateError("empty `{{ }}` expression");
  }
  for (const alternative of alternatives) {
    if (isStringLiteral(alternative))
      return alternative.slice(1, -1);
    const value = resolvePath(alternative, context);
    if (value !== null && value !== void 0)
      return value;
  }
  return null;
}
function toStringFragment(value) {
  if (value === null || value === void 0)
    return "";
  if (typeof value === "string")
    return JSON.stringify(value).slice(1, -1);
  if (typeof value === "object")
    return JSON.stringify(JSON.stringify(value)).slice(1, -1);
  return String(value);
}
function toJsonFragment(value) {
  if (value === void 0)
    return "null";
  return JSON.stringify(value);
}
function interpolate(content, context) {
  let out = "";
  let inString = false;
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    if (char === "{" && content[i + 1] === "{") {
      const end = content.indexOf("}}", i + 2);
      if (end === -1)
        throw new JwtTemplateError("unterminated `{{` expression");
      const value = evaluateExpression(content.slice(i + 2, end), context);
      out += inString ? toStringFragment(value) : toJsonFragment(value);
      i = end + 2;
      continue;
    }
    if (inString && char === "\\") {
      out += char + (content[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (char === '"')
      inString = !inString;
    out += char;
    i++;
  }
  if (inString)
    throw new JwtTemplateError("unterminated string literal");
  return out;
}
function renderToObject(content, context) {
  const rendered = interpolate(content, context);
  let parsed;
  try {
    parsed = JSON.parse(rendered);
  } catch {
    throw new JwtTemplateError("template did not render to valid JSON");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new JwtTemplateError("template must render to a JSON object");
  }
  return parsed;
}
function renderJwtTemplate(content, context) {
  const rendered = renderToObject(content, context);
  const claims = {};
  for (const [key, value] of Object.entries(rendered)) {
    if (value === null || value === void 0)
      continue;
    if (RESERVED_JWT_CLAIMS.includes(key))
      continue;
    claims[key] = value;
  }
  const size = Buffer.byteLength(JSON.stringify(claims), "utf-8");
  if (size > MAX_RENDERED_CLAIMS_BYTES) {
    throw new JwtTemplateError(`template rendered to ${size} bytes, over the ${MAX_RENDERED_CLAIMS_BYTES}-byte limit`);
  }
  return claims;
}
var OAUTH_IDENTITIES_MAP = {
  AppleOAuth: null,
  GitHubOAuth: null,
  GoogleOAuth: null,
  GrokOAuth: null,
  IntuitOAuth: null,
  LinkedInOAuth: null,
  MicrosoftOAuth: null,
  VercelMarketplaceOAuth: null,
  VercelOAuth: null,
  SalesforceOAuth: null
};
var PROBE_CONTEXT = {
  user: {
    object: "user",
    id: "user_01PROBE",
    email: "probe@example.com",
    first_name: "Probe",
    last_name: "User",
    email_verified: true,
    profile_picture_url: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    metadata: {},
    external_id: null,
    locale: null,
    identities: OAUTH_IDENTITIES_MAP
  },
  organization: {
    object: "organization",
    id: "org_01PROBE",
    name: "Probe Org",
    allow_profiles_outside_organization: false,
    domains: [
      {
        object: "organization_domain",
        id: "org_domain_01PROBE",
        organization_id: "org_01PROBE",
        domain: "example.com",
        state: "verified",
        verification_strategy: "manual",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z"
      }
    ],
    external_id: null,
    metadata: {},
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  organization_membership: {
    object: "organization_membership",
    id: "om_01PROBE",
    role: "member",
    roles: ["member"],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    custom_attributes: {}
  }
};
function validateJwtTemplateContent(content) {
  if (typeof content !== "string" || content.trim().length === 0) {
    return ["content is required and must be a non-empty string"];
  }
  let rendered;
  try {
    rendered = renderToObject(content, PROBE_CONTEXT);
  } catch (error2) {
    return [error2 instanceof Error ? error2.message : String(error2)];
  }
  const keys = Object.keys(rendered);
  if (keys.length === 0) {
    return ["template must render to a JSON object with at least one key"];
  }
  const reserved = keys.filter((key) => RESERVED_JWT_CLAIMS.includes(key));
  if (reserved.length > 0) {
    return [`template may not set reserved claims: ${reserved.join(", ")}`];
  }
  return [];
}
function buildJwtTemplateContext(ws, user, organizationId) {
  const identities = { ...OAUTH_IDENTITIES_MAP };
  for (const identity of ws.identities.findBy("user_id", user.id)) {
    identities[identity.provider] = identity.idp_id;
  }
  const userContext = {
    ...formatUser(user),
    identities
  };
  delete userContext.last_sign_in_at;
  const context = { user: userContext };
  if (!organizationId)
    return context;
  const organization = ws.organizations.get(organizationId);
  if (organization) {
    context.organization = formatOrganization(organization, ws);
  }
  const membership = ws.organizationMemberships.findBy("organization_id", organizationId).find((m) => m.user_id === user.id);
  if (membership) {
    context.organization_membership = {
      object: "organization_membership",
      id: membership.id,
      role: membership.role.slug,
      roles: [membership.role.slug],
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      custom_attributes: {}
    };
  }
  return context;
}
function renderConfiguredJwtTemplate(store, ws, user, organizationId) {
  const template = store.getData(STORE_KEYS.jwtTemplate);
  if (!template?.content)
    return void 0;
  try {
    return renderJwtTemplate(template.content, buildJwtTemplateContext(ws, user, organizationId));
  } catch (error2) {
    const detail = error2 instanceof Error ? error2.message : String(error2);
    throw new WorkOSApiError(422, `JWT template could not be rendered: ${detail}`, "unprocessable_entity");
  }
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/login-page.js
function renderDeviceVerifyPage(options) {
  const { title, message } = options;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} \u2014 WorkOS Emulate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:8px;padding:40px;width:400px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .badge{display:inline-block;background:#6366f1;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;margin-bottom:16px;letter-spacing:.5px}
    h1{font-size:22px;font-weight:600;margin-bottom:8px}
    .sub{color:#6b7280;font-size:14px;line-height:1.5}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">WORKOS EMULATE</div>
    <h1>${esc(title)}</h1>
    <p class="sub">${esc(message)}</p>
  </div>
</body>
</html>`;
}
function renderLoginPage(options) {
  const { title, subtitle, emailHint, formAction, hiddenFields, users } = options;
  const hiddenInputs = renderHiddenInputs(hiddenFields);
  const accounts = [...users ?? []].sort((a, b) => a.email.localeCompare(b.email, "en"));
  const picker = accounts.length === 0 ? "" : `
    <details class="accounts">
      <summary>Pick an account (${accounts.length})</summary>
      <form method="POST" action="${esc(formAction)}">
        ${hiddenInputs}
        <div class="account-list">
${accounts.map((u) => `          <button class="account" type="submit" name="email" value="${esc(u.email)}">
            <span class="who">${u.name ? `<span class="name">${esc(u.name)}</span>` : ""}<span class="email">${esc(u.email)}</span></span>
            <span class="chevron" aria-hidden="true">&rsaquo;</span>
          </button>`).join("\n")}
        </div>
      </form>
    </details>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} \u2014 WorkOS Emulate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:8px;padding:40px;width:400px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .badge{display:inline-block;background:#6366f1;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;margin-bottom:16px;letter-spacing:.5px}
    h1{font-size:22px;font-weight:600;margin-bottom:8px}
    .sub{color:#6b7280;font-size:14px;margin-bottom:24px}
    label{display:block;font-size:14px;font-weight:500;margin-bottom:6px}
    input[type="email"]{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none}
    input[type="email"]:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
    button{width:100%;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;margin-top:16px}
    button:hover{background:#4f46e5}
    .accounts{margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px}
    .accounts summary{cursor:pointer;font-size:13px;color:#6b7280;list-style:none}
    .accounts summary::-webkit-details-marker{display:none}
    .accounts summary::before{content:"\\203A";display:inline-block;margin-right:6px;transition:transform .15s}
    .accounts[open] summary::before{transform:rotate(90deg)}
    .accounts summary:hover{color:#111827}
    .account-list{margin-top:12px;max-height:220px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:6px}
    .account{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 14px;background:#fff;border:none;border-bottom:1px solid #e5e7eb;text-align:left;cursor:pointer;margin-top:0}
    .account:last-child{border-bottom:none}
    .account:hover{background:#f9fafb}
    .account:focus-visible{outline:2px solid #6366f1;outline-offset:-2px}
    .who{display:flex;flex-direction:column;gap:2px}
    .name{font-size:14px;font-weight:500;color:#111827}
    .email{font-size:12px;color:#6b7280}
    .chevron{color:#9ca3af;font-size:18px;line-height:1}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">WORKOS EMULATE</div>
    <h1>${esc(title)}</h1>
    <p class="sub">${esc(subtitle ?? "Enter your email to continue.")}</p>
    <form method="POST" action="${esc(formAction)}">
        ${hiddenInputs}
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="${esc(emailHint ?? "")}" required autofocus>
        <button type="submit">Continue</button>
    </form>${picker}
  </div>
</body>
</html>`;
}
function renderOrganizationSelectPage(options) {
  const { email, organizations, formAction, hiddenFields } = options;
  const hiddenInputs = renderHiddenInputs(hiddenFields);
  const rows = organizations.map((org) => `          <button class="org" type="submit" name="organization_id" value="${esc(org.id)}">
            <span>${esc(org.name)}</span><span class="chevron" aria-hidden="true">&rsaquo;</span>
          </button>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Select an organization \u2014 WorkOS Emulate</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:8px;padding:40px;width:400px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .badge{display:inline-block;background:#6366f1;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;margin-bottom:16px;letter-spacing:.5px}
    h1{font-size:22px;font-weight:600;margin-bottom:8px}
    .sub{color:#6b7280;font-size:14px;margin-bottom:24px}
    .orgs{border:1px solid #e5e7eb;border-radius:6px;overflow:hidden}
    .org{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;background:#fff;border:none;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;text-align:left;cursor:pointer}
    .org:last-child{border-bottom:none}
    .org:hover{background:#f9fafb}
    .org:focus-visible{outline:2px solid #6366f1;outline-offset:-2px}
    .chevron{color:#9ca3af;font-size:18px;line-height:1}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">WORKOS EMULATE</div>
    <h1>Select an organization</h1>
    <p class="sub">${esc(email)} belongs to more than one organization.</p>
    <form method="POST" action="${esc(formAction)}">
        ${hiddenInputs}
        <div class="orgs">
${rows}
        </div>
    </form>
  </div>
</body>
</html>`;
}
function renderHiddenInputs(fields) {
  return Object.entries(fields).filter(([, v]) => v != null).map(([name, value]) => `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`).join("\n        ");
}
function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderPasswordPage(options) {
  const { email, formAction, hiddenFields, backHref, error: error2 } = options;
  const hiddenInputs = renderHiddenInputs(hiddenFields);
  const alert = error2 ? `
    <p class="error" role="alert">${esc(error2)}</p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Enter your password \u2014 WorkOS Emulate</title>
  <style>${STEP_PAGE_STYLE}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">WORKOS EMULATE</div>
    <h1>Enter your password</h1>
    <p class="sub">Signing in as <strong>${esc(email)}</strong>.</p>${alert}
    <form method="POST" action="${esc(formAction)}">
        ${hiddenInputs}
        <label for="password">Password</label>
        <input type="password" class="field" id="password" name="password" required autofocus autocomplete="current-password"${error2 ? ' aria-invalid="true"' : ""}>
        <button type="submit">Continue</button>
    </form>
    <a class="switch" href="${esc(backHref)}">Use a different account</a>
  </div>
</body>
</html>`;
}
function renderCodePage(options) {
  const { title, lead, email, formAction, hiddenFields, backHref, error: error2 } = options;
  const hiddenInputs = renderHiddenInputs(hiddenFields);
  const alert = error2 ? `
    <p class="error" role="alert">${esc(error2)}</p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} \u2014 WorkOS Emulate</title>
  <style>${STEP_PAGE_STYLE}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">WORKOS EMULATE</div>
    <h1>${esc(title)}</h1>
    <p class="sub">${esc(lead)} <strong>${esc(email)}</strong>.</p>${alert}
    <form method="POST" action="${esc(formAction)}">
        ${hiddenInputs}
        <label for="code">Code</label>
        <input type="text" class="field" id="code" name="code" inputmode="numeric" autocomplete="one-time-code" required autofocus${error2 ? ' aria-invalid="true"' : ""}>
        <button type="submit">Continue</button>
    </form>
    <a class="switch" href="${esc(backHref)}">Use a different account</a>
  </div>
</body>
</html>`;
}
var STEP_PAGE_STYLE = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:8px;padding:40px;width:400px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .badge{display:inline-block;background:#6366f1;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;margin-bottom:16px;letter-spacing:.5px}
    h1{font-size:22px;font-weight:600;margin-bottom:8px}
    .sub{color:#6b7280;font-size:14px;margin-bottom:24px}
    .sub strong{color:#111827;font-weight:500}
    .error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:6px;padding:10px 12px;font-size:13px;margin-bottom:16px}
    label{display:block;font-size:14px;font-weight:500;margin-bottom:6px}
    .field{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none}
    .field:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
    .field[aria-invalid="true"]{border-color:#f87171}
    button{width:100%;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;margin-top:16px}
    button:hover{background:#4f46e5}
    .switch{display:block;margin-top:20px;font-size:13px;color:#6b7280;text-align:center;text-decoration:none}
    .switch:hover{color:#111827;text-decoration:underline}`;

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/auth.js
var INVITATION_TOKEN_GRANTS = /* @__PURE__ */ new Set([
  "authorization_code",
  "password",
  "urn:workos:oauth:grant-type:magic-auth",
  "urn:workos:oauth:grant-type:magic-auth:code"
]);
function authRoutes(ctx) {
  const { app, store, jwt } = ctx;
  const ws = getWorkOSStore(store);
  function activeOrganizationsFor(userId) {
    const orgs = [];
    for (const m of ws.organizationMemberships.findBy("user_id", userId)) {
      if (m.status !== "active")
        continue;
      const org = ws.organizations.get(m.organization_id);
      if (org)
        orgs.push({ id: org.id, name: org.name });
    }
    return orgs;
  }
  function carriedFields(params) {
    const fields = { redirect_uri: params.redirectUri };
    if (params.state)
      fields.state = params.state;
    if (params.codeChallenge)
      fields.code_challenge = params.codeChallenge;
    if (params.codeChallengeMethod)
      fields.code_challenge_method = params.codeChallengeMethod;
    if (params.clientId)
      fields.client_id = params.clientId;
    return fields;
  }
  function resolveAndRedirect(c, params) {
    const { redirectUri, state, codeChallenge, codeChallengeMethod, loginHint, clientId, organizationId, password, code, pendingToken } = params;
    assertAllowedRedirectUri(redirectUri, store);
    let user;
    if (loginHint) {
      user = findUserByEmail(ws, loginHint);
      if (!user) {
        const redirect3 = new URL(redirectUri);
        redirect3.searchParams.set("error", "user_not_found");
        if (state)
          redirect3.searchParams.set("state", state);
        return c.redirect(redirect3.toString());
      }
    } else {
      const users = ws.users.all();
      user = users[0];
    }
    if (!user) {
      const redirect3 = new URL(redirectUri);
      redirect3.searchParams.set("error", "no_users");
      if (state)
        redirect3.searchParams.set("state", state);
      return c.redirect(redirect3.toString());
    }
    if (organizationId && !activeOrganizationsFor(user.id).some((o) => o.id === organizationId)) {
      throw new WorkOSApiError(400, `User is not an active member of organization ${organizationId}`, "invalid_request");
    }
    const interactive = store.getData(STORE_KEYS.interactiveAuth);
    let login = null;
    let loginToken = null;
    const releaseGate = (stale) => {
      if (stale.email_verification_id)
        ws.emailVerifications.delete(stale.email_verification_id);
      if (stale.challenge_id)
        ws.authChallenges.delete(stale.challenge_id);
    };
    const carryLogin = () => {
      if (!loginToken) {
        store.deleteDataByPrefix(STORE_KEY_PREFIXES.interactiveLogin, (v) => {
          const stale = v;
          if (!isExpired(stale.expires_at))
            return false;
          releaseGate(stale);
          return true;
        });
        loginToken = generateId("pending");
      }
      store.setData(`${STORE_KEY_PREFIXES.interactiveLogin}${loginToken}`, login);
      return loginToken;
    };
    if (interactive && store.getData(STORE_KEYS.interactivePassword) && user.password_hash) {
      const key = pendingToken ? `${STORE_KEY_PREFIXES.interactiveLogin}${pendingToken}` : null;
      let verified = key ? store.getData(key) : void 0;
      if (key && verified && isExpired(verified.expires_at)) {
        releaseGate(verified);
        store.deleteData(key);
        verified = void 0;
      }
      const fields = carriedFields(params);
      if (organizationId)
        fields.organization_id = organizationId;
      const backHref = `/user_management/authorize?${new URLSearchParams(fields).toString()}`;
      const failStep = (method, error2) => emitAuthenticationEvent({
        eventBus: store.getData(STORE_KEYS.eventBus),
        method,
        status: "failed",
        userId: user.id,
        email: user.email,
        ipAddress: c.req.header("x-forwarded-for") ?? null,
        userAgent: c.req.header("user-agent") ?? null,
        error: error2
      });
      if (verified && verified.user_id === user.id) {
        login = verified;
        loginToken = pendingToken;
      } else {
        const page = (error2) => renderPasswordPage({
          email: user.email,
          formAction: "/user_management/authorize",
          hiddenFields: { ...fields, email: user.email },
          backHref,
          error: error2
        });
        if (password === null)
          return c.html(page());
        if (!verifyPassword(password, user.password_hash)) {
          failStep("Password", { code: "invalid_credentials", message: `Invalid credentials for '${user.email}'.` });
          return c.html(page("Incorrect password. Try again."), 401);
        }
        login = {
          user_id: user.id,
          auth_method: "Password",
          expires_at: expiresIn(10),
          step_up_method: null,
          email_verification_id: null,
          challenge_id: null,
          mfa_verified: false
        };
      }
      let unspentCode = code;
      const codePage = (options) => c.html(renderCodePage({
        ...options,
        email: user.email,
        formAction: "/user_management/authorize",
        hiddenFields: { ...fields, email: user.email, pending_authentication_token: carryLogin() },
        backHref
      }), options.error ? 401 : 200);
      if (!user.email_verified) {
        const verificationPage = (error3) => codePage({ title: "Verify your email", lead: "Enter the code we sent to", error: error3 });
        let pending = login.email_verification_id ? ws.emailVerifications.get(login.email_verification_id) : void 0;
        let error2;
        if (pending && isExpired(pending.expires_at)) {
          ws.emailVerifications.delete(pending.id);
          pending = void 0;
          if (unspentCode !== null) {
            failStep("EmailVerification", { code: "expired_code", message: "Code has expired" });
            error2 = "That code has expired. A new one has been sent.";
          }
        }
        if (!pending) {
          pending = ws.emailVerifications.insert({
            object: "email_verification",
            user_id: user.id,
            email: user.email,
            code: generateCode(),
            expires_at: expiresIn(10)
          });
          login.email_verification_id = pending.id;
          return verificationPage(error2);
        }
        if (unspentCode === null)
          return verificationPage();
        if (pending.code !== unspentCode) {
          failStep("EmailVerification", { code: "invalid_code", message: "Invalid code" });
          return verificationPage("Incorrect code. Try again.");
        }
        ws.users.update(user.id, { email_verified: true });
        ws.emailVerifications.delete(pending.id);
        login.email_verification_id = null;
        login.step_up_method = "EmailVerification";
        unspentCode = null;
      }
      const factors = ws.authFactors.findBy("user_id", user.id);
      if (factors.length > 0 && !login.mfa_verified) {
        const challengePage = (error3) => codePage({
          title: "Enter your one-time code",
          lead: "Enter the code from the authenticator enrolled for",
          error: error3
        });
        let pending = login.challenge_id ? ws.authChallenges.get(login.challenge_id) : void 0;
        let error2;
        if (pending && isExpired(pending.expires_at)) {
          ws.authChallenges.delete(pending.id);
          pending = void 0;
          if (unspentCode !== null) {
            failStep("MFA", { code: "expired_challenge", message: "Challenge has expired" });
            error2 = "That code has expired. A new challenge has been issued.";
          }
        }
        if (!pending) {
          pending = ws.authChallenges.insert({
            object: "authentication_challenge",
            user_id: user.id,
            factor_id: factors[0].id,
            expires_at: expiresIn(10),
            code: generateCode()
          });
          login.challenge_id = pending.id;
          return challengePage(error2);
        }
        if (unspentCode === null)
          return challengePage();
        if (pending.code && unspentCode !== pending.code) {
          failStep("MFA", { code: "invalid_one_time_code", message: "Invalid one-time code" });
          return challengePage("Incorrect code. Try again.");
        }
        ws.authChallenges.delete(pending.id);
        login.challenge_id = null;
        login.mfa_verified = true;
        login.step_up_method = "MFA";
      }
    }
    if (!organizationId && interactive) {
      const selectable = activeOrganizationsFor(user.id);
      if (selectable.length > 1) {
        const hiddenFields = { ...carriedFields(params), email: user.email };
        if (login)
          hiddenFields.pending_authentication_token = carryLogin();
        return c.html(renderOrganizationSelectPage({
          email: user.email,
          organizations: selectable,
          formAction: "/user_management/authorize",
          hiddenFields
        }));
      }
    }
    const authCode = ws.authCodes.insert({
      user_id: user.id,
      organization_id: organizationId,
      code: generateId("auth_code"),
      redirect_uri: redirectUri,
      expires_at: expiresIn(10),
      code_challenge: codeChallenge ?? null,
      code_challenge_method: codeChallengeMethod ?? null,
      client_id: clientId,
      auth_method: login?.auth_method ?? null,
      step_up_method: login?.step_up_method ?? null
    });
    if (loginToken)
      store.deleteData(`${STORE_KEY_PREFIXES.interactiveLogin}${loginToken}`);
    const redirect2 = new URL(redirectUri);
    redirect2.searchParams.set("code", authCode.code);
    if (state)
      redirect2.searchParams.set("state", state);
    return c.redirect(redirect2.toString());
  }
  app.get("/user_management/authorize", (c) => {
    const url = new URL(c.req.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    const codeChallenge = url.searchParams.get("code_challenge");
    const codeChallengeMethod = url.searchParams.get("code_challenge_method");
    const loginHint = url.searchParams.get("login_hint");
    const clientId = url.searchParams.get("client_id");
    const organizationId = url.searchParams.get("organization_id");
    if (!redirectUri) {
      throw new WorkOSApiError(400, "redirect_uri is required", "invalid_request");
    }
    assertAllowedRedirectUri(redirectUri, store);
    const interactive = store.getData(STORE_KEYS.interactiveAuth);
    if (interactive) {
      const hiddenFields = { redirect_uri: redirectUri };
      if (state)
        hiddenFields.state = state;
      if (codeChallenge)
        hiddenFields.code_challenge = codeChallenge;
      if (codeChallengeMethod)
        hiddenFields.code_challenge_method = codeChallengeMethod;
      if (clientId)
        hiddenFields.client_id = clientId;
      if (organizationId)
        hiddenFields.organization_id = organizationId;
      return c.html(renderLoginPage({
        title: "Sign In",
        subtitle: "Enter your email to sign in to your account.",
        emailHint: loginHint ?? void 0,
        formAction: "/user_management/authorize",
        hiddenFields,
        // Every user the emulator holds, seeded or created through the API since; the page
        // sorts them. Behind --interactive, and the same list is already readable from
        // GET /user_management/users, so this discloses nothing it did not already hand out.
        users: ws.users.all().map((u) => ({ email: u.email, name: u.name }))
      }));
    }
    return resolveAndRedirect(c, {
      redirectUri,
      state,
      codeChallenge,
      codeChallengeMethod,
      loginHint,
      clientId,
      organizationId,
      password: null,
      code: null,
      pendingToken: null
    });
  });
  app.post("/user_management/authorize", async (c) => {
    const form = await c.req.parseBody();
    const redirectUri = form.redirect_uri;
    if (!redirectUri) {
      throw new WorkOSApiError(400, "redirect_uri is required", "invalid_request");
    }
    return resolveAndRedirect(c, {
      redirectUri,
      state: form.state ?? null,
      codeChallenge: form.code_challenge ?? null,
      codeChallengeMethod: form.code_challenge_method ?? null,
      loginHint: form.email ?? null,
      clientId: form.client_id ?? null,
      organizationId: form.organization_id ?? null,
      // A string, even an empty one, is an attempt; absent means the form has not asked yet.
      password: typeof form.password === "string" ? form.password : null,
      code: typeof form.code === "string" ? form.code : null,
      pendingToken: form.pending_authentication_token ?? null
    });
  });
  app.get("/user_management/authorize/device/verify", (c) => {
    return c.html(renderDeviceVerifyPage({
      title: "Device approved",
      message: "WorkOS Emulate auto-approves device authorization with the first seeded user, so polling /user_management/authenticate will succeed immediately."
    }));
  });
  app.post("/user_management/authorize/device", async (c) => {
    const body = await parseOAuthBody(c);
    const clientId = body.client_id;
    if (!clientId) {
      throw new WorkOSApiError(400, "client_id is required", "invalid_request");
    }
    const users = ws.users.all();
    const user = users[0] ?? null;
    const deviceAuth = ws.deviceAuthorizations.insert({
      device_code: generateId("dev_code"),
      user_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
      user_id: user?.id ?? null,
      client_id: clientId,
      expires_at: expiresIn(15),
      interval: 5
    });
    return c.json(formatDeviceAuthorization(deviceAuth, ctx.baseUrl));
  });
  const authenticateHandler = async (c) => {
    const body = await parseOAuthBody(c);
    const grantType = body.grant_type;
    const clientId = body.client_id;
    if (!grantType) {
      throw new OauthApiError(400, "invalid_request", "grant_type is required.");
    }
    const requestIp = c.req.header("x-forwarded-for") ?? null;
    const requestUserAgent = c.req.header("user-agent") ?? null;
    const resolveInvitation = (token) => {
      const inv = ws.invitations.findOneBy("token", token);
      if (!inv || inv.state !== "pending" || isExpired(inv.expires_at)) {
        throw new WorkOSApiError(400, "The invitation is invalid, expired, or has already been accepted", "invitation_invalid");
      }
      return inv;
    };
    let invitation = INVITATION_TOKEN_GRANTS.has(grantType) && body.invitation_token ? resolveInvitation(body.invitation_token) : null;
    const failAuth = (method, info, error2) => {
      emitAuthenticationEvent({
        eventBus: store.getData(STORE_KEYS.eventBus),
        method,
        status: "failed",
        userId: info.userId,
        email: info.email,
        ipAddress: requestIp,
        userAgent: requestUserAgent,
        error: { code: error2.code, message: error2.message },
        sso: info.sso
      });
      throw error2;
    };
    const redeemSsoAuthorization = (ssoAuth, code) => {
      const profile = ws.ssoProfiles.get(ssoAuth.profile_id);
      if (isExpired(ssoAuth.expires_at)) {
        ws.ssoAuthorizations.delete(ssoAuth.id);
        failAuth("SSO", {
          email: profile?.email,
          userId: findUserByEmail(ws, profile?.email ?? "")?.id ?? null,
          sso: {
            organization_id: ssoAuth.organization_id,
            connection_id: ssoAuth.connection_id,
            session_id: null
          }
        }, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
      }
      if (!profile)
        throw new WorkOSApiError(500, "Profile not found", "server_error");
      if (invitation && !emailsMatch(invitation.email, profile.email)) {
        throw new WorkOSApiError(400, "The invitation was issued for a different email address", "invitation_cannot_be_used_for_email");
      }
      ws.ssoAuthorizations.delete(ssoAuth.id);
      const existing = findUserByEmail(ws, profile.email);
      if (existing)
        return existing;
      return ws.users.insert({
        object: "user",
        email: profile.email,
        name: null,
        first_name: profile.first_name,
        last_name: profile.last_name,
        // The IdP asserted the address, which is what verification proves.
        email_verified: true,
        profile_picture_url: null,
        last_sign_in_at: null,
        external_id: null,
        metadata: {},
        locale: null,
        password_hash: null,
        impersonator: null
      });
    };
    const issueMfaChallenge = (mfaUser, orgId, primaryMethod, factor) => {
      const pendingToken = generateId("pending");
      store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, {
        user_id: mfaUser.id,
        organization_id: orgId,
        auth_method: primaryMethod,
        invitation_token: invitation?.token ?? null
      });
      const challenge = ws.authChallenges.insert({
        object: "authentication_challenge",
        user_id: mfaUser.id,
        factor_id: factor.id,
        expires_at: expiresIn(10),
        code: generateCode()
      });
      return c.json({
        code: "mfa_challenge",
        message: "Multi-factor authentication is required to continue.",
        pending_authentication_token: pendingToken,
        authentication_challenge: formatAuthChallenge(challenge)
      }, 403);
    };
    const issueEmailVerification = (unverified, orgId, primaryMethod) => {
      const pendingToken = generateId("pending");
      store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, {
        user_id: unverified.id,
        organization_id: orgId,
        auth_method: primaryMethod,
        invitation_token: invitation?.token ?? null
      });
      const verification = ws.emailVerifications.insert({
        object: "email_verification",
        user_id: unverified.id,
        email: unverified.email,
        code: generateCode(),
        expires_at: expiresIn(10)
      });
      return c.json({
        code: "email_verification_required",
        message: "Email ownership must be verified before authentication.",
        pending_authentication_token: pendingToken,
        email_verification_id: verification.id,
        email: unverified.email
      }, 403);
    };
    let user;
    let organizationId = null;
    let authMethod;
    let sessionAuthMethod;
    let isFreshLogin = true;
    let refreshSessionId = null;
    let grantClientId;
    let ssoContext = null;
    switch (grantType) {
      case "authorization_code": {
        const code = body.code;
        if (!code)
          throw new OauthApiError(400, "invalid_request", "code is required.");
        const authCode = ws.authCodes.findOneBy("code", code);
        if (!authCode) {
          const ssoAuth = ws.ssoAuthorizations.findOneBy("code", code);
          if (ssoAuth) {
            user = redeemSsoAuthorization(ssoAuth, code);
            organizationId = ssoAuth.organization_id;
            ssoContext = { organization_id: ssoAuth.organization_id, connection_id: ssoAuth.connection_id };
            grantClientId = clientId;
            authMethod = "SSO";
            break;
          }
          failAuth("OAuth", {}, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
        }
        if (authCode.auth_method === "external_auth" || isExpired(authCode.expires_at)) {
          failAuth("OAuth", { userId: authCode.user_id, email: ws.users.get(authCode.user_id)?.email }, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
        }
        if (authCode.code_challenge) {
          const codeVerifier = body.code_verifier;
          if (!codeVerifier) {
            throw new OauthApiError(400, "invalid_request", "code_verifier is required.");
          }
          const method = authCode.code_challenge_method ?? "S256";
          let challenge;
          if (method === "S256") {
            challenge = createHash3("sha256").update(codeVerifier).digest("base64url");
          } else {
            challenge = codeVerifier;
          }
          if (challenge !== authCode.code_challenge) {
            failAuth("OAuth", { userId: authCode.user_id, email: ws.users.get(authCode.user_id)?.email }, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
          }
        }
        user = ws.users.get(authCode.user_id);
        if (!user) {
          failAuth("OAuth", { userId: authCode.user_id }, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
        }
        if (authCode.organization_id && !activeOrganizationsFor(authCode.user_id).some((o) => o.id === authCode.organization_id)) {
          failAuth("OAuth", { userId: authCode.user_id, email: ws.users.get(authCode.user_id)?.email }, new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`));
        }
        organizationId = authCode.organization_id;
        grantClientId = authCode.client_id ?? void 0;
        ws.authCodes.delete(authCode.id);
        authMethod = authCode.step_up_method ?? authCode.auth_method ?? "OAuth";
        if (authCode.step_up_method && authCode.auth_method)
          sessionAuthMethod = authCode.auth_method;
        break;
      }
      case "password": {
        const email = requireEmailString(body.email);
        const password = body.password;
        if (!email || !password) {
          throw new OauthApiError(400, "invalid_request", "email and password are required.");
        }
        user = findUserByEmail(ws, email);
        if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
          failAuth("Password", { email, userId: user?.id }, new WorkOSApiError(400, `Invalid credentials for '${email}'.`, "invalid_credentials"));
        }
        authMethod = "Password";
        if (!user.email_verified) {
          return issueEmailVerification(user, organizationId, "Password");
        }
        const passwordFactors = ws.authFactors.findBy("user_id", user.id);
        if (passwordFactors.length > 0) {
          return issueMfaChallenge(user, organizationId, "Password", passwordFactors[0]);
        }
        break;
      }
      // Accept both old and new grant type names for magic-auth
      case "urn:workos:oauth:grant-type:magic-auth":
      case "urn:workos:oauth:grant-type:magic-auth:code": {
        const code = body.code;
        const email = requireEmailString(body.email);
        if (!code || !email) {
          throw new OauthApiError(400, "invalid_request", "code and email are required.");
        }
        const magicAuth = ws.magicAuths.all().find((ma) => ma.code === code && emailsMatch(ma.email, email));
        if (!magicAuth) {
          failAuth("MagicAuth", { email }, new WorkOSApiError(400, "Invalid one-time code", "invalid_one_time_code"));
        }
        if (isExpired(magicAuth.expires_at)) {
          failAuth("MagicAuth", { email: magicAuth.email, userId: magicAuth.user_id }, new WorkOSApiError(400, `One-time code for '${magicAuth.email}' has expired.`, "one_time_code_expired"));
        }
        user = ws.users.get(magicAuth.user_id);
        ws.magicAuths.delete(magicAuth.id);
        authMethod = "MagicAuth";
        break;
      }
      // Accept both old and new grant type names for email-verification
      case "urn:workos:oauth:grant-type:email-verification":
      case "urn:workos:oauth:grant-type:email-verification:code": {
        const code = body.code;
        const pendingToken = body.pending_authentication_token;
        let pending;
        if (pendingToken) {
          pending = store.getData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`);
          if (!pending) {
            throw new WorkOSApiError(400, "Invalid pending authentication token", "invalid_pending_authentication_token");
          }
        }
        const userId = pending?.user_id ?? body.user_id;
        if (!code || !userId) {
          throw new OauthApiError(400, "invalid_request", "code and pending_authentication_token (or user_id) are required.");
        }
        const ev = ws.emailVerifications.findBy("user_id", userId).find((v) => v.code === code);
        if (!ev) {
          failAuth("EmailVerification", { userId, email: ws.users.get(userId)?.email }, new WorkOSApiError(400, "Invalid code", "invalid_code"));
        }
        if (isExpired(ev.expires_at)) {
          failAuth("EmailVerification", { email: ev.email, userId: ev.user_id }, new WorkOSApiError(400, "Code has expired", "expired_code"));
        }
        const deferredInvitation = pending?.invitation_token ? resolveInvitation(pending.invitation_token) : null;
        ws.users.update(userId, { email_verified: true });
        ws.emailVerifications.delete(ev.id);
        if (pendingToken)
          store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, void 0);
        user = ws.users.get(userId);
        organizationId = pending?.organization_id ?? null;
        invitation = deferredInvitation;
        authMethod = "EmailVerification";
        sessionAuthMethod = pending?.auth_method;
        break;
      }
      case "refresh_token": {
        const token = body.refresh_token;
        if (!token) {
          throw new OauthApiError(400, "invalid_request", "refresh_token is required.");
        }
        const refreshToken = ws.refreshTokens.findOneBy("token", token);
        if (!refreshToken) {
          throw new OauthApiError(400, "invalid_grant", "Invalid refresh token.");
        }
        if (isExpired(refreshToken.expires_at)) {
          ws.refreshTokens.delete(refreshToken.id);
          throw new OauthApiError(400, "invalid_grant", "Refresh token has expired.");
        }
        user = ws.users.get(refreshToken.user_id);
        if (!user) {
          throw new OauthApiError(400, "invalid_grant", "Invalid refresh token.");
        }
        organizationId = body.organization_id ?? refreshToken.organization_id;
        refreshSessionId = refreshToken.session_id;
        grantClientId = refreshToken.client_id ?? void 0;
        ws.refreshTokens.delete(refreshToken.id);
        authMethod = "OAuth";
        isFreshLogin = false;
        break;
      }
      case "urn:workos:oauth:grant-type:mfa-totp": {
        const code = body.code;
        const pendingToken = body.pending_authentication_token;
        const challengeId = body.authentication_challenge_id;
        if (!code || !pendingToken || !challengeId) {
          throw new OauthApiError(400, "invalid_request", "code, pending_authentication_token, and authentication_challenge_id are required.");
        }
        const pending = store.getData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`);
        if (!pending) {
          throw new WorkOSApiError(400, "Invalid pending authentication token", "invalid_pending_authentication_token");
        }
        const challenge = ws.authChallenges.get(challengeId);
        if (!challenge) {
          throw new OauthApiError(400, "invalid_request", "Invalid authentication challenge.");
        }
        if (isExpired(challenge.expires_at)) {
          ws.authChallenges.delete(challenge.id);
          failAuth("MFA", { userId: pending.user_id, email: ws.users.get(pending.user_id)?.email }, new WorkOSApiError(400, "Challenge has expired", "expired_challenge"));
        }
        if (challenge.code && code !== challenge.code) {
          failAuth("MFA", { userId: pending.user_id, email: ws.users.get(pending.user_id)?.email }, new WorkOSApiError(400, "Invalid one-time code", "invalid_one_time_code"));
        }
        const deferredInvitation = pending.invitation_token ? resolveInvitation(pending.invitation_token) : null;
        ws.authChallenges.delete(challenge.id);
        store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, void 0);
        user = ws.users.get(pending.user_id);
        organizationId = pending.organization_id;
        invitation = deferredInvitation;
        authMethod = "MFA";
        sessionAuthMethod = pending.auth_method;
        break;
      }
      case "urn:workos:oauth:grant-type:organization-selection": {
        const pendingToken = body.pending_authentication_token;
        const orgId = body.organization_id;
        if (!pendingToken || !orgId) {
          throw new OauthApiError(400, "invalid_request", "pending_authentication_token and organization_id are required.");
        }
        const pending = store.getData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`);
        if (!pending) {
          throw new WorkOSApiError(400, "Invalid pending authentication token", "invalid_pending_authentication_token");
        }
        const org = ws.organizations.get(orgId);
        if (!org)
          throw notFound("Organization");
        const selectable = ws.organizationMemberships.findBy("organization_id", orgId).find((m) => m.user_id === pending.user_id && m.status === "active");
        if (!selectable) {
          throw new WorkOSApiError(400, "The user is not an active member of the selected organization", "organization_membership_not_found");
        }
        const deferredInvitation = pending.invitation_token ? resolveInvitation(pending.invitation_token) : null;
        store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, void 0);
        user = ws.users.get(pending.user_id);
        organizationId = orgId;
        invitation = deferredInvitation;
        authMethod = pending.auth_method;
        break;
      }
      case "urn:ietf:params:oauth:grant-type:device_code": {
        const deviceCode = body.device_code;
        if (!deviceCode) {
          throw new OauthApiError(400, "invalid_request", "device_code is required.");
        }
        const deviceAuth = ws.deviceAuthorizations.findOneBy("device_code", deviceCode);
        if (!deviceAuth) {
          throw new OauthApiError(400, "invalid_grant", "Invalid device code.");
        }
        if (isExpired(deviceAuth.expires_at)) {
          ws.deviceAuthorizations.delete(deviceAuth.id);
          throw new OauthApiError(400, "expired_token", "The device code has expired.");
        }
        if (!deviceAuth.user_id) {
          throw new OauthApiError(400, "authorization_pending", "The authorization request is still pending.");
        }
        user = ws.users.get(deviceAuth.user_id);
        if (!user) {
          throw new OauthApiError(400, "invalid_grant", "Invalid device code.");
        }
        ws.deviceAuthorizations.delete(deviceAuth.id);
        authMethod = "OAuth";
        break;
      }
      // `unsupported_grant_type` appears exactly once in the spec, under /sso/token, and nowhere
      // in authenticate's 400 — which does list `invalid_request`. The asymmetry reads as real
      // rather than an omission: authenticate's body is a oneOf discriminated on grant_type, so
      // an unrecognized one fails body validation rather than reaching a grant handler that could
      // decline it. Keeping the code the spec gives us, and saying what it means in the
      // description instead of naming a code the endpoint never returns.
      default:
        throw new OauthApiError(400, "invalid_request", `The grant type is not supported: ${grantType}`);
    }
    if (!user)
      throw notFound("User");
    if (invitation && !emailsMatch(invitation.email, user.email)) {
      throw new WorkOSApiError(400, "The invitation was issued for a different email address", "invitation_cannot_be_used_for_email");
    }
    if (invitation?.organization_id)
      organizationId = invitation.organization_id;
    if (isFreshLogin && !organizationId) {
      const selectableOrgs = activeOrganizationsFor(user.id);
      if (selectableOrgs.length === 1) {
        organizationId = selectableOrgs[0].id;
      } else if (selectableOrgs.length > 1) {
        const pendingToken = generateId("pending");
        store.setData(`${STORE_KEY_PREFIXES.pendingAuth}${pendingToken}`, {
          user_id: user.id,
          organization_id: null,
          auth_method: sessionAuthMethod ?? authMethod,
          invitation_token: invitation?.token ?? null
        });
        return c.json({
          code: "organization_selection_required",
          message: "The user must choose an organization to finish their authentication.",
          pending_authentication_token: pendingToken,
          organizations: selectableOrgs,
          user: formatUser(user)
        }, 403);
      }
    }
    if (invitation) {
      acceptInvitation(invitation, user, ws, store.getData(STORE_KEYS.eventBus));
    }
    const templateClaims = renderConfiguredJwtTemplate(store, ws, user, organizationId);
    let session;
    if (isFreshLogin) {
      const verifyEmail = authMethod === "MagicAuth" && !user.email_verified;
      if (verifyEmail) {
        ws.users.update(user.id, {
          last_sign_in_at: (/* @__PURE__ */ new Date()).toISOString(),
          email_verified: true
        });
      } else {
        ws.users.updateSilent(user.id, { last_sign_in_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
      session = ws.sessions.insert({
        object: "session",
        user_id: user.id,
        organization_id: organizationId,
        ip_address: requestIp,
        user_agent: requestUserAgent,
        auth_method: AUTH_METHOD_SESSION_VALUES[sessionAuthMethod ?? authMethod] ?? "unknown",
        status: "active",
        expires_at: expiresIn(30 * 24 * 60),
        // matches refresh token lifetime
        ended_at: null
      });
    } else {
      const existing = refreshSessionId ? ws.sessions.get(refreshSessionId) : void 0;
      if (!existing)
        throw new OauthApiError(400, "invalid_grant", "Invalid refresh token.");
      session = existing;
    }
    const updatedUser = ws.users.get(user.id);
    let roleSlug;
    let permissionSlugs;
    if (organizationId) {
      const membership = ws.organizationMemberships.findBy("organization_id", organizationId).find((m) => m.user_id === user.id);
      if (membership) {
        roleSlug = membership.role.slug;
        const role = resolvePrimaryRole(ws, organizationId, membership.role.slug);
        if (role) {
          permissionSlugs = getRolePermissions(ws, role.id).map((p) => p.slug);
        }
      }
    }
    const tokenClientId = grantClientId ?? clientId;
    const tokenAudience = tokenClientId ?? "workos-emulate";
    const entitlements = organizationId ? ws.organizations.get(organizationId)?.entitlements : void 0;
    const flagSlugs = tokenFeatureFlags(ws, user.id, organizationId);
    const accessToken = jwt.sign({
      sub: user.id,
      sid: session.id,
      jti: generateUlid(),
      org_id: organizationId ?? void 0,
      role: roleSlug,
      // Production emits the plural `roles` alongside `role`; the emulator models one role per
      // membership, so it is that role as a single-element array.
      roles: roleSlug ? [roleSlug] : void 0,
      permissions: permissionSlugs,
      client_id: tokenClientId,
      // session.created_at gives the documented semantics: stamped at sign-in, unchanged by
      // refresh (which reuses the session). If in-session re-authentication is ever modelled,
      // this needs a dedicated session.authenticated_at to read instead.
      auth_time: Math.floor(new Date(session.created_at).getTime() / 1e3),
      // RFC 8693 actor claim; the docs put the impersonator's email in the nested sub. The
      // emulator models impersonation as user config, so it is read off the user record.
      act: updatedUser.impersonator ? { sub: updatedUser.impersonator.email } : void 0,
      entitlements: entitlements?.length ? entitlements : void 0,
      feature_flags: flagSlugs.length ? flagSlugs : void 0,
      aud: tokenAudience
    }, { claims: templateClaims, issuerClientId: tokenClientId });
    const newRefreshToken = ws.refreshTokens.insert({
      token: generateId("ref"),
      user_id: user.id,
      organization_id: organizationId,
      session_id: session.id,
      expires_at: expiresIn(30 * 24 * 60),
      // 30 days
      client_id: tokenClientId ?? null
    });
    if (isFreshLogin) {
      emitAuthenticationEvent({
        eventBus: store.getData(STORE_KEYS.eventBus),
        method: authMethod,
        status: "succeeded",
        userId: user.id,
        email: updatedUser.email,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        // Required on authentication.sso_* by the spec's event data. This is the only SSO path
        // that reaches a session, so it is also the only one that can report a session_id.
        sso: ssoContext ? { ...ssoContext, session_id: session.id } : void 0
      });
    }
    return c.json({
      user: formatUser(updatedUser),
      organization_id: organizationId,
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
      // The response enum is PascalCase/provider-specific — the internal 'OAuth'/'MFA'/
      // 'EmailVerification' categories aren't valid here. Resolve to a spec-valid value, or
      // undefined (key omitted, like impersonator below) when the concrete method is unknown
      // rather than inventing a provider. A refresh reuses an existing session, so it echoes that
      // session's original method; a fresh login mirrors the session's sessionAuthMethod precedence.
      authentication_method: isFreshLogin ? resolveResponseAuthMethod(sessionAuthMethod ?? authMethod, {
        oauthProvider: updatedUser.oauth_provider
      }) : resolveSessionResponseAuthMethod(session.auth_method, {
        oauthProvider: updatedUser.oauth_provider
      }),
      // Production never returns sealed_session for API requests: the SDKs seal client-side
      // with a caller-supplied cookie password the server never sees. A non-null value here
      // pushes authkit-nextjs session cookies past the 4096-byte browser cap (issue #93).
      sealed_session: null,
      impersonator: updatedUser.impersonator ?? void 0
    });
  };
  app.post("/user_management/authenticate", authenticateHandler);
  app.post("/x/authkit/users/authenticate", authenticateHandler);
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/connections.js
function connectionRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/connections", async (c) => {
    const body = await parseJsonBody(c);
    const name = body.name;
    const organizationId = body.organization_id;
    const connectionType = body.connection_type ?? "GenericSAML";
    const domainsList = body.domains ?? [];
    if (!organizationId) {
      throw notFound("Organization");
    }
    const org = ws.organizations.get(organizationId);
    if (!org)
      throw notFound("Organization");
    const domains = domainsList.map((d) => ({
      object: "connection_domain",
      id: generateId("conn_domain"),
      domain: d
    }));
    const conn = ws.connections.insert({
      object: "connection",
      organization_id: organizationId,
      connection_type: connectionType,
      name: name ?? `${org.name} SSO`,
      state: "active",
      domains
    });
    return c.json(formatConnection(conn), 201);
  });
  app.get("/connections", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const orgFilter = url.searchParams.get("organization_id") ?? void 0;
    const typeFilter = url.searchParams.get("connection_type") ?? void 0;
    const domainFilter = url.searchParams.get("domain") ?? void 0;
    const result = ws.connections.list({
      ...params,
      filter: (conn) => {
        if (orgFilter && conn.organization_id !== orgFilter)
          return false;
        if (typeFilter && conn.connection_type !== typeFilter)
          return false;
        if (domainFilter && !conn.domains.some((d) => d.domain === domainFilter))
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatConnection));
  });
  app.get("/connections/:id", (c) => {
    const conn = ws.connections.get(c.req.param("id"));
    if (!conn)
      throw notFound("Connection");
    return c.json(formatConnection(conn));
  });
  app.delete("/connections/:id", (c) => {
    const conn = ws.connections.get(c.req.param("id"));
    if (!conn)
      throw notFound("Connection");
    for (const auth of ws.ssoAuthorizations.all()) {
      if (auth.connection_id === conn.id) {
        ws.ssoAuthorizations.delete(auth.id);
      }
    }
    ws.connections.delete(conn.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/sso.js
var OAUTH_CONNECTION_TYPES = /* @__PURE__ */ new Set([
  "AppleOAuth",
  "GitHubOAuth",
  "GoogleOAuth",
  "MicrosoftOAuth"
]);
function ssoRoutes(ctx) {
  const { app, store, jwt } = ctx;
  const ws = getWorkOSStore(store);
  const claimsDomain = (cn, domain) => cn.domains.some((d) => d.domain.trim().toLowerCase() === domain.trim().toLowerCase());
  function theOnly(candidates, selector) {
    if (candidates.length > 1) {
      throw new WorkOSApiError(400, `Multiple active connections match ${selector}; select one with connection or organization`, "invalid_request");
    }
    return candidates[0];
  }
  function findProviderConnection(provider, domainHint) {
    const ofType = ws.connections.all().filter((cn) => cn.state === "active" && cn.connection_type === provider);
    const hinted = domainHint ? ofType.filter((cn) => claimsDomain(cn, domainHint)) : [];
    return theOnly(hinted.length > 0 ? hinted : ofType, `provider ${provider}`);
  }
  function resolveAndRedirect(c, params) {
    const { redirectUri, state, connectionId, organizationId, domainHint, provider, email: loginHint } = params;
    assertAllowedRedirectUri(redirectUri, store);
    let connection;
    if (connectionId) {
      connection = ws.connections.get(connectionId);
    } else if (organizationId) {
      connection = ws.connections.findBy("organization_id", organizationId).find((cn) => cn.state === "active");
    } else if (provider) {
      connection = findProviderConnection(provider, domainHint);
    } else if (domainHint) {
      connection = theOnly(ws.connections.all().filter((cn) => cn.state === "active" && claimsDomain(cn, domainHint)), `domain_hint ${domainHint}`);
    }
    if (!connection || connection.state !== "active") {
      throw new WorkOSApiError(404, "No active connection found", "connection_not_found");
    }
    const email = loginHint ?? `user@${connection.domains[0]?.domain ?? "example.com"}`;
    let profile = ws.ssoProfiles.all().find((p) => p.connection_id === connection.id && emailsMatch(p.email, email));
    if (!profile) {
      profile = ws.ssoProfiles.insert({
        object: "profile",
        connection_id: connection.id,
        connection_type: connection.connection_type,
        organization_id: connection.organization_id,
        idp_id: `idp_${generateId("usr")}`,
        email,
        first_name: email.split("@")[0],
        last_name: null,
        groups: [],
        raw_attributes: { email }
      });
    }
    const authCode = ws.ssoAuthorizations.insert({
      code: generateId("sso_code"),
      connection_id: connection.id,
      organization_id: connection.organization_id,
      profile_id: profile.id,
      redirect_uri: redirectUri,
      state,
      expires_at: expiresIn(10)
    });
    const redirect2 = new URL(redirectUri);
    redirect2.searchParams.set("code", authCode.code);
    if (state)
      redirect2.searchParams.set("state", state);
    return c.redirect(redirect2.toString());
  }
  app.get("/sso/authorize", (c) => {
    const url = new URL(c.req.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    const connectionId = url.searchParams.get("connection");
    const organizationId = url.searchParams.get("organization");
    const domainHint = url.searchParams.get("domain_hint");
    const provider = url.searchParams.get("provider");
    const loginHint = url.searchParams.get("login_hint");
    if (!redirectUri) {
      throw new WorkOSApiError(400, "Missing required parameter: redirect_uri", "invalid_request");
    }
    assertAllowedRedirectUri(redirectUri, store);
    const interactive = store.getData(STORE_KEYS.interactiveAuth);
    if (interactive) {
      const hiddenFields = { redirect_uri: redirectUri };
      if (state)
        hiddenFields.state = state;
      if (connectionId)
        hiddenFields.connection = connectionId;
      if (organizationId)
        hiddenFields.organization = organizationId;
      if (domainHint)
        hiddenFields.domain_hint = domainHint;
      if (provider)
        hiddenFields.provider = provider;
      return c.html(renderLoginPage({
        title: "SSO Login",
        subtitle: "Sign in with your corporate identity.",
        emailHint: loginHint ?? void 0,
        formAction: "/sso/authorize",
        hiddenFields
      }));
    }
    return resolveAndRedirect(c, {
      redirectUri,
      state,
      connectionId,
      organizationId,
      domainHint,
      provider,
      email: loginHint
    });
  });
  app.post("/sso/authorize", async (c) => {
    const form = await c.req.parseBody();
    const redirectUri = form.redirect_uri;
    if (!redirectUri) {
      throw new WorkOSApiError(400, "Missing required parameter: redirect_uri", "invalid_request");
    }
    return resolveAndRedirect(c, {
      redirectUri,
      state: form.state ?? null,
      connectionId: form.connection ?? null,
      organizationId: form.organization ?? null,
      domainHint: form.domain_hint ?? null,
      provider: form.provider ?? null,
      email: form.email ?? null
    });
  });
  app.post("/sso/token", async (c) => {
    const body = await parseJsonBody(c);
    const grantType = body.grant_type;
    const code = body.code;
    if (!grantType) {
      throw new OauthApiError(400, "invalid_request", "grant_type is required.");
    }
    if (grantType !== "authorization_code") {
      throw new OauthApiError(400, "unsupported_grant_type", `The grant type is not supported: ${grantType}`);
    }
    if (!code) {
      throw new OauthApiError(400, "invalid_request", "code is required.");
    }
    const auth = ws.ssoAuthorizations.findOneBy("code", code);
    if (!auth) {
      const error2 = new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`);
      emitAuthenticationEvent({
        eventBus: store.getData(STORE_KEYS.eventBus),
        method: "SSO",
        status: "failed",
        error: { code: error2.code, message: error2.message },
        ipAddress: c.req.header("x-forwarded-for") ?? null,
        userAgent: c.req.header("user-agent") ?? null,
        sso: {
          organization_id: null,
          connection_id: null,
          session_id: null
        }
      });
      throw error2;
    }
    if (isExpired(auth.expires_at)) {
      ws.ssoAuthorizations.delete(auth.id);
      const expiredProfile = ws.ssoProfiles.get(auth.profile_id);
      const error2 = new OauthApiError(400, "invalid_grant", `The code '${code}' has expired or is invalid.`);
      emitAuthenticationEvent({
        eventBus: store.getData(STORE_KEYS.eventBus),
        method: "SSO",
        status: "failed",
        email: expiredProfile?.email,
        userId: findUserByEmail(ws, expiredProfile?.email ?? "")?.id,
        error: { code: error2.code, message: error2.message },
        ipAddress: c.req.header("x-forwarded-for") ?? null,
        userAgent: c.req.header("user-agent") ?? null,
        sso: {
          organization_id: auth.organization_id,
          connection_id: expiredProfile?.connection_id ?? null,
          session_id: null
        }
      });
      throw error2;
    }
    const profile = ws.ssoProfiles.get(auth.profile_id);
    if (!profile) {
      throw new WorkOSApiError(500, "Profile not found", "server_error");
    }
    ws.ssoAuthorizations.delete(auth.id);
    const accessToken = jwt.sign({
      sub: profile.id,
      aud: body.client_id ?? "workos-emulate",
      org_id: auth.organization_id
    });
    store.setData(`${STORE_KEY_PREFIXES.ssoToken}${accessToken}`, profile.id);
    const authenticatedUser = findUserByEmail(ws, profile.email);
    if (authenticatedUser && OAUTH_CONNECTION_TYPES.has(profile.connection_type)) {
      linkOAuthIdentity(ws, authenticatedUser.id, profile.connection_type, profile.idp_id);
    }
    emitAuthenticationEvent({
      eventBus: store.getData(STORE_KEYS.eventBus),
      method: "SSO",
      status: "succeeded",
      email: profile.email,
      userId: authenticatedUser?.id ?? null,
      ipAddress: c.req.header("x-forwarded-for") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
      sso: {
        organization_id: auth.organization_id ?? profile.organization_id,
        connection_id: profile.connection_id,
        session_id: null
      }
    });
    return c.json({
      profile: formatSSOProfile(profile),
      access_token: accessToken
    });
  });
  app.get("/sso/profile", (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      throw new WorkOSApiError(401, "Unauthorized", "unauthorized");
    }
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const profileId = store.getData(`${STORE_KEY_PREFIXES.ssoToken}${token}`);
    if (!profileId) {
      try {
        const payload = jwt.verify(token);
        const profile2 = ws.ssoProfiles.get(payload.sub);
        if (profile2)
          return c.json(formatSSOProfile(profile2));
      } catch {
      }
      throw new WorkOSApiError(401, "Invalid access token", "unauthorized");
    }
    const profile = ws.ssoProfiles.get(profileId);
    if (!profile) {
      throw new WorkOSApiError(404, "Profile not found", "not_found");
    }
    return c.json(formatSSOProfile(profile));
  });
  const jwks = (c) => c.json(jwt.getJWKS());
  app.get("/sso/jwks", jwks);
  app.get("/sso/jwks/:clientId", jwks);
  const CLIENT_ID_SHAPE = /^client_[A-Za-z0-9_-]+$/;
  app.get("/user_management/:clientId/.well-known/openid-configuration", (c) => {
    const clientId = c.req.param("clientId");
    if (!CLIENT_ID_SHAPE.test(clientId)) {
      return c.json({
        message: `Application not found: '${clientId}'.`,
        code: "entity_not_found",
        entity_id: clientId
      }, 404);
    }
    const origin = new URL(c.req.url).origin;
    return c.json({
      issuer: jwt.authKitIssuer(clientId),
      authorization_endpoint: `${origin}/user_management/authorize`,
      token_endpoint: `${origin}/user_management/authenticate`,
      response_types_supported: ["code"],
      jwks_uri: `${origin}/sso/jwks/${clientId}`
    });
  });
  app.post("/sso/logout/authorize", async (c) => {
    const body = await parseJsonBody(c);
    const profileId = body.profile_id;
    if (!profileId) {
      throw new WorkOSApiError(400, "profile_id is required", "invalid_request");
    }
    const profile = ws.ssoProfiles.get(profileId);
    if (!profile) {
      throw new WorkOSApiError(404, "Profile not found", "not_found");
    }
    const logoutToken = generateId("sso_logout");
    store.setData(`${STORE_KEY_PREFIXES.ssoLogout}${logoutToken}`, profile.id);
    return c.json({
      logout_token: logoutToken,
      logout_url: `${ctx.baseUrl}/sso/logout?token=${logoutToken}`
    });
  });
  app.get("/sso/logout", (c) => {
    const url = new URL(c.req.url);
    const logoutToken = url.searchParams.get("token");
    if (!logoutToken) {
      throw new WorkOSApiError(400, "token is required", "invalid_request");
    }
    const profileId = store.getData(`${STORE_KEY_PREFIXES.ssoLogout}${logoutToken}`);
    if (!profileId) {
      throw new WorkOSApiError(400, "Invalid logout token", "invalid_logout_token");
    }
    store.setData(`${STORE_KEY_PREFIXES.ssoLogout}${logoutToken}`, void 0);
    return c.json({ success: true });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/pipes.js
var VALID_PROVIDERS = ["github", "slack", "google", "salesforce"];
function pipeRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/pipes/connections", async (c) => {
    const body = await parseJsonBody(c);
    const userId = body.user_id;
    const provider = body.provider;
    const scopes = body.scopes ?? [];
    if (!userId) {
      throw validationError("user_id is required", [{ field: "user_id", code: "required" }]);
    }
    if (!provider) {
      throw validationError("provider is required", [{ field: "provider", code: "required" }]);
    }
    if (!VALID_PROVIDERS.includes(provider)) {
      throw validationError(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`, [
        { field: "provider", code: "invalid" }
      ]);
    }
    const conn = ws.pipeConnections.insert({
      object: "pipe_connection",
      user_id: userId,
      provider,
      scopes,
      status: "connected",
      external_account_id: body.external_account_id ?? null
    });
    return c.json(formatPipeConnection(conn), 201);
  });
  app.get("/pipes/connections", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const userIdFilter = url.searchParams.get("user_id") ?? void 0;
    const providerFilter = url.searchParams.get("provider") ?? void 0;
    const result = ws.pipeConnections.list({
      ...params,
      filter: (pc) => {
        if (userIdFilter && pc.user_id !== userIdFilter)
          return false;
        if (providerFilter && pc.provider !== providerFilter)
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatPipeConnection));
  });
  app.get("/pipes/connections/:id", (c) => {
    const conn = ws.pipeConnections.get(c.req.param("id"));
    if (!conn)
      throw notFound("Pipe connection");
    return c.json(formatPipeConnection(conn));
  });
  app.delete("/pipes/connections/:id", (c) => {
    const conn = ws.pipeConnections.get(c.req.param("id"));
    if (!conn)
      throw notFound("Pipe connection");
    ws.pipeConnections.delete(conn.id);
    return c.body(null, 204);
  });
  app.post("/pipes/connections/:id/access_token", (c) => {
    const conn = ws.pipeConnections.get(c.req.param("id"));
    if (!conn)
      throw notFound("Pipe connection");
    if (conn.status !== "connected") {
      return c.json({
        error: "connection_inactive",
        message: `Connection is ${conn.status}`
      }, 400);
    }
    return c.json({
      access_token: `pipes_mock_${conn.provider}_${conn.user_id}`,
      token_type: "bearer",
      scopes: conn.scopes,
      expires_in: 3600
    });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/connected-accounts.js
var DTO_STATES = ["connected", "needs_reauthorization"];
var ACCOUNT_PATH = "/user_management/users/:user_id/connected_accounts/:slug";
function parseDto(body) {
  const dto = {};
  for (const field of ["access_token", "refresh_token"]) {
    const value = body[field];
    if (value === void 0)
      continue;
    if (typeof value !== "string" || value.length === 0) {
      throw validationError(`${field} must be a non-empty string`, [{ field, code: "invalid" }]);
    }
    dto[field] = value;
  }
  if (body.expires_at !== void 0) {
    if (typeof body.expires_at !== "string" || Number.isNaN(Date.parse(body.expires_at))) {
      throw validationError("expires_at must be an ISO-8601 timestamp", [{ field: "expires_at", code: "invalid" }]);
    }
    dto.expires_at = body.expires_at;
  }
  if (body.scopes !== void 0) {
    if (!Array.isArray(body.scopes) || body.scopes.some((s) => typeof s !== "string")) {
      throw validationError("scopes must be an array of strings", [{ field: "scopes", code: "invalid" }]);
    }
    dto.scopes = body.scopes;
  }
  if (body.state !== void 0) {
    if (!DTO_STATES.includes(body.state)) {
      throw validationError(`state must be one of: ${DTO_STATES.join(", ")}`, [{ field: "state", code: "invalid" }]);
    }
    dto.state = body.state;
  }
  return dto;
}
function deriveState(dto) {
  if (dto.state)
    return dto.state;
  if (dto.access_token) {
    const expired = dto.expires_at !== void 0 && Date.parse(dto.expires_at) <= Date.now();
    return expired && !dto.refresh_token ? "needs_reauthorization" : "connected";
  }
  if (dto.refresh_token)
    return "connected";
  throw validationError("a state or at least one token is required");
}
function connectedAccountRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  function resolveTarget(c, { exact = false } = {}) {
    const user = ws.users.get(c.req.param("user_id"));
    if (!user)
      throw notFound("User");
    const slug = c.req.param("slug");
    const organizationId = new URL(c.req.url).searchParams.get("organization_id");
    if (organizationId && !ws.organizations.get(organizationId))
      throw notFound("Organization");
    const account = exact ? ws.connectedAccounts.findBy("user_id", user.id).find((a) => a.provider === slug && a.organization_id === (organizationId ?? null)) : findConnectedAccount(ws, user.id, slug, organizationId ?? null);
    return { userId: user.id, slug, organizationId: organizationId ?? null, account };
  }
  app.get(ACCOUNT_PATH, (c) => {
    const { account } = resolveTarget(c);
    if (!account)
      throw notFound("Connected Account");
    return c.json(formatConnectedAccount(account));
  });
  app.post(ACCOUNT_PATH, async (c) => {
    const { userId, slug, organizationId, account } = resolveTarget(c, { exact: true });
    if (account) {
      throw new WorkOSApiError(409, `Connected account already exists for provider '${slug}'${organizationId ? ` in organization '${organizationId}'` : ""}`, "conflict");
    }
    const dto = parseDto(await parseJsonBody(c));
    const state = deriveState(dto);
    const created = ws.connectedAccounts.insert({
      object: "connected_account",
      user_id: userId,
      organization_id: organizationId,
      provider: slug,
      data_integration_id: dataIntegrationIdFor(ws, slug),
      scopes: dto.scopes ?? [],
      auth_method: "oauth",
      api_key_last_4: null,
      state,
      access_token: dto.access_token ?? null,
      refresh_token: dto.refresh_token ?? null,
      token_expires_at: dto.expires_at ?? null
    });
    return c.json(formatConnectedAccount(created), 201);
  });
  app.put(ACCOUNT_PATH, async (c) => {
    const { account } = resolveTarget(c);
    if (!account)
      throw notFound("Connected Account");
    const dto = parseDto(await parseJsonBody(c));
    const credentialsTouched = dto.access_token !== void 0 || dto.refresh_token !== void 0 || dto.expires_at !== void 0;
    const tokenExpiresAt = dto.expires_at ?? (dto.access_token === void 0 ? account.token_expires_at : null);
    const merged = {
      access_token: dto.access_token ?? account.access_token ?? void 0,
      refresh_token: dto.refresh_token ?? account.refresh_token ?? void 0,
      expires_at: tokenExpiresAt ?? void 0
    };
    const canDerive = merged.access_token !== void 0 || merged.refresh_token !== void 0;
    const state = dto.state ?? (credentialsTouched && canDerive ? deriveState(merged) : account.state);
    const updated = ws.connectedAccounts.update(account.id, {
      ...dto.scopes !== void 0 ? { scopes: dto.scopes } : {},
      ...dto.access_token !== void 0 ? { access_token: dto.access_token } : {},
      ...dto.refresh_token !== void 0 ? { refresh_token: dto.refresh_token } : {},
      token_expires_at: tokenExpiresAt,
      state
    });
    return c.json(formatConnectedAccount(updated));
  });
  app.delete(ACCOUNT_PATH, (c) => {
    const { account } = resolveTarget(c);
    if (!account)
      throw notFound("Connected Account");
    ws.connectedAccounts.delete(account.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/invitations.js
function invitationRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/user_management/invitations", async (c) => {
    const body = await parseJsonBody(c);
    const email = requireEmailField(body.email, { requireShape: true });
    const token = generateVerificationToken();
    const inv = ws.invitations.insert({
      object: "invitation",
      email,
      state: "pending",
      token,
      accept_invitation_url: `${ctx.baseUrl}/user_management/invitations/accept?token=${token}`,
      organization_id: body.organization_id ?? null,
      inviter_user_id: body.inviter_user_id ?? null,
      role_slug: body.role_slug ?? null,
      expires_at: expiresIn(72 * 60),
      // 72 hours
      accepted_at: null,
      revoked_at: null,
      accepted_user_id: null
    });
    return c.json(formatInvitation(inv), 201);
  });
  app.get("/user_management/invitations", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const emailFilter = url.searchParams.get("email") ?? void 0;
    const orgFilter = url.searchParams.get("organization_id") ?? void 0;
    const result = ws.invitations.list({
      ...params,
      filter: (inv) => {
        if (emailFilter && !emailsMatch(inv.email, emailFilter))
          return false;
        if (orgFilter && inv.organization_id !== orgFilter)
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatInvitation));
  });
  app.get("/user_management/invitations/by_token/:token", (c) => {
    const inv = ws.invitations.findOneBy("token", c.req.param("token"));
    if (!inv)
      throw notFound("Invitation");
    return c.json(formatInvitation(inv));
  });
  app.get("/user_management/invitations/:id", (c) => {
    const inv = ws.invitations.get(c.req.param("id"));
    if (!inv)
      throw notFound("Invitation");
    return c.json(formatInvitation(inv));
  });
  app.post("/user_management/invitations/:id/accept", (c) => {
    const inv = ws.invitations.get(c.req.param("id"));
    if (!inv)
      throw notFound("Invitation");
    if (inv.state !== "pending") {
      throw new WorkOSApiError(400, `Invitation is ${inv.state}`, "invalid_invitation_state");
    }
    acceptInvitation(inv, findUserByEmail(ws, inv.email), ws, store.getData(STORE_KEYS.eventBus));
    const updated = ws.invitations.get(inv.id);
    return c.json(formatInvitation(updated));
  });
  app.post("/user_management/invitations/:id/revoke", (c) => {
    const inv = ws.invitations.get(c.req.param("id"));
    if (!inv)
      throw notFound("Invitation");
    if (inv.state !== "pending") {
      throw new WorkOSApiError(400, `Invitation is ${inv.state}`, "invalid_invitation_state");
    }
    ws.invitations.update(inv.id, { state: "revoked", revoked_at: (/* @__PURE__ */ new Date()).toISOString() });
    const eventBus = store.getData(STORE_KEYS.eventBus);
    eventBus?.emit({ event: EVENTS.invitationRevoked, data: formatInvitation(ws.invitations.get(inv.id)) });
    const updated = ws.invitations.get(inv.id);
    return c.json(formatInvitation(updated));
  });
  app.post("/user_management/invitations/:id/resend", (c) => {
    const inv = ws.invitations.get(c.req.param("id"));
    if (!inv)
      throw notFound("Invitation");
    const newToken = generateVerificationToken();
    ws.invitations.update(inv.id, {
      token: newToken,
      accept_invitation_url: `${ctx.baseUrl}/user_management/invitations/accept?token=${newToken}`,
      expires_at: expiresIn(72 * 60),
      state: "pending",
      accepted_at: null,
      accepted_user_id: null,
      revoked_at: null
    });
    const eventBus = store.getData(STORE_KEYS.eventBus);
    eventBus?.emit({ event: EVENTS.invitationResent, data: formatInvitation(ws.invitations.get(inv.id)) });
    const updated = ws.invitations.get(inv.id);
    return c.json(formatInvitation(updated));
  });
  app.delete("/user_management/invitations/:id", (c) => {
    const inv = ws.invitations.get(c.req.param("id"));
    if (!inv)
      throw notFound("Invitation");
    ws.invitations.delete(inv.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/config.js
function configRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/user_management/redirect_uris", async (c) => {
    const body = await parseJsonBody(c);
    const uri = body.uri;
    if (!uri) {
      throw validationError("uri is required", [{ field: "uri", code: "required" }]);
    }
    const existing = ws.redirectUris.findOneBy("uri", uri);
    if (existing) {
      throw new WorkOSApiError(422, "Redirect URI already exists", "redirect_uri_already_exists");
    }
    const redirectUri = ws.redirectUris.insert({
      object: "redirect_uri",
      uri
    });
    return c.json(formatRedirectUri(redirectUri), 201);
  });
  app.post("/user_management/cors_origins", async (c) => {
    const body = await parseJsonBody(c);
    const origin = body.origin;
    if (!origin) {
      throw validationError("origin is required", [{ field: "origin", code: "required" }]);
    }
    const existing = ws.corsOrigins.findOneBy("origin", origin);
    if (existing) {
      throw new WorkOSApiError(422, "CORS origin already exists", "cors_origin_already_exists");
    }
    const corsOrigin = ws.corsOrigins.insert({
      object: "cors_origin",
      origin
    });
    return c.json(formatCorsOrigin(corsOrigin), 201);
  });
  app.get("/user_management/jwt_template", (c) => {
    const template = store.getData(STORE_KEYS.jwtTemplate);
    if (!template) {
      throw new WorkOSApiError(404, "JWT template not found", "not_found");
    }
    return c.json(template);
  });
  app.put("/user_management/jwt_template", async (c) => {
    const body = await parseJsonBody(c);
    if (body.custom_claims !== void 0 && body.content === void 0) {
      throw validationError('custom_claims is not a JWT template field; pass `content` as a template string, e.g. {"content": "{\\"claim\\": \\"{{ user.email }}\\"}"}', [{ field: "content", code: "required" }]);
    }
    const problems = validateJwtTemplateContent(body.content);
    if (problems.length > 0) {
      throw validationError(problems.join("; "), [{ field: "content", code: "invalid" }]);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = store.getData(STORE_KEYS.jwtTemplate);
    const template = {
      object: "jwt_template",
      content: body.content,
      created_at: existing?.created_at ?? now,
      updated_at: now
    };
    store.setData(STORE_KEYS.jwtTemplate, template);
    return c.json(template);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/user-features.js
function userFeatureRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/user_management/users/:user_id/authorized_applications", (c) => {
    const user = ws.users.get(c.req.param("user_id"));
    if (!user)
      throw notFound("User");
    const apps = ws.authorizedApplications.findBy("user_id", user.id);
    return c.json({
      object: "list",
      data: apps.map(formatAuthorizedApplication),
      list_metadata: { before: null, after: null }
    });
  });
  app.delete("/user_management/users/:user_id/authorized_applications/:application_id", (c) => {
    const user = ws.users.get(c.req.param("user_id"));
    if (!user)
      throw notFound("User");
    const appItem = ws.authorizedApplications.get(c.req.param("application_id"));
    if (!appItem || appItem.user_id !== user.id)
      throw notFound("Authorized Application");
    ws.authorizedApplications.delete(appItem.id);
    return c.body(null, 204);
  });
  app.get("/user_management/users/:user_id/data_providers", (c) => {
    const user = ws.users.get(c.req.param("user_id"));
    if (!user)
      throw notFound("User");
    const pipes = ws.pipeConnections.findBy("user_id", user.id);
    return c.json({
      object: "list",
      data: pipes.map(formatPipeConnection),
      list_metadata: { before: null, after: null }
    });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/widgets.js
var WIDGET_SCOPE_API_KEYS_MANAGE = "widgets:api-keys:manage";
function parseWidgetListParams(url) {
  const query = (name) => url.searchParams.get(name)?.trim() || void 0;
  return {
    limit: parseInt(url.searchParams.get("limit") ?? "10") || 10,
    before: query("before"),
    after: query("after"),
    search: query("search")
  };
}
function paginateForWidget(items, params) {
  const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
  const limit = Math.max(1, Math.min(params.limit, 100));
  let start = 0;
  let end = sorted.length;
  if (params.before) {
    const index = sorted.findIndex((item) => item.id === params.before);
    if (index !== -1)
      start = index + 1;
  } else if (params.after) {
    const index = sorted.findIndex((item) => item.id === params.after);
    if (index !== -1) {
      end = index;
      start = Math.max(0, index - limit);
    }
  }
  const page = sorted.slice(start, Math.min(end, start + limit));
  const first = page[0];
  const last = page[page.length - 1];
  return {
    data: page,
    list_metadata: {
      before: last && start + page.length < sorted.length ? last.id : null,
      after: first && start > 0 ? first.id : null
    }
  };
}
function matchesSearch(search, ...fields) {
  if (!search)
    return true;
  const needle = search.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}
function formatWidgetApiKey(k) {
  return {
    id: k.id,
    name: k.name,
    obfuscatedValue: obfuscateApiKey(k.key),
    createdAt: k.created_at,
    lastUsedAt: k.last_used_at,
    expiresAt: k.expires_at,
    permissions: k.permissions
  };
}
function formatWidgetPermission(p) {
  return { id: p.id, slug: p.slug, name: p.name, description: p.description };
}
function parseExpiresAt(body, opts) {
  const value = body.expiresAt;
  if (value === void 0 || value === null)
    return value;
  const invalid = typeof value !== "string" || Number.isNaN(Date.parse(value)) || opts.mustBeFuture && Date.parse(value) <= Date.now();
  if (invalid) {
    throw validationError(opts.mustBeFuture ? "expiresAt must be a future ISO-8601 timestamp or null" : "expiresAt must be an ISO-8601 timestamp or null", [{ field: "expiresAt", code: "invalid" }]);
  }
  return value;
}
function widgetRoutes(ctx) {
  const { app, jwt, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/widgets/token", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    const userId = body.user_id;
    const scopes = body.scopes;
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (!userId) {
      throw validationError("user_id is required", [{ field: "user_id", code: "required" }]);
    }
    if (!Array.isArray(scopes) || !scopes.every((scope) => typeof scope === "string")) {
      throw validationError("scopes is required", [{ field: "scopes", code: "required" }]);
    }
    const token = jwt.sign({
      sub: userId,
      org_id: organizationId,
      aud: WIDGET_TOKEN_AUDIENCE,
      permissions: scopes
    });
    return c.json({ token });
  });
  const widgetAuth = (c) => {
    const auth = c.get("widgetAuth");
    if (!auth)
      throw widgetForbidden("Widget token is required");
    return auth;
  };
  app.use("/_widgets/ApiKeys/*", async (c, next) => {
    if (!widgetAuth(c).permissions.includes(WIDGET_SCOPE_API_KEYS_MANAGE)) {
      throw widgetForbidden(`Widget token lacks the ${WIDGET_SCOPE_API_KEYS_MANAGE} scope`);
    }
    await next();
  });
  const findOrganizationApiKey = (c, apiKeyId) => {
    const record = ws.apiKeyRecords.get(apiKeyId);
    if (!record || apiKeyOrganizationId(record) !== widgetAuth(c).organizationId)
      throw notFound("ApiKey");
    return record;
  };
  app.get("/_widgets/ApiKeys/organization-api-keys", (c) => {
    const { organizationId } = widgetAuth(c);
    const params = parseWidgetListParams(new URL(c.req.url));
    const keys = ws.apiKeyRecords.all().filter((k) => apiKeyOrganizationId(k) === organizationId && matchesSearch(params.search, k.name));
    const page = paginateForWidget(keys, params);
    return c.json({ data: page.data.map(formatWidgetApiKey), list_metadata: page.list_metadata });
  });
  app.post("/_widgets/ApiKeys/organization-api-keys", async (c) => {
    const { organizationId } = widgetAuth(c);
    if (!ws.organizations.get(organizationId))
      throw notFound("Organization");
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name)
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    const permissions = body.permissions;
    if (!Array.isArray(permissions) || !permissions.every((p) => typeof p === "string")) {
      throw validationError("permissions must be an array of strings", [{ field: "permissions", code: "invalid" }]);
    }
    const expiresAt = parseExpiresAt(body, { mustBeFuture: true }) ?? null;
    const { record, value } = issueApiKey(store, ws, {
      name,
      owner: { type: "organization", id: organizationId },
      permissions,
      expiresAt,
      environment: "test"
    });
    return c.json({ ...formatWidgetApiKey(record), value }, 201);
  });
  app.delete("/_widgets/ApiKeys/:apiKeyId", (c) => {
    deleteApiKey(store, ws, findOrganizationApiKey(c, c.req.param("apiKeyId")));
    return c.json({ success: true });
  });
  app.post("/_widgets/ApiKeys/:apiKeyId/expire", async (c) => {
    const record = findOrganizationApiKey(c, c.req.param("apiKeyId"));
    const body = c.req.raw.body ? await parseJsonBody(c) : {};
    const updated = expireApiKey(store, ws, record, parseExpiresAt(body, { mustBeFuture: false }));
    return c.json(formatWidgetApiKey(updated));
  });
  app.get("/_widgets/ApiKeys/permissions", (c) => {
    const params = parseWidgetListParams(new URL(c.req.url));
    const permissions = ws.permissions.all().filter((p) => matchesSearch(params.search, p.slug, p.name, p.description));
    const page = paginateForWidget(permissions, params);
    return c.json({ data: page.data.map(formatWidgetPermission), list_metadata: page.list_metadata });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/authorization-roles.js
function authorizationRoleRoutes(ctx) {
  registerRoleRoutes(ctx, {
    pathPrefix: "/authorization/roles",
    roleType: "EnvironmentRole",
    requireRole: (ws, c) => requireEnvRole(ws, c.req.param("slug")),
    findRole: (ws, _c, slug) => findEnvRole(ws, slug),
    listFilter: () => (r) => r.type === "EnvironmentRole",
    insertDefaults: () => ({ organization_id: null }),
    duplicateMessage: "Role with this slug already exists",
    duplicateCode: "role_slug_conflict"
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/authorization-permissions.js
function authorizationPermissionRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/authorization/permissions", async (c) => {
    const body = await parseJsonBody(c);
    const slug = body.slug;
    const name = body.name;
    const resourceTypeSlug = body.resource_type_slug;
    if (!slug || typeof slug !== "string") {
      throw validationError("slug is required", [{ field: "slug", code: "required" }]);
    }
    if (!name || typeof name !== "string") {
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    }
    if (!isValidResourceTypeSlug(resourceTypeSlug)) {
      throw validationError("resource_type_slug must be a non-empty string", [
        { field: "resource_type_slug", code: "invalid" }
      ]);
    }
    const existing = ws.permissions.findOneBy("slug", slug);
    if (existing) {
      throw new WorkOSApiError(409, "Permission with this slug already exists", "permission_slug_conflict");
    }
    const permission = ws.permissions.insert({
      object: "permission",
      slug,
      name,
      description: body.description ?? null,
      resource_type_slug: resourceTypeSlug ?? DEFAULT_RESOURCE_TYPE_SLUG
    });
    return c.json(formatPermission(permission), 201);
  });
  app.get("/authorization/permissions", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.permissions.list(params);
    return c.json(formatListResponse(result, formatPermission));
  });
  app.get("/authorization/permissions/:slug", (c) => {
    const slug = c.req.param("slug");
    const permission = ws.permissions.findOneBy("slug", slug);
    if (!permission)
      throw notFound("Permission");
    return c.json(formatPermission(permission));
  });
  app.patch("/authorization/permissions/:slug", async (c) => {
    const slug = c.req.param("slug");
    const permission = ws.permissions.findOneBy("slug", slug);
    if (!permission)
      throw notFound("Permission");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("name" in body)
      updates.name = body.name;
    if ("description" in body)
      updates.description = body.description ?? null;
    const updated = ws.permissions.update(permission.id, updates);
    return c.json(formatPermission(updated));
  });
  app.delete("/authorization/permissions/:slug", (c) => {
    const slug = c.req.param("slug");
    const permission = ws.permissions.findOneBy("slug", slug);
    if (!permission)
      throw notFound("Permission");
    ws.rolePermissions.deleteBy("permission_id", permission.id);
    removePermissionFromAgentBlueprints(ws, permission.slug);
    ws.permissions.delete(permission.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/authorization-org-roles.js
function authorizationOrgRoleRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const prefix = "/authorization/organizations/:orgId/roles";
  app.put(`${prefix}/priority`, async (c) => {
    const orgId = c.req.param("orgId");
    const body = await parseJsonBody(c);
    const slugs = body.slugs;
    if (!Array.isArray(slugs)) {
      throw validationError("slugs must be an array", [{ field: "slugs", code: "invalid" }]);
    }
    const orgRoles = ws.roles.findBy("organization_id", orgId).filter((r) => r.type === "OrganizationRole");
    const rolesBySlug = new Map(orgRoles.map((r) => [r.slug, r]));
    for (let i = 0; i < slugs.length; i++) {
      const role = rolesBySlug.get(slugs[i]);
      if (!role)
        throw notFound("Role");
      ws.roles.update(role.id, { priority: i });
    }
    const updated = ws.roles.findBy("organization_id", orgId).filter((r) => r.type === "OrganizationRole").sort((a, b) => a.priority - b.priority);
    return c.json({
      object: "list",
      data: updated.map((r) => formatRole(r, ws)),
      list_metadata: { before: null, after: null }
    });
  });
  registerRoleRoutes(ctx, {
    pathPrefix: prefix,
    roleType: "OrganizationRole",
    requireRole: (ws2, c) => requireOrgRole(ws2, c.req.param("orgId"), c.req.param("slug")),
    findRole: (ws2, c, slug) => findOrgRole(ws2, c.req.param("orgId"), slug),
    listFilter: (c) => (r) => r.organization_id === c.req.param("orgId") && r.type === "OrganizationRole",
    insertDefaults: (c) => ({ organization_id: c.req.param("orgId") }),
    duplicateMessage: "Role with this slug already exists in this organization",
    duplicateCode: "organization_role_slug_conflict",
    validateBeforeCreate: (ws2, c) => {
      const org = ws2.organizations.get(c.req.param("orgId"));
      if (!org)
        throw notFound("Organization");
    }
  });
  app.delete(`${prefix}/:slug/permissions/:permissionSlug`, (c) => {
    const role = requireOrgRole(ws, c.req.param("orgId"), c.req.param("slug"));
    const perm = ws.permissions.findOneBy("slug", c.req.param("permissionSlug"));
    if (!perm)
      throw notFound("Permission");
    const rp = ws.rolePermissions.findBy("role_id", role.id).find((rp2) => rp2.permission_id === perm.id);
    if (!rp)
      throw notFound("RolePermission");
    ws.rolePermissions.delete(rp.id);
    emitRolePermissionsUpdated(store, ws, role);
    return c.json(formatRole(role, ws));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/authorization-checks.js
function resourceAncestry(ws, resource) {
  const ids = /* @__PURE__ */ new Set();
  let current = resource;
  while (current && !ids.has(current.id)) {
    ids.add(current.id);
    current = current.parent_resource_id ? ws.authorizationResources.get(current.parent_resource_id) : void 0;
  }
  return ids;
}
function getPermissionsForMembership(ws, membershipId, resource) {
  const membership = ws.organizationMemberships.get(membershipId);
  if (!membership)
    return /* @__PURE__ */ new Set();
  const permSlugs = /* @__PURE__ */ new Set();
  const addRolePermissions = (roleId) => {
    for (const rp of ws.rolePermissions.findBy("role_id", roleId)) {
      const perm = ws.permissions.get(rp.permission_id);
      if (perm)
        permSlugs.add(perm.slug);
    }
  };
  const primaryRole = resolvePrimaryRole(ws, membership.organization_id, membership.role.slug);
  if (primaryRole)
    addRolePermissions(primaryRole.id);
  const scopeIds = resource ? resourceAncestry(ws, resource) : null;
  const assignments = ws.roleAssignments.findBy("organization_membership_id", membershipId);
  for (const assignment of assignments) {
    if (scopeIds && assignment.resource_id !== null && !scopeIds.has(assignment.resource_id))
      continue;
    const role = ws.roles.get(assignment.role_id);
    if (role)
      addRolePermissions(role.id);
  }
  return permSlugs;
}
function resolveResourceTarget(ws, body, organizationId) {
  const resourceId = body.resource_id;
  const resourceExternalId = body.resource_external_id;
  const resourceTypeSlug = body.resource_type_slug;
  if (resourceId) {
    const resource = ws.authorizationResources.get(resourceId);
    if (!resource || resource.organization_id !== organizationId)
      throw notFound("Resource");
    return resource;
  }
  if (resourceExternalId) {
    if (!resourceTypeSlug) {
      throw validationError("resource_type_slug is required when resource_external_id is provided", [
        { field: "resource_type_slug", code: "required" }
      ]);
    }
    const resource = ws.authorizationResources.findBy("external_id", resourceExternalId).find((r) => r.resource_type_slug === resourceTypeSlug && r.organization_id === organizationId);
    if (!resource)
      throw notFound("Resource");
    return resource;
  }
  if (resourceTypeSlug) {
    throw validationError("resource_external_id is required when resource_type_slug is provided", [
      { field: "resource_external_id", code: "required" }
    ]);
  }
  return null;
}
function authorizationCheckRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/authorization/organization_memberships/:id/check", async (c) => {
    const membershipId = c.req.param("id");
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    const body = await parseJsonBody(c);
    const permission = body.permission_slug ?? body.permission;
    if (!permission) {
      throw validationError("permission_slug is required", [{ field: "permission_slug", code: "required" }]);
    }
    const resource = resolveResourceTarget(ws, body, membership.organization_id);
    const permSlugs = getPermissionsForMembership(ws, membershipId, resource ?? void 0);
    return c.json({ authorized: permSlugs.has(permission) });
  });
  app.get("/authorization/organization_memberships/:id/resources", (c) => {
    const membershipId = c.req.param("id");
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const permissionSlug = url.searchParams.get("permission_slug");
    const parentId = url.searchParams.get("parent_resource_id");
    const parentTypeSlug = url.searchParams.get("parent_resource_type_slug");
    const parentExternalId = url.searchParams.get("parent_resource_external_id");
    if (!permissionSlug && !parentId && !parentTypeSlug && !parentExternalId) {
      const result2 = ws.authorizationResources.list({
        ...params,
        filter: (r) => r.organization_id === membership.organization_id
      });
      return c.json(formatListResponse(result2, formatAuthorizationResource));
    }
    if (!permissionSlug) {
      throw validationError("permission_slug is required", [{ field: "permission_slug", code: "required" }]);
    }
    const parent = resolveResourceTarget(ws, { resource_id: parentId, resource_external_id: parentExternalId, resource_type_slug: parentTypeSlug }, membership.organization_id);
    if (!parent) {
      throw validationError("parent_resource_id or parent_resource_external_id + parent_resource_type_slug is required", [{ field: "parent_resource_id", code: "required" }]);
    }
    const result = ws.authorizationResources.list({
      ...params,
      filter: (r) => r.parent_resource_id === parent.id && getPermissionsForMembership(ws, membershipId, r).has(permissionSlug)
    });
    return c.json(formatListResponse(result, formatAuthorizationResource));
  });
  const listEffectivePermissions = (c, membershipId, resource) => {
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    if (!resource || resource.organization_id !== membership.organization_id)
      throw notFound("Resource");
    const permSlugs = getPermissionsForMembership(ws, membershipId, resource);
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.permissions.list({
      ...params,
      filter: (p) => permSlugs.has(p.slug)
    });
    return c.json(formatListResponse(result, formatPermission));
  };
  app.get("/authorization/organization_memberships/:id/resources/:resourceTypeSlug/:externalId/permissions", (c) => {
    const membership = ws.organizationMemberships.get(c.req.param("id"));
    const resource = membership ? ws.authorizationResources.findBy("external_id", c.req.param("externalId")).find((r) => r.resource_type_slug === c.req.param("resourceTypeSlug") && r.organization_id === membership.organization_id) : void 0;
    return listEffectivePermissions(c, c.req.param("id"), resource);
  });
  app.get("/authorization/organization_memberships/:id/resources/:resourceId/permissions", (c) => {
    const resource = ws.authorizationResources.get(c.req.param("resourceId"));
    return listEffectivePermissions(c, c.req.param("id"), resource);
  });
  app.get("/authorization/resources/:resourceId/organization_memberships/:membershipId/permissions", (c) => {
    const resource = ws.authorizationResources.get(c.req.param("resourceId"));
    return listEffectivePermissions(c, c.req.param("membershipId"), resource);
  });
  app.get("/authorization/organization_memberships/:id/role_assignments", (c) => {
    const membershipId = c.req.param("id");
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.roleAssignments.list({
      ...params,
      filter: (ra) => ra.organization_membership_id === membershipId
    });
    return c.json(formatListResponse(result, formatRoleAssignment));
  });
  app.post("/authorization/organization_memberships/:id/role_assignments", async (c) => {
    const membershipId = c.req.param("id");
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    const body = await parseJsonBody(c);
    const roleSlug = body.role_slug;
    const roleId = body.role_id;
    if (!roleSlug && !roleId) {
      throw validationError("role_slug is required", [{ field: "role_slug", code: "required" }]);
    }
    const role = roleSlug ? resolvePrimaryRole(ws, membership.organization_id, roleSlug) : ws.roles.get(roleId);
    if (!role)
      throw notFound("Role");
    if (role.organization_id !== null && role.organization_id !== membership.organization_id) {
      throw notFound("Role");
    }
    const resource = resolveResourceTarget(ws, body, membership.organization_id);
    const assignment = ws.roleAssignments.insert({
      object: "role_assignment",
      organization_membership_id: membershipId,
      role_id: role.id,
      role_slug: role.slug,
      resource_id: resource?.id ?? null,
      resource_external_id: resource?.external_id ?? null,
      resource_type_slug: resource?.resource_type_slug ?? null
    });
    return c.json(formatRoleAssignment(assignment), 201);
  });
  app.delete("/authorization/organization_memberships/:id/role_assignments/:assignmentId", (c) => {
    const membershipId = c.req.param("id");
    const assignmentId = c.req.param("assignmentId");
    const membership = ws.organizationMemberships.get(membershipId);
    if (!membership)
      throw notFound("OrganizationMembership");
    const assignment = ws.roleAssignments.get(assignmentId);
    if (!assignment || assignment.organization_membership_id !== membershipId) {
      throw notFound("RoleAssignment");
    }
    ws.roleAssignments.delete(assignmentId);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/authorization-resources.js
function findResourceByExternalId(ws, organizationId, resourceTypeSlug, externalId) {
  return ws.authorizationResources.findBy("external_id", externalId).find((r) => r.resource_type_slug === resourceTypeSlug && r.organization_id === organizationId);
}
function collectSubtree(ws, rootId) {
  const ids = /* @__PURE__ */ new Set([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const parentId = queue.shift();
    for (const child of ws.authorizationResources.findBy("parent_resource_id", parentId)) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        queue.push(child.id);
      }
    }
  }
  return ids;
}
function resolveParentResource(ws, body, organizationId) {
  const parentId = body.parent_resource_id;
  const parentExternalId = body.parent_resource_external_id;
  const parentTypeSlug = body.parent_resource_type_slug;
  if (parentId) {
    if (parentExternalId || parentTypeSlug) {
      throw validationError("parent_resource_id is mutually exclusive with parent_resource_external_id and parent_resource_type_slug", [{ field: "parent_resource_id", code: "mutually_exclusive" }]);
    }
    const parent = ws.authorizationResources.get(parentId);
    if (!parent || parent.organization_id !== organizationId)
      throw notFound("Resource");
    return parent;
  }
  if (parentExternalId || parentTypeSlug) {
    if (!parentExternalId || !parentTypeSlug) {
      const missing = parentExternalId ? "parent_resource_type_slug" : "parent_resource_external_id";
      throw validationError("parent_resource_external_id and parent_resource_type_slug must be provided together", [
        { field: missing, code: "required" }
      ]);
    }
    const parent = findResourceByExternalId(ws, organizationId, parentTypeSlug, parentExternalId);
    if (!parent)
      throw notFound("Resource");
    return parent;
  }
  return null;
}
function authorizationResourceRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/authorization/resources", async (c) => {
    const body = await parseJsonBody(c);
    const resourceTypeSlug = body.resource_type_slug;
    const externalId = body.external_id;
    const organizationId = body.organization_id;
    const name = body.name;
    if (!resourceTypeSlug) {
      throw validationError("resource_type_slug is required", [{ field: "resource_type_slug", code: "required" }]);
    }
    if (!externalId) {
      throw validationError("external_id is required", [{ field: "external_id", code: "required" }]);
    }
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (!name) {
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    }
    if (resourceTypeSlug === "organization") {
      throw new WorkOSApiError(400, "Cannot add resource to organization resource type", "bad_request");
    }
    if (findResourceByExternalId(ws, organizationId, resourceTypeSlug, externalId)) {
      throw new WorkOSApiError(409, `A resource with external_id '${externalId}' already exists for resource type '${resourceTypeSlug}'.`, "authorization_resource_external_id_conflict");
    }
    const organization = ws.organizations.get(organizationId);
    if (!organization)
      throw notFound("Organization");
    const parent = resolveParentResource(ws, body, organizationId) ?? findOrCreateOrganizationResource(ws, organization);
    const resource = ws.authorizationResources.insert({
      object: "authorization_resource",
      resource_type_slug: resourceTypeSlug,
      external_id: externalId,
      organization_id: organizationId,
      name,
      description: body.description ?? null,
      parent_resource_id: parent.id,
      metadata: body.metadata ?? {}
    });
    return c.json(formatAuthorizationResource(resource), 201);
  });
  app.get("/authorization/resources", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const organizationId = url.searchParams.get("organization_id") ?? void 0;
    const resourceTypeSlug = url.searchParams.get("resource_type_slug") ?? void 0;
    const resourceExternalId = url.searchParams.get("resource_external_id") ?? void 0;
    const parentResourceId = url.searchParams.get("parent_resource_id") ?? void 0;
    const parentTypeSlug = url.searchParams.get("parent_resource_type_slug") ?? void 0;
    const parentExternalId = url.searchParams.get("parent_external_id") ?? void 0;
    const result = ws.authorizationResources.list({
      ...params,
      filter: (r) => {
        if (organizationId && r.organization_id !== organizationId)
          return false;
        if (resourceTypeSlug && r.resource_type_slug !== resourceTypeSlug)
          return false;
        if (resourceExternalId && r.external_id !== resourceExternalId)
          return false;
        if (parentResourceId && r.parent_resource_id !== parentResourceId)
          return false;
        if (parentTypeSlug || parentExternalId) {
          const parent = r.parent_resource_id ? ws.authorizationResources.get(r.parent_resource_id) : void 0;
          if (!parent)
            return false;
          if (parentTypeSlug && parent.resource_type_slug !== parentTypeSlug)
            return false;
          if (parentExternalId && parent.external_id !== parentExternalId)
            return false;
        }
        return true;
      }
    });
    return c.json(formatListResponse(result, formatAuthorizationResource));
  });
  app.get("/authorization/resources/:resource_id", (c) => {
    const resourceId = c.req.param("resource_id");
    const resource = ws.authorizationResources.get(resourceId);
    if (!resource)
      throw notFound("AuthorizationResource");
    return c.json(formatAuthorizationResource(resource));
  });
  app.put("/authorization/resources/:resource_id", async (c) => {
    const resourceId = c.req.param("resource_id");
    const resource = ws.authorizationResources.get(resourceId);
    if (!resource)
      throw notFound("AuthorizationResource");
    if (resource.resource_type_slug === "organization") {
      throw new WorkOSApiError(400, "Cannot update organization resource directly. Use syncOrganizationResource() instead.", "bad_request");
    }
    const body = await parseJsonBody(c);
    const updates = {};
    if ("metadata" in body)
      updates.metadata = body.metadata;
    if ("name" in body)
      updates.name = body.name ?? null;
    if ("description" in body)
      updates.description = body.description ?? null;
    const nextParent = resolveParentResource(ws, body, resource.organization_id);
    if (nextParent) {
      if (collectSubtree(ws, resourceId).has(nextParent.id)) {
        throw validationError(nextParent.id === resourceId ? "A resource cannot be its own parent" : "A resource cannot be parented to one of its own descendants", [{ field: "parent_resource_id", code: "invalid" }]);
      }
      updates.parent_resource_id = nextParent.id;
    }
    const updated = ws.authorizationResources.update(resourceId, updates);
    return c.json(formatAuthorizationResource(updated));
  });
  app.delete("/authorization/resources/:resource_id", (c) => {
    const resourceId = c.req.param("resource_id");
    const resource = ws.authorizationResources.get(resourceId);
    if (!resource)
      throw notFound("AuthorizationResource");
    if (resource.resource_type_slug === "organization") {
      throw new WorkOSApiError(400, "Cannot mark organization resource as deleting.", "bad_request");
    }
    const subtree = collectSubtree(ws, resourceId);
    const assignments = [...subtree].flatMap((id) => ws.roleAssignments.findBy("resource_id", id));
    if (new URL(c.req.url).searchParams.get("cascade_delete") !== "true" && (subtree.size > 1 || assignments.length)) {
      throw new WorkOSApiError(409, `Resource '${resourceId}' has descendant resources or role assignments. Retry with cascade_delete=true to delete them.`, "resource_has_dependents");
    }
    for (const assignment of assignments)
      ws.roleAssignments.delete(assignment.id);
    for (const id of subtree)
      ws.authorizationResources.delete(id);
    return c.body(null, 204);
  });
  const listMembershipsForResource = (c, resource) => {
    if (!resource)
      throw notFound("AuthorizationResource");
    const permissionSlug = new URL(c.req.url).searchParams.get("permission_slug");
    const memberships = ws.organizationMemberships.findBy("organization_id", resource.organization_id).filter((m) => !permissionSlug || getPermissionsForMembership(ws, m.id, resource).has(permissionSlug));
    return c.json({
      object: "list",
      data: memberships.map((m) => formatMembership(m, ws)),
      list_metadata: { before: null, after: null }
    });
  };
  app.get("/authorization/resources/:resource_id/organization_memberships", (c) => {
    return listMembershipsForResource(c, ws.authorizationResources.get(c.req.param("resource_id")));
  });
  app.get("/authorization/organizations/:orgId/resources/:type_slug/:external_id", (c) => {
    const orgId = c.req.param("orgId");
    const typeSlug = c.req.param("type_slug");
    const externalId = c.req.param("external_id");
    const resource = ws.authorizationResources.findBy("organization_id", orgId).find((r) => r.resource_type_slug === typeSlug && r.external_id === externalId);
    if (!resource)
      throw notFound("AuthorizationResource");
    return c.json(formatAuthorizationResource(resource));
  });
  app.get("/authorization/organizations/:orgId/resources/:type_slug/:external_id/organization_memberships", (c) => {
    const resource = findResourceByExternalId(ws, c.req.param("orgId"), c.req.param("type_slug"), c.req.param("external_id"));
    return listMembershipsForResource(c, resource);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/portal.js
function portalRoutes(ctx) {
  const { app } = ctx;
  app.post("/portal/generate_link", async (c) => {
    const body = await parseJsonBody(c);
    const intent = body.intent;
    const organization = body.organization;
    if (!intent) {
      throw validationError("intent is required", [{ field: "intent", code: "required" }]);
    }
    if (!organization) {
      throw validationError("organization is required", [{ field: "organization", code: "required" }]);
    }
    const baseUrl = new URL(c.req.url).origin;
    return c.json({ link: `${baseUrl}/portal/${intent}/${organization}` });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/legacy-mfa.js
function legacyMfaRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/auth/factors/enroll", async (c) => {
    const body = await parseJsonBody(c);
    const type = body.type ?? "totp";
    const issuer = body.totp_issuer ?? "WorkOS Emulator";
    const totpUser = body.totp_user ?? "legacy@emulator";
    const factor = ws.authFactors.insert({
      object: "authentication_factor",
      user_id: "legacy",
      type,
      totp: newTotp(issuer, totpUser)
    });
    return c.json(formatAuthFactorEnrolled(factor), 201);
  });
  app.get("/auth/factors/:id", (c) => {
    const factor = ws.authFactors.get(c.req.param("id"));
    if (!factor)
      throw notFound("AuthenticationFactor");
    return c.json(formatAuthFactor(factor));
  });
  app.delete("/auth/factors/:id", (c) => {
    const factor = ws.authFactors.get(c.req.param("id"));
    if (!factor)
      throw notFound("AuthenticationFactor");
    ws.authFactors.delete(factor.id);
    return c.body(null, 204);
  });
  app.post("/auth/factors/:id/challenge", async (c) => {
    const factor = ws.authFactors.get(c.req.param("id"));
    if (!factor)
      throw notFound("AuthenticationFactor");
    const code = generateCode();
    const challenge = ws.authChallenges.insert({
      object: "authentication_challenge",
      user_id: factor.user_id,
      factor_id: factor.id,
      expires_at: expiresIn(10),
      code
    });
    return c.json(formatAuthChallenge(challenge), 201);
  });
  app.post("/auth/challenges/:id/verify", async (c) => {
    const challenge = ws.authChallenges.get(c.req.param("id"));
    if (!challenge)
      throw notFound("AuthenticationChallenge");
    if (isExpired(challenge.expires_at)) {
      ws.authChallenges.delete(challenge.id);
      throw new WorkOSApiError(400, "Challenge has expired", "expired_challenge");
    }
    const body = await parseJsonBody(c);
    const code = body.code;
    if (!code) {
      throw new WorkOSApiError(400, "code is required", "invalid_request");
    }
    if (challenge.code && code !== challenge.code) {
      throw new WorkOSApiError(400, "Invalid one-time code", "invalid_one_time_code");
    }
    ws.authChallenges.delete(challenge.id);
    return c.json({ challenge: formatAuthChallenge(challenge), valid: true });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/api-keys.js
function apiKeyRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const createApiKey = (body, owner, environment = "test") => {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name)
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    if (body.permissions !== void 0 && (!Array.isArray(body.permissions) || !body.permissions.every((p) => typeof p === "string"))) {
      throw validationError("permissions must be an array of strings", [{ field: "permissions", code: "invalid" }]);
    }
    const expiresAt = body.expires_at;
    if (expiresAt !== void 0 && (typeof expiresAt !== "string" || Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now())) {
      throw validationError("expires_at must be a future ISO-8601 timestamp", [
        { field: "expires_at", code: "invalid" }
      ]);
    }
    const { record, value } = issueApiKey(store, ws, {
      name,
      owner,
      permissions: body.permissions ?? [],
      expiresAt: expiresAt ?? null,
      environment
    });
    return { ...formatApiKeyRecord(record), value };
  };
  app.post("/api_keys/validations", async (c) => {
    const body = await parseJsonBody(c);
    const value = body.value;
    const apiKeyMap = store.getData(STORE_KEYS.apiKeyMap) ?? {};
    const entry = value ? apiKeyMap[value] : void 0;
    const authorized = !!entry && !isApiKeyEntryExpired(entry);
    const record = authorized && value ? ws.apiKeyRecords.findOneBy("key", value) : void 0;
    return c.json({ api_key: record ? formatApiKeyRecord(record) : null });
  });
  app.delete("/api_keys/:id", (c) => {
    const record = ws.apiKeyRecords.get(c.req.param("id"));
    if (!record)
      throw notFound("ApiKey");
    deleteApiKey(store, ws, record);
    return c.body(null, 204);
  });
  app.post("/api_keys/:id/expire", async (c) => {
    const record = ws.apiKeyRecords.get(c.req.param("id"));
    if (!record)
      throw notFound("ApiKey");
    const body = c.req.raw.body ? await parseJsonBody(c) : {};
    if (body.expires_at !== void 0 && body.expires_at !== null && typeof body.expires_at !== "string") {
      throw validationError("expires_at must be an ISO-8601 timestamp or null", [
        { field: "expires_at", code: "invalid" }
      ]);
    }
    if (typeof body.expires_at === "string" && Number.isNaN(Date.parse(body.expires_at))) {
      throw validationError("expires_at must be an ISO-8601 timestamp or null", [
        { field: "expires_at", code: "invalid" }
      ]);
    }
    const updated = expireApiKey(store, ws, record, body.expires_at);
    return c.json(formatApiKeyRecord(updated));
  });
  app.get("/organizations/:orgId/api_keys", (c) => {
    const orgId = c.req.param("orgId");
    if (!ws.organizations.get(orgId))
      throw notFound("Organization");
    const params = parseListParams(new URL(c.req.url));
    const result = ws.apiKeyRecords.list({
      ...params,
      filter: (k) => apiKeyOrganizationId(k) === orgId
    });
    return c.json(formatListResponse(result, formatApiKeyRecord));
  });
  app.post("/organizations/:orgId/api_keys", async (c) => {
    const orgId = c.req.param("orgId");
    if (!ws.organizations.get(orgId))
      throw notFound("Organization");
    return c.json(createApiKey(await parseJsonBody(c), { type: "organization", id: orgId }, c.get("auth")?.environment), 201);
  });
  app.get("/user_management/users/:userId/api_keys", (c) => {
    const userId = c.req.param("userId");
    if (!ws.users.get(userId))
      throw notFound("User");
    const url = new URL(c.req.url);
    const organizationId = url.searchParams.get("organization_id");
    const result = ws.apiKeyRecords.list({
      ...parseListParams(url),
      filter: (k) => k.owner.type === "user" && k.owner.id === userId && (!organizationId || k.owner.organization_id === organizationId)
    });
    return c.json(formatListResponse(result, formatApiKeyRecord));
  });
  app.post("/user_management/users/:userId/api_keys", async (c) => {
    const userId = c.req.param("userId");
    if (!ws.users.get(userId))
      throw notFound("User");
    const body = await parseJsonBody(c);
    const organizationId = typeof body.organization_id === "string" ? body.organization_id : "";
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (!ws.organizations.get(organizationId))
      throw notFound("Organization");
    const membership = ws.organizationMemberships.findBy("user_id", userId).find((m) => m.organization_id === organizationId && m.status === "active");
    if (!membership)
      throw validationError("User must have an active membership in the organization");
    return c.json(createApiKey(body, { type: "user", id: userId, organization_id: organizationId }, c.get("auth")?.environment), 201);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/vault.js
import { createHash as createHash4, randomUUID } from "crypto";
var error = (message) => ({ error: message });
function makeVersion(value) {
  return {
    id: randomUUID(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    current_version: true,
    size: Buffer.byteLength(value),
    etag: createHash4("sha256").update(value).digest("hex")
  };
}
function metadata(object) {
  return {
    id: object.id,
    environment_id: object.environment_id,
    key_id: object.key_id,
    updated_by: object.updated_by,
    updated_at: object.updated_at,
    context: object.key_context,
    version_id: object.version_id
  };
}
function withoutValue(object) {
  return { id: object.id, name: object.name, metadata: metadata(object) };
}
function withValue(object) {
  return { ...withoutValue(object), value: object.value };
}
function vaultRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const environmentIdFor2 = (environment) => `environment_${environment ?? "test"}`;
  const findById = (id, environment) => {
    const object = ws.vaultObjects.get(id);
    return object?.environment_id === environmentIdFor2(environment) ? object : void 0;
  };
  const findByName = (name, environment) => ws.vaultObjects.findBy("name", name).find((object) => object.environment_id === environmentIdFor2(environment));
  const actorFor = (apiKey) => apiKeyActor(ws, apiKey);
  app.get("/vault/v1/kv", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const updatedAfter = url.searchParams.get("updatedAfter");
    if (updatedAfter && Number.isNaN(Date.parse(updatedAfter))) {
      return c.json(error("updatedAfter must be an ISO-8601 timestamp"), 400);
    }
    const result = ws.vaultObjects.list({
      ...params,
      filter: (object) => object.environment_id === environmentIdFor2(c.get("auth")?.environment) && (!search || object.name.toLowerCase().includes(search)) && (!updatedAfter || Date.parse(object.updated_at) > Date.parse(updatedAfter)),
      sort: (a, b) => params.order === "asc" ? a.updated_at.localeCompare(b.updated_at) || a.id.localeCompare(b.id) : b.updated_at.localeCompare(a.updated_at) || b.id.localeCompare(a.id)
    });
    return c.json({
      data: result.data.map(({ id, name, updated_at }) => ({ id, name, updated_at })),
      list_metadata: result.list_metadata
    });
  });
  app.post("/vault/v1/kv", async (c) => {
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const keyContext = body.key_context;
    if (!name || name.length > 200)
      return c.json(error("name is required and must be at most 200 characters"), 422);
    if (typeof body.value !== "string")
      return c.json(error("value is required"), 422);
    if (!keyContext || typeof keyContext !== "object" || Array.isArray(keyContext) || Object.keys(keyContext).length > 10 || !Object.values(keyContext).every((value) => typeof value === "string" && value.length <= 500)) {
      return c.json(error("key_context must contain at most 10 string values"), 422);
    }
    const environment = c.get("auth")?.environment;
    if (findByName(name, environment))
      return c.json(error("An object with this name already exists"), 409);
    const version = makeVersion(body.value);
    const object = ws.vaultObjects.insert({
      id: randomUUID(),
      name,
      value: body.value,
      key_context: keyContext,
      environment_id: environmentIdFor2(environment),
      key_id: randomUUID(),
      updated_by: actorFor(c.get("auth")?.apiKey),
      version_id: version.id,
      versions: [version]
    });
    return c.json(metadata(object), 201);
  });
  app.get("/vault/v1/kv/name/:name", (c) => {
    const object = findByName(c.req.param("name"), c.get("auth")?.environment);
    return object ? c.json(withValue(object)) : c.json(error("Object not found"), 404);
  });
  app.get("/vault/v1/kv/:id/metadata", (c) => {
    const object = findById(c.req.param("id"), c.get("auth")?.environment);
    return object ? c.json(withoutValue(object)) : c.json(error("Object not found"), 404);
  });
  app.get("/vault/v1/kv/:id/versions", (c) => {
    const object = findById(c.req.param("id"), c.get("auth")?.environment);
    if (!object)
      return c.json(error("Object not found"), 404);
    return c.json({ data: object.versions.slice().reverse(), list_metadata: { before: null, after: null } });
  });
  app.get("/vault/v1/kv/:id", (c) => {
    const object = findById(c.req.param("id"), c.get("auth")?.environment);
    return object ? c.json(withValue(object)) : c.json(error("Object not found"), 404);
  });
  app.put("/vault/v1/kv/:id", async (c) => {
    const object = findById(c.req.param("id"), c.get("auth")?.environment);
    if (!object)
      return c.json(error("Object not found"), 404);
    const body = await parseJsonBody(c);
    if (typeof body.value !== "string")
      return c.json(error("value is required"), 400);
    if (body.version_check !== void 0 && body.version_check !== null && typeof body.version_check !== "string") {
      return c.json(error("version_check must be a string or null"), 400);
    }
    if (typeof body.version_check === "string" && body.version_check !== object.version_id) {
      return c.json(error("Version mismatch"), 409);
    }
    const version = makeVersion(body.value);
    const updated = ws.vaultObjects.update(object.id, {
      value: body.value,
      updated_by: actorFor(c.get("auth")?.apiKey),
      version_id: version.id,
      versions: [...object.versions.map((v) => ({ ...v, current_version: false })), version]
    });
    return c.json(withoutValue(updated), 201);
  });
  app.delete("/vault/v1/kv/:id", (c) => {
    const object = findById(c.req.param("id"), c.get("auth")?.environment);
    if (!object)
      return c.json(error("Object not found"), 404);
    const versionCheck = new URL(c.req.url).searchParams.get("version_check");
    if (versionCheck && versionCheck !== object.version_id)
      return c.json(error("Version mismatch"), 409);
    ws.vaultObjects.delete(object.id);
    return c.json({ success: true, name: object.name });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/radar.js
function radarRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/radar/attempts", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.radarAttempts.list({ ...params });
    return c.json(formatListResponse(result, formatRadarAttempt));
  });
  app.get("/radar/attempts/:id", (c) => {
    const attempt = ws.radarAttempts.get(c.req.param("id"));
    if (!attempt)
      throw notFound("RadarAttempt");
    return c.json(formatRadarAttempt(attempt));
  });
  app.post("/radar/lists/:type/:action", async (c) => {
    const listType = c.req.param("type");
    const action = c.req.param("action");
    const body = await parseJsonBody(c);
    const entries = body.entries ?? [];
    const key = `radar_${listType}_list`;
    const existing = store.getData(key) ?? /* @__PURE__ */ new Set();
    if (action === "add") {
      for (const entry of entries)
        existing.add(entry);
    } else if (action === "remove") {
      for (const entry of entries)
        existing.delete(entry);
    }
    store.setData(key, existing);
    return c.json({ success: true });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/connect.js
function parseRedirectUris(value) {
  const field = "redirect_uris";
  if (!Array.isArray(value)) {
    throw validationError(`${field} must be an array`, [{ field, code: "invalid" }]);
  }
  return value.map((entry) => {
    const uri = typeof entry === "string" ? entry : entry && typeof entry === "object" && typeof entry.uri === "string" ? entry.uri : void 0;
    if (uri === void 0) {
      throw validationError(`${field} entries must be a string or an object with a uri`, [{ field, code: "invalid" }]);
    }
    if (uri.trim().length === 0) {
      throw validationError(`${field} entries must not be blank`, [{ field, code: "invalid" }]);
    }
    return uri;
  });
}
function connectRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  const findApplication = (ref) => ws.connectApplications.get(ref) ?? ws.connectApplications.findOneBy("client_id", ref);
  const requireApplication = (ref) => {
    const application = findApplication(ref);
    if (!application)
      throw notFound("ConnectApplication");
    return application;
  };
  app.get("/connect/applications", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const organizationId = url.searchParams.get("organization_id") ?? void 0;
    const registrationTypes = (url.searchParams.get("registration_types") ?? "authenticated").split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    const unknown = registrationTypes.filter((t) => t !== "dynamic" && t !== "authenticated");
    if (unknown.length > 0) {
      throw validationError(`registration_types must be 'dynamic' or 'authenticated': ${unknown.join(", ")}`, [
        { field: "registration_types", code: "invalid" }
      ]);
    }
    const result = ws.connectApplications.list({
      ...params,
      filter: (a) => (organizationId === void 0 || a.organization_id === organizationId) && registrationTypes.includes(a.was_dynamically_registered ? "dynamic" : "authenticated")
    });
    return c.json(formatListResponse(result, formatConnectApplication));
  });
  app.post("/connect/applications", async (c) => {
    const body = await parseJsonBody(c);
    const name = body.name;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw validationError("name is required", [{ field: "name", code: "required" }]);
    }
    if (body.scopes !== void 0 && (!Array.isArray(body.scopes) || !body.scopes.every((s) => typeof s === "string"))) {
      throw validationError("scopes must be an array of strings", [{ field: "scopes", code: "invalid" }]);
    }
    if (body.login_url !== void 0 && body.login_url !== null && typeof body.login_url !== "string") {
      throw validationError("login_url must be a string or null", [{ field: "login_url", code: "invalid" }]);
    }
    const applicationType = body.application_type === "m2m" ? "m2m" : "oauth";
    const organizationId = body.organization_id ?? null;
    if (body.is_first_party !== void 0 && typeof body.is_first_party !== "boolean") {
      throw validationError("is_first_party must be a boolean", [{ field: "is_first_party", code: "invalid" }]);
    }
    if (body.uses_pkce !== void 0 && body.uses_pkce !== null && typeof body.uses_pkce !== "boolean") {
      throw validationError("uses_pkce must be a boolean or null", [{ field: "uses_pkce", code: "invalid" }]);
    }
    const isFirstParty = body.is_first_party ?? true;
    if (applicationType === "m2m" || !isFirstParty) {
      if (!organizationId) {
        throw validationError(applicationType === "m2m" ? "organization_id is required for m2m applications" : "organization_id is required when is_first_party is false", [{ field: "organization_id", code: "required" }]);
      }
      if (!ws.organizations.get(organizationId)) {
        throw validationError("organization_id must reference an existing organization", [
          { field: "organization_id", code: "invalid" }
        ]);
      }
    }
    if (applicationType === "m2m" && body.redirect_uris != null) {
      throw validationError("redirect_uris can only be set on oauth applications", [
        { field: "redirect_uris", code: "invalid" }
      ]);
    }
    const application = ws.connectApplications.insert({
      object: "connect_application",
      name: name.trim(),
      description: body.description ?? null,
      application_type: applicationType,
      organization_id: organizationId,
      scopes: body.scopes ?? [],
      audience: body.audience ?? null,
      redirect_uris: body.redirect_uris == null ? [] : parseRedirectUris(body.redirect_uris),
      is_first_party: isFirstParty,
      // Nothing in the emulator performs dynamic client registration, so an application
      // created through this route is always one an authenticated caller registered.
      was_dynamically_registered: false,
      uses_pkce: body.uses_pkce ?? false,
      login_url: body.login_url ?? null,
      client_id: generateClientId(),
      logo_url: body.logo_url ?? null
    });
    return c.json(formatConnectApplication(application), 201);
  });
  app.get("/connect/applications/:id", (c) => {
    return c.json(formatConnectApplication(requireApplication(c.req.param("id"))));
  });
  app.put("/connect/applications/:id", async (c) => {
    const application = requireApplication(c.req.param("id"));
    const body = c.req.raw.body ? await parseJsonBody(c) : {};
    const patch = {};
    if (body.name !== void 0) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        throw validationError("name must be a non-empty string", [{ field: "name", code: "invalid" }]);
      }
      patch.name = body.name.trim();
    }
    if (body.description !== void 0) {
      if (body.description !== null && typeof body.description !== "string") {
        throw validationError("description must be a string or null", [{ field: "description", code: "invalid" }]);
      }
      patch.description = body.description;
    }
    if (body.scopes !== void 0) {
      if (body.scopes === null) {
        patch.scopes = [];
      } else if (!Array.isArray(body.scopes) || !body.scopes.every((s) => typeof s === "string")) {
        throw validationError("scopes must be an array of strings", [{ field: "scopes", code: "invalid" }]);
      } else {
        patch.scopes = body.scopes;
      }
    }
    if (body.redirect_uris !== void 0) {
      if (application.application_type === "m2m" && body.redirect_uris !== null) {
        throw validationError("redirect_uris can only be set on oauth applications", [
          { field: "redirect_uris", code: "invalid" }
        ]);
      }
      patch.redirect_uris = body.redirect_uris === null ? [] : parseRedirectUris(body.redirect_uris);
    }
    if (body.login_url !== void 0) {
      if (body.login_url !== null && typeof body.login_url !== "string") {
        throw validationError("login_url must be a string or null", [{ field: "login_url", code: "invalid" }]);
      }
      patch.login_url = body.login_url;
    }
    const updated = ws.connectApplications.update(application.id, patch);
    return c.json(formatConnectApplication(updated));
  });
  app.delete("/connect/applications/:id", (c) => {
    const application = requireApplication(c.req.param("id"));
    ws.clientSecrets.deleteBy("application_id", application.id);
    ws.externalAuthSessions.deleteBy("client_id", application.client_id);
    for (const authCode of ws.authCodes.all()) {
      if (authCode.client_id === application.client_id)
        ws.authCodes.delete(authCode.id);
    }
    ws.connectApplications.delete(application.id);
    return c.body(null, 204);
  });
  app.get("/connect/applications/:id/client_secrets", (c) => {
    const application = requireApplication(c.req.param("id"));
    const secrets = ws.clientSecrets.findBy("application_id", application.id).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
    return c.json(secrets.map(formatClientSecret));
  });
  app.post("/connect/applications/:id/client_secrets", (c) => {
    const application = requireApplication(c.req.param("id"));
    const value = `secret_${generateVerificationToken()}`;
    const secret = ws.clientSecrets.insert({
      object: "connect_application_secret",
      application_id: application.id,
      value,
      secret_hint: value.slice(-4),
      last_used_at: null
    });
    return c.json({ ...formatClientSecret(secret), secret: secret.value }, 201);
  });
  app.delete("/connect/client_secrets/:id", (c) => {
    const secret = ws.clientSecrets.get(c.req.param("id"));
    if (!secret)
      throw notFound("ClientSecret");
    ws.clientSecrets.delete(secret.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/client-api.js
var CLIENT_API_TOKEN_AUDIENCE = "client";
var CLIENT_API_TOKEN_TTL_SECONDS = 300;
function clientApiRoutes(ctx) {
  const { app, jwt, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/client/token", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    const userId = body.user_id;
    if (typeof organizationId !== "string" || organizationId.length === 0) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    if (typeof userId !== "string" || userId.length === 0) {
      throw validationError("user_id is required", [{ field: "user_id", code: "required" }]);
    }
    if (!ws.organizations.get(organizationId))
      throw notFound("Organization");
    if (!ws.users.get(userId))
      throw notFound("User");
    const token = jwt.sign({ sub: userId, org_id: organizationId, aud: CLIENT_API_TOKEN_AUDIENCE }, { expiresIn: CLIENT_API_TOKEN_TTL_SECONDS });
    return c.json({ token }, 201);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/oauth.js
var TOKEN_TTL_SECONDS = 3600;
function formDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
async function readTokenParams(c) {
  const contentType2 = c.req.header("content-type") ?? "";
  let raw2 = {};
  if (contentType2.includes("application/json")) {
    try {
      const body = await c.req.json();
      if (body && typeof body === "object" && !Array.isArray(body))
        raw2 = body;
    } catch {
    }
  } else {
    const form = await c.req.parseBody();
    raw2 = form;
  }
  const str = (v) => typeof v === "string" ? v : void 0;
  let clientId = str(raw2.client_id);
  let clientSecret = str(raw2.client_secret);
  const authHeader = c.req.header("authorization");
  if ((!clientId || !clientSecret) && authHeader && /^basic\s/i.test(authHeader)) {
    const decoded = Buffer.from(authHeader.replace(/^basic\s+/i, "").trim(), "base64").toString("utf-8");
    const sep = decoded.indexOf(":");
    if (sep >= 0) {
      clientId = clientId || formDecode(decoded.slice(0, sep));
      clientSecret = clientSecret || formDecode(decoded.slice(sep + 1));
    }
  }
  return {
    grantType: str(raw2.grant_type),
    clientId,
    clientSecret,
    scope: str(raw2.scope),
    code: str(raw2.code),
    redirectUri: str(raw2.redirect_uri)
  };
}
function oauthRoutes(ctx) {
  const { app, store, jwt } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/oauth2/authorize", (c) => {
    const { client_id: clientId, redirect_uri: redirectUri, response_type: responseType, state } = c.req.query();
    if (!clientId || !redirectUri) {
      throw new OauthApiError(400, "invalid_request", "client_id and redirect_uri are required.");
    }
    if (responseType !== "code") {
      throw new OauthApiError(400, "unsupported_response_type", "response_type must be code.");
    }
    const application = ws.connectApplications.findOneBy("client_id", clientId);
    if (!application)
      throw new OauthApiError(400, "invalid_client", "Invalid client ID.");
    if (application.application_type !== "oauth" || !application.login_url) {
      throw new OauthApiError(400, "unauthorized_client", "The client must be an OAuth application with login_url.");
    }
    if (application.redirect_uris.length > 0 && !application.redirect_uris.includes(redirectUri)) {
      throw new OauthApiError(400, "invalid_request", "redirect_uri is not registered for this application.");
    }
    assertAllowedRedirectUri(redirectUri, store);
    assertAllowedRedirectUri(application.login_url, store);
    const login = new URL(application.login_url);
    const session = ws.externalAuthSessions.insert({
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state ?? null,
      expires_at: expiresIn(10),
      completed_at: null,
      redeemed_at: null,
      user_id: null
    });
    login.searchParams.set("external_auth_id", session.id);
    return c.redirect(login.toString(), 302);
  });
  app.post("/oauth2/token", async (c) => {
    const { grantType, clientId, clientSecret, scope, code, redirectUri } = await readTokenParams(c);
    if (grantType !== "client_credentials" && grantType !== "authorization_code") {
      throw new OauthApiError(400, "unsupported_grant_type", `The grant type is not supported: ${grantType ?? "(none)"}`);
    }
    if (!clientId || !clientSecret) {
      throw new OauthApiError(400, "invalid_request", "client_id and client_secret are required.");
    }
    const application = ws.connectApplications.findOneBy("client_id", clientId);
    const matchedSecret = application && ws.clientSecrets.findBy("application_id", application.id).find((s) => s.value === clientSecret);
    if (!application || !matchedSecret) {
      throw new OauthApiError(401, "invalid_client", "Invalid client ID or secret.");
    }
    const expectedType = grantType === "client_credentials" ? "m2m" : "oauth";
    if (application.application_type !== expectedType) {
      throw new OauthApiError(400, "unauthorized_client", `The client is not authorized to use the ${grantType} grant type.`);
    }
    const authCode = grantType === "authorization_code" && code ? ws.authCodes.findOneBy("code", code) : void 0;
    if (grantType === "authorization_code") {
      if (!code || !redirectUri) {
        throw new OauthApiError(400, "invalid_request", "code and redirect_uri are required.");
      }
      if (!authCode || isExpired(authCode.expires_at) || authCode.auth_method !== "external_auth" || authCode.client_id !== clientId || authCode.redirect_uri !== redirectUri || !ws.users.get(authCode.user_id)) {
        throw new OauthApiError(400, "invalid_grant", "The authorization code has expired or is invalid.");
      }
    }
    const appScopes = Array.isArray(application.scopes) ? application.scopes : [];
    let granted = appScopes;
    if (scope && scope.trim().length > 0) {
      const requested = scope.trim().split(/\s+/);
      const unknown = requested.filter((s) => !appScopes.includes(s));
      if (unknown.length > 0) {
        throw new OauthApiError(400, "invalid_scope", `The application is not granted the requested scope(s): ${unknown.join(", ")}.`);
      }
      granted = requested;
    }
    const accessToken = jwt.sign({
      sub: authCode?.user_id ?? clientId,
      aud: application.audience ?? clientId,
      jti: generateUlid(),
      org_id: application.organization_id ?? void 0,
      scope: granted.join(" ")
    }, { expiresIn: TOKEN_TTL_SECONDS });
    if (authCode)
      ws.authCodes.delete(authCode.id);
    ws.clientSecrets.updateSilent(matchedSecret.id, { last_used_at: (/* @__PURE__ */ new Date()).toISOString() });
    return c.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: TOKEN_TTL_SECONDS,
      scope: granted.join(" ")
    });
  });
  app.get("/oauth2/jwks", (c) => c.json(jwt.getJWKS()));
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/standalone-connect.js
function standaloneConnectRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/authkit/oauth2/complete", async (c) => {
    const body = await parseJsonBody(c);
    const externalAuthId = body.external_auth_id;
    if (typeof externalAuthId !== "string" || !externalAuthId.trim()) {
      throw validationError("external_auth_id is required", [{ field: "external_auth_id", code: "required" }]);
    }
    if (!body.user || typeof body.user !== "object" || Array.isArray(body.user)) {
      throw validationError("user is required", [{ field: "user", code: "required" }]);
    }
    const input = body.user;
    for (const field of ["id", "email"]) {
      if (typeof input[field] !== "string" || !input[field].trim()) {
        throw validationError(`user.${field} is required`, [{ field: `user.${field}`, code: "required" }]);
      }
    }
    const externalId = input.id;
    const email = input.email.trim();
    if (!isEmailShaped(email)) {
      throw new WorkOSApiError(400, "Invalid email address", "invalid_email");
    }
    const profile = {};
    for (const field of ["name", "first_name", "last_name"]) {
      if (input[field] !== void 0) {
        if (typeof input[field] !== "string") {
          throw validationError(`user.${field} must be a string`, [{ field: `user.${field}`, code: "invalid" }]);
        }
        profile[field] = input[field];
      }
    }
    if (input.metadata !== void 0) {
      if (!input.metadata || typeof input.metadata !== "object" || Array.isArray(input.metadata) || !Object.values(input.metadata).every((value) => typeof value === "string")) {
        throw validationError("user.metadata must be an object of strings", [
          { field: "user.metadata", code: "invalid" }
        ]);
      }
      profile.metadata = input.metadata;
    }
    const session = ws.externalAuthSessions.get(externalAuthId);
    if (!session || isExpired(session.expires_at))
      throw notFound("External authentication session");
    if (session.completed_at) {
      throw new WorkOSApiError(400, "External authentication session already completed", "external_auth_session_already_completed");
    }
    const existing = ws.users.findOneBy("external_id", externalId);
    const emailOwner = findUserByEmail(ws, email);
    if (emailOwner && emailOwner.id !== existing?.id) {
      throw new WorkOSApiError(400, "Email belongs to another user", "email_not_available");
    }
    const user = existing ? ws.users.update(existing.id, { ...profile, email, email_verified: true }) : ws.users.insert({
      object: "user",
      email,
      external_id: externalId,
      email_verified: true,
      name: null,
      first_name: null,
      last_name: null,
      metadata: {},
      profile_picture_url: null,
      last_sign_in_at: null,
      locale: null,
      password_hash: null,
      impersonator: null,
      ...profile
    });
    ws.externalAuthSessions.update(session.id, { user_id: user.id, completed_at: (/* @__PURE__ */ new Date()).toISOString() });
    const redirect2 = new URL(`${ctx.baseUrl}/oauth2/authorize/complete`);
    redirect2.searchParams.set("external_auth_id", session.id);
    return c.json({ redirect_uri: redirect2.toString() });
  });
  app.get("/oauth2/authorize/complete", (c) => {
    const session = ws.externalAuthSessions.get(c.req.query("external_auth_id") ?? "");
    if (!session || isExpired(session.expires_at) || !session.completed_at || session.redeemed_at || !session.user_id || !ws.users.get(session.user_id)) {
      throw notFound("External authentication session");
    }
    assertAllowedRedirectUri(session.redirect_uri, store);
    const redirect2 = new URL(session.redirect_uri);
    const authCode = ws.authCodes.insert({
      user_id: session.user_id,
      organization_id: null,
      code: generateId("auth_code"),
      redirect_uri: session.redirect_uri,
      client_id: session.client_id,
      expires_at: expiresIn(10),
      auth_method: "external_auth",
      step_up_method: null,
      code_challenge: null,
      code_challenge_method: null
    });
    ws.externalAuthSessions.update(session.id, { redeemed_at: (/* @__PURE__ */ new Date()).toISOString() });
    redirect2.searchParams.set("code", authCode.code);
    if (session.state !== null)
      redirect2.searchParams.set("state", session.state);
    return c.redirect(redirect2.toString(), 302);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/directories.js
function directoryRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/directories", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const orgFilter = url.searchParams.get("organization_id") ?? void 0;
    const search = url.searchParams.get("search") ?? void 0;
    const result = ws.directories.list({
      ...params,
      filter: (d) => {
        if (orgFilter && d.organization_id !== orgFilter)
          return false;
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatDirectory));
  });
  app.get("/directories/:id", (c) => {
    const dir = ws.directories.get(c.req.param("id"));
    if (!dir)
      throw notFound("Directory");
    return c.json(formatDirectory(dir));
  });
  app.delete("/directories/:id", (c) => {
    const dir = ws.directories.get(c.req.param("id"));
    if (!dir)
      throw notFound("Directory");
    const survivors = ws.directories.all().filter((d) => d.id !== dir.id && d.organization_id === dir.organization_id).flatMap((d) => ws.directoryUsers.findBy("directory_id", d.id));
    for (const u of ws.directoryUsers.findBy("directory_id", dir.id)) {
      const email = u.email;
      if (!email)
        continue;
      const authKitUser = findUserByEmail(ws, email);
      if (!authKitUser)
        continue;
      const membership = liveMembershipFor(ws, dir.organization_id ?? "", authKitUser.id);
      if (!membership?.directory_managed)
        continue;
      if (!survivors.some((s) => emailsMatch(s.email ?? "", email))) {
        ws.organizationMemberships.update(membership.id, { directory_managed: false });
        continue;
      }
      const roleSurvivor = survivors.find((s) => s.role && emailsMatch(s.email ?? "", email));
      if (roleSurvivor?.role && roleSurvivor.role.slug !== membership.role.slug) {
        ws.organizationMemberships.update(membership.id, { role: { slug: roleSurvivor.role.slug } });
      }
    }
    ws.directoryUsers.deleteBy("directory_id", dir.id);
    ws.directoryGroups.deleteBy("directory_id", dir.id);
    ws.directories.delete(dir.id);
    return c.body(null, 204);
  });
  app.get("/directory_users", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const directoryId = url.searchParams.get("directory") ?? void 0;
    const groupId = url.searchParams.get("group") ?? void 0;
    const idpId = url.searchParams.get("idp_id") ?? void 0;
    const email = url.searchParams.get("email") ?? void 0;
    const result = ws.directoryUsers.list({
      ...params,
      filter: (u) => {
        if (directoryId && u.directory_id !== directoryId)
          return false;
        if (groupId && !u.groups.some((g) => g.id === groupId))
          return false;
        if (idpId && u.idp_id !== idpId)
          return false;
        if (email && u.email?.toLowerCase() !== email.toLowerCase())
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatDirectoryUser));
  });
  app.get("/directory_users/:id", (c) => {
    const user = ws.directoryUsers.get(c.req.param("id"));
    if (!user)
      throw notFound("DirectoryUser");
    return c.json(formatDirectoryUser(user));
  });
  app.get("/directory_groups", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const directoryId = url.searchParams.get("directory") ?? void 0;
    const userId = url.searchParams.get("user") ?? void 0;
    const userGroupIds = userId ? new Set(ws.directoryUsers.get(userId)?.groups.map((g) => g.id) ?? []) : void 0;
    const result = ws.directoryGroups.list({
      ...params,
      filter: (g) => {
        if (directoryId && g.directory_id !== directoryId)
          return false;
        if (userGroupIds && !userGroupIds.has(g.id))
          return false;
        return true;
      }
    });
    return c.json(formatListResponse(result, formatDirectoryGroup));
  });
  app.get("/directory_groups/:id", (c) => {
    const group = ws.directoryGroups.get(c.req.param("id"));
    if (!group)
      throw notFound("DirectoryGroup");
    return c.json(formatDirectoryGroup(group));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/audit-logs.js
function auditLogRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/audit_logs/actions", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.auditLogActions.list({ ...params });
    return c.json(formatListResponse(result, formatAuditLogAction));
  });
  app.post("/audit_logs/actions/:actionName/schemas", async (c) => {
    const actionName = c.req.param("actionName");
    const body = await parseJsonBody(c);
    let action = ws.auditLogActions.findOneBy("name", actionName);
    if (action) {
      store.setData(`${STORE_KEY_PREFIXES.auditSchema}${actionName}`, body);
      return c.json(formatAuditLogAction(action));
    }
    action = ws.auditLogActions.insert({
      object: "audit_log_action",
      name: actionName,
      description: null,
      condition: null
    });
    store.setData(`${STORE_KEY_PREFIXES.auditSchema}${actionName}`, body);
    return c.json(formatAuditLogAction(action), 201);
  });
  app.post("/audit_logs/events", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    const actionBody = body.action;
    if (!actionBody?.name) {
      throw validationError("action.name is required", [{ field: "action.name", code: "required" }]);
    }
    const event = ws.auditLogEvents.insert({
      object: "audit_log_event",
      organization_id: organizationId,
      action: {
        name: actionBody.name,
        type: actionBody.type ?? "C",
        id: actionBody.id ?? actionBody.name
      },
      actor: body.actor ?? {},
      targets: body.targets ?? [],
      metadata: body.metadata ?? null,
      occurred_at: body.occurred_at ?? (/* @__PURE__ */ new Date()).toISOString()
    });
    return c.json(formatAuditLogEvent(event), 201);
  });
  app.post("/audit_logs/exports", async (c) => {
    const body = await parseJsonBody(c);
    const organizationId = body.organization_id;
    if (!organizationId) {
      throw validationError("organization_id is required", [{ field: "organization_id", code: "required" }]);
    }
    const exp = ws.auditLogExports.insert({
      object: "audit_log_export",
      organization_id: organizationId,
      state: "ready",
      url: `https://emulator.workos.test/exports/audit_log_export_mock.csv`,
      filters: body.filters ?? {}
    });
    return c.json(formatAuditLogExport(exp), 201);
  });
  app.get("/audit_logs/exports/:id", (c) => {
    const exp = ws.auditLogExports.get(c.req.param("id"));
    if (!exp)
      throw notFound("AuditLogExport");
    return c.json(formatAuditLogExport(exp));
  });
  app.get("/organizations/:id/audit_log_configuration", (c) => {
    const orgId = c.req.param("id");
    return c.json({
      object: "audit_log_configuration",
      organization_id: orgId,
      enabled: true,
      retention_days: 365
    });
  });
  app.get("/organizations/:id/audit_logs_retention", (c) => {
    const orgId = c.req.param("id");
    return c.json({
      object: "audit_logs_retention",
      organization_id: orgId,
      retention_days: 365
    });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/agents.js
function invalidRequest(message, errors) {
  return new WorkOSApiError(400, message, "invalid_request", errors);
}
function tokenError(status, code, message) {
  return new WorkOSApiError(status, message, code);
}
var isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
var isStringList = (v) => Array.isArray(v) && v.every(isNonEmptyString);
var isRecord = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function validateBlueprintBody(body, mode, errors) {
  const out = {};
  if (body.name !== void 0) {
    if (!isNonEmptyString(body.name) || body.name.length > 255) {
      errors.push({ field: "name", code: "invalid", message: "name must be a string of 1 to 255 characters" });
    } else {
      out.name = body.name;
    }
  }
  if (body.description !== void 0) {
    if (body.description === null && mode === "update") {
      out.description = null;
    } else if (!isNonEmptyString(body.description) || body.description.length > 1e3) {
      errors.push({
        field: "description",
        code: "invalid",
        message: mode === "update" ? "description must be a string of 1 to 1000 characters, or null" : "description must be a string of 1 to 1000 characters"
      });
    } else {
      out.description = body.description;
    }
  }
  if (body.permissions !== void 0) {
    if (!isStringList(body.permissions) || body.permissions.length > 1e3) {
      errors.push({
        field: "permissions",
        code: "invalid",
        message: "permissions must be an array of at most 1000 permission slugs"
      });
    } else {
      out.permissions = [...new Set(body.permissions)];
    }
  }
  if (body.invocable_by !== void 0) {
    if (!isRecord(body.invocable_by)) {
      errors.push({ field: "invocable_by", code: "invalid", message: "invocable_by must be an object" });
    } else {
      const invocable = {};
      const lists = [
        ["role_slugs", 100],
        ["organization_ids", 1e3]
      ];
      for (const [key, max] of lists) {
        const value = body.invocable_by[key];
        if (value === void 0)
          continue;
        if (!isStringList(value) || value.length > max) {
          errors.push({
            field: `invocable_by.${key}`,
            code: "invalid",
            message: `invocable_by.${key} must be an array of at most ${max} strings`
          });
        } else {
          invocable[key] = [...new Set(value)];
        }
      }
      out.invocable_by = invocable;
    }
  }
  if (body.session_settings !== void 0) {
    if (!isRecord(body.session_settings)) {
      errors.push({ field: "session_settings", code: "invalid", message: "session_settings must be an object" });
    } else {
      const settings = {};
      for (const key of Object.keys(AGENT_SESSION_SETTING_LIMITS)) {
        const value = body.session_settings[key];
        if (value === void 0) {
          if (mode === "create") {
            errors.push({
              field: `session_settings.${key}`,
              code: "required",
              message: `session_settings.${key} is required when session_settings is provided`
            });
          }
          continue;
        }
        const max = AGENT_SESSION_SETTING_LIMITS[key];
        if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > max) {
          errors.push({
            field: `session_settings.${key}`,
            code: "invalid",
            message: `session_settings.${key} must be a positive integer of at most ${max}`
          });
        } else {
          settings[key] = value;
        }
      }
      out.session_settings = settings;
    }
  }
  return out;
}
function assertBlueprintReferences(ws, refs) {
  for (const slug of refs.permissions ?? []) {
    if (ws.permissions.findBy("slug", slug).length === 0) {
      throw new WorkOSApiError(422, `Permission not found: ${slug}`, "permission_not_found");
    }
  }
  for (const slug of refs.role_slugs ?? []) {
    if (ws.roles.findBy("slug", slug).length === 0) {
      throw new WorkOSApiError(422, `Role not found: ${slug}`, "role_not_found");
    }
  }
  for (const id of refs.organization_ids ?? []) {
    if (!ws.organizations.get(id)) {
      throw new WorkOSApiError(422, `Organization not found: ${id}`, "organization_not_found");
    }
  }
}
function assertNameAvailable(ws, name, exceptId) {
  if (ws.agentBlueprints.findBy("name", name).some((b) => b.id !== exceptId)) {
    throw new WorkOSApiError(409, `An agent blueprint named "${name}" already exists.`, "name_already_in_use");
  }
}
function requireBlueprint(ws, id) {
  const blueprint = ws.agentBlueprints.get(id);
  if (!blueprint)
    throw notFound("Agent blueprint");
  return blueprint;
}
function optionalIntent(body) {
  if (body.intent === void 0)
    return void 0;
  if (!isNonEmptyString(body.intent) || body.intent.length > 255) {
    throw invalidRequest("intent must be a string of 1 to 255 characters", [
      { field: "intent", code: "invalid", message: "intent must be a string of 1 to 255 characters" }
    ]);
  }
  return body.intent;
}
function requireBodyString(body, field) {
  const value = body[field];
  if (!isNonEmptyString(value)) {
    throw invalidRequest(`${field} is required`, [{ field, code: "required", message: `${field} is required` }]);
  }
  return value;
}
function resolveInstance(ws, blueprint, organizationId, membership) {
  const existing = ws.agentInstances.findBy("agent_blueprint_id", blueprint.id).find((i) => i.organization_id === organizationId && i.organization_membership_id === (membership?.id ?? null) && i.type === (membership ? "delegated" : "autonomous"));
  if (existing)
    return { instance: existing, created: false };
  const instance = ws.agentInstances.insert({
    object: "agent_instance",
    agent_blueprint_id: blueprint.id,
    organization_id: organizationId,
    organization_membership_id: membership?.id ?? null,
    type: membership ? "delegated" : "autonomous"
  });
  return { instance, created: true };
}
function resolveSessionAuthority(ws, blueprint, instance) {
  if (instance.organization_membership_id === null) {
    return { permissions: [...blueprint.permissions], act: void 0 };
  }
  const membership = ws.organizationMemberships.get(instance.organization_membership_id);
  if (!membership || membership.status !== "active") {
    throw tokenError(403, "user_not_member_of_organization", "The user is not a member of the organization.");
  }
  if (!isRoleInvocable(blueprint, membership.role.slug)) {
    throw tokenError(403, "role_not_invocable", "The user does not hold a role allowed to invoke this agent blueprint.");
  }
  const granted = membershipPermissionSlugs(ws, membership.organization_id, membership.role.slug);
  return {
    permissions: intersectPermissions(blueprint, granted),
    act: { sub: membership.user_id, sub_profile: USER_SUBJECT_PROFILE }
  };
}
function assertOrganizationInvocable(ws, blueprint, organizationId) {
  if (!ws.organizations.get(organizationId))
    throw notFound("Organization");
  if (!isOrganizationInvocable(blueprint, organizationId)) {
    throw tokenError(403, "organization_not_invocable", "The organization is not allowed to invoke this agent blueprint.");
  }
}
function userSessionAuthTime(ws, userSessionId) {
  const session = ws.sessions.get(userSessionId);
  if (!isUserSessionLive(session)) {
    throw tokenError(400, "user_session_ended", "The delegating user session has ended.");
  }
  return Math.floor(new Date(session.created_at).getTime() / 1e3);
}
function agentRoutes(ctx) {
  const { app, store, jwt } = ctx;
  const ws = getWorkOSStore(store);
  const audience = "workos-emulate";
  function mintResponse(input) {
    const { instance, session, authority, intent, authTime, accessTokenTtlSeconds } = input;
    const accessToken = jwt.sign({
      sub: instance.id,
      sub_profile: AGENT_SUBJECT_PROFILE,
      sid: session.id,
      jti: generateUlid(),
      org_id: instance.organization_id,
      permissions: authority.permissions,
      intent: intent !== void 0 ? { text: intent } : void 0,
      act: authority.act,
      auth_time: authTime,
      aud: audience
    }, { expiresIn: accessTokenTtlSeconds, typ: "at+jwt" });
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: accessTokenTtlSeconds,
      refresh_token: session.refresh_token,
      agent_instance_id: instance.id,
      new_instance: input.newInstance,
      agent_instance_session_id: session.id,
      permissions: authority.permissions
    };
  }
  function createSession(instance, settings, authority, intent, provenance) {
    const expiresAtMs = Math.min(Date.now() + settings.refresh_token_ttl_seconds * 1e3, ...provenance.notAfterMs !== void 0 ? [provenance.notAfterMs] : []);
    return ws.agentInstanceSessions.insert({
      object: "agent_instance_session",
      agent_instance_id: instance.id,
      expires_at: new Date(expiresAtMs).toISOString(),
      revoked_at: null,
      refresh_token: generateUlid(),
      parent_session_id: provenance.parentSessionId ?? null,
      user_session_id: provenance.userSessionId ?? null,
      permissions: authority.permissions,
      intent: intent ?? null
    });
  }
  const capAccessTokenTtl = (settings, session) => Math.min(settings.access_token_ttl_seconds, settings.refresh_token_ttl_seconds, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1e3));
  function resolveAgentToken(token) {
    const invalid = tokenError(400, "invalid_agent_access_token", "The provided agent access token is invalid.");
    let payload;
    try {
      payload = jwt.verify(token);
    } catch {
      throw invalid;
    }
    if (payload.sub_profile !== AGENT_SUBJECT_PROFILE || typeof payload.sid !== "string")
      throw invalid;
    const session = ws.agentInstanceSessions.get(payload.sid);
    if (!session || session.agent_instance_id !== payload.sub)
      throw invalid;
    const instance = ws.agentInstances.get(session.agent_instance_id);
    if (!instance)
      throw invalid;
    return { payload, session, instance };
  }
  function assertSessionLive(session) {
    if (session.revoked_at !== null) {
      throw tokenError(400, "session_revoked", "The session backing this token has been revoked.");
    }
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      throw tokenError(400, "session_expired", "The session backing this token has expired.");
    }
  }
  app.post("/agents/blueprints", async (c) => {
    const body = await parseJsonBody(c);
    const errors = [];
    if (body.name === void 0)
      errors.push({ field: "name", code: "required", message: "name is required" });
    const parsed = validateBlueprintBody(body, "create", errors);
    if (errors.length > 0 || parsed.name === void 0)
      throw invalidRequest("Invalid request body", errors);
    const permissions = parsed.permissions ?? [];
    const invocable_by = {
      role_slugs: parsed.invocable_by?.role_slugs ?? [],
      organization_ids: parsed.invocable_by?.organization_ids ?? []
    };
    assertBlueprintReferences(ws, { permissions, ...invocable_by });
    assertNameAvailable(ws, parsed.name);
    const blueprint = ws.agentBlueprints.insert({
      object: "agent_blueprint",
      name: parsed.name,
      description: parsed.description ?? null,
      permissions,
      invocable_by,
      session_settings: { ...DEFAULT_AGENT_SESSION_SETTINGS, ...parsed.session_settings }
    });
    return c.json(formatAgentBlueprint(blueprint), 201);
  });
  app.get("/agents/blueprints", (c) => {
    const params = parseListParams(new URL(c.req.url));
    return c.json(formatListResponse(ws.agentBlueprints.list(params), formatAgentBlueprint));
  });
  app.get("/agents/blueprints/:id", (c) => c.json(formatAgentBlueprint(requireBlueprint(ws, c.req.param("id")))));
  app.patch("/agents/blueprints/:id", async (c) => {
    const blueprint = requireBlueprint(ws, c.req.param("id"));
    const body = await parseJsonBody(c);
    const errors = [];
    const parsed = validateBlueprintBody(body, "update", errors);
    if (errors.length > 0)
      throw invalidRequest("Invalid request body", errors);
    const invocable_by = {
      role_slugs: parsed.invocable_by?.role_slugs ?? blueprint.invocable_by.role_slugs,
      organization_ids: parsed.invocable_by?.organization_ids ?? blueprint.invocable_by.organization_ids
    };
    assertBlueprintReferences(ws, {
      permissions: parsed.permissions,
      role_slugs: parsed.invocable_by?.role_slugs,
      organization_ids: parsed.invocable_by?.organization_ids
    });
    if (parsed.name !== void 0)
      assertNameAvailable(ws, parsed.name, blueprint.id);
    const updated = ws.agentBlueprints.update(blueprint.id, {
      ...parsed.name !== void 0 ? { name: parsed.name } : {},
      ...parsed.description !== void 0 ? { description: parsed.description } : {},
      ...parsed.permissions !== void 0 ? { permissions: parsed.permissions } : {},
      invocable_by,
      session_settings: { ...blueprint.session_settings, ...parsed.session_settings }
    });
    return c.json(formatAgentBlueprint(updated));
  });
  app.delete("/agents/blueprints/:id", (c) => {
    deleteAgentBlueprint(ws, requireBlueprint(ws, c.req.param("id")));
    return c.body(null, 204);
  });
  app.post("/agents/blueprints/:id/tokens", async (c) => {
    const blueprint = requireBlueprint(ws, c.req.param("id"));
    const body = await parseJsonBody(c);
    const intent = optionalIntent(body);
    const settings = blueprint.session_settings;
    switch (body.type) {
      case "user_delegated": {
        const userAccessToken = requireBodyString(body, "user_access_token");
        const invalid = tokenError(400, "invalid_user_access_token", "The provided user access token is invalid.");
        let payload;
        try {
          payload = jwt.verify(userAccessToken);
        } catch {
          throw invalid;
        }
        if (payload.sub_profile !== void 0 && payload.sub_profile !== USER_SUBJECT_PROFILE || typeof payload.sub !== "string" || typeof payload.org_id !== "string" || typeof payload.sid !== "string" || !ws.users.get(payload.sub)) {
          throw invalid;
        }
        const userSession = ws.sessions.get(payload.sid);
        if (!userSession || userSession.user_id !== payload.sub)
          throw invalid;
        if (!isUserSessionLive(userSession)) {
          throw tokenError(400, "user_session_ended", "The delegating user session has ended.");
        }
        const organizationId = payload.org_id;
        if (!ws.organizations.get(organizationId))
          throw notFound("Organization");
        const membership = ws.organizationMemberships.findBy("organization_id", organizationId).find((m) => m.user_id === payload.sub && m.status === "active");
        if (!membership) {
          throw tokenError(403, "user_not_member_of_organization", "The user is not a member of the organization.");
        }
        assertOrganizationInvocable(ws, blueprint, organizationId);
        const authTime = Math.floor(new Date(userSession.created_at).getTime() / 1e3);
        if (Date.now() >= (authTime + settings.max_age_seconds) * 1e3) {
          throw tokenError(400, "max_age_exceeded", "The delegating credential's authentication is older than the blueprint allows.");
        }
        const { instance, created } = resolveInstance(ws, blueprint, organizationId, membership);
        const authority = resolveSessionAuthority(ws, blueprint, instance);
        const session = createSession(instance, settings, authority, intent, { userSessionId: userSession.id });
        return c.json(mintResponse({
          instance,
          session,
          authority,
          intent,
          authTime,
          accessTokenTtlSeconds: capAccessTokenTtl(settings, session),
          newInstance: created
        }));
      }
      case "autonomous": {
        const organizationId = requireBodyString(body, "organization_id");
        assertOrganizationInvocable(ws, blueprint, organizationId);
        const { instance, created } = resolveInstance(ws, blueprint, organizationId, null);
        const authority = resolveSessionAuthority(ws, blueprint, instance);
        const session = createSession(instance, settings, authority, intent, {});
        return c.json(mintResponse({
          instance,
          session,
          authority,
          intent,
          authTime: void 0,
          accessTokenTtlSeconds: capAccessTokenTtl(settings, session),
          newInstance: created
        }));
      }
      case "agent_delegated": {
        const agentAccessToken = requireBodyString(body, "agent_access_token");
        const invalid = tokenError(400, "invalid_agent_access_token", "The provided agent access token is invalid.");
        const { session: presenting, instance } = resolveAgentToken(agentAccessToken);
        if (instance.agent_blueprint_id !== blueprint.id)
          throw invalid;
        if (presenting.revoked_at !== null || new Date(presenting.expires_at).getTime() <= Date.now())
          throw invalid;
        assertOrganizationInvocable(ws, blueprint, instance.organization_id);
        const { root, depth, ancestorRevoked } = findChainRoot(ws, presenting);
        if (ancestorRevoked)
          throw invalid;
        if (depth + 1 > MAX_AGENT_CHAIN_DEPTH) {
          throw tokenError(400, "chain_depth_exceeded", "The agent delegation chain is too deep.");
        }
        const windowEndsAtMs = new Date(root.created_at).getTime() + settings.max_age_seconds * 1e3;
        if (windowEndsAtMs - Date.now() < 1e3) {
          throw tokenError(400, "max_age_exceeded", "The delegating credential's authentication is older than the blueprint allows.");
        }
        const authTime = root.user_session_id !== null ? userSessionAuthTime(ws, root.user_session_id) : void 0;
        const authority = resolveSessionAuthority(ws, blueprint, instance);
        const session = createSession(instance, settings, authority, intent, {
          parentSessionId: presenting.id,
          notAfterMs: windowEndsAtMs
        });
        return c.json(mintResponse({
          instance,
          session,
          authority,
          intent,
          authTime,
          accessTokenTtlSeconds: capAccessTokenTtl(settings, session),
          newInstance: false
        }));
      }
      case "refresh": {
        const refreshToken = requireBodyString(body, "refresh_token");
        const session = ws.agentInstanceSessions.findBy("refresh_token", refreshToken)[0];
        const instance = session ? ws.agentInstances.get(session.agent_instance_id) : void 0;
        if (!session || !instance || instance.agent_blueprint_id !== blueprint.id) {
          throw tokenError(400, "invalid_refresh_token", "The provided refresh token is invalid.");
        }
        assertSessionLive(session);
        const { root, ancestorRevoked } = findChainRoot(ws, session);
        if (ancestorRevoked) {
          throw tokenError(400, "session_revoked", "The session backing this token has been revoked.");
        }
        const authTime = root.user_session_id !== null ? userSessionAuthTime(ws, root.user_session_id) : void 0;
        assertOrganizationInvocable(ws, blueprint, instance.organization_id);
        const authority = resolveSessionAuthority(ws, blueprint, instance);
        const now = Date.now();
        const rotatedExpiresAtMs = Math.min(now + settings.refresh_token_ttl_seconds * 1e3, new Date(root.created_at).getTime() + settings.max_age_seconds * 1e3);
        if (rotatedExpiresAtMs - now < 1e3) {
          throw tokenError(400, "session_expired", "The session backing this token has expired.");
        }
        const rotated = ws.agentInstanceSessions.updateSilent(session.id, {
          refresh_token: generateUlid(),
          expires_at: new Date(rotatedExpiresAtMs).toISOString(),
          permissions: authority.permissions,
          intent: intent ?? session.intent
        });
        return c.json(mintResponse({
          instance,
          session: rotated,
          authority,
          intent: intent ?? rotated.intent ?? void 0,
          authTime,
          accessTokenTtlSeconds: capAccessTokenTtl(settings, rotated),
          newInstance: false
        }));
      }
      default:
        throw invalidRequest("type must be one of user_delegated, autonomous, agent_delegated, refresh", [
          { field: "type", code: "invalid" }
        ]);
    }
  });
  app.post("/agents/blueprints/:id/tokens/validate", async (c) => {
    const blueprint = requireBlueprint(ws, c.req.param("id"));
    const body = await parseJsonBody(c);
    const token = requireBodyString(body, "agent_access_token");
    const { payload, session, instance } = resolveAgentToken(token);
    if (instance.agent_blueprint_id !== blueprint.id) {
      throw tokenError(400, "invalid_agent_access_token", "The provided agent access token is invalid.");
    }
    assertSessionLive(session);
    const { root, ancestorRevoked } = findChainRoot(ws, session);
    if (ancestorRevoked) {
      throw tokenError(400, "session_revoked", "The session backing this token has been revoked.");
    }
    if (root.user_session_id !== null && !isUserSessionLive(ws.sessions.get(root.user_session_id))) {
      throw tokenError(400, "user_session_ended", "The delegating user session has ended.");
    }
    const intent = payload.intent;
    return c.json({
      valid: true,
      agent_instance_id: instance.id,
      agent_instance_session_id: session.id,
      organization_id: instance.organization_id,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      intent: intent && typeof intent.text === "string" ? intent.text : null,
      acting_user_id: payload.act?.sub ?? null,
      session_expires_at: session.expires_at
    });
  });
  app.get("/agents/instances", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const organizationId = url.searchParams.get("organization_id");
    const blueprintId = url.searchParams.get("agent_blueprint_id");
    const filter = (i) => (!organizationId || i.organization_id === organizationId) && (!blueprintId || i.agent_blueprint_id === blueprintId);
    return c.json(formatListResponse(ws.agentInstances.list({ ...params, filter }), formatAgentInstance));
  });
  app.get("/agents/instances/:id", (c) => {
    const instance = ws.agentInstances.get(c.req.param("id"));
    if (!instance)
      throw notFound("Agent instance");
    return c.json(formatAgentInstance(instance));
  });
  app.delete("/agents/instances/:id", (c) => {
    const instance = ws.agentInstances.get(c.req.param("id"));
    if (!instance)
      throw notFound("Agent instance");
    deleteAgentInstance(ws, instance);
    return c.body(null, 204);
  });
  app.get("/agents/sessions", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const instanceId = url.searchParams.get("agent_instance_id");
    const blueprintId = url.searchParams.get("agent_blueprint_id");
    const filter = (s) => (!instanceId || s.agent_instance_id === instanceId) && (!blueprintId || ws.agentInstances.get(s.agent_instance_id)?.agent_blueprint_id === blueprintId);
    return c.json(formatListResponse(ws.agentInstanceSessions.list({ ...params, filter }), formatAgentInstanceSession));
  });
  app.get("/agents/sessions/:id", (c) => {
    const session = ws.agentInstanceSessions.get(c.req.param("id"));
    if (!session)
      throw notFound("Agent instance session");
    return c.json(formatAgentInstanceSession(session));
  });
  app.post("/agents/sessions/:id/revoke", (c) => {
    const session = ws.agentInstanceSessions.get(c.req.param("id"));
    if (!session)
      throw notFound("Agent instance session");
    revokeAgentSessionTree(ws, session.id);
    return c.json(formatAgentInstanceSession(ws.agentInstanceSessions.get(session.id)));
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/data-integrations.js
function dataIntegrationRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/data-integrations/:slug/authorize", (c) => {
    const slug = c.req.param("slug");
    const url = new URL(c.req.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state") ?? null;
    if (!redirectUri) {
      throw new WorkOSApiError(400, "redirect_uri is required", "invalid_request");
    }
    assertAllowedRedirectUri(redirectUri, store);
    const code = generateVerificationToken();
    ws.dataIntegrationAuths.insert({
      slug,
      code,
      redirect_uri: redirectUri,
      state,
      expires_at: expiresIn(10)
    });
    const redirect2 = new URL(redirectUri);
    redirect2.searchParams.set("code", code);
    if (state)
      redirect2.searchParams.set("state", state);
    return c.redirect(redirect2.toString(), 302);
  });
  app.post("/data-integrations/:slug/token", async (c) => {
    const slug = c.req.param("slug");
    const body = await parseJsonBody(c);
    if (body.code === void 0) {
      if (body.user_id === void 0) {
        throw validationError("user_id is required", [{ field: "user_id", code: "required" }]);
      }
      if (typeof body.user_id !== "string" || !body.user_id) {
        throw validationError("user_id must be a non-empty string", [{ field: "user_id", code: "invalid" }]);
      }
      const organizationId = body.organization_id ?? null;
      if (organizationId !== null && (typeof organizationId !== "string" || !organizationId)) {
        throw validationError("organization_id must be a non-empty string", [
          { field: "organization_id", code: "invalid" }
        ]);
      }
      if (!ws.users.get(body.user_id))
        throw notFound("User");
      if (organizationId && !ws.organizations.get(organizationId))
        throw notFound("Organization");
      let account = findConnectedAccount(ws, body.user_id, slug, organizationId);
      if (!account)
        return c.json({ active: false, error: "not_installed" });
      const expired = account.token_expires_at !== null && isExpired(account.token_expires_at);
      if (account.state === "connected" && expired && !account.refresh_token) {
        account = ws.connectedAccounts.update(account.id, { state: "needs_reauthorization" });
      }
      if (account.state !== "connected")
        return c.json({ active: false, error: "needs_reauthorization" });
      if (!account.access_token || expired) {
        account = ws.connectedAccounts.update(account.id, {
          access_token: `di_mock_${slug}_${generateVerificationToken().slice(0, 8)}`,
          token_expires_at: account.refresh_token ? expiresIn(60) : null
        });
      }
      return c.json({
        active: true,
        access_token: {
          object: "access_token",
          access_token: account.access_token,
          expires_at: account.token_expires_at,
          scopes: account.scopes,
          missing_scopes: []
        }
      });
    }
    const code = body.code;
    if (!code) {
      throw new WorkOSApiError(400, "code is required", "invalid_request");
    }
    const auth = ws.dataIntegrationAuths.findOneBy("code", code);
    if (!auth || auth.slug !== slug) {
      throw new WorkOSApiError(400, "Invalid authorization code", "invalid_grant");
    }
    if (isExpired(auth.expires_at)) {
      ws.dataIntegrationAuths.delete(auth.id);
      throw new WorkOSApiError(400, "Authorization code has expired", "invalid_grant");
    }
    ws.dataIntegrationAuths.delete(auth.id);
    return c.json({
      access_token: `di_mock_${slug}_${generateVerificationToken().slice(0, 8)}`,
      token_type: "bearer",
      expires_in: 3600
    });
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/webhook-endpoints.js
import { randomBytes as randomBytes2 } from "crypto";
function webhookEndpointRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.post("/webhook_endpoints", async (c) => {
    const body = await parseJsonBody(c);
    const endpointUrl = body.endpoint_url ?? body.url;
    if (!endpointUrl || typeof endpointUrl !== "string") {
      throw validationError("endpoint_url is required", [{ field: "endpoint_url", code: "required" }]);
    }
    const secret = body.secret ?? randomBytes2(32).toString("hex");
    const endpoint = ws.webhookEndpoints.insert({
      object: "webhook_endpoint",
      endpoint_url: endpointUrl,
      secret,
      enabled: body.enabled !== false,
      events: Array.isArray(body.events) ? body.events : [],
      description: body.description ?? null
    });
    return c.json(formatWebhookEndpoint(endpoint, { includeSecret: true }), 201);
  });
  app.get("/webhook_endpoints", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const result = ws.webhookEndpoints.list(params);
    return c.json(formatListResponse(result, (ep) => formatWebhookEndpoint(ep)));
  });
  app.get("/webhook_endpoints/:id", (c) => {
    const ep = ws.webhookEndpoints.get(c.req.param("id"));
    if (!ep)
      throw notFound("WebhookEndpoint");
    return c.json(formatWebhookEndpoint(ep));
  });
  app.put("/webhook_endpoints/:id", async (c) => {
    const ep = ws.webhookEndpoints.get(c.req.param("id"));
    if (!ep)
      throw notFound("WebhookEndpoint");
    const body = await parseJsonBody(c);
    const updates = {};
    if ("endpoint_url" in body || "url" in body) {
      const newUrl = body.endpoint_url ?? body.url;
      if (!newUrl || typeof newUrl !== "string") {
        throw validationError("endpoint_url is required", [{ field: "endpoint_url", code: "required" }]);
      }
      updates.endpoint_url = newUrl;
    }
    if ("enabled" in body)
      updates.enabled = !!body.enabled;
    if ("events" in body)
      updates.events = Array.isArray(body.events) ? body.events : [];
    if ("description" in body)
      updates.description = body.description ?? null;
    const updated = ws.webhookEndpoints.update(ep.id, updates);
    return c.json(formatWebhookEndpoint(updated));
  });
  app.delete("/webhook_endpoints/:id", (c) => {
    const ep = ws.webhookEndpoints.get(c.req.param("id"));
    if (!ep)
      throw notFound("WebhookEndpoint");
    ws.webhookEndpoints.delete(ep.id);
    return c.body(null, 204);
  });
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/routes/events.js
function eventRoutes(ctx) {
  const { app, store } = ctx;
  const ws = getWorkOSStore(store);
  app.get("/events", (c) => {
    const url = new URL(c.req.url);
    const params = parseListParams(url);
    const eventTypes = [...url.searchParams].filter(([key]) => key === "events" || /^events\[\d*\]$/.test(key)).flatMap(([, value]) => value.split(","));
    const organizationId = url.searchParams.get("organization_id");
    const rangeStart = url.searchParams.get("range_start");
    const rangeEnd = url.searchParams.get("range_end");
    const result = ws.events.list({
      ...params,
      filter: (event) => (eventTypes.length === 0 || eventTypes.includes(event.event)) && eventInScope(event, organizationId, rangeStart, rangeEnd)
    });
    return c.json(formatListResponse(result, formatEvent));
  });
}
function eventInScope(event, organizationId, rangeStart, rangeEnd) {
  if (organizationId && event.organization_id !== organizationId)
    return false;
  const createdAt = Date.parse(event.created_at);
  if (rangeStart) {
    const start = Date.parse(rangeStart);
    if (!Number.isNaN(createdAt) && !Number.isNaN(start) && createdAt < start)
      return false;
  }
  if (rangeEnd) {
    const end = Date.parse(rangeEnd);
    if (!Number.isNaN(createdAt) && !Number.isNaN(end) && createdAt > end)
      return false;
  }
  return true;
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/webhook-signer.js
import { createHmac } from "crypto";
function signWebhookPayload(payload, secret) {
  const timestamp = Date.now().toString();
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${timestamp}, v1=${signature}`;
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/event-bus.js
var DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1e3,
  maxDelayMs: 1e4,
  backoffMultiplier: 2
};
var EventBus = class {
  store;
  endpointsByEvent = /* @__PURE__ */ new Map();
  catchAllEndpoints = /* @__PURE__ */ new Set();
  deadLetterQueue = [];
  retryConfig;
  debugMode;
  constructor(store, options = {}) {
    this.store = store;
    this.retryConfig = options.retryConfig ?? DEFAULT_RETRY_CONFIG;
    this.debugMode = options.debugMode ?? false;
  }
  /** Rebuild the event-type index.  Auto-called via collection hooks; call manually only in tests. */
  rebuildIndex() {
    this.endpointsByEvent.clear();
    this.catchAllEndpoints.clear();
    const ws = getWorkOSStore(this.store);
    for (const ep of ws.webhookEndpoints.all()) {
      if (!ep.enabled)
        continue;
      if (ep.events.length === 0) {
        this.catchAllEndpoints.add(ep.id);
      } else {
        for (const evt of ep.events) {
          const set = this.endpointsByEvent.get(evt) ?? /* @__PURE__ */ new Set();
          set.add(ep.id);
          this.endpointsByEvent.set(evt, set);
        }
      }
    }
  }
  emit(payload) {
    const ws = getWorkOSStore(this.store);
    const dataOrganizationId = payload.data.organization_id;
    const event = ws.events.insert({
      object: "event",
      event: payload.event,
      data: payload.data,
      organization_id: payload.organization_id ?? (typeof dataOrganizationId === "string" ? dataOrganizationId : null),
      environment_id: payload.environment_id ?? null,
      ...payload.context ? { context: payload.context } : {}
    });
    const targetIds = new Set(this.catchAllEndpoints);
    const eventSpecific = this.endpointsByEvent.get(payload.event);
    if (eventSpecific) {
      for (const id of eventSpecific)
        targetIds.add(id);
    }
    for (const id of targetIds) {
      const endpoint = ws.webhookEndpoints.get(id);
      if (endpoint)
        this.deliver(endpoint, event).catch(() => {
        });
    }
  }
  async deliver(endpoint, event) {
    const body = JSON.stringify({
      id: event.id,
      event: event.event,
      data: event.data,
      created_at: event.created_at,
      ...event.context ? { context: event.context } : {}
    });
    const signature = signWebhookPayload(body, endpoint.secret);
    let lastError = null;
    let delay = this.retryConfig.initialDelayMs;
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (this.debugMode) {
          console.log(`[EventBus] Delivering webhook attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1} to ${endpoint.endpoint_url}`);
        }
        const response = await fetch(endpoint.endpoint_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "WorkOS-Signature": signature
          },
          body,
          signal: AbortSignal.timeout(5e3)
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (this.debugMode) {
          console.log(`[EventBus] Webhook delivered successfully to ${endpoint.endpoint_url}`);
        }
        return;
      } catch (error2) {
        lastError = error2;
        if (this.debugMode) {
          console.log(`[EventBus] Webhook delivery failed (attempt ${attempt + 1}):`, error2);
        }
        if (attempt < this.retryConfig.maxRetries) {
          await this.sleep(delay);
          delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelayMs);
        }
      }
    }
    if (this.debugMode) {
      console.log(`[EventBus] Adding webhook to dead letter queue: ${endpoint.endpoint_url}`);
    }
    this.deadLetterQueue.push({
      endpoint,
      event,
      error: lastError || new Error("Unknown error")
    });
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /** Get the dead letter queue for inspection/testing */
  getDeadLetterQueue() {
    return [...this.deadLetterQueue];
  }
  /** Clear the dead letter queue */
  clearDeadLetterQueue() {
    this.deadLetterQueue = [];
  }
  /** Retry all webhooks in the dead letter queue */
  async retryDeadLetterQueue() {
    const queue = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    let success = 0;
    let failed = 0;
    for (const item of queue) {
      try {
        await this.deliver(item.endpoint, item.event);
        success++;
      } catch {
        failed++;
        this.deadLetterQueue.push(item);
      }
    }
    return { success, failed };
  }
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/config-validator.js
function seedEmail(value) {
  return normalizeEmail(value, { requireShape: true });
}
var PINNED_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
function validateSeedConfig(config) {
  const errors = [];
  const userEmails = new Set(Array.isArray(config.users) ? config.users.map((u) => seedEmail(u.email)).filter((r) => r.ok).map((r) => r.email.toLowerCase()) : []);
  if (config.users) {
    if (!Array.isArray(config.users)) {
      errors.push({
        path: "users",
        message: "users must be an array",
        value: config.users
      });
    } else {
      config.users.forEach((user, index) => {
        const email = seedEmail(user.email);
        if (!email.ok) {
          errors.push({
            path: `users[${index}].email`,
            message: email.problem === "malformed" ? (
              // Same standard as the two routes that create users: an address that could only
              // be a typo becomes an account nothing can reach, and a seed is the one creation
              // path with no route in front of it to say so.
              "email must be a valid email address"
            ) : "email is required and must be a string",
            value: user.email
          });
        }
        if (user.id !== void 0 && (typeof user.id !== "string" || !PINNED_ID_PATTERN.test(user.id))) {
          errors.push({
            path: `users[${index}].id`,
            message: 'id must be a non-empty, URL-safe string (letters, digits, "_" or "-") if provided',
            value: user.id
          });
        }
        if (user.password && typeof user.password !== "string") {
          errors.push({
            path: `users[${index}].password`,
            message: "password must be a string if provided",
            value: user.password
          });
        }
        if (user.email_verified !== void 0 && typeof user.email_verified !== "boolean") {
          errors.push({
            path: `users[${index}].email_verified`,
            message: "email_verified must be a boolean if provided",
            value: user.email_verified
          });
        }
        if (user.oauth_provider !== void 0 && (typeof user.oauth_provider !== "string" || !user.oauth_provider)) {
          errors.push({
            path: `users[${index}].oauth_provider`,
            message: "oauth_provider must be a non-empty string if provided",
            value: user.oauth_provider
          });
        }
        if (user.oauth_idp_id !== void 0 && (typeof user.oauth_idp_id !== "string" || !user.oauth_idp_id)) {
          errors.push({
            path: `users[${index}].oauth_idp_id`,
            message: "oauth_idp_id must be a non-empty string if provided",
            value: user.oauth_idp_id
          });
        }
        if (user.totp !== void 0 && typeof user.totp !== "boolean") {
          errors.push({
            path: `users[${index}].totp`,
            message: "totp must be a boolean if provided",
            value: user.totp
          });
        }
      });
      const seenEmails = /* @__PURE__ */ new Set();
      config.users.forEach((user, index) => {
        const email = seedEmail(user.email);
        if (!email.ok)
          return;
        const normalized = email.email.toLowerCase();
        if (seenEmails.has(normalized)) {
          errors.push({
            path: `users[${index}].email`,
            message: "email must be unique across users",
            value: user.email
          });
        }
        seenEmails.add(normalized);
      });
      const seenUserIds = /* @__PURE__ */ new Set();
      config.users.forEach((user, index) => {
        if (typeof user.id !== "string" || user.id.length === 0)
          return;
        if (seenUserIds.has(user.id)) {
          errors.push({
            path: `users[${index}].id`,
            message: "id must be unique across users",
            value: user.id
          });
        }
        seenUserIds.add(user.id);
      });
    }
  }
  if (config.organizations) {
    if (!Array.isArray(config.organizations)) {
      errors.push({
        path: "organizations",
        message: "organizations must be an array",
        value: config.organizations
      });
    } else {
      config.organizations.forEach((org, index) => {
        if (!org.name || typeof org.name !== "string") {
          errors.push({
            path: `organizations[${index}].name`,
            message: "name is required and must be a string",
            value: org.name
          });
        }
        if (org.id !== void 0 && (typeof org.id !== "string" || !PINNED_ID_PATTERN.test(org.id))) {
          errors.push({
            path: `organizations[${index}].id`,
            message: 'id must be a non-empty, URL-safe string (letters, digits, "_" or "-") if provided',
            value: org.id
          });
        }
        if (org.entitlements !== void 0 && (!Array.isArray(org.entitlements) || org.entitlements.some((e) => typeof e !== "string"))) {
          errors.push({
            path: `organizations[${index}].entitlements`,
            message: "entitlements must be an array of strings if provided",
            value: org.entitlements
          });
        }
        if (org.domains) {
          if (!Array.isArray(org.domains)) {
            errors.push({
              path: `organizations[${index}].domains`,
              message: "domains must be an array if provided",
              value: org.domains
            });
          } else {
            org.domains.forEach((domain, dIndex) => {
              if (!domain.domain || typeof domain.domain !== "string") {
                errors.push({
                  path: `organizations[${index}].domains[${dIndex}].domain`,
                  message: "domain is required and must be a string",
                  value: domain.domain
                });
              }
              if (domain.state && !["verified", "pending"].includes(domain.state)) {
                errors.push({
                  path: `organizations[${index}].domains[${dIndex}].state`,
                  message: 'state must be "verified" or "pending" if provided',
                  value: domain.state
                });
              }
            });
          }
        }
        if (org.memberships) {
          if (!Array.isArray(org.memberships)) {
            errors.push({
              path: `organizations[${index}].memberships`,
              message: "memberships must be an array if provided",
              value: org.memberships
            });
          } else {
            const liveMemberEmails = /* @__PURE__ */ new Set();
            org.memberships.forEach((membership, mIndex) => {
              const legacyUserId = membership.user_id;
              const memberEmail = seedEmail(membership.email);
              if (!memberEmail.ok) {
                if (legacyUserId !== void 0) {
                  errors.push({
                    path: `organizations[${index}].memberships[${mIndex}].user_id`,
                    message: "memberships reference seeded users by email \u2014 use `email` (seeded user ids are generated at startup, so a user_id literal can never resolve)",
                    value: legacyUserId
                  });
                } else {
                  errors.push({
                    path: `organizations[${index}].memberships[${mIndex}].email`,
                    message: memberEmail.problem === "malformed" ? "email must be a valid email address" : "email is required and must be the email of a user defined in users",
                    value: membership.email
                  });
                }
              } else if (!userEmails.has(memberEmail.email.toLowerCase())) {
                errors.push({
                  path: `organizations[${index}].memberships[${mIndex}].email`,
                  message: "email must match a user defined in users",
                  value: membership.email
                });
              }
              if (membership.status && !["active", "inactive", "pending"].includes(membership.status)) {
                errors.push({
                  path: `organizations[${index}].memberships[${mIndex}].status`,
                  message: 'status must be "active", "inactive", or "pending" if provided',
                  value: membership.status
                });
              }
              if (memberEmail.ok && membership.status !== "inactive") {
                const key = memberEmail.email.toLowerCase();
                if (liveMemberEmails.has(key)) {
                  errors.push({
                    path: `organizations[${index}].memberships[${mIndex}].email`,
                    message: `duplicate membership for '${membership.email}' \u2014 an organization holds at most one membership per user that is not inactive`,
                    value: membership.email
                  });
                }
                liveMemberEmails.add(key);
              }
            });
          }
        }
        if (org.groups) {
          if (!Array.isArray(org.groups)) {
            errors.push({
              path: `organizations[${index}].groups`,
              message: "groups must be an array if provided",
              value: org.groups
            });
          } else {
            const orgMembershipEmails = new Set((Array.isArray(org.memberships) ? org.memberships : []).map((m) => seedEmail(m.email)).filter((r) => r.ok).map((r) => r.email.toLowerCase()));
            org.groups.forEach((group, gIndex) => {
              if (group === null || typeof group !== "object") {
                errors.push({
                  path: `organizations[${index}].groups[${gIndex}]`,
                  message: "each group must be an object",
                  value: group
                });
                return;
              }
              if (!group.name || typeof group.name !== "string") {
                errors.push({
                  path: `organizations[${index}].groups[${gIndex}].name`,
                  message: "name is required and must be a string",
                  value: group.name
                });
              }
              if (group.description !== void 0 && group.description !== null && typeof group.description !== "string") {
                errors.push({
                  path: `organizations[${index}].groups[${gIndex}].description`,
                  message: "description must be a string or null if provided",
                  value: group.description
                });
              }
              if (group.members) {
                if (!Array.isArray(group.members)) {
                  errors.push({
                    path: `organizations[${index}].groups[${gIndex}].members`,
                    message: "members must be an array of emails if provided",
                    value: group.members
                  });
                } else {
                  group.members.forEach((email, mIndex) => {
                    const memberEmail = seedEmail(email);
                    if (!memberEmail.ok) {
                      errors.push({
                        path: `organizations[${index}].groups[${gIndex}].members[${mIndex}]`,
                        message: memberEmail.problem === "malformed" ? "must be a valid email address" : "each member must be the email of a user",
                        value: email
                      });
                    } else if (!orgMembershipEmails.has(memberEmail.email.toLowerCase())) {
                      errors.push({
                        path: `organizations[${index}].groups[${gIndex}].members[${mIndex}]`,
                        message: "member email must match a membership defined in this organization's `memberships`",
                        value: email
                      });
                    }
                  });
                }
              }
            });
          }
        }
      });
      const seenOrgNames = /* @__PURE__ */ new Set();
      config.organizations.forEach((org, index) => {
        if (!org.name || typeof org.name !== "string")
          return;
        if (seenOrgNames.has(org.name)) {
          errors.push({
            path: `organizations[${index}].name`,
            message: "name must be unique across organizations",
            value: org.name
          });
        }
        seenOrgNames.add(org.name);
      });
      const seenOrgIds = /* @__PURE__ */ new Set();
      config.organizations.forEach((org, index) => {
        if (typeof org.id !== "string" || org.id.length === 0)
          return;
        if (seenOrgIds.has(org.id)) {
          errors.push({
            path: `organizations[${index}].id`,
            message: "id must be unique across organizations",
            value: org.id
          });
        }
        seenOrgIds.add(org.id);
      });
    }
  }
  if (config.connections) {
    if (!Array.isArray(config.connections)) {
      errors.push({
        path: "connections",
        message: "connections must be an array",
        value: config.connections
      });
    } else {
      config.connections.forEach((conn, index) => {
        if (!conn.name || typeof conn.name !== "string") {
          errors.push({
            path: `connections[${index}].name`,
            message: "name is required and must be a string",
            value: conn.name
          });
        }
        if (!conn.organization || typeof conn.organization !== "string") {
          errors.push({
            path: `connections[${index}].organization`,
            message: "organization is required and must be a string",
            value: conn.organization
          });
        }
        if (conn.state && !["active", "inactive", "validating"].includes(conn.state)) {
          errors.push({
            path: `connections[${index}].state`,
            message: 'state must be "active", "inactive", or "validating" if provided',
            value: conn.state
          });
        }
      });
    }
  }
  if (config.directories) {
    if (!Array.isArray(config.directories)) {
      errors.push({
        path: "directories",
        message: "directories must be an array",
        value: config.directories
      });
    } else {
      config.directories.forEach((dir, index) => {
        if (dir === null || typeof dir !== "object") {
          errors.push({
            path: `directories[${index}]`,
            message: "each directory must be an object",
            value: dir
          });
          return;
        }
        if (!dir.name || typeof dir.name !== "string") {
          errors.push({
            path: `directories[${index}].name`,
            message: "name is required and must be a string",
            value: dir.name
          });
        }
        if (!dir.organization || typeof dir.organization !== "string") {
          errors.push({
            path: `directories[${index}].organization`,
            message: "organization is required and must be a string",
            value: dir.organization
          });
        } else if (!(Array.isArray(config.organizations) ? config.organizations : []).some((org) => org !== null && typeof org === "object" && org.name === dir.organization)) {
          errors.push({
            path: `directories[${index}].organization`,
            message: `organization '${dir.organization}' is not declared in organizations`,
            value: dir.organization
          });
        }
        if (dir.state && !["linked", "unlinked", "invalid_credentials"].includes(dir.state)) {
          errors.push({
            path: `directories[${index}].state`,
            message: 'state must be "linked", "unlinked", or "invalid_credentials" if provided',
            value: dir.state
          });
        }
        for (const field of ["type", "domain", "external_key"]) {
          if (dir[field] != null && typeof dir[field] !== "string") {
            errors.push({
              path: `directories[${index}].${field}`,
              message: `${field} must be a string if provided`,
              value: dir[field]
            });
          }
        }
        const groupNames = /* @__PURE__ */ new Set();
        if (dir.groups !== void 0 && !Array.isArray(dir.groups)) {
          errors.push({
            path: `directories[${index}].groups`,
            message: "groups must be an array of names or { name, role } objects",
            value: dir.groups
          });
        } else {
          dir.groups?.forEach((entry, groupIndex) => {
            const groupName = typeof entry === "string" ? entry : entry?.name;
            if (entry === null || typeof entry !== "string" && typeof entry !== "object") {
              errors.push({
                path: `directories[${index}].groups[${groupIndex}]`,
                message: "each group must be a name or an object with a name",
                value: entry
              });
              return;
            }
            if (typeof groupName !== "string" || !groupName) {
              errors.push({
                path: `directories[${index}].groups[${groupIndex}].name`,
                message: "name is required and must be a non-empty string",
                value: groupName
              });
              return;
            }
            if (typeof entry === "object" && entry.role !== void 0 && typeof entry.role !== "string") {
              errors.push({
                path: `directories[${index}].groups[${groupIndex}].role`,
                message: "role must be a string if provided",
                value: entry.role
              });
            }
            if (groupNames.has(groupName)) {
              errors.push({
                path: `directories[${index}].groups`,
                message: `duplicate group name '${groupName}'`,
                value: groupName
              });
            }
            groupNames.add(groupName);
          });
        }
        if (dir.users !== void 0 && !Array.isArray(dir.users)) {
          errors.push({
            path: `directories[${index}].users`,
            message: "users must be an array",
            value: dir.users
          });
          return;
        }
        const userEmails2 = /* @__PURE__ */ new Set();
        dir.users?.forEach((user, userIndex) => {
          if (user === null || typeof user !== "object") {
            errors.push({
              path: `directories[${index}].users[${userIndex}]`,
              message: "each directory user must be an object",
              value: user
            });
            return;
          }
          const email = seedEmail(user.email);
          if (!email.ok) {
            errors.push({
              path: `directories[${index}].users[${userIndex}].email`,
              message: email.problem === "malformed" ? "email must be a valid email address" : "email is required and must be a string",
              value: user.email
            });
          } else if (userEmails2.has(email.email.toLowerCase())) {
            errors.push({
              path: `directories[${index}].users[${userIndex}].email`,
              message: `duplicate directory user '${user.email}'`,
              value: user.email
            });
          } else {
            userEmails2.add(email.email.toLowerCase());
          }
          if (user.state && !["active", "inactive"].includes(user.state)) {
            errors.push({
              path: `directories[${index}].users[${userIndex}].state`,
              message: 'state must be "active" or "inactive" if provided',
              value: user.state
            });
          }
          for (const field of ["first_name", "last_name", "username", "idp_id", "role"]) {
            if (user[field] != null && typeof user[field] !== "string") {
              errors.push({
                path: `directories[${index}].users[${userIndex}].${field}`,
                message: `${field} must be a string if provided`,
                value: user[field]
              });
            }
          }
          if (user.custom_attributes != null && (typeof user.custom_attributes !== "object" || Array.isArray(user.custom_attributes))) {
            errors.push({
              path: `directories[${index}].users[${userIndex}].custom_attributes`,
              message: "custom_attributes must be an object if provided",
              value: user.custom_attributes
            });
          }
          if (user.groups !== void 0 && !Array.isArray(user.groups)) {
            errors.push({
              path: `directories[${index}].users[${userIndex}].groups`,
              message: "groups must be an array of strings",
              value: user.groups
            });
            return;
          }
          user.groups?.forEach((groupName, gIndex) => {
            if (typeof groupName !== "string") {
              errors.push({
                path: `directories[${index}].users[${userIndex}].groups[${gIndex}]`,
                message: "each group must be a name",
                value: groupName
              });
              return;
            }
            if (!groupNames.has(groupName)) {
              errors.push({
                path: `directories[${index}].users[${userIndex}].groups`,
                message: `group '${groupName}' is not declared in directories[${index}].groups`,
                value: groupName
              });
            }
          });
        });
      });
    }
  }
  if (config.connectedAccounts) {
    if (!Array.isArray(config.connectedAccounts)) {
      errors.push({
        path: "connectedAccounts",
        message: "connectedAccounts must be an array",
        value: config.connectedAccounts
      });
    } else {
      const orgNames = new Set(Array.isArray(config.organizations) ? config.organizations.map((o) => o.name).filter((n) => typeof n === "string") : []);
      const seenAccounts = /* @__PURE__ */ new Set();
      config.connectedAccounts.forEach((account, index) => {
        if (account === null || typeof account !== "object") {
          errors.push({
            path: `connectedAccounts[${index}]`,
            message: "each connected account must be an object",
            value: account
          });
          return;
        }
        const email = seedEmail(account.email);
        if (!email.ok) {
          errors.push({
            path: `connectedAccounts[${index}].email`,
            message: email.problem === "malformed" ? "email must be a valid email address" : "email is required and must be the email of a user defined in users",
            value: account.email
          });
        } else if (!userEmails.has(email.email.toLowerCase())) {
          errors.push({
            path: `connectedAccounts[${index}].email`,
            message: "email must match a user defined in users",
            value: account.email
          });
        }
        if (!account.provider || typeof account.provider !== "string") {
          errors.push({
            path: `connectedAccounts[${index}].provider`,
            message: 'provider is required and must be a non-empty string (the slug requests address, e.g. "github")',
            value: account.provider
          });
        }
        if (account.organization !== void 0 && (typeof account.organization !== "string" || !orgNames.has(account.organization))) {
          errors.push({
            path: `connectedAccounts[${index}].organization`,
            message: "organization must name an organization defined in organizations",
            value: account.organization
          });
        }
        if (account.scopes !== void 0 && (!Array.isArray(account.scopes) || account.scopes.some((s) => typeof s !== "string"))) {
          errors.push({
            path: `connectedAccounts[${index}].scopes`,
            message: "scopes must be an array of strings if provided",
            value: account.scopes
          });
        }
        if (account.state && !["connected", "needs_reauthorization"].includes(account.state)) {
          errors.push({
            path: `connectedAccounts[${index}].state`,
            message: 'state must be "connected" or "needs_reauthorization" if provided \u2014 a disconnected account is a deleted one, so it cannot be seeded',
            value: account.state
          });
        }
        if (email.ok && typeof account.provider === "string" && account.provider) {
          const key = [
            email.email.toLowerCase(),
            account.provider,
            typeof account.organization === "string" ? account.organization : ""
          ].join("\0");
          if (seenAccounts.has(key)) {
            errors.push({
              path: `connectedAccounts[${index}]`,
              message: "duplicate connected account for this user, provider, and organization",
              value: { email: account.email, provider: account.provider, organization: account.organization }
            });
          }
          seenAccounts.add(key);
        }
      });
    }
  }
  if (config.roles) {
    if (!Array.isArray(config.roles)) {
      errors.push({
        path: "roles",
        message: "roles must be an array",
        value: config.roles
      });
    } else {
      config.roles.forEach((role, index) => {
        if (!role.slug || typeof role.slug !== "string") {
          errors.push({
            path: `roles[${index}].slug`,
            message: "slug is required and must be a string",
            value: role.slug
          });
        }
        if (!role.name || typeof role.name !== "string") {
          errors.push({
            path: `roles[${index}].name`,
            message: "name is required and must be a string",
            value: role.name
          });
        }
        if (role.type && !["EnvironmentRole", "OrganizationRole"].includes(role.type)) {
          errors.push({
            path: `roles[${index}].type`,
            message: 'type must be "EnvironmentRole" or "OrganizationRole" if provided',
            value: role.type
          });
        }
        if (!isValidResourceTypeSlug(role.resource_type_slug)) {
          errors.push({
            path: `roles[${index}].resource_type_slug`,
            message: "resource_type_slug must be a non-empty string if provided",
            value: role.resource_type_slug
          });
        }
      });
    }
  }
  if (config.permissions) {
    if (!Array.isArray(config.permissions)) {
      errors.push({
        path: "permissions",
        message: "permissions must be an array",
        value: config.permissions
      });
    } else {
      config.permissions.forEach((perm, index) => {
        if (!perm.slug || typeof perm.slug !== "string") {
          errors.push({
            path: `permissions[${index}].slug`,
            message: "slug is required and must be a string",
            value: perm.slug
          });
        }
        if (!perm.name || typeof perm.name !== "string") {
          errors.push({
            path: `permissions[${index}].name`,
            message: "name is required and must be a string",
            value: perm.name
          });
        }
        if (!isValidResourceTypeSlug(perm.resource_type_slug)) {
          errors.push({
            path: `permissions[${index}].resource_type_slug`,
            message: "resource_type_slug must be a non-empty string if provided",
            value: perm.resource_type_slug
          });
        }
      });
    }
  }
  if (config.webhookEndpoints) {
    if (!Array.isArray(config.webhookEndpoints)) {
      errors.push({
        path: "webhookEndpoints",
        message: "webhookEndpoints must be an array",
        value: config.webhookEndpoints
      });
    } else {
      config.webhookEndpoints.forEach((endpoint, index) => {
        const url = endpoint.endpoint_url || endpoint.url;
        if (!url || typeof url !== "string") {
          errors.push({
            path: `webhookEndpoints[${index}].endpoint_url`,
            message: "endpoint_url is required and must be a string",
            value: url
          });
        } else {
          try {
            new URL(url);
          } catch {
            errors.push({
              path: `webhookEndpoints[${index}].endpoint_url`,
              message: "endpoint_url must be a valid URL",
              value: url
            });
          }
        }
        if (endpoint.events && !Array.isArray(endpoint.events)) {
          errors.push({
            path: `webhookEndpoints[${index}].events`,
            message: "events must be an array if provided",
            value: endpoint.events
          });
        }
        if (endpoint.secret !== void 0 && (typeof endpoint.secret !== "string" || !endpoint.secret)) {
          errors.push({
            path: `webhookEndpoints[${index}].secret`,
            message: "secret must be a non-empty string if provided",
            value: endpoint.secret
          });
        }
      });
    }
  }
  if (config.invitations) {
    if (!Array.isArray(config.invitations)) {
      errors.push({
        path: "invitations",
        message: "invitations must be an array",
        value: config.invitations
      });
    } else {
      config.invitations.forEach((inv, index) => {
        const email = seedEmail(inv.email);
        if (!email.ok) {
          errors.push({
            path: `invitations[${index}].email`,
            message: email.problem === "malformed" ? (
              // As POST /user_management/invitations now answers: acceptance resolves the
              // recipient by this address, so a typo is an invitation that enrolls nobody.
              "email must be a valid email address"
            ) : "email is required and must be a string",
            value: inv.email
          });
        }
      });
    }
  }
  if (config.connectApplications) {
    if (!Array.isArray(config.connectApplications)) {
      errors.push({
        path: "connectApplications",
        message: "connectApplications must be an array",
        value: config.connectApplications
      });
    } else {
      config.connectApplications.forEach((appConfig, index) => {
        if (!appConfig.name || typeof appConfig.name !== "string") {
          errors.push({
            path: `connectApplications[${index}].name`,
            message: "name is required and must be a string",
            value: appConfig.name
          });
        }
        if (appConfig.type && !["m2m", "oauth"].includes(appConfig.type)) {
          errors.push({
            path: `connectApplications[${index}].type`,
            message: 'type must be "m2m" or "oauth" if provided',
            value: appConfig.type
          });
        }
        const type = appConfig.type ?? "m2m";
        if (appConfig.is_first_party !== void 0 && typeof appConfig.is_first_party !== "boolean") {
          errors.push({
            path: `connectApplications[${index}].is_first_party`,
            message: "is_first_party must be a boolean if provided",
            value: appConfig.is_first_party
          });
        }
        if (appConfig.uses_pkce !== void 0 && typeof appConfig.uses_pkce !== "boolean") {
          errors.push({
            path: `connectApplications[${index}].uses_pkce`,
            message: "uses_pkce must be a boolean if provided",
            value: appConfig.uses_pkce
          });
        }
        const needsOrganization = type === "m2m" || appConfig.is_first_party === false;
        if (needsOrganization && (!appConfig.organization || typeof appConfig.organization !== "string")) {
          errors.push({
            path: `connectApplications[${index}].organization`,
            message: type === "m2m" ? "organization is required for m2m applications" : "organization is required when is_first_party is false",
            value: appConfig.organization
          });
        }
        if (appConfig.scopes !== void 0 && (!Array.isArray(appConfig.scopes) || !appConfig.scopes.every((s) => typeof s === "string"))) {
          errors.push({
            path: `connectApplications[${index}].scopes`,
            message: "scopes must be an array of strings if provided",
            value: appConfig.scopes
          });
        }
        if (appConfig.audience !== void 0 && typeof appConfig.audience !== "string") {
          errors.push({
            path: `connectApplications[${index}].audience`,
            message: "audience must be a string if provided",
            value: appConfig.audience
          });
        }
        if (appConfig.login_url != null && typeof appConfig.login_url !== "string") {
          errors.push({
            path: `connectApplications[${index}].login_url`,
            message: "login_url must be a string if provided",
            value: appConfig.login_url
          });
        }
      });
      const seenClientIds = /* @__PURE__ */ new Set();
      config.connectApplications.forEach((appConfig, index) => {
        if (!appConfig.client_id)
          return;
        if (seenClientIds.has(appConfig.client_id)) {
          errors.push({
            path: `connectApplications[${index}].client_id`,
            message: "client_id must be unique across connectApplications",
            value: appConfig.client_id
          });
        }
        seenClientIds.add(appConfig.client_id);
      });
    }
  }
  if (config.apiKeys && Array.isArray(config.apiKeys)) {
    config.apiKeys.forEach((keyConfig, index) => {
      if (!keyConfig.name || typeof keyConfig.name !== "string") {
        errors.push({
          path: `apiKeys[${index}].name`,
          message: "name is required and must be a string",
          value: keyConfig.name
        });
      }
      if (!keyConfig.organization && !keyConfig.user_id) {
        errors.push({
          path: `apiKeys[${index}].organization`,
          message: "organization or user_id is required"
        });
      }
      if (keyConfig.user_id && !keyConfig.organization) {
        errors.push({
          path: `apiKeys[${index}].organization`,
          message: "organization is required when user_id is set (supplies organization_id)"
        });
      }
      if (keyConfig.value !== void 0 && (typeof keyConfig.value !== "string" || !keyConfig.value.startsWith("sk_"))) {
        errors.push({
          path: `apiKeys[${index}].value`,
          message: 'value must be a string starting with "sk_" if provided',
          value: keyConfig.value
        });
      }
      if (keyConfig.permissions && !Array.isArray(keyConfig.permissions)) {
        errors.push({
          path: `apiKeys[${index}].permissions`,
          message: "permissions must be an array if provided",
          value: keyConfig.permissions
        });
      }
    });
    const seenKeyValues = /* @__PURE__ */ new Set();
    config.apiKeys.forEach((keyConfig, index) => {
      if (typeof keyConfig.value !== "string" || keyConfig.value.length === 0)
        return;
      if (seenKeyValues.has(keyConfig.value)) {
        errors.push({
          path: `apiKeys[${index}].value`,
          message: "value must be unique across apiKeys",
          value: keyConfig.value
        });
      }
      seenKeyValues.add(keyConfig.value);
    });
  }
  if (config.featureFlags) {
    if (!Array.isArray(config.featureFlags)) {
      errors.push({
        path: "featureFlags",
        message: "featureFlags must be an array",
        value: config.featureFlags
      });
    } else {
      const orgNames = new Set(Array.isArray(config.organizations) ? config.organizations.map((o) => o.name).filter((n) => typeof n === "string") : []);
      const seenSlugs = /* @__PURE__ */ new Set();
      const seenFlagIds = /* @__PURE__ */ new Set();
      config.featureFlags.forEach((flag, index) => {
        const at = (field) => `featureFlags[${index}].${field}`;
        if (flag === null || typeof flag !== "object" || Array.isArray(flag)) {
          errors.push({ path: `featureFlags[${index}]`, message: "each feature flag must be an object", value: flag });
          return;
        }
        if (flag.id !== void 0) {
          if (typeof flag.id !== "string" || !PINNED_ID_PATTERN.test(flag.id)) {
            errors.push({
              path: at("id"),
              message: "id must be a string of letters, numbers, hyphens or underscores if provided",
              value: flag.id
            });
          } else if (seenFlagIds.has(flag.id)) {
            errors.push({ path: at("id"), message: "id must be unique across featureFlags", value: flag.id });
          } else {
            seenFlagIds.add(flag.id);
          }
        }
        if (!flag.slug || typeof flag.slug !== "string") {
          errors.push({ path: at("slug"), message: "slug is required and must be a string", value: flag.slug });
        } else if (encodeURIComponent(flag.slug) !== flag.slug) {
          errors.push({
            path: at("slug"),
            message: "slug must be URL-safe (no spaces, slashes or characters that need percent-encoding)",
            value: flag.slug
          });
        } else if (seenSlugs.has(flag.slug)) {
          errors.push({ path: at("slug"), message: "slug must be unique across featureFlags", value: flag.slug });
        } else {
          seenSlugs.add(flag.slug);
        }
        for (const field of ["enabled", "default_value"]) {
          if (flag[field] !== void 0 && typeof flag[field] !== "boolean") {
            errors.push({ path: at(field), message: `${field} must be a boolean if provided`, value: flag[field] });
          }
        }
        if (flag.tags !== void 0 && (!Array.isArray(flag.tags) || !flag.tags.every((t) => typeof t === "string"))) {
          errors.push({ path: at("tags"), message: "tags must be an array of strings if provided", value: flag.tags });
        }
        if (flag.name !== void 0 && typeof flag.name !== "string") {
          errors.push({ path: at("name"), message: "name must be a string if provided", value: flag.name });
        }
        if (flag.description !== void 0 && flag.description !== null && typeof flag.description !== "string") {
          errors.push({
            path: at("description"),
            message: "description must be a string or null if provided",
            value: flag.description
          });
        }
        if (flag.owner !== void 0 && flag.owner !== null) {
          const ownerEmail = seedEmail(flag.owner.email);
          if (!ownerEmail.ok) {
            errors.push({
              path: at("owner.email"),
              message: ownerEmail.problem === "malformed" ? "owner.email must be a valid email address" : "owner.email is required and must be a string",
              value: flag.owner.email
            });
          }
          for (const part of ["first_name", "last_name"]) {
            const value = flag.owner[part];
            if (value !== void 0 && value !== null && typeof value !== "string") {
              errors.push({
                path: at(`owner.${part}`),
                message: `owner.${part} must be a string or null if provided`,
                value
              });
            }
          }
        }
        const targets = flag.targets;
        if (targets !== void 0 && (typeof targets !== "object" || targets === null || Array.isArray(targets))) {
          errors.push({ path: at("targets"), message: "targets must be an object if provided", value: targets });
          return;
        }
        for (const field of ["users", "organizations"]) {
          const value = targets?.[field];
          if (value !== void 0 && !Array.isArray(value)) {
            errors.push({
              path: at(`targets.${field}`),
              message: `targets.${field} must be an array if provided`,
              value
            });
          }
        }
        const targetUsers = Array.isArray(targets?.users) ? targets.users : [];
        const targetOrgs = Array.isArray(targets?.organizations) ? targets.organizations : [];
        const seenTargetUsers = /* @__PURE__ */ new Set();
        targetUsers.forEach((email, i) => {
          const parsed = seedEmail(email);
          if (!parsed.ok) {
            errors.push({
              path: at(`targets.users[${i}]`),
              message: "targets.users entries must be email addresses of users defined in `users`",
              value: email
            });
            return;
          }
          const normalized = parsed.email.toLowerCase();
          if (!userEmails.has(normalized)) {
            errors.push({
              path: at(`targets.users[${i}]`),
              message: "targets.users references an email not defined in `users`",
              value: email
            });
          } else if (seenTargetUsers.has(normalized)) {
            errors.push({
              path: at(`targets.users[${i}]`),
              message: "targets.users lists the same user twice",
              value: email
            });
          } else {
            seenTargetUsers.add(normalized);
          }
        });
        const seenTargetOrgs = /* @__PURE__ */ new Set();
        targetOrgs.forEach((name, i) => {
          if (typeof name !== "string") {
            errors.push({
              path: at(`targets.organizations[${i}]`),
              message: "targets.organizations entries must be names of organizations defined in `organizations`",
              value: name
            });
            return;
          }
          if (!orgNames.has(name)) {
            errors.push({
              path: at(`targets.organizations[${i}]`),
              message: "targets.organizations references a name not defined in `organizations`",
              value: name
            });
          } else if (seenTargetOrgs.has(name)) {
            errors.push({
              path: at(`targets.organizations[${i}]`),
              message: "targets.organizations lists the same organization twice",
              value: name
            });
          } else {
            seenTargetOrgs.add(name);
          }
        });
      });
    }
  }
  if (config.agentBlueprints) {
    if (!Array.isArray(config.agentBlueprints)) {
      errors.push({
        path: "agentBlueprints",
        message: "agentBlueprints must be an array",
        value: config.agentBlueprints
      });
    } else {
      const orgNames = new Set(Array.isArray(config.organizations) ? config.organizations.map((o) => o.name).filter((n) => typeof n === "string") : []);
      const permissionSlugs = new Set(Array.isArray(config.permissions) ? config.permissions.map((p) => p.slug).filter((s) => typeof s === "string") : []);
      const roleSlugs = new Set(Array.isArray(config.roles) ? config.roles.map((r) => r.slug).filter((s) => typeof s === "string") : []);
      const seenNames = /* @__PURE__ */ new Set();
      const seenIds = /* @__PURE__ */ new Set();
      config.agentBlueprints.forEach((blueprint, index) => {
        const at = (field) => `agentBlueprints[${index}].${field}`;
        if (blueprint === null || typeof blueprint !== "object" || Array.isArray(blueprint)) {
          errors.push({
            path: `agentBlueprints[${index}]`,
            message: "each agent blueprint must be an object",
            value: blueprint
          });
          return;
        }
        if (blueprint.id !== void 0) {
          if (typeof blueprint.id !== "string" || !PINNED_ID_PATTERN.test(blueprint.id)) {
            errors.push({
              path: at("id"),
              message: "id must be a string of letters, numbers, hyphens or underscores if provided",
              value: blueprint.id
            });
          } else if (seenIds.has(blueprint.id)) {
            errors.push({ path: at("id"), message: "id must be unique across agentBlueprints", value: blueprint.id });
          } else {
            seenIds.add(blueprint.id);
          }
        }
        if (typeof blueprint.name !== "string" || blueprint.name.length === 0 || blueprint.name.length > 255) {
          errors.push({
            path: at("name"),
            message: "name is required and must be a string of 1 to 255 characters",
            value: blueprint.name
          });
        } else if (seenNames.has(blueprint.name)) {
          errors.push({
            path: at("name"),
            message: "name must be unique across agentBlueprints",
            value: blueprint.name
          });
        } else {
          seenNames.add(blueprint.name);
        }
        if (blueprint.description !== void 0 && (typeof blueprint.description !== "string" || blueprint.description.length === 0 || blueprint.description.length > 1e3)) {
          errors.push({
            path: at("description"),
            message: "description must be a string of 1 to 1000 characters if provided",
            value: blueprint.description
          });
        }
        if (blueprint.permissions !== void 0) {
          if (!Array.isArray(blueprint.permissions) || blueprint.permissions.length > 1e3) {
            errors.push({
              path: at("permissions"),
              message: "permissions must be an array of at most 1000 permission slugs if provided",
              value: blueprint.permissions
            });
          } else {
            blueprint.permissions.forEach((slug, i) => {
              if (typeof slug !== "string" || !permissionSlugs.has(slug)) {
                errors.push({
                  path: at(`permissions[${i}]`),
                  message: "permissions references a slug not defined in `permissions`",
                  value: slug
                });
              }
            });
          }
        }
        const invocableBy = blueprint.invocable_by;
        if (invocableBy !== void 0) {
          if (typeof invocableBy !== "object" || invocableBy === null || Array.isArray(invocableBy)) {
            errors.push({
              path: at("invocable_by"),
              message: "invocable_by must be an object if provided",
              value: invocableBy
            });
          } else {
            if (invocableBy.role_slugs !== void 0) {
              if (!Array.isArray(invocableBy.role_slugs) || invocableBy.role_slugs.length > 100) {
                errors.push({
                  path: at("invocable_by.role_slugs"),
                  message: "invocable_by.role_slugs must be an array of at most 100 role slugs if provided",
                  value: invocableBy.role_slugs
                });
              } else {
                invocableBy.role_slugs.forEach((slug, i) => {
                  if (typeof slug !== "string" || !roleSlugs.has(slug)) {
                    errors.push({
                      path: at(`invocable_by.role_slugs[${i}]`),
                      message: "invocable_by.role_slugs references a slug not defined in `roles`",
                      value: slug
                    });
                  }
                });
              }
            }
            if (invocableBy.organizations !== void 0) {
              if (!Array.isArray(invocableBy.organizations) || invocableBy.organizations.length > 1e3) {
                errors.push({
                  path: at("invocable_by.organizations"),
                  message: "invocable_by.organizations must be an array of at most 1000 organization names if provided",
                  value: invocableBy.organizations
                });
              } else {
                invocableBy.organizations.forEach((name, i) => {
                  if (typeof name !== "string" || !orgNames.has(name)) {
                    errors.push({
                      path: at(`invocable_by.organizations[${i}]`),
                      message: "invocable_by.organizations references a name not defined in `organizations`",
                      value: name
                    });
                  }
                });
              }
            }
          }
        }
        const settings = blueprint.session_settings;
        if (settings !== void 0) {
          if (typeof settings !== "object" || settings === null || Array.isArray(settings)) {
            errors.push({
              path: at("session_settings"),
              message: "session_settings must be an object if provided",
              value: settings
            });
          } else {
            for (const key of Object.keys(AGENT_SESSION_SETTING_LIMITS)) {
              const value = settings[key];
              const max = AGENT_SESSION_SETTING_LIMITS[key];
              if (value === void 0) {
                errors.push({
                  path: at(`session_settings.${key}`),
                  message: `session_settings.${key} is required when session_settings is provided`,
                  value
                });
              } else if (!Number.isInteger(value) || value <= 0 || value > max) {
                errors.push({
                  path: at(`session_settings.${key}`),
                  message: `session_settings.${key} must be a positive integer of at most ${max}`,
                  value
                });
              }
            }
          }
        }
      });
    }
  }
  if (config.jwtTemplate !== void 0) {
    if (typeof config.jwtTemplate !== "object" || config.jwtTemplate === null) {
      errors.push({
        path: "jwtTemplate",
        message: "must be an object with a content field",
        value: config.jwtTemplate
      });
    } else {
      for (const problem of validateJwtTemplateContent(config.jwtTemplate.content)) {
        errors.push({ path: "jwtTemplate.content", message: problem, value: config.jwtTemplate.content });
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function formatValidationErrors(errors) {
  return errors.map((error2) => {
    const valueStr = error2.value !== void 0 ? ` (got: ${JSON.stringify(error2.value)})` : "";
    return `  - ${error2.path}: ${error2.message}${valueStr}`;
  }).join("\n");
}

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/workos/index.js
function seedFromConfig(store, _baseUrl, config) {
  const validation = validateSeedConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid seed configuration:
${formatValidationErrors(validation.errors)}`);
  }
  const ws = getWorkOSStore(store);
  if (config.users) {
    for (const userConfig of config.users) {
      const user = ws.users.insert({
        object: "user",
        id: userConfig.id,
        // Trimmed, as both routes that create users store it: a padded seed would otherwise be
        // written under a spelling no lookup by email resolves. validateSeedConfig normalizes the
        // same way, so what it cross-referenced is what lands here.
        email: userConfig.email.trim(),
        name: userConfig.name ?? null,
        first_name: userConfig.first_name ?? null,
        last_name: userConfig.last_name ?? null,
        email_verified: userConfig.email_verified ?? false,
        profile_picture_url: null,
        last_sign_in_at: null,
        external_id: userConfig.external_id ?? null,
        metadata: userConfig.metadata ?? {},
        locale: null,
        password_hash: userConfig.password ? hashPassword(userConfig.password) : null,
        impersonator: userConfig.impersonator ?? null,
        oauth_provider: userConfig.oauth_provider ?? null
      });
      if (userConfig.oauth_provider) {
        linkOAuthIdentity(ws, user.id, userConfig.oauth_provider, userConfig.oauth_idp_id ?? `idp_${generateId("usr")}`);
      }
      if (userConfig.totp) {
        ws.authFactors.insert({
          object: "authentication_factor",
          user_id: user.id,
          type: "totp",
          totp: newTotp("WorkOS Emulator", user.email)
        });
      }
    }
  }
  if (config.organizations) {
    for (const orgConfig of config.organizations) {
      const org = ws.organizations.insert({
        object: "organization",
        id: orgConfig.id,
        name: orgConfig.name,
        external_id: orgConfig.external_id ?? null,
        metadata: orgConfig.metadata ?? {},
        stripe_customer_id: null,
        allow_profiles_outside_organization: orgConfig.allow_profiles_outside_organization ?? false,
        entitlements: orgConfig.entitlements ?? []
      });
      syncOrganizationResource(ws, org);
      if (orgConfig.domains) {
        for (const dd of orgConfig.domains) {
          ws.organizationDomains.insert({
            object: "organization_domain",
            organization_id: org.id,
            domain: dd.domain,
            state: dd.state ?? "pending",
            verification_strategy: "manual",
            verification_token: generateVerificationToken(),
            verification_prefix: "workos-verify"
          });
        }
      }
      if (orgConfig.memberships) {
        for (const mm of orgConfig.memberships) {
          const memberUser = findUserByEmail(ws, mm.email);
          if (!memberUser) {
            throw new Error(`Seed membership references unknown user '${mm.email}' (organization '${orgConfig.name}')`);
          }
          ws.organizationMemberships.insert({
            object: "organization_membership",
            organization_id: org.id,
            user_id: memberUser.id,
            role: { slug: mm.role ?? "member" },
            status: mm.status ?? "active",
            external_id: null,
            metadata: {}
          });
        }
      }
      if (orgConfig.groups) {
        for (const gg of orgConfig.groups) {
          const group = ws.groups.insert({
            object: "group",
            organization_id: org.id,
            name: gg.name,
            description: gg.description ?? null
          });
          if (gg.members) {
            for (const memberEmail of gg.members) {
              const memberUser = findUserByEmail(ws, memberEmail);
              if (!memberUser) {
                throw new Error(`Seed group '${gg.name}' references unknown user '${memberEmail}' (organization '${orgConfig.name}')`);
              }
              const membership = ws.organizationMemberships.findBy("organization_id", org.id).find((m) => m.user_id === memberUser.id);
              if (!membership) {
                throw new Error(`Seed group '${gg.name}' member '${memberEmail}' has no membership in organization '${orgConfig.name}'`);
              }
              ws.groupMemberships.insert({
                group_id: group.id,
                organization_membership_id: membership.id
              });
            }
          }
        }
      }
    }
  }
  if (config.connections) {
    for (const connConfig of config.connections) {
      const org = ws.organizations.findOneBy("name", connConfig.organization);
      if (!org)
        continue;
      const domains = (connConfig.domains ?? []).map((d) => ({
        object: "connection_domain",
        id: generateId("conn_domain"),
        domain: d
      }));
      const conn = ws.connections.insert({
        object: "connection",
        organization_id: org.id,
        connection_type: connConfig.connection_type ?? "GenericSAML",
        name: connConfig.name,
        state: connConfig.state ?? "active",
        domains
      });
      if (connConfig.profiles) {
        for (const p of connConfig.profiles) {
          ws.ssoProfiles.insert({
            object: "profile",
            connection_id: conn.id,
            connection_type: conn.connection_type,
            organization_id: org.id,
            idp_id: p.idp_id ?? `idp_${generateId("usr")}`,
            email: p.email,
            first_name: p.first_name ?? null,
            last_name: p.last_name ?? null,
            groups: p.groups ?? [],
            raw_attributes: { email: p.email }
          });
        }
      }
    }
  }
  if (config.directories) {
    const rolesApplied = /* @__PURE__ */ new Set();
    for (const dirConfig of config.directories) {
      const org = ws.organizations.findOneBy("name", dirConfig.organization);
      if (!org)
        continue;
      const directory = ws.directories.insert({
        object: "directory",
        organization_id: org.id,
        name: dirConfig.name,
        domain: dirConfig.domain ?? null,
        type: dirConfig.type ?? "generic scim v2.0",
        state: dirConfig.state ?? "linked",
        external_key: dirConfig.external_key ?? null
      });
      const groupsByName = /* @__PURE__ */ new Map();
      const roleByGroupName = /* @__PURE__ */ new Map();
      const declaredGroups = [];
      for (const entry of dirConfig.groups ?? []) {
        const groupName = typeof entry === "string" ? entry : entry.name;
        const mappedRole = typeof entry === "string" ? void 0 : entry.role;
        declaredGroups.push(groupName);
        if (mappedRole)
          roleByGroupName.set(groupName, mappedRole);
        groupsByName.set(groupName, ws.directoryGroups.insert({
          object: "directory_group",
          directory_id: directory.id,
          organization_id: org.id,
          idp_id: `idp_${generateId("dir_grp")}`,
          name: groupName,
          raw_attributes: {}
        }));
      }
      const roleForGroups = (memberOf) => {
        const mapped = declaredGroups.find((name) => memberOf.includes(name) && roleByGroupName.has(name));
        return mapped ? roleByGroupName.get(mapped) : void 0;
      };
      for (const u of dirConfig.users ?? []) {
        const role = u.role ?? roleForGroups(u.groups ?? []);
        const memberships = (u.groups ?? []).map((groupName) => {
          const group = groupsByName.get(groupName);
          if (!group) {
            throw new Error(`Seed directory '${dirConfig.name}' user '${u.email}' references unknown group '${groupName}'`);
          }
          return { object: "directory_group", id: group.id, name: group.name };
        });
        ws.directoryUsers.insert({
          object: "directory_user",
          directory_id: directory.id,
          organization_id: org.id,
          idp_id: u.idp_id ?? `idp_${generateId("dir_usr")}`,
          first_name: u.first_name ?? null,
          last_name: u.last_name ?? null,
          email: u.email.trim(),
          username: u.username ?? null,
          state: u.state ?? "active",
          role: role ? { slug: role } : null,
          custom_attributes: u.custom_attributes ?? {},
          raw_attributes: { email: u.email.trim() },
          groups: memberships
        });
        const authKitUser = findUserByEmail(ws, u.email);
        const membership = authKitUser ? liveMembershipFor(ws, org.id, authKitUser.id) : void 0;
        if (membership) {
          const updates = {};
          if (!membership.directory_managed)
            updates.directory_managed = true;
          if (role && !rolesApplied.has(membership.id)) {
            rolesApplied.add(membership.id);
            updates.role = { slug: role };
          }
          if (Object.keys(updates).length > 0)
            ws.organizationMemberships.update(membership.id, updates);
        }
      }
    }
  }
  if (config.pipeConnections) {
    for (const pc of config.pipeConnections) {
      ws.pipeConnections.insert({
        object: "pipe_connection",
        user_id: pc.user_id,
        provider: pc.provider,
        scopes: pc.scopes,
        status: pc.status ?? "connected",
        external_account_id: pc.external_account_id ?? null
      });
    }
  }
  if (config.connectedAccounts) {
    for (const ca of config.connectedAccounts) {
      const user = findUserByEmail(ws, ca.email);
      if (!user)
        continue;
      const org = ca.organization ? ws.organizations.findOneBy("name", ca.organization) : void 0;
      if (ca.organization && !org)
        continue;
      ws.connectedAccounts.insert({
        object: "connected_account",
        user_id: user.id,
        organization_id: org?.id ?? null,
        provider: ca.provider,
        data_integration_id: dataIntegrationIdFor(ws, ca.provider),
        scopes: ca.scopes ?? [],
        auth_method: "oauth",
        api_key_last_4: null,
        state: ca.state ?? "connected",
        access_token: null,
        refresh_token: null,
        token_expires_at: null
      });
    }
  }
  if (config.permissions) {
    for (const permConfig of config.permissions) {
      ws.permissions.insert({
        object: "permission",
        slug: permConfig.slug,
        name: permConfig.name,
        description: permConfig.description ?? null,
        resource_type_slug: permConfig.resource_type_slug ?? DEFAULT_RESOURCE_TYPE_SLUG
      });
    }
  }
  if (config.roles) {
    for (const roleConfig of config.roles) {
      const role = ws.roles.insert({
        object: "role",
        slug: roleConfig.slug,
        name: roleConfig.name,
        description: roleConfig.description ?? null,
        type: roleConfig.type ?? "EnvironmentRole",
        organization_id: roleConfig.organization_id ?? null,
        is_default_role: roleConfig.is_default_role ?? false,
        priority: roleConfig.priority ?? 0,
        resource_type_slug: roleConfig.resource_type_slug ?? DEFAULT_RESOURCE_TYPE_SLUG
      });
      if (roleConfig.permissions) {
        for (const permSlug of roleConfig.permissions) {
          const perm = ws.permissions.findOneBy("slug", permSlug);
          if (perm) {
            ws.rolePermissions.insert({ role_id: role.id, permission_id: perm.id });
          }
        }
      }
    }
  }
  if (config.invitations) {
    for (const invConfig of config.invitations) {
      const token = generateVerificationToken();
      ws.invitations.insert({
        object: "invitation",
        email: invConfig.email.trim(),
        state: "pending",
        token,
        accept_invitation_url: `${_baseUrl}/user_management/invitations/accept?token=${token}`,
        organization_id: invConfig.organization_id ?? null,
        inviter_user_id: invConfig.inviter_user_id ?? null,
        role_slug: invConfig.role_slug ?? null,
        expires_at: expiresIn(72 * 60),
        accepted_at: null,
        revoked_at: null,
        accepted_user_id: null
      });
    }
  }
  if (config.webhookEndpoints) {
    for (const whConfig of config.webhookEndpoints) {
      const endpointUrl = whConfig.endpoint_url ?? whConfig.url;
      if (!endpointUrl || typeof endpointUrl !== "string") {
        throw new Error("workos seed config: webhookEndpoints[].endpoint_url is required");
      }
      ws.webhookEndpoints.insert({
        object: "webhook_endpoint",
        endpoint_url: endpointUrl,
        secret: whConfig.secret ?? randomBytes3(32).toString("hex"),
        enabled: whConfig.enabled !== false,
        events: whConfig.events ?? [],
        description: null
      });
    }
  }
  if (config.connectApplications) {
    for (const appConfig of config.connectApplications) {
      const type = appConfig.type ?? "m2m";
      const isFirstParty = appConfig.is_first_party ?? true;
      const org = appConfig.organization ? ws.organizations.findOneBy("name", appConfig.organization) : void 0;
      if ((type === "m2m" || !isFirstParty) && !org) {
        throw new Error(`workos seed config: connectApplications[].organization not found: ${JSON.stringify(appConfig.organization)}`);
      }
      const application = ws.connectApplications.insert({
        object: "connect_application",
        name: appConfig.name,
        description: appConfig.description ?? null,
        application_type: type,
        organization_id: org?.id ?? null,
        scopes: appConfig.scopes ?? [],
        audience: appConfig.audience ?? null,
        redirect_uris: appConfig.redirect_uris ?? [],
        is_first_party: isFirstParty,
        // Seeding is the dashboard's stand-in, and dynamic client registration is a runtime
        // act no seed file performs.
        was_dynamically_registered: false,
        uses_pkce: appConfig.uses_pkce ?? false,
        login_url: appConfig.login_url ?? null,
        client_id: appConfig.client_id ?? generateClientId(),
        logo_url: null
      });
      const secretValue = appConfig.client_secret ?? `secret_${generateVerificationToken()}`;
      ws.clientSecrets.insert({
        object: "connect_application_secret",
        application_id: application.id,
        value: secretValue,
        secret_hint: secretValue.slice(-4),
        last_used_at: null
      });
    }
  }
  if (Array.isArray(config.apiKeys)) {
    const authMap = store.getData(STORE_KEYS.apiKeyMap) ?? {};
    for (const keyConfig of config.apiKeys) {
      const value = keyConfig.value ?? `sk_test_${generateVerificationToken()}`;
      const environment = keyConfig.environment ?? (value.startsWith("sk_live_") ? "production" : "test");
      const org = keyConfig.organization ? ws.organizations.findOneBy("name", keyConfig.organization) : void 0;
      if (keyConfig.organization && !org) {
        throw new Error(`workos seed config: apiKeys[].organization not found: ${JSON.stringify(keyConfig.organization)}`);
      }
      const owner = keyConfig.user_id ? { type: "user", id: keyConfig.user_id, organization_id: org?.id ?? "" } : { type: "organization", id: org?.id ?? "" };
      const expiresAt = keyConfig.expires_at ?? null;
      ws.apiKeyRecords.insert({
        object: "api_key",
        name: keyConfig.name,
        key: value,
        environment,
        owner,
        permissions: keyConfig.permissions ?? [],
        last_used_at: null,
        expires_at: expiresAt
      });
      authMap[value] = { environment, expiresAt };
    }
    store.setData(STORE_KEYS.apiKeyMap, authMap);
  }
  if (config.featureFlags) {
    for (const flagConfig of config.featureFlags) {
      const flag = ws.featureFlags.insert({
        object: "feature_flag",
        id: flagConfig.id,
        slug: flagConfig.slug,
        name: flagConfig.name ?? flagConfig.slug,
        description: flagConfig.description ?? null,
        owner: flagConfig.owner ? {
          // Trimmed, as seeded user emails are: the validator cross-references the trimmed
          // form, so storing the padded one would serve an address it never checked.
          email: flagConfig.owner.email.trim(),
          first_name: flagConfig.owner.first_name ?? null,
          last_name: flagConfig.owner.last_name ?? null
        } : null,
        tags: flagConfig.tags ?? [],
        enabled: flagConfig.enabled !== false,
        default_value: flagConfig.default_value ?? false
      });
      const targeted = /* @__PURE__ */ new Set();
      const addTarget = (resourceId, resourceType) => {
        if (targeted.has(resourceId))
          return;
        targeted.add(resourceId);
        ws.flagTargets.insert({
          object: "flag_target",
          flag_slug: flag.slug,
          resource_id: resourceId,
          resource_type: resourceType,
          enabled: true
        });
      };
      for (const email of flagConfig.targets?.users ?? []) {
        const user = findUserByEmail(ws, email);
        if (!user) {
          throw new Error(`workos seed config: featureFlags[${JSON.stringify(flagConfig.slug)}].targets.users not found: ${JSON.stringify(email)}`);
        }
        addTarget(user.id, "user");
      }
      for (const name of flagConfig.targets?.organizations ?? []) {
        const org = ws.organizations.findOneBy("name", name);
        if (!org) {
          throw new Error(`workos seed config: featureFlags[${JSON.stringify(flagConfig.slug)}].targets.organizations not found: ${JSON.stringify(name)}`);
        }
        addTarget(org.id, "organization");
      }
    }
  }
  if (config.agentBlueprints) {
    for (const blueprintConfig of config.agentBlueprints) {
      const organizationIds = (blueprintConfig.invocable_by?.organizations ?? []).map((name) => {
        const org = ws.organizations.findOneBy("name", name);
        if (!org) {
          throw new Error(`workos seed config: agentBlueprints[${JSON.stringify(blueprintConfig.name)}].invocable_by.organizations not found: ${JSON.stringify(name)}`);
        }
        return org.id;
      });
      ws.agentBlueprints.insert({
        object: "agent_blueprint",
        id: blueprintConfig.id,
        name: blueprintConfig.name,
        description: blueprintConfig.description ?? null,
        permissions: [...new Set(blueprintConfig.permissions ?? [])],
        invocable_by: {
          role_slugs: [...new Set(blueprintConfig.invocable_by?.role_slugs ?? [])],
          organization_ids: [...new Set(organizationIds)]
        },
        session_settings: blueprintConfig.session_settings ?? { ...DEFAULT_AGENT_SESSION_SETTINGS }
      });
    }
  }
  if (config.jwtTemplate) {
    const problems = validateJwtTemplateContent(config.jwtTemplate.content);
    if (problems.length > 0) {
      throw new Error(`workos seed config: jwtTemplate.content is invalid: ${problems.join("; ")}`);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    store.setData(STORE_KEYS.jwtTemplate, {
      object: "jwt_template",
      content: config.jwtTemplate.content,
      created_at: now,
      updated_at: now
    });
  }
}
var workosPlugin = {
  name: "workos",
  register(ctx) {
    organizationRoutes(ctx);
    organizationDomainRoutes(ctx);
    membershipRoutes(ctx);
    groupRoutes(ctx);
    userRoutes(ctx);
    emailVerificationRoutes(ctx);
    passwordResetRoutes(ctx);
    magicAuthRoutes(ctx);
    authFactorRoutes(ctx);
    sessionRoutes(ctx);
    authRoutes(ctx);
    connectionRoutes(ctx);
    ssoRoutes(ctx);
    pipeRoutes(ctx);
    connectedAccountRoutes(ctx);
    invitationRoutes(ctx);
    configRoutes(ctx);
    userFeatureRoutes(ctx);
    widgetRoutes(ctx);
    authorizationRoleRoutes(ctx);
    authorizationPermissionRoutes(ctx);
    authorizationOrgRoleRoutes(ctx);
    authorizationResourceRoutes(ctx);
    authorizationCheckRoutes(ctx);
    portalRoutes(ctx);
    legacyMfaRoutes(ctx);
    apiKeyRoutes(ctx);
    vaultRoutes(ctx);
    radarRoutes(ctx);
    connectRoutes(ctx);
    clientApiRoutes(ctx);
    oauthRoutes(ctx);
    standaloneConnectRoutes(ctx);
    directoryRoutes(ctx);
    auditLogRoutes(ctx);
    featureFlagRoutes(ctx);
    agentRoutes(ctx);
    dataIntegrationRoutes(ctx);
    webhookEndpointRoutes(ctx);
    eventRoutes(ctx);
    const webhookRetryConfig = ctx.store.getData("webhookRetryConfig");
    const webhookDebugMode = ctx.store.getData("webhookDebugMode") ?? false;
    const eventBus = new EventBus(ctx.store, {
      retryConfig: webhookRetryConfig,
      debugMode: webhookDebugMode
    });
    ctx.store.setData(STORE_KEYS.eventBus, eventBus);
    const ws = getWorkOSStore(ctx.store);
    ws.users.setHooks({
      onInsert: (u) => eventBus.emit({ event: EVENTS.userCreated, data: formatUser(u) }),
      onUpdate: (u) => eventBus.emit({ event: EVENTS.userUpdated, data: formatUser(u) }),
      onDelete: (u) => eventBus.emit({ event: EVENTS.userDeleted, data: formatUser(u) })
    });
    const organizationEvent = (event) => (o) => eventBus.emit({ event, data: formatOrganization(o, ws), organization_id: o.id });
    ws.organizations.setHooks({
      onInsert: organizationEvent(EVENTS.organizationCreated),
      onUpdate: organizationEvent(EVENTS.organizationUpdated),
      onDelete: organizationEvent(EVENTS.organizationDeleted)
    });
    ws.organizationDomains.setHooks({
      onInsert: (d) => eventBus.emit({ event: EVENTS.organizationDomainCreated, data: formatDomain(d) }),
      onUpdate: (d) => eventBus.emit({
        event: d.state === "verified" ? EVENTS.organizationDomainVerified : EVENTS.organizationDomainUpdated,
        data: formatDomain(d)
      }),
      onDelete: (d) => eventBus.emit({ event: EVENTS.organizationDomainDeleted, data: formatDomain(d) })
    });
    ws.organizationMemberships.setHooks({
      onInsert: (m) => eventBus.emit({ event: EVENTS.organizationMembershipCreated, data: formatMembershipEvent(m) }),
      onUpdate: (m) => eventBus.emit({ event: EVENTS.organizationMembershipUpdated, data: formatMembershipEvent(m) }),
      onDelete: (m) => eventBus.emit({ event: EVENTS.organizationMembershipDeleted, data: formatMembershipEvent(m) })
    });
    ws.groups.setHooks({
      onInsert: (g) => eventBus.emit({ event: EVENTS.groupCreated, data: formatGroup(g) }),
      onUpdate: (g) => eventBus.emit({ event: EVENTS.groupUpdated, data: formatGroup(g) }),
      onDelete: (g) => eventBus.emit({ event: EVENTS.groupDeleted, data: formatGroup(g) })
    });
    ws.groupMemberships.setHooks({
      onInsert: (gm) => eventBus.emit({
        event: EVENTS.groupMemberAdded,
        data: { group_id: gm.group_id, organization_membership_id: gm.organization_membership_id },
        organization_id: ws.groups.get(gm.group_id)?.organization_id ?? null
      }),
      onDelete: (gm) => eventBus.emit({
        event: EVENTS.groupMemberRemoved,
        data: { group_id: gm.group_id, organization_membership_id: gm.organization_membership_id },
        organization_id: ws.groups.get(gm.group_id)?.organization_id ?? null
      })
    });
    const connectedAccountEvent = (state) => state === "connected" ? EVENTS.pipesConnectedAccountConnected : EVENTS.pipesConnectedAccountReauthorizationNeeded;
    ws.connectedAccounts.setHooks({
      onInsert: (a) => eventBus.emit({ event: connectedAccountEvent(a.state), data: formatConnectedAccountEvent(a) }),
      onUpdate: (a, prev) => {
        if (a.state === prev.state)
          return;
        eventBus.emit({ event: connectedAccountEvent(a.state), data: formatConnectedAccountEvent(a) });
      },
      onDelete: (a) => eventBus.emit({
        event: EVENTS.pipesConnectedAccountDisconnected,
        data: formatConnectedAccountEvent(a, "disconnected")
      })
    });
    ws.connections.setHooks({
      // The spec has no connection.created/updated — only activation state transitions
      onInsert: (c) => {
        if (c.state === "active")
          eventBus.emit({ event: EVENTS.connectionActivated, data: formatConnection(c) });
      },
      onUpdate: (c, prev) => {
        if (c.state === prev.state)
          return;
        if (c.state === "active") {
          eventBus.emit({ event: EVENTS.connectionActivated, data: formatConnection(c) });
        } else if (c.state === "inactive") {
          eventBus.emit({ event: EVENTS.connectionDeactivated, data: formatConnection(c) });
        }
      },
      onDelete: (c) => eventBus.emit({ event: EVENTS.connectionDeleted, data: formatConnection(c) })
    });
    ws.sessions.setHooks({
      onInsert: (s) => eventBus.emit({ event: EVENTS.sessionCreated, data: formatSession(s) }),
      onDelete: (s) => {
        eventBus.emit({ event: EVENTS.sessionRevoked, data: formatSession(s) });
        revokeAgentSessionsForUserSession(ws, s.id);
      }
    });
    ws.invitations.setHooks({
      onInsert: (i) => eventBus.emit({ event: EVENTS.invitationCreated, data: formatInvitation(i) })
    });
    ws.emailVerifications.setHooks({
      onInsert: (ev) => eventBus.emit({ event: EVENTS.emailVerificationCreated, data: formatEmailVerification(ev) })
    });
    ws.magicAuths.setHooks({
      onInsert: (ma) => eventBus.emit({ event: EVENTS.magicAuthCreated, data: formatMagicAuth(ma) })
    });
    ws.passwordResets.setHooks({
      onInsert: (pr) => eventBus.emit({ event: EVENTS.passwordResetCreated, data: formatPasswordReset(pr) })
    });
    ws.roles.setHooks({
      onInsert: (r) => eventBus.emit({
        event: r.type === "OrganizationRole" ? EVENTS.organizationRoleCreated : EVENTS.roleCreated,
        data: formatRole(r, ws)
      }),
      onUpdate: (r) => eventBus.emit({
        event: r.type === "OrganizationRole" ? EVENTS.organizationRoleUpdated : EVENTS.roleUpdated,
        data: formatRole(r, ws)
      }),
      onDelete: (r) => {
        const data = formatRole(r, ws);
        if (r.type === "OrganizationRole") {
          eventBus.emit({ event: EVENTS.organizationRoleDeleted, data });
        } else {
          delete data.permissions;
          eventBus.emit({ event: EVENTS.roleDeleted, data });
        }
      }
    });
    ws.permissions.setHooks({
      onInsert: (p) => eventBus.emit({ event: EVENTS.permissionCreated, data: formatPermission(p) }),
      onUpdate: (p) => eventBus.emit({ event: EVENTS.permissionUpdated, data: formatPermission(p) }),
      onDelete: (p) => eventBus.emit({ event: EVENTS.permissionDeleted, data: formatPermission(p) })
    });
    ws.directories.setHooks({
      // The spec has no dsync.updated — only activation and deletion. Activation is what
      // `linked` means: a directory seeded `unlinked` or `invalid_credentials` has not
      // activated, the same way an inactive connection does not announce itself.
      onInsert: (d) => {
        if (d.state === "linked")
          eventBus.emit({ event: EVENTS.dsyncActivated, data: formatDirectory(d) });
      },
      onDelete: (d) => eventBus.emit({ event: EVENTS.dsyncDeleted, data: formatDirectory(d) })
    });
    const emitDirectoryGroupMembership = (user, groupId, added) => {
      const group = ws.directoryGroups.get(groupId);
      eventBus.emit({
        event: added ? EVENTS.dsyncGroupUserAdded : EVENTS.dsyncGroupUserRemoved,
        data: {
          directory_id: user.directory_id,
          user: formatDirectoryUser(user),
          group: group ? formatDirectoryGroup(group) : { object: "directory_group", id: groupId }
        },
        organization_id: user.organization_id
      });
    };
    ws.directoryUsers.setHooks({
      onInsert: (u) => {
        eventBus.emit({ event: EVENTS.dsyncUserCreated, data: formatDirectoryUser(u) });
        for (const group of u.groups)
          emitDirectoryGroupMembership(u, group.id, true);
      },
      onUpdate: (u, previous) => {
        eventBus.emit({ event: EVENTS.dsyncUserUpdated, data: formatDirectoryUser(u) });
        const before = new Set(previous.groups.map((group) => group.id));
        const after = new Set(u.groups.map((group) => group.id));
        for (const groupId of after)
          if (!before.has(groupId))
            emitDirectoryGroupMembership(u, groupId, true);
        for (const groupId of before)
          if (!after.has(groupId))
            emitDirectoryGroupMembership(u, groupId, false);
      },
      onDelete: (u) => {
        for (const group of u.groups)
          emitDirectoryGroupMembership(u, group.id, false);
        eventBus.emit({ event: EVENTS.dsyncUserDeleted, data: formatDirectoryUser(u) });
      }
    });
    ws.directoryGroups.setHooks({
      onInsert: (g) => eventBus.emit({ event: EVENTS.dsyncGroupCreated, data: formatDirectoryGroup(g) }),
      onUpdate: (g) => eventBus.emit({ event: EVENTS.dsyncGroupUpdated, data: formatDirectoryGroup(g) }),
      onDelete: (g) => eventBus.emit({ event: EVENTS.dsyncGroupDeleted, data: formatDirectoryGroup(g) })
    });
    ws.apiKeyRecords.setHooks({
      onInsert: (k) => eventBus.emit({ event: EVENTS.apiKeyCreated, data: formatApiKeyRecord(k) }),
      onUpdate: (k) => eventBus.emit({ event: EVENTS.apiKeyUpdated, data: formatApiKeyRecord(k) }),
      onDelete: (k) => eventBus.emit({ event: EVENTS.apiKeyRevoked, data: formatApiKeyRecord(k) })
    });
    const flagEvent = (event) => (f) => {
      const environmentId = environmentIdFor();
      eventBus.emit({
        event,
        data: formatFeatureFlagEvent(f, environmentId),
        environment_id: environmentId,
        context: flagEventContext()
      });
    };
    ws.featureFlags.setHooks({
      onInsert: flagEvent(EVENTS.flagCreated),
      onUpdate: flagEvent(EVENTS.flagUpdated),
      onDelete: flagEvent(EVENTS.flagDeleted)
    });
    ws.agentBlueprints.setHooks({
      onInsert: (b) => eventBus.emit({ event: EVENTS.agentBlueprintCreated, data: formatAgentBlueprint(b) }),
      onUpdate: (b) => eventBus.emit({ event: EVENTS.agentBlueprintUpdated, data: formatAgentBlueprint(b) }),
      onDelete: (b) => eventBus.emit({ event: EVENTS.agentBlueprintDeleted, data: formatAgentBlueprint(b) })
    });
    ws.agentInstances.setHooks({
      onInsert: (i) => eventBus.emit({ event: EVENTS.agentInstanceCreated, data: formatAgentInstance(i) }),
      onDelete: (i) => eventBus.emit({ event: EVENTS.agentInstanceDeleted, data: formatAgentInstance(i) })
    });
    ws.agentInstanceSessions.setHooks({
      onInsert: (s) => {
        const instance = ws.agentInstances.get(s.agent_instance_id);
        if (!instance)
          return;
        eventBus.emit({
          event: EVENTS.agentInstanceSessionCreated,
          data: formatAgentInstanceSessionEvent(s, instance.organization_id, { permissionSlugs: s.permissions })
        });
      },
      onUpdate: (s, prev) => {
        if (s.revoked_at === null || prev.revoked_at !== null)
          return;
        const instance = ws.agentInstances.get(s.agent_instance_id);
        if (!instance)
          return;
        eventBus.emit({
          event: EVENTS.agentInstanceSessionRevoked,
          data: formatAgentInstanceSessionEvent(s, instance.organization_id)
        });
      }
    });
    ws.webhookEndpoints.setHooks({
      onInsert: () => eventBus.rebuildIndex(),
      onUpdate: () => eventBus.rebuildIndex(),
      onDelete: () => eventBus.rebuildIndex()
    });
  },
  seed(_store, _baseUrl) {
  }
};

// ../../node_modules/.pnpm/@hono+node-server@2.1.3_hono@4.13.12/node_modules/@hono/node-server/dist/constants-BLSFu_RU.mjs
var X_ALREADY_SENT = "x-hono-already-sent";

// ../../node_modules/.pnpm/@hono+node-server@2.1.3_hono@4.13.12/node_modules/@hono/node-server/dist/index.mjs
import { STATUS_CODES, ServerResponse, createServer as createServer2 } from "http";
import { Http2ServerRequest, constants } from "http2";
import { Readable } from "stream";

// ../../node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/helper/websocket/index.js
var defineWebSocketHelper = (handler) => {
  return ((...args) => {
    if (typeof args[0] === "function") {
      const [createEvents, options] = args;
      return async function upgradeWebSocket2(c, next) {
        const result = await handler(c, await createEvents(c), options);
        if (result) return result;
        await next();
      };
    } else {
      const [c, events, options] = args;
      return (async () => {
        const upgraded = await handler(c, events, options);
        if (!upgraded) throw new Error("Failed to upgrade WebSocket");
        return upgraded;
      })();
    }
  });
};

// ../../node_modules/.pnpm/@hono+node-server@2.1.3_hono@4.13.12/node_modules/@hono/node-server/dist/index.mjs
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var nonJoinedHeaders = /* @__PURE__ */ new Set([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "server",
  "user-agent"
]);
var validHeaderName = /^[!#$%&'*+\-.^_`|~\dA-Za-z]+$/;
var isHttpWhitespace = (code) => code === 9 || code === 10 || code === 13 || code === 32;
var normalizeHeaderValue = (value) => {
  if (!isHttpWhitespace(value.charCodeAt(0)) && !isHttpWhitespace(value.charCodeAt(value.length - 1))) return value;
  let start = 0;
  let end = value.length;
  while (start < end && isHttpWhitespace(value.charCodeAt(start))) start++;
  while (end > start && isHttpWhitespace(value.charCodeAt(end - 1))) end--;
  return value.slice(start, end);
};
var forbiddenHeaderValue = /[\0\r\n]/;
var GlobalHeaders = globalThis.Headers;
var materializeHeaders = (rawHeaders, HeadersCtor = GlobalHeaders) => {
  const headers = new HeadersCtor();
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const name = rawHeaders[i];
    if (!name.startsWith(":")) headers.append(name, rawHeaders[i + 1]);
  }
  return headers;
};
var RequestHeaders = class {
  #incoming;
  #rawHeaders;
  #headers;
  #invalidValue;
  constructor(incoming) {
    this.#incoming = incoming;
    if (incoming instanceof Http2ServerRequest) this.#rawHeaders = incoming.rawHeaders.slice();
  }
  get #lazyRawHeaders() {
    return this.#rawHeaders ??= this.#incoming.rawHeaders.slice();
  }
  get #native() {
    if (!this.#headers) {
      this.#headers = materializeHeaders(this.#lazyRawHeaders);
      this.#rawHeaders = void 0;
    }
    return this.#headers;
  }
  #normalizedName(name) {
    if (typeof name !== "string") return;
    if (!validHeaderName.test(name)) throw new TypeError(`Invalid header name: ${name}`);
    return name.toLowerCase();
  }
  #lookupHttp1(lowerName) {
    const headers = this.#incoming instanceof Http2ServerRequest ? void 0 : this.#incoming.headers;
    if (!headers || nonJoinedHeaders.has(lowerName) || lowerName === "set-cookie" || lowerName === "__proto__") return;
    if (!Object.hasOwn(headers, lowerName)) return null;
    const rawValue = headers[lowerName];
    if (typeof rawValue === "string") {
      const value = normalizeHeaderValue(rawValue);
      return forbiddenHeaderValue.test(value) ? void 0 : value;
    }
  }
  #lookup(rawHeaders, lowerName) {
    const separator = lowerName === "cookie" ? "; " : ", ";
    let value = null;
    for (let i = 0; i < rawHeaders.length; i += 2) {
      const rawName = rawHeaders[i];
      if (rawName.length === lowerName.length && rawName.toLowerCase() === lowerName) {
        const rawValue = normalizeHeaderValue(rawHeaders[i + 1]);
        if (forbiddenHeaderValue.test(rawValue)) {
          this.#invalidValue = true;
          return;
        }
        value = value === null ? rawValue : value + separator + rawValue;
      }
    }
    return value;
  }
  append(name, value) {
    this.#native.append(name, value);
  }
  delete(name) {
    this.#native.delete(name);
  }
  get(name) {
    const lowerName = this.#normalizedName(name);
    if (lowerName && !this.#headers && !this.#invalidValue) {
      const http1Value = this.#lookupHttp1(lowerName);
      if (http1Value !== void 0) return http1Value;
      const value = this.#lookup(this.#lazyRawHeaders, lowerName);
      if (value !== void 0) return value;
    }
    return this.#native.get(name);
  }
  has(name) {
    const lowerName = this.#normalizedName(name);
    if (lowerName && !this.#headers && !this.#invalidValue) {
      const http1Value = this.#lookupHttp1(lowerName);
      if (http1Value !== void 0) return http1Value !== null;
      const value = this.#lookup(this.#lazyRawHeaders, lowerName);
      if (value !== void 0) return value !== null;
    }
    return this.#native.has(name);
  }
  set(name, value) {
    this.#native.set(name, value);
  }
  getSetCookie() {
    return this.#native.getSetCookie();
  }
  keys() {
    return this.#native.keys();
  }
  values() {
    return this.#native.values();
  }
  entries() {
    return this.#native.entries();
  }
  forEach(callback, thisArg) {
    this.#native.forEach((value, key) => {
      callback.call(thisArg, value, key, this);
    });
  }
  [Symbol.iterator]() {
    return this.entries();
  }
};
Object.defineProperty(RequestHeaders.prototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Headers (lightweight) ${inspectFn(Object.fromEntries(this), {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(RequestHeaders.prototype, GlobalHeaders.prototype);
var newHeadersFromIncoming = (incoming) => globalThis.Headers === GlobalHeaders ? new RequestHeaders(incoming) : materializeHeaders(incoming.rawHeaders, globalThis.Headers);
var reValidRequestUrl = /^\/[!#$&-;=?-\[\]_a-z~]*$/;
var reDotSegment = /\/\.\.?(?:[/?#]|$)/;
var reValidHost = /^[a-z0-9._-]+(?::(?:[1-5]\d{3,4}|[6-9]\d{3}))?$/;
var buildUrl = (scheme, host, incomingUrl) => {
  const url = `${scheme}://${host}${incomingUrl}`;
  if (!reValidHost.test(host)) {
    const urlObj = new URL(url);
    if (urlObj.hostname.length !== host.length && urlObj.hostname !== (host.includes(":") ? host.replace(/:\d+$/, "") : host).toLowerCase()) throw new RequestError("Invalid host header");
    return urlObj.href;
  } else if (incomingUrl.length === 0) return url + "/";
  else {
    if (incomingUrl.charCodeAt(0) !== 47) throw new RequestError("Invalid URL");
    if (!reValidRequestUrl.test(incomingUrl) || reDotSegment.test(incomingUrl)) return new URL(url).href;
    return url;
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) return e;
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request$1 = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      const hasReplacementBody = options !== void 0 && "body" in options && options.body != null;
      if (input[bodyConsumedDirectlyKey] && !hasReplacementBody) throw new TypeError("Cannot construct a Request with a Request object that has already been used.");
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") options.duplex ??= "half";
    super(input, options);
  }
};
var wrapBodyStream = /* @__PURE__ */ Symbol("wrapBodyStream");
var byteExactEncodings = /* @__PURE__ */ new Set([
  "latin1",
  "binary",
  "hex",
  "base64",
  "base64url"
]);
var isByteExactEncoding = (encoding) => encoding === null || byteExactEncodings.has(encoding);
var bodyBufferedBeforeDisconnectKey = /* @__PURE__ */ Symbol("bodyBufferedBeforeDisconnect");
var bodyBufferedLengthBeforeDisconnectKey = /* @__PURE__ */ Symbol("bodyBufferedLengthBeforeDisconnect");
var toBufferChunk = (chunk, encoding) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding ?? "utf8");
var isRecoverableDisconnectedIncoming = (incoming) => !(incoming instanceof Http2ServerRequest) && !!incoming.complete && !!incoming.readableAborted && typeof incoming.read === "function" && isByteExactEncoding(incoming.readableEncoding);
var recordBodyBufferedBeforeDisconnect = (incoming) => {
  if (incoming.readableDidRead || !isRecoverableDisconnectedIncoming(incoming)) return;
  const incomingWithRecovery = incoming;
  incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] ??= incoming.readableLength;
};
var readBodyBufferedBeforeDisconnect = (incoming, chunks) => {
  if (incoming.readableDidRead && !chunks || !isRecoverableDisconnectedIncoming(incoming)) return;
  const incomingWithRecovery = incoming;
  if (incomingWithRecovery[bodyBufferedBeforeDisconnectKey] !== void 0) return incomingWithRecovery[bodyBufferedBeforeDisconnectKey];
  let result;
  const errored = incoming.errored;
  if (errored && errored.code !== "ECONNRESET") result = errored;
  else if (incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] !== void 0 && incoming.readableLength !== incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey]) result = newBodyUnusableError();
  else {
    const bodyChunks = chunks ?? [];
    const chunk = incoming.read();
    if (chunk !== null) bodyChunks.push(toBufferChunk(chunk, incoming.readableEncoding));
    const buffer = bodyChunks.length === 1 ? bodyChunks[0] : Buffer.concat(bodyChunks);
    result = buffer;
    const contentLength = incoming.headers["content-length"];
    if (typeof contentLength === "string" && /^\d+$/.test(contentLength)) {
      const expectedLength = Number(contentLength);
      if (Number.isSafeInteger(expectedLength) && buffer.length !== expectedLength) result = newBodyUnusableError();
    }
  }
  incomingWithRecovery[bodyBufferedBeforeDisconnectKey] = result;
  return result;
};
var enqueueBufferedBody = (controller, buffered) => {
  if (buffered instanceof Error) {
    controller.error(buffered);
    return;
  }
  if (buffered.length > 0) controller.enqueue(buffered);
  controller.close();
};
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
  const init = {
    method,
    headers,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request$1(url, init);
    Object.defineProperty(req, "method", { get() {
      return "TRACE";
    } });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) init.body = new ReadableStream({ start(controller) {
    controller.enqueue(incoming.rawBody);
    controller.close();
  } });
  else if (incoming[wrapBodyStream]) {
    let reader;
    init.body = new ReadableStream({ async pull(controller) {
      try {
        if (!reader) {
          const buffered = readBodyBufferedBeforeDisconnect(incoming);
          if (buffered !== void 0) {
            enqueueBufferedBody(controller, buffered);
            return;
          }
        }
        reader ||= Readable.toWeb(incoming).getReader();
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error2) {
        controller.error(error2);
      }
    } });
  } else {
    const buffered = readBodyBufferedBeforeDisconnect(incoming);
    if (buffered !== void 0) init.body = new ReadableStream({ start(controller) {
      enqueueBufferedBody(controller, buffered);
    } });
    else init.body = Readable.toWeb(incoming);
  }
  return new Request$1(url, init);
};
var getRequestCache = /* @__PURE__ */ Symbol("getRequestCache");
var requestCache = /* @__PURE__ */ Symbol("requestCache");
var incomingKey = /* @__PURE__ */ Symbol("incomingKey");
var urlKey = /* @__PURE__ */ Symbol("urlKey");
var methodKey = /* @__PURE__ */ Symbol("methodKey");
var headersKey = /* @__PURE__ */ Symbol("headersKey");
var abortControllerKey = /* @__PURE__ */ Symbol("abortControllerKey");
var getAbortController = /* @__PURE__ */ Symbol("getAbortController");
var abortRequest = /* @__PURE__ */ Symbol("abortRequest");
var bodyBufferKey = /* @__PURE__ */ Symbol("bodyBuffer");
var bodyReadPromiseKey = /* @__PURE__ */ Symbol("bodyReadPromise");
var bodyConsumedDirectlyKey = /* @__PURE__ */ Symbol("bodyConsumedDirectly");
var bodyLockReaderKey = /* @__PURE__ */ Symbol("bodyLockReader");
var abortReasonKey = /* @__PURE__ */ Symbol("abortReason");
var newBodyUnusableError = () => {
  return /* @__PURE__ */ new TypeError("Body is unusable");
};
var rejectBodyUnusable = () => {
  return Promise.reject(newBodyUnusableError());
};
var textDecoder = new TextDecoder();
var consumeBodyDirectOnce = (request) => {
  if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  request[bodyConsumedDirectlyKey] = true;
};
var toArrayBuffer = (buf) => {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
};
var contentType = (request) => {
  return (request[headersKey] ||= newHeadersFromIncoming(request[incomingKey])).get("content-type") || "";
};
var methodTokenRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var normalizeIncomingMethod = (method) => {
  if (typeof method !== "string" || method.length === 0) return "GET";
  switch (method) {
    case "DELETE":
    case "GET":
    case "HEAD":
    case "OPTIONS":
    case "PATCH":
    case "POST":
    case "PUT":
    case "QUERY":
      return method;
  }
  const upper = method.toUpperCase();
  switch (upper) {
    case "DELETE":
    case "GET":
    case "HEAD":
    case "OPTIONS":
    case "POST":
    case "PUT":
      return upper;
    default:
      return method;
  }
};
var validateDirectReadMethod = (method) => {
  if (!methodTokenRegExp.test(method)) return /* @__PURE__ */ new TypeError(`'${method}' is not a valid HTTP method.`);
  const normalized = method.toUpperCase();
  if (normalized === "CONNECT" || normalized === "TRACK" || normalized === "TRACE" && method !== "TRACE") return /* @__PURE__ */ new TypeError(`'${method}' HTTP method is unsupported.`);
};
var readBodyWithFastPath = (request, method, fromBuffer) => {
  if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  const methodName = request.method;
  if (methodName === "GET" || methodName === "HEAD") return request[getRequestCache]()[method]();
  const methodValidationError = validateDirectReadMethod(methodName);
  if (methodValidationError) return Promise.reject(methodValidationError);
  if (request[requestCache]) {
    if (methodName !== "TRACE") return request[requestCache][method]();
  }
  const alreadyUsedError = consumeBodyDirectOnce(request);
  if (alreadyUsedError) return alreadyUsedError;
  const raw2 = readRawBodyIfAvailable(request);
  if (raw2) {
    const result = Promise.resolve(fromBuffer(raw2, request));
    request[bodyBufferKey] = void 0;
    return result;
  }
  return readBodyDirect(request).then((buf) => {
    const result = fromBuffer(buf, request);
    request[bodyBufferKey] = void 0;
    return result;
  });
};
var readRawBodyIfAvailable = (request) => {
  const incoming = request[incomingKey];
  if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) return incoming.rawBody;
};
var normalizeAbortError = (request, incoming) => {
  if (incoming.errored) return incoming.errored;
  const reason = request[abortReasonKey];
  if (reason !== void 0) return reason instanceof Error ? reason : new Error(String(reason));
  return /* @__PURE__ */ new Error("Client connection prematurely closed.");
};
var readBodyDirect = (request) => {
  if (request[bodyBufferKey]) return Promise.resolve(request[bodyBufferKey]);
  if (request[bodyReadPromiseKey]) return request[bodyReadPromiseKey];
  const incoming = request[incomingKey];
  if (incoming.readableDidRead) return rejectBodyUnusable();
  const buffered = readBodyBufferedBeforeDisconnect(incoming);
  if (buffered !== void 0) {
    if (buffered instanceof Error) return Promise.reject(buffered);
    request[bodyBufferKey] = buffered;
    return Promise.resolve(buffered);
  }
  const promise = new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };
    const recoverCompleteBodyAfterDisconnect = (error2) => {
      const streamError = incoming.errored ?? error2;
      if (!isRecoverableDisconnectedIncoming(incoming) || streamError && streamError.code !== "ECONNRESET") return false;
      finish(() => {
        const recovered = readBodyBufferedBeforeDisconnect(incoming, chunks);
        if (recovered instanceof Error) reject(recovered);
        else if (recovered === void 0) reject(error2 ?? normalizeAbortError(request, incoming));
        else {
          request[bodyBufferKey] = recovered;
          resolve(recovered);
        }
      });
      return true;
    };
    const onData = (chunk) => {
      chunks.push(toBufferChunk(chunk, incoming.readableEncoding));
    };
    const onEnd = () => {
      finish(() => {
        const buffer = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
        request[bodyBufferKey] = buffer;
        resolve(buffer);
      });
    };
    const onError = (error2) => {
      if (recoverCompleteBodyAfterDisconnect(error2)) return;
      finish(() => {
        reject(error2);
      });
    };
    const onClose = () => {
      if (incoming.readableEnded) {
        onEnd();
        return;
      }
      if (recoverCompleteBodyAfterDisconnect()) return;
      finish(() => {
        reject(normalizeAbortError(request, incoming));
      });
    };
    const cleanup = () => {
      incoming.off("data", onData);
      incoming.off("end", onEnd);
      incoming.off("error", onError);
      incoming.off("close", onClose);
      request[bodyReadPromiseKey] = void 0;
    };
    incoming.on("data", onData);
    incoming.on("end", onEnd);
    incoming.on("error", onError);
    incoming.on("close", onClose);
    queueMicrotask(() => {
      if (settled) return;
      if (incoming.readableEnded) onEnd();
      else if (incoming.errored) onError(incoming.errored);
      else if (incoming.destroyed) onClose();
    });
  });
  request[bodyReadPromiseKey] = promise;
  return promise;
};
var requestPrototype = {
  get method() {
    return this[methodKey];
  },
  get url() {
    return this[urlKey];
  },
  get headers() {
    return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
  },
  [abortRequest](reason) {
    if (this[abortReasonKey] === void 0) this[abortReasonKey] = reason;
    const abortController = this[abortControllerKey];
    if (abortController && !abortController.signal.aborted) abortController.abort(reason);
  },
  [getAbortController]() {
    this[abortControllerKey] ||= new AbortController();
    if (this[abortReasonKey] !== void 0 && !this[abortControllerKey].signal.aborted) this[abortControllerKey].abort(this[abortReasonKey]);
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    const abortController = this[getAbortController]();
    if (this[requestCache]) return this[requestCache];
    const method = this.method;
    if (this[bodyConsumedDirectlyKey] && !(method === "GET" || method === "HEAD")) {
      this[bodyBufferKey] = void 0;
      const init = {
        method: method === "TRACE" ? "GET" : method,
        headers: this.headers,
        signal: abortController.signal
      };
      if (method !== "TRACE") {
        init.body = new ReadableStream({ start(c) {
          c.close();
        } });
        init.duplex = "half";
      }
      const req = new Request$1(this[urlKey], init);
      if (method === "TRACE") Object.defineProperty(req, "method", { get() {
        return "TRACE";
      } });
      return this[requestCache] = req;
    }
    return this[requestCache] = newRequestFromIncoming(this.method, this[urlKey], this.headers, this[incomingKey], abortController);
  },
  get body() {
    if (!this[bodyConsumedDirectlyKey]) return this[getRequestCache]().body;
    const request = this[getRequestCache]();
    if (!this[bodyLockReaderKey] && request.body) this[bodyLockReaderKey] = request.body.getReader();
    return request.body;
  },
  get bodyUsed() {
    if (this[bodyConsumedDirectlyKey]) return true;
    if (this[requestCache]) return this[requestCache].bodyUsed;
    return false;
  }
};
Object.defineProperty(requestPrototype, "signal", { get() {
  return this[getAbortController]().signal;
} });
[
  "cache",
  "credentials",
  "destination",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, { get() {
    return this[getRequestCache]()[k];
  } });
});
["clone", "formData"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, { value: function() {
    if (this[bodyConsumedDirectlyKey]) {
      if (k === "clone") throw newBodyUnusableError();
      return rejectBodyUnusable();
    }
    return this[getRequestCache]()[k]();
  } });
});
Object.defineProperty(requestPrototype, "text", { value: function() {
  return readBodyWithFastPath(this, "text", (buf) => textDecoder.decode(buf));
} });
Object.defineProperty(requestPrototype, "arrayBuffer", { value: function() {
  return readBodyWithFastPath(this, "arrayBuffer", (buf) => toArrayBuffer(buf));
} });
Object.defineProperty(requestPrototype, "blob", { value: function() {
  return readBodyWithFastPath(this, "blob", (buf, request) => {
    const type = contentType(request);
    const init = type ? { headers: { "content-type": type } } : void 0;
    return new Response(buf, init).blob();
  });
} });
Object.defineProperty(requestPrototype, "json", { value: function() {
  if (this[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
  return this.text().then(JSON.parse);
} });
Object.defineProperty(requestPrototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Request (lightweight) ${inspectFn({
    method: this.method,
    url: this.url,
    headers: this.headers,
    nativeRequest: this[requestCache]
  }, {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(requestPrototype, Request$1.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  req[methodKey] = normalizeIncomingMethod(incoming.method);
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof Http2ServerRequest) throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    try {
      req[urlKey] = new URL(incomingUrl).href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) throw new RequestError("Missing host header");
  let scheme;
  if (incoming instanceof Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) throw new RequestError("Unsupported scheme");
  } else scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  try {
    req[urlKey] = buildUrl(scheme, host, incomingUrl);
  } catch (e) {
    if (e instanceof RequestError) throw e;
    else throw new RequestError("Invalid URL", { cause: e });
  }
  return req;
};
var defaultContentType = "text/plain; charset=UTF-8";
var responseCache = /* @__PURE__ */ Symbol("responseCache");
var getResponseCache = /* @__PURE__ */ Symbol("getResponseCache");
var cacheKey = /* @__PURE__ */ Symbol("cache");
var GlobalResponse = global.Response;
var Response$1 = class Response$12 {
  #body;
  #init;
  [getResponseCache]() {
    const cache = this[cacheKey];
    const liveHeaders = cache && cache[2] instanceof Headers ? cache[2] : void 0;
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, liveHeaders ? {
      status: this.#init?.status,
      statusText: this.#init?.statusText,
      headers: liveHeaders
    } : this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof GlobalResponse) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      }
      this.#init = init instanceof Response$12 ? init.#init : init;
      headers = new Headers(init.headers);
    } else this.#init = init;
    if (body == null || typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) this[cacheKey] = [
      init?.status || 200,
      body ?? null,
      headers || init?.headers
    ];
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) cache[2] = new Headers(cache[2] || (cache[1] === null ? void 0 : { "content-type": defaultContentType }));
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
[
  "body",
  "bodyUsed",
  "redirected",
  "statusText",
  "trailers",
  "type",
  "url"
].forEach((k) => {
  Object.defineProperty(Response$1.prototype, k, { get() {
    return this[getResponseCache]()[k];
  } });
});
[
  "arrayBuffer",
  "blob",
  "clone",
  "formData",
  "json",
  "text"
].forEach((k) => {
  Object.defineProperty(Response$1.prototype, k, { value: function() {
    return this[getResponseCache]()[k]();
  } });
});
Object.defineProperty(Response$1.prototype, /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
  return `Response (lightweight) ${inspectFn({
    status: this.status,
    headers: this.headers,
    ok: this.ok,
    nativeResponse: this[responseCache]
  }, {
    ...options,
    depth: depth == null ? null : depth - 1
  })}`;
} });
Object.setPrototypeOf(Response$1, GlobalResponse);
Object.setPrototypeOf(Response$1.prototype, GlobalResponse.prototype);
var validRedirectUrl = /^https?:\/\/[!#-;=?-[\]_a-z~A-Z]+$/;
var parseRedirectUrl = (url) => {
  if (url instanceof URL) return url.href;
  if (validRedirectUrl.test(url)) return url;
  return new URL(url).href;
};
var validRedirectStatuses = /* @__PURE__ */ new Set([
  301,
  302,
  303,
  307,
  308
]);
Object.defineProperty(Response$1, "redirect", {
  value: function redirect(url, status = 302) {
    if (!validRedirectStatuses.has(status)) throw new RangeError("Invalid status code");
    return new Response$1(null, {
      status,
      headers: { location: parseRedirectUrl(url) }
    });
  },
  writable: true,
  configurable: true
});
Object.defineProperty(Response$1, "json", {
  value: function json(data, init) {
    const body = JSON.stringify(data);
    if (body === void 0) throw new TypeError("The data is not JSON serializable");
    const initHeaders = init?.headers;
    let headers;
    if (initHeaders) {
      headers = new Headers(initHeaders);
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
    } else headers = { "content-type": "application/json" };
    return new Response$1(body, {
      status: init?.status ?? 200,
      statusText: init?.statusText,
      headers
    });
  },
  writable: true,
  configurable: true
});
async function readWithoutBlocking(readPromise) {
  return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
  const cancel = (error2) => {
    reader.cancel(error2).catch(() => {
    });
  };
  writable.on("close", cancel);
  writable.on("error", cancel);
  (currentReadPromise ?? reader.read()).then(flow, handleStreamError);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function handleStreamError(error2) {
    if (error2) writable.destroy(error2);
  }
  function onDrain() {
    reader.read().then(flow, handleStreamError);
  }
  function flow({ done, value }) {
    try {
      if (done) writable.end();
      else if (!writable.write(value)) writable.once("drain", onDrain);
      else return reader.read().then(flow, handleStreamError);
    } catch (e) {
      handleStreamError(e);
    }
  }
}
function writeFromReadableStream(stream, writable) {
  if (stream.locked) throw new TypeError("ReadableStream is locked.");
  else if (writable.destroyed) return;
  return writeFromReadableStreamDefaultReader(stream.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers, defaultContentType2) => {
  const res = {};
  if (!(headers instanceof Headers)) headers = new Headers(headers ?? void 0);
  if (headers.has("set-cookie")) {
    const cookies = [];
    for (const [k, v] of headers) if (k === "set-cookie") cookies.push(v);
    else res[k] = v;
    if (cookies.length > 0) res["set-cookie"] = cookies;
  } else for (const [k, v] of headers) res[k] = v;
  if (defaultContentType2) res["content-type"] ??= defaultContentType2;
  return res;
};
var outgoingEnded = /* @__PURE__ */ Symbol("outgoingEnded");
var incomingDraining = /* @__PURE__ */ Symbol("incomingDraining");
var DRAIN_TIMEOUT_MS = 500;
var MAX_DRAIN_BYTES = 64 * 1024 * 1024;
var drainIncoming = (incoming) => {
  const incomingWithDrainState = incoming;
  if (incoming.destroyed || incomingWithDrainState[incomingDraining]) return;
  incomingWithDrainState[incomingDraining] = true;
  if (incoming instanceof Http2ServerRequest) {
    try {
      incoming.stream?.close?.(constants.NGHTTP2_NO_ERROR);
    } catch {
    }
    return;
  }
  let bytesRead = 0;
  const cleanup = () => {
    clearTimeout(timer);
    incoming.off("data", onData);
    incoming.off("end", cleanup);
    incoming.off("error", cleanup);
  };
  const forceClose = () => {
    cleanup();
    const socket = incoming.socket;
    if (socket && !socket.destroyed) {
      if (typeof socket.destroySoon === "function") socket.destroySoon();
      else if (typeof socket.destroy === "function") socket.destroy();
    }
  };
  const timer = setTimeout(forceClose, DRAIN_TIMEOUT_MS);
  timer.unref?.();
  const onData = (chunk) => {
    bytesRead += chunk.length;
    if (bytesRead > MAX_DRAIN_BYTES) forceClose();
  };
  incoming.on("data", onData);
  incoming.on("end", cleanup);
  incoming.on("error", cleanup);
  incoming.resume();
};
var makeCloseHandler = (req, incoming, outgoing, needsBodyCleanup) => () => {
  if (incoming.errored) {
    recordBodyBufferedBeforeDisconnect(incoming);
    req[abortRequest](incoming.errored.toString());
  } else if (!outgoing.writableFinished) {
    recordBodyBufferedBeforeDisconnect(incoming);
    req[abortRequest]("Client connection prematurely closed.");
  }
  if (needsBodyCleanup && !incoming.readableEnded) setTimeout(() => {
    if (!incoming.readableEnded) setTimeout(() => {
      drainIncoming(incoming);
    });
  });
};
var isImmediateCacheableResponse = (res) => {
  if (!(cacheKey in res)) return false;
  const body = res[cacheKey][1];
  return body === null || typeof body === "string" || body instanceof Uint8Array;
};
var handleRequestError = () => new Response(null, { status: 400 });
var handleFetchError = (e) => new Response(null, { status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500 });
var handleResponseError = (e, outgoing) => {
  const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") console.info("The user aborted a request.");
  else {
    console.error(e);
    if (!outgoing.headersSent) {
      if (outgoing instanceof ServerResponse) outgoing._contentLength = null;
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) outgoing.flushHeaders();
};
var trySetContentLength = (outgoing, status, length) => {
  const http1 = outgoing;
  if (http1._contentLength === null && http1._hasBody && http1.useChunkedEncodingByDefault && !http1._removedContLen && status >= 200 && status !== 204 && status !== 304 && !outgoing.hasHeader("content-length") && !outgoing.hasHeader("transfer-encoding") && !outgoing.hasHeader("trailer")) {
    http1._contentLength = length;
    return true;
  }
  return false;
};
var writeDefaultHeaders = (outgoing, status, length) => {
  if (trySetContentLength(outgoing, status, length)) outgoing.writeHead(status, { "Content-Type": defaultContentType });
  else outgoing.writeHead(status, {
    "Content-Type": defaultContentType,
    "Content-Length": length
  });
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  if (!header) {
    if (body === null) {
      outgoing.writeHead(status);
      outgoing.end();
    } else if (typeof body === "string") {
      writeDefaultHeaders(outgoing, status, Buffer.byteLength(body));
      outgoing.end(body);
    } else if (body instanceof Uint8Array) {
      writeDefaultHeaders(outgoing, status, body.byteLength);
      outgoing.end(body);
    } else if (body instanceof Blob) {
      writeDefaultHeaders(outgoing, status, body.size);
      outgoing.end(new Uint8Array(await body.arrayBuffer()));
    } else {
      outgoing.writeHead(status, { "Content-Type": defaultContentType });
      flushHeaders(outgoing);
      await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
    }
    outgoing[outgoingEnded]?.();
    return;
  }
  let hasContentLength = false;
  let plainHeaders = false;
  let canAutoLength = true;
  if (header instanceof Headers) {
    hasContentLength = header.has("content-length");
    header = buildOutgoingHttpHeaders(header, body === null ? void 0 : defaultContentType);
  } else if (Array.isArray(header)) {
    const headerObj = new Headers(header);
    hasContentLength = headerObj.has("content-length");
    header = buildOutgoingHttpHeaders(headerObj, body === null ? void 0 : defaultContentType);
  } else {
    plainHeaders = true;
    for (const key in header) {
      if (key.length === 14 && key.toLowerCase() === "content-length") {
        hasContentLength = true;
        break;
      }
      if (key.length === 17 && key.toLowerCase() === "transfer-encoding" || key.length === 7 && key.toLowerCase() === "trailer") canAutoLength = false;
    }
  }
  if (!hasContentLength) {
    let length;
    if (typeof body === "string") length = Buffer.byteLength(body);
    else if (body instanceof Uint8Array) length = body.byteLength;
    else if (body instanceof Blob) length = body.size;
    if (length !== void 0 && (!plainHeaders || !canAutoLength || !trySetContentLength(outgoing, status, length))) {
      if (plainHeaders) header = { ...header };
      header["Content-Length"] = length;
    }
  }
  outgoing.writeHead(status, header);
  if (body == null) outgoing.end();
  else if (typeof body === "string" || body instanceof Uint8Array) outgoing.end(body);
  else if (body instanceof Blob) outgoing.end(new Uint8Array(await body.arrayBuffer()));
  else {
    flushHeaders(outgoing);
    await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
  }
  outgoing[outgoingEnded]?.();
};
var isPromise = (res) => typeof res.then === "function";
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (isPromise(res)) if (options.errorHandler) try {
    res = await res;
  } catch (err) {
    const errRes = await options.errorHandler(err);
    if (!errRes) return;
    res = errRes;
  }
  else res = await res.catch(handleFetchError);
  if (cacheKey in res) return responseViaCache(res, outgoing);
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers, res.body === null ? void 0 : defaultContentType);
  if (res.body) {
    const reader = res.body.getReader();
    const values = [];
    let done = false;
    let currentReadPromise = void 0;
    if (resHeaderRecord["transfer-encoding"] !== "chunked") {
      let maxReadCount = 2;
      for (let i = 0; i < maxReadCount; i++) {
        currentReadPromise ||= reader.read();
        const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
          console.error(e);
          done = true;
        });
        if (!chunk) {
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve));
            maxReadCount = 3;
            continue;
          }
          break;
        }
        currentReadPromise = void 0;
        if (chunk.value) values.push(chunk.value);
        if (chunk.done) {
          done = true;
          break;
        }
      }
      if (done && !("content-length" in resHeaderRecord)) resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
    }
    outgoing.writeHead(res.status, resHeaderRecord);
    values.forEach((value) => {
      outgoing.write(value);
    });
    if (done) outgoing.end();
    else {
      if (values.length === 0) flushHeaders(outgoing);
      await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) {
  } else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
  outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
  const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
  if (options.overrideGlobalObjects !== false && global.Request !== Request$1) {
    Object.defineProperty(global, "Request", { value: Request$1 });
    Object.defineProperty(global, "Response", { value: Response$1 });
  }
  return async (incoming, outgoing) => {
    let res, req;
    let needsBodyCleanup = false;
    let closeHandlerAttached = false;
    const ensureCloseHandler = () => {
      if (!req || closeHandlerAttached) return;
      closeHandlerAttached = true;
      outgoing.on("close", makeCloseHandler(req, incoming, outgoing, needsBodyCleanup));
    };
    try {
      req = newRequest(incoming, options.hostname);
      needsBodyCleanup = autoCleanupIncoming && !(incoming.method === "GET" || incoming.method === "HEAD");
      if (needsBodyCleanup) {
        incoming[wrapBodyStream] = true;
        if (incoming instanceof Http2ServerRequest) outgoing[outgoingEnded] = () => {
          if (!incoming.readableEnded) setTimeout(() => {
            if (!incoming.readableEnded) setTimeout(() => {
              incoming.destroy();
              outgoing.destroy();
            });
          });
        };
      }
      res = fetchCallback(req, {
        incoming,
        outgoing
      });
      if (!isPromise(res) && isImmediateCacheableResponse(res)) {
        if (needsBodyCleanup && !incoming.readableEnded) outgoing.once("finish", () => {
          if (!incoming.readableEnded) drainIncoming(incoming);
        });
        return responseViaCache(res, outgoing);
      }
      ensureCloseHandler();
    } catch (e) {
      if (!res) if (options.errorHandler) {
        ensureCloseHandler();
        res = await options.errorHandler(req ? e : toRequestError(e));
        if (!res) return;
      } else if (!req) res = handleRequestError();
      else res = handleFetchError(e);
      else return handleResponseError(e, outgoing);
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};
var CloseEvent = globalThis.CloseEvent ?? class extends Event {
  #eventInitDict;
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.#eventInitDict = eventInitDict;
  }
  get wasClean() {
    return this.#eventInitDict.wasClean ?? false;
  }
  get code() {
    return this.#eventInitDict.code ?? 0;
  }
  get reason() {
    return this.#eventInitDict.reason ?? "";
  }
};
var ErrorEvent = globalThis.ErrorEvent ?? class extends Event {
  #eventInitDict;
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.#eventInitDict = eventInitDict;
  }
  get message() {
    return this.#eventInitDict.message ?? "";
  }
  get filename() {
    return this.#eventInitDict.filename ?? "";
  }
  get lineno() {
    return this.#eventInitDict.lineno ?? 0;
  }
  get colno() {
    return this.#eventInitDict.colno ?? 0;
  }
  get error() {
    return this.#eventInitDict.error ?? null;
  }
};
var generateConnectionSymbol = () => /* @__PURE__ */ Symbol("connection");
var CONNECTION_SYMBOL_KEY = /* @__PURE__ */ Symbol("CONNECTION_SYMBOL_KEY");
var WAIT_FOR_WEBSOCKET_SYMBOL = /* @__PURE__ */ Symbol("WAIT_FOR_WEBSOCKET_SYMBOL");
var responseHeadersToSkip = /* @__PURE__ */ new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "sec-websocket-accept",
  "sec-websocket-extensions",
  "sec-websocket-protocol"
]);
var appendResponseHeaders = (headers, responseHeaders) => {
  if (!responseHeaders) return;
  responseHeaders.forEach((value, key) => {
    if (responseHeadersToSkip.has(key.toLowerCase())) return;
    headers.push(`${key}: ${value}`);
  });
};
var rejectUpgradeRequest = (socket, status, responseHeaders) => {
  const responseLines = ["Connection: close", "Content-Length: 0"];
  appendResponseHeaders(responseLines, responseHeaders);
  socket.end(`HTTP/1.1 ${status.toString()} ${STATUS_CODES[status] ?? ""}\r
${responseLines.join("\r\n")}\r
\r
`);
};
var createUpgradeRequest = (request) => {
  const protocol = request.socket.encrypted ? "https" : "http";
  const url = new URL(request.url ?? "/", `${protocol}://${request.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const key in request.headers) {
    const value = request.headers[key];
    if (!value) continue;
    headers.append(key, Array.isArray(value) ? value[0] : value);
  }
  return new Request(url, { headers });
};
var setupWebSocket = (options) => {
  const { server, fetchCallback, wss } = options;
  const waiterMap = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, request) => {
    const waiter = waiterMap.get(request);
    if (waiter) {
      waiter.resolve(ws);
      waiterMap.delete(request);
    }
  });
  const rejectWaiter = (request) => {
    const waiter = waiterMap.get(request);
    if (waiter) {
      waiterMap.delete(request);
      waiter.reject(/* @__PURE__ */ new Error("WebSocket handshake aborted"));
    }
  };
  const waitForWebSocket = (request, connectionSymbol) => {
    return new Promise((resolve, reject) => {
      waiterMap.set(request, {
        resolve,
        reject,
        connectionSymbol
      });
    });
  };
  server.on("upgrade", async (request, socket, head) => {
    if (request.headers.upgrade?.toLowerCase() !== "websocket") return;
    const env = {
      incoming: request,
      outgoing: void 0,
      wss,
      [WAIT_FOR_WEBSOCKET_SYMBOL]: waitForWebSocket
    };
    let status = 400;
    let responseHeaders;
    try {
      const response = await fetchCallback(createUpgradeRequest(request), env);
      if (response instanceof Response) {
        status = response.status;
        responseHeaders = response.headers;
      }
    } catch {
      if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, 500);
      return;
    }
    const waiter = waiterMap.get(request);
    if (!waiter || waiter.connectionSymbol !== env[CONNECTION_SYMBOL_KEY]) {
      rejectWaiter(request);
      if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, status, responseHeaders);
      return;
    }
    const addResponseHeaders = (headers) => {
      appendResponseHeaders(headers, responseHeaders);
    };
    const reclaimWaiterOnClose = () => rejectWaiter(request);
    socket.once("close", reclaimWaiterOnClose);
    wss.on("headers", addResponseHeaders);
    try {
      wss.handleUpgrade(request, socket, head, (ws) => {
        socket.off("close", reclaimWaiterOnClose);
        wss.emit("connection", ws, request);
      });
    } finally {
      wss.off("headers", addResponseHeaders);
    }
  });
  server.on("close", () => {
    wss.close();
  });
};
var upgradeWebSocket = defineWebSocketHelper(async (c, events, options) => {
  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") return;
  const env = c.env;
  const waitForWebSocket = env[WAIT_FOR_WEBSOCKET_SYMBOL];
  if (!waitForWebSocket || !env.incoming) return new Response(null, { status: 500 });
  const connectionSymbol = generateConnectionSymbol();
  env[CONNECTION_SYMBOL_KEY] = connectionSymbol;
  (async () => {
    let ws;
    try {
      ws = await waitForWebSocket(env.incoming, connectionSymbol);
    } catch {
      return;
    }
    const messagesReceivedInStarting = [];
    const bufferMessage = (data, isBinary) => {
      messagesReceivedInStarting.push([data, isBinary]);
    };
    ws.on("message", bufferMessage);
    const ctx = {
      binaryType: "arraybuffer",
      close(code, reason) {
        ws.close(code, reason);
      },
      protocol: ws.protocol,
      raw: ws,
      get readyState() {
        return ws.readyState;
      },
      send(source, opts) {
        ws.send(source, { compress: opts?.compress });
      },
      url: new URL(c.req.url)
    };
    try {
      events?.onOpen?.(new Event("open"), ctx);
    } catch (e) {
      (options?.onError ?? console.error)(e);
    }
    const handleMessage = (data, isBinary) => {
      const datas = Array.isArray(data) ? data : [data];
      for (const data2 of datas) try {
        events?.onMessage?.(new MessageEvent("message", { data: isBinary ? data2 instanceof ArrayBuffer ? data2 : data2.buffer.slice(data2.byteOffset, data2.byteOffset + data2.byteLength) : typeof data2 === "string" ? data2 : Buffer.from(data2).toString("utf-8") }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    };
    ws.off("message", bufferMessage);
    for (const message of messagesReceivedInStarting) handleMessage(...message);
    ws.on("message", (data, isBinary) => {
      handleMessage(data, isBinary);
    });
    ws.on("close", (code, reason) => {
      try {
        events?.onClose?.(new CloseEvent("close", {
          code,
          reason: reason.toString()
        }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    });
    ws.on("error", (error2) => {
      try {
        events?.onError?.(new ErrorEvent("error", { error: error2 }), ctx);
      } catch (e) {
        (options?.onError ?? console.error)(e);
      }
    });
  })();
  return new Response();
});
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects,
    autoCleanupIncoming: options.autoCleanupIncoming
  });
  const server = (options.createServer || createServer2)(options.serverOptions || {}, requestListener);
  if (options.websocket && options.websocket.server) {
    if (options.websocket.server.options.noServer !== true) throw new Error("WebSocket server must be created with { noServer: true } option");
    setupWebSocket({
      server,
      fetchCallback,
      wss: options.websocket.server
    });
  }
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};

// ../../node_modules/.pnpm/@workos+emulate@0.14.0/node_modules/@workos/emulate/dist/index.js
async function createEmulator(options = {}) {
  const port = options.port ?? 4100;
  const hostname = options.hostname || "127.0.0.1";
  const baseUrl = `http://localhost:${port}`;
  const seedApiKeys = options.seed?.apiKeys;
  const apiKeys = Array.isArray(seedApiKeys) ? {} : seedApiKeys ?? { sk_test_default: { environment: "test" } };
  const initialApiKeys = { ...apiKeys };
  const { app, store, jwt, ctx } = createServer(workosPlugin, {
    port,
    baseUrl,
    apiKeys,
    issuer: options.issuer,
    signingKey: options.signingKey
  });
  const allowedRedirectHosts = normalizeRedirectHosts(options.allowedRedirectHosts ?? []);
  const applyOptionData = () => {
    if (options.interactiveAuth) {
      store.setData(STORE_KEYS.interactiveAuth, true);
      if (typeof options.interactiveAuth === "object" && options.interactiveAuth.password) {
        store.setData(STORE_KEYS.interactivePassword, true);
      }
    }
    if (allowedRedirectHosts.length > 0)
      store.setData(STORE_KEYS.allowedRedirectHosts, allowedRedirectHosts);
    if (options.webhookRetryConfig)
      store.setData("webhookRetryConfig", options.webhookRetryConfig);
    if (options.webhookDebugMode)
      store.setData("webhookDebugMode", true);
  };
  applyOptionData();
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/_emulate/hooks", (c) => c.json(getErrorHooks(store)));
  app.post("/_emulate/hooks", async (c) => {
    const body = await parseJsonBody(c);
    const method = body.method;
    const path = body.path;
    const status = body.status;
    if (!method || !path || !status) {
      return c.json({ message: "method, path, and status are required", code: "bad_request" }, 400);
    }
    const hook = addErrorHook(store, {
      method,
      path,
      status,
      body: body.body,
      count: body.count
    });
    return c.json(hook, 201);
  });
  app.delete("/_emulate/hooks/:id", (c) => {
    const removed = removeErrorHook(store, c.req.param("id"));
    if (!removed)
      return c.json({ message: "Hook not found", code: "not_found" }, 404);
    return c.body(null, 204);
  });
  const seedErrorHooks = () => {
    if (options.seed?.errorHooks) {
      for (const hook of options.seed.errorHooks) {
        addErrorHook(store, hook);
      }
    }
  };
  const seedFn = (seedBaseUrl) => {
    workosPlugin.seed?.(store, seedBaseUrl);
    if (options.seed) {
      seedFromConfig(store, seedBaseUrl, options.seed);
    }
    seedErrorHooks();
  };
  const listen = (hn, p) => new Promise((resolve, reject) => {
    const server = serve({ fetch: app.fetch, port: p, hostname: hn }, () => resolve(server));
    server.once("error", reject);
  });
  const httpServer = await listen(hostname, port);
  const addr = httpServer.address();
  const actualPort = typeof addr === "object" && addr ? addr.port : port;
  const url = `http://localhost:${actualPort}`;
  const secondaryServer = !options.hostname && hostname === "127.0.0.1" ? await listen("::1", actualPort).catch(() => void 0) : void 0;
  if (!options.issuer)
    jwt.issuer = url;
  ctx.baseUrl = url;
  seedFn(url);
  const primaryApiKey = Object.keys(apiKeys)[0];
  return {
    url,
    port: actualPort,
    apiKey: primaryApiKey,
    store,
    reset() {
      console.warn("\u26A0\uFE0F  EventBus reset limitation: Route-level authentication events (authentication.*_succeeded/failed) will not work after reset(). Resource lifecycle events (user.created, organization.created, etc.) will still work. If you need authentication events after reset, create a new emulator instance instead.");
      store.reset();
      for (const key of Object.keys(apiKeys))
        delete apiKeys[key];
      Object.assign(apiKeys, initialApiKeys);
      store.setData(STORE_KEYS.apiKeyMap, apiKeys);
      applyOptionData();
      seedFn(url);
    },
    close() {
      const closeOne = (server) => new Promise((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve());
      });
      const servers = secondaryServer ? [httpServer, secondaryServer] : [httpServer];
      return Promise.all(servers.map(closeOne)).then(() => void 0);
    },
    addErrorHook(hook) {
      return addErrorHook(store, hook);
    },
    removeErrorHook(id) {
      return removeErrorHook(store, id);
    },
    listErrorHooks() {
      return getErrorHooks(store);
    }
  };
}

// ../@emulators/workos/dist/index.js
var CONFIG_KEY = "workos.config";
var GENERATION_KEY = "workos.generation";
function seedFromConfig2(store, _baseUrl, config, _webhooks) {
  store.setData(CONFIG_KEY, config);
  store.setData(GENERATION_KEY, randomUUID2());
}
var workosPlugin2 = {
  name: "workos",
  rateLimit: false,
  register(app, store, _webhooks, baseUrl) {
    let current;
    const stop = async () => (await current?.instance.catch(() => void 0))?.close();
    const instance = async () => {
      const generation = store.getData(GENERATION_KEY);
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
        } = store.getData(CONFIG_KEY) ?? {};
        current = {
          generation,
          instance: previous.then(
            () => createEmulator({
              port: 0,
              seed,
              issuer: issuer ?? baseUrl,
              signingKey,
              allowedRedirectHosts,
              interactiveAuth
            })
          )
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
          body: method === "GET" ? void 0 : await c.req.arrayBuffer(),
          redirect: "manual"
        });
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
      });
    }
    return stop;
  },
  seed(store) {
    seedFromConfig2(store, "", {});
  }
};
var index_default = workosPlugin2;
export {
  index_default as default,
  seedFromConfig2 as seedFromConfig,
  workosPlugin2 as workosPlugin
};
//# sourceMappingURL=dist-4DSJ5MQD.js.map
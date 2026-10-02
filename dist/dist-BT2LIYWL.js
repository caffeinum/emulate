import {
  SignJWT,
  exportJWK,
  generateKeyPair
} from "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// ../@emulators/okta/dist/index.js
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
import { createHash, randomBytes } from "crypto";
var ORG_AUTH_SERVER_ID = "org";
var DEFAULT_AUTH_SERVER_ID = "default";
var DEFAULT_AUDIENCE = "api://default";
var DEFAULT_EVERYONE_GROUP_NAME = "Everyone";
var DEFAULT_EVERYONE_GROUP_ID = "00g_everyone";
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function generateOktaId(prefix) {
  const compact = randomUUID().replace(/-/g, "");
  return `${prefix}${compact.slice(0, 17)}`;
}
function normalizeStatus(status, fallback) {
  if (status === "STAGED" || status === "PROVISIONED" || status === "ACTIVE" || status === "SUSPENDED" || status === "DEPROVISIONED") {
    return status;
  }
  return fallback;
}
function normalizeAppStatus(status, fallback) {
  if (status === "ACTIVE" || status === "INACTIVE") return status;
  return fallback;
}
function normalizeAuthServerStatus(status, fallback) {
  if (status === "ACTIVE" || status === "INACTIVE") return status;
  return fallback;
}
function normalizeGroupType(type, fallback) {
  if (type === "OKTA_GROUP" || type === "BUILT_IN") return type;
  return fallback;
}
function boolFromQuery(value, fallback) {
  if (value == null) return fallback;
  const lowered = value.toLowerCase();
  if (lowered === "true" || lowered === "1") return true;
  if (lowered === "false" || lowered === "0") return false;
  return fallback;
}
function resolveOktaIssuer(baseUrl, authServerId) {
  if (authServerId === ORG_AUTH_SERVER_ID) return baseUrl;
  return `${baseUrl}/oauth2/${authServerId}`;
}
function userDisplayName(user) {
  if (user.display_name) return user.display_name;
  const combined = `${user.first_name} ${user.last_name}`.trim();
  return combined || user.login;
}
function createDefaultUser() {
  const now = nowIso();
  return {
    okta_id: generateOktaId("00u"),
    status: "ACTIVE",
    activated_at: now,
    status_changed_at: now,
    last_login_at: null,
    password_changed_at: null,
    transitioning_to_status: null,
    login: "testuser@okta.local",
    email: "testuser@okta.local",
    first_name: "Test",
    last_name: "User",
    display_name: "Test User",
    locale: "en-US",
    time_zone: "UTC"
  };
}
function createDefaultGroup() {
  return {
    okta_id: DEFAULT_EVERYONE_GROUP_ID,
    type: "BUILT_IN",
    name: DEFAULT_EVERYONE_GROUP_NAME,
    description: "All users in the organization"
  };
}
function createDefaultAuthorizationServer() {
  return {
    server_id: DEFAULT_AUTH_SERVER_ID,
    name: "default",
    description: "Default custom authorization server",
    audiences: [DEFAULT_AUDIENCE],
    status: "ACTIVE"
  };
}
function createDefaultApp() {
  return {
    okta_id: generateOktaId("0oa"),
    name: "oidc_client",
    label: "Sample OIDC App",
    status: "ACTIVE",
    sign_on_mode: "OPENID_CONNECT",
    settings: {
      oauthClient: {
        redirect_uris: ["http://localhost:3000/callback"]
      }
    },
    credentials: {}
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
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS = {
  "geist-sans.woff2": readFileSync(join(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join(__dirname, "fonts", "favicon.ico"));
function parsePagination(c) {
  const page = Math.max(1, parseInt(c.req.query("page") ?? "1", 10) || 1);
  const per_page = Math.min(100, Math.max(1, parseInt(c.req.query("per_page") ?? "30", 10) || 30));
  return { page, per_page };
}
function setLinkHeader(c, totalCount, page, perPage) {
  const lastPage = Math.max(1, Math.ceil(totalCount / perPage));
  const baseUrl = new URL(c.req.url);
  const links = [];
  const makeLink = (p, rel) => {
    baseUrl.searchParams.set("page", String(p));
    baseUrl.searchParams.set("per_page", String(perPage));
    return `<${baseUrl.toString()}>; rel="${rel}"`;
  };
  if (page < lastPage) {
    links.push(makeLink(page + 1, "next"));
    links.push(makeLink(lastPage, "last"));
  }
  if (page > 1) {
    links.push(makeLink(1, "first"));
    links.push(makeLink(page - 1, "prev"));
  }
  if (links.length > 0) {
    c.header("Link", links.join(", "));
  }
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
function renderFormPostPage(action, fields, service) {
  const hiddens = Object.entries(fields).filter(([, v]) => v != null).map(([k, v]) => `<input type="hidden" name="${escapeAttr(k)}" value="${escapeAttr(v)}"/>`).join("\n");
  return `${head("Redirecting")}
<body onload="document.forms[0].submit()">
${emuBar(service)}
<div class="content">
  <div class="content-inner" style="text-align:center">
    <div class="card-subtitle">Redirecting&hellip;</div>
    <form method="POST" action="${escapeAttr(action)}">
${hiddens}
    <noscript><button type="submit" class="user-btn" style="margin-top:12px;justify-content:center">
      <span class="user-login">Continue</span>
    </button></noscript>
    </form>
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
function createErrorBody(status, errorCode, errorSummary, errorCauses = []) {
  return {
    errorCode,
    errorSummary,
    errorLink: errorCode,
    errorId: `${errorCode}-${Date.now()}`,
    errorCauses,
    status
  };
}
function oktaError(c, status, errorCode, errorSummary, errorCauses = []) {
  const body = createErrorBody(status, errorCode, errorSummary, errorCauses);
  return c.json(body, status);
}
async function readJsonObject(c) {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object") {
      return body;
    }
    return {};
  } catch {
    return {};
  }
}
function requireManagementAuth(c, tokenMap) {
  const existing = c.get("authUser");
  if (existing) return existing;
  const authHeader = c.req.header("Authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("ssws ")) {
    const token = authHeader.slice(5).trim();
    const mapped = tokenMap?.get(token);
    if (mapped) {
      c.set("authUser", mapped);
      c.set("authToken", token);
      c.set("authScopes", mapped.scopes);
      return mapped;
    }
  }
  return oktaError(c, 401, "E0000004", "Authentication failed");
}
function findUserByRef(os, userRef) {
  const decoded = decodeURIComponent(userRef);
  return os.users.findOneBy("okta_id", decoded) ?? os.users.findOneBy("login", decoded) ?? os.users.findOneBy("email", decoded);
}
function findGroupByRef(os, groupRef) {
  const decoded = decodeURIComponent(groupRef);
  return os.groups.findOneBy("okta_id", decoded);
}
function findAppByRef(os, appRef) {
  const decoded = decodeURIComponent(appRef);
  return os.apps.findOneBy("okta_id", decoded);
}
function findAuthorizationServerByRef(os, serverRef) {
  const decoded = decodeURIComponent(serverRef);
  return os.authorizationServers.findOneBy("server_id", decoded);
}
function userResponse(baseUrl, user) {
  return {
    id: user.okta_id,
    status: user.status,
    created: user.created_at,
    activated: user.activated_at,
    statusChanged: user.status_changed_at,
    lastLogin: user.last_login_at,
    lastUpdated: user.updated_at,
    passwordChanged: user.password_changed_at,
    profile: {
      login: user.login,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: userDisplayName(user),
      locale: user.locale,
      timeZone: user.time_zone
    },
    _links: {
      self: {
        href: `${baseUrl}/api/v1/users/${encodeURIComponent(user.okta_id)}`
      }
    }
  };
}
function groupResponse(baseUrl, group) {
  return {
    id: group.okta_id,
    created: group.created_at,
    lastUpdated: group.updated_at,
    lastMembershipUpdated: group.updated_at,
    objectClass: ["okta:user_group"],
    type: group.type,
    profile: {
      name: group.name,
      description: group.description
    },
    _links: {
      self: {
        href: `${baseUrl}/api/v1/groups/${encodeURIComponent(group.okta_id)}`
      }
    }
  };
}
function appResponse(baseUrl, app) {
  return {
    id: app.okta_id,
    name: app.name,
    label: app.label,
    status: app.status,
    created: app.created_at,
    lastUpdated: app.updated_at,
    signOnMode: app.sign_on_mode,
    credentials: app.credentials,
    settings: app.settings,
    _links: {
      self: {
        href: `${baseUrl}/api/v1/apps/${encodeURIComponent(app.okta_id)}`
      }
    }
  };
}
function authorizationServerResponse(baseUrl, server) {
  return {
    id: server.server_id,
    name: server.name,
    description: server.description,
    audiences: server.audiences,
    issuer: resolveOktaIssuer(baseUrl, server.server_id),
    status: server.status,
    created: server.created_at,
    lastUpdated: server.updated_at,
    _links: {
      self: {
        href: `${baseUrl}/api/v1/authorizationServers/${encodeURIComponent(server.server_id)}`
      }
    }
  };
}
function getOktaStore(store) {
  return {
    users: store.collection("okta.users", ["okta_id", "login", "email"]),
    groups: store.collection("okta.groups", ["okta_id", "name"]),
    apps: store.collection("okta.apps", ["okta_id", "name"]),
    oauthClients: store.collection("okta.oauth_clients", ["client_id", "auth_server_id"]),
    authorizationServers: store.collection("okta.auth_servers", ["server_id"]),
    groupMemberships: store.collection("okta.group_memberships", [
      "group_okta_id",
      "user_okta_id"
    ]),
    appAssignments: store.collection("okta.app_assignments", ["app_okta_id", "user_okta_id"])
  };
}
function appRoutes({ app, store, baseUrl, tokenMap }) {
  const oktaStore = getOktaStore(store);
  app.get("/api/v1/apps", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const q = (c.req.query("q") ?? "").toLowerCase();
    let apps = oktaStore.apps.all();
    if (q) {
      apps = apps.filter((entry) => `${entry.name} ${entry.label}`.toLowerCase().includes(q));
    }
    const { page, per_page } = parsePagination(c);
    const total = apps.length;
    const start = (page - 1) * per_page;
    const paged = apps.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    c.header("X-Total-Count", String(total));
    return c.json(paged.map((entry) => appResponse(baseUrl, entry)));
  });
  app.post("/api/v1/apps", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const body = await readJsonObject(c);
    const name = typeof body.name === "string" ? body.name : "oidc_client";
    const label = typeof body.label === "string" ? body.label : "Okta App";
    const signOnMode = typeof body.signOnMode === "string" ? body.signOnMode : "OPENID_CONNECT";
    const settings = body.settings && typeof body.settings === "object" ? body.settings : {};
    const credentials = body.credentials && typeof body.credentials === "object" ? body.credentials : {};
    const created = oktaStore.apps.insert({
      okta_id: generateOktaId("0oa"),
      name,
      label,
      status: normalizeAppStatus(typeof body.status === "string" ? body.status : void 0, "ACTIVE"),
      sign_on_mode: signOnMode,
      settings,
      credentials
    });
    return c.json(appResponse(baseUrl, created), 201);
  });
  app.get("/api/v1/apps/:appId/users", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const assignments = oktaStore.appAssignments.findBy("app_okta_id", appEntity.okta_id);
    const users = assignments.map((assignment) => oktaStore.users.findOneBy("okta_id", assignment.user_okta_id)).filter((user) => Boolean(user));
    return c.json(
      users.map((user) => ({
        id: user.okta_id,
        scope: "USER",
        credentials: { userName: user.login },
        profile: userResponse(baseUrl, user).profile
      }))
    );
  });
  app.put("/api/v1/apps/:appId/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const existing = oktaStore.appAssignments.findBy("app_okta_id", appEntity.okta_id).find((assignment) => assignment.user_okta_id === user.okta_id);
    if (!existing) {
      oktaStore.appAssignments.insert({
        app_okta_id: appEntity.okta_id,
        user_okta_id: user.okta_id
      });
    }
    return new Response(null, { status: 204 });
  });
  app.delete("/api/v1/apps/:appId/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const existing = oktaStore.appAssignments.findBy("app_okta_id", appEntity.okta_id).find((assignment) => assignment.user_okta_id === user.okta_id);
    if (existing) oktaStore.appAssignments.delete(existing.id);
    return new Response(null, { status: 204 });
  });
  app.post("/api/v1/apps/:appId/lifecycle/activate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const updated = oktaStore.apps.update(appEntity.id, { status: "ACTIVE" });
    return c.json(appResponse(baseUrl, updated ?? appEntity));
  });
  app.post("/api/v1/apps/:appId/lifecycle/deactivate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const updated = oktaStore.apps.update(appEntity.id, { status: "INACTIVE" });
    return c.json(appResponse(baseUrl, updated ?? appEntity));
  });
  app.get("/api/v1/apps/:appId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    return c.json(appResponse(baseUrl, appEntity));
  });
  app.put("/api/v1/apps/:appId", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    const body = await readJsonObject(c);
    const updated = oktaStore.apps.update(appEntity.id, {
      name: typeof body.name === "string" ? body.name : appEntity.name,
      label: typeof body.label === "string" ? body.label : appEntity.label,
      status: normalizeAppStatus(typeof body.status === "string" ? body.status : void 0, appEntity.status),
      sign_on_mode: typeof body.signOnMode === "string" ? body.signOnMode : appEntity.sign_on_mode,
      settings: body.settings && typeof body.settings === "object" ? body.settings : appEntity.settings,
      credentials: body.credentials && typeof body.credentials === "object" ? body.credentials : appEntity.credentials
    });
    return c.json(appResponse(baseUrl, updated ?? appEntity));
  });
  app.delete("/api/v1/apps/:appId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const appEntity = findAppByRef(oktaStore, c.req.param("appId"));
    if (!appEntity) return oktaError(c, 404, "E0000007", "Not found: app");
    if (appEntity.status !== "INACTIVE") {
      return oktaError(c, 400, "E0000001", "App must be INACTIVE before deletion");
    }
    for (const assignment of oktaStore.appAssignments.findBy("app_okta_id", appEntity.okta_id)) {
      oktaStore.appAssignments.delete(assignment.id);
    }
    oktaStore.apps.delete(appEntity.id);
    return new Response(null, { status: 204 });
  });
}
function normalizeServerId(name) {
  const compact = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  if (compact.length > 0) return compact;
  return generateOktaId("as");
}
function authorizationServerRoutes({ app, store, baseUrl, tokenMap }) {
  const oktaStore = getOktaStore(store);
  app.get("/api/v1/authorizationServers", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const servers = oktaStore.authorizationServers.all();
    const { page, per_page } = parsePagination(c);
    const total = servers.length;
    const start = (page - 1) * per_page;
    const paged = servers.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    c.header("X-Total-Count", String(total));
    return c.json(paged.map((server) => authorizationServerResponse(baseUrl, server)));
  });
  app.post("/api/v1/authorizationServers", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const body = await readJsonObject(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return oktaError(c, 400, "E0000001", "name is required");
    const serverId = typeof body.id === "string" ? body.id : normalizeServerId(name);
    if (oktaStore.authorizationServers.findOneBy("server_id", serverId)) {
      return oktaError(c, 400, "E0000001", `Authorization server '${serverId}' already exists`);
    }
    const audiences = Array.isArray(body.audiences) ? body.audiences.filter((entry) => typeof entry === "string") : [DEFAULT_AUDIENCE];
    const created = oktaStore.authorizationServers.insert({
      server_id: serverId,
      name,
      description: typeof body.description === "string" ? body.description : "",
      audiences: audiences.length > 0 ? audiences : [DEFAULT_AUDIENCE],
      status: normalizeAuthServerStatus(typeof body.status === "string" ? body.status : void 0, "ACTIVE")
    });
    return c.json(authorizationServerResponse(baseUrl, created), 201);
  });
  app.post("/api/v1/authorizationServers/:authServerId/lifecycle/activate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const server = findAuthorizationServerByRef(oktaStore, c.req.param("authServerId"));
    if (!server) return oktaError(c, 404, "E0000007", "Not found: authorization server");
    const updated = oktaStore.authorizationServers.update(server.id, { status: "ACTIVE" });
    return c.json(authorizationServerResponse(baseUrl, updated ?? server));
  });
  app.post("/api/v1/authorizationServers/:authServerId/lifecycle/deactivate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const server = findAuthorizationServerByRef(oktaStore, c.req.param("authServerId"));
    if (!server) return oktaError(c, 404, "E0000007", "Not found: authorization server");
    const updated = oktaStore.authorizationServers.update(server.id, { status: "INACTIVE" });
    return c.json(authorizationServerResponse(baseUrl, updated ?? server));
  });
  app.get("/api/v1/authorizationServers/:authServerId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const server = findAuthorizationServerByRef(oktaStore, c.req.param("authServerId"));
    if (!server) return oktaError(c, 404, "E0000007", "Not found: authorization server");
    return c.json(authorizationServerResponse(baseUrl, server));
  });
  app.put("/api/v1/authorizationServers/:authServerId", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const server = findAuthorizationServerByRef(oktaStore, c.req.param("authServerId"));
    if (!server) return oktaError(c, 404, "E0000007", "Not found: authorization server");
    const body = await readJsonObject(c);
    const audiences = Array.isArray(body.audiences) ? body.audiences.filter((entry) => typeof entry === "string") : server.audiences;
    const updated = oktaStore.authorizationServers.update(server.id, {
      name: typeof body.name === "string" ? body.name : server.name,
      description: typeof body.description === "string" ? body.description : server.description,
      audiences: audiences.length > 0 ? audiences : server.audiences,
      status: normalizeAuthServerStatus(typeof body.status === "string" ? body.status : void 0, server.status)
    });
    return c.json(authorizationServerResponse(baseUrl, updated ?? server));
  });
  app.delete("/api/v1/authorizationServers/:authServerId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const server = findAuthorizationServerByRef(oktaStore, c.req.param("authServerId"));
    if (!server) return oktaError(c, 404, "E0000007", "Not found: authorization server");
    for (const client of oktaStore.oauthClients.findBy("auth_server_id", server.server_id)) {
      oktaStore.oauthClients.delete(client.id);
    }
    oktaStore.authorizationServers.delete(server.id);
    return new Response(null, { status: 204 });
  });
}
function groupRoutes({ app, store, baseUrl, tokenMap }) {
  const oktaStore = getOktaStore(store);
  app.get("/api/v1/groups", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const q = (c.req.query("q") ?? "").toLowerCase();
    let groups = oktaStore.groups.all();
    if (q) {
      groups = groups.filter((group) => `${group.name} ${group.description ?? ""}`.toLowerCase().includes(q));
    }
    const { page, per_page } = parsePagination(c);
    const total = groups.length;
    const start = (page - 1) * per_page;
    const paged = groups.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    c.header("X-Total-Count", String(total));
    return c.json(paged.map((group) => groupResponse(baseUrl, group)));
  });
  app.post("/api/v1/groups", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const body = await readJsonObject(c);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const name = typeof profile.name === "string" ? profile.name.trim() : "";
    if (!name) {
      return oktaError(c, 400, "E0000001", "profile.name is required");
    }
    if (oktaStore.groups.findOneBy("name", name)) {
      return oktaError(c, 400, "E0000001", "A group with the same name already exists");
    }
    const created = oktaStore.groups.insert({
      okta_id: generateOktaId("00g"),
      type: normalizeGroupType(typeof body.type === "string" ? body.type : void 0, "OKTA_GROUP"),
      name,
      description: typeof profile.description === "string" ? profile.description : null
    });
    return c.json(groupResponse(baseUrl, created), 201);
  });
  app.get("/api/v1/groups/:groupId/users", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    const memberships = oktaStore.groupMemberships.findBy("group_okta_id", group.okta_id);
    const users = memberships.map((membership) => oktaStore.users.findOneBy("okta_id", membership.user_okta_id)).filter((user) => Boolean(user));
    return c.json(users.map((user) => userResponse(baseUrl, user)));
  });
  app.put("/api/v1/groups/:groupId/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const existing = oktaStore.groupMemberships.findBy("group_okta_id", group.okta_id).find((membership) => membership.user_okta_id === user.okta_id);
    if (!existing) {
      oktaStore.groupMemberships.insert({
        group_okta_id: group.okta_id,
        user_okta_id: user.okta_id
      });
    }
    return new Response(null, { status: 204 });
  });
  app.delete("/api/v1/groups/:groupId/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const existing = oktaStore.groupMemberships.findBy("group_okta_id", group.okta_id).find((membership) => membership.user_okta_id === user.okta_id);
    if (existing) {
      oktaStore.groupMemberships.delete(existing.id);
    }
    return new Response(null, { status: 204 });
  });
  app.get("/api/v1/groups/:groupId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    return c.json(groupResponse(baseUrl, group));
  });
  app.put("/api/v1/groups/:groupId", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    const body = await readJsonObject(c);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const nextName = typeof profile.name === "string" ? profile.name.trim() : group.name;
    if (nextName !== group.name) {
      const existing = oktaStore.groups.findOneBy("name", nextName);
      if (existing && existing.okta_id !== group.okta_id) {
        return oktaError(c, 400, "E0000001", "A group with the same name already exists");
      }
    }
    const updated = oktaStore.groups.update(group.id, {
      name: nextName,
      description: typeof profile.description === "string" ? profile.description : group.description,
      type: normalizeGroupType(typeof body.type === "string" ? body.type : void 0, group.type)
    });
    return c.json(groupResponse(baseUrl, updated ?? group));
  });
  app.delete("/api/v1/groups/:groupId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const group = findGroupByRef(oktaStore, c.req.param("groupId"));
    if (!group) return oktaError(c, 404, "E0000007", "Not found: group");
    for (const membership of oktaStore.groupMemberships.findBy("group_okta_id", group.okta_id)) {
      oktaStore.groupMemberships.delete(membership.id);
    }
    oktaStore.groups.delete(group.id);
    return new Response(null, { status: 204 });
  });
}
var keyPairPromise = generateKeyPair("RS256");
var KID = "emulate-okta-1";
var CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("okta.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("okta.oauth.pendingCodes", map);
  }
  return map;
}
function getAccessTokens(store) {
  let map = store.getData("okta.oauth.accessTokens");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("okta.oauth.accessTokens", map);
  }
  return map;
}
function getRefreshTokens(store) {
  let map = store.getData("okta.oauth.refreshTokens");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("okta.oauth.refreshTokens", map);
  }
  return map;
}
function isCodeExpired(code) {
  return Date.now() - code.createdAt > CODE_TTL_MS;
}
function buildOAuthBasePath(authServerId) {
  if (authServerId === ORG_AUTH_SERVER_ID) return "/oauth2/v1";
  return `/oauth2/${encodeURIComponent(authServerId)}/v1`;
}
function getClientsForServer(clients, authServerId) {
  return clients.filter((client) => client.auth_server_id === authServerId);
}
function resolveServer(authServerId, baseUrl, store) {
  if (authServerId === ORG_AUTH_SERVER_ID) {
    return {
      authServerId,
      issuer: baseUrl,
      audiences: [DEFAULT_AUDIENCE]
    };
  }
  const server = store.authorizationServers.findOneBy("server_id", authServerId);
  if (!server) return null;
  return {
    authServerId,
    issuer: resolveOktaIssuer(baseUrl, authServerId),
    audiences: server.audiences.length > 0 ? server.audiences : [DEFAULT_AUDIENCE]
  };
}
function buildOidcConfiguration(baseUrl, server) {
  const oauthBase = buildOAuthBasePath(server.authServerId);
  const oauthUrlBase = `${baseUrl}${oauthBase}`;
  const tokenEndpointAuthMethods = ["client_secret_post", "client_secret_basic", "none"];
  return {
    issuer: server.issuer,
    authorization_endpoint: `${oauthUrlBase}/authorize`,
    token_endpoint: `${oauthUrlBase}/token`,
    userinfo_endpoint: `${oauthUrlBase}/userinfo`,
    jwks_uri: `${oauthUrlBase}/keys`,
    end_session_endpoint: `${oauthUrlBase}/logout`,
    revocation_endpoint: `${oauthUrlBase}/revoke`,
    introspection_endpoint: `${oauthUrlBase}/introspect`,
    registration_endpoint: `${oauthUrlBase}/clients`,
    response_types_supported: ["code"],
    response_modes_supported: ["query", "fragment", "form_post"],
    grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email", "offline_access", "groups"],
    token_endpoint_auth_methods_supported: tokenEndpointAuthMethods,
    revocation_endpoint_auth_methods_supported: tokenEndpointAuthMethods,
    introspection_endpoint_auth_methods_supported: tokenEndpointAuthMethods,
    request_parameter_supported: false,
    request_uri_parameter_supported: false,
    claims_parameter_supported: false,
    request_object_signing_alg_values_supported: ["RS256"],
    claims_supported: [
      "sub",
      "iss",
      "aud",
      "exp",
      "iat",
      "auth_time",
      "nonce",
      "name",
      "preferred_username",
      "email",
      "email_verified",
      "locale",
      "zoneinfo",
      "groups"
    ],
    code_challenge_methods_supported: ["plain", "S256"]
  };
}
async function parseTokenLikeBody(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  const raw = await c.req.text();
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(raw);
      const out = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string") out[key] = value;
      }
      return out;
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}
function parseClientCredentials(c, body) {
  let clientId = body.client_id ?? "";
  let clientSecret = body.client_secret ?? "";
  const authHeader = c.req.header("Authorization") ?? "";
  if (authHeader.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    if (sep !== -1) {
      const headerId = decodeURIComponent(decoded.slice(0, sep));
      const headerSecret = decodeURIComponent(decoded.slice(sep + 1));
      if (!clientId) clientId = headerId;
      if (!clientSecret) clientSecret = headerSecret;
    }
  }
  return { clientId, clientSecret };
}
function validateClient(clients, authServerId, clientId, clientSecret) {
  const scopedClients = getClientsForServer(clients, authServerId);
  if (scopedClients.length === 0) {
    return { client: null, error: null };
  }
  const client = scopedClients.find((entry) => entry.client_id === clientId);
  if (!client) {
    return {
      client: null,
      error: {
        body: { error: "invalid_client", error_description: "Unknown client." },
        status: 401
      }
    };
  }
  if (client.token_endpoint_auth_method === "none") {
    return { client, error: null };
  }
  if (!constantTimeSecretEqual(client.client_secret ?? "", clientSecret)) {
    return {
      client: null,
      error: {
        body: { error: "invalid_client", error_description: "Invalid client credentials." },
        status: 401
      }
    };
  }
  return { client, error: null };
}
function parseScope(scope) {
  return scope.split(/\s+/).map((part) => part.trim()).filter(Boolean);
}
function collectUserGroups(oktaStore, user) {
  const memberships = oktaStore.groupMemberships.findBy("user_okta_id", user.okta_id);
  const names = [];
  for (const membership of memberships) {
    const group = oktaStore.groups.findOneBy("okta_id", membership.group_okta_id);
    if (group) names.push(group.name);
  }
  return names;
}
async function createIdToken(oktaStore, user, clientId, nonce, issuer, scope) {
  const { privateKey } = await keyPairPromise;
  const now = Math.floor(Date.now() / 1e3);
  const scopes = parseScope(scope);
  const claims = {
    sub: user.okta_id,
    name: userDisplayName(user),
    preferred_username: user.login,
    email: user.email,
    email_verified: true,
    locale: user.locale,
    zoneinfo: user.time_zone,
    auth_time: now
  };
  if (nonce) claims.nonce = nonce;
  if (scopes.includes("groups")) {
    claims.groups = collectUserGroups(oktaStore, user);
  }
  return new SignJWT(claims).setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" }).setIssuer(issuer).setAudience(clientId).setIssuedAt(now).setExpirationTime("1h").sign(privateKey);
}
function unauthorizedOAuthError() {
  return new Response(JSON.stringify({ error: "invalid_token", error_description: "The access token is invalid." }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
function oauthRoutes({ app, store, baseUrl, tokenMap }) {
  const oktaStore = getOktaStore(store);
  const SERVICE_LABEL = "Okta";
  app.get("/.well-known/openid-configuration", (c) => {
    const server = resolveServer(ORG_AUTH_SERVER_ID, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", "Not found: org authorization server");
    return c.json(buildOidcConfiguration(baseUrl, server));
  });
  app.get("/oauth2/:authServerId/.well-known/openid-configuration", (c) => {
    const authServerId = c.req.param("authServerId");
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    return c.json(buildOidcConfiguration(baseUrl, server));
  });
  app.get("/oauth2/v1/keys", async (c) => {
    const { publicKey } = await keyPairPromise;
    const jwk = await exportJWK(publicKey);
    return c.json({
      keys: [{ ...jwk, kid: KID, use: "sig", alg: "RS256" }]
    });
  });
  app.get("/oauth2/:authServerId/v1/keys", async (c) => {
    const authServerId = c.req.param("authServerId");
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const { publicKey } = await keyPairPromise;
    const jwk = await exportJWK(publicKey);
    return c.json({
      keys: [{ ...jwk, kid: KID, use: "sig", alg: "RS256" }]
    });
  });
  const renderAuthorizePage = (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const clientId = c.req.query("client_id") ?? "";
    const redirectUri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "openid profile email";
    const state = c.req.query("state") ?? "";
    const nonce = c.req.query("nonce") ?? "";
    const responseMode = c.req.query("response_mode") ?? "query";
    const responseType = c.req.query("response_type") ?? "code";
    const codeChallenge = c.req.query("code_challenge") ?? "";
    const codeChallengeMethod = c.req.query("code_challenge_method") ?? "";
    if (responseType !== "code") {
      return c.html(
        renderErrorPage("Unsupported response_type", "Only response_type=code is supported.", SERVICE_LABEL),
        400
      );
    }
    if (!redirectUri) {
      return c.html(
        renderErrorPage("Missing redirect URI", "The redirect_uri parameter is required.", SERVICE_LABEL),
        400
      );
    }
    const configuredClients = getClientsForServer(oktaStore.oauthClients.all(), authServerId);
    let clientName = "";
    if (configuredClients.length > 0) {
      const client = configuredClients.find((entry) => entry.client_id === clientId);
      if (!client) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${clientId}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (!matchesRedirectUri(redirectUri, client.redirect_uris)) {
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
    const users = oktaStore.users.all();
    const callbackPath = `${buildOAuthBasePath(authServerId)}/authorize/callback`;
    const buttons = users.map(
      (user) => renderUserButton({
        letter: (user.login[0] ?? "?").toUpperCase(),
        login: user.login,
        name: userDisplayName(user),
        email: user.email,
        formAction: callbackPath,
        hiddenFields: {
          user_ref: user.okta_id,
          redirect_uri: redirectUri,
          scope,
          state,
          nonce,
          client_id: clientId,
          response_mode: responseMode,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          auth_server_id: authServerId
        }
      })
    ).join("\n");
    const subtitle = clientName ? `Sign in to <strong>${escapeHtml(clientName)}</strong> with your Okta account.` : "Choose a seeded user to continue.";
    return c.html(
      renderCardPage(
        "Sign in with Okta",
        subtitle,
        users.length > 0 ? buttons : '<p class="empty">No users in the emulator store.</p>',
        SERVICE_LABEL
      )
    );
  };
  app.get("/oauth2/v1/authorize", (c) => renderAuthorizePage(c, ORG_AUTH_SERVER_ID));
  app.get("/oauth2/:authServerId/v1/authorize", (c) => renderAuthorizePage(c, c.req.param("authServerId")));
  const handleAuthorizeCallback = async (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const body = await c.req.parseBody();
    const userRef = bodyStr(body.user_ref);
    const redirectUri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope) || "openid profile email";
    const state = bodyStr(body.state);
    const nonce = bodyStr(body.nonce);
    const clientId = bodyStr(body.client_id);
    const responseMode = bodyStr(body.response_mode) || "query";
    const codeChallenge = bodyStr(body.code_challenge);
    const codeChallengeMethod = bodyStr(body.code_challenge_method);
    if (!redirectUri) {
      return c.html(
        renderErrorPage("Missing redirect URI", "The redirect_uri parameter is required.", SERVICE_LABEL),
        400
      );
    }
    const user = findUserByRef(oktaStore, userRef);
    if (!user) {
      return c.html(renderErrorPage("Unknown user", "The selected user is not available.", SERVICE_LABEL), 400);
    }
    const configuredClients = getClientsForServer(oktaStore.oauthClients.all(), authServerId);
    if (configuredClients.length > 0) {
      const client = configuredClients.find((entry) => entry.client_id === clientId);
      if (!client) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${clientId}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (!matchesRedirectUri(redirectUri, client.redirect_uris)) {
        return c.html(
          renderErrorPage(
            "Redirect URI mismatch",
            "The redirect_uri is not registered for this application.",
            SERVICE_LABEL
          ),
          400
        );
      }
    }
    const code = randomBytes(20).toString("hex");
    getPendingCodes(store).set(code, {
      userRef: user.okta_id,
      scope,
      redirectUri,
      clientId,
      nonce: nonce || null,
      codeChallenge: codeChallenge || null,
      codeChallengeMethod: codeChallengeMethod || null,
      authServerId,
      createdAt: Date.now()
    });
    debug("okta.oauth", `[callback] code=${code.slice(0, 8)}... user=${user.login} server=${authServerId}`);
    if (responseMode === "form_post") {
      return c.html(renderFormPostPage(redirectUri, { code, state }, SERVICE_LABEL));
    }
    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  };
  app.post("/oauth2/v1/authorize/callback", (c) => handleAuthorizeCallback(c, ORG_AUTH_SERVER_ID));
  app.post(
    "/oauth2/:authServerId/v1/authorize/callback",
    (c) => handleAuthorizeCallback(c, c.req.param("authServerId"))
  );
  const handleToken = async (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const body = await parseTokenLikeBody(c);
    const grantType = body.grant_type ?? "";
    const code = body.code ?? "";
    const redirectUri = body.redirect_uri ?? "";
    const codeVerifier = body.code_verifier;
    const refreshToken = body.refresh_token ?? "";
    const requestedScope = body.scope ?? "";
    const creds = parseClientCredentials(c, body);
    const validation = validateClient(oktaStore.oauthClients.all(), authServerId, creds.clientId, creds.clientSecret);
    if (validation.error) {
      return c.json(validation.error.body, validation.error.status);
    }
    const validatedClient = validation.client;
    if (grantType === "authorization_code") {
      const pending = getPendingCodes(store).get(code);
      if (!pending || isCodeExpired(pending)) {
        if (pending) getPendingCodes(store).delete(code);
        return c.json({ error: "invalid_grant", error_description: "Authorization code is invalid or expired." }, 400);
      }
      if (pending.authServerId !== authServerId) {
        return c.json({ error: "invalid_grant", error_description: "Authorization server mismatch." }, 400);
      }
      if (redirectUri && redirectUri !== pending.redirectUri) {
        return c.json({ error: "invalid_grant", error_description: "redirect_uri does not match." }, 400);
      }
      if (validatedClient && validatedClient.client_id !== pending.clientId) {
        return c.json(
          { error: "invalid_grant", error_description: "Authorization code was not issued to this client." },
          400
        );
      }
      if (pending.codeChallenge !== null) {
        if (!codeVerifier) {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
        const method = (pending.codeChallengeMethod ?? "plain").toLowerCase();
        if (method === "s256") {
          const expected = createHash("sha256").update(codeVerifier).digest("base64url");
          if (expected !== pending.codeChallenge) {
            return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
          }
        } else if (method === "plain") {
          if (codeVerifier !== pending.codeChallenge) {
            return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
          }
        } else {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
      }
      const user = findUserByRef(oktaStore, pending.userRef);
      if (!user) return c.json({ error: "invalid_grant", error_description: "Unknown user." }, 400);
      getPendingCodes(store).delete(code);
      const now = Math.floor(Date.now() / 1e3);
      const audienceClient = pending.clientId || creds.clientId || "okta-client";
      const scope = pending.scope || "openid profile email";
      const accessToken = `okta_${randomBytes(20).toString("base64url")}`;
      const newRefreshToken = `r_okta_${randomBytes(20).toString("base64url")}`;
      getAccessTokens(store).set(accessToken, {
        authServerId,
        clientId: audienceClient,
        scope,
        issuedAt: now,
        expiresAt: now + 3600,
        userOktaId: user.okta_id,
        username: user.login
      });
      getRefreshTokens(store).set(newRefreshToken, {
        authServerId,
        clientId: audienceClient,
        scope,
        userOktaId: user.okta_id,
        username: user.login,
        nonce: pending.nonce
      });
      tokenMap?.set(accessToken, {
        login: user.login,
        id: user.id,
        scopes: parseScope(scope)
      });
      const idToken = await createIdToken(oktaStore, user, audienceClient, pending.nonce, server.issuer, scope);
      return c.json({
        token_type: "Bearer",
        expires_in: 3600,
        access_token: accessToken,
        refresh_token: newRefreshToken,
        id_token: idToken,
        scope
      });
    }
    if (grantType === "refresh_token") {
      const existing = getRefreshTokens(store).get(refreshToken);
      if (!existing) {
        return c.json({ error: "invalid_grant", error_description: "Invalid refresh token." }, 400);
      }
      if (existing.authServerId !== authServerId) {
        return c.json({ error: "invalid_grant", error_description: "Authorization server mismatch." }, 400);
      }
      if (validatedClient && validatedClient.client_id !== existing.clientId) {
        return c.json(
          { error: "invalid_grant", error_description: "Refresh token was not issued to this client." },
          400
        );
      }
      const user = oktaStore.users.findOneBy("okta_id", existing.userOktaId);
      if (!user) return c.json({ error: "invalid_grant", error_description: "Unknown user." }, 400);
      getRefreshTokens(store).delete(refreshToken);
      const now = Math.floor(Date.now() / 1e3);
      const nextAccessToken = `okta_${randomBytes(20).toString("base64url")}`;
      const nextRefreshToken = `r_okta_${randomBytes(20).toString("base64url")}`;
      const scope = requestedScope || existing.scope;
      getAccessTokens(store).set(nextAccessToken, {
        authServerId,
        clientId: existing.clientId,
        scope,
        issuedAt: now,
        expiresAt: now + 3600,
        userOktaId: user.okta_id,
        username: user.login
      });
      getRefreshTokens(store).set(nextRefreshToken, {
        ...existing,
        scope
      });
      tokenMap?.set(nextAccessToken, {
        login: user.login,
        id: user.id,
        scopes: parseScope(scope)
      });
      const response = {
        token_type: "Bearer",
        expires_in: 3600,
        access_token: nextAccessToken,
        refresh_token: nextRefreshToken,
        scope
      };
      if (parseScope(scope).includes("openid")) {
        response.id_token = await createIdToken(
          oktaStore,
          user,
          existing.clientId,
          existing.nonce,
          server.issuer,
          scope
        );
      }
      return c.json(response);
    }
    if (grantType === "client_credentials") {
      if (oktaStore.oauthClients.all().length > 0 && !validatedClient) {
        return c.json({ error: "invalid_client", error_description: "Unknown client." }, 401);
      }
      const scope = requestedScope || ".default";
      const now = Math.floor(Date.now() / 1e3);
      const accessToken = `okta_${randomBytes(20).toString("base64url")}`;
      const clientId = validatedClient?.client_id ?? creds.clientId;
      if (!clientId) {
        return c.json({ error: "invalid_client", error_description: "client_id is required." }, 401);
      }
      getAccessTokens(store).set(accessToken, {
        authServerId,
        clientId,
        scope,
        issuedAt: now,
        expiresAt: now + 3600,
        userOktaId: null,
        username: null
      });
      tokenMap?.set(accessToken, {
        login: clientId,
        id: 0,
        scopes: parseScope(scope)
      });
      return c.json({
        token_type: "Bearer",
        expires_in: 3600,
        access_token: accessToken,
        scope
      });
    }
    return c.json({ error: "unsupported_grant_type" }, 400);
  };
  app.post("/oauth2/v1/token", (c) => handleToken(c, ORG_AUTH_SERVER_ID));
  app.post("/oauth2/:authServerId/v1/token", (c) => handleToken(c, c.req.param("authServerId")));
  const handleUserInfo = (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const token = c.get("authToken") ?? "";
    const access = getAccessTokens(store).get(token);
    if (!access || access.authServerId !== authServerId || !access.userOktaId) {
      return unauthorizedOAuthError();
    }
    const user = oktaStore.users.findOneBy("okta_id", access.userOktaId);
    if (!user) return unauthorizedOAuthError();
    const claims = {
      sub: user.okta_id,
      name: userDisplayName(user),
      preferred_username: user.login,
      email: user.email,
      email_verified: true,
      locale: user.locale,
      zoneinfo: user.time_zone
    };
    if (parseScope(access.scope).includes("groups")) {
      claims.groups = collectUserGroups(oktaStore, user);
    }
    return c.json(claims);
  };
  app.get("/oauth2/v1/userinfo", (c) => handleUserInfo(c, ORG_AUTH_SERVER_ID));
  app.get("/oauth2/:authServerId/v1/userinfo", (c) => handleUserInfo(c, c.req.param("authServerId")));
  const handleRevoke = async (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const body = await parseTokenLikeBody(c);
    const token = body.token ?? "";
    getAccessTokens(store).delete(token);
    getRefreshTokens(store).delete(token);
    tokenMap?.delete(token);
    return c.body("", 200);
  };
  app.post("/oauth2/v1/revoke", (c) => handleRevoke(c, ORG_AUTH_SERVER_ID));
  app.post("/oauth2/:authServerId/v1/revoke", (c) => handleRevoke(c, c.req.param("authServerId")));
  const handleIntrospect = async (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const body = await parseTokenLikeBody(c);
    const token = body.token ?? "";
    const creds = parseClientCredentials(c, body);
    const validation = validateClient(oktaStore.oauthClients.all(), authServerId, creds.clientId, creds.clientSecret);
    if (validation.error) {
      return c.json(validation.error.body, validation.error.status);
    }
    const now = Math.floor(Date.now() / 1e3);
    const access = getAccessTokens(store).get(token);
    if (access && access.authServerId === authServerId && access.expiresAt > now) {
      return c.json({
        active: true,
        token_type: "Bearer",
        scope: access.scope,
        client_id: access.clientId,
        username: access.username,
        sub: access.userOktaId,
        aud: server.audiences,
        iss: server.issuer,
        exp: access.expiresAt,
        iat: access.issuedAt
      });
    }
    const refresh = getRefreshTokens(store).get(token);
    if (refresh && refresh.authServerId === authServerId) {
      return c.json({
        active: true,
        token_type: "refresh_token",
        scope: refresh.scope,
        client_id: refresh.clientId,
        username: refresh.username,
        sub: refresh.userOktaId,
        aud: server.audiences,
        iss: server.issuer
      });
    }
    return c.json({ active: false });
  };
  app.post("/oauth2/v1/introspect", (c) => handleIntrospect(c, ORG_AUTH_SERVER_ID));
  app.post("/oauth2/:authServerId/v1/introspect", (c) => handleIntrospect(c, c.req.param("authServerId")));
  const handleLogout = (c, authServerId) => {
    const server = resolveServer(authServerId, baseUrl, oktaStore);
    if (!server) return oktaError(c, 404, "E0000007", `Not found: authorization server '${authServerId}'`);
    const postLogoutRedirectUri = c.req.query("post_logout_redirect_uri");
    if (!postLogoutRedirectUri) return c.text("Logged out");
    const scopedClients = getClientsForServer(oktaStore.oauthClients.all(), authServerId);
    if (scopedClients.length > 0) {
      const isAllowed = scopedClients.some((client) => matchesRedirectUri(postLogoutRedirectUri, client.redirect_uris));
      if (!isAllowed) return c.text("Invalid post_logout_redirect_uri", 400);
    }
    return c.redirect(postLogoutRedirectUri, 302);
  };
  app.get("/oauth2/v1/logout", (c) => handleLogout(c, ORG_AUTH_SERVER_ID));
  app.get("/oauth2/:authServerId/v1/logout", (c) => handleLogout(c, c.req.param("authServerId")));
}
function updateUserProfile(user, profile) {
  const nextFirstName = typeof profile.firstName === "string" ? profile.firstName : user.first_name;
  const nextLastName = typeof profile.lastName === "string" ? profile.lastName : user.last_name;
  const nextDisplayName = typeof profile.displayName === "string" ? profile.displayName : typeof profile.nickName === "string" ? profile.nickName : user.display_name;
  return {
    login: typeof profile.login === "string" ? profile.login : user.login,
    email: typeof profile.email === "string" ? profile.email : user.email,
    first_name: nextFirstName,
    last_name: nextLastName,
    display_name: nextDisplayName || `${nextFirstName} ${nextLastName}`.trim(),
    locale: typeof profile.locale === "string" ? profile.locale : user.locale,
    time_zone: typeof profile.timeZone === "string" ? profile.timeZone : user.time_zone
  };
}
function setLifecycleStatus(user, target) {
  const now = nowIso();
  const activatedAt = target === "ACTIVE" ? user.activated_at ?? now : user.activated_at;
  return {
    status: target,
    transitioning_to_status: null,
    status_changed_at: now,
    activated_at: activatedAt
  };
}
function userRoutes({ app, store, baseUrl, tokenMap }) {
  const oktaStore = getOktaStore(store);
  app.get("/api/v1/users", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const q = (c.req.query("q") ?? "").toLowerCase();
    const search = (c.req.query("search") ?? "").toLowerCase();
    const filter = c.req.query("filter") ?? "";
    let users = oktaStore.users.all();
    if (q) {
      users = users.filter(
        (user) => [user.login, user.email, user.first_name, user.last_name, user.display_name].join(" ").toLowerCase().includes(q)
      );
    }
    if (search) {
      users = users.filter(
        (user) => [user.login, user.email, user.first_name, user.last_name, user.display_name].join(" ").toLowerCase().includes(search)
      );
    }
    if (filter) {
      const statusMatch = filter.match(/status\s+eq\s+"?([A-Z_]+)"?/i);
      if (statusMatch?.[1]) {
        users = users.filter((user) => user.status === statusMatch[1]);
      }
    }
    const { page, per_page } = parsePagination(c);
    const total = users.length;
    const start = (page - 1) * per_page;
    const paged = users.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    c.header("X-Total-Count", String(total));
    return c.json(paged.map((user) => userResponse(baseUrl, user)));
  });
  app.post("/api/v1/users", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const body = await readJsonObject(c);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const login = typeof profile.login === "string" ? profile.login.trim() : "";
    const email = typeof profile.email === "string" ? profile.email.trim() : login;
    if (!login || !email) {
      return oktaError(c, 400, "E0000001", "profile.login and profile.email are required");
    }
    if (oktaStore.users.findOneBy("login", login) || oktaStore.users.findOneBy("email", email)) {
      return oktaError(c, 400, "E0000001", "A user with the same login or email already exists");
    }
    const activate = boolFromQuery(c.req.query("activate"), true);
    const now = nowIso();
    const firstName = typeof profile.firstName === "string" ? profile.firstName : "Test";
    const lastName = typeof profile.lastName === "string" ? profile.lastName : "User";
    const displayName = typeof profile.displayName === "string" ? profile.displayName : `${firstName} ${lastName}`.trim() || login;
    const created = oktaStore.users.insert({
      okta_id: generateOktaId("00u"),
      status: activate ? "ACTIVE" : "STAGED",
      activated_at: activate ? now : null,
      status_changed_at: now,
      last_login_at: null,
      password_changed_at: null,
      transitioning_to_status: null,
      login,
      email,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      locale: typeof profile.locale === "string" ? profile.locale : "en-US",
      time_zone: typeof profile.timeZone === "string" ? profile.timeZone : "UTC"
    });
    return c.json(userResponse(baseUrl, created), 201);
  });
  app.get("/api/v1/users/me", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = oktaStore.users.findOneBy("login", auth.login) ?? oktaStore.users.all()[0];
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const response = userResponse(baseUrl, user);
    return c.json({
      ...response,
      profile: {
        ...response.profile,
        displayName: userDisplayName(user)
      }
    });
  });
  app.get("/api/v1/users/:userId/groups", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const memberships = oktaStore.groupMemberships.findBy("user_okta_id", user.okta_id);
    const groups = memberships.map((membership) => oktaStore.groups.findOneBy("okta_id", membership.group_okta_id)).filter((group) => Boolean(group));
    return c.json(
      groups.map((group) => ({
        id: group.okta_id,
        profile: {
          name: group.name,
          description: group.description
        },
        type: group.type
      }))
    );
  });
  app.post("/api/v1/users/:userId/lifecycle/activate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const updated = oktaStore.users.update(user.id, setLifecycleStatus(user, "ACTIVE"));
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.post("/api/v1/users/:userId/lifecycle/deactivate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const updated = oktaStore.users.update(user.id, setLifecycleStatus(user, "DEPROVISIONED"));
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.post("/api/v1/users/:userId/lifecycle/suspend", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const updated = oktaStore.users.update(user.id, setLifecycleStatus(user, "SUSPENDED"));
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.post("/api/v1/users/:userId/lifecycle/unsuspend", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const updated = oktaStore.users.update(user.id, setLifecycleStatus(user, "ACTIVE"));
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.get("/api/v1/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    return c.json(userResponse(baseUrl, user));
  });
  app.put("/api/v1/users/:userId", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const body = await readJsonObject(c);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const updates = updateUserProfile(user, profile);
    if (updates.login !== user.login && oktaStore.users.findOneBy("login", updates.login ?? "") || updates.email !== user.email && oktaStore.users.findOneBy("email", updates.email ?? "")) {
      return oktaError(c, 400, "E0000001", "A user with the same login or email already exists");
    }
    const updated = oktaStore.users.update(user.id, updates);
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.post("/api/v1/users/:userId", async (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const body = await readJsonObject(c);
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const updates = updateUserProfile(user, profile);
    const updated = oktaStore.users.update(user.id, updates);
    return c.json(userResponse(baseUrl, updated ?? user));
  });
  app.delete("/api/v1/users/:userId", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    if (user.status !== "DEPROVISIONED") {
      oktaStore.users.update(user.id, setLifecycleStatus(user, "DEPROVISIONED"));
      return new Response(null, { status: 204 });
    }
    for (const membership of oktaStore.groupMemberships.findBy("user_okta_id", user.okta_id)) {
      oktaStore.groupMemberships.delete(membership.id);
    }
    for (const assignment of oktaStore.appAssignments.findBy("user_okta_id", user.okta_id)) {
      oktaStore.appAssignments.delete(assignment.id);
    }
    oktaStore.users.delete(user.id);
    return new Response(null, { status: 204 });
  });
  app.post("/api/v1/users/:userId/lifecycle/reactivate", (c) => {
    const auth = requireManagementAuth(c, tokenMap);
    if (auth instanceof Response) return auth;
    const user = findUserByRef(oktaStore, c.req.param("userId"));
    if (!user) return oktaError(c, 404, "E0000007", "Not found: user");
    const updated = oktaStore.users.update(user.id, {
      status: "PROVISIONED",
      status_changed_at: nowIso(),
      transitioning_to_status: null
    });
    return c.json(userResponse(baseUrl, updated ?? user));
  });
}
function ensureMembership(store, groupOktaId, userOktaId) {
  const existing = store.groupMemberships.findBy("group_okta_id", groupOktaId).find((entry) => entry.user_okta_id === userOktaId);
  if (!existing) {
    store.groupMemberships.insert({
      group_okta_id: groupOktaId,
      user_okta_id: userOktaId
    });
  }
}
function ensureAppAssignment(store, appOktaId, userOktaId) {
  const existing = store.appAssignments.findBy("app_okta_id", appOktaId).find((entry) => entry.user_okta_id === userOktaId);
  if (!existing) {
    store.appAssignments.insert({
      app_okta_id: appOktaId,
      user_okta_id: userOktaId
    });
  }
}
function seedDefaults(store, _baseUrl) {
  const okta = getOktaStore(store);
  const defaultServer = okta.authorizationServers.findOneBy("server_id", DEFAULT_AUTH_SERVER_ID);
  if (!defaultServer) {
    okta.authorizationServers.insert(createDefaultAuthorizationServer());
  }
  let everyone = okta.groups.findOneBy("okta_id", DEFAULT_EVERYONE_GROUP_ID);
  if (!everyone) {
    everyone = okta.groups.insert(createDefaultGroup());
  }
  let user = okta.users.findOneBy("login", "testuser@okta.local");
  if (!user) {
    user = okta.users.insert(createDefaultUser());
  }
  if (!okta.oauthClients.findOneBy("client_id", "okta-test-client")) {
    okta.oauthClients.insert({
      client_id: "okta-test-client",
      client_secret: "okta-test-secret",
      name: "Sample OIDC Client",
      redirect_uris: ["http://localhost:3000/callback"],
      response_types: ["code"],
      grant_types: ["authorization_code", "refresh_token", "client_credentials"],
      token_endpoint_auth_method: "client_secret_post",
      auth_server_id: DEFAULT_AUTH_SERVER_ID
    });
  }
  if (!okta.oauthClients.findOneBy("client_id", "okta-test-app")) {
    okta.oauthClients.insert({
      client_id: "okta-test-app",
      client_secret: "",
      name: "Sample Public PKCE Client",
      redirect_uris: ["http://localhost:3000/official-sdk/callback", "http://localhost:3000/official-sdk"],
      response_types: ["code"],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none",
      auth_server_id: DEFAULT_AUTH_SERVER_ID
    });
  }
  if (okta.apps.all().length === 0) {
    okta.apps.insert(createDefaultApp());
  }
  ensureMembership(okta, everyone.okta_id, user.okta_id);
}
function seedFromConfig(store, _baseUrl, config) {
  const okta = getOktaStore(store);
  if (config.authorization_servers) {
    for (const server of config.authorization_servers) {
      const existing = okta.authorizationServers.findOneBy("server_id", server.id);
      if (existing) continue;
      okta.authorizationServers.insert({
        server_id: server.id,
        name: server.name,
        description: server.description ?? "",
        audiences: server.audiences ?? ["api://default"],
        status: normalizeAuthServerStatus(server.status, "ACTIVE")
      });
    }
  }
  if (config.users) {
    for (const user of config.users) {
      const byLogin = okta.users.findOneBy("login", user.login);
      if (byLogin) continue;
      const resolvedStatus = normalizeStatus(user.status, "ACTIVE");
      okta.users.insert({
        okta_id: user.okta_id ?? generateOktaId("00u"),
        status: resolvedStatus,
        activated_at: resolvedStatus === "ACTIVE" ? (/* @__PURE__ */ new Date()).toISOString() : null,
        status_changed_at: (/* @__PURE__ */ new Date()).toISOString(),
        last_login_at: null,
        password_changed_at: null,
        transitioning_to_status: null,
        login: user.login,
        email: user.email ?? user.login,
        first_name: user.first_name ?? "Test",
        last_name: user.last_name ?? "User",
        display_name: user.display_name ?? `${user.first_name ?? "Test"} ${user.last_name ?? "User"}`.trim(),
        locale: user.locale ?? "en-US",
        time_zone: user.time_zone ?? "UTC"
      });
    }
  }
  if (config.groups) {
    for (const group of config.groups) {
      const byName = okta.groups.findOneBy("name", group.name);
      if (byName) continue;
      okta.groups.insert({
        okta_id: group.okta_id ?? generateOktaId("00g"),
        type: normalizeGroupType(group.type, "OKTA_GROUP"),
        name: group.name,
        description: group.description ?? null
      });
    }
  }
  if (config.apps) {
    for (const app of config.apps) {
      const byName = okta.apps.findOneBy("name", app.name);
      if (byName) continue;
      okta.apps.insert({
        okta_id: app.okta_id ?? generateOktaId("0oa"),
        name: app.name,
        label: app.label ?? app.name,
        status: normalizeAppStatus(app.status, "ACTIVE"),
        sign_on_mode: app.sign_on_mode ?? "OPENID_CONNECT",
        settings: app.settings ?? {},
        credentials: app.credentials ?? {}
      });
    }
  }
  if (config.oauth_clients) {
    for (const client of config.oauth_clients) {
      const existing = okta.oauthClients.findOneBy("client_id", client.client_id);
      if (existing) continue;
      const tokenEndpointAuthMethod = client.token_endpoint_auth_method ?? "client_secret_post";
      okta.oauthClients.insert({
        client_id: client.client_id,
        client_secret: client.client_secret ?? "",
        name: client.name,
        redirect_uris: client.redirect_uris,
        response_types: client.response_types ?? ["code"],
        grant_types: client.grant_types ?? ["authorization_code", "refresh_token", "client_credentials"],
        token_endpoint_auth_method: tokenEndpointAuthMethod,
        auth_server_id: client.auth_server_id ?? DEFAULT_AUTH_SERVER_ID
      });
    }
  }
  if (config.group_memberships) {
    for (const membership of config.group_memberships) {
      const group = okta.groups.findOneBy("okta_id", membership.group_okta_id);
      const user = okta.users.findOneBy("okta_id", membership.user_okta_id);
      if (!group || !user) continue;
      ensureMembership(okta, group.okta_id, user.okta_id);
    }
  }
  if (config.app_assignments) {
    for (const assignment of config.app_assignments) {
      const app = okta.apps.findOneBy("okta_id", assignment.app_okta_id);
      const user = okta.users.findOneBy("okta_id", assignment.user_okta_id);
      if (!app || !user) continue;
      ensureAppAssignment(okta, app.okta_id, user.okta_id);
    }
  }
}
var oktaPlugin = {
  name: "okta",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    oauthRoutes(ctx);
    userRoutes(ctx);
    groupRoutes(ctx);
    appRoutes(ctx);
    authorizationServerRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = oktaPlugin;
export {
  index_default as default,
  getOktaStore,
  oktaPlugin,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-BT2LIYWL.js.map
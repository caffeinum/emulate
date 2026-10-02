import {
  SignJWT,
  exportJWK,
  generateKeyPair
} from "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// ../@emulators/microsoft/dist/index.js
import { randomUUID } from "crypto";
import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
function getMicrosoftStore(store) {
  return {
    users: store.collection("microsoft.users", ["oid", "email"]),
    oauthClients: store.collection("microsoft.oauth_clients", ["client_id"])
  };
}
var DEFAULT_TENANT_ID = "9188040d-6c67-4c5b-b112-36a304b66dad";
function generateOid() {
  return randomUUID();
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
var keyPairPromise = generateKeyPair("RS256");
var KID = "emulate-microsoft-1";
var PENDING_CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("microsoft.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("microsoft.oauth.pendingCodes", map);
  }
  return map;
}
function getRefreshTokens(store) {
  let map = store.getData("microsoft.oauth.refreshTokens");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("microsoft.oauth.refreshTokens", map);
  }
  return map;
}
function isPendingCodeExpired(p) {
  return Date.now() - p.created_at > PENDING_CODE_TTL_MS;
}
var SERVICE_LABEL = "Microsoft";
async function createIdToken(user, clientId, nonce, baseUrl) {
  const { privateKey } = await keyPairPromise;
  const now = Math.floor(Date.now() / 1e3);
  const builder = new SignJWT({
    sub: user.oid,
    email: user.email,
    name: user.name,
    given_name: user.given_name,
    family_name: user.family_name,
    preferred_username: user.preferred_username,
    oid: user.oid,
    tid: user.tenant_id,
    ver: "2.0",
    ...nonce ? { nonce } : {}
  }).setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" }).setIssuer(`${baseUrl}/${user.tenant_id}/v2.0`).setAudience(clientId).setIssuedAt(now).setExpirationTime("1h");
  return builder.sign(privateKey);
}
function oauthRoutes({ app, store, baseUrl, tokenMap }) {
  const ms = getMicrosoftStore(store);
  const oidcConfig = (tenantId) => ({
    issuer: `${baseUrl}/${tenantId}/v2.0`,
    authorization_endpoint: `${baseUrl}/oauth2/v2.0/authorize`,
    token_endpoint: `${baseUrl}/oauth2/v2.0/token`,
    userinfo_endpoint: `${baseUrl}/oidc/userinfo`,
    end_session_endpoint: `${baseUrl}/oauth2/v2.0/logout`,
    jwks_uri: `${baseUrl}/discovery/v2.0/keys`,
    response_types_supported: ["code"],
    response_modes_supported: ["query", "fragment", "form_post"],
    subject_types_supported: ["pairwise"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "email", "profile", "offline_access", "User.Read", ".default"],
    grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
    claims_supported: [
      "sub",
      "iss",
      "aud",
      "exp",
      "iat",
      "nonce",
      "name",
      "email",
      "given_name",
      "family_name",
      "preferred_username",
      "oid",
      "tid",
      "ver"
    ],
    code_challenge_methods_supported: ["plain", "S256"]
  });
  app.get("/.well-known/openid-configuration", (c) => {
    return c.json(oidcConfig(DEFAULT_TENANT_ID));
  });
  app.get("/:tenant/v2.0/.well-known/openid-configuration", (c) => {
    const tenant = c.req.param("tenant");
    return c.json(
      oidcConfig(
        tenant === "common" || tenant === "organizations" || tenant === "consumers" ? DEFAULT_TENANT_ID : tenant
      )
    );
  });
  app.get("/discovery/v2.0/keys", async (c) => {
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
  app.get("/oauth2/v2.0/authorize", (c) => {
    const client_id = c.req.query("client_id") ?? "";
    const redirect_uri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const state = c.req.query("state") ?? "";
    const nonce = c.req.query("nonce") ?? "";
    const response_mode = c.req.query("response_mode") ?? "query";
    const code_challenge = c.req.query("code_challenge") ?? "";
    const code_challenge_method = c.req.query("code_challenge_method") ?? "";
    const clientsConfigured = ms.oauthClients.all().length > 0;
    let clientName = "";
    if (clientsConfigured) {
      const client = ms.oauthClients.findOneBy("client_id", client_id);
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
    const subtitleText = clientName ? `Sign in to <strong>${escapeHtml(clientName)}</strong> with your Microsoft account.` : "Choose a seeded user to continue.";
    const users = ms.users.all();
    const userButtons = users.map((user) => {
      return renderUserButton({
        letter: (user.email[0] ?? "?").toUpperCase(),
        login: user.email,
        name: user.name,
        email: user.email,
        formAction: "/oauth2/v2.0/authorize/callback",
        hiddenFields: {
          email: user.email,
          redirect_uri,
          scope,
          state,
          nonce,
          client_id,
          response_mode,
          code_challenge,
          code_challenge_method
        }
      });
    }).join("\n");
    const body = users.length === 0 ? '<p class="empty">No users in the emulator store.</p>' : userButtons;
    return c.html(renderCardPage("Sign in with Microsoft", subtitleText, body, SERVICE_LABEL));
  });
  app.post("/oauth2/v2.0/authorize/callback", async (c) => {
    const body = await c.req.parseBody();
    const email = bodyStr(body.email);
    const redirect_uri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope);
    const state = bodyStr(body.state);
    const client_id = bodyStr(body.client_id);
    const nonce = bodyStr(body.nonce);
    const response_mode = bodyStr(body.response_mode) || "query";
    const code_challenge = bodyStr(body.code_challenge);
    const code_challenge_method = bodyStr(body.code_challenge_method);
    const clientsConfigured = ms.oauthClients.all().length > 0;
    if (clientsConfigured) {
      const client = ms.oauthClients.findOneBy("client_id", client_id);
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
    }
    const code = randomBytes(20).toString("hex");
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
    debug("microsoft.oauth", `[Microsoft callback] code=${code.slice(0, 8)}... email=${email}`);
    if (response_mode === "form_post") {
      return c.html(renderFormPostPage(redirect_uri, { code, state }, SERVICE_LABEL));
    }
    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  });
  app.post("/oauth2/v2.0/token", async (c) => {
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
    const grant_type = typeof body.grant_type === "string" ? body.grant_type : "";
    const code = typeof body.code === "string" ? body.code : "";
    let client_id = typeof body.client_id === "string" ? body.client_id : "";
    let client_secret = typeof body.client_secret === "string" ? body.client_secret : "";
    const refresh_token = typeof body.refresh_token === "string" ? body.refresh_token : "";
    const redirect_uri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
    const code_verifier = typeof body.code_verifier === "string" ? body.code_verifier : void 0;
    const scope = typeof body.scope === "string" ? body.scope : "";
    const authHeader = c.req.header("Authorization") ?? "";
    if (authHeader.startsWith("Basic ")) {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
      const sep = decoded.indexOf(":");
      if (sep !== -1) {
        const headerId = decodeURIComponent(decoded.slice(0, sep));
        const headerSecret = decodeURIComponent(decoded.slice(sep + 1));
        if (!client_id) client_id = headerId;
        if (!client_secret) client_secret = headerSecret;
      }
    }
    const validateClientCredentials = () => {
      if (ms.oauthClients.all().length === 0) return null;
      const client = ms.oauthClients.findOneBy("client_id", client_id);
      if (!client) {
        return c.json({ error: "invalid_client", error_description: "The client_id is incorrect." }, 401);
      }
      if (!constantTimeSecretEqual(client_secret, client.client_secret)) {
        return c.json({ error: "invalid_client", error_description: "The client_secret is incorrect." }, 401);
      }
      return null;
    };
    if (grant_type === "authorization_code") {
      const clientError = validateClientCredentials();
      if (clientError) return clientError;
      const pendingMap = getPendingCodes(store);
      const pending = pendingMap.get(code);
      if (!pending) {
        return c.json({ error: "invalid_grant", error_description: "The code is incorrect or expired." }, 400);
      }
      if (isPendingCodeExpired(pending)) {
        pendingMap.delete(code);
        return c.json({ error: "invalid_grant", error_description: "The code is incorrect or expired." }, 400);
      }
      if (pending.redirectUri && redirect_uri && pending.redirectUri !== redirect_uri) {
        pendingMap.delete(code);
        return c.json(
          {
            error: "invalid_grant",
            error_description: "The redirect_uri does not match the one used in the authorization request."
          },
          400
        );
      }
      if (pending.codeChallenge !== null) {
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
      const user = ms.users.findOneBy("email", pending.email);
      if (!user) {
        return c.json({ error: "invalid_grant", error_description: "User not found." }, 400);
      }
      const accessToken = "microsoft_" + randomBytes(20).toString("base64url");
      const refreshToken = "r_microsoft_" + randomBytes(20).toString("base64url");
      const scopes = pending.scope ? pending.scope.split(/\s+/).filter(Boolean) : [];
      if (tokenMap) {
        tokenMap.set(accessToken, { login: user.email, id: user.id, scopes });
      }
      getRefreshTokens(store).set(refreshToken, {
        email: user.email,
        clientId: pending.clientId,
        scope: pending.scope,
        nonce: pending.nonce
      });
      const idToken = await createIdToken(user, pending.clientId, pending.nonce, baseUrl);
      debug("microsoft.oauth", `[Microsoft token] issued token for ${user.email}`);
      return c.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: pending.scope || "openid email profile",
        refresh_token: refreshToken,
        id_token: idToken
      });
    }
    if (grant_type === "refresh_token") {
      const clientError = validateClientCredentials();
      if (clientError) return clientError;
      const refreshMap = getRefreshTokens(store);
      const stored = refreshMap.get(refresh_token);
      if (!stored) {
        return c.json({ error: "invalid_grant", error_description: "The refresh_token is invalid." }, 400);
      }
      if (stored.clientId && stored.clientId !== client_id) {
        return c.json({ error: "invalid_grant", error_description: "The refresh_token is invalid." }, 400);
      }
      const user = ms.users.findOneBy("email", stored.email);
      if (!user) {
        return c.json({ error: "invalid_grant", error_description: "User not found." }, 400);
      }
      const accessToken = "microsoft_" + randomBytes(20).toString("base64url");
      const newRefreshToken = "r_microsoft_" + randomBytes(20).toString("base64url");
      const scopes = stored.scope ? stored.scope.split(/\s+/).filter(Boolean) : [];
      if (tokenMap) {
        tokenMap.set(accessToken, { login: user.email, id: user.id, scopes });
      }
      refreshMap.delete(refresh_token);
      refreshMap.set(newRefreshToken, {
        email: stored.email,
        clientId: stored.clientId,
        scope: stored.scope,
        nonce: stored.nonce
      });
      const idToken = await createIdToken(user, stored.clientId || client_id, stored.nonce, baseUrl);
      debug("microsoft.oauth", `[Microsoft refresh] issued new token for ${user.email}`);
      return c.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: stored.scope || "openid email profile",
        refresh_token: newRefreshToken,
        id_token: idToken
      });
    }
    if (grant_type === "client_credentials") {
      const clientError = validateClientCredentials();
      if (clientError) return clientError;
      const accessToken = "microsoft_" + randomBytes(20).toString("base64url");
      const scopes = scope ? scope.split(/\s+/).filter(Boolean) : [".default"];
      if (tokenMap) {
        tokenMap.set(accessToken, { login: client_id, id: 0, scopes });
      }
      debug("microsoft.oauth", `[Microsoft client_credentials] issued token for ${client_id}`);
      return c.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: scope || ".default"
      });
    }
    return c.json(
      {
        error: "unsupported_grant_type",
        error_description: "Only authorization_code, refresh_token, and client_credentials are supported."
      },
      400
    );
  });
  app.get("/oidc/userinfo", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: "invalid_token", error_description: "Authentication required." }, 401);
    }
    const user = ms.users.findOneBy("email", authUser.login);
    if (!user) {
      return c.json({ error: "invalid_token", error_description: "User not found." }, 401);
    }
    return c.json({
      sub: user.oid,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      preferred_username: user.preferred_username
    });
  });
  app.get("/v1.0/me", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: { code: "InvalidAuthenticationToken", message: "Authentication required." } }, 401);
    }
    const user = ms.users.findOneBy("email", authUser.login);
    if (!user) {
      return c.json({ error: { code: "Request_ResourceNotFound", message: "User not found." } }, 404);
    }
    return c.json({
      "@odata.context": `${baseUrl}/v1.0/$metadata#users/$entity`,
      id: user.oid,
      displayName: user.name,
      givenName: user.given_name,
      surname: user.family_name,
      mail: user.email,
      userPrincipalName: user.preferred_username
    });
  });
  app.post("/:tenant/oauth2/token", async (c) => {
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
    const resource = typeof body.resource === "string" ? body.resource : "";
    if (resource && !body.scope) {
      const normalized = resource.endsWith("/") ? resource : resource + "/";
      body.scope = normalized + ".default";
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (key !== "resource" && typeof value === "string") {
        params.set(key, value);
      }
    }
    const v2Req = new Request(`${baseUrl}/oauth2/v2.0/token`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        ...c.req.header("Authorization") ? { Authorization: c.req.header("Authorization") } : {}
      }),
      body: params.toString()
    });
    return app.fetch(v2Req);
  });
  app.get("/v1.0/users/:id", (c) => {
    const userId = c.req.param("id");
    const user = ms.users.findOneBy("oid", userId);
    if (!user) {
      return c.json(
        {
          error: {
            code: "Request_ResourceNotFound",
            message: `Resource '${userId}' does not exist or one of its queried reference-property objects are not present.`
          }
        },
        404
      );
    }
    return c.json({
      "@odata.context": `${baseUrl}/v1.0/$metadata#users/$entity`,
      id: user.oid,
      displayName: user.name,
      givenName: user.given_name,
      surname: user.family_name,
      mail: user.email,
      userPrincipalName: user.preferred_username
    });
  });
  app.get("/oauth2/v2.0/logout", (c) => {
    const post_logout_redirect_uri = c.req.query("post_logout_redirect_uri");
    if (post_logout_redirect_uri) {
      const allClients = ms.oauthClients.all();
      if (allClients.length > 0) {
        const allowed = allClients.some((client) => matchesRedirectUri(post_logout_redirect_uri, client.redirect_uris));
        if (!allowed) {
          return c.text("Invalid post_logout_redirect_uri", 400);
        }
      }
      return c.redirect(post_logout_redirect_uri, 302);
    }
    return c.text("Logged out", 200);
  });
  app.post("/oauth2/v2.0/revoke", async (c) => {
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
function seedDefaults(store, _baseUrl) {
  const ms = getMicrosoftStore(store);
  ms.users.insert({
    oid: generateOid(),
    email: "testuser@outlook.com",
    name: "Test User",
    given_name: "Test",
    family_name: "User",
    email_verified: true,
    tenant_id: DEFAULT_TENANT_ID,
    preferred_username: "testuser@outlook.com"
  });
}
function seedFromConfig(store, _baseUrl, config) {
  const ms = getMicrosoftStore(store);
  if (config.users) {
    for (const u of config.users) {
      const existing = ms.users.findOneBy("email", u.email);
      if (existing) continue;
      const nameParts = (u.name ?? "").split(/\s+/);
      ms.users.insert({
        oid: generateOid(),
        email: u.email,
        name: u.name ?? u.email.split("@")[0],
        given_name: u.given_name ?? nameParts[0] ?? "",
        family_name: u.family_name ?? nameParts.slice(1).join(" ") ?? "",
        email_verified: true,
        tenant_id: u.tenant_id ?? DEFAULT_TENANT_ID,
        preferred_username: u.email
      });
    }
  }
  if (config.oauth_clients) {
    for (const client of config.oauth_clients) {
      const existing = ms.oauthClients.findOneBy("client_id", client.client_id);
      if (existing) continue;
      ms.oauthClients.insert({
        client_id: client.client_id,
        client_secret: client.client_secret,
        name: client.name,
        redirect_uris: client.redirect_uris,
        tenant_id: client.tenant_id ?? DEFAULT_TENANT_ID
      });
    }
  }
}
var microsoftPlugin = {
  name: "microsoft",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    oauthRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = microsoftPlugin;
export {
  index_default as default,
  getMicrosoftStore,
  microsoftPlugin,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-GJMSG6EZ.js.map
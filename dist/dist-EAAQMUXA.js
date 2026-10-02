import {
  createDefaultEmailAddress,
  createDefaultUser,
  generateClerkId,
  nowUnix,
  userDisplayName
} from "./chunk-WVQMFHQM.js";
import {
  SignJWT,
  exportJWK,
  generateKeyPair
} from "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// ../@emulators/clerk/dist/index.js
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
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
function getClerkStore(store) {
  return {
    users: store.collection("clerk.users", ["clerk_id", "username"]),
    emailAddresses: store.collection("clerk.emails", ["email_id", "user_id", "email_address"]),
    organizations: store.collection("clerk.orgs", ["clerk_id", "slug"]),
    memberships: store.collection("clerk.memberships", [
      "membership_id",
      "org_id",
      "user_id"
    ]),
    invitations: store.collection("clerk.invitations", ["invitation_id", "org_id"]),
    sessions: store.collection("clerk.sessions", ["clerk_id", "user_id"]),
    oauthApps: store.collection("clerk.oauth_apps", ["app_id", "client_id"])
  };
}
var keyPairPromise = generateKeyPair("RS256");
var KID = "emulate-clerk-1";
var CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("clerk.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("clerk.oauth.pendingCodes", map);
  }
  return map;
}
function isCodeExpired(code) {
  return Date.now() - code.createdAt > CODE_TTL_MS;
}
async function createSessionToken(store, user, sessionId, baseUrl, orgId, orgRole, orgSlug, orgPermissions) {
  const { privateKey } = await keyPairPromise;
  const now = Math.floor(Date.now() / 1e3);
  const claims = {
    sid: sessionId
  };
  if (orgId) {
    claims.org_id = orgId;
    claims.org_role = orgRole ?? "org:member";
    claims.org_slug = orgSlug;
    claims.org_permissions = orgPermissions ?? [];
  }
  if (Object.keys(user.public_metadata).length > 0) {
    claims.metadata = user.public_metadata;
  }
  return new SignJWT(claims).setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" }).setIssuer(baseUrl).setSubject(user.clerk_id).setIssuedAt(now).setNotBefore(now).setExpirationTime("1h").sign(privateKey);
}
function oauthRoutes({ app, store, baseUrl, tokenMap }) {
  const clerkStore = getClerkStore(store);
  const SERVICE_LABEL = "Clerk";
  app.get("/.well-known/openid-configuration", (c) => {
    return c.json({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      jwks_uri: `${baseUrl}/v1/jwks`,
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "profile", "email"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      claims_supported: [
        "sub",
        "iss",
        "aud",
        "exp",
        "iat",
        "nbf",
        "azp",
        "sid",
        "org_id",
        "org_role",
        "org_slug",
        "org_permissions"
      ],
      code_challenge_methods_supported: ["plain", "S256"]
    });
  });
  app.get("/v1/jwks", async (c) => {
    const { publicKey } = await keyPairPromise;
    const jwk = await exportJWK(publicKey);
    return c.json({
      keys: [{ ...jwk, kid: KID, use: "sig", alg: "RS256" }]
    });
  });
  app.get("/oauth/authorize", (c) => {
    const clientId = c.req.query("client_id") ?? "";
    const redirectUri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "openid profile email";
    const state = c.req.query("state") ?? "";
    const nonce = c.req.query("nonce") ?? "";
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
    const oauthApps = clerkStore.oauthApps.all();
    let appName = "";
    if (oauthApps.length > 0) {
      const oauthApp = oauthApps.find((a) => a.client_id === clientId);
      if (!oauthApp) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${clientId}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (!matchesRedirectUri(redirectUri, oauthApp.redirect_uris)) {
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
    const users = clerkStore.users.all();
    const buttons = users.map((user) => {
      const emails = clerkStore.emailAddresses.findBy("user_id", user.clerk_id);
      const primaryEmail = emails.find((e) => e.is_primary) ?? emails[0];
      return renderUserButton({
        letter: ((user.first_name ?? user.username ?? "?")[0] ?? "?").toUpperCase(),
        login: primaryEmail?.email_address ?? user.username ?? user.clerk_id,
        name: userDisplayName(user),
        email: primaryEmail?.email_address ?? "",
        formAction: "/oauth/authorize/callback",
        hiddenFields: {
          user_ref: user.clerk_id,
          redirect_uri: redirectUri,
          scope,
          state,
          nonce,
          client_id: clientId,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod
        }
      });
    }).join("\n");
    const subtitle = appName ? `Sign in to <strong>${escapeHtml(appName)}</strong> with your Clerk account.` : "Choose a seeded user to continue.";
    return c.html(
      renderCardPage(
        "Sign in with Clerk",
        subtitle,
        users.length > 0 ? buttons : '<p class="empty">No users in the emulator store.</p>',
        SERVICE_LABEL
      )
    );
  });
  app.post("/oauth/authorize/callback", async (c) => {
    const body = await c.req.parseBody();
    const userRef = bodyStr(body.user_ref);
    const redirectUri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope) || "openid profile email";
    const state = bodyStr(body.state);
    const nonce = bodyStr(body.nonce);
    const clientId = bodyStr(body.client_id);
    const codeChallenge = bodyStr(body.code_challenge);
    const codeChallengeMethod = bodyStr(body.code_challenge_method);
    if (!redirectUri) {
      return c.html(
        renderErrorPage("Missing redirect URI", "The redirect_uri parameter is required.", SERVICE_LABEL),
        400
      );
    }
    const user = clerkStore.users.findOneBy("clerk_id", userRef);
    if (!user) {
      return c.html(renderErrorPage("Unknown user", "The selected user is not available.", SERVICE_LABEL), 400);
    }
    const oauthApps = clerkStore.oauthApps.all();
    if (oauthApps.length > 0) {
      const oauthApp = oauthApps.find((a) => a.client_id === clientId);
      if (!oauthApp) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${clientId}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (!matchesRedirectUri(redirectUri, oauthApp.redirect_uris)) {
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
      userClerkId: user.clerk_id,
      scope,
      redirectUri,
      clientId,
      nonce: nonce || null,
      codeChallenge: codeChallenge || null,
      codeChallengeMethod: codeChallengeMethod || null,
      createdAt: Date.now()
    });
    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  });
  app.post("/oauth/token", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    let body = {};
    if (contentType.includes("application/json")) {
      try {
        const parsed = await c.req.json();
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "string") body[key] = value;
        }
      } catch {
        body = {};
      }
    } else {
      const raw = await c.req.text();
      body = Object.fromEntries(new URLSearchParams(raw));
    }
    const grantType = body.grant_type ?? "";
    const code = body.code ?? "";
    const redirectUri = body.redirect_uri ?? "";
    const codeVerifier = body.code_verifier;
    let clientId = body.client_id ?? "";
    let clientSecret = body.client_secret ?? "";
    const authHeader = c.req.header("Authorization") ?? "";
    if (authHeader.startsWith("Basic ")) {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      const sep = decoded.indexOf(":");
      if (sep !== -1) {
        if (!clientId) clientId = decodeURIComponent(decoded.slice(0, sep));
        if (!clientSecret) clientSecret = decodeURIComponent(decoded.slice(sep + 1));
      }
    }
    if (grantType !== "authorization_code") {
      return c.json(
        { error: "unsupported_grant_type", error_description: "Only authorization_code is supported." },
        400
      );
    }
    const pending = getPendingCodes(store).get(code);
    if (!pending || isCodeExpired(pending)) {
      if (pending) getPendingCodes(store).delete(code);
      return c.json({ error: "invalid_grant", error_description: "Authorization code is invalid or expired." }, 400);
    }
    if (redirectUri && redirectUri !== pending.redirectUri) {
      return c.json({ error: "invalid_grant", error_description: "redirect_uri does not match." }, 400);
    }
    const oauthApps = clerkStore.oauthApps.all();
    if (oauthApps.length > 0) {
      const oauthApp = oauthApps.find((a) => a.client_id === clientId);
      if (!oauthApp) {
        return c.json({ error: "invalid_client", error_description: "Unknown client." }, 401);
      }
      if (!oauthApp.is_public && !constantTimeSecretEqual(oauthApp.client_secret, clientSecret)) {
        return c.json({ error: "invalid_client", error_description: "Invalid client credentials." }, 401);
      }
    }
    if (pending.codeChallenge !== null) {
      if (!codeVerifier) {
        return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
      }
      const method = (pending.codeChallengeMethod ?? "plain").toLowerCase();
      if (method === "s256") {
        const { createHash } = await import("crypto");
        const expected = createHash("sha256").update(codeVerifier).digest("base64url");
        if (expected !== pending.codeChallenge) {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
      } else if (method === "plain") {
        if (codeVerifier !== pending.codeChallenge) {
          return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
        }
      }
    }
    const user = clerkStore.users.findOneBy("clerk_id", pending.userClerkId);
    if (!user) return c.json({ error: "invalid_grant", error_description: "Unknown user." }, 400);
    getPendingCodes(store).delete(code);
    const { generateClerkId: generateClerkId2, nowUnix: nowUnix2 } = await import("./helpers-LXLP3DFE-PEPB2NAS.js");
    const sessionId = generateClerkId2("sess_");
    const now = nowUnix2();
    clerkStore.sessions.insert({
      clerk_id: sessionId,
      user_id: user.clerk_id,
      client_id: clientId || "default",
      status: "active",
      last_active_at: now,
      expire_at: now + 86400,
      abandon_at: now + 604800,
      created_at_unix: now,
      updated_at_unix: now
    });
    const accessToken = `clerk_${randomBytes(20).toString("base64url")}`;
    tokenMap?.set(accessToken, {
      login: user.clerk_id,
      id: user.id,
      scopes: pending.scope.split(/\s+/).filter(Boolean)
    });
    const { privateKey } = await keyPairPromise;
    const nowSec = Math.floor(Date.now() / 1e3);
    const emails = clerkStore.emailAddresses.findBy("user_id", user.clerk_id);
    const primaryEmail = emails.find((e) => e.is_primary) ?? emails[0];
    const idToken = await new SignJWT({
      sid: sessionId,
      email: primaryEmail?.email_address,
      email_verified: primaryEmail?.verification_status === "verified",
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || void 0
    }).setProtectedHeader({ alg: "RS256", kid: KID, typ: "JWT" }).setIssuer(baseUrl).setSubject(user.clerk_id).setAudience(clientId || "default").setIssuedAt(nowSec).setExpirationTime("1h").sign(privateKey);
    return c.json({
      token_type: "Bearer",
      expires_in: 3600,
      access_token: accessToken,
      id_token: idToken,
      scope: pending.scope
    });
  });
  app.get("/oauth/userinfo", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: "invalid_token", error_description: "The access token is invalid." }, 401);
    }
    const user = clerkStore.users.findOneBy("clerk_id", authUser.login) ?? clerkStore.users.all()[0];
    if (!user) {
      return c.json({ error: "invalid_token", error_description: "User not found." }, 401);
    }
    const emails = clerkStore.emailAddresses.findBy("user_id", user.clerk_id);
    const primaryEmail = emails.find((e) => e.is_primary) ?? emails[0];
    return c.json({
      sub: user.clerk_id,
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || void 0,
      email: primaryEmail?.email_address,
      email_verified: primaryEmail?.verification_status === "verified",
      picture: user.image_url
    });
  });
}
function clerkError(c, status, code, message, longMessage, meta) {
  return c.json(
    {
      errors: [
        {
          code,
          message,
          long_message: longMessage ?? message,
          meta: meta ?? {}
        }
      ]
    },
    status
  );
}
function requireSecretKey(c, tokenMap) {
  const existing = c.get("authUser");
  if (existing) return existing;
  const authHeader = c.req.header("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith("sk_test_") || token.startsWith("sk_live_")) {
      const mapped = tokenMap?.get(token);
      if (mapped) {
        c.set("authUser", mapped);
        c.set("authToken", token);
        c.set("authScopes", mapped.scopes);
        return mapped;
      }
    }
  }
  return clerkError(c, 401, "UNAUTHORIZED", "Authentication failed", "Invalid or missing secret key");
}
function isAuthResponse(result) {
  return result instanceof Response;
}
function deletedResponse(objectType, objectId) {
  return {
    object: "deleted_object",
    id: objectId,
    slug: null,
    deleted: true
  };
}
function paginatedResponse(data, totalCount, limit, offset) {
  return {
    data,
    total_count: totalCount,
    has_more: offset + limit < totalCount
  };
}
function parsePagination(c) {
  const limit = Math.min(Math.max(Number.parseInt(c.req.query("limit") ?? "10", 10) || 10, 1), 500);
  const offset = Math.max(Number.parseInt(c.req.query("offset") ?? "0", 10) || 0, 0);
  return { limit, offset };
}
function userResponse(user, emailAddresses) {
  return {
    id: user.clerk_id,
    object: "user",
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    image_url: user.image_url ?? `https://img.clerk.com/preview?seed=${user.clerk_id}`,
    profile_image_url: user.profile_image_url ?? `https://img.clerk.com/preview?seed=${user.clerk_id}`,
    has_image: user.image_url !== null,
    primary_email_address_id: user.primary_email_address_id,
    primary_phone_number_id: user.primary_phone_number_id,
    primary_web3_wallet_id: null,
    email_addresses: emailAddresses.map(emailAddressResponse),
    phone_numbers: [],
    web3_wallets: [],
    external_accounts: [],
    saml_accounts: [],
    passkeys: [],
    password_enabled: user.password_enabled,
    totp_enabled: user.totp_enabled,
    backup_code_enabled: user.backup_code_enabled,
    two_factor_enabled: user.two_factor_enabled,
    banned: user.banned,
    locked: user.locked,
    external_id: user.external_id,
    public_metadata: user.public_metadata,
    private_metadata: user.private_metadata,
    unsafe_metadata: user.unsafe_metadata,
    last_sign_in_at: user.last_sign_in_at,
    last_active_at: user.last_active_at,
    created_at: user.created_at_unix,
    updated_at: user.updated_at_unix
  };
}
function emailAddressResponse(email) {
  return {
    id: email.email_id,
    object: "email_address",
    email_address: email.email_address,
    reserved: email.reserved,
    verification: {
      status: email.verification_status,
      strategy: email.verification_strategy
    },
    linked_to: [],
    created_at: email.created_at_unix,
    updated_at: email.updated_at_unix
  };
}
function organizationResponse(org) {
  return {
    id: org.clerk_id,
    object: "organization",
    name: org.name,
    slug: org.slug,
    image_url: org.image_url,
    has_image: org.image_url !== null,
    members_count: org.members_count,
    pending_invitations_count: org.pending_invitations_count,
    max_allowed_memberships: org.max_allowed_memberships,
    admin_delete_enabled: org.admin_delete_enabled,
    public_metadata: org.public_metadata,
    private_metadata: org.private_metadata,
    created_at: org.created_at_unix,
    updated_at: org.updated_at_unix
  };
}
function membershipResponse(membership, org, user, emailAddresses) {
  return {
    id: membership.membership_id,
    object: "organization_membership",
    role: membership.role,
    permissions: membership.permissions,
    public_metadata: membership.public_metadata,
    private_metadata: membership.private_metadata,
    organization: org ? organizationResponse(org) : null,
    public_user_data: user ? {
      user_id: user.clerk_id,
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      has_image: user.image_url !== null,
      identifier: emailAddresses.find((e) => e.is_primary)?.email_address ?? user.username ?? user.clerk_id
    } : null,
    created_at: membership.created_at_unix,
    updated_at: membership.updated_at_unix
  };
}
function invitationResponse(invitation) {
  return {
    id: invitation.invitation_id,
    object: "organization_invitation",
    email_address: invitation.email_address,
    role: invitation.role,
    status: invitation.status,
    organization_id: invitation.org_id,
    created_at: invitation.created_at_unix,
    updated_at: invitation.updated_at_unix
  };
}
function sessionResponse(session) {
  return {
    id: session.clerk_id,
    object: "session",
    user_id: session.user_id,
    client_id: session.client_id,
    status: session.status,
    last_active_at: session.last_active_at,
    expire_at: session.expire_at,
    abandon_at: session.abandon_at,
    created_at: session.created_at_unix,
    updated_at: session.updated_at_unix
  };
}
async function readJsonBody(c) {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object") return body;
    return {};
  } catch {
    return {};
  }
}
function userRoutes({ app, store, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/users", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const { limit, offset } = parsePagination(c);
    const query = c.req.query("query");
    const orderBy = c.req.query("order_by") ?? "-created_at";
    const emailFilter = c.req.queries("email_address");
    let users = cs.users.all();
    if (query) {
      const q = query.toLowerCase();
      users = users.filter((u) => {
        const emails = cs.emailAddresses.findBy("user_id", u.clerk_id);
        return u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || emails.some((e) => e.email_address.toLowerCase().includes(q));
      });
    }
    if (emailFilter && emailFilter.length > 0) {
      const emailSet = new Set(emailFilter.map((e) => e.toLowerCase()));
      users = users.filter((u) => {
        const emails = cs.emailAddresses.findBy("user_id", u.clerk_id);
        return emails.some((e) => emailSet.has(e.email_address.toLowerCase()));
      });
    }
    const desc = orderBy.startsWith("-");
    const field = orderBy.replace(/^-/, "");
    users.sort((a, b) => {
      const aVal = field === "created_at" ? a.created_at_unix : a.updated_at_unix;
      const bVal = field === "created_at" ? b.created_at_unix : b.updated_at_unix;
      return desc ? bVal - aVal : aVal - bVal;
    });
    const totalCount = users.length;
    const paged = users.slice(offset, offset + limit);
    const data = paged.map((u) => {
      const emails = cs.emailAddresses.findBy("user_id", u.clerk_id);
      return userResponse(u, emails);
    });
    return c.json(paginatedResponse(data, totalCount, limit, offset));
  });
  app.get("/v1/users/count", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    return c.json({ object: "total_count", total_count: cs.users.all().length });
  });
  app.get("/v1/users/:userId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const emails = cs.emailAddresses.findBy("user_id", user.clerk_id);
    return c.json(userResponse(user, emails));
  });
  app.post("/v1/users", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const body = await readJsonBody(c);
    const now = nowUnix();
    const clerkId = generateClerkId("user_");
    const user = cs.users.insert({
      clerk_id: clerkId,
      username: body.username ?? null,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      image_url: null,
      profile_image_url: null,
      external_id: body.external_id ?? null,
      primary_email_address_id: null,
      primary_phone_number_id: null,
      password_enabled: typeof body.password === "string" && body.password.length > 0,
      password_hash: body.password ?? null,
      totp_enabled: false,
      backup_code_enabled: false,
      two_factor_enabled: false,
      banned: false,
      locked: false,
      public_metadata: body.public_metadata ?? {},
      private_metadata: body.private_metadata ?? {},
      unsafe_metadata: body.unsafe_metadata ?? {},
      last_active_at: null,
      last_sign_in_at: null,
      created_at_unix: now,
      updated_at_unix: now
    });
    const emailAddr = body.email_address ?? [];
    const emailList = Array.isArray(emailAddr) ? emailAddr : [emailAddr];
    let primaryEmailId = null;
    for (let i = 0; i < emailList.length; i++) {
      const email = cs.emailAddresses.insert({
        email_id: generateClerkId("idn_"),
        email_address: emailList[i],
        user_id: clerkId,
        verification_status: "verified",
        verification_strategy: "email_code",
        is_primary: i === 0,
        reserved: false,
        created_at_unix: now,
        updated_at_unix: now
      });
      if (i === 0) primaryEmailId = email.email_id;
    }
    if (primaryEmailId) {
      cs.users.update(user.id, { primary_email_address_id: primaryEmailId });
    }
    const emails = cs.emailAddresses.findBy("user_id", clerkId);
    const updatedUser = cs.users.findOneBy("clerk_id", clerkId);
    return c.json(userResponse(updatedUser, emails), 200);
  });
  app.patch("/v1/users/:userId", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.first_name !== void 0) patch.first_name = body.first_name;
    if (body.last_name !== void 0) patch.last_name = body.last_name;
    if (body.username !== void 0) patch.username = body.username;
    if (body.external_id !== void 0) patch.external_id = body.external_id;
    if (body.primary_email_address_id !== void 0)
      patch.primary_email_address_id = body.primary_email_address_id;
    if (body.primary_phone_number_id !== void 0)
      patch.primary_phone_number_id = body.primary_phone_number_id;
    if (body.public_metadata !== void 0) patch.public_metadata = body.public_metadata;
    if (body.private_metadata !== void 0) patch.private_metadata = body.private_metadata;
    if (body.unsafe_metadata !== void 0) patch.unsafe_metadata = body.unsafe_metadata;
    if (typeof body.password === "string") {
      patch.password_enabled = body.password.length > 0;
      patch.password_hash = body.password;
    }
    cs.users.update(user.id, patch);
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.delete("/v1/users/:userId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    for (const email of cs.emailAddresses.findBy("user_id", userId)) {
      cs.emailAddresses.delete(email.id);
    }
    for (const membership of cs.memberships.findBy("user_id", userId)) {
      cs.memberships.delete(membership.id);
      const org = cs.organizations.findOneBy("clerk_id", membership.org_id);
      if (org) cs.organizations.update(org.id, { members_count: Math.max(0, org.members_count - 1) });
    }
    for (const session of cs.sessions.findBy("user_id", userId)) {
      cs.sessions.delete(session.id);
    }
    cs.users.delete(user.id);
    return c.json(deletedResponse("user", userId));
  });
  app.post("/v1/users/:userId/ban", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    cs.users.update(user.id, { banned: true, updated_at_unix: nowUnix() });
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.post("/v1/users/:userId/unban", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    cs.users.update(user.id, { banned: false, updated_at_unix: nowUnix() });
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.post("/v1/users/:userId/lock", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    cs.users.update(user.id, { locked: true, updated_at_unix: nowUnix() });
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.post("/v1/users/:userId/unlock", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    cs.users.update(user.id, { locked: false, updated_at_unix: nowUnix() });
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.patch("/v1/users/:userId/metadata", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const body = await readJsonBody(c);
    const patch = { updated_at_unix: nowUnix() };
    if (body.public_metadata !== void 0) {
      patch.public_metadata = { ...user.public_metadata, ...body.public_metadata };
    }
    if (body.private_metadata !== void 0) {
      patch.private_metadata = { ...user.private_metadata, ...body.private_metadata };
    }
    if (body.unsafe_metadata !== void 0) {
      patch.unsafe_metadata = { ...user.unsafe_metadata, ...body.unsafe_metadata };
    }
    cs.users.update(user.id, patch);
    const updated = cs.users.findOneBy("clerk_id", userId);
    const emails = cs.emailAddresses.findBy("user_id", userId);
    return c.json(userResponse(updated, emails));
  });
  app.post("/v1/users/:userId/verify_password", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const userId = c.req.param("userId");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const body = await readJsonBody(c);
    const password = body.password;
    const verified = user.password_hash === password;
    return c.json({ object: "verification", verified });
  });
}
function emailAddressRoutes({ app, store, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/email_addresses/:emailId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const emailId = c.req.param("emailId");
    const email = cs.emailAddresses.findOneBy("email_id", emailId);
    if (!email) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Email address not found");
    return c.json(emailAddressResponse(email));
  });
  app.post("/v1/email_addresses", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const body = await readJsonBody(c);
    const userId = body.user_id;
    const emailAddr = body.email_address;
    const verified = body.verified ?? false;
    const primary = body.primary ?? false;
    if (!userId || !emailAddr) {
      return clerkError(c, 422, "INVALID_REQUEST_BODY", "user_id and email_address are required");
    }
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const now = nowUnix();
    const email = cs.emailAddresses.insert({
      email_id: generateClerkId("idn_"),
      email_address: emailAddr,
      user_id: userId,
      verification_status: verified ? "verified" : "unverified",
      verification_strategy: "email_code",
      is_primary: primary,
      reserved: false,
      created_at_unix: now,
      updated_at_unix: now
    });
    if (primary) {
      for (const existing of cs.emailAddresses.findBy("user_id", userId)) {
        if (existing.email_id !== email.email_id && existing.is_primary) {
          cs.emailAddresses.update(existing.id, { is_primary: false });
        }
      }
      cs.users.update(user.id, { primary_email_address_id: email.email_id, updated_at_unix: now });
    }
    return c.json(emailAddressResponse(email), 200);
  });
  app.patch("/v1/email_addresses/:emailId", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const emailId = c.req.param("emailId");
    const email = cs.emailAddresses.findOneBy("email_id", emailId);
    if (!email) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Email address not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.verified !== void 0) {
      patch.verification_status = body.verified ? "verified" : "unverified";
    }
    if (body.primary === true) {
      patch.is_primary = true;
      for (const existing of cs.emailAddresses.findBy("user_id", email.user_id)) {
        if (existing.email_id !== emailId && existing.is_primary) {
          cs.emailAddresses.update(existing.id, { is_primary: false });
        }
      }
      const user = cs.users.findOneBy("clerk_id", email.user_id);
      if (user) cs.users.update(user.id, { primary_email_address_id: emailId, updated_at_unix: now });
    }
    cs.emailAddresses.update(email.id, patch);
    const updated = cs.emailAddresses.findOneBy("email_id", emailId);
    return c.json(emailAddressResponse(updated));
  });
  app.delete("/v1/email_addresses/:emailId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const emailId = c.req.param("emailId");
    const email = cs.emailAddresses.findOneBy("email_id", emailId);
    if (!email) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Email address not found");
    cs.emailAddresses.delete(email.id);
    if (email.is_primary) {
      const remaining = cs.emailAddresses.findBy("user_id", email.user_id);
      const user = cs.users.findOneBy("clerk_id", email.user_id);
      if (user) {
        const newPrimary = remaining[0];
        if (newPrimary) {
          cs.emailAddresses.update(newPrimary.id, { is_primary: true });
          cs.users.update(user.id, { primary_email_address_id: newPrimary.email_id });
        } else {
          cs.users.update(user.id, { primary_email_address_id: null });
        }
      }
    }
    return c.json(deletedResponse("email_address", emailId));
  });
}
function organizationRoutes({ app, store, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/organizations", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const { limit, offset } = parsePagination(c);
    const query = c.req.query("query");
    let orgs = cs.organizations.all();
    if (query) {
      const q = query.toLowerCase();
      orgs = orgs.filter((o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
    }
    orgs.sort((a, b) => b.created_at_unix - a.created_at_unix);
    const totalCount = orgs.length;
    const paged = orgs.slice(offset, offset + limit);
    return c.json(paginatedResponse(paged.map(organizationResponse), totalCount, limit, offset));
  });
  app.get("/v1/organizations/:orgId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId) ?? cs.organizations.findOneBy("slug", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    return c.json(organizationResponse(org));
  });
  app.post("/v1/organizations", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const body = await readJsonBody(c);
    const name = body.name;
    if (!name) return clerkError(c, 422, "INVALID_REQUEST_BODY", "name is required");
    const slug = body.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = nowUnix();
    const org = cs.organizations.insert({
      clerk_id: generateClerkId("org_"),
      name,
      slug,
      image_url: null,
      has_logo: false,
      members_count: 0,
      pending_invitations_count: 0,
      public_metadata: body.public_metadata ?? {},
      private_metadata: body.private_metadata ?? {},
      max_allowed_memberships: body.max_allowed_memberships ?? null,
      admin_delete_enabled: body.admin_delete_enabled ?? true,
      created_at_unix: now,
      updated_at_unix: now
    });
    if (body.created_by) {
      const userId = body.created_by;
      const user = cs.users.findOneBy("clerk_id", userId);
      if (user) {
        cs.memberships.insert({
          membership_id: generateClerkId("orgmem_"),
          org_id: org.clerk_id,
          user_id: userId,
          role: "org:admin",
          permissions: [
            "org:sys_profile:manage",
            "org:sys_profile:delete",
            "org:sys_memberships:read",
            "org:sys_memberships:manage",
            "org:sys_domains:read",
            "org:sys_domains:manage"
          ],
          public_metadata: {},
          private_metadata: {},
          created_at_unix: now,
          updated_at_unix: now
        });
        cs.organizations.update(org.id, { members_count: 1 });
      }
    }
    const updated = cs.organizations.findOneBy("clerk_id", org.clerk_id);
    return c.json(organizationResponse(updated), 200);
  });
  app.patch("/v1/organizations/:orgId", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.name !== void 0) patch.name = body.name;
    if (body.slug !== void 0) patch.slug = body.slug;
    if (body.public_metadata !== void 0) patch.public_metadata = body.public_metadata;
    if (body.private_metadata !== void 0) patch.private_metadata = body.private_metadata;
    if (body.max_allowed_memberships !== void 0) patch.max_allowed_memberships = body.max_allowed_memberships;
    if (body.admin_delete_enabled !== void 0) patch.admin_delete_enabled = body.admin_delete_enabled;
    cs.organizations.update(org.id, patch);
    const updated = cs.organizations.findOneBy("clerk_id", orgId);
    return c.json(organizationResponse(updated));
  });
  app.delete("/v1/organizations/:orgId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    for (const m of cs.memberships.findBy("org_id", orgId)) cs.memberships.delete(m.id);
    for (const inv of cs.invitations.findBy("org_id", orgId)) cs.invitations.delete(inv.id);
    cs.organizations.delete(org.id);
    return c.json(deletedResponse("organization", orgId));
  });
  app.patch("/v1/organizations/:orgId/metadata", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.public_metadata !== void 0) {
      patch.public_metadata = { ...org.public_metadata, ...body.public_metadata };
    }
    if (body.private_metadata !== void 0) {
      patch.private_metadata = { ...org.private_metadata, ...body.private_metadata };
    }
    cs.organizations.update(org.id, patch);
    const updated = cs.organizations.findOneBy("clerk_id", orgId);
    return c.json(organizationResponse(updated));
  });
}
function defaultPermissions(role) {
  if (role === "org:admin") {
    return [
      "org:sys_profile:manage",
      "org:sys_profile:delete",
      "org:sys_memberships:read",
      "org:sys_memberships:manage",
      "org:sys_domains:read",
      "org:sys_domains:manage"
    ];
  }
  return ["org:sys_memberships:read"];
}
function membershipRoutes({ app, store, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/organizations/:orgId/memberships", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const { limit, offset } = parsePagination(c);
    const roleFilter = c.req.query("role");
    let memberships = cs.memberships.findBy("org_id", orgId);
    if (roleFilter) {
      memberships = memberships.filter((m) => m.role === roleFilter);
    }
    const totalCount = memberships.length;
    const paged = memberships.slice(offset, offset + limit);
    const data = paged.map((m) => {
      const user = cs.users.findOneBy("clerk_id", m.user_id);
      const emails = user ? cs.emailAddresses.findBy("user_id", user.clerk_id) : [];
      return membershipResponse(m, org, user, emails);
    });
    return c.json(paginatedResponse(data, totalCount, limit, offset));
  });
  app.post("/v1/organizations/:orgId/memberships", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const body = await readJsonBody(c);
    const userId = body.user_id;
    const role = body.role ?? "org:member";
    if (!userId) return clerkError(c, 422, "INVALID_REQUEST_BODY", "user_id is required");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const existing = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    if (existing) return clerkError(c, 422, "DUPLICATE_RECORD", "User is already a member of this organization");
    const now = nowUnix();
    const membership = cs.memberships.insert({
      membership_id: generateClerkId("orgmem_"),
      org_id: orgId,
      user_id: userId,
      role,
      permissions: defaultPermissions(role),
      public_metadata: {},
      private_metadata: {},
      created_at_unix: now,
      updated_at_unix: now
    });
    cs.organizations.update(org.id, { members_count: org.members_count + 1, updated_at_unix: now });
    const emails = cs.emailAddresses.findBy("user_id", userId);
    const updatedOrg = cs.organizations.findOneBy("clerk_id", orgId);
    return c.json(membershipResponse(membership, updatedOrg, user, emails), 200);
  });
  app.patch("/v1/organizations/:orgId/memberships/:userId", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const userId = c.req.param("userId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const membership = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    if (!membership) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Membership not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.role !== void 0) {
      patch.role = body.role;
      patch.permissions = defaultPermissions(body.role);
    }
    cs.memberships.update(membership.id, patch);
    const updated = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    const user = cs.users.findOneBy("clerk_id", userId);
    const emails = user ? cs.emailAddresses.findBy("user_id", userId) : [];
    return c.json(membershipResponse(updated, org, user, emails));
  });
  app.delete("/v1/organizations/:orgId/memberships/:userId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const userId = c.req.param("userId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const membership = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    if (!membership) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Membership not found");
    cs.memberships.delete(membership.id);
    cs.organizations.update(org.id, { members_count: Math.max(0, org.members_count - 1), updated_at_unix: nowUnix() });
    return c.json(deletedResponse("organization_membership", membership.membership_id));
  });
  app.patch("/v1/organizations/:orgId/memberships/:userId/metadata", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const userId = c.req.param("userId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const membership = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    if (!membership) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Membership not found");
    const body = await readJsonBody(c);
    const now = nowUnix();
    const patch = { updated_at_unix: now };
    if (body.public_metadata !== void 0) {
      patch.public_metadata = { ...membership.public_metadata, ...body.public_metadata };
    }
    if (body.private_metadata !== void 0) {
      patch.private_metadata = {
        ...membership.private_metadata,
        ...body.private_metadata
      };
    }
    cs.memberships.update(membership.id, patch);
    const updated = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === userId);
    const user = cs.users.findOneBy("clerk_id", userId);
    const emails = user ? cs.emailAddresses.findBy("user_id", userId) : [];
    return c.json(membershipResponse(updated, org, user, emails));
  });
}
function invitationRoutes({ app, store, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/organizations/:orgId/invitations", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const { limit, offset } = parsePagination(c);
    const statusFilter = c.req.query("status");
    let invitations = cs.invitations.findBy("org_id", orgId);
    if (statusFilter) {
      invitations = invitations.filter((inv) => inv.status === statusFilter);
    }
    const totalCount = invitations.length;
    const paged = invitations.slice(offset, offset + limit);
    return c.json(paginatedResponse(paged.map(invitationResponse), totalCount, limit, offset));
  });
  app.get("/v1/organizations/:orgId/invitations/:invitationId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const invitationId = c.req.param("invitationId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const invitation = cs.invitations.findOneBy("invitation_id", invitationId);
    if (!invitation || invitation.org_id !== orgId) {
      return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Invitation not found");
    }
    return c.json(invitationResponse(invitation));
  });
  app.post("/v1/organizations/:orgId/invitations", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const body = await readJsonBody(c);
    const emailAddress = body.email_address;
    if (!emailAddress) return clerkError(c, 422, "INVALID_REQUEST_BODY", "email_address is required");
    const role = body.role ?? "org:member";
    const expiresInDays = body.expires_in_days ?? 30;
    const now = nowUnix();
    const invitation = cs.invitations.insert({
      invitation_id: generateClerkId("orginv_"),
      email_address: emailAddress,
      org_id: orgId,
      role,
      status: "pending",
      expires_at: now + expiresInDays * 86400,
      created_at_unix: now,
      updated_at_unix: now
    });
    cs.organizations.update(org.id, {
      pending_invitations_count: org.pending_invitations_count + 1,
      updated_at_unix: now
    });
    return c.json(invitationResponse(invitation), 200);
  });
  app.post("/v1/organizations/:orgId/invitations/bulk", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const body = await readJsonBody(c);
    const emailAddresses = body.email_addresses;
    if (!emailAddresses || !Array.isArray(emailAddresses)) {
      return clerkError(c, 422, "INVALID_REQUEST_BODY", "email_addresses array is required");
    }
    const role = body.role ?? "org:member";
    const expiresInDays = body.expires_in_days ?? 30;
    const now = nowUnix();
    const created = emailAddresses.map(
      (email) => cs.invitations.insert({
        invitation_id: generateClerkId("orginv_"),
        email_address: email,
        org_id: orgId,
        role,
        status: "pending",
        expires_at: now + expiresInDays * 86400,
        created_at_unix: now,
        updated_at_unix: now
      })
    );
    cs.organizations.update(org.id, {
      pending_invitations_count: org.pending_invitations_count + created.length,
      updated_at_unix: now
    });
    return c.json(created.map(invitationResponse));
  });
  app.post("/v1/organizations/:orgId/invitations/:invitationId/revoke", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const orgId = c.req.param("orgId");
    const invitationId = c.req.param("invitationId");
    const org = cs.organizations.findOneBy("clerk_id", orgId);
    if (!org) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Organization not found");
    const invitation = cs.invitations.findOneBy("invitation_id", invitationId);
    if (!invitation || invitation.org_id !== orgId) {
      return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Invitation not found");
    }
    if (invitation.status !== "pending") {
      return clerkError(c, 422, "INVALID_REQUEST_BODY", "Only pending invitations can be revoked");
    }
    const now = nowUnix();
    cs.invitations.update(invitation.id, { status: "revoked", updated_at_unix: now });
    cs.organizations.update(org.id, {
      pending_invitations_count: Math.max(0, org.pending_invitations_count - 1),
      updated_at_unix: now
    });
    const updated = cs.invitations.findOneBy("invitation_id", invitationId);
    return c.json(invitationResponse(updated));
  });
}
function sessionRoutes({ app, store, baseUrl, tokenMap }) {
  const cs = getClerkStore(store);
  app.get("/v1/sessions", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const { limit, offset } = parsePagination(c);
    const userIdFilter = c.req.query("user_id");
    let sessions = cs.sessions.all();
    if (userIdFilter) {
      sessions = sessions.filter((s) => s.user_id === userIdFilter);
    }
    sessions.sort((a, b) => b.created_at_unix - a.created_at_unix);
    const totalCount = sessions.length;
    const paged = sessions.slice(offset, offset + limit);
    return c.json(paginatedResponse(paged.map(sessionResponse), totalCount, limit, offset));
  });
  app.get("/v1/sessions/:sessionId", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const sessionId = c.req.param("sessionId");
    const session = cs.sessions.findOneBy("clerk_id", sessionId);
    if (!session) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Session not found");
    return c.json(sessionResponse(session));
  });
  app.post("/v1/sessions", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const body = await readJsonBody(c);
    const userId = body.user_id;
    if (!userId) return clerkError(c, 422, "INVALID_REQUEST_BODY", "user_id is required");
    const user = cs.users.findOneBy("clerk_id", userId);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const now = nowUnix();
    const session = cs.sessions.insert({
      clerk_id: generateClerkId("sess_"),
      user_id: userId,
      client_id: body.client_id ?? "client_emulate",
      status: "active",
      last_active_at: now,
      expire_at: now + 86400,
      abandon_at: now + 604800,
      created_at_unix: now,
      updated_at_unix: now
    });
    cs.users.update(user.id, { last_active_at: now, last_sign_in_at: now, updated_at_unix: now });
    return c.json(sessionResponse(session), 200);
  });
  app.post("/v1/sessions/:sessionId/revoke", (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const sessionId = c.req.param("sessionId");
    const session = cs.sessions.findOneBy("clerk_id", sessionId);
    if (!session) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Session not found");
    cs.sessions.update(session.id, { status: "revoked", updated_at_unix: nowUnix() });
    const updated = cs.sessions.findOneBy("clerk_id", sessionId);
    return c.json(sessionResponse(updated));
  });
  app.post("/v1/sessions/:sessionId/tokens", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const sessionId = c.req.param("sessionId");
    const session = cs.sessions.findOneBy("clerk_id", sessionId);
    if (!session) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Session not found");
    if (session.status !== "active") {
      return clerkError(c, 422, "SESSION_NOT_ACTIVE", "Session is not active");
    }
    const user = cs.users.findOneBy("clerk_id", session.user_id);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const memberships = cs.memberships.findBy("user_id", user.clerk_id);
    const firstMembership = memberships[0];
    let orgId;
    let orgRole;
    let orgSlug;
    let orgPermissions;
    if (firstMembership) {
      const org = cs.organizations.findOneBy("clerk_id", firstMembership.org_id);
      if (org) {
        orgId = org.clerk_id;
        orgRole = firstMembership.role;
        orgSlug = org.slug;
        orgPermissions = firstMembership.permissions;
      }
    }
    const jwt = await createSessionToken(store, user, sessionId, baseUrl, orgId, orgRole, orgSlug, orgPermissions);
    cs.sessions.update(session.id, { last_active_at: nowUnix() });
    return c.json({ object: "token", jwt });
  });
  app.post("/v1/sessions/:sessionId/tokens/:template", async (c) => {
    const auth = requireSecretKey(c, tokenMap);
    if (isAuthResponse(auth)) return auth;
    const sessionId = c.req.param("sessionId");
    const session = cs.sessions.findOneBy("clerk_id", sessionId);
    if (!session) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "Session not found");
    if (session.status !== "active") {
      return clerkError(c, 422, "SESSION_NOT_ACTIVE", "Session is not active");
    }
    const user = cs.users.findOneBy("clerk_id", session.user_id);
    if (!user) return clerkError(c, 404, "RESOURCE_NOT_FOUND", "User not found");
    const jwt = await createSessionToken(store, user, sessionId, baseUrl);
    cs.sessions.update(session.id, { last_active_at: nowUnix() });
    return c.json({ object: "token", jwt });
  });
}
function seedDefaults(store, _baseUrl) {
  const cs = getClerkStore(store);
  if (cs.users.all().length > 0) return;
  const userInput = createDefaultUser();
  const user = cs.users.insert(userInput);
  const email = cs.emailAddresses.insert(createDefaultEmailAddress(user.clerk_id, "test@example.com", true));
  cs.users.update(user.id, { primary_email_address_id: email.email_id });
  const now = nowUnix();
  cs.oauthApps.insert({
    app_id: generateClerkId("oauth_app_"),
    name: "Emulate App",
    client_id: "clerk_emulate_client",
    client_secret: "clerk_emulate_secret",
    is_public: false,
    scopes: ["openid", "profile", "email"],
    redirect_uris: ["http://localhost:3000/api/auth/callback/clerk"],
    created_at_unix: now,
    updated_at_unix: now
  });
}
function seedFromConfig(store, _baseUrl, config) {
  const cs = getClerkStore(store);
  const now = nowUnix();
  if (config.users) {
    for (const userCfg of config.users) {
      const existingEmail = userCfg.email_addresses?.[0];
      if (existingEmail) {
        const found = cs.emailAddresses.findOneBy("email_address", existingEmail);
        if (found) continue;
      }
      const clerkId = userCfg.clerk_id ?? generateClerkId("user_");
      const user = cs.users.insert({
        clerk_id: clerkId,
        username: userCfg.username ?? null,
        first_name: userCfg.first_name ?? "Test",
        last_name: userCfg.last_name ?? "User",
        image_url: null,
        profile_image_url: null,
        external_id: userCfg.external_id ?? null,
        primary_email_address_id: null,
        primary_phone_number_id: null,
        password_enabled: typeof userCfg.password === "string" && userCfg.password.length > 0,
        password_hash: userCfg.password ?? null,
        totp_enabled: false,
        backup_code_enabled: false,
        two_factor_enabled: false,
        banned: false,
        locked: false,
        public_metadata: userCfg.public_metadata ?? {},
        private_metadata: userCfg.private_metadata ?? {},
        unsafe_metadata: userCfg.unsafe_metadata ?? {},
        last_active_at: null,
        last_sign_in_at: null,
        created_at_unix: now,
        updated_at_unix: now
      });
      let primaryEmailId = null;
      if (userCfg.email_addresses) {
        for (let i = 0; i < userCfg.email_addresses.length; i++) {
          const email = cs.emailAddresses.insert(
            createDefaultEmailAddress(clerkId, userCfg.email_addresses[i], i === 0)
          );
          if (i === 0) primaryEmailId = email.email_id;
        }
      }
      if (primaryEmailId) {
        cs.users.update(user.id, { primary_email_address_id: primaryEmailId });
      }
    }
  }
  if (config.organizations) {
    for (const orgCfg of config.organizations) {
      const existingSlug = orgCfg.slug ?? orgCfg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existing = cs.organizations.findOneBy("slug", existingSlug);
      if (existing) continue;
      const orgId = orgCfg.clerk_id ?? generateClerkId("org_");
      const org = cs.organizations.insert({
        clerk_id: orgId,
        name: orgCfg.name,
        slug: existingSlug,
        image_url: null,
        has_logo: false,
        members_count: 0,
        pending_invitations_count: 0,
        public_metadata: orgCfg.public_metadata ?? {},
        private_metadata: orgCfg.private_metadata ?? {},
        max_allowed_memberships: orgCfg.max_allowed_memberships ?? null,
        admin_delete_enabled: true,
        created_at_unix: now,
        updated_at_unix: now
      });
      if (orgCfg.members) {
        let memberCount = 0;
        for (const memberCfg of orgCfg.members) {
          const emailEntry = cs.emailAddresses.findOneBy("email_address", memberCfg.email);
          if (!emailEntry) continue;
          const user = cs.users.findOneBy("clerk_id", emailEntry.user_id);
          if (!user) continue;
          const existingMembership = cs.memberships.findBy("org_id", orgId).find((m) => m.user_id === user.clerk_id);
          if (existingMembership) continue;
          const role = memberCfg.role.startsWith("org:") ? memberCfg.role : `org:${memberCfg.role}`;
          cs.memberships.insert({
            membership_id: generateClerkId("orgmem_"),
            org_id: orgId,
            user_id: user.clerk_id,
            role,
            permissions: role === "org:admin" ? [
              "org:sys_profile:manage",
              "org:sys_profile:delete",
              "org:sys_memberships:read",
              "org:sys_memberships:manage"
            ] : ["org:sys_memberships:read"],
            public_metadata: {},
            private_metadata: {},
            created_at_unix: now,
            updated_at_unix: now
          });
          memberCount++;
        }
        cs.organizations.update(org.id, { members_count: memberCount });
      }
    }
  }
  if (config.oauth_applications) {
    for (const appCfg of config.oauth_applications) {
      const existing = cs.oauthApps.findOneBy("client_id", appCfg.client_id);
      if (existing) continue;
      cs.oauthApps.insert({
        app_id: generateClerkId("oauth_app_"),
        name: appCfg.name,
        client_id: appCfg.client_id,
        client_secret: appCfg.client_secret ?? "",
        is_public: appCfg.public ?? false,
        scopes: appCfg.scopes ?? ["openid", "profile", "email"],
        redirect_uris: appCfg.redirect_uris,
        created_at_unix: now,
        updated_at_unix: now
      });
    }
  }
}
var clerkPlugin = {
  name: "clerk",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    oauthRoutes(ctx);
    userRoutes(ctx);
    emailAddressRoutes(ctx);
    organizationRoutes(ctx);
    membershipRoutes(ctx);
    invitationRoutes(ctx);
    sessionRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = clerkPlugin;
export {
  clerkPlugin,
  index_default as default,
  getClerkStore,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-EAAQMUXA.js.map
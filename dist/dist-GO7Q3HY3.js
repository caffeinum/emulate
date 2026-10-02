import "./chunk-PZ5AY32C.js";

// ../@emulators/vercel/dist/index.js
import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
import { createHash as createHash2, randomBytes as randomBytes2 } from "crypto";
import { randomBytes as randomBytes3 } from "crypto";
import { createHash as createHash3, randomBytes as randomBytes4 } from "crypto";
function getVercelStore(store) {
  return {
    users: store.collection("vercel.users", ["uid", "username"]),
    teams: store.collection("vercel.teams", ["uid", "slug"]),
    teamMembers: store.collection("vercel.team_members", ["teamId", "userId"]),
    projects: store.collection("vercel.projects", ["uid", "name", "accountId"]),
    deployments: store.collection("vercel.deployments", ["uid", "projectId", "url"]),
    deploymentAliases: store.collection("vercel.deployment_aliases", [
      "deploymentId",
      "projectId"
    ]),
    builds: store.collection("vercel.builds", ["deploymentId"]),
    deploymentEvents: store.collection("vercel.deployment_events", ["deploymentId"]),
    files: store.collection("vercel.files", ["digest"]),
    deploymentFiles: store.collection("vercel.deployment_files", ["deploymentId"]),
    domains: store.collection("vercel.domains", ["projectId", "name"]),
    envVars: store.collection("vercel.env_vars", ["projectId", "uid"]),
    protectionBypasses: store.collection("vercel.protection_bypasses", ["projectId"]),
    apiKeys: store.collection("vercel.api_keys", ["uid", "teamId", "userId"]),
    integrations: store.collection("vercel.integrations", ["client_id"]),
    blobs: store.collection("vercel.blobs", ["pathname", "storeId"])
  };
}
function generateUid(prefix = "") {
  const id = randomBytes(12).toString("base64url").slice(0, 20);
  return prefix ? `${prefix}_${id}` : id;
}
function stableUid(prefix, seedKey) {
  const id = createHash("sha256").update(seedKey).digest("base64url").slice(0, 20);
  return `${prefix}_${id}`;
}
function generateSecret() {
  return randomBytes(32).toString("base64url");
}
function nowMs() {
  return Date.now();
}
function resolveTeamScope(c, vs) {
  const teamId = c.req.query("teamId");
  const slug = c.req.query("slug");
  if (teamId) {
    const team = vs.teams.findOneBy("uid", teamId);
    if (!team) return null;
    return { accountId: team.uid, team };
  }
  if (slug) {
    const team = vs.teams.findOneBy("slug", slug);
    if (!team) return null;
    return { accountId: team.uid, team };
  }
  const authUser = c.get("authUser");
  if (!authUser) return null;
  const user = vs.users.findOneBy("username", authUser.login);
  if (!user) return null;
  return { accountId: user.uid, team: null };
}
function lookupProject(vs, idOrName, accountId) {
  const project = vs.projects.findOneBy("uid", idOrName);
  if (project && project.accountId === accountId) return project;
  const byName = vs.projects.findBy("name", idOrName);
  return byName.find((p) => p.accountId === accountId);
}
function parseCursorPagination(c) {
  return {
    limit: Math.min(100, Math.max(1, parseInt(c.req.query("limit") ?? "20", 10) || 20)),
    since: c.req.query("since") ? parseInt(c.req.query("since"), 10) : void 0,
    until: c.req.query("until") ? parseInt(c.req.query("until"), 10) : void 0,
    from: c.req.query("from") ? parseInt(c.req.query("from"), 10) : void 0
  };
}
function applyCursorPagination(items, pagination) {
  let filtered = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (pagination.since !== void 0) {
    filtered = filtered.filter((i) => new Date(i.created_at).getTime() > pagination.since);
  }
  if (pagination.until !== void 0) {
    filtered = filtered.filter((i) => new Date(i.created_at).getTime() <= pagination.until);
  }
  const total = filtered.length;
  const limited = filtered.slice(0, pagination.limit);
  const hasNext = total > pagination.limit;
  return {
    items: limited,
    pagination: {
      count: limited.length,
      next: hasNext && limited.length > 0 ? new Date(limited[limited.length - 1].created_at).getTime() : null,
      prev: limited.length > 0 ? new Date(limited[0].created_at).getTime() : null
    }
  };
}
function formatUser(user) {
  return {
    id: user.uid,
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    defaultTeamId: user.defaultTeamId,
    version: user.version,
    createdAt: new Date(user.created_at).getTime(),
    softBlock: user.softBlock,
    billing: user.billing,
    resourceConfig: user.resourceConfig,
    stagingPrefix: user.stagingPrefix
  };
}
function formatTeam(team) {
  return {
    id: team.uid,
    slug: team.slug,
    name: team.name,
    avatar: team.avatar,
    description: team.description,
    creatorId: team.creatorId,
    createdAt: new Date(team.created_at).getTime(),
    updatedAt: new Date(team.updated_at).getTime(),
    membership: team.membership,
    billing: team.billing,
    resourceConfig: team.resourceConfig,
    stagingPrefix: team.stagingPrefix
  };
}
function formatProject(project, baseUrl) {
  return {
    accountId: project.accountId,
    autoAssignCustomDomains: project.autoAssignCustomDomains,
    autoAssignCustomDomainsUpdatedBy: project.autoAssignCustomDomainsUpdatedBy,
    buildCommand: project.buildCommand,
    createdAt: new Date(project.created_at).getTime(),
    devCommand: project.devCommand,
    directoryListing: false,
    framework: project.framework,
    gitForkProtection: project.gitForkProtection,
    gitComments: project.gitComments,
    id: project.uid,
    installCommand: project.installCommand,
    name: project.name,
    nodeVersion: project.nodeVersion,
    outputDirectory: project.outputDirectory,
    publicSource: project.publicSource,
    rootDirectory: project.rootDirectory,
    commandForIgnoringBuildStep: project.commandForIgnoringBuildStep,
    serverlessFunctionRegion: project.serverlessFunctionRegion,
    sourceFilesOutsideRootDirectory: project.sourceFilesOutsideRootDirectory,
    updatedAt: new Date(project.updated_at).getTime(),
    live: project.live,
    link: project.link,
    latestDeployments: project.latestDeployments,
    targets: project.targets,
    protectionBypass: project.protectionBypass,
    passwordProtection: project.passwordProtection,
    ssoProtection: project.ssoProtection,
    trustedIps: project.trustedIps,
    connectConfigurationId: project.connectConfigurationId,
    webAnalytics: project.webAnalytics,
    speedInsights: project.speedInsights,
    oidcTokenConfig: project.oidcTokenConfig,
    tier: project.tier
  };
}
function formatDeployment(dep, vs, baseUrl) {
  const project = vs.projects.findOneBy("uid", dep.projectId);
  const creator = vs.users.findOneBy("uid", dep.creatorId);
  const aliases = vs.deploymentAliases.findBy("deploymentId", dep.uid);
  return {
    uid: dep.uid,
    id: dep.uid,
    name: dep.name,
    url: dep.url,
    created: new Date(dep.created_at).getTime(),
    createdAt: new Date(dep.created_at).getTime(),
    source: dep.source,
    state: dep.state,
    readyState: dep.readyState,
    readySubstate: dep.readySubstate,
    type: "LAMBDAS",
    creator: creator ? { uid: creator.uid, email: creator.email, username: creator.username } : null,
    inspectorUrl: dep.inspectorUrl,
    meta: dep.meta,
    target: dep.target,
    aliasAssigned: dep.aliasAssigned,
    aliasError: dep.aliasError,
    buildingAt: dep.buildingAt,
    readyAt: dep.readyAt,
    bootedAt: dep.bootedAt,
    canceledAt: dep.canceledAt,
    errorCode: dep.errorCode,
    errorMessage: dep.errorMessage,
    regions: dep.regions,
    functions: dep.functions,
    routes: dep.routes,
    plan: dep.plan,
    projectId: dep.projectId,
    gitSource: dep.gitSource,
    alias: aliases.map((a) => a.alias)
  };
}
function formatDeploymentBrief(dep, vs) {
  const creator = vs.users.findOneBy("uid", dep.creatorId);
  return {
    uid: dep.uid,
    name: dep.name,
    url: dep.url,
    created: new Date(dep.created_at).getTime(),
    state: dep.state,
    readyState: dep.readyState,
    type: "LAMBDAS",
    creator: creator ? { uid: creator.uid, email: creator.email, username: creator.username } : null,
    meta: dep.meta,
    target: dep.target,
    aliasAssigned: dep.aliasAssigned,
    projectId: dep.projectId
  };
}
function formatDomain(domain) {
  return {
    name: domain.name,
    apexName: domain.apexName,
    projectId: domain.projectId,
    redirect: domain.redirect,
    redirectStatusCode: domain.redirectStatusCode,
    gitBranch: domain.gitBranch,
    customEnvironmentId: domain.customEnvironmentId,
    updatedAt: new Date(domain.updated_at).getTime(),
    createdAt: new Date(domain.created_at).getTime(),
    verified: domain.verified,
    verification: domain.verified ? [] : domain.verification
  };
}
function formatEnvVar(env, decrypt = false) {
  return {
    type: env.type,
    id: env.uid,
    key: env.key,
    value: decrypt || env.type === "plain" ? env.value : "",
    target: env.target,
    gitBranch: env.gitBranch,
    customEnvironmentIds: env.customEnvironmentIds,
    configurationId: null,
    createdAt: new Date(env.created_at).getTime(),
    updatedAt: new Date(env.updated_at).getTime(),
    createdBy: null,
    updatedBy: null,
    comment: env.comment ?? ""
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
var ApiError = class extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
};
async function parseJsonBody(c) {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body;
    }
    return {};
  } catch {
    throw new ApiError(400, "Problems parsing JSON");
  }
}
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
function vercelErr(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function resolveTeamByIdOrSlug(vs, teamIdOrSlug) {
  return vs.teams.findOneBy("uid", teamIdOrSlug) ?? vs.teams.findOneBy("slug", teamIdOrSlug);
}
function getTeamMember(vs, teamUid, userUid) {
  return vs.teamMembers.findBy("teamId", teamUid).find((m) => m.userId === userUid);
}
function formatTeamForViewer(team, member) {
  return {
    ...formatTeam(team),
    membership: member ? { confirmed: member.confirmed, role: member.role } : { confirmed: false, role: "VIEWER" }
  };
}
function formatMemberRow(vs, m) {
  const user = vs.users.findOneBy("uid", m.userId);
  return {
    id: String(m.id),
    role: m.role,
    confirmed: m.confirmed,
    joinedFrom: m.joinedFrom,
    user: user ? formatUser(user) : null
  };
}
var TEAM_ROLES = ["OWNER", "MEMBER", "DEVELOPER", "VIEWER"];
function parseRole(value, fallback) {
  if (value === void 0 || value === null) return fallback;
  if (typeof value !== "string") return null;
  return TEAM_ROLES.includes(value) ? value : null;
}
function defaultTeamBilling() {
  return { plan: "hobby", period: null, trial: null, cancelation: null, addons: null };
}
function defaultTeamResourceConfig() {
  return { nodeType: "standard", concurrentBuilds: 1 };
}
function userRoutes({ app, store }) {
  const vs = getVercelStore(store);
  app.get("/registration", (c) => c.json({ registration: false }));
  app.get("/v2/user", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    return c.json({ user: formatUser(user) });
  });
  app.patch("/v2/user", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const existing = vs.users.findOneBy("username", auth.login);
    if (!existing) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("name" in body) {
      if (body.name === null) patch.name = null;
      else if (typeof body.name === "string") patch.name = body.name;
    }
    if ("email" in body && typeof body.email === "string") {
      patch.email = body.email;
    }
    const updated = vs.users.update(existing.id, patch);
    if (!updated) {
      return vercelErr(c, 500, "internal_error", "Failed to update user");
    }
    return c.json({ user: formatUser(updated) });
  });
  app.get("/v2/teams", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const pagination = parseCursorPagination(c);
    const memberships = vs.teamMembers.findBy("userId", user.uid);
    let teams = memberships.map((m) => vs.teams.findOneBy("uid", m.teamId)).filter((t) => Boolean(t));
    if (c.req.query("teamId") || c.req.query("slug")) {
      const scope = resolveTeamScope(c, vs);
      const scopedTeam = scope?.team;
      if (!scopedTeam) {
        return vercelErr(c, 404, "not_found", "Team not found");
      }
      teams = teams.filter((t) => t.uid === scopedTeam.uid);
    }
    const { items, pagination: pageMeta } = applyCursorPagination(teams, pagination);
    const formatted = items.map((team) => {
      const member = getTeamMember(vs, team.uid, user.uid);
      return formatTeamForViewer(team, member);
    });
    return c.json({
      teams: formatted,
      pagination: pageMeta
    });
  });
  app.get("/v2/teams/:teamId", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const team = resolveTeamByIdOrSlug(vs, c.req.param("teamId"));
    if (!team) {
      return vercelErr(c, 404, "not_found", "Team not found");
    }
    const member = getTeamMember(vs, team.uid, user.uid);
    return c.json({ team: formatTeamForViewer(team, member) });
  });
  app.post("/v2/teams", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const creator = vs.users.findOneBy("username", auth.login);
    if (!creator) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const body = await parseJsonBody(c);
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    if (!slug) {
      return vercelErr(c, 400, "bad_request", "Missing required field: slug");
    }
    if (vs.teams.findOneBy("slug", slug)) {
      return vercelErr(c, 409, "team_slug_already_exists", "A team with this slug already exists");
    }
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : slug;
    const team = vs.teams.insert({
      uid: generateUid("team"),
      slug,
      name,
      avatar: null,
      description: null,
      creatorId: creator.uid,
      membership: { confirmed: true, role: "OWNER" },
      billing: defaultTeamBilling(),
      resourceConfig: defaultTeamResourceConfig(),
      stagingPrefix: ""
    });
    vs.teamMembers.insert({
      teamId: team.uid,
      userId: creator.uid,
      role: "OWNER",
      confirmed: true,
      joinedFrom: "cli"
    });
    const member = getTeamMember(vs, team.uid, creator.uid);
    return c.json({ team: formatTeamForViewer(team, member) });
  });
  app.patch("/v2/teams/:teamId", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const team = resolveTeamByIdOrSlug(vs, c.req.param("teamId"));
    if (!team) {
      return vercelErr(c, 404, "not_found", "Team not found");
    }
    const member = getTeamMember(vs, team.uid, user.uid);
    if (!member || member.role !== "OWNER") {
      return vercelErr(c, 403, "forbidden", "Insufficient permissions to update this team");
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("name" in body && typeof body.name === "string") patch.name = body.name;
    if ("description" in body) {
      if (body.description === null) patch.description = null;
      else if (typeof body.description === "string") patch.description = body.description;
    }
    if ("slug" in body && typeof body.slug === "string") {
      const nextSlug = body.slug.trim();
      if (nextSlug && nextSlug !== team.slug) {
        const taken = vs.teams.findOneBy("slug", nextSlug);
        if (taken && taken.id !== team.id) {
          return vercelErr(c, 409, "team_slug_already_exists", "A team with this slug already exists");
        }
        patch.slug = nextSlug;
      }
    }
    const updated = vs.teams.update(team.id, patch);
    if (!updated) {
      return vercelErr(c, 500, "internal_error", "Failed to update team");
    }
    const viewer = getTeamMember(vs, updated.uid, user.uid);
    return c.json({ team: formatTeamForViewer(updated, viewer) });
  });
  app.get("/v2/teams/:teamId/members", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const team = resolveTeamByIdOrSlug(vs, c.req.param("teamId"));
    if (!team) {
      return vercelErr(c, 404, "not_found", "Team not found");
    }
    if (!getTeamMember(vs, team.uid, user.uid)) {
      return vercelErr(c, 403, "forbidden", "Not a member of this team");
    }
    const pagination = parseCursorPagination(c);
    const members = vs.teamMembers.findBy("teamId", team.uid);
    const { items, pagination: pageMeta } = applyCursorPagination(members, pagination);
    return c.json({
      members: items.map((m) => formatMemberRow(vs, m)),
      pagination: pageMeta
    });
  });
  app.post("/v2/teams/:teamId/members", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr(c, 401, "not_authenticated", "Authentication required");
    }
    const actor = vs.users.findOneBy("username", auth.login);
    if (!actor) {
      return vercelErr(c, 403, "forbidden", "User not found");
    }
    const team = resolveTeamByIdOrSlug(vs, c.req.param("teamId"));
    if (!team) {
      return vercelErr(c, 404, "not_found", "Team not found");
    }
    const actorMember = getTeamMember(vs, team.uid, actor.uid);
    if (!actorMember || actorMember.role !== "OWNER") {
      return vercelErr(c, 403, "forbidden", "Insufficient permissions to add members");
    }
    const body = await parseJsonBody(c);
    const email = typeof body.email === "string" ? body.email.trim() : void 0;
    const uid = typeof body.uid === "string" ? body.uid.trim() : void 0;
    let target;
    if (uid) {
      target = vs.users.findOneBy("uid", uid);
    } else if (email) {
      target = vs.users.findOneBy("email", email);
    } else {
      return vercelErr(c, 400, "bad_request", "Provide uid or email");
    }
    if (!target) {
      return vercelErr(c, 404, "not_found", "User not found");
    }
    const role = parseRole(body.role, "MEMBER");
    if (role === null) {
      return vercelErr(c, 400, "bad_request", "Invalid role");
    }
    if (getTeamMember(vs, team.uid, target.uid)) {
      return vercelErr(c, 409, "member_already_exists", "User is already a member of this team");
    }
    const row = vs.teamMembers.insert({
      teamId: team.uid,
      userId: target.uid,
      role,
      confirmed: true,
      joinedFrom: email ? "email" : "invite"
    });
    return c.json({ member: formatMemberRow(vs, row) });
  });
}
function vercelErr2(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function parseGitLink(body) {
  const gr = body.gitRepository;
  if (!gr || typeof gr !== "object") return null;
  const g = gr;
  const repo = typeof g.repo === "string" ? g.repo : "";
  if (!repo) return null;
  const t = nowMs();
  return {
    type: typeof g.type === "string" ? g.type : "github",
    repo,
    repoId: typeof g.repoId === "number" ? g.repoId : 0,
    org: typeof g.org === "string" ? g.org : "",
    gitCredentialId: typeof g.gitCredentialId === "string" ? g.gitCredentialId : "",
    productionBranch: typeof g.productionBranch === "string" ? g.productionBranch : "main",
    createdAt: t,
    updatedAt: t,
    deployHooks: []
  };
}
function deleteProjectCascade(vs, project) {
  const projectUid = project.uid;
  const deps = vs.deployments.findBy("projectId", projectUid);
  for (const dep of deps) {
    for (const b of vs.builds.findBy("deploymentId", dep.uid)) {
      vs.builds.delete(b.id);
    }
    for (const e of vs.deploymentEvents.findBy("deploymentId", dep.uid)) {
      vs.deploymentEvents.delete(e.id);
    }
    for (const f of vs.deploymentFiles.findBy("deploymentId", dep.uid)) {
      vs.deploymentFiles.delete(f.id);
    }
    for (const a of vs.deploymentAliases.findBy("deploymentId", dep.uid)) {
      vs.deploymentAliases.delete(a.id);
    }
    vs.deployments.delete(dep.id);
  }
  for (const d of vs.domains.findBy("projectId", projectUid)) {
    vs.domains.delete(d.id);
  }
  for (const ev of vs.envVars.findBy("projectId", projectUid)) {
    vs.envVars.delete(ev.id);
  }
  for (const pb of vs.protectionBypasses.findBy("projectId", projectUid)) {
    vs.protectionBypasses.delete(pb.id);
  }
  vs.projects.delete(project.id);
}
function protectionMetaForRow(row) {
  return {
    createdAt: new Date(row.created_at).getTime(),
    createdBy: row.createdBy,
    scope: row.scope
  };
}
function syncProtectionRecordFromCollection(vs, project) {
  const rows = vs.protectionBypasses.findBy("projectId", project.uid);
  const record = {};
  for (const row of rows) {
    record[row.secret] = protectionMetaForRow(row);
  }
  const updated = vs.projects.update(project.id, { protectionBypass: record });
  return updated ?? { ...project, protectionBypass: record };
}
function projectsRoutes({ app, store, baseUrl }) {
  const vs = getVercelStore(store);
  app.post("/v11/projects", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return vercelErr2(c, 400, "bad_request", "Missing required field: name");
    }
    const existing = vs.projects.findBy("name", name).filter((p) => p.accountId === scope.accountId);
    if (existing.length > 0) {
      return vercelErr2(c, 409, "project_already_exists", "A project with this name already exists");
    }
    const link = parseGitLink(body);
    const project = vs.projects.insert({
      uid: generateUid("prj"),
      name,
      accountId: scope.accountId,
      framework: typeof body.framework === "string" ? body.framework : null,
      buildCommand: typeof body.buildCommand === "string" ? body.buildCommand : null,
      devCommand: typeof body.devCommand === "string" ? body.devCommand : null,
      installCommand: typeof body.installCommand === "string" ? body.installCommand : null,
      outputDirectory: typeof body.outputDirectory === "string" ? body.outputDirectory : null,
      rootDirectory: typeof body.rootDirectory === "string" ? body.rootDirectory : null,
      commandForIgnoringBuildStep: null,
      nodeVersion: typeof body.nodeVersion === "string" ? body.nodeVersion : "20.x",
      serverlessFunctionRegion: typeof body.serverlessFunctionRegion === "string" ? body.serverlessFunctionRegion : null,
      publicSource: typeof body.publicSource === "boolean" ? body.publicSource : false,
      autoAssignCustomDomains: true,
      autoAssignCustomDomainsUpdatedBy: null,
      gitForkProtection: true,
      sourceFilesOutsideRootDirectory: false,
      live: true,
      link,
      latestDeployments: [],
      targets: {},
      protectionBypass: {},
      passwordProtection: null,
      ssoProtection: null,
      trustedIps: null,
      connectConfigurationId: null,
      gitComments: { onPullRequest: true, onCommit: false },
      webAnalytics: null,
      speedInsights: null,
      oidcTokenConfig: null,
      tier: "hobby"
    });
    const envIn = body.environmentVariables;
    if (Array.isArray(envIn)) {
      for (const raw of envIn) {
        if (!raw || typeof raw !== "object") continue;
        const ev = raw;
        const key = typeof ev.key === "string" ? ev.key : "";
        if (!key) continue;
        vs.envVars.insert({
          uid: generateUid("env"),
          projectId: project.uid,
          key,
          value: typeof ev.value === "string" ? ev.value : String(ev.value ?? ""),
          type: ev.type === "system" || ev.type === "encrypted" || ev.type === "plain" || ev.type === "secret" || ev.type === "sensitive" ? ev.type : "encrypted",
          target: Array.isArray(ev.target) ? ev.target.filter(
            (t) => t === "production" || t === "preview" || t === "development"
          ) : ["production", "preview", "development"],
          gitBranch: typeof ev.gitBranch === "string" ? ev.gitBranch : null,
          customEnvironmentIds: Array.isArray(ev.customEnvironmentIds) ? ev.customEnvironmentIds : [],
          comment: typeof ev.comment === "string" ? ev.comment : null,
          decrypted: false
        });
      }
    }
    return c.json(formatProject(project, baseUrl));
  });
  app.get("/v10/projects", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const pagination = parseCursorPagination(c);
    const search = (c.req.query("search") ?? "").trim().toLowerCase();
    let list = vs.projects.all().filter((p) => p.accountId === scope.accountId);
    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search));
    }
    const { items, pagination: pageMeta } = applyCursorPagination(list, pagination);
    return c.json({
      projects: items.map((p) => formatProject(p, baseUrl)),
      pagination: pageMeta
    });
  });
  app.get("/v9/projects/:idOrName", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr2(c, 404, "not_found", "Project not found");
    }
    const envs = vs.envVars.findBy("projectId", project.uid);
    return c.json({
      ...formatProject(project, baseUrl),
      env: envs.map((e) => formatEnvVar(e))
    });
  });
  app.patch("/v9/projects/:idOrName", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr2(c, 404, "not_found", "Project not found");
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("name" in body && typeof body.name === "string") patch.name = body.name.trim();
    if ("buildCommand" in body) {
      patch.buildCommand = body.buildCommand === null ? null : typeof body.buildCommand === "string" ? body.buildCommand : project.buildCommand;
    }
    if ("devCommand" in body) {
      patch.devCommand = body.devCommand === null ? null : typeof body.devCommand === "string" ? body.devCommand : project.devCommand;
    }
    if ("installCommand" in body) {
      patch.installCommand = body.installCommand === null ? null : typeof body.installCommand === "string" ? body.installCommand : project.installCommand;
    }
    if ("outputDirectory" in body) {
      patch.outputDirectory = body.outputDirectory === null ? null : typeof body.outputDirectory === "string" ? body.outputDirectory : project.outputDirectory;
    }
    if ("framework" in body) {
      patch.framework = body.framework === null ? null : typeof body.framework === "string" ? body.framework : project.framework;
    }
    if ("rootDirectory" in body) {
      patch.rootDirectory = body.rootDirectory === null ? null : typeof body.rootDirectory === "string" ? body.rootDirectory : project.rootDirectory;
    }
    if ("gitForkProtection" in body && typeof body.gitForkProtection === "boolean") {
      patch.gitForkProtection = body.gitForkProtection;
    }
    if ("publicSource" in body && typeof body.publicSource === "boolean") {
      patch.publicSource = body.publicSource;
    }
    if ("nodeVersion" in body && typeof body.nodeVersion === "string") {
      patch.nodeVersion = body.nodeVersion;
    }
    if ("serverlessFunctionRegion" in body) {
      patch.serverlessFunctionRegion = body.serverlessFunctionRegion === null ? null : typeof body.serverlessFunctionRegion === "string" ? body.serverlessFunctionRegion : project.serverlessFunctionRegion;
    }
    if ("autoAssignCustomDomains" in body && typeof body.autoAssignCustomDomains === "boolean") {
      patch.autoAssignCustomDomains = body.autoAssignCustomDomains;
    }
    if ("commandForIgnoringBuildStep" in body) {
      patch.commandForIgnoringBuildStep = body.commandForIgnoringBuildStep === null ? null : typeof body.commandForIgnoringBuildStep === "string" ? body.commandForIgnoringBuildStep : project.commandForIgnoringBuildStep;
    }
    const updated = vs.projects.update(project.id, patch);
    if (!updated) {
      return vercelErr2(c, 500, "internal_error", "Failed to update project");
    }
    return c.json(formatProject(updated, baseUrl));
  });
  app.delete("/v9/projects/:idOrName", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr2(c, 404, "not_found", "Project not found");
    }
    deleteProjectCascade(vs, project);
    return c.body(null, 204);
  });
  app.get("/v1/projects/:projectId/promote/aliases", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("projectId"), scope.accountId);
    if (!project) {
      return vercelErr2(c, 404, "not_found", "Project not found");
    }
    const deployments = vs.deployments.findBy("projectId", project.uid);
    const production = deployments.filter((d) => d.target === "production").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    if (!production) {
      return c.json({
        status: "PENDING",
        alias: []
      });
    }
    const aliases = vs.deploymentAliases.findBy("deploymentId", production.uid).map((a) => a.alias);
    const status = production.readySubstate === "PROMOTED" || production.readyState === "READY" ? "PROMOTED" : "PENDING";
    return c.json({
      status,
      alias: aliases
    });
  });
  app.patch("/v1/projects/:idOrName/protection-bypass", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr2(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr2(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    let project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr2(c, 404, "not_found", "Project not found");
    }
    const user = vs.users.findOneBy("username", auth.login);
    const createdBy = user?.uid ?? auth.login;
    const body = await parseJsonBody(c);
    if (body.generate && typeof body.generate === "object" && body.generate !== null) {
      const g = body.generate;
      const secret = generateSecret();
      vs.protectionBypasses.insert({
        projectId: project.uid,
        secret,
        note: typeof g.note === "string" ? g.note : null,
        scope: typeof g.scope === "string" ? g.scope : "deployment",
        createdBy
      });
      project = syncProtectionRecordFromCollection(vs, project);
    }
    if (Array.isArray(body.revoke)) {
      for (const secret of body.revoke) {
        if (typeof secret !== "string") continue;
        const row = vs.protectionBypasses.findBy("projectId", project.uid).find((r) => r.secret === secret);
        if (row) {
          vs.protectionBypasses.delete(row.id);
        }
      }
      project = syncProtectionRecordFromCollection(vs, project);
    }
    if (Array.isArray(body.regenerate)) {
      for (const oldSecret of body.regenerate) {
        if (typeof oldSecret !== "string") continue;
        const row = vs.protectionBypasses.findBy("projectId", project.uid).find((r) => r.secret === oldSecret);
        if (!row) continue;
        const note = row.note;
        const scopeVal = row.scope;
        vs.protectionBypasses.delete(row.id);
        vs.protectionBypasses.insert({
          projectId: project.uid,
          secret: generateSecret(),
          note,
          scope: scopeVal,
          createdBy
        });
      }
      project = syncProtectionRecordFromCollection(vs, project);
    }
    const fresh = vs.projects.get(project.id) ?? project;
    return c.json({ protectionBypass: fresh.protectionBypass });
  });
}
function vercelErr3(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function normalizeUrlParam(raw) {
  const s = raw.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      return new URL(s).hostname;
    } catch {
      return s;
    }
  }
  return s;
}
function primaryHostFromBaseUrl(baseUrl) {
  try {
    const u = new URL(baseUrl);
    if (u.hostname && u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
      return u.hostname;
    }
  } catch {
  }
  return "vercel.app";
}
function deploymentHostname(name, uid, baseUrl) {
  const slug = `${name}-${uid.slice(4, 12)}`;
  return `${slug}.${primaryHostFromBaseUrl(baseUrl)}`;
}
function productionProjectAlias(projectName, baseUrl) {
  return `${projectName}.${primaryHostFromBaseUrl(baseUrl)}`;
}
function findDeploymentByIdOrUrl(vs, idOrUrl) {
  const raw = idOrUrl.trim();
  const byUid = vs.deployments.findOneBy("uid", raw);
  if (byUid) return byUid;
  const host = normalizeUrlParam(raw);
  return vs.deployments.findOneBy("url", host) ?? vs.deployments.findOneBy("url", raw);
}
function assertDeploymentAccess(vs, dep, accountId) {
  const project = vs.projects.findOneBy("uid", dep.projectId);
  return !!project && project.accountId === accountId;
}
function defaultProjectPayload(name, accountId) {
  return {
    uid: generateUid("prj"),
    name,
    accountId,
    framework: null,
    buildCommand: null,
    devCommand: null,
    installCommand: null,
    outputDirectory: null,
    rootDirectory: null,
    commandForIgnoringBuildStep: null,
    nodeVersion: "20.x",
    serverlessFunctionRegion: null,
    publicSource: false,
    autoAssignCustomDomains: true,
    autoAssignCustomDomainsUpdatedBy: null,
    gitForkProtection: true,
    sourceFilesOutsideRootDirectory: false,
    live: true,
    link: null,
    latestDeployments: [],
    targets: {},
    protectionBypass: {},
    passwordProtection: null,
    ssoProtection: null,
    trustedIps: null,
    connectConfigurationId: null,
    gitComments: { onPullRequest: true, onCommit: false },
    webAnalytics: null,
    speedInsights: null,
    oidcTokenConfig: null,
    tier: "hobby"
  };
}
function resolveOrCreateProject(vs, accountId, name, projectField) {
  if (typeof projectField === "string" && projectField.trim()) {
    const byId = lookupProject(vs, projectField.trim(), accountId);
    if (byId) return byId;
  }
  const existing = vs.projects.findBy("name", name).find((p) => p.accountId === accountId);
  if (existing) return existing;
  return vs.projects.insert(defaultProjectPayload(name, accountId));
}
function targetKey(target) {
  if (target === "production") return "production";
  if (target === "staging") return "staging";
  return "preview";
}
function upsertProjectDeploymentRefs(vs, projectId, dep) {
  const project = vs.projects.get(projectId);
  if (!project) return;
  const createdAt = new Date(dep.created_at).getTime();
  const entry = { id: dep.uid, url: dep.url, state: dep.state, createdAt };
  const latest = [{ ...entry }, ...project.latestDeployments.filter((d) => d.id !== dep.uid)];
  const targets = { ...project.targets };
  targets[targetKey(dep.target)] = { ...entry };
  vs.projects.update(project.id, { latestDeployments: latest, targets });
}
function parseGitSource(raw) {
  if (!raw || typeof raw !== "object") return null;
  const g = raw;
  return {
    type: typeof g.type === "string" ? g.type : "github",
    ref: typeof g.ref === "string" ? g.ref : "",
    sha: typeof g.sha === "string" ? g.sha : "",
    repoId: typeof g.repoId === "string" ? g.repoId : typeof g.repoId === "number" ? String(g.repoId) : "",
    org: typeof g.org === "string" ? g.org : "",
    repo: typeof g.repo === "string" ? g.repo : "",
    message: typeof g.message === "string" ? g.message : "",
    authorName: typeof g.authorName === "string" ? g.authorName : "",
    commitAuthorName: typeof g.commitAuthorName === "string" ? g.commitAuthorName : ""
  };
}
function buildFileTreeFromRows(rows, genUid) {
  if (rows.length === 0) {
    return [
      {
        uid: genUid(),
        name: "/",
        type: "directory",
        mode: 16877,
        size: 0,
        contentType: null,
        children: []
      }
    ];
  }
  const root = {
    uid: genUid(),
    name: "/",
    type: "directory",
    mode: 16877,
    size: 0,
    contentType: null,
    children: []
  };
  for (const row of rows) {
    if (row.type !== "file") continue;
    const parts = row.name.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    const fileName = parts.pop();
    let current = root;
    for (const part of parts) {
      let dir = current.children.find((c) => c.name === part && c.type === "directory");
      if (!dir) {
        dir = {
          uid: genUid(),
          name: part,
          type: "directory",
          mode: 16877,
          size: 0,
          contentType: null,
          children: []
        };
        current.children.push(dir);
      }
      current = dir;
    }
    current.children.push({
      uid: row.uid,
      name: fileName,
      type: "file",
      mode: row.mode,
      size: row.size,
      contentType: row.contentType,
      children: []
    });
  }
  return [root];
}
function deleteDeploymentCascade(vs, dep) {
  const uid = dep.uid;
  for (const b of vs.builds.findBy("deploymentId", uid)) {
    vs.builds.delete(b.id);
  }
  for (const e of vs.deploymentEvents.findBy("deploymentId", uid)) {
    vs.deploymentEvents.delete(e.id);
  }
  for (const f of vs.deploymentFiles.findBy("deploymentId", uid)) {
    vs.deploymentFiles.delete(f.id);
  }
  for (const a of vs.deploymentAliases.findBy("deploymentId", uid)) {
    vs.deploymentAliases.delete(a.id);
  }
  vs.deployments.delete(dep.id);
  const project = vs.projects.findOneBy("uid", dep.projectId);
  if (project) {
    const latestDeployments = project.latestDeployments.filter((d) => d.id !== uid);
    const targets = { ...project.targets };
    for (const k of Object.keys(targets)) {
      if (targets[k]?.id === uid) {
        delete targets[k];
      }
    }
    vs.projects.update(project.id, { latestDeployments, targets });
  }
}
function deploymentsRoutes({ app, store, baseUrl }) {
  const vs = getVercelStore(store);
  app.patch("/v12/deployments/:id/cancel", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const dep = vs.deployments.findOneBy("uid", c.req.param("id"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    if (dep.readyState !== "QUEUED" && dep.readyState !== "BUILDING") {
      return vercelErr3(c, 400, "bad_request", "Deployment cannot be canceled in its current state");
    }
    const t = nowMs();
    const updated = vs.deployments.update(dep.id, {
      readyState: "CANCELED",
      state: "CANCELED",
      canceledAt: t
    }) ?? dep;
    vs.deploymentEvents.insert({
      deploymentId: updated.uid,
      type: "canceled",
      payload: { text: "Deployment canceled" },
      date: t,
      serial: String(t)
    });
    return c.json(formatDeployment(updated, vs, baseUrl));
  });
  app.get("/v2/deployments/:id/aliases", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const dep = vs.deployments.findOneBy("uid", c.req.param("id"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    const aliases = vs.deploymentAliases.findBy("deploymentId", dep.uid);
    return c.json({
      aliases: aliases.map((a) => ({
        uid: a.uid,
        alias: a.alias,
        deploymentId: a.deploymentId,
        projectId: a.projectId
      }))
    });
  });
  app.get("/v3/deployments/:idOrUrl/events", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const dep = findDeploymentByIdOrUrl(vs, c.req.param("idOrUrl"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    void c.req.query("follow");
    const direction = (c.req.query("direction") ?? "backward").toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") ?? "20", 10) || 20));
    let list = [...vs.deploymentEvents.findBy("deploymentId", dep.uid)];
    list.sort((a, b) => a.date - b.date);
    if (direction === "backward") {
      list.reverse();
    }
    list = list.slice(0, limit);
    return c.json(
      list.map((e) => ({
        type: e.type,
        payload: e.payload,
        date: e.date,
        serial: e.serial
      }))
    );
  });
  app.get("/v6/deployments/:id/files", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const dep = vs.deployments.findOneBy("uid", c.req.param("id"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    const rows = vs.deploymentFiles.findBy("deploymentId", dep.uid);
    const tree = buildFileTreeFromRows(rows, () => generateUid("file"));
    return c.json({ files: tree });
  });
  app.post("/v13/deployments", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return vercelErr3(c, 400, "bad_request", "Missing required field: name");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr3(c, 400, "bad_request", "User not found in Vercel store");
    }
    const project = resolveOrCreateProject(vs, scope.accountId, name, body.project);
    const uid = generateUid("dpl");
    const url = deploymentHostname(name, uid, baseUrl);
    const inspectorUrl = `${baseUrl.replace(/\/$/, "")}/deployments/${uid}`;
    const targetRaw = body.target;
    const target = targetRaw === "production" || targetRaw === "preview" || targetRaw === "staging" ? targetRaw : "preview";
    const meta = {};
    if (body.meta && typeof body.meta === "object" && body.meta !== null) {
      for (const [k, v] of Object.entries(body.meta)) {
        if (typeof v === "string") meta[k] = v;
      }
    }
    const regions = Array.isArray(body.regions) && body.regions.every((r) => typeof r === "string") ? body.regions : ["iad1"];
    const t = nowMs();
    const gitSource = parseGitSource(body.gitSource);
    const source = gitSource ? "git" : "cli";
    const dep = vs.deployments.insert({
      uid,
      name,
      url,
      projectId: project.uid,
      source,
      target,
      readyState: "READY",
      readySubstate: null,
      state: "READY",
      creatorId: user.uid,
      inspectorUrl,
      meta,
      gitSource,
      buildingAt: t,
      readyAt: t,
      canceledAt: null,
      errorCode: null,
      errorMessage: null,
      regions,
      functions: null,
      routes: null,
      plan: "hobby",
      aliasAssigned: true,
      aliasError: null,
      bootedAt: t
    });
    vs.deploymentAliases.insert({
      uid: generateUid("als"),
      alias: url,
      deploymentId: dep.uid,
      projectId: project.uid
    });
    if (target === "production") {
      vs.deploymentAliases.insert({
        uid: generateUid("als"),
        alias: productionProjectAlias(project.name, baseUrl),
        deploymentId: dep.uid,
        projectId: project.uid
      });
    }
    upsertProjectDeploymentRefs(vs, project.id, dep);
    vs.builds.insert({
      uid: generateUid("bld"),
      deploymentId: dep.uid,
      entrypoint: "api/index.ts",
      readyState: "READY",
      output: [],
      readyStateAt: t,
      fingerprint: generateUid("fgp")
    });
    let serial = 0;
    const pushEvent = (type, text) => {
      serial += 1;
      vs.deploymentEvents.insert({
        deploymentId: dep.uid,
        type,
        payload: { text },
        date: t,
        serial: String(serial)
      });
    };
    pushEvent("created", "Deployment created");
    pushEvent("building", "Building");
    pushEvent("ready", "Deployment ready");
    const filesIn = body.files;
    if (Array.isArray(filesIn)) {
      for (const raw of filesIn) {
        if (!raw || typeof raw !== "object") continue;
        const f = raw;
        const filePath = typeof f.file === "string" ? f.file : "";
        const sha = typeof f.sha === "string" ? f.sha : "";
        const size = typeof f.size === "number" ? f.size : 0;
        if (!filePath || !sha) continue;
        if (!vs.files.findOneBy("digest", sha)) {
          vs.files.insert({
            digest: sha,
            size,
            contentType: "application/octet-stream"
          });
        }
        vs.deploymentFiles.insert({
          deploymentId: dep.uid,
          name: filePath,
          type: "file",
          uid: generateUid("f"),
          children: [],
          contentType: "application/octet-stream",
          mode: 420,
          size
        });
      }
    }
    return c.json(formatDeployment(dep, vs, baseUrl));
  });
  const listDeployments = (c, shaFilter) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const appName = (c.req.query("app") ?? "").trim();
    const projectIdFilter = (c.req.query("projectId") ?? "").trim();
    const targetFilter = c.req.query("target");
    const stateFilter = c.req.query("state");
    let list = vs.deployments.all().filter((d) => {
      const proj = vs.projects.findOneBy("uid", d.projectId);
      return proj && proj.accountId === scope.accountId;
    });
    if (appName) {
      list = list.filter((d) => {
        const proj = vs.projects.findOneBy("uid", d.projectId);
        return proj?.name === appName;
      });
    }
    if (projectIdFilter) {
      list = list.filter((d) => d.projectId === projectIdFilter);
    }
    if (targetFilter === "production" || targetFilter === "preview" || targetFilter === "staging") {
      list = list.filter((d) => d.target === targetFilter);
    }
    if (stateFilter) {
      list = list.filter((d) => d.state === stateFilter || d.readyState === stateFilter);
    }
    if (shaFilter) {
      list = list.filter(
        (d) => d.gitSource?.sha === shaFilter || d.meta.githubCommitSha === shaFilter || d.meta.gitlabCommitSha === shaFilter || d.meta.bitbucketCommitSha === shaFilter
      );
    }
    const pagination = parseCursorPagination(c);
    const { items, pagination: pageMeta } = applyCursorPagination(list, pagination);
    return c.json({
      deployments: items.map((d) => formatDeploymentBrief(d, vs)),
      pagination: pageMeta
    });
  };
  app.get("/v6/deployments", (c) => listDeployments(c));
  app.get("/v7/deployments", (c) => {
    if (!c.get("authUser")) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    return listDeployments(c, c.req.query("sha"));
  });
  app.delete("/v13/deployments/:id", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const dep = vs.deployments.findOneBy("uid", c.req.param("id"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    const uid = dep.uid;
    deleteDeploymentCascade(vs, dep);
    return c.json({ uid, state: "DELETED" });
  });
  app.get("/v13/deployments/:idOrUrl", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const dep = findDeploymentByIdOrUrl(vs, c.req.param("idOrUrl"));
    if (!dep || !assertDeploymentAccess(vs, dep, scope.accountId)) {
      return vercelErr3(c, 404, "not_found", "Deployment not found");
    }
    return c.json(formatDeployment(dep, vs, baseUrl));
  });
  app.post("/v2/files", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr3(c, 401, "not_authenticated", "Authentication required");
    }
    const digest = c.req.header("x-vercel-digest") ?? "";
    if (!digest) {
      return vercelErr3(c, 400, "bad_request", "Missing x-vercel-digest header");
    }
    const lenRaw = c.req.header("Content-Length");
    const size = lenRaw ? parseInt(lenRaw, 10) : 0;
    if (!Number.isFinite(size) || size < 0) {
      return vercelErr3(c, 400, "bad_request", "Invalid Content-Length");
    }
    await c.req.arrayBuffer();
    const contentType = c.req.header("Content-Type") ?? "application/octet-stream";
    if (!vs.files.findOneBy("digest", digest)) {
      vs.files.insert({
        digest,
        size,
        contentType
      });
    }
    return c.json([]);
  });
}
function vercelErr4(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function extractApexName(domain) {
  const parts = domain.toLowerCase().split(".").filter((p) => p.length > 0);
  if (parts.length === 0) return domain;
  if (parts.length === 1) return parts[0];
  return parts.slice(-2).join(".");
}
function isVercelAppDomain(domain) {
  const d = domain.toLowerCase();
  return d === "vercel.app" || d.endsWith(".vercel.app");
}
function normalizeDomainName(raw) {
  return raw.trim().toLowerCase();
}
function parseRedirectStatusCode(raw) {
  if (raw === void 0 || raw === null) return null;
  if (typeof raw !== "number" || !Number.isInteger(raw)) return "invalid";
  if (raw === 301 || raw === 302 || raw === 307 || raw === 308) return raw;
  return "invalid";
}
function findDomainInProject(vs, projectUid, domainName) {
  const normalized = normalizeDomainName(domainName);
  return vs.domains.findBy("projectId", projectUid).find((d) => d.name.toLowerCase() === normalized);
}
function decodeDomainParam(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
function domainsRoutes({ app, store }) {
  const vs = getVercelStore(store);
  app.post("/v10/projects/:idOrName/domains", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const body = await parseJsonBody(c);
    const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
    if (!nameRaw) {
      return vercelErr4(c, 400, "bad_request", "Missing required field: name");
    }
    const name = normalizeDomainName(nameRaw);
    const apexName = extractApexName(name);
    if (findDomainInProject(vs, project.uid, name)) {
      return vercelErr4(c, 409, "domain_already_exists", "A domain with this name already exists on the project");
    }
    const redirect = body.redirect === null ? null : typeof body.redirect === "string" ? body.redirect.trim() || null : null;
    const redirectStatusCode = parseRedirectStatusCode(body.redirectStatusCode);
    if (redirectStatusCode === "invalid") {
      return vercelErr4(c, 400, "bad_request", "Invalid redirectStatusCode");
    }
    const gitBranch = body.gitBranch === null ? null : typeof body.gitBranch === "string" ? body.gitBranch : null;
    const customEnvironmentId = body.customEnvironmentId === null ? null : typeof body.customEnvironmentId === "string" ? body.customEnvironmentId : null;
    const uid = generateUid();
    const autoVerified = isVercelAppDomain(name);
    const verified = autoVerified;
    const verification = autoVerified ? [] : [
      {
        type: "TXT",
        domain: `_vercel.${apexName}`,
        value: `vc-domain-verify=${name},${uid}`,
        reason: "Add the TXT record above to verify domain ownership"
      }
    ];
    const row = vs.domains.insert({
      uid,
      projectId: project.uid,
      name,
      apexName,
      redirect,
      redirectStatusCode,
      gitBranch,
      customEnvironmentId,
      verified,
      verification
    });
    return c.json(formatDomain(row));
  });
  app.get("/v9/projects/:idOrName/domains", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const pagination = parseCursorPagination(c);
    const list = vs.domains.findBy("projectId", project.uid);
    const { items, pagination: pageMeta } = applyCursorPagination(list, pagination);
    return c.json({
      domains: items.map((d) => formatDomain(d)),
      pagination: pageMeta
    });
  });
  app.post("/v9/projects/:idOrName/domains/:domain/verify", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const domainName = decodeDomainParam(c.req.param("domain"));
    const existing = findDomainInProject(vs, project.uid, domainName);
    if (!existing) {
      return vercelErr4(c, 404, "not_found", "Domain not found");
    }
    const updated = vs.domains.update(existing.id, {
      verified: true,
      verification: []
    });
    if (!updated) {
      return vercelErr4(c, 500, "internal_error", "Failed to update domain");
    }
    return c.json(formatDomain(updated));
  });
  app.get("/v9/projects/:idOrName/domains/:domain", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const domainName = decodeDomainParam(c.req.param("domain"));
    const existing = findDomainInProject(vs, project.uid, domainName);
    if (!existing) {
      return vercelErr4(c, 404, "not_found", "Domain not found");
    }
    return c.json(formatDomain(existing));
  });
  app.patch("/v9/projects/:idOrName/domains/:domain", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const domainName = decodeDomainParam(c.req.param("domain"));
    const existing = findDomainInProject(vs, project.uid, domainName);
    if (!existing) {
      return vercelErr4(c, 404, "not_found", "Domain not found");
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("gitBranch" in body) {
      patch.gitBranch = body.gitBranch === null ? null : typeof body.gitBranch === "string" ? body.gitBranch : existing.gitBranch;
    }
    if ("redirect" in body) {
      patch.redirect = body.redirect === null ? null : typeof body.redirect === "string" ? body.redirect.trim() || null : existing.redirect;
    }
    if ("redirectStatusCode" in body) {
      const code = parseRedirectStatusCode(body.redirectStatusCode);
      if (code === "invalid") {
        return vercelErr4(c, 400, "bad_request", "Invalid redirectStatusCode");
      }
      patch.redirectStatusCode = code;
    }
    if ("customEnvironmentId" in body) {
      patch.customEnvironmentId = body.customEnvironmentId === null ? null : typeof body.customEnvironmentId === "string" ? body.customEnvironmentId : existing.customEnvironmentId;
    }
    const updated = vs.domains.update(existing.id, patch);
    if (!updated) {
      return vercelErr4(c, 500, "internal_error", "Failed to update domain");
    }
    return c.json(formatDomain(updated));
  });
  app.delete("/v9/projects/:idOrName/domains/:domain", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr4(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr4(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr4(c, 404, "not_found", "Project not found");
    }
    const domainName = decodeDomainParam(c.req.param("domain"));
    const existing = findDomainInProject(vs, project.uid, domainName);
    if (!existing) {
      return vercelErr4(c, 404, "not_found", "Domain not found");
    }
    vs.domains.delete(existing.id);
    return c.json({}, 200);
  });
}
var ENV_TYPES = /* @__PURE__ */ new Set(["system", "encrypted", "plain", "secret", "sensitive"]);
var TARGET_ENVS = ["production", "preview", "development"];
function isTargetEnv(t) {
  return TARGET_ENVS.includes(t);
}
function vercelErr5(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function parseQueryBoolean(raw) {
  if (raw === void 0) return false;
  const v = raw.toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}
function targetsOverlap(a, b) {
  const set = new Set(a);
  return b.some((t) => set.has(t));
}
function findEnvByKeyAndTargetsOverlap(vs, projectUid, key, targets, excludeId) {
  const list = vs.envVars.findBy("projectId", projectUid);
  return list.find(
    (e) => e.key === key && (excludeId === void 0 || e.id !== excludeId) && targetsOverlap(e.target, targets)
  );
}
function parseTarget(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return "invalid";
  const out = [];
  for (const t of raw) {
    if (typeof t !== "string" || !isTargetEnv(t)) return "invalid";
    out.push(t);
  }
  return out;
}
function parseType(raw) {
  if (typeof raw !== "string" || !ENV_TYPES.has(raw)) return "invalid";
  return raw;
}
function parseCustomEnvironmentIds(raw) {
  if (raw === void 0 || raw === null) return [];
  if (!Array.isArray(raw)) return "invalid";
  const ids = [];
  for (const x of raw) {
    if (typeof x !== "string") return "invalid";
    ids.push(x);
  }
  return ids;
}
function parseEnvRow(body) {
  const key = typeof body.key === "string" ? body.key : "";
  if (!key.trim()) {
    return { row: {}, error: "Missing required field: key" };
  }
  if (body.value === void 0) {
    return { row: {}, error: "Missing required field: value" };
  }
  if (typeof body.value !== "string") {
    return { row: {}, error: "Invalid value: value must be a string" };
  }
  const type = parseType(body.type);
  if (type === "invalid") {
    return {
      row: {},
      error: "Invalid value: type must be one of system, encrypted, plain, secret, sensitive"
    };
  }
  const target = parseTarget(body.target);
  if (target === "invalid") {
    return {
      row: {},
      error: "Invalid value: target must be a non-empty array of production, preview, development"
    };
  }
  const customEnvironmentIds = parseCustomEnvironmentIds(body.customEnvironmentIds);
  if (customEnvironmentIds === "invalid") {
    return { row: {}, error: "Invalid value: customEnvironmentIds must be an array of strings" };
  }
  let gitBranch;
  if (!("gitBranch" in body)) {
    gitBranch = null;
  } else if (body.gitBranch === null) {
    gitBranch = null;
  } else if (typeof body.gitBranch === "string") {
    gitBranch = body.gitBranch;
  } else {
    return { row: {}, error: "Invalid value: gitBranch must be a string or null" };
  }
  let comment;
  if (!("comment" in body)) {
    comment = null;
  } else if (body.comment === null) {
    comment = null;
  } else if (typeof body.comment === "string") {
    comment = body.comment;
  } else {
    return { row: {}, error: "Invalid value: comment must be a string or null" };
  }
  return {
    row: {
      key,
      value: body.value,
      type,
      target,
      gitBranch,
      customEnvironmentIds,
      comment,
      decrypted: false
    },
    error: null
  };
}
function findEnvByUidInProject(vs, projectUid, uid) {
  const list = vs.envVars.findBy("projectId", projectUid);
  return list.find((e) => e.uid === uid);
}
function envRoutes({ app, store }) {
  const vs = getVercelStore(store);
  app.get("/v10/projects/:idOrName/env", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr5(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr5(c, 404, "not_found", "Project not found");
    }
    const decrypt = parseQueryBoolean(c.req.query("decrypt"));
    const gitBranchQ = c.req.query("gitBranch");
    const customEnvironmentId = c.req.query("customEnvironmentId");
    const customEnvironmentSlug = c.req.query("customEnvironmentSlug");
    let list = vs.envVars.findBy("projectId", project.uid);
    if (gitBranchQ !== void 0) {
      list = list.filter((e) => e.gitBranch === gitBranchQ);
    }
    if (customEnvironmentId !== void 0 && customEnvironmentId !== "") {
      list = list.filter((e) => e.customEnvironmentIds.includes(customEnvironmentId));
    }
    if (customEnvironmentSlug !== void 0 && customEnvironmentSlug !== "") {
      list = list.filter((e) => e.customEnvironmentIds.includes(customEnvironmentSlug));
    }
    const pagination = parseCursorPagination(c);
    const { items, pagination: pageMeta } = applyCursorPagination(list, pagination);
    return c.json({
      envs: items.map((i) => formatEnvVar(i, decrypt)),
      pagination: pageMeta
    });
  });
  app.post("/v10/projects/:idOrName/env", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr5(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr5(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr5(c, 404, "not_found", "Project not found");
    }
    const upsert = parseQueryBoolean(c.req.query("upsert"));
    const rawBody = await c.req.json().catch(() => null);
    let items = [];
    if (Array.isArray(rawBody)) {
      items = rawBody;
    } else if (rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)) {
      items = [rawBody];
    } else {
      return vercelErr5(c, 400, "bad_request", "Invalid JSON body");
    }
    const created = [];
    const pending = [];
    for (const body of items) {
      const parsed = parseEnvRow(body);
      if (parsed.error) {
        return vercelErr5(c, 400, "bad_request", parsed.error);
      }
      const { row } = parsed;
      const existingDb = findEnvByKeyAndTargetsOverlap(vs, project.uid, row.key, row.target);
      const existingPending = pending.find((e) => e.key === row.key && targetsOverlap(e.target, row.target));
      if (upsert) {
        const toUpdate = existingDb ?? existingPending;
        if (toUpdate) {
          const updated = vs.envVars.update(toUpdate.id, {
            key: row.key,
            value: row.value,
            type: row.type,
            target: row.target,
            gitBranch: row.gitBranch,
            customEnvironmentIds: row.customEnvironmentIds,
            comment: row.comment
          });
          if (!updated) {
            return vercelErr5(c, 500, "internal_error", "Failed to update environment variable");
          }
          const idx = pending.findIndex((p) => p.id === updated.id);
          if (idx >= 0) pending[idx] = updated;
          else pending.push(updated);
          created.push(updated);
          continue;
        }
      } else {
        if (existingDb || existingPending) {
          return vercelErr5(
            c,
            409,
            "env_already_exists",
            `An environment variable with key "${row.key}" and overlapping targets already exists`
          );
        }
      }
      const inserted = vs.envVars.insert({
        uid: generateUid("env"),
        projectId: project.uid,
        key: row.key,
        value: row.value,
        type: row.type,
        target: row.target,
        gitBranch: row.gitBranch,
        customEnvironmentIds: row.customEnvironmentIds,
        comment: row.comment,
        decrypted: row.decrypted
      });
      pending.push(inserted);
      created.push(inserted);
    }
    return c.json({ envs: created.map((e) => formatEnvVar(e, true)) });
  });
  app.get("/v10/projects/:idOrName/env/:id", (c) => {
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr5(c, 401, "not_authenticated", "Authentication required");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr5(c, 404, "not_found", "Project not found");
    }
    const env = findEnvByUidInProject(vs, project.uid, c.req.param("id"));
    if (!env) {
      return vercelErr5(c, 404, "not_found", "Environment variable not found");
    }
    const decrypt = parseQueryBoolean(c.req.query("decrypt"));
    return c.json(formatEnvVar(env, decrypt));
  });
  app.patch("/v9/projects/:idOrName/env/:id", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr5(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr5(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr5(c, 404, "not_found", "Project not found");
    }
    const existing = findEnvByUidInProject(vs, project.uid, c.req.param("id"));
    if (!existing) {
      return vercelErr5(c, 404, "not_found", "Environment variable not found");
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("key" in body) {
      if (typeof body.key !== "string" || !body.key.trim()) {
        return vercelErr5(c, 400, "bad_request", "Invalid value: key must be a non-empty string");
      }
      patch.key = body.key;
    }
    if ("value" in body) {
      if (typeof body.value !== "string") {
        return vercelErr5(c, 400, "bad_request", "Invalid value: value must be a string");
      }
      patch.value = body.value;
    }
    if ("type" in body) {
      const t = parseType(body.type);
      if (t === "invalid") {
        return vercelErr5(
          c,
          400,
          "bad_request",
          "Invalid value: type must be one of system, encrypted, plain, secret, sensitive"
        );
      }
      patch.type = t;
    }
    if ("target" in body) {
      const t = parseTarget(body.target);
      if (t === "invalid") {
        return vercelErr5(
          c,
          400,
          "bad_request",
          "Invalid value: target must be a non-empty array of production, preview, development"
        );
      }
      patch.target = t;
    }
    if ("gitBranch" in body) {
      if (body.gitBranch === null) {
        patch.gitBranch = null;
      } else if (typeof body.gitBranch === "string") {
        patch.gitBranch = body.gitBranch;
      } else {
        return vercelErr5(c, 400, "bad_request", "Invalid value: gitBranch must be a string or null");
      }
    }
    if ("customEnvironmentIds" in body) {
      const ids = parseCustomEnvironmentIds(body.customEnvironmentIds);
      if (ids === "invalid") {
        return vercelErr5(c, 400, "bad_request", "Invalid value: customEnvironmentIds must be an array of strings");
      }
      patch.customEnvironmentIds = ids;
    }
    if ("comment" in body) {
      if (body.comment === null) {
        patch.comment = null;
      } else if (typeof body.comment === "string") {
        patch.comment = body.comment;
      } else {
        return vercelErr5(c, 400, "bad_request", "Invalid value: comment must be a string or null");
      }
    }
    const nextKey = patch.key ?? existing.key;
    const nextTarget = patch.target ?? existing.target;
    const conflict = findEnvByKeyAndTargetsOverlap(vs, project.uid, nextKey, nextTarget, existing.id);
    if (conflict) {
      return vercelErr5(
        c,
        409,
        "env_already_exists",
        `An environment variable with key "${nextKey}" and overlapping targets already exists`
      );
    }
    const updated = vs.envVars.update(existing.id, patch);
    if (!updated) {
      return vercelErr5(c, 500, "internal_error", "Failed to update environment variable");
    }
    return c.json(formatEnvVar(updated, true));
  });
  app.delete("/v9/projects/:idOrName/env/:id", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr5(c, 401, "not_authenticated", "Authentication required");
    }
    const scope = resolveTeamScope(c, vs);
    if (!scope) {
      return vercelErr5(c, 400, "bad_request", "Could not resolve team or account scope");
    }
    const project = lookupProject(vs, c.req.param("idOrName"), scope.accountId);
    if (!project) {
      return vercelErr5(c, 404, "not_found", "Project not found");
    }
    const existing = findEnvByUidInProject(vs, project.uid, c.req.param("id"));
    if (!existing) {
      return vercelErr5(c, 404, "not_found", "Environment variable not found");
    }
    const snapshot = formatEnvVar(existing, true);
    vs.envVars.delete(existing.id);
    return c.json(snapshot, 200);
  });
}
var PENDING_CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("vercel.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("vercel.oauth.pendingCodes", map);
  }
  return map;
}
function isPendingCodeExpired(p) {
  return Date.now() - p.created_at > PENDING_CODE_TTL_MS;
}
var SERVICE_LABEL = "Vercel";
function oauthRoutes({ app, store, tokenMap }) {
  const vs = getVercelStore(store);
  app.get("/oauth/authorize", (c) => {
    const client_id = c.req.query("client_id") ?? "";
    const redirect_uri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const state = c.req.query("state") ?? "";
    const code_challenge = c.req.query("code_challenge") ?? "";
    const code_challenge_method = c.req.query("code_challenge_method") ?? "";
    const integrationsConfigured = vs.integrations.all().length > 0;
    let integrationName = "";
    if (integrationsConfigured) {
      const integration = vs.integrations.findOneBy("client_id", client_id);
      if (!integration) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${client_id}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (redirect_uri && !matchesRedirectUri(redirect_uri, integration.redirect_uris)) {
        console.warn(
          `[OAuth] redirect_uri mismatch: got "${redirect_uri}", registered: ${JSON.stringify(integration.redirect_uris)}`
        );
        return c.html(
          renderErrorPage(
            "Redirect URI mismatch",
            "The redirect_uri is not registered for this application.",
            SERVICE_LABEL
          ),
          400
        );
      }
      integrationName = integration.name;
    }
    const subtitleText = integrationName ? `Authorize <strong>${escapeHtml(integrationName)}</strong> to access your account.` : "Choose a seeded user to continue.";
    const users = vs.users.all();
    const userButtons = users.map((user) => {
      const u = formatUser(user);
      return renderUserButton({
        letter: (u.username[0] ?? "?").toUpperCase(),
        login: u.username,
        name: u.name ?? void 0,
        email: u.email,
        formAction: "/oauth/authorize/callback",
        hiddenFields: {
          username: u.username,
          redirect_uri,
          scope,
          state,
          client_id,
          code_challenge,
          code_challenge_method
        }
      });
    }).join("\n");
    const body = users.length === 0 ? '<p class="empty">No users in the emulator store.</p>' : userButtons;
    return c.html(renderCardPage("Sign in to Vercel", subtitleText, body, SERVICE_LABEL));
  });
  app.post("/oauth/authorize/callback", async (c) => {
    const body = await c.req.parseBody();
    const username = bodyStr(body.username);
    const redirect_uri = bodyStr(body.redirect_uri);
    const scope = bodyStr(body.scope);
    const state = bodyStr(body.state);
    const client_id = bodyStr(body.client_id);
    const code = randomBytes2(20).toString("hex");
    const code_challenge = bodyStr(body.code_challenge);
    const code_challenge_method = bodyStr(body.code_challenge_method);
    const pendingCodes = getPendingCodes(store);
    pendingCodes.set(code, {
      username,
      scope,
      redirectUri: redirect_uri,
      clientId: client_id,
      codeChallenge: code_challenge || null,
      codeChallengeMethod: code_challenge_method || null,
      created_at: Date.now()
    });
    debug(
      "vercel.oauth",
      `[Vercel callback] generated code: ${code.slice(0, 8)}... for username=${username}, challenge=${code_challenge ? "present" : "none"}, pendingCodes size: ${pendingCodes.size}`
    );
    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state !== "") url.searchParams.set("state", state);
    debug("vercel.oauth", `[Vercel callback] redirecting to: ${url.toString().slice(0, 120)}...`);
    return c.redirect(url.toString(), 302);
  });
  app.post("/login/oauth/token", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    const pendingCodes = getPendingCodes(store);
    debug("vercel.oauth", `[Vercel token] Content-Type: ${contentType}`);
    debug("vercel.oauth", `[Vercel token] pendingCodes size: ${pendingCodes.size}`);
    debug(
      "vercel.oauth",
      `[Vercel token] pendingCodes keys: ${[...pendingCodes.keys()].map((k) => k.slice(0, 8) + "...").join(", ")}`
    );
    const rawText = await c.req.text();
    debug("vercel.oauth", `[Vercel token] raw body: ${rawText.slice(0, 500)}`);
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
    debug("vercel.oauth", `[Vercel token] parsed keys: ${Object.keys(body).join(", ")}`);
    const code = typeof body.code === "string" ? body.code : "";
    const redirect_uri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
    const code_verifier = typeof body.code_verifier === "string" ? body.code_verifier : void 0;
    const bodyClientId = typeof body.client_id === "string" ? body.client_id : "";
    const bodyClientSecret = typeof body.client_secret === "string" ? body.client_secret : "";
    debug("vercel.oauth", `[Vercel token] code: ${code.slice(0, 8)}... (len=${code.length})`);
    debug("vercel.oauth", `[Vercel token] client_id: ${bodyClientId}`);
    debug("vercel.oauth", `[Vercel token] client_secret: ${bodyClientSecret.slice(0, 4)}****`);
    debug(
      "vercel.oauth",
      `[Vercel token] code_verifier: ${code_verifier ? code_verifier.slice(0, 8) + "..." : "undefined"}`
    );
    const integrationsConfigured = vs.integrations.all().length > 0;
    if (integrationsConfigured) {
      const integration = vs.integrations.findOneBy("client_id", bodyClientId);
      if (!integration) {
        debug("vercel.oauth", `[Vercel token] REJECTED: client_id not found`);
        return c.json(
          { error: "invalid_client", error_description: "The client_id and/or client_secret passed are incorrect." },
          401
        );
      }
      if (!constantTimeSecretEqual(bodyClientSecret, integration.client_secret)) {
        debug("vercel.oauth", `[Vercel token] REJECTED: client_secret mismatch`);
        return c.json(
          { error: "invalid_client", error_description: "The client_id and/or client_secret passed are incorrect." },
          401
        );
      }
      debug("vercel.oauth", `[Vercel token] client credentials OK (${integration.name})`);
    }
    const pending = pendingCodes.get(code);
    if (!pending) {
      debug("vercel.oauth", `[Vercel token] REJECTED: code not found in pendingCodes`);
      return c.json({ error: "invalid_grant", error_description: "The code passed is incorrect or expired." }, 400);
    }
    if (isPendingCodeExpired(pending)) {
      debug("vercel.oauth", `[Vercel token] REJECTED: code expired`);
      pendingCodes.delete(code);
      return c.json({ error: "invalid_grant", error_description: "The code passed is incorrect or expired." }, 400);
    }
    debug("vercel.oauth", `[Vercel token] code valid, username=${pending.username}, scope=${pending.scope}`);
    if (redirect_uri && pending.redirectUri && redirect_uri !== pending.redirectUri) {
      debug(
        "vercel.oauth",
        `[Vercel token] REJECTED: redirect_uri mismatch (got "${redirect_uri}", expected "${pending.redirectUri}")`
      );
      pendingCodes.delete(code);
      return c.json(
        {
          error: "invalid_grant",
          error_description: "The redirect_uri does not match the one used during authorization."
        },
        400
      );
    }
    if (pending.codeChallenge != null) {
      if (code_verifier === void 0) {
        return c.json({ error: "invalid_grant", error_description: "PKCE verification failed." }, 400);
      }
      const method = (pending.codeChallengeMethod ?? "plain").toLowerCase();
      if (method === "s256") {
        const expected = createHash2("sha256").update(code_verifier).digest("base64url");
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
    debug("vercel.oauth", `[Vercel token] PKCE OK (challenge=${pending.codeChallenge ? "present" : "none"})`);
    pendingCodes.delete(code);
    const user = vs.users.findOneBy("username", pending.username);
    if (!user) {
      debug("vercel.oauth", `[Vercel token] REJECTED: user "${pending.username}" not found`);
      return c.json(
        { error: "invalid_grant", error_description: "The user associated with this code was not found." },
        400
      );
    }
    const token = "vercel_" + randomBytes2(20).toString("base64url");
    const scopes = pending.scope ? pending.scope.split(/[,\s]+/).filter(Boolean) : [];
    if (tokenMap) {
      tokenMap.set(token, { login: user.username, id: user.id, scopes });
    }
    debug(
      "vercel.oauth",
      `[Vercel token] SUCCESS: issued token for ${user.username} (scopes: ${scopes.join(",") || "none"})`
    );
    return c.json({
      access_token: token,
      token_type: "Bearer",
      scope: pending.scope || ""
    });
  });
  app.get("/login/oauth/userinfo", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: { code: "unauthorized", message: "Authentication required" } }, 401);
    }
    const user = vs.users.findOneBy("username", authUser.login);
    if (!user) {
      return c.json({ error: { code: "unauthorized", message: "Authentication required" } }, 401);
    }
    return c.json({
      sub: user.uid,
      email: user.email,
      name: user.name,
      preferred_username: user.username,
      email_verified: true,
      picture: user.avatar
    });
  });
}
function vercelErr6(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function apiKeysRoutes({ app, store, tokenMap }) {
  const vs = getVercelStore(store);
  app.post("/v1/api-keys", async (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr6(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr6(c, 403, "forbidden", "User not found");
    }
    const teamId = c.req.query("teamId") ?? null;
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name : "API Key";
    const tokenString = `vercel_api_${randomBytes3(24).toString("base64url")}`;
    const uid = generateUid("ak");
    vs.apiKeys.insert({
      uid,
      name,
      teamId,
      userId: user.uid,
      tokenString
    });
    if (tokenMap) {
      tokenMap.set(tokenString, { login: user.username, id: user.id, scopes: [] });
    }
    return c.json({
      apiKeyString: tokenString,
      apiKey: {
        id: uid,
        name,
        teamId,
        createdAt: Date.now()
      }
    });
  });
  app.get("/v1/api-keys", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr6(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr6(c, 403, "forbidden", "User not found");
    }
    const teamId = c.req.query("teamId") ?? null;
    const keys = vs.apiKeys.all().filter((k) => {
      if (k.userId !== user.uid) return false;
      if (teamId && k.teamId !== teamId) return false;
      return true;
    });
    return c.json({
      keys: keys.map((k) => ({
        id: k.uid,
        name: k.name,
        teamId: k.teamId,
        createdAt: k.created_at
      }))
    });
  });
  app.delete("/v1/api-keys/:keyId", (c) => {
    const auth = c.get("authUser");
    if (!auth) {
      return vercelErr6(c, 401, "not_authenticated", "Authentication required");
    }
    const user = vs.users.findOneBy("username", auth.login);
    if (!user) {
      return vercelErr6(c, 403, "forbidden", "User not found");
    }
    const keyId = c.req.param("keyId");
    const key = vs.apiKeys.findOneBy("uid", keyId);
    if (!key) {
      return vercelErr6(c, 404, "not_found", "API key not found");
    }
    if (key.userId !== user.uid) {
      return vercelErr6(c, 403, "forbidden", "Not authorized to delete this API key");
    }
    if (tokenMap) {
      tokenMap.delete(key.tokenString);
    }
    vs.apiKeys.delete(key.id);
    return c.json({});
  });
}
var DEFAULT_CACHE_MAX_AGE = 2592e3;
var DEFAULT_LIST_LIMIT = 1e3;
var MIME_TYPES = {
  avif: "image/avif",
  css: "text/css",
  csv: "text/csv",
  gif: "image/gif",
  gz: "application/gzip",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  md: "text/markdown",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain",
  wasm: "application/wasm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml",
  zip: "application/zip"
};
function blobErr(c, status, code, message) {
  return c.json({ error: { code, message } }, status);
}
function forbidden(c) {
  return blobErr(c, 403, "forbidden", "Access denied");
}
function resolveStoreId(c) {
  const authHeader = c.req.header("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
  if (!match) return null;
  const token = match[1];
  if (token.startsWith("vercel_blob_rw_")) {
    const parts = token.split("_");
    if (parts.length >= 5 && parts[3] !== "" && parts[4] !== "") {
      return parts[3];
    }
    return null;
  }
  const storeId = c.req.header("x-vercel-blob-store-id")?.trim();
  return storeId ? storeId : null;
}
function inferContentType(pathname) {
  const basename = pathname.split("/").pop() ?? "";
  const dot = basename.lastIndexOf(".");
  if (dot <= 0) return "application/octet-stream";
  const ext = basename.slice(dot + 1).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}
function randomSuffix() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes4(8);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
function withRandomSuffix(pathname) {
  const suffix = randomSuffix();
  const slash = pathname.lastIndexOf("/");
  const dot = pathname.lastIndexOf(".");
  if (dot > slash + 1) {
    return `${pathname.slice(0, dot)}-${suffix}${pathname.slice(dot)}`;
  }
  return `${pathname}-${suffix}`;
}
function encodePathname(pathname) {
  return pathname.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}
function blobUrl(baseUrl, storeId, pathname) {
  return `${baseUrl}/blob/${encodeURIComponent(storeId)}/${encodePathname(pathname)}`;
}
function downloadUrl(url) {
  return `${url}?download=1`;
}
function contentDispositionFor(pathname) {
  const basename = (pathname.split("/").pop() ?? pathname).replace(/"/g, "");
  return `attachment; filename="${basename}"`;
}
function resolveBlobRef(urlOrPathname, baseUrl) {
  if (!/^https?:\/\//i.test(urlOrPathname)) {
    return { pathname: urlOrPathname };
  }
  let url;
  try {
    url = new URL(urlOrPathname);
  } catch {
    return { pathname: urlOrPathname };
  }
  let path = decodeURIComponent(url.pathname);
  const basePath = baseUrl?.pathname.replace(/\/$/, "") ?? "";
  if (basePath && url.origin === baseUrl?.origin && path.startsWith(`${basePath}/blob/`)) {
    path = path.slice(basePath.length);
  }
  const match = /^\/blob\/([^/]+)\/(.+)$/.exec(path);
  if (match) {
    return { storeId: match[1], pathname: match[2] };
  }
  const vercelHost = /^([^.]+)\.(?:public|private)\.blob\.vercel-storage\.com$/i.exec(url.hostname);
  if (vercelHost) {
    return { storeId: vercelHost[1], pathname: path.replace(/^\//, "") };
  }
  return { pathname: path.replace(/^\//, "") };
}
function findBlob(vs, storeId, pathname) {
  return vs.blobs.findBy("pathname", pathname).find((b) => b.storeId === storeId);
}
function findBlobRef(vs, storeId, ref) {
  if (ref.storeId && ref.storeId !== storeId) return void 0;
  return findBlob(vs, storeId, ref.pathname);
}
function headResponse(baseUrl, blob) {
  const url = blobUrl(baseUrl, blob.storeId, blob.pathname);
  return {
    url,
    downloadUrl: downloadUrl(url),
    pathname: blob.pathname,
    size: blob.size,
    contentType: blob.contentType,
    contentDisposition: blob.contentDisposition,
    cacheControl: blob.cacheControl,
    uploadedAt: blob.uploadedAt,
    etag: blob.etag
  };
}
function blobRoutes({ app, store, baseUrl }) {
  const vs = getVercelStore(store);
  const parsedBaseUrl = new URL(baseUrl);
  const handlePut = async (c) => {
    const storeId = resolveStoreId(c);
    if (!storeId) return forbidden(c);
    const rawPathname = c.req.query("pathname");
    if (!rawPathname) {
      return blobErr(c, 400, "bad_request", "pathname is required");
    }
    if (rawPathname.includes("//")) {
      return blobErr(c, 400, "bad_request", "pathname cannot contain //");
    }
    const access = c.req.header("x-vercel-blob-access") ?? "public";
    if (access !== "public") {
      return blobErr(c, 400, "bad_request", "Only access: public is supported by the emulator");
    }
    const pathname = c.req.header("x-add-random-suffix") === "1" ? withRandomSuffix(rawPathname) : rawPathname;
    const existing = findBlob(vs, storeId, pathname);
    const ifMatch = c.req.header("x-if-match");
    if (ifMatch) {
      const normalized = ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"`;
      if (!existing || existing.etag !== normalized) {
        return blobErr(c, 412, "precondition_failed", "Precondition failed: ETag mismatch.");
      }
    } else if (existing && c.req.header("x-allow-overwrite") !== "1") {
      return blobErr(c, 400, "bad_request", "This blob already exists, use allowOverwrite: true to overwrite it");
    }
    const fromUrl = c.req.query("fromUrl");
    const source = fromUrl === void 0 ? void 0 : findBlobRef(vs, storeId, resolveBlobRef(fromUrl, parsedBaseUrl));
    if (fromUrl !== void 0 && !source) {
      return blobErr(c, 404, "not_found", "The requested blob does not exist");
    }
    const body = source ? Buffer.from(source.dataBase64, "base64") : Buffer.from(await c.req.arrayBuffer());
    const contentType = c.req.header("x-content-type") || inferContentType(pathname);
    const maxAgeHeader = c.req.header("x-cache-control-max-age");
    const maxAge = maxAgeHeader ? parseInt(maxAgeHeader, 10) : NaN;
    const cacheControl = `public, max-age=${Number.isFinite(maxAge) ? maxAge : DEFAULT_CACHE_MAX_AGE}`;
    const contentDisposition = contentDispositionFor(pathname);
    const etag = `"${createHash3("sha256").update(body).digest("hex")}"`;
    const uploadedAt = (/* @__PURE__ */ new Date()).toISOString();
    const fields = {
      pathname,
      storeId,
      contentType,
      contentDisposition,
      cacheControl,
      size: body.byteLength,
      etag,
      uploadedAt,
      dataBase64: body.toString("base64")
    };
    if (existing) {
      vs.blobs.update(existing.id, fields);
    } else {
      vs.blobs.insert(fields);
    }
    const url = blobUrl(baseUrl, storeId, pathname);
    return c.json({
      url,
      downloadUrl: downloadUrl(url),
      pathname,
      contentType,
      contentDisposition,
      etag
    });
  };
  const handleGet = (c) => {
    const storeId = resolveStoreId(c);
    if (!storeId) return forbidden(c);
    const urlParam = c.req.query("url");
    if (urlParam !== void 0) {
      const blob = findBlobRef(vs, storeId, resolveBlobRef(urlParam, parsedBaseUrl));
      if (!blob) {
        return blobErr(c, 404, "not_found", "The requested blob does not exist");
      }
      return c.json(headResponse(baseUrl, blob));
    }
    const prefix = c.req.query("prefix") ?? "";
    const limitParam = parseInt(c.req.query("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIST_LIMIT;
    const cursor = c.req.query("cursor");
    const folded = c.req.query("mode") === "folded";
    let items = vs.blobs.findBy("storeId", storeId).filter((b) => b.pathname.startsWith(prefix)).sort((a, b) => a.pathname < b.pathname ? -1 : a.pathname > b.pathname ? 1 : 0);
    const folders = /* @__PURE__ */ new Set();
    if (folded) {
      items = items.filter((b) => {
        const rest = b.pathname.slice(prefix.length);
        const slash = rest.indexOf("/");
        if (slash === -1) return true;
        folders.add(prefix + rest.slice(0, slash + 1));
        return false;
      });
    }
    if (cursor) {
      items = items.filter((b) => b.pathname > cursor);
    }
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    const result = {
      blobs: page.map((b) => {
        const url = blobUrl(baseUrl, b.storeId, b.pathname);
        return {
          url,
          downloadUrl: downloadUrl(url),
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
          etag: b.etag
        };
      }),
      hasMore
    };
    if (hasMore && page.length > 0) {
      result.cursor = page[page.length - 1].pathname;
    }
    if (folded) {
      result.folders = [...folders].sort();
    }
    return c.json(result);
  };
  app.put("/api/blob", handlePut);
  app.put("/api/blob/", handlePut);
  app.get("/api/blob", handleGet);
  app.get("/api/blob/", handleGet);
  app.post("/api/blob/delete", async (c) => {
    const storeId = resolveStoreId(c);
    if (!storeId) return forbidden(c);
    let body;
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const urls = Array.isArray(body.urls) ? body.urls.filter((u) => typeof u === "string") : [];
    const ifMatch = c.req.header("x-if-match");
    for (const urlOrPathname of urls) {
      const blob = findBlobRef(vs, storeId, resolveBlobRef(urlOrPathname, parsedBaseUrl));
      if (!blob) continue;
      if (ifMatch) {
        const normalized = ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"`;
        if (blob.etag !== normalized) {
          return blobErr(c, 412, "precondition_failed", "Precondition failed: ETag mismatch.");
        }
      }
      vs.blobs.delete(blob.id);
    }
    return c.json(null);
  });
  const handleMpu = (c) => blobErr(c, 400, "bad_request", "Multipart uploads are not supported by the emulator yet");
  app.post("/api/blob/mpu", handleMpu);
  app.put("/api/blob/mpu", handleMpu);
  app.get("/blob/:storeId/:pathname{.+}", (c) => {
    const storeId = c.req.param("storeId");
    const pathname = c.req.param("pathname");
    const blob = findBlob(vs, storeId, pathname);
    if (!blob) {
      return blobErr(c, 404, "not_found", "The requested blob does not exist");
    }
    const headers = {
      etag: blob.etag,
      "cache-control": blob.cacheControl
    };
    if (c.req.header("if-none-match") === blob.etag) {
      return c.body(null, 304, headers);
    }
    headers["content-type"] = blob.contentType;
    if (c.req.query("download") === "1") {
      headers["content-disposition"] = blob.contentDisposition;
    }
    return c.body(Buffer.from(blob.dataBase64, "base64"), 200, headers);
  });
}
function seedDefaults(store, _baseUrl) {
  const vs = getVercelStore(store);
  vs.users.insert({
    uid: stableUid("user", "vercel.user.admin"),
    email: "admin@localhost",
    username: "admin",
    name: "Admin",
    avatar: null,
    defaultTeamId: null,
    softBlock: null,
    billing: { plan: "hobby", period: null, trial: null, cancelation: null, addons: null },
    resourceConfig: { nodeType: "Edge Functions", concurrentBuilds: 1 },
    stagingPrefix: "staging",
    version: null
  });
}
function seedFromConfig(store, baseUrl, config) {
  const vs = getVercelStore(store);
  if (config.users) {
    for (const u of config.users) {
      const existing = vs.users.findOneBy("username", u.username);
      if (existing) continue;
      vs.users.insert({
        uid: stableUid("user", `vercel.user.${u.username}`),
        email: u.email ?? `${u.username}@localhost`,
        username: u.username,
        name: u.name ?? null,
        avatar: null,
        defaultTeamId: null,
        softBlock: null,
        billing: { plan: "hobby", period: null, trial: null, cancelation: null, addons: null },
        resourceConfig: { nodeType: "Edge Functions", concurrentBuilds: 1 },
        stagingPrefix: "staging",
        version: null
      });
    }
  }
  if (config.teams) {
    for (const t of config.teams) {
      const existing = vs.teams.findOneBy("slug", t.slug);
      if (existing) continue;
      const firstUser = vs.users.all()[0];
      const creatorId = firstUser?.uid ?? "unknown";
      const team = vs.teams.insert({
        uid: generateUid("team"),
        slug: t.slug,
        name: t.name ?? t.slug,
        avatar: null,
        description: t.description ?? null,
        creatorId,
        membership: { confirmed: true, role: "OWNER" },
        billing: { plan: "pro", period: null, trial: null, cancelation: null, addons: null },
        resourceConfig: { nodeType: "Edge Functions", concurrentBuilds: 1 },
        stagingPrefix: "staging"
      });
      for (const u of vs.users.all()) {
        const role = u.uid === creatorId ? "OWNER" : "MEMBER";
        vs.teamMembers.insert({
          teamId: team.uid,
          userId: u.uid,
          role,
          confirmed: true,
          joinedFrom: "seed"
        });
      }
    }
  }
  if (config.projects) {
    for (const p of config.projects) {
      let accountId;
      if (p.team) {
        const team = vs.teams.findOneBy("slug", p.team);
        if (!team) continue;
        accountId = team.uid;
      } else {
        const user = vs.users.all()[0];
        if (!user) continue;
        accountId = user.uid;
      }
      const existingByName = vs.projects.findBy("name", p.name);
      if (existingByName.some((proj) => proj.accountId === accountId)) continue;
      const project = vs.projects.insert({
        uid: generateUid("prj"),
        name: p.name,
        accountId,
        framework: p.framework ?? null,
        buildCommand: p.buildCommand ?? null,
        devCommand: null,
        installCommand: null,
        outputDirectory: p.outputDirectory ?? null,
        rootDirectory: p.rootDirectory ?? null,
        commandForIgnoringBuildStep: null,
        nodeVersion: p.nodeVersion ?? "20.x",
        serverlessFunctionRegion: null,
        publicSource: false,
        autoAssignCustomDomains: true,
        autoAssignCustomDomainsUpdatedBy: null,
        gitForkProtection: true,
        sourceFilesOutsideRootDirectory: false,
        live: true,
        link: null,
        latestDeployments: [],
        targets: {},
        protectionBypass: {},
        passwordProtection: null,
        ssoProtection: null,
        trustedIps: null,
        connectConfigurationId: null,
        gitComments: { onPullRequest: true, onCommit: false },
        webAnalytics: null,
        speedInsights: null,
        oidcTokenConfig: null,
        tier: "hobby"
      });
      if (p.envVars) {
        for (const ev of p.envVars) {
          vs.envVars.insert({
            uid: generateUid("env"),
            projectId: project.uid,
            key: ev.key,
            value: ev.value,
            type: ev.type ?? "encrypted",
            target: ev.target ?? ["production", "preview", "development"],
            gitBranch: null,
            customEnvironmentIds: [],
            comment: null,
            decrypted: false
          });
        }
      }
    }
  }
  if (config.integrations) {
    for (const integ of config.integrations) {
      const existing = vs.integrations.findOneBy("client_id", integ.client_id);
      if (existing) continue;
      vs.integrations.insert({
        client_id: integ.client_id,
        client_secret: integ.client_secret,
        name: integ.name,
        redirect_uris: integ.redirect_uris
      });
    }
  }
}
var vercelPlugin = {
  name: "vercel",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    oauthRoutes(ctx);
    userRoutes(ctx);
    projectsRoutes(ctx);
    deploymentsRoutes(ctx);
    domainsRoutes(ctx);
    envRoutes(ctx);
    apiKeysRoutes(ctx);
    blobRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = vercelPlugin;
export {
  index_default as default,
  getVercelStore,
  seedFromConfig,
  vercelPlugin
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-GO7Q3HY3.js.map
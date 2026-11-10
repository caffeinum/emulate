import { randomBytes } from "crypto";
import type { Context } from "@emulators/core";
import type { AppEnv, RouteContext } from "@emulators/core";
import { escapeHtml, parseCookies, renderCardPage, renderErrorPage, renderUserButton } from "@emulators/core";
import type { GitHubApp, GitHubOrg, GitHubUser } from "../entities.js";
import { getGitHubStore, type GitHubStore } from "../store.js";
import { getAppAuthorizedLogins, getPendingCodes, getSessionMap } from "./oauth.js";

const SERVICE_LABEL = "GitHub";

type SetupAction = "install" | "update" | "request";

function orgRole(gh: GitHubStore, org: GitHubOrg, userId: number): "admin" | "member" | null {
  let role: "admin" | "member" | null = null;
  for (const team of gh.teams.findBy("org_id", org.id)) {
    for (const member of gh.teamMembers.findBy("team_id", team.id)) {
      if (member.user_id !== userId) continue;
      if (member.role === "maintainer") return "admin";
      role = "member";
    }
  }
  return role;
}

export function orgsForUser(gh: GitHubStore, userId: number): GitHubOrg[] {
  return gh.orgs
    .all()
    .filter((org) => orgRole(gh, org, userId) !== null)
    .sort((a, b) => a.login.localeCompare(b.login));
}

/** The install link GitHub shares for an App: /apps/:slug/installations/new?state=... */
export function appInstallRoutes({ app, store }: RouteContext): void {
  const gh = getGitHubStore(store);
  const installPath = (slug: string) => `/apps/${encodeURIComponent(slug)}/installations/new`;

  function sessionUser(c: Context<AppEnv>): GitHubUser | undefined {
    const sessionId = parseCookies(c.req.header("Cookie") ?? "")["_emu_session"];
    const login = sessionId ? getSessionMap(store).get(sessionId) : undefined;
    return login ? gh.users.findOneBy("login", login) : undefined;
  }

  function renderUserPicker(ghApp: GitHubApp, state: string) {
    const users = [...gh.users.all()].sort((a, b) => a.login.localeCompare(b.login));
    const body =
      users.length === 0
        ? '<p class="empty">No users in the emulator store.</p>'
        : users
            .map((user) =>
              renderUserButton({
                letter: (user.login[0] ?? "?").toUpperCase(),
                login: user.login,
                name: user.name ?? undefined,
                email: user.email ?? undefined,
                formAction: installPath(ghApp.slug),
                hiddenFields: { login: user.login, state },
              }),
            )
            .join("\n");
    return renderCardPage(`Install ${ghApp.name}`, "Choose a seeded user to sign in as.", body, SERVICE_LABEL);
  }

  function renderAccountPicker(ghApp: GitHubApp, user: GitHubUser, state: string) {
    const accounts = [
      { login: user.login, label: "Personal account" },
      ...orgsForUser(gh, user.id).map((org) => ({
        login: org.login,
        label:
          orgRole(gh, org, user.id) === "admin" ? "Organization (owner)" : "Organization (member, requests approval)",
      })),
    ];
    const body = accounts
      .map((account) =>
        renderUserButton({
          letter: (account.login[0] ?? "?").toUpperCase(),
          login: account.login,
          name: account.label,
          formAction: installPath(ghApp.slug),
          hiddenFields: { login: user.login, account: account.login, state },
        }),
      )
      .join("\n");
    return renderCardPage(
      `Install ${ghApp.name}`,
      `Signed in as <strong>${escapeHtml(user.login)}</strong>. Where do you want to install ${escapeHtml(ghApp.name)}?`,
      body,
      SERVICE_LABEL,
    );
  }

  function findOrCreateInstallation(ghApp: GitHubApp, account: GitHubUser | GitHubOrg, type: "User" | "Organization") {
    const existing = gh.appInstallations
      .findBy("app_id", ghApp.app_id)
      .find((inst) => inst.account_id === account.id && inst.account_type === type);
    if (existing) return { installation: existing, created: false };
    const nextId = Math.max(0, ...gh.appInstallations.all().map((inst) => inst.installation_id)) + 1;
    const installation = gh.appInstallations.insert({
      installation_id: nextId,
      app_id: ghApp.app_id,
      account_type: type,
      account_id: account.id,
      account_login: account.login,
      repository_selection: "all",
      repository_ids: [],
      permissions: ghApp.permissions,
      events: ghApp.events,
      suspended_at: null,
    });
    return { installation, created: true };
  }

  function mintCode(ghApp: GitHubApp, login: string): string | undefined {
    if (!ghApp.client_id || !ghApp.callback_url) return undefined;
    const code = randomBytes(20).toString("hex");
    getPendingCodes(store).set(code, {
      login,
      scope: "",
      redirectUri: ghApp.callback_url,
      clientId: ghApp.client_id,
      created_at: Date.now(),
    });
    return code;
  }

  app.get("/apps/:slug/installations/new", (c) => {
    const ghApp = gh.apps.findOneBy("slug", c.req.param("slug"));
    if (!ghApp) return c.html(renderErrorPage("Not Found", "No GitHub App has this slug.", SERVICE_LABEL), 404);
    const state = c.req.query("state") ?? "";
    const user = sessionUser(c);
    return c.html(user ? renderAccountPicker(ghApp, user, state) : renderUserPicker(ghApp, state));
  });

  app.post("/apps/:slug/installations/new", async (c) => {
    const ghApp = gh.apps.findOneBy("slug", c.req.param("slug"));
    if (!ghApp) return c.html(renderErrorPage("Not Found", "No GitHub App has this slug.", SERVICE_LABEL), 404);
    const body = (await c.req.parseBody()) as Record<string, string>;
    const state = String(body.state ?? "");
    const user = gh.users.findOneBy("login", String(body.login ?? ""));
    if (!user) return c.html(renderErrorPage("User not found", "Pick a seeded user.", SERVICE_LABEL), 400);

    const sessionId = randomBytes(24).toString("base64url");
    getSessionMap(store).set(sessionId, user.login);
    c.header("Set-Cookie", `_emu_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);

    const accountLogin = String(body.account ?? "");
    if (!accountLogin) return c.html(renderAccountPicker(ghApp, user, state));

    let setupAction: SetupAction;
    let installationId: number | undefined;
    if (accountLogin === user.login) {
      const { installation, created } = findOrCreateInstallation(ghApp, user, "User");
      setupAction = created ? "install" : "update";
      installationId = installation.installation_id;
    } else {
      const org = gh.orgs.findOneBy("login", accountLogin);
      const role = org ? orgRole(gh, org, user.id) : null;
      if (!org || !role) {
        return c.html(
          renderErrorPage(
            "Account not available",
            `${user.login} cannot install apps on ${accountLogin}.`,
            SERVICE_LABEL,
          ),
          403,
        );
      }
      if (role === "admin") {
        const { installation, created } = findOrCreateInstallation(ghApp, org, "Organization");
        setupAction = created ? "install" : "update";
        installationId = installation.installation_id;
      } else {
        setupAction = "request";
      }
    }

    if (!ghApp.callback_url) {
      const done =
        setupAction === "request"
          ? `Requested ${escapeHtml(ghApp.name)} on ${escapeHtml(accountLogin)}. An organization owner must approve it.`
          : `Installed ${escapeHtml(ghApp.name)} on ${escapeHtml(accountLogin)} (installation ${installationId}).`;
      return c.html(renderCardPage("Installation complete", done, "", SERVICE_LABEL));
    }

    const alreadyAuthorized = ghApp.client_id
      ? (getAppAuthorizedLogins(store).get(ghApp.client_id)?.has(user.login) ?? false)
      : false;
    const code = setupAction === "update" && alreadyAuthorized ? undefined : mintCode(ghApp, user.login);

    const target = new URL(ghApp.callback_url);
    if (code) target.searchParams.set("code", code);
    if (installationId !== undefined) target.searchParams.set("installation_id", String(installationId));
    target.searchParams.set("setup_action", setupAction);
    if (state) target.searchParams.set("state", state);
    return c.redirect(target.toString(), 302);
  });
}

import type { RouteContext } from "@emulators/core";
import type { SlackUsergroup } from "../entities.js";
import { getSlackStore } from "../store.js";
import { parseSlackBody, requireSlackScopes, slackError, slackOk } from "../helpers.js";

export function usergroupsRoutes({ app, store }: RouteContext): void {
  const ss = () => getSlackStore(store);
  const truthy = (value: unknown) => value === true || value === "true" || value === "1" || value === 1;

  app.post("/api/usergroups.list", async (c) => {
    if (!c.get("authUser")) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["usergroups:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const includeUsers = truthy(body.include_users);
    const includeCount = truthy(body.include_count);
    const usergroups = ss()
      .usergroups.all()
      .filter((group) => truthy(body.include_disabled) || !group.disabled)
      .map((group) => ({
        ...formatUsergroup(group),
        ...(includeUsers ? { users: group.users } : {}),
        ...(includeCount ? { user_count: group.users.length } : {}),
      }));
    return slackOk(c, { usergroups });
  });

  app.post("/api/usergroups.users.list", async (c) => {
    if (!c.get("authUser")) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["usergroups:read"]);
    if (scopeError) return scopeError;
    const body = await parseSlackBody(c);
    const group = ss().usergroups.findOneBy("usergroup_id", typeof body.usergroup === "string" ? body.usergroup : "");
    if (!group) return slackError(c, "no_such_subteam");
    if (group.disabled && !truthy(body.include_disabled)) return slackError(c, "subteam_disabled");
    return slackOk(c, { users: group.users });
  });
}

function formatUsergroup(group: SlackUsergroup) {
  const created = Math.floor(new Date(group.created_at).getTime() / 1000);
  return {
    id: group.usergroup_id,
    team_id: group.team_id,
    is_usergroup: true,
    is_subteam: true,
    name: group.name,
    description: group.description,
    handle: group.handle,
    is_external: false,
    date_create: created,
    date_update: created,
    date_delete: group.disabled ? created : 0,
    auto_type: null,
    created_by: group.created_by,
    updated_by: group.created_by,
    deleted_by: null,
    prefs: { channels: [], groups: [] },
    user_count: group.users.length,
  };
}

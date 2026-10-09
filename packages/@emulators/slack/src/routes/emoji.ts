import type { Context, RouteContext } from "@emulators/core";
import { buildSlackEventEnvelope, resolveSlackEventTeamId } from "../events.js";
import { generateTs, parseSlackBody, requireSlackScopes, slackError, slackOk } from "../helpers.js";

export const SLACK_EMOJI_KEY = "slack.emoji";

export function emojiRoutes({ app, store, webhooks }: RouteContext): void {
  const emoji = () => store.getData<Record<string, string>>(SLACK_EMOJI_KEY) ?? {};

  app.post("/api/emoji.list", (c) => {
    if (!c.get("authUser")) return slackError(c, "not_authed");
    const scopeError = requireSlackScopes(c, store, ["emoji:read"]);
    if (scopeError) return scopeError;
    return slackOk(c, { emoji: emoji(), cache_ts: generateTs() });
  });

  const change = async (c: Context, next: Record<string, string>, event: Record<string, unknown>) => {
    store.setData(SLACK_EMOJI_KEY, next);
    await webhooks.dispatch(
      "emoji_changed",
      undefined,
      buildSlackEventEnvelope(resolveSlackEventTeamId(c, store), {
        type: "emoji_changed",
        ...event,
        event_ts: generateTs(),
      }),
      "slack",
    );
    return slackOk(c, {});
  };

  const parse = async (c: Context) => {
    if (!c.get("authUser")) return { error: slackError(c, "not_authed") };
    const scopeError = requireSlackScopes(c, store, ["admin.teams:write"]);
    if (scopeError) return { error: scopeError };
    const body = await parseSlackBody(c);
    const name = typeof body.name === "string" ? body.name.replace(/^:|:$/g, "") : "";
    if (!/^[a-z0-9_+'-]+$/.test(name)) return { error: slackError(c, "invalid_name") };
    return { body, name, current: emoji() };
  };

  app.post("/api/admin.emoji.add", async (c) => {
    const { error, body, name, current } = await parse(c);
    if (error) return error;
    const url = typeof body.url === "string" ? body.url : "";
    if (!url) return slackError(c, "invalid_arguments");
    if (current[name]) return slackError(c, "error_name_taken");
    return change(c, { ...current, [name]: url }, { subtype: "add", name, value: url });
  });

  app.post("/api/admin.emoji.addAlias", async (c) => {
    const { error, body, name, current } = await parse(c);
    if (error) return error;
    const target = typeof body.alias_for === "string" ? body.alias_for.replace(/^:|:$/g, "") : "";
    if (!current[target]) return slackError(c, "emoji_not_found");
    if (current[name]) return slackError(c, "error_name_taken");
    const value = `alias:${target}`;
    return change(c, { ...current, [name]: value }, { subtype: "add", name, value });
  });

  app.post("/api/admin.emoji.remove", async (c) => {
    const { error, name, current } = await parse(c);
    if (error) return error;
    if (!current[name]) return slackError(c, "emoji_not_found");
    const next = Object.fromEntries(
      Object.entries(current).filter(([key, value]) => key !== name && value !== `alias:${name}`),
    );
    const names = Object.keys(current).filter((key) => !(key in next));
    return change(c, next, { subtype: "remove", names });
  });
}

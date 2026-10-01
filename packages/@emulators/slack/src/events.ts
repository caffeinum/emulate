import { randomUUID } from "node:crypto";
import type { Context, Store, WebhookDispatcher } from "@emulators/core";
import type { SlackChannel } from "./entities.js";
import { getSlackStore } from "./store.js";

export function buildSlackEventEnvelope(teamId: string, event: Record<string, unknown>, channel?: SlackChannel) {
  return {
    type: "event_callback" as const,
    team_id: teamId,
    event_id: `Ev${randomUUID().replaceAll("-", "")}`,
    event_time: Math.floor(Date.now() / 1000),
    ...(channel ? { is_ext_shared_channel: isSlackExtSharedChannel(channel) } : {}),
    event,
  };
}

export function isSlackExtSharedChannel(channel: SlackChannel): boolean {
  return (channel.shared_team_ids?.length ?? 0) > 1;
}

export function resolveSlackChannelEventTeamId(c: Context, store: Store, channel: SlackChannel): string {
  if (isSlackExtSharedChannel(channel)) return channel.team_id;
  return resolveSlackEventTeamId(c, store, channel.team_id);
}

export function slackMessageTeamFields(store: Store, channel: SlackChannel, authorUserId?: string) {
  const authorTeamId = authorUserId
    ? getSlackStore(store).users.findOneBy("user_id", authorUserId)?.team_id
    : undefined;
  const team = authorTeamId ?? channel.team_id;
  return isSlackExtSharedChannel(channel) ? { team, user_team: team, source_team: team } : { team };
}

export function resolveSlackEventTeamId(c: Context, store: Store, fallbackTeamId?: string): string {
  const slackStore = getSlackStore(store);
  const token = c.get("authToken");
  const tokenTeamId = token ? slackStore.tokens.findOneBy("token", token)?.team_id : undefined;
  return tokenTeamId ?? fallbackTeamId ?? slackStore.teams.all()[0]?.team_id ?? "T000000001";
}

const USER_MENTION_PATTERN = /<@([UW][A-Z0-9]+)(?:\|[^>]*)?>/g;

export function findMentionedSlackBotUserIds(store: Store, text: string): string[] {
  const ss = getSlackStore(store);
  const mentioned = new Set([...text.matchAll(USER_MENTION_PATTERN)].map((match) => match[1]));
  return [...mentioned].filter((userId) => {
    const user = ss.users.findOneBy("user_id", userId);
    if (user) return user.is_bot && !user.deleted;
    const bot = ss.bots.findOneBy("user_id", userId);
    return bot !== undefined && !bot.deleted;
  });
}

export async function dispatchSlackAppMention(
  webhooks: WebhookDispatcher,
  store: Store,
  teamId: string,
  channel: SlackChannel,
  message: { text: string; ts: string; user?: string; bot_id?: string } & Record<string, unknown>,
): Promise<void> {
  if (channel.is_im) return;
  const authorBotUserId = message.bot_id
    ? getSlackStore(store).bots.findOneBy("bot_id", message.bot_id)?.user_id
    : undefined;
  const mentionsOtherBot = findMentionedSlackBotUserIds(store, message.text).some(
    (userId) => userId !== message.user && userId !== authorBotUserId && channel.members.includes(userId),
  );
  if (!mentionsOtherBot) return;

  const { reactions: _reactions, reply_count: _replyCount, reply_users: _replyUsers, ...event } = message;
  await webhooks.dispatch(
    "app_mention",
    undefined,
    buildSlackEventEnvelope(
      teamId,
      {
        ...event,
        type: "app_mention",
        channel: channel.channel_id,
        ...slackMessageTeamFields(store, channel, message.user),
        event_ts: message.ts,
      },
      channel,
    ),
    "slack",
  );
}

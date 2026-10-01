import type { Store } from "@emulators/core";
import type { SlackChannel } from "./entities.js";
import { getSlackStore } from "./store.js";

export function isSlackConnectChannel(store: Store, channel: SlackChannel): boolean {
  if (channel.is_ext_shared || (channel.shared_team_ids?.length ?? 0) > 1) return true;
  const users = getSlackStore(store).users;
  return channel.members.some((member) => {
    const user = users.findOneBy("user_id", member) ?? users.findOneBy("name", member);
    return user !== undefined && user.team_id !== channel.team_id;
  });
}

# @emulators/telegram

Telegram Bot API emulation at the real URL shape, `<emulator>/bot<token>/<method>`, backed by [telegram-bot-test-server](https://github.com/anatolyben/telegram-bot-test-server) and wrapped in emulate's seed, control API, reset, and inspector. Point any client's API root at the emulator: grammy (`client.apiRoot`), Telegraf (`telegram.apiRoot`), or node-telegram-bot-api (`baseApiUrl`). Nothing talks to Telegram.

## Start

```bash
npx emulate --service telegram
```

The default bot token is `1000000001:emulate-telegram-bot-token` (`@emulate_bot`) and the default user is `developer`.

```ts
import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!, {
  client: { apiRoot: "http://localhost:4000" },
});
```

## Seed

```yaml
telegram:
  bots:
    - token: "7000000001:test-secret"
      username: my_bot
      first_name: My Bot
      description: Shown by getMyDescription
      webhook:                # optional: deliver updates here from startup, no setWebhook call needed
        url: http://localhost:3000/api/telegram-webhook
        secret_token: local-secret
  users:
    - name: alice
      first_name: Alice
      username: alice
  chats:
    - name: team
      title: Team
      owner: alice
      forum: true
      members: [developer]
      bots: [my_bot]          # or { bot: my_bot, status: member, rights: { can_pin_messages: true } }
      topics: [ideas]
```

A bot's `webhook` is registered at startup and after every reset, sending `X-Telegram-Bot-Api-Secret-Token` when `secret_token` is set; the app can still change it with setWebhook or deleteWebhook. Configured `bots` replace the default bot; `users` and `chats` add to the defaults. Bot ids come from the token prefix. User, chat, and topic ids are assigned at startup; read them from `GET /_telegram/ids`. Seeding adds bots to chats, and the resulting `my_chat_member` updates are drained so every bot starts with an empty update queue.

## Bot API

Everything telegram-bot-test-server implements, including getMe, getUpdates (long poll with `timeout`, `offset`, `allowed_updates`), setWebhook / deleteWebhook / getWebhookInfo (`secret_token` sent as `X-Telegram-Bot-Api-Secret-Token`, `drop_pending_updates`, `allowed_updates`; getUpdates answers 409 while a webhook is set), sendMessage, editMessageText, editMessageCaption, deleteMessage, sendChatAction, setMessageReaction, answerCallbackQuery, sendPhoto, sendVoice, sendDocument, sendMediaGroup, getFile with downloads at `/file/bot<token>/<file_path>`, getChat, members and permissions, and set/get/deleteMyCommands. Uploads work as multipart fields or as `attach://<part>` references. `parse_mode` (HTML, MarkdownV2, Markdown) and explicit entities become text plus entities, `reply_parameters` / `reply_to_message_id` set `reply_to_message`, and uploaded documents keep their file name and type.

The adapter adds forum topic management and bot profile text: createForumTopic, editForumTopic, getForumTopicIconStickers, setMyDescription, getMyDescription, setMyShortDescription, and getMyShortDescription. Descriptions are stored per `language_code` and fall back to the default language.

## Control API

Act as Telegram users. Chats and users are referenced by seed name or numeric id; `topic` takes a topic name or thread id.

| Route | Effect |
| --- | --- |
| `GET /_telegram/ids` | Bot, user, chat, and topic ids by seed name |
| `POST /_telegram/users` `{ name, first_name?, username? }` | Create a user |
| `POST /_telegram/chats/:chat/members` `{ user }` | A user joins a chat |
| `POST /_telegram/chats/:chat/topics` `{ name, by? }` | Create a forum topic |
| `POST /_telegram/chats/:chat/messages` `{ from, text?, caption?, reply_to?, topic?, media? }` | A user posts; `media` is `{ type, base64, file_name?, mime_type? }` |
| `POST /_telegram/chats/:chat/messages/:id/edit` `{ from, text?, caption? }` | The author edits a message |
| `POST /_telegram/chats/:chat/messages/:id/reactions` `{ from, emoji }` | Set or clear (`null`) a reaction |
| `POST /_telegram/chats/:chat/messages/:id/buttons` `{ from, data }` | Press an inline button; resolves with the bot's answerCallbackQuery |
| `POST /_telegram/users/:user/messages` `{ text?, caption?, reply_to?, media? }` | A user messages the bot directly, with text or media |
| `POST /_telegram/users/:user/messages/:id/buttons` `{ data }` | Press a button in the private chat |
| `GET /_telegram/chats/:chat/messages`, `GET /_telegram/users/:user/messages` | Messages, newest first |
| `GET /_telegram/calls` | Bot API calls made since seeding, and unimplemented methods called |

Each action resolves after the update reached the bot's webhook or getUpdates queue. The inspector at `/` shows seeded ids and calls.

## Current Limits

- Webhook deliveries go straight from the backend to the bot, so they do not appear in emulate's webhook delivery log.
- createForumTopic and editForumTopic post the service message as the chat's owner, so bots in the chat (including the caller) receive it as an update.
- Ids for users, chats, and topics are assigned at startup rather than taken from the seed.

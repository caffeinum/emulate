/**
 * The boundary between the emulate plugin and whatever runs the Bot API.
 * Routes, seeding and the control API only talk to this interface, so a native
 * implementation can replace the telegram-bot-test-server backend without
 * changing consumers or tests.
 */

/** A refusal from Telegram's side (bad input, missing rights), as opposed to an emulator fault. */
export class TelegramBackendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramBackendError";
  }
}

export type TelegramMessage = { message_id: number; [field: string]: unknown };

export interface TelegramBotSpec {
  token: string;
  username: string;
  first_name?: string;
}

export interface TelegramUserSpec {
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramChatSpec {
  title?: string;
  type?: "supergroup" | "group" | "channel";
  owner_id: number;
  forum?: boolean;
}

export interface TelegramBotMembership {
  status?: "administrator" | "member" | "left" | "kicked";
  rights?: Record<string, boolean>;
}

export interface TelegramMedia {
  type: "photo" | "video" | "animation" | "sticker" | "voice" | "audio" | "video_note" | "document";
  bytes: Uint8Array;
  file_name?: string;
  mime_type?: string;
}

export interface TelegramPostedMessage {
  text?: string;
  caption?: string;
  reply_to?: number;
  thread_id?: number;
  media?: TelegramMedia;
}

export interface TelegramButtonAnswer {
  answered: boolean;
  text?: string;
  show_alert?: boolean;
}

export interface TelegramCall {
  method: string;
  bot_id: number;
  params: Record<string, unknown>;
  at: number;
}

export interface TelegramBackend {
  /** Origin of the Bot API this backend serves; requests are proxied to it. */
  readonly origin: string;
  addBot(bot: TelegramBotSpec): Promise<{ id: number; username: string }>;
  createUser(user: TelegramUserSpec): Promise<number>;
  createChat(chat: TelegramChatSpec): Promise<number>;
  setBotMembership(chatId: number, botId: number, membership: TelegramBotMembership): Promise<void>;
  join(chatId: number, userId: number): Promise<void>;
  createTopic(chatId: number, name: string, by?: number): Promise<number>;
  renameTopic(chatId: number, threadId: number, name: string, by?: number): Promise<void>;
  listTopics(chatId: number): Promise<Array<{ message_thread_id: number; name: string }>>;
  chatOwner(chatId: number): Promise<number>;
  post(chatId: number, userId: number, message: TelegramPostedMessage): Promise<number>;
  sendDirectMessage(userId: number, message: TelegramPostedMessage): Promise<number>;
  editMessage(
    chatId: number,
    messageId: number,
    userId: number,
    edit: { text?: string; caption?: string },
  ): Promise<void>;
  react(chatId: number, messageId: number, userId: number, emoji: string | null): Promise<void>;
  pressButton(chatId: number, messageId: number, userId: number, data: string): Promise<TelegramButtonAnswer>;
  pressDirectButton(userId: number, messageId: number, data: string): Promise<TelegramButtonAnswer>;
  getMessages(chatId: number): Promise<TelegramMessage[]>;
  getDirectMessages(userId: number): Promise<TelegramMessage[]>;
  getCalls(): Promise<{ calls: TelegramCall[]; unimplemented: string[] }>;
  stop(): Promise<void>;
}

export type TelegramBackendFactory = (primaryBot: TelegramBotSpec) => Promise<TelegramBackend>;

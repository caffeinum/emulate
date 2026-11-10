/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
import { Server } from "node:http";
type BodyInit = ConstructorParameters<typeof Response>[0];
type HeadersInit = ConstructorParameters<typeof Headers>[0];
type FormDataEntryValue = string | File;
type ContentfulStatusCode = number;
type Next = () => Promise<void>;
type VariablesOf<E> = unknown extends E ? Record<string, any> : E extends {
  Variables: infer V;
} ? V : Record<string, any>;
type HandlerResult = Response | void | Promise<Response | void>;
type Handler<E = unknown, P extends string = string> = (c: Context<E, P>, next: Next) => HandlerResult;
type ErrorHandler<E = unknown> = (err: unknown, c: Context<E>) => Response | Promise<Response>;
interface HttpOptions {
  strictRoutes?: boolean;
  strictJson?: boolean;
  onError?: (error: unknown, request: Request) => void;
}
interface RouteInfo {
  method: string;
  path: string;
  source?: string;
}
interface CorsOptions {
  origin?: string;
  allowMethods?: string[];
  allowHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}
declare class HonoRequest<P extends string = string> {
  private readonly params;
  private readonly strictJson;
  readonly raw: Request;
  readonly url: string;
  readonly method: string;
  readonly path: string;
  constructor(request: Request, params: Record<string, string>, strictJson?: boolean);
  header(): Record<string, string>;
  header(name: string): string | undefined;
  query(name: string): string | undefined;
  queries(name: string): string[] | undefined;
  param(): Record<string, string>;
  param(name: string): string;
  json<T = any>(): Promise<T>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  parseBody(): Promise<Record<string, FormDataEntryValue | FormDataEntryValue[]>>;
}
declare class Context<E = unknown, P extends string = string> {
  private readonly notFoundHandler;
  readonly req: HonoRequest<P>;
  private readonly vars;
  private readonly responseHeaders;
  private readonly headerOperations;
  private readonly appliedHeaders;
  private responseStatus;
  constructor(request: Request, params: Record<string, string>, notFoundHandler: (c: Context<E>) => Response | Promise<Response>, strictJson?: boolean);
  get<K extends keyof VariablesOf<E> & string>(key: K): VariablesOf<E>[K] | undefined;
  set<K extends keyof VariablesOf<E> & string>(key: K, value: VariablesOf<E>[K]): void;
  header(name: string, value: string, options?: {
    append?: boolean;
  }): void;
  status(status: number): void;
  json(data: unknown, status?: ContentfulStatusCode, headers?: HeadersInit): Response;
  text(text: string, status?: ContentfulStatusCode, headers?: HeadersInit): Response;
  html(html: string, status?: ContentfulStatusCode, headers?: HeadersInit): Response;
  body(body: BodyInit | null, status?: ContentfulStatusCode, headers?: HeadersInit): Response;
  redirect(location: string, status?: ContentfulStatusCode): Response;
  notFound(): Response | Promise<Response>;
  finalize(response: Response): Response;
  private response;
}
declare class Hono<E = unknown> {
  private readonly options;
  constructor(options?: HttpOptions);
  get routeTable(): RouteInfo[];
  matchedRoute(method: string, path: string): RouteInfo | undefined;
  private readonly middleware;
  private readonly routes;
  private errorHandler;
  private notFoundHandler;
  use<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  use(...handlers: Handler<E>[]): this;
  on<P extends string = string>(method: string, path: string, ...handlers: Handler<E, P>[]): this;
  get<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  post<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  put<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  patch<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  delete<P extends string = string>(path: string, ...handlers: Handler<E, P>[]): this;
  onError(handler: ErrorHandler<E>): this;
  notFound(handler: (c: Context<E>) => Response | Promise<Response>): this;
  request(input: string | Request, init?: RequestInit): Promise<Response>;
  fetch: (request: Request) => Promise<Response>;
  private match;
  private dispatch;
}
interface WebhookSubscription {
  id: number;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  owner: string;
  repo?: string;
}
interface WebhookDelivery {
  id: number;
  hook_id: number;
  event: string;
  action?: string;
  payload: unknown;
  status_code: number | null;
  delivered_at: string;
  duration: number | null;
  success: boolean;
  redelivery_of?: number;
  redelivery_count?: number;
}
interface WebhookHeaderContext {
  event: string;
  action?: string;
  body: string;
  subscription: Readonly<WebhookSubscription>;
  deliveryId: number;
}
type WebhookHeaderFactory = (context: WebhookHeaderContext) => Record<string, string>;
declare class WebhookDispatcher {
  private readonly options;
  constructor(options?: {
    signal?: AbortSignal;
    neutral?: boolean;
  });
  private subscriptions;
  private deliveries;
  private subscriptionIdCounter;
  private deliveryIdCounter;
  private headerFactory;
  setHeaderFactory(factory: WebhookHeaderFactory): void;
  register(sub: Omit<WebhookSubscription, "id"> & {
    id?: number;
  }): WebhookSubscription;
  unregister(id: number): boolean;
  getSubscription(id: number): WebhookSubscription | undefined;
  getSubscriptions(owner?: string, repo?: string): WebhookSubscription[];
  updateSubscription(id: number, data: Partial<Pick<WebhookSubscription, "url" | "events" | "active" | "secret">>): WebhookSubscription | undefined;
  dispatch(event: string, action: string | undefined, payload: unknown, owner: string, repo?: string): Promise<void>;
  redeliver(deliveryId: number, options?: {
    headers?: Record<string, string>;
  }): Promise<WebhookDelivery | undefined>;
  private deliver;
  getDeliveries(hookId?: number): WebhookDelivery[];
  clear(): void;
}
interface PersistenceAdapter {
  load(): Promise<string | null>;
  save(data: string): Promise<void>;
  initialize?(data: string): Promise<string>;
}
export declare function filePersistence(path: string): PersistenceAdapter;
interface InspectorOptions {
  maxRequests?: number;
  maxBodyBytes?: number;
  redact?: string[];
}
interface EmulatorContext<State extends object> {
  app: Hono;
  state: State;
  baseUrl: string;
  signal: AbortSignal;
  webhooks: WebhookDispatcher;
  onDispose(callback: () => void | Promise<void>): void;
}
interface EmulatorDefinition<State extends object = any> {
  readonly kind: "emulate.http";
  readonly apiVersion: 1;
  readonly name: string;
  readonly stateVersion?: number;
  readonly state: () => State;
  readonly setup: (context: EmulatorContext<State>) => void;
  readonly validateSeed?: (value: unknown) => State;
  readonly cors?: false | CorsOptions;
}
export declare function defineEmulator<State extends object>(definition: {
  name: string;
  stateVersion?: number;
  state: () => State;
  setup: (context: EmulatorContext<NoInfer<State>>) => void;
  validateSeed?: (value: unknown) => NoInfer<State>;
  cors?: false | CorsOptions;
}): EmulatorDefinition<State>;
interface EmulatorSnapshot<State extends object = any> {
  formatVersion: 1;
  definition: string;
  stateVersion: number;
  state: State;
}
interface CustomRuntimeOptions<State extends object = any> {
  seed?: State;
  baseUrl?: string;
  inspector?: boolean | InspectorOptions;
  persistence?: PersistenceAdapter;
  resetPersistence?: boolean;
  shutdownTimeout?: number;
}
interface CustomRuntime<State extends object = any> {
  readonly baseUrl: string;
  readonly inspectorUrl?: string;
  fetch(request: Request): Promise<Response>;
  request(path: string, init?: RequestInit): Promise<Response>;
  snapshot(): EmulatorSnapshot<State>;
  reset(): Promise<void>;
  restore(snapshot: EmulatorSnapshot<State>): Promise<void>;
  close(): Promise<void>;
}
interface ServiceConfig<Definition extends EmulatorDefinition | string = EmulatorDefinition | string> {
  emulator: Definition;
  seed?: Definition extends EmulatorDefinition<infer State> ? State : Record<string, unknown>;
  port?: number;
  baseUrl?: string;
  inspector?: boolean | InspectorOptions;
  persistence?: PersistenceAdapter | string;
}
interface EmulateConfig {
  services: Record<string, ServiceConfig>;
  watch?: string[];
  tokens?: Record<string, {
    login: string;
    scopes?: string[];
  }>;
  /** App environment variables; values may use templates such as "{github.url}" or "{slack.signing_secret}". */
  env?: Record<string, string>;
  /** Shell command `emulate run` executes after the emulators start and before the app, with the same env. */
  prepare?: string;
  /** Shell command `emulate run` executes after the app exits, even when it fails. */
  cleanup?: string;
}
export declare function defineConfig<Definitions extends Record<string, EmulatorDefinition | string>>(config: {
  services: { [Name in keyof Definitions]: ServiceConfig<Definitions[Name]>; };
  watch?: string[];
  tokens?: EmulateConfig["tokens"];
  env?: EmulateConfig["env"];
  prepare?: string;
  cleanup?: string;
}): typeof config;
declare const SERVICE_NAME_LIST: readonly ["vercel", "github", "google", "slack", "apple", "microsoft", "okta", "aws", "resend", "stripe", "mongoatlas", "clerk", "linear", "twilio", "telegram", "workos"];
type ServiceName = (typeof SERVICE_NAME_LIST)[number];
export interface SeedConfig {
  tokens?: Record<string, {
    login: string;
    scopes?: string[];
  }>;
  [service: string]: unknown;
}
export interface EmulatorOptions {
  service: ServiceName;
  port?: number;
  /** Listening address. Defaults to IPv4 loopback (127.0.0.1). */
  hostname?: string;
  seed?: SeedConfig;
  baseUrl?: string;
}
export interface GeneratedSecret {
  readonly service: ServiceName;
  readonly kind: string;
  readonly id: string;
  readonly label: string;
  readonly value: string;
}
export interface Emulator {
  url: string;
  readonly generatedSecrets: readonly GeneratedSecret[];
  reset(): void;
  close(): Promise<void>;
}
export interface CustomEmulatorOptions<State extends object> extends CustomRuntimeOptions<NoInfer<State>> {
  service: EmulatorDefinition<State>;
  port?: number;
  /** Listening address. Defaults to IPv4 loopback (127.0.0.1). */
  hostname?: string;
  listen?: boolean;
}
export type CustomEmulator<State extends object> = CustomRuntime<State> & {
  readonly generatedSecrets: readonly GeneratedSecret[];
};
export declare function createEmulator(options: EmulatorOptions): Promise<Emulator>;
export declare function createEmulator<State extends object>(options: CustomEmulatorOptions<State> & {
  listen: false;
}): Promise<CustomEmulator<State>>;
export declare function createEmulator<State extends object>(options: CustomEmulatorOptions<State> & {
  listen?: true;
}): Promise<CustomEmulator<State> & {
  url: string;
}>;
export declare function waitForListening(server: Server): Promise<void>;
export declare function closeHttpServer(server: Server): Promise<void>;
export type { EmulateConfig, EmulatorContext, EmulatorDefinition, EmulatorSnapshot, InspectorOptions, PersistenceAdapter, ServiceConfig, ServiceName };
//# sourceMappingURL=api.d.ts.map
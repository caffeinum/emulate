import type { EmulatorDefinition, InspectorOptions, PersistenceAdapter } from "@emulators/core";

export interface ServiceConfig<Definition extends EmulatorDefinition | string = EmulatorDefinition | string> {
  emulator: Definition;
  seed?: Definition extends EmulatorDefinition<infer State> ? State : Record<string, unknown>;
  port?: number;
  baseUrl?: string;
  inspector?: boolean | InspectorOptions;
  persistence?: PersistenceAdapter | string;
}

export interface EmulateConfig {
  services: Record<string, ServiceConfig>;
  watch?: string[];
  tokens?: Record<string, { login: string; scopes?: string[] }>;
  /** App environment variables; values may use templates such as "{github.url}" or "{slack.signing_secret}". */
  env?: Record<string, string>;
  /** Shell command `emulate run` executes after the emulators start and before the app, with the same env. */
  prepare?: string;
}

export function defineConfig<Definitions extends Record<string, EmulatorDefinition | string>>(config: {
  services: { [Name in keyof Definitions]: ServiceConfig<Definitions[Name]> };
  watch?: string[];
  tokens?: EmulateConfig["tokens"];
  env?: EmulateConfig["env"];
  prepare?: string;
}): typeof config {
  return config;
}

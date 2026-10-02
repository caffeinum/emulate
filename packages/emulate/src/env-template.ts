/**
 * Resolves the `env` block of an emulate config: each value is a literal or a
 * template such as "{github.url}" or "{slack.signing_secret}" that reads the
 * running service's URL, port, or a value from its seed config.
 */

export interface EnvServiceContext {
  name: string;
  url: string;
  port: number;
  seed?: unknown;
}

// $$ is a literal dollar; ${NAME} or ${NAME:-default} reads the outside environment; {service.path} reads an emulator.
const PLACEHOLDER = /\$\$|\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}|\{([^{}]+)\}/g;

export function validateEnvBlock(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("env must map environment variable names to strings");
  }
  const env: Record<string, string> = {};
  for (const [name, template] of Object.entries(value)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`env.${name}: not a valid environment variable name`);
    if (typeof template !== "string" && typeof template !== "number" && typeof template !== "boolean") {
      throw new Error(`env.${name} must be a string`);
    }
    env[name] = String(template);
  }
  return env;
}

export function resolveEnv(
  env: Record<string, string>,
  services: EnvServiceContext[],
  outside: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const byName = new Map(services.map((service) => [service.name, service]));
  const resolved: Record<string, string> = {};
  for (const [name, template] of Object.entries(env)) {
    resolved[name] = template.replace(
      PLACEHOLDER,
      (match, outsideName?: string, fallback?: string, expression?: string) => {
        if (match === "$$") return "$";
        if (outsideName) {
          const value = outside[outsideName];
          if (value !== undefined) return value;
          if (fallback !== undefined) return fallback;
          throw new Error(`env.${name}: \${${outsideName}} is not set in the environment emulate was started with`);
        }
        return resolveExpression(name, expression!.trim(), byName);
      },
    );
  }
  return resolved;
}

function resolveExpression(variable: string, expression: string, services: Map<string, EnvServiceContext>): string {
  const [serviceName, ...path] = splitPath(expression);
  const service = serviceName ? services.get(serviceName) : undefined;
  if (!service) {
    const known = [...services.keys()].join(", ") || "none";
    throw new Error(`env.${variable}: {${expression}} names no running service (services: ${known})`);
  }
  if (path.length === 0) throw new Error(`env.${variable}: {${expression}} needs a field, e.g. {${serviceName}.url}`);
  if (path.length === 1 && (path[0] === "url" || path[0] === "port" || path[0] === "host")) {
    if (path[0] === "url") return service.url;
    if (path[0] === "port") return String(service.port);
    return new URL(service.url).host;
  }
  let value: unknown = service.seed;
  for (const segment of path) {
    if (value === null || typeof value !== "object" || !Object.hasOwn(value, segment)) {
      throw new Error(
        `env.${variable}: {${expression}} is not set in the ${serviceName} seed config; set it there so the value is deterministic`,
      );
    }
    value = (value as Record<string, unknown>)[segment];
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  throw new Error(`env.${variable}: {${expression}} is ${value === null ? "null" : typeof value}, not a single value`);
}

function splitPath(expression: string): string[] {
  const segments: string[] = [];
  for (const part of expression.split(".")) {
    const match = /^([^[\]]*)((?:\[\d+\])*)$/.exec(part);
    if (!match) throw new Error(`Invalid env template path: {${expression}}`);
    if (match[1]) segments.push(match[1]);
    for (const index of match[2]!.matchAll(/\[(\d+)\]/g)) segments.push(index[1]!);
  }
  return segments;
}

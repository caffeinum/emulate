/**
 * The config's `env` block: literals, `${NAME}` / `${NAME:-default}` from the outside environment,
 * `$$` for a literal dollar, and `{service.url|port|host}` or `{service.seed.path[0]}` from the emulators.
 */
export interface EnvService {
  name: string;
  url: string;
  port: number;
  seed?: unknown;
}

const PLACEHOLDER = /\$\$|\$\{([A-Za-z_]\w*)(?::-([^}]*))?\}|\{([^{}]+)\}/g;
const isScalar = (value: unknown) => ["string", "number", "boolean"].includes(typeof value);

export function validateEnvBlock(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("env must map variable names to strings");
  for (const [name, template] of Object.entries(value)) {
    if (!/^[A-Za-z_]\w*$/.test(name)) throw new Error(`env.${name}: not a valid environment variable name`);
    if (!isScalar(template)) throw new Error(`env.${name} must be a string`);
  }
  return Object.fromEntries(Object.entries(value).map(([name, template]) => [name, String(template)]));
}

export function resolveEnv(env: Record<string, string>, services: EnvService[], outside = process.env) {
  const lookup = (name: string, expression: string) => {
    const [serviceName, ...path] = expression
      .trim()
      .split(/[.[\]]+/)
      .filter(Boolean);
    const service = services.find((candidate) => candidate.name === serviceName);
    if (!service) {
      throw new Error(
        `env.${name}: {${expression}} names no running service (services: ${services.map((s) => s.name).join(", ")})`,
      );
    }
    const fields: Record<string, unknown> = { url: service.url, port: service.port, host: new URL(service.url).host };
    const value =
      path.length === 1 && path[0]! in fields
        ? fields[path[0]!]
        : path.reduce<unknown>((node, key) => {
            if (!node || typeof node !== "object" || !Object.hasOwn(node, key)) {
              throw new Error(`env.${name}: {${expression}} is not set in the ${serviceName} seed config`);
            }
            return (node as Record<string, unknown>)[key];
          }, service.seed);
    if (path.length === 0 || !isScalar(value)) throw new Error(`env.${name}: {${expression}} is not a single value`);
    return String(value);
  };
  return Object.fromEntries(
    Object.entries(env).map(([name, template]) => [
      name,
      template.replace(PLACEHOLDER, (_match, outsideName?: string, fallback?: string, expression?: string) => {
        if (expression !== undefined) return lookup(name, expression);
        if (!outsideName) return "$";
        const value = outside[outsideName] ?? fallback;
        if (value === undefined)
          throw new Error(`env.${name}: \${${outsideName}} is not set in the environment emulate was started with`);
        return value;
      }),
    ]),
  );
}

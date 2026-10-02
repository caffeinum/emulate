import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config-loader.js";
import { resolveEnv } from "../env-template.js";
import { runCommand } from "../commands/run.js";

const directories: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function projectWith(config: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "emulate run "));
  directories.push(dir);
  await writeFile(join(dir, "emulate.config.yaml"), config);
  return dir;
}

describe("env templates", () => {
  const services = [
    {
      name: "slack",
      url: "http://localhost:4003",
      port: 4003,
      seed: { signing_secret: "s3", event_subscriptions: [{ url: "http://app/hook" }] },
    },
  ];

  it("resolves urls, ports, hosts, seed paths and literals", () => {
    expect(
      resolveEnv(
        {
          SLACK_API: "{slack.url}/api",
          SLACK_PORT: "{slack.port}",
          SLACK_HOST: "{ slack.host }",
          SECRET: "{slack.signing_secret}",
          HOOK: "{slack.event_subscriptions[0].url}",
          DATABASE_URL: "postgres://localhost:5432/app",
        },
        services,
      ),
    ).toEqual({
      SLACK_API: "http://localhost:4003/api",
      SLACK_PORT: "4003",
      SLACK_HOST: "localhost:4003",
      SECRET: "s3",
      HOOK: "http://app/hook",
      DATABASE_URL: "postgres://localhost:5432/app",
    });
  });

  it("fails loudly on unknown services, missing values and objects", () => {
    expect(() => resolveEnv({ X: "{stripe.url}" }, services)).toThrow(
      "env.X: {stripe.url} names no running service (services: slack)",
    );
    expect(() => resolveEnv({ X: "{slack.bot_token}" }, services)).toThrow(
      "env.X: {slack.bot_token} is not set in the slack seed config",
    );
    expect(() => resolveEnv({ X: "{slack.event_subscriptions}" }, services)).toThrow("is object, not a single value");
    expect(() => resolveEnv({ X: "{slack}" }, services)).toThrow("needs a field");
  });

  it("passes chosen variables through from the outside environment", () => {
    expect(
      resolveEnv({ KEY: "{env.OPENAI_API_KEY}", MIX: "Bearer {env.TOKEN}" }, services, {
        OPENAI_API_KEY: "sk-real",
        TOKEN: "t",
      }),
    ).toEqual({
      KEY: "sk-real",
      MIX: "Bearer t",
    });
    expect(() => resolveEnv({ KEY: "{env.MISSING}" }, services, {})).toThrow(
      "env.KEY: {env.MISSING} is not set in the environment emulate was started with",
    );
    expect(() => resolveEnv({ KEY: "{env}" }, services, {})).toThrow("write {env.NAME}");
  });

  it("validates the env block in config", async () => {
    const dir = await projectWith("github: {}\nenv:\n  1BAD: x\n");
    await expect(loadConfig({ cwd: dir })).rejects.toThrow("env.1BAD: not a valid environment variable name");
    const nested = await projectWith("github: {}\nenv:\n  GOOD: { a: 1 }\n");
    await expect(loadConfig({ cwd: nested })).rejects.toThrow("env.GOOD must be a string");
  });
});

describe("emulate run", () => {
  it("starts the emulators, runs the command with the env, and returns its exit code", async () => {
    const dir = await projectWith(
      [
        "github:",
        "  users: [{ login: octocat }]",
        "slack:",
        "  signing_secret: local-secret",
        "env:",
        '  GITHUB_API_URL: "{github.url}"',
        '  SLACK_SIGNING_SECRET: "{slack.signing_secret}"',
        "  DATABASE_URL: postgres://localhost:5432/app",
        "",
      ].join("\n"),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const out = join(dir, "child.json");
    const script = [
      "const user = await fetch(process.env.GITHUB_API_URL + '/users/octocat').then((r) => r.json());",
      "const { writeFileSync } = await import('node:fs');",
      `writeFileSync(${JSON.stringify(out)}, JSON.stringify({ login: user.login, env: process.env }));`,
      "process.exit(7);",
    ].join("\n");
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      const code = await runCommand({ port: 4870 }, [process.execPath, "--input-type=module", "-e", script]);
      expect(code).toBe(7);
    } finally {
      process.chdir(cwd);
    }
    const child = JSON.parse(await readFile(out, "utf8"));
    expect(child.login).toBe("octocat");
    expect(child.env).toMatchObject({
      GITHUB_API_URL: "http://localhost:4870",
      SLACK_SIGNING_SECRET: "local-secret",
      DATABASE_URL: "postgres://localhost:5432/app",
    });
    await expect(fetch("http://127.0.0.1:4870/users/octocat")).rejects.toThrow();
  });

  it("refuses to start when the env block cannot resolve", async () => {
    const dir = await projectWith('github: {}\nenv:\n  X: "{github.missing}"\n');
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      await expect(runCommand({ port: 4880 }, ["true"])).rejects.toThrow("{github.missing} is not set");
    } finally {
      process.chdir(cwd);
    }
    await expect(fetch("http://127.0.0.1:4880/")).rejects.toThrow();
  });
});

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { loadConfig } from "../config-loader.js";
import { resolveEnv } from "../env-template.js";
import { runCommand } from "../commands/run.js";

const directories: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function inProject<T>(config: string, body: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "emulate run "));
  directories.push(dir);
  await writeFile(join(dir, "emulate.config.yaml"), config);
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    return await body(dir);
  } finally {
    process.chdir(cwd);
  }
}

const slack = {
  name: "slack",
  url: "http://localhost:4003",
  port: 4003,
  seed: { secret: "s3", hooks: [{ url: "h" }] },
};

it("resolves emulator fields, seed paths, outside variables and literals", () => {
  const env = {
    API: "{slack.url}/api",
    HOST: "{ slack.host }",
    SECRET: "{slack.secret}",
    HOOK: "{slack.hooks[0].url}",
    KEY: "${KEY}",
    DB: "${DB:-postgres://localhost/app}",
    PASSWORD: "pa$$word",
    RAW: "${RAW}",
  };
  expect(resolveEnv(env, [slack], { KEY: "k", RAW: "{slack.url}" })).toEqual({
    API: "http://localhost:4003/api",
    HOST: "localhost:4003",
    SECRET: "s3",
    HOOK: "h",
    KEY: "k",
    DB: "postgres://localhost/app",
    PASSWORD: "pa$word",
    RAW: "{slack.url}",
  });
  expect(() => resolveEnv({ X: "{stripe.url}" }, [slack], {})).toThrow("names no running service (services: slack)");
  expect(() => resolveEnv({ X: "{slack.token}" }, [slack], {})).toThrow("is not set in the slack seed config");
  expect(() => resolveEnv({ X: "{slack.hooks}" }, [slack], {})).toThrow("is not a single value");
  expect(() => resolveEnv({ X: "${MISSING}" }, [slack], {})).toThrow("${MISSING} is not set in the environment");
});

it("rejects invalid env blocks", async () => {
  await inProject("github: {}\nenv:\n  1BAD: x\n", async (dir) => {
    await expect(loadConfig({ cwd: dir })).rejects.toThrow("env.1BAD: not a valid environment variable name");
  });
});

it("runs the command against the emulators with only the env block and a small passthrough", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("LEAKED_SECRET", "from-shell");
  const config =
    'github:\n  users: [{ login: octocat }]\nenv:\n  GITHUB_API_URL: "{github.url}"\n  DATABASE_URL: postgres://localhost/app\n';
  await inProject(config, async (dir) => {
    const out = join(dir, "child.json");
    const script = `const user = await fetch(process.env.GITHUB_API_URL + "/users/octocat").then((r) => r.json());
      (await import("node:fs")).writeFileSync(${JSON.stringify(out)}, JSON.stringify({ login: user.login, env: process.env }));
      process.exit(7);`;
    expect(await runCommand({ port: 4870 }, [process.execPath, "--input-type=module", "-e", script])).toBe(7);
    const child = JSON.parse(await readFile(out, "utf8"));
    expect(child.login).toBe("octocat");
    expect(child.env).toMatchObject({
      GITHUB_API_URL: "http://localhost:4870",
      DATABASE_URL: "postgres://localhost/app",
    });
    expect(child.env.PATH).toBe(process.env.PATH);
    expect(child.env.LEAKED_SECRET).toBeUndefined();
  });
  await expect(fetch("http://127.0.0.1:4870/users/octocat")).rejects.toThrow();
});

it("does not start when the env block cannot resolve", async () => {
  await inProject('github: {}\nenv:\n  X: "{github.missing}"\n', async () => {
    await expect(runCommand({ port: 4880 }, ["true"])).rejects.toThrow("{github.missing} is not set");
  });
  await expect(fetch("http://127.0.0.1:4880/")).rejects.toThrow();
});

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

it("picks free ports with --port 0 and runs prepare before the command", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const config =
    'github: {}\nslack: {}\nprepare: echo "$GITHUB_API_URL" > prepared.txt\nenv:\n  GITHUB_API_URL: "{github.url}"\n  SLACK_PORT: "{slack.port}"\n';
  await inProject(config, async (dir) => {
    const script = `const { readFileSync, writeFileSync } = await import("node:fs");
      writeFileSync("child.json", JSON.stringify({ prepared: readFileSync("prepared.txt", "utf8").trim(), env: process.env }));`;
    expect(await runCommand({ port: 0 }, [process.execPath, "--input-type=module", "-e", script])).toBe(0);
    const child = JSON.parse(await readFile(join(dir, "child.json"), "utf8"));
    expect(child.prepared).toBe(child.env.GITHUB_API_URL);
    expect(child.env.GITHUB_API_URL).toMatch(/^http:\/\/localhost:\d+$/);
    expect(Number(child.env.SLACK_PORT)).toBeGreaterThan(1024);
    expect(child.env.GITHUB_API_URL).not.toContain(`:${child.env.SLACK_PORT}`);
  });
});

it("stops before the command when prepare fails, and still cleans up", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  await inProject("github: {}\nprepare: exit 3\ncleanup: touch cleaned\n", async (dir) => {
    await expect(runCommand({ port: 0 }, ["sh", "-c", `touch ${JSON.stringify(join(dir, "ran"))}`])).rejects.toThrow(
      "prepare exited with 3: exit 3",
    );
    await expect(readFile(join(dir, "ran"))).rejects.toThrow();
    await readFile(join(dir, "cleaned"));
  });
});

it("runs cleanup after the command with the same env", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const config = 'github: {}\ncleanup: echo "$GH" > cleaned\nenv:\n  GH: "{github.url}"\n';
  await inProject(config, async (dir) => {
    expect(await runCommand({ port: 0 }, ["sh", "-c", "exit 4"])).toBe(4);
    expect((await readFile(join(dir, "cleaned"), "utf8")).trim()).toMatch(/^http:\/\/localhost:\d+$/);
  });
});

it("answers 401 for unknown tokens when a service sets strict_tokens", async () => {
  const { createEmulator } = await import("../api.js");
  const strict = await createEmulator({
    service: "github",
    port: 0,
    seed: {
      tokens: { gh_known: { login: "octocat" } },
      github: { strict_tokens: true, users: [{ login: "octocat" }] },
    },
  });
  const loose = await createEmulator({
    service: "github",
    port: 0,
    seed: { github: { users: [{ login: "octocat" }] } },
  });
  try {
    const user = (url: string, token: string) =>
      fetch(`${url}/user`, { headers: { Authorization: `Bearer ${token}` } });
    expect((await user(strict.url, "gh_unknown")).status).toBe(401);
    expect(await (await user(strict.url, "gh_known")).json()).toMatchObject({ login: "octocat" });
    expect((await user(loose.url, "gh_unknown")).status).toBe(200);
  } finally {
    await Promise.all([strict.close(), loose.close()]);
  }
});

it("logs requests as JSON at /_emulate/requests", async () => {
  const { createEmulator } = await import("../api.js");
  const stripe = await createEmulator({ service: "stripe", port: 0 });
  try {
    await fetch(`${stripe.url}/v1/customers?limit=1`, { headers: { Authorization: "Bearer sk_test" } });
    await fetch(`${stripe.url}/v1/customers`, {
      method: "POST",
      headers: { Authorization: "Bearer sk_test", "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=a%40b.c",
    });
    const log = (await (await fetch(`${stripe.url}/_emulate/requests`)).json()) as Array<Record<string, unknown>>;
    expect(log).toEqual([
      expect.objectContaining({ method: "GET", path: "/v1/customers", query: "?limit=1", status: 200 }),
      expect.objectContaining({ method: "POST", path: "/v1/customers", body: "email=a%40b.c", status: 200 }),
    ]);
    expect((await fetch(`${stripe.url}/_emulate/requests`, { method: "DELETE" })).status).toBe(204);
    expect(await (await fetch(`${stripe.url}/_emulate/requests`)).json()).toEqual([]);
  } finally {
    await stripe.close();
  }
});

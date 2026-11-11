#!/usr/bin/env node
import {
  createProgram
} from "./chunk-AD2E44SZ.js";
import {
  ensurePortless,
  prepareProject,
  registerAliases,
  removeAliases,
  resolveEnv
} from "./chunk-6CWM626Q.js";
import "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// src/index.ts
import { CommanderError } from "commander";

// src/commands/run.ts
import { spawn } from "child_process";
import { constants } from "os";
var PASSTHROUGH = ["PATH", "HOME", "USER", "SHELL", "TERM", "TMPDIR", "LANG", "NODE_OPTIONS", "CI"];
async function runCommand(options, command) {
  const run = await prepareProject(options);
  const aliases = options.portless ? run.metadata.aliases : [];
  try {
    const env = resolveEnv(run.metadata.env, run.metadata.services);
    if (options.portless) await ensurePortless({ throwOnFailure: true });
    registerAliases(aliases);
    await run.start();
    console.error(`emulate: ${run.metadata.services.map((s) => `${s.name} ${s.url}`).join(", ")}`);
    const outside = PASSTHROUGH.flatMap((name) => process.env[name] ? [[name, process.env[name]]] : []);
    const childEnv = { ...Object.fromEntries(outside), ...env };
    const { prepare, cleanup } = run.metadata;
    try {
      const prepared = prepare ? await runChild(prepare, childEnv) : 0;
      if (prepared !== 0) throw new Error(`prepare exited with ${prepared}: ${prepare}`);
      return await runChild(command, childEnv);
    } finally {
      const cleaned = cleanup ? await runChild(cleanup, childEnv).catch(() => 1) : 0;
      if (cleaned !== 0) console.error(`emulate: cleanup exited with ${cleaned}: ${cleanup}`);
    }
  } finally {
    await run.close().catch(console.error);
    removeAliases(aliases);
  }
}
function runChild(command, env) {
  const [file, ...args] = typeof command === "string" ? [command] : command;
  return new Promise((resolveExit, reject) => {
    const shell = typeof command === "string" || process.platform === "win32";
    const child = spawn(file, args, { stdio: "inherit", env, shell });
    const forward = (signal) => child.kill(signal);
    process.on("SIGINT", forward).on("SIGTERM", forward);
    const done = () => process.off("SIGINT", forward).off("SIGTERM", forward);
    child.once("error", (error) => {
      done();
      reject(new Error(`Could not run ${file}: ${error.message}`, { cause: error }));
    });
    child.once("exit", (code, signal) => {
      done();
      resolveExit(code ?? 128 + (signal ? constants.signals[signal] : 0));
    });
  });
}

// src/index.ts
var program = createProgram();
program.enablePositionalOptions();
program.command("run").description("Start the configured emulators, run a command with the config's env, then stop them").argument("<command...>", "Command to run, e.g. pnpm dev").option("-p, --port <port>", "Base port; 0 picks a free port per service", process.env.EMULATE_PORT ?? "4000").option("-s, --service <services>", "Comma-separated services to enable").option("--config <file>", "Path to TypeScript, JavaScript, YAML, or JSON configuration").option("--portless", "Serve over HTTPS via portless (auto-registers aliases)").option("--scenario <name>", "Overlay scenarios.<name> from the config").passThroughOptions().action(async (command, opts) => {
  process.exitCode = await runCommand({ ...opts, port: Number(opts.port) }, command);
});
program.command("mcp").description("Start the MCP server over stdio").action(async () => {
  await (await import("./mcp-G33RXJWI.js")).startMcpServer();
});
try {
  await program.parseAsync();
} catch (error) {
  const exitCode = error instanceof CommanderError ? error.exitCode : 1;
  if (exitCode) console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = exitCode;
}
//# sourceMappingURL=index.js.map
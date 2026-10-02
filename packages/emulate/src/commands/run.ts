import { spawn } from "node:child_process";
import { constants } from "node:os";
import { prepareProject, type ProjectOptions } from "../project-runner.js";
import { resolveEnv } from "../env-template.js";
import { ensurePortless, registerAliases, removeAliases } from "../portless.js";

/** The only outside variables a command sees besides the config's env block. */
const PASSTHROUGH = ["PATH", "HOME", "USER", "SHELL", "TERM", "TMPDIR", "LANG", "NODE_OPTIONS", "CI"];

/** Starts the configured emulators, runs `command` with the env block, stops them, and returns its exit code. */
export async function runCommand(options: ProjectOptions, command: string[]): Promise<number> {
  const run = await prepareProject(options);
  const aliases = options.portless ? run.metadata.aliases : [];
  try {
    const env = resolveEnv(run.metadata.env, run.metadata.services);
    if (options.portless) await ensurePortless({ throwOnFailure: true });
    registerAliases(aliases);
    await run.start();
    console.error(`emulate: ${run.metadata.services.map((s) => `${s.name} ${s.url}`).join(", ")}`);
    const outside = PASSTHROUGH.flatMap((name) => (process.env[name] ? [[name, process.env[name]]] : []));
    const childEnv = { ...Object.fromEntries(outside), ...env };
    const { prepare } = run.metadata;
    const prepared = prepare ? await runChild(prepare, childEnv) : 0;
    if (prepared !== 0) throw new Error(`prepare exited with ${prepared}: ${prepare}`);
    return await runChild(command, childEnv);
  } finally {
    await run.close().catch(console.error);
    removeAliases(aliases);
  }
}

/** An argv array runs directly; a string (the config's prepare) runs in a shell. */
function runChild(command: string[] | string, env: Record<string, string>): Promise<number> {
  const [file, ...args] = typeof command === "string" ? [command] : command;
  return new Promise((resolveExit, reject) => {
    const shell = typeof command === "string" || process.platform === "win32";
    const child = spawn(file!, args, { stdio: "inherit", env, shell });
    const forward = (signal: NodeJS.Signals) => child.kill(signal);
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

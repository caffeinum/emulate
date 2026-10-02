import { spawn } from "node:child_process";
import { prepareProject, type ProjectOptions } from "../project-runner.js";
import { resolveEnv } from "../env-template.js";
import { ensurePortless, registerAliases, removeAliases, type PortlessAlias } from "../portless.js";

/**
 * Start the configured emulators, run `command` with the config's env block
 * applied, and shut the emulators down when it exits. Resolves to its exit code.
 */
export async function runCommand(options: ProjectOptions, command: string[]): Promise<number> {
  if (command.length === 0) throw new Error("Pass the command to run after --, e.g. emulate run -- pnpm dev");
  const run = await prepareProject(options);
  let aliases: PortlessAlias[] = [];
  try {
    const env = resolveEnv(
      run.metadata.env,
      run.metadata.services.map(({ name, url, port, seed }) => ({ name, url, port, seed })),
    );
    if (options.portless) {
      await ensurePortless({ throwOnFailure: true });
      registerAliases(run.metadata.aliases);
      aliases = run.metadata.aliases;
    }
    await run.start();
    console.error(
      `emulate: ${run.metadata.services.map((service) => `${service.name} ${service.url}`).join(", ")}` +
        `\nemulate: running ${command.join(" ")} with ${Object.keys(env).length} env variables`,
    );
    return await runChild(command, env);
  } finally {
    await run.close().catch((error) => console.error(error));
    removeAliases(aliases);
  }
}

function runChild(command: string[], env: Record<string, string>): Promise<number> {
  return new Promise((resolveExit, reject) => {
    const child = spawn(command[0]!, command.slice(1), {
      stdio: "inherit",
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
    });
    const forward = (signal: NodeJS.Signals) => child.kill(signal);
    process.on("SIGINT", forward);
    process.on("SIGTERM", forward);
    child.once("error", (error) => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      reject(new Error(`Could not run ${command[0]}: ${error.message}`, { cause: error }));
    });
    child.once("exit", (code, signal) => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      resolveExit(code ?? (signal ? 128 + (signalNumber(signal) ?? 1) : 1));
    });
  });
}

function signalNumber(signal: NodeJS.Signals): number | undefined {
  return { SIGHUP: 1, SIGINT: 2, SIGQUIT: 3, SIGKILL: 9, SIGTERM: 15 }[signal as string];
}

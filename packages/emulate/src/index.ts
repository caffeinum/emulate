import { CommanderError } from "commander";
import { createProgram } from "./program.js";
import { runCommand } from "./commands/run.js";

const program = createProgram();
program.enablePositionalOptions();
program
  .command("run")
  .description("Start the configured emulators, run a command with the config's env, then stop them")
  .argument("<command...>", "Command to run, e.g. pnpm dev")
  .option("-p, --port <port>", "Base port; 0 picks a free port per service", process.env.EMULATE_PORT ?? "4000")
  .option("-s, --service <services>", "Comma-separated services to enable")
  .option("--config <file>", "Path to TypeScript, JavaScript, YAML, or JSON configuration")
  .option("--portless", "Serve over HTTPS via portless (auto-registers aliases)")
  .option("--scenario <name>", "Overlay scenarios.<name> from the config")
  .passThroughOptions()
  .action(async (command: string[], opts) => {
    process.exitCode = await runCommand({ ...opts, port: Number(opts.port) }, command);
  });

program
  .command("mcp")
  .description("Start the MCP server over stdio")
  .action(async () => {
    await (await import("./mcp.js")).startMcpServer();
  });

try {
  await program.parseAsync();
} catch (error) {
  const exitCode = error instanceof CommanderError ? error.exitCode : 1;
  if (exitCode) console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = exitCode;
}

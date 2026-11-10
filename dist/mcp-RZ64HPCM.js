import {
  createProgram
} from "./chunk-6FFCK7DU.js";
import "./chunk-3E4EWOX3.js";
import "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// src/mcp.ts
import { createInterface } from "readline";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { stripVTControlCharacters } from "util";
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function discover(program) {
  const tools = [];
  function visit(command, parents, path) {
    if (command.registeredArguments.length)
      throw new Error(`MCP does not support positional arguments: ${path.join(" ")}`);
    const chain = [...parents, command];
    if (Reflect.get(command, "_executableHandler") || command.commands.length && Reflect.get(command, "_actionHandler"))
      throw new Error(`Unsupported MCP command form: ${path.join(" ")}`);
    if (command.commands.length) {
      for (const child of command.commands) visit(child, chain, [...path, child.name()]);
      return;
    }
    const bindings = /* @__PURE__ */ new Map();
    const properties = /* @__PURE__ */ Object.create(null);
    const required = [];
    for (const parent of chain) {
      for (const option of parent.options) {
        if (["--help", "--version"].includes(option.long ?? "")) continue;
        const name2 = option.attributeName();
        if (!option.long || option.optional || option.variadic || bindings.has(name2))
          throw new Error(`Unsupported MCP option for ${path.join(" ")}: ${option.flags}`);
        const type = option.required ? "string" : "boolean";
        const defaultValue = parent.getOptionValue(name2);
        if (defaultValue !== void 0 && typeof defaultValue !== type)
          throw new Error(`Unsupported MCP default for ${path.join(" ")}: ${option.flags}`);
        bindings.set(name2, { option, type });
        properties[name2] = { type, description: option.description };
        if (defaultValue !== void 0) properties[name2].default = defaultValue;
        if (option.argChoices) properties[name2].enum = option.argChoices;
        if (option.mandatory && defaultValue === void 0 && !option.envVar) required.push(name2);
      }
    }
    const name = path.join("_");
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(name) || name === "stop" || tools.some((entry) => entry.tool.name === name))
      throw new Error(`Conflicting or unsupported MCP tool name: ${name}`);
    tools.push({
      path,
      bindings,
      tool: {
        name,
        description: command.description(),
        inputSchema: {
          type: "object",
          properties,
          additionalProperties: false,
          ...required.length ? { required } : {}
        }
      }
    });
  }
  for (const command of program.commands) visit(command, [program], [command.name()]);
  return tools;
}
function result(stdout, stderr = "", exitCode = 0) {
  const redact = (text2) => stripVTControlCharacters(text2).replace(/https?:\/\/[^\s]+/g, (value) => {
    try {
      const url = new URL(value);
      const original = url.href;
      url.username = "";
      url.password = "";
      for (const key of [...url.searchParams.keys()])
        if (/token|secret|password|credential|signature|session|cookie|(?:api|private)[_-]?key|^(?:auth|authorization|key|code|sig)$/i.test(
          key
        ))
          url.searchParams.set(key, "[redacted]");
      return url.href === original ? value : url.href;
    } catch {
      return value;
    }
  });
  stdout = redact(stdout);
  stderr = redact(stderr);
  const text = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n\n") || "(no output)";
  return {
    content: [{ type: "text", text }],
    structuredContent: { stdout, stderr, exitCode },
    isError: exitCode !== null && exitCode !== 0
  };
}
async function startMcpServer() {
  const commands = discover(createProgram());
  const stopTool = {
    name: "stop",
    description: "Stop this connection's emulator run, including a pending start. A later start can create a new run.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  };
  const children = /* @__PURE__ */ new Set();
  let active;
  let calls = 0;
  let lastStop = 0;
  let pending = Promise.resolve();
  let closing = false;
  function launch(argv, starting) {
    const env = { ...process.env, CI: "1", NO_COLOR: "1" };
    delete env.FORCE_COLOR;
    const child = spawn(process.execPath, [fileURLToPath(new URL("./index.js", import.meta.url)), ...argv], {
      env,
      stdio: ["ignore", "pipe", "pipe", "ipc"],
      detached: process.platform !== "win32",
      windowsHide: true
    });
    let stdout2 = "";
    let stderr = "";
    let failure;
    let ready = false;
    let stopping;
    let resolveResponse;
    let resolveExit;
    const response = new Promise((resolve) => {
      resolveResponse = resolve;
    });
    const exited = new Promise((resolve) => {
      resolveExit = resolve;
    });
    const timer = setTimeout(() => {
      failure = "CLI command timed out";
      void run.close();
    }, 3e4);
    const finish = (code, signal) => {
      clearTimeout(timer);
      const exitCode = stopping && signal === "SIGTERM" ? 0 : code ?? 1;
      const value = result(stdout2, [stderr, failure].filter(Boolean).join("\n"), failure ? 1 : exitCode);
      resolveExit(value);
      resolveResponse(
        starting && !ready && !value.isError ? result(stdout2, "Emulator startup stopped before readiness", 1) : value
      );
      children.delete(run);
      if (active === run) active = void 0;
    };
    child.stdout.on("data", (data) => {
      stdout2 = (stdout2 + data.toString()).slice(-131072);
      if (starting) process.stderr.write(data);
    });
    child.stderr.on("data", (data) => {
      stderr = (stderr + data.toString()).slice(-131072);
      if (starting) process.stderr.write(data);
    });
    child.once("error", (error) => {
      failure = error.message;
      finish(1);
    });
    child.once("close", finish);
    child.on("message", (message) => {
      if (!starting || stopping || ready || !isObject(message)) return;
      if (message.type === "emulate:ready" && typeof message.text === "string") {
        ready = true;
        clearTimeout(timer);
        resolveResponse(result(message.text, "", null));
      } else if (message.type === "emulate:error") {
        failure = String(message.error ?? "Emulator startup failed");
        void run.close();
      }
    });
    const run = {
      response,
      close() {
        return stopping ??= (async () => {
          clearTimeout(timer);
          if (child.exitCode === null && child.signalCode === null) {
            if (starting && child.connected)
              child.send({ type: "emulate:stop" }, (error) => {
                if (error) child.kill("SIGTERM");
              });
            else child.kill("SIGTERM");
          }
          const kill = setTimeout(() => {
            if (!child.pid) return;
            failure ??= "CLI did not stop within 8 seconds";
            if (process.platform === "win32") {
              const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
                stdio: "ignore",
                windowsHide: true
              });
              killer.on("error", () => child.kill("SIGKILL"));
            } else {
              try {
                process.kill(-child.pid, "SIGKILL");
              } catch {
                child.kill("SIGKILL");
              }
            }
          }, 8e3);
          try {
            return await exited;
          } finally {
            clearTimeout(kill);
          }
        })();
      }
    };
    children.add(run);
    return run;
  }
  async function stop() {
    const run = active;
    try {
      const stopped = await run?.close();
      return stopped?.isError ? stopped : result("Stopped the owned emulator run.");
    } finally {
      if (active === run) active = void 0;
    }
  }
  async function call(name, args, order) {
    try {
      if (closing) throw new Error("MCP server is closing");
      const entry = commands.find((entry2) => entry2.tool.name === name);
      if (!entry && name !== "stop") throw new Error(`Unknown tool: ${name}`);
      for (const [key, value] of Object.entries(args)) {
        const binding = entry?.bindings.get(key);
        if (!binding) throw new Error(`Unknown argument for ${name}: ${key}`);
        if (typeof value !== binding.type) throw new Error(`${key} must be a ${binding.type}`);
      }
      if (name === "stop") {
        lastStop = order;
        return await stop();
      }
      if (name === "start" && order < lastStop) throw new Error("Emulator startup stopped");
      if (name === "start" && active)
        throw new Error("An emulator run is already active. Call stop before starting again.");
      const argv = [...entry.path];
      for (const [key, value] of Object.entries(args)) {
        const { option, type } = entry.bindings.get(key);
        if (type === "string") argv.push(`${option.long}=${value}`);
        else if (value === !option.negate) argv.push(option.long);
        else if (option.defaultValue !== void 0 && value !== option.defaultValue)
          throw new Error(`${key} cannot override its CLI default without an opposing flag`);
      }
      const run = launch(argv, name === "start");
      if (name === "start") active = run;
      return await run.response;
    } catch (error) {
      return result("", error instanceof Error ? error.message : String(error), 1);
    }
  }
  const stdout = process.stdout;
  const stdin = process.stdin;
  const write = stdout.write;
  let input;
  let shutdown;
  try {
    await new Promise((resolve, reject) => {
      shutdown = () => {
        if (closing) return;
        closing = true;
        void Promise.all([...children].map((run) => run.close())).then(() => resolve(), reject);
      };
      function send(id, response) {
        if (closing) return;
        try {
          write.call(stdout, `${JSON.stringify({ jsonrpc: "2.0", id, ...response })}
`);
        } catch {
          shutdown();
        }
      }
      function error(id, code, message) {
        send(id, { error: { code, message } });
      }
      function handleLine(line) {
        if (closing) return;
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          error(null, -32700, "Parse error");
          return;
        }
        if (!isObject(message)) {
          error(null, -32600, "Invalid request");
          return;
        }
        const { id, method, params } = message;
        const validId = typeof id === "string" || typeof id === "number" && Number.isInteger(id);
        if (message.jsonrpc !== "2.0" || typeof method !== "string" || "id" in message && !validId) {
          error(validId ? id : null, -32600, "Invalid request");
          return;
        }
        if (!validId) return;
        if (params !== void 0 && (!isObject(params) || params._meta !== void 0 && !isObject(params._meta))) {
          error(id, -32602, "params must be an object with object metadata");
          return;
        }
        switch (method) {
          case "initialize": {
            if (!params || typeof params.protocolVersion !== "string" || !isObject(params.capabilities) || !isObject(params.clientInfo) || typeof params.clientInfo.name !== "string" || typeof params.clientInfo.version !== "string") {
              error(id, -32602, "initialize requires protocolVersion, capabilities, and clientInfo");
              return;
            }
            const versions = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
            send(id, {
              result: {
                protocolVersion: versions.includes(params.protocolVersion) ? params.protocolVersion : versions[0],
                capabilities: { tools: {} },
                serverInfo: { name: "emulate", version: true ? "0.13.1" : "0.0.0" },
                instructions: "Tools run the emulate CLI. Start owns one emulator process until stop or this MCP connection closes."
              }
            });
            return;
          }
          case "ping":
            send(id, { result: {} });
            return;
          case "tools/list":
            if (params?.cursor !== void 0 && typeof params.cursor !== "string") {
              error(id, -32602, "cursor must be a string");
              return;
            }
            send(id, { result: { tools: [...commands.map((entry) => entry.tool), stopTool] } });
            return;
          case "tools/call": {
            if (!params || typeof params.name !== "string" || params.arguments !== void 0 && !isObject(params.arguments)) {
              error(id, -32602, "tools/call requires a name and optional object arguments");
              return;
            }
            const name = params.name;
            const args = params.arguments ?? {};
            const order = ++calls;
            const response = (name === "stop" ? Promise.resolve() : pending).then(() => call(name, args, order)).then(
              (result2) => send(id, { result: result2 }),
              () => error(id, -32603, "Internal error")
            );
            pending = Promise.all([pending, response]).then(() => {
            });
            return;
          }
          default:
            error(id, -32601, `Method not found: ${method}`);
        }
      }
      input = createInterface({ input: stdin, terminal: false, crlfDelay: Infinity });
      input.on("line", handleLine);
      input.once("close", shutdown);
      input.once("error", shutdown);
      stdin.once("close", shutdown);
      stdin.once("error", shutdown);
      process.once("SIGINT", shutdown);
      process.once("SIGTERM", shutdown);
      stdout.once("error", shutdown);
      if (stdin.readableEnded || stdin.destroyed) shutdown();
    });
  } finally {
    input?.removeAllListeners("line");
    input?.off("close", shutdown);
    input?.off("error", shutdown);
    input?.close();
    stdin.off("close", shutdown);
    stdin.off("error", shutdown);
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
    stdout.off("error", shutdown);
    stdin.pause();
  }
}
export {
  startMcpServer
};
//# sourceMappingURL=mcp-RZ64HPCM.js.map
import {
  CONFIG_FILES,
  DEFAULT_TOKENS,
  SERVICE_NAMES,
  SERVICE_REGISTRY,
  ensurePortless,
  findConfig,
  isBuiltin,
  loadConfig,
  preflightGeneratedSecretsFile,
  prepareProject,
  publishGeneratedSecretsFile,
  registerAliases,
  removeAliases
} from "./chunk-X37XRSOG.js";

// src/program.ts
import { Command } from "commander";

// src/commands/init.ts
import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { stringify as yamlStringify } from "yaml";
function initCommand(options) {
  const filename = "emulate.config.yaml";
  const fullPath = resolve(filename);
  if (existsSync(fullPath)) throw new Error(`Config file already exists: ${filename}`);
  let config;
  if (options.service === "all") {
    config = { ...DEFAULT_TOKENS };
    for (const name of SERVICE_NAMES) {
      Object.assign(config, SERVICE_REGISTRY[name].initConfig);
    }
  } else {
    if (!Object.hasOwn(SERVICE_REGISTRY, options.service)) {
      throw new Error(`Unknown service: ${options.service}. Available: ${SERVICE_NAMES.join(", ")}, all`);
    }
    const entry = SERVICE_REGISTRY[options.service];
    config = { ...DEFAULT_TOKENS, ...entry.initConfig };
  }
  const content = yamlStringify(config);
  writeFileSync(fullPath, content, { encoding: "utf-8", flag: "wx" });
  console.log(`Created ${filename}

Run 'npx emulate' to start the emulator.`);
}

// src/commands/list.ts
async function listCommand(configPath) {
  const services = Object.entries(SERVICE_REGISTRY).map(([name, entry]) => ({
    name,
    label: entry.label,
    endpoints: entry.endpoints
  }));
  const lines = ["\nAvailable services:\n"];
  for (const service of services) {
    lines.push(`  ${service.name.padEnd(10)}${service.label}`, `            Endpoints: ${service.endpoints}`, "");
  }
  const config = await loadConfig({ config: configPath });
  try {
    const configuredInstances = config.services.filter((service) => typeof service.emulator !== "string" || service.emulator !== service.name).map(({ name, source: source2 }) => ({ name, source: source2 }));
    if (configuredInstances.length) lines.push("Configured instances:\n");
    for (const service of configuredInstances) lines.push(`  ${service.name.padEnd(16)}${service.source}`);
    console.log(lines.join("\n"));
  } finally {
    config.loader.close();
  }
}

// src/commands/project-start.ts
import { fork } from "child_process";
import { fileURLToPath } from "url";
import { resolve as resolve3, dirname as dirname2 } from "path";

// src/project-watcher.ts
import { readdir, stat } from "fs/promises";
import { dirname, join, matchesGlob, resolve as resolve2, sep } from "path";
var ignored = /(?:^|[/\\])(?:node_modules|\.git|\.emulate|dist|\.next|\.turbo)(?:[/\\]|$)/;
var source = /\.(?:[cm]?[jt]s|json|ya?ml)$/;
var missing = (error) => ["ENOENT", "ENOTDIR"].includes(error.code ?? "");
var matches = (path, pattern) => matchesGlob(path, pattern) || path.startsWith(pattern + sep);
var ProjectWatcher = class {
  constructor(directory, change, error, interval = 150) {
    this.directory = directory;
    this.change = change;
    this.error = error;
    this.interval = interval;
  }
  files = /* @__PURE__ */ new Set();
  patterns = [];
  previous = /* @__PURE__ */ new Map();
  changes = /* @__PURE__ */ new Map();
  recovery = true;
  stopped = false;
  timer;
  pending = Promise.resolve();
  async snapshot() {
    const files = new Set(this.files);
    const roots = new Set(
      this.patterns.map((pattern) => {
        const prefix = pattern.split(/[*?{[]/)[0];
        return prefix.endsWith(sep) ? prefix : dirname(prefix);
      })
    );
    if (this.recovery) roots.add(this.directory);
    const visited = /* @__PURE__ */ new Set();
    const walk = async (directory) => {
      if (this.stopped || visited.has(directory) || ignored.test(directory)) return;
      visited.add(directory);
      let entries;
      try {
        entries = await readdir(directory, { withFileTypes: true });
      } catch (error) {
        if (missing(error)) return;
        throw error;
      }
      for (const entry of entries) {
        const path = join(directory, entry.name);
        if (ignored.test(path)) continue;
        if (entry.isDirectory()) await walk(path);
        else if (this.recovery && source.test(path) || this.patterns.some((pattern) => matches(path, pattern)))
          files.add(path);
      }
    };
    for (const root of roots) await walk(resolve2(root));
    const result = /* @__PURE__ */ new Map();
    const paths = [...files];
    let cursor = 0;
    await Promise.all(
      Array.from({ length: Math.min(16, paths.length) }, async () => {
        while (!this.stopped && cursor < paths.length) {
          const path = paths[cursor++];
          try {
            const info = await stat(path, { bigint: true });
            result.set(path, `${info.mtimeNs}:${info.ctimeNs}:${info.size}:${info.ino}`);
          } catch (error) {
            if (!missing(error)) throw error;
          }
        }
      })
    );
    return result;
  }
  async scan(baseline = false) {
    const current = await this.snapshot();
    if (!baseline && !this.stopped) {
      for (const path of /* @__PURE__ */ new Set([...this.previous.keys(), ...current.keys()])) {
        if (this.previous.get(path) !== current.get(path))
          this.changes.set(path, { stamp: current.get(path), since: Date.now() });
      }
      for (const [path, change] of this.changes) {
        if (current.get(path) === change.stamp && Date.now() - change.since >= 100) {
          this.changes.delete(path);
          this.change(path);
        }
      }
    }
    this.previous = current;
  }
  schedule() {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      this.pending = this.pending.then(() => this.scan()).catch(this.error).finally(() => this.schedule());
    }, this.interval);
  }
  async start() {
    await this.scan(true).catch(this.error);
    this.schedule();
  }
  async update(files, patterns, recovery) {
    this.pending = this.pending.then(async () => {
      if (this.stopped) return;
      this.files = new Set(files);
      this.patterns = patterns;
      this.recovery = recovery;
      const current = await this.snapshot();
      for (const [path, stamp] of this.previous) {
        const retained = this.files.has(path) || current.has(path);
        if (!retained) this.changes.delete(path);
        else if (!this.stopped && current.get(path) !== stamp)
          this.changes.set(path, { stamp: current.get(path), since: Date.now() });
      }
      this.previous = current;
    }).catch(this.error);
    await this.pending;
  }
  async close() {
    this.stopped = true;
    this.changes.clear();
    clearTimeout(this.timer);
    await this.pending;
  }
};

// src/commands/project-start.ts
function printReady(metadata, watching) {
  const lines = ["\nemulate\n"];
  for (const service of metadata.services) {
    lines.push(`  ${service.name}  ${service.url}
    Source: ${service.source}`);
    if (service.inspectorUrl)
      lines.push(`    Inspector: ${service.inspectorUrl}
    Routes: ${service.inspectorUrl}?tab=routes`);
  }
  lines.push(`
  ${watching ? "Watching imports and fixtures. Reloads reset state to seed." : "Ready."}`);
  const text = lines.join("\n");
  if (process.connected) process.send?.({ type: "emulate:ready", text }, () => {
  });
  else console.log(text);
}
function receive(child, wanted, timeout = 3e4) {
  return new Promise((resolveMessage, reject) => {
    const cleanup = () => {
      child.off("message", message);
      child.off("exit", exit);
      child.off("error", error);
      clearTimeout(timer);
    };
    const message = (value) => {
      if (value.type === wanted) {
        cleanup();
        resolveMessage(value);
      } else if (value.type === "error") {
        cleanup();
        reject(new Error(value.error));
      }
    };
    const exit = (code) => {
      cleanup();
      reject(new Error(`Emulator runner exited (${code})`));
    };
    const error = (value) => {
      cleanup();
      reject(value);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Emulator runner timed out waiting for ${wanted}`));
    }, timeout);
    child.on("message", message);
    child.once("exit", exit);
    child.once("error", error);
  });
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (!child.connected) {
    child.kill("SIGKILL");
    return;
  }
  const done = receive(child, "closed", 7e3);
  child.send({ type: "close" }, (error) => {
    if (error) child.kill("SIGKILL");
  });
  try {
    await done;
  } catch (error) {
    child.kill("SIGKILL");
    console.error(error instanceof Error ? error.message : error);
  }
}
async function projectStartCommand(options) {
  const controller = new AbortController();
  let cleanup;
  let closing;
  const run = {
    close() {
      return closing ??= Promise.resolve().then(async () => {
        controller.abort(new Error("Emulator startup stopped"));
        try {
          await cleanup?.();
        } finally {
          process.off("SIGINT", shutdown);
          process.off("SIGTERM", shutdown);
          process.off("disconnect", shutdown);
          process.off("message", onMessage);
        }
      });
    }
  };
  const shutdown = () => {
    if (closing) return;
    void run.close().then(
      () => process.exit(0),
      (error) => {
        console.error(error);
        process.exit(1);
      }
    );
  };
  const onMessage = (message) => {
    if (message && typeof message === "object" && "type" in message && message.type === "emulate:stop") shutdown();
  };
  process.on("message", onMessage);
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.once("disconnect", shutdown);
  try {
    await startProject(options, controller.signal, (close) => {
      cleanup = close;
    });
    return run;
  } catch (error) {
    await run.close().catch(console.error);
    throw error;
  }
}
async function startProject(options, signal, own) {
  async function setupPortless(aliases2) {
    await ensurePortless({ throwOnFailure: true, signal });
    signal.throwIfAborted();
    registerAliases(aliases2);
  }
  const preflighting = options.generatedSecretsFile ? preflightGeneratedSecretsFile(options.generatedSecretsFile) : void 0;
  own(async () => {
    await preflighting?.catch(() => void 0);
  });
  const target = await preflighting;
  signal.throwIfAborted();
  let published;
  let deliveredSecrets;
  let aliases = [];
  if (!options.watch) {
    let preparing;
    let publishing;
    let ready = false;
    const close = async () => {
      const run2 = await preparing?.catch((error) => {
        if (error instanceof AggregateError) throw error;
        return void 0;
      });
      try {
        await run2?.close();
      } finally {
        removeAliases(aliases);
        if (!ready)
          await publishing?.then(
            (file) => file.rollback(),
            () => void 0
          );
      }
    };
    own(close);
    signal.throwIfAborted();
    const run = await (preparing = prepareProject(options, {}, false, void 0, signal));
    signal.throwIfAborted();
    if (target)
      await (publishing = publishGeneratedSecretsFile(target, {
        schemaVersion: 1,
        generatedSecrets: run.metadata.secrets
      }));
    signal.throwIfAborted();
    if (options.portless) {
      await setupPortless(run.metadata.aliases);
      aliases = run.metadata.aliases;
    }
    await run.start();
    signal.throwIfAborted();
    ready = true;
    printReady(run.metadata, false);
    return;
  }
  const configPath = findConfig(options.config ?? options.seed);
  const directory = configPath ? dirname2(configPath) : process.cwd();
  const configCandidates = options.config || options.seed ? [] : CONFIG_FILES.map((name) => resolve3(directory, name));
  let worker;
  let candidate;
  let retained = {};
  let dependencies = /* @__PURE__ */ new Set([...configCandidates, ...configPath ? [configPath] : []]);
  const lazyDependencies = /* @__PURE__ */ new Set();
  let patterns = [];
  let successful = false;
  let failed = false;
  let stopped = false;
  let queued = false;
  let loading = false;
  let debounce;
  let activeReload;
  function queueReload() {
    if (loading) {
      queued = true;
      return activeReload;
    }
    return activeReload = reload();
  }
  async function reload() {
    if (stopped) return;
    loading = true;
    const attemptedDependencies = /* @__PURE__ */ new Set();
    let candidateProcess;
    const trackCandidateDependencies = (message) => {
      if (message.type === "dependencies")
        for (const file of message.dependencies) attemptedDependencies.add(file);
    };
    try {
      candidate = fork(fileURLToPath(new URL("./project-worker.js", import.meta.url)), [], {
        execArgv: ["--enable-source-maps"],
        stdio: ["ignore", "inherit", "inherit", "ipc"]
      });
      candidateProcess = candidate;
      candidate.on("message", trackCandidateDependencies);
      const prepared = receive(candidate, "prepared");
      candidate.send({ type: "prepare", options, retained, reload: successful });
      const { metadata } = await prepared;
      if (stopped) return;
      const secretsIdentity = JSON.stringify(metadata.secrets.map((secret) => JSON.stringify(secret)).sort());
      if (published && deliveredSecrets !== secretsIdentity)
        throw new Error(
          "Generated identities changed. Restart with a new --generated-secrets-file path to apply the change."
        );
      if (target && !published) {
        published = await publishGeneratedSecretsFile(target, { schemaVersion: 1, generatedSecrets: metadata.secrets });
        deliveredSecrets = secretsIdentity;
      }
      await stop(worker);
      worker = void 0;
      if (stopped) return;
      removeAliases(aliases);
      aliases = [];
      if (options.portless) {
        await setupPortless(metadata.aliases);
        if (stopped) {
          removeAliases(metadata.aliases);
          return;
        }
        aliases = metadata.aliases;
      }
      const started = receive(candidate, "started");
      candidate.send({ type: "start" });
      await started;
      if (stopped) return;
      worker = candidate;
      candidate = void 0;
      dependencies = /* @__PURE__ */ new Set([...configCandidates, ...metadata.dependencies, ...lazyDependencies]);
      patterns = metadata.watch.map((pattern) => resolve3(directory, pattern));
      const running = worker;
      running.on("message", (message) => {
        if (worker !== running || stopped || message.type !== "dependencies") return;
        for (const file of message.dependencies) {
          if (!metadata.dependencies.includes(file)) lazyDependencies.add(file);
        }
        dependencies = /* @__PURE__ */ new Set([...configCandidates, ...metadata.dependencies, ...lazyDependencies]);
        void watcher.update(dependencies, patterns, failed).catch(console.error);
      });
      running.once("exit", (code, signal2) => {
        if (worker !== running || stopped) return;
        worker = void 0;
        failed = true;
        void watcher.update(dependencies, patterns, true).catch(console.error);
        removeAliases(aliases);
        aliases = [];
        const error = `Emulator runner exited (${signal2 ?? code}). Save a source file to restart.`;
        console.error(error);
      });
      retained = metadata.retained;
      failed = false;
      await watcher.update(dependencies, patterns, false);
      if (stopped) return;
      successful = true;
      printReady(metadata, true);
    } catch (error) {
      if (stopped) return;
      failed = true;
      dependencies = /* @__PURE__ */ new Set([...dependencies, ...attemptedDependencies]);
      await watcher.update(dependencies, patterns, true);
      const message = `
Reload failed${worker ? "; serving the last successful version" : ""}. Fix the source and save to retry.
${error instanceof Error ? error.message : error}`;
      console.error(message);
      if (!successful && process.connected)
        process.send?.(
          { type: "emulate:error", error: error instanceof Error ? error.message : String(error) },
          () => {
          }
        );
      await stop(candidate);
      candidate = void 0;
      if (!worker) {
        removeAliases(aliases);
        aliases = [];
      }
      if (!successful) {
        await published?.rollback();
        published = void 0;
        deliveredSecrets = void 0;
      }
    } finally {
      candidateProcess?.off("message", trackCandidateDependencies);
      loading = false;
      if (queued && !stopped) {
        queued = false;
        void queueReload();
      }
    }
  }
  const watcher = new ProjectWatcher(
    directory,
    (path) => {
      if (stopped || options.generatedSecretsFile && path === resolve3(options.generatedSecretsFile)) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        void queueReload();
      }, 100);
    },
    (error) => console.error("Watch error:", error)
  );
  own(async () => {
    stopped = true;
    clearTimeout(debounce);
    try {
      const results = await Promise.allSettled([watcher.close(), stop(worker), stop(candidate)]);
      await activeReload;
      const errors = results.filter((result) => result.status === "rejected");
      if (errors.length)
        throw new AggregateError(
          errors.map((result) => result.reason),
          "Failed to shut down watch"
        );
    } finally {
      removeAliases(aliases);
      if (!successful) await published?.rollback();
    }
  });
  await watcher.start();
  if (!stopped) await queueReload();
}

// src/commands/scaffold.ts
import { existsSync as existsSync2, readFileSync, writeFileSync as writeFileSync2, mkdirSync } from "fs";
import { resolve as resolve4, dirname as dirname3, extname, relative } from "path";
import { parseDocument } from "yaml";
function inventorySource(name) {
  return `import { defineEmulator } from "emulate";

export default defineEmulator({
  name: ${JSON.stringify(name)},
  state: () => ({
    stock: 10,
    nextId: 1,
    reservations: [] as Array<{ id: string }>,
  }),

  setup({ app, state }) {
    app.get("/inventory", (c) => c.json({ stock: state.stock }));
    app.get("/reservations", (c) => c.json(state.reservations));
    app.get("/reservations/:id", (c) => {
      const reservation = state.reservations.find((item) => item.id === c.req.param("id"));
      return reservation ? c.json(reservation) : c.json({ error: "not_found" }, 404);
    });

    app.post("/reservations", (c) => {
      if (state.stock < 1) return c.json({ error: "out_of_stock" }, 409);
      const reservation = { id: "r_" + state.nextId++ };
      state.stock -= 1;
      state.reservations.push(reservation);
      return c.json(reservation, 201);
    });

    app.delete("/reservations/:id", (c) => {
      const index = state.reservations.findIndex((item) => item.id === c.req.param("id"));
      if (index < 0) return c.json({ error: "not_found" }, 404);
      state.reservations.splice(index, 1);
      state.stock += 1;
      return c.body(null, 204);
    });
  },
});
`;
}
function inventoryTest(name) {
  return `import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmulator } from "emulate";
import inventory from "./${name}.ts";

test("reservations update inventory, cancellation restores it, and reset re-seeds", async () => {
  const api = await createEmulator({ service: inventory, listen: false });
  try {
    const response = await api.request("/reservations", { method: "POST" });
    assert.equal(response.status, 201);
    const reservation = (await response.json()) as { id: string };
    assert.deepEqual(await (await api.request("/inventory")).json(), { stock: 9 });
    assert.equal((await api.request("/reservations/" + reservation.id, { method: "DELETE" })).status, 204);
    assert.deepEqual(await (await api.request("/inventory")).json(), { stock: 10 });

    for (let i = 0; i < 10; i++) await api.request("/reservations", { method: "POST" });
    assert.equal((await api.request("/reservations", { method: "POST" })).status, 409);
    await api.reset();
    assert.deepEqual(await (await api.request("/inventory")).json(), { stock: 10 });
    assert.deepEqual(await (await api.request("/reservations")).json(), []);
  } finally {
    await api.close();
  }
});
`;
}
function maskStringsAndComments(source2) {
  const masked = source2.split("");
  for (let index = 0; index < source2.length; ) {
    const char = source2[index];
    let end = index;
    if (char === "/" && source2[index + 1] === "/") {
      end = source2.indexOf("\n", index + 2);
      if (end < 0) end = source2.length;
    } else if (char === "/" && source2[index + 1] === "*") {
      end = source2.indexOf("*/", index + 2);
      end = end < 0 ? source2.length : end + 2;
    } else if (char === '"' || char === "'" || char === "`") {
      end = index + 1;
      while (end < source2.length) {
        if (source2[end] === "\\") end += 2;
        else if (source2[end++] === char) break;
      }
    }
    if (end === index) {
      index++;
      continue;
    }
    for (let cursor = index; cursor < end; cursor++)
      if (masked[cursor] !== "\n" && masked[cursor] !== "\r") masked[cursor] = " ";
    index = end;
  }
  return masked.join("");
}
function skipTrivia(source2, start) {
  let index = start;
  while (index < source2.length) {
    if (/\s/.test(source2[index])) index++;
    else if (source2.startsWith("//", index)) {
      const end = source2.indexOf("\n", index + 2);
      index = end < 0 ? source2.length : end;
    } else if (source2.startsWith("/*", index)) {
      const end = source2.indexOf("*/", index + 2);
      index = end < 0 ? source2.length : end + 2;
    } else break;
  }
  return index;
}
function hasLiteralServiceKey(source2, code, name) {
  const openings = [];
  const addOpening = (afterKey) => {
    const colon = skipTrivia(source2, afterKey);
    if (code[colon] !== ":") return;
    const opening = skipTrivia(source2, colon + 1);
    if (code[opening] === "{") openings.push(opening);
  };
  for (const match of code.matchAll(/\bservices\b/g)) addOpening(match.index + match[0].length);
  for (const match of source2.matchAll(/(["'])services\1/g)) addOpening(match.index + match[0].length);
  for (const opening of openings) {
    let braces = 1;
    let brackets = 0;
    let parentheses = 0;
    for (let index = opening + 1; index < code.length && braces > 0; index++) {
      const char = code[index];
      if (index === opening + 1 || char === "," && braces === 1 && brackets === 0 && parentheses === 0) {
        const keyStart = skipTrivia(source2, index === opening + 1 ? index : index + 1);
        const quote = source2[keyStart];
        const quoted = quote === '"' || quote === "'";
        const keyEnd = keyStart + name.length + (quoted ? 2 : 0);
        if ((!quoted || source2[keyEnd - 1] === quote) && source2.slice(keyStart + (quoted ? 1 : 0), keyEnd - (quoted ? 1 : 0)) === name && code[skipTrivia(source2, keyEnd)] === ":")
          return true;
      }
      if (char === "{") braces++;
      else if (char === "}") braces--;
      else if (char === "[") brackets++;
      else if (char === "]") brackets--;
      else if (char === "(") parentheses++;
      else if (char === ")") parentheses--;
    }
  }
  return false;
}
function addToExecutableConfig(original, name, identifier, importLine) {
  if (original.startsWith("#!")) return void 0;
  const code = maskStringsAndComments(original);
  const exports = [...code.matchAll(/(?:^|[;\r\n])\s*(export\s+default)\b/g)];
  if (exports.length !== 1) return void 0;
  const base = `__emulateConfigBefore_${identifier}`;
  if (original.includes(base) || original.includes(`import ${identifier} `))
    throw new Error(`Service ${name} may already be defined in the config`);
  if (hasLiteralServiceKey(original, code, name))
    throw new Error(`Service ${name} may already be defined in the config`);
  const match = exports[0];
  const start = match.index + match[0].lastIndexOf(match[1]);
  const renamed = original.slice(0, start) + `const ${base} =` + original.slice(start + match[1].length);
  return `${importLine}
// @emulate:imports
${renamed.trimEnd()}

if (Object.hasOwn(${base}.services ?? {}, ${JSON.stringify(name)}))
  throw new Error(${JSON.stringify(`Service ${name} already exists in config`)});

export default {
  ...${base},
  services: {
    ...${base}.services,
    ${JSON.stringify(name)}: { emulator: ${identifier} },
    // @emulate:services
  },
};
`;
}
function scaffoldCommand(name, configOption, cwd = process.cwd()) {
  if (!/^[a-z][a-z0-9-]*$/.test(name) || isBuiltin(name))
    throw new Error(
      "Choose a custom name using lowercase letters, digits, and hyphens that does not match a built-in service"
    );
  const existing = findConfig(configOption, cwd);
  const directory = existing ? dirname3(existing) : cwd;
  const source2 = resolve4(directory, "emulators", `${name}.ts`);
  const test = resolve4(directory, "emulators", `${name}.test.ts`);
  for (const path of [source2, test])
    if (existsSync2(path)) throw new Error(`File already exists: ${path}. Choose another custom name.`);
  const identifier = `${name.replaceAll("-", "_")}Emulator`;
  const importLine = `import ${identifier} from "./emulators/${name}.ts";`;
  const entryLine = `    ${JSON.stringify(name)}: { emulator: ${identifier} },`;
  const config = existing ?? resolve4(directory, "emulate.config.ts");
  let output;
  if (!existing)
    output = `import { defineConfig } from "emulate";
${importLine}
// @emulate:imports

export default defineConfig({
  services: {
${entryLine}
    // @emulate:services
  },
});
`;
  else if ([".yaml", ".yml", ".json"].includes(extname(config))) {
    const original = readFileSync(config, "utf8");
    const document = parseDocument(original);
    if (document.errors.length) throw new Error(`Cannot update config: ${document.errors[0].message}`);
    if (document.has(name) || document.hasIn(["services", name]))
      throw new Error(`Service ${name} already exists in ${config}`);
    document.setIn(["services", name], { emulator: `./emulators/${name}.ts` });
    output = extname(config) === ".json" ? `${JSON.stringify(document.toJS(), null, 2)}
` : document.toString();
  } else if ([".ts", ".mts", ".js", ".mjs"].includes(extname(config))) {
    const original = readFileSync(config, "utf8");
    const importMarker = /^[ \t]*\/\/ @emulate:imports[ \t]*$/m;
    const serviceMarker = /^([ \t]*)\/\/ @emulate:services[ \t]*$/m;
    if (importMarker.test(original) && serviceMarker.test(original)) {
      if (hasLiteralServiceKey(original, maskStringsAndComments(original), name) || original.includes(`import ${identifier} `))
        throw new Error(`Service ${name} already exists in ${config}`);
      output = original.replace(importMarker, (marker) => `${importLine}
${marker}`).replace(
        serviceMarker,
        (marker, indent) => `${indent}${JSON.stringify(name)}: { emulator: ${identifier} },
${marker}`
      );
    } else output = addToExecutableConfig(original, name, identifier, importLine);
  }
  mkdirSync(dirname3(source2), { recursive: true });
  writeFileSync2(source2, inventorySource(name), { flag: "wx" });
  writeFileSync2(test, inventoryTest(name), { flag: "wx" });
  if (output !== void 0) writeFileSync2(config, output, { flag: existing ? "w" : "wx" });
  const lines = [`Created ${relative(cwd, source2)}
Created ${relative(cwd, test)}`];
  if (output === void 0)
    lines.push(`
Add this import to ${config}:
${importLine}

Add this entry to services:
${entryLine}`);
  else lines.push(`${existing ? "Updated" : "Created"} ${relative(cwd, config)}`);
  lines.push(
    `
Start: npx emulate start --watch${configOption ? ` --config ${JSON.stringify(configOption)}` : ""}
Test: node --test ${relative(cwd, test)}
Use the ${name} URL and Inspector link printed by start to send requests and inspect state.`
  );
  console.log(lines.join("\n"));
}

// src/program.ts
function createProgram() {
  const defaultPort = process.env.EMULATE_PORT ?? process.env.PORT ?? "4000";
  const program = new Command();
  program.name("emulate").description("Local drop-in replacement services for CI and no-network sandboxes").version("0.13.0").exitOverride().configureOutput({ outputError: () => {
  } }).addHelpText(
    "after",
    `
Framework adapters:
  Embed emulators in app routes with @emulators/adapter-next or @emulators/adapter-nuxt.
  Docs: https://emulate.dev/docs/nextjs and https://emulate.dev/docs/nuxt

MCP:
  Run 'npx emulate mcp' for stdio tools backed by CLI commands.

Networking:
  Built-in and custom listeners bind to 127.0.0.1 by default.
  Use --host 0.0.0.0 for access from containers or other machines.
  createEmulator accepts hostname for the listening address.
  Use --base-url or baseUrl for advertised URLs reachable by those clients.

Custom emulators:
  Build and share emulators for third-party HTTP APIs alongside the built-in services.
  Run 'npx emulate init --custom inventory' to scaffold an emulator, config, and runnable test.
  Adapt the generated inventory routes, state, and test to the provider your app uses.
  Existing YAML, JSON, TypeScript, and JavaScript configs get a service entry when supported.
  For unusual executable configs, init prints the import and service entry to add manually.
  Init prints the test command; use the service URL and Inspector link printed by start for requests.
  Run 'npx emulate start --watch' to reload local modules and inspect requests at /_emulate.
  Creating a missing local import retries a failed reload, including outside the config directory.
  Import defineEmulator, defineConfig, and createEmulator from 'emulate'.
  Test in process with createEmulator({ service: yourDefinition, listen: false }).
  Custom emulators support seeds, reset, snapshots, restore, and opt-in persistence.
  Streamed responses persist state changes during delivery; reset and close cancel active streams before cleanup.
  Appended Set-Cookie headers retain cookies already on a response.
  Config accepts local TypeScript/JavaScript files and installed packages alongside built-ins.
  Node loads TypeScript with tsconfig aliases and source maps; no extra runtime packages are needed.
  Node 26 requires erasable TypeScript; compile enums and parameter properties to JavaScript first.
  Node 24 also supports native TypeScript transforms.
  Successful watch reloads reset the run to seed; auto-detected config files created later also trigger reloads.
  Reload errors keep the previous runner when possible.
  Structured inspection redacts token and secret fields, including access_token and client_secret.
  Framework adapters keep root-relative custom redirects under the service mount.
  Export OPTIONS from the Next.js handler to forward preflight and custom OPTIONS routes.
  Docs: https://emulate.dev/docs/custom-emulators

GitHub API coverage:
  Includes repository contents, raw downloads, raw media negotiation for file Contents and README responses,
  commit history, commit details, ref comparisons, organization membership seeding with member/admin roles,
  and Checks list-by-ref endpoints for branch and tag refs containing slashes.
  Check-run lists paginate with page/per_page (default 30, maximum 100) and Link headers.
  Ref lists filter before pagination; total_count includes all filtered runs.
  Checks retain the authenticated installation's App in API responses and webhooks.
  Suites are separated by App and commit; latest runs are grouped by App and check name.
  User-token checks return app: null; request-body app_id cannot change attribution.
  Inspect minted installation-token metadata at GET /_emulate/installation-tokens.

Linear API coverage:
  Issue queries and mutations include numeric priority and derived priorityLabel fields.

Vercel API coverage:
  GET /v7/deployments lists deployments by commit SHA across a team's projects, with cursor pagination.

AWS API coverage:
  S3 uploads and downloads preserve arbitrary binary payloads, including raw byte lengths and ETags.
  SQS supports current AWS SDK clients using AWS JSON 1.0 at /sqs, alongside XML Query requests.
  Queue operations also accept the returned QueueUrl as the endpoint.
  Cognito User Pools use /cognito-idp and Identity Pools use /cognito-identity with the AWS SDK v3.
  Seed aws.cognito.user_pools and identity_pools; defaults are us-east-1_emulate and app client emulateclient.
  Sign-up, confirmation, password/reset/refresh flows, new-password challenges, and admin user operations are supported.
  Local confirmation codes default to 123456 and appear at /_inspector?tab=cognito; no email/SMS is sent.
  RS256 tokens, discovery, and JWKS use the issuer BASE_URL/cognito-idp/USER_POOL_ID.
  That issuer serves /oauth2/authorize (local user picker), /oauth2/token (code/refresh + S256 PKCE), and /oauth2/userInfo.
  Identity Pools support GetId and GetCredentialsForIdentity with validated User Pool ID tokens.
  SRP, MFA, external federation, pool/client management APIs, and IAM policy/signature evaluation are not simulated.

Google Calendar discovery:
  GET /discovery/v1/apis/calendar/v3/rest returns the public discovery document for the emulated Calendar v3 surface.

Google OIDC:
  Discovery advertises RS256 ID tokens, and GET /oauth2/v3/certs returns the RSA public key used to verify them.
  Set google.strict_scopes: true in seed config to validate issued access tokens, expiry, revocation, and method scopes.
  Strict mode returns Google-style 401/403 errors and limits userinfo claims; bearer-token defaults remain permissive.

Resend API coverage:
  POST /emails and POST /emails/batch support 24-hour Idempotency-Key replay without duplicate emails or webhooks.
  Optional resend.allowlist restricts to/cc/bcc recipients; [] rejects all, and omission accepts all.
  Rejected batches create no emails or webhooks. Validated sends record resend.send_attempts in saved state.
  Idempotency replays and malformed requests do not add attempts; rejected sends can be retried with the same key.

Microsoft OAuth coverage:
  Refresh tokens are bound to the issuing client and require its client_id and client_secret, or client_secret_basic.
  Legacy refresh records without a stored client binding remain supported.

Webhook signatures:
  Stripe webhook secrets produce a Stripe-Signature header for raw-body verification.
  Slack event_subscriptions in seed config register request URLs for outbound event callbacks.
  An event_subscriptions app_id limits a URL to that app's envelopes.
  Slack signing_secret produces X-Slack-Request-Timestamp and X-Slack-Signature for outbound event callbacks.
  The Slack signature covers v0:<timestamp>:<raw-body>; configure the receiver with the same secret.
  Slack callbacks are unsigned when signing_secret is absent or empty.

Available services:
  ${SERVICE_NAMES.join(", ")}
  Run 'npx emulate list' for endpoint summaries.

Configuration:
  Run 'npx emulate init' to create a starter emulate.config.yaml, or pass --seed <file>.
  GitHub App private keys may be omitted for createEmulator; CLI startup generates omitted keys only with
  --generated-secrets-file <path>.

Twilio API coverage:
  Accounts, API keys, phone numbers, Messaging, Verify, Voice, Conversations, webhooks, simulators, and inspector.

Slack interactivity:
  Configure slack.oauth_apps[].interactivity_url and slack.signing_secret for signed button and modal callbacks.
  POST /_slack/simulate/block-actions clicks a stored button; POST /_slack/simulate/view-submission submits a modal.
  Button response URLs support private/public replies and source updates for five uses within 30 minutes.
  Modal acknowledgements can close, clear, update, push, or show errors. Triggers expire in 3 seconds by default;
  slack.view_trigger_ttl_seconds can extend their lifetime for local tests.

Slack app lifecycle:
  POST /api/apps.uninstall accepts client_id, client_secret, and a user token or configured development token.
  It revokes the app's OAuth credentials in that workspace and emits app_uninstalled and tokens_revoked.
  Revoked tokens return token_revoked even with permissive authentication. Granular bot tokens return no_permission.
  A new OAuth installation issues fresh credentials; other apps and workspaces are unaffected.

Slack message limits:
  Slack text fields are limited to 40,000 Unicode characters. Longer text is truncated safely,
  and successful Web API responses include message_truncated warning metadata.

Slack channel privacy:
  POST /api/admin.conversations.convertToPrivate and convertToPublic accept channel_id.
  Use a user token for a seeded admin; bot/test tokens and non-admin users are rejected.
  Strict scopes require admin.conversations:write. Conversions update visibility and emit conversion messages.
  DMs, MPIMs, and repeated conversions are rejected; #general cannot become private.
  Enterprise plan, organization installation, and channel-management policies are not simulated.

Slack Connect fixtures:
  Seed slack.users[].team_id to model an external author; is_stranger is an optional fixture flag.
  Channels with external members report is_ext_shared and is_shared; events include is_ext_shared_channel.
  App mentions carry the external author's user_team/source_team while the envelope keeps the receiving team.
  Seed slack.channels[].is_ext_shared for existing shares. Invitation/approval and workspace unlink flows are not simulated.

Slack event callbacks:
  POST /_slack/simulate/event-retry accepts event_id and optional reason (default http_timeout).
  It resends the latest recorded delivery with increasing retry headers and a fresh Slack signature when configured.
  Retries are explicit, target one original subscription, and require retained in-memory delivery history.
  Event callbacks include token, api_app_id, authorizations, team_id, event_id, and event_time.
  The team comes from the presented token's installation, or affected resource or seeded team
  for development tokens. Incoming webhooks use their webhook or target channel team.
  Each logical event has a distinct ID shared across subscriber deliveries.
  chat.postMessage emits app_mention for installed bots mentioned as <@BOT_USER_ID> in joined channels.
  Subscribe to app_mention and invite the bot with conversations.invite. DMs and MPIMs use message events.
  Mention callbacks include api_app_id and retain message and thread identity.
  Each workspace installation receives its own envelope; shared subscriptions can route by api_app_id.
  Without an installation, api_app_id is A000000001. verification_token defaults to emulate-verification-token.
  Inner events include event_ts; message events identify channel, group, im, or mpim in channel_type.
  Issued or seeded bot tokens add stored bot identity to messages, history, and replies.
  Removing an installed bot emits channel_left or group_left with actor_id and event_ts.
`
  );
  program.command("start", { isDefault: true }).description("Start the emulator server").option("-p, --port <port>", "Base port", defaultPort).option("--host <host>", "Listening address (use 0.0.0.0 for network access)", "127.0.0.1").option("-s, --service <services>", "Comma-separated services to enable").option("--seed <file>", "Path to seed config file").option("--config <file>", "Path to TypeScript, JavaScript, YAML, or JSON configuration").option("--watch", "Watch imports and fixtures; successful reloads reset state to seed").option("--base-url <url>", "Override advertised base URL (supports {service} template)").option("--portless", "Serve over HTTPS via portless (auto-registers aliases)").option(
    "--generated-secrets-file <path>",
    "Write service-generated secrets to a new owner-only JSON file (Linux requires setfacl and getfacl)"
  ).action(async (opts) => {
    await projectStartCommand({
      port: parsePort(opts.port),
      host: opts.host,
      service: opts.service,
      seed: opts.seed,
      config: opts.config,
      watch: opts.watch,
      baseUrl: opts.baseUrl,
      portless: opts.portless,
      generatedSecretsFile: opts.generatedSecretsFile
    });
  });
  program.command("init").description("Generate a starter config file").option("-s, --service <service>", "Service to generate config for", "all").option("--custom <name>", "Scaffold a third-party API emulator, config, and test").option("--config <file>", "Existing configuration to update when scaffolding a custom API").action((opts) => {
    if (opts.custom) scaffoldCommand(opts.custom, opts.config);
    else initCommand({ service: opts.service });
  });
  program.command("list").alias("list-services").description("List available services").option("--config <file>", "Configuration containing custom services").action(async (opts) => {
    await listCommand(opts.config);
  });
  return program;
}
function parsePort(value) {
  const port = parseInt(value, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) throw new Error(`Invalid port: ${value}`);
  return port;
}

export {
  createProgram
};
//# sourceMappingURL=chunk-N3BMOE7X.js.map
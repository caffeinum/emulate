import {
  prepareProject
} from "./chunk-4BPNIDAC.js";
import "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// src/project-worker.ts
var run;
var preparing;
var controller = new AbortController();
var closing;
function close() {
  return closing ??= (async () => {
    controller.abort(new Error("Emulator startup stopped"));
    await preparing?.catch((error) => {
      if (error instanceof AggregateError) throw error;
    });
    await run?.close();
  })();
}
var handling = Promise.resolve();
process.on(
  "message",
  (message) => {
    if (message.type === "close") {
      void close().then(
        () => {
          if (process.connected) {
            process.send?.({ type: "closed" }, () => {
              if (process.connected) process.disconnect();
            });
          }
        },
        (error) => {
          if (process.connected)
            process.send?.({ type: "error", error: error instanceof Error ? error.stack : String(error) });
        }
      );
      return;
    }
    handling = handling.then(async () => {
      try {
        controller.signal.throwIfAborted();
        if (message.type === "prepare") {
          run = await (preparing = prepareProject(
            message.options,
            message.retained,
            message.reload,
            (dependencies) => {
              if (process.connected) process.send?.({ type: "dependencies", dependencies }, () => {
              });
            },
            controller.signal
          ));
          process.send?.({ type: "prepared", metadata: run.metadata });
        } else if (message.type === "start") {
          run.watchDependencies((dependencies) => {
            if (process.connected) process.send?.({ type: "dependencies", dependencies }, () => {
            });
          });
          await run.start();
          process.send?.({ type: "started" });
        }
      } catch (error) {
        if (process.connected && !controller.signal.aborted)
          process.send?.({ type: "error", error: error instanceof Error ? error.stack : String(error) });
      }
    });
  }
);
process.on("disconnect", () => {
  const timer = setTimeout(() => process.exit(1), 7e3);
  void close().catch(console.error).finally(() => {
    clearTimeout(timer);
    process.exit(0);
  });
});
//# sourceMappingURL=project-worker.js.map
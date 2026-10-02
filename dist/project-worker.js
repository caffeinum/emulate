import {
  prepareProject
} from "./chunk-IHCYBRGF.js";
import "./chunk-U6ISZSHV.js";
import "./chunk-PZ5AY32C.js";

// src/project-worker.ts
var run;
var handling = Promise.resolve();
process.on(
  "message",
  (message) => {
    handling = handling.then(async () => {
      try {
        if (message.type === "prepare") {
          run = await prepareProject(message.options, message.retained, message.reload, (dependencies) => {
            if (process.connected) process.send?.({ type: "dependencies", dependencies }, () => {
            });
          });
          process.send?.({ type: "prepared", metadata: run.metadata });
        } else if (message.type === "start") {
          run.watchDependencies((dependencies) => {
            if (process.connected) process.send?.({ type: "dependencies", dependencies }, () => {
            });
          });
          await run.start();
          process.send?.({ type: "started" });
        } else if (message.type === "close") {
          await run?.close();
          process.send?.({ type: "closed" });
          process.disconnect();
        }
      } catch (error) {
        process.send?.({ type: "error", error: error instanceof Error ? error.stack : String(error) });
      }
    });
  }
);
process.on("disconnect", () => {
  const timer = setTimeout(() => process.exit(1), 7e3);
  void (run?.close() ?? Promise.resolve()).catch(console.error).finally(() => {
    clearTimeout(timer);
    process.exit(0);
  });
});
//# sourceMappingURL=project-worker.js.map
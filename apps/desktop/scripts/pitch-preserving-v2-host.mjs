import console from "node:console";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { get } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const LOCAL_ORIGIN = "http://127.0.0.1:4175";
const SERVER_START_TIMEOUT_MS = 30_000;
const COMPARISON_TIMEOUT_MS = 15 * 60 * 1_000;
const candidateArgument = process.argv.find((argument) =>
  argument.startsWith("--candidate="),
);
const requestedCandidate = candidateArgument?.slice("--candidate=".length);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const require = createRequire(import.meta.url);
const vitePackageRoot = path.dirname(require.resolve("vite/package.json"));
const playwrightPackageRoot = path.dirname(
  require.resolve("@playwright/test/package.json"),
);

function spawnNode(args, options = {}) {
  return spawn(process.execPath, args, {
    cwd: desktopRoot,
    env: process.env,
    windowsHide: true,
    ...options,
  });
}

async function stopChildTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  if (process.platform === "win32") {
    const cleanup = spawn(
      "taskkill.exe",
      ["/PID", String(child.pid), "/T", "/F"],
      {
        stdio: "ignore",
        windowsHide: true,
      },
    );
    await Promise.race([once(cleanup, "exit"), delay(5_000)]);
    await Promise.race([once(child, "exit"), delay(5_000)]);
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await once(child, "exit");
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error("pitch-preserving-v2-server-exited");
    }
    try {
      const available = await new Promise((resolve) => {
        const request = get(LOCAL_ORIGIN, (response) => {
          response.resume();
          resolve(
            response.statusCode !== undefined && response.statusCode < 500,
          );
        });
        request.setTimeout(1_000, () => {
          request.destroy();
          resolve(false);
        });
        request.once("error", () => resolve(false));
      });
      if (available) {
        return;
      }
    } catch {
      // The bounded local server is still starting.
    }
    await delay(100);
  }
  throw new Error("pitch-preserving-v2-server-timeout");
}

async function run() {
  const server = spawnNode(
    [
      path.join(vitePackageRoot, "bin", "vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "4175",
      "--strictPort",
    ],
    { stdio: "ignore" },
  );
  let comparison;
  try {
    await waitForServer(server);
    comparison = spawnNode(
      [
        path.join(playwrightPackageRoot, "cli.js"),
        "test",
        "--config",
        "playwright.pitch-preserving-v2.config.ts",
        "--grep",
        "measures the selected",
        "--workers=1",
      ],
      {
        env: {
          ...process.env,
          VOXLEAF_PLAYBACK_V2_LOCAL_ORIGIN: LOCAL_ORIGIN,
          ...(requestedCandidate === undefined
            ? {}
            : {
                VOXLEAF_PLAYBACK_V2_COMPARISON_CANDIDATE: requestedCandidate,
              }),
        },
        stdio: "inherit",
      },
    );
    const outcome = await Promise.race([
      once(comparison, "exit").then(([code, signal]) => ({ code, signal })),
      delay(COMPARISON_TIMEOUT_MS).then(() => ({
        code: null,
        signal: "comparison-timeout",
      })),
    ]);
    if (outcome.signal === "comparison-timeout") {
      await stopChildTree(comparison);
      throw new Error("pitch-preserving-v2-comparison-timeout");
    }
    if (outcome.code !== 0) {
      throw new Error("pitch-preserving-v2-comparison-failed");
    }
  } finally {
    if (comparison !== undefined) {
      await stopChildTree(comparison);
    }
    await stopChildTree(server);
  }
}

try {
  await run();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "pitch-preserving-v2-comparison-failed",
  );
  process.exitCode = 1;
}
process.exit(process.exitCode ?? 0);

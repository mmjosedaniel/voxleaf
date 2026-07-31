import console from "node:console";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { get } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const AUTHORITY_COMMIT_SHA = "41322294c62ff3e35aa08e9f3ead27ce38bfc84d";
const LOCAL_ORIGIN = "http://127.0.0.1:4175";
const SERVER_START_TIMEOUT_MS = 30_000;
const COMPARISON_TIMEOUT_MS = 20 * 60 * 1_000;
const candidateArgument = process.argv.find((argument) =>
  argument.startsWith("--candidate="),
);
const requestedCandidate = candidateArgument?.slice("--candidate=".length);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(desktopRoot, "..", "..");
const require = createRequire(import.meta.url);
const vitePackageRoot = path.dirname(require.resolve("vite/package.json"));
const playwrightPackageRoot = path.dirname(
  require.resolve("@playwright/test/package.json"),
);

function fail(code) {
  throw new Error(code);
}

function gitText(args) {
  const result = spawnSync("git.exe", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    fail("pitch-preserving-v3-git-authority-failed");
  }
  return result.stdout.trim();
}

function executionCommit() {
  const commit = gitText(["rev-parse", "HEAD"]);
  if (
    !/^[0-9a-f]{40}$/u.test(commit) ||
    commit === AUTHORITY_COMMIT_SHA ||
    gitText(["status", "--porcelain"]) !== ""
  ) {
    fail("pitch-preserving-v3-dirty-or-uncommitted-execution");
  }
  const ancestry = spawnSync(
    "git.exe",
    ["merge-base", "--is-ancestor", AUTHORITY_COMMIT_SHA, commit],
    {
      cwd: repositoryRoot,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  if (ancestry.status !== 0) {
    fail("pitch-preserving-v3-result-before-authority");
  }
  return commit;
}

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
      fail("pitch-preserving-v3-server-exited");
    }
    const available = await new Promise((resolve) => {
      const request = get(LOCAL_ORIGIN, (response) => {
        response.resume();
        resolve(response.statusCode !== undefined && response.statusCode < 500);
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
    await delay(100);
  }
  fail("pitch-preserving-v3-server-timeout");
}

async function run() {
  const commit = executionCommit();
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
        "playwright.pitch-preserving-v3.config.ts",
        "--grep",
        "measures the selected",
        "--workers=1",
      ],
      {
        env: {
          ...process.env,
          VOXLEAF_PLAYBACK_V3_AUTHORITY_COMMIT_SHA: AUTHORITY_COMMIT_SHA,
          VOXLEAF_PLAYBACK_V3_EXECUTION_COMMIT_SHA: commit,
          VOXLEAF_PLAYBACK_V3_LOCAL_ORIGIN: LOCAL_ORIGIN,
          ...(requestedCandidate === undefined
            ? {}
            : {
                VOXLEAF_PLAYBACK_V3_COMPARISON_CANDIDATE: requestedCandidate,
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
      fail("pitch-preserving-v3-comparison-timeout");
    }
    if (outcome.code !== 0) {
      fail("pitch-preserving-v3-comparison-failed");
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
      : "pitch-preserving-v3-comparison-failed",
  );
  process.exitCode = 1;
}
process.exit(process.exitCode ?? 0);

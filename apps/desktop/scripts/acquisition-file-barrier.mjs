import { spawn } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const script = fileURLToPath(
  new URL("./acquisition-file-barrier.ps1", import.meta.url),
);

// Test-host handles only: the ordinary installed executable is unchanged.
export function createAcquisitionFileBarrier(mode, path) {
  if (
    process.platform !== "win32" ||
    !["verification", "cleanup"].includes(mode)
  ) {
    throw new Error("acquisition-barrier-unsupported");
  }
  const child = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-WindowStyle",
      "Hidden",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script,
      "-Mode",
      mode,
      "-Path",
      path,
    ],
    { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] },
  );
  const signals = new Set();
  let pending = "";
  let exited = false;
  let exitCode;
  let closing;
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    pending += chunk;
    if (pending.length > 1024) {
      child.kill();
      return;
    }
    const lines = pending.split(/\r?\n/);
    pending = lines.pop();
    for (const line of lines) {
      if (line === "ready" || line === "reached") signals.add(line);
    }
  });
  child.stderr.resume();
  child.stdin.on("error", () => undefined);
  child.on("error", () => {
    exited = true;
  });
  child.on("exit", (code) => {
    exited = true;
    exitCode = code;
  });
  async function waitFor(signal, timeoutMs = 90_000) {
    const deadline = Date.now() + timeoutMs;
    while (!signals.has(signal)) {
      if (exited || Date.now() >= deadline)
        throw new Error(`acquisition-barrier-${signal}-failed`);
      await delay(10);
    }
  }
  return {
    waitFor,
    close() {
      closing ??= close();
      return closing;
    },
  };
  async function close() {
    child.stdin.end("release\n");
    for (let attempt = 0; attempt < 100 && !exited; attempt += 1)
      await delay(10);
    if (!exited) {
      child.kill();
      for (let attempt = 0; attempt < 100 && !exited; attempt += 1)
        await delay(10);
    }
    if (!exited) throw new Error("acquisition-barrier-cleanup-failed");
    return exitCode;
  }
}

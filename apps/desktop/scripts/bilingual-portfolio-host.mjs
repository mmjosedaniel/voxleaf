import console from "node:console";
import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const FIREWALL_RULE_NAME = "VoxLeaf TTS Benchmark Offline";
const PROFILE_ARGUMENT = "--profile=";
const LANGUAGE_ARGUMENT = "--language=";
const PREFLIGHT_ONLY_ARGUMENT = "--preflight-only";
const LIFECYCLE_ONLY_ARGUMENT = "--lifecycle-only";
const ARM_TIMEOUT_MS = 30 * 60 * 1_000;
const PROCESS_CLEANUP_TIMEOUT_MS = 15_000;
const RUNNER_CLEANUP_TIMEOUT_MS = 90_000;

export const PORTFOLIO_PLAYBACK_RATE_PERCENTS = Object.freeze([
  100, 95, 90, 85, 80, 75,
]);

export const BILINGUAL_PORTFOLIO_ARMS = Object.freeze([
  Object.freeze({
    profileId: "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1",
    language: "es",
    exercisePlaybackSpeeds: true,
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_PIPER_ENABLED",
      "VOXLEAF_TTS_PIPER_PYTHON",
      "VOXLEAF_TTS_PIPER_MODEL_ROOT",
    ]),
  }),
  Object.freeze({
    profileId: "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
    language: "en",
    exercisePlaybackSpeeds: true,
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_PIPER_EN_ENABLED",
      "VOXLEAF_TTS_PIPER_EN_PYTHON",
      "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
    ]),
  }),
  Object.freeze({
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    language: "es",
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_CHATTERBOX_ENABLED",
      "VOXLEAF_TTS_CHATTERBOX_PYTHON",
      "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
    ]),
  }),
  Object.freeze({
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    language: "en",
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_CHATTERBOX_ENABLED",
      "VOXLEAF_TTS_CHATTERBOX_PYTHON",
      "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
    ]),
  }),
  Object.freeze({
    profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8",
    language: "es",
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_DEV_ENABLED",
      "VOXLEAF_TTS_DEV_PYTHON",
      "VOXLEAF_TTS_DEV_MODEL_ROOT",
    ]),
  }),
  Object.freeze({
    profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8",
    language: "en",
    requiredEnvironment: Object.freeze([
      "VOXLEAF_TTS_DEV_ENABLED",
      "VOXLEAF_TTS_DEV_PYTHON",
      "VOXLEAF_TTS_DEV_MODEL_ROOT",
    ]),
  }),
]);

export function selectPortfolioArms(args) {
  const requestedProfile = args
    .find((argument) => argument.startsWith(PROFILE_ARGUMENT))
    ?.slice(PROFILE_ARGUMENT.length);
  const requestedLanguage = args
    .find((argument) => argument.startsWith(LANGUAGE_ARGUMENT))
    ?.slice(LANGUAGE_ARGUMENT.length);
  const selected = BILINGUAL_PORTFOLIO_ARMS.filter(
    ({ profileId, language }) =>
      (requestedProfile === undefined || profileId === requestedProfile) &&
      (requestedLanguage === undefined || language === requestedLanguage),
  );
  if (selected.length === 0) {
    throw new Error("Unknown bilingual portfolio profile or language.");
  }
  return Object.freeze([...selected]);
}

export function nativeRunnerArguments({
  profileId,
  language,
  exercisePlaybackSpeeds = false,
}) {
  const arguments_ = [
    `--operation-timeout-ms=${ARM_TIMEOUT_MS}`,
    "--adaptive-tts-exact-host",
    "--exercise-profile-switch",
    `--tts-profile=${profileId}`,
    `--tts-language=${language}`,
  ];
  if (exercisePlaybackSpeeds) {
    arguments_.push("--exercise-playback-speeds");
  }
  return Object.freeze(arguments_);
}

export function modelFreeLifecycleEnvironment(environment) {
  const sanitized = { ...environment };
  for (const { requiredEnvironment } of BILINGUAL_PORTFOLIO_ARMS) {
    for (const name of requiredEnvironment) {
      delete sanitized[name];
    }
  }
  return sanitized;
}

function powershellText(script) {
  const result = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      encoding: "utf8",
      windowsHide: true,
      timeout: PROCESS_CLEANUP_TIMEOUT_MS,
    },
  );
  if (result.status !== 0 || result.error) {
    throw new Error("Exact bilingual portfolio host inspection failed.");
  }
  return result.stdout.trim();
}

function encodedPowerShellString(value) {
  return Buffer.from(value, "utf16le").toString("base64");
}

function firewallBlockExists(executable) {
  const encodedExecutable = encodedPowerShellString(path.resolve(executable));
  const encodedRuleName = encodedPowerShellString(FIREWALL_RULE_NAME);
  const script = [
    `$target=[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${encodedExecutable}'))`,
    `$ruleName=[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${encodedRuleName}'))`,
    "$matches=@(Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Where-Object { $_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' -and $_.Action -eq 'Block' } | Get-NetFirewallApplicationFilter | Where-Object { [IO.Path]::GetFullPath($_.Program).Equals([IO.Path]::GetFullPath($target), [StringComparison]::OrdinalIgnoreCase) })",
    "[Console]::Out.Write($(if ($matches.Count -gt 0) { 'true' } else { 'false' }))",
  ].join("; ");
  return powershellText(script) === "true";
}

function processIdsForExecutable(executable) {
  const encodedExecutable = encodedPowerShellString(path.resolve(executable));
  const script = [
    `$target=[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${encodedExecutable}'))`,
    "$ids=@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and [IO.Path]::GetFullPath($_.ExecutablePath).Equals([IO.Path]::GetFullPath($target), [StringComparison]::OrdinalIgnoreCase) } | ForEach-Object { [int]$_.ProcessId })",
    "[Console]::Out.Write(($ids -join ','))",
  ].join("; ");
  const output = powershellText(script);
  if (output.length === 0) {
    return new Set();
  }
  return new Set(
    output.split(",").map((value) => {
      const processId = Number(value);
      if (!Number.isSafeInteger(processId) || processId <= 0) {
        throw new Error("Exact bilingual portfolio host inspection failed.");
      }
      return processId;
    }),
  );
}

function assertConfiguration(arms) {
  if (
    process.platform !== "win32" ||
    process.env.HF_HUB_OFFLINE !== "1" ||
    process.env.TRANSFORMERS_OFFLINE !== "1"
  ) {
    throw new Error("Exact bilingual portfolio configuration is unavailable.");
  }
  const checkedInterpreters = new Set();
  for (const { requiredEnvironment } of arms) {
    const [enabledKey, pythonKey, modelRootKey] = requiredEnvironment;
    const python = process.env[pythonKey];
    const modelRoot = process.env[modelRootKey];
    if (
      process.env[enabledKey] !== "1" ||
      !python ||
      !modelRoot ||
      !path.isAbsolute(python) ||
      !path.isAbsolute(modelRoot) ||
      !existsSync(python) ||
      !existsSync(modelRoot)
    ) {
      throw new Error(
        "Exact bilingual portfolio configuration is unavailable.",
      );
    }
    const resolvedPython = path.resolve(python);
    if (checkedInterpreters.has(resolvedPython)) {
      continue;
    }
    if (!firewallBlockExists(resolvedPython)) {
      throw new Error(
        "Exact bilingual portfolio network isolation is unavailable.",
      );
    }
    checkedInterpreters.add(resolvedPython);
  }
}

async function assertProcessCleanup(executable, baselineProcessIds) {
  const deadline = Date.now() + PROCESS_CLEANUP_TIMEOUT_MS;
  do {
    const current = processIdsForExecutable(executable);
    const retainedNewProcess = [...current].some(
      (processId) => !baselineProcessIds.has(processId),
    );
    if (!retainedNewProcess) {
      return;
    }
    await delay(250);
  } while (Date.now() < deadline);
  throw new Error("Exact bilingual portfolio process cleanup failed.");
}

export async function runPortfolioArm({
  runner,
  arguments_ = [],
  environment = process.env,
  timeoutMs = ARM_TIMEOUT_MS,
  assertCleanup = async () => undefined,
}) {
  const child = spawn(
    process.execPath,
    [runner, ...arguments_, `--operation-timeout-ms=${timeoutMs}`],
    {
      env: environment,
      stdio: ["ignore", "inherit", "inherit", "ipc"],
      windowsHide: true,
    },
  );
  let cleanupConfirmed = false;
  let supervisionFailure;
  child.on("message", (message) => {
    if (message?.type === "voxleaf-native-cleanup")
      cleanupConfirmed = message.ok === true;
  });
  // The operation deadline is cooperative. This later watchdog is only a
  // bounded failed-cleanup safeguard; it never turns uncertain cleanup into PASS.
  const watchdog = globalThis.setTimeout(() => {
    supervisionFailure = new Error(
      "Exact bilingual portfolio runner cleanup was not confirmed.",
    );
    child.kill();
  }, timeoutMs + RUNNER_CLEANUP_TIMEOUT_MS);
  let failure;
  try {
    const exitCode = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    if (supervisionFailure !== undefined) throw supervisionFailure;
    if (exitCode !== 0 || !cleanupConfirmed)
      throw new Error(
        "Exact bilingual portfolio runner failed or cleanup was not confirmed.",
      );
  } catch (error) {
    failure = error;
  } finally {
    globalThis.clearTimeout(watchdog);
  }
  try {
    await assertCleanup();
  } catch (error) {
    failure = new AggregateError(
      [...(failure === undefined ? [] : [failure]), error],
      "Exact bilingual portfolio process cleanup failed.",
    );
  }
  if (failure !== undefined) throw failure;
}

async function run() {
  const arms = selectPortfolioArms(process.argv.slice(2));
  const preflightOnly = process.argv.includes(PREFLIGHT_ONLY_ARGUMENT);
  const lifecycleOnly = process.argv.includes(LIFECYCLE_ONLY_ARGUMENT);
  if (preflightOnly && lifecycleOnly) {
    throw new Error("Exact bilingual portfolio mode is invalid.");
  }
  if (!lifecycleOnly) {
    assertConfiguration(arms);
  }
  if (preflightOnly) {
    console.log("Exact bilingual portfolio preflight passed.");
    return;
  }

  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const nativeRunner = path.join(scriptDirectory, "native-startup-smoke.mjs");
  if (lifecycleOnly) {
    await runPortfolioArm({
      runner: nativeRunner,
      environment: modelFreeLifecycleEnvironment(process.env),
    });
    console.log("Exact bilingual portfolio lifecycle matrix passed.");
    return;
  }
  for (const arm of arms) {
    const python = process.env[arm.requiredEnvironment[1]];
    const baselineProcessIds = processIdsForExecutable(python);
    await runPortfolioArm({
      runner: nativeRunner,
      arguments_: nativeRunnerArguments(arm).filter(
        (argument) => !argument.startsWith("--operation-timeout-ms="),
      ),
      assertCleanup: () => assertProcessCleanup(python, baselineProcessIds),
    });
  }
  console.log("Exact bilingual portfolio packaged matrix passed.");
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  pathToFileURL(path.resolve(invokedPath)).href === import.meta.url
) {
  try {
    await run();
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : "Exact bilingual portfolio packaged matrix failed.",
    );
    process.exitCode = 1;
  }
}

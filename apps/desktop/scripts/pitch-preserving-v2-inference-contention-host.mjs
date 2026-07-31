import console from "node:console";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(desktopRoot, "..", "..");
const EXACT_PIPER_CASE_ID = "es-v7-arrival";
const REPEATED_INFERENCE_UNITS = 1_000;
const MATRIX_TIMEOUT_MS = 15 * 60 * 1_000;

function fail() {
  throw new Error("pitch-preserving-v2-inference-contention-failed");
}

function requiredPath(name) {
  const value = process.env[name];
  if (value === undefined || !path.isAbsolute(value)) {
    fail();
  }
  return path.resolve(value);
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  child.stdin?.destroy();
  if (process.platform === "win32") {
    const cleanup = spawn(
      "taskkill.exe",
      ["/PID", String(child.pid), "/T", "/F"],
      { stdio: "ignore", windowsHide: true },
    );
    await Promise.race([once(cleanup, "exit"), delay(5_000)]);
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
}

async function repositoryAuthoredText() {
  const corpus = JSON.parse(
    await readFile(
      path.join(repositoryRoot, "benchmarks", "tts", "corpus-v7.json"),
      "utf8",
    ),
  );
  const listeningCase = corpus.cases?.find(
    (value) => value?.caseId === EXACT_PIPER_CASE_ID,
  );
  if (
    corpus.corpusVersion !== "tts-bilingual-corpus-v7" ||
    listeningCase?.language !== "es" ||
    typeof listeningCase.text !== "string"
  ) {
    fail();
  }
  return listeningCase.text;
}

async function run() {
  if (
    process.platform !== "win32" ||
    process.env.HF_HUB_OFFLINE !== "1" ||
    process.env.TRANSFORMERS_OFFLINE !== "1"
  ) {
    fail();
  }
  const python = requiredPath("VOXLEAF_TTS_PIPER_PYTHON");
  const piper = path.join(path.dirname(python), "piper.exe");
  const modelRoot = requiredPath("VOXLEAF_TTS_PIPER_MODEL_ROOT");
  const text = await repositoryAuthoredText();
  const inference = spawn(
    piper,
    [
      "--model",
      path.join(modelRoot, "es_ES-davefx-medium.onnx"),
      "--config",
      path.join(modelRoot, "es_ES-davefx-medium.onnx.json"),
      "--output-raw",
      "--length-scale",
      "1.0",
      "--noise-scale",
      "0.667",
      "--noise-w-scale",
      "0.8",
      "--volume",
      "1.0",
    ],
    {
      cwd: repositoryRoot,
      env: process.env,
      stdio: ["pipe", "ignore", "ignore"],
      windowsHide: true,
    },
  );
  const inferenceExited = once(inference, "exit").then(() => "inference-exit");
  try {
    inference.stdin?.end(
      `${Array(REPEATED_INFERENCE_UNITS).fill(text).join("\n")}\n`,
    );
    const warmState = await Promise.race([
      inferenceExited,
      delay(5_000).then(() => "ready"),
    ]);
    if (warmState !== "ready") {
      fail();
    }
    const matrix = spawn(
      process.execPath,
      [
        path.join(scriptDirectory, "native-startup-smoke.mjs"),
        "--pitch-preserving-v2",
      ],
      {
        cwd: desktopRoot,
        env: process.env,
        stdio: "inherit",
        windowsHide: true,
      },
    );
    const outcome = await Promise.race([
      once(matrix, "exit").then(([code]) => ({
        kind: "matrix-exit",
        code,
      })),
      inferenceExited.then(() => ({ kind: "inference-exit", code: null })),
      delay(MATRIX_TIMEOUT_MS, undefined, { ref: false }).then(() => ({
        kind: "timeout",
        code: null,
      })),
    ]);
    if (outcome.kind !== "matrix-exit" || outcome.code !== 0) {
      await stopChild(matrix);
      fail();
    }
    console.log(
      "Pitch-preserving v2 inference-contention matrix completed with one local Piper CPU process and one sequential stretcher.",
    );
  } finally {
    await stopChild(inference);
  }
}

try {
  await run();
} catch {
  console.error("Pitch-preserving v2 inference-contention matrix failed.");
  process.exitCode = 1;
}

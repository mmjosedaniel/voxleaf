import console from "node:console";
import { randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { get } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { chromium } from "@playwright/test";

const AUTHORITY_COMMIT_SHA = "41322294c62ff3e35aa08e9f3ead27ce38bfc84d";
const LOCAL_ORIGIN = "http://127.0.0.1:4176";
const CASE_IDS = Object.freeze([
  "es-v7-arrival",
  "es-v7-dialogue",
  "en-v7-arrival",
  "en-v7-dialogue",
]);
const CANDIDATE_IDS = new Set([
  "html-media-element-preserves-pitch-wav-boundary-v3",
  "repository-incremental-audio-worklet-wsola-boundary-v3",
]);
const SESSION_TIMEOUT_MS = 60 * 60 * 1_000;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(desktopRoot, "..", "..");
const publicSessionRoot = path.join(
  desktopRoot,
  "public",
  "playback-v3-listening",
);
const resultRoot = path.join(repositoryRoot, "temp");
const require = createRequire(import.meta.url);
const vitePackageRoot = path.dirname(require.resolve("vite/package.json"));

function fail(code) {
  throw new Error(`pitch-preserving-v3-listening-${code}`);
}

function git(...arguments_) {
  const result = spawnSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    fail("lineage");
  }
  return result.stdout.trim();
}

function executionCommit() {
  if (git("status", "--porcelain") !== "") {
    fail("dirty-tree");
  }
  const execution = git("rev-parse", "HEAD");
  const ancestry = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", AUTHORITY_COMMIT_SHA, execution],
    { cwd: repositoryRoot, windowsHide: true },
  );
  if (ancestry.status !== 0 || execution === AUTHORITY_COMMIT_SHA) {
    fail("lineage");
  }
  return execution;
}

function requiredPath(name) {
  const value = process.env[name];
  if (value === undefined || !path.isAbsolute(value)) {
    fail("configuration");
  }
  return path.resolve(value);
}

function modelFor(language) {
  const root = requiredPath(
    language === "es"
      ? "VOXLEAF_TTS_PIPER_MODEL_ROOT"
      : "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
  );
  const stem = language === "es" ? "es_ES-davefx-medium" : "en_US-joe-medium";
  return Object.freeze({
    config: path.join(root, `${stem}.onnx.json`),
    model: path.join(root, `${stem}.onnx`),
  });
}

function piperExecutable() {
  const python = requiredPath("VOXLEAF_TTS_PIPER_PYTHON");
  return path.join(path.dirname(python), "piper.exe");
}

function synthesize(piper, listeningCase, inputPath, outputPath) {
  const model = modelFor(listeningCase.language);
  const result = spawnSync(
    piper,
    [
      "--model",
      model.model,
      "--config",
      model.config,
      "--input-file",
      inputPath,
      "--output-file",
      outputPath,
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
      env: process.env,
      stdio: "ignore",
      timeout: 120_000,
      windowsHide: true,
    },
  );
  if (result.status !== 0 || result.error !== undefined) {
    fail("synthesis");
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      fail("server");
    }
    const ready = await new Promise((resolve) => {
      const request = get(
        `${LOCAL_ORIGIN}/pitch-preserving-v3-listening.html`,
        (response) => {
          response.resume();
          resolve(response.statusCode === 200);
        },
      );
      request.setTimeout(1_000, () => {
        request.destroy();
        resolve(false);
      });
      request.once("error", () => resolve(false));
    });
    if (ready) {
      return;
    }
    await delay(100);
  }
  fail("server");
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  const cleanup = spawn(
    "taskkill.exe",
    ["/PID", String(child.pid), "/T", "/F"],
    { stdio: "ignore", windowsHide: true },
  );
  await Promise.race([once(cleanup, "exit"), delay(5_000)]);
}

function validateResult(value, sessionId, executionCommitSha) {
  if (
    value?.schemaVersion !== "voxleaf-playback-listening-result-v3" ||
    value.sessionId !== sessionId ||
    value.authorityCommitSha !== AUTHORITY_COMMIT_SHA ||
    value.executionCommitSha !== executionCommitSha ||
    value.evaluatorCountByLanguage?.es !== 1 ||
    value.evaluatorCountByLanguage?.en !== 1 ||
    !Array.isArray(value.ratings) ||
    value.ratings.length !== 24
  ) {
    fail("result");
  }
  const keys = new Set();
  for (const rating of value.ratings) {
    const key = `${rating.candidateId}:${rating.caseId}:${String(rating.ratePercent)}`;
    if (
      !CANDIDATE_IDS.has(rating.candidateId) ||
      !CASE_IDS.includes(rating.caseId) ||
      !["es", "en"].includes(rating.language) ||
      ![100, 85, 75].includes(rating.ratePercent) ||
      typeof rating.omittedOrRepeatedWords !== "boolean" ||
      rating.scores === null ||
      typeof rating.scores !== "object" ||
      !["intelligibility", "naturalness", "artifacts"].every(
        (field) =>
          Number.isInteger(rating.scores[field]) &&
          rating.scores[field] >= 1 &&
          rating.scores[field] <= 5,
      ) ||
      keys.has(key)
    ) {
      fail("result");
    }
    keys.add(key);
  }
  return value;
}

async function prepareSession(executionCommitSha) {
  const corpus = JSON.parse(
    await readFile(
      path.join(repositoryRoot, "benchmarks", "tts", "corpus-v7.json"),
      "utf8",
    ),
  );
  const byId = new Map(corpus.cases.map((value) => [value.caseId, value]));
  const cases = CASE_IDS.map((caseId) => byId.get(caseId));
  if (
    corpus.corpusVersion !== "tts-bilingual-corpus-v7" ||
    cases.some(
      (value) =>
        value === undefined ||
        typeof value.text !== "string" ||
        !["es", "en"].includes(value.language),
    )
  ) {
    fail("corpus");
  }
  await rm(publicSessionRoot, { force: true, recursive: true });
  await mkdir(publicSessionRoot, { recursive: true });
  const piper = piperExecutable();
  const manifestCases = [];
  for (const listeningCase of cases) {
    const inputPath = path.join(
      publicSessionRoot,
      `${listeningCase.caseId}.txt`,
    );
    const outputName = `${listeningCase.caseId}.wav`;
    const outputPath = path.join(publicSessionRoot, outputName);
    await writeFile(inputPath, `${listeningCase.text}\n`, "utf8");
    synthesize(piper, listeningCase, inputPath, outputPath);
    await rm(inputPath, { force: true });
    manifestCases.push({
      audioPath: `/playback-v3-listening/${outputName}`,
      caseId: listeningCase.caseId,
      language: listeningCase.language,
      text: listeningCase.text,
    });
  }
  const sessionId = randomBytes(16).toString("hex");
  await writeFile(
    path.join(publicSessionRoot, "manifest.json"),
    `${JSON.stringify(
      {
        authorityCommitSha: AUTHORITY_COMMIT_SHA,
        executionCommitSha,
        schemaVersion: "voxleaf-playback-listening-manifest-v3",
        sessionId,
        cases: manifestCases,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return sessionId;
}

async function run() {
  if (
    process.platform !== "win32" ||
    process.env.HF_HUB_OFFLINE !== "1" ||
    process.env.TRANSFORMERS_OFFLINE !== "1"
  ) {
    fail("offline");
  }
  const executionCommitSha = executionCommit();
  const sessionId = await prepareSession(executionCommitSha);
  const server = spawn(
    process.execPath,
    [
      path.join(vitePackageRoot, "bin", "vite.js"),
      "--host",
      "127.0.0.1",
      "--port",
      "4176",
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      env: process.env,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  let browser;
  try {
    await waitForServer(server);
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      acceptDownloads: false,
      locale: "en-US",
      serviceWorkers: "block",
    });
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (
        ["127.0.0.1", "localhost"].includes(url.hostname) ||
        ["blob:", "data:"].includes(url.protocol)
      ) {
        await route.continue();
        return;
      }
      await route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    const result = new Promise((resolve) => {
      void page.exposeFunction(
        "__voxleafSubmitPitchPreservingListeningV3",
        (value) => {
          resolve(validateResult(value, sessionId, executionCommitSha));
        },
      );
    });
    await page.goto(`${LOCAL_ORIGIN}/pitch-preserving-v3-listening.html`);
    const completed = await Promise.race([
      result,
      delay(SESSION_TIMEOUT_MS, undefined, { ref: false }).then(() =>
        fail("timeout"),
      ),
    ]);
    await mkdir(resultRoot, { recursive: true });
    const resultPath = path.join(
      resultRoot,
      `playback-v3-listening-result-${sessionId}.json`,
    );
    await writeFile(resultPath, `${JSON.stringify(completed, null, 2)}\n`);
    console.log(
      `Pitch-preserving v3 listening result ready: ${path.relative(
        repositoryRoot,
        resultPath,
      )}`,
    );
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
    await stopChild(server);
    await rm(publicSessionRoot, { force: true, recursive: true });
  }
}

try {
  await run();
} catch {
  console.error("Pitch-preserving v3 listening session failed.");
  process.exitCode = 1;
  await rm(publicSessionRoot, { force: true, recursive: true });
}

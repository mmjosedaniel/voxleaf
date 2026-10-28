import console from "node:console";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, open, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";
import {
  nativeSmokeInvariantFailureCode,
  resolveNativeSmokeExecutable,
} from "./native-smoke-invariants.mjs";
import { createNativeReaderScenarios } from "./native-smoke/reader-scenarios.mjs";
import { createNativeResourceObservation } from "./native-smoke/resource-observation.mjs";
import { createNativeTtsScenarios } from "./native-smoke/tts-scenarios.mjs";
import { buildOrientedRasterEpubFixture } from "../tests/fixtures/oriented-raster-epub-fixture.mjs";
import {
  syntheticNarrationSentences,
  chatterboxPlaybackSpeedParagraph,
} from "./native-smoke/narration-fixture.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const executablePath = resolveNativeSmokeExecutable(
  process.argv.slice(2),
  path.join(
    desktopRoot,
    "src-tauri",
    "target",
    "release",
    "voxleaf-desktop.exe",
  ),
);
const STARTUP_TIMEOUT_MS = 90_000;
const OPTIONAL_PROFILE_SELECTION_TIMEOUT_MS = 180_000;
const OPTIONAL_PROFILE_VERIFICATION_TIMEOUT_MS = 300_000;
const INTERACTION_TIMEOUT_MS = 15_000;
const OBSERVATION_WINDOW_MS = 500;
const READER_PERFORMANCE_MODE = process.argv.includes("--reader-performance");
const ADAPTIVE_TTS_EXACT_HOST_MODE = process.argv.includes(
  "--adaptive-tts-exact-host",
);
const EXERCISE_EXACT_HOST_PROFILE_SWITCH = process.argv.includes(
  "--exercise-profile-switch",
);
const EXERCISE_PLAYBACK_SPEEDS = process.argv.includes(
  "--exercise-playback-speeds",
);
const EXERCISE_READER_CORRECTIONS = process.argv.includes(
  "--exercise-reader-corrections",
);
const ADAPTIVE_TTS_PROFILE_ARGUMENT = "--tts-profile=";
const ADAPTIVE_TTS_LANGUAGE_ARGUMENT = "--tts-language=";
const EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT =
  "--allow-profile-unavailable-reason=";
const EXACT_QWEN_SERENA_PROFILE_ID =
  "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8";
const EXACT_QWEN_AIDEN_PROFILE_ID =
  "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
const PIPER_CPU_FALLBACK_PROFILE_ID =
  "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
const PIPER_ENGLISH_CPU_PROFILE_ID = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
const CHATTERBOX_BILINGUAL_PROFILE_ID =
  "chatterbox-multilingual-v3-cuda-bf16-default-v4";
const EXACT_HOST_TTS_PROFILE_LANGUAGES = new Map([
  [EXACT_QWEN_SERENA_PROFILE_ID, Object.freeze(["es"])],
  [EXACT_QWEN_AIDEN_PROFILE_ID, Object.freeze(["en"])],
  [PIPER_CPU_FALLBACK_PROFILE_ID, Object.freeze(["es"])],
  [PIPER_ENGLISH_CPU_PROFILE_ID, Object.freeze(["en"])],
  [CHATTERBOX_BILINGUAL_PROFILE_ID, Object.freeze(["es", "en"])],
]);
const adaptiveTtsProfileArgument = process.argv.find((argument) =>
  argument.startsWith(ADAPTIVE_TTS_PROFILE_ARGUMENT),
);
const ADAPTIVE_TTS_PROFILE_ID =
  adaptiveTtsProfileArgument?.slice(ADAPTIVE_TTS_PROFILE_ARGUMENT.length) ??
  EXACT_QWEN_SERENA_PROFILE_ID;
const adaptiveTtsLanguageArgument = process.argv.find((argument) =>
  argument.startsWith(ADAPTIVE_TTS_LANGUAGE_ARGUMENT),
);
const ADAPTIVE_TTS_LANGUAGE =
  adaptiveTtsLanguageArgument?.slice(ADAPTIVE_TTS_LANGUAGE_ARGUMENT.length) ??
  EXACT_HOST_TTS_PROFILE_LANGUAGES.get(ADAPTIVE_TTS_PROFILE_ID)?.[0];
const expectedUnavailableReasonArgument = process.argv.find((argument) =>
  argument.startsWith(EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT),
);
const EXPECTED_UNAVAILABLE_PROFILE_REASON =
  expectedUnavailableReasonArgument?.slice(
    EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT.length,
  );
if (
  ADAPTIVE_TTS_EXACT_HOST_MODE &&
  !EXACT_HOST_TTS_PROFILE_LANGUAGES.get(ADAPTIVE_TTS_PROFILE_ID)?.includes(
    ADAPTIVE_TTS_LANGUAGE,
  )
) {
  throw new Error("Unknown exact-host TTS profile or language.");
}
if (EXERCISE_EXACT_HOST_PROFILE_SWITCH && !ADAPTIVE_TTS_EXACT_HOST_MODE) {
  throw new Error("Exact-host profile switching requires adaptive TTS mode.");
}
if (EXERCISE_PLAYBACK_SPEEDS && !ADAPTIVE_TTS_EXACT_HOST_MODE) {
  throw new Error("Playback-speed exercise requires adaptive TTS mode.");
}
if (
  EXPECTED_UNAVAILABLE_PROFILE_REASON !== undefined &&
  (!ADAPTIVE_TTS_EXACT_HOST_MODE ||
    ![EXACT_QWEN_SERENA_PROFILE_ID, EXACT_QWEN_AIDEN_PROFILE_ID].includes(
      ADAPTIVE_TTS_PROFILE_ID,
    ) ||
    EXPECTED_UNAVAILABLE_PROFILE_REASON !== "available-dedicated-vram")
) {
  throw new Error("Unknown exact-host unavailable-profile expectation.");
}
const MEBIBYTE = 1_048_576;
const MAX_LOCAL_EPUB_FILE_BYTES = 100 * MEBIBYTE;
const NATIVE_BATCH_SCRIPT_LIMIT_MS = 16;
const NATIVE_TARGET_READY_LIMIT_MS = 1_000;
const NATIVE_TOTAL_RENDER_LIMIT_MS = 1_000;
const NATIVE_REFLOW_LIMIT_MS = 250;
const NATIVE_LIVE_DOM_NODE_LIMIT = 80_000;
const NATIVE_COMBINED_WORKING_SET_LIMIT_BYTES = 208 * MEBIBYTE;
const NATIVE_RESOURCE_STRESS_CYCLES = 6;
const NATIVE_RESOURCE_HEAP_GROWTH_LIMIT_BYTES = 8 * MEBIBYTE;
const NATIVE_RESOURCE_WORKING_SET_GROWTH_LIMIT_BYTES = 32 * MEBIBYTE;
const SYNTHETIC_SENTENCE_TRANSITION_PAUSE_MS = 300;
const WEBDRIVER_TAB = "\uE004";
const WEBDRIVER_ENTER = "\uE007";
const WEBDRIVER_SPACE = "\uE00D";
const WEBDRIVER_PAGE_DOWN = "\uE00F";
const WEBDRIVER_END = "\uE010";
const FIXED_FAILURE_CODES = new Map([
  ["Tauri WebDriver exited before startup.", "tauri-driver-exited"],
  ["Tauri WebDriver did not become ready.", "tauri-driver-timeout"],
  [
    "Native synthetic publication did not open.",
    "synthetic-publication-open-failed",
  ],
  [
    "Native publication raster image did not decode from a local object URL.",
    "synthetic-image-decode-failed",
  ],
  [
    "Native application did not clear the synthetic file selection.",
    "synthetic-selection-not-cleared",
  ],
  [
    "Native application exposed the synthetic fixture filename.",
    "synthetic-filename-exposed",
  ],
  [
    "Native application did not preserve the publication after picker cancellation.",
    "native-picker-cancellation-failed",
  ],
  [
    "Native application did not replace the ready publication.",
    "native-publication-replacement-failed",
  ],
  [
    "Native application did not reselect the same local file.",
    "native-same-file-reselection-failed",
  ],
  [
    "Native application did not cancel the stale local file read.",
    "native-file-read-cancellation-failed",
  ],
  [
    "Native application rejected the exact local file-size boundary before EPUB validation.",
    "native-exact-file-size-failed",
  ],
  [
    "Native application did not reject the local file-size maximum plus one.",
    "native-over-limit-file-size-failed",
  ],
  [
    "Native application did not recover after local file-ingress failures.",
    "native-file-ingress-recovery-failed",
  ],
  [
    "Native publication raster image remained mounted after close.",
    "synthetic-image-not-released",
  ],
  [
    "Native application did not persist the synthetic continuation locator.",
    "synthetic-position-not-persisted",
  ],
  [
    "Native application did not restore the synthetic continuation locator.",
    "synthetic-position-not-restored",
  ],
  [
    "Native saved-position restoration moved keyboard focus.",
    "synthetic-restoration-focus-moved",
  ],
  [
    "Native saved-position restoration remained pending.",
    "synthetic-restoration-pending",
  ],
  [
    "Native saved-position restoration reached an unexpected safe state.",
    "synthetic-restoration-unexpected-state",
  ],
  [
    "Native reader did not fit the approved narrow viewport.",
    "synthetic-narrow-layout-failed",
  ],
  [
    "Native reader skip or return navigation was not keyboard operable.",
    "synthetic-keyboard-skip-failed",
  ],
  [
    "Native reader did not preserve native scrolling-key behavior.",
    "synthetic-native-scroll-key-failed",
  ],
  [
    "Native reader navigation was not keyboard operable.",
    "synthetic-keyboard-navigation-failed",
  ],
  [
    "Native reader controls did not expose the approved keyboard order.",
    "synthetic-keyboard-order-failed",
  ],
  [
    "Native reader accessibility media behavior was unavailable.",
    "synthetic-accessibility-media-failed",
  ],
  [
    "Native reader zoom behavior was unavailable.",
    "synthetic-zoom-layout-failed",
  ],
  [
    "Native reader preferences were not persisted or restored.",
    "synthetic-preferences-not-restored",
  ],
  [
    "Native synchronization feasibility proof failed.",
    "synchronization-feasibility-failed",
  ],
  [
    "Native synchronized narration proof failed.",
    "synchronized-narration-proof-failed",
  ],
  [
    "Native synchronized narration cleanup failed.",
    "synchronized-narration-cleanup-failed",
  ],
  [
    "Native generated audio persistence was detected.",
    "generated-audio-persistence-detected",
  ],
  [
    "Native reader performance metrics were unavailable.",
    "reader-performance-metrics-unavailable",
  ],
  [
    "Native reader exceeded the approved performance limits.",
    "reader-performance-limit-exceeded",
  ],
  [
    "Native reader resources remained active after close.",
    "reader-resource-release-failed",
  ],
  [
    "Native over-limit reader recovery failed.",
    "reader-over-limit-recovery-failed",
  ],
  ["Native application root did not mount.", "application-root-not-mounted"],
  [
    "Native application main landmark is not visible.",
    "application-main-not-visible",
  ],
  [
    "Native application emitted a page or console error.",
    "application-runtime-error",
  ],
  [
    "Native application attempted an external request.",
    "external-request-observed",
  ],
  [
    "Native TTS protocol probe did not deliver bounded binary audio.",
    "tts-protocol-probe-failed",
  ],
  [
    "Native TTS protocol probe response was invalid.",
    "tts-protocol-probe-response-invalid",
  ],
  [
    "Native TTS protocol probe command was unavailable.",
    "tts-protocol-probe-unavailable",
  ],
  [
    "Native TTS protocol probe returned a serialized array.",
    "tts-protocol-probe-serialized-array",
  ],
  [
    "Native TTS protocol probe returned an unknown binary object.",
    "tts-protocol-probe-unknown-binary",
  ],
  [
    "Native TTS protocol probe returned an unsupported binary view.",
    "tts-protocol-probe-unsupported-view",
  ],
  [
    "Native TTS supervisor host matrix failed.",
    "tts-supervisor-host-matrix-failed",
  ],
  [
    "Native TTS service lifecycle probe failed.",
    "tts-service-lifecycle-probe-failed",
  ],
  ["Native driver logs were invalid.", "native-driver-log-invalid"],
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const {
  rounded,
  percentile95,
  generatedAudioFileCount,
  memoryDelta,
  processWorkingSetBytes,
  nativeMemorySnapshot,
  nvidiaSnapshot,
  waitForAdaptiveResourceCleanup,
  startAdaptiveResourceSampler,
  installNativeResourceInstrumentation,
  nativeResourceInstrumentation,
  inspectPerformanceLogs,
} = createNativeResourceObservation({
  assert,
  INTERACTION_TIMEOUT_MS,
  MEBIBYTE,
});

const {
  runAdaptiveTtsExactHostMatrix,
  selectAdaptiveTtsProfile,
  exerciseNarrationLanguagePreference,
  exerciseNativeTtsProtocolProbe,
  exerciseNativeTtsServiceLifecycle,
} = createNativeTtsScenarios({
  assert,
  waitForCondition,
  openReaderSettings,
  closeReaderSettings,
  injectNativeFile,
  ADAPTIVE_TTS_LANGUAGE,
  ADAPTIVE_TTS_PROFILE_ID,
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXERCISE_PLAYBACK_SPEEDS,
  EXERCISE_READER_CORRECTIONS,
  EXPECTED_UNAVAILABLE_PROFILE_REASON,
  INTERACTION_TIMEOUT_MS,
  OPTIONAL_PROFILE_SELECTION_TIMEOUT_MS,
  OPTIONAL_PROFILE_VERIFICATION_TIMEOUT_MS,
  STARTUP_TIMEOUT_MS,
  SYNTHETIC_SENTENCE_TRANSITION_PAUSE_MS,
  WEBDRIVER_SPACE,
  generatedAudioFileCount,
  inspectPerformanceLogs,
  nvidiaSnapshot,
  percentile95,
  processWorkingSetBytes,
  rounded,
  startAdaptiveResourceSampler,
  waitForAdaptiveResourceCleanup,
});

const {
  observeSavedPositionRestoration,
  exerciseNativeReaderInteractionMatrix,
  exerciseNativeSynchronizationFeasibility,
  replaceNativePublicationForCleanup,
  runNativeReaderPerformanceBenchmark,
} = createNativeReaderScenarios({
  assert,
  waitForCondition,
  openReaderSettings,
  closeReaderSettings,
  openReaderContents,
  closeReaderContents,
  injectNativeFile,
  INTERACTION_TIMEOUT_MS,
  NATIVE_BATCH_SCRIPT_LIMIT_MS,
  NATIVE_COMBINED_WORKING_SET_LIMIT_BYTES,
  NATIVE_LIVE_DOM_NODE_LIMIT,
  NATIVE_REFLOW_LIMIT_MS,
  NATIVE_RESOURCE_HEAP_GROWTH_LIMIT_BYTES,
  NATIVE_RESOURCE_STRESS_CYCLES,
  NATIVE_RESOURCE_WORKING_SET_GROWTH_LIMIT_BYTES,
  NATIVE_TARGET_READY_LIMIT_MS,
  NATIVE_TOTAL_RENDER_LIMIT_MS,
  OBSERVATION_WINDOW_MS,
  STARTUP_TIMEOUT_MS,
  WEBDRIVER_END,
  WEBDRIVER_ENTER,
  WEBDRIVER_PAGE_DOWN,
  WEBDRIVER_SPACE,
  WEBDRIVER_TAB,
  inspectPerformanceLogs,
  installNativeResourceInstrumentation,
  memoryDelta,
  nativeMemorySnapshot,
  nativeResourceInstrumentation,
  rounded,
});

function failureCode(error) {
  if (error instanceof WebDriverClientError) {
    return error.code;
  }
  const invariantCode = nativeSmokeInvariantFailureCode(error);
  if (invariantCode !== undefined) {
    return invariantCode;
  }
  if (!(error instanceof Error)) {
    return "unexpected-error";
  }
  return FIXED_FAILURE_CODES.get(error.message) ?? "unexpected-error";
}

async function openReaderSettings(driver) {
  const opened = await driver.execute(
    `const button = Array.from(document.querySelectorAll("button")).find(
       (candidate) => candidate.textContent?.trim() === "Settings",
     );
     if (!(button instanceof HTMLButtonElement)) {
       return false;
     }
     button.click();
     return true;`,
  );
  assert(opened === true, "Native reader Settings were unavailable.");
  await waitForCondition(
    driver,
    `return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;`,
  );
}

async function closeReaderSettings(driver) {
  const closed = await driver.execute(
    `const button = Array.from(document.querySelectorAll("button")).find(
       (candidate) => candidate.textContent?.trim() === "Close Settings",
     );
     if (!(button instanceof HTMLButtonElement)) {
       return false;
     }
     button.click();
     return true;`,
  );
  assert(closed === true, "Native reader Settings could not be closed.");
  await waitForCondition(
    driver,
    `return document.querySelector('[role="dialog"][aria-modal="true"]') === null;`,
  );
}

async function openReaderContents(driver) {
  const opened = await driver.execute(
    `const button = Array.from(document.querySelectorAll("button")).find(
       (candidate) =>
         candidate.textContent?.trim() === "Show table of contents",
     );
     if (!(button instanceof HTMLButtonElement)) {
       return false;
     }
     button.click();
     return true;`,
  );
  assert(opened === true, "Native reader table of contents was unavailable.");
  await waitForCondition(
    driver,
    `return document.querySelector(
       'nav.reader-toc[aria-label="Table of contents"]:not([hidden])',
     ) !== null;`,
  );
}

async function closeReaderContents(driver) {
  const contentsOpen = await driver.execute(
    `return document.querySelector(
       'nav.reader-toc[aria-label="Table of contents"]:not([hidden])',
     ) !== null;`,
  );
  if (contentsOpen !== true) {
    return;
  }
  const closed = await driver.execute(
    `const button = Array.from(document.querySelectorAll("button")).find(
       (candidate) => candidate.textContent?.trim() === "Close contents",
     );
     if (!(button instanceof HTMLButtonElement)) {
       return false;
     }
     button.click();
     return true;`,
  );
  assert(closed === true, "Native reader table of contents could not close.");
  await waitForCondition(
    driver,
    `return document.querySelector(
       'nav.reader-toc[aria-label="Table of contents"]:not([hidden])',
     ) === null;`,
  );
}

async function reserveLoopbackPort() {
  const { createServer } = await import("node:net");
  const server = createServer();
  server.unref();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  assert(
    typeof address === "object" && address !== null,
    "Native startup smoke could not reserve a loopback port.",
  );
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

async function resolveExecutablePath(executable) {
  if (path.isAbsolute(executable)) {
    return executable;
  }

  const searchDirectories = [
    desktopRoot,
    ...(process.env.PATH ?? "")
      .split(path.delimiter)
      .map((directory) => directory.replace(/^"|"$/gu, ""))
      .filter((directory) => directory.length > 0),
  ];

  for (const directory of searchDirectories) {
    const candidate = path.resolve(directory, executable);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue through the bounded PATH entries.
    }
  }

  return executable;
}

async function waitForDriver(endpoint, child, spawnState) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  const readinessClient = new WebDriverClient(endpoint, {
    requestTimeoutMs: 500,
  });

  while (Date.now() < deadline) {
    if (spawnState.failed || child.exitCode !== null) {
      throw new Error("Tauri WebDriver exited before startup.");
    }

    if (await readinessClient.isReady()) {
      return;
    }

    await delay(100);
  }

  throw new Error("Tauri WebDriver did not become ready.");
}

async function waitForCondition(
  driver,
  script,
  timeoutMs = STARTUP_TIMEOUT_MS,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if ((await driver.execute(script)) === true) {
      return;
    }
    await delay(100);
  }

  throw new WebDriverClientError("webdriver-condition-timeout");
}

async function exerciseNativeTtsSupervisorHost() {
  await new Promise((resolve, reject) => {
    execFile(
      executablePath,
      ["--voxleaf-tts-service-supervisor-host"],
      {
        timeout: 30_000,
        windowsHide: true,
      },
      (error) => {
        if (error === null) {
          resolve();
          return;
        }
        reject(new Error("Native TTS supervisor host matrix failed."));
      },
    );
  });
}

async function createSizedDisposableFile(filePath, byteLength) {
  const handle = await open(filePath, "wx");
  try {
    await handle.truncate(byteLength);
  } finally {
    await handle.close();
  }
}

async function injectNativeFile(driver, filePath) {
  const fileInput = await driver.findElement('input[type="file"]');
  await driver.sendKeys(fileInput, filePath);
}

async function waitForReadyPublication(driver, title) {
  await waitForCondition(
    driver,
    `const title = document.querySelector("#publication-title");
     const reader = document.querySelector(".semantic-reader");
     const shell = document.querySelector(".shell-card");
     const status = document.querySelector('[role="status"]')?.textContent ?? "";
     return title?.textContent === ${JSON.stringify(title)} &&
       reader !== null &&
       reader.getAttribute("aria-busy") !== "true" &&
       shell?.getAttribute("aria-busy") !== "true" &&
       status !== "Validating and opening the selected EPUB." &&
       status !== "Restoring saved reader state.";`,
  );
}

async function assertNativeFilePrivacy(driver, disposableNames) {
  const observation = await driver.execute(
    `const names = ${JSON.stringify(disposableNames)};
     const text = document.body.textContent ?? "";
     return {
       inputCleared:
         document.querySelector('input[type="file"]')?.value === "",
       namesHidden: names.every((name) => !text.includes(name)),
     };`,
  );
  assert(
    observation?.inputCleared === true,
    "Native application did not clear the synthetic file selection.",
  );
  assert(
    observation?.namesHidden === true,
    "Native application exposed the synthetic fixture filename.",
  );
}

async function exerciseNativeFileIngressMatrix(driver, fixturePaths, setStage) {
  setStage("native same-file reselection setup");
  const originalImageSource = await driver.execute(
    `return document.querySelector('img[alt="Synthetic cover"]')?.src ?? "";`,
  );
  assert(
    typeof originalImageSource === "string" &&
      originalImageSource.startsWith("blob:"),
    "Native application did not reselect the same local file.",
  );
  await driver.execute(
    `const originalRevoke = URL.revokeObjectURL.bind(URL);
     const state = {
       originalRevoke,
       revoked: [],
     };
     URL.revokeObjectURL = (source) => {
       state.revoked.push(String(source));
       originalRevoke(source);
     };
     globalThis.__voxleafNativeReselection = state;
     return true;`,
  );

  setStage("native same-file reselection");
  await injectNativeFile(driver, fixturePaths.primary);
  await waitForReadyPublication(driver, "Synthetic EPUB version equivalence");
  await driver.execute(
    `document.querySelector(".semantic-raster-host")
       ?.scrollIntoView({ block: "center" });
     return true;`,
  );
  await waitForCondition(
    driver,
    `const image = document.querySelector('img[alt="Synthetic cover"]');
     return image?.src.startsWith("blob:") === true &&
       image.src !== ${JSON.stringify(originalImageSource)};`,
  );
  const reselectionObservation = await driver.execute(
    `const state = globalThis.__voxleafNativeReselection;
     const image = document.querySelector('img[alt="Synthetic cover"]');
     const observation = {
       oldSourceRevoked:
         state?.revoked?.includes(${JSON.stringify(originalImageSource)}) === true,
       replacementSourceCreated:
         image?.src.startsWith("blob:") === true &&
         image.src !== ${JSON.stringify(originalImageSource)},
     };
     if (state?.originalRevoke !== undefined) {
       URL.revokeObjectURL = state.originalRevoke;
     }
     delete globalThis.__voxleafNativeReselection;
     return observation;`,
  );
  assert(
    reselectionObservation?.oldSourceRevoked === true &&
      reselectionObservation.replacementSourceCreated === true,
    "Native application did not reselect the same local file.",
  );

  setStage("native picker cancellation");
  const beforePickerCancellation = await driver.execute(
    `return {
       imageSource:
         document.querySelector('img[alt="Synthetic cover"]')?.src ?? "",
       status: document.querySelector('[role="status"]')?.textContent ?? "",
       title: document.querySelector("#publication-title")?.textContent ?? "",
     };`,
  );
  await driver.execute(
    `document.querySelector('input[type="file"]')
       ?.dispatchEvent(new Event("cancel", { bubbles: true }));
     return true;`,
  );
  await delay(100);
  const afterPickerCancellation = await driver.execute(
    `return {
       imageSource:
         document.querySelector('img[alt="Synthetic cover"]')?.src ?? "",
       status: document.querySelector('[role="status"]')?.textContent ?? "",
       title: document.querySelector("#publication-title")?.textContent ?? "",
     };`,
  );
  assert(
    beforePickerCancellation?.title === "Synthetic EPUB version equivalence" &&
      afterPickerCancellation?.title === beforePickerCancellation.title &&
      afterPickerCancellation.status === beforePickerCancellation.status &&
      afterPickerCancellation.imageSource ===
        beforePickerCancellation.imageSource,
    "Native application did not preserve the publication after picker cancellation.",
  );

  setStage("native ready publication replacement");
  await injectNativeFile(driver, fixturePaths.replacement);
  await waitForReadyPublication(driver, "Synthetic minimal publication");
  assert(
    (await driver.execute(
      `return document.querySelector(".semantic-document h1")
         ?.textContent === "Reflow fixture" &&
       document.querySelector('img[alt="Synthetic cover"]') === null;`,
    )) === true,
    "Native application did not replace the ready publication.",
  );

  setStage("native ready publication replacement recovery");
  await injectNativeFile(driver, fixturePaths.primary);
  await waitForReadyPublication(driver, "Synthetic EPUB version equivalence");

  setStage("native active file-read cancellation setup");
  await driver.execute(
    `const NativeFileReader = globalThis.FileReader;
     const state = {
       abortCount: 0,
       claimed: false,
       nativeFileReader: NativeFileReader,
       reader: undefined,
       started: false,
     };
     class ControlledFileReader {
       constructor() {
         if (state.claimed) {
           return new NativeFileReader();
         }
         state.claimed = true;
         const reader = {
           onabort: null,
           onerror: null,
           onload: null,
           readyState: NativeFileReader.EMPTY,
           result: null,
           abort() {
             if (this.readyState !== NativeFileReader.LOADING) {
               return;
             }
             state.abortCount += 1;
             this.readyState = NativeFileReader.DONE;
             this.onabort?.(new ProgressEvent("abort"));
           },
           readAsArrayBuffer() {
             this.readyState = NativeFileReader.LOADING;
             state.started = true;
           },
         };
         state.reader = reader;
         return reader;
       }
     }
     Object.defineProperties(ControlledFileReader, {
       DONE: { value: NativeFileReader.DONE },
       EMPTY: { value: NativeFileReader.EMPTY },
       LOADING: { value: NativeFileReader.LOADING },
     });
     globalThis.__voxleafNativeFileReadControl = state;
     globalThis.FileReader = ControlledFileReader;
     return true;`,
  );
  await injectNativeFile(driver, fixturePaths.replacement);
  await waitForCondition(
    driver,
    `const state = globalThis.__voxleafNativeFileReadControl;
     return state?.started === true &&
       document.querySelector('[role="status"]')?.textContent ===
         "Validating and opening the selected EPUB.";`,
  );

  setStage("native active file-read replacement");
  await injectNativeFile(driver, fixturePaths.primary);
  await waitForReadyPublication(driver, "Synthetic EPUB version equivalence");
  const cancellationObservation = await driver.execute(
    `const state = globalThis.__voxleafNativeFileReadControl;
     const observation = {
       abortCount: state?.abortCount ?? 0,
       handlersCleared:
         state?.reader?.onabort === null &&
         state?.reader?.onerror === null &&
         state?.reader?.onload === null,
       started: state?.started === true,
     };
     if (state?.nativeFileReader !== undefined) {
       globalThis.FileReader = state.nativeFileReader;
     }
     delete globalThis.__voxleafNativeFileReadControl;
     return observation;`,
  );
  assert(
    cancellationObservation?.started === true &&
      cancellationObservation.abortCount === 1 &&
      cancellationObservation.handlersCleared === true,
    "Native application did not cancel the stale local file read.",
  );

  setStage("native exact local file-size boundary");
  await injectNativeFile(driver, fixturePaths.exactLimit);
  await waitForCondition(
    driver,
    `return document.querySelector('[role="status"]')?.textContent ===
       "That file is not a valid supported EPUB.";`,
  );
  assert(
    (await driver.execute(
      `return document.querySelector('[role="status"]')?.textContent !==
       "That file is larger than the 100 MiB EPUB limit.";`,
    )) === true,
    "Native application rejected the exact local file-size boundary before EPUB validation.",
  );

  setStage("native local file-size maximum plus one");
  await injectNativeFile(driver, fixturePaths.overLimit);
  await waitForCondition(
    driver,
    `return document.querySelector('[role="status"]')?.textContent ===
       "That file is larger than the 100 MiB EPUB limit.";`,
  );
  assert(
    (await driver.execute(
      `return document.querySelector('[role="status"]')?.textContent ===
       "That file is larger than the 100 MiB EPUB limit.";`,
    )) === true,
    "Native application did not reject the local file-size maximum plus one.",
  );

  setStage("native file-ingress failure recovery");
  await injectNativeFile(driver, fixturePaths.primary);
  await waitForReadyPublication(driver, "Synthetic EPUB version equivalence");
  assert(
    (await driver.execute(
      `return document.querySelector("#publication-title")?.textContent ===
         "Synthetic EPUB version equivalence" &&
       document.querySelector(".semantic-reader") !== null;`,
    )) === true,
    "Native application did not recover after local file-ingress failures.",
  );

  await assertNativeFilePrivacy(
    driver,
    Object.values(fixturePaths).map((filePath) => path.basename(filePath)),
  );
}

async function stopChild(child) {
  if (child.exitCode !== null || child.pid === undefined) {
    return;
  }

  child.kill();
  await Promise.race([once(child, "exit"), delay(5_000)]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([once(child, "exit"), delay(5_000)]);
  }
}

async function run() {
  const runLabel = READER_PERFORMANCE_MODE
    ? "Native reader performance benchmark"
    : ADAPTIVE_TTS_EXACT_HOST_MODE
      ? "Adaptive exact-host TTS matrix"
      : "Native startup smoke";
  assert(
    process.platform === "win32",
    "Native startup smoke must run on Windows.",
  );
  await access(executablePath);

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "voxleaf-native-startup-"),
  );
  const profileDirectory = path.join(temporaryDirectory, "webview-profile");
  const fixturePath = path.join(temporaryDirectory, "synthetic.epub");
  const orientedFixturePath = path.join(
    temporaryDirectory,
    "synthetic-oriented.epub",
  );
  const dismissalFixturePath = path.join(
    temporaryDirectory,
    "invalid-replacement.epub",
  );
  const fileIngressFixturePaths = Object.freeze({
    exactLimit: path.join(temporaryDirectory, "exact-limit.epub"),
    overLimit: path.join(temporaryDirectory, "over-limit-file.epub"),
    primary: fixturePath,
    replacement: path.join(temporaryDirectory, "replacement.epub"),
  });
  const performanceFixturePaths = Object.freeze({
    dismissal: dismissalFixturePath,
    exact: path.join(temporaryDirectory, "exact.epub"),
    overLimit: path.join(temporaryDirectory, "over-limit.epub"),
    representative: path.join(temporaryDirectory, "representative.epub"),
  });
  const fixtureModuleUrl = pathToFileURL(
    path.resolve(
      desktopRoot,
      "..",
      "..",
      "packages",
      "epub",
      "test-support",
      "epub-fixture.ts",
    ),
  );
  const {
    buildEpubVersionEquivalenceFixture,
    buildMinimalEpubFixture,
    buildReaderLongChapterEpubFixture,
    buildReaderNavigationEpubFixture,
    buildReaderReflowEpubFixture,
  } = await import(fixtureModuleUrl.href);
  await mkdir(profileDirectory);
  if (READER_PERFORMANCE_MODE) {
    const [exact, overLimit, representative] = await Promise.all([
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: 10_000,
        deepTargetBlockIndex: 8_999,
      }),
      buildReaderLongChapterEpubFixture({
        semanticBlockCount: 10_001,
      }),
      buildReaderNavigationEpubFixture(),
    ]);
    await Promise.all([
      writeFile(performanceFixturePaths.exact, exact, { flag: "wx" }),
      writeFile(performanceFixturePaths.overLimit, overLimit, { flag: "wx" }),
      writeFile(performanceFixturePaths.representative, representative, {
        flag: "wx",
      }),
    ]);
  } else if (ADAPTIVE_TTS_EXACT_HOST_MODE) {
    const fixtureLanguage = ADAPTIVE_TTS_LANGUAGE;
    const isEnglishFixture = fixtureLanguage === "en";
    const boundedSyntheticSentence =
      syntheticNarrationSentences(fixtureLanguage);
    const piperExpansionRegressionSentence = isEnglishFixture
      ? "Series 2026 2027 2028 2029, CPU GPU TTS, XIV XVI XVIII, $10.50 and 25%."
      : "Serie 2026 2027 2028 2029, CPU GPU TTS, XIV XVI XVIII, $10.50 y 25%.";
    const syntheticParagraph = [
      PIPER_CPU_FALLBACK_PROFILE_ID,
      PIPER_ENGLISH_CPU_PROFILE_ID,
    ].includes(ADAPTIVE_TTS_PROFILE_ID)
      ? `${piperExpansionRegressionSentence} ${Array.from(
          { length: 3 },
          (_, index) =>
            `${boundedSyntheticSentence} ${
              isEnglishFixture ? "Part" : "Parte"
            } ${String(index + 1)}.`,
        ).join(" ")}`
      : ADAPTIVE_TTS_PROFILE_ID === CHATTERBOX_BILINGUAL_PROFILE_ID
        ? chatterboxPlaybackSpeedParagraph(fixtureLanguage)
        : boundedSyntheticSentence;
    const chapterParagraphs = (chapter) =>
      Array.from(
        { length: 96 },
        (_, index) =>
          `<p>${syntheticParagraph} ${
            isEnglishFixture ? "Chapter" : "Cap&#237;tulo"
          } ${String(chapter)}, ${
            isEnglishFixture ? "section" : "secci&#243;n"
          } ${String(index + 1)}.</p>`,
      ).join("");
    const firstSectionTitle = isEnglishFixture
      ? "First section"
      : "Primera secci&#243;n";
    const secondSectionTitle = isEnglishFixture
      ? "Second section"
      : "Segunda secci&#243;n";
    const adaptiveFixture = await buildMinimalEpubFixture({
      packageDocument: `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:adaptive-synchronization-${fixtureLanguage}</dc:identifier><dc:title>Synthetic synchronized narration ${fixtureLanguage}</dc:title><dc:language>${fixtureLanguage}</dc:language><meta property="dcterms:modified">2026-07-30T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter-one" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="chapter-two" href="text/chapter-two.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter-one"/><itemref idref="chapter-two"/></spine></package>`,
      navigationDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">First synthetic section</a></li><li><a href="text/chapter-two.xhtml#chapter-two">Second synthetic section</a></li></ol></nav></body></html>',
      chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${fixtureLanguage}"><head><title>${firstSectionTitle}</title></head><body><h1 id="chapter-one">${firstSectionTitle}</h1>${chapterParagraphs(
        1,
      )}</body></html>`,
      additionalEntries: [
        Object.freeze({
          name: "EPUB/text/chapter-two.xhtml",
          content: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${fixtureLanguage}"><head><title>${secondSectionTitle}</title></head><body><h1 id="chapter-two">${secondSectionTitle}</h1>${chapterParagraphs(
            2,
          )}</body></html>`,
          compression: "deflate",
        }),
      ],
    });
    await writeFile(fixturePath, adaptiveFixture, { flag: "wx" });
  } else {
    const [primaryFixture, replacementFixture] = await Promise.all([
      buildEpubVersionEquivalenceFixture("2.0"),
      buildReaderReflowEpubFixture({
        paragraphCount: 4,
        preservedPassageIndex: 2,
      }),
    ]);
    await Promise.all([
      writeFile(fixturePath, primaryFixture, { flag: "wx" }),
      buildOrientedRasterEpubFixture().then((bytes) =>
        writeFile(orientedFixturePath, bytes, { flag: "wx" }),
      ),
      writeFile(fileIngressFixturePaths.replacement, replacementFixture, {
        flag: "wx",
      }),
      createSizedDisposableFile(
        fileIngressFixturePaths.exactLimit,
        MAX_LOCAL_EPUB_FILE_BYTES,
      ),
      createSizedDisposableFile(
        fileIngressFixturePaths.overLimit,
        MAX_LOCAL_EPUB_FILE_BYTES + 1,
      ),
    ]);
  }
  await writeFile(dismissalFixturePath, "not-an-epub", { flag: "wx" });

  const driverPort = await reserveLoopbackPort();
  const nativeDriverPort = await reserveLoopbackPort();
  const endpoint = `http://127.0.0.1:${driverPort}`;
  const tauriDriverPath = await resolveExecutablePath(
    process.env.VOXLEAF_TAURI_DRIVER_PATH ?? "tauri-driver.exe",
  );
  const edgeDriverPath = await resolveExecutablePath(
    process.env.VOXLEAF_EDGE_DRIVER_PATH ?? "msedgedriver.exe",
  );
  const child = spawn(
    tauriDriverPath,
    [
      "--port",
      String(driverPort),
      "--native-port",
      String(nativeDriverPort),
      "--native-driver",
      edgeDriverPath,
    ],
    {
      cwd: desktopRoot,
      env: process.env,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  const spawnState = { failed: false };
  child.once("error", () => {
    spawnState.failed = true;
  });
  const driver = new WebDriverClient(endpoint, {
    requestTimeoutMs: STARTUP_TIMEOUT_MS,
  });
  let stage = "WebDriver startup";
  let cleanupFailed = false;
  const collectedBrowserLogs = [];
  const collectedPerformanceLogs = [];

  try {
    if (!ADAPTIVE_TTS_EXACT_HOST_MODE) {
      stage = "native TTS supervisor host matrix";
      await exerciseNativeTtsSupervisorHost();
    }
    stage = "WebDriver startup";
    await waitForDriver(endpoint, child, spawnState);
    stage = "native WebView session creation";
    await driver.createSession(executablePath, profileDirectory);
    await Promise.all([
      driver.executeCdp("Log.enable"),
      driver.executeCdp("Runtime.enable"),
      driver.executeCdp("Network.enable"),
    ]);

    stage = "application mount";
    await waitForCondition(
      driver,
      `const root = document.querySelector("#root");
       const main = document.querySelector("main");
       return root?.childElementCount > 0 &&
         main !== null &&
         main.getClientRects().length > 0;`,
    );
    const rootMounted = await driver.execute(
      `return document.querySelector("#root")?.childElementCount > 0;`,
    );
    assert(
      (await driver.findElements(".application-bar-actions button")).length ===
        0,
      "Native Settings were available without an open publication.",
    );
    if (READER_PERFORMANCE_MODE) {
      stage = "native reader performance and resource benchmark";
      await runNativeReaderPerformanceBenchmark(
        driver,
        performanceFixturePaths,
        child.pid,
        (nextStage) => {
          stage = nextStage;
        },
      );
      return;
    }
    if (ADAPTIVE_TTS_EXACT_HOST_MODE) {
      stage = "adaptive exact-host profile setup publication";
      await injectNativeFile(driver, fixturePath);
      await waitForCondition(
        driver,
        `return document.querySelector("article.semantic-document") !== null;`,
      );
      stage = "native bilingual narration preference";
      await openReaderSettings(driver);
      await exerciseNarrationLanguagePreference(driver, ADAPTIVE_TTS_LANGUAGE);
      stage = "adaptive exact-host profile selection";
      const profileSelected = await selectAdaptiveTtsProfile(
        driver,
        ADAPTIVE_TTS_PROFILE_ID,
        EXERCISE_EXACT_HOST_PROFILE_SWITCH,
      );
      await closeReaderSettings(driver);
      if (!profileSelected) {
        stage = "adaptive exact-host unavailable-profile assertions";
        await delay(OBSERVATION_WINDOW_MS);
        const browserLogs = await driver.getLogs("browser");
        const performanceLogs = inspectPerformanceLogs(
          await driver.getLogs("performance"),
        );
        const externalLoadedResourceCount = await driver.execute(
          `return performance.getEntriesByType("resource").filter((entry) => {
             try {
               const url = new URL(entry.name);
               return !(
                 url.protocol === "tauri:" ||
                 url.protocol === "ipc:" ||
                 url.protocol === "data:" ||
                 url.protocol === "blob:" ||
                 url.hostname === "tauri.localhost" ||
                 url.hostname === "ipc.localhost"
               );
             } catch {
               return true;
             }
           }).length;`,
        );
        assert(
          browserLogs.every((entry) => entry?.level !== "SEVERE") &&
            performanceLogs.runtimeErrorCount === 0,
          "Native application emitted a page or console error.",
        );
        assert(
          externalLoadedResourceCount === 0 &&
            performanceLogs.externalRequestCount === 0,
          "Native application attempted an external request.",
        );
        console.log(
          `Adaptive exact-host unavailable-profile matrix passed: ${JSON.stringify(
            {
              externalRequests: 0,
              language: ADAPTIVE_TTS_LANGUAGE,
              profileId: ADAPTIVE_TTS_PROFILE_ID,
              reason: EXPECTED_UNAVAILABLE_PROFILE_REASON,
            },
          )}`,
        );
        return;
      }
      await runAdaptiveTtsExactHostMatrix(
        driver,
        fixturePath,
        child.pid,
        (nextStage) => {
          stage = nextStage;
        },
      );
      return;
    }

    await exerciseNativeTtsProtocolProbe(driver, (nextStage) => {
      stage = nextStage;
    });
    await exerciseNativeTtsServiceLifecycle(driver, (nextStage) => {
      stage = nextStage;
    });

    stage = "synthetic file injection";
    const fileInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(fileInput, fixturePath);
    stage = "synthetic publication settlement";
    await waitForCondition(
      driver,
      `const status = document.querySelector('[role="status"]');
       return status !== null &&
         status.textContent !== "Validating and opening the selected EPUB.";`,
    );
    const openStatus = await driver.execute(
      `return document.querySelector('[role="status"]')?.textContent ?? "";`,
    );
    const failureStageByStatus = Object.freeze({
      "That EPUB exceeds VoxLeaf's safe processing limits.":
        "synthetic resource-limit result",
      "That EPUB uses features VoxLeaf does not support yet.":
        "synthetic unsupported result",
      "That file is not a valid supported EPUB.": "synthetic invalid result",
      "This EPUB has no supported readable content.": "synthetic empty result",
      "VoxLeaf could not open that EPUB because of an internal failure.":
        "synthetic internal-failure result",
      "VoxLeaf could not read that local file.":
        "synthetic read-failure result",
    });

    if (openStatus !== "The EPUB opened successfully.") {
      stage = failureStageByStatus[openStatus] ?? "synthetic unexpected result";
      throw new Error("Native synthetic publication did not open.");
    }

    stage = "synthetic publication readiness";
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h2")).some(
         (heading) =>
           heading.textContent === "Synthetic EPUB version equivalence" &&
           heading.getClientRects().length > 0,
       );`,
    );
    stage = "native bilingual narration preference";
    await openReaderSettings(driver);
    await exerciseNarrationLanguagePreference(driver, "es");
    await closeReaderSettings(driver);
    stage = "synthetic raster image presentation";
    await driver.execute(
      `document.querySelector(".semantic-raster-host")
         ?.scrollIntoView({ block: "center" });
       return true;`,
    );
    await waitForCondition(
      driver,
      `const image = document.querySelector('img[alt="Synthetic cover"]');
       return image !== null && image.getClientRects().length > 0;`,
    );
    const imageObservation = await driver.execute(
      `const image = document.querySelector('img[alt="Synthetic cover"]');
       return {
         sourceIsLocalObjectUrl: image?.src.startsWith("blob:") === true,
         naturalWidth: image?.naturalWidth ?? 0,
         naturalHeight: image?.naturalHeight ?? 0,
       };`,
    );
    assert(
      imageObservation?.sourceIsLocalObjectUrl === true &&
        imageObservation.naturalWidth === 1 &&
        imageObservation.naturalHeight === 1,
      "Native publication raster image did not decode from a local object URL.",
    );

    stage = "synthetic selection cleanup";
    assert(
      (await driver.execute(
        `return document.querySelector('input[type="file"]')?.value ?? "";`,
      )) === "",
      "Native application did not clear the synthetic file selection.",
    );
    assert(
      (await driver.execute(
        `return document.body.textContent?.includes("synthetic.epub") ?? false;`,
      )) === false,
      "Native application exposed the synthetic fixture filename.",
    );

    stage = "native file-ingress lifecycle matrix";
    await exerciseNativeFileIngressMatrix(
      driver,
      fileIngressFixturePaths,
      (nextStage) => {
        stage = nextStage;
      },
    );

    stage = "native reader interaction matrix";
    await exerciseNativeReaderInteractionMatrix(driver, (nextStage) => {
      stage = nextStage;
    });

    stage = "native synchronization feasibility";
    await exerciseNativeSynchronizationFeasibility(driver, (nextStage) => {
      stage = nextStage;
    });

    stage = "synthetic restoration seed navigation";
    await openReaderContents(driver);
    const restorationSeedLinks = await driver.findElements(
      "button.reader-toc-link",
    );
    assert(
      restorationSeedLinks.length >= 2,
      "Native application did not persist the synthetic continuation locator.",
    );
    await driver.sendKeys(restorationSeedLinks[1], WEBDRIVER_ENTER);
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h1")).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           heading.getClientRects().length > 0,
       );`,
    );
    await waitForCondition(
      driver,
      `const serialized = localStorage.getItem("voxleaf.reader.positions");
       if (serialized === null) {
         return false;
       }
       const envelope = JSON.parse(serialized);
       return envelope?.states?.[0]?.locator?.spineItemIndex === 1;`,
    );

    stage = "native restart preparation";
    await delay(OBSERVATION_WINDOW_MS);
    collectedBrowserLogs.push(...(await driver.getLogs("browser")));
    collectedPerformanceLogs.push(...(await driver.getLogs("performance")));
    await driver.deleteSession();

    stage = "native restart session creation";
    await driver.createSession(executablePath, profileDirectory);
    await Promise.all([
      driver.executeCdp("Log.enable"),
      driver.executeCdp("Runtime.enable"),
      driver.executeCdp("Network.enable"),
    ]);
    await driver.setWindowRect(320, 640);
    await waitForCondition(
      driver,
      `const root = document.querySelector("#root");
       const main = document.querySelector("main");
       return root?.childElementCount > 0 &&
         main !== null &&
         main.getClientRects().length > 0;`,
    );
    stage = "synthetic restart file injection";
    const restartFileInput = await driver.findElement('input[type="file"]');
    await driver.execute(
      `document.querySelector('input[type="file"]')
         ?.focus({ preventScroll: true });
       return true;`,
    );
    await driver.sendKeys(restartFileInput, fixturePath);
    stage = "synthetic saved-position restoration";
    const restorationObservation =
      await observeSavedPositionRestoration(driver);
    if (restorationObservation?.status === "pending") {
      stage =
        restorationObservation.savedContinuation &&
        restorationObservation.continuationVisible &&
        restorationObservation.readerBusy
          ? restorationObservation.continuationAligned
            ? "synthetic restoration pending after destination alignment"
            : restorationObservation.documentScrolled
              ? "synthetic restoration pending after destination adjustment"
              : "synthetic restoration pending before destination alignment"
          : "synthetic restoration pending before destination materialization";
      throw new Error("Native saved-position restoration remained pending.");
    }
    if (restorationObservation?.status !== "exact") {
      stage =
        restorationObservation?.savedContinuation === true
          ? "synthetic saved-position restoration result"
          : "synthetic saved-position persistence result";
      throw new Error(
        "Native saved-position restoration reached an unexpected safe state.",
      );
    }
    assert(
      (await driver.execute(
        `return Array.from(document.querySelectorAll("h1")).some(
           (heading) =>
             heading.textContent === "Continuation" &&
             heading.getClientRects().length > 0,
         );`,
      )) === true,
      "Native application did not restore the synthetic continuation locator.",
    );
    assert(
      (await driver.execute(
        `return document.activeElement ===
           document.querySelector('input[type="file"]');`,
      )) === true,
      "Native saved-position restoration moved keyboard focus.",
    );
    assert(
      (await driver.execute(
        `const reader = document.querySelector(".semantic-reader");
         const serialized = localStorage.getItem(
           "voxleaf.reader.preferences",
         );
         if (!(reader instanceof HTMLElement) || serialized === null) {
           return false;
         }
         const preferences = JSON.parse(serialized);
         return preferences?.textScale === "extra-large" &&
           preferences?.lineSpacing === "spacious" &&
           preferences?.contentWidth === "narrow" &&
           preferences?.theme === "system" &&
           reader.dataset.readerTextScale === "extra-large" &&
           reader.dataset.readerLineSpacing === "spacious" &&
           reader.dataset.readerContentWidth === "narrow" &&
           reader.dataset.readerTheme === "system" &&
           document.documentElement.scrollWidth <= window.innerWidth;`,
      )) === true,
      "Native reader preferences were not persisted or restored.",
    );

    stage = "synthetic publication replacement cleanup";
    await replaceNativePublicationForCleanup(driver, dismissalFixturePath);
    assert(
      (await driver.findElements('img[alt="Synthetic cover"]')).length === 0,
      "Native publication raster image remained mounted after close.",
    );

    stage = "SAC-09 oriented JPEG decode and release";
    await injectNativeFile(driver, orientedFixturePath);
    for (const alt of [
      "Synthetic orientation six",
      "Synthetic orientation eight",
    ]) {
      await waitForCondition(
        driver,
        `const target = document.querySelector('img[alt="${alt}"]') ??
          document.querySelector('[role="img"][aria-label^="${alt}."]');
        if (target === null) return false;
        target.scrollIntoView({ block: "center" });
        return true;`,
      );
      await waitForCondition(
        driver,
        `const image = document.querySelector('img[alt="${alt}"]');
        return image !== null && image.src.startsWith("blob:") && image.naturalWidth === 2 && image.naturalHeight === 3;`,
      );
    }
    await replaceNativePublicationForCleanup(driver, dismissalFixturePath);
    assert(
      (await driver.findElements('img[alt^="Synthetic orientation"]'))
        .length === 0,
      "Native oriented raster image remained mounted after close.",
    );

    const externalLoadedResourceCount = await driver.execute(
      `return performance.getEntriesByType("resource").filter((entry) => {
         try {
           const url = new URL(entry.name);
           return !(
              url.protocol === "tauri:" ||
              url.protocol === "ipc:" ||
              url.protocol === "data:" ||
              url.protocol === "blob:" ||
              url.hostname === "tauri.localhost" ||
              url.hostname === "ipc.localhost"
           );
         } catch {
           return true;
         }
       }).length;`,
    );

    await delay(OBSERVATION_WINDOW_MS);
    collectedBrowserLogs.push(...(await driver.getLogs("browser")));
    collectedPerformanceLogs.push(...(await driver.getLogs("performance")));
    const performanceLogs = inspectPerformanceLogs(collectedPerformanceLogs);

    stage = "startup assertions";
    assert(rootMounted === true, "Native application root did not mount.");
    assert(
      (await driver.execute(
        `return document.querySelector("main")?.getClientRects().length > 0;`,
      )) === true,
      "Native application main landmark is not visible.",
    );
    assert(
      collectedBrowserLogs.every((entry) => entry?.level !== "SEVERE") &&
        performanceLogs.runtimeErrorCount === 0,
      "Native application emitted a page or console error.",
    );
    assert(
      externalLoadedResourceCount === 0 &&
        performanceLogs.externalRequestCount === 0,
      "Native application attempted an external request.",
    );

    console.log(
      "Native startup smoke passed: root mounted, bounded TTS protocol and supervised fake-service lifecycle passed with binary delivery/cancellation/crash recovery, local file reselection/cancellation/replacement and exact/max-plus-one boundaries passed, narrow and accessible keyboard reader matrix and synchronization feasibility proof passed, synthetic EPUB image decoded locally, exact position and preferences survived restart/reselection, publication replacement cleanup completed, no errors, no external requests.",
    );
  } catch (error) {
    console.error(
      `${runLabel} failed during ${stage} [${failureCode(error)}].`,
    );
    process.exitCode = 1;
  } finally {
    if (driver.hasSession) {
      try {
        await driver.deleteSession();
      } catch {
        cleanupFailed = true;
      }
    }
    try {
      await stopChild(child);
    } catch {
      cleanupFailed = true;
    }
    try {
      await rm(temporaryDirectory, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 200,
      });
    } catch {
      cleanupFailed = true;
    }

    if (cleanupFailed) {
      console.error(`${runLabel} cleanup failed.`);
      process.exitCode = 1;
    }
  }
}

await run();

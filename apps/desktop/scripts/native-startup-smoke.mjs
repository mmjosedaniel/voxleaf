import console from "node:console";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import {
  access,
  mkdir,
  mkdtemp,
  open,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

import {
  runWebDriverInteractionWithRetry,
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";
import {
  assertNativeSmokeInvariant,
  assertNativeSmokeInvariants,
  nativeSmokeInvariantFailureCode,
} from "./native-smoke-invariants.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const executablePath = path.join(
  desktopRoot,
  "src-tauri",
  "target",
  "release",
  "voxleaf-desktop.exe",
);
const STARTUP_TIMEOUT_MS = 90_000;
const INTERACTION_TIMEOUT_MS = 15_000;
const OBSERVATION_WINDOW_MS = 500;
const READER_PERFORMANCE_MODE = process.argv.includes("--reader-performance");
const ADAPTIVE_TTS_EXACT_HOST_MODE = process.argv.includes(
  "--adaptive-tts-exact-host",
);
const ADAPTIVE_TTS_PROFILE_ARGUMENT = "--tts-profile=";
const EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT =
  "--allow-profile-unavailable-reason=";
const EXACT_QWEN_PROFILE_ID = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1";
const PIPER_CPU_FALLBACK_PROFILE_ID =
  "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
const adaptiveTtsProfileArgument = process.argv.find((argument) =>
  argument.startsWith(ADAPTIVE_TTS_PROFILE_ARGUMENT),
);
const ADAPTIVE_TTS_PROFILE_ID =
  adaptiveTtsProfileArgument?.slice(ADAPTIVE_TTS_PROFILE_ARGUMENT.length) ??
  EXACT_QWEN_PROFILE_ID;
const expectedUnavailableReasonArgument = process.argv.find((argument) =>
  argument.startsWith(EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT),
);
const EXPECTED_UNAVAILABLE_PROFILE_REASON =
  expectedUnavailableReasonArgument?.slice(
    EXPECTED_UNAVAILABLE_PROFILE_REASON_ARGUMENT.length,
  );
if (
  ADAPTIVE_TTS_EXACT_HOST_MODE &&
  ![EXACT_QWEN_PROFILE_ID, PIPER_CPU_FALLBACK_PROFILE_ID].includes(
    ADAPTIVE_TTS_PROFILE_ID,
  )
) {
  throw new Error("Unknown exact-host TTS profile.");
}
if (
  EXPECTED_UNAVAILABLE_PROFILE_REASON !== undefined &&
  (!ADAPTIVE_TTS_EXACT_HOST_MODE ||
    ADAPTIVE_TTS_PROFILE_ID !== EXACT_QWEN_PROFILE_ID ||
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

function executeText(file, args) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { encoding: "utf8" }, (error, stdout) => {
      if (error !== null) {
        reject(
          new Error("Native reader performance metrics were unavailable."),
        );
        return;
      }
      resolve(stdout);
    });
  });
}

function rounded(value) {
  return Math.round(value * 100) / 100;
}

function percentile95(values) {
  assert(
    Array.isArray(values) &&
      values.length > 0 &&
      values.every((value) => Number.isFinite(value) && value >= 0),
    "Native synchronized narration proof failed.",
  );
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(sorted.length * 0.95) - 1];
}

async function generatedAudioFileCount(rootPath) {
  const audioExtensions = new Set([
    ".aac",
    ".flac",
    ".m4a",
    ".mp3",
    ".ogg",
    ".pcm",
    ".wav",
  ]);
  let count = 0;
  const pending = [rootPath];
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === undefined) {
      continue;
    }
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw error;
    }
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (
        entry.isFile() &&
        audioExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        count += 1;
      }
    }
  }
  return count;
}

function memoryDelta(baseline, final) {
  return Object.freeze({
    domNodes: final.domNodes - baseline.domNodes,
    jsHeapBytes: Math.max(0, final.jsHeapBytes - baseline.jsHeapBytes),
    workingSetBytes: Math.max(
      0,
      final.workingSetBytes - baseline.workingSetBytes,
    ),
  });
}

async function processWorkingSetBytes(rootProcessId) {
  assert(
    Number.isSafeInteger(rootProcessId) && rootProcessId > 0,
    "Native reader performance metrics were unavailable.",
  );
  const measurementQuery = [
    `$rootProcessId = ${String(rootProcessId)}`,
    "$processes = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId",
    "$processIds = [System.Collections.Generic.HashSet[int]]::new()",
    "[void]$processIds.Add($rootProcessId)",
    "do { $added = $false; foreach ($candidate in $processes) { if ($processIds.Contains([int]$candidate.ParentProcessId) -and $processIds.Add([int]$candidate.ProcessId)) { $added = $true } } } while ($added)",
    "$measurement = Get-Process -Id @($processIds) -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet64 -Sum",
    "$sum = $measurement.Sum",
    "if ($null -eq $sum) { $sum = 0 }",
    "[Console]::Out.Write([int64]$sum)",
  ].join("; ");
  const output = await executeText("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    measurementQuery,
  ]);
  const workingSetBytes = Number(output.trim());
  assert(
    Number.isSafeInteger(workingSetBytes) && workingSetBytes > 0,
    "Native reader performance metrics were unavailable.",
  );
  return workingSetBytes;
}

async function nativeMemorySnapshot(driver, rootProcessId, setStage, label) {
  setStage(`${label} garbage collection`);
  await driver.executeCdp("HeapProfiler.collectGarbage");
  setStage(`${label} performance enablement`);
  await driver.executeCdp("Performance.enable");
  setStage(`${label} performance metrics`);
  const performanceMetrics = await driver.executeCdp("Performance.getMetrics");
  setStage(`${label} DOM counters`);
  const domCounters = await driver.executeCdp("Memory.getDOMCounters");
  const jsHeapBytes = performanceMetrics?.metrics?.find(
    (metric) => metric.name === "JSHeapUsedSize",
  )?.value;
  assert(
    Number.isFinite(jsHeapBytes) &&
      Number.isSafeInteger(domCounters?.nodes) &&
      domCounters.nodes > 0,
    "Native reader performance metrics were unavailable.",
  );
  return Object.freeze({
    domNodes: domCounters.nodes,
    jsHeapBytes: Math.round(jsHeapBytes),
    workingSetBytes: await processWorkingSetBytes(rootProcessId),
  });
}

async function nvidiaSnapshot() {
  const output = await executeText("nvidia-smi.exe", [
    "--query-gpu=memory.used,temperature.gpu,power.draw,pstate,utilization.gpu",
    "--format=csv,noheader,nounits",
  ]);
  const fields = output
    .trim()
    .split(/\r?\n/u)[0]
    ?.split(",")
    .map((field) => field.trim());
  const dedicatedMemoryMiB = Number(fields?.[0]);
  const temperatureCelsius = Number(fields?.[1]);
  const powerWatts = Number(fields?.[2]);
  const utilizationPercent = Number(fields?.[4]);
  assert(
    Number.isFinite(dedicatedMemoryMiB) &&
      Number.isFinite(temperatureCelsius) &&
      Number.isFinite(powerWatts) &&
      Number.isFinite(utilizationPercent) &&
      typeof fields?.[3] === "string" &&
      fields[3].length > 0,
    "Native reader performance metrics were unavailable.",
  );
  return Object.freeze({
    dedicatedMemoryMiB,
    temperatureCelsius,
    powerWatts: rounded(powerWatts),
    powerState: fields[3],
    utilizationPercent,
  });
}

async function waitForAdaptiveResourceCleanup(
  rootProcessId,
  baselineWorkingSetBytes,
  baselineGpu,
) {
  const startedAtMs = Date.now();
  const deadline = startedAtMs + INTERACTION_TIMEOUT_MS;
  let workingSetBytes;
  let gpu;

  do {
    [workingSetBytes, gpu] = await Promise.all([
      processWorkingSetBytes(rootProcessId),
      nvidiaSnapshot(),
    ]);
    if (
      gpu.dedicatedMemoryMiB <= baselineGpu.dedicatedMemoryMiB + 512 &&
      workingSetBytes <= baselineWorkingSetBytes + 512 * MEBIBYTE
    ) {
      return Object.freeze({
        gpu,
        releaseMs: Date.now() - startedAtMs,
        workingSetBytes,
      });
    }
    await delay(250);
  } while (Date.now() < deadline);

  assertNativeSmokeInvariants([
    [
      "cleanup-gpu-released",
      gpu?.dedicatedMemoryMiB <= baselineGpu.dedicatedMemoryMiB + 512,
    ],
    [
      "cleanup-working-set-released",
      workingSetBytes <= baselineWorkingSetBytes + 512 * MEBIBYTE,
    ],
  ]);
  throw new Error("Native synchronized narration cleanup failed.");
}

function startAdaptiveResourceSampler(rootProcessId) {
  let failure;
  const samples = [];
  const activeSamples = new Set();
  const sample = async () => {
    try {
      const [workingSetBytes, gpu] = await Promise.all([
        processWorkingSetBytes(rootProcessId),
        nvidiaSnapshot(),
      ]);
      samples.push(
        Object.freeze({
          workingSetBytes,
          gpu,
        }),
      );
    } catch (error) {
      failure = error;
    }
  };
  const startSample = sample();
  activeSamples.add(startSample);
  void startSample.finally(() => activeSamples.delete(startSample));
  const timer = globalThis.setInterval(() => {
    const pending = sample();
    activeSamples.add(pending);
    void pending.finally(() => activeSamples.delete(pending));
  }, 5_000);
  timer.unref();
  return Object.freeze({
    async stop() {
      globalThis.clearInterval(timer);
      await Promise.allSettled([...activeSamples]);
      if (failure !== undefined) {
        throw failure;
      }
      assert(
        samples.length > 0,
        "Native reader performance metrics were unavailable.",
      );
      return Object.freeze([...samples]);
    },
  });
}

async function installAdaptiveSynchronizationInstrumentation(driver) {
  const installed = await driver.execute(
    `const registry = CSS.highlights;
     if (
       registry === undefined ||
       typeof globalThis.Highlight !== "function"
     ) {
       return false;
     }
     globalThis.__voxleafAdaptiveSynchronizationInstrumentation?.stop?.();
     const documentIds = new WeakMap();
     let nextDocumentId = 1;
     const state = {
       active: true,
       clearCount: 0,
       currentDocumentId: undefined,
       currentKey: undefined,
       focusPreserved: true,
       followLatenciesMs: [],
       forbiddenKeys: new Set(),
       lastHighlight: undefined,
       maxDiscardedUnits: 0,
       maxRetainedUnits: 0,
       rangeValid: true,
       stalePlaybackObserved: false,
       transitionCount: 0,
       frame: 0,
     };
     const leafSelector =
       "h1, h2, h3, h4, h5, h6, p, blockquote, li";
     const containingElement = (node) =>
       node instanceof Element ? node : node?.parentElement;
     const rangeDetails = (highlight) => {
       const range = Array.from(highlight)[0];
       if (!(range instanceof Range) || range.collapsed) {
         return undefined;
       }
       const startElement = containingElement(range.startContainer);
       const endElement = containingElement(range.endContainer);
       const article = startElement?.closest(".semantic-document");
       if (
         !(article instanceof HTMLElement) ||
         endElement?.closest(".semantic-document") !== article ||
         !range.startContainer.isConnected ||
         !range.endContainer.isConnected
       ) {
         return undefined;
       }
       let documentId = documentIds.get(article);
       if (documentId === undefined) {
         documentId = nextDocumentId;
         nextDocumentId += 1;
         documentIds.set(article, documentId);
       }
       const leaves = Array.from(article.querySelectorAll(leafSelector));
       const startLeaf = startElement?.closest(leafSelector);
       const endLeaf = endElement?.closest(leafSelector);
       const startIndex = leaves.indexOf(startLeaf);
       const endIndex = leaves.indexOf(endLeaf);
       if (startIndex < 0 || endIndex < 0) {
         return undefined;
       }
       return {
         article,
         documentId,
         key:
           String(documentId) + ":" +
           String(startIndex) + ":" +
           String(range.startOffset) + ":" +
           String(endIndex) + ":" +
           String(range.endOffset),
         range,
       };
     };
     const observeFollow = (details, focusOwner, startedAt, attempts = 0) => {
       if (!state.active) {
         return;
       }
       let rect;
       try {
         rect = details.range.getBoundingClientRect();
       } catch {
         state.rangeValid = false;
         return;
       }
       const readerViewport = details.article.closest(
         '[data-reader-scroll-owner="true"]',
       );
       const viewportBounds = readerViewport?.getBoundingClientRect();
       if (viewportBounds === undefined) {
         state.rangeValid = false;
         return;
       }
       const comfortInset = Math.min(
         24,
         Math.max(0, viewportBounds.height / 4),
       );
       const comfortTop = viewportBounds.top + comfortInset;
       const comfortBottom = viewportBounds.bottom - comfortInset;
       const inside =
         Number.isFinite(rect.top) &&
         Number.isFinite(rect.bottom) &&
         rect.bottom >= comfortTop - 1 &&
         rect.top <= comfortBottom + 1;
       if (inside || attempts >= 60) {
         if (state.followLatenciesMs.length < 64) {
           state.followLatenciesMs.push(performance.now() - startedAt);
         }
         state.rangeValid &&= inside;
         state.focusPreserved &&= document.activeElement === focusOwner;
         return;
       }
       requestAnimationFrame(() =>
         observeFollow(details, focusOwner, startedAt, attempts + 1),
       );
     };
     const sample = () => {
       if (!state.active) {
         return;
       }
       const owner = document.querySelector(".product-narration");
       state.maxRetainedUnits = Math.max(
         state.maxRetainedUnits,
         Number(owner?.getAttribute("data-narration-retained-units")) || 0,
       );
       state.maxDiscardedUnits = Math.max(
         state.maxDiscardedUnits,
         Number(owner?.getAttribute("data-narration-discarded-units")) || 0,
       );
       const highlight = registry.get("voxleaf-narration-active");
       if (highlight !== state.lastHighlight) {
         state.lastHighlight = highlight;
         if (highlight === undefined) {
           state.clearCount += 1;
           state.currentDocumentId = undefined;
           state.currentKey = undefined;
         } else {
           const details = rangeDetails(highlight);
           state.transitionCount += 1;
           if (details === undefined) {
             state.rangeValid = false;
           } else {
             state.currentDocumentId = details.documentId;
             state.currentKey = details.key;
             if (state.forbiddenKeys.has(details.key)) {
               state.stalePlaybackObserved = true;
             }
             observeFollow(
               details,
               document.activeElement,
               performance.now(),
             );
           }
         }
       }
       state.frame = requestAnimationFrame(sample);
     };
     state.stop = () => {
       state.active = false;
       cancelAnimationFrame(state.frame);
     };
     Object.defineProperty(
       globalThis,
       "__voxleafAdaptiveSynchronizationInstrumentation",
       { configurable: true, value: state },
     );
     state.frame = requestAnimationFrame(sample);
     return true;`,
  );
  assert(installed === true, "Native synchronized narration proof failed.");
}

async function markCurrentAdaptiveHighlightStale(driver) {
  const marker = await driver.execute(
    `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     if (
       state?.active !== true ||
       typeof state.currentKey !== "string"
     ) {
       return undefined;
     }
     state.forbiddenKeys.add(state.currentKey);
     return {
       clearCount: state.clearCount,
       currentDocumentId: state.currentDocumentId,
       currentKey: state.currentKey,
       transitionCount: state.transitionCount,
     };`,
  );
  assert(
    typeof marker?.currentKey === "string" &&
      Number.isSafeInteger(marker.currentDocumentId) &&
      Number.isSafeInteger(marker.transitionCount) &&
      Number.isSafeInteger(marker.clearCount),
    "Native synchronized narration proof failed.",
  );
  return marker;
}

async function adaptiveSynchronizationObservation(driver) {
  return await driver.execute(
    `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     const styleRules = [];
     const collectRules = (rules) => {
       for (const rule of Array.from(rules ?? [])) {
         if ("cssRules" in rule) {
           try {
             collectRules(rule.cssRules);
           } catch {}
         }
         if (
           rule.selectorText ===
           "::highlight(voxleaf-narration-active)"
         ) {
           styleRules.push(rule);
         }
       }
     };
     for (const sheet of Array.from(document.styleSheets)) {
       try {
         collectRules(sheet.cssRules);
       } catch {}
     }
     const mainRule = styleRules.find(
       (rule) =>
         rule.style?.backgroundColor === "#ffd640" ||
         rule.style?.backgroundColor === "rgb(255, 214, 64)",
     );
     const parseColor = (value) => {
       const hex = /^#([0-9a-f]{6})$/iu.exec(value);
       if (hex !== null) {
         return [0, 2, 4].map((offset) =>
           Number.parseInt(hex[1].slice(offset, offset + 2), 16),
         );
       }
       const rgb = /^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$/u.exec(value);
       return rgb === null
         ? undefined
         : [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
     };
     const luminance = (channels) =>
       channels
         .map((channel) => channel / 255)
         .map((channel) =>
           channel <= 0.04045
             ? channel / 12.92
             : ((channel + 0.055) / 1.055) ** 2.4,
         )
         .reduce(
           (sum, channel, index) =>
             sum + channel * [0.2126, 0.7152, 0.0722][index],
           0,
         );
     const foreground = parseColor(mainRule?.style?.color ?? "");
     const background = parseColor(
       mainRule?.style?.backgroundColor ?? "",
     );
     const contrastRatio =
       foreground === undefined || background === undefined
         ? 0
         : (Math.max(luminance(foreground), luminance(background)) + 0.05) /
           (Math.min(luminance(foreground), luminance(background)) + 0.05);
     return state?.active !== true
       ? undefined
       : {
           clearCount: state.clearCount,
           contrastRatio,
           currentDocumentId: state.currentDocumentId,
           currentKey: state.currentKey,
           focusPreserved: state.focusPreserved,
           followLatenciesMs: [...state.followLatenciesMs],
           forcedColors: matchMedia("(forced-colors: active)").matches,
           highlightPresent:
             CSS.highlights?.has("voxleaf-narration-active") === true,
           maxDiscardedUnits: state.maxDiscardedUnits,
           maxRetainedUnits: state.maxRetainedUnits,
           rangeValid: state.rangeValid,
           readableHighlight:
             contrastRatio >= 4.5 &&
             mainRule?.style?.textDecorationLine.includes("underline") ===
               true,
           reducedMotion: matchMedia(
             "(prefers-reduced-motion: reduce)",
           ).matches,
           stalePlaybackObserved: state.stalePlaybackObserved,
           transitionCount: state.transitionCount,
         };`,
  );
}

async function adaptiveReaderExperienceObservation(driver) {
  return await driver.execute(
    `const viewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     const compact = document.querySelector(".product-narration-compact");
     const detailToggle = document.querySelector(
       '[data-narration-action="details-toggle"]',
     );
     const detail =
       detailToggle instanceof HTMLButtonElement
         ? document.getElementById(
             detailToggle.getAttribute("aria-controls") ?? "",
           )
         : null;
     const leaves = Array.from(document.querySelectorAll(".paragraph-leaf"));
     const leaf = leaves[0];
     return {
       compactVisible:
         compact instanceof HTMLElement &&
         compact.getClientRects().length > 0,
       detailExpanded:
         detailToggle?.getAttribute("aria-expanded") === "true",
       detailVisible:
         detail instanceof HTMLElement && detail.getClientRects().length > 0,
       leafAriaCurrent: leaf?.getAttribute("aria-current") === "true",
       leafCount: leaves.length,
       leafState:
         leaf instanceof HTMLElement
           ? leaf.getAttribute("data-leaf-state")
           : null,
       leafVisible:
         leaf instanceof HTMLElement && leaf.getClientRects().length > 0,
       progressBarCount: document.querySelectorAll(
         'progress, [role="progressbar"]',
       ).length,
       readerScrollOwnerCount: document.querySelectorAll(
         '[data-reader-scroll-owner="true"]',
       ).length,
       readerScrollOwnerVisible:
         viewport instanceof HTMLElement &&
         viewport.getClientRects().length > 0,
     };`,
  );
}

async function adaptiveActiveHighlightPerceivability(driver) {
  return await driver.execute(
    `const highlightName = "voxleaf-narration-active";
     const registry = CSS.highlights;
     const highlight = registry?.get(highlightName);
     const ranges =
       highlight === undefined ? [] : Array.from(highlight);
     const range = ranges[0];
     if (
       registry === undefined ||
       highlight === undefined ||
       !(range instanceof Range) ||
       ranges.length !== 1 ||
       range.collapsed
     ) {
       return { available: false };
     }
     const containingElement = (node) =>
       node instanceof Element ? node : node?.parentElement;
     const article = containingElement(range.startContainer)?.closest(
       ".semantic-document",
     );
     const viewport = article?.closest(
       '[data-reader-scroll-owner="true"]',
     );
     if (
       !(article instanceof HTMLElement) ||
       !(viewport instanceof HTMLElement)
     ) {
       return { available: false };
     }
     const focusOwner = document.activeElement;
     const selection = document.getSelection();
     const selectionState =
       selection === null
         ? undefined
         : {
             anchorNode: selection.anchorNode,
             anchorOffset: selection.anchorOffset,
             focusNode: selection.focusNode,
             focusOffset: selection.focusOffset,
             rangeCount: selection.rangeCount,
           };
     const descendantCount = article.querySelectorAll("*").length;
     const textLength = article.textContent?.length;
     const initialUrl = window.location.href;
     return new Promise((resolve) => {
       let registeredAnimationFrames = 0;
       const observe = () => {
         registeredAnimationFrames += 1;
         if (registeredAnimationFrames < 2) {
           requestAnimationFrame(observe);
           return;
         }
         let rect;
         try {
           rect = range.getBoundingClientRect();
         } catch {
           resolve({ available: false });
           return;
         }
         const viewportRect = viewport.getBoundingClientRect();
         const comfortInset = Math.min(
           24,
           Math.max(0, viewportRect.height / 4),
         );
         const comfortTop = viewportRect.top + comfortInset;
         const comfortBottom = viewportRect.bottom - comfortInset;
         const currentHighlight = registry.get(highlightName);
         resolve({
           available: true,
           focusPreserved: document.activeElement === focusOwner,
           hasNonzeroClientGeometry: rect.width > 0 && rect.height > 0,
           insideReaderViewport:
             rect.bottom >= comfortTop - 1 &&
             rect.top <= comfortBottom + 1,
           publicationDomUnchanged:
             article.querySelectorAll("*").length === descendantCount &&
             article.textContent?.length === textLength,
           rangeConnected:
             range.startContainer.isConnected &&
             range.endContainer.isConnected &&
             !range.collapsed,
           registeredAcrossRenderingOpportunity:
             currentHighlight === highlight &&
             currentHighlight.has(range),
           registeredAnimationFrames,
           selectionPreserved:
             selection === null ||
             (selection.anchorNode === selectionState.anchorNode &&
               selection.anchorOffset === selectionState.anchorOffset &&
               selection.focusNode === selectionState.focusNode &&
               selection.focusOffset === selectionState.focusOffset &&
               selection.rangeCount === selectionState.rangeCount),
           urlUnchanged: window.location.href === initialUrl,
         });
       };
       requestAnimationFrame(observe);
     });`,
  );
}

async function assertAdaptiveActiveHighlightPerceivable(driver) {
  const [highlight, synchronization] = await Promise.all([
    adaptiveActiveHighlightPerceivability(driver),
    adaptiveSynchronizationObservation(driver),
  ]);
  assertNativeSmokeInvariants([
    ["highlight-available", highlight?.available === true],
    [
      "highlight-registered",
      highlight?.registeredAcrossRenderingOpportunity === true,
    ],
    ["highlight-animation-frames", highlight?.registeredAnimationFrames >= 2],
    ["highlight-range-connected", highlight?.rangeConnected === true],
    [
      "highlight-nonzero-geometry",
      highlight?.hasNonzeroClientGeometry === true,
    ],
    ["highlight-in-reader-viewport", highlight?.insideReaderViewport === true],
    ["highlight-focus-preserved", highlight?.focusPreserved === true],
    ["highlight-selection-preserved", highlight?.selectionPreserved === true],
    ["highlight-dom-preserved", highlight?.publicationDomUnchanged === true],
    ["highlight-url-preserved", highlight?.urlUnchanged === true],
    ["highlight-readable", synchronization?.readableHighlight === true],
    ["highlight-present", synchronization?.highlightPresent === true],
    ["highlight-range-valid", synchronization?.rangeValid === true],
  ]);
  return Object.freeze({
    focusPreserved: highlight.focusPreserved,
    insideReaderViewport: highlight.insideReaderViewport,
    registeredAnimationFrames: highlight.registeredAnimationFrames,
    visiblyPerceivable: true,
  });
}

async function stopAdaptiveSynchronizationInstrumentation(driver) {
  await driver.execute(
    `globalThis.__voxleafAdaptiveSynchronizationInstrumentation?.stop?.();
     delete globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     return true;`,
  );
}

async function observeAdaptiveDepletionOrStablePlayback(driver) {
  const timeoutAt = Date.now() + 2 * STARTUP_TIMEOUT_MS;
  let observation;
  while (Date.now() < timeoutAt) {
    observation = await driver.execute(
      `const owner = document.querySelector(".product-narration");
       return owner === null ? undefined : {
         bufferingMs: Number(
           owner.getAttribute("data-narration-buffering-ms"),
         ),
         intentionalWaitMs: Number(
           owner.getAttribute("data-narration-intentional-wait-ms"),
         ),
         failure: owner.getAttribute("data-narration-failure"),
         phase: owner.getAttribute("data-narration-phase"),
         playIntent: owner.getAttribute("data-narration-play-intent"),
         navigationSettling:
           owner.getAttribute("data-narration-navigation-settling"),
         playbackMs: Number(
           owner.getAttribute("data-narration-playback-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
         serviceState: owner.getAttribute("data-narration-service-state"),
         underruns: Number(
           owner.getAttribute("data-narration-underruns"),
         ),
       };`,
    );
    if (observation?.phase === "buffering") {
      return Object.freeze({ kind: "depleted", observation });
    }
    if (observation?.phase === "complete") {
      return Object.freeze({ kind: "range-complete", observation });
    }
    if (observation?.phase === "playing" && observation.playbackMs >= 60_000) {
      return Object.freeze({ kind: "stable", observation });
    }
    assert(
      observation?.phase !== "failed" &&
        !(
          ["idle", "stopped"].includes(observation?.phase) &&
          observation.playIntent !== "playing"
        ),
      "Native synchronized narration proof failed.",
    );
    await delay(250);
  }
  throw new Error("Native synchronized narration proof failed.");
}

async function runAdaptiveTtsExactHostMatrix(
  driver,
  fixturePath,
  rootProcessId,
  setStage,
) {
  const temporaryDirectory = path.dirname(fixturePath);
  setStage("adaptive exact-host synthetic publication injection");
  await injectNativeFile(driver, fixturePath);
  await waitForCondition(
    driver,
    `const viewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     const article = document.querySelector("article.semantic-document");
     return viewport instanceof HTMLElement &&
       viewport.getClientRects().length > 0 &&
       article instanceof HTMLElement &&
       article.getClientRects().length > 0;`,
  );
  setStage("adaptive exact-host availability");
  await waitForCondition(
    driver,
    `return document.querySelector(".product-narration")
       ?.getAttribute("data-narration-availability") === "available";`,
  );

  setStage("adaptive exact-host synchronization instrumentation");
  await driver.setWindowRect(800, 480);
  await driver.executeCdp("Emulation.setEmulatedMedia", {
    media: "",
    features: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "forced-colors", value: "active" },
    ],
  });
  await installAdaptiveSynchronizationInstrumentation(driver);
  const accessibilityObservation =
    await adaptiveSynchronizationObservation(driver);
  assert(
    accessibilityObservation?.forcedColors === true &&
      accessibilityObservation.reducedMotion === true &&
      accessibilityObservation.readableHighlight === true &&
      accessibilityObservation.contrastRatio >= 4.5,
    "Native synchronized narration proof failed.",
  );

  setStage("adaptive exact-host collapsed reader experience");
  const initialReaderExperience =
    await adaptiveReaderExperienceObservation(driver);
  assert(
    initialReaderExperience?.readerScrollOwnerCount === 1 &&
      initialReaderExperience.readerScrollOwnerVisible === true &&
      initialReaderExperience.compactVisible === true &&
      initialReaderExperience.detailExpanded === false &&
      initialReaderExperience.detailVisible === false &&
      initialReaderExperience.progressBarCount === 0 &&
      initialReaderExperience.leafCount === 1 &&
      initialReaderExperience.leafVisible === true &&
      initialReaderExperience.leafState === "preview" &&
      initialReaderExperience.leafAriaCurrent === false,
    "Native synchronized narration proof failed.",
  );

  setStage("adaptive exact-host expanded reader experience");
  const detailToggle = await driver.findElement(
    '[data-narration-action="details-toggle"]',
  );
  await driver.sendKeys(detailToggle, WEBDRIVER_SPACE);
  await waitForCondition(
    driver,
    `return document.querySelector(
       '[data-narration-action="details-toggle"]',
     )?.getAttribute("aria-expanded") === "true" &&
       document.querySelector(".product-narration-detail")
         ?.getClientRects().length > 0;`,
  );
  const expandedReaderExperience =
    await adaptiveReaderExperienceObservation(driver);
  assert(
    expandedReaderExperience?.readerScrollOwnerCount === 1 &&
      expandedReaderExperience.compactVisible === true &&
      expandedReaderExperience.detailExpanded === true &&
      expandedReaderExperience.detailVisible === true &&
      expandedReaderExperience.progressBarCount === 0 &&
      expandedReaderExperience.leafCount === 1,
    "Native synchronized narration proof failed.",
  );

  setStage("adaptive exact-host pre-inference action contract");
  const actionContractValid = await driver.execute(
    `const narrationActions = [
       "details-toggle",
       "next-passage",
       "play",
       "previous-passage",
       "visible-passage",
     ];
     const readerActions = ["next-chapter", "previous-chapter"];
     return narrationActions.every(
       (action) =>
         document.querySelectorAll(
           '[data-narration-action="' + action + '"]',
         ).length === 1,
     ) &&
       readerActions.every(
         (action) =>
           document.querySelectorAll(
             '[data-reader-action="' + action + '"]',
           ).length === 1,
       ) &&
       document.querySelectorAll(".paragraph-leaf").length === 1;`,
  );
  assertNativeSmokeInvariant(actionContractValid === true, "action-contract");

  setStage("adaptive exact-host prepared-option selection");
  const optionsAccepted = await driver.execute(
    `const target = document.querySelector(
       ".adaptive-preparation-target select",
     );
     if (!(target instanceof HTMLSelectElement)) {
       return false;
     }
     return JSON.stringify(
       Array.from(target.options, (option) => Number(option.value)),
     ) === JSON.stringify([60000, 120000, 300000, 600000]);`,
  );
  assert(
    optionsAccepted === true,
    "Native application main landmark is not visible.",
  );
  await driver.sendKeys(detailToggle, WEBDRIVER_SPACE);
  await waitForCondition(
    driver,
    `return document.querySelector(
       '[data-narration-action="details-toggle"]',
     )?.getAttribute("aria-expanded") === "false" &&
       document.querySelector(".product-narration-detail") === null;`,
  );

  const baselineWorkingSetBytes = await processWorkingSetBytes(rootProcessId);
  const baselineGpu = await nvidiaSnapshot();
  const resourceSampler = startAdaptiveResourceSampler(rootProcessId);
  let quickObservation;
  let quickMetrics;
  let quickResourceWorkingSetBytes;
  let quickGpu;
  let preparedObservation;
  let preparedWorkingSetBytes;
  let preparedGpu;
  let cancellationMs;
  let pauseResumeObservation;
  let firstHighlightProof;
  let nextHighlightProof;
  let leafReplacementMs;
  let passiveIsolationMs;
  let seekRestartMs;
  let chapterRestartMs;
  let refillMs;
  let checkpointObservation;
  let leafStartObservation;
  let finalStopMs;
  let depletionObservation;
  let synchronizationObservation;
  let cleanupObservation;
  let cleanupReaderExperience;
  let cleanupWorkingSetBytes;
  let cleanupGpu;
  let cleanupResourceReleaseMs;
  let resourceSamples;
  let generatedAudioFiles;
  try {
    setStage("adaptive exact-host keyboard leaf quick start");
    const quickCommandAtMs = Date.now();
    const quickStartButton = await driver.findElement(".paragraph-leaf");
    await driver.sendKeys(quickStartButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing" &&
       document.querySelector(".paragraph-leaf")
         ?.getAttribute("aria-current") !== "true";`,
    );
    await driver.execute(
      `document.querySelector('select[name="theme"]')
         ?.focus({ preventScroll: true });
       return true;`,
    );
    await waitForCondition(
      driver,
      `return document.querySelector(".product-narration")
         ?.getAttribute("data-narration-phase") === "playing";`,
      3 * STARTUP_TIMEOUT_MS,
    );
    await waitForCondition(
      driver,
      `return globalThis
         .__voxleafAdaptiveSynchronizationInstrumentation
         ?.transitionCount >= 1;`,
      STARTUP_TIMEOUT_MS,
    );
    quickObservation = await driver.execute(
      `const owner = document.querySelector(".product-narration");
       return owner === null ? null : {
         acceptedSampleFrames: Number(
           owner.getAttribute("data-narration-accepted-sample-frames"),
         ),
         acceptedUnits: Number(
           owner.getAttribute("data-narration-accepted-units"),
         ),
         commandToAudibleMs: Number(
           owner.getAttribute("data-narration-command-to-audible-ms"),
         ),
         playableMs: Number(
           owner.getAttribute("data-narration-playable-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
       };`,
    );
    synchronizationObservation =
      await adaptiveSynchronizationObservation(driver);
    firstHighlightProof =
      await assertAdaptiveActiveHighlightPerceivable(driver);
    const firstAudibleLeaf = await adaptiveReaderExperienceObservation(driver);
    assert(
      quickObservation?.acceptedUnits > 0 &&
        quickObservation.acceptedSampleFrames > 0 &&
        quickObservation.commandToAudibleMs > 0 &&
        quickObservation.commandToAudibleMs <=
          Date.now() - quickCommandAtMs + 1_000 &&
        quickObservation.playableMs > 0 &&
        quickObservation.retainedUnits > 0 &&
        synchronizationObservation?.transitionCount >= 1 &&
        synchronizationObservation.highlightPresent === true &&
        synchronizationObservation.rangeValid === true &&
        synchronizationObservation.focusPreserved === true &&
        synchronizationObservation.followLatenciesMs.length >= 1 &&
        firstAudibleLeaf?.leafCount === 1 &&
        firstAudibleLeaf.leafState === "audible" &&
        firstAudibleLeaf.leafAriaCurrent === true &&
        firstAudibleLeaf.detailExpanded === false &&
        firstAudibleLeaf.progressBarCount === 0,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host active leaf replacement");
    const leafReplacementMarker =
      await adaptiveSynchronizationObservation(driver);
    const leafReplacementStartedAtMs = Date.now();
    const activeLeaf = await driver.findElement(".paragraph-leaf");
    await driver.sendKeys(activeLeaf, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing";`,
    );
    await waitForCondition(
      driver,
      `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount >
         ${String(leafReplacementMarker.clearCount)};`,
      STARTUP_TIMEOUT_MS,
    );
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         state?.transitionCount >
           ${String(leafReplacementMarker.transitionCount)} &&
         document.querySelector(".paragraph-leaf")
           ?.getAttribute("data-leaf-state") === "audible" &&
         document.querySelector(".paragraph-leaf")
           ?.getAttribute("aria-current") === "true";`,
      4 * STARTUP_TIMEOUT_MS,
    );
    leafReplacementMs = Date.now() - leafReplacementStartedAtMs;
    const afterLeafReplacement =
      await adaptiveSynchronizationObservation(driver);
    assert(
      afterLeafReplacement?.stalePlaybackObserved === false &&
        afterLeafReplacement.rangeValid === true,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host keyboard pause and resume");
    const pauseButton = await driver.findElement(
      '[data-narration-action="pause"]',
    );
    await driver.sendKeys(pauseButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "paused" &&
         owner.getAttribute("data-narration-play-intent") === "paused";`,
    );
    const pausedAtStart = await adaptiveSynchronizationObservation(driver);
    await delay(750);
    const pausedObservation = await adaptiveSynchronizationObservation(driver);
    assert(
      pausedObservation?.highlightPresent === true &&
        pausedObservation.currentKey === pausedAtStart?.currentKey &&
        pausedObservation.transitionCount === pausedAtStart?.transitionCount,
      "Native synchronized narration proof failed.",
    );
    const resumeButton = await driver.findElement(
      '[data-narration-action="resume"]',
    );
    await driver.sendKeys(resumeButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         owner.getAttribute("data-narration-play-intent") === "playing";`,
    );
    const resumedObservation = await adaptiveSynchronizationObservation(driver);
    pauseResumeObservation = Object.freeze({
      highlightRetained:
        resumedObservation?.currentKey === pausedObservation.currentKey &&
        resumedObservation.highlightPresent === true,
      keyboardOperable: true,
    });
    assert(
      pauseResumeObservation.highlightRetained,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host expanded active narration");
    const activeDetailToggle = await driver.findElement(
      '[data-narration-action="details-toggle"]',
    );
    await driver.sendKeys(activeDetailToggle, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(
         '[data-narration-action="details-toggle"]',
       )?.getAttribute("aria-expanded") === "true" &&
         document.querySelector(".product-narration-detail")
           ?.getClientRects().length > 0;`,
    );
    const expandedActiveExperience =
      await adaptiveReaderExperienceObservation(driver);
    assert(
      expandedActiveExperience?.compactVisible === true &&
        expandedActiveExperience.detailExpanded === true &&
        expandedActiveExperience.detailVisible === true &&
        expandedActiveExperience.leafState === "audible" &&
        expandedActiveExperience.leafAriaCurrent === true &&
        expandedActiveExperience.progressBarCount === 0,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host next-segment seek");
    await waitForCondition(
      driver,
      `const next = document.querySelector(
         '[data-narration-action="next-passage"]',
       );
       return next instanceof HTMLButtonElement && !next.disabled;`,
      3 * STARTUP_TIMEOUT_MS,
    );
    const seekMarker = await markCurrentAdaptiveHighlightStale(driver);
    const seekStartedAtMs = Date.now();
    const nextPassageButton = await driver.findElement(
      '[data-narration-action="next-passage"]',
    );
    await driver.sendKeys(nextPassageButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount > ${String(seekMarker.clearCount)};`,
      STARTUP_TIMEOUT_MS,
    );
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         state?.transitionCount > ${String(seekMarker.transitionCount)} &&
         typeof state.currentKey === "string" &&
         state.currentKey !== ${JSON.stringify(seekMarker.currentKey)};`,
      4 * STARTUP_TIMEOUT_MS,
    );
    seekRestartMs = Date.now() - seekStartedAtMs;
    const afterSeek = await adaptiveSynchronizationObservation(driver);
    nextHighlightProof = await assertAdaptiveActiveHighlightPerceivable(driver);
    const nextAudibleLeaf = await adaptiveReaderExperienceObservation(driver);
    assert(
      afterSeek?.currentDocumentId === seekMarker.currentDocumentId &&
        afterSeek.stalePlaybackObserved === false &&
        afterSeek.rangeValid === true &&
        nextAudibleLeaf?.leafState === "audible" &&
        nextAudibleLeaf.leafAriaCurrent === true &&
        nextAudibleLeaf.detailExpanded === true,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host passive reader navigation");
    const passiveMarker = await adaptiveSynchronizationObservation(driver);
    assert(
      passiveMarker?.highlightPresent === true &&
        Number.isSafeInteger(passiveMarker.clearCount),
      "Native synchronized narration proof failed.",
    );
    const passiveStartedAtMs = Date.now();
    const passiveScrollPrepared = await driver.execute(
      `const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const article = document.querySelector("article.semantic-document");
       const highlight = CSS.highlights.get("voxleaf-narration-active");
       const range = highlight === undefined
         ? undefined
         : Array.from(highlight).at(0);
       const paragraphs = Array.from(article?.querySelectorAll("p") ?? []);
       const rangeElement =
         range?.startContainer instanceof Element
           ? range.startContainer
           : range?.startContainer.parentElement;
       const activeParagraph = rangeElement?.closest("p");
       const activeIndex = paragraphs.indexOf(activeParagraph);
       const targetIndex = Math.min(
         paragraphs.length - 1,
         Math.max(0, activeIndex) + 12,
       );
       const target = paragraphs[targetIndex];
       const owner = document.querySelector(".product-narration");
       if (
          !(readerViewport instanceof HTMLElement) ||
          !(article instanceof HTMLElement) ||
          !(target instanceof HTMLElement) ||
          !(owner instanceof HTMLElement) ||
          activeIndex < 0 ||
          targetIndex === activeIndex
       ) {
         return false;
       }
       const isolation = {
         sawSettling: false,
         startedAt: performance.now(),
       };
       const observeSettling = () => {
         isolation.sawSettling ||= owner?.getAttribute(
           "data-narration-navigation-settling",
         ) === "true";
       };
       observeSettling();
       isolation.observer = new MutationObserver(observeSettling);
       isolation.observer.observe(owner, {
         attributeFilter: ["data-narration-navigation-settling"],
       });
       globalThis.__voxleafAdaptivePassiveIsolation = isolation;
       globalThis.__voxleafAdaptivePassiveNavigationStartY =
         readerViewport.scrollTop;
       article.dispatchEvent(
         new WheelEvent("wheel", {
           bubbles: true,
           cancelable: true,
           deltaY: readerViewport.clientHeight,
         }),
       );
       readerViewport.scrollTop +=
         target.getBoundingClientRect().top -
         readerViewport.getBoundingClientRect().top;
       return true;`,
    );
    assert(
      passiveScrollPrepared === true,
      "Native synchronized narration proof failed.",
    );
    setStage("adaptive exact-host passive reader navigation scroll");
    await waitForCondition(
      driver,
      `const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       return readerViewport instanceof HTMLElement &&
         readerViewport.scrollTop >
            globalThis.__voxleafAdaptivePassiveNavigationStartY;`,
      2 * STARTUP_TIMEOUT_MS,
    );
    setStage("adaptive exact-host passive reader navigation isolation");
    await waitForCondition(
      driver,
      `const isolation = globalThis.__voxleafAdaptivePassiveIsolation;
       return performance.now() - isolation.startedAt >= 750;`,
      2 * STARTUP_TIMEOUT_MS,
    );
    passiveIsolationMs = Date.now() - passiveStartedAtMs;
    const afterPassiveNavigation =
      await adaptiveSynchronizationObservation(driver);
    const passiveIsolation = await driver.execute(
      `const isolation = globalThis.__voxleafAdaptivePassiveIsolation;
       isolation?.observer?.disconnect();
       const observation = {
         sawSettling: isolation?.sawSettling === true,
       };
       delete globalThis.__voxleafAdaptivePassiveIsolation;
       delete globalThis.__voxleafAdaptivePassiveNavigationStartY;
       return observation;`,
    );
    assert(
      afterPassiveNavigation?.stalePlaybackObserved === false &&
        afterPassiveNavigation.rangeValid === true &&
        afterPassiveNavigation.clearCount === passiveMarker.clearCount &&
        passiveIsolation.sawSettling === false,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host chapter transition");
    const chapterMarker = await markCurrentAdaptiveHighlightStale(driver);
    const chapterStartedAtMs = Date.now();
    const nextChapterButton = await driver.findElement(
      '[data-reader-action="next-chapter"]',
    );
    await driver.sendKeys(nextChapterButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount > ${String(chapterMarker.clearCount)};`,
      STARTUP_TIMEOUT_MS,
    );
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-navigation-settling") ===
           "true" ||
         owner?.getAttribute("data-narration-phase") !== "playing";`,
      STARTUP_TIMEOUT_MS,
    );
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         owner.getAttribute("data-narration-navigation-settling") === "false" &&
         state?.transitionCount > ${String(chapterMarker.transitionCount)} &&
         Number.isSafeInteger(state.currentDocumentId) &&
         state.currentDocumentId !== ${String(
           chapterMarker.currentDocumentId,
         )};`,
      4 * STARTUP_TIMEOUT_MS,
    );
    chapterRestartMs = Date.now() - chapterStartedAtMs;
    const afterChapter = await adaptiveSynchronizationObservation(driver);
    assert(
      afterChapter?.stalePlaybackObserved === false &&
        afterChapter.rangeValid === true,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host depletion");
    depletionObservation =
      await observeAdaptiveDepletionOrStablePlayback(driver);
    quickResourceWorkingSetBytes = await processWorkingSetBytes(rootProcessId);
    quickGpu = await nvidiaSnapshot();
    if (depletionObservation.kind === "depleted") {
      const depletedAtMs = Date.now();
      assert(
        depletionObservation.observation.intentionalWaitMs === 0 &&
          depletionObservation.observation.playbackMs > 0 &&
          depletionObservation.observation.underruns > 0,
        "Native synchronized narration proof failed.",
      );
      setStage("adaptive exact-host refill");
      await waitForCondition(
        driver,
        `return document.querySelector(".product-narration")
           ?.getAttribute("data-narration-phase") === "playing";`,
        5 * STARTUP_TIMEOUT_MS,
      );
      refillMs = Date.now() - depletedAtMs;
      await delay(500);
      quickMetrics = await driver.execute(
        `const owner = document.querySelector(".product-narration");
         return owner === null ? null : {
           bufferingMs: Number(
             owner.getAttribute("data-narration-buffering-ms"),
           ),
           intentionalWaitMs: Number(
             owner.getAttribute("data-narration-intentional-wait-ms"),
           ),
           playbackMs: Number(
             owner.getAttribute("data-narration-playback-ms"),
           ),
           underruns: Number(
             owner.getAttribute("data-narration-underruns"),
           ),
         };`,
      );
      assert(
        quickMetrics?.bufferingMs > 0 &&
          quickMetrics.intentionalWaitMs === 0 &&
          quickMetrics.playbackMs > 0 &&
          quickMetrics.underruns > 0,
        "Native synchronized narration proof failed.",
      );
    } else {
      quickMetrics = depletionObservation.observation;
      assert(
        quickMetrics.bufferingMs === 0 &&
          quickMetrics.intentionalWaitMs === 0 &&
          quickMetrics.playbackMs > 0 &&
          (depletionObservation.kind === "range-complete" ||
            quickMetrics.playbackMs >= 60_000) &&
          quickMetrics.underruns === 0,
        "Native synchronized narration proof failed.",
      );
    }

    setStage("adaptive exact-host active cancellation");
    const cancellationPassageButton = await driver.findElement(
      '[data-narration-action="next-passage"]',
    );
    await driver.sendKeys(cancellationPassageButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(".product-narration")
         ?.getAttribute("data-narration-service-state") === "generating";`,
      STARTUP_TIMEOUT_MS,
    );
    const cancellationAtMs = Date.now();
    const stopButton = await driver.findElement(
      '[data-narration-action="stop"]',
    );
    await driver.sendKeys(stopButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "idle" &&
         owner.getAttribute("data-narration-retained-units") === "0" &&
         owner.getAttribute("data-narration-discarded-units") === "0";`,
      STARTUP_TIMEOUT_MS,
    );
    cancellationMs = Date.now() - cancellationAtMs;
    await waitForCondition(
      driver,
      `return CSS.highlights?.has(
         "voxleaf-narration-active",
       ) !== true;`,
    );
    checkpointObservation = await adaptiveReaderExperienceObservation(driver);
    assert(
      checkpointObservation?.leafCount === 1 &&
        checkpointObservation.leafState === "checkpoint" &&
        checkpointObservation.leafAriaCurrent === false &&
        checkpointObservation.compactVisible === true &&
        checkpointObservation.detailExpanded === true &&
        checkpointObservation.progressBarCount === 0,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host prepared mode selection");
    await driver.execute(
      `document.querySelector(
         'input[name="adaptive-preparation-mode"][value="prepared"]',
       )?.click();
       return true;`,
    );
    await waitForCondition(
      driver,
      `const prepared = document.querySelector(
         'input[name="adaptive-preparation-mode"][value="prepared"]',
       );
       const target = document.querySelector(
         ".adaptive-preparation-target select",
       );
       return prepared instanceof HTMLInputElement &&
         prepared.checked === true &&
         target instanceof HTMLSelectElement &&
         target.disabled === false &&
         target.value === "60000";`,
    );

    setStage("adaptive exact-host one-minute prepared checkpoint leaf start");
    const preparedButton = await driver.findElement(".paragraph-leaf");
    await driver.sendKeys(preparedButton, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing";`,
    );
    await waitForCondition(
      driver,
      `return document.querySelector(".product-narration")
         ?.getAttribute("data-narration-phase") === "playing";`,
      5 * STARTUP_TIMEOUT_MS,
    );
    preparedObservation = await driver.execute(
      `const owner = document.querySelector(".product-narration");
       return owner === null ? null : {
         commandToAudibleMs: Number(
           owner.getAttribute("data-narration-command-to-audible-ms"),
         ),
         playableMs: Number(
           owner.getAttribute("data-narration-playable-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
         targetMs: Number(
           owner.getAttribute("data-narration-target-ms"),
         ),
       };`,
    );
    assert(
      preparedObservation?.targetMs === 60_000 &&
        preparedObservation.playableMs >= 60_000 &&
        preparedObservation.retainedUnits > 0 &&
        preparedObservation.commandToAudibleMs > 0,
      "Native application root did not mount.",
    );
    leafStartObservation = await adaptiveReaderExperienceObservation(driver);
    assert(
      leafStartObservation?.leafCount === 1 &&
        leafStartObservation.leafState === "audible" &&
        leafStartObservation.leafAriaCurrent === true &&
        leafStartObservation.compactVisible === true &&
        leafStartObservation.detailExpanded === true &&
        leafStartObservation.progressBarCount === 0,
      "Native synchronized narration proof failed.",
    );
    preparedWorkingSetBytes = await processWorkingSetBytes(rootProcessId);
    preparedGpu = await nvidiaSnapshot();

    setStage("adaptive exact-host prepared playback final stop");
    const finalStopStartedAtMs = Date.now();
    const finalStopButton = await driver.findElement(
      '[data-narration-action="stop"]',
    );
    await driver.click(finalStopButton);
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "idle" &&
         owner.getAttribute("data-narration-failure") === "none" &&
         owner.getAttribute("data-narration-retained-units") === "0" &&
         owner.getAttribute("data-narration-discarded-units") === "0";`,
      STARTUP_TIMEOUT_MS,
    );
    finalStopMs = Date.now() - finalStopStartedAtMs;
    const finalStopReaderExperience =
      await adaptiveReaderExperienceObservation(driver);
    assert(
      finalStopReaderExperience?.leafCount === 1 &&
        ["checkpoint", "preview"].includes(
          finalStopReaderExperience.leafState,
        ) &&
        finalStopReaderExperience.leafAriaCurrent === false &&
        finalStopReaderExperience.progressBarCount === 0,
      "Native synchronized narration proof failed.",
    );
    const finalDetailToggle = await driver.findElement(
      '[data-narration-action="details-toggle"]',
    );
    await driver.sendKeys(finalDetailToggle, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(
         '[data-narration-action="details-toggle"]',
       )?.getAttribute("aria-expanded") === "false" &&
         document.querySelector(".product-narration-detail") === null;`,
    );
    await waitForCondition(
      driver,
      `return CSS.highlights?.has(
         "voxleaf-narration-active",
       ) !== true;`,
    );

    setStage("adaptive exact-host cleanup observation");
    cleanupObservation = await adaptiveSynchronizationObservation(driver);
    cleanupReaderExperience = await adaptiveReaderExperienceObservation(driver);
    assertNativeSmokeInvariants([
      [
        "cleanup-highlight-cleared",
        cleanupObservation?.highlightPresent === false,
      ],
      [
        "cleanup-no-stale-playback",
        cleanupObservation?.stalePlaybackObserved === false,
      ],
      [
        "cleanup-reader-scroll-owner",
        cleanupReaderExperience?.readerScrollOwnerCount === 1,
      ],
      [
        "cleanup-compact-visible",
        cleanupReaderExperience?.compactVisible === true,
      ],
      [
        "cleanup-detail-collapsed",
        cleanupReaderExperience?.detailExpanded === false &&
          cleanupReaderExperience?.detailVisible === false,
      ],
      [
        "cleanup-progressbar-absent",
        cleanupReaderExperience?.progressBarCount === 0,
      ],
      [
        "cleanup-leaf-bounded",
        cleanupReaderExperience?.leafCount === 1 &&
          ["checkpoint", "preview"].includes(
            cleanupReaderExperience?.leafState,
          ),
      ],
      [
        "cleanup-leaf-inactive",
        cleanupReaderExperience?.leafAriaCurrent === false,
      ],
    ]);
    setStage("adaptive exact-host bounded resource cleanup");
    const cleanupResources = await waitForAdaptiveResourceCleanup(
      rootProcessId,
      baselineWorkingSetBytes,
      baselineGpu,
    );
    cleanupWorkingSetBytes = cleanupResources.workingSetBytes;
    cleanupGpu = cleanupResources.gpu;
    cleanupResourceReleaseMs = cleanupResources.releaseMs;

    setStage("adaptive exact-host privacy and network assertions");
    const bodyIsContentSafe = await driver.execute(
      `return !document.body.textContent?.includes(
         "VOXLEAF_TTS_DEV_MODEL_ROOT",
       ) && !document.body.textContent?.includes("\\\\Users\\\\");`,
    );
    assert(
      bodyIsContentSafe === true,
      "Native application exposed the synthetic fixture filename.",
    );
    generatedAudioFiles = await generatedAudioFileCount(temporaryDirectory);
    assert(
      generatedAudioFiles === 0,
      "Native generated audio persistence was detected.",
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
      externalLoadedResourceCount === 0,
      "Native application attempted an external request.",
    );
    const browserLogs = await driver.getLogs("browser");
    const performanceLogs = inspectPerformanceLogs(
      await driver.getLogs("performance"),
    );
    assert(
      browserLogs.every((entry) => entry?.level !== "SEVERE") &&
        performanceLogs.runtimeErrorCount === 0,
      "Native application emitted a page or console error.",
    );
    assert(
      performanceLogs.externalRequestCount === 0,
      "Native application attempted an external request.",
    );
    synchronizationObservation =
      await adaptiveSynchronizationObservation(driver);
  } finally {
    resourceSamples = await resourceSampler.stop();
    await stopAdaptiveSynchronizationInstrumentation(driver);
    await driver.executeCdp("Emulation.setEmulatedMedia", {
      media: "",
      features: [],
    });
    await driver.setWindowRect(960, 720);
  }

  const peakGpu = resourceSamples
    .map((sample) => sample.gpu)
    .concat([baselineGpu, quickGpu, preparedGpu, cleanupGpu])
    .reduce((peak, observation) => ({
      dedicatedMemoryMiB: Math.max(
        peak.dedicatedMemoryMiB,
        observation.dedicatedMemoryMiB,
      ),
      temperatureCelsius: Math.max(
        peak.temperatureCelsius,
        observation.temperatureCelsius,
      ),
      powerWatts: Math.max(peak.powerWatts, observation.powerWatts),
      powerState: observation.powerState,
      utilizationPercent: Math.max(
        peak.utilizationPercent,
        observation.utilizationPercent,
      ),
    }));
  const peakWorkingSetBytes = Math.max(
    ...resourceSamples.map((sample) => sample.workingSetBytes),
    baselineWorkingSetBytes,
    quickResourceWorkingSetBytes,
    preparedWorkingSetBytes,
    cleanupWorkingSetBytes,
  );
  console.log(
    `Adaptive exact-host TTS matrix passed: ${JSON.stringify({
      quick: {
        commandToAudibleMs: quickObservation.commandToAudibleMs,
        playableLeadAtStartMs: quickObservation.playableMs,
        depletionObserved: depletionObservation.kind === "depleted",
        rangeCompleteObserved: depletionObservation.kind === "range-complete",
        bufferingObservationWallMs: refillMs ?? 0,
        bufferingSecondsPerPlaybackMinute: rounded(
          quickMetrics.bufferingMs / 1_000 / (quickMetrics.playbackMs / 60_000),
        ),
        underruns: quickMetrics.underruns,
        intentionalWaitMs: quickMetrics.intentionalWaitMs,
        refillObserved: depletionObservation.kind === "depleted",
        refillMs: refillMs ?? null,
        stablePlaybackObservationMs:
          depletionObservation.kind === "stable"
            ? depletionObservation.observation.playbackMs
            : null,
      },
      prepared: preparedObservation,
      cancellationMs,
      processTreeWorkingSetBytes: {
        baseline: baselineWorkingSetBytes,
        quick: quickResourceWorkingSetBytes,
        prepared: preparedWorkingSetBytes,
        peak: peakWorkingSetBytes,
        cleanup: cleanupWorkingSetBytes,
      },
      gpu: { baseline: baselineGpu, peak: peakGpu, cleanup: cleanupGpu },
      synchronization: {
        segmentTransitions: synchronizationObservation.transitionCount,
        followLatencyP95Ms: rounded(
          percentile95(synchronizationObservation.followLatenciesMs),
        ),
        pauseResume: pauseResumeObservation,
        seekRestartMs,
        chapterRestartMs,
        stalePlaybackObserved: synchronizationObservation.stalePlaybackObserved,
        rangeValid:
          firstHighlightProof.visiblyPerceivable === true &&
          nextHighlightProof.visiblyPerceivable === true,
        focusPreserved:
          firstHighlightProof.focusPreserved === true &&
          nextHighlightProof.focusPreserved === true,
        reducedMotion: accessibilityObservation.reducedMotion,
        forcedColors: accessibilityObservation.forcedColors,
        readableHighlight: accessibilityObservation.readableHighlight,
        highlightClearedAtCleanup:
          cleanupObservation.highlightPresent === false,
        retainedUnitsPeak: synchronizationObservation.maxRetainedUnits,
        discardedUnitsPeak: synchronizationObservation.maxDiscardedUnits,
      },
      readerExperience: {
        oneReaderScrollOwner:
          initialReaderExperience.readerScrollOwnerCount === 1,
        compactDefaultClosed:
          initialReaderExperience.compactVisible === true &&
          initialReaderExperience.detailExpanded === false,
        expandedDetailValidated:
          expandedReaderExperience.detailExpanded === true &&
          expandedReaderExperience.detailVisible === true,
        progressBarAbsent:
          initialReaderExperience.progressBarCount === 0 &&
          expandedReaderExperience.progressBarCount === 0 &&
          cleanupReaderExperience.progressBarCount === 0,
        firstHighlight: firstHighlightProof,
        nextHighlight: nextHighlightProof,
        leafReplacementMs,
        leafStartValidated:
          leafStartObservation.leafState === "audible" &&
          leafStartObservation.leafAriaCurrent === true,
        passiveIsolationMs,
        checkpointAfterStop:
          checkpointObservation.leafState === "checkpoint" &&
          checkpointObservation.leafAriaCurrent === false,
        finalStopMs,
        finalBoundedLeaf:
          ["checkpoint", "preview"].includes(
            cleanupReaderExperience.leafState,
          ) && cleanupReaderExperience.leafAriaCurrent === false,
      },
      cleanup: {
        retainedUnits: 0,
        discardedUnits: 0,
        generatedAudioFiles,
        resourceReleaseMs: cleanupResourceReleaseMs,
      },
      preparedOptionsAcceptedMs: [60_000, 120_000, 300_000, 600_000],
      externalRequests: 0,
    })}`,
  );
}

async function selectAdaptiveTtsProfile(driver, profileId) {
  const serializedProfileId = JSON.stringify(profileId);
  await waitForCondition(
    driver,
    `const owner = document.querySelector(".hardware-compatibility");
     return owner?.getAttribute("data-compatibility-status") !== "checking";`,
  );
  const observation = await driver.execute(
    `const profileId = ${serializedProfileId};
     const inputs = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     );
     const input = inputs.find((candidate) => candidate.value === profileId);
     const profileEntry = Array.from(
       document.querySelectorAll(
         '[aria-label="Measured narration profiles"] li',
       ),
     ).find((candidate) => candidate.dataset.profileId === profileId);
     const owner = document.querySelector(".hardware-compatibility");
     return {
       activeProfileId:
         owner?.getAttribute("data-compatibility-profile") ?? null,
       requestedProfileSelectable: input instanceof HTMLInputElement,
       requestedProfileReason: profileEntry?.dataset.profileReason ?? null,
       requestedProfileState: profileEntry?.dataset.profileState ?? null,
       profileSummaries: Array.from(
         document.querySelectorAll(
           '[aria-label="Measured narration profiles"] li',
         ),
         (item) => item.textContent?.trim() ?? "",
       ),
       selectableProfileIds: inputs.map((candidate) => candidate.value),
       status:
         owner?.getAttribute("data-compatibility-status") ?? "missing",
     };`,
  );
  console.log(`ADAPTIVE_TTS_PROFILE_SELECTION ${JSON.stringify(observation)}`);
  if (
    observation?.requestedProfileSelectable !== true &&
    EXPECTED_UNAVAILABLE_PROFILE_REASON !== undefined
  ) {
    assert(
      observation?.requestedProfileState === "incompatible" &&
        observation?.requestedProfileReason ===
          EXPECTED_UNAVAILABLE_PROFILE_REASON,
      "Native synchronized narration proof failed.",
    );
    return false;
  }
  assert(
    observation?.requestedProfileSelectable === true,
    "Native synchronized narration proof failed.",
  );
  const selected = await driver.execute(
    `const profileId = ${serializedProfileId};
     const input = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     ).find((candidate) => candidate.value === profileId);
     if (!(input instanceof HTMLInputElement)) {
       return false;
     }
     if (!input.checked) {
       input.click();
     }
     return true;`,
  );
  assert(selected === true, "Native synchronized narration proof failed.");
  await waitForCondition(
    driver,
    `return document.querySelector(".hardware-compatibility")
       ?.getAttribute("data-compatibility-profile") ===
       ${serializedProfileId};`,
  );
  return true;
}

async function installNativeResourceInstrumentation(driver) {
  const installed = await driver.execute(
    `if (globalThis.__voxleafNativeResourceInstrumentation !== undefined) {
       return true;
     }
     const activeIntersectionObservers = new Set();
     const activeObjectUrls = new Set();
     const activeResizeObservers = new Set();
     const instrumentation = {
       activeIntersectionObservers,
       activeObjectUrls,
       activeResizeObservers,
       storageWrites: 0,
     };
     Object.defineProperty(
       globalThis,
       "__voxleafNativeResourceInstrumentation",
       { configurable: false, value: instrumentation },
     );
     const originalCreateObjectUrl = URL.createObjectURL.bind(URL);
     const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
     URL.createObjectURL = (object) => {
       const objectUrl = originalCreateObjectUrl(object);
       activeObjectUrls.add(objectUrl);
       return objectUrl;
     };
     URL.revokeObjectURL = (objectUrl) => {
       activeObjectUrls.delete(objectUrl);
       originalRevokeObjectUrl(objectUrl);
     };
     const OriginalResizeObserver = globalThis.ResizeObserver;
     globalThis.ResizeObserver = class extends OriginalResizeObserver {
       constructor(callback) {
         super(callback);
         activeResizeObservers.add(this);
       }
       disconnect() {
         activeResizeObservers.delete(this);
         super.disconnect();
       }
     };
     const OriginalIntersectionObserver = globalThis.IntersectionObserver;
     globalThis.IntersectionObserver = class extends OriginalIntersectionObserver {
       constructor(callback, options) {
         super(callback, options);
         activeIntersectionObservers.add(this);
       }
       disconnect() {
         activeIntersectionObservers.delete(this);
         super.disconnect();
       }
     };
     const originalSetItem = Storage.prototype.setItem;
     Storage.prototype.setItem = function (key, value) {
       if (key.startsWith("voxleaf.reader.")) {
         instrumentation.storageWrites += 1;
       }
       originalSetItem.call(this, key, value);
     };
     return true;`,
  );
  assert(
    installed === true,
    "Native reader performance metrics were unavailable.",
  );
}

async function nativeResourceInstrumentation(driver) {
  const result = await driver.execute(
    `const instrumentation =
       globalThis.__voxleafNativeResourceInstrumentation;
     if (instrumentation === undefined) {
       return undefined;
     }
     return {
       activeIntersectionObservers:
         instrumentation.activeIntersectionObservers.size,
       activeObjectUrls: instrumentation.activeObjectUrls.size,
       activeResizeObservers: instrumentation.activeResizeObservers.size,
       storageWrites: instrumentation.storageWrites,
     };`,
  );
  assert(
    result !== undefined,
    "Native reader performance metrics were unavailable.",
  );
  return result;
}

function isLocalApplicationUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "tauri:" ||
      url.protocol === "ipc:" ||
      url.protocol === "data:" ||
      url.protocol === "blob:" ||
      url.hostname === "tauri.localhost" ||
      url.hostname === "ipc.localhost"
    );
  } catch {
    return false;
  }
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

async function exerciseNativeTtsProtocolProbe(driver, setStage) {
  setStage("native TTS protocol probe dispatch");
  const started = await driver.execute(
    `if (typeof globalThis.__voxleafRunTtsProtocolProbe !== "function") {
       return false;
     }
     globalThis.__voxleafTtsProtocolProbeObservation = { status: "pending" };
     globalThis.__voxleafRunTtsProtocolProbe()
       .then((observation) => {
         globalThis.__voxleafTtsProtocolProbeObservation = {
           status: "complete",
           observation,
         };
       })
       .catch((error) => {
         const code =
           error?.code === "tts-probe-response-invalid" ||
           error?.code === "tts-probe-unavailable"
             ? error.code
             : "tts-probe-unexpected";
         const detail =
           error?.detail === "array" ||
           error?.detail === "binary-object" ||
           error?.detail === "byte-length" ||
           error?.detail === "non-finite" ||
           error?.detail === "other" ||
           error?.detail === "other-view" ||
           error?.detail === "prefix" ||
           error?.detail === "sample-length"
             ? error.detail
             : "none";
         globalThis.__voxleafTtsProtocolProbeObservation = {
            status: "failed",
            code,
            detail,
          };
       });
     return true;`,
  );
  assert(
    started === true,
    "Native TTS protocol probe did not deliver bounded binary audio.",
  );

  setStage("native TTS protocol probe binary delivery");
  await waitForCondition(
    driver,
    `return globalThis.__voxleafTtsProtocolProbeObservation?.status !==
       "pending";`,
  );
  const result = await driver.execute(
    `const result = globalThis.__voxleafTtsProtocolProbeObservation;
     delete globalThis.__voxleafTtsProtocolProbeObservation;
     return result;`,
  );
  if (result?.status === "failed") {
    assert(
      result.code !== "tts-probe-response-invalid",
      result.detail === "array"
        ? "Native TTS protocol probe returned a serialized array."
        : result.detail === "binary-object"
          ? "Native TTS protocol probe returned an unknown binary object."
          : result.detail === "other-view"
            ? "Native TTS protocol probe returned an unsupported binary view."
            : "Native TTS protocol probe response was invalid.",
    );
    assert(
      result.code !== "tts-probe-unavailable",
      "Native TTS protocol probe command was unavailable.",
    );
  }
  assert(
    result?.status === "complete" &&
      result.observation?.byteLength === 19_200 &&
      result.observation?.sampleCount === 4_800 &&
      result.observation?.sampleFormat === "float32-le",
    "Native TTS protocol probe did not deliver bounded binary audio.",
  );
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

async function exerciseNativeTtsServiceLifecycle(driver, setStage) {
  setStage("native TTS service lifecycle dispatch");
  const started = await driver.execute(
    `if (
       typeof globalThis.__voxleafRunTtsServiceLifecycleProbe !== "function"
     ) {
       return false;
     }
     globalThis.__voxleafTtsServiceLifecycleObservation = {
       status: "pending",
     };
     globalThis.__voxleafRunTtsServiceLifecycleProbe()
       .then((observation) => {
         globalThis.__voxleafTtsServiceLifecycleObservation = {
           status: "complete",
           observation,
         };
       })
       .catch((error) => {
         const code =
           typeof error?.code === "string" &&
           error.code.startsWith("tts-service-")
             ? error.code
             : "tts-service-unexpected";
         globalThis.__voxleafTtsServiceLifecycleObservation = {
           status: "failed",
           code,
         };
       });
     return true;`,
  );
  assert(started === true, "Native TTS service lifecycle probe failed.");

  setStage("native TTS service lifecycle completion");
  await waitForCondition(
    driver,
    `return globalThis.__voxleafTtsServiceLifecycleObservation?.status !==
       "pending";`,
  );
  const result = await driver.execute(
    `const result = globalThis.__voxleafTtsServiceLifecycleObservation;
     delete globalThis.__voxleafTtsServiceLifecycleObservation;
     return result;`,
  );
  assert(
    result?.status === "complete" &&
      result.observation?.normalPayloadBytes === 19_200 &&
      result.observation?.normalSampleCountSamples === 4_800 &&
      result.observation?.cancellationCode === "tts-service-cancelled" &&
      result.observation?.finalState === "stopped" &&
      result.observation?.retainedAudioUnits === 0,
    "Native TTS service lifecycle probe failed.",
  );
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
  await waitForReadyPublication(driver, "Synthetic comprehensive publication");
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
    beforePickerCancellation?.title === "Synthetic comprehensive publication" &&
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
  await waitForReadyPublication(driver, "Synthetic comprehensive publication");

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
  await waitForReadyPublication(driver, "Synthetic comprehensive publication");
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
  await waitForReadyPublication(driver, "Synthetic comprehensive publication");
  assert(
    (await driver.execute(
      `return document.querySelector("#publication-title")?.textContent ===
         "Synthetic comprehensive publication" &&
       document.querySelector(".semantic-reader") !== null;`,
    )) === true,
    "Native application did not recover after local file-ingress failures.",
  );

  await assertNativeFilePrivacy(
    driver,
    Object.values(fixturePaths).map((filePath) => path.basename(filePath)),
  );
}

async function nativeReaderInteractionObservation(driver) {
  try {
    return await driver.execute(
      `const activeElement = document.activeElement;
       const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const controls = Object.fromEntries(
         Array.from(
           document.querySelectorAll(".reader-preferences select[name]"),
         ).map((control) => [control.name, control.value]),
       );
       let preferencesPersisted = false;
       try {
         const serialized = localStorage.getItem(
           "voxleaf.reader.preferences",
         );
         preferencesPersisted =
           serialized !== null &&
           JSON.parse(serialized)?.version === 1;
       } catch {
         preferencesPersisted = false;
       }
       return {
         activeElement: {
           className:
             activeElement instanceof HTMLElement
               ? activeElement.className
               : "",
           name: activeElement?.getAttribute("name") ?? "",
           tagName: activeElement?.tagName ?? "",
         },
         controls,
         headingCount: document.querySelectorAll("h1, h2").length,
         preferencesPersisted,
         readerPresent:
           document.querySelector(".semantic-reader") !== null,
         scroll: {
            maximumY: Math.max(
              0,
              (readerViewport?.scrollHeight ?? 0) -
                (readerViewport?.clientHeight ?? 0),
            ),
            y: readerViewport?.scrollTop ?? 0,
          },
         viewport: {
           height: window.innerHeight,
           scale: window.visualViewport?.scale ?? 1,
           width: window.innerWidth,
         },
       };`,
    );
  } catch {
    return { observation: "unavailable" };
  }
}

async function runNativeReaderInteraction({
  action,
  condition,
  driver,
  label,
  setStage,
}) {
  await runWebDriverInteractionWithRetry({
    action,
    condition: async () => {
      await waitForCondition(driver, condition, INTERACTION_TIMEOUT_MS);
    },
    onAttempt: async (attempt, maximumAttempts) => {
      setStage(
        `native reader ${label} (attempt ${String(attempt)} of ${String(maximumAttempts)})`,
      );
    },
    onConditionTimeout: async (attempt, maximumAttempts) => {
      const observation = await nativeReaderInteractionObservation(driver);
      console.error(
        `Native reader condition timed out during ${label} (attempt ${String(attempt)} of ${String(maximumAttempts)}): ${JSON.stringify(observation)}`,
      );
    },
  });
}

async function observeSavedPositionRestoration(driver) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  let observation;

  while (Date.now() < deadline) {
    observation = await driver.execute(
      `const statusText =
         document.querySelector(".open-status")?.textContent ?? "";
       const serialized = localStorage.getItem("voxleaf.reader.positions");
       let savedContinuation = false;
       try {
         savedContinuation =
           serialized !== null &&
           JSON.parse(serialized)?.states?.[0]?.locator?.spineItemIndex === 1;
       } catch {
         savedContinuation = false;
       }
       const continuationVisible = Array.from(
         document.querySelectorAll("h1"),
       ).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           heading.getClientRects().length > 0,
       );
       const continuation = Array.from(document.querySelectorAll("h1")).find(
         (heading) => heading.textContent === "Continuation",
       );
       const continuationTop = continuation?.getBoundingClientRect().top;
       const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const readerViewportTop =
         readerViewport?.getBoundingClientRect().top;
       const status =
         statusText === "Reading position restored."
           ? "exact"
           : statusText ===
               "Reading position restored to the nearest available passage."
             ? "recovered"
             : statusText === "" ||
                 statusText === "Validating and opening the selected EPUB."
               ? "opening"
             : statusText === "Restoring saved reader state."
               ? "pending"
               : statusText === "The EPUB opened successfully."
                 ? "book-start"
                 : "other";
       return {
         continuationAligned:
           typeof continuationTop === "number" &&
           typeof readerViewportTop === "number" &&
           Math.abs(continuationTop - (readerViewportTop + 24)) <= 1,
         continuationVisible,
         documentScrolled: (readerViewport?.scrollTop ?? 0) > 0,
         readerBusy:
           document.querySelector(".semantic-reader")
             ?.getAttribute("aria-busy") === "true",
         savedContinuation,
         status,
       };`,
    );
    if (
      observation?.status !== "opening" &&
      observation?.status !== "pending"
    ) {
      return observation;
    }
    await delay(100);
  }

  return observation;
}

async function exerciseNativeReaderInteractionMatrix(driver, setStage) {
  await runNativeReaderInteraction({
    action: async () => {
      await driver.setWindowRect(320, 640);
    },
    condition: `return window.innerWidth <= 360 && window.innerHeight <= 680;`,
    driver,
    label: "narrow viewport settlement",
    setStage,
  });
  setStage("native reader narrow viewport assertion");
  const narrowLayout = await driver.execute(
    `const reader = document.querySelector(".semantic-reader");
     const article = document.querySelector(".semantic-document");
     const controls = document.querySelector(".reader-preferences");
     const scrollOwners = Array.from(
       document.querySelectorAll('[data-reader-scroll-owner="true"]'),
     );
     const scrollOwner = scrollOwners[0];
     const narrationDetailsButton = Array.from(
       document.querySelectorAll(".product-narration button"),
     ).find((button) =>
       button.textContent?.includes("narration details"),
     );
     const bounds = [reader, article, controls].map((element) =>
       element?.getBoundingClientRect(),
     );
     return {
       innerWidth: window.innerWidth,
       compactNarration:
         narrationDetailsButton?.getAttribute("aria-expanded") === "false" &&
         document.querySelector('progress') === null,
       fixedReaderShell:
         scrollOwners.length === 1 &&
         scrollOwner?.scrollHeight > scrollOwner?.clientHeight &&
         document.documentElement.scrollHeight <= window.innerHeight + 1,
       fits:
         window.innerWidth >= 300 &&
         document.documentElement.scrollWidth <= window.innerWidth &&
         bounds.every(
           (rect) =>
             rect !== undefined &&
             rect.left >= -0.5 &&
             rect.right <= window.innerWidth + 0.5,
         ),
     };`,
  );
  assert(
    narrowLayout?.fits === true &&
      narrowLayout.compactNarration === true &&
      narrowLayout.fixedReaderShell === true,
    "Native reader did not fit the approved narrow viewport.",
  );

  const initialUrl = await driver.execute(`return window.location.href;`);
  await runNativeReaderInteraction({
    action: async () => {
      const skipLink = await driver.findElement("a.reader-skip-link");
      await driver.sendKeys(skipLink, WEBDRIVER_ENTER);
    },
    condition: `return document.activeElement?.matches(
       'article.semantic-document[aria-label="Current reading section"]',
     ) === true;`,
    driver,
    label: "skip-link focus transfer",
    setStage,
  });
  setStage("native reader skip-link URL assertion");
  assert(
    (await driver.execute(`return window.location.href;`)) === initialUrl,
    "Native reader skip or return navigation was not keyboard operable.",
  );

  await runNativeReaderInteraction({
    action: async () => {
      const article = await driver.findElement("article.semantic-document");
      await driver.execute(
        `const article = document.querySelector("article.semantic-document");
         const readerViewport = document.querySelector(
           '[data-reader-scroll-owner="true"]',
         );
         if (
           !(article instanceof HTMLElement) ||
           !(readerViewport instanceof HTMLElement)
         ) {
           return false;
         }
         readerViewport.scrollTop = 0;
         article.focus({ preventScroll: true });
         const state = {
           defaultPrevented: undefined,
           keyObserved: false,
           startY: readerViewport.scrollTop,
         };
         globalThis.__voxleafNativePageDownInteraction = state;
         article.addEventListener(
           "keydown",
           (event) => {
             if (event.key !== "PageDown") {
               return;
             }
             state.keyObserved = true;
             queueMicrotask(() => {
               state.defaultPrevented = event.defaultPrevented;
             });
           },
           { once: true },
         );
         return state.startY === 0;`,
      );
      await driver.sendKeys(article, WEBDRIVER_PAGE_DOWN);
    },
    condition: `const state =
       globalThis.__voxleafNativePageDownInteraction;
     return state?.startY === 0 &&
       state.keyObserved === true &&
       state.defaultPrevented === false &&
       document.querySelector(
         '[data-reader-scroll-owner="true"]',
       )?.scrollTop > state.startY;`,
    driver,
    label: "PageDown scrolling",
    setStage,
  });
  setStage("native reader PageDown focus assertion");
  assert(
    (await driver.execute(
      `return document.activeElement?.matches(
         'article.semantic-document[aria-label="Current reading section"]',
       ) === true;`,
    )) === true,
    "Native reader did not preserve native scrolling-key behavior.",
  );
  await driver.execute(
    `delete globalThis.__voxleafNativePageDownInteraction;
     return true;`,
  );

  await runNativeReaderInteraction({
    action: async () => {
      const returnLink = await driver.findElement("a.reader-return-link");
      await driver.sendKeys(returnLink, WEBDRIVER_ENTER);
    },
    condition: `return document.activeElement?.matches(
       'nav.reader-toc[aria-label="Table of contents"]',
     ) === true;`,
    driver,
    label: "return-link focus transfer",
    setStage,
  });
  setStage("native reader return-link URL assertion");
  assert(
    (await driver.execute(`return window.location.href;`)) === initialUrl,
    "Native reader skip or return navigation was not keyboard operable.",
  );

  setStage("native reader preference-control keyboard order");
  const skipLink = await driver.findElement("a.reader-skip-link");
  await driver.sendKeys(skipLink, WEBDRIVER_TAB);
  let textScaleControl = await driver.findElement('select[name="textScale"]');
  assert(
    (await driver.execute(
      `return document.activeElement?.getAttribute("name") === "textScale";`,
    )) === true,
    "Native reader controls did not expose the approved keyboard order.",
  );
  await runNativeReaderInteraction({
    action: async () => {
      textScaleControl = await driver.findElement('select[name="textScale"]');
      await driver.sendKeys(textScaleControl, WEBDRIVER_END);
    },
    condition: `return document.querySelector('select[name="textScale"]')?.value ===
       "extra-large";`,
    driver,
    label: "text-scale keyboard selection",
    setStage,
  });
  setStage("native reader remaining preference-control keyboard order");
  let activeControl = textScaleControl;
  for (const expectedName of ["lineSpacing", "contentWidth", "theme"]) {
    await driver.sendKeys(activeControl, WEBDRIVER_TAB);
    assert(
      (await driver.execute(
        `return document.activeElement?.getAttribute("name") ===
           ${JSON.stringify(expectedName)};`,
      )) === true,
      "Native reader controls did not expose the approved keyboard order.",
    );
    activeControl = await driver.findElement(`select[name="${expectedName}"]`);
  }

  const tocLinks = await driver.findElements("button.reader-toc-link");
  assert(
    tocLinks.length >= 2,
    "Native reader navigation was not keyboard operable.",
  );
  await runNativeReaderInteraction({
    action: async () => {
      const links = await driver.findElements("button.reader-toc-link");
      assert(
        links.length >= 2,
        "Native reader navigation was not keyboard operable.",
      );
      await driver.sendKeys(links[1], WEBDRIVER_ENTER);
    },
    condition: `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Continuation" &&
         document.activeElement === heading,
     );`,
    driver,
    label: "table-of-contents destination focus",
    setStage,
  });
  await runNativeReaderInteraction({
    action: async () => {
      const previousChapter = await driver.findElement(
        '[data-reader-action="previous-chapter"]',
      );
      await driver.sendKeys(previousChapter, WEBDRIVER_SPACE);
    },
    condition: `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Opening" &&
         document.activeElement === heading,
     );`,
    driver,
    label: "previous-chapter destination focus",
    setStage,
  });

  await runNativeReaderInteraction({
    action: async () => {
      assert(
        (await driver.execute(
          `const values = {
             textScale: "extra-large",
             lineSpacing: "spacious",
             contentWidth: "narrow",
             theme: "system",
           };
           for (const [name, value] of Object.entries(values)) {
             const control = document.querySelector(\`select[name="\${name}"]\`);
             if (!(control instanceof HTMLSelectElement)) {
               return false;
             }
             control.value = value;
             control.dispatchEvent(new Event("change", { bubbles: true }));
           }
           return true;`,
        )) === true,
        "Native reader preferences were not persisted or restored.",
      );
    },
    condition: `const serialized = localStorage.getItem(
       "voxleaf.reader.preferences",
     );
     if (serialized === null) {
       return false;
     }
     const preferences = JSON.parse(serialized);
     return preferences?.textScale === "extra-large" &&
       preferences?.lineSpacing === "spacious" &&
       preferences?.contentWidth === "narrow" &&
       preferences?.theme === "system";`,
    driver,
    label: "preference persistence",
    setStage,
  });

  setStage("native reader accessibility media assertion");
  await driver.executeCdp("Emulation.setEmulatedMedia", {
    media: "",
    features: [
      { name: "prefers-color-scheme", value: "dark" },
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "forced-colors", value: "active" },
    ],
  });
  const accessibilityMedia = await driver.execute(
    `const reader = document.querySelector(".semantic-reader");
     const navigation = document.querySelector(".reader-toc");
     if (!(reader instanceof HTMLElement) ||
         !(navigation instanceof HTMLElement)) {
       return undefined;
     }
     navigation.focus({ preventScroll: true });
     const focusStyle = getComputedStyle(navigation);
     return {
       dark: matchMedia("(prefers-color-scheme: dark)").matches,
       forcedColors: matchMedia("(forced-colors: active)").matches,
       reducedMotion: matchMedia(
         "(prefers-reduced-motion: reduce)",
       ).matches,
       colorScheme: getComputedStyle(reader).colorScheme,
       transitionDuration: getComputedStyle(reader).transitionDuration,
       outlineStyle: focusStyle.outlineStyle,
       outlineWidth: Number.parseFloat(focusStyle.outlineWidth),
     };`,
  );
  assert(
    accessibilityMedia?.dark === true &&
      accessibilityMedia.forcedColors === true &&
      accessibilityMedia.reducedMotion === true &&
      accessibilityMedia.colorScheme.includes("dark") &&
      accessibilityMedia.transitionDuration === "0s" &&
      accessibilityMedia.outlineStyle !== "none" &&
      accessibilityMedia.outlineWidth > 0,
    "Native reader accessibility media behavior was unavailable.",
  );
  setStage("native reader zoom assertion");
  await driver.executeCdp("Emulation.setPageScaleFactor", {
    pageScaleFactor: 1.25,
  });
  const zoomedLayout = await driver.execute(
    `const article = document.querySelector(".semantic-document");
     return {
       articleFits:
         article instanceof HTMLElement &&
         article.getBoundingClientRect().right <= window.innerWidth + 0.5,
       documentFits:
         document.documentElement.scrollWidth <= window.innerWidth,
       focusPreserved:
         document.activeElement?.matches(
           'nav.reader-toc[aria-label="Table of contents"]',
         ) === true,
       scale: window.visualViewport?.scale ?? 1,
     };`,
  );
  assert(
    zoomedLayout?.articleFits === true &&
      zoomedLayout.documentFits === true &&
      zoomedLayout.focusPreserved === true &&
      zoomedLayout.scale >= 1.24,
    "Native reader zoom behavior was unavailable.",
  );
  await driver.executeCdp("Emulation.setPageScaleFactor", {
    pageScaleFactor: 1,
  });
  await driver.executeCdp("Emulation.setEmulatedMedia", {
    media: "",
    features: [],
  });
  await driver.setWindowRect(960, 720);
}

async function exerciseNativeSynchronizationFeasibility(driver, setStage) {
  setStage("native synchronization feasibility setup");
  await driver.setWindowRect(800, 400);
  const proof = await driver.execute(
    `const highlights = CSS.highlights;
     if (
       highlights === undefined ||
       typeof globalThis.Highlight !== "function"
     ) {
       return { supported: false };
     }
     const styleRule = Array.from(document.styleSheets)
       .flatMap((sheet) => {
         try {
           return Array.from(sheet.cssRules);
         } catch {
           return [];
         }
       })
       .find(
         (rule) =>
           rule instanceof CSSStyleRule &&
           rule.selectorText ===
             "::highlight(voxleaf-narration-active)",
       );
     const leaves = Array.from(
       document.querySelectorAll(
         ".semantic-document h1, .semantic-document h2, " +
         ".semantic-document h3, .semantic-document h4, " +
         ".semantic-document h5, .semantic-document h6, " +
         ".semantic-document p",
       ),
     );
     const firstText = (element) => {
       if (!(element instanceof HTMLElement)) {
         return undefined;
       }
       const walker = document.createTreeWalker(
         element,
         NodeFilter.SHOW_TEXT,
       );
       const node = walker.nextNode();
       return node instanceof Text ? node : undefined;
     };
     const selectionOwner = leaves[0];
     // Keep this synchronization proof independent from deferred raster
     // presentation. The comprehensive fixture's final paragraph contains a
     // lazy image whose legitimate mount changes DOM and geometry while it
     // enters the viewport.
     const target = [...leaves].reverse().find(
       (element) =>
         element.querySelector(".semantic-raster-host") === null &&
         (firstText(element)?.data.length ?? 0) >= 2,
     );
     const selectionText = firstText(selectionOwner);
     const targetText = firstText(target);
     const selection = document.getSelection();
     const theme = document.querySelector('select[name="theme"]');
     const readerViewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     if (
       selectionText === undefined ||
       targetText === undefined ||
       selectionText.data.length < 2 ||
       targetText.data.length < 2 ||
       selection === null ||
       !(theme instanceof HTMLSelectElement) ||
       !(readerViewport instanceof HTMLElement)
     ) {
       return { supported: true, fixtureReady: false };
     }

     theme.focus({ preventScroll: true });
     const selected = document.createRange();
     selected.setStart(selectionText, 0);
     selected.setEnd(selectionText, 1);
     selection.removeAllRanges();
     selection.addRange(selected);
     const selectionBefore = selection.toString();
     const article = target.closest(".semantic-document");
     const descendantCountBefore = article?.querySelectorAll("*").length;
     const textLengthBefore = article?.textContent?.length;
     const initialUrl = window.location.href;

     const range = document.createRange();
     range.setStart(targetText, 0);
     range.setEnd(targetText, targetText.data.length);
     const highlightName = "voxleaf-narration-active";
     const highlight = new Highlight(range);
     highlights.set(highlightName, highlight);
     const rangeAcceptedBeforePaint =
       highlights.has(highlightName) && highlight.has(range);
     const highlightPerceivableBeforePaint = false;

     readerViewport.scrollTop = 0;
     const readerViewportBounds = readerViewport.getBoundingClientRect();
     const beforeFollow = range.getBoundingClientRect();
     // Keep the comfort band non-empty on short or DPI-scaled WebView2
     // viewports while retaining the frozen 24px maximum on normal windows.
     const comfortInsetPx = Math.min(
       24,
       Math.max(0, readerViewportBounds.height / 4),
     );
     const comfortTop = readerViewportBounds.top + comfortInsetPx;
     const comfortBottom = readerViewportBounds.bottom - comfortInsetPx;
     const outsideBefore =
       beforeFollow.bottom < comfortTop ||
       beforeFollow.top > comfortBottom;
     if (outsideBefore) {
       readerViewport.scrollTop += beforeFollow.top - comfortTop;
     }
     return new Promise((resolve) => {
       let registeredAnimationFrames = 0;
       const observeRenderingOpportunity = () => {
         registeredAnimationFrames += 1;
         if (registeredAnimationFrames < 2) {
           requestAnimationFrame(observeRenderingOpportunity);
           return;
         }
         const afterFollow = range.getBoundingClientRect();
         const renderedStyle = getComputedStyle(
           target,
           "::highlight(voxleaf-narration-active)",
         );
         const parseColor = (value) => {
           const rgb = value.match(
             /^rgba?\\(\\s*(\\d+(?:\\.\\d+)?)\\s*,?\\s*(\\d+(?:\\.\\d+)?)\\s*,?\\s*(\\d+(?:\\.\\d+)?)/u,
           );
           if (rgb !== null) {
             return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
           }
           const hex = value.match(/^#([\\da-f]{6})$/iu);
           if (hex === null) {
             return undefined;
           }
           const packed = Number.parseInt(hex[1], 16);
           return [
             (packed >> 16) & 255,
             (packed >> 8) & 255,
             packed & 255,
           ];
         };
         const luminance = (color) => {
           const channels = color.map((channel) => {
             const normalized = channel / 255;
             return normalized <= 0.04045
               ? normalized / 12.92
               : ((normalized + 0.055) / 1.055) ** 2.4;
           });
           return (
             channels[0] * 0.2126 +
             channels[1] * 0.7152 +
             channels[2] * 0.0722
           );
         };
         const foreground = parseColor(renderedStyle.color);
         const background = parseColor(renderedStyle.backgroundColor);
         const foregroundLuminance =
           foreground === undefined ? undefined : luminance(foreground);
         const backgroundLuminance =
           background === undefined ? undefined : luminance(background);
         const textContrastRatio =
           foregroundLuminance === undefined ||
           backgroundLuminance === undefined
             ? 0
             : (Math.max(
                 foregroundLuminance,
                 backgroundLuminance,
               ) +
                 0.05) /
               (Math.min(
                 foregroundLuminance,
                 backgroundLuminance,
               ) +
                 0.05);
         const hasNonzeroClientGeometry =
           afterFollow.width > 0 && afterFollow.height > 0;
         const insideReaderViewport =
           afterFollow.bottom >= comfortTop - 1 &&
           afterFollow.top <= comfortBottom + 1;
         const hasNonColorUnderline =
           renderedStyle.textDecorationLine.includes("underline") ||
           renderedStyle.textDecoration.includes("underline") ||
           styleRule?.style.textDecorationLine.includes("underline") === true ||
           styleRule?.style.textDecoration.includes("underline") === true;
         const hasExplicitForegroundAndBackground =
           styleRule?.style.color.length !== 0 &&
           styleRule?.style.backgroundColor.length !== 0 &&
           foreground !== undefined &&
           background !== undefined;
         const registeredAcrossRenderingOpportunity =
           highlights.has(highlightName) && highlight.has(range);
         const highlightVisiblyPerceivable =
           rangeAcceptedBeforePaint &&
           registeredAcrossRenderingOpportunity &&
           registeredAnimationFrames >= 2 &&
           hasNonzeroClientGeometry &&
           insideReaderViewport &&
           hasExplicitForegroundAndBackground &&
           textContrastRatio >= 4.5 &&
           hasNonColorUnderline;
         const result = {
           supported: true,
           fixtureReady: true,
           rangeAcceptedBeforePaint,
           highlightPerceivableBeforePaint,
           registeredAcrossRenderingOpportunity,
           registeredAnimationFrames,
           styleRegistered: styleRule !== undefined,
           rangeConnected: target.isConnected && !range.collapsed,
           hasNonzeroClientGeometry,
           insideReaderViewport,
           hasExplicitForegroundAndBackground,
           textContrastRatio,
           hasNonColorUnderline,
           highlightVisiblyPerceivable,
           followed: outsideBefore && insideReaderViewport,
           focusPreserved:
             document.activeElement?.getAttribute("name") === "theme",
           selectionPreserved:
             selection.rangeCount === 1 &&
             selection.toString() === selectionBefore &&
             selection.getRangeAt(0) === selected,
           publicationDomUnchanged:
             article?.querySelectorAll("*").length ===
               descendantCountBefore &&
             article?.textContent?.length === textLengthBefore,
           urlUnchanged: window.location.href === initialUrl,
         };
         highlights.delete(highlightName);
         selection.removeAllRanges();
         resolve(result);
       };
       requestAnimationFrame(observeRenderingOpportunity);
     });`,
  );
  await driver.setWindowRect(960, 720);

  setStage("native synchronization feasibility assertion");
  if (
    proof?.supported !== true ||
    proof.fixtureReady !== true ||
    proof.rangeAcceptedBeforePaint !== true ||
    proof.highlightPerceivableBeforePaint !== false ||
    proof.registeredAcrossRenderingOpportunity !== true ||
    proof.registeredAnimationFrames < 2 ||
    proof.styleRegistered !== true ||
    proof.rangeConnected !== true ||
    proof.hasNonzeroClientGeometry !== true ||
    proof.insideReaderViewport !== true ||
    proof.hasExplicitForegroundAndBackground !== true ||
    proof.textContrastRatio < 4.5 ||
    proof.hasNonColorUnderline !== true ||
    proof.highlightVisiblyPerceivable !== true ||
    proof.followed !== true ||
    proof.focusPreserved !== true ||
    proof.selectionPreserved !== true ||
    proof.publicationDomUnchanged !== true ||
    proof.urlUnchanged !== true
  ) {
    console.error(
      `Native synchronization feasibility observation: ${JSON.stringify(proof)}`,
    );
  }
  assert(
    proof?.supported === true &&
      proof.fixtureReady === true &&
      proof.rangeAcceptedBeforePaint === true &&
      proof.highlightPerceivableBeforePaint === false &&
      proof.registeredAcrossRenderingOpportunity === true &&
      proof.registeredAnimationFrames >= 2 &&
      proof.styleRegistered === true &&
      proof.rangeConnected === true &&
      proof.hasNonzeroClientGeometry === true &&
      proof.insideReaderViewport === true &&
      proof.hasExplicitForegroundAndBackground === true &&
      proof.textContrastRatio >= 4.5 &&
      proof.hasNonColorUnderline === true &&
      proof.highlightVisiblyPerceivable === true &&
      proof.followed === true &&
      proof.focusPreserved === true &&
      proof.selectionPreserved === true &&
      proof.publicationDomUnchanged === true &&
      proof.urlUnchanged === true,
    "Native synchronization feasibility proof failed.",
  );
}

async function beginNativeRenderInstrumentation(driver) {
  const startedAt = await driver.execute(
    `const originalRequestAnimationFrame =
       globalThis.__voxleafNativeOriginalRequestAnimationFrame ??
       globalThis.requestAnimationFrame.bind(globalThis);
     if (globalThis.__voxleafNativeOriginalRequestAnimationFrame === undefined) {
       Object.defineProperty(
         globalThis,
         "__voxleafNativeOriginalRequestAnimationFrame",
         { configurable: false, value: originalRequestAnimationFrame },
       );
       globalThis.requestAnimationFrame = (callback) =>
         originalRequestAnimationFrame((timestamp) => {
           const instrumentation =
             globalThis.__voxleafNativeRenderInstrumentation;
           const callbackStartedAt = performance.now();
           if (instrumentation?.active === true) {
             instrumentation.pendingBatchStartedAt = callbackStartedAt;
           }
           callback(timestamp);
           if (instrumentation?.active === true) {
             instrumentation.callbackDurations.push(
               performance.now() - callbackStartedAt,
             );
           }
         });
     }
     globalThis.__voxleafNativeRenderObserver?.disconnect();
     const instrumentation = {
       active: true,
       selectionStartedAt: performance.now(),
       firstContentAt: 0,
       completeAt: 0,
       callbackDurations: [],
       pendingBatchStartedAt: 0,
       batchCommitDurations: [],
       previousRenderedBlocks: 0,
     };
     Object.defineProperty(
       globalThis,
       "__voxleafNativeRenderInstrumentation",
       { configurable: true, value: instrumentation },
     );
     const observeProgress = () => {
       const article = document.querySelector(".semantic-document");
       const renderedBlocks = article?.children.length ?? 0;
       if (renderedBlocks > 0 && instrumentation.firstContentAt === 0) {
         instrumentation.firstContentAt = performance.now();
       }
       if (
         renderedBlocks === 10000 &&
         document.querySelector(".reader-rendering-status") === null
       ) {
         instrumentation.completeAt = performance.now();
       }
       if (
         renderedBlocks > instrumentation.previousRenderedBlocks &&
         instrumentation.previousRenderedBlocks > 0 &&
         instrumentation.pendingBatchStartedAt > 0
       ) {
         instrumentation.batchCommitDurations.push(
           performance.now() - instrumentation.pendingBatchStartedAt,
         );
         instrumentation.pendingBatchStartedAt = 0;
       }
       instrumentation.previousRenderedBlocks = renderedBlocks;
     };
     const observer = new MutationObserver(observeProgress);
     observer.observe(document.body, { childList: true, subtree: true });
     Object.defineProperty(
       globalThis,
       "__voxleafNativeRenderObserver",
       { configurable: true, value: observer },
     );
     return instrumentation.selectionStartedAt;`,
  );
  assert(
    Number.isFinite(startedAt),
    "Native reader performance metrics were unavailable.",
  );
  return startedAt;
}

async function finishNativeRenderInstrumentation(driver) {
  const measurement = await driver.execute(
    `const instrumentation =
       globalThis.__voxleafNativeRenderInstrumentation;
     globalThis.__voxleafNativeRenderObserver?.disconnect();
     if (instrumentation === undefined) {
       return undefined;
     }
     instrumentation.active = false;
     return {
       selectionStartedAt: instrumentation.selectionStartedAt,
       firstContentAt: instrumentation.firstContentAt,
       completeAt: instrumentation.completeAt,
       callbackDurations: [...instrumentation.callbackDurations],
       batchCommitDurations: [...instrumentation.batchCommitDurations],
     };`,
  );
  assert(
    measurement !== undefined &&
      measurement.firstContentAt > measurement.selectionStartedAt &&
      measurement.completeAt > measurement.firstContentAt,
    "Native reader performance metrics were unavailable.",
  );
  return measurement;
}

async function closeNativePublication(driver) {
  assert(
    (await driver.execute(
      `const closeButton = document.querySelector("button.close-publication");
       if (!(closeButton instanceof HTMLButtonElement)) {
         return false;
       }
       closeButton.click();
       return true;`,
    )) === true,
    "Native reader performance metrics were unavailable.",
  );
  await waitForCondition(
    driver,
    `return document.querySelector('[role="status"]')?.textContent ===
       "No local EPUB is open.";`,
  );
}

async function runNativeReaderPerformanceBenchmark(
  driver,
  fixtures,
  rootProcessId,
  setStage,
) {
  setStage("native reader performance instrumentation");
  await driver.setWindowRect(1_280, 720);
  await installNativeResourceInstrumentation(driver);
  await driver.execute(
    `localStorage.removeItem("voxleaf.reader.positions");
     localStorage.removeItem("voxleaf.reader.preferences");
     return true;`,
  );
  setStage("native reader baseline memory measurement");
  const baseline = await nativeMemorySnapshot(
    driver,
    rootProcessId,
    setStage,
    "native reader baseline",
  );

  setStage("native exact-limit render measurement");
  await beginNativeRenderInstrumentation(driver);
  const exactInput = await driver.findElement('input[type="file"]');
  await driver.sendKeys(exactInput, fixtures.exact);
  await waitForCondition(
    driver,
    `const article = document.querySelector(".semantic-document");
     return article !== null && article.children.length >= 250;`,
  );
  const deepTargetLinks = await driver.execute(
    `return document.querySelectorAll("button.reader-toc-link").length;`,
  );
  assert(
    deepTargetLinks >= 2,
    "Native reader performance metrics were unavailable.",
  );
  const targetStartedAt = await driver.execute(`return performance.now();`);
  await driver.execute(
    `document.querySelectorAll("button.reader-toc-link")[1]?.click();
     return true;`,
  );
  await waitForCondition(
    driver,
    `return Array.from(document.querySelectorAll("h2")).some(
       (heading) =>
         heading.textContent === "Deep target" &&
         document.activeElement === heading,
     );`,
  );
  const targetReadyMs =
    (await driver.execute(`return performance.now();`)) - targetStartedAt;
  await waitForCondition(
    driver,
    `const article = document.querySelector(".semantic-document");
     return article?.children.length === 10000 &&
       document.querySelector(".reader-rendering-status") === null;`,
  );
  const renderInstrumentation = await finishNativeRenderInstrumentation(driver);
  const exactFinal = await nativeMemorySnapshot(
    driver,
    rootProcessId,
    setStage,
    "native exact-limit final",
  );
  const exactMemoryDelta = memoryDelta(baseline, exactFinal);
  const maximumBatchScriptMs = Math.max(
    0,
    ...renderInstrumentation.batchCommitDurations,
  );
  const maximumSchedulerCallbackMs = Math.max(
    0,
    ...renderInstrumentation.callbackDurations,
  );
  const selectionToFirstContentMs =
    renderInstrumentation.firstContentAt -
    renderInstrumentation.selectionStartedAt;
  const incrementalAppendMs =
    renderInstrumentation.completeAt - renderInstrumentation.firstContentAt;
  const preferenceReflowMs = await driver.execute(
    `return new Promise((resolve, reject) => {
       const select = document.querySelector('select[name="textScale"]');
       if (!(select instanceof HTMLSelectElement)) {
         reject(new Error("reader-preference-unavailable"));
         return;
       }
       const startedAt = performance.now();
       select.value = "large";
       select.dispatchEvent(new Event("change", { bubbles: true }));
       requestAnimationFrame(() =>
         requestAnimationFrame(() =>
           requestAnimationFrame(() => resolve(performance.now() - startedAt)),
         ),
       );
     });`,
  );
  setStage("native exact-limit assertions");
  assert(
    maximumBatchScriptMs <= NATIVE_BATCH_SCRIPT_LIMIT_MS &&
      targetReadyMs <= NATIVE_TARGET_READY_LIMIT_MS &&
      incrementalAppendMs <= NATIVE_TOTAL_RENDER_LIMIT_MS &&
      preferenceReflowMs <= NATIVE_REFLOW_LIMIT_MS &&
      exactMemoryDelta.domNodes <= NATIVE_LIVE_DOM_NODE_LIMIT &&
      exactMemoryDelta.workingSetBytes <=
        NATIVE_COMBINED_WORKING_SET_LIMIT_BYTES,
    "Native reader exceeded the approved performance limits.",
  );
  await closeNativePublication(driver);
  await delay(OBSERVATION_WINDOW_MS);
  const exactClosedResources = await nativeResourceInstrumentation(driver);
  assert(
    exactClosedResources.activeIntersectionObservers === 0 &&
      exactClosedResources.activeObjectUrls === 0 &&
      exactClosedResources.activeResizeObservers === 0,
    "Native reader resources remained active after close.",
  );

  const closedSnapshots = [];
  const cycleReports = [];
  for (let cycle = 0; cycle < NATIVE_RESOURCE_STRESS_CYCLES; cycle += 1) {
    setStage(`native reader resource cycle ${String(cycle + 1)}`);
    const openStartedAt = await driver.execute(`return performance.now();`);
    const fileInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(fileInput, fixtures.representative);
    await waitForCondition(
      driver,
      `return document.querySelector(".semantic-document") !== null &&
         document.querySelector(".open-status")?.textContent !==
           "Validating and opening the selected EPUB." &&
         document.querySelector(".open-status")?.textContent !==
           "Restoring saved reader state.";`,
    );
    const openMs =
      (await driver.execute(`return performance.now();`)) - openStartedAt;
    if (cycle > 0) {
      assert(
        (await driver.execute(
          `return document.querySelector(".open-status")?.textContent ===
             "Reading position restored.";`,
        )) === true && openMs <= NATIVE_TARGET_READY_LIMIT_MS,
        "Native reader exceeded the approved performance limits.",
      );
    }

    const tocLinks = await driver.execute(
      `return document.querySelectorAll("button.reader-toc-link").length;`,
    );
    assert(
      tocLinks >= 2,
      "Native reader performance metrics were unavailable.",
    );
    await driver.execute(
      `document.querySelectorAll("button.reader-toc-link")[0]?.click();
       return true;`,
    );
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h1")).some(
         (heading) => heading.textContent === "Opening",
       );`,
    );
    await driver.execute(
      `document.querySelector(".semantic-raster-host")
         ?.scrollIntoView({ block: "center" });
       return true;`,
    );
    await waitForCondition(
      driver,
      `const image = document.querySelector('img[alt="Synthetic cover"]');
       return image !== null &&
         image.src.startsWith("blob:") &&
         image.getClientRects().length > 0;`,
    );

    const chapterStartedAt = await driver.execute(`return performance.now();`);
    await driver.execute(
      `document.querySelectorAll("button.reader-toc-link")[1]?.click();
       return true;`,
    );
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h1")).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           document.activeElement === heading,
       );`,
    );
    const chapterMs =
      (await driver.execute(`return performance.now();`)) - chapterStartedAt;
    assert(
      chapterMs <= NATIVE_TARGET_READY_LIMIT_MS,
      "Native reader exceeded the approved performance limits.",
    );
    await waitForCondition(
      driver,
      `const serialized = localStorage.getItem("voxleaf.reader.positions");
       if (serialized === null) {
         return false;
       }
       try {
         return JSON.parse(serialized)?.states?.[0]?.locator
           ?.spineItemIndex === 1;
       } catch {
         return false;
       }`,
    );

    await closeNativePublication(driver);
    await delay(OBSERVATION_WINDOW_MS);
    const settledResources = await nativeResourceInstrumentation(driver);
    assert(
      settledResources.activeIntersectionObservers === 0 &&
        settledResources.activeObjectUrls === 0 &&
        settledResources.activeResizeObservers === 0 &&
        (await driver.findElements(".semantic-reader")).length === 0,
      "Native reader resources remained active after close.",
    );
    const storageWritesAfterClose = settledResources.storageWrites;
    await delay(OBSERVATION_WINDOW_MS);
    assert(
      (await nativeResourceInstrumentation(driver)).storageWrites ===
        storageWritesAfterClose,
      "Native reader resources remained active after close.",
    );
    const closedSnapshot = await nativeMemorySnapshot(
      driver,
      rootProcessId,
      setStage,
      `native reader resource cycle ${String(cycle + 1)} closed`,
    );
    setStage(`native reader resource cycle ${String(cycle + 1)} assertions`);
    closedSnapshots.push(closedSnapshot);
    assert(
      closedSnapshot.domNodes <= baseline.domNodes + 256,
      "Native reader resources remained active after close.",
    );
    cycleReports.push({
      cycle: cycle + 1,
      openMs: rounded(openMs),
      restoreMs: cycle === 0 ? null : rounded(openMs),
      chapterMs: rounded(chapterMs),
      closedMemoryDelta: memoryDelta(baseline, closedSnapshot),
      storageWrites: storageWritesAfterClose,
    });
  }

  const firstClosed = closedSnapshots[0];
  const lastClosed = closedSnapshots.at(-1);
  assert(
    firstClosed !== undefined &&
      lastClosed !== undefined &&
      lastClosed.jsHeapBytes <=
        firstClosed.jsHeapBytes + NATIVE_RESOURCE_HEAP_GROWTH_LIMIT_BYTES &&
      lastClosed.workingSetBytes <=
        firstClosed.workingSetBytes +
          NATIVE_RESOURCE_WORKING_SET_GROWTH_LIMIT_BYTES,
    "Native reader resources remained active after close.",
  );

  setStage("native over-limit recovery measurement");
  const overLimitInput = await driver.findElement('input[type="file"]');
  await driver.sendKeys(overLimitInput, fixtures.overLimit);
  await waitForCondition(
    driver,
    `const article = document.querySelector(
       ".semantic-document.reader-chapter-too-large",
     );
     return article?.children.length === 3 &&
       document.querySelector(".reader-rendering-status") === null;`,
  );
  const recoveryInput = await driver.findElement('input[type="file"]');
  await driver.sendKeys(recoveryInput, fixtures.representative);
  await waitForCondition(
    driver,
    `return document.querySelector(
       ".semantic-document:not(.reader-chapter-too-large)",
     ) !== null;`,
  );
  await closeNativePublication(driver);
  await delay(OBSERVATION_WINDOW_MS);
  const finalResources = await nativeResourceInstrumentation(driver);
  const storageBounds = await driver.execute(
    `const positions = localStorage.getItem("voxleaf.reader.positions");
     const preferences = localStorage.getItem("voxleaf.reader.preferences");
     let positionCount;
     try {
       positionCount =
         positions === null ? 0 : JSON.parse(positions).states.length;
     } catch {
       positionCount = -1;
     }
     return {
       positionsLength: positions?.length ?? 0,
       preferencesLength: preferences?.length ?? 0,
       positionCount,
       unexpectedReaderKeys: Object.keys(localStorage).filter(
         (key) =>
           key.startsWith("voxleaf.reader.") &&
           key !== "voxleaf.reader.positions" &&
           key !== "voxleaf.reader.preferences",
       ).length,
     };`,
  );
  assert(
    finalResources.activeIntersectionObservers === 0 &&
      finalResources.activeObjectUrls === 0 &&
      finalResources.activeResizeObservers === 0 &&
      storageBounds.positionCount >= 0 &&
      storageBounds.positionCount <= 128 &&
      storageBounds.positionsLength <= 262_144 &&
      storageBounds.preferencesLength <= 1_024 &&
      storageBounds.unexpectedReaderKeys === 0,
    "Native over-limit reader recovery failed.",
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
  setStage("native performance privacy assertions");
  await delay(OBSERVATION_WINDOW_MS);
  const browserLogs = await driver.getLogs("browser");
  const performanceLogs = inspectPerformanceLogs(
    await driver.getLogs("performance"),
  );
  assert(
    browserLogs.every((entry) => entry?.level !== "SEVERE") &&
      performanceLogs.runtimeErrorCount === 0 &&
      externalLoadedResourceCount === 0 &&
      performanceLogs.externalRequestCount === 0,
    performanceLogs.externalRequestCount > 0 || externalLoadedResourceCount > 0
      ? "Native application attempted an external request."
      : "Native application emitted a page or console error.",
  );

  console.log(
    `NATIVE_READER_PERFORMANCE_BENCHMARK ${JSON.stringify({
      exactLimit: {
        blockCount: 10_000,
        selectionToFirstContentMs: rounded(selectionToFirstContentMs),
        maximumSchedulerCallbackMs: rounded(maximumSchedulerCallbackMs),
        maximumBatchScriptMs: rounded(maximumBatchScriptMs),
        targetReadyMs: rounded(targetReadyMs),
        incrementalAppendMs: rounded(incrementalAppendMs),
        preferenceReflowMs: rounded(preferenceReflowMs),
        memoryDelta: exactMemoryDelta,
      },
      resourceStress: {
        cycles: NATIVE_RESOURCE_STRESS_CYCLES,
        cycleReports,
        firstToLastClosedDelta: {
          domNodes: lastClosed.domNodes - firstClosed.domNodes,
          jsHeapBytes: Math.max(
            0,
            lastClosed.jsHeapBytes - firstClosed.jsHeapBytes,
          ),
          workingSetBytes: Math.max(
            0,
            lastClosed.workingSetBytes - firstClosed.workingSetBytes,
          ),
        },
        finalResources,
        storageBounds,
      },
    })}`,
  );
}

function inspectPerformanceLogs(logs) {
  let externalRequestCount = 0;
  let runtimeErrorCount = 0;

  for (const entry of logs) {
    if (typeof entry?.message !== "string") {
      throw new Error("Native driver logs were invalid.");
    }

    let message;
    try {
      message = JSON.parse(entry.message)?.message;
    } catch {
      throw new Error("Native driver logs were invalid.");
    }

    if (
      message?.method === "Network.requestWillBeSent" &&
      !isLocalApplicationUrl(message.params?.request?.url)
    ) {
      externalRequestCount += 1;
    }
    if (
      message?.method === "Runtime.exceptionThrown" ||
      (message?.method === "Log.entryAdded" &&
        message.params?.entry?.level === "error")
    ) {
      runtimeErrorCount += 1;
    }
  }

  return { externalRequestCount, runtimeErrorCount };
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
  const fileIngressFixturePaths = Object.freeze({
    exactLimit: path.join(temporaryDirectory, "exact-limit.epub"),
    overLimit: path.join(temporaryDirectory, "over-limit-file.epub"),
    primary: fixturePath,
    replacement: path.join(temporaryDirectory, "replacement.epub"),
  });
  const performanceFixturePaths = Object.freeze({
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
    const boundedSyntheticSentence =
      "Esta narraci&#243;n sint&#233;tica describe una biblioteca tranquila y una lectura local. Cada frase valida transiciones naturales, memoria limitada y orden.";
    const syntheticParagraph =
      ADAPTIVE_TTS_PROFILE_ID === PIPER_CPU_FALLBACK_PROFILE_ID
        ? Array.from(
            { length: 3 },
            (_, index) =>
              `${boundedSyntheticSentence} Parte ${String(index + 1)}.`,
          ).join(" ")
        : boundedSyntheticSentence;
    const chapterParagraphs = (chapter) =>
      Array.from(
        { length: 96 },
        (_, index) =>
          `<p>${syntheticParagraph} Cap&#237;tulo ${String(
            chapter,
          )}, secci&#243;n ${String(index + 1)}.</p>`,
      ).join("");
    const adaptiveFixture = await buildMinimalEpubFixture({
      packageDocument:
        '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:adaptive-synchronization</dc:identifier><dc:title>Synthetic synchronized narration</dc:title><dc:language>es</dc:language><meta property="dcterms:modified">2026-07-27T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter-one" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="chapter-two" href="text/chapter-two.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter-one"/><itemref idref="chapter-two"/></spine></package>',
      navigationDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">First synthetic section</a></li><li><a href="text/chapter-two.xhtml#chapter-two">Second synthetic section</a></li></ol></nav></body></html>',
      chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es"><head><title>Primera secci&#243;n</title></head><body><h1 id="chapter-one">Primera secci&#243;n</h1>${chapterParagraphs(
        1,
      )}</body></html>`,
      additionalEntries: [
        Object.freeze({
          name: "EPUB/text/chapter-two.xhtml",
          content: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es"><head><title>Segunda secci&#243;n</title></head><body><h1 id="chapter-two">Segunda secci&#243;n</h1>${chapterParagraphs(
            2,
          )}</body></html>`,
          compression: "deflate",
        }),
      ],
    });
    await writeFile(fixturePath, adaptiveFixture, { flag: "wx" });
  } else {
    const [primaryFixture, replacementFixture] = await Promise.all([
      buildReaderNavigationEpubFixture(),
      buildReaderReflowEpubFixture({
        paragraphCount: 4,
        preservedPassageIndex: 2,
      }),
    ]);
    await Promise.all([
      writeFile(fixturePath, primaryFixture, { flag: "wx" }),
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
    if (ADAPTIVE_TTS_EXACT_HOST_MODE) {
      stage = "adaptive exact-host profile selection";
      const profileSelected = await selectAdaptiveTtsProfile(
        driver,
        ADAPTIVE_TTS_PROFILE_ID,
      );
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
           heading.textContent === "Synthetic comprehensive publication" &&
           heading.getClientRects().length > 0,
       );`,
    );
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

    stage = "synthetic publication close";
    const closeButton = await driver.findElement("button.close-publication");
    await driver.click(closeButton);
    await waitForCondition(
      driver,
      `return document.querySelector('[role="status"]')?.textContent ===
         "No local EPUB is open.";`,
    );
    assert(
      (await driver.findElements('img[alt="Synthetic cover"]')).length === 0,
      "Native publication raster image remained mounted after close.",
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
      "Native startup smoke passed: root mounted, bounded TTS protocol and supervised fake-service lifecycle passed with binary delivery/cancellation/crash recovery, local file reselection/cancellation/replacement and exact/max-plus-one boundaries passed, narrow and accessible keyboard reader matrix and synchronization feasibility proof passed, synthetic EPUB image decoded locally, exact position and preferences survived restart/reselection, publication closed, no errors, no external requests.",
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

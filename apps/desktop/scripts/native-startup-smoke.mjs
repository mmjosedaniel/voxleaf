import console from "node:console";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, open, rm, writeFile } from "node:fs/promises";
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
      url.protocol === "data:" ||
      url.protocol === "blob:" ||
      url.hostname === "tauri.localhost"
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
             document.documentElement.scrollHeight - window.innerHeight,
           ),
           y: window.scrollY,
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
           Math.abs(continuationTop - 24) <= 1,
         continuationVisible,
         documentScrolled: window.scrollY > 0,
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
     const bounds = [reader, article, controls].map((element) =>
       element?.getBoundingClientRect(),
     );
     return {
       innerWidth: window.innerWidth,
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
    narrowLayout?.fits === true,
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
      await driver.execute(`window.scrollTo(0, 0);`);
    },
    condition: `return window.scrollY === 0;`,
    driver,
    label: "PageDown scroll precondition",
    setStage,
  });
  const scrollBefore = await driver.execute(`return window.scrollY;`);
  await runNativeReaderInteraction({
    action: async () => {
      const article = await driver.findElement("article.semantic-document");
      await driver.sendKeys(article, WEBDRIVER_PAGE_DOWN);
    },
    condition: `return window.scrollY > ${Number(scrollBefore)};`,
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
        ".reader-chapter-controls button:first-child",
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
           url.protocol === "data:" ||
           url.protocol === "blob:" ||
           url.hostname === "tauri.localhost"
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
             url.protocol === "data:" ||
             url.protocol === "blob:" ||
             url.hostname === "tauri.localhost"
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
      "Native startup smoke passed: root mounted, local file reselection/cancellation/replacement and exact/max-plus-one boundaries passed, narrow and accessible keyboard reader matrix passed, synthetic EPUB image decoded locally, exact position and preferences survived restart/reselection, publication closed, no errors, no external requests.",
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

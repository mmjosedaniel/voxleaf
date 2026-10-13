import { execFile as executeFile } from "node:child_process";
import { readdir as readDirectory } from "node:fs/promises";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import { URL } from "node:url";
import { assertNativeSmokeInvariants } from "../native-smoke-invariants.mjs";

export function createNativeResourceObservation({
  assert,
  INTERACTION_TIMEOUT_MS,
  MEBIBYTE,
  execFile = executeFile,
  readdir = readDirectory,
  delay = wait,
  now = () => Date.now(),
  setInterval = (...args) => globalThis.setInterval(...args),
  clearInterval = (timer) => globalThis.clearInterval(timer),
}) {
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
    const performanceMetrics = await driver.executeCdp(
      "Performance.getMetrics",
    );
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
    const startedAtMs = now();
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
          releaseMs: now() - startedAtMs,
          workingSetBytes,
        });
      }
      await delay(250);
    } while (now() < deadline);

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
    const timer = setInterval(() => {
      const pending = sample();
      activeSamples.add(pending);
      void pending.finally(() => activeSamples.delete(pending));
    }, 5_000);
    timer.unref();
    return Object.freeze({
      async stop() {
        clearInterval(timer);
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

  return {
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
    isLocalApplicationUrl,
    inspectPerformanceLogs,
  };
}

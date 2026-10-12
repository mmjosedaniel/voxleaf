import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import console from "node:console";
import { readFile } from "node:fs/promises";
import process from "node:process";
import test from "node:test";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";

import { createNativeResourceObservation } from "./native-smoke/resource-observation.mjs";
import { createNativeReaderScenarios } from "./native-smoke/reader-scenarios.mjs";
import { createNativeTtsScenarios } from "./native-smoke/tts-scenarios.mjs";
import { WebDriverClientError } from "./native-webdriver-client.mjs";

function smokeAssert(condition, message) {
  if (!condition) throw new Error(message);
}

const resources = (overrides = {}) =>
  createNativeResourceObservation({
    assert: smokeAssert,
    INTERACTION_TIMEOUT_MS: 500,
    MEBIBYTE: 1_048_576,
    ...overrides,
  });
const metricsFailure = {
  message: "Native reader performance metrics were unavailable.",
};
const narrationFailure = {
  message: "Native synchronized narration proof failed.",
};

test("calculation boundaries preserve nearest-rank p95 and signed DOM deltas", () => {
  const { rounded, percentile95, memoryDelta } = resources();
  assert.equal(rounded(1.236), 1.24);
  assert.equal(rounded(-1.236), -1.24);
  const values = Array.from({ length: 20 }, (_, index) => 20 - index);
  assert.equal(percentile95(values), 19);
  assert.equal(values[0], 20);
  assert.equal(percentile95([0]), 0);
  for (const invalid of [null, [], [-1], [NaN], [Infinity]]) {
    assert.throws(() => percentile95(invalid), narrationFailure);
  }
  const delta = memoryDelta(
    { domNodes: 10, jsHeapBytes: 20, workingSetBytes: 30 },
    { domNodes: 5, jsHeapBytes: 10, workingSetBytes: 31 },
  );
  assert.deepEqual(delta, { domNodes: -5, jsHeapBytes: 0, workingSetBytes: 1 });
  assert.ok(Object.isFrozen(delta));
});

test("audio-file observation traverses directories, ignores links, and preserves read failures", async () => {
  const entry = (name, kind) => ({
    name,
    isDirectory: () => kind === "directory",
    isFile: () => kind === "file",
  });
  const subject = resources({
    readdir: async (directory, options) => {
      assert.deepEqual(options, { withFileTypes: true });
      if (directory === "root")
        return [
          entry("nested", "directory"),
          entry("one.WAV", "file"),
          entry("book.epub", "file"),
          entry("link.mp3", "link"),
        ];
      return [entry("two.pcm", "file"), entry("three.ogg", "file")];
    },
  });
  assert.equal(await subject.generatedAudioFileCount("root"), 3);
  assert.equal(
    await resources({
      readdir: async () => {
        throw Object.assign(new Error(), { code: "ENOENT" });
      },
    }).generatedAudioFileCount("absent"),
    0,
  );
  const denied = Object.assign(new Error("private path"), { code: "EACCES" });
  await assert.rejects(
    resources({
      readdir: async () => {
        throw denied;
      },
    }).generatedAudioFileCount("root"),
    (error) => error === denied,
  );
});

test("URL and performance-log observations retain exact local classification", () => {
  const { isLocalApplicationUrl, inspectPerformanceLogs } = resources();
  for (const url of [
    "tauri://localhost",
    "ipc://localhost",
    "data:text/plain,synthetic",
    "blob:https://external.invalid/id",
    "http://tauri.localhost/path",
    "https://ipc.localhost/path",
  ])
    assert.equal(isLocalApplicationUrl(url), true);
  for (const url of [
    undefined,
    "relative",
    "https://example.invalid",
    "http://127.0.0.1",
    "http://tauri.localhost.example.invalid",
  ])
    assert.equal(isLocalApplicationUrl(url), false);
  const log = (message) => ({ message: JSON.stringify({ message }) });
  assert.deepEqual(
    inspectPerformanceLogs([
      log({
        method: "Network.requestWillBeSent",
        params: { request: { url: "tauri://localhost" } },
      }),
      log({
        method: "Network.requestWillBeSent",
        params: { request: { url: "https://external.invalid" } },
      }),
      log({ method: "Network.requestWillBeSent" }),
      log({ method: "Runtime.exceptionThrown" }),
      log({ method: "Log.entryAdded", params: { entry: { level: "error" } } }),
      log({
        method: "Log.entryAdded",
        params: { entry: { level: "warning" } },
      }),
      log({ method: "unknown" }),
    ]),
    { externalRequestCount: 2, runtimeErrorCount: 2 },
  );
  for (const invalid of [null, {}, { message: 1 }, { message: "{" }])
    assert.throws(() => inspectPerformanceLogs([invalid]), {
      message: "Native driver logs were invalid.",
    });
  assert.deepEqual(inspectPerformanceLogs([{ message: "null" }]), {
    externalRequestCount: 0,
    runtimeErrorCount: 0,
  });
});

function controlledSampler() {
  const pending = [];
  const events = [];
  let tick;
  const timer = { unref: () => events.push("unref") };
  const subject = resources({
    execFile: (file, _args, _options, callback) =>
      pending.push({ file, callback }),
    setInterval: (callback, interval) => {
      assert.equal(interval, 5_000);
      tick = callback;
      return timer;
    },
    clearInterval: (value) => {
      assert.equal(value, timer);
      events.push("clear");
    },
  });
  const complete = (index, error = null) => {
    const { file, callback } = pending[index];
    callback(error, file === "powershell.exe" ? "4096" : "128,40,55,P8,0");
  };
  return { subject, pending, events, complete, tick: () => tick() };
}

test("sampler starts immediately, unreferences its timer, and drains timed samples on stop", async () => {
  const f = controlledSampler();
  const sampler = f.subject.startAdaptiveResourceSampler(1);
  assert.equal(f.pending.length, 2);
  assert.deepEqual(f.events, ["unref"]);
  f.tick();
  assert.equal(f.pending.length, 4);
  let settled = false;
  const stopping = sampler.stop().then((samples) => {
    settled = true;
    return samples;
  });
  assert.deepEqual(f.events, ["unref", "clear"]);
  f.complete(0);
  f.complete(1);
  await Promise.resolve();
  assert.equal(settled, false);
  f.complete(2);
  f.complete(3);
  const samples = await stopping;
  assert.equal(samples.length, 2);
  assert.equal(samples[0].workingSetBytes, 4096);
  assert.equal(samples[1].gpu.dedicatedMemoryMiB, 128);
  assert.ok(Object.isFrozen(samples) && samples.every(Object.isFrozen));
});

test("sampler retains immediate or stop-time failure despite another successful sample", async () => {
  for (const failureIndex of [0, 2]) {
    const f = controlledSampler();
    const sampler = f.subject.startAdaptiveResourceSampler(1);
    f.tick();
    const stopping = sampler.stop();
    const rejected = assert.rejects(stopping, metricsFailure);
    for (let index = 0; index < 4; index += 1)
      f.complete(
        index,
        index === failureIndex ? new Error("private hardware detail") : null,
      );
    await rejected;
    assert.deepEqual(f.events, ["unref", "clear"]);
  }
});

test("cleanup admits exact resource bounds and polls at 250 ms before reporting fixed failures", async () => {
  for (const [gpu, workingSet, expectedCode] of [
    [512, 100 + 512 * 1_048_576, undefined],
    [513, 100, "native-invariant-cleanup-gpu-released"],
    [
      512,
      101 + 512 * 1_048_576,
      "native-invariant-cleanup-working-set-released",
    ],
  ]) {
    let clock = 0;
    const waits = [];
    const subject = resources({
      now: () => clock,
      delay: async (ms) => {
        waits.push(ms);
        clock += ms;
      },
      execFile: (file, _args, _options, callback) =>
        callback(
          null,
          file === "powershell.exe" ? String(workingSet) : `${gpu},40,55,P8,0`,
        ),
    });
    const result = subject.waitForAdaptiveResourceCleanup(1, 100, {
      dedicatedMemoryMiB: 0,
    });
    if (expectedCode === undefined) {
      assert.equal((await result).releaseMs, 0);
      assert.deepEqual(waits, []);
    } else {
      await assert.rejects(result, (error) => error.code === expectedCode);
      assert.deepEqual(waits, [250, 250]);
    }
  }
});

test("TTS startup polling preserves its interval, timeout, and early failure", async (t) => {
  t.mock.method(console, "error", () => undefined);
  for (const mode of ["playing", "timeout", "failed"]) {
    let clock = 0;
    let calls = 0;
    const waits = [];
    const subject = createNativeTtsScenarios({
      assert: smokeAssert,
      now: () => clock,
      delay: async (ms) => {
        waits.push(ms);
        clock += ms;
      },
    });
    const driver = {
      execute: async () => ({
        failure: "none",
        playIntent: "playing",
        phase:
          mode === "failed"
            ? "failed"
            : mode === "playing" && calls++ > 0
              ? "playing"
              : "preparing",
      }),
    };
    const pending = subject.waitForAdaptivePlaying(driver, 500);
    if (mode === "playing") assert.equal((await pending).phase, "playing");
    else await assert.rejects(pending, narrationFailure);
    assert.deepEqual(
      waits,
      mode === "playing" ? [250] : mode === "failed" ? [] : [250, 250],
    );
  }
});

test("leaf polling contains only classified timeouts", async () => {
  for (const code of [
    "webdriver-condition-timeout",
    "webdriver-request-failed",
  ]) {
    const error = new WebDriverClientError(code);
    const subject = createNativeTtsScenarios({
      waitForCondition: async (_driver, _script, timeout) => {
        assert.equal(timeout, 5_000);
        throw error;
      },
    });
    const result = subject.paragraphLeafActivationDelivered({});
    if (code === "webdriver-condition-timeout")
      assert.equal(await result, false);
    else await assert.rejects(result, (failure) => failure === error);
  }
});

test("seek observation catches coalesced transitions, resets queued history, and stops", async () => {
  const source = await readFile(
    new URL("./native-smoke/tts-scenarios.mjs", import.meta.url),
    "utf8",
  );
  const script = (name) =>
    source.match(
      new RegExp(
        `async function ${name}\\(driver\\) \\{[\\s\\S]*?driver\\.execute\\(\\s*\x60([\\s\\S]*?)\x60`,
      ),
    )[1];
  let current = "false";
  let clock = 0;
  const observers = [];
  const owner = { getAttribute: () => current };
  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    records = [];
    disconnected = false;
    observe(target, options) {
      assert.equal(target, owner);
      assert.deepEqual(Array.from(options.attributeFilter), [
        "data-narration-navigation-settling",
      ]);
      assert.equal(options.attributeOldValue, true);
    }
    takeRecords() {
      const records = this.records;
      this.records = [];
      return records;
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  const context = {
    CSS: { highlights: new Map() },
    Highlight: class {},
    MutationObserver: FakeMutationObserver,
    document: { querySelector: () => owner },
    performance: { now: () => clock },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => undefined,
  };
  const execute = (body) =>
    runInNewContext(`(function() { ${body} })()`, context);
  assert.equal(
    execute(script("installAdaptiveSynchronizationInstrumentation")),
    true,
  );
  const state = context.__voxleafAdaptiveSynchronizationInstrumentation;
  const observer = observers[0];
  Object.assign(state, { currentKey: "synthetic", currentDocumentId: 1 });
  observer.records = [{ oldValue: "true" }];
  execute(script("currentAdaptiveHighlightMarker"));
  assert.equal(observer.records.length, 0);
  assert.equal(state.seekDiagnostic.sawTrue, false);
  clock = 7;
  observer.callback([{ oldValue: "false" }, { oldValue: "true" }]);
  assert.equal(state.seekDiagnostic.current, false);
  assert.equal(state.seekDiagnostic.sawTrue, true);
  assert.equal(state.seekDiagnostic.firstTrueElapsedMs, 7);
  assert.equal(state.seekDiagnostic.mutationCount, 2);
  execute(script("currentAdaptiveHighlightMarker"));
  observer.callback([{ oldValue: "false" }]);
  assert.equal(state.seekDiagnostic.sawTrue, false);
  assert.equal(state.seekDiagnostic.firstTrueElapsedMs, null);
  current = "true";
  observer.callback([{ oldValue: "false" }]);
  assert.equal(state.seekDiagnostic.sawTrue, true);
  observer.callback(
    Array.from({ length: 1_100 }, () => ({ oldValue: "false" })),
  );
  assert.equal(state.seekDiagnostic.mutationCount, 1024);
  state.stop();
  assert.equal(observer.disconnected, true);
  const stopped = { ...state.seekDiagnostic };
  current = "false";
  observer.callback([{ oldValue: "true" }]);
  assert.deepEqual({ ...state.seekDiagnostic }, stopped);
});

test("next-seek settling requires a fresh transition and retains a coalesced one", async (t) => {
  const source = await readFile(
    new URL("./native-smoke/tts-scenarios.mjs", import.meta.url),
    "utf8",
  );
  const instrumentationScript = (name) =>
    source.match(
      new RegExp(
        `async function ${name}\\(driver\\) \\{[\\s\\S]*?driver\\.execute\\(\\s*\x60([\\s\\S]*?)\x60`,
      ),
    )[1];
  const seekBlock = source.slice(
    source.indexOf('setStage("adaptive exact-host next-segment seek");'),
  );
  const settlingScript = seekBlock
    .split('"highlight-cleared",')[1]
    .match(/driver,\s*`([\s\S]*?)`/u)[1];
  for (const [mode, expected] of [
    ["coalesced-post-action", true],
    ["no-transition", false],
    ["queued-pre-arm", false],
    ["previous-seek", false],
    ["true-before-arm", false],
    ["stopped-after-transition", false],
  ]) {
    await t.test(mode, () => {
      let current = mode === "true-before-arm" ? "true" : "false";
      const observers = [];
      const owner = { getAttribute: () => current };
      class FakeMutationObserver {
        constructor(callback) {
          this.callback = callback;
          observers.push(this);
        }
        records = [];
        observe(target) {
          assert.equal(target, owner);
        }
        takeRecords() {
          const records = this.records;
          this.records = [];
          return records;
        }
        disconnect() {}
      }
      const context = {
        CSS: { highlights: new Map() },
        Highlight: class {},
        MutationObserver: FakeMutationObserver,
        document: { querySelector: () => owner },
        performance: { now: () => 0 },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => undefined,
      };
      const execute = (body) =>
        runInNewContext(`(function() { ${body} })()`, context);
      execute(
        instrumentationScript("installAdaptiveSynchronizationInstrumentation"),
      );
      const state = context.__voxleafAdaptiveSynchronizationInstrumentation;
      Object.assign(state, { currentKey: "synthetic", currentDocumentId: 1 });
      const observer = observers[0];
      const arm = () =>
        execute(instrumentationScript("currentAdaptiveHighlightMarker"));
      if (mode === "queued-pre-arm") observer.records = [{ oldValue: "true" }];
      if (mode === "previous-seek") {
        arm();
        current = "true";
        observer.callback([{ oldValue: "false" }]);
        current = "false";
        observer.callback([{ oldValue: "true" }]);
      }
      arm();
      if (mode === "coalesced-post-action") {
        current = "true";
        observer.records.push({ oldValue: "false" });
        current = "false";
        observer.records.push({ oldValue: "true" });
        observer.callback(observer.takeRecords());
      }
      if (mode === "stopped-after-transition") {
        current = "true";
        observer.callback([{ oldValue: "false" }]);
        state.stop();
      }
      try {
        assert.equal(execute(settlingScript), expected);
      } finally {
        state.stop();
      }
    });
  }
});

test("reader interaction retries two classified timeouts and propagates other failures once", async (t) => {
  t.mock.method(console, "error", () => undefined);
  for (const code of [
    "webdriver-condition-timeout",
    "webdriver-request-failed",
  ]) {
    let actions = 0;
    const stages = [];
    const error = new WebDriverClientError(code);
    const subject = createNativeReaderScenarios({
      INTERACTION_TIMEOUT_MS: 15_000,
      waitForCondition: async (_driver, script, timeout) => {
        assert.equal(script, "return false;");
        assert.equal(timeout, 15_000);
        throw error;
      },
    });
    await assert.rejects(
      subject.runNativeReaderInteraction({
        action: async () => {
          actions += 1;
        },
        condition: "return false;",
        driver: {
          execute: async () => {
            throw new Error("observation unavailable");
          },
        },
        label: "synthetic",
        setStage: (stage) => stages.push(stage),
      }),
      (failure) => failure === error,
    );
    assert.equal(actions, code === "webdriver-condition-timeout" ? 2 : 1);
    assert.equal(
      stages.at(-1),
      `native reader synthetic (attempt ${actions} of 2)`,
    );
  }
});

test("restoration polling returns exact settlement or the last pending observation at its deadline", async () => {
  for (const settles of [true, false]) {
    let clock = 0;
    let calls = 0;
    const waits = [];
    const subject = createNativeReaderScenarios({
      STARTUP_TIMEOUT_MS: 200,
      now: () => clock,
      delay: async (ms) => {
        waits.push(ms);
        clock += ms;
      },
    });
    const observation = await subject.observeSavedPositionRestoration({
      execute: async () => ({
        status: settles && calls++ > 0 ? "exact" : "pending",
      }),
    });
    assert.equal(observation.status, settles ? "exact" : "pending");
    assert.deepEqual(waits, settles ? [100] : [100, 100]);
  }
});

test("fresh helper imports perform no process, filesystem, hardware, timer, or console work", async () => {
  const urls = [
    "resource-observation",
    "tts-scenarios",
    "reader-scenarios",
  ].map((name) => new URL(`./native-smoke/${name}.mjs`, import.meta.url).href);
  const script = `
    import cp from "node:child_process";
    import fs from "node:fs/promises";
    import timers from "node:timers/promises";
    import console from "node:console";
    import { syncBuiltinESMExports } from "node:module";
    const forbidden = () => { throw new Error("unexpected import work"); };
    for (const key of ["spawn", "spawnSync", "execFile"]) cp[key] = forbidden;
    for (const key of ["access", "mkdir", "mkdtemp", "open", "readdir", "rm", "writeFile"]) fs[key] = forbidden;
    timers.setTimeout = forbidden;
    globalThis.setInterval = forbidden;
    globalThis.setTimeout = forbidden;
    console.log = forbidden;
    console.error = forbidden;
    syncBuiltinESMExports();
    for (const url of ${JSON.stringify(urls)}) await import(url);
  `;
  await new Promise((resolve, reject) =>
    execFile(
      process.execPath,
      ["--input-type=module", "--eval", script],
      { timeout: 10_000 },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(error);
          return;
        }
        assert.equal(stdout, "");
        assert.equal(stderr, "");
        resolve();
      },
    ),
  );
});

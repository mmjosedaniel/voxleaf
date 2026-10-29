import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import console from "node:console";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import process from "node:process";
import test from "node:test";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";

import {
  createNativeResourceObservation,
  captureOwnedProcessTree,
} from "./native-smoke/resource-observation.mjs";
import {
  cleanupNativeRun,
  captureCurrentChildProcesses,
  nativeOperationTimeout,
  runNativeOperation,
} from "./native-startup-smoke.mjs";
import { createNativeReaderScenarios } from "./native-smoke/reader-scenarios.mjs";
import { createNativeTtsScenarios } from "./native-smoke/tts-scenarios.mjs";
import {
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";
import { openEpubPublication } from "@voxleaf/epub";
import { buildMinimalEpubFixture } from "../../../packages/epub/test-support/epub-fixture.ts";
import { chatterboxPlaybackSpeedParagraph } from "./native-smoke/narration-fixture.mjs";

for (const stage of ["before", "during"]) {
  test(`SAF-R1 does not adopt a root whose ChildProcess exits ${stage} inspection`, async () => {
    const child = {
      pid: 100,
      exitCode: stage === "before" ? 0 : null,
      signalCode: null,
    };
    const previous = [
      { pid: 200, created: "original", executable: "synthetic", depth: 1 },
    ];
    const original = globalThis.structuredClone(previous);
    let inspected = false;
    let resolveInspection;
    const inspection = new Promise((resolve) => {
      resolveInspection = resolve;
    });
    const pending = captureCurrentChildProcesses(child, previous, async () => {
      inspected = true;
      return await inspection;
    });
    const rejected = assert.rejects(
      pending,
      /Native owned-process cleanup could not be verified/u,
    );
    if (stage === "during") {
      assert.equal(inspected, true);
      child.exitCode = 0;
    }
    resolveInspection([
      { pid: 100, created: "reused", executable: "unrelated", depth: 0 },
    ]);
    await rejected;
    if (stage === "before") assert.equal(inspected, false);
    assert.deepEqual(previous, original);
  });
}

function inspectSyntheticProcessSnapshot(fixture) {
  return async (script) => {
    const encoded = Buffer.from(JSON.stringify(fixture), "utf16le").toString(
      "base64",
    );
    const setup = [
      `$fixture=ConvertFrom-Json -InputObject ([Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${encoded}')))`,
      "function Get-CimInstance { foreach($item in $fixture.snapshot) { [pscustomobject]@{ProcessId=[int]$item.pid;ParentProcessId=[int]$item.parent;CreationDate=$(if($null -ne $item.created){[DateTime]::new([long]$item.created,[DateTimeKind]::Utc)}else{$null})} } }",
      "function Get-Process { param([int]$Id); $items=@($fixture.opened | Where-Object {[int]$_.pid -eq $Id}); if($items.Count -ne 1){return}; $item=$items[0]; $process=[pscustomobject]@{Handle=1;StartTime=[DateTime]::new([long]$item.created,[DateTimeKind]::Utc);Path='C:\\synthetic\\owned.exe'}; Add-Member -InputObject $process -MemberType ScriptMethod -Name Dispose -Value {} -PassThru }",
    ].join("; ");
    return await new Promise((resolve, reject) => {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", `${setup}; ${script}`],
        { encoding: "utf8", timeout: 15_000, windowsHide: true },
        (error, stdout) => {
          if (error !== null)
            reject(
              new Error("Native owned-process cleanup could not be verified.", {
                cause: error,
              }),
            );
          else {
            try {
              resolve(JSON.parse(stdout));
            } catch (error) {
              reject(error);
            }
          }
        },
      );
    });
  };
}

for (const childTick of [3, 9]) {
  test(
    `SAF-R1 resolves overlapping CIM chronology at exact child tick ${childTick}`,
    { skip: process.platform !== "win32" },
    async () => {
      const snapshot = [
        { pid: 100, parent: 1, created: "638000000000000000" },
        { pid: 200, parent: 100, created: "638000000000000000" },
      ];
      const opened = [
        { pid: 100, created: "638000000000000007" },
        { pid: 200, created: `63800000000000000${childTick}` },
      ];
      const result = await captureOwnedProcessTree(
        100,
        [],
        inspectSyntheticProcessSnapshot({ snapshot, opened }),
      );
      assert.deepEqual(
        result.map(({ pid }) => pid).sort((a, b) => a - b),
        childTick === 3 ? [100] : [100, 200],
      );
    },
  );
}

for (const mode of [
  "stale-parent",
  "recycled-child",
  "unknown-child",
  "vanished-child",
  "duplicate-child",
]) {
  test(
    `SAF-R1 excludes ${mode} from process ownership`,
    { skip: process.platform !== "win32" },
    async () => {
      const origin = 638000000000000000n;
      const ticks = (offset) => String(origin + BigInt(offset));
      const snapshot = [
        { pid: 100, parent: 1, created: ticks(0) },
        { pid: 200, parent: 100, created: ticks(1000) },
      ];
      const opened = [
        { pid: 100, created: ticks(7) },
        { pid: 200, created: ticks(1009) },
      ];
      if (mode === "stale-parent") {
        snapshot.push({ pid: 300, parent: 100, created: ticks(-1000) });
        opened.push({ pid: 300, created: ticks(-991) });
      } else if (mode === "recycled-child") {
        snapshot.push(
          { pid: 400, parent: 100, created: ticks(2000) },
          { pid: 401, parent: 400, created: ticks(7000) },
        );
        opened.push(
          { pid: 400, created: ticks(5009) },
          { pid: 401, created: ticks(7003) },
        );
      } else if (mode === "unknown-child") {
        snapshot.push({ pid: 500, parent: 100, created: null });
        opened.push({ pid: 500, created: ticks(10009) });
      } else if (mode === "vanished-child") {
        snapshot.push({ pid: 700, parent: 100, created: ticks(2000) });
      } else {
        snapshot.push(
          { pid: 800, parent: 100, created: ticks(2000) },
          { pid: 800, parent: 100, created: ticks(5000) },
        );
        opened.push({ pid: 800, created: ticks(2009) });
      }
      const previous = [
        {
          pid: 600,
          created: ticks(3333),
          executable: "C:\\synthetic\\previous.exe",
          depth: 2,
        },
      ];
      const pending = captureOwnedProcessTree(
        100,
        previous,
        inspectSyntheticProcessSnapshot({ snapshot, opened }),
      );
      if (mode !== "stale-parent") {
        await assert.rejects(
          pending,
          /Native owned-process cleanup could not be verified/u,
        );
        return;
      }
      const result = await pending;
      assert.deepEqual(
        result.map(({ pid }) => pid).sort((left, right) => left - right),
        [100, 200, 600],
      );
      assert.deepEqual(
        result.find(({ pid }) => pid === 600),
        previous[0],
      );
      assert.equal(result.find(({ pid }) => pid === 200).created, ticks(1009));
    },
  );
}

test(
  "SAF-R1 rejects a root recycled between enumeration and handle acquisition",
  { skip: process.platform !== "win32" },
  async () => {
    const snapshot = [{ pid: 100, parent: 1, created: "638000000000000000" }];
    const opened = [{ pid: 100, created: "638000000000002009" }];
    await assert.rejects(
      captureOwnedProcessTree(
        100,
        [],
        inspectSyntheticProcessSnapshot({ snapshot, opened }),
      ),
      /Native owned-process cleanup could not be verified/u,
    );
  },
);

test("SAF-13 only accepts finite bounded operation deadlines", () => {
  assert.equal(nativeOperationTimeout([]), 1_800_000);
  assert.equal(nativeOperationTimeout(["--operation-timeout-ms=25"]), 25);
  for (const value of ["0", "-1", "Infinity", "1800001", "abc"]) {
    assert.throws(() =>
      nativeOperationTimeout([`--operation-timeout-ms=${value}`]),
    );
  }
  assert.throws(() =>
    nativeOperationTimeout([
      "--operation-timeout-ms=1",
      "--operation-timeout-ms=2",
    ]),
  );
});

for (const mode of [
  "deadline",
  "session-creation-deadline",
  "normal",
  "cleanup-failure",
  "uncertain-ownership",
]) {
  test(
    `SAF-13 ${mode} settles owned work and cleans a real driver/app/worker tree`,
    { skip: process.platform !== "win32" },
    async () => {
      const owned = await mkdtemp(path.join(tmpdir(), "voxleaf-saf-native-"));
      await writeFile(path.join(owned, "sentinel"), "owned scratch");
      const workerCode = "setInterval(() => {}, 1000)";
      const appCode = `const {spawn}=require('node:child_process'); const worker=spawn(process.execPath,['-e',${JSON.stringify(workerCode)}],{stdio:'ignore',windowsHide:true}); worker.once('spawn',()=>console.log('ready')); setInterval(()=>{},1000);`;
      const driverCode = `const {spawn}=require('node:child_process'); const app=spawn(process.execPath,['-e',${JSON.stringify(appCode)}],{stdio:['ignore','pipe','inherit'],windowsHide:true}); app.stdout.pipe(process.stdout); setInterval(()=>{},1000);`;
      const child = spawn(process.execPath, ["-e", driverCode], {
        stdio: ["ignore", "pipe", "inherit"],
        windowsHide: true,
      });
      const sentinel = spawn(process.execPath, ["-e", workerCode], {
        stdio: "ignore",
        windowsHide: true,
      });
      let identities = [];
      let settled = false;
      let lateWork = false;
      const primary = new Error("synthetic-operation-failure");
      const cleanupFailure = new Error("synthetic-delete-failure");
      let client;
      let sessionCreationObserved = false;
      const server =
        mode === "session-creation-deadline"
          ? createServer(() => {
              sessionCreationObserved = true;
            })
          : undefined;
      try {
        await once(sentinel, "spawn");
        await once(child.stdout, "data");
        identities = await captureOwnedProcessTree(child.pid);
        assert(identities.length >= 3);
        if (mode === "uncertain-ownership") {
          identities = identities.map((record) =>
            record.pid === child.pid
              ? { ...record, created: String(BigInt(record.created) + 10n) }
              : record,
          );
        }
        if (server !== undefined) {
          server.listen(0, "127.0.0.1");
          await once(server, "listening");
        }
        const result = await runNativeOperation({
          timeoutMs: mode === "session-creation-deadline" ? 100 : 30,
          work: async (signal) => {
            try {
              if (mode === "session-creation-deadline") {
                client = new WebDriverClient(
                  `http://127.0.0.1:${server.address().port}`,
                  { signal },
                );
                await client.createSession("synthetic.exe", owned);
                lateWork = true;
              } else if (mode === "deadline") {
                await wait(10_000, undefined, { signal });
                lateWork = true;
              } else if (mode === "cleanup-failure") throw primary;
            } finally {
              settled = true;
            }
          },
          cleanup: async () => {
            assert.equal(settled, true);
            await cleanupNativeRun({
              child,
              temporaryDirectory: owned,
              identities,
              driver: client ?? {
                async deleteSession() {
                  if (mode === "cleanup-failure") throw cleanupFailure;
                },
              },
            });
          },
        }).catch((error) => error);
        assert.equal(lateWork, false);
        assert.equal(sentinel.exitCode, null);
        assert.equal(sentinel.signalCode, null);
        for (const { pid } of identities) {
          assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
        }
        if (mode === "normal") assert.equal(result, undefined);
        else if (mode === "deadline") assert.equal(result.name, "AbortError");
        else if (mode === "session-creation-deadline") {
          assert.equal(sessionCreationObserved, true);
          assert.equal(client.hasSession, false);
          assert.equal(result.code, "webdriver-operation-cancelled");
        } else if (mode === "uncertain-ownership") {
          assert(result instanceof AggregateError);
          assert(
            result.errors.some((error) => error instanceof AggregateError),
          );
        } else {
          assert(result instanceof AggregateError);
          assert(result.errors.includes(primary));
          assert(
            result.errors.some((error) =>
              error.errors?.includes(cleanupFailure),
            ),
          );
        }
        if (mode === "cleanup-failure" || mode === "uncertain-ownership")
          await access(owned);
        else await assert.rejects(access(owned), { code: "ENOENT" });
      } finally {
        if (server !== undefined) {
          server.closeAllConnections();
          server.close();
          await once(server, "close");
        }
        if (child.exitCode === null && child.signalCode === null) {
          const exited = once(child, "exit");
          child.kill();
          await exited;
        }
        if (sentinel.exitCode === null && sentinel.signalCode === null) {
          const exited = once(sentinel, "exit");
          sentinel.kill();
          await exited;
        }
        await rm(owned, { recursive: true, force: true });
      }
    },
  );
}

for (const language of ["es", "en"]) {
  test(`Chatterbox ${language} speed fixture has sentence boundaries throughout the six-rate matrix`, async () => {
    const bytes = await buildMinimalEpubFixture({
      chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}"><head><title>Synthetic</title></head><body><h1 id="chapter-one">Synthetic</h1><p>${chatterboxPlaybackSpeedParagraph(language)}</p></body></html>`,
    });
    const opened = await openEpubPublication(bytes);
    assert.equal(opened.ok, true);
    try {
      const prepared = await opened.publication.prepareNarration({
        startLocator: opened.publication.locators[0].startLocator,
        profile: "narration-chatterbox-v1",
        defaultLanguage: language,
        maximumSegments: 8,
      });
      assert.ok(["batch", "complete"].includes(prepared.status));
      assert.deepEqual(
        prepared.segments.map((segment) => segment.boundaryReason),
        ["heading", ...Array(7).fill("sentence")],
      );
    } finally {
      await opened.publication.close();
    }
  });
}

function smokeAssert(condition, message) {
  if (!condition) throw new Error(message);
}

test("startup cancellation observes native loading with Tauri's read-only invoke", async () => {
  const source = await readFile(
    new URL("./native-smoke/tts-scenarios.mjs", import.meta.url),
    "utf8",
  );
  const instrumentation = source.match(
    /await driver\.execute\(`\s*(const observations = [\s\S]*?)`\);/,
  )[1];
  let clock = 0;
  let phase = "idle";
  let native = { schemaVersion: 1, serviceInstanceId: null, state: "stopped" };
  let finishPreparation;
  const internals = {};
  Object.defineProperty(internals, "invoke", {
    value: async (command) => {
      if (command === "tts_service_lifecycle_observation") return { ...native };
      if (command === "start_tts_service") {
        native = {
          ...native,
          serviceInstanceId: "service:test",
          state: "unloaded",
        };
        return [
          {
            kind: "handshakeAccepted",
            serviceInstanceId: native.serviceInstanceId,
          },
        ];
      }
      if (command === "prepare_tts_service") {
        native.state = "loading";
        return new Promise((resolve) => {
          finishPreparation = resolve;
        });
      }
      if (command === "shutdown_tts_service") {
        clock += 40;
        native = { ...native, serviceInstanceId: null, state: "stopped" };
        finishPreparation([]);
        return [];
      }
      throw new Error("Unexpected native command");
    },
  });
  const context = {
    __TAURI_INTERNALS__: internals,
    AudioContext: class {},
    performance: { now: () => clock },
    document: {
      querySelector: () => ({
        textContent: "Cancel start",
        getAttribute: (name) =>
          name === "data-narration-phase" ? phase : native.state,
      }),
    },
  };
  const execute = (body) =>
    runInNewContext(`(function() { ${body} })()`, context);
  execute(instrumentation);
  const driver = {
    execute,
    findElement: async (selector) => selector,
    sendKeys: async (selector) => {
      if (selector.includes('"play"')) {
        phase = "starting";
        await internals.invoke("start_tts_service");
        void internals.invoke("prepare_tts_service");
      } else {
        assert.equal(
          native.state,
          "loading",
          "cancel must reach actual native loading",
        );
        await internals.invoke("shutdown_tts_service");
        phase = "idle";
      }
    },
  };
  const subject = createNativeTtsScenarios({
    assert: smokeAssert,
    now: () => clock,
    STARTUP_TIMEOUT_MS: 500,
    WEBDRIVER_SPACE: " ",
    waitForCondition: async (_driver, script, timeout) => {
      const deadline = clock + timeout;
      while (clock <= deadline) {
        if (await execute(script)) return;
        clock += 100;
      }
      throw new Error(`Native observation missed: ${native.state}`);
    },
  });
  const result = await subject.cancelAdaptiveStartup(driver, () => {});
  assert.equal(result.startupNativePhase, "loading");
  assert.equal(result.startupShutdownMs, 40);
  assert.equal(result.startupCancellationMs, 40);
  assert.equal(native.state, "stopped");
  assert.equal(native.serviceInstanceId, null);
});

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

test("highlight identity distinguishes containers and detects replay after DOM replacement", async () => {
  const source = await readFile(
    new URL("./native-smoke/tts-scenarios.mjs", import.meta.url),
    "utf8",
  );
  const script = source.match(
    /async function installAdaptiveSynchronizationInstrumentation\(driver\) \{[\s\S]*?driver\.execute\(\s*`([\s\S]*?)`/u,
  )[1];
  const dom = new JSDOM(
    '<div data-reader-scroll-owner="true"><article class="semantic-document"><p>Alpha <em>Beta</em> Gamma</p></article></div><div class="product-narration"></div>',
    { runScripts: "outside-only" },
  );
  const { window } = dom;
  let frame;
  window.CSS = { highlights: new Map() };
  window.Highlight = Set;
  window.requestAnimationFrame = (callback) => {
    frame = callback;
    return 1;
  };
  window.cancelAnimationFrame = () => {};
  window.Range.prototype.getBoundingClientRect = () => ({
    top: 30,
    bottom: 40,
  });
  window.document.querySelector(
    "[data-reader-scroll-owner]",
  ).getBoundingClientRect = () => ({ top: 0, bottom: 200, height: 200 });
  try {
    window.eval(`(function() { ${script} })()`);
    const state = window.__voxleafAdaptiveSynchronizationInstrumentation;
    const paragraph = window.document.querySelector("p");
    const observe = (start, end) => {
      const range = window.document.createRange();
      range.setStart(start, 1);
      range.setEnd(end, 1);
      assert.equal(range.collapsed, false);
      window.CSS.highlights.set("voxleaf-narration-active", new Set([range]));
      frame();
      return state.currentKey;
    };
    const first = observe(
      paragraph.firstChild,
      paragraph.querySelector("em").firstChild,
    );
    assert.equal(
      observe(paragraph.firstChild, paragraph.querySelector("em").firstChild),
      first,
    );
    state.forbiddenKeys.set(first, false);
    const extended = observe(paragraph.firstChild, paragraph.lastChild);
    assert.notEqual(
      extended,
      first,
      "end containers must distinguish passages",
    );
    const next = observe(
      paragraph.querySelector("em").firstChild,
      paragraph.lastChild,
    );
    assert.notEqual(
      next,
      extended,
      "start containers must distinguish passages",
    );
    assert.notEqual(
      next,
      first,
      "equal node offsets must not alias distinct passages",
    );
    assert.equal(state.forbiddenKeys.get(first), true);
    assert.equal(state.stalePlaybackObserved, false);
    paragraph.innerHTML = "Alpha <em>Beta</em> Gamma";
    assert.equal(
      observe(paragraph.firstChild, paragraph.querySelector("em").firstChild),
      first,
      "recreating nodes must not disguise replay of the same passage",
    );
    assert.equal(state.stalePlaybackObserved, true);
    assert.equal(state.rangeValid, true);
    state.stop();
  } finally {
    window.close();
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

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import {
  assertNoDevelopmentEnvironment,
  createStageReporter,
  assertHostileDevelopmentEnvironment,
  evaluateHostGate,
  hostileReleaseEnvironment,
  isRetriableHostGateError,
  journeySteps,
  parseArguments,
  processTerminated,
  removeWebDriverProfile,
  releaseEnvironment,
  validateOrdinaryArtifact,
  waitForStableInstallRootAbsence,
} from "./ordinary-chatterbox-release-host.mjs";
import { WebDriverClientError } from "./native-webdriver-client.mjs";
import { boundedDownloadInPage } from "./optional-download-probe.mjs";

const root = await mkdtemp(path.join(tmpdir(), "voxleaf-ordinary-host-test-"));
after(async () => await rm(root, { recursive: true, force: true }));

test("bounded download probe cancels at its first MiB without completing acquisition", async () => {
  let settle;
  const commands = [];
  globalThis.__TAURI_INTERNALS__ = {
    async invoke(command) {
      commands.push(command);
      if (command === "select_optional_chatterbox")
        return { state: "confirming" };
      if (command === "download_optional_chatterbox")
        return await new Promise((resolve) => {
          settle = resolve;
        });
      if (command === "optional_chatterbox_snapshot")
        return {
          downloadedBytes: 1_048_576,
          state: "downloading",
          failure: null,
        };
      if (command === "cancel_optional_chatterbox") {
        settle({ state: "absent" });
        return { state: "absent" };
      }
      throw new Error("unexpected command");
    },
  };
  try {
    const result = await boundedDownloadInPage("synthetic-profile");
    assert.equal(result.cancellationRequested, true);
    assert.equal(result.peakBytes, 1_048_576);
    assert.equal(result.state, "absent");
    assert.equal(
      commands.filter((command) => command === "download_optional_chatterbox")
        .length,
      1,
    );
  } finally {
    delete globalThis.__TAURI_INTERNALS__;
  }
});

test("bounded mode cannot accidentally request the full acquisition corrections", () => {
  const environment = { LOCALAPPDATA: root, USERPROFILE: root };
  assert.equal(
    parseArguments(["--mode", "download-probe"], environment).mode,
    "download-probe",
  );
  assert.throws(
    () =>
      parseArguments(
        ["--mode", "download-probe", "--exercise-acquisition-corrections"],
        environment,
      ),
    /probe-cannot-run-full-corrections/,
  );
});

async function createArtifact({ availability = "downloadable" } = {}) {
  const installed = path.join(
    root,
    `artifact-${Math.random().toString(16).slice(2)}`,
  );
  for (const resource of [
    "resources/tts/voxleaf-piper-core-v1",
    "resources/release/optional/chatterbox",
  ]) {
    await mkdir(path.join(installed, resource), { recursive: true });
  }
  await writeFile(path.join(installed, "voxleaf-desktop.exe"), "synthetic");
  await writeFile(
    path.join(
      installed,
      "resources/tts/voxleaf-piper-core-v1/runtime-manifest-v1.json",
    ),
    "{}",
  );
  await writeFile(
    path.join(
      installed,
      "resources/release/optional/chatterbox/source-manifest-v7.json",
    ),
    "{}",
  );
  await writeFile(
    path.join(
      installed,
      "resources/release/optional/chatterbox/runtime-package-evidence-v7.json",
    ),
    "{}",
  );
  await writeFile(
    path.join(
      installed,
      "resources/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
    ),
    "synthetic",
  );
  await writeFile(
    path.join(
      installed,
      "resources/release/optional/chatterbox/optional-package-manifest-v7.json",
    ),
    JSON.stringify({
      availability,
      identity: { packageVersion: "7" },
      layout: { installed: "cb/7" },
      runtime: { releaseTag: "chatterbox-runtime-v7" },
      measurements: {
        downloadBytes: 8_240_315_465,
        installedBytes: 8_236_757_393,
        temporaryBytes: 13_271_679_006,
        minimumFreeBytes: 20_000_000_000,
      },
    }),
  );
  return installed;
}

test("ordinary artifact rejects historical identities or a legacy correction in v7", async () => {
  for (const mutate of [
    (manifest) => (manifest.identity.packageVersion = "2"),
    (manifest) => (manifest.identity.packageVersion = "3"),
    (manifest) => (manifest.identity.packageVersion = "4"),
    (manifest) => (manifest.identity.packageVersion = "5"),
    (manifest) => (manifest.identity.packageVersion = "6"),
    (manifest) => (manifest.runtimeCorrection = {}),
  ]) {
    const installed = await createArtifact();
    const manifestPath = path.join(
      installed,
      "resources/release/optional/chatterbox/optional-package-manifest-v7.json",
    );
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    mutate(manifest);
    await writeFile(manifestPath, JSON.stringify(manifest));
    await assert.rejects(
      () => validateOrdinaryArtifact(installed),
      /ordinary-manifest-authority/,
    );
  }
});

test("arguments resolve the ordinary package defaults without PATH lookup", () => {
  const environment = { LOCALAPPDATA: root, USERPROFILE: root };
  assert.throws(() => parseArguments([], {}), /installed-root/);
  assert.throws(
    () =>
      parseArguments(
        ["--installed-root", "relative", "--mode", "journey"],
        environment,
      ),
    /installed-root/,
  );
  const journey = parseArguments(["--mode", "journey"], environment);
  assert.equal(journey.exerciseAcquisitionCorrections, false);
  assert.equal(
    parseArguments(
      ["--mode", "journey", "--exercise-acquisition-corrections"],
      environment,
    ).exerciseAcquisitionCorrections,
    true,
  );
  assert.equal(journey.installedRoot, path.join(root, "VoxLeaf"));
  assert.match(journey.installer, /VoxLeaf_0\.1\.0_x64-setup\.exe$/);
  assert.equal(
    journey.tauriDriver,
    path.join(root, ".cargo", "bin", "tauri-driver.exe"),
  );
  assert.equal(
    journey.edgeDriver,
    path.join(root, ".cargo", "bin", "msedgedriver.exe"),
  );
  assert.match(
    journey.receipt,
    /ordinary-chatterbox-journey-evidence-v2\.json$/,
  );
});

test("stage reporting emits only a fixed content-free stage identifier", () => {
  const lines = [];
  const reporter = createStageReporter((line) => lines.push(line));
  reporter.mark("journey-hostile-host-gate");
  assert.deepEqual(lines, [
    "ordinary-chatterbox-release-host:stage=journey-hostile-host-gate\n",
  ]);
  assert.throws(() => reporter.mark("C:\\private\\book.epub"), /stage/);
});

test("native gating retries only the content-free overlapping probe failure", () => {
  assert.equal(
    isRetriableHostGateError(
      new WebDriverClientError("webdriver-command-failed"),
    ),
    true,
  );
  assert.equal(
    isRetriableHostGateError(
      new WebDriverClientError("webdriver-session-timeout"),
    ),
    false,
  );
  assert.equal(
    isRetriableHostGateError({ code: "webdriver-command-failed" }),
    false,
  );
});

test("hostile development variables are removed and the misleading PATH is retained", () => {
  const sanitized = releaseEnvironment({
    PATH: "C:\\Python",
    VOXLEAF_TTS_DEV_ENABLED: "1",
    VOXLEAF_TTS_PIPER_PYTHON: "C:\\Python\\python.exe",
    VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT: "C:\\validation",
    PYTHONHOME: "C:\\Python",
  });
  assertNoDevelopmentEnvironment(sanitized);
  assert.equal(sanitized.VOXLEAF_TTS_DEV_ENABLED, undefined);
  assert.match(sanitized.PATH, /voxleaf-ordinary-release-no-path/);
  assert.throws(
    () => assertNoDevelopmentEnvironment({ PATH: "C:\\Windows" }),
    /hostile-path/,
  );
  const hostile = hostileReleaseEnvironment({ SystemRoot: "C:\\Windows" });
  assertHostileDevelopmentEnvironment(hostile);
  assert.equal(hostile.VOXLEAF_TTS_DEV_ENABLED, "1");
  assert.match(
    hostile.VOXLEAF_TTS_CHATTERBOX_PYTHON,
    /voxleaf-ordinary-release-hostile/,
  );
});

test("ordinary artifact validation rejects withheld and incomplete resources", async () => {
  const downloadable = await createArtifact();
  await assert.doesNotReject(() => validateOrdinaryArtifact(downloadable));
  const withheld = await createArtifact({ availability: "withheld" });
  await assert.rejects(
    () => validateOrdinaryArtifact(withheld),
    /ordinary-manifest-authority/,
  );
});

test("the bounded host gate admits only the published Chatterbox profile state", () => {
  const compatible = {
    schemaVersion: 1,
    platform: { operatingSystem: "windows", architecture: "x86_64" },
    processor: { logicalProcessorCount: { status: "known", value: 8 } },
    memory: {
      totalPhysicalMiB: { status: "known", value: 24_576 },
      availablePhysicalMiB: { status: "known", value: 4_096 },
    },
    cudaComputeCapability: { status: "known", major: 12, minor: 0 },
    providers: {
      cuda: {
        availability: "available",
        deviceClass: "discrete-gpu",
        dedicatedMemoryMiB: { status: "known", value: 5_632 },
        availableDedicatedMemoryMiB: { status: "known", value: 4_668 },
        precisions: { bfloat16: "available" },
      },
    },
  };
  assert.equal(evaluateHostGate(compatible), true);
  for (const capability of [
    undefined,
    { status: "unknown" },
    { status: "known", major: 11, minor: 0 },
    { status: "known", major: 12, minor: 1 },
    { status: "known", major: 13, minor: 0 },
  ]) {
    assert.equal(
      evaluateHostGate({ ...compatible, cudaComputeCapability: capability }),
      false,
    );
  }

  assert.equal(
    evaluateHostGate({
      ...compatible,
      providers: {
        cuda: {
          ...compatible.providers.cuda,
          availableDedicatedMemoryMiB: { status: "known", value: 4_667 },
        },
      },
    }),
    false,
  );
  assert.equal(
    evaluateHostGate({
      ...compatible,
      memory: {
        ...compatible.memory,
        availablePhysicalMiB: { status: "unknown" },
      },
    }),
    false,
  );
});

test("WebDriver profile cleanup retries transient Windows file locks", async () => {
  let calls = 0;
  const waits = [];
  await removeWebDriverProfile(
    "C:\\synthetic-profile",
    async () => {
      calls += 1;
      if (calls < 3) {
        const error = new Error("busy");
        error.code = "EBUSY";
        throw error;
      }
    },
    async (milliseconds) => waits.push(milliseconds),
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test("a WebDriver child terminated by signal is already finished", () => {
  assert.equal(processTerminated({ exitCode: null, signalCode: null }), false);
  assert.equal(processTerminated({ exitCode: 0, signalCode: null }), true);
  assert.equal(
    processTerminated({ exitCode: null, signalCode: "SIGTERM" }),
    true,
  );
});

test("uninstall completion requires a stable absent installation root", async () => {
  const observations = [
    "present",
    "missing",
    "missing",
    "missing",
    "missing",
    "missing",
  ];
  const waits = [];
  await waitForStableInstallRootAbsence(
    "C:\\synthetic-install",
    async () => {
      if (observations.shift() === "missing") {
        const error = new Error("missing");
        error.code = "ENOENT";
        throw error;
      }
    },
    async (milliseconds) => waits.push(milliseconds),
  );
  assert.equal(observations.length, 0);
  assert.equal(waits.length, 5);
  assert.ok(waits.every((milliseconds) => milliseconds === 250));
});

test("journey has one ordered ordinary identity path through cancellation, restart, removal, reinstall, and Piper", () => {
  assert.deepEqual(journeySteps(), [
    "preflight",
    "install",
    "gate",
    "consent",
    "cancel-download",
    "verify-staging-cleanup",
    "retry-download",
    "activate",
    "offline-chatterbox-es",
    "offline-chatterbox-en",
    "restart",
    "remove",
    "offline-piper-after-removal-es",
    "offline-piper-after-removal-en",
    "reinstall-optional-package",
    "verify-reinstalled-package",
    "uninstall",
  ]);
});

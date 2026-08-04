import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertNoDevelopmentEnvironment,
  assertHostileDevelopmentEnvironment,
  evaluateHostGate,
  hostileReleaseEnvironment,
  journeySteps,
  parseArguments,
  releaseEnvironment,
  validateOrdinaryArtifact,
} from "./ordinary-chatterbox-release-host.mjs";

const root = await mkdtemp(path.join(tmpdir(), "voxleaf-ordinary-host-test-"));

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
      "resources/release/optional/chatterbox/source-manifest-v2.json",
    ),
    "{}",
  );
  await writeFile(
    path.join(
      installed,
      "resources/release/optional/chatterbox/runtime-package-evidence-v3.json",
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
      "resources/release/optional/chatterbox/optional-package-manifest-v2.json",
    ),
    JSON.stringify({
      availability,
      measurements: {
        downloadBytes: 8_231_893_387,
        installedBytes: 8_228_503_309,
        temporaryBytes: 13_254_834_850,
        minimumFreeBytes: 20_000_000_000,
      },
    }),
  );
  return installed;
}

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
    /ordinary-chatterbox-journey-evidence-v1\.json$/,
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

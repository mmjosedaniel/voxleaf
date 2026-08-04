import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createJourneyReceipt } from "./ordinary-chatterbox-release-host.mjs";
import {
  APP_VERSION,
  createPackageEvidence,
  loadReleaseDocuments,
  releaseResourceSources,
  repositoryRoot,
  validateClosedReleaseValues,
  validateReleaseConfiguration,
} from "./windows-release.mjs";

test("the checked-in Windows release configuration is closed and current", async () => {
  assert.equal(
    releaseResourceSources(false).some((source) =>
      source.includes("release/core/dist"),
    ),
    false,
  );
  assert.equal(
    releaseResourceSources(true).some((source) =>
      source.includes("release/core/dist"),
    ),
    true,
  );
  await validateReleaseConfiguration(repositoryRoot(), false);
});

test("the release authority rejects broader targets, elevation, and optional payloads", async () => {
  const source = await loadReleaseDocuments(repositoryRoot());
  for (const mutate of [
    (value) => (value.releaseConfig.bundle.targets = ["nsis", "msi"]),
    (value) =>
      (value.releaseConfig.bundle.windows.nsis.installMode = "perMachine"),
    (value) =>
      (value.releaseConfig.bundle.resources[
        "../../../services/tts/release/optional/chatterbox/dist/"
      ] = "resources/tts/chatterbox/"),
  ]) {
    const value = JSON.parse(JSON.stringify(source));
    mutate(value);
    assert.throws(
      () => validateClosedReleaseValues(value),
      /windows-release:(bundle-authority|resource-closure)/,
    );
  }
});

test("the ordinary release requires one downloadable manifest and locked runtime feature", async () => {
  const source = await loadReleaseDocuments(repositoryRoot());
  for (const [mutate, code] of [
    [
      (value) => (value.optionalManifest.availability = "withheld"),
      "optional-acquisition-authority",
    ],
    [
      (value) =>
        (value.cargoToml = value.cargoToml.replace(
          "release-locked-runtime = []",
          "",
        )),
      "release-runtime-boundary",
    ],
    [
      (value) =>
        (value.buildScript = value.buildScript.replace(
          '"release-locked-runtime"',
          '"development-runtime"',
        )),
      "release-runtime-boundary",
    ],
    [
      (value) =>
        (value.rootPackage.scripts["package:windows:chatterbox-validation"] =
          "retired"),
      "release-runtime-boundary",
    ],
    [
      (value) =>
        delete value.rootPackage.scripts["package:windows:ordinary-chatterbox"],
      "release-runtime-boundary",
    ],
    [
      (value) =>
        (value.rootPackage.scripts["test:rust"] =
          "cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml"),
      "release-runtime-boundary",
    ],
  ]) {
    const value = JSON.parse(JSON.stringify(source));
    mutate(value);
    assert.throws(
      () => validateClosedReleaseValues(value),
      new RegExp(`windows-release:${code}`),
    );
  }
});

test("the release authority rejects broad uninstall roots and incomplete lifecycle matrices", async () => {
  const source = await loadReleaseDocuments(repositoryRoot());
  for (const mutate of [
    (value) =>
      (value.nsisHooks += '\\nRMDir /r "$LOCALAPPDATA\\\\com.voxleaf.desktop"'),
    (value) =>
      (value.nsisHooks += String.raw`\nRMDir /r \"$LOCALAPPDATA\\com.voxleaf.desktop\"`),
    (value) =>
      (value.lifecycleScript =
        "default chatterbox-only preferences-only both legacy invalid"),
    (value) => (value.lifecycleScript += "\\nnot-exercised"),
    (value) => (value.nsisHooks = value.nsisHooks.replaceAll("w R0", "w r0")),
  ]) {
    const value = { ...source };
    mutate(value);
    assert.throws(
      () => validateClosedReleaseValues(value),
      /windows-release:(uninstall-authority|uninstall-scope|lifecycle-flag-coverage|lifecycle-not-exercised)/,
    );
  }
});

test("content-safe evidence distinguishes unsigned local and signed public gates", async () => {
  const temporary = await mkdtemp(
    path.join(os.tmpdir(), "voxleaf-release-test-"),
  );
  const installer = path.join(
    temporary,
    `VoxLeaf_${APP_VERSION}_x64-setup.exe`,
  );
  const binary = path.join(temporary, "voxleaf-desktop.exe");
  await writeFile(installer, "installer");
  await writeFile(binary, "binary");
  const unsigned = await createPackageEvidence({
    root: repositoryRoot(),
    installer,
    binary,
    signatureStatus: "unsigned-local",
    antivirusStatus: "not-run",
    lifecycleStatus: "not-run",
    ordinaryChatterboxReceipt: undefined,
  });
  assert.equal(unsigned.schemaVersion, 2);
  assert.equal(unsigned.signature.publicPublicationAllowed, false);
  assert.equal(unsigned.lifecycle.localReleaseGatesPassed, false);
  assert.equal(unsigned.payload.chatterboxRuntimeOrWeightsBundled, false);
  assert.equal(unsigned.optionalChatterbox.releaseLockedRuntime, true);
  assert.equal(unsigned.optionalChatterbox.downloadBytes, 8_231_893_387);
  assert.equal(
    unsigned.optionalChatterbox.representativeCompatibleHostJourney,
    "not-run",
  );
  assert.equal(JSON.stringify(unsigned).includes(temporary), false);

  const receipt = await createJourneyReceipt({
    installer,
    executable: binary,
  });
  const signed = await createPackageEvidence({
    root: repositoryRoot(),
    installer,
    binary,
    signatureStatus: "signed-valid",
    antivirusStatus: "windows-defender-no-threats",
    lifecycleStatus: "local-install-first-start-repair-uninstall-passed",
    ordinaryChatterboxReceipt: receipt,
  });
  assert.equal(signed.signature.executableAndInstallerVerified, true);
  assert.equal(signed.signature.publicPublicationAllowed, true);
  assert.equal(signed.lifecycle.localReleaseGatesPassed, true);
  assert.equal(
    signed.optionalChatterbox.representativeCompatibleHostJourney,
    "representative-compatible-host-passed",
  );

  const mismatched = JSON.parse(JSON.stringify(receipt));
  mismatched.artifact.applicationBinary.sha256 = "0".repeat(64);
  await assert.rejects(
    () =>
      createPackageEvidence({
        root: repositoryRoot(),
        installer,
        binary,
        signatureStatus: "unsigned-local",
        antivirusStatus: "not-run",
        lifecycleStatus: "not-run",
        ordinaryChatterboxReceipt: mismatched,
      }),
    /windows-release:ordinary-chatterbox-receipt/,
  );
});

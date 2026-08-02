import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

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
  });
  assert.equal(unsigned.signature.publicPublicationAllowed, false);
  assert.equal(unsigned.payload.chatterboxRuntimeOrWeightsBundled, false);
  assert.equal(JSON.stringify(unsigned).includes(temporary), false);

  const signed = await createPackageEvidence({
    root: repositoryRoot(),
    installer,
    binary,
    signatureStatus: "signed-valid",
    antivirusStatus: "windows-defender-no-threats",
    lifecycleStatus: "local-install-first-start-repair-uninstall-passed",
  });
  assert.equal(signed.signature.executableAndInstallerVerified, true);
  assert.equal(signed.signature.publicPublicationAllowed, true);
});

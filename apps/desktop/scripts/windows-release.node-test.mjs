import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
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
  const { nsisHooks } = await loadReleaseDocuments(repositoryRoot());
  assert.match(nsisHooks, /después.*podrá/);
  assert.match(nsisHooks, /deberá adquirirlos/);
  assert.doesNotMatch(nsisHooks, /Ã|Â|\uFFFD|8\.23 GB/);
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
      (value) => (value.optionalManifest.identity.packageVersion = "2"),
      "optional-acquisition-authority",
    ],
    [
      (value) => (value.optionalManifest.runtimeCorrection = {}),
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
        (value.rootPackage.scripts[
          "package:windows:ordinary-chatterbox:evidence"
        ] = value.rootPackage.scripts[
          "package:windows:ordinary-chatterbox:evidence"
        ].replace(
          "--lifecycle-status local-install-first-start-repair-uninstall-passed ",
          "",
        )),
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
    (value) =>
      (value.lifecycleScript = value.lifecycleScript.replace(
        "product = $productName",
        "product = $Product",
      )),
    (value) => (value.nsisHooks = value.nsisHooks.replaceAll("w R0", "w r0")),
  ]) {
    const value = { ...source };
    mutate(value);
    assert.throws(
      () => validateClosedReleaseValues(value),
      /windows-release:(uninstall-authority|uninstall-scope|lifecycle-flag-coverage|lifecycle-not-exercised|lifecycle-product-identity)/,
    );
  }
});

test("content-safe evidence distinguishes unsigned local and signed public gates", async (t) => {
  const temporary = await mkdtemp(
    path.join(os.tmpdir(), "voxleaf-release-test-"),
  );
  t.after(async () => await rm(temporary, { recursive: true, force: true }));
  const installer = path.join(
    temporary,
    `VoxLeaf_${APP_VERSION}_x64-setup.exe`,
  );
  const binary = path.join(temporary, "voxleaf-desktop.exe");
  const installedRoot = path.join(temporary, "installed");
  const installedBinary = path.join(installedRoot, "voxleaf-desktop.exe");
  await writeFile(installer, "installer");
  await writeFile(binary, "binary");
  await mkdir(installedRoot);
  await writeFile(installedBinary, "installed binary");
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
  assert.equal(unsigned.optionalChatterbox.downloadBytes, 8_240_055_749);
  assert.equal(
    unsigned.optionalChatterbox.representativeCompatibleHostJourney,
    "not-run",
  );
  assert.equal(JSON.stringify(unsigned).includes(temporary), false);

  const receipt = await createJourneyReceipt({
    installer,
    executable: installedBinary,
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
    signed.package.applicationBinary.sha256,
    unsigned.package.applicationBinary.sha256,
  );
  assert.equal(
    signed.package.installedApplicationBinary.sha256,
    receipt.artifact.applicationBinary.sha256,
  );
  assert.notEqual(
    signed.package.applicationBinary.sha256,
    signed.package.installedApplicationBinary.sha256,
  );
  assert.equal(
    signed.optionalChatterbox.representativeCompatibleHostJourney,
    "representative-compatible-host-passed",
  );

  const mismatched = JSON.parse(JSON.stringify(receipt));
  mismatched.artifact.installer.sha256 = "0".repeat(64);
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

test(
  "lifecycle directory rename preserves hidden, readonly and long-path original entries",
  { skip: process.platform !== "win32" },
  async (t) => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "voxleaf-lifecycle-rename-test-"),
    );
    t.after(async () => await rm(temporary, { recursive: true, force: true }));
    const data = path.join(temporary, "data");
    const longRelative = path.join(
      ...Array(7).fill("synthetic-long-descendant-0123456789"),
      "long.marker",
    );
    const files = [
      ["ordinary.marker", Buffer.from([0, 17, 255, 42])],
      [
        path.join("hidden", "nested", "hidden.marker"),
        Buffer.from("hidden sentinel"),
      ],
      [
        path.join("readonly", "nested", "readonly.marker"),
        Buffer.from("readonly sentinel"),
      ],
      [longRelative, Buffer.from("long-path sentinel")],
    ];
    assert.ok(path.join(data, longRelative).length > 260);
    for (const [relative, bytes] of files) {
      const destination = path.join(data, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
    }
    const sibling = path.join(temporary, "sibling.marker");
    await writeFile(sibling, "unrelated sibling sentinel");
    async function snapshot(root) {
      const entries = [];
      async function visit(relative) {
        for (const item of await readdir(path.join(root, relative), {
          withFileTypes: true,
        })) {
          const child = path.join(relative, item.name);
          if (item.isDirectory()) {
            entries.push([child, "directory"]);
            await visit(child);
          } else {
            assert.ok(item.isFile());
            entries.push([
              child,
              (await readFile(path.join(root, child))).toString("base64"),
            ]);
          }
        }
      }
      await visit("");
      return entries.sort(([left], [right]) => left.localeCompare(right));
    }
    const before = await snapshot(data);
    const expected = Buffer.from(
      JSON.stringify(
        files.map(([relative, bytes]) => ({
          relative,
          bytes: bytes.toString("base64"),
        })),
      ),
    ).toString("base64");
    const quote = (value) => `'${value.replaceAll("'", "''")}'`;
    const source = String.raw`
$ErrorActionPreference = 'Stop'
. ${quote(path.join(repositoryRoot(), "scripts/windows-package-lifecycle-data.ps1"))}
$parent = ${quote(temporary)}
$data = Join-Path $parent 'data'
$backup = Join-Path $parent 'backup'
$quarantine = Join-Path $parent 'quarantine'
$state = New-LifecycleDataState $parent $data $backup $quarantine
$expected = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${expected}')) | ConvertFrom-Json
# Extended-length paths let the fixture include descendants beyond MAX_PATH.
function Extended-Path($value) { return "\\?\$value" }
$hiddenDirectory = Join-Path $data 'hidden'
$hiddenFile = Join-Path $hiddenDirectory 'nested\hidden.marker'
$readonlyDirectory = Join-Path $data 'readonly'
$readonlyFile = Join-Path $readonlyDirectory 'nested\readonly.marker'
[IO.File]::SetAttributes((Extended-Path $hiddenDirectory), [IO.FileAttributes]::Directory -bor [IO.FileAttributes]::Hidden)
[IO.File]::SetAttributes((Extended-Path $hiddenFile), [IO.FileAttributes]::Hidden)
[IO.File]::SetAttributes((Extended-Path $readonlyDirectory), [IO.FileAttributes]::Directory -bor [IO.FileAttributes]::ReadOnly)
[IO.File]::SetAttributes((Extended-Path $readonlyFile), [IO.FileAttributes]::ReadOnly)
function Assert-OriginalTree($root) {
  foreach ($file in $expected) {
    $bytes = [IO.File]::ReadAllBytes((Extended-Path (Join-Path $root $file.relative)))
    if ([Convert]::ToBase64String($bytes) -ne $file.bytes) { throw 'test-original-bytes-changed' }
  }
  foreach ($relative in @('hidden', 'hidden\nested\hidden.marker')) {
    if (([IO.File]::GetAttributes((Extended-Path (Join-Path $root $relative))) -band [IO.FileAttributes]::Hidden) -eq 0) { throw 'test-hidden-attribute-lost' }
  }
  foreach ($relative in @('readonly', 'readonly\nested\readonly.marker')) {
    if (([IO.File]::GetAttributes((Extended-Path (Join-Path $root $relative))) -band [IO.FileAttributes]::ReadOnly) -eq 0) { throw 'test-readonly-attribute-lost' }
  }
}
try {
  Initialize-LifecycleDataOwnership $state
  if (-not $state.BackupVerified -or -not $state.OwnsTestRoot -or (Test-Path -LiteralPath $data)) { throw 'test-backup-not-complete' }
  Assert-OriginalTree $backup
  New-Item -ItemType Directory -Path $data | Out-Null
  [IO.File]::WriteAllText((Join-Path $data 'fixture.marker'), 'owned fixture')
} finally {
  $failures = @(Complete-LifecycleData $state)
  if ($failures.Count -ne 0) { throw ($failures -join ',') }
}
if ($state.OwnsTestRoot -or $state.BackupVerified -or (Test-Path -LiteralPath $backup)) { throw 'test-restoration-incomplete' }
Assert-OriginalTree $data
`;
    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-EncodedCommand",
        Buffer.from(source, "utf16le").toString("base64"),
      ],
      { encoding: "utf8", timeout: 20_000, windowsHide: true },
    );
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.deepEqual(await snapshot(data), before);
    assert.equal(await readFile(sibling, "utf8"), "unrelated sibling sentinel");
  },
);

const lifecycleCases = [
  ["backup move failure", "backup-move", "synthetic-backup-move", "data", []],
  [
    "occupied backup",
    "occupied-backup",
    "windows-release-lifecycle-backup-root-occupied",
    "data",
    [],
  ],
  [
    "failed backup verification",
    "backup-verification",
    "windows-release-lifecycle-backup-verification-failed",
    "backup",
    ["backup-unverified-preserved"],
  ],
  [
    "ambiguous backup preserves both original locations",
    "ambiguous-backup",
    "windows-release-lifecycle-backup-verification-failed",
    "data",
    ["backup-unverified-preserved"],
  ],
  [
    "reparse root rejection",
    "reparse",
    "windows-release-lifecycle-preexisting-data-root-reparse",
    "linked-original",
    [],
  ],
  [
    "nested reparse rejection before descent",
    "nested-reparse",
    "windows-release-lifecycle-preexisting-data-root-reparse",
    "data",
    [],
  ],
  ["initially absent original", "absent", "synthetic-later-failure", null, []],
  [
    "verified backup and later failure",
    "later",
    "synthetic-later-failure",
    "data",
    [],
  ],
  [
    "owned cleanup failure and quarantine",
    "cleanup",
    "synthetic-later-failure",
    "data",
    ["test-data-cleanup-failed"],
  ],
  [
    "restoration failure",
    "restore",
    "synthetic-later-failure",
    "backup",
    ["original-data-restore-failed"],
  ],
  [
    "quarantine failure preserves both locations",
    "quarantine",
    "synthetic-later-failure",
    "backup",
    [
      "test-data-cleanup-failed",
      "test-data-quarantine-failed",
      "original-data-restore-failed",
    ],
  ],
];

for (const [
  name,
  scenario,
  expectedFailure,
  originalLocation,
  cleanupFailures,
] of lifecycleCases) {
  test(
    `lifecycle data ownership: ${name}`,
    { skip: process.platform !== "win32" },
    async (t) => {
      const temporary = await mkdtemp(
        path.join(os.tmpdir(), "voxleaf-lifecycle-data-test-"),
      );
      t.after(
        async () => await rm(temporary, { recursive: true, force: true }),
      );
      const sibling = path.join(temporary, "sibling.marker");
      await writeFile(sibling, "synthetic sibling sentinel");
      const quote = (value) => `'${value.replaceAll("'", "''")}'`;
      const source = String.raw`
$ErrorActionPreference = 'Stop'
. ${quote(path.join(repositoryRoot(), "scripts/windows-package-lifecycle-data.ps1"))}
$parent = ${quote(temporary)}
$scenario = ${quote(scenario)}
$data = Join-Path $parent 'data'
$backup = Join-Path $parent 'backup'
$quarantine = Join-Path $parent 'quarantine'
$state = New-LifecycleDataState $parent $data $backup $quarantine
if ($scenario -ne 'absent') {
  $original = $data
  if ($scenario -eq 'reparse') { $original = Join-Path $parent 'linked-original' }
  New-Item -ItemType Directory -Path $original | Out-Null
  [IO.File]::WriteAllBytes((Join-Path $original 'original.marker'), [byte[]](0, 17, 255, 42))
  if ($scenario -eq 'reparse') { New-Item -ItemType Junction -Path $data -Target $original | Out-Null }
}
if ($scenario -eq 'occupied-backup') {
  New-Item -ItemType Directory -Path $backup | Out-Null
  [IO.File]::WriteAllText((Join-Path $backup 'occupied.marker'), 'occupied sentinel')
}
if ($scenario -eq 'nested-reparse') {
  $linkedTarget = Join-Path $parent 'linked-target'
  New-Item -ItemType Directory -Path $linkedTarget | Out-Null
  [IO.File]::WriteAllText((Join-Path $linkedTarget 'untouched.marker'), 'reparse target sentinel')
  New-Item -ItemType Junction -Path (Join-Path $data 'nested-link') -Target $linkedTarget | Out-Null
}
$renameDirectory = (Get-Item Function:\Move-LifecycleDirectory).ScriptBlock
function Move-LifecycleDirectory {
  param($Source, $Destination)
  if ($scenario -eq 'backup-move' -and $Source -eq $data) { throw 'synthetic-backup-move' }
  if ($scenario -eq 'ambiguous-backup' -and $Source -eq $data) {
    Microsoft.PowerShell.Management\Copy-Item -LiteralPath $Source -Destination $Destination -Recurse
    return
  }
  if ($scenario -eq 'restore' -and $Source -eq $backup) { throw 'synthetic-restore' }
  if ($scenario -eq 'quarantine' -and $Destination -eq $quarantine) { throw 'synthetic-quarantine' }
  & $renameDirectory -Source $Source -Destination $Destination
}
function Get-Item {
  param($LiteralPath, [switch]$Force)
  if ($scenario -eq 'backup-verification' -and $LiteralPath -eq $backup) {
    return [pscustomobject]@{ PSIsContainer = $false; Attributes = [IO.FileAttributes]::Normal }
  }
  Microsoft.PowerShell.Management\Get-Item -LiteralPath $LiteralPath -Force:$Force
}
function Remove-Item {
  param($LiteralPath, [switch]$Recurse, [switch]$Force)
  if ($scenario -in @('cleanup', 'quarantine') -and $LiteralPath -eq $data) { throw 'synthetic-cleanup' }
  Microsoft.PowerShell.Management\Remove-Item -LiteralPath $LiteralPath -Recurse:$Recurse -Force:$Force
}
$primary = $null
try {
  Initialize-LifecycleDataOwnership $state
  if (-not $state.OwnsTestRoot) { throw 'test-ownership-not-granted' }
  New-Item -ItemType Directory -Path $data | Out-Null
  [IO.File]::WriteAllText((Join-Path $data 'fixture.marker'), 'owned synthetic fixture')
  throw 'synthetic-later-failure'
} catch { $primary = $_.Exception.Message }
finally { $failures = @(Complete-LifecycleData $state) }
if ($state.OwnsTestRoot) { throw 'test-ownership-not-revoked' }
# The same removal entry point used by fixture initialization must reject a root
# after cleanup, including one that now contains restored original data.
try { Remove-LifecycleTestDataRoot $state; throw 'test-unguarded-removal' }
catch { if ($_.Exception.Message -ne 'windows-release-lifecycle-test-data-not-owned') { throw } }
[ordered]@{ primary = $primary; failures = $failures } | ConvertTo-Json -Compress
`;
      const result = spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-EncodedCommand",
          Buffer.from(source, "utf16le").toString("base64"),
        ],
        { encoding: "utf8", timeout: 20_000, windowsHide: true },
      );
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      const report = JSON.parse(result.stdout.trim());
      assert.equal(report.primary, expectedFailure);
      assert.deepEqual(
        report.failures.map((failure) =>
          failure.split(":")[0].replace("windows-release-lifecycle-", ""),
        ),
        cleanupFailures,
      );
      if (originalLocation !== null) {
        assert.deepEqual(
          await readFile(
            path.join(temporary, originalLocation, "original.marker"),
          ),
          Buffer.from([0, 17, 255, 42]),
        );
      } else {
        await assert.rejects(
          readFile(path.join(temporary, "data/fixture.marker")),
          { code: "ENOENT" },
        );
      }
      if (scenario === "cleanup") {
        assert.equal(
          await readFile(
            path.join(temporary, "quarantine/fixture.marker"),
            "utf8",
          ),
          "owned synthetic fixture",
        );
      }
      if (scenario === "quarantine") {
        assert.equal(
          await readFile(path.join(temporary, "data/fixture.marker"), "utf8"),
          "owned synthetic fixture",
        );
      }
      if (scenario === "occupied-backup") {
        assert.equal(
          await readFile(
            path.join(temporary, "backup/occupied.marker"),
            "utf8",
          ),
          "occupied sentinel",
        );
      }
      if (scenario === "ambiguous-backup") {
        assert.deepEqual(
          await readFile(path.join(temporary, "backup/original.marker")),
          Buffer.from([0, 17, 255, 42]),
        );
      }
      if (scenario === "nested-reparse") {
        assert.equal(
          await readFile(
            path.join(temporary, "linked-target/untouched.marker"),
            "utf8",
          ),
          "reparse target sentinel",
        );
      }
      assert.equal(
        await readFile(sibling, "utf8"),
        "synthetic sibling sentinel",
      );
    },
  );
}

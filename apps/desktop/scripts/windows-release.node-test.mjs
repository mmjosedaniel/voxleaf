import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
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

for (const scenario of [
  "environment directory",
  "configured directory",
  "environment target",
  "configured target",
  "included target",
  "Cargo home target",
  "RUSTC compiler",
  "CARGO_BUILD_RUSTC compiler",
  "configured compiler",
  "canonical identical-byte rebuild",
]) {
  test(
    `CCF-C16 release layout handles ${scenario}`,
    { skip: process.platform !== "win32" },
    async () => {
      const fixture = await mkdtemp(path.join(os.tmpdir(), "voxleaf-layout-"));
      try {
        const srcTauri = path.join(fixture, "apps/desktop/src-tauri");
        const release = path.join(srcTauri, "target/release");
        const binary = path.join(release, "voxleaf-desktop.exe");
        const installer = path.join(
          release,
          "bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe",
        );
        const checksum = `${installer}.sha256`;
        const cargoHome = path.join(fixture, "cargo-home");
        const trace = path.join(fixture, "trace");
        const script = path.join(fixture, "scripts/build-windows-release.ps1");
        await mkdir(path.dirname(script), { recursive: true });
        await mkdir(path.dirname(installer), { recursive: true });
        await mkdir(path.join(srcTauri, "src"));
        await mkdir(cargoHome);
        await mkdir(path.join(srcTauri, ".cargo"));
        await copyFile(
          path.join(repositoryRoot(), "scripts/build-windows-release.ps1"),
          script,
        );
        await writeFile(
          path.join(srcTauri, "Cargo.toml"),
          '[package]\nname = "layout-fixture"\nversion = "0.1.0"\nedition = "2024"\n',
        );
        await writeFile(path.join(srcTauri, "src/main.rs"), "fn main() {}\n");
        await writeFile(binary, "synthetic binary");
        await writeFile(installer, "synthetic installer");
        await writeFile(checksum, "previous receipt");
        await writeFile(trace, "");
        const cargoConfig = {
          "configured directory": '[build]\ntarget-dir = "alternate-target"\n',
          "configured target": 'build.target = ["x86_64-pc-windows-msvc"]\n',
          "included target": 'include = ["layout.toml"]\n',
          "configured compiler": 'build.rustc = "alternate-rustc.exe"\n',
          "canonical identical-byte rebuild": "[build]\njobs = 1\n",
        }[scenario];
        if (cargoConfig !== undefined)
          await writeFile(
            path.join(srcTauri, ".cargo/config.toml"),
            cargoConfig,
          );
        if (scenario === "included target")
          await writeFile(
            path.join(srcTauri, ".cargo/layout.toml"),
            'build.target = "x86_64-pc-windows-msvc"\n',
          );
        if (scenario === "Cargo home target")
          await writeFile(
            path.join(cargoHome, "config"),
            'build.target = "x86_64-pc-windows-msvc"\n',
          );
        const overridden = new Set([
          "CARGO_HOME",
          "CARGO_TARGET_DIR",
          "CARGO_BUILD_TARGET_DIR",
          "CARGO_BUILD_TARGET",
          "CARGO_BUILD_RUSTC",
          "RUSTC",
          "TAURI_APP_PATH",
          "PSMODULEPATH",
        ]);
        const result = spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            `
$ErrorActionPreference = 'Stop'
function node {
  if ($args[1] -eq 'evidence') { Add-Content -LiteralPath $env:CCF_LAYOUT_TRACE -Value 'evidence' }
  $global:LASTEXITCODE = 0
}
function pnpm.cmd {
  Add-Content -LiteralPath $env:CCF_LAYOUT_TRACE -Value 'builder'
  if ($env:CCF_LAYOUT_CANONICAL -eq '1') {
    [IO.File]::WriteAllText($env:CCF_LAYOUT_BINARY, 'synthetic binary')
    [IO.File]::WriteAllText($env:CCF_LAYOUT_INSTALLER, 'synthetic installer')
  }
  $global:LASTEXITCODE = 0
}
function Get-AuthenticodeSignature {
  Add-Content -LiteralPath $env:CCF_LAYOUT_TRACE -Value 'signature'
  [pscustomobject]@{ Status = 'NotSigned' }
}
function Get-FileHash {
  param($LiteralPath, $Algorithm)
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try {
    [pscustomobject]@{ Hash = [BitConverter]::ToString($sha256.ComputeHash([IO.File]::ReadAllBytes($LiteralPath))).Replace('-', '') }
  } finally {
    $sha256.Dispose()
  }
}
& $env:CCF_LAYOUT_SCRIPT
`,
          ],
          {
            encoding: "utf8",
            timeout: 30_000,
            env: {
              ...Object.fromEntries(
                Object.entries(process.env).filter(
                  ([name]) => !overridden.has(name.toUpperCase()),
                ),
              ),
              CARGO_HOME: cargoHome,
              CARGO_TARGET_DIR:
                scenario === "environment directory"
                  ? "alternate-target"
                  : undefined,
              CARGO_BUILD_TARGET:
                scenario === "environment target"
                  ? "aarch64-pc-windows-msvc"
                  : undefined,
              RUSTC:
                scenario === "RUSTC compiler"
                  ? "alternate-rustc.exe"
                  : undefined,
              CARGO_BUILD_RUSTC:
                scenario === "CARGO_BUILD_RUSTC compiler"
                  ? "alternate-rustc.exe"
                  : undefined,
              CCF_LAYOUT_TRACE: trace,
              CCF_LAYOUT_SCRIPT: script,
              CCF_LAYOUT_BINARY: binary,
              CCF_LAYOUT_INSTALLER: installer,
              CCF_LAYOUT_CANONICAL:
                scenario === "canonical identical-byte rebuild"
                  ? "1"
                  : undefined,
            },
          },
        );
        if (scenario === "canonical identical-byte rebuild") {
          assert.equal(result.status, 0, result.stderr || result.stdout);
          assert.deepEqual(
            (await readFile(trace, "utf8")).trim().split(/\r?\n/u),
            ["builder", "signature", "signature", "evidence"],
          );
          assert.match(
            await readFile(checksum, "utf8"),
            /^[a-f0-9]{64} \*VoxLeaf_/u,
          );
        } else {
          assert.equal(result.status, 1, result.stderr || result.stdout);
          assert.match(result.stderr, /windows-release-cargo-layout/u);
          assert.equal(await readFile(trace, "utf8"), "");
          assert.equal(await readFile(checksum, "utf8"), "previous receipt");
        }
        assert.equal(await readFile(binary, "utf8"), "synthetic binary");
        assert.equal(await readFile(installer, "utf8"), "synthetic installer");
      } finally {
        await rm(fixture, { recursive: true, force: true });
      }
    },
  );
}

test(
  "CAF-R1.5 real signature policy rejects invalid and indeterminate pairs",
  { skip: process.platform !== "win32" },
  () => {
    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `
$ErrorActionPreference='Stop'
$ast=[Management.Automation.Language.Parser]::ParseFile((Join-Path (Get-Location) 'scripts/build-windows-release.ps1'),[ref]$null,[ref]$null)
$function=$ast.Find({param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Get-ReleaseSignatureStatus'},$true)
Invoke-Expression $function.Extent.Text
$states=@('Valid','NotSigned','HashMismatch','NotTrusted','UnknownError','NotSupportedFileFormat','Incompatible')
foreach($signed in @($false,$true)) {
 foreach($binary in $states) { foreach($installer in $states) {
  $expected=if($signed){'Valid'}else{'NotSigned'}
  $accepted=$binary -eq $expected -and $installer -eq $expected
  $outcome=$null
  try { $outcome=Get-ReleaseSignatureStatus $binary $installer $signed } catch { if($accepted){throw} }
  if($accepted -ne ($null -ne $outcome)){ throw "signature-policy-$binary-$installer-$signed" }
  if($accepted -and $outcome -ne $(if($signed){'signed-valid'}else{'unsigned-local'})){ throw 'signature-label' }
 } }
}
exit 0
`,
      ],
      { cwd: repositoryRoot(), encoding: "utf8", windowsHide: true },
    );
    assert.equal(result.status, 0, result.stderr);
  },
);

test(
  "lifecycle fixtures provide one marker for each declared optional root",
  {
    skip: process.platform !== "win32",
  },
  async () => {
    const { lifecycleScript } = await loadReleaseDocuments(repositoryRoot());
    const declarations = lifecycleScript.slice(
      lifecycleScript.indexOf("$optionalRoots = @("),
      lifecycleScript.indexOf("$preferenceMarker ="),
    );
    assert.ok(declarations.startsWith("$optionalRoots = @("));
    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `
$ErrorActionPreference = 'Stop'
$dataRoot = Join-Path ([IO.Path]::GetTempPath()) 'voxleaf-synthetic-fixtures'
$profileId = 'synthetic-profile'
${declarations}
if ($optionalRoots.Count -ne 9 -or $optionalMarkers.Count -ne $optionalRoots.Count) { throw 'optional-marker-count' }
for ($index = 0; $index -lt $optionalRoots.Count; $index++) {
  if ($optionalMarkers[$index] -ne (Join-Path $optionalRoots[$index] "optional-$index.marker")) { throw 'optional-marker-owner' }
}
`,
      ],
      { encoding: "utf8", windowsHide: true },
    );
    assert.equal(result.status, 0, result.stderr);
  },
);

for (const mode of [
  "partial",
  "post-install",
  "first-start",
  "interrupted",
  "missing-uninstaller",
  "failed-uninstaller",
  "hanging-uninstaller",
  "installer-drift",
  "success",
]) {
  test(
    `VAF H13 lifecycle owns partial installs and restores only after uninstall: ${mode}`,
    {
      skip: process.platform !== "win32",
    },
    async () => {
      const root = await mkdtemp(
        path.join(await realpath(os.tmpdir()), "voxleaf-vaf-lifecycle-"),
      );
      const quote = (value) => `'${value.replaceAll("'", "''")}'`;
      try {
        const source = String.raw`
$ErrorActionPreference = 'Stop'
$fixtureRoot = ${quote(root)}
$fixtureMode = ${quote(mode)}
$env:LOCALAPPDATA = Join-Path $fixtureRoot 'local'
$env:TEMP = Join-Path $fixtureRoot 'temp'
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Path $env:LOCALAPPDATA,$env:TEMP -Force | Out-Null
$fixtureInstallRoot = Join-Path $env:LOCALAPPDATA 'VoxLeaf'
$fixtureDataRoot = Join-Path $env:LOCALAPPDATA 'com.voxleaf.desktop'
New-Item -ItemType Directory -Path $fixtureDataRoot | Out-Null
[IO.File]::WriteAllText((Join-Path $fixtureDataRoot 'original.marker'), 'original')
$fixtureInstaller = Join-Path $fixtureRoot 'VoxLeaf_0.1.0_x64-setup.exe'
[IO.File]::WriteAllText($fixtureInstaller, 'not executable')
$fixtureWriteUtc = [DateTime]::UtcNow.AddSeconds(-2)
$fixtureWriteUtc = $fixtureWriteUtc.AddTicks(7500 - ($fixtureWriteUtc.Ticks % 10000))
[IO.File]::SetLastWriteTimeUtc($fixtureInstaller, $fixtureWriteUtc)
$fixtureReceipt = Join-Path $fixtureRoot 'windows-lifecycle-receipt-v1.json'
[IO.File]::WriteAllText($fixtureReceipt, 'stale prior receipt')
$fixtureEvents = [Collections.Generic.List[string]]::new()
$fixtureJournalSeen = [Collections.Generic.List[bool]]::new()
function Start-Sleep { param($Seconds) }
function Stop-Process { param($Id, [switch]$Force, $ErrorAction) $fixtureEvents.Add('stop') }
function New-FixturePackageProcess {
  param($ExitCode)
  $process = [pscustomobject]@{ExitCode=$ExitCode; HasExited=$true; Id=0; StartTime=[DateTime]::UtcNow}
  $process | Add-Member -MemberType ScriptMethod -Name WaitForExit -Value { param($Milliseconds) return $true }
  return $process
}
function Start-Process {
  param($FilePath, $ArgumentList, [switch]$Wait, [switch]$PassThru, $WindowStyle)
  if ($FilePath -eq $fixtureInstaller) {
    $fixtureEvents.Add('install')
    $fixtureJournalSeen.Add(@(Get-ChildItem -LiteralPath $env:TEMP -Recurse -Filter 'recovery.json').Count -eq 1)
    New-Item -ItemType Directory -Path $fixtureInstallRoot -Force | Out-Null
    if ($fixtureMode -ne 'missing-uninstaller') { [IO.File]::WriteAllText((Join-Path $fixtureInstallRoot 'uninstall.exe'), 'synthetic') }
    if ($fixtureMode -eq 'partial') { return New-FixturePackageProcess 1 }
    if ($fixtureMode -eq 'interrupted') { throw [OperationCanceledException]::new('synthetic-interruption') }
    if ($fixtureMode -ne 'post-install') {
      [IO.File]::WriteAllText((Join-Path $fixtureInstallRoot 'voxleaf-desktop.exe'), 'synthetic')
      $core = Join-Path $fixtureInstallRoot 'resources\tts\voxleaf-piper-core-v1'
      New-Item -ItemType Directory -Path $core -Force | Out-Null
      [IO.File]::WriteAllText((Join-Path $core 'runtime-manifest-v1.json'), '{}')
    }
    return New-FixturePackageProcess 0
  }
  if ($FilePath -eq (Join-Path $fixtureInstallRoot 'uninstall.exe') -or (Split-Path $FilePath -Leaf) -eq 'owned-uninstall.exe') {
    $fixtureEvents.Add('uninstall')
    if (Test-Path -LiteralPath (Join-Path $fixtureDataRoot 'original.marker')) { throw 'synthetic-restore-before-uninstall' }
    if ($fixtureMode -eq 'hanging-uninstaller') {
      if ($Wait) { $fixtureEvents.Add('unbounded-uninstall-wait') }
      $process = [pscustomobject]@{HasExited=$false; ExitCode=0; Id=0; StartTime=[DateTime]::UtcNow}
      $process | Add-Member -MemberType ScriptMethod -Name WaitForExit -Value {
        param($Milliseconds)
        if ($Milliseconds -le 0 -or $Milliseconds -gt 120000) { throw 'synthetic-uninstall-deadline-invalid' }
        $fixtureEvents.Add('bounded-uninstall-wait')
        return $this.HasExited
      }
      $process | Add-Member -MemberType ScriptMethod -Name Kill -Value { $fixtureEvents.Add('kill-uninstaller'); $this.HasExited=$true }
      return $process
    }
    if ((Split-Path $FilePath -Leaf) -eq 'owned-uninstall.exe' -and $ArgumentList[-1] -ne "_?=$fixtureInstallRoot") { throw 'synthetic-uninstall-root-argument' }
    if ($fixtureMode -eq 'failed-uninstaller') { return New-FixturePackageProcess 1 }
    foreach ($rootToRemove in @($fixtureInstallRoot)) {
      Assert-ExactChildPath $env:LOCALAPPDATA $rootToRemove 'synthetic-root-invalid'
      Assert-NoReparsePoints $rootToRemove 'synthetic-reparse'
      Remove-Item -LiteralPath $rootToRemove -Recurse -Force
    }
    if ($ArgumentList -contains '/REMOVE_APP_DATA=1' -or $ArgumentList -contains '/REMOVE_CHATTERBOX_DATA=1') {
      foreach ($optional in $optionalRoots) { if (Test-Path -LiteralPath $optional) { Remove-Item -LiteralPath $optional -Recurse -Force } }
    }
    if ($ArgumentList -contains '/REMOVE_APP_DATA=1' -or $ArgumentList -contains '/REMOVE_PREFERENCES_AND_RECOVERY=1') {
      if (Test-Path -LiteralPath $preferenceRoot) { Remove-Item -LiteralPath $preferenceRoot -Recurse -Force }
    }
    if ($fixtureMode -eq 'installer-drift' -and @($fixtureEvents | Where-Object { $_ -eq 'uninstall' }).Count -eq 7) {
      [IO.File]::AppendAllText($fixtureInstaller, 'changed installer')
    }
    return New-FixturePackageProcess 0
  }
  if ($FilePath -eq (Join-Path $fixtureInstallRoot 'voxleaf-desktop.exe')) {
    $fixtureEvents.Add('start')
    if ($fixtureMode -in @('failed-uninstaller','hanging-uninstaller')) { throw 'synthetic-after-install' }
    $process = [pscustomobject]@{HasExited=($fixtureMode -eq 'first-start'); Id=0; StartTime=[DateTime]::UtcNow}
    $process | Add-Member -MemberType ScriptMethod -Name WaitForExit -Value { param($Milliseconds) return $true }
    $process | Add-Member -MemberType ScriptMethod -Name Kill -Value { $this.HasExited=$true }
    return $process
  }
  throw 'synthetic-unexpected-process'
}
$fixtureFailure = $null
try { & ${quote(path.join(repositoryRoot(), "scripts", "test-windows-package-lifecycle.ps1"))} -Installer $fixtureInstaller -LifecycleReceipt $fixtureReceipt | Out-Null } catch { $fixtureFailure=$_.Exception.Message }
$blockedCleanup = $fixtureMode -in @('missing-uninstaller','failed-uninstaller','hanging-uninstaller')
if ($fixtureMode -eq 'success') { if ($null -ne $fixtureFailure) { throw $fixtureFailure } }
elseif ($null -eq $fixtureFailure) { throw 'synthetic-missing-primary-failure' }
if ($fixtureMode -eq 'partial' -and $fixtureFailure -ne 'windows-release-lifecycle-installer-failed') { throw 'synthetic-primary-failure-lost' }
if ($fixtureMode -eq 'interrupted' -and $fixtureFailure -ne 'synthetic-interruption') { throw 'synthetic-interruption-lost' }
if ($fixtureMode -eq 'installer-drift' -and $fixtureFailure -ne 'windows-release-lifecycle-installer-drift') { throw 'synthetic-installer-drift-not-rejected' }
if ($fixtureMode -eq 'hanging-uninstaller') {
  if ($fixtureFailure -ne 'synthetic-after-install') { throw 'synthetic-primary-failure-lost' }
  if ($fixtureEvents.Contains('unbounded-uninstall-wait') -or -not $fixtureEvents.Contains('bounded-uninstall-wait')) { throw 'synthetic-unbounded-uninstall' }
  if (-not $fixtureEvents.Contains('kill-uninstaller')) { throw 'synthetic-uninstaller-not-stopped' }
  if (@($fixtureEvents | Where-Object { $_ -eq 'uninstall' }).Count -ne 1) { throw 'synthetic-uninstall-retried' }
}
if ($blockedCleanup) {
  if (-not (Test-Path -LiteralPath $fixtureInstallRoot)) { throw 'synthetic-unverified-install-deleted' }
  if (Test-Path -LiteralPath (Join-Path $fixtureDataRoot 'original.marker')) { throw 'synthetic-unsafe-original-restoration' }
  $backups = @(Get-ChildItem -LiteralPath $env:LOCALAPPDATA -Directory -Filter '.voxleaf-package-lifecycle-backup-*')
  if ($backups.Count -ne 1 -or [IO.File]::ReadAllText((Join-Path $backups[0].FullName 'original.marker')) -ne 'original') { throw 'synthetic-original-backup-lost' }
  if (@(Get-ChildItem -LiteralPath $env:TEMP -Recurse -Filter recovery.json).Count -ne 1) { throw 'synthetic-recovery-journal-lost' }
} else {
  if (Test-Path -LiteralPath $fixtureInstallRoot) { throw 'synthetic-owned-install-left-behind' }
  if ([IO.File]::ReadAllText((Join-Path $fixtureDataRoot 'original.marker')) -ne 'original') { throw 'synthetic-original-not-restored' }
  if (-not $fixtureEvents.Contains('uninstall')) { throw 'synthetic-uninstall-not-attempted' }
  if (@(Get-ChildItem -LiteralPath $env:TEMP).Count -ne 0) { throw 'synthetic-temporary-root-left-behind' }
}
if ($fixtureJournalSeen.Count -eq 0 -or $fixtureJournalSeen.Contains($false)) { throw 'synthetic-preinstall-journal-missing' }
if ($fixtureMode -eq 'success') {
  $record = Get-Content -Raw -LiteralPath $fixtureReceipt | ConvertFrom-Json
  if ($record.schemaVersion -ne 1 -or $record.status -ne 'passed' -or -not $record.checks.cleanupVerified -or
      $record.installer.fileName -ne 'VoxLeaf_0.1.0_x64-setup.exe' -or $record.installer.sizeBytes -ne (Get-Item -LiteralPath $fixtureInstaller).Length -or
      $record.installer.sha256 -ne (Get-FileHash -LiteralPath $fixtureInstaller -Algorithm SHA256).Hash.ToLowerInvariant() -or
      $record.uninstallOptionMatrix.Count -ne 6) { throw 'synthetic-lifecycle-receipt-invalid' }
} elseif (Test-Path -LiteralPath $fixtureReceipt) { throw 'synthetic-unsafe-lifecycle-receipt' }
Write-Output 'ownership-cleanup-order-and-recovery-verified'
`;
        const script = path.join(root, "fixture.ps1");
        await writeFile(script, source);
        const result = spawnSync(
          "powershell.exe",
          ["-NoProfile", "-NonInteractive", "-File", script],
          {
            encoding: "utf8",
            timeout: 30_000,
            windowsHide: true,
            env: Object.fromEntries(
              Object.entries(process.env).filter(
                ([name]) => name.toLowerCase() !== "psmodulepath",
              ),
            ),
          },
        );
        assert.equal(result.error, undefined);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.match(
          result.stdout,
          /ownership-cleanup-order-and-recovery-verified/,
        );
        if (mode === "success") {
          const installer = path.join(
            root,
            `VoxLeaf_${APP_VERSION}_x64-setup.exe`,
          );
          const binary = path.join(root, "voxleaf-desktop.exe");
          await writeFile(binary, "synthetic binary");
          const lifecycleReceipt = JSON.parse(
            await readFile(
              path.join(root, "windows-lifecycle-receipt-v1.json"),
              "utf8",
            ),
          );
          const installerStats = await stat(installer);
          const truncated = new Date(
            Math.trunc(installerStats.mtimeMs),
          ).toISOString();
          assert.notEqual(installerStats.mtime.toISOString(), truncated);
          assert.equal(lifecycleReceipt.installer.modifiedAtUtc, truncated);
          const evidence = await createPackageEvidence({
            root: repositoryRoot(),
            installer,
            binary,
            signatureStatus: "unsigned-local",
            antivirusStatus: "not-run",
            lifecycleReceipt,
          });
          assert.equal(
            evidence.lifecycle.status,
            "local-install-first-start-repair-uninstall-passed",
          );
          assert.equal(evidence.lifecycle.localReleaseGatesPassed, false);
        }
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  );
}

for (const lcf of [false, true]) {
  test(
    lcf
      ? "VAF H9 and LCF compiled NSIS report incomplete independent data cleanup"
      : "CLB-01 compiled NSIS detects directories and each optional root",
    {
      skip: process.platform !== "win32",
    },
    async () => {
      const { nsisHooks } = await loadReleaseDocuments(repositoryRoot());
      const directoryFunction = nsisHooks.match(
        /Function un\.ExactDirectoryExists[\s\S]*?FunctionEnd/,
      )?.[0];
      const optionalFunction = nsisHooks.match(
        /Function un\.OptionalChatterboxDataExists[\s\S]*?FunctionEnd/,
      )?.[0];
      assert.ok(directoryFunction && optionalFunction);
      const root = await mkdtemp(
        path.join(await realpath(os.tmpdir()), "voxleaf-nsis-clb-"),
      );
      try {
        const ownedRoot = path.join(root, "owned");
        const optionalRoots = [
          ...optionalFunction.matchAll(
            /\$LOCALAPPDATA\\com\.voxleaf\.desktop\\([^"\r\n]+)/g,
          ),
        ].map((match) => match[1]);
        assert.equal(optionalRoots.length, 9);
        assert.ok(optionalRoots.includes("tts\\cb\\7"));
        assert.ok(optionalRoots.includes("tts\\cb\\6"));
        assert.ok(optionalRoots.includes("tts\\cb\\5"));
        assert.ok(optionalRoots.includes("tts\\cb\\.previous"));
        const safeFunctions = ["IsSafeOwnedDirectory", "IsSafeOwnedTree"]
          .map((name) => {
            const fn = nsisHooks.match(
              new RegExp(`Function un\\.${name}[\\s\\S]*?FunctionEnd`),
            )?.[0];
            assert.ok(fn);
            return fn;
          })
          .join("\n");
        const hooks = nsisHooks
          .slice(nsisHooks.indexOf("!macro NSIS_HOOK_PREUNINSTALL"))
          .replaceAll("$LOCALAPPDATA\\com.voxleaf.desktop", "$EXEDIR\\owned");
        const fixture = `Unicode true
!include "FileFunc.nsh"
Var RemoveChatterboxData
Var RemovePreferencesAndRecovery
Var DeleteAppDataCheckboxState
Var ChatterboxDataCheckboxState
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
OutFile "${root}\\fixture.exe"
${directoryFunction}
${optionalFunction.replaceAll("$LOCALAPPDATA\\com.voxleaf.desktop", "$EXEDIR\\owned")}
${safeFunctions}
${hooks}
Section
  WriteUninstaller "$EXEDIR\\uninstall.exe"
SectionEnd
Section "Uninstall"
  StrCpy $R0 "$EXEDIR\\candidate"
  Call un.ExactDirectoryExists
  FileOpen $0 "$EXEDIR\\result.txt" w
  FileWrite $0 "$R0"
  Call un.OptionalChatterboxDataExists
  FileWrite $0 "$R0"
  FileClose $0
  !insertmacro NSIS_HOOK_PREUNINSTALL
  !insertmacro NSIS_HOOK_POSTUNINSTALL
SectionEnd
`;
        await writeFile(path.join(root, "fixture.nsi"), fixture);
        const compiler = path.join(
          process.env.LOCALAPPDATA,
          "tauri",
          "NSIS",
          "makensis.exe",
        );
        const compiled = spawnSync(
          compiler,
          ["/V2", path.join(root, "fixture.nsi")],
          { encoding: "utf8" },
        );
        assert.equal(compiled.status, 0, compiled.stderr || compiled.stdout);
        assert.equal(
          spawnSync(path.join(root, "fixture.exe"), ["/S"]).status,
          0,
        );
        const observe = async (expected) => {
          assert.equal(
            spawnSync(path.join(root, "uninstall.exe"), ["/S", `_?=${root}`])
              .status,
            0,
          );
          assert.equal(
            await readFile(path.join(root, "result.txt"), "utf8"),
            expected,
          );
        };
        if (!lcf) {
          await observe("00");
          await writeFile(path.join(root, "candidate"), "synthetic");
          await observe("00");
          await rm(path.join(root, "candidate"));
          await mkdir(path.join(root, "candidate"));
          await observe("10");
          await writeFile(
            path.join(root, "candidate", "sentinel"),
            "synthetic",
          );
          await observe("10");
          for (const relative of optionalRoots) {
            await mkdir(path.join(ownedRoot, relative), { recursive: true });
            await observe("11");
            await rm(ownedRoot, { recursive: true });
          }
        }
        const backup = path.join(ownedRoot, "tts", "cb", ".previous");
        const preferences = path.join(
          ownedRoot,
          "EBWebView",
          "Default",
          "Local Storage",
        );
        const outside = path.join(root, "outside");
        for (const directory of [
          ...(lcf ? [] : [backup]),
          preferences,
          outside,
        ]) {
          await mkdir(directory, { recursive: true });
          await writeFile(path.join(directory, "keep.bin"), "synthetic");
        }
        const uninstall = (...flags) =>
          spawnSync(path.join(root, "uninstall.exe"), [
            "/S",
            ...flags,
            `_?=${root}`,
          ]).status;
        if (lcf) {
          const quote = (value) => `'${value.replaceAll("'", "''")}'`;
          const runPowerShell = (script) => {
            const result = spawnSync(
              "powershell.exe",
              ["-NoProfile", "-NonInteractive", "-Command", script],
              {
                encoding: "utf8",
                timeout: 30_000,
                windowsHide: true,
                // Windows PowerShell must resolve its own modules, not inherit
                // PowerShell 7's incompatible module search path from the host.
                env: Object.fromEntries(
                  Object.entries(process.env).filter(
                    ([name]) => name.toLowerCase() !== "psmodulepath",
                  ),
                ),
              },
            );
            assert.equal(result.error, undefined);
            return result;
          };
          // Each literal root must participate in the final postcondition; there
          // is no .previous directory while testing cb/6 and the other roots.
          for (const relative of [
            ...optionalRoots,
            "EBWebView\\Default\\Local Storage",
          ]) {
            const removalFlag = relative.startsWith("EBWebView")
              ? "/REMOVE_PREFERENCES_AND_RECOVERY=1"
              : "/REMOVE_CHATTERBOX_DATA=1";
            const directory = path.join(ownedRoot, relative);
            await mkdir(directory, { recursive: true });
            const sentinel = path.join(directory, "locked.bin");
            await writeFile(sentinel, "synthetic");
            assert.equal(uninstall(), 0);
            assert.equal(uninstall("/UPDATE", removalFlag), 0);
            assert.equal(await readFile(sentinel, "utf8"), "synthetic");
            const locked = runPowerShell(
              `$ErrorActionPreference='Stop'; $handle=[IO.File]::Open(${quote(sentinel)}, 'Open', 'Read', 'Read'); try { $result=(Start-Process -FilePath ${quote(path.join(root, "uninstall.exe"))} -ArgumentList @('/S', ${quote(removalFlag)}, ${quote(`_?=${root}`)}) -Wait -PassThru -WindowStyle Hidden).ExitCode } finally { $handle.Dispose() }; exit $result`,
            );
            assert.equal(
              locked.status,
              1,
              `${relative}: ${locked.stderr || locked.stdout}`,
            );
            assert.equal(await readFile(sentinel, "utf8"), "synthetic");
            assert.equal(uninstall(removalFlag), 0);
            await assert.rejects(readFile(sentinel), { code: "ENOENT" });
            await mkdir(path.dirname(directory), { recursive: true });
            await symlink(outside, directory, "junction");
            try {
              assert.equal(uninstall(removalFlag), 1, relative);
              assert.equal(
                await readFile(path.join(outside, "keep.bin"), "utf8"),
                "synthetic",
              );
            } finally {
              await rm(directory);
            }
          }
          // Deny directory lookup under a test-owned parent, then restore its ACL
          // even if the child uninstaller fails. Access denied is not absence.
          // Runners can bypass directory traversal ACLs. Remove that privilege
          // only from this short-lived fixture process and its uninstaller child.
          const attributeProbe = `
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class LcfAttributes {
  [StructLayout(LayoutKind.Sequential)]
  private struct TokenPrivileges { public uint Count; public uint Low; public int High; public uint Attributes; }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern int GetFileAttributesW(string path);
  [DllImport("advapi32.dll", SetLastError=true)]
  private static extern bool OpenProcessToken(IntPtr process, uint access, out IntPtr token);
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  private static extern bool LookupPrivilegeValueW(string system, string name, out long luid);
  [DllImport("advapi32.dll", SetLastError=true)]
  private static extern bool AdjustTokenPrivileges(IntPtr token, bool disableAll, ref TokenPrivileges privileges, uint length, IntPtr previous, IntPtr returned);
  [DllImport("kernel32.dll")]
  private static extern bool CloseHandle(IntPtr handle);
  public static void RemoveTraverseBypass() {
    IntPtr token;
    if (!OpenProcessToken(new IntPtr(-1), 0x28, out token)) throw new Win32Exception();
    try {
      long luid;
      if (!LookupPrivilegeValueW(null, "SeChangeNotifyPrivilege", out luid)) throw new Win32Exception();
      var privileges = new TokenPrivileges { Count = 1, Low = (uint)luid, High = (int)(luid >> 32), Attributes = 4 };
      if (!AdjustTokenPrivileges(token, false, ref privileges, 0, IntPtr.Zero, IntPtr.Zero)) throw new Win32Exception();
      int error = Marshal.GetLastWin32Error();
      if (error != 0) throw new Win32Exception(error);
    } finally { CloseHandle(token); }
  }
}`;
          for (const [parent, child, flag] of [
            ["tts\\cb", "6", "/REMOVE_CHATTERBOX_DATA=1"],
            [
              "EBWebView\\Default",
              "Local Storage",
              "/REMOVE_PREFERENCES_AND_RECOVERY=1",
            ],
          ]) {
            const deniedParent = path.join(ownedRoot, parent);
            await mkdir(path.join(deniedParent, child), { recursive: true });
            const denied = runPowerShell(
              `$ErrorActionPreference='Stop'; $path=${quote(deniedParent)}; $original=Get-Acl -LiteralPath $path; $blocked=Get-Acl -LiteralPath $path; $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User; $rule=New-Object Security.AccessControl.FileSystemAccessRule($sid,'ReadData,ReadAttributes,ReadExtendedAttributes,ExecuteFile','ContainerInherit,ObjectInherit','None','Deny'); $blocked.AddAccessRule($rule); Add-Type ${quote(attributeProbe)}; [LcfAttributes]::RemoveTraverseBypass(); try { Set-Acl -LiteralPath $path -AclObject $blocked; $attributes=[LcfAttributes]::GetFileAttributesW((Join-Path $path ${quote(child)})); $inspectionError=[Runtime.InteropServices.Marshal]::GetLastWin32Error(); if ($attributes -ne -1 -or $inspectionError -ne 5) { throw "expected-access-denied-inspection: attributes=$attributes error=$inspectionError" }; Write-Output 'inspection-error=5'; $result=(Start-Process -FilePath ${quote(path.join(root, "uninstall.exe"))} -ArgumentList @('/S', ${quote(flag)}, ${quote(`_?=${root}`)}) -Wait -PassThru -WindowStyle Hidden).ExitCode } finally { Set-Acl -LiteralPath $path -AclObject $original }; exit $result`,
            );
            assert.equal(denied.status, 1, denied.stderr || denied.stdout);
            assert.equal(denied.stderr, "");
            assert.match(denied.stdout, /inspection-error=5/);
            assert.equal(uninstall(flag), 0);
          }
          await mkdir(preferences, { recursive: true });
          await writeFile(path.join(preferences, "keep.bin"), "synthetic");
          assert.equal(
            await readFile(path.join(preferences, "keep.bin"), "utf8"),
            "synthetic",
          );
          assert.equal(uninstall("/REMOVE_PREFERENCES_AND_RECOVERY=1"), 0);
          await assert.rejects(readFile(path.join(preferences, "keep.bin")), {
            code: "ENOENT",
          });
          assert.equal(
            await readFile(path.join(outside, "keep.bin"), "utf8"),
            "synthetic",
          );
          return;
        }
        assert.equal(uninstall(), 0);
        assert.equal(
          await readFile(path.join(backup, "keep.bin"), "utf8"),
          "synthetic",
        );
        assert.equal(uninstall("/UPDATE", "/REMOVE_CHATTERBOX_DATA=1"), 0);
        assert.equal(
          await readFile(path.join(backup, "keep.bin"), "utf8"),
          "synthetic",
        );
        const junction = path.join(backup, "external");
        await symlink(outside, junction, "junction");
        assert.equal(uninstall("/REMOVE_CHATTERBOX_DATA=1"), 1);
        assert.equal(
          await readFile(path.join(outside, "keep.bin"), "utf8"),
          "synthetic",
        );
        await rm(junction);
        assert.equal(uninstall("/REMOVE_CHATTERBOX_DATA=1"), 0);
        await assert.rejects(readFile(path.join(backup, "keep.bin")), {
          code: "ENOENT",
        });
        assert.equal(
          await readFile(path.join(preferences, "keep.bin"), "utf8"),
          "synthetic",
        );
        assert.equal(
          await readFile(path.join(outside, "keep.bin"), "utf8"),
          "synthetic",
        );
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  );
}

test(
  "NSIS resolves optional-data strings after Tauri includes hooks before languages",
  { skip: process.platform !== "win32" },
  async () => {
    const { nsisHooks } = await loadReleaseDocuments(repositoryRoot());
    const root = await mkdtemp(path.join(os.tmpdir(), "voxleaf-nsis-lang-"));
    try {
      const fixture = `Unicode true
!include "MUI2.nsh"
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
OutFile "${root}\\fixture.exe"
${nsisHooks}
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Spanish"
Function un.onInit
  \${GetParameters} $R0
  \${GetOptions} $R0 "/TEST_LANGUAGE=" $LANGUAGE
FunctionEnd
Section
  WriteUninstaller "$EXEDIR\\uninstall.exe"
SectionEnd
Section "Uninstall"
  FileOpen $0 "$EXEDIR\\strings.txt" w
  FileWriteUTF16LE $0 "$(chatterboxDataPageTitle)$\\r$\\n"
  FileWriteUTF16LE $0 "$(chatterboxDataPageSubtitle)$\\r$\\n"
  FileWriteUTF16LE $0 "$(chatterboxDataPageText)$\\r$\\n"
  FileWriteUTF16LE $0 "$(chatterboxDataCheckbox)$\\r$\\n"
  FileClose $0
SectionEnd
`;
      const script = path.join(root, "fixture.nsi");
      await writeFile(script, fixture);
      const compiler = path.join(
        process.env.LOCALAPPDATA,
        "tauri",
        "NSIS",
        "makensis.exe",
      );
      const compiled = spawnSync(compiler, ["/V2", script], {
        encoding: "utf8",
        timeout: 30_000,
      });
      assert.equal(compiled.status, 0, compiled.stderr || compiled.stdout);
      assert.equal(
        spawnSync(path.join(root, "fixture.exe"), ["/S"], { timeout: 30_000 })
          .status,
        0,
      );
      for (const [language, title] of [
        [1033, "Chatterbox data"],
        [1034, "Datos de Chatterbox"],
      ]) {
        assert.equal(
          spawnSync(
            path.join(root, "uninstall.exe"),
            ["/S", `/TEST_LANGUAGE=${language}`, `_?=${root}`],
            { timeout: 30_000 },
          ).status,
          0,
        );
        const strings = (
          await readFile(path.join(root, "strings.txt"), "utf16le")
        )
          .trimEnd()
          .split("\r\n");
        assert.equal(strings[0], title);
        assert.equal(strings.length, 4);
        assert.ok(strings.every((value) => value.trim().length > 0));
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

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
          "--lifecycle-receipt tmp/evidence/windows-release/windows-lifecycle-receipt-v1.json ",
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

test("DCR-05 content-safe evidence distinguishes unsigned local and signed public gates", async (t) => {
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
  assert.equal(unsigned.optionalChatterbox.downloadBytes, 8_240_315_465);
  assert.equal(
    unsigned.optionalChatterbox.representativeCompatibleHostJourney,
    "not-run",
  );
  assert.equal(JSON.stringify(unsigned).includes(temporary), false);

  const receipt = await createJourneyReceipt({
    installer,
    executable: installedBinary,
  });
  await assert.rejects(
    () =>
      createPackageEvidence({
        root: repositoryRoot(),
        installer,
        binary,
        signatureStatus: "signed-valid",
        antivirusStatus: "not-run",
        lifecycleStatus: "local-install-first-start-repair-uninstall-passed",
        ordinaryChatterboxReceipt: receipt,
      }),
    /windows-release:lifecycle-status/u,
  );
  const installerStats = await stat(installer);
  const now = new Date().toISOString();
  const lifecycleReceipt = {
    schemaVersion: 1,
    status: "passed",
    installer: {
      ...receipt.artifact.installer,
      modifiedAtUtc: new Date(Math.trunc(installerStats.mtimeMs)).toISOString(),
    },
    startedAtUtc: now,
    completedAtUtc: now,
    checks: {
      install: true,
      firstStart: true,
      repair: true,
      defaultUninstallAfterRepair: true,
      cleanupVerified: true,
    },
    uninstallOptionMatrix: [
      ["default-preserve", false, false],
      ["chatterbox-only", true, false],
      ["preferences-only", false, true],
      ["both-explicit", true, true],
      ["legacy-both", true, true],
      ["invalid-values-preserve", false, false],
    ].map(([scenario, chatterboxRemoved, preferencesAndRecoveryRemoved]) => ({
      scenario,
      chatterboxRemoved,
      preferencesAndRecoveryRemoved,
      unrelatedDataPreserved: true,
    })),
  };
  const signedInputs = {
    root: repositoryRoot(),
    installer,
    binary,
    signatureStatus: "signed-valid",
    antivirusStatus: "windows-defender-no-threats",
    ordinaryChatterboxReceipt: receipt,
  };
  const missing = await createPackageEvidence(signedInputs);
  assert.equal(missing.lifecycle.localReleaseGatesPassed, false);
  assert.equal(missing.signature.publicPublicationAllowed, false);
  for (const mutate of [
    (value) => {
      value.installer.sha256 = "0".repeat(64);
    },
    (value) => {
      value.installer.modifiedAtUtc = "2000-01-01T00:00:00.000Z";
    },
    (value) => {
      value.startedAtUtc = "2000-01-01T00:00:00.000Z";
    },
    (value) => {
      value.checks.cleanupVerified = false;
    },
    (value) => {
      value.uninstallOptionMatrix.pop();
    },
    (value) => {
      value.uninstallOptionMatrix[0].unrelatedDataPreserved = false;
    },
    (value) => {
      value.completedAtUtc = "malformed";
    },
    (value) => {
      value.extra = true;
    },
  ]) {
    const invalid = JSON.parse(JSON.stringify(lifecycleReceipt));
    mutate(invalid);
    await assert.rejects(
      () =>
        createPackageEvidence({ ...signedInputs, lifecycleReceipt: invalid }),
      /windows-release:lifecycle-receipt/u,
    );
  }
  const signed = await createPackageEvidence({
    ...signedInputs,
    lifecycleReceipt,
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
      path.join(await realpath(os.tmpdir()), "voxleaf-lifecycle-rename-test-"),
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

for (const transient of [true, false]) {
  test(
    transient
      ? "lifecycle cleanup waits for a closing process to release its file handle"
      : "lifecycle cleanup bounds a persistent file lock and preserves original data",
    { skip: process.platform !== "win32" },
    async (t) => {
      const temporary = await mkdtemp(
        path.join(
          await realpath(os.tmpdir()),
          "voxleaf-lifecycle-handle-test-",
        ),
      );
      t.after(
        async () => await rm(temporary, { recursive: true, force: true }),
      );
      const quote = (value) => `'${value.replaceAll("'", "''")}'`;
      const source = String.raw`
$ErrorActionPreference = 'Stop'
. ${quote(path.join(repositoryRoot(), "scripts/windows-package-lifecycle-data.ps1"))}
$parent = ${quote(temporary)}
$transient = ${transient ? "$true" : "$false"}
$data = Join-Path $parent 'data'
$backup = Join-Path $parent 'backup'
$quarantine = Join-Path $parent 'quarantine'
New-Item -ItemType Directory -Path $data | Out-Null
[IO.File]::WriteAllText((Join-Path $data 'original.marker'), 'original')
$state = New-LifecycleDataState $parent $data $backup $quarantine
Initialize-LifecycleDataOwnership $state
New-Item -ItemType Directory -Path $data | Out-Null
$lockedPath = Join-Path $data 'closing-webview.tmp'
[IO.File]::WriteAllText($lockedPath, 'synthetic')
$ready = [Threading.ManualResetEvent]::new($false)
$release = [Threading.ManualResetEvent]::new($false)
$worker = [PowerShell]::Create()
[void]$worker.AddScript({
  param($Path, $Ready, $Release)
  $handle = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
  try {
    [void]$Ready.Set()
    [void]$Release.WaitOne(30000)
    Start-Sleep -Milliseconds 300
  } finally { $handle.Dispose() }
}).AddArgument($lockedPath).AddArgument($ready).AddArgument($release)
$pending = $worker.BeginInvoke()
function Remove-Item {
  param($LiteralPath, [switch]$Recurse, [switch]$Force)
  if ($transient) { [void]$release.Set() }
  Microsoft.PowerShell.Management\Remove-Item -LiteralPath $LiteralPath -Recurse:$Recurse -Force:$Force
}
try {
  if (-not $ready.WaitOne(10000)) { throw 'synthetic-handle-not-ready' }
  $failure = $null
  $wait = [Diagnostics.Stopwatch]::StartNew()
  try { Remove-LifecycleTestDataRoot $state } catch { $failure = $_ }
  if ($transient) {
    if ($null -ne $failure) { throw $failure }
    if (Test-Path -LiteralPath $data) { throw 'synthetic-root-retained' }
  } else {
    if ($null -eq $failure -or -not ($failure.Exception -is [IO.IOException]) -or ($failure.Exception.HResult -band 0xffff) -ne 32) { throw 'synthetic-lock-error-not-preserved' }
    if ($wait.ElapsedMilliseconds -lt 10000 -or $wait.ElapsedMilliseconds -gt 20000) { throw 'synthetic-lock-wait-not-bounded' }
    if (-not (Test-Path -LiteralPath $lockedPath) -or [IO.File]::ReadAllText((Join-Path $backup 'original.marker')) -ne 'original') { throw 'synthetic-locked-root-or-original-changed' }
  }
} finally {
  [void]$release.Set()
  [void]$worker.EndInvoke($pending)
  $worker.Dispose()
  $failures = @(Complete-LifecycleData $state)
  $ready.Dispose(); $release.Dispose()
  if ($failures.Count) { throw 'synthetic-original-restore-failed' }
}
if ([IO.File]::ReadAllText((Join-Path $data 'original.marker')) -ne 'original') { throw 'synthetic-original-changed' }
if (Test-Path -LiteralPath $backup) { throw 'synthetic-backup-retained' }
`;
      const result = spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-EncodedCommand",
          Buffer.from(source, "utf16le").toString("base64"),
        ],
        { encoding: "utf8", timeout: 30_000, windowsHide: true },
      );
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.equal(
        await readFile(path.join(temporary, "data", "original.marker"), "utf8"),
        "original",
      );
    },
  );
}

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
        path.join(await realpath(os.tmpdir()), "voxleaf-lifecycle-data-test-"),
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

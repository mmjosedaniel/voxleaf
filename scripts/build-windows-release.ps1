[CmdletBinding()]
param(
  [switch]$LocalChatterboxCandidate,
  [switch]$Sign,
  [switch]$ScanWithDefender,
  [switch]$AttachOrdinaryEvidence,
  [string]$LifecycleReceipt,
  [string]$OrdinaryChatterboxReceipt,
  [ValidateSet("not-run")]
  [string]$LifecycleStatus = "not-run"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$srcTauri = Join-Path $repositoryRoot "apps\desktop\src-tauri"
$releaseConfig = Join-Path $srcTauri "tauri.release.conf.json"
$temporaryConfig = $null
$signatureStatus = "unsigned-local"
$antivirusStatus = "not-run"
$releaseInputLocks = [Collections.Generic.List[IO.FileStream]]::new()
$temporaryBuildAuthority = $null

function Get-LockedReleaseHash {
  param([string]$Path)

  # Retain a read share until finalization. Build and observation readers may
  # open the same bytes, while writes and rename/delete remain excluded.
  $stream = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
  $releaseInputLocks.Add($stream)
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try {
    return [BitConverter]::ToString($sha256.ComputeHash($stream)).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha256.Dispose()
  }
}

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "windows-release-command-failed"
  }
}

function Get-EffectiveCargoRustFlags {
  # Cargo exposes the selected flags to a build script after applying its own
  # configuration hierarchy and target predicates. Use the same working
  # directory and implicit host target as Tauri, with independent outputs.
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
  $probe = Join-Path $tempRoot ("voxleaf-build-flags-" + [Guid]::NewGuid().ToString("N"))
  $target = Join-Path $probe "target"
  $previousBuildDir = [Environment]::GetEnvironmentVariable("CARGO_BUILD_BUILD_DIR")
  New-Item -ItemType Directory -Path $probe | Out-Null
  try {
    $manifest = Join-Path $probe "Cargo.toml"
    [IO.File]::WriteAllText($manifest, @'
[package]
name = "voxleaf-build-flags"
version = "0.0.0"
edition = "2024"

[[bin]]
name = "voxleaf-build-flags"
path = "main.rs"

[workspace]
'@)
    [IO.File]::WriteAllText((Join-Path $probe "main.rs"), "fn main() {}")
    [IO.File]::WriteAllText((Join-Path $probe "build.rs"), @'
use std::{env, fs, path::Path};

fn main() {
    let output = Path::new(env!("CARGO_MANIFEST_DIR")).join("rustflags");
    let flags = env::var("CARGO_ENCODED_RUSTFLAGS").unwrap_or_default();
    fs::write(output, flags).unwrap();
}
'@)
    Push-Location -LiteralPath $srcTauri
    try {
      $env:CARGO_BUILD_BUILD_DIR = $target
      Invoke-CheckedCommand cargo "build" "--quiet" "--offline" "--manifest-path" $manifest "--target-dir" $target | Out-Host
    } finally {
      [Environment]::SetEnvironmentVariable("CARGO_BUILD_BUILD_DIR", $previousBuildDir)
      Pop-Location
    }
    return [IO.File]::ReadAllText((Join-Path $probe "rustflags"))
  } finally {
    $ownedProbe = Get-Item -LiteralPath $probe
    if ($ownedProbe.Parent.FullName.TrimEnd('\') -ine $tempRoot.TrimEnd('\') -or
        ($ownedProbe.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      throw "windows-release-flags-probe-path"
    }
    Remove-Item -LiteralPath $ownedProbe.FullName -Recurse -Force
  }
}

function Invoke-PrivateWindowsTauriBuild {
  param([string[]]$BuildArguments)

  $separator = [char]31
  $previousFlags = [Environment]::GetEnvironmentVariable("CARGO_ENCODED_RUSTFLAGS")
  $flags = @()
  if ($null -ne $previousFlags) {
    if ($previousFlags) { $flags += $previousFlags.Split($separator) }
  } elseif ($env:RUSTFLAGS) {
    $flags += $env:RUSTFLAGS.Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
  } else {
    $configuredFlags = Get-EffectiveCargoRustFlags
    if ($configuredFlags) { $flags += $configuredFlags.Split($separator) }
  }
  $cargoHome = if ($env:CARGO_HOME) { $env:CARGO_HOME } else { Join-Path $env:USERPROFILE ".cargo" }
  $rustupHome = if ($env:RUSTUP_HOME) { $env:RUSTUP_HOME } else { Join-Path $env:USERPROFILE ".rustup" }

  # Rust uses the last matching prefix. Give the specific roots priority over
  # the profile fallback and recognize both Windows path spellings.
  $roots = @(
    @{ Path = $env:USERPROFILE; Label = "profile" }
    @{ Path = $env:TEMP; Label = "build-temp" }
    @{ Path = $env:TMP; Label = "build-temp" }
    @{ Path = $rustupHome; Label = "toolchain" }
    @{ Path = $cargoHome; Label = "cargo" }
    @{ Path = $repositoryRoot; Label = "voxleaf" }
  )
  foreach ($root in $roots) {
    if (!$root.Path) { continue }
    $path = [IO.Path]::GetFullPath($root.Path)
    $flags += "--remap-path-prefix=$path=$($root.Label)"
    $flags += "--remap-path-prefix=$($path.Replace('\', '/'))=$($root.Label)"
  }
  # Keep the executable's CodeView reference portable even when the Microsoft
  # linker emits a PDB. The PDB itself is local build output.
  $flags += "-Cdebuginfo=0", "-Clink-arg=/PDBALTPATH:%_PDB%"

  try {
    $env:CARGO_ENCODED_RUSTFLAGS = $flags -join $separator
    Invoke-CheckedCommand pnpm.cmd "--filter" "@voxleaf/desktop" "tauri" "build" @BuildArguments
  } finally {
    [Environment]::SetEnvironmentVariable("CARGO_ENCODED_RUSTFLAGS", $previousFlags)
  }
}

function Assert-CanonicalCargoLayout {
  # Tauri runs Cargo metadata in src-tauri and appends any configured target
  # triple before the release profile directory. All release consumers expect
  # the implicit Windows x64 host under src-tauri/target/release.
  Push-Location -LiteralPath $srcTauri
  $previousEncoding = [Console]::OutputEncoding
  try {
    [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
    $ErrorActionPreference = "SilentlyContinue"
    $global:LASTEXITCODE = -1
    $metadataOutput = & cargo metadata --format-version 1 --no-deps --offline 2>$null
    if ($LASTEXITCODE -ne 0) {
      throw "windows-release-cargo-layout"
    }
    $metadata = $metadataOutput | ConvertFrom-Json -ErrorAction Stop
    if (-not $metadata.target_directory -or
        [IO.Path]::GetFullPath($metadata.target_directory) -ine (Join-Path $srcTauri "target")) {
      throw "windows-release-cargo-layout"
    }

    $global:LASTEXITCODE = -1
    $rustVersion = & rustc -vV 2>$null
    if ($LASTEXITCODE -ne 0 -or $rustVersion -cnotcontains "host: x86_64-pc-windows-msvc") {
      throw "windows-release-cargo-layout"
    }

    # Stable Cargo metadata does not expose build.target or build.rustc.
    # A compiler override can change Cargo's implicit host while Tauri
    # still uses PATH rustc to select the NSIS architecture.
    $configurationCheck = @'
import os
from pathlib import Path
import sys
import tomllib

def check_layout():
    backend = Path.cwd()
    app = os.environ.get('TAURI_APP_PATH')
    if app is not None and (not Path(app).is_absolute() or Path(app).resolve() != backend.resolve()):
        return False
    if any(name in os.environ for name in ('CARGO_BUILD_TARGET', 'RUSTC', 'CARGO_BUILD_RUSTC')):
        return False
    home_override = os.environ.get('CARGO_HOME')
    cargo_home = Path(home_override) if home_override is not None else Path.home() / '.cargo'
    if not cargo_home.is_absolute():
        return False

    directories = [parent / '.cargo' for parent in (backend, *backend.parents)]
    for directory in [*directories, cargo_home]:
        for name in ('config', 'config.toml'):
            config = directory / name
            try:
                config.lstat()
            except FileNotFoundError:
                continue
            with config.open('rb') as stream:
                document = tomllib.load(stream)
            if 'include' in document or {'target', 'rustc'}.intersection(document.get('build', {})):
                return False
            break
    return True

try:
    sys.exit(0 if check_layout() else 1)
except (OSError, ValueError, TypeError, RuntimeError):
    sys.exit(1)
'@
    $global:LASTEXITCODE = -1
    $configurationCheck | & uv run --no-project --offline --no-python-downloads --python 3.12.10 python -I -B - 2>$null
    if ($LASTEXITCODE -ne 0) {
      throw "windows-release-cargo-layout"
    }
  } catch {
    throw "windows-release-cargo-layout"
  } finally {
    [Console]::OutputEncoding = $previousEncoding
    Pop-Location
  }
}

function Get-ReleaseSignatureStatus {
  param([string]$BinaryStatus, [string]$InstallerStatus, [bool]$Signed)
  if ($Signed) {
    if ($BinaryStatus -ne 'Valid' -or $InstallerStatus -ne 'Valid') {
      throw 'windows-release-signature-invalid'
    }
    return 'signed-valid'
  }
  if ($BinaryStatus -ne 'NotSigned' -or $InstallerStatus -ne 'NotSigned') {
    throw 'windows-release-unexpected-signature'
  }
  return 'unsigned-local'
}

function Invoke-DefenderArtifactScan {
  param([Parameter(Mandatory = $true)][string]$Path)

  $candidates = @()
  $platformRoot = Join-Path $env:ProgramData "Microsoft\Windows Defender\Platform"
  if (Test-Path -LiteralPath $platformRoot) {
    $candidates += Get-ChildItem -LiteralPath $platformRoot -Directory |
      Sort-Object Name -Descending |
      ForEach-Object { Join-Path $_.FullName "MpCmdRun.exe" }
  }
  $candidates += Join-Path $env:ProgramFiles "Windows Defender\MpCmdRun.exe"
  $scanner = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $scanner) {
    return "not-available"
  }
  $null = & $scanner -Scan -ScanType 3 -File $Path -DisableRemediation
  if ($LASTEXITCODE -ne 0) {
    throw "windows-release-antivirus-scan-failed"
  }
  return "windows-defender-no-threats"
}

Push-Location $repositoryRoot
try {
  if ($LocalChatterboxCandidate) {
    if ($Sign -or $ScanWithDefender -or $AttachOrdinaryEvidence -or $LifecycleReceipt -or $OrdinaryChatterboxReceipt) {
      throw "windows-release-candidate-arguments"
    }
    Assert-CanonicalCargoLayout
    Invoke-PrivateWindowsTauriBuild @(
      "--debug", "--no-bundle",
      "--config", "src-tauri/tauri.local-chatterbox-v8.conf.json",
      "--features", "local-chatterbox-v8-candidate"
    )
    return
  }
  if ($AttachOrdinaryEvidence) {
    if ($Sign -or !$LifecycleReceipt -or !$OrdinaryChatterboxReceipt) {
      throw 'windows-release-attach-arguments'
    }
    $binary = Join-Path $srcTauri "target\release\voxleaf-desktop.exe"
    $installer = Join-Path $srcTauri "target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe"
    $binaryHash = Get-LockedReleaseHash $binary
    $installerHash = Get-LockedReleaseHash $installer
    $buildAuthorityPath = "$installer.build-authority.json"
    if (!(Test-Path -LiteralPath $buildAuthorityPath -PathType Leaf)) {
      throw "windows-release-build-authority"
    }
    $null = Get-LockedReleaseHash $buildAuthorityPath
    $null = Get-LockedReleaseHash "$installer.sha256"
    $binarySignature = Get-AuthenticodeSignature -LiteralPath $binary
    $installerSignature = Get-AuthenticodeSignature -LiteralPath $installer
    $signatureStatus = Get-ReleaseSignatureStatus $binarySignature.Status $installerSignature.Status ($binarySignature.Status -eq 'Valid')
    $scanArguments = @()
    if ($ScanWithDefender) {
      $antivirusStatus = Invoke-DefenderArtifactScan $installer
      if ($antivirusStatus -eq 'windows-defender-no-threats') {
        $scanArguments = @('--scanned-installer-sha256', $installerHash)
      }
    }
    Invoke-CheckedCommand node `
      "apps/desktop/scripts/windows-release.mjs" "evidence" `
      "--installer" $installer "--binary" $binary `
      "--verified-installer-sha256" $installerHash "--verified-binary-sha256" $binaryHash `
      "--build-authority" $buildAuthorityPath `
      "--signature-status" $signatureStatus "--antivirus-status" $antivirusStatus `
      "--lifecycle-receipt" $LifecycleReceipt "--ordinary-chatterbox-receipt" $OrdinaryChatterboxReceipt `
      "--write" @scanArguments
    return
  }
  Assert-CanonicalCargoLayout
  Invoke-CheckedCommand node "apps/desktop/scripts/windows-release.mjs" "check" "--require-core"

  $coreDirectory = Join-Path $repositoryRoot "services\tts\release\core"
  $optionalDirectory = Join-Path $repositoryRoot "services\tts\release\optional\chatterbox"
  $authority = [ordered]@{
    releaseConfigSha256 = Get-LockedReleaseHash $releaseConfig
    piperRuntimeManifestSha256 = Get-LockedReleaseHash (Join-Path $coreDirectory "runtime-manifest-v1.json")
    optionalChatterboxManifestSha256 = Get-LockedReleaseHash (Join-Path $optionalDirectory "optional-package-manifest-v7.json")
    optionalChatterboxRuntimeEvidenceSha256 = Get-LockedReleaseHash (Join-Path $optionalDirectory "runtime-package-evidence-v7.json")
  }
  $bundledPiperManifestHash = Get-LockedReleaseHash (Join-Path $coreDirectory "dist\voxleaf-piper-core-v1\runtime-manifest-v1.json")
  if ($bundledPiperManifestHash -cne $authority.piperRuntimeManifestSha256) {
    throw "windows-release-build-authority"
  }

  $configArgument = "src-tauri/tauri.release.conf.json"
  if ($Sign) {
    $thumbprint = $env:VOXLEAF_WINDOWS_CERTIFICATE_THUMBPRINT
    $timestampUrl = $env:VOXLEAF_WINDOWS_TIMESTAMP_URL
    if (-not $thumbprint -or $thumbprint -notmatch "^[A-Fa-f0-9]{40}$") {
      throw "windows-release-signing-thumbprint-unavailable"
    }
    $timestamp = $null
    if (-not [Uri]::TryCreate($timestampUrl, [UriKind]::Absolute, [ref]$timestamp) -or $timestamp.Scheme -ne "https") {
      throw "windows-release-signing-timestamp-invalid"
    }
    $certificate = Get-Item -LiteralPath "Cert:\CurrentUser\My\$thumbprint" -ErrorAction Stop
    if (-not $certificate.HasPrivateKey) {
      throw "windows-release-signing-private-key-unavailable"
    }

    $signedConfiguration = Get-Content -LiteralPath $releaseConfig -Raw | ConvertFrom-Json
    $signedConfiguration.bundle.windows | Add-Member -NotePropertyName certificateThumbprint -NotePropertyValue $thumbprint.ToUpperInvariant()
    $signedConfiguration.bundle.windows | Add-Member -NotePropertyName digestAlgorithm -NotePropertyValue "sha256"
    $signedConfiguration.bundle.windows | Add-Member -NotePropertyName timestampUrl -NotePropertyValue $timestampUrl
    $temporaryName = "tauri.release.signed.$([Guid]::NewGuid().ToString('N')).conf.json"
    $temporaryConfig = Join-Path $srcTauri $temporaryName
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText(
      $temporaryConfig,
      (($signedConfiguration | ConvertTo-Json -Depth 20) + "`n"),
      $utf8
    )
    $configArgument = "src-tauri/$temporaryName"
  }

  Invoke-PrivateWindowsTauriBuild @(
    "--config", $configArgument,
    "--features", "release-locked-runtime"
  )

  $binary = Join-Path $srcTauri "target\release\voxleaf-desktop.exe"
  $installer = Join-Path $srcTauri "target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe"
  if (-not (Test-Path -LiteralPath $binary -PathType Leaf) -or -not (Test-Path -LiteralPath $installer -PathType Leaf)) {
    throw "windows-release-artifact-missing"
  }

  $binaryHash = Get-LockedReleaseHash $binary
  $installerHash = Get-LockedReleaseHash $installer
  $binarySignature = Get-AuthenticodeSignature -LiteralPath $binary
  $installerSignature = Get-AuthenticodeSignature -LiteralPath $installer
  $signatureStatus = Get-ReleaseSignatureStatus $binarySignature.Status $installerSignature.Status ([bool]$Sign)

  $scanArguments = @()
  if ($ScanWithDefender) {
    $antivirusStatus = Invoke-DefenderArtifactScan $installer
    if ($antivirusStatus -eq 'windows-defender-no-threats') {
      $scanArguments = @('--scanned-installer-sha256', $installerHash)
    }
  }

  $checksumPath = "$installer.sha256"
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $buildAuthorityPath = "$installer.build-authority.json"
  $temporaryBuildAuthority = "$buildAuthorityPath.$([Guid]::NewGuid().ToString('N')).tmp"
  $buildAuthority = [ordered]@{
    schemaVersion = 1
    installerSha256 = $installerHash
    binarySha256 = $binaryHash
    authority = $authority
  }
  [IO.File]::WriteAllText($temporaryBuildAuthority, (($buildAuthority | ConvertTo-Json -Depth 4) + "`n"), $utf8)

  Invoke-CheckedCommand node `
    "apps/desktop/scripts/windows-release.mjs" `
    "evidence" `
    "--installer" $installer `
    "--binary" $binary `
    "--verified-installer-sha256" $installerHash "--verified-binary-sha256" $binaryHash `
    "--build-authority" $temporaryBuildAuthority `
    "--signature-status" $signatureStatus `
    "--antivirus-status" $antivirusStatus `
    "--lifecycle-status" $LifecycleStatus `
    "--write" @scanArguments

  [IO.File]::WriteAllText($checksumPath, "$installerHash *$([IO.Path]::GetFileName($installer))`n", $utf8)
  Move-Item -LiteralPath $temporaryBuildAuthority -Destination $buildAuthorityPath -Force

  Write-Output "windows-release:built"
  Write-Output "installer=$installer"
  Write-Output "checksum=$checksumPath"
  Write-Output "signature=$signatureStatus"
  Write-Output "antivirus=$antivirusStatus"
} finally {
  foreach ($stream in $releaseInputLocks) {
    $stream.Dispose()
  }
  if ($temporaryBuildAuthority -and (Test-Path -LiteralPath $temporaryBuildAuthority)) {
    Remove-Item -LiteralPath $temporaryBuildAuthority -Force
  }
  if ($temporaryConfig -and (Test-Path -LiteralPath $temporaryConfig)) {
    Remove-Item -LiteralPath $temporaryConfig -Force
  }
  Pop-Location
}

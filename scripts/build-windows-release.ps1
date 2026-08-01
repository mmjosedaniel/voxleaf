[CmdletBinding()]
param(
  [switch]$Sign,
  [switch]$ScanWithDefender,
  [ValidateSet("not-run", "local-install-first-start-repair-uninstall-passed")]
  [string]$LifecycleStatus = "not-run"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$srcTauri = Join-Path $repositoryRoot "apps\desktop\src-tauri"
$releaseConfig = Join-Path $srcTauri "tauri.release.conf.json"
$temporaryConfig = $null
$signatureStatus = "unsigned-local"
$antivirusStatus = "not-run"

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

function Get-VerifiedSignature {
  param([Parameter(Mandatory = $true)][string]$Path)

  $signature = Get-AuthenticodeSignature -LiteralPath $Path
  if ($signature.Status -ne "Valid") {
    throw "windows-release-signature-invalid"
  }
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
  & $scanner -Scan -ScanType 3 -File $Path -DisableRemediation
  if ($LASTEXITCODE -ne 0) {
    throw "windows-release-antivirus-scan-failed"
  }
  return "windows-defender-no-threats"
}

Push-Location $repositoryRoot
try {
  Invoke-CheckedCommand node "apps/desktop/scripts/windows-release.mjs" "check" "--require-core"

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

  Invoke-CheckedCommand pnpm.cmd "--filter" "@voxleaf/desktop" "tauri" "build" "--config" $configArgument

  $binary = Join-Path $srcTauri "target\release\voxleaf-desktop.exe"
  $installer = Join-Path $srcTauri "target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe"
  if (-not (Test-Path -LiteralPath $binary -PathType Leaf) -or -not (Test-Path -LiteralPath $installer -PathType Leaf)) {
    throw "windows-release-artifact-missing"
  }

  $binarySignature = Get-AuthenticodeSignature -LiteralPath $binary
  $installerSignature = Get-AuthenticodeSignature -LiteralPath $installer
  if ($Sign) {
    Get-VerifiedSignature $binary
    Get-VerifiedSignature $installer
    $signatureStatus = "signed-valid"
  } elseif ($binarySignature.Status -eq "Valid" -or $installerSignature.Status -eq "Valid") {
    throw "windows-release-unexpected-signature"
  }

  if ($ScanWithDefender) {
    $antivirusStatus = Invoke-DefenderArtifactScan $installer
  }

  $checksum = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash.ToLowerInvariant()
  $checksumPath = "$installer.sha256"
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($checksumPath, "$checksum *$([IO.Path]::GetFileName($installer))`n", $utf8)

  Invoke-CheckedCommand node `
    "apps/desktop/scripts/windows-release.mjs" `
    "evidence" `
    "--installer" $installer `
    "--binary" $binary `
    "--signature-status" $signatureStatus `
    "--antivirus-status" $antivirusStatus `
    "--lifecycle-status" $LifecycleStatus `
    "--write"

  Write-Output "windows-release:built"
  Write-Output "installer=$installer"
  Write-Output "checksum=$checksumPath"
  Write-Output "signature=$signatureStatus"
  Write-Output "antivirus=$antivirusStatus"
} finally {
  if ($temporaryConfig -and (Test-Path -LiteralPath $temporaryConfig)) {
    Remove-Item -LiteralPath $temporaryConfig -Force
  }
  Pop-Location
}

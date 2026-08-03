[CmdletBinding()]
param(
  [switch]$ScanWithDefender
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$srcTauri = Join-Path $repositoryRoot "apps\desktop\src-tauri"
$installer = Join-Path $srcTauri "target\release\bundle\nsis\VoxLeaf-Chatterbox-Validation_0.1.0_x64-setup.exe"

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "chatterbox-validation-command-failed"
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
  $null = & $scanner -Scan -ScanType 3 -File $Path -DisableRemediation
  if ($LASTEXITCODE -ne 0) {
    throw "chatterbox-validation-antivirus-scan-failed"
  }
  return "windows-defender-no-threats"
}

Push-Location $repositoryRoot
try {
  Invoke-CheckedCommand node "apps/desktop/scripts/chatterbox-validation-release.mjs" "check" "--require-core"
  Invoke-CheckedCommand pnpm.cmd `
    "--filter" `
    "@voxleaf/desktop" `
    "tauri" `
    "build" `
    "--config" `
    "src-tauri/tauri.chatterbox-validation.conf.json" `
    "--features" `
    "chatterbox-acquisition-validation"

  if (-not (Test-Path -LiteralPath $installer -PathType Leaf)) {
    throw "chatterbox-validation-installer-missing"
  }
  if ((Get-AuthenticodeSignature -LiteralPath $installer).Status -eq "Valid") {
    throw "chatterbox-validation-unexpected-signature"
  }
  $antivirusStatus = if ($ScanWithDefender) {
    Invoke-DefenderArtifactScan $installer
  } else {
    "not-run"
  }
  $checksum = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash.ToLowerInvariant()
  $checksumPath = "$installer.sha256"
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText(
    $checksumPath,
    "$checksum *$([IO.Path]::GetFileName($installer))`n",
    $utf8
  )

  Write-Output "chatterbox-validation-release:built"
  Write-Output "installer=$installer"
  Write-Output "checksum=$checksumPath"
  Write-Output "signature=unsigned-local"
  Write-Output "antivirus=$antivirusStatus"
} finally {
  Pop-Location
}

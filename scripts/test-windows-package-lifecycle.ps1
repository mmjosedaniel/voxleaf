[CmdletBinding()]
param(
  [string]$Installer = ""
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not $Installer) {
  $Installer = Join-Path $repositoryRoot "apps\desktop\src-tauri\target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe"
}
$Installer = (Resolve-Path -LiteralPath $Installer).Path
$installRoot = Join-Path $env:LOCALAPPDATA "VoxLeaf"
$expectedInstallRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA "VoxLeaf"))
if ([IO.Path]::GetFullPath($installRoot) -ne $expectedInstallRoot) {
  throw "windows-release-lifecycle-root-invalid"
}
if (Test-Path -LiteralPath $installRoot) {
  throw "windows-release-lifecycle-preexisting-install"
}

$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$sentinelDirectory = [IO.Path]::GetFullPath(
  (Join-Path $temporaryRoot "voxleaf-package-lifecycle-$([Guid]::NewGuid().ToString('N'))")
)
if (-not $sentinelDirectory.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "windows-release-lifecycle-temporary-root-invalid"
}
$sentinel = Join-Path $sentinelDirectory "synthetic-public-domain.epub"
New-Item -ItemType Directory -Path $sentinelDirectory -Force | Out-Null
[IO.File]::WriteAllText($sentinel, "synthetic sentinel; not a real publication")
$sentinelHash = (Get-FileHash -LiteralPath $sentinel -Algorithm SHA256).Hash

function Invoke-Installer {
  param([Parameter(Mandatory = $true)][string]$Path)
  $process = Start-Process -FilePath $Path -ArgumentList "/S" -Wait -PassThru
  if ($process.ExitCode -ne 0) {
    throw "windows-release-lifecycle-installer-failed"
  }
}

try {
  Invoke-Installer $Installer
  $application = Join-Path $installRoot "voxleaf-desktop.exe"
  $coreManifest = Join-Path $installRoot "resources\tts\voxleaf-piper-core-v1\runtime-manifest-v1.json"
  $uninstaller = Join-Path $installRoot "uninstall.exe"
  foreach ($path in @($application, $coreManifest, $uninstaller)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "windows-release-lifecycle-installed-file-missing"
    }
  }

  $applicationProcess = Start-Process -FilePath $application -PassThru
  Start-Sleep -Seconds 5
  if ($applicationProcess.HasExited) {
    throw "windows-release-lifecycle-first-start-failed"
  }
  Stop-Process -Id $applicationProcess.Id -Force
  $applicationProcess.WaitForExit()

  Invoke-Installer $Installer
  if (-not (Test-Path -LiteralPath $coreManifest -PathType Leaf)) {
    throw "windows-release-lifecycle-repair-failed"
  }

  $uninstallProcess = Start-Process -FilePath $uninstaller -ArgumentList "/S" -Wait -PassThru
  if ($uninstallProcess.ExitCode -ne 0 -or (Test-Path -LiteralPath $installRoot)) {
    throw "windows-release-lifecycle-uninstall-failed"
  }
  if ((Get-FileHash -LiteralPath $sentinel -Algorithm SHA256).Hash -ne $sentinelHash) {
    throw "windows-release-lifecycle-user-file-mutated"
  }

  [ordered]@{
    schemaVersion = 1
    install = "passed"
    firstStart = "passed"
    repair = "passed"
    uninstall = "passed"
    unrelatedSyntheticFilePreserved = $true
    applicationDataRemoval = "not-exercised-on-development-host"
    cleanHostStillRequired = $true
  } | ConvertTo-Json
} finally {
  if (Test-Path -LiteralPath $sentinelDirectory) {
    Remove-Item -LiteralPath $sentinelDirectory -Recurse -Force
  }
}

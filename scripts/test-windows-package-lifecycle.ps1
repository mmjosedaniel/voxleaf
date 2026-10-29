[CmdletBinding()]
param(
  [string]$Installer = ""
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$profileId = "chatterbox-multilingual-v3-cuda-bf16-default-v4"

$productName = "VoxLeaf"
$dataIdentifier = "com.voxleaf.desktop"
$defaultInstallerName = "VoxLeaf_0.1.0_x64-setup.exe"

if (-not $Installer) {
  $Installer = Join-Path $repositoryRoot "apps\desktop\src-tauri\target\release\bundle\nsis\$defaultInstallerName"
}
$Installer = (Resolve-Path -LiteralPath $Installer).Path

. (Join-Path $PSScriptRoot "windows-package-lifecycle-data.ps1")

$installRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA $productName))
$expectedInstallRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA $productName))
if ($installRoot -ne $expectedInstallRoot) {
  throw "windows-release-lifecycle-root-invalid"
}
if (Test-Path -LiteralPath $installRoot) {
  throw "windows-release-lifecycle-preexisting-install"
}

$localAppDataRoot = [IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd([IO.Path]::DirectorySeparatorChar)
$dataRoot = [IO.Path]::GetFullPath((Join-Path $localAppDataRoot $dataIdentifier))
Assert-ExactChildPath $localAppDataRoot $dataRoot "windows-release-lifecycle-data-root-invalid"

$runId = [Guid]::NewGuid().ToString("N")
$backupRoot = [IO.Path]::GetFullPath((Join-Path $localAppDataRoot ".voxleaf-package-lifecycle-backup-$runId"))
Assert-ExactChildPath $localAppDataRoot $backupRoot "windows-release-lifecycle-backup-root-invalid"
$quarantineRoot = [IO.Path]::GetFullPath((Join-Path $localAppDataRoot ".voxleaf-package-lifecycle-quarantine-$runId"))
Assert-ExactChildPath $localAppDataRoot $quarantineRoot "windows-release-lifecycle-quarantine-root-invalid"

$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd([IO.Path]::DirectorySeparatorChar)
$sentinelDirectory = [IO.Path]::GetFullPath((Join-Path $temporaryRoot "voxleaf-package-lifecycle-$runId"))
Assert-ExactChildPath $temporaryRoot $sentinelDirectory "windows-release-lifecycle-temporary-root-invalid"
$sentinel = Join-Path $sentinelDirectory "synthetic-public-domain.epub"

$optionalRoots = @(
  (Join-Path $dataRoot "tts\cb\5"),
  (Join-Path $dataRoot "tts\cb\3"),
  (Join-Path $dataRoot "tts\cb\2"),
  (Join-Path $dataRoot "tts\profiles\$profileId\2"),
  (Join-Path $dataRoot "tts\staging\$profileId"),
  (Join-Path $dataRoot "tts\cb\cache"),
  (Join-Path $dataRoot "tts\cb\.previous"),
  (Join-Path $dataRoot "tts\cb\6"),
  (Join-Path $dataRoot "tts\cb\7")
)
$preferenceRoot = Join-Path $dataRoot "EBWebView\Default\Local Storage"
$unrelatedRoots = @(
  (Join-Path $dataRoot "tts\unrelated-profile"),
  (Join-Path $dataRoot "EBWebView\Default\Cache"),
  (Join-Path $dataRoot "unrelated-owned-entry")
)
$optionalMarkers = @(
  for ($index = 0; $index -lt $optionalRoots.Count; $index++) {
    Join-Path $optionalRoots[$index] "optional-$index.marker"
  }
)
$preferenceMarker = Join-Path $preferenceRoot "preferences.marker"
$unrelatedMarkers = @(
  (Join-Path $unrelatedRoots[0] "unrelated-0.marker"),
  (Join-Path $unrelatedRoots[1] "unrelated-1.marker"),
  (Join-Path $unrelatedRoots[2] "unrelated-2.marker")
)

foreach ($path in @($optionalRoots + $preferenceRoot + $unrelatedRoots)) {
  Assert-ExactChildPath $dataRoot $path "windows-release-lifecycle-fixture-root-invalid"
}

$applicationProcess = $null
$packageProcess = $null
$installationAttempted = $false
$uninstallAttempted = $false
$recoveryJournal = Join-Path $sentinelDirectory "recovery.json"
$ownsSentinelDirectory = $false
$originalDataBackedUp = $false
$dataState = New-LifecycleDataState $localAppDataRoot $dataRoot $backupRoot $quarantineRoot
$matrixResults = [Collections.Generic.List[object]]::new()
$fixtureHashes = @{}
$primaryFailure = $null
$resultJson = $null
$cleanupFailures = [Collections.Generic.List[string]]::new()

function Write-RecoveryJournal {
  $processes = @(
    foreach ($process in @($applicationProcess, $packageProcess)) {
      if ($null -ne $process) {
        [ordered]@{ id = $process.Id; startedUtc = $process.StartTime.ToUniversalTime().ToString("o") }
      }
    }
  )
  [ordered]@{
    runId = $runId
    installRoot = $installRoot
    installationOriginallyAbsent = $true
    installationAttempted = $installationAttempted
    uninstallAttempted = $uninstallAttempted
    installer = $Installer
    installerSha256 = (Get-FileHash -LiteralPath $Installer -Algorithm SHA256).Hash
    data = $dataState
    processes = $processes
    restorationRequires = "Owned processes stopped and owned installation verified absent; never overwrite dataRoot."
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $recoveryJournal -Encoding UTF8
}

function Stop-LifecycleProcess {
  param($Process)
  if ($null -ne $Process -and -not $Process.HasExited) {
    # Keep the original process handle; never stop an unrelated reused PID.
    $Process.Kill()
    if (-not $Process.WaitForExit(10000)) { throw "windows-release-lifecycle-process-still-running" }
  }
}

function Invoke-Installer {
  Assert-ExactChildPath $localAppDataRoot $installRoot "windows-release-lifecycle-root-invalid"
  if (-not $script:installationAttempted -and (Test-Path -LiteralPath $installRoot)) {
    throw "windows-release-lifecycle-install-root-occupied"
  }
  $script:installationAttempted = $true
  $script:uninstallAttempted = $false
  Write-RecoveryJournal
  # -Wait also waits for installer descendants. Capture PassThru immediately
  # so a catchable interruption still leaves the original handle for cleanup.
  Start-Process -FilePath $Installer -ArgumentList "/S" -WindowStyle Hidden -Wait -PassThru | ForEach-Object {
    $script:packageProcess = $_
    Write-RecoveryJournal
  }
  $exitCode = $script:packageProcess.ExitCode
  $script:packageProcess = $null
  if ($exitCode -ne 0) {
    throw "windows-release-lifecycle-installer-failed"
  }
}

function Invoke-Uninstaller {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)

  $uninstaller = Join-Path $installRoot "uninstall.exe"
  if (-not $script:installationAttempted) { throw "windows-release-lifecycle-install-not-owned" }
  Assert-ExactChildPath $localAppDataRoot $installRoot "windows-release-lifecycle-root-invalid"
  Assert-NoReparsePoints $installRoot "windows-release-lifecycle-install-reparse"
  $script:uninstallAttempted = $true
  Write-RecoveryJournal
  if (-not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) { throw "windows-release-lifecycle-uninstaller-missing" }
  # NSIS normally relocates itself and returns before that copy finishes.
  # Run our verified owned copy with _?= last to observe its real process/exit
  # while allowing it to remove the original installation, including itself.
  Assert-NoReparsePoints $sentinelDirectory "windows-release-lifecycle-temporary-reparse"
  $ownedUninstaller = Join-Path $sentinelDirectory "owned-uninstall.exe"
  Assert-ExactChildPath $sentinelDirectory $ownedUninstaller "windows-release-lifecycle-uninstaller-copy-root-invalid"
  $uninstallerHash = (Get-FileHash -LiteralPath $uninstaller -Algorithm SHA256).Hash
  Copy-Item -LiteralPath $uninstaller -Destination $ownedUninstaller -Force
  if ((Get-FileHash -LiteralPath $ownedUninstaller -Algorithm SHA256).Hash -ne $uninstallerHash) {
    throw "windows-release-lifecycle-uninstaller-copy-invalid"
  }
  $script:packageProcess = Start-Process -FilePath $ownedUninstaller -ArgumentList @($Arguments + "_?=$installRoot") -WindowStyle Hidden -PassThru
  Write-RecoveryJournal
  if (-not $script:packageProcess.WaitForExit(120000)) { throw "windows-release-lifecycle-uninstaller-timeout" }
  $exitCode = $script:packageProcess.ExitCode
  $script:packageProcess = $null
  if ($exitCode -ne 0 -or (Test-Path -LiteralPath $installRoot)) {
    throw "windows-release-lifecycle-uninstall-failed"
  }
  $script:installationAttempted = $false
  $script:uninstallAttempted = $false
  Write-RecoveryJournal
}

function Remove-TestDataRoot {
  Remove-LifecycleTestDataRoot $dataState
}

function Write-FixtureMarker {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Value
  )

  [IO.File]::WriteAllText($Path, $Value)
  $fixtureHashes[$Path] = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Assert-FixturePreserved {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$FailureCode
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw $FailureCode
  }
  if ((Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash -ne $fixtureHashes[$Path]) {
    throw $FailureCode
  }
}

function Initialize-DataFixtures {
  Remove-TestDataRoot
  $fixtureHashes.Clear()
  foreach ($index in 0..($optionalRoots.Count - 1)) {
    $root = $optionalRoots[$index]
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Write-FixtureMarker $optionalMarkers[$index] "synthetic optional fixture"
  }
  New-Item -ItemType Directory -Path $preferenceRoot -Force | Out-Null
  Write-FixtureMarker $preferenceMarker "synthetic preference fixture"
  foreach ($index in 0..($unrelatedRoots.Count - 1)) {
    $root = $unrelatedRoots[$index]
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Write-FixtureMarker $unrelatedMarkers[$index] "synthetic unrelated fixture"
  }
}

function Assert-ScenarioResult {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][bool]$ChatterboxRemoved,
    [Parameter(Mandatory = $true)][bool]$PreferencesRemoved
  )

  foreach ($index in 0..($optionalRoots.Count - 1)) {
    if ($ChatterboxRemoved) {
      if (Test-Path -LiteralPath $optionalRoots[$index]) {
        throw "windows-release-lifecycle-$Name-chatterbox-scope-$index"
      }
    } else {
      Assert-FixturePreserved $optionalMarkers[$index] "windows-release-lifecycle-$Name-chatterbox-scope-$index"
    }
  }
  if ($PreferencesRemoved) {
    if (Test-Path -LiteralPath $preferenceRoot) {
      throw "windows-release-lifecycle-$Name-preference-scope"
    }
  } else {
    Assert-FixturePreserved $preferenceMarker "windows-release-lifecycle-$Name-preference-scope"
  }
  foreach ($marker in $unrelatedMarkers) {
    Assert-FixturePreserved $marker "windows-release-lifecycle-$Name-unrelated-data-removed"
  }
  if ((Get-FileHash -LiteralPath $sentinel -Algorithm SHA256).Hash -ne $sentinelHash) {
    throw "windows-release-lifecycle-$Name-user-file-mutated"
  }
}

function Invoke-SilentScenario {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [Parameter(Mandatory = $true)][bool]$ChatterboxRemoved,
    [Parameter(Mandatory = $true)][bool]$PreferencesRemoved
  )

  Invoke-Installer
  Initialize-DataFixtures
  Invoke-Uninstaller $Arguments
  Assert-ScenarioResult $Name $ChatterboxRemoved $PreferencesRemoved
  $matrixResults.Add([ordered]@{
    scenario = $Name
    chatterboxRemoved = $ChatterboxRemoved
    preferencesAndRecoveryRemoved = $PreferencesRemoved
    unrelatedDataPreserved = $true
  })
}

try {
  New-Item -ItemType Directory -Path $sentinelDirectory | Out-Null
  $ownsSentinelDirectory = $true
  Write-RecoveryJournal
  [IO.File]::WriteAllText($sentinel, "synthetic sentinel; not a real publication")
  $sentinelHash = (Get-FileHash -LiteralPath $sentinel -Algorithm SHA256).Hash
  Initialize-LifecycleDataOwnership $dataState
  $originalDataBackedUp = $dataState.BackupVerified
  Write-RecoveryJournal

  Invoke-Installer
  $application = Join-Path $installRoot "voxleaf-desktop.exe"
  $coreManifest = Join-Path $installRoot "resources\tts\voxleaf-piper-core-v1\runtime-manifest-v1.json"
  $uninstaller = Join-Path $installRoot "uninstall.exe"
  foreach ($path in @($application, $coreManifest, $uninstaller)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "windows-release-lifecycle-installed-file-missing"
    }
  }

  $applicationProcess = Start-Process -FilePath $application -WindowStyle Hidden -PassThru
  Write-RecoveryJournal
  Start-Sleep -Seconds 5
  if ($applicationProcess.HasExited) {
    throw "windows-release-lifecycle-first-start-failed"
  }
  Stop-LifecycleProcess $applicationProcess
  $applicationProcess = $null

  Initialize-DataFixtures
  Invoke-Installer
  if (-not (Test-Path -LiteralPath $coreManifest -PathType Leaf)) {
    throw "windows-release-lifecycle-repair-failed"
  }
  Assert-ScenarioResult "repair" $false $false
  Invoke-Uninstaller @("/S")
  Assert-ScenarioResult "post-repair-default-uninstall" $false $false
  Remove-TestDataRoot

  Invoke-SilentScenario "default-preserve" @("/S") $false $false
  Invoke-SilentScenario "chatterbox-only" @("/S", "/REMOVE_CHATTERBOX_DATA=1") $true $false
  Invoke-SilentScenario "preferences-only" @("/S", "/REMOVE_PREFERENCES_AND_RECOVERY=1") $false $true
  Invoke-SilentScenario "both-explicit" @("/S", "/REMOVE_CHATTERBOX_DATA=1", "/REMOVE_PREFERENCES_AND_RECOVERY=1") $true $true
  Invoke-SilentScenario "legacy-both" @("/S", "/REMOVE_APP_DATA=1") $true $true
  Invoke-SilentScenario "invalid-values-preserve" @("/S", "/REMOVE_CHATTERBOX_DATA=true", "/REMOVE_PREFERENCES_AND_RECOVERY=0", "/REMOVE_APP_DATA=yes") $false $false

  $resultJson = [ordered]@{
    schemaVersion = 2
    product = $productName
    install = "passed"
    firstStart = "passed"
    repair = "passed"
    uninstallOptionMatrix = $matrixResults
    unrelatedSyntheticFilePreserved = $true
    preexistingApplicationDataRestored = $originalDataBackedUp
    cleanHostStillRequired = $true
    manualInteractiveValidationStillRequired = $true
  } | ConvertTo-Json -Depth 5
} catch {
  $primaryFailure = $_
} finally {
  try {
    Stop-LifecycleProcess $applicationProcess
    Stop-LifecycleProcess $packageProcess
    $applicationProcess = $null
    $packageProcess = $null
  } catch {
    $cleanupFailures.Add("windows-release-lifecycle-process-cleanup-failed")
  }

  if ($cleanupFailures.Count -eq 0 -and $installationAttempted) {
    try {
      if ($uninstallAttempted) { throw "windows-release-lifecycle-uninstall-already-failed" }
      if (Test-Path -LiteralPath $installRoot) { Invoke-Uninstaller @("/S") }
      if (Test-Path -LiteralPath $installRoot) { throw "windows-release-lifecycle-install-retained" }
      $installationAttempted = $false
    } catch {
      $cleanupFailures.Add("windows-release-lifecycle-install-cleanup-failed:$installRoot")
      try { Stop-LifecycleProcess $packageProcess } catch { $cleanupFailures.Add("windows-release-lifecycle-package-process-cleanup-failed") }
    }
  }

  # Restored user data must never be exposed to a remaining test installation.
  if ($cleanupFailures.Count -eq 0 -and -not $installationAttempted) {
    foreach ($failure in @(Complete-LifecycleData $dataState)) { $cleanupFailures.Add($failure) }
  }
  try {
    if ($ownsSentinelDirectory -and (Test-Path -LiteralPath $sentinelDirectory)) {
      Write-RecoveryJournal
      Assert-NoReparsePoints $sentinelDirectory "windows-release-lifecycle-temporary-reparse"
      if ($cleanupFailures.Count -eq 0) {
        Assert-ExactChildPath $temporaryRoot $sentinelDirectory "windows-release-lifecycle-temporary-root-invalid"
        Remove-Item -LiteralPath $sentinelDirectory -Recurse -Force
      } else {
        $cleanupFailures.Add("windows-release-lifecycle-recovery-preserved:$recoveryJournal")
      }
    }
  } catch {
    $cleanupFailures.Add("windows-release-lifecycle-temporary-cleanup-failed:$sentinelDirectory")
  }
}

foreach ($cleanupFailure in $cleanupFailures) {
  Write-Warning $cleanupFailure
}
if ($null -ne $primaryFailure) {
  throw $primaryFailure
}
if ($cleanupFailures.Count -ne 0) {
  throw "windows-release-lifecycle-cleanup-incomplete"
}
$resultJson

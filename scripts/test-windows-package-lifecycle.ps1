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

function Assert-ExactChildPath {
  param(
    [Parameter(Mandatory = $true)][string]$Parent,
    [Parameter(Mandatory = $true)][string]$Child,
    [Parameter(Mandatory = $true)][string]$FailureCode
  )

  $resolvedParent = [IO.Path]::GetFullPath($Parent).TrimEnd([IO.Path]::DirectorySeparatorChar)
  $resolvedChild = [IO.Path]::GetFullPath($Child)
  if (-not $resolvedChild.StartsWith("$resolvedParent$([IO.Path]::DirectorySeparatorChar)", [StringComparison]::OrdinalIgnoreCase)) {
    throw $FailureCode
  }
}

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
  (Join-Path $dataRoot "tts\cb\2"),
  (Join-Path $dataRoot "tts\profiles\$profileId\2"),
  (Join-Path $dataRoot "tts\staging\$profileId"),
  (Join-Path $dataRoot "tts\cb\cache")
)
$preferenceRoot = Join-Path $dataRoot "EBWebView\Default\Local Storage"
$unrelatedRoots = @(
  (Join-Path $dataRoot "tts\unrelated-profile"),
  (Join-Path $dataRoot "EBWebView\Default\Cache"),
  (Join-Path $dataRoot "unrelated-owned-entry")
)
$optionalMarkers = @(
  (Join-Path $optionalRoots[0] "optional-0.marker"),
  (Join-Path $optionalRoots[1] "optional-1.marker"),
  (Join-Path $optionalRoots[2] "optional-2.marker"),
  (Join-Path $optionalRoots[3] "optional-3.marker")
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
$originalDataBackedUp = $false
$matrixResults = [Collections.Generic.List[object]]::new()
$fixtureHashes = @{}
$primaryFailure = $null
$resultJson = $null
$cleanupFailures = [Collections.Generic.List[string]]::new()

function Invoke-Installer {
  $process = Start-Process -FilePath $Installer -ArgumentList "/S" -Wait -PassThru
  if ($process.ExitCode -ne 0) {
    throw "windows-release-lifecycle-installer-failed"
  }
}

function Invoke-Uninstaller {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)

  $uninstaller = Join-Path $installRoot "uninstall.exe"
  $process = Start-Process -FilePath $uninstaller -ArgumentList $Arguments -Wait -PassThru
  if ($process.ExitCode -ne 0 -or (Test-Path -LiteralPath $installRoot)) {
    throw "windows-release-lifecycle-uninstall-failed"
  }
}

function Assert-NoReparsePoints {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$FailureCode
  )

  if (-not (Test-Path -LiteralPath $Root)) {
    return
  }
  $pending = [Collections.Generic.Stack[string]]::new()
  $pending.Push($Root)
  while ($pending.Count -gt 0) {
    $current = $pending.Pop()
    $item = Get-Item -LiteralPath $current -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw $FailureCode
    }
    if ($item.PSIsContainer) {
      foreach ($child in Get-ChildItem -LiteralPath $current -Force) {
        if (($child.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
          throw $FailureCode
        }
        if ($child.PSIsContainer) {
          $pending.Push($child.FullName)
        }
      }
    }
  }
}

function Remove-TestDataRoot {
  if (Test-Path -LiteralPath $dataRoot) {
    Assert-NoReparsePoints $dataRoot "windows-release-lifecycle-test-data-reparse"
    Remove-Item -LiteralPath $dataRoot -Recurse -Force
  }
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

New-Item -ItemType Directory -Path $sentinelDirectory -Force | Out-Null
[IO.File]::WriteAllText($sentinel, "synthetic sentinel; not a real publication")
$sentinelHash = (Get-FileHash -LiteralPath $sentinel -Algorithm SHA256).Hash

try {
  if (Test-Path -LiteralPath $dataRoot) {
    $existingData = Get-Item -LiteralPath $dataRoot -Force
    if (($existingData.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "windows-release-lifecycle-preexisting-data-root-reparse"
    }
    if (Test-Path -LiteralPath $backupRoot) {
      throw "windows-release-lifecycle-backup-root-occupied"
    }
    Move-Item -LiteralPath $dataRoot -Destination $backupRoot
    $originalDataBackedUp = $true
    $backup = Get-Item -LiteralPath $backupRoot -Force
    if (-not $backup.PSIsContainer -or ($backup.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or (Test-Path -LiteralPath $dataRoot)) {
      throw "windows-release-lifecycle-backup-verification-failed"
    }
  }

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
  Start-Sleep -Seconds 5
  if ($applicationProcess.HasExited) {
    throw "windows-release-lifecycle-first-start-failed"
  }
  Stop-Process -Id $applicationProcess.Id -Force
  $applicationProcess.WaitForExit()
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
    if ($null -ne $applicationProcess -and -not $applicationProcess.HasExited) {
      Stop-Process -Id $applicationProcess.Id -Force -ErrorAction Stop
      $applicationProcess.WaitForExit()
    }
  } catch {
    $cleanupFailures.Add("windows-release-lifecycle-process-cleanup-failed")
  }

  try {
    Remove-TestDataRoot
  } catch {
    $cleanupFailures.Add("windows-release-lifecycle-test-data-cleanup-failed")
    try {
      if (Test-Path -LiteralPath $quarantineRoot) {
        throw "windows-release-lifecycle-quarantine-root-occupied"
      }
      if (Test-Path -LiteralPath $dataRoot) {
        Move-Item -LiteralPath $dataRoot -Destination $quarantineRoot
      }
    } catch {
      $cleanupFailures.Add("windows-release-lifecycle-test-data-quarantine-failed:$quarantineRoot")
    }
  }

  try {
    if ($originalDataBackedUp) {
      if (-not (Test-Path -LiteralPath $backupRoot -PathType Container)) {
        throw "windows-release-lifecycle-backup-missing"
      }
      $backup = Get-Item -LiteralPath $backupRoot -Force
      if (($backup.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "windows-release-lifecycle-backup-reparse"
      }
      if (Test-Path -LiteralPath $dataRoot) {
        throw "windows-release-lifecycle-restore-target-occupied"
      }
      Move-Item -LiteralPath $backupRoot -Destination $dataRoot
    }
  } catch {
    $cleanupFailures.Add("windows-release-lifecycle-original-data-restore-failed:$backupRoot")
  }

  try {
    if (Test-Path -LiteralPath $sentinelDirectory) {
      Assert-NoReparsePoints $sentinelDirectory "windows-release-lifecycle-temporary-reparse"
      Remove-Item -LiteralPath $sentinelDirectory -Recurse -Force
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

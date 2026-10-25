# Data ownership for the lifecycle harness. No installer or real-host defaults.
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

function Assert-NoReparsePoints {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$FailureCode
  )
  # Use literal Win32 extended paths for every entry, including descendants.
  # Provider traversal can reject a long descendant before its attributes are read.
  if ($Root.StartsWith('\\?\', [StringComparison]::Ordinal)) {
    if ($Root -notmatch '^\\\\\?\\(?:[A-Za-z]:\\|UNC\\[^\\]+\\[^\\]+(?:\\|$))') {
      throw "windows-release-lifecycle-unsupported-data-path"
    }
    $extendedRoot = $Root
  } else {
    $resolvedRoot = [IO.Path]::GetFullPath($Root)
    if ($resolvedRoot -match '^[A-Za-z]:\\') {
      $extendedRoot = '\\?\' + $resolvedRoot
    } elseif ($resolvedRoot -match '^\\\\[^.\?\\][^\\]*\\[^\\]+(?:\\|$)') {
      $extendedRoot = '\\?\UNC\' + $resolvedRoot.Substring(2)
    } else {
      throw "windows-release-lifecycle-unsupported-data-path"
    }
  }
  try {
    $rootAttributes = [IO.File]::GetAttributes($extendedRoot)
  } catch [IO.FileNotFoundException] {
    return
  } catch [IO.DirectoryNotFoundException] {
    return
  }
  if (($rootAttributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw $FailureCode }
  $pending = [Collections.Generic.Stack[string]]::new()
  $pending.Push($extendedRoot)
  while ($pending.Count -gt 0) {
    $current = $pending.Pop()
    $attributes = [IO.File]::GetAttributes($current)
    if (($attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw $FailureCode }
    if (($attributes -band [IO.FileAttributes]::Directory) -ne 0) {
      foreach ($child in [IO.Directory]::EnumerateFileSystemEntries($current)) {
        $childAttributes = [IO.File]::GetAttributes($child)
        if (($childAttributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw $FailureCode }
        if (($childAttributes -band [IO.FileAttributes]::Directory) -ne 0) { $pending.Push($child) }
      }
    }
  }
}

function New-LifecycleDataState {
  param(
    [Parameter(Mandatory = $true)][string]$Parent,
    [Parameter(Mandatory = $true)][string]$DataRoot,
    [Parameter(Mandatory = $true)][string]$BackupRoot,
    [Parameter(Mandatory = $true)][string]$QuarantineRoot
  )
  foreach ($root in @($DataRoot, $BackupRoot, $QuarantineRoot)) {
    Assert-ExactChildPath $Parent $root "windows-release-lifecycle-data-root-invalid"
  }
  $paths = @($DataRoot, $BackupRoot, $QuarantineRoot) | ForEach-Object { [IO.Path]::GetFullPath($_) }
  for ($index = 0; $index -lt $paths.Count; $index++) {
    for ($other = 0; $other -lt $paths.Count; $other++) {
      if ($index -eq $other) { continue }
      if ($paths[$index] -eq $paths[$other] -or $paths[$index].StartsWith("$($paths[$other])$([IO.Path]::DirectorySeparatorChar)", [StringComparison]::OrdinalIgnoreCase)) {
        throw "windows-release-lifecycle-data-roots-overlap"
      }
    }
  }
  return [pscustomobject]@{
    Parent = [IO.Path]::GetFullPath($Parent)
    DataRoot = $paths[0]
    BackupRoot = $paths[1]
    QuarantineRoot = $paths[2]
    OwnsTestRoot = $false
    BackupVerified = $false
    BackupAttempted = $false
  }
}

function Move-LifecycleDirectory {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )
  $resolvedSource = [IO.Path]::GetFullPath($Source)
  $resolvedDestination = [IO.Path]::GetFullPath($Destination)
  # Sibling roots share the same volume. Never fall back to recursive copying.
  if ([IO.Path]::GetDirectoryName($resolvedSource) -ne [IO.Path]::GetDirectoryName($resolvedDestination)) {
    throw "windows-release-lifecycle-directory-rename-parent-mismatch"
  }
  if (Test-Path -LiteralPath $resolvedDestination) {
    throw "windows-release-lifecycle-directory-rename-target-occupied"
  }
  [IO.Directory]::Move($resolvedSource, $resolvedDestination)
}

function Initialize-LifecycleDataOwnership {
  param([Parameter(Mandatory = $true)]$State)
  if ($State.OwnsTestRoot -or $State.BackupVerified) { throw "windows-release-lifecycle-data-already-initialized" }
  if (Test-Path -LiteralPath $State.BackupRoot) { throw "windows-release-lifecycle-backup-root-occupied" }
  $parentItem = Get-Item -LiteralPath $State.Parent -Force
  if (-not $parentItem.PSIsContainer -or ($parentItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "windows-release-lifecycle-data-parent-reparse"
  }
  if (Test-Path -LiteralPath $State.DataRoot) {
    Assert-NoReparsePoints $State.DataRoot "windows-release-lifecycle-preexisting-data-root-reparse"
    $State.BackupAttempted = $true
    Move-LifecycleDirectory -Source $State.DataRoot -Destination $State.BackupRoot
    $backup = Get-Item -LiteralPath $State.BackupRoot -Force
    if (-not $backup.PSIsContainer -or ($backup.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or (Test-Path -LiteralPath $State.DataRoot)) {
      throw "windows-release-lifecycle-backup-verification-failed"
    }
    $State.BackupVerified = $true
  }
  # Grant deletion authority only once the original path is demonstrably absent.
  $State.OwnsTestRoot = $true
}

function Remove-LifecycleTestDataRoot {
  param([Parameter(Mandatory = $true)]$State)
  if (-not $State.OwnsTestRoot) { throw "windows-release-lifecycle-test-data-not-owned" }
  Assert-ExactChildPath $State.Parent $State.DataRoot "windows-release-lifecycle-data-root-invalid"
  $cleanupWait = [Diagnostics.Stopwatch]::StartNew()
  while (Test-Path -LiteralPath $State.DataRoot) {
    Assert-NoReparsePoints $State.DataRoot "windows-release-lifecycle-test-data-reparse"
    try {
      Remove-Item -LiteralPath $State.DataRoot -Recurse -Force -ErrorAction Stop
      return
    } catch {
      # WebView2 may briefly retain handles after its application exits.
      # Retry only Windows sharing/lock violations on this owned test root.
      $nativeCode = $_.Exception.HResult -band 0xffff
      if (-not ($_.Exception -is [IO.IOException]) -or $nativeCode -notin @(32, 33) -or $cleanupWait.ElapsedMilliseconds -ge 10000) { throw }
      Start-Sleep -Milliseconds 100
    }
  }
}

function Complete-LifecycleData {
  param([Parameter(Mandatory = $true)]$State)
  $failures = [Collections.Generic.List[string]]::new()
  if ($State.BackupAttempted -and -not $State.BackupVerified -and (Test-Path -LiteralPath $State.BackupRoot)) {
    $failures.Add("windows-release-lifecycle-backup-unverified-preserved:$($State.BackupRoot)")
  }
  if ($State.OwnsTestRoot) {
    try {
      Remove-LifecycleTestDataRoot $State
    } catch {
      $failures.Add("windows-release-lifecycle-test-data-cleanup-failed")
      try {
        Assert-ExactChildPath $State.Parent $State.QuarantineRoot "windows-release-lifecycle-quarantine-root-invalid"
        if (Test-Path -LiteralPath $State.QuarantineRoot) { throw "windows-release-lifecycle-quarantine-root-occupied" }
        if (Test-Path -LiteralPath $State.DataRoot) {
          Assert-NoReparsePoints $State.DataRoot "windows-release-lifecycle-test-data-reparse"
          Move-LifecycleDirectory -Source $State.DataRoot -Destination $State.QuarantineRoot
        }
      } catch {
        $failures.Add("windows-release-lifecycle-test-data-quarantine-failed:$($State.QuarantineRoot)")
      }
    }
    # The next occupant may be original data even if restoration itself fails.
    $State.OwnsTestRoot = $false
  }
  if ($State.BackupVerified) {
    try {
      Assert-ExactChildPath $State.Parent $State.BackupRoot "windows-release-lifecycle-backup-root-invalid"
      Assert-ExactChildPath $State.Parent $State.DataRoot "windows-release-lifecycle-data-root-invalid"
      if (-not (Test-Path -LiteralPath $State.BackupRoot -PathType Container)) { throw "windows-release-lifecycle-backup-missing" }
      Assert-NoReparsePoints $State.BackupRoot "windows-release-lifecycle-backup-reparse"
      if (Test-Path -LiteralPath $State.DataRoot) { throw "windows-release-lifecycle-restore-target-occupied" }
      Move-LifecycleDirectory -Source $State.BackupRoot -Destination $State.DataRoot
      if (-not (Test-Path -LiteralPath $State.DataRoot -PathType Container) -or (Test-Path -LiteralPath $State.BackupRoot)) {
        throw "windows-release-lifecycle-restore-verification-failed"
      }
      $State.BackupVerified = $false
    } catch {
      $failures.Add("windows-release-lifecycle-original-data-restore-failed:$($State.BackupRoot)")
    }
  }
  return $failures.ToArray()
}

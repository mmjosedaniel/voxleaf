param(
  [Parameter(Mandatory, ParameterSetName='Install')][string]$InstallerPath,
  [Parameter(Mandatory, ParameterSetName='Admission')][switch]$CheckRegistration,
  [ValidateRange(1, 120000)][int]$TimeoutMilliseconds = 120000
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'windows-package-lifecycle-installer.ps1')
if ($CheckRegistration) {
  Assert-LifecycleInstallRegistrationAbsent
  return
}
$script:InstallerBudget = $TimeoutMilliseconds
function Get-LifecycleInstallerBudgetMilliseconds { $script:InstallerBudget }
$script:RecordedRoot = $false
$script:CleanupFailed = $false
$receipt = [ordered]@{
  created = $true
  contained = $false
  exitCode = $null
  failure = 'installer-unverified'
  nativeError = 0
}
try {
  $receipt.exitCode = Invoke-LifecycleInstallerJob -InstallerPath $InstallerPath -RecordRoot {
    param($ProcessId, $StartedUtc)
    $script:RecordedRoot = $true
  } -Journal {} -CleanupFailed {
    param($Failure)
    $script:CleanupFailed = $true
  }
  $receipt.contained = -not $script:CleanupFailed
  $receipt.failure = if ($receipt.exitCode -eq 0) { $null } else { 'installer-failed' }
} catch {
  $failure = $_.Exception
  while ($null -ne $failure.InnerException) { $failure = $failure.InnerException }
  if ($failure -is [ComponentModel.Win32Exception] -and
      $failure.Message -eq 'windows-release-lifecycle-installer-create') {
    # CreateProcess did not return a process; no child could have run.
    $receipt.created = $false
    $receipt.contained = $true
    $receipt.nativeError = $failure.NativeErrorCode
    $receipt.failure = 'installer-spawn'
  } elseif ($script:RecordedRoot -and -not $script:CleanupFailed) {
    $receipt.contained = $true
    $receipt.failure = if ($failure.Message -eq 'windows-release-lifecycle-installer-timeout') {
      'installer-timeout'
    } else { 'installer-failed' }
  }
}
$receipt | ConvertTo-Json -Compress

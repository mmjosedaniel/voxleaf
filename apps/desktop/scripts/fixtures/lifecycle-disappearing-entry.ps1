param([string]$Parent, [ValidateSet('file','directory')][string]$Kind)
$ErrorActionPreference = 'Stop'
$ownerScript = (Resolve-Path (Join-Path $PSScriptRoot '../../../../scripts/windows-package-lifecycle-data.ps1')).Path
. $ownerScript
$data = Join-Path $Parent 'data'
$state = New-LifecycleDataState $Parent $data (Join-Path $Parent 'backup') (Join-Path $Parent 'quarantine')
[IO.Directory]::CreateDirectory($data) | Out-Null
[IO.File]::WriteAllText((Join-Path $data 'original'), 'preserve')
[IO.File]::WriteAllText((Join-Path $Parent 'neighbor'), 'preserve')
Initialize-LifecycleDataOwnership $state
[IO.Directory]::CreateDirectory($data) | Out-Null
$disappearing = Join-Path $data 'transient'
if ($Kind -eq 'file') {
  [IO.File]::WriteAllText($disappearing, 'temporary')
  $statement = '[IO.File]::GetAttributes($child)'
} else {
  [IO.Directory]::CreateDirectory($disappearing) | Out-Null
  $statement = '[IO.File]::GetAttributes($current)'
}
# Pause the actual traversal after enumeration or dequeue, before the attribute read.
$line = @(Select-String -LiteralPath $ownerScript -SimpleMatch $statement)
if ($line.Count -ne 1) { throw 'fixture-interception-point' }
$script:observed = $false
$bp = Set-PSBreakpoint -Script $ownerScript -Line $line[0].LineNumber -Action {
  if (-not $script:observed) {
    if ($Kind -eq 'file' -and [IO.Path]::GetFileName($child) -eq 'transient') {
      [IO.File]::Delete($disappearing)
      $script:observed = $true
    } elseif ($Kind -eq 'directory' -and [IO.Path]::GetFileName($current) -eq 'transient') {
      [IO.Directory]::Delete($disappearing)
      $script:observed = $true
    }
  }
}
try {
  Remove-LifecycleTestDataRoot $state
} catch [IO.FileNotFoundException], [IO.DirectoryNotFoundException] {
  if ($script:observed) { Write-Output 'enumerated-entry-lookup-failed' }
  throw
} finally {
  Remove-PSBreakpoint $bp
  $failures = @(Complete-LifecycleData $state)
  if ($failures.Count -ne 0) { throw 'fixture-restoration' }
}
if (-not $script:observed -or [IO.File]::ReadAllText((Join-Path $data 'original')) -ne 'preserve' -or [IO.File]::ReadAllText((Join-Path $Parent 'neighbor')) -ne 'preserve') { throw 'fixture-witness' }
Write-Output 'disappearance-observed'

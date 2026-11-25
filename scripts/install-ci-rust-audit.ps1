# Acquire only the scanner. Each audit fetches advisory data for its own checkout.
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$version = (Get-Content -Raw services/tts/release/audit-policy.json | ConvertFrom-Json).tools.cargoAudit
$release = "cargo-audit-x86_64-pc-windows-msvc-v$version"
$archive = Join-Path $env:RUNNER_TEMP "$release.zip"
$destination = Join-Path $env:RUNNER_TEMP ([guid]::NewGuid().ToString())
try {
    if (-not (Test-Path -LiteralPath $archive)) {
        Invoke-WebRequest "https://github.com/rustsec/rustsec/releases/download/cargo-audit/v$version/$release.zip" -OutFile $archive
    }
    if ((Get-FileHash -LiteralPath $archive).Hash -ne '0a7316540862c13d954f648917ceacca593747baed6eec180fafa590be2710ab') {
        throw 'RustSec archive digest mismatch'
    }
    Expand-Archive -LiteralPath $archive -DestinationPath $destination
    $binaryDirectory = Join-Path $destination $release
    & (Join-Path $binaryDirectory 'cargo-audit.exe') --version
} catch {
    Write-Warning "Verified prebuilt scanner unavailable. Building pinned cargo-audit $version."
    cargo install --root $destination cargo-audit --version $version --locked
    $binaryDirectory = Join-Path $destination 'bin'
}
Add-Content -LiteralPath $env:GITHUB_PATH -Value $binaryDirectory

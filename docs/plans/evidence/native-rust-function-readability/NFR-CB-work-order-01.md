# APPROVED WORK ORDER

Target ID: NFR-CB. Risk: medium. One implementation writer.
Baseline: immutable independent `NFR-CB-BASELINE-20261013-03-FINAL-01`, PASS,
issued in the execution chat and preserved verbatim in
[final baseline](NFR-CB-baseline-03-final.md), after
[preparation03](NFR-CB-baseline-03-preparation.md).
All seven required gates passed; installed receipt and full restoration passed.
The raw/NSIS executable difference was reconciled by the exact documented
three-byte Tauri transformation in memory. The original failed guard remains
unchanged. Additional receipt:
`tmp/evidence/native-rust-function-readability/NFR-CB-BUNDLE-IDENTITY-20261013-01/result.json`,
SHA-256 `806eee7cb349fe0c83d3e2d8ccfef617020b8a3f3ec644deb9a003da1c579546`.

HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Branch: `codex/native-rust-function-readability`.
Director identity recheck: PASS; both target paths pristine and index empty.

| Allowed path under `apps/desktop/src-tauri/src/` | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `tts_optional_chatterbox.rs` | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `tts_optional_chatterbox/tests.rs` | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |

## Required edits

1. Add private `validate_installed_runtime_identity(&InstalledRuntimeManifest,
   &OptionalPackageManifest) -> Result<(), OptionalProfileError>` in its owner.
   Move only the identical six-condition predicate from `verify_runtime` and
   `runtime_manifest_for_bytecode_cleanup`; call it with `?` immediately after
   each original deserialization.
2. Add one table-driven regression in the existing tests file using `TestRoot`
   and `write_runtime`, with a fresh root for each invalid `schemaVersion`,
   `packageId`, `packageVersion`, `profileId`, `serviceModule`, and empty `files`.
   First verify the valid fixture. Serialize/write each invalid manifest and
   update only the disposable authority's runtime-manifest hash. Require
   `VerificationFailed` from full verification before creating bytecode. Then
   add a synthetic `.pyc` under `__pycache__`, require the same cleanup rejection,
   and verify its bytes remain unchanged.

Preserve current-only hash admission in full verification and current-or-legacy
admission in cleanup. Preserve I/O, parsing, containment, locks, receipts,
promotion/removal, cancellation, errors, privacy, and all existing tests.
No new module, public API, dependency, behavior, authority or generated edit.
The two-file ceiling is 120 added plus removed lines. Preserve accepted SUP/DIAG
and all other work. No staging, commit, push, PR, reset, clean or stash.

## Independent post-change gates

From the original checkout, normal local PowerShell outside sandbox:

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

The existing scripts cover default and `release-locked-runtime`. From a fresh
isolated candidate with its own dependencies, bound source and binary hashes:

```powershell
pnpm.cmd package:windows
pnpm.cmd package:windows:check
node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode preflight --installed-root "$nfrCandidateRelease"
node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode journey --installed-root "$env:LOCALAPPDATA\VoxLeaf" --installer "$nfrCandidateInstaller" --receipt "$nfrCandidateReceipt"
```

Preserve data using the reviewed procedure, a fresh preservation root and an
exact derived NSIS executable hash. Record concrete paths and commands in the
new immutable report. Combined closure also requires ExecPlan section 8 gates.
Worker runs no acceptance commands; return a Change Packet and become idle.
Maximum two bounded correction loops, each independently validated.

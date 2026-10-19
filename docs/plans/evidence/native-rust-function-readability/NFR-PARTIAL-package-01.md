# Validation Report

Report ID: NFR-PARTIAL-PACKAGE-20261013-01
Target ID: NFR-PARTIAL-PACKAGE
Mode: PACKAGE
Verdict: PASS for general validation of the partial accepted diagnostic patch.
Full campaign acceptance remains BLOCKED by SUP and CB baselines.

Environment: local PowerShell outside sandbox, all commands `require_escalated`
at original repository root. PowerShell 7.6.5, Corepack-selected pnpm 11.15.1,
Node 24.20.0, Cargo/rustc 1.97.1, Python 3.12.10.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

Validated closed source manifest (paths relative to `apps/desktop/src-tauri/src/`):

| Path | Porcelain before/after | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | empty | `23f8c44039b4dab2da8bc18f7acd58c3e960d08faabb1a00d751ca9841137ee5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `tts_service_supervisor/tests.rs` | empty | `fa7d8092689b08a6806ae3330d51ac03d0aef58345895a2d219539653998e948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |
| `tts_optional_chatterbox.rs` | empty | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `tts_optional_chatterbox/tests.rs` | empty | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |
| `tts_service_supervisor/host_diagnostics.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | `39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27` | `f30c5ebde8272b6d81715c580d92504148259f1f` |

Identity recheck: PASS. All five paths/HEAD unchanged; index empty before/after.
Historical `windows-package-evidence-v3.json` unchanged SHA-256
`f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.
Fresh native binary SHA-256:
`e5451cbb209126b2c7662375d79dc6e0074c2e10375d99260ae164d1b0e0c14e`.
Earlier model/package results are not reassigned to this rebuild.

Commands and outcomes:

1. `pnpm.cmd check:portable` -> exit 0. Evidence guard/13 guard tests, TS/Python format/lint/typecheck, generated contracts, tests and portable builds pass. Shared 209, EPUB 651, desktop 727 Vitest +70 Node, Python 485; mypy 171 files, 17 generated contract files verified.
2. `pnpm.cmd check` -> exit 0. Complete configured repository gate, same tests plus Rust format, both Clippy configurations and 87 default/88 release-locked passed with one intentional ignored fixture each, native/frontend/Python builds.
3. `pnpm.cmd test:native-startup` -> exit 0. Fresh build; bounded protocol, model-free supervisor lifecycle/cancellation/crash recovery, Windows descendant, reader/restoration and cleanup; no errors/external requests.
4. `git diff --check` -> exit 0.

Nonfatal warnings: pytest cannot update existing `cache/nodeids` (permission
denied), all tests pass; existing Vite chunk-size warning. No repairs.

Ignored raw directory:
`tmp/evidence/native-rust-function-readability/NFR-PARTIAL-PACKAGE-20261013-01/`.

| Evidence | SHA-256 |
| --- | --- |
| `01-portable.log` | `e1cd0028b2afc842e1ce743e460e7a925376ee530048470e7f93faa3803f0f49` |
| `02-check.log` | `c0fec88b8bf69872d1b7574d93e7d82012ca2eb266c89753c3ff5ad36355317e` |
| `03-native.log` | `1a3be7f8b37c6ed4f6d7418d40fc8f24d0154b3c8e04274dc79f454a3c0a5fe6` |
| Both identity JSON receipts | `d75dd71b66a56023acb9afe572dbc9ba586b8b535da4fbe5929a6d7248246821` |

Diff scope: PASS. Sole source change DIAG 31 additions/46 removals; SUP/CB
production/tests pristine. Director plan/testing guidance and five Markdown
records outside source manifest await separate documentation review.

Invariant review: PASS for partial patch. Deadline, active-before-timeout,
guard release, scope/errors/constants and distinct joins preserved. General
gates prove deterministic integration/model-free behavior, not real-model
narration or installed acquisition. Failed SUP/CB gates were not repeated or
weakened and remain unresolved.

Test-integrity review: PASS. No tests, fixtures, assertions, skips, conditions
or thresholds changed. Existing authorities preserved.
Privacy/artifact review: PASS. No generated authority/dependency/private or
prohibited artifacts or unrelated source in diff. Raw evidence ignored; no
installation, machine configuration or Git mutation.

Action required: none for limited PACKAGE PASS; final documentation review
outstanding. Keep plan active. Outstanding baselines require bounded work and
new immutable reports.

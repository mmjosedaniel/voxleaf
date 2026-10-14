# Validation Report

Report ID: NFR-SUP-POST-CHANGE-20261013-02  
Target ID: NFR-SUP  
Mode: POST-CHANGE  
Verdict: FAIL.

Independent Astra validation through verified Explorer-parent normal PowerShell
outside sandbox; PowerShell 5.1.26100.9444, pnpm 11.15.1, Node 24.20.0. Ordinary
AppData view verified; model variables cleared for common gates.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `82ea8d4874fc3d24598f5491ff41243ba0c95fbdcbaa2511f17513622e615fcb` | `9be071751e11b76cb25dce5b54d00c3ae8e9b8f9` |
| `tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `77ccc590c40192f66da4a2b3e5bea60f7856aeb2de7352999c58ba819eb4c675` | `262f98b2e26c88066a75fc1afec85f01863c8dda` |

Identity recheck: PASS, identical before/after receipts, unchanged HEAD and empty
index. Accepted DIAG and historical package authority remained unchanged.

`git diff --check` and `pnpm.cmd format:check:rust` exited zero.
`pnpm.cmd lint:rust` exited 101: default Clippy rejects unused `generating` and
`ready` bindings in `synthesize_measured` at lines 1102/1124. Release-locked
Clippy did not run. The remaining ten baseline-03 commands were NOT RUN after
this first common failure; exact commands remain in
[baseline 03](NFR-SUP-baseline-03.md#commands-and-results).
No post-change runtime pass or test count is claimed.

Diff scope: PASS, 273 lines across the two allowed files. Reversing only the two
format corrections in memory reproduced the preceding test-file hash exactly.
Static invariants: PASS; nine state/timeout pairs, lifecycle/identity ordering,
health, timing/guards/cleanup and constructor/path/fallback ordering unchanged.
The two newly unused bindings are a lint regression against the baseline.
Static test integrity and privacy/artifact review: PASS. Existing assertions
unchanged, additive fixtures preserved, no unrelated artifact/dependency/API.
No app/model journey launched; final process inspection found no app/driver
processes. Validator did not edit source.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-SUP-POST-CHANGE-20261013-02/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `573389b1f132e8913bec8b74b3367ad9b5d6cb00389e00739ca7dbd06ba38e94` |
| `02-gate.log` | `fe5b114ab471ae7f61871a916c4dd99921822dfa7ba9c76e71241bfbff17a195` |
| `launcher.json` | `cb3264c59129e9938fc2781febc82d6cdad95dc0b35831b378f24839717f2dc8` |
| `launch.ps1` | `9759ff2d3a361a30b48aa8a85d0bf8a8b5b9ca4a99086e1099592c92b32c7375` |

Action: remove only the two unused bindings, preserve calls and propagation,
then rerun all twelve gates in a new immutable report.

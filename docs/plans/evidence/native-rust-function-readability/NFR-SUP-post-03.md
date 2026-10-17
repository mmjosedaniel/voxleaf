# Validation Report

Report ID: NFR-SUP-POST-CHANGE-20261013-03  
Target ID: NFR-SUP  
Mode: POST-CHANGE  
Verdict: FAIL.

Independent Astra validation via verified Explorer-parent normal PowerShell
outside sandbox; ordinary canonical AppData view verified. PowerShell
5.1.26100.9444, pnpm 11.15.1, Node 24.20.0. Model variables correctly cleared.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `47dbde54f8a0e064902f3ecb64fa23bddcdba4d266c5d9e809c2f26aafbc425c` | `ddba85b16e21babfb0305b86c3e876a25be4ffcf` |
| `tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `77ccc590c40192f66da4a2b3e5bea60f7856aeb2de7352999c58ba819eb4c675` | `262f98b2e26c88066a75fc1afec85f01863c8dda` |

Identity recheck: PASS, byte-identical receipts, unchanged HEAD, empty index.
Accepted DIAG remains `39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27`;
historical package evidence remains `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

## Commands and results

- `git diff --check`: 0.
- `pnpm.cmd format:check:rust`: 0.
- `pnpm.cmd lint:rust`: 0, both configurations.
- `pnpm.cmd test:rust`: 0, default 93/locked 92 passed, one intentional ignore each.
- `pnpm.cmd test:native-startup`: 1 after successful build, during native restart session creation, `webdriver-session-not-created`.
- Baseline-03 gates 5–12: NOT RUN after the first common failure. Exact commands are retained in [baseline 03](NFR-SUP-baseline-03.md#commands-and-results).

Built executable SHA-256:
`81f35874af88c9944fdb10e68d0d36f1ded43ec861a7bdb107686b3cec55146f`.
The second `driver.createSession(executablePath, profileDirectory)` at
`native-startup-smoke.mjs:1365` failed after awaited deletion of the initial
session. Driver stdio is ignored by the harness, so a narrower cause is not
established. Neither a source regression nor a transient-host cause is assumed.

Diff scope: PASS, 272 lines, two authorized paths. Reversing only the two
binding removals in memory reproduced the preceding production SHA exactly.
Static invariants and executed Rust coverage: PASS; nine state/timeout pairs,
three constructor positions, lifecycle/identity ordering, health, guards,
timing, cleanup, error propagation and fallback distinctions are preserved.
The two unused return values are discarded at the original call positions.

Test integrity: PASS. Four new receipt tests pass in both configurations; two
development-path tests pass under their non-release cfg. Existing assertions
unchanged. Complete native and model acceptance remains pending.
Privacy/artifacts: PASS; no unrelated dependency/API/authority/private data.
No model journeys ran; no cleanup failure was emitted, and final inspection
found no VoxLeaf/tauri-driver/EdgeDriver processes. No validator edits or retry.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-SUP-POST-CHANGE-20261013-03/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `823b42240fd23239951ca9d64e0b15a03d8950f83bba929cdfc22403bf2711c5` |
| `04-gate.log` | `bfef39e52a5bff706290a2f8fe29f13ae9e22ea648daffb194595ae98d6783d2` |
| `launcher.json` | `63478ca82c23e95d92661076745b148f1b685942d75431bccfe65bad72dda711` |
| `launch.ps1` | `8df52d25ee4d5713b20900196783667bdac7c9c813237dfb18a51962849e08e7` |

Action: director reassessment required. Two source correction loops exhausted;
this report authorizes no further correction or automatic retry.

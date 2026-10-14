# Validation Report

Report ID: NFR-SUP-POST-CHANGE-20261013-01  
Target ID: NFR-SUP  
Mode: POST-CHANGE  
Verdict: FAIL.

Independent Astra validation through verified Explorer-parent normal PowerShell
outside sandbox; PowerShell 5.1.26100.9444, pnpm 11.15.1, Node 24.20.0. Ordinary
canonical AppData view verified, model variables absent for the common gate.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `82ea8d4874fc3d24598f5491ff41243ba0c95fbdcbaa2511f17513622e615fcb` | `9be071751e11b76cb25dce5b54d00c3ae8e9b8f9` |
| `tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `f3609d9b461df3e44861ec9ca93b2ac9cfe6ea9db2b10714777cd05fa32cb421` | `94b2b890700d33e6521bae595b1f49b84f37cec1` |

Identity recheck: PASS, byte-identical before/after receipts, empty index,
unchanged HEAD, accepted DIAG and historical package evidence.

`git diff --check` exited zero. `pnpm.cmd format:check:rust` exited one: rustfmt
requires wrapping the `channel_session` return tuple and the seeded-state
`supervisor.set_state("loading").expect(...)` chain in the existing test file.
The remaining eleven commands listed verbatim in
[baseline 03](NFR-SUP-baseline-03.md#commands-and-results) were NOT RUN, following
the first-common-failure stop rule. No runtime result or test count is claimed.

Diff scope: PASS, two allowed files, 193 additions/75 deletions = 268 lines.
Static invariant review: PASS. Nine state/timeout pairs, health behavior,
identity/lifecycle order, caller timing/guards/cleanup/record order and three
constructor positions/cfg/path/dependency/error/fallback policies are preserved.
Static test integrity: PASS, four process-free receipt tests and two cfg-matched
directory tests characterize the required distinctions; no existing assertion
was weakened. Compilation/execution remain unverified.

Privacy/artifact review: PASS. No new dependency, public contract, authority or
private artifact. No app/model journey launched; no remaining app/driver
process. Validator did not edit source.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-SUP-POST-CHANGE-20261013-01/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `a357e55952b78b7e256904968df5d68f5b3d4158029ba2fa9018dc8f08af4424` |
| `01-gate.log` | `10d5710183bce8a7cbff81c781dd55a89bee3db1aaa1d9e6df74a01389cf385c` |
| `launcher.json` | `245488050bfca4312ea0be87348ca60c5fe2fbb6382f8f0528ea98e8aad431b0` |
| `launch.ps1` | `9c51c4f9797b2f841583a0d1d78bf06ff845558dfbc250c7aa9f52daae63e787` |

Action: only the two formatting corrections, then a new immutable post-change
report and all twelve gates. This report remains unchanged after correction.

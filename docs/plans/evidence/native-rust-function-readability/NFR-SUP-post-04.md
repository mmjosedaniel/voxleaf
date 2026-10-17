# Validation Report

Report ID: NFR-SUP-POST-CHANGE-20261013-04  
Target ID: NFR-SUP  
Mode: POST-CHANGE  
Verdict: PASS.

Independent Astra validation through verified Explorer-parent normal PowerShell
outside sandbox; PowerShell 5.1.26100.9444, pnpm 11.15.1, Node 24.20.0. Ordinary
canonical AppData view verified, model variables scoped to model gates.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `47dbde54f8a0e064902f3ecb64fa23bddcdba4d266c5d9e809c2f26aafbc425c` | `ddba85b16e21babfb0305b86c3e876a25be4ffcf` |
| `tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `77ccc590c40192f66da4a2b3e5bea60f7856aeb2de7352999c58ba819eb4c675` | `262f98b2e26c88066a75fc1afec85f01863c8dda` |

Identity recheck: PASS, byte-identical receipts and empty index; final closure
independently reconfirmed source hashes. Accepted DIAG remains
`39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27`;
historical package evidence remains `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

## Commands and results

All twelve exact commands are listed in
[baseline 03](NFR-SUP-baseline-03.md#commands-and-results), in the same order.

| Gates | Outcome |
| --- | --- |
| 1, `pnpm.cmd format:check:rust` | PASS/0, reused from immutable post-03 |
| 2, `pnpm.cmd lint:rust` | PASS/0, both configurations, reused from post-03 |
| 3, `pnpm.cmd test:rust` | PASS/0, default 93/locked 92, one ignore each, reused from post-03 |
| 4, `pnpm.cmd test:native-startup` | Fresh PASS/0, one unchanged retry including restart |
| 5, UI portfolio preflight | Fresh PASS/0 |
| 6–8, three exact profile preflights | Fresh PASS/0 |
| 9, model-free lifecycle | Fresh PASS/0 |
| 10, Spanish Piper journey and exact speed matrix | Fresh PASS/0 |
| 11, English Piper journey and exact speed matrix | Fresh PASS/0 |
| 12, Chatterbox Spanish and English journeys | Fresh PASS/0 |
| `git diff --check` | 0 |

The [Astra reassessment and director order](NFR-SUP-retry-decision-01.md)
authorized reuse only after unchanged source/HEAD, command scope and relevant
environment were checked against [post-03](NFR-SUP-post-03.md). No correction
occurred between attempts; original receipts were not edited. Reused result
SHA-256: format `53b7f569c3bafa88365aa270644e279fde077c789ea0a850b218aa414a96a81b`,
Clippy `96eb81bdb37b5015d50b072c3dacb9a41ae50b0e25546885e7f281c9636a8107`,
tests `33f449c429563a1400de7419eba8321ea981244768243995fc88f3b5ad3e7e1b`.

Fresh execution ran 19:16:05Z–19:33:18Z on 2026-10-13. Native executable SHA-256
`481ead495b40136662a2286c505f990e67fdde75f1707fdf940216c20ab67781`
remained unchanged after gate 4 through closure. The post-03 restart-session
failure did not reproduce; its cause remains unknown and its FAIL is retained.

Scope: PASS, two files, production 46 additions/75 deletions and tests 151
additions, 272 total within 320. Both corrections match their bounded orders.
Invariants: PASS. Nine original state/timeout pairs and three constructor
positions are preserved; service identity validation precedes lifecycle update,
which precedes unexpected-state rejection. Health remains unrestricted. Guards,
timing, record ordering, active identities, cancellation, cleanup ownership,
path/dependency order, errors and distinct fallback policies remain unchanged.

Test integrity: PASS. Four channel tests pass in both configurations; two
development-directory tests pass under non-release cfg. Exact Value return,
expected/unexpected lifecycle, wrong identity, timeout/disconnection, canonical
tuple order and all missing-path cases are covered. Existing assertions remain
unchanged, with no global environment mutation, sleeps or production accessor.

Privacy/artifacts: PASS. Four model arms reported zero external requests,
generated audio files and retained/discarded units after cleanup. Cancellation
was 235/281 ms for Piper and 293/282 ms for Chatterbox. Closure at 19:34:17Z found
no observed owned descendants or app/driver/model/WebView remnants. No install,
Git, machine configuration or generated authority changes. Chatterbox reports
`exactMatrix: null`; no additional speed-matrix or general performance claim.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-SUP-POST-CHANGE-20261013-04/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `823b42240fd23239951ca9d64e0b15a03d8950f83bba929cdfc22403bf2711c5` |
| `launch.ps1` | `99a5761199c6af77c8742008bbb6ae1b5c4be3e76de036728115f0e02928f623` |
| `launcher.json` | `cfde8a14eb88994215c7f0edcbb14e467440f9ac6f6baac1ad802aaf85644399` |
| `12-gate.log` | `00bfaca0baca1962d87c5434990f6faeeae0ae0fbd3e7495a52d89a7255f3201` |
| `closure.json` | `0af5d18f355e1ab7cd9a9ceda54e8f1734629096ba023c7b67128f75b0c2096b` |

Action: director acceptance and live identity recheck. No Git or installation
action is authorized; CB/package and combined closure remain separate.

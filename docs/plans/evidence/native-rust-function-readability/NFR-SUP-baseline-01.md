# Validation Report

Report ID: NFR-SUP-BASELINE-20261013-01
Target ID: NFR-SUP
Mode: BASELINE
Verdict: BASELINE-FAIL

This immutable receipt retains the independent Astra validator's result.
Environment: local PowerShell outside sandbox; every acceptance command used
`require_escalated` from the repository root. PowerShell 7.6.5, Node 24.20.0,
process-local Corepack PATH selecting pnpm 11.15.1, Cargo/rustc 1.97.1,
tauri-driver 2.0.6, WebView2 and Microsoft-signed EdgeDriver 155.0.4283.45.
Model commands used the documented existing Piper core and Chatterbox v3_v4
interpreters/models, `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, and existing
interpreter-bound outbound firewall blocks. No machine configuration changed.

Starting HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

Validated paths and identities:

| Path | Exact porcelain before/after | Worktree SHA-256 before/after | Filter-aware expected index blob before/after |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | empty output | `23f8c44039b4dab2da8bc18f7acd58c3e960d08faabb1a00d751ca9841137ee5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | empty output | `fa7d8092689b08a6806ae3330d51ac03d0aef58345895a2d219539653998e948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |

Identity recheck: PASS. HEAD and both paths remained identical; index empty
before/after. `git diff --check` exited 0 before/after. Native executable SHA-256
remained `fc8be11b6ef92a68e7fe729bb67f9212037362244df3e95187e2886ff6b096a1`
between its fresh build and completed model runs. Final process inspection
found no matching VoxLeaf, Python, tauri-driver or EdgeDriver processes.

## Commands and outcomes

1. `pnpm.cmd format:check:rust` -> exit 0.
2. `pnpm.cmd lint:rust` -> exit 0, default and `release-locked-runtime` all-target Clippy with warnings denied.
3. `pnpm.cmd test:rust` -> exit 0, default 87 passed/0 failed/1 ignored; release-locked 88 passed/0 failed/1 ignored. The ignored test is the intentionally selected subprocess fixture; its child-reaping regression passes.
4. `pnpm.cmd test:native-startup` -> exit 0, rebuilt executable; model-free supervisor lifecycle, bounded protocol/binary delivery, cancellation/crash recovery, native reader/restoration and cleanup pass with no errors or external requests. Existing Vite chunk-size warning.
5. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight` -> exit 0, 39 Vitest, 17 driver Node and 5 portfolio Node tests pass.
6. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --preflight-only` -> exit 0.
7. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --preflight-only` -> exit 0.
8. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only` -> exit 0.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only` -> exit 0.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` -> exit 1, `Adaptive exact-host TTS matrix failed during adaptive exact-host profile selection [webdriver-condition-timeout].`
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1` -> exit 1, same profile-selection timeout.
12. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4` -> exit 1, optional-profile observation reported `"state":"failed"`, then `Adaptive exact-host TTS matrix failed during adaptive exact-host profile selection [synchronized-narration-proof-failed].` Spanish stopped before narration; English was not reached.

Raw logs and test identities remain in ignored
`tmp/evidence/native-rust-function-readability/NFR-SUP-BASELINE-20261013-01/`,
numbered 01-12. Failed-model log SHA-256:

- Spanish Piper: `f12cfb1612ae3fd5a07d6ce8095d0e653264145e0659e5ac6a9fb3a8665c9228`.
- English Piper: `da36d34cf99272a79953f7422ee0218d7eb366a92b659aa33c1283b56406cb19`.
- Chatterbox: `01259160ce188a47225c0c325f8ef9364528c957eefcebc1cea4e43c3eeb35af`.

## Reviews and disposition

Diff scope: PASS. Both source paths remain clean. The sole tracked modification
at report issuance was the director's active plan, outside this manifest.

Invariant review: FAIL, acceptance evidence incomplete. Static review confirms
the nine original timeout/state pairs, lifecycle update before expected-state
rejection, service identity rejection before mutation, unrestricted health
receipt, and the three repeated development-path blocks with distinct fallback
policies. Deterministic and model-free baselines passed; required real-model
narration, switching, synchronization, performance and cancellation did not
complete. Preflights establish configuration/firewall prerequisites, not model
execution or execution of development constructors.

The Piper logs already showed the requested profile compatible, selectable and
active. The harness also selects an alternate profile, and Chatterbox was the
only alternate listed. Timeouts are consistent with alternate enablement,
activation or switch-back failure; the exact wait and root cause are unproven.
Chatterbox independently reported failed installed-profile state. This is a
pre-existing baseline failure, not a refactor regression.

Test-integrity review: PASS. Existing assertions, identities, platform/feature
conditions and subprocess-fixture distinction remain unchanged. Planned new
receipt/path tests are not implemented.

Privacy/artifact review: PASS. No generated authority, dependencies, books,
audio, models, secrets or unrelated source entered the diff. Synthetic fixtures
and ignored logs only. Existing installation/data were not manually modified.

Action required: do not issue the NFR-SUP implementation order. Resolve the
existing installed-profile/selection prerequisite under separately authorized
work, retain these failures and rerun the complete baseline with a new Report
ID. Independent NFR-DIAG may proceed.

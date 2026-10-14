# Validation Report

Report ID: NFR-SUP-BASELINE-20261013-03  
Target ID: NFR-SUP  
Mode: BASELINE  
Verdict: PASS.

Independent Astra validation in normal local PowerShell outside sandbox via
verified Explorer broker; PowerShell 5.1.26100.9444, pnpm 11.15.1, Node 24.20.0.
Ordinary AppData canonical containment verified. Model environment keys cleared
for common/native/UI/lifecycle gates and enabled only for model gates. No global
configuration changes. Starting/ending HEAD:
`d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain before/after | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | no output | `23f8c44039b4dab2da8bc18f7acd58c3e960d08faabb1a00d751ca9841137ee5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `tts_service_supervisor/tests.rs` | no output | `fa7d8092689b08a6806ae3330d51ac03d0aef58345895a2d219539653998e948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |

Identity recheck: PASS, byte-identical before/after receipts, empty index.
Accepted DIAG SHA remains `39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27`;
historical package evidence remains `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

## Commands and results

All commands ran at the original repository root, sequentially between
18:38:48Z and 18:56:27Z on 2026-10-13. Every command exited zero.

1. `pnpm.cmd format:check:rust`: PASS.
2. `pnpm.cmd lint:rust`: default and release-locked-runtime Clippy PASS.
3. `pnpm.cmd test:rust`: default 87/locked 88 passed, one intentional ignore each.
4. `pnpm.cmd test:native-startup`: full fresh native smoke PASS, including protocol, synthetic supervisor lifecycle, cancellation/crash recovery, reader/persistence and zero external requests.
5. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`: PASS, including 39 Vitest and five portfolio runner tests.
6. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --preflight-only`: PASS.
7. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --preflight-only`: PASS.
8. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only`: PASS.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only`: synthetic lifecycle PASS.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1`: Spanish Piper and exact playback-speed matrix PASS.
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1`: English Piper and exact playback-speed matrix PASS.
12. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`: Spanish and English PASS; cancellation 283/281 ms, resource release 590/559 ms; zero underruns, external requests and generated audio files, zero retained/discarded units after cleanup.

Gate 4 built release executable SHA-256
`176edf64a813bbfc0c8cc5c78264601a58c2ed9cf85e92f60fb1b6910f696499`,
unchanged through gates 5–12 and closure.

Scope, unchanged-baseline invariants, test integrity and privacy/artifact review:
PASS. Both SUP paths remain pristine; DIAG's separate 31-addition/46-deletion
patch is unchanged. Repository assertions/commands were unchanged; earlier
failures remain immutable. No installation, source, Git or authority changes.
Closure at 18:58:25Z found no observed owned descendants, VoxLeaf/driver or
installed-runtime Python processes. This is bounded closure evidence, not a new
full AppData integrity scan.

Chatterbox exercised accepted playback-speed options, but its reported
`exactMatrix` is null: no additional Chatterbox speed-matrix claim is made.
Post-change review still must establish preservation of all nine state/timeout
pairs, lifecycle ordering, guard/cleanup/timing and development-path/fallback
order. This baseline does not accept an unimplemented extraction.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-SUP-BASELINE-20261013-03/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `db65f9ad36abfa8ffa908982268512d65bf2523e009f1aaa7abbce5d39b55ae9` |
| `launch.ps1` | `6d438683fda659dd9ee4069fca8722fadd63598e9a5603b89c6d81a4d8f5a0d7` |
| `launcher.json` | `d9e8a252ce65ca2d64729ecff9263dda08ee7280a7222a16103b0cf7092ae746` |
| `12-gate.log` | `efc2f8203bbb9d7055132828d5cd67a227f4539d58f3f58a173a70b3e227571f` |
| `closure.json` | `7f07e690bf665a504a419ea9b77843ff12c9cca95a3dd6eaaa86e9bad2f62f44` |

Action: director may freeze the bounded SUP implementation order. No Git action
is authorized by this report.

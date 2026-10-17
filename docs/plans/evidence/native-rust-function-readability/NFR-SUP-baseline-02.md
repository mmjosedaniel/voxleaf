# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `26b97e6ec7b144192a81d8c69c70ee820dedd720c87c17a10aa1279a8ab57fa8`.
> See [publication and original retention](README.md).

Report ID: NFR-SUP-BASELINE-20261013-02  
Target ID: NFR-SUP  
Mode: BASELINE  
Verdict: BASELINE-FAIL.

Independent Astra validator; normal local PowerShell outside sandbox, actual
Explorer-parent PowerShell 5.1, verified ordinary canonical file view,
pnpm 11.15.1 and Node 24.20.0.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `tts_service_supervisor.rs` | no output | `23f8c44039b4dab2da8bc18f7acd58c3e960d08faabb1a00d751ca9841137ee5` | `671b6168addd815db302f83e59c662fc11f70e40` |
| `tts_service_supervisor/tests.rs` | no output | `fa7d8092689b08a6806ae3330d51ac03d0aef58345895a2d219539653998e948` | `bd4c0d27ac7497eae0837895e8024cdc97761a47` |

Identity recheck: PASS; before/after identity JSON identical SHA-256
`db65f9ad36abfa8ffa908982268512d65bf2523e009f1aaa7abbce5d39b55ae9`.
Index empty; accepted DIAG and historical package evidence unchanged.

| Exact command at original root | Result |
| --- | --- |
| `pnpm.cmd format:check:rust` | 0 |
| `pnpm.cmd lint:rust` | 0, default and release-locked-runtime |
| `pnpm.cmd test:rust` | 0, default 87/locked 88 passed, one ignore each |
| `pnpm.cmd test:native-startup` | 1, `tts-service-lifecycle-probe-failed` at native TTS service lifecycle completion |
| Gates 5–12 | NOT RUN; director closed attempt after gate 4 |

Executable SHA-256:
`c81f7d80bc06d73c4477cf1d192227e403d0cceb014a48e08dd08c49e0399748`.
The explicit synthetic supervisor CLI host matrix passed earlier in the native
command. The runner deletes its UI lifecycle observation, retaining only the
fixed failure code.

The temporary validator launcher enabled Piper before native smoke.
`ServiceChild::configured` consequently selects real Piper while the lifecycle
probe requires synthetic 19,200-byte/4,800-sample audio. This invalid setup is
attributable to validation environment scoping; it does not establish a source
regression. No assertion was changed. Astra recommends clearing the existing
`modelFreeLifecycleEnvironment` keys only in the common/native/UI-preflight
processes and applying model configuration only to subsequent model gates.

Diff scope and test-integrity review: PASS. Executable baseline acceptance:
FAIL/incomplete. Privacy/artifact review: PASS. No source, Git or installation
change; no remaining VoxLeaf, tauri-driver or EdgeDriver process.
Historical package evidence retains SHA-256
`f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

Raw evidence under
`tmp/evidence/native-rust-function-readability/NFR-SUP-BASELINE-20261013-02/`:

| File | SHA-256 |
| --- | --- |
| `04-gate.log` | `85088704c5142d2a59b16b4f9e72f602622d9405d3d57c49392383f3d2d7544a` |
| `launch.ps1` | `04644aada2ce74b49e4f0164329e9f4964113e76903168c33cd0ef14c48bf6d6` |
| `launcher.json` | `e13ec441314348d68694c045da10356994c0585c5cd3fb4cd27edaf33b4ca735` |

Action: a fresh attempt 03, all twelve commands, correctly scoped environment.
No source repair or implementation order is authorized by this report.

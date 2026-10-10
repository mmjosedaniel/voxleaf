# Validation Report
Report ID: PIPER-ES-PROFILE-DIAG-01
Target ID: DESKTOP-PCM-01 / Piper ES profile-selection blocker
Mode: BASELINE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox; one instrumented diagnostic only, not a replacement baseline, model acceptance, group F, or campaign PASS. Existing Node v24.20.0, pinned Corepack shim with network disabled, existing matching Microsoft Edge driver 155.0.4283.45, existing packaged executable. All relevant shell execution used require_escalated host PowerShell.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: the closed 15-path manifest below. The two proposed PCM additions remain ABSENT; accepted Unit1 source identities exactly match its prior acceptance. No PCM or CSS edits.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/reader/SemanticDocument.tsx | ` M apps/desktop/src/reader/SemanticDocument.tsx` | 6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2 | 2461f6208cc6e1b082b1c7977143f37903d2e041 |
| apps/desktop/src/reader/semantic-document-render-plan.ts | `?? apps/desktop/src/reader/semantic-document-render-plan.ts` | 51E91A57D9ED9C6B9734434F8489AD150DE0E6D22DAE8888A3036263E1A247CB | f7083cd49d14c17eaeefd898ed230da223042616 |
| apps/desktop/src/reader/SemanticDocument.test.tsx | ` M apps/desktop/src/reader/SemanticDocument.test.tsx` | C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3 | 26ba73dc3fb43d41f345ae852131ae2846e1d1ef |
| apps/desktop/src/tts/pcm-playback.ts | `CLEAN (empty)` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `CLEAN (empty)` | ABSENT | ABSENT |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `CLEAN (empty)` | ABSENT | ABSENT |
| apps/desktop/src/styles.css | `CLEAN (empty)` | FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823 | b616c73157a4a490bbf038ab4a613690432fbd29 |
| apps/desktop/src/settings/narration-settings-actions.ts | `CLEAN (empty)` | 8782470007E32E81AF7F6B04BD3CD51F878635E410AB9C70664371E327517DB5 | d49281f8ad9c336568cc6e56f6d596cd25458ac7 |
| apps/desktop/src/tts/HardwareCompatibilityControls.tsx | `CLEAN (empty)` | 3ACCA5106BAFD089282C536D2F639BBE80E7128F3391D8879D0D7F9CFC184384 | 6bf1bb57fc346a2359219e48c82d5042523efdf2 |
| apps/desktop/src/tts/optional-chatterbox-client.ts | `CLEAN (empty)` | 687B13980DB4096C4114A8C97B6D843396C40E048DB099E496609DAF2324DA97 | e52200f97d0a7cd8a384e1cfd43509b7b817e99f |
| apps/desktop/src-tauri/src/tts_optional_chatterbox.rs | `CLEAN (empty)` | E525734297CE7CF8B437E5FC50B75A9F6D680CA6FC56707EE36ACAE5CAF45ECF | 8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513 |
| apps/desktop/scripts/bilingual-portfolio-host.mjs | `CLEAN (empty)` | 9CA2FC5ACD2DCA71A713E843397AF8F7816451A879635AE39BFEF36498AB9BCE | 62dbe89b3f2d99bf8a6c641bf0112b21fd426abc |
| apps/desktop/scripts/native-startup-smoke.mjs | `CLEAN (empty)` | 7238E6807B3D832F810F6811AB3E4B15D567969F91D89012FB2A41E1A0F7E4AC | 2e502ceb4eecdbab0d301cbdcdddc571b859f94a |
| apps/desktop/scripts/native-webdriver-client.mjs | `CLEAN (empty)` | B898BB5C312C3099E2E43656A8FF27DBA2DD9137ECE26AAA73255DCEF7381051 | bfdeae55313b5a4f3d249eb03709632aa0ee8540 |
| apps/desktop/scripts/adaptive-tts-profile-selection.mjs | `CLEAN (empty)` | 748263CC88876FFE307A733955F5AE186A7E1384B6DE3CB0856C02E318E68ED8 | 084ced445f46beb814e0c1a4aa80601ac77b5adc |

Supplemental executable/instrumentation SHA-256 identities (unchanged before/after; ignored artifacts are not source allowlist additions):

- apps/desktop/src-tauri/target/release/voxleaf-desktop.exe: `8343E0121E8D72D4E4A252D6F00DBAC24D2C4087C4B5E8ED33A98A338956F234`.
- tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe: `DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892`.
- tmp/evidence/desktop-source-organization/PIPER-ES-PROFILE-DIAG-01/preload.mjs: `BC47251893DC68984E6A8994689E51CD2DA248CD60483D026462C0C685385640`.

Identity recheck: PASS. Full HEAD, branch codex/desktop-source-organization, closed source manifest, supplemental hashes, complete porcelain path/status list, and optional-root presence unchanged. Index empty before and after (git diff --cached --quiet exit 0). Before/after.json preserve exact evidence. Native/model process inventory was empty before and after; no commands or private command lines were recorded.
Commands and outcomes:
1. node.exe --check tmp/evidence/desktop-source-organization/PIPER-ES-PROFILE-DIAG-01/preload.mjs -> exit 0; syntax check only.
2. Existing filtered runner: node.exe apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es -> exit 1, 10/10/2026 18:44:01 through 10/10/2026 18:45:40. Exact original failure: Adaptive exact-host TTS matrix failed during adaptive exact-host profile selection [webdriver-condition-timeout]. Parent runner: Exact bilingual portfolio packaged matrix failed.
3. Ignored capture.ps1 before/after -> exit 0; Get-FileHash SHA256, git hash-object --path, exact porcelain status, HEAD/branch/index, optional-root presence, and safe process inventory. Final task executable/model interpreter process count 0. The runner's ordinary cleanup completed with no cleanup-failed message.

Process-local environment: existing Corepack shims prepended to PATH, COREPACK_ENABLE_NETWORK=0; VOXLEAF_EDGE_DRIVER_PATH points at existing tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe. HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1. All four existing configured profile groups were preserved: Piper ES and EN use services/tts/release/core/.venv/Scripts/python.exe and their respective models/tts/piper-1.4.2-{es_ES-davefx,en_US-joe}-medium-0d907f1 roots; Chatterbox uses services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe and models/chatterbox_multilingual_v3_v2; development Qwen uses services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe and models/qwen3_1_7b_customvoice_cuda. Corresponding ENABLED flags were 1. Existing runner configuration/firewall inspection passed sufficiently to enter the selected arm. No install, sync, download, firewall mutation, package activation/removal/repair, build, or second runtime attempt was performed. NODE_OPTIONS imported only the ignored preload (initially unset), inherited into the existing native-runner child.

Observed sequence (elapsed milliseconds from instrumented child preload):
- 1538: alternate discovery chose chatterbox-multilingual-v3-cuda-bf16-default-v4 while piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 was active. Compatibility compatible, language es. Initial optional state failed; pending status present; both input properties disabled=false but matches(:disabled)=true because ancestor fieldset disabled=true.
- 1556: alternate-ready predicate false while pending remained present.
- 2319, immediately before original click: pending absent, alternate input present and unchecked, disabled=false, matches(:disabled)=false, ancestor fieldset disabled=false. This proves the initial readiness wait finished; the diagnostic throttling did not separately log its true return.
- 2349, after original click: original result changed=true; pending present and ancestor fieldset disabled again. Active profile remained Piper ES.
- 2380: alternate-active predicate false.
- 2896: optional state confirming, pending absent, controls enabled, active profile still Piper ES, alternate unchecked. No later sampled state change until final capture.
- 91612: final pre-cleanup capture still confirming, compatible/es, pending absent and enabled controls, active Piper ES. Original runner reports webdriver-condition-timeout. Target-ready, target-active, inference/playback, and the six-rate matrix were never reached.

Diagnosis: high confidence in the immediate blocker. The harness can discover and click the compatible alternate, but the packaged optional-package selection gate does not install or select it. Normal-host inspection found current LocalAppData/com.voxleaf.desktop/tts/cb/3 absent and legacy cb/2 present before and after. The DOM transitioned to confirming, not installed, and active profile never changed. Static code explains this observed chain: createNarrationSettingsActions(false).selectProfile awaits optional.select and returns false unless state is installed; native select_at returns confirming when the current optional package is not installed. The existing alternate helper waits for active profile equality using a shared original 90,000 ms deadline. Thus hardware compatibility and configured development model paths do not satisfy packaged optional installation state. This reproduces a prerequisite mismatch in the alternate-profile switch before the Piper ES behavior under evaluation; it does not establish a Piper inference or PCM regression.

Evidence limits: diagnostic snapshot calls add read-only WebDriver round trips and may perturb timing; original methods are called once with unchanged arguments and their original results/exceptions are preserved. No original deadline, assertion, or poll loop was changed. Fixed snapshots are read at phase transitions, before/after click, at most once per 500 ms during polling, and immediately before original session cleanup, with duplicate payloads omitted. The exact internal native return was not independently intercepted; the causal explanation combines DOM observations and current source. This does not prove the reason for the initial failed optional state, validate legacy package content, or establish that installing a package would make the full campaign pass. No optional IPC commands were added for observation.

Diff scope: PASS. No tracked or untracked source/document/config/test/Git edits by the diagnostic; complete porcelain list unchanged. Only ignored diagnostic helper, JSON/JSONL, log, and report files were created. Existing accepted Unit1 and director evidence remain untouched.
Invariant review: PASS for bounded diagnostic preservation. Selection assertions, timeout, executable, model/environment identities, privacy, and source scope preserved. Actual campaign acceptance remains BLOCKED; unchanged PCM baseline and other arms remain unvalidated. Group F NOT RUN.
Test-integrity review: PASS. Original filtered runner and WebDriver/harness source unchanged; the preload wraps execute/deleteSession, delegates unchanged original calls, returns original results, rethrows original errors, and reads allowlisted DOM state only. No softened assertion, skipped alternate selection, or substituted acceptance result.
Privacy/artifact review: PASS. Added selection-events.jsonl contains fixed phases, elapsed times, booleans, known requested/alternate/active IDs, closed status/language values only; no full scripts, DOM, text, optional commands, paths, or raw errors. Existing runner.log contains its original application profile summaries/capacity and fixed failure output, no book text/audio. Optional cb/3 remains absent, cb/2 remains present; no task-native/model process remains. Logs stay ignored and are not publication artifacts.
Action required: preserve campaign BLOCKED and prior BASELINE-FAIL. Director must resolve the packaged alternate-profile prerequisite under a separately authorized decision before a fresh unchanged baseline. Existing developer Chatterbox paths alone are insufficient. No installation or harness correction is authorized by this diagnostic; no further retry is justified without changed prerequisite evidence. Unit1 acceptance remains bound to its original exact identities.

Raw evidence directory: tmp/evidence/desktop-source-organization/PIPER-ES-PROFILE-DIAG-01/ (before.json, after.json, optional-roots-before.json, selection-events.jsonl, runner.log, outcome.json, preload.mjs, capture.ps1). This report is immutable once issued; report generation helper is also ignored.

# Validation Report
Report ID: DESKTOP-PCM-01-BASELINE-03
Target ID: DESKTOP-PCM-01
Mode: BASELINE
Verdict: PASS
Environment: normal local PowerShell outside sandbox, repository root, PowerShell 7.6.5, Node v24.20.0, pinned pnpm 11.15.1 via existing Corepack shim with COREPACK_ENABLE_NETWORK=0. Every acceptance command ran require_escalated. NODE_OPTIONS unset before commands and after; no diagnostic preload. Existing Microsoft-signed matching EdgeDriver155.0.4283.45 selected process-locally. No source/harness/test, package installation, firewall, persistent-environment or Git changes by validator. The user-authorized normal-flow v3 installation and temporary exact installed-interpreter firewall block were completed by the director before this run.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: exact three-source-path PCM draft allowlist below.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/tts/pcm-playback.ts | `""` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `""` | ABSENT | ABSENT |

Identity recheck: PASS. Closed source identities, full HEAD, branch codex/desktop-source-organization, complete porcelain listing and empty index identical before/after. Existing PCM source clean; proposed new files ABSENT and not hashed. Supplemental preserved source/test/harness/frozen-file hashes unchanged, including accepted Unit1 and CSS; full evidence in before.json/after.json. Installed manifests/python, existing driver/developer interpreters, process-local offline/instrumentation state and exact firewall rules unchanged. All task native/model processes absent before and after. The release executable is an ignored generated build output, excluded from the validated source manifest: the authorized H command rebuilt it before every native/model arm. Its expected build-output change is explicitly recorded below and is not source drift or a refreshed prior acceptance hash.

Installation identity, unchanged before/after: current LocalAppData/com.voxleaf.desktop/tts/cb/3; runtime manifest schemaVersion2, packageVersion3, pythonPath runtime/python.exe, modelRoot models. The linked preparation record establishes normal-flow acquisition; the passing Chatterbox arms each independently reported optional state installed. Hash capture binds installed manifest and interpreter bytes; it is not an additional manual full-model rehash.

| Installed relative path | SHA-256 before = after |
| --- | --- |
| runtime-manifest-v3.json | 470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A |
| source-manifest-v3.json | F1EAE833B75625F290A94F06ABCB2CD70A39FFE23603D9FEC523999B8F0EB6D6 |
| runtime/python.exe | 4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A |

| Supplemental executable | SHA-256 before | SHA-256 after |
| --- | --- | --- |
| packaged-exe | 8343E0121E8D72D4E4A252D6F00DBAC24D2C4087C4B5E8ED33A98A338956F234 | 730AC25470E1E48F8D20F1983307A4A4F88FD498EB20E8F13A1201D81DC87C94 |
| matching-driver | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 |
| piper-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| developer-chatterbox-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| qwen-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |

Isolation: normalized exact-program host inspection verified enabled Outbound Block rules for all three distinct configured developer interpreters and the effective installed Chatterbox runtime. Installed rule Name VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary, Profile Any, applies only to current cb/3/runtime/python.exe. It remained enabled and unchanged at the final capture. The director's existing helper owns eventual removal; validator did not remove, replace or broaden any rule. Its announced safety deadline is 2026-10-10T23:15:44Z. Future validation must freshly verify the rule and install identities, especially after cleanup/deadline.

Process-local environment: HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1; all four approved profile ENABLED groups=1. Piper ES/EN interpreter services/tts/release/core/.venv/Scripts/python.exe, models respectively models/tts/piper-1.4.2-es_ES-davefx-medium-0d907f1 and models/tts/piper-1.4.2-en_US-joe-medium-0d907f1. Developer Chatterbox interpreter services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe and model root models/chatterbox_multilingual_v3_v2 remain configured; native supervisor selects verified installed v3 when available. Qwen interpreter services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe and model root models/qwen3_1_7b_customvoice_cuda. Existing driver path tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe. Ignored environment.ps1 preserves the exact assignment recipe; no persistent environment mutation.

Commands and outcomes:
- `pnpm.cmd build:packages` -> exit 0; 10/10/2026 19:17:08 to 10/10/2026 19:17:09; 01-build-packages.log.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0; 10/10/2026 19:17:09 to 10/10/2026 19:17:13; 02-desktop-typecheck.log.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 10/10/2026 19:17:13 to 10/10/2026 19:17:22; 03-desktop-test.log.
- `pnpm.cmd format:check:typescript` -> exit 0; 10/10/2026 19:17:22 to 10/10/2026 19:17:28; 04-format.log.
- `pnpm.cmd lint:typescript` -> exit 0; 10/10/2026 19:17:28 to 10/10/2026 19:17:39; 05-lint.log.
- `pnpm.cmd --filter @voxleaf/desktop build` -> exit 0; 10/10/2026 19:17:39 to 10/10/2026 19:17:40; 06-desktop-build.log.
- `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> exit 0; 10/10/2026 19:17:40 to 10/10/2026 19:56:04; 07-bilingual-portfolio.log.

1. Package build: shared and EPUB TypeScript builds pass; compiled dependencies available.
2. Desktop typecheck: TypeScript noEmit pass.
3. Desktop tests: 54 files / 588 Vitest tests and 38 Node tests pass, no Node failures/cancellations/skips. Deterministic player/backend and native-host-script assertions pass.
4. TypeScript formatting: all matched files conform.
5. TypeScript lint: eslint . passes.
6. Desktop production build: 184 modules transformed; unchanged worklet output incremental-wsola-v3-worklet-C8gQhKHK.js emitted. Existing large-chunk warning is nonfatal; no bundle-size improvement claimed.
7. Complete H command: actual global exit 0. Preflight38 Vitest tests/3 files,17 driver Node tests and5 portfolio Node tests pass; exact configuration/offline/interpreter-bound firewall preflight passes. Native release build succeeds in36.72s. Model-free lifecycle passes mount, bounded supervised fake-service delivery/cancellation/crash recovery, file boundaries/replacement, accessible keyboard reader/synchronization, local image decode, restored position/preferences and cleanup, with no errors/external requests. All six original arms then pass; no filtering, retries or skipped model arms substituted for this command.
8. git diff --check -> exit0 after commands, no whitespace issues; git diff --cached --quiet -> exit0 before/after. Ignored capture.ps1 before/after exits0 and verifies clean allowlist/index/isolation. A first shell-only after-comparison expression had a PowerShell parse error before any statement ran; corrected read-only expression succeeded. No acceptance/runtime command was repeated or altered.

Actual complete six-arm outcomes and measurements:

| Profile / language | Original arm result | Piper six-rate matrix | Quick command-to-audible ms | Underruns | Buffering wall ms | Cancellation ms |
| --- | --- | --- | --- | --- | --- | --- |
| piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 / es | PASS | PASS: 100,95,90,85,80,75 | 6076 | 0 | 0 | 327 |
| piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 / en | PASS | PASS: 100,95,90,85,80,75 | 5634 | 0 | 0 | 310 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4 / es | PASS | Not required; no exact matrix | 52351 | 0 | 0 | 283 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4 / en | PASS | Not required; no exact matrix | 42557 | 0 | 0 | 294 |
| qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8 / es | PASS | Not required; no exact matrix | 67205 | 1 | 109925 | 172 |
| qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8 / en | PASS | Not required; no exact matrix | 65253 | 1 | 87898 | 172 |

All four ADR-0051-required Piper/Chatterbox journeys PASS, both Piper six-rate matrices PASS, and full six-arm command PASS. Both Piper exact matrices also establish latest-selection-wins, first intentional activation wait750ms, recurring intentional wait p95300ms and recurring handoff overhead p950ms. All six arm reports show retainedUnits0, discardedUnits0, generatedAudioFiles0 at cleanup and externalRequests0; source-range validity, focus preservation, pause/resume boundary and stalePlaybackObserved=false hold. Complete structured original arm output is retained as arm-results.json and in the raw H log.

Performance limits: these are host observations, not a performance improvement or changed product acceptance. Piper ES/EN quick startup6.076/5.634s and Chatterbox ES/EN52.351/42.557s; all four required arms observed0 underruns and0 buffering wall time in their exercised windows. Qwen ES/EN passed the existing harness but each had1 underrun and buffering109.925/87.898s; recorded buffering-seconds-per-playback-minute410.78/133.54 and warmPreparedRtf1.93/1.97 exceed the MVP buffering target. Qwen's harness PASS does not establish MVP performance suitability or reverse ADR-0051 deferral. Qwen final checkpointAfterStop=false is retained in raw observations; no test assertion was relaxed. Chatterbox warmPreparedRtf1.10/1.09 is reported without broad performance claims.

Diff scope: PASS. Unit2 has no implementation patch: pcm-playback.ts unchanged, both new paths absent. Accepted three-file Unit1 patch remains untouched/unstaged; director-owned evidence documentation remains unrelated and unchanged throughout this baseline. No source writer/Git action occurred. Generated outputs arose solely from configured build/test commands and remain ignored.
Invariant review: PASS for applicable baseline. Existing facade/error constructor/export identities, lazy24kHz audio graph, bounded little-endian remaining-frame decode/device copy/WSOLA transfer, player progress/pause/resume/volume, reuse/release/stale disposal, callback eligibility and sequence, six-rate next-complete-unit activation, release-once/four-unit cleanup turns and cleanup observations remain unchanged and covered by deterministic tests. Fresh required host journeys exercise synchronization, cancellation, bounded retained/discarded units, cleanup, local inference and absence of generated audio files/external requests; both Piper exact rate matrices passed. Frozen WSOLA path/processor/URL authority remains untouched, and production build retains the worklet asset. This is a pre-change baseline, not proof of any future extraction. Subjective audio quality, arbitrary books/hardware, every possible scheduling trace and broader product performance are not established by these gates.
Test-integrity review: PASS. No test/harness/fixture authority/assertion/deadline/snapshot change, preload, filtered runner or retry. All seven prescribed commands executed once in the approved host environment. Prior baseline failure, prerequisite-blocked receipt and diagnostic remain immutable; this is a new report bound to the present source/environment.
Privacy/artifact review: PASS. Synthetic repository fixtures only; original content-safe runtime logs retained under ignored tmp. No private book text, audio, models, secrets, generated tracked files or unrelated files entered the diff. Successful native/model reports show no external requests and zero generated audio files; installed and configured interpreters remained covered by their verified outbound blocks. Final safe process inventory found zero task native/model processes and recorded no process command lines. No acquisition, optional-package removal or firewall action by validator.
Action required: none for this baseline. Director may freeze the unchanged approved PCM terms against this new baseline report; implementation/post-change validation remains required and is not authorized by tests alone. Preserve installed/runtime/isolation prerequisites and recapture them for post-change D/B/N/H. Do not remove the temporary rule while subsequent authorized tests are active; director owns its bounded cleanup. No staging/commit/push/PR or campaign completion is authorized by this report.

Evidence directory: tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-BASELINE-03/ (before.json, after.json, identity-comparison.json, versions.json, outcomes.jsonl, seven numbered command logs,08-diff-check.log, arm-results.json, environment.ps1, capture.ps1, run.ps1). Report immutable after issue; copy verbatim while validator is idle.

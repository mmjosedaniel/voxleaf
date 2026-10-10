# Validation Report

Report ID: DESKTOP-PCM-01-BASELINE-01

Target ID: DESKTOP-PCM-01

Mode: BASELINE

Verdict: BASELINE-FAIL

Environment: local PowerShell outside sandbox, repository root; PowerShell 7.6.5, Node v24.20.0, pinned pnpm 11.15.1 through the existing Corepack shim with COREPACK_ENABLE_NETWORK=0. Every acceptance invocation used require_escalated. The process-local VOXLEAF_EDGE_DRIVER_PATH selected the previously verified Microsoft-signed 155.0.4283.45 driver under tmp/native-rust-module-organization/webdriver-155.0.4283.45/, matching installed WebView2. Group H used HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1, all four documented profile enablement groups set to 1, and existing absolute paths resolved from the repository-relative roots below. No package sync, installation, download, firewall mutation, persistent environment change, source/harness edit or Git mutation occurred. All commands ran sequentially on 2026-10-10 from 18:22:35Z through 18:25:44Z, followed by identity/diff recheck. Raw evidence is under ignored tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-BASELINE-01/ (before.json, after.json, outcomes.jsonl, numbered command logs).

The native-only profile variables selected these existing documented roots:

| Profile group | Interpreter | Model root |
| --- | --- | --- |
| VOXLEAF_TTS_PIPER | services/tts/release/core/.venv/Scripts/python.exe | models/tts/piper-1.4.2-es_ES-davefx-medium-0d907f1 |
| VOXLEAF_TTS_PIPER_EN | services/tts/release/core/.venv/Scripts/python.exe | models/tts/piper-1.4.2-en_US-joe-medium-0d907f1 |
| VOXLEAF_TTS_CHATTERBOX | services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe | models/chatterbox_multilingual_v3_v2 |
| VOXLEAF_TTS_DEV | services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe | models/qwen3_1_7b_customvoice_cuda |

Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Validated paths:
- apps/desktop/src/tts/pcm-playback.ts
- apps/desktop/src/tts/pcm-playback-contracts.ts
- apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts

Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob ID |
| --- | --- | --- | --- |
| apps/desktop/src/tts/pcm-playback.ts | `""` | 2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD | bcbea041a9a5bfdf0d5acf47927c6b91f2b496db |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `""` | ABSENT | ABSENT |

Identity recheck: PASS. All three paths were clean before commands; the two additions remained absent and were not hashed. HEAD, exact statuses, existing worktree SHA-256/filter-aware blob, complete porcelain listing and empty index matched afterwards. Structured comparisons returned IDENTITY_MATCH=True and GLOBAL_STATUS_MATCH=True; git diff --cached --quiet exited 0 before and after. The accepted Unit 1 source hashes separately matched DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02 before and after. Identity commands were git status --porcelain=v1 --untracked-files=all -- <path>, Get-FileHash -Algorithm SHA256 -LiteralPath <existing path>, and git hash-object --path=<path> -- <existing path>.

Commands and outcomes:
1. `pnpm.cmd build:packages` -> exit 0. Shared and EPUB TypeScript builds passed, establishing compiled workspace dependencies. Raw log: 01-build-packages.log.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0. Desktop TypeScript no-emit check passed. Raw log: 02-desktop-typecheck.log.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0. All 54 files / 588 Vitest tests and 38 configured Node tests passed; Node failures/cancellations/skips were zero. Proves deterministic desktop and host-script assertions, not model-backed acceptance. Raw log: 03-desktop-test.log.
4. `pnpm.cmd format:check:typescript` -> exit 0. All configured matched files satisfy Prettier. Raw log: 04-format.log.
5. `pnpm.cmd lint:typescript` -> exit 0. Repository eslint . passed. Raw log: 05-lint.log.
6. `pnpm.cmd --filter @voxleaf/desktop build` -> exit 0. Vite transformed 184 modules; the production worklet asset remained incremental-wsola-v3-worklet-C8gQhKHK.js. Existing large-chunk warning remained nonfatal. Proves production bundling, not model-backed worklet playback. Raw log: 06-desktop-build.log.
7. `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> exit 1. This is the unchanged complete six-arm command. Its focused preflight passed 3 files / 38 Vitest tests, 17 driver Node tests and 5 portfolio Node tests; exact offline/configuration/interpreter-bound firewall preflight passed. Native release build completed in 23.30 seconds. The model-free packaged lifecycle matrix passed: mount, bounded fake-service binary delivery/cancellation/crash recovery, local-file boundaries/replacement, accessible keyboard reader and synchronization, image decode, restart/reselection position/preferences, cleanup, zero errors/external requests. The first model arm then failed during `adaptive exact-host profile selection [webdriver-condition-timeout]`; the runner printed `Exact bilingual portfolio packaged matrix failed.` and stopped. Raw log: 07-bilingual-portfolio.log. Arm outcomes are recorded below.
8. `git diff --check` -> exit 0 before and after commands. Final raw log: 08-diff-check.log.

Actual six-arm model-backed outcomes:

| Arm | Outcome | Piper six-rate matrix |
| --- | --- | --- |
| Piper Spanish / davefx | FAILED during profile selection: webdriver-condition-timeout; no completed model-arm acceptance | NOT RUN / no matrix result |
| Piper English / joe | UNRUN because runner stopped on first arm | NOT RUN |
| Chatterbox Spanish | UNRUN | Not applicable |
| Chatterbox English | UNRUN | Not applicable |
| Qwen Spanish / Serena | UNRUN | Not applicable |
| Qwen English / Aiden | UNRUN | Not applicable |

The initial selection diagnostic reported Piper Spanish compatible/selectable and active; that diagnostic did not establish completion of the later profile-selection condition. It also reported Piper/Chatterbox compatible and both Qwen profiles unavailable on the current free dedicated-memory reserve (5,838 MiB free, 7,810 MiB total). No Qwen arm executed, so this report assigns neither a Qwen arm failure nor success from that incidental compatibility output. Under ADR-0051, all four required Piper/Chatterbox arms and both Piper rate matrices are missing; scoped model-backed PASS is unavailable. The actual overall H exit remains 1.

Diff scope: PASS. Unit 2 has no patch: pcm-playback.ts is unchanged and both proposed new files remain absent. Index is empty. Previously accepted Unit 1 remains unchanged and unstaged. Director-owned active-plan and evidence Markdown changes were already present outside this disjoint allowlist and remained intact. No worker implementation, unrelated source change or prohibited file appeared.

Invariant review: PASS for baseline source/test review only; required model-backed evidence is missing. Reviewed the existing single PcmPlaybackError constructor and facade exports, backend interface, lazy 24-kHz context, little-endian bounded remaining-frame decode, source/device copy, WSOLA transfer, progress/pause/resume/volume behavior, one-node reuse/release and callback sequence checks. Existing deterministic tests assert FIFO transitions, progress throttling, release-once originals, stale suppression, four-unit cleanup turns, cleanup observation ordering, bounded volume/six-rate admission, next-complete-unit rate activation, exact 24-kHz constructor request, decoded remaining frames/device buffer, and WSOLA reuse/default-rate release. Player/coordinator/cancellation/synchronization owners and frozen authority remain unchanged. The WSOLA controller still owns its sibling worker URL; both frozen paths remain unchanged and production bundling emits the worklet. Model-backed cancellation, synchronization, cleanup, bounded playback and both Piper rate matrices are not validated by this run because profile selection failed first. Code inspection and passing deterministic tests cannot replace those required runtime checks. This failure predates any Unit 2 edit and is not a refactor regression.

Test-integrity review: PASS. No test, assertion, timeout, fixture authority, snapshot or harness changed. The complete configured desktop command and complete six-arm H command ran unchanged; no narrower substitute or skipped arm was presented as successful.

Privacy/artifact review: PASS. No source, dependency, configuration, generated tracked file, frozen authority, historical file, book, audio, model weight, secret or private user data entered the change set. Existing local model paths and interpreter-bound rules were used; no model acquisition or firewall action occurred. The runtime harness used repository-authored synthetic fixtures and content-safe diagnostics. Logs/captures remain ignored. The passed lifecycle gate reported zero external requests; no claim is made that uncompleted model arms passed their privacy checks.

Action required: Keep Unit 2 unimplemented and the campaign paused at this failed baseline. Diagnose the Piper Spanish profile-selection timeout in a separately bounded authorized investigation; do not repair source/harness, relax timeouts or install/sync runtimes inside this refactor. Any justified correction and retry requires a new baseline report with fresh identities and all seven required commands. No Unit 2 Approved Work Order or Unit 3 progression is authorized by this report. Preserve this immutable baseline failure and accepted Unit 1 separately.

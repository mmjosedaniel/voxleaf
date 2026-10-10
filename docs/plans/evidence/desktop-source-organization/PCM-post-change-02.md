# Validation Report
Report ID: DESKTOP-PCM-01-POST-CHANGE-02
Target ID: DESKTOP-PCM-01
Mode: POST-CHANGE
Verdict: PASS
Environment: normal local PowerShell outside sandbox, repository root; PowerShell7.6.5, Node v24.20.0, pinned pnpm11.15.1 through existing Corepack shim, COREPACK_ENABLE_NETWORK=0. All acceptance commands require_escalated. Matching EdgeDriver155.0.4283.45 and existing offline models/interpreters retained. NODE_OPTIONS unset throughout; no preload. New full attempt explicitly authorized by PCM-native-environment-diagnosis-01.md; prior failed report remains immutable.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: exact DESKTOP-PCM-WORK-01 three-source-path allowlist below; supplemental outputs are not allowlist additions.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/tts/pcm-playback.ts | ` M apps/desktop/src/tts/pcm-playback.ts` | 9D73CB124A89B447EC69B2A850A9B14357121D0050FF5F86831CE7AB753974A2 | 64d0bdb054401ade707d9cab2e9db2ba7d3d83d0 |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `?? apps/desktop/src/tts/pcm-playback-contracts.ts` | B45856D7F5DD8A5BBD0FE86DB8DAC2BFDA75E26B646BE2FD5CFC5B2316324418 | a5b74edad0c94581b5dc79baff33781f5f7a0130 |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `?? apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` | A6CF4F3A7E727A23737EDCB4E898F6DFFEF98461F4959F52C9D83E4CDD408FB2 | fcc6fc5088d78ea4c5ff26249287aea818a85ffe |

Identity recheck: PASS. Full HEAD, branch codex/desktop-source-organization, three exact source statuses/hashes/filter-aware blobs, complete porcelain list and empty index identical before/after. Current patch also matched POST-CHANGE-01 before execution; no source correction occurred between attempts. Preserved Unit1/CSS/tests/harness/frozen WSOLA/authority hashes unchanged. Installed manifests/interpreter, existing driver/developer interpreters, exact firewall rules and uninstrumented environment identities unchanged. Native/model process count0 before/after. Full structured evidence: before.json, after.json, identity-comparison.json.

Environment distinction: standalone N ran the unchanged pnpm.cmd test:native-startup command in a fresh pwsh -NoProfile subprocess with exactly the twelve requiredEnvironment keys from the existing BILINGUAL_PORTFOLIO_ARMS removed. The key set was independently read from that existing module and compared with native-environment.json; presentKeyCount0. These are ENABLED/PYTHON/MODEL_ROOT for PIPER, PIPER_EN, CHATTERBOX and DEV. Driver/PATH/Corepack/HF_HUB_OFFLINE=1/TRANSFORMERS_OFFLINE=1 remained. H separately restored the original baseline03 full-profile recipe and ran the complete original command. No source/harness/assertion/timeout change, filtering or silent retry. This corrects the diagnosed ambient model flags selecting an exact child for the standalone fake-service probe; the original N failure remains recorded in POST-CHANGE-01.

The full H recipe preserves Piper ES/EN services/tts/release/core/.venv/Scripts/python.exe and models/tts/piper-1.4.2-{es_ES-davefx,en_US-joe}-medium-0d907f1; developer Chatterbox services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe and models/chatterbox_multilingual_v3_v2; Qwen services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe and models/qwen3_1_7b_customvoice_cuda. All four ENABLED flags1. Native Chatterbox prefers the verified installed package. Existing process-local driver override selects tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe. Exact recipe retained in ignored environment.ps1.

Installed current package: LocalAppData/com.voxleaf.desktop/tts/cb/3, runtime manifest schemaVersion2/packageVersion3, runtime/python.exe and models. Both native Chatterbox arms report installed. Direct identity capture binds manifest/interpreter bytes, not an additional manual model-file rehash.

| Installed relative path | SHA-256 before = after |
| --- | --- |
| runtime-manifest-v3.json | 470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A |
| source-manifest-v3.json | F1EAE833B75625F290A94F06ABCB2CD70A39FFE23603D9FEC523999B8F0EB6D6 |
| runtime/python.exe | 4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A |

| Supplemental executable | SHA-256 before | SHA-256 after |
| --- | --- | --- |
| packaged-exe | BA6043B9442D8AD9A4213473887ADB325F70D95EC45AD4691D92E69CCEEE3421 | 5AD0090F81F995E590F960C85C627FBFABAEE1BD9D0EAD18EB73D358BCDB2861 |
| matching-driver | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 |
| piper-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| developer-chatterbox-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| qwen-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |

N/H rebuild the ignored release executable before runtime checks; any output-hash change is the configured build result, excluded from the validated source identity manifest. Runtime input interpreters/driver remain unchanged. Exact enabled Outbound Block rules cover all configured developer interpreters and installed cb/3/runtime/python.exe. Installed rule VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary remains enabled, Profile Any, exact program, unchanged before/after. Validator made no firewall action. Director helper owns removal and announced23:15:44Z safety deadline; future model validation must freshly verify isolation after any cleanup/deadline.

Commands and outcomes:
- `pnpm.cmd build:packages` -> exit0; 10/10/2026 20:08:46 to 10/10/2026 20:08:47; 01-build-packages.log.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit0; 10/10/2026 20:08:47 to 10/10/2026 20:08:50; 02-desktop-typecheck.log.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit0; 10/10/2026 20:08:50 to 10/10/2026 20:08:58; 03-desktop-test.log.
- `pnpm.cmd format:check:typescript` -> exit0; 10/10/2026 20:08:58 to 10/10/2026 20:09:03; 04-format.log.
- `pnpm.cmd lint:typescript` -> exit0; 10/10/2026 20:09:03 to 10/10/2026 20:09:08; 05-lint.log.
- `pnpm.cmd --filter @voxleaf/desktop build` -> exit0; 10/10/2026 20:09:08 to 10/10/2026 20:09:09; 06-desktop-build.log.
- `pnpm.cmd test:browser` -> exit0; 10/10/2026 20:09:09 to 10/10/2026 20:09:21; 07-browser.log.
- `pnpm.cmd test:native-startup` -> exit0; 10/10/2026 20:09:21 to 10/10/2026 20:09:59; 08-native.log.
- `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> exit0; 10/10/2026 20:09:59 to 10/10/2026 20:46:51; 09-bilingual-portfolio.log.

All nine prescribed commands PASS. D builds workspace packages, checks desktop types, passes54 files/588 Vitest and38 Node tests, formatting/lint and production build. Production build transforms186 modules; existing large-chunk warning remains nonfatal. B passes all7 Chromium tests in10.9s (locator geometry, EPUB/NCX local boundary, oversize rejection, restoration/reflow/preferences/zoom, keyboard/narrow layout and synchronization/focus). N release build23.31s then complete packaged smoke PASS: bounded protocol, supervised fake-service delivery/cancellation/crash recovery, local file boundaries/replacement, reader/accessibility/synchronization, local image decode, persisted position/preferences and cleanup; no errors/external requests.

H actual complete six-arm global exit0. Focused preflight38 Vitest/3 files,17 driver Node tests and5 portfolio Node tests PASS; exact environment/firewall preflight PASS. Native release build22.90s, separate model-free lifecycle PASS, then all6 original model arms PASS. No filtered substitute or unrun arm. All four ADR-0051-required Piper/Chatterbox arms and both Piper six-rate matrices complete.

| Arm | Harness outcome | Piper exact matrix | Quick startup ms | Underruns | Buffering wall ms | Buffering seconds/playback minute | Cancellation ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 / es | PASS | PASS:100,95,90,85,80,75 | 5428 | 0 | 0 | 0 | 796 |
| piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 / en | PASS | PASS:100,95,90,85,80,75 | 4921 | 0 | 0 | 0 | 686 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4 / es | PASS | Not required | 44414 | 0 | 0 | 0 | 281 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4 / en | PASS | Not required | 41119 | 0 | 0 | 0 | 280 |
| qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8 / es | PASS | Not required | 53852 | 1 | 85177 | 285.78 | 172 |
| qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8 / en | PASS | Not required | 67010 | 1 | 98698 | 156.09 | 170 |

Each arm reports final retainedUnits0, discardedUnits0, generatedAudioFiles0 and externalRequests0. All preserve range validity, focus, pause/resume boundary and stalePlaybackObserved=false. Both Piper matrices include all six rates, latestSelectionWins=true, first intentional wait750ms, recurring intentional wait p95300ms and handoff overhead p950ms. Full original structured observations retained in arm-results.json and09-bilingual-portfolio.log.

Performance limits: this is behavior-preserving refactor evidence, not improved performance or Qwen product approval. The four required arms observed no underruns/buffering in exercised windows; Chatterbox still has substantial startup latency. Qwen arms can pass this existing harness while their measured buffering exceeds the MVP target; retain the actual measurements above and ADR-0051 deferral. No acceptance threshold was weakened. Host/hardware variability, arbitrary books, subjective audio quality and every possible scheduler trace are not established by this finite suite.

Supplemental final built assets, captured after H from apps/desktop/dist/assets:

| Asset path | Bytes | SHA-256 |
| --- | --- | --- |
| apps/desktop/dist/assets/incremental-wsola-v3-worklet-C8gQhKHK.js | 3306 | B9C83DC4DF9F567355574011890985A727F0AA20B51C43EEF8721DDF9C782A52 |
| apps/desktop/dist/assets/index-B0fx3AxN.js | 1025324 | 90674E0969BC34A0E113E2A9A86B4595B9EB3E511B85452BC7181561207A7711 |
| apps/desktop/dist/assets/index-N6B5ULJr.css | 26840 | 56C75AD24E3919833B7FDA80F88CDE36833FADF9EE1A9A00ED7D562C99AF4743 |

The WSOLA worklet retains incremental-wsola-v3-worklet-C8gQhKHK.js; its source URL ownership and frozen path remain unchanged. These output hashes support later comparison only. They do not automatically authorize reusing H after source/config/environment changes or replace any final campaign gate.

Diff scope: PASS. Exactly three ordered source files,801 combined changed lines (+415/-386), under850 ceiling. Independent complete-file/diff review and exact LF-normalized comparison against baseline HEAD establish contracts verbatim, retained AdaptivePcmPlayer body verbatim and complete backend/private definitions/comments verbatim. Only import/reexport glue changed. No worker edits to tests, scheduler/coordinator, frozen authority/WSOLA, config/dependencies/lockfiles/CSP/generated sources or accepted Unit1. Director-owned documentation remains unchanged during validation.
Invariant review: PASS. One neutral PcmPlaybackError constructor is directly imported/reexported, preserving identity/codes/message; facade public paths remain compatible. Backend uses neutral contracts and sibling WSOLA with no facade cycle; rate import in contracts is type-only. Player state/timers/tokens/callbacks/catches/cleanup are exact. Lazy24kHz graph, bounded little-endian remaining-frame decode/device copy/transfer list, source progress/pause/resume/volume, source/effective durations, one-handle/context/gain/node reuse, preparation tokens/stale disposal/default-rate release, callback sequence eligibility, six-rate next-unit policy, release-once/four-unit cleanup turns and waitForCleanup remain unchanged. Deterministic assertions exercise these paths, browser/native gates retain reader/location/focus synchronization, and fresh required model journeys/rate matrices validate the affected runtime. Frozen worklet architecture and production emission intact; no topology/trust/persistence change requires a system-diagram edit.
Test-integrity review: PASS. No tests/assertions/timeouts/snapshots/fixtures/frozen authority changed. All nine exact commands reran once in this separately authorized attempt. The only environment correction is the documented existing model-free key sanitation for N; H retains its full configuration. Source-correction cycles0; previous failure not overwritten or reclassified as a pass.
Privacy/artifact review: PASS. Repository synthetic fixtures and content-safe logs only; no private book/audio/model/secret payload or unrelated generated tracked file entered the diff. Runtime results show no external requests or persisted generated audio; exact interpreter blocks remained. No install/download/removal/firewall/persistent-environment/Git mutation by validator. Final safe inventory0 task native/model processes, no command lines logged. Raw logs, helpers and runtime asset identities stay ignored.
Action required: none for Unit2 post-change acceptance at these exact identities. Director may accept this bounded unit; later units/final campaign gates remain separate. No staging, commit, push, PR or campaign completion is authorized. Temporary-rule cleanup remains director-owned after authorized tests finish.

Additional checks: git diff --check exit0 before/after, empty index before/after; static-proof.json records all extraction checks true and801 lines. Report/evidence under ignored tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-POST-CHANGE-02/. Includes before/after.json,versions.json,outcomes.jsonl,nine numbered command logs,10-diff-check.log,static-proof.json,native-environment.json,native-policy-keys.json,identity-comparison.json,arm-results.json,built-assets.json and exact ignored helper scripts. This report is immutable once issued; director may copy verbatim while validator is idle.

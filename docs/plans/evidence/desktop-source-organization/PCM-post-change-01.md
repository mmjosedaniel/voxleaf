# Validation Report
Report ID: DESKTOP-PCM-01-POST-CHANGE-01
Target ID: DESKTOP-PCM-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: normal local PowerShell outside sandbox, repository root; PowerShell 7.6.5, Node v24.20.0, pinned pnpm11.15.1 through existing Corepack shim, COREPACK_ENABLE_NETWORK=0. All acceptance invocations require_escalated. Existing matching EdgeDriver155.0.4283.45; NODE_OPTIONS unset, no preload. Baseline03 process-local recipe preserved HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1 and four configured profile groups. Installed v3 optional runtime and exact temporary outbound block verified before/after. No retries, filtered model run, installations, firewall/Git mutations or source/harness changes by validator.
Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5
Validated paths: exact three-path DESKTOP-PCM-WORK-01 allowlist below.
Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/tts/pcm-playback.ts | ` M apps/desktop/src/tts/pcm-playback.ts` | 9D73CB124A89B447EC69B2A850A9B14357121D0050FF5F86831CE7AB753974A2 | 64d0bdb054401ade707d9cab2e9db2ba7d3d83d0 |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `?? apps/desktop/src/tts/pcm-playback-contracts.ts` | B45856D7F5DD8A5BBD0FE86DB8DAC2BFDA75E26B646BE2FD5CFC5B2316324418 | a5b74edad0c94581b5dc79baff33781f5f7a0130 |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | `?? apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` | A6CF4F3A7E727A23737EDCB4E898F6DFFEF98461F4959F52C9D83E4CDD408FB2 | fcc6fc5088d78ea4c5ff26249287aea818a85ffe |

Identity recheck: PASS. Closed source manifest, HEAD, branch codex/desktop-source-organization, full porcelain list and empty index unchanged before/after. Preserved Unit1/CSS/tests/harness/frozen WSOLA/authority source hashes unchanged from baseline03; the three current allowed PCM hashes were captured freshly and remained identical throughout this attempt. Installed manifest/interpreter hashes, other interpreter/driver hashes, all exact isolation rules and uninstrumented environment state unchanged. Native/model process inventory0 before/after. Source identities are immutable evidence for this failed patch; passing D/B does not authorize it.

Installed package root identity: LocalAppData/com.voxleaf.desktop/tts/cb/3, unchanged manifest-selected runtime/python.exe and models. Manifest/interpreter identity capture is not a separate full model-file rehash.

| Installed relative path | SHA-256 before = after |
| --- | --- |
| runtime-manifest-v3.json | 470EC7E8A6FA1E91F9831E42DE7988249220B51D4ECD4352452F3C70B2B6084A |
| source-manifest-v3.json | F1EAE833B75625F290A94F06ABCB2CD70A39FFE23603D9FEC523999B8F0EB6D6 |
| runtime/python.exe | 4D6F5F81A4BCA11191C4C7C6B43632694D0A4CE74E068619D8FDC161D469859A |

| Supplemental executable | SHA-256 before | SHA-256 after |
| --- | --- | --- |
| packaged-exe | 730AC25470E1E48F8D20F1983307A4A4F88FD498EB20E8F13A1201D81DC87C94 | BA6043B9442D8AD9A4213473887ADB325F70D95EC45AD4691D92E69CCEEE3421 |
| matching-driver | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 | DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892 |
| piper-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| developer-chatterbox-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |
| qwen-python | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 | 0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14 |

The ignored packaged executable was rebuilt by the prescribed N command before its failed runtime check, so its output hash changed as expected for the current patch; it is excluded from the validated source manifest. Other executable inputs did not change. The temporary installed-interpreter rule VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary remained enabled Outbound Block, Profile Any, exact current cb/3/runtime/python.exe; developer interpreter blocks also remained verified. No rule was removed or mutated. Director helper owns cleanup and the announced2026-10-10T23:15:44Z safety deadline; this run ended before that deadline.

Commands and outcomes:
- `pnpm.cmd build:packages` -> exit 0; 10/10/2026 20:03:55 to 10/10/2026 20:03:56; 01-build-packages.log.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0; 10/10/2026 20:03:56 to 10/10/2026 20:04:00; 02-desktop-typecheck.log.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 10/10/2026 20:04:00 to 10/10/2026 20:04:08; 03-desktop-test.log.
- `pnpm.cmd format:check:typescript` -> exit 0; 10/10/2026 20:04:08 to 10/10/2026 20:04:15; 04-format.log.
- `pnpm.cmd lint:typescript` -> exit 0; 10/10/2026 20:04:15 to 10/10/2026 20:04:24; 05-lint.log.
- `pnpm.cmd --filter @voxleaf/desktop build` -> exit 0; 10/10/2026 20:04:24 to 10/10/2026 20:04:26; 06-desktop-build.log.
- `pnpm.cmd test:browser` -> exit 0; 10/10/2026 20:04:26 to 10/10/2026 20:04:39; 07-browser.log.
- `pnpm.cmd test:native-startup` -> exit 1; 10/10/2026 20:04:39 to 10/10/2026 20:05:44; 08-native.log.
- `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> NOT RUN: execution stopped on the required N failure. No global H exit or model-arm result exists for this attempt.
- `git diff --check` -> exit0 before/after; `git diff --cached --quiet` -> exit0 before/after. Ignored capture/static-proof helpers exit0.

D results: all six prescribed commands PASS. Workspace TypeScript builds, desktop noEmit,54 files/588 Vitest tests and38 Node tests, formatting and lint succeed. Production build transforms186 modules and emits unchanged worklet asset incremental-wsola-v3-worklet-C8gQhKHK.js; existing large-chunk warning is nonfatal. Two extra modules correspond to the ordered extraction, not a bundle-size improvement claim.
B result: seven Chromium tests PASS in11.2s, covering active locator geometry, EPUB2/NCX local boundary, oversized-chapter rejection, reflow/restoration/preferences/zoom, narrow keyboard navigation and synchronization decoration/focus.
N result: release build succeeds in34.78s; actual command exit1. Exact original content-safe failure:

`Native startup smoke failed during native TTS service lifecycle completion [tts-service-lifecycle-probe-failed].`

The root pnpm wrapper reports recursive run failure and lifecycle exit1. Log08-native.log retains this unmodified output. No cleanup-failed message occurred; safe after-inventory reports0 native/model processes. No second runtime attempt was performed.

Failure evidence boundary: native-startup-smoke.mjs::exerciseNativeTtsServiceLifecycle reached its completion stage. Its unchanged final assertion requires status complete, normalPayloadBytes19,200, normalSampleCountSamples4,800, cancellationCode tts-service-cancelled, finalState stopped and retainedAudioUnits0. At least one completion requirement failed, but the current original log does not print the returned observation, individual predicate, or nested failed-probe code. The code deletes the temporary page observation before asserting; no missing values are invented. This is a fixed assertion failure, not the previously diagnosed webdriver-condition-timeout or session-driver mismatch.

Cause is not established by this report. The three changed implementation bodies are verbatim, and the failing lifecycle/protocol harness is unchanged; these facts narrow scope but do not prove an environmental cause or exclude a regression. Baseline03's successful model-free lifecycle ran inside H, whose lifecycle-only path explicitly strips model profile variables. This standalone N invocation used the approved baseline03 recipe with those process-local variables present. That concrete environment difference is a possible diagnostic lead, not a demonstrated cause and not permission to rerun with altered conditions. No fixture/harness repair, relaxed assertion, or rollback is indicated solely by the available log.

Post-change H outcomes: Piper Spanish, Piper English, Chatterbox Spanish, Chatterbox English, Qwen Spanish and Qwen English all UNRUN; both Piper six-rate matrices NOT RUN. Baseline03's six-arm PASS remains historical pre-change evidence and cannot replace these missing post-change gates. ADR-0051 scoped post-change PASS and full command PASS are unavailable.

Diff scope: PASS. Independently read frozen order/change packet, actual facade diff and both complete new files. Three files,801 combined changed lines (+415/-386), below850 ceiling. All changes are the ordered extraction, imports and direct reexports. No other source/test/config/dependency/lockfile/CSP/authority/generated/manual edit found; prior accepted Unit1 unchanged. Director documentation remains unrelated and stable.
Invariant review: PASS for static/deterministic/browser evidence only; native/model acceptance fails/is incomplete. Exact LF-normalized block comparison against HEAD confirms contracts verbatim, complete retained AdaptivePcmPlayer body verbatim and full backend/private declarations/comments verbatim. One PcmPlaybackError class remains, imported and directly reexported by facade; no wrapper constructor. Neutral module has type-only rate import; backend imports contracts, authorities and sibling WSOLA with no facade cycle. Frozen worklet URL/path stays in the unchanged WSOLA owner. Thus the eleven ordered invariants' error contracts, player timers/tokens/cleanup, lazy24kHz graph, little-endian bounded decode/copy/transfer, progress/rate/volume, reuse/stale disposal, callbacks/sequences, six deferred rates and four-unit cleanup logic are structurally unchanged. Existing deterministic assertions exercise these behaviors; browser checks pass synchronization/focus/reader boundaries. Fresh required native/model lifecycle evidence is still missing, so unit acceptance is FAIL regardless of static equivalence.
Test-integrity review: PASS. Tests and harnesses unchanged; no assertion, timeout, snapshot, fixture, generated authority or filter changed. All invoked configured commands ran exactly once on the host; H was not silently replaced. static-proof.json records independent extraction comparison rather than a new production test.
Privacy/artifact review: PASS for executed scope. No prohibited book, audio, model weight, secret/private payload, dependency or generated tracked file entered the diff. Content-safe logs and temporary helpers remain ignored. Original native gate stopped before its full successful privacy/lifecycle conclusion; that uncompleted result is not presented as a pass. No installed package, firewall or persistence repair occurred. Safe process inspection recorded no command lines and found no residual task native/model child.
Action required: keep Unit2 unaccepted and Unit3 blocked. Director should authorize a bounded diagnosis of the failing native service lifecycle result/environment to identify the failed completion predicate before prescribing a correction. Preserve this failure and exact patch; no automatic source/harness fix or retry. Any authorized correction/environment normalization requires a new immutable post-change report with all prescribed D/B/N/H commands and fresh identities; never refresh this failed receipt's hashes. Temporary-rule cleanup remains director-owned after the next-action decision. No Git action is authorized.

Evidence directory: tmp/evidence/desktop-source-organization/DESKTOP-PCM-01-POST-CHANGE-01/ (before.json,after.json,identity-comparison.json,versions.json,outcomes.jsonl,static-proof.json,01 through08 logs,10-diff-check.log,environment.ps1,capture.ps1,static-proof.ps1,run.ps1). Report immutable once issued; director may copy verbatim while validator is idle.

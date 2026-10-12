# APPS-NATIVE-01 audit, baseline and approved order

Date: 2026-10-12. This receipt records current execution evidence, not approval
of a future patch. No staging, commit, branch/base change, push or PR is authorized.

## Accepted Audit Packet

Target ID: APPS-NATIVE-01. Decision: CHANGE. Risk: high.

The independent `clean_code_auditor` read the complete current executable and
its direct collaborators. Resource calculations, log classification and sampler
draining/failure propagation cannot currently be tested by importing their owner
without launching its top-level Windows lifecycle. Reader and TTS scenarios
share those observations while process/session/fixture ownership belongs in the
entry. This is a responsibility and testability improvement, not a runtime bug
or performance claim. Existing five Node suites are explicitly enumerated.

Read-only collaborators: `native-webdriver-client.mjs` and its Node suite,
`native-smoke-invariants.mjs`, `adaptive-tts-profile-selection.mjs`, and
`bilingual-portfolio-host.mjs` and its suite. Existing external callers retain
the entry path: package scripts, portfolio runner,
`ordinary-chatterbox-release-host.mjs` (`runBilingualSmoke`) and
`tts-adapter-layout-host.mjs` (`desktop`).

## Validation Report

Report ID: APPS-NATIVE-01-BASELINE-01

Target ID: APPS-NATIVE-01. Mode: BASELINE. Verdict: PASS.

Environment: normal local PowerShell outside sandbox (`require_escalated`),
PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1 via existing Corepack shims.
Global pnpm 11.25.0 was not used. Existing documented models/interpreters and
process-only enablement/offline variables were used; no install, download or
firewall change. Commands ran from 18:17:12Z through 18:39:51Z.

Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

Validated paths and identities (identical before/after):

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware index blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | Empty | `7238E6807B3D832F810F6811AB3E4B15D567969F91D89012FB2A41E1A0F7E4AC` | `2e502ceb4eecdbab0d301cbdcdddc571b859f94a` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | Empty | ABSENT | ABSENT |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | Empty | ABSENT | ABSENT |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | Empty | ABSENT | ABSENT |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | Empty | ABSENT | ABSENT |
| `apps/desktop/package.json` | Empty | `52F30BF20748028FF3E9DD97A197C4193CBE6572AEA3AEA3D4A4BD86A123C3D7` | `e0aad3012a5902bb274e0230e47998c43af8d541` |

Identity recheck: PASS. Index empty before and after. Diff scope, baseline
invariant, test-integrity and privacy/artifact reviews: PASS. The director's
active-plan progress edit was outside the closed source allowlist. The canonical
diagram remains applicable. Action required: none before issuing the order.

### Commands and outcomes

All commands below ran from the repository root and exited zero.

1. `pnpm.cmd build:packages`: shared and EPUB builds passed.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
3. `pnpm.cmd --filter @voxleaf/desktop test`: 57 Vitest files / 661 tests and 51 Node tests passed.
4. `pnpm.cmd format:check:typescript`: passed.
5. `pnpm.cmd lint:typescript`: passed.
6. `pnpm.cmd test:native-startup`: release build, packaged root, model-free protocol/service lifecycle, ingress, accessibility, synchronization, Blob rendering, restart/restoration and replacement cleanup passed; no errors/external requests.
7. `pnpm.cmd benchmark:reader:native`: exact 10,000-block and six-cycle resource matrix passed; target ready 299 ms, append 356.3 ms, reflow 107.9 ms. Final Blob URLs and both observer counts zero; closed DOM delta 0, heap growth 562,952 bytes, working-set growth 6,758,400 bytes.
8. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`: 39 Vitest, 17 driver and 5 portfolio tests passed.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`: Spanish/profile switch/six-rate matrix passed; quick audible 4,989 ms, cancellation 584 ms.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: English/profile switch/six-rate matrix passed; quick audible 4,396 ms, cancellation 761 ms.
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`: Spanish and English passed; quick audible 42,067/39,037 ms, cancellation 297/282 ms. Both checked rate presentation; full six-rate transitions are exercised by Piper only, as configured by the unchanged runner.
12. `git diff --check`: passed.

All four model arms observed approximately one minute of stable playback and
reported zero underruns, buffering, stale playback, generated audio files,
external requests and retained/discarded cleanup units. Chatterbox GPU usage
returned to the 69-MiB baseline after both arms. These are exact-host baseline
observations, not universal performance or subjective quality claims. Qwen
model-backed branches remain unrun/deferred under ADR-0051.

Raw captures and identity manifests are ignored under
`tmp/evidence/apps-organization-follow-up/APPS-NATIVE-01-BASELINE-01/`.

## APPROVED WORK ORDER

Target ID: APPS-NATIVE-01

Goal: separate native resource observations and TTS/reader scenario owners from
the executable while preserving all behavior. Risk: high.

Allowed files: exactly the six paths in the baseline manifest above.

Required edits:

1. Extract to `native-smoke/resource-observation.mjs`: `executeText`, `rounded`,
   `percentile95`, `generatedAudioFileCount`, `memoryDelta`,
   `processWorkingSetBytes`, `nativeMemorySnapshot`, `nvidiaSnapshot`,
   `waitForAdaptiveResourceCleanup`, `startAdaptiveResourceSampler`,
   `installNativeResourceInstrumentation`, `nativeResourceInstrumentation`,
   `isLocalApplicationUrl`, `inspectPerformanceLogs`.
2. Extract to `native-smoke/tts-scenarios.mjs`:
   `installAdaptiveSynchronizationInstrumentation`, `currentAdaptiveHighlightMarker`,
   `forbidAdaptiveHighlightKey`, `adaptiveSynchronizationObservation`,
   `adaptiveReaderExperienceObservation`, `prepareParagraphLeafForInteraction`,
   `paragraphLeafActivationDelivered`, `adaptiveActiveHighlightPerceivability`,
   `assertAdaptiveActiveHighlightPerceivable`, `stopAdaptiveSynchronizationInstrumentation`,
   `waitForAdaptivePlaying`, `adaptivePlaybackRateObservation`,
   `selectAdaptivePlaybackRate`, `waitForAdaptivePlaybackRateBoundary`,
   `exerciseAdaptivePlaybackSpeedMatrix`, `observeAdaptiveDepletionOrStablePlayback`,
   `runAdaptiveTtsExactHostMatrix`, `selectAdaptiveTtsProfile`,
   `selectNarrationLanguage`, `exerciseNarrationLanguagePreference`,
   `exerciseNativeTtsProtocolProbe`, `exerciseNativeTtsServiceLifecycle`.
3. Extract to `native-smoke/reader-scenarios.mjs`:
   `nativeReaderInteractionObservation`, `runNativeReaderInteraction`,
   `observeSavedPositionRestoration`, `exerciseNativeReaderInteractionMatrix`,
   `exerciseNativeSynchronizationFeasibility`, `beginNativeRenderInstrumentation`,
   `finishNativeRenderInstrumentation`, `replaceNativePublicationForCleanup`,
   `runNativeReaderPerformanceBenchmark`.
4. Retain entry-owned CLI, all named constants/thresholds, failure map and
   `failureCode`, `assert`, executable/root resolution, fixture creation,
   ports/processes/driver readiness/sessions/restarts, inline run ordering/reporting,
   `stopChild`, `run`/`await run`, and final cleanup. Retain settings/contents
   interactions, shared `waitForCondition`, file-ingress functions and
   `exerciseNativeTtsSupervisorHost`. Helpers receive only consumed named
   capabilities/resolved configuration; no whole entry-state bag, generic
   harness framework, mutable singleton, duplicate authority or deeper-root
   recomputation. Reuse existing read-only helpers. Scenario modules cannot
   import each other or the executable.
5. Add controlled-dependency tests in `native-smoke.node-test.mjs` for calculation
   boundaries, malformed performance logs, local/external URL classification,
   immediate/timed sampler behavior, stop-time draining and failure propagation,
   representative polling/retry failures, and inert helper imports. Test real
   behavior, not export/line counts. Injection is limited to needed boundary
   clocks/timers/delay/subprocess/filesystem/driver capabilities with unchanged
   production defaults. Do not import the executable or enlarge its shared wait
   helper solely for testing. Append the suite once to the existing `test` list.

Behavior invariants: preserve function names/bodies except narrow dependency
plumbing; every assertion, selector/script, message, fixed failure code, report
field, threshold, deadline, poll interval, retry count, scenario order, CLI flag,
profile/language gate and root. Preserve sampler immediate/5,000-ms sampling,
unref, clear/drain/remembered-failure sequence, scenario-local finally disposal,
session/restart/final cleanup owners, cancellation/stale rejection, memory/queue
bounds, stable locators, focus/selection and visual/audible/persisted sync.
Playback-only pause may continue same-identity bounded generation; explicit
stop/invalidating actions cancel it. Preserve privacy/local inference and no
default audio persistence. Imports do not parse CLI, create fixtures/processes,
sample hardware, start timers or emit results.

Forbidden changes: outside allowlist; behavior/public contracts/dependencies/
lockfiles/Rust/Python/CI; entry lifecycle relocation; existing collaborator or
assertion changes; generated/frozen/historical/completed-plan changes; Qwen
removal/promotion/claimed repair; host changes/downloads to bypass gates; Git
mutations or a second writer.

Diff ceiling: six paths; at most 10,500 added-plus-removed lines including
relocation, and 700 non-relocation wiring/test/dependency-parameter lines. Stop
and request a revised order if exceeded.

Baseline evidence: APPS-NATIVE-01-BASELINE-01, PASS, immutable manifest above.

Worker validation: none. The independent validator owns all checks. The worker
may perform narrowly scoped formatting as part of authoring only on allowed
paths using the existing formatter outside sandbox; no broad format operation.

Acceptance commands: exactly commands 1-11 above, plus `git diff --check` and
independent static comparison of assertions/reports/thresholds/messages/scenario
order/cleanup/dependencies; desktop test must run the new suite once. Package/
combined final checks remain separate section 8 requirements.

Completion output: Change Packet only; no staging, commit, push or PR.

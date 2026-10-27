# Correct five narration logic defects with bounded changes

## Goal

Correct the five statically verified findings below without redesigning narration, adding dependencies, replacing the audio backend, or rebuilding TTS distributions.

**Planning checkpoint:** 2026-10-26, source HEAD `530445fdef1c39893197b5f5070e5ebe58c69ac6`, initially clean `main`. The working branch is `codex/narration-logic-corrections`, for this plan and its eventual implementation. The current authorization is **plan, branch, and local planning commit only**. No implementation, test execution, model work, push, or PR is authorized in this planning turn. Every command below is a future command, not an executed result.

## User-visible outcome

| ID | Finding and trigger | Required result |
| --- | --- | --- |
| NLC-01, P1 | Slowed WSOLA playback can spend its output duration repeating silence and omit later input. | All five slow rates retain later audible content, preserve pitch and bounded ownership, and finish with correct duration/accounting. Direct `1.00x` remains unchanged. |
| NLC-02, P2 | Natural completion leaves narration play intent active, so later manual scrolling cannot save the visual position. | The final heard checkpoint is saved, then genuine manual reading can update the saved position without pressing Stop first. |
| NLC-03, P2 | An explicit compatibility recheck selects a different profile during narration and overwrites the coordinator's profile without replacing the running engine. | The current engine and preparation policy stay consistent. A changed/unavailable selection is applied only after existing containment; resumption remains explicit. A same-profile recheck is lifecycle-neutral. |
| NLC-04, P2 | On multiple CUDA devices, compatibility uses the best-memory device while inference uses the default device. | Admission describes the CUDA device the existing engine will actually use, including rejection when that device is insufficient even if another device qualifies. |
| NLC-05, P2 | Celsius matching accepts the `20 °C` suffix inside a decimal such as `1,20 °C`. | Unsupported numeric expressions remain intact in current product narration; standalone supported Celsius forms still expand and source locators remain valid. |

## Current state

These are source-level findings, not runtime reproductions. No tests, builds, benchmarks, or models ran during the audit or this planning task. Historical green results do not validate this patch.

- NLC-01: `incremental-wsola-v3-worklet.ts` returns negative infinity for zero-energy correlation, defaults to the leftmost candidate, and calculates the next expected source position from the previous chosen position. Drift accumulates while termination uses a fixed output length. At 75%, a silence tie advances 216 source samples instead of the nominal 360. The real Web Audio backend imports this processor. `pcm-playback.test.ts` covers controller behavior with a fake worklet; those tests alone cannot prove signal preservation.
- NLC-02: `ProductNarrationCoordinator.#tick` handles failure but not terminal play intent. `bindNarrationPositionPersistence` uses that intent, and `ReaderPositionSaveCoordinator.schedulePassive` rejects visual saves while narration is active. Explicit Stop currently releases the blockage.
- NLC-03: `HardwareCompatibilityControls.handleRecheck` calls `check("explicit-recheck")`, then `resetRecoveryEpisode`; `checkAvailability` can assign a new profile/language with an active scheduler. `refreshSelectedProfile` already contains a configuration-change stop path. Reuse that ownership rather than adding a second recovery mechanism.
- NLC-04: `normalize_accelerated_provider` ranks all CUDA candidates by available/dedicated memory. The Windows probe preserves CUDA ordinal order, but the report carries no selected-device identity. Qwen uses `cuda:0`; Chatterbox uses default CUDA, including the frozen v3 service source shipped in package v6. Fixing only the current Python adapter would miss that shipped path.
- NLC-05: `isExactCelsiusForm` checks word boundaries, not attached numeric syntax. Symbol replacements precede lexical protections. Current Spanish `narration-piper-v2` still selects the historical v1 normalizer; English Piper and Chatterbox use the mutable bilingual normalizer. A bilingual-only fix without adjusting that product routing leaves Spanish Piper defective.

M005 is completed at its preparation-only boundary. `narration-normalizer.ts`, `spanish-normalization.ts`, historical corpora, and completed evaluation records are frozen inputs. `docs/architecture/narration-normalization-v2.md` itself is hash-bound by the v8 authority. Do not edit those files or update historical hashes to make a new behavior pass.

## Scope and non-goals

Implementation units are NLC-01; the shared coordinator work NLC-02/03; NLC-04; and NLC-05. They form one integration batch. This is a behavioral bug-fix batch, not a refactor campaign; do not import the refactor auditor/worker/validator orchestration or require a full baseline per unit.

Prefer changes within these existing owners:

| Unit | Production scope | Existing test scope |
| --- | --- | --- |
| NLC-01 | `apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts` | `apps/desktop/src/tts/pcm-playback.test.ts`; existing browser correction spec |
| NLC-02/03 | `apps/desktop/src/tts/product-narration-coordinator.ts`; change the persistence bridge or Settings callback only if the owner fix cannot meet the invariant | coordinator, narration-position bridge, and position-save coordinator tests; Settings/App tests only if their wiring changes |
| NLC-04 | `apps/desktop/src-tauri/src/host_profile_detection.rs`; Windows probe only if needed to preserve/default ordinal semantics | `apps/desktop/src-tauri/src/host_profile_detection/tests.rs` |
| NLC-05 | `packages/epub/src/narration/narration-bilingual-normalizer.ts` and `narration-preparation.ts` | existing normalizer, prepared-segment, public preparation matrix, and resource-bound tests |

New artifacts must earn their place:

- One focused `incremental-wsola-v3-worklet.test.ts` is justified because existing fake-node tests never execute the signal algorithm. Its small processor-host stub stays local to the test; do not export production internals or create a reusable testing framework.
- One concise additive ADR is justified for the CUDA admission-policy correction and the versioned Celsius-boundary correction described below. Record its number when implementation starts. Do not produce an ADR, authority JSON, registry, or separate plan for each mechanical fix.
- Extend existing tests and synthetic fixture builders. Do not add new models, dependencies, commands, schemas, profile selectors, preferences, diagnostic exports, fixture archives, benchmark runners, or general abstractions.
- Keep evidence in the plan plus one concise independent review record. Raw captures belong in ignored `tmp/evidence/`, not Git. Do not create an evidence directory or empty report files before there is evidence to record.

No dependency/runtime upgrades, installer changes, acquisition changes, GPU chooser, model repackaging, Qwen production work, full normalization rewrite, word-level synchronization, visual redesign, or unrelated cleanup.

## Relevant files and documentation

Read `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, `docs/development/testing.md`, `docs/development/agentic-change-review.md`, and `docs/development/evidence-retention.md` before execution. Concrete command authority is root/package `package.json`, `apps/desktop/vite.config.ts`, `apps/desktop/playwright.config.ts`, the existing native smoke script, and `.github/workflows/foundation-checks.yml`.

The product and architecture references are `docs/product/mvp.md`, `docs/product/reader-settings-and-playback-controls.md`, `docs/architecture/{system-diagram,overview,synchronization-authority-v1,hardware-profile-recovery-authority-v1,narration-normalization-v2}.md`, ADR-0012, ADR-0017/0018, ADR-0019, ADR-0040, ADR-0051, `docs/plans/roadmap.md`, and the completed `M005-narration-text-preparation.md`. Read the last two for scope/history, not as files to rewrite.

## Architecture and constraints

Preserve local-only EPUB processing and inference, memory-only generated audio, existing queue/PCM ceilings, source-frame progress, stable locator ranges, and identity-first cancellation. Do not increase buffering or add silent PCM to conceal missing audio. Keep protocol v1, shared schemas, profile IDs, supported rates, persistence envelopes, and one-child supervision unchanged.

The minimal durable choices are:

1. **CUDA:** evaluate the default visible CUDA ordinal used by the existing engines, rather than selecting another device's better capacity. Reuse current native normalization primitives; retain DirectML ranking. A missing, ambiguous, or unusable default device must not fall through to a different qualifying GPU. Keep device identities native-private and preserve inherited CUDA visibility/order consistently between probe and child. Confirm this assumption from the actual launch path before implementation; an unprovable mapping must fail closed, not justify a new GPU-selection protocol.
2. **Celsius correction v1:** freeze the new positive/negative examples in the additive ADR before changing behavior. Narrow the unsafe match in the mutable bilingual normalizer and route current Spanish `narration-piper-v2` through that corrected bilingual path. Retain historical `narration-v1` and `narration-piper-v1` behavior/bytes. The ADR explicitly amends the historical unconditional Spanish-equivalence statement only for these invalid suffix matches; accepted corpus output, public profile IDs, packing policies, and locator contracts remain unchanged. This avoids duplicating an entire normalizer or introducing a new public profile solely for a boundary bug. If the accepted corpus changes beyond that exception, stop and revise the scope instead of broadening this correction.

Review the canonical system diagram at closeout. No component, process, persistence, or trust boundary is expected to change; do not redraw or expand the diagram merely to list internal fixes. Update maintained product/testing documentation with the actual corrected behavior and regression ownership. Preserve frozen authorities and completed plans.

## Milestones

### 1. Establish focused regressions and execution readiness

After implementation is authorized, verify HEAD, dirty/index state, configured tools and existing dependency/model availability without installing or downloading anything. Preserve unrelated changes. Record the actual implementation baseline. Add each regression immediately before its corresponding correction and run its focused gate against the unchanged relevant production code. It must fail for the reported reason, not a broken harness or missing dependency. Do not run the entire repository as a speculative baseline.

Validation: gates F1-F4 below as their tests are introduced. Status: not started; static evidence only.

### 2. NLC-01: preserve source progression in WSOLA

Anchor expected analysis position to nominal synthesis/output progress, so correlation adjustments cannot accumulate indefinitely. Prefer the nominal/nearest candidate on equal or unusable correlation rather than the left edge. Preserve existing grain size, overlap, search radius, ring storage, rate admission, and terminal protocol. Do not replace WSOLA or add a full transformed-audio buffer.

Execute the real processor in the focused test through its registration/message boundary. Use repository-authored PCM with leading/intermediate silence and distinguishable later bursts. At each of 75/80/85/90/95%, assert that late content survives, output is finite, duration/accounting is correct, and completion occurs once. Cover a short unit, all-silence input, and pause/resume/stop with no post-stop output. Include a periodic synthetic signal to detect gross pitch/rate regression; metadata-only assertions are insufficient. Existing backend tests retain the 100% bypass and resource-release controls.

Validation: F1, then B1 and the single Piper host arm after integration. Status: not started.

### 3. NLC-02/03: repair terminal intent and guarded profile application

On natural completion of the current run, make narration intent inactive after the final audible checkpoint and publish that transition exactly once. Let the existing persistence bridge finish narration ownership. Preserve the current completed presentation and existing Stop cleanup unless a regression demonstrates a necessary additional change; do not redesign completion or the reader save coordinator.

Apply compatibility changes through one guarded coordinator path. Before assigning a different profile/language, or accepting that no profile is available, invalidate and await the existing configuration-change containment. Do not start the replacement engine automatically. Recheck revision/run ownership after asynchronous work; an old recheck cannot mutate a closed/replaced run. Same-profile results must not cancel healthy narration. Keep recovery containment and cleanup failures visible.

Tests must connect actual coordinator behavior to the actual persistence bridge/save owner, rather than manually fabricating only a successful `inactive` snapshot. Assert natural end -> saved heard end -> manual scroll -> newer saved/restored position; repeated ticks must not re-enter narration or overwrite that position. For rechecks, cover changed and unavailable selection during an active run, a paused run, an unchanged selection, and a delayed stale result. Assert stop-before-policy-change, no stale preparation/audio, and no automatic restart. Use existing fake service/compatibility ports, not actual resource exhaustion or new public hooks.

Validation: F2; B1 checks the real reader/persistence wiring. Settings/App-focused tests become necessary only if those files or callback contracts change. Status: not started.

### 4. NLC-04: align native CUDA admission with default-device inference

Change the CUDA selection boundary in the existing native host report. Preserve probe bounds, default-device ordering, normalized report shape, content-free errors, thresholds, and DirectML behavior. Exercise the same report through `optional_cuda_bf16_profile_admitted_from_report`, because acquisition also consumes it; a UI-only fix is insufficient. No Python adapter or packaged service edit is expected.

Use ordered synthetic snapshots: insufficient default/sufficient secondary must reject; sufficient default/larger secondary must report the default's facts; unknown/unmapped default must fail closed; the existing single-device case must still pass. Preserve DirectML controls. Update the old best-memory CUDA expectation because the additive ADR deliberately corrects that policy; do not rewrite unrelated assertions.

Validation: F3 in both Rust feature configurations, then one compatible-host Chatterbox arm. A single-GPU pass does not constitute a physical multi-GPU reproduction; report that limitation. Synthetic multi-device regression is mandatory, but obtaining a second computer/GPU is not a prerequisite for this bounded algorithm correction. Status: not started.

### 5. NLC-05: preserve numeric context without changing frozen history

Add a bounded numeric-context guard to the bilingual Celsius matcher, reusing existing character predicates where suitable. Reject a suffix match inside comma/dot decimals or other attached numeric syntax; do not introduce a general number parser. Apply the product routing from the Architecture section so Spanish Piper also receives the correction.

Add cases in existing tests for `1,20 °C` (Spanish), `1.20 °C` (English), standalone `20 °C`, punctuation-delimited supported forms, code/unsupported-language preservation, and a larger attached number. Verify current Piper ES/EN and Chatterbox preparation routes through the public synthetic EPUB boundary, with unchanged displayed text and exact source spans/locator resolution. Reuse the frozen Spanish/bilingual corpora as unchanged controls. Keep legacy v1 expectations explicit; do not pretend its historical implementation was fixed.

Validation: F4. Existing frozen-authority Python tests run inside I1; do not run a separate Python matrix just because the caller is TTS. Status: not started.

### 6. Integrate, document, and obtain independent acceptance

After focused gates pass, run B1, then I1 once on the combined patch. Run the two selected native arms against that exact built executable, sequentially. Record a brief listening check during the Piper arm for audible tail, correct slowdown, and stable pitch; do not call duration metadata a listening result. Freeze source/tests/documentation and delegate one final review to `change_reviewer` as required by `agentic-change-review.md`. The reviewer does not edit or run tests. Supply exact source identities and host evidence; resolve actionable findings and obtain APPROVE for the exact patch. Missing required evidence/reviewer remains blocked.

Update this plan's results and maintained indexes at actual closeout; only then move it to `completed/`. Any later push/PR requires authorization; existing CI requirements must pass before integration, but this plan does not authorize remote actions. Status: not started.

## Testing and benchmark strategy

### Execution rules and command provenance

All commands run from the repository root in normal local PowerShell **outside the managed automation sandbox**. Record command, source HEAD/dirty diff identity, environment, outcome, and limitation. This is future execution guidance: no gate is run for the planning-only commit.

The focused Vitest commands use the already configured runner and package context; they do not add scripts. Do not append test filters to the desktop `test` script: that script chains Vitest with several Node suites and is not a reliable way to filter only Vitest. The native leaf script and flags below already exist in the configured host runners.

Run `pnpm.cmd build:packages` before focused tests that consume workspace `dist` exports if those outputs are absent or their shared/EPUB sources changed. Repeat it after NLC-05 before desktop consumers; avoid accepting stale `dist` results. Do not manually edit generated output. No dependency synchronization, browser installation, TTS packaging, or model download is needed when the existing prerequisites are intact; report a missing prerequisite before doing expensive preparation.

### Required focused gates

| Gate | Existing command, with the planned test added where identified | Why and timing |
| --- | --- | --- |
| F1 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts` | Actual signal algorithm plus existing backend ownership. Run when NLC-01 tests are introduced and after its fix. The first file is planned, not present at the planning checkpoint. |
| F2 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts` | Lifecycle, profile-change ordering, real persistence handoff. One shared group for NLC-02/03; do not run two broad desktop matrices for the same coordinator. |
| F3a | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection::tests` | Default native admission, multi-device snapshots, optional-download gate, and existing Windows probe controls. |
| F3b | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime host_profile_detection::tests` | Same native logic under the shipped feature configuration. Run the failing regression in F3a first; F3b is required after the fix, not a second full failing baseline. |
| F4 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-prepared-segment.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | Exact transformed text, current profile routing, locators, frozen controls, and existing resource/cancellation envelope. |

Use a new regression's name/file filter for its initial failing observation when appropriate. After changes, run its listed group, not just the new assertion. Do not add new tests merely to repeat unchanged getters, constants, snapshots, or implementation branches.

### Required combined and host gates

| Gate | Command | Why / bounded scope |
| --- | --- | --- |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep NLC` | Add bounded NLC-labelled cases to the existing spec: real production-bundled worklet output must retain the late marker, and natural completion must permit manual-position save/reopen. Reuse the existing synthetic EPUB and fake native-service seam, but do not fake the processor or its terminal output. This selects the new cases and avoids the unrelated 30-second image-delay test. |
| I1 | `pnpm.cmd check` | Required local foundation from `docs/development/testing.md`; run once after all focused fixes. It already includes evidence guards, format, lint, types, full TS/Rust/Python tests, both Rust configurations, and builds. Its broad coverage is a repository requirement, not five separate bug-specific gates. |
| H1 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One engine-neutral playback integration arm in actual packaged WebView2, including existing six-rate, cancellation, ownership, and resource observations. Reuse I1's exact native executable; no second build wrapper. Include the short listening observation here. |
| H2 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --tts-language=es` | One supported GPU engine arm for changed native admission and current installed-runtime startup/cleanup. Reuse the existing admitted runtime; the stable profile name does not mean package v4. No download, reinstall, speed matrix, or second language arm. |

Record the executable/source identity before H1/H2. If I1 did not build the final sources successfully, there is no reusable binary. These arms must run sequentially because they own audio/WebView2/GPU resources. H2 requires compatible hardware and the already configured/admitted runtime; absence is pending host evidence, never a passing skip or authorization to download. Listening not performed is likewise recorded as pending, not inferred from counters.

### Omitted, conditional, and non-duplicated work

| Work | Decision and reason | When it becomes necessary |
| --- | --- | --- |
| Full repository baseline and full checks after every finding | Omit. Focused before/after regressions isolate the defect; I1 covers the integration batch. | A concrete pre-existing failure needs classification; run only its relevant gate. |
| Separate root lint, type, format, all-tests, build, schema/evidence and Python-authority passes after green I1 | Omit duplicate executions. I1 already owns these checks. | A later edit invalidates that responsibility, or a failing stage needs isolated diagnosis. |
| Local full browser matrix and unrelated large-book/image/performance cases | B1 is sufficient for the changed wiring; existing required CI is untouched. | Reader layout, ingress, rendering, CSP, navigation geometry, or those harnesses change. |
| Full model-free native startup/ingress matrix | No extra local run by default; H1/H2 exercise the affected packaged playback/native paths. | CSP, startup, validators, file ingress, IPC serialization, or binary-response behavior changes; then use existing `pnpm.cmd test:native-startup`. CI still runs its normal gate. |
| Four-language/engine reader-corrections wrapper or six-arm portfolio suite | Omit. No model, voice, phonemizer, adapter, or lock changes; text policy is deterministically tested in both languages, DSP is engine-neutral, and H1/H2 cover CPU/GPU integration once each. | Engine-specific failure or adapter/runtime changes are demonstrated. Add only the affected arm. |
| Qwen inference, recovery investigation, promotion, quality/batch/dual-worker benchmarks | Omit under ADR-0051. Preserve existing deterministic coverage through I1. | Separately authorized Qwen work. |
| Installer lifecycle, uninstall/repair, optional live downloads, installed-package integrity campaign, release audits/inventory/signing | Omit. No installer, dependency, archive, verifier, trust, or acquisition implementation changes. NLC-04's admission is covered directly in F3. | Diff crosses one of those boundaries; revise scope before an installation/download campaign. |
| Full WSOLA candidate competition, new listening corpus, long resource benchmark, alternate backend | Omit. Correct the retained backend without changing bounds or candidates. Short actual-signal and host checks are relevant. | New allocations/queues, increased work per render, measured underruns, or an observed pitch/quality regression require a targeted existing performance/quality investigation. |
| Local WSL/Linux rebuild and multi-computer campaign | Omit for this Windows CUDA/default-device change; preserve standard Ubuntu CI. | Unix-specific source/cleanup behavior changes or physical multi-GPU support evidence is explicitly requested. |
| New schema generation, dependency installation, package rebuilds | Omit with unchanged contracts/locks/artifacts. | A justified scope change first updates this plan; do not perform these as ritual preparation. |

Existing required Windows/Ubuntu foundation and release-audit CI jobs are not waived or edited. They apply when a later PR/integration is authorized; do not run the same portable/Linux matrices locally simply to duplicate CI. No historical CI result is claimed for new source.

On a failure, record whether it is a defect, harness error, stale build, missing prerequisite, or host limitation. Retry only after a discriminating correction; do not repeat model/download/full-check runs to see whether they turn green. Reuse a green gate only when its source/test/dependency/environment inputs are unchanged and the reviewer accepts that attribution. A change to an input reruns the affected gate; another documentation paragraph does not automatically justify rerunning GPU inference.

## Risks and rollback

- A tie-only WSOLA fix can leave cumulative drift; tests must detect late audible content, not merely an `ended` message. Conversely, a new analysis anchor can change joins/pitch; retain the signal controls and brief native listening check.
- Completion must release persistence authority only after the final heard checkpoint. A delayed flush cannot overwrite a subsequent manual reading position.
- Compatibility rechecks can overlap Stop, close, recovery, or a newer selection. Preserve revision checks and existing cleanup failure behavior; no automatic replacement playback.
- CUDA visibility/order must agree between native probe and child. Do not fall back to another GPU or claim hardware verification from a synthetic snapshot.
- Frozen v1 remains historical. Acceptance requires the corrected path to be reached by current Spanish Piper, not changes to historical hashes. Preserve the unchanged corpus and locator controls.

Keep each implementation unit diff separable. If one fix fails, retain its failed evidence and revise that unit; do not roll back unrelated user work or discard all accepted work. Rollback of an authorized implementation commit should be explicit and path/commit scoped. Do not reset, clean, uninstall, remove models, or alter user data to obtain a green gate.

## Progress log

- 2026-10-26: Rechecked clean source HEAD and existing owners, tests, configured commands, frozen-authority constraints, and native runner selectors. No test or model was executed.
- 2026-10-26: Created `codex/narration-logic-corrections` from the stated `main` checkpoint. Added this plan and its active-index entry only. Implementation milestones and every acceptance gate remain not started.

## Discoveries and decisions

- Existing worklet/controller fakes cannot validate actual DSP; one real-processor regression file is necessary, whereas a new audio framework is not.
- NLC-02/03 share a coordinator and validation group; keep one implementation/review batch instead of duplicate orchestration.
- Native default-device admission avoids touching the frozen service shipped in Chatterbox v6 and avoids a public GPU-selection contract.
- Celsius repair must cover Spanish Piper routing while preserving byte-frozen v1 files. One additive, versioned correction record is necessary; copying the complete normalizer is not.
- The broad final foundation check remains mandatory under repository policy. Minimize repeated execution around it, not its required contents. Real-model coverage is two selected arms, not the historical four/six-arm campaigns.
- The planning-only documentation commit needs no independent behavioral change review. Actual implementation requires one exact-patch `change_reviewer` approval; no reviewer is spawned for this planning task.

## Final validation results

| Evidence | Current result |
| --- | --- |
| Static finding verification | Five source-level paths traced at the planning source HEAD; not runtime reproduction. |
| F1-F4 failing regressions and repairs | Not run; implementation not started. |
| B1, I1, H1, H2 and listening | Not run. |
| Independent implementation review | Not requested; no implementation patch exists. |
| Current planning work | Documentation only. No tests, builds, installs, model loads, or runtime changes. Git inspection/commit is not behavioral acceptance. |

At closeout replace pending rows with exact commands/outcomes, source and artifact identities, review ID/verdict, cleanup results, and remaining limitations. A gate that was omitted under the table above is not a pass.

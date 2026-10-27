# Correct five narration logic defects with bounded changes

## Goal

Correct the five statically verified findings below without redesigning narration, adding dependencies, replacing the audio backend, or rebuilding TTS distributions.

**Planning checkpoint:** 2026-10-26, source HEAD `530445fdef1c39893197b5f5070e5ebe58c69ac6`, initially clean `main`. The working branch is `codex/narration-logic-corrections`, for this plan and its eventual implementation. The original planning-turn authorization was **plan, branch, and local planning commit only**. No implementation, test execution, model work, push, or PR is authorized in this planning turn. Every command below is a future command, not an executed result.

**Implementation authorization (2026-10-26):** the maintainer explicitly authorized
all five fixes and the planned host validations, superseding planning-only scope.
No commit, push, PR, merge or publication is authorized. Implementation starts at
`afa2e0f6ec5541499c20b3862656a5bb4c5ac318` on the specified branch with an empty
index and clean worktree; no later commits or unrelated edits were present.
ADR-0063 records the additive CUDA/Celsius correction authority.

**Runtime preparation follow-up authorization (2026-10-26):** the maintainer
authorized the downloads and installation needed to prepare v6, execute H2 and
obtain independent acceptance. Changes must remain uncommitted. This supersedes
the earlier preparation prohibition only for H2's prerequisite; it does not
authorize runtime redesign, new package identities, publication or unrelated
validation campaigns. Existing exact local v6 artifacts and model files are
preferred after fresh identity verification. Earlier blocked results below
remain historical evidence and are not relabeled as passes.

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

Validation: F1-F4 executed before/after their corresponding fixes. Status: complete; initial failures and repairs are recorded below.

### 2. NLC-01: preserve source progression in WSOLA

Anchor expected analysis position to nominal synthesis/output progress, so correlation adjustments cannot accumulate indefinitely. Prefer the nominal/nearest candidate on equal or unusable correlation rather than the left edge. Preserve existing grain size, overlap, search radius, ring storage, rate admission, and terminal protocol. Do not replace WSOLA or add a full transformed-audio buffer.

Execute the real processor in the focused test through its registration/message boundary. Use repository-authored PCM with leading/intermediate silence and distinguishable later bursts. At each of 75/80/85/90/95%, assert that late content survives, output is finite, duration/accounting is correct, and completion occurs once. Cover a short unit, all-silence input, and pause/resume/stop with no post-stop output. Include a periodic synthetic signal to detect gross pitch/rate regression; metadata-only assertions are insufficient. Existing backend tests retain the 100% bypass and resource-release controls.

Validation: F1 and B1 pass; Piper host arm and maintainer listening pass. Status: complete; independent batch acceptance APPROVE in R03.

### 3. NLC-02/03: repair terminal intent and guarded profile application

On natural completion of the current run, make narration intent inactive after the final audible checkpoint and publish that transition exactly once. Let the existing persistence bridge finish narration ownership. Preserve the current completed presentation and existing Stop cleanup unless a regression demonstrates a necessary additional change; do not redesign completion or the reader save coordinator.

Apply compatibility changes through one guarded coordinator path. Before assigning a different profile/language, or accepting that no profile is available, invalidate and await the existing configuration-change containment. Do not start the replacement engine automatically. Recheck revision/run ownership after asynchronous work; an old recheck cannot mutate a closed/replaced run. Same-profile results must not cancel healthy narration. Keep recovery containment and cleanup failures visible.

Tests must connect actual coordinator behavior to the actual persistence bridge/save owner, rather than manually fabricating only a successful `inactive` snapshot. Assert natural end -> saved heard end -> manual scroll -> newer saved/restored position; repeated ticks must not re-enter narration or overwrite that position. For rechecks, cover changed and unavailable selection during an active run, a paused run, an unchanged selection, and a delayed stale result. Assert stop-before-policy-change, no stale preparation/audio, and no automatic restart. Use existing fake service/compatibility ports, not actual resource exhaustion or new public hooks.

Validation: F2; B1 checks the real reader/persistence wiring. Settings/App-focused tests were not added because those files/contracts are unchanged. Status: complete; F2/B1 pass and independent acceptance APPROVE in R03.

### 4. NLC-04: align native CUDA admission with default-device inference

Change the CUDA selection boundary in the existing native host report. Preserve probe bounds, default-device ordering, normalized report shape, content-free errors, thresholds, and DirectML behavior. Exercise the same report through `optional_cuda_bf16_profile_admitted_from_report`, because acquisition also consumes it; a UI-only fix is insufficient. No Python adapter or packaged service edit is expected.

Use ordered synthetic snapshots: insufficient default/sufficient secondary must reject; sufficient default/larger secondary must report the default's facts; unknown/unmapped default must fail closed; the existing single-device case must still pass. Preserve DirectML controls. Update the old best-memory CUDA expectation because the additive ADR deliberately corrects that policy; do not rewrite unrelated assertions.

Validation: F3 in both Rust feature configurations, then one compatible-host Chatterbox arm. A single-GPU pass does not constitute a physical multi-GPU reproduction; report that limitation. Synthetic multi-device regression passes; physical multi-GPU behavior is not claimed. Status: F3a/F3b and H2 pass after the authorized v6 preparation recorded below.

### 5. NLC-05: preserve numeric context without changing frozen history

Add a bounded numeric-context guard to the bilingual Celsius matcher, reusing existing character predicates where suitable. Reject a suffix match inside comma/dot decimals or other attached numeric syntax; do not introduce a general number parser. Apply the product routing from the Architecture section so Spanish Piper also receives the correction.

Add cases in existing tests for `1,20 °C` (Spanish), `1.20 °C` (English), standalone `20 °C`, punctuation-delimited supported forms, code/unsupported-language preservation, and a larger attached number. Verify current Piper ES/EN and Chatterbox preparation routes through the public synthetic EPUB boundary, with unchanged displayed text and exact source spans/locator resolution. Reuse the frozen Spanish/bilingual corpora as unchanged controls. Keep legacy v1 expectations explicit; do not pretend its historical implementation was fixed.

Validation: F4. Existing frozen-authority Python tests run inside I1; no separate Python matrix was run. Status: complete; F4/I1 frozen-authority controls pass and independent acceptance APPROVE in R03.

### 6. Integrate, document, and obtain independent acceptance

After focused gates pass, run B1, then I1 once on the combined patch. Run the two selected native arms against that exact built executable, sequentially. Record a brief listening check during the Piper arm for audible tail, correct slowdown, and stable pitch; do not call duration metadata a listening result. Freeze source/tests/documentation and delegate one final review to `change_reviewer` as required by `agentic-change-review.md`. The reviewer does not edit or run tests. Supply exact source identities and host evidence; resolve actionable findings and obtain APPROVE for the exact patch. Missing required evidence/reviewer remains blocked.

Update this plan's results and maintained indexes at actual closeout; only then move it to `completed/`. Any later push/PR requires authorization; existing CI requirements must pass before integration, but this plan does not authorize remote actions. Status: implementation, focused/browser/integrated checks and H1/H2 complete; independent acceptance APPROVE in R03. The linked review record owns the subsequent exact archive/link review.

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

- 2026-10-26 implementation: F1 reproduced missing late PCM at all five rates
  (5 failures, 42 passes); nominal anchoring and nearest-candidate ties repaired
  it (47/47). F2 reproduced manual-save rejection and three missing containment
  cases (4 failures, 85 passes). After the shared owner fixes and added paused
  unavailability/restore controls, 90/90 pass. An intermediate F2 used the wrong
  terminal spelling (`completed` instead of `complete`); a later test-only restore
  fixture lacked its default locator. Both were corrected before the scoped rerun.
- F3a reproduced wrong default-device facts and incorrect optional admission
  (2 failures, 15 passes); F3a/F3b then pass 17/17 each, including the actual
  Windows probe. The native launch path inherits CUDA visibility/order without
  overriding either; the probe retains every CUDA ordinal or fails closed.
- F4 reproduced partial Celsius expansion at pure and public boundaries in both
  languages (4 failures, 118 passes). Rebuilt workspace exports after correction;
  124/124 pass, including full accepted Spanish corpus equivalence. A compile
  error on absent preceding tokens was fixed before the successful rebuild.
- All acceptance commands so far ran via escalated normal local PowerShell.
  Node is 24.20.0; cached Corepack pnpm is 11.15.1. The initially resolved fallback
  pnpm 11.25.0 rejected F1 before tests ran. Subsequent pnpm commands set the
  process PATH prefix to `C:/nvm4w/nodejs/node_modules/corepack/shims` and
  `COREPACK_ENABLE_NETWORK=0`; no installation or download occurred.
- B1's first run passed the real audio marker, completion and manual-save
  assertions, then failed on a test expectation: successful reopening reports
  `Reading position restored.`. Corrected that expectation; B1 passes (1/1, 24.1 seconds).
- Production changes remain in the planned owners. Settings/App and public
  callback contracts are untouched. The canonical system diagram remains valid:
  no component, process, persistence or trust boundary changes.

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
| F1-F4 failing regressions and repairs | Executed on host; before/after outcomes above. Final focused groups: F1 47, F2 92 after R01 correction, F3a/F3b 17 each, F4 124 passing. |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep NLC`: 1/1 pass after test-only restored-status correction. Actual bundled worklet retains the late marker, all units end, heard end saves, manual wheel updates and reopening restores it. |
| I1 | `pnpm.cmd check`: exit 0. Evidence guard 13; shared/EPUB/desktop Vitest 209/680/837; desktop Node 100; Rust default 120 passed/2 ignored and release-locked 119 passed/2 ignored; Python 645. Format, lint, types, schemas and all builds pass. `tmp/evidence/narration-logic-corrections/I1.log` retains the raw host result. |
| Reused binary | I1 output `apps/desktop/src-tauri/target/release/voxleaf-desktop.exe`, SHA-256 `e1369be434d87955566631605315f041553b7dea84188d1c47722c61ee42d01b`. No rebuild between host arms. |
| H1 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en`: exit 0; all six rates, no stale playback, valid ranges/focus, cleanup 0 retained/0 discarded units and 0 generated audio files; 0 external requests. Existing packaged core and outbound interpreter block; EdgeDriver/WebView2 major 155. |
| H2 | Initial attempt exited 1 before inference with `tts-optional-profile-unavailable`; admitted v6 was absent. After separately authorized exact-local v6 installation and native integrity verification, the exact planned command passes on the final R02 executable: exit 0, 403.89 seconds. Full attribution and metrics are recorded in the follow-up below. |
| Listening | Maintainer explicitly confirmed audible phrase endings, correct slowdown and stable pitch during H1. This is human-reported listening, separate from synthetic PCM/counters; no broader quality claim. |
| Independent implementation review | **APPROVE, NLC-2026-10-26-R03-ASTRA-01**. R01's actionable finding and R02's missing H2 evidence are resolved. The immutable [review record](../evidence/narration-logic-corrections-review.md) records the final archive/link review separately. |
| Implementation | Complete: all five corrections implemented; F1-F4, B1, I1 and H1/H2 pass with the documented scoped reuse after R01. V6 was installed from exact verified local artifacts; no download, commit, push, PR or merge. Independent implementation acceptance is APPROVE. |

At closeout replace pending rows with exact commands/outcomes, source and artifact identities, review ID/verdict, cleanup results, and remaining limitations. A gate that was omitted under the table above is not a pass.

### Integrated evidence attribution and limitations

Every command uses the repository root and normal local PowerShell outside the
managed sandbox. The branch and HEAD remain unchanged from implementation start;
the index remains empty. `tmp/evidence/narration-logic-corrections/integrated-identities.json`
records the integrated source/test/document identities; a post-I1 comparison found
zero changed paths. Subsequent plan-only evidence updates do not change runtime,
tests, binary, dependency or environment inputs. I1 reran the focused production
responsibilities after formatting and package reconstruction; no historical CI or
model evidence is substituted.

I1 emitted a Vite large-chunk advisory and a pytest cache-write warning (the
existing cache nodeids path denied a write); all 645 tests completed successfully.
The two explicit Rust ignores remain the installed integrity diagnostic (outside
this scope) and a subprocess fixture exercised via its parent test. No installer,
full browser, Qwen, acquisition/download or new multi-GPU campaign was run; the
omission table remains applicable. All frozen authorities, historical hashes,
completed plans and generated tracked files are unchanged.

### Host closeout and review request

H1 and H2 ran sequentially against the exact I1 executable hash above. H1
completed its normal teardown. H2 exited with its required selection failure
and no cleanup-error message; no inference was attempted. Do not interpret
single-device H1/native-probe success as physical multi-GPU validation.
The H2 runtime prerequisite cannot be repaired by selecting a cleanup-only
older package, changing admission, downloading a model or reinstalling packages
under this task. Continue with independent static review, but retain the blocked
acceptance state until the admitted v6 runtime is available and H2 passes.

The exact commands for F1, F2, F3a, F3b and F4 are those in the required focused
matrix above, executed without additional filters. `pnpm.cmd build:packages`
ran after EPUB source changes, and again through B1/I1's existing scripts.
Only task-owned TypeScript files were formatted with `pnpm.cmd exec prettier
--write <task-owned .ts paths>`; Rust used the configured `cargo fmt
--manifest-path apps/desktop/src-tauri/Cargo.toml`. No tracked generated file
was edited. `git diff --check` passes and the index is empty.

### Independent review correction, revision 2

Review `NLC-2026-10-26-R01-ASTRA-01` returned **BLOCKED**: one source-confirmed
P2 (`NLC-R01-F01`) plus the independent H2 prerequisite gap. Stop during a delayed
availability result invalidated the run token and left the surviving coordinator
permanently checking. Added same-profile and changed-profile regressions before
repair: F2 failed exactly those two cases (90 passed). The owner now renews the
explicit availability request after run invalidation, but only when the original
revision still owns it and the coordinator is open; no narration starts. F2 then
passes 92/92. Close/stale-result and same-profile lifecycle controls remain green.

Only the coordinator and its tests changed after I1. Scoped ESLint, desktop
typecheck, B1, a new native build and H1 are the affected follow-up gates. Preserve
I1's unaffected EPUB, Rust, Python, evidence/schema and other ownership results;
do not claim the old executable validates the final coordinator. The prior
human listening observation remains specific to the unchanged WSOLA backend.
No second H2 attempt is justified while its diagnosed runtime prerequisite is
unchanged. Final follow-up outcomes and executable identity are recorded below.

Revision 2 follow-up: scoped `pnpm.cmd exec eslint
apps/desktop/src/tts/product-narration-coordinator.ts
apps/desktop/src/tts/product-narration-coordinator.test.ts` and
`pnpm.cmd --filter @voxleaf/desktop typecheck` pass. The exact B1 command passes
again (1/1, 23.9 seconds). `pnpm.cmd build:desktop` exits 0; the final executable
SHA-256 is `4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`.
The exact H1 command is repeated on this executable; its final outcome and the
revision-2 review verdict are retained in the linked independent review record,
which is outside its own identity manifest. H2 has not been rerun on this binary:
its diagnosed prerequisite remains absent, so neither the original failed H2 nor
H1 can supply the missing Chatterbox acceptance. The plan stays active and no
APPROVE or complete status is claimed.

### Authorized H2 prerequisite follow-up

The maintainer subsequently authorized v6 preparation, including necessary
downloads/installation, while retaining the no-commit boundary. No source,
test, dependency, runtime authority or executable changed during preparation.
The R02 executable still hashes to
`4c60a4ee9829983b6f6340c0df50def6513bc0723e93561b43e9dddbe614ecd8`.

The exact local v6 build and six existing model artifacts were available.
`uv run --directory services/tts --locked python -m
voxleaf_tts.release_chatterbox check-local --package-version 6 --output-root
<existing-local-output-root>` initially exited 1 because the non-extended Windows
path omitted long descendants during traversal. A bounded inventory with the
documented extended path found all 13,092 expected files and no extras. Repeating
the configured command with that corrected extended output-root argument passed
(`chatterbox-optional-v6-local:current`, exit 0). The package was not rebuilt or
modified to obtain this result. This fresh check verifies the source/lock,
runtime tree, archive members, ordered parts and receipt; it does not claim a new
HTTP download. Raw logs remain in the ignored NLC evidence directory.

The ignored `prepare-runtime-v6.ps1` copied that exact local package to a new
staging sibling of `cb/6`, verified all 13,091 manifest-listed payload files and
the manifest identity, and copied/reverified the six unchanged model artifacts
against v6 authority. Containment, reparse-point, occupied-target and active-app
guards protect the copy/promotion. The new `cb/6` was promoted only after these
checks; previous packages and unrelated user data were not moved or removed.
No package or model bytes were downloaded. This is local installation from
verified artifacts, not evidence for the product's HTTP acquisition path.

The newly installed prerequisite justified exactly one additional existing gate:
`cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
tts_optional_chatterbox::tests::installed_host_integrity_diagnostic -- --exact
--ignored --nocapture`. It passed outside the sandbox: 1 passed, 0 failed,
121 filtered, 142.90 seconds after a 22.05-second test-target build. The diagnostic
verified the ordinary host context, canonical root, tree stamp, bytecode authority
and runtime. It did not rebuild the release executable or invoke an installer
lifecycle campaign. This bounded prerequisite check is the only expansion to
the original omitted-validation table.

### Successful H2 on the final executable

The exact H2 command from the required matrix ran in normal local PowerShell
outside the sandbox on 2026-10-27 03:18:37-03:25:21 UTC (2026-10-26 local).
It exited 0 in 403.89 seconds. `H2-R03.log` and `H2-R03-result.json` preserve
the output and command/timing/exit/executable identity receipt in ignored
`tmp/evidence/narration-logic-corrections/`. The executable hash before and after
matches R02's final binary; H1-R02 and H2 were sequential, with no intervening
release build or runtime source/test change. H1-R02 remains its passing Piper
evidence; it is not relabeled as a new execution.

- Installed profile admission: v6 installed, default CUDA host compatible;
  selected Chatterbox Spanish arm completed successfully.
- Quick command-to-audible: 47,185 ms, with 19,240 ms playable lead. Prepared
  command-to-audible: 63,671 ms for 61,040 ms playable audio; warm prepared RTF
  1.04. These are measured observations, not a claim of instantaneous startup.
- Observed underruns and buffering: zero; stable playback observed for 60,083 ms.
  This observation is bounded to the harness's measured interval.
- Cancellation: 292 ms; startup cancellation 235 ms; startup child shutdown
  220 ms. All five created audio contexts closed.
- Synchronization: 12 segment transitions, valid ranges, preserved focus,
  pause/resume at the same boundary, no stale playback, cleared highlight on
  cleanup. Follow latency P95: 0.8 ms.
- Cleanup: zero retained/discarded units, zero generated-audio files, 713 ms
  resource release. Peak observed dedicated GPU memory 3,896 MiB returned to
  the measured 41 MiB baseline. The WebView2 harness counted zero external
  requests; the existing child offline environment remained unchanged. No new
  firewall-enforcement or whole-host network-capture claim is made.

This supplies the previously missing engine integration evidence. No physical
multi-GPU validation, Chatterbox human-listening assessment, HTTP acquisition
success, second language arm or speed matrix is inferred. The earlier H1 human
listening confirmation remains attributed to the unchanged WSOLA path. Existing
F1/F3/F4 and unaffected I1 reuse from R02 retains identical inputs. Only plan
status/documentation changes followed preparation; final independent review is
the remaining acceptance gate.

### Accepted implementation and documentation closeout

`NLC-2026-10-26-R03-ASTRA-01` returned **APPROVE**, with no findings and no
missing required evidence. It independently confirmed the closed path identities,
the preparation helper, fresh host evidence, and scoped reuse from R02. The
earlier blocked reports remain immutable historical results.

Following that acceptance, this plan is archived under `completed/`; maintained
indexes and incoming links are updated. The canonical system diagram was reviewed
and still matches the implementation: there is no change to component/process,
persistence or trust boundaries. Historical plans, frozen authorities/hashes and
tracked generated files remain unchanged. The evidence record retains the
subsequent exact-state documentary review and final closeout checks without
changing this accepted plan's bytes or refreshing an earlier approval hash.

All changes remain unstaged and uncommitted on the specified branch and planning
HEAD. No push, PR, merge or publication was performed. The only retained host
preparation is the verified optional v6 installation; previous runtime versions
and unrelated user data remain preserved. No mandatory implementation or host
validation remains pending. The limitations and omitted/conditional tests above
remain explicit and do not become passing results merely through closeout.

# M010.1 — Bilingual narration and bounded candidate screening

## Goal

Add explicit Spanish and English local narration through a versioned,
locator-preserving preparation boundary, prove one exact Piper English
baseline, evaluate exact local Qwen built-in voices for both product
languages, and screen a small set of naturalness candidates before M011
without weakening VoxLeaf's privacy, cancellation, bounded-memory, licensing,
or evidence requirements.

This is a bounded portfolio-focused follow-up, not an open-ended model search.
Its implementation target is one development day when dependencies and
hardware cooperate, but the timebox is not permission to skip frozen
authority, licensing review, exact-host evidence, or repository validation.

## User-visible outcome

After this plan passes:

- the user can explicitly choose Spanish or English narration;
- VoxLeaf uses only exact profiles that declare support for that language;
- changing language or profile replaces the current generation identity,
  discards obsolete queued/generated audio, and restarts from the current
  canonical narration locator;
- the supported Piper Spanish behavior remains available;
- an admitted Piper English profile is available if its exact voice, quality,
  performance, offline, and redistribution gates pass;
- at most one additional local engine is offered if one exact screened
  candidate passes every frozen product gate; and
- if no candidate passes, VoxLeaf records that result honestly and proceeds to
  M011 without claiming a naturalness upgrade.

Milestone 6 now implements the admitted bilingual runtime set. Piper/davefx
Spanish and Piper/joe English are supported CPU profiles; Chatterbox is a
supported Spanish/English GPU profile; and the exact Qwen/Serena Spanish and
Qwen/Aiden English profiles remain explicitly gated `development-only`
choices. Milestone 7 still owns the packaged portfolio journeys and final
plan closeout.

## Current state

Completed M005 implements deterministic, bounded, locator-linked narration
preparation. Its public language boundary accepts Spanish or undetermined
input, and its Spanish normalization is byte-frozen by
[`narration-normalization-v1.md`](../../architecture/narration-normalization-v1.md).
Completed M010 adds the separate Piper-only
[`narration-piper-v2`](../../architecture/piper-narration-preparation-profile-v2.md)
spoken-expansion-aware path for exact `es_ES-davefx-medium`.

Milestone 2 lets the desktop explicitly select Spanish or English and
dispatches the selected language through `narration-bilingual-v2`. Milestone 6
now connects that product boundary to exact language-bound runtime profiles:
Piper 1.4.2 `es_ES-davefx-medium` and `en_US-joe-medium`, Chatterbox
Multilingual V3 in Spanish and English, and native-gated Qwen3-TTS 12Hz 1.7B
CustomVoice Serena/Spanish and Aiden/English. The shared process protocol
remains v1; native supervision carries the selected profile and language,
starts only the exact matching isolated environment, and retains one child
process tree.

M010.1 Milestone 1 originally froze result-blind v7 authority for Piper
English plus Chatterbox and MOSS. No v7 result existed when the maintainer
requested local Qwen bilingual coverage. Milestone 1A therefore preserves all
v7 bytes and supersedes result-bearing work with layered v8 authority for
exact Qwen/Serena Spanish and Qwen/Aiden English. V8 changes no current
runtime or support state.

## Scope and non-goals

### In scope

- An explicit two-value narration language preference: Spanish (`es`) or
  English (`en`).
- Versioned English and bilingual canonical normalization with stable
  locator-range preservation and existing M005 bounds.
- An exact Piper 1.4.2 English baseline, initially targeting
  `en_US-joe-medium` only if the frozen intake confirms its artifacts,
  provenance, license, redistribution obligations, and voice quality.
- Independent exact local Qwen3-TTS 12Hz 1.7B CustomVoice controls:
  Serena/Spanish and native-English Aiden/English, reusing the existing
  isolated environment without sharing language/voice results.
- Sequential screens for:
  1. Resemble AI Chatterbox Multilingual V3;
  2. OpenMOSS MOSS-TTS-Nano 100M ONNX.
- Intake of Fun-CosyVoice3 0.5B as a proposed conditional third candidate;
  Milestone 1 rejects it from v7 before lock or execution because no exact
  non-personal default voice was frozen.
- Full candidate-neutral evaluation for no more than one new-engine survivor.
- Integration of Piper English and at most one passing new engine/profile.
- Content-safe synthetic English and Spanish fixtures, exact-host evidence,
  privacy review, and repository closeout.

### Non-goals

- Automatic language detection.
- Translating book text.
- Mixing languages within one active narration unit.
- Voice cloning, user reference audio, or personal voice enrollment.
- Automatic engine failover or simultaneous model processes.
- Reopening completed M010's Spanish Piper support decision.
- Replacing M005 normalization inside engine adapters.
- Production installers, signing, updates, model downloads, or final
  GPL/voice-license fulfillment; M011 owns those distribution concerns.
- Evaluating every model in the post-MVP backlog.
- Claiming that upstream benchmark results prove VoxLeaf support.

## Relevant files and documents

### Authority and product status

- [`AGENTS.md`](../../../AGENTS.md)
- [ExecPlan standard](../../../.agents/PLANS.md)
- [roadmap](../roadmap.md)
- [MVP scope](../../product/mvp.md)
- [project brief](../../product/project-brief.md)
- [post-MVP TTS candidate backlog](../../product/post-mvp-tts-candidate-backlog.md)
- [canonical system diagram](../../architecture/system-diagram.md)
- [architecture overview](../../architecture/overview.md)
- [performance budget](../../architecture/performance-budget.md)
- [bilingual narration authority v1](../../architecture/bilingual-narration-authority-v1.md)
- [narration normalization v2](../../architecture/narration-normalization-v2.md)
- [TTS feasibility profile v7](../../architecture/tts-feasibility-profile-v7.md)
- [superseding TTS feasibility profile v8](../../architecture/tts-feasibility-profile-v8.md)
- [corrective TTS feasibility profile v9](../../architecture/tts-feasibility-profile-v9.md)
- [Chatterbox CUDA feasibility profile v10](../../architecture/tts-feasibility-profile-v10.md)
- [Chatterbox RTX 50 compatibility profile v11](../../architecture/tts-feasibility-profile-v11.md)
- [ADR-0024](../../architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md)
- [ADR-0025](../../architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md)
- [ADR-0026](../../architecture/decisions/ADR-0026-correct-bilingual-candidate-decision-authority.md)
- [ADR-0027](../../architecture/decisions/ADR-0027-freeze-chatterbox-cuda-v10-correction.md)
- [ADR-0028](../../architecture/decisions/ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md)
- [v7 candidate manifest](../../../benchmarks/tts/candidates-v7.json)
- [v7 evaluation profile](../../../benchmarks/tts/profile-v7.json)
- [v8 candidate amendment](../../../benchmarks/tts/candidates-v8.json)
- [v8 evaluation profile](../../../benchmarks/tts/profile-v8.json)
- [v9 corrective candidate manifest](../../../benchmarks/tts/candidates-v9.json)
- [v9 corrective evaluation profile](../../../benchmarks/tts/profile-v9.json)
- [v10 Chatterbox candidate manifest](../../../benchmarks/tts/candidates-v10.json)
- [v10 Chatterbox evaluation profile](../../../benchmarks/tts/profile-v10.json)
- [v11 Chatterbox candidate manifest](../../../benchmarks/tts/candidates-v11.json)
- [v11 Chatterbox evaluation profile](../../../benchmarks/tts/profile-v11.json)
- [v7 synthetic corpus](../../../benchmarks/tts/corpus-v7.json)
- [v2 normalization corpus](../../../benchmarks/tts/normalization-corpus-v2.json)

### Completed boundaries that must remain valid

- [completed M005 narration preparation](../completed/M005-narration-text-preparation.md)
- [narration normalization v1](../../architecture/narration-normalization-v1.md)
- [ADR-0012 bounded narration preparation](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md)
- [completed M007 service and protocol](../completed/M007-local-tts-service-and-process-protocol.md)
- [completed M008 adaptive buffering](../completed/M008-bounded-adaptive-prebuffering.md)
- [completed M009 synchronization](../completed/M009-synchronized-reading-and-narration.md)
- [completed M010 profiles and recovery](../completed/M010-hardware-profiles-fallback-and-operational-resilience.md)
- [M010 support matrix v1](../../architecture/tts-support-matrix-v1.md)
- [ADR-0023 final M010 support decision](../../architecture/decisions/ADR-0023-final-m010-support-and-recovery.md)

### Likely implementation areas

- `packages/epub/src/narration/`
- `packages/epub/src/document/narration-model.ts`
- `packages/epub/src/testing/`
- `packages/epub/src/integration/`
- `apps/desktop/src/tts/`
- `apps/desktop/src/persistence/`
- `apps/desktop/src-tauri/src/tts_service_supervisor.rs`
- `services/tts/src/voxleaf_tts/`
- `services/tts/benchmarks/`
- `services/tts/benchmarks/candidates/`
- `benchmarks/tts/`

### Primary candidate sources for intake

- [Piper voices repository](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/joe/medium)
- [Chatterbox official repository](https://github.com/resemble-ai/chatterbox)
- [Chatterbox official model collection](https://huggingface.co/ResembleAI/chatterbox)
- [MOSS-TTS-Nano official repository](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [MOSS-TTS-Nano 100M ONNX model](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX)
- [MOSS-TTS-Nano Reader](https://github.com/OpenMOSS/MOSS-TTS-Nano-Reader)
- [CosyVoice official repository](https://github.com/FunAudioLLM/CosyVoice)
- [Fun-CosyVoice3 0.5B model](https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512)
- [Qwen3-TTS CustomVoice model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
- [Qwen3-TTS official repository](https://github.com/QwenLM/Qwen3-TTS)
- [Qwen3-TTS release article](https://qwen.ai/blog?id=qwen3tts-0115)

The links above are intake sources, not frozen revisions or proof of product
fitness. Milestone 1 must record exact revisions, artifact digests, license
texts, voice provenance, and redistribution conclusions before any
result-bearing run.

## Architecture and constraints

### Shared language and preparation boundary

`@voxleaf/epub` remains the sole owner of canonical normalization, semantic
segmentation, bounded source windows, and locator-range mapping. Add English
through a newly versioned authority rather than editing historical
`narration-v1` claims. Existing Spanish fixtures and behavior must remain
byte-for-byte stable unless a separately documented new profile is selected.

The product chooses one explicit language before preparation. Language becomes
part of the complete generation identity together with publication, session,
profile, settings, and narration location. A language change invalidates the
old identity before preparation cancellation, service cleanup, buffer
discard, and fresh work.

Persist at most one closed language identifier (`es` or `en`) alongside the
existing bounded non-content preferences. Do not persist inferred text,
prose samples, generated audio, evaluator notes, model paths, or raw host
reports.

### Engine-specific text adaptation

Canonical text must have the same locator-preserving meaning for every engine.
An exact engine adapter may add deterministic input sizing, language tokens,
or request formatting only after its intake proves the need. It must not
duplicate general number, symbol, punctuation, abbreviation, or whitespace
normalization.

Do not introduce a generic `EngineTextAdapter` abstraction in advance.
Document each proven exact requirement first; extract a shared abstraction
only if at least two admitted engines require the same additional operation.

### Exact profile identity

Each engine/model/voice/language/precision/provider/settings combination is a
separate immutable profile. Evidence from Piper Spanish cannot admit Piper
English, and family-level evidence cannot admit a different checkpoint or
voice.

An executable profile must declare:

- exact engine and package version;
- exact model and voice revision plus artifact SHA-256 digests;
- supported language;
- inference provider, precision, and required host margins;
- deterministic generation settings;
- native-rate audio conversion, if any;
- license and redistribution obligations;
- normalization/preparation profile;
- benchmark authority/result revision; and
- support state: `supported`, `development-only`, or `unsupported`.

The desktop must reject language/profile combinations that are not declared
by the immutable registry.

### Privacy, offline operation, and repository hygiene

Acquisition may use the network only as an explicit setup step. Evaluation
must run with the exact candidate interpreter blocked from outbound access.
The benchmark records only bounded content-free timings, counts, resource
measurements, enum outcomes, hashes, and aggregate evaluator scores.

Never commit model weights, Python environments, copyrighted EPUBs, generated
audio, raw evaluator forms, prompts containing private text, private paths,
secrets, or logs containing narration. Only synthetic repository corpus
content and schema-valid content-safe summaries may enter Git.

### Evaluation and stop rules

All thresholds, corpus bytes, schemas, candidate identities, generation
settings, evaluator rules, and stop conditions must be committed in an
authority commit that is a strict ancestor of every result commit.

Use one fluent evaluator per evaluated language for MVP quality admission. If
no fluent English evaluator is available, the English quality gate is blocked;
machine metrics or Spanish feedback cannot substitute for that decision.

Screen candidates sequentially. Stop an execution on unresolved licensing or
voice provenance, mandatory online inference, inability to run offline on the
exact Windows host, unsafe resource fit, failed startup/cancellation, invalid
audio, hallucination/repetition/meaning change, or inability to fit the
service and repository boundaries. Record the content-safe observation and
ask the maintainer before accepting, deferring, or rejecting the candidate.
Do not spend the full matrix on an
already-rejected candidate.

Piper English runs first. Exact Qwen/Serena Spanish and Qwen/Aiden English
then receive independent single-language existing-engine controls. They reuse
artifact identity only: neither voice/language result may admit the other, and
old Qwen 0.6B/Aiden evidence is not substitutable. A passing Qwen control must
complete its own language-specific full matrix but does not consume the
one-new-engine-survivor allowance.

Chatterbox and MOSS receive the two v8 new-engine screens. CosyVoice was conditional in
the initial plan because its common zero-shot path uses reference audio and
its documented setup may add Windows and distribution complexity. Milestone 1
found no exact non-personal default voice to freeze, so it is rejected before
an environment lock and does not proceed in v8.

At most one new-engine survivor receives the full bilingual matrix and product
integration. Piper English is the baseline/additional profile and does not
count as a second new engine.

### Support and release boundary

Passing a screen does not create a support claim. A profile becomes selectable
only after full frozen evaluation, an accepted decision record, executable
registry/service integration, exact-host product proof, privacy validation,
and repository checks.

If no new engine passes, retain Piper Spanish, add Piper English only if its
own exact gate passes, record no naturalness winner, and continue to M011.
M011 must package only admitted exact profiles and fulfill every corresponding
runtime, model, voice, and license obligation.

## Milestones

### Milestone 1: Freeze bilingual product and v7 evaluation authority

**Status:** Complete as of 2026-07-29. Authority checkpoint
`339561acac7cb026f8ec7ea36d177189f2eaf3be` precedes every permitted
result-bearing v7 execution.

1. Reproduce and record the current Spanish-only product boundary with
   deterministic tests.
2. Freeze the explicit `es`/`en` selection, bounded persistence,
   invalidation, restart, unsupported-combination, and accessibility behavior.
3. Freeze a versioned English/bilingual normalization corpus and profile
   without changing historical `narration-v1` bytes or claims.
4. Complete exact intake for Piper `en_US-joe-medium`, Chatterbox Multilingual
   V3, MOSS-TTS-Nano 100M ONNX, and conditional Fun-CosyVoice3.
5. Record exact revisions, artifact digests, dependency locks, licenses,
   voice provenance, offline setup, host requirements, settings, schemas,
   corpus hashes, quality rubric, gates, and stop conditions.
6. Add authority validators that fail closed when result files precede or
   diverge from the authority commit.
7. Commit the authority before generating any result-bearing audio.

Exit when the product and evaluation authority is result-blind, byte-frozen,
tested, and committed. Stop for unresolved licensing ambiguity, a required
voice-provenance decision, or unavailable evaluation hardware.

Actual result: the current Spanish-only boundary has a deterministic
content-safe regression; the explicit bilingual lifecycle and additive
normalization policy are frozen; exact Piper English, Chatterbox, and MOSS
inputs have revisions, artifact hashes, dependency locks, offline controls,
audio conversions, settings, host requirements, provenance, and license
records; and CosyVoice is rejected before lock or execution because no exact
non-personal default voice was frozen. The closed v7 schemas and validator
reject authority drift, unadmitted candidates, substituted locks, private
content, an execution commit without the frozen tree, or a result that does
not strictly descend from its authority commit.

### Milestone 1A: Supersede resultless v7 with local Qwen bilingual v8 authority

**Status:** Complete on 2026-07-29. Result-blind authority checkpoint
`95b0452ffb237284c5ffb54332c578b36e45fdf5` contains the exact v7 base and
v8 amendment. This is not a result-bearing rerun or product implementation.

1. Confirm that no v7 result-bearing file or generated audio exists.
2. Preserve every v7 profile, manifest, corpus, schema, lock, and validator
   hash.
3. Freeze exact local Qwen 1.7B CustomVoice / Serena / Spanish and Qwen 1.7B
   CustomVoice / Aiden / English profiles with independent identities.
4. Reuse the existing exact Qwen model revision, artifact hashes, isolated
   lock, offline controls, generation settings, and host boundary.
5. Record Aiden as the single bounded native-English Qwen voice; defer Ryan,
   voice cloning, voice design, and remote Alibaba Cloud inference.
6. Preserve v7 product behavior, normalization/evaluation corpus bytes,
   thresholds, evaluator rules, stop conditions, and one-new-engine survivor
   limit.
7. Add closed v8 raw/summary schemas and a fail-closed validator that requires
   the complete v7 base plus v8 amendment and strict result ancestry.
8. Commit the complete v8 authority before any result-bearing execution.

Actual result: v8 adds the two exact Qwen language/voice controls without
editing v7 or current runtime behavior. Focused v7/v8 authority validation
passes 14 tests; the existing Qwen lock is reused and no dependency, model,
audio, private data, or external capability is added. Result-bearing
Milestones 3-5 must use v8, not v7.

### Milestone 2: Implement engine-neutral bilingual preparation and selection

**Status:** Complete.

1. Extend the public narration language boundary with English under the new
   versioned authority.
2. Implement deterministic English normalization and synthetic corpus tests
   for prose, dialogue, abbreviations, ordinals, dates, numbers, currencies,
   symbols, acronyms, Unicode punctuation, and mixed unsupported input.
3. Preserve locator coverage, monotonic ranges, cancellation, source-window
   bounds, segment limits, and Spanish regression fixtures.
4. Add an accessible explicit language setting and bounded persistence.
5. Bind language to generation identity and reject invalid profile/language
   combinations before child start.
6. Prove with fakes that language changes cancel preparation, stop the old
   child, discard queued/playing obsolete audio, preserve the canonical
   narration target, and never run two profiles simultaneously.

Exit when model-free unit, integration, browser, and packaged fake-service
tests prove bilingual preparation and lifecycle behavior without adding a real
candidate dependency.

Actual result: the EPUB boundary accepts only `narration-bilingual-v2` with
`es | en`, implements the exact frozen English allowlist, and retains closed
historical/Piper combinations. The v2 implementation lives in separate
bilingual normalizer modules; the four byte-frozen v6/v8 authority inputs
retain their recorded SHA-256 values. The desktop stores one versioned
language, exposes a labelled keyboard-operable radio group, filters profiles
by immutable language binding, and at the Milestone 2 checkpoint rejects
English before child start because no English runtime profile is integrated.
Configuration replacement invalidates work,
cancels preparation/synthesis, releases buffered/current audio, contains the
service tree, retains the canonical target, and requires explicit Play. No
model, candidate dependency, audio persistence, or book-content storage was
added.

### Milestone 3: Evaluate the exact Piper English baseline

**Status:** Complete on 2026-07-29.

1. Acquire the exact frozen Piper English artifacts outside Git.
2. Verify hashes, license/provenance files, offline loading, native audio
   format, and interpreter outbound isolation.
3. Extend the candidate-neutral harness only where the frozen v8 schema
   requires it; keep model-free tests deterministic.
4. Run machine, resource, cancellation, zero-failure, and English quality
   gates on the exact host.
5. Commit only the content-safe derived result and record pass, rejection, or
   blocked status without changing thresholds after listening.

Exit with a schema-valid result and explicit decision for the exact Piper
English profile.

Actual result: the three frozen `en_US-joe-medium` artifacts were
acquired into the ignored local model root and matched the frozen sizes and
SHA-256 digests. The existing Piper 1.4.2 candidate environment, Python
3.12.10 interpreter, ONNX Runtime 1.27.0 CPU provider, and dependency-lock
digest also match authority. A separate v8 English adapter and baseline runner
now preserve the v6 Spanish path, apply the frozen 22,050-to-24,000 Hz bounded
linear conversion, project only the five English corpus cases, execute ten
warm and fifteen sustained first attempts, and use the four v8 cancellation
trials. Model-free focused formatting, lint, type checking, and 20 tests pass.
The private quality workflow now generates five randomized English samples,
requires all six frozen dimensions plus meaning and wrong-language findings,
deletes the exported scorecard after aggregation, and derives only the closed
content-safe v8 summary after deleting the complete private session. The
frozen candidate environment contains no repository schema dependencies, so
candidate execution now hands its closed raw record to the existing service
environment for v8 validation after the candidate process exits; the frozen
candidate lock remains unchanged. The expanded focused suite passes 23 tests,
and both candidate-side command modules import successfully in the exact
environment.

The administrator-installed exact-interpreter outbound block then passed
preflight. On execution commit
`bcf6521e13984a65157d8486d77fb6212b0aaa90`, the exact CPU profile completed
all 25 first-attempt generations with zero failures, all four cancellation
trials with zero stale units or remaining processes, 0.154-second p95 first
audio, 0.0235 warm p95 RTF, 0.0252 sustained p95 RTF, 0.0199 total sustained
RTF, 411.8 MiB peak process-tree RAM, and at least 11,560.8 MiB available
system RAM. One fluent evaluator scored five blinded English samples:
intelligibility 5.0/5, pronunciation 4.6/5, language stability 4.8/5,
naturalness 4.2/5, prosody 3.8/5, and overall usefulness 4.8/5, with zero
meaning-changing defects and zero wrong-language outputs. The private
scorecard, audio, maps, raw metrics, and complete session were deleted before
the content-safe
[`piper-english-result-v8.json`](../../../benchmarks/tts/piper-english-result-v8.json)
was written. All conjunctive v8 gates pass.

Decision: admit exact
`piper-1-4-2-onnx-cpu-en-us-joe-medium-v1` to Milestone 6 product integration
as the English CPU profile. This evidence does not yet make it selectable or
supported in the current application, and M011 still owns runtime/model
distribution and license fulfillment.

### Milestone 4: Run bounded sequential candidate and Qwen control screens

**Status:** Complete as of 2026-07-30. Corrective v9/v11 produced real MOSS
and Chatterbox evidence, the maintainer reviewed both private bilingual sample
sets, content-safe summaries were retained, and the private scorecards,
blinded maps, generated audio, and complete raw sessions were deleted.

1. Run exact Qwen/Serena Spanish and Qwen/Aiden English independently through
   the existing-engine control gates. Stop only the failing exact identity and
   do not share voice/language quality evidence.
2. Screen exact Chatterbox Multilingual V3 for license/voice provenance,
   offline Windows execution, Spanish and English intelligibility,
   naturalness, hallucination/repetition, startup, RTF, RAM/VRAM, cancellation,
   cleanup, and service-boundary fit.
3. Screen exact MOSS-TTS-Nano 100M ONNX through the same candidate-neutral
   gates.
4. Retain the Milestone 1 CosyVoice intake rejection; do not create an
   environment or execute it in v8.
5. Stop an unsafe or invalid execution and remove its untracked artifacts
   through the documented cleanup path, but do not convert that stop into a
   candidate rejection.
6. Report measurements and quality evidence. Ask the maintainer before
   recording any rejection.

Exit with content-safe screen summaries and zero or one selected full-matrix
new-engine survivor plus independent Qwen profile decisions.

Actual result: Chatterbox completed 10/10 generation cases and 8/8
cancellation trials at about 0.65 warm p95 RTF in both languages. The
maintainer rated it highly, with cross-language accent limitations, and
selected it as the sole new-engine full-matrix survivor. MOSS also completed
10/10 generations and 8/8 cancellation trials at 0.50 Spanish and 0.43
English warm p95 RTF, but the maintainer reported dialogue-tail omission in
both languages and did not prefer the accent; MOSS is deferred without
rejection. Existing Qwen/Serena Spanish and Qwen/Aiden English remain separate
hardware-dependent constrained-buffer candidates. Their approximately 1.44
RTF on this laptop is not an automatic blocker and does not predict
performance on a stronger compatible GPU. ADR-0029 and `selection-v11.md`
record this routing without changing runtime support.

### Milestone 5: Freeze and execute the corrective full evaluation

**Status:** Complete as of 2026-07-30. Result-blind v12 authority was committed
before execution; the complete matrix, three private quality reviews,
content-safe derivation, cleanup, and maintainer decisions are recorded.

1. Before any new result, freeze a new numbered authority that preserves the
   v8 Qwen, v9 MOSS, and v11 Chatterbox evidence unchanged.
2. Run the complete frozen Spanish/English machine, quality, performance,
   memory, cancellation, cleanup, privacy, and long-form matrix for exact
   Chatterbox profile `chatterbox-multilingual-v3-cuda-bf16-default-v4`.
3. Retain the existing language-specific Qwen measurements as constrained
   buffer capacity evidence and collect independent result-neutral private
   quality evidence for Qwen/Serena Spanish and Qwen/Aiden English. Treat the
   `RTF <= 1.1` standard target as advisory for this path.
4. Present any failure, limitation, or blocked execution to the
   maintainer before deciding whether to reject, defer, retain, or advance the
   candidate.
5. Validate ancestry, hashes, schemas, derived summaries, evaluator
   completeness, and content safety.
6. Accept the next numbered ADR that either admits exact profiles with
   explicit language, hardware, voice, and constrained-buffer limitations or
   records why a profile remains development-only or deferred.
7. Update the support matrix without editing historical M010 or v7-v11
   authority and results.

Exit only when the decision follows frozen evidence and does not overstate
language, hardware, voice, quality, performance, or distribution support.

### Milestone 6: Integrate admitted bilingual profiles

**Status:** Complete as of 2026-07-30. Implementation checkpoint `fea11d4`.

1. Integrate Piper English only if Milestone 3 admits it.
2. Integrate Chatterbox only if Milestone 5 admits its exact profile.
3. Make Qwen/Serena Spanish and Qwen/Aiden English selectable only if
   Milestone 5 accepts their independent quality decisions and the measured
   host satisfies the exact profile. Keep slower-than-real-time Qwen behind
   the existing bounded constrained-buffer behavior.
4. Keep candidate dependencies isolated in exact lockfiles and preserve one
   native-owned service tree.
5. Add the exact adapter, profile registry entry, native configuration gate,
   host matching, settings availability, pre-start recheck, recovery mapping,
   and deterministic fakes.
6. Keep protocol v1 unchanged unless a concrete admitted requirement proves
   it insufficient; any protocol change requires separate versioned authority
   and conformance fixtures before implementation.
7. Prove ordered bounded buffering, M008.1 transitions, synchronization,
   language/profile switching, identity-first cancellation, explicit recovery,
   cleanup, and no generated-audio persistence.

Exit when all admitted paths pass model-free repository tests and exact-profile
integration evidence without regressing Spanish Piper narration.

Actual result: the executable registry, host matcher, compatibility UI,
pre-start recheck, typed desktop client, native supervisor, and Python adapters
now expose the exact admitted language/profile combinations. Piper English
uses its exact `joe` ONNX voice; Chatterbox uses one exact bilingual CUDA
profile; and Qwen switches between Serena/Spanish and Aiden/English while
remaining development-only and constrained-buffered. Unsupported and
wrong-language combinations fail closed, profile or language changes replace
the generation identity before cleanup, and no automatic engine failover was
introduced. Protocol v1 did not require a public change.

Model-free validation passed with 429 desktop tests plus seven Node tests, 347
Python tests, 41 Rust tests, TypeScript type checking, Ruff formatting/lint,
strict mypy, and a release Tauri build. The content-safe exact-host matrix then
ran all six service arms sequentially—Piper Spanish, Piper English,
Chatterbox Spanish, Chatterbox English, Qwen Serena Spanish, and Qwen Aiden
English—and proved load/warmup, bounded synthesis, busy handling,
identity-first cancellation, reload, second synthesis, shutdown, cleanup, and
zero retained audio. Milestone 7 still owns packaged EPUB journeys,
portfolio-level performance/underrun evidence, privacy scans, and final plan
closeout.

### Milestone 7: Validate the bilingual portfolio demo and close the plan

**Status:** Not started.

1. Run synthetic Spanish and English EPUB journeys on the exact host for
   open/restore, explicit language selection, narration start, highlighting,
   leaf navigation, pause/resume, profile switch, language switch, failure,
   one explicit recovery, stop, book replacement, and application exit.
2. Measure first audible output, sustained RTF, underruns, intentional
   transition time, RAM/VRAM, cancellation latency, and cleanup for every
   admitted exact profile.
3. Confirm buffers and work queues remain bounded and generated audio is not
   persisted.
4. Run privacy and repository scans and confirm no private EPUB, prose,
   generated audio, weights, environment, raw scorecard, path, or secret is
   tracked.
5. Reconcile the roadmap, MVP, project brief, documentation index,
   architecture overview, system diagram, support matrix, setup, and
   troubleshooting with actual evidence.
6. Run all applicable repository validation and required Ubuntu/Windows
   pull-request checks.
7. Move this ExecPlan to `docs/plans/completed/` only after required checks
   pass and final evidence is recorded.

Exit when the portfolio demo and repository satisfy the definition of done, or
when an honest no-winner decision is fully documented and M011 can proceed
with the remaining admitted profiles.

## Testing and benchmark strategy

### Deterministic tests

- Unit tests for English normalization, Unicode/code-point preservation,
  locator range mapping, bounds, and unchanged Spanish fixtures.
- Product tests for explicit language choice, accessible names, bounded
  persistence, invalid combinations, compatibility messaging, and preference
  restoration.
- Coordinator/supervision tests for identity replacement, cancellation,
  stale suppression, one-child ownership, cleanup, recovery, and restart from
  the canonical locator.
- Service and adapter tests with fakes for exact input formatting, native audio
  conversion, invalid/empty output, timeouts, and content-free failures.
- Authority tests for frozen bytes, hashes, schemas, strict Git ancestry,
  result completeness, and private-content rejection.

### Exact-profile evidence

- Use only repository-owned synthetic Spanish and English corpus text in
  committed or derived evidence.
- Run acquisition separately, then block the exact candidate interpreter from
  outbound access for evaluation.
- Use one fluent evaluator for each active language. Record only bounded
  content-free scores and enumerated defects in committed summaries.
- Measure startup, first audible output, RTF, underruns, RAM, VRAM,
  cancellation, process-tree cleanup, invalid audio, repetition,
  hallucination, meaning change, and long-form stability.
- Do not run a full matrix after an exact screen already rejects a candidate.

### Existing repository commands

Run the smallest applicable checks after each milestone and the complete
available suite before closeout:

- `pnpm.cmd --filter @voxleaf/epub test`
- `pnpm.cmd --filter @voxleaf/epub typecheck`
- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd test:browser`
- `pnpm.cmd test:native-startup`
- `pnpm.cmd check:portable`
- `pnpm.cmd check`

New result-bearing benchmark commands must be added to repository
configuration and documented by Milestone 1 or 3 before use; this plan does
not pretend that such commands already exist. Exact-host and firewall-backed
commands run only after their committed authority and setup instructions are
available.

## Risks and rollback

- **English normalization regresses Spanish:** preserve historical fixtures,
  make language explicit, and revert the new profile/selection without
  changing `narration-v1` or `narration-piper-v2`.
- **Voice license or provenance is ambiguous:** reject or block that exact
  profile. Do not replace it silently with another voice.
- **Candidate artifacts exhaust disk/RAM/VRAM:** screen sequentially, keep one
  candidate environment active at a time, enforce preflight margins, and
  clean untracked artifacts through verified candidate-specific paths.
- **New engine requires incompatible text shaping:** document the exact
  adapter-only need; do not move canonical normalization into the service.
- **Language/profile switch leaks stale audio:** invalidate identity first,
  stop ownership, verify cleanup, then create the new episode.
- **Naturalness improves but performance fails:** reject product admission;
  samples alone cannot override startup, RTF, cancellation, or memory gates.
- **One-day timebox expires:** record completed screens and blockers without
  lowering gates. Continue M011 with the existing M010 support matrix.
- **Integration destabilizes the portfolio demo:** remove the new registry
  entry and service adapter while retaining the isolated evidence and the
  supported Piper Spanish path.

Rollback is additive and identity-safe: newly admitted profile records,
candidate locks, adapters, and UI options can be removed without rewriting
historical M005-M010 authority or user book state. Never use rollback to alter
committed benchmark authority after results.

## Progress log

- **2026-07-30:** Completed Milestone 6 at implementation checkpoint
  `fea11d4`. Added exact language-bound registry and host requirements,
  supported Piper/joe English and Chatterbox bilingual adapters, retained
  Qwen/Serena Spanish and added Qwen/Aiden English behind the
  development-only gate, and extended native supervision without changing
  protocol v1 or one-process ownership. Model-free desktop, Python, and Rust
  suites passed, as did TypeScript, Ruff, mypy, and release build validation.
  A content-safe sequential six-arm exact-host service matrix passed
  load/warmup, bounded synthesis, busy/cancellation/reload, second synthesis,
  shutdown, and cleanup for every admitted language/profile binding. No audio,
  model artifacts, book text, or private paths were retained.
- **2026-07-30:** Recorded, without scheduling, a possible follow-up after
  M010.1 closes: improve the portfolio-facing reader interface and replace the
  current `1.0x`-only policy with an engine-neutral post-generation playback
  control offering `1.0x`, `0.9x`, `0.8x`, `0.7x`, and `0.6x`. No M010.2
  ExecPlan, authority, roadmap commitment, or implementation was created. The
  maintainer will reevaluate the idea after M010.1 is complete.
- **2026-07-30:** Completed Milestone 5. Chatterbox finished the complete
  bilingual v12 matrix with 5/5 cold loads, 20/20 warm attempts, 30/30
  sustained attempts, and 8/8 cancellation trials. Spanish/English total
  sustained RTF were 0.523/0.537; peak process-tree RAM was 4.88 GiB and peak
  dedicated VRAM was 3.56 GiB. All privacy, offline, bounded-retention, and
  cleanup audits passed. One fluent bilingual maintainer reviewed five fresh
  samples for each Chatterbox language and each Qwen language profile.
  Chatterbox had zero meaning-changing or wrong-language outputs and was
  admitted for Spanish and English. Qwen/Serena Spanish scored strongly and
  was retained; Qwen/Aiden English received 5.0 in every dimension and was
  admitted as the English configuration of the existing engine. Every private
  scorecard, waveform, map, and raw session was deleted after guarded
  derivation. `selection-v12.md`, ADR-0031, and support/integration matrix v2
  record the decisions; Milestone 6 later integrated the admitted paths.
- **2026-07-30:** The exact v12 Chatterbox machine matrix completed all five
  cold loads, 50 generation attempts, and eight cancellation trials. Offline
  isolation, artifact, privacy, bounded-retention, and cleanup audits passed.
  Cold-load time and process RAM exceeded preferred advisory targets; v12
  correctly retains these as observations for the maintainer rather than
  automatically rejecting the candidate. The first private-quality attempt
  exposed a process-boundary defect: the locked model-only environment does
  not include the service's JSON Schema dependency. Moved machine-journal
  schema validation to a closed service-interpreter subprocess without
  changing the frozen candidate lock or allowing the service validator to
  perform inference.
- **2026-07-30:** The first v12 preflight stopped before model loading on
  `result-before-authority`. The v12 authority tree and ancestry were valid;
  the cause was the reused v11 helper's unreachable pre-squash hard-coded SHA.
  Replaced that helper dependency with the same exact host/artifact/network
  checks plus v12's commit-tree proof. Focused Ruff, strict mypy, and nine
  authority/workflow tests pass. This was a pre-result implementation repair,
  not a model failure or candidate decision.
- **2026-07-30:** Committed the result-blind v12 authority at
  `0b90fa2c16cdb276550ad3c3a58a2d84e1509876` before implementing or running
  any result-bearing command. Added the generic bounded bilingual full
  protocol, exact Chatterbox preflight/matrix command, candidate-interpreter
  private quality workflow, guarded content-safe derivation, and private
  cleanup. Model-free validation proves five cold loads, 20 warm attempts, 30
  sustained attempts, eight cancellation trials, and independent
  language-specific quality aggregation. All 336 Python tests, strict mypy,
  Ruff formatting, and Ruff lint pass. No v12 audio or result has been
  generated yet.
- **2026-07-30:** Began Milestone 5 on
  `feat/m010-001-corrective-full-evaluation`. Added result-blind v12 authority
  for the complete Chatterbox bilingual/sustained matrix and two independent
  Qwen language-quality controls. V12 preserves the exact v8 Qwen, v9 MOSS,
  and v11 Chatterbox results; keeps the standard RTF target advisory for
  constrained buffering; forbids automatic rejection; and requires a
  maintainer decision after private review. No new audio or result exists at
  this checkpoint.
- **2026-07-30:** Completed corrective Milestone 4. V11 Chatterbox completed
  10/10 bilingual cases and 8/8 cancellation trials with about 0.65 warm p95
  RTF; the maintainer rated it very good with cross-language accent
  limitations and advanced it as the sole new-engine full-matrix survivor. V9
  MOSS completed the same machine/cancellation counts more quickly and with
  zero VRAM, but the maintainer reported bilingual dialogue-tail omission and
  did not prefer its accent, so it is deferred without rejection. Existing
  Qwen/Serena Spanish and Qwen/Aiden English remain independent
  hardware-dependent constrained-buffer candidates; their approximately 1.44
  RTF on this laptop is not an automatic blocker. ADR-0029 and
  `selection-v11.md` record the routing.
- **2026-07-30:** Added a fail-closed content-safe result derivation and
  cleanup command. It validated both frozen authorities, raw sessions,
  blinded maps, and one-evaluator scorecards before deleting the downloaded
  scorecards, generated waveforms, maps, and complete ignored v9/v11 sessions.
  Only the schema-valid MOSS v9 and Chatterbox v11 summaries remain.
- **2026-07-30:** The exact v11 Torch 2.9.1+cu128 compatibility environment
  supported the RTX 5060 `sm_120` host and produced real Chatterbox inference.
  All ten Spanish/English cases and all eight cancellation trials completed.
  Spanish first-audio p95 was 3.923 seconds with 0.646 warm p95 RTF; English
  first-audio p95 was 4.227 seconds with 0.650 warm p95 RTF. Peak
  process-tree RAM was about 4.88 GiB and peak dedicated VRAM about 3.51 GiB.
  The preferred cold-load and process-RAM targets remain documented
  observations rather than automatic candidate rejection.
- **2026-07-29:** The exact v10 Torch 2.6.0+cu124 runtime reached local
  Chatterbox model loading but stopped before inference on the exact NVIDIA
  GeForce RTX 5060 Laptop GPU. The host reports CUDA capability 12.0
  (`sm_120`), while the frozen Torch build supplies kernels only through
  `sm_90`; the first CUDA operation failed because no compatible kernel image
  was available. This remains a configuration observation,
  not model evidence or rejection. Preserved v9/v10 and froze separate v11
  experimental compatibility authority with exact Torch/Torchaudio
  2.9.1+cu128 before another attempt.
- **2026-07-29:** Corrective v9 completed real MOSS machine inference rather
  than reusing the historical configuration stop. All ten Spanish/English
  cases and all eight cancellation trials completed. Spanish warm p95 RTF was
  0.496 with 5.07-second first-audio p95; English warm p95 RTF was 0.425 with
  3.91-second first-audio p95. Peak process-tree RAM was about 1.78 GiB and no
  advisory observation was raised. Ten private listening samples were
  generated and remain ignored pending maintainer review; no candidate
  decision has been recorded.
- **2026-07-29:** The v9 Chatterbox environment stopped before model loading
  because its lock resolved the Windows PyPI `torch 2.6.0+cpu` wheel. This is
  a configuration observation, not a model result or rejection. Preserved v9
  and its MOSS evidence unchanged, then froze candidate-specific v10 authority
  with a new CUDA 12.4 environment requiring exact Torch/Torchaudio
  2.6.0+cu124 before another Chatterbox attempt.
- **2026-07-29:** Reopened Milestone 4 after maintainer review found that v8
  had applied the `RTF <= 1.1` preferred standard-profile target as an
  automatic blocker despite ADR-0015's approved constrained buffered Qwen
  mode. Preserved every v7/v8 byte and result, then froze corrective v9
  authority. V9 treats the existing approximately 1.44 Qwen RTF as advisory
  capacity evidence, requires real bounded Chatterbox and MOSS inference, and
  requires an explicit maintainer decision before any model rejection.
  Chatterbox now has a separate exact source-revision lock that supports
  explicit V3 loading; MOSS v9 records the actual model and codec artifacts at
  the already frozen upstream revisions.
- **2026-07-29:** Completed Milestone 4 with zero new-engine full-matrix
  survivors under historical v8 interpretation. The exact MOSS source and environment installed successfully,
  and exact revision
  `f52645cb467506d8e18e746ddd59482685b74e58` was requested into the ignored
  model root. The downloaded revision did not match the frozen v8 artifact
  authority: for example, `moss_tts_decode_step.onnx` was 291,483 bytes
  instead of 373,544 bytes, `moss_tts_local_cached.onnx` was absent, and
  `tts_browser_onnx_meta.json` was 4,487 bytes instead of 96,845 bytes.
  Execution stopped immediately with `model-load-failed`; the codec download,
  firewall change, inference, audio generation, measurements, cancellations,
  and quality review did not run. The ignored partial model root and candidate
  environment were deleted before retaining only
  `moss-bilingual-screen-result-v8.json`. CosyVoice remains rejected at intake
  and was neither installed nor run.
- **2026-07-29:** Rejected the exact Chatterbox Multilingual V3 screen before
  model acquisition or inference. The exact frozen environment installed
  successfully, but inspection of `chatterbox-tts==0.1.7` showed that its
  offline `from_local` loader requires
  `t3_mtl23ls_v2.safetensors`, while the frozen v8 candidate requires
  `t3_mtl23ls_v3.safetensors`. Its alternative `from_pretrained` path is
  revision-`main` network acquisition, which cannot substitute for the frozen
  local identity. The screen therefore stopped immediately with
  `model-load-failed`; no model artifacts, inference, generated audio, timing,
  memory, cancellation, or quality measurements were produced. The ignored
  candidate environment was removed through the verified exact-path cleanup
  before retaining only
  `chatterbox-bilingual-screen-result-v8.json`.
- **2026-07-29:** Completed the independent Aiden/English control at execution
  commit `1e93f97f0632b7c677160e5254326a9984348509`. All five first-attempt
  generations completed, but the profile was rejected before quality on
  first-audio, warm-RTF, cancellation, and process-tree RAM gates.
  Content-safe evidence records 11.947 seconds first-audio p95, 1.454 warm
  p95 RTF, 4,647,976,960 peak process-tree RAM, 4,791,521,280 peak dedicated
  VRAM, and two of four cancellation trials completed before the
  complete-waveform boundary failed the next trial. The private session,
  generated audio, and exact temporary control files were deleted before
  `qwen-aiden-english-control-result-v8.json` was retained. No Serena scores,
  samples, or decision were reused.
- **2026-07-29:** Installed and verified the exact Qwen interpreter outbound
  block, then completed the first permitted Serena/Spanish control at
  execution commit `5d821b9351a7335cc2cf205bccbb58974161f22f`.
  All five first-attempt generations completed, but the exact profile was
  rejected before quality on cold-load, first-audio, warm-RTF, cancellation,
  and process-tree RAM gates. Content-safe evidence records 15.887 seconds
  first-audio p95, 1.439 warm p95 RTF, 4,638,187,520 peak process-tree RAM,
  4,825,075,712 peak dedicated VRAM, and two of four cancellation trials
  completed before the complete-waveform boundary failed the next trial. The
  full private session and generated audio were deleted before
  `qwen-serena-spanish-control-result-v8.json` was retained. Review also fixed
  a result-derivation classification defect so a cancellation failure no
  longer falsely marks five completed generations as failed first attempts;
  the rejection itself is unchanged.
- **2026-07-29:** Began Milestone 4 on
  `feat/m010-001-candidate-qwen-screens`. Added a v8-only bounded screen
  protocol with one cold load, one warm first attempt per frozen case, four
  cancellation trials per evaluated language, process-tree RAM and WDDM plus
  framework VRAM measurement, exact Qwen/Serena and Qwen/Aiden built-in voice
  identities, closed-stdin commands, repository-environment raw validation,
  immediate machine-rejection derivation, private-session cleanup, and
  model-free regression coverage. The executable result-bearing checkpoint is
  `5b64bb0aac45a143d0806edc6cbd403b4257b737`; focused Ruff, mypy, and 19
  pytest cases pass.
- **2026-07-29:** Ran the first required Serena/Spanish preflight at
  `5b64bb0aac45a143d0806edc6cbd403b4257b737`. The exact ignored model
  artifacts and current host thresholds passed, but the only installed
  `VoxLeaf TTS Benchmark Offline` rule targets the Piper interpreter. The
  Qwen preflight therefore failed closed with only `network-isolation`, and
  no inference, raw session, generated audio, Aiden run, or new-engine screen
  began. A direct `New-NetFirewallRule` attempt returned Windows access
  denied; an administrator must add the exact Qwen interpreter rule before
  sequential execution can resume.
- **2026-07-29:** Completed Milestone 3. The exact isolated Piper/joe English
  CPU matrix passed all machine, performance, memory, cancellation, quality,
  privacy, offline, and cleanup gates. The five-sample private evaluation
  recorded no meaning defect or wrong-language output. Derived and retained
  only the schema-valid content-safe v8 result, deleted the complete private
  session, and admitted this exact profile for later Milestone 6 integration;
  no runtime registry or support claim changed.
- **2026-07-29:** Began Milestone 3 on
  `feat/m010-001-piper-english-baseline`. Acquired the exact ignored
  Piper/joe English artifacts and verified all three frozen sizes and hashes,
  the CC0 model-card provenance, the existing candidate lock, Python 3.12.10,
  Piper 1.4.2, ONNX Runtime 1.27.0, and CPU provider availability. Added a
  v8-only English adapter, bounded 24 kHz conversion, bilingual corpus
  projection, four-trial baseline protocol, content-safe raw schema path,
  closed-stdin commands, disposable blinded English quality workflow,
  content-safe summary derivation, ignored v8 raw root, and deterministic
  regression coverage. Focused Ruff, mypy, and 23 pytest cases pass. The first
  administrator-scoped firewall installation attempt failed with Windows
  access denied, so exact inference remains correctly blocked pending that
  host control.

- **2026-07-29:** Created this ExecPlan after M010 and M008.1 replacement
  Ubuntu/Windows checks passed. Sequenced the bounded bilingual/candidate work
  before M011 while retaining Spanish-only current-state claims.
- **2026-07-29:** Selected Chatterbox Multilingual V3 and MOSS-TTS-Nano 100M
  ONNX as the first two sequential screens. Retained Fun-CosyVoice3 0.5B as a
  conditional third screen because its common reference-audio path and Windows
  packaging boundary require earlier rejection space and explicit intake.
- **2026-07-29:** Selected exact Piper `en_US-joe-medium` only as the proposed
  English baseline; Milestone 1 subsequently froze its artifacts, hashes,
  license, provenance, offline boundary, conversion, and distribution
  deferral before execution.
- **2026-07-29:** Froze the bilingual product and normalization authorities,
  the balanced 10-case v7 corpus, the 16-case normalization corpus, closed raw
  and summary schemas, exact evaluation gates, and three isolated candidate
  locks. The authority checkpoint is
  `339561acac7cb026f8ec7ea36d177189f2eaf3be`; no v7 result file or generated
  audio exists.
- **2026-07-29:** Completed exact candidate intake. Piper
  `en_US-joe-medium`, Chatterbox Multilingual V3 with its official bundled
  conditioning, and MOSS-TTS-Nano ONNX with built-in `Ava` are admitted only
  to their frozen evaluation stages. CosyVoice is rejected from v7 before an
  environment lock because its reviewed general path requires reference audio
  and supplied no exact non-personal default voice.
- **2026-07-29:** Added fail-closed v7 authority validation and confirmed the
  current Spanish-only product boundary. Focused tests, all isolated lock
  checks, the authoritative Windows aggregate, and the portable aggregate
  pass.
- **2026-07-29:** Before any v7 result, reviewed the official Qwen CustomVoice
  documentation and found that the exact local 1.7B checkpoint supports
  Spanish and English, with Aiden and Ryan documented as native-English
  built-in voices. Preserved v7 and froze layered v8 authority for
  Serena/Spanish and Aiden/English. The remote Alibaba Cloud real-time API,
  Ryan, voice cloning, and voice design remain excluded from this bounded
  cycle.
- **2026-07-29:** Added `profile-v8`, the layered candidate amendment, closed
  v8 schemas, ADR-0025, and fail-closed v8 validation. The 14 focused v7/v8
  tests, Ruff, and mypy pass. No result audio, model artifact, dependency,
  runtime behavior, or support claim was added.
- **2026-07-29:** Committed the result-blind authority at
  `95b0452ffb237284c5ffb54332c578b36e45fdf5`; the production authority-tree
  verifier accepts that exact committed tree. `pnpm.cmd check:portable`
  passed in 36.2 seconds and `pnpm.cmd check` passed in 64.7 seconds. The
  remaining pytest cache warning and existing CSS-highlight/chunk-size build
  warnings are informational.
- **2026-07-29:** Completed Milestone 2 on the versioned model-free boundary.
  Added the exact frozen English normalization allowlist, bilingual public
  preparation profile, bounded language preference, accessible selector,
  immutable profile/language bindings, and pre-child lifecycle enforcement.
  At that checkpoint, Spanish remains the only playable language because no
  English engine is integrated.
- **2026-07-29:** The first portable aggregate correctly rejected edits to
  frozen v6/v8 authority inputs. Restored the historical normalizer, Spanish
  table, and two frozen authority documents byte-for-byte; moved additive v2
  behavior into separate bilingual modules; and confirmed the exact recorded
  hashes plus all 14 focused v6/v8 authority tests.

## Discoveries and decisions

- V11's reusable preflight helper hard-coded the original branch authority SHA.
  After GitHub squash-merged that work, the frozen v11 files remained exact
  but the branch SHA was no longer an ancestor of `main`. V12 therefore
  verifies the complete frozen authority tree at its supplied reachable
  commit and strict ancestry directly; it does not inherit the obsolete v11
  branch-ancestry assumption.
- Current VoxLeaf normalization and product coordination are Spanish-specific;
  English narration is not a UI-only toggle.
- A same-engine English voice is the lowest-risk bilingual baseline, but exact
  voice evidence cannot inherit the passing Spanish/davefx result.
- The candidate order favors Chatterbox for multilingual naturalness potential
  and MOSS ONNX for a small CPU/Windows-oriented path. CosyVoice is rejected
  from v7 because its reviewed path did not prove a non-personal default voice
  compatible with the no-cloning scope.
- Canonical narration preparation stays engine-neutral. Adapter-specific input
  shaping is evidence-driven and comes after shared normalization.
- M010.1 may integrate at most one new engine and must accept no winner as a
  successful bounded outcome.
- M011 remains responsible for production packaging and license fulfillment;
  M010.1 must nevertheless establish whether exact redistribution is legally
  feasible before admitting a profile.
- Candidate intake distinguishes authorization to evaluate from product or
  distribution admission. Chatterbox's bundled conditioning and MOSS's
  built-in voice are sufficient for a no-personal-reference screen but not an
  upstream human-identity claim. Piper, Chatterbox, and MOSS distribution
  obligations remain explicit M011 gates.
- CosyVoice is not a conditional runtime candidate in v7 after intake: the
  absence of a frozen non-personal default voice is a deterministic rejection,
  not an unresolved blocker.
- Native audio conversion is candidate-specific but frozen before results:
  Piper uses bounded linear 22.05-to-24-kHz resampling, Chatterbox is an
  identity 24-kHz mono path, and MOSS uses arithmetic-mean stereo downmix
  followed by bounded linear 48-to-24-kHz resampling.
- Qwen CustomVoice is the correct local default-voice family for this scope;
  the Base checkpoint is a voice-cloning model, not a default-voice
  alternative.
- The official Qwen model card recommends native-language speakers for best
  quality. Aiden is therefore the bounded English profile; Serena remains the
  existing Spanish control despite its Chinese native language and must prove
  Spanish quality independently.
- The Alibaba Cloud real-time API is a separate remote service and voice
  catalog. It cannot satisfy VoxLeaf's local-only privacy boundary and is not
  evidence for the local checkpoint.
- A pull-request squash can replace a branch checkpoint SHA. Result execution
  must therefore name a reachable merged commit whose tree passes the frozen
  authority validator, rather than assuming an unmerged checkpoint remains an
  ancestor.
- Language availability and engine availability are separate. English
  preparation and preference are implemented, while English playback remains
  honestly unavailable until an exact profile passes later gates.
- Configuration replacement requires full service-tree containment after
  generation cancellation; ordinary stale work cannot survive a language or
  profile change.
- Versioned behavior does not authorize mutation of historical evaluation
  inputs. Additive bilingual normalization must remain in separate v2 modules
  while the v1 normalizer, v1 Spanish table, and frozen v8 authority documents
  stay byte-identical to their committed hash authority.
- Exact Piper English evidence cannot be inherited from Piper Spanish, but the
  independently frozen `en_US-joe-medium` profile passed every v8 baseline
  gate. Its lower prosody mean (3.8/5) is a documented limitation, not a gate
  failure, because intelligibility, naturalness, usefulness, language
  stability, meaning, and wrong-language criteria all passed unchanged.
- Historical v8 showed that exact package or repository names do not by
  themselves establish a frozen model identity.
  Chatterbox's pinned package loaded a V2 filename instead of the frozen V3
  checkpoint, while MOSS's exact pinned revision contained ONNX filenames and
  bytes different from the frozen artifact manifest. Both are deterministic
  pre-inference v8 stops. V9 corrects them prospectively without editing v8.
- The v8 Serena and Aiden summaries retain valid measurements but do not decide
  constrained buffered eligibility. Their approximately 1.44 RTF is not an
  automatic blocker or a prediction for stronger compatible GPUs. Both exact
  Qwen language profiles remain eligible for separate quality review and
  hardware-dependent constrained-buffer use.
- Corrective MOSS and Chatterbox screens now have real model evidence.
  Chatterbox is the sole new-engine full-matrix survivor because the
  maintainer preferred its quality and observed no truncation or
  wrong-language output. MOSS is deferred, not rejected, because its
  otherwise-fast CPU path omitted the dialogue tail in both languages and its
  accent was not preferred.
- Chatterbox's exact evaluated API has no native speaking-rate parameter.
  Generation controls such as temperature, exaggeration, and CFG weight are
  not equivalent to pitch-preserving playback speed. Any future speed control
  should remain engine-neutral and separately authorized.
- A possible post-M010.1 playback follow-up would expose exactly `1.0x`,
  `0.9x`, `0.8x`, `0.7x`, and `0.6x`, retain `1.0x` as the default, and slow
  only already-generated playback. It would not rewrite narration text,
  regenerate audio, or add model-specific rate controls. At Qwen's measured
  approximately 1.44 RTF, generation produces about 0.69 seconds of media per
  wall-clock second, so `0.7x` is near the theoretical sustained consumption
  boundary and the existing bounded inter-unit pauses may add limited
  headroom. `0.8x` and `0.9x` improve depletion time but cannot independently
  guarantee uninterrupted Qwen playback. Chatterbox and Piper already produce
  faster than real time on the measured host and do not need slowdown for
  capacity.
- Enabling those rates is not merely activating an unfinished dropdown:
  M008's accepted policy currently admits only `1.0x`. A future authority must
  decide whether pitch-changing Web Audio playback is acceptable or whether
  VoxLeaf must add a bounded pitch-preserving time-stretch path. It must also
  make audible-progress projection, highlighting, heard-position persistence,
  boundary-delay scheduling, buffer forecasts, underrun metrics, mid-unit
  rate changes, accessibility, and bounded non-content preference persistence
  speed-aware.
- The same unscheduled follow-up may reconsider visual hierarchy for a
  portfolio-ready interface: keep the reading surface primary and preserve its
  sole scroll ownership, move infrequent file/profile/language/appearance
  choices into bounded application chrome or settings, keep narration and
  compatibility detail compact and collapsible, and preserve the explicit
  paragraph leaf, active highlight, keyboard access, focus safety, and
  truthful status messages. Exact visual requirements and mockups are not yet
  approved.
- These interface and playback ideas are discussion backlog only. Reevaluate
  them after M010.1 Milestones 6 and 7 finish; create a new result-blind
  authority and ExecPlan only if the maintainer then approves the scope.
- The evaluated Chatterbox path has one bundled default conditioning voice.
  Additional voices require reference conditioning or voice cloning and
  remain outside this no-personal-reference scope.

## Final validation results

Milestone 1 validation on 2026-07-29:

- `pnpm.cmd --filter @voxleaf/epub exec vitest run src/resource/opened-publication.test.ts`
  passed 19 tests, including the current content-safe English rejection.
- `uv run --project services/tts --locked ruff check
services/tts/benchmarks/v7_authority.py
services/tts/tests/test_benchmark_v7_authority.py` passed.
- `uv run --directory services/tts --locked mypy
benchmarks/v7_authority.py tests/test_benchmark_v7_authority.py` passed.
- `uv run --project services/tts --locked pytest -p no:cacheprovider
services/tts/tests/test_benchmark_v7_authority.py` passed 7 tests.
- `uv lock --check` passed for the exact Piper, Chatterbox, and MOSS isolated
  candidate projects.
- The production authority-tree verifier accepted
  `339561acac7cb026f8ec7ea36d177189f2eaf3be` as the exact frozen v7 tree.
- `pnpm.cmd check` passed formatting, linting, type checking, 20 shared test
  files/209 tests, 34 EPUB test files/559 tests, 43 desktop test files/415
  tests, 40 Rust tests, 263 Python tests, native release build, and Python
  package builds.
- `pnpm.cmd check:portable` passed the complementary portable aggregate with
  the same TypeScript and Python suites and portable builds.
- `git diff --check` and a scoped privacy scan found no whitespace error,
  private path, email, credential, model weight, book, or generated-audio
  content.

Milestone 1A focused validation on 2026-07-29:

- `uv run --project services/tts --locked ruff check
services/tts/benchmarks/v8_authority.py
services/tts/tests/test_benchmark_v8_authority.py` passed.
- `uv run --directory services/tts --locked mypy
benchmarks/v8_authority.py tests/test_benchmark_v8_authority.py` passed.
- `uv run --project services/tts --locked pytest -p no:cacheprovider
services/tts/tests/test_benchmark_v7_authority.py
services/tts/tests/test_benchmark_v8_authority.py` passed 14 tests.
- The production authority-tree verifier accepted exact commit
  `95b0452ffb237284c5ffb54332c578b36e45fdf5`.
- `pnpm.cmd check:portable` passed in 36.2 seconds: formatting, lint, all
  TypeScript/Python type checks, 209 shared tests, 559 EPUB tests, 415 desktop
  tests plus seven native-driver client tests, 270 Python tests, and portable
  builds passed.
- `pnpm.cmd check` passed in 64.7 seconds with the same suites plus Rust
  formatting, Clippy, 40 Rust tests, the Tauri release build, and Python
  source/wheel builds.
- `git diff --check`, JSON formatting, exact v7 hash comparison, and a scoped
  privacy/artifact scan passed. No book, generated audio, weight, environment,
  private path, email, credential, runtime dependency, capability, or product
  behavior entered the authority.

The non-failing pytest cache-permission warning and existing Vite
CSS-highlight/chunk-size warnings do not alter test or build outcomes. Browser,
packaged WebDriver, model-backed, audio, and exact-host benchmark runs are not
applicable to this authority-only milestone and were not used as support
evidence. At that authority checkpoint, no English engine,
candidate performance/quality result, or new supported product profile was
claimed.

Milestone 2 focused validation on 2026-07-29:

- `pnpm.cmd --filter @voxleaf/epub test` passed 34 files / 577 tests.
- `pnpm.cmd --filter @voxleaf/epub typecheck` passed.
- `pnpm.cmd --filter @voxleaf/desktop test` passed 44 files / 429 tests plus
  seven native WebDriver-client tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` passed.
- `pnpm.cmd test:browser` completed all six Chromium scenarios successfully.
- `pnpm.cmd test:native-startup` passed the packaged native startup,
  preference, supervised fake-service, cancellation/recovery, EPUB lifecycle,
  synchronization, privacy, and no-external-request matrix.
- `uv run --project services/tts --locked pytest
services/tts/tests/test_benchmark_v6_authority.py
services/tts/tests/test_benchmark_v8_authority.py` passed 14 tests after the
  four frozen authority inputs were restored to their exact recorded hashes.
- `pnpm.cmd check:portable` passed formatting, lint, TypeScript and Python type
  checks, 209 shared tests, 577 EPUB tests, 429 desktop tests plus seven
  native-driver client tests, 270 Python tests, and portable builds.
- `pnpm.cmd check` passed the same suites plus Rust formatting, Clippy, 40 Rust
  tests, the Tauri release build, and Python source/wheel builds.
- No model, candidate runtime, generated audio, book, private path, host
  report, or external request was added or persisted.

Milestone 3 validation on 2026-07-29:

- Exact preflight passed artifact hashes, offline environment, dependency
  lock, interpreter identity, CPU provider, host resource, and
  exact-interpreter outbound-isolation checks.
- The frozen exact-host matrix completed 25 first-attempt generations with
  zero failures and four cancellation trials with zero stale units or
  remaining processes.
- The one-evaluator five-sample English quality review passed every frozen
  quality gate with zero meaning-changing defects and zero wrong-language
  outputs.
- `services/tts/.venv/Scripts/python.exe -m pytest -p no:cacheprovider
--basetemp <workspace-temp> tests/test_benchmark_bilingual_baseline.py
tests/test_benchmark_v8_authority.py` passed 16 tests.
- Focused Ruff and strict mypy passed the English adapter, runner, quality,
  result, and authority-test surfaces.
- `services/tts/.venv/Scripts/python.exe -m pytest -p no:cacheprovider
--basetemp <workspace-temp> .` passed all 279 Python tests.
- `pnpm.cmd check:portable` passed formatting, lint, TypeScript/Python type
  checks, 209 shared tests, 577 EPUB tests, 429 desktop tests plus seven
  native-driver client tests, all 279 Python tests, and portable builds.
- `pnpm.cmd check` passed the same suites plus Rust formatting, Clippy, all 40
  Rust tests, the Tauri release build, and Python source/wheel builds.
- The initial portable attempt was blocked only by sandbox access to the
  user-local uv cache; the required outside-sandbox rerun passed. The initial
  focused pytest attempt similarly could not access pytest's user-temp root;
  its fresh workspace-local basetemp rerun passed.
- `git diff --check`, schema validation of the committed v8 result, and the
  scoped privacy/artifact scan passed. The exported scorecard and complete
  ignored raw session, including generated audio, were deleted before the
  content-safe result was retained.

Historical v8 Milestone 4 validation on 2026-07-29:

- Exact Serena/Spanish and Aiden/English control artifacts, environments,
  offline controls, and interpreter-specific outbound isolation passed
  preflight before their independent measured executions.
- Each Qwen control completed all five first attempts but failed the frozen
  performance, memory, and cancellation conjunction before quality. Their
  private sessions and generated audio were deleted before retaining the two
  content-safe summaries.
- Chatterbox and MOSS stopped before inference at deterministic frozen
  model-identity failures. Their ignored environments and partial MOSS model
  download were deleted; neither result contains fabricated observations.
- Frozen v8 schema validation passed for all four control/screen summaries.
  Focused Ruff and strict mypy passed, and the focused screen/authority pytest
  run passed 13 tests.
- `pnpm.cmd check:portable` passed formatting, lint, TypeScript/Python type
  checks, 209 shared tests, 577 EPUB tests, 429 desktop tests plus seven
  native-driver client tests, all 284 Python tests, and portable builds.
- `pnpm.cmd check` passed the same suites plus Rust formatting, Clippy, all 40
  Rust tests, the Tauri release build, and Python source/wheel builds.
- The first portable run correctly found that the four generated JSON
  summaries needed repository Prettier formatting. Mechanical formatting
  changed no values; all summaries passed schema validation again before both
  aggregates passed.
- `git diff --check` and the scoped privacy/artifact audit passed. No EPUB,
  generated audio, raw session, model weight, candidate environment, secret,
  or private host identity is tracked. The pytest cache-permission warning and
  existing CSS-highlight/chunk-size build warnings remain non-failing.

Corrective Milestone 4 validation on 2026-07-30:

- Exact outbound-isolated v9 MOSS and v11 Chatterbox executions each completed
  10/10 Spanish/English generation cases and 8/8 cancellation trials. Their
  content-safe metrics and limitations are retained in the schema-valid v9 and
  v11 summaries.
- One fluent bilingual maintainer reviewed ten blinded samples per candidate.
  The guarded derivation verified the frozen authority, raw result, raw hash,
  blinded map, sample identity set, score bounds, and scorecard identity before
  cleanup.
- The downloaded scorecards, private maps, generated waveforms, and complete
  ignored v9/v11 raw sessions were deleted. Only content-safe summaries,
  selection v11, and ADR-0029 remain.
- Focused Ruff formatting/lint, strict mypy, and the 16-test candidate-result
  plus v9/v11 authority suite passed.
- `pnpm.cmd check:portable` passed formatting, lint, all TypeScript/Python type
  checks, 209 shared tests, 577 EPUB tests, 429 desktop tests plus seven native
  WebDriver-client tests, all 327 Python tests, portable desktop/package
  builds, and both Python distributions.
- `pnpm.cmd check` passed the same checks plus Rust formatting, Clippy, all 40
  Rust tests, the Tauri release build, and Python source/wheel builds.
- The initial sandboxed portable invocation stopped only because uv could not
  access its user-local cache; the required local outside-sandbox rerun passed.
  The existing pytest cache-permission warning and CSS-highlight/chunk-size
  build warnings remain informational.
- `git diff --check`, explicit v9/v11 summary validation after Prettier, and a
  scoped privacy/artifact scan passed. No EPUB, generated audio, raw session,
  scorecard, model weight, candidate environment, private path, email,
  credential, or secret is tracked by this milestone.

Corrective Milestone 5 validation on 2026-07-30:

- Exact v12 Chatterbox execution completed 5/5 cold loads, 20/20 warm
  attempts, 30/30 sustained attempts, and 8/8 cancellation trials under
  offline environment controls and the exact interpreter-bound outbound block.
- The three blinded private reviews covered 10 Chatterbox bilingual samples,
  five Qwen/Serena Spanish samples, and five Qwen/Aiden English samples. The
  guarded derivation validated every scorecard and authority binding before
  deleting all downloaded forms, waveforms, maps, and raw sessions.
- `uv run --project services/tts --locked pytest
services/tts/tests/test_benchmark_v12_authority.py
services/tts/tests/test_benchmark_corrective_v12.py` passed 10 tests. The
  focused format, Ruff, and strict-mypy checks also passed.
- `pnpm.cmd check:portable` passed formatting, lint, all TypeScript/Python
  type checks, 209 shared tests, 577 EPUB tests, 429 desktop tests plus seven
  native WebDriver-client tests, all 337 Python tests, portable
  desktop/package builds, and both Python distributions.
- `pnpm.cmd check` passed the same checks plus Rust formatting, Clippy, all 40
  Rust tests, the Tauri release build, and Python source/wheel builds.
- The sandboxed focused uv invocation initially lacked access to the
  user-local cache; its required local outside-sandbox rerun passed. The
  existing pytest cache-permission warning and CSS-highlight/chunk-size build
  warnings remain informational.
- Schema validation passed again after mechanical Prettier formatting.
  `git diff --check`, staged privacy scanning, and private-session inspection
  found no EPUB, generated audio, raw session, scorecard, model weight,
  candidate environment, private path, email, credential, or secret.

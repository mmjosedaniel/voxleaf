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

Until those checks pass, current narration remains Spanish-only,
Piper/davefx remains the sole supported and automatically recommendable
profile, and Qwen/Serena remains development-only.

## Current state

Completed M005 implements deterministic, bounded, locator-linked narration
preparation. Its public language boundary accepts Spanish or undetermined
input, and its Spanish normalization is byte-frozen by
[`narration-normalization-v1.md`](../../architecture/narration-normalization-v1.md).
Completed M010 adds the separate Piper-only
[`narration-piper-v2`](../../architecture/piper-narration-preparation-profile-v2.md)
spoken-expansion-aware path for exact `es_ES-davefx-medium`.

Milestone 2 now lets the desktop explicitly select Spanish or English and
dispatches the selected language through `narration-bilingual-v2`. The
executable profile-language registry still has no admitted English profile,
so English selection reports a content-free unavailable state and starts no
child. No existing result proves English audio.

Exact Piper 1.4.2 / `es_ES-davefx-medium` is the sole supported profile.
Qwen3-TTS 12Hz 1.7B CustomVoice / Serena is an optional native-gated
development profile. The existing M010 support matrix remains authoritative
unless this plan later records a newly admitted exact profile.

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
- [ADR-0024](../../architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md)
- [ADR-0025](../../architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md)
- [v7 candidate manifest](../../../benchmarks/tts/candidates-v7.json)
- [v7 evaluation profile](../../../benchmarks/tts/profile-v7.json)
- [v8 candidate amendment](../../../benchmarks/tts/candidates-v8.json)
- [v8 evaluation profile](../../../benchmarks/tts/profile-v8.json)
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

Screen candidates sequentially. Reject immediately on unresolved licensing or
voice provenance, mandatory online inference, inability to run offline on the
exact Windows host, unsafe resource fit, failed startup/cancellation, invalid
audio, hallucination/repetition/meaning change, or inability to fit the
service and repository boundaries. Do not spend the full matrix on an
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
by immutable language binding, and rejects English before child start because
no English profile is admitted. Configuration replacement invalidates work,
cancels preparation/synthesis, releases buffered/current audio, contains the
service tree, retains the canonical target, and requires explicit Play. No
model, candidate dependency, audio persistence, or book-content storage was
added.

### Milestone 3: Evaluate the exact Piper English baseline

**Status:** In progress.

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

Actual result to date: the three frozen `en_US-joe-medium` artifacts were
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
expanded focused suite passes 23 tests. No Piper English waveform or result
has been produced yet: the exact
candidate interpreter still requires its administrator-installed outbound
firewall block before preflight can admit the run.

### Milestone 4: Run bounded sequential candidate and Qwen control screens

**Status:** Not started.

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
5. Stop each rejected candidate immediately and remove its untracked artifacts
   through the documented cleanup path.
6. Rank only gate-passing exact profiles; upstream samples and family claims
   cannot override a failed VoxLeaf gate.

Exit with content-safe screen summaries and zero or one selected full-matrix
new-engine survivor plus independent Qwen profile decisions.

### Milestone 5: Execute the full frozen v8 evaluation and record the decision

**Status:** Not started.

1. Run the complete language-specific matrix for each passing Qwen control.
2. If a new-engine screen survivor exists, run the complete frozen
   Spanish/English
   machine, quality, performance, memory, cancellation, cleanup, and privacy
   matrix on the exact host.
3. If no survivor exists, record the frozen screen rejections and skip the
   full matrix rather than manufacturing a winner.
4. Validate ancestry, hashes, schemas, derived summaries, evaluator
   completeness, and content safety.
5. Accept the next numbered ADR that either admits one exact profile with
   explicit margins/limitations or records no passing naturalness candidate.
6. Update the support matrix without editing historical M010 or v7 files.

Exit only when the decision follows frozen evidence and does not overstate
language, hardware, voice, quality, performance, or distribution support.

### Milestone 6: Integrate admitted bilingual profiles

**Status:** Not started.

1. Integrate Piper English only if Milestone 3 admits it.
2. Integrate at most one new engine only if Milestone 5 admits it.
3. Keep candidate dependencies isolated in exact lockfiles and preserve one
   native-owned service tree.
4. Add the exact adapter, profile registry entry, native configuration gate,
   host matching, settings availability, pre-start recheck, recovery mapping,
   and deterministic fakes.
5. Keep protocol v1 unchanged unless a concrete admitted requirement proves
   it insufficient; any protocol change requires separate versioned authority
   and conformance fixtures before implementation.
6. Prove ordered bounded buffering, M008.1 transitions, synchronization,
   language/profile switching, identity-first cancellation, explicit recovery,
   cleanup, and no generated-audio persistence.

Exit when all admitted paths pass model-free repository tests and exact-profile
integration evidence without regressing Spanish Piper narration.

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
  Spanish remains the only playable language because no English engine is
  admitted.
- **2026-07-29:** The first portable aggregate correctly rejected edits to
  frozen v6/v8 authority inputs. Restored the historical normalizer, Spanish
  table, and two frozen authority documents byte-for-byte; moved additive v2
  behavior into separate bilingual modules; and confirmed the exact recorded
  hashes plus all 14 focused v6/v8 authority tests.

## Discoveries and decisions

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
evidence. The plan remains active for Milestone 3; no English engine,
candidate performance/quality result, or new supported product profile is
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

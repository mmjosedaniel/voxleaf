# Resolve the local TTS profile blocker

## Relationship to Milestones 6 and 7

Roadmap Milestone 6 is complete and its accepted evidence remains unchanged.
The completed
[`M006-local-tts-feasibility-and-engine-profiles.md`](../completed/M006-local-tts-feasibility-and-engine-profiles.md)
plan and
[ADR-0013](../../architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md)
reject only the exact Qwen3-TTS 0.6B CustomVoice/Aiden and Supertonic 3/F1
profiles measured under `tts-feasibility-profile-v2`.

This follow-up plan is the approved blocker-resolution work between Milestones
6 and 7. It does not reopen or rewrite the `v2` results. It must either produce
a newly frozen and fully passing profile plus a superseding ADR, or retain the
Milestone 7 blocker with better evidence.

## Goal

Determine whether an exact local TTS profile can satisfy VoxLeaf's quality,
startup, sustained generation, memory, cancellation, offline, privacy,
licensing, cleanup, and packaging gates without buying different development
hardware.

The primary new candidate direction is Qwen3-TTS 12Hz 1.7B CustomVoice using
one built-in speaker and one neutral Spanish audiobook instruction selected
under a frozen bounded screening protocol. The Base voice-cloning path is
outside the current MVP because the product requires a default narrator rather
than a user voice clone. OpenAI Whisper is rejected as a production TTS
candidate because it recognizes speech and emits text rather than synthesizing
speech from text.

## User-visible outcome

This plan has no immediate user-visible production feature. If it succeeds,
Milestone 7 receives one exact, measured local TTS integration target and can
begin a separate process/protocol implementation plan. If it fails, VoxLeaf
retains a truthful blocker instead of integrating a model that cannot meet the
reader's startup, cancellation, quality, privacy, or resource requirements.

The selected candidate must require no user voice enrollment or reference
audio. Voice cloning, voice design, impersonation features, and generated-audio
export remain outside the MVP. Any future production voice-cloning experience
requires a separate product, consent, privacy, and persistence decision.

## Current state

### Accepted VoxLeaf evidence

- The candidate-neutral `v2` harness, deterministic model-free tests, exact
  candidate environments, privacy-safe summaries, manual quality workflow,
  hardware measurement, cleanup, and CI closeout are implemented.
- The exact 0.6B CustomVoice/Aiden Qwen profile passed cold load, RAM, VRAM,
  offline, artifact, cleanup, and license gates but failed first-audio,
  time-to-15-seconds, shorter-complete, RTF, zero-failure, mid-generation
  cancellation, complete-panel, and zero-defect quality gates.
- The exact Supertonic CPU profile passed most numeric/resource gates but
  failed first-audio, zero-failure, mid-generation cancellation,
  complete-panel, and zero-defect quality gates.
- Both adapters exposed complete waveforms. Neither proved incremental local
  audio delivery or usable cancellation after audio began.
- The exact `v3` development prototype now proves bounded complete-segment
  delivery, identity-first stale rejection, and worker-termination
  cancellation on the authoritative host. It does not yet supply official
  performance/quality results or a production runtime.
- The production `services/tts` package still has zero runtime dependencies.

### Maintainer-provided Qwen voice-cloning prototype

The maintainer has a separate, external WSL prototype that was inspected
read-only. It is not copied into VoxLeaf and its private inputs and outputs are
not repository evidence.

Because the clarified MVP requires a built-in default narrator, this Base
voice-cloning prototype is now hardware/runtime and implementation-pattern
intake evidence only. Its model, prompt, reference inputs, ICL result, and
x-vector result are not the Milestone 6.1 candidate.

The inspected current prototype:

- uses `qwen-tts==0.1.1`, PyTorch `2.11.0+cu128`, CUDA bfloat16, and
  `Qwen/Qwen3-TTS-12Hz-1.7B-Base`;
- observed local model snapshot
  `fd4b254389122332181a7c3db7f27e918eec64e3`;
- builds one reusable voice-clone prompt before generating paragraphs;
- uses a local 24 kHz mono reference of 22.75 seconds with an exact
  54-word transcript;
- defaults to one generation unit per batch and explicitly releases cached
  CUDA allocations between units;
- supports transcript-conditioned ICL cloning and
  speaker-embedding-only `x_vector_only_mode`;
- uses capped retries, optional paragraph subdivision, silence markers,
  energy/Silero VAD review, tail trimming, and small start fades; and
- writes a complete waveform per paragraph and later joins persisted files.

The maintainer reports that transcript-conditioned cloning reproduces the
voice well, while `x_vector_only_mode` sounds robotic but acceptable. This is
useful candidate-intake evidence, not a promotable quality result: it was not
blinded, did not use the frozen corpus/panel, and did not measure the required
latency, throughput, resource, failure, or cancellation gates.

The observed disk footprint was approximately 4.3 GiB for the model cache and
7.8 GiB for the existing Conda environment. Those values overlap neither a
clean production lock nor a packaging audit and must not be treated as an
installer-size claim.

### Reusable prototype ideas

The following concepts should inform the blocker-resolution prototype without
copying the personal batch-audiobook implementation:

1. Load the exact model once and reuse only the frozen built-in
   speaker/instruction configuration for bounded generation units.
2. Keep candidate batching at one until measurements justify a larger batch.
3. Generate from VoxLeaf's stable locator-linked narration segments and
   publish each valid segment as soon as its audio is available.
4. Keep any diagnostic retry bounded and explicit without allowing it to hide
   an official first-attempt failure; reject every result whose session,
   generation, segment, model, built-in speaker, instruction, or settings
   identity is
   stale.
5. Evaluate VAD or a cheaper content-free signal as a post-generation defect
   detector without making it a substitute for human Spanish quality review.
6. Screen built-in speakers under one predeclared Spanish protocol, then freeze
   one speaker and never switch speakers or instructions silently.
7. Fingerprint every model, built-in speaker, instruction, and settings
   configuration used for evaluation without retaining generated audio or book
   text in committed artifacts.

### Prototype behavior that VoxLeaf must not copy

- `input.txt` and Python bytecode are tracked in the external repository.
- Generated WAV files are intentionally persisted.
- Paragraph text is printed to the console and a prose preview is written into
  per-paragraph JSON metadata.
- The default reference path contains a private user path.
- Reuse metadata hashes only paragraph text, so changing the model, reference,
  sampling settings, or x-vector mode can reuse stale audio.
- Model loading by repository name permits runtime downloads unless additional
  offline controls are imposed.
- No dependency lock or automated test suite defines the environment.
- The current generation loop retains all internal waveforms until one
  complete paragraph is joined.
- The public call returns complete waveforms and has no proven cooperative
  cancellation boundary.

### Suggestion decisions and implementation ownership

The prototype suggestions are not one indivisible design. VoxLeaf adopts only
the parts that preserve frozen evaluation, bounded memory, cancellation,
privacy, and honest failure accounting:

| Suggestion or observed behavior | Decision | First implementation phase | Later production owner |
| --- | --- | --- | --- |
| Build the voice-clone prompt once and reuse it | **Do not transfer the prompt.** Base cloning is outside this MVP. Retain only the analogous bounded idea: load the selected CustomVoice model once and reuse one exact built-in speaker/instruction/settings identity in memory. | Plan Milestones 1–3 | Milestone 7 service lifecycle, only for a selected profile |
| Generate with candidate batch size one | **Adopt as the conservative `v3` default.** It limits retained work and makes segment ownership observable. A larger batch requires pre-result authority plus measured benefit without weakening memory or cancellation. | Plan Milestones 1–4 | Milestone 7 may retain or supersede it from selected-profile evidence |
| Use bounded VoxLeaf narration segments | **Adopt.** The candidate consumes existing `narration-v1` units; it does not invent paragraph/chapter accumulation or model-specific text contracts. | Plan Milestone 2 | Milestones 7 and 9 |
| Deliver each completed segment immediately | **Adopt for the prototype and selected-profile handoff.** Segment-at-a-time delivery improves startup and boundedness, but a complete-waveform call still does not prove mid-segment streaming or cancellation. | Plan Milestone 2 | Milestone 7 emits selected-profile audio; Milestone 8 buffers/plays it |
| Retry failed segments a limited number of times | **Defer for production and prohibit as hidden benchmark recovery.** Official `v3` measurements count the first attempt and every failure. A separately labeled diagnostic retry may investigate a defect but cannot make a gate pass. | Plan Milestones 1 and 3 freeze/test failure accounting only | Milestone 10 may add bounded retry after failure classification, stale-result rejection, backoff, cleanup, and latency evidence |
| Use VAD/energy checks for silence, missing speech, or broken tails | **Adopt only as an optional benchmark defect signal.** Run it after timed synthesis, preserve the original result, report only content-free flags/counts, and keep human Spanish review authoritative. Do not trim, fade, repair, or rescore official audio automatically. | Plan Milestones 1, 3, and 4 if admitted before results | Milestone 10 may consider production monitoring only after false-positive, latency, memory, dependency, and quality evidence |
| Attach generation identities and discard obsolete audio | **Adopt as mandatory.** Use the existing session/generation/segment identities plus exact candidate, built-in speaker, instruction, and settings identity. Identity rejects stale output even when the model cannot stop promptly; it does not replace cancellation cleanup. | Plan Milestones 1–3 | Milestones 7–9 enforce the protocol, buffer, playback, and synchronization boundary |
| Evaluate normal ICL and x-vector-only modes | **Exclude from this plan.** Both are Base voice-cloning modes and require reference audio. The external results remain non-promotable intake evidence only. | Product non-goal | No current roadmap commitment |
| Fingerprint model, built-in speaker, instruction, and settings | **Adopt as mandatory.** Store only content-free hashes/identifiers in safe evidence; generated audio stays in the raw area and is deleted after derivation. | Plan Milestones 1, 3, 4, and 6 | Milestones 7 and 10 own runtime identity and diagnostics |
| Persist generated WAV files | **Reject for normal VoxLeaf behavior.** Disposable blinded-quality audio may exist only in the ignored private raw area and must be cleaned after evidence derivation. Audiobook export remains outside the MVP. | Existing constraint; verify in Plan Milestones 3, 4, and 6 | Milestones 8 and 11 retain non-persistence |
| Print narration or store prose previews | **Reject.** Errors, logs, summaries, tests, and diagnostics remain content-free. | Existing constraint; verify in Plan Milestones 3, 4, and 6 | Milestones 7–11 |
| Track `input.txt`, bytecode, private paths, or raw voice material | **Reject.** Candidate inputs and outputs use ignored private raw storage; repository tests use synthetic/public authorities and privacy canaries. | Plan Milestones 3 and 6 | Milestone 11 packaging/privacy review |
| Load by remote model name or use unlocked dependencies | **Reject for official or production execution.** Use an isolated lock, exact local artifact revision/hashes, fail-closed offline preflight, outbound blocking, and no runtime download. | Plan Milestones 1, 3, and 4 | Milestone 11 owns the deliberate distribution/acquisition strategy |
| Reuse audio from a paragraph-text-only cache key | **Reject.** Milestone 6.1 adds no persistent audio cache. Resident model/config reuse uses the complete identity tuple above; any future audio cache requires a separate privacy/persistence decision. | Plan Milestones 1–3 | No roadmap commitment |
| Retain and join all paragraph/chapter waveforms | **Reject.** Retention is capped at the active bounded segment/frame and explicit queue limits. | Plan Milestone 2 | Milestones 7 and 8 |
| Accept the high-level complete-waveform API as “streaming” | **Reject without proof.** The candidate cycle stops before the full matrix unless the exact topology proves bounded delivery, after-first-audio cancellation/stale suppression, and cleanup. | Plan Milestone 2 stop gate | Milestone 7 implements only the capability actually selected |
| Treat the observed Base model's 4.3 GiB cache and 7.8 GiB environment as acceptable CustomVoice packaging | **Reject the inference.** They describe a different model and a non-clean environment. Measure clean locked CustomVoice artifacts separately and retain exact-host scope. | Plan Milestone 4 | Milestones 10 and 11 own support and packaging decisions |

No new ADR is required for this disposition because no production engine,
built-in speaker, instruction, transport, retry policy, VAD dependency, or
cache is selected. The accepted privacy/boundedness rules already govern the
project. A passing profile must hand candidate-specific facts to a superseding
selection ADR; Milestones 7, 8, and 10 must record any later durable runtime
choices when their evidence exists.

### Official Qwen3-TTS evidence

The official
[Qwen3-TTS release post](https://qwen.ai/blog/?id=qwen3tts-0115),
[Qwen3-TTS repository](https://github.com/QwenLM/Qwen3-TTS), and
[1.7B CustomVoice model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
establish the following candidate-intake facts:

- The 1.7B CustomVoice model exposes nine Qwen-provided speaker identities,
  accepts one `speaker` plus an optional style `instruct`, supports Spanish
  among ten languages, and requires no user reference audio.
- None of the nine speaker descriptions has Spanish as its native language.
  Qwen recommends each speaker's native language for best quality while
  stating that every speaker can use every supported model language. A frozen
  Spanish screen is therefore required rather than assuming a default.
- The 1.7B model adds instruction control over the target built-in timbre. The
  word “CustomVoice” refers to those speaker-specific fine-tuned timbres; it
  does not mean arbitrary user voice cloning.
- Qwen documents `generate_custom_voice` for CustomVoice with a supported
  speaker ID. It separately documents `generate_voice_clone`, reference audio,
  and reference transcript for the Base models.
- The family is described as supporting streaming and advertises a best-case
  end-to-end latency as low as 97 ms. This is an upstream family claim, not
  evidence for VoxLeaf's exact model, Python API, runtime, hardware, corpus, or
  command-to-audible path.
- The official repository currently documents vLLM-Omni local offline
  inference while stating that online serving and further streaming support
  are future work.
- The published Spanish content-consistency table does not establish a
  production result for VoxLeaf, a preferred built-in speaker, naturalness,
  startup, sustained RTF, cancellation, memory, or packaging.
- The 1.7B CustomVoice model card declares Apache-2.0. Exact revision,
  artifacts, embedded-voice terms, and clean disk footprint remain intake
  audit work.

The official high-level CustomVoice example returns a `wavs` collection after
`generate_custom_voice`; it does not demonstrate an incremental waveform
iterator or cooperative cancellation. The installed `qwen-tts==0.1.1` Base
prototype independently returns complete NumPy waveforms. Therefore the
upstream streaming claim does not, by itself, resolve VoxLeaf's exact local
incremental-audio or cancellation blocker.

### OpenAI Whisper assessment

OpenAI's
[Whisper model documentation](https://developers.openai.com/api/docs/models/whisper-1)
and
[Whisper release](https://openai.com/index/whisper/)
describe Whisper as automatic speech recognition: audio is input and text is
output for transcription, translation, and language identification. Whisper
cannot turn prepared EPUB text into narration and is not a production TTS
candidate.

A separately pinned, fully local Whisper implementation may be considered as
an optional benchmark-only content-consistency instrument. It could transcribe
disposable generated speech and produce aggregate error counts, but:

- it cannot judge naturalness, prosody, speaker similarity, or artifact
  freedom;
- its transcript is derived book/narration text and must never enter logs,
  summaries, snapshots, or committed artifacts;
- cloud transcription is prohibited because it would upload generated
  narration;
- its model, runtime, license, memory, and measurement interference require a
  separate audit; and
- it cannot replace the frozen fluent-Spanish human quality panel.

## Scope and non-goals

### Scope

- Record candidate-intake facts from official sources and the external
  prototype without importing private artifacts or code.
- Freeze a bounded, content-safe Spanish screening authority before generating
  any CustomVoice speaker-screen output.
- Screen the nine built-in speakers with one fixed synthetic Spanish corpus,
  one fixed neutral audiobook instruction, identical settings, blinded order,
  and predeclared selection/failure rules.
- Select exactly one built-in speaker from the screen, then freeze its speaker
  ID, instruction, and complete candidate identity in
  `tts-feasibility-profile-v3` before official benchmark results.
- Establish a credible incremental-audio and cancellation prototype before
  admitting a complete-waveform API to another official run.
- Freeze `tts-feasibility-profile-v3` before any official result is observed.
- Add exact isolated candidate locks/adapters only after candidate admission.
- Reuse the candidate-neutral corpus, metrics, privacy, cleanup, artifact,
  licensing, quality, and reporting boundary unless a pre-result `v3` decision
  explicitly strengthens it.
- Execute official measurements on named hardware without making general
  support claims.
- Accept a superseding ADR only when every applicable frozen gate passes.

### Non-goals

- Implement the production Milestone 7 service or desktop transport.
- Select Qwen because one informal output sounded good.
- Treat an upstream benchmark or 97 ms marketing claim as local evidence.
- Lower a failed `v2` gate after seeing a result.
- Add OpenAI Whisper or a cloud API to the production TTS dependency graph.
- Commit speaker-screen or benchmark audio, generated audio, model weights, raw
  journals, book text, private paths, secrets, or user identity.
- Add user voice cloning, reference-audio enrollment, VoiceDesign, audiobook
  export, voice impersonation, or general voice-cloning product claims.

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `benchmarks/tts/candidates-v1.json`
- `benchmarks/tts/candidates-v2.json`
- `benchmarks/tts/candidates-v3.json`
- `benchmarks/tts/customvoice-spanish-screen-v2.json`
- `benchmarks/tts/customvoice-spanish-screen-result-v2.json`
- `benchmarks/tts/profile-v3.json`
- `benchmarks/tts/incremental-cancellation-prototype-v1.json`
- `benchmarks/tts/incremental-cancellation-prototype-result-v1.json`
- `benchmarks/tts/schemas/incremental-cancellation-prototype-result-v1.schema.json`
- `benchmarks/tts/selection-v2.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/architecture/overview.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/tts-feasibility-profile-v2.md`
- `docs/architecture/tts-feasibility-profile-v3.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/development/dependencies.md`
- `docs/development/setup.md`
- `docs/development/testing.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M006-local-tts-feasibility-and-engine-profiles.md`
- `services/tts/benchmarks/`
- `services/tts/tests/`

## Architecture and constraints

The candidate-specific adapter remains inside the development-only benchmark
boundary until a profile passes. Model-specific tokenization, built-in speaker
IDs, style instructions, sampling controls, and output conversion must never
leak into `@voxleaf/epub`, `narration-v1`, displayed text, or stable locator
contracts.

The first prototype must distinguish three different boundaries:

1. **Speaker/configuration authority:** screen built-in speakers under a frozen
   intake protocol, select exactly one, and bind it to one fixed neutral
   audiobook instruction and complete configuration identity.
2. **Incremental generation:** consume bounded prepared narration segments and
   expose audio in bounded frames or segment waveforms without retaining a
   whole chapter.
3. **Cancellation containment:** stop or supersede work promptly and prove
   that no stale frame crosses the generation boundary after cancellation.

Segment-at-a-time complete-waveform generation may improve boundedness and
allow cancellation between segments. It does not automatically satisfy
mid-segment or after-first-audio cancellation. A modified Qwen runtime,
cooperative generation hook, or isolated worker topology is admissible only
after its exact maintenance, cleanup, stale-frame, restart, and packaging
costs are explicit. A third-party streaming fork cannot be admitted from
claims alone; it requires source, license, maintenance, supply-chain, and
exact-host review.

All official runs must use verified local model paths, disabled runtime
downloads, outbound blocking, content-free diagnostics, separate raw and safe
summary areas, and cleanup verification. Speaker-screen audio, generated
speech, and any Whisper-produced transcript are sensitive disposable evidence.

The personal WSL Base-cloning success demonstrates that a related 1.7B Qwen
runtime can execute on the maintainer's computer only. It does not prove the
CustomVoice model, a built-in Spanish narrator, Windows performance, streaming,
cancellation, or packaging. Windows remains authoritative for native VoxLeaf
development and official support evidence. WSL and Windows environments,
caches, locks, and outputs must remain isolated.

## Milestones

## Milestone 1: Freeze candidate and product authority

### Work

- Record the clarified product direction: the MVP uses a built-in default
  narrator and does not enroll or clone the user's voice.
- Admit Qwen3-TTS 12Hz 1.7B CustomVoice as a new exact candidate distinct from
  the rejected 0.6B CustomVoice/Aiden profile. Exclude Base ICL and
  x-vector-only cloning from `v3`.
- Pin the Qwen engine, model revision, artifact hashes, PyTorch/CUDA runtime,
  attention implementation, precision, sampling parameters, supported speaker
  allowlist, and supported platform.
- Freeze `customvoice-spanish-screen-v1` before producing screen audio. It must
  define the repository-authored synthetic Spanish text, all nine official
  built-in speaker IDs, one exact neutral audiobook instruction, identical
  generation settings, blinded/randomized presentation, one fluent-Spanish
  intake evaluator, deterministic tie/failure rules, safe summary schema, raw
  isolation, and cleanup.
- Execute the frozen screen once, retain only its content-free selection
  outcome, select exactly one built-in speaker, and do not tune the instruction
  or settings from the observed outputs.
- Decide whether local Whisper is excluded completely or admitted only as an
  optional post-generation benchmark tool. Do not admit the OpenAI API.
- Define a pre-admission prototype gate requiring a credible incremental-audio
  and cancellation boundary.
- Freeze batch size one, the complete model/speaker/instruction/settings
  identity and in-memory lifetime, first-attempt failure accounting, the
  no-hidden-retry rule, and whether post-timing VAD/energy checks are admitted.
- Publish and accept `tts-feasibility-profile-v3` before official execution.

### Validation

- Candidate identities and artifacts are immutable and independently
  checkable.
- The screen authority predates its audio/results and cannot be edited to
  favor an observed speaker.
- Exactly one built-in speaker and one neutral instruction enter `v3`; runtime
  speaker or instruction switching is a configuration mismatch.
- The authority contains no observed official `v3` result.
- No user reference audio, transcript, embedding, or clone prompt is accepted.
- Whisper is absent from the production-candidate set.

### Status

Completed. The exact candidate manifest, isolated environment lock, corrected
pre-audio `customvoice-spanish-screen-v2` authority, closed result schema, and
model-free screen runner are implemented. The frozen screen selected Serena,
its content-safe aggregate is retained, and `tts-feasibility-profile-v3`
freezes the complete evaluation identity before prototype or official
results. This is evaluation admission only; ADR-0013 and the Milestone 7
blocker remain.

## Milestone 2: Prove incremental output and cancellation credibility

### Work

- Reproduce the exact candidate on the authoritative Windows host from an
  isolated lock and verified local artifacts.
- Measure cold model load and frozen built-in speaker/configuration setup
  separately from synthesis.
- Prototype bounded generation from existing `narration-v1` segments with
  batch size one.
- Keep the selected model resident and reuse only the exact frozen
  speaker/instruction/settings identity without persisting audio.
- Publish each valid audio unit immediately instead of joining a paragraph or
  chapter.
- Cap retained input/output at the active segment plus the explicit test queue;
  release each unit before advancing beyond that bound.
- Exercise cancellation before dispatch, after acceptance, after first audio,
  near the hard mid-generation boundary, and during cleanup.
- Reject late/stale audio by session, generation, segment, candidate,
  built-in speaker, instruction, and settings identity even when the
  underlying model call finishes after cancellation.
- Stop the candidate cycle before the full matrix if no credible incremental
  output or bounded cancellation topology exists.

### Validation

- The prototype reports first-produced-audio and cancellation timestamps
  without recording input text or audio.
- Retained text, waveform, model/configuration, and queue sizes have explicit
  ceilings.
- No cancellation trial publishes a stale frame.
- Worker or cooperative-stop cleanup releases RAM/VRAM within the frozen
  bound.

### Status

Completed. The exact development-only topology was frozen before execution,
implemented without a production adapter, and executed on the authoritative
Windows host. All five trials passed with zero stale units, bounded input,
waveform, and queue retention, identity invalidation before worker
termination, and complete resource cleanup. The result proves immediate
complete-segment delivery and bounded process-termination cancellation; it
does not claim native waveform streaming, cooperative model cancellation, an
official performance pass, or production authorization.

## Milestone 3: Extend the candidate-neutral benchmark safely

### Work

- Add the exact candidate environment and lock outside production runtime
  dependencies.
- Add a candidate adapter behind the existing benchmark contracts.
- Add model-free tests for speaker-screen authority/order/outcome integrity,
  supported-speaker validation, complete model/speaker/instruction/settings
  identity, resident-config reuse/disposal, batch-one/retention bounds,
  unit/frame ordering, first-attempt failure accounting, no-hidden-retry
  behavior, cancellation, stale identity, cleanup, content-free errors, and
  configuration mismatch.
- Add fail-closed preflight checks for local artifacts, offline controls,
  selected speaker/instruction fingerprints, runtime/provider/precision, and
  hardware.
- If local Whisper is admitted as a test-only tool, run it outside timed TTS
  measurements and reduce its output immediately to content-free aggregate
  counts.
- If VAD/energy review is admitted, run it after timed synthesis, retain the
  unmodified official waveform, emit only allowlisted defect flags/counts, and
  prove that its dependency/resources cannot affect measured TTS phases.
- Update this plan with every exact command after the corresponding project or
  script exists; do not invent a command before implementation.

### Validation

- Existing `pnpm.cmd check:portable` and `pnpm.cmd check` pass.
- `uv run --project services/tts --locked pytest services/tts` passes with no
  model or GPU.
- Candidate import/preflight smokes are isolated, locked, offline-capable, and
  absent from normal CI model execution.
- Privacy canaries prove that screen text, book text, ASR transcripts,
  generated audio, paths, and identity do not reach safe summaries.

### Status

Completed on branch `feat/m006-3-candidate-neutral-benchmark`. The existing
isolated 107-package lock remains outside production dependencies. The
candidate-neutral loader, adapter, preflight, raw journal, safe-summary, and
disposable quality boundaries now admit only the exact `v3` Serena identity.
They retain complete-waveform truth, batch size one, one resident
configuration, first-attempt authority, zero automatic retries, bounded input
and observations, worker-termination cancellation, stale-identity rejection,
content-free errors, and cleanup.

The authority/schema checkpoint is `6b8506a`; the adapter and model-free
integration checkpoint is `a7cefb1`. Whisper and VAD/energy remain excluded,
so no auxiliary dependency or post-processing path was added. This milestone
does not run the official matrix, select a production profile, supersede
ADR-0013, or unblock Milestone 7.

Implemented and validated with the repository-defined commands:

    uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check
    uv run --directory services/tts --locked ruff check benchmarks tests
    uv run --directory services/tts --locked mypy .
    uv run --directory services/tts --locked pytest tests -q
    pnpm.cmd check:portable
    pnpm.cmd check

The real-host smoke also invoked
`uv run --directory services/tts --locked python -m benchmarks.cli preflight`
with bounded private paths on standard input, offline flags active, and all
operator-only readiness declarations set to false. It accepted the exact
artifacts, authority, interpreter, firewall, provider, and hardware and
reported only the three intentionally false operator declarations. No model
was loaded and no audio was generated.

## Milestone 4: Execute the frozen v3 evaluation

### Work

- Run pilot validation only as permitted by the frozen authority.
- Execute cold-load, warm, shorter-complete, sustained, cancellation, RAM,
  VRAM, offline, artifact, cleanup, and packaging matrices.
- Count the first attempt and every failure. Do not retry an official sample
  into a passing result; separately labeled diagnostic retries are
  non-promotable.
- Execute blinded Spanish quality evaluation with the frozen minimum panel.
- Use only the exact built-in speaker and neutral instruction frozen by the
  screening authority; any mismatch invalidates the run.
- Run any admitted ASR or VAD defect analysis after timed synthesis and keep
  its content-free result separate from human quality scores.
- Record only allowlisted content-free summaries and delete disposable audio,
  raw journals, ASR text, and speaker-screen working data after derivation.

### Validation

- Every count and gate matches `tts-feasibility-profile-v3`.
- Results identify the exact host and make no broader hardware claim.
- Network blocking and local-path-only model loading are directly verified.
- No failed, timed-out, missing-panel, or meaning-changing-defect result is
  promoted.

### Status

In progress on `feat/m006-4-frozen-v3-evaluation`. Milestones 1 through 3 are
present on the merged base. After the first exact-host preflight correctly
rejected insufficient readiness, available RAM recovered above the frozen
12 GiB gate and the one permitted disposable pilot passed from clean
checkpoint `8475b28`. The pilot retained no session and is not promotable.
Licensing and packaging are audited; the official matrix and final blinded
quality panel remain.

## Milestone 5: Select or retain the blocker

### Work

- Produce a candidate-neutral `selection-v3` record.
- If every applicable gate passes, accept a superseding ADR that selects the
  exact profile and gives Milestone 7 a bounded integration input.
- If any gate fails, retain ADR-0013's blocker and record the exact failure
  without choosing the least-bad profile.
- Reconcile the roadmap, architecture, product, setup, dependency, testing,
  performance-budget, and system-diagram surfaces.

### Validation

- Selection is conjunctive, not weighted.
- A selected profile identifies exact artifacts, runtime, built-in speaker,
  instruction, configuration lifecycle/identity, batch/retention limits,
  first-attempt reliability, hardware evidence, offline controls, and actual
  incremental or complete-waveform capabilities.
- No production dependency is added before a passing decision.

### Status

Not started.

## Milestone 6: Close repository and privacy validation

### Work

- Run focused deterministic tests, portable checks, authoritative Windows
  checks, candidate import smokes, artifact scans, privacy scans, and required
  pull-request CI.
- Review the final diff for unrelated model files, audio, raw output, private
  paths, prose, or accidental production dependencies.
- Move this plan to `docs/plans/completed/` only after every required task and
  decision is complete.

### Validation

- `pnpm.cmd check:portable` passes.
- `pnpm.cmd check` passes.
- Both required pull-request jobs pass on the final evidence commit.
- The final tree contains no model weights, reference voice material,
  speaker-screen audio, generated audio, raw journals, ASR transcript,
  copyrighted text, secrets, or private paths.

### Status

Not started.

## Testing and benchmark strategy

Deterministic default validation must remain model-free and hardware-free.
Unit tests should cover candidate manifest decoding, frozen speaker-screen
authority and outcome validation, supported speaker/instruction identity,
resident configuration reuse, incremental frame ordering, cancellation state
transitions, stale-frame rejection, content-free failures, cleanup accounting,
and summary allowlists.

Hardware-specific execution is manual and isolated. Performance timing begins
and ends at the same adapter boundary for every candidate. Cold model load,
speaker/configuration setup, warm synthesis, first audio, complete audio, and
cleanup are separate measurements. Batch size, segment size, sampling
parameters, precision, attention implementation, model revision, built-in
speaker, and instruction are frozen inputs.

Whisper, if admitted as test-only ASR, runs after TTS timing and in a separate
process/resource phase. Only numeric alignment or error aggregates may leave
the raw area. Human listeners remain authoritative for pronunciation,
naturalness, prosody, artifacts, and meaning-changing defects.

The existing synthetic neutral/Spanish corpus remains the text authority
unless `v3` changes it before results. No personal book excerpt, screen audio,
or generated audio may become a fixture.

## Risks and rollback

- **The 1.7B model may be slower or exceed the accepted resource/packaging
  bounds.** Stop after preflight/prototype evidence rather than weakening the
  gates.
- **Official streaming claims may not be exposed by the selected local
  runtime.** Require an actual iterator/frame boundary and cancellation
  evidence; do not infer it from the model card.
- **A runtime fork may create an unmaintainable production dependency.**
  Compare the smallest upstream-compatible change with other engines and
  reject the fork if security, packaging, or maintenance cost is excessive.
- **No built-in speaker is described as Spanish-native.** Freeze a bounded
  Spanish screen before outputs and fail the candidate if no speaker satisfies
  its intake rules; do not silently choose the least-bad voice.
- **Instruction tuning can overfit observed outputs.** Freeze one neutral
  audiobook instruction before the screen and carry it unchanged into `v3`.
- **The 1.7B CustomVoice model may not improve the failed 0.6B profile enough
  to offset higher resource cost.** Treat it as a new exact candidate, not an
  assumed upgrade.
- **Speaker-screen audio or derived ASR may leak through logs, metadata,
  exceptions, or fixtures.** Use content-free identities, raw-area isolation,
  canaries, cleanup, and a final repository scan.
- **Whisper may be mistaken for a TTS engine or automatic quality oracle.**
  Keep its role explicitly ASR-only and optional; human quality gates remain.
- **Prior Base voice-cloning success may bias the CustomVoice decision.**
  Retain it as non-promotable related-runtime evidence and freeze the speaker
  screen plus all official gates before new results.

Rollback retains the content-safe screen outcome as historical evidence,
removes only the isolated development candidate project/commands when no
longer needed, and keeps ADR-0013 authoritative. No production contract or
dependency changes are involved.

## Progress log

- 2026-07-25: Inspected the maintainer-provided external WSL Qwen3-TTS
  prototype read-only without copying its private inputs, outputs, or code.
- 2026-07-25: Confirmed that the successful prototype uses the materially
  different 1.7B Base voice-clone path rather than the rejected 0.6B
  CustomVoice/Aiden profile.
- 2026-07-25: Confirmed from the installed `qwen-tts==0.1.1` source that normal
  ICL mode retains reference codes/text, x-vector-only retains only the
  speaker embedding, and the public call returns complete waveforms.
- 2026-07-25: Reviewed the official Qwen3-TTS release post, repository, and
  1.7B Base model card. Recorded Spanish/voice-clone support, reusable prompt
  guidance, upstream streaming claims, current vLLM offline-serving limits,
  and Apache-2.0 model licensing.
- 2026-07-25: Reviewed official OpenAI Whisper documentation and rejected
  Whisper as a TTS candidate because it is speech recognition. Retained only a
  possible future local benchmark-ASR role.
- 2026-07-25: Added this approved blocker-resolution plan as roadmap Milestone
  6.1. No candidate is selected and Milestone 7 remains blocked.
- 2026-07-25: Reconciled the roadmap, canonical system diagram, architecture
  overview/performance budget, product status, setup, dependency, testing, and
  documentation indexes with the approved-planned boundary.
- 2026-07-25: Completed documentation closeout validation. Both repository
  aggregates passed; local links resolve; privacy/artifact and whitespace
  scans are clean.
- 2026-07-25: Dispositioned every reusable and unsafe external-prototype
  pattern. Assigned evaluation work to this plan, selected-profile lifecycle
  work to Milestones 7–9, retry/VAD resilience decisions to Milestone 10, and
  distribution evidence to Milestone 11.
- 2026-07-25: Clarified that the MVP needs a built-in default narrator rather
  than personal voice cloning. Official Qwen documentation shows that Base is
  the reference-audio cloning model, while 1.7B CustomVoice exposes nine
  built-in speakers plus instruction control. Replaced Base ICL with a frozen
  CustomVoice Spanish-speaker screening and single-speaker `v3` direction.
- 2026-07-25: Reconciled the roadmap, product brief, MVP, architecture,
  performance budget, system diagram, setup, dependencies, testing guidance,
  and documentation indexes with the CustomVoice default-narrator direction.
- 2026-07-25: Completed the default-narrator documentation validation. Local
  links, whitespace, privacy, and forbidden-artifact audits passed, followed
  by both repository aggregate checks.
- 2026-07-25: Created branch
  `feat/m006-1-freeze-candidate-authority` from merged `main` at
  `c8cc4ea`. No prior Milestone 6 result or production dependency was changed.
- 2026-07-25: Froze `candidates-v2.json` with the exact
  `qwen-tts==0.1.1`, Qwen3-TTS 12Hz 1.7B CustomVoice revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`, two independently checkable
  major artifact hashes, PyTorch/Torchaudio 2.9.1 CUDA 12.8, bfloat16/SDPA,
  batch one, fixed sampling, all nine upstream speakers, and no selected
  speaker.
- 2026-07-25: Froze `customvoice-spanish-screen-v1` before audio. It uses
  three existing repository-authored Spanish corpus cases, all nine speakers,
  one exact neutral audiobook instruction, 27 maximum samples, one fluent
  Spanish evaluator, blind random order, closed eligibility/tie/failure
  rules, a 256 MiB session cap, ignored raw storage, and required cleanup.
- 2026-07-25: Excluded Whisper and VAD/energy analysis from `v3`; froze
  first-attempt authority, zero automatic retries, one resident
  model/configuration identity per session, forbidden configuration
  switching, and the incremental-output/cancellation prototype stop gate.
- 2026-07-25: Added the isolated
  `qwen3_1_7b_customvoice_cuda` uv project and resolved its lock to 107
  packages without changing the zero-runtime-dependency production service.
- 2026-07-25: Implemented closed screen generation/submission/cleanup
  commands plus six GPU-free tests. Focused Ruff, strict mypy, and pytest
  validation passed before the pre-audio checkpoint.
- 2026-07-25: Installed the exact isolated lock and confirmed offline imports
  report `qwen-tts 0.1.1`, PyTorch `2.9.1+cu128`, CUDA 12.8, and CUDA
  availability on the authoritative Windows host. The command-level import
  smoke also passed from the same project/directory combination used by the
  package script. FlashAttention and SoX emitted optional-tool warnings;
  neither is selected by or required for the frozen SDPA screen profile.
- 2026-07-25: `pnpm.cmd check:portable` passed in 26.7 seconds with 18 shared
  test files / 175 tests, 34 EPUB test files / 555 tests, 20 desktop test
  files / 204 tests, 6 native-WebDriver-client tests, and 56 Python tests.
  The existing informational Vite chunk-size advisory remains unchanged.
- 2026-07-25: Committed the immutable pre-audio authority and screen boundary
  as `46ceded1e72d1f5ebe6c04dab4ed62c91e09bdca`
  (`feat(tts): freeze CustomVoice speaker-screen authority`). No screen
  generation request had been accepted before this checkpoint.
- 2026-07-25: The first frozen `v1` generation produced 27 blinded samples in
  522.5 seconds under offline preflight, but the evaluator page exposed that
  the currency/percentage case lacked the prior protocol's explicit numeric
  expressions score. No scorecard was submitted and no selection result was
  produced. The raw session and all 27 WAV files were deleted.
- 2026-07-25: Preserved the `v1` authority and schema unchanged, then created
  frozen `candidates-v3` and `customvoice-spanish-screen-v2` corrections
  before replacement audio. The corrected authority adds
  `numericExpressions` only to the currency/percentage case and
  `punctuationDialogue` only to the two tagged dialogue cases. Six focused
  model-free tests, Ruff, and strict mypy pass for the corrected boundary.
- 2026-07-25: The corrected pre-audio checkpoint passed
  `pnpm.cmd check:portable` in 27.3 seconds with 18 shared test files / 175
  tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204 tests, 6
  native-WebDriver-client tests, and 56 Python tests. The existing
  informational Vite chunk-size advisory remains unchanged.
- 2026-07-25: Committed the corrected immutable pre-audio authority as
  `ad9d835b998d63b6df909050a9d9513957b180ac`
  (`fix(tts): add applicable speaker-screen scoring`). No replacement
  generation request had been accepted before this checkpoint.
- 2026-07-25: Executed the corrected screen from clean commit
  `c42eee1328646fbdd846d305d8467dee1b8f3715` under the exact outbound
  firewall block and offline controls. All 27 first-attempt samples completed
  in 527.7 seconds; the session retained 17,119,908 audio bytes, remained
  below the 256 MiB cap, exposed no speaker identity in the evaluator page,
  and restored the prior AC sleep setting.
- 2026-07-25: The one fluent-Spanish intake evaluator completed all applicable
  scores. Frozen ranking selected Serena with overall 4.571428571428571,
  intelligibility 5.0, Spanish pronunciation 4.333333333333333,
  punctuation/dialogue 5.0, numeric expressions 4.0, naturalness
  4.333333333333333, audiobook suitability 4.666666666666667, artifact
  freedom 4.666666666666667, and zero meaning-changing defects.
- 2026-07-25: Promoted only the schema-valid content-safe aggregate and froze
  `profile-v3.json` plus `tts-feasibility-profile-v3.md`. The screen remains
  one-evaluator intake evidence and does not count toward the later
  three-person final panel or production approval.
- 2026-07-25: Deleted both raw screen sessions, all 54 generated WAV files
  across the abandoned and corrected attempts, both randomization/scorecard
  working sets, and the downloaded completed scorecard. No generated audio or
  per-sample result remains.
- 2026-07-25: Committed the schema-valid aggregate, exact Serena `v3`
  authority, authority-hash regressions, product/architecture reconciliation,
  and Milestone 1 validation as
  `e14c7770bdd9bc8be2bd392fe011f0c1dea249c0`
  (`feat(tts): freeze Serena feasibility profile v3`).
- 2026-07-25: Created branch
  `feat/m006-2-incremental-cancellation` from merged Milestone 1 commit
  `de2c2dc`. Froze `incremental-cancellation-prototype-v1` before any
  prototype generation or cancellation result. The authority binds exact
  `profile-v3`, complete-segment delivery, one resident spawned worker per
  trial, batch one, one queued segment/unit, `narration-v1` input ceilings,
  identity invalidation before bounded worker termination, five ordered
  trials, zero stale units, no audio persistence, and a strict content-safe
  result schema.
- 2026-07-25: Implemented the development-only spawned Qwen prototype behind
  the exact candidate interpreter. The parent accepts one bounded synthetic
  prepared segment, the worker retains one exact resident model/configuration,
  and one complete segment waveform crosses the in-memory pipe before the
  controller releases it and advances. Cancellation invalidates the complete
  session/generation/segment/candidate/configuration identity before killing
  the worker; no production adapter, process protocol, or audio format is
  selected.
- 2026-07-25: Added six model-free authority/topology tests. They cover exact
  hash/schema/configuration binding, narration input and audio/queue ceilings,
  two-unit delivery/release, all five ordered cancellation/cleanup trials,
  rejection of deliberately late fake units, fail-closed early completion at
  the near-hard boundary, and safe-result privacy. The first portable run
  stopped on one Ruff formatting drift; after formatting,
  `pnpm.cmd check:portable` passed in 26.3 seconds with 63 Python tests plus
  the unchanged TypeScript/EPUB/desktop suites and builds. The exact isolated
  candidate-interpreter import smoke also passed without loading the model.
- 2026-07-25: Confirmed the exact candidate firewall rule, local model and
  interpreter, 15,365,660,672 free RAM bytes, and an NVIDIA GeForce RTX 5060
  Laptop GPU with 8,151 MiB total / 7,810 MiB free VRAM. Disabled AC sleep
  only for the run with an independent restoration watcher.
- 2026-07-25: Rejected the first invocation before preflight because Windows
  PowerShell had added a byte-order mark to the private standard-input JSON.
  No model loaded and no prototype observation was accepted. Re-encoded the
  disposable input without a byte-order mark and kept the authority unchanged.
- 2026-07-25: Executed the prototype from clean implementation commit
  `1cc4fd2df63d35019e9ad7747307ce0010ea4cff` with offline controls and the
  application-scoped firewall block active. Both normal units were delivered
  and released; peak queued segments and published units were one, and peak
  retained controller audio was 2,257,920 bytes.
- 2026-07-25: All five ordered cancellation trials passed. Identity
  invalidation took at most 1,200 nanoseconds, worker termination took at most
  330,300,500 nanoseconds, no trial published a stale unit, every worker
  exited, and tracked post-cleanup process RAM, VRAM, and worker count were
  zero.
- 2026-07-25: The exact-host prototype measured 8,366,579,700 nanoseconds for
  the maximum cold load, 23,300 nanoseconds for configuration setup, and
  5,209,888,900 nanoseconds to first complete segment audio after dispatch.
  Peak process-tree RAM was 4,689,559,552 bytes; authoritative PyTorch
  peak-reserved VRAM was 5,440,012,288 bytes. Maximum cleanup, including
  normal graceful cleanup, was 1,030,022,600 nanoseconds.
- 2026-07-25: Promoted only the schema-valid content-safe result. Deleted the
  exact disposable input, output, and stderr files, restored the prior
  45-minute AC sleep setting, and verified zero remaining candidate processes
  and zero reported GPU utilization/memory. No raw session or generated audio
  was created.
- 2026-07-26: Created branch
  `feat/m006-3-candidate-neutral-benchmark` from merged `main` at `4be6821`.
  The worktree was clean and the branch contained the completed Milestones 1
  and 2 authorities.
- 2026-07-26: Added the `summary-v3` closed schema and an exact profile loader
  before any official generation. The loader verifies every authority hash,
  speaker order and selected outcome, supported-speaker membership, complete
  model/speaker/instruction/settings identity, batch-one/zero-retry policy,
  and the existing candidate lock. Twelve focused authority/summary tests
  passed before checkpoint `6b8506a`.
- 2026-07-26: Extended the existing Qwen adapter and candidate-neutral
  dispatch for the exact 1.7B CustomVoice/Serena profile. The implementation
  uses one resident model, identical frozen kwargs for every first attempt,
  no retry loop, 24 kHz complete-waveform output, in-memory payload release,
  spawned-worker termination, and existing request-identity stale rejection.
- 2026-07-26: Extended preflight to require the exact isolated interpreter and
  profile/configuration/lock/screen/instruction/settings fingerprints. Added a
  2,048-byte UTF-8 input ceiling alongside the existing 640-code-point bound,
  `v3` raw-journal configuration binding, single-candidate blinded quality
  sessions, and `v3` safe-summary promotion.
- 2026-07-26: The full GPU-free Python suite passed with 72 tests after Ruff
  formatting/lint and strict mypy. Tests cover frozen authority and ordering,
  exact adapter kwargs, resident reuse/disposal, first-failure/no-retry
  behavior, stale identity, preflight mismatch, bounds, frame ordering,
  cancellation/cleanup, content-free raw/summary output, and privacy canaries.
- 2026-07-26: The isolated candidate lock check resolved the unchanged 107
  packages. With Hugging Face and Transformers offline flags active, the exact
  candidate interpreter imported `qwen-tts==0.1.1`, PyTorch
  `2.9.1+cu128`, and Torchaudio `2.9.1+cu128` without loading weights or
  generating audio. FlashAttention and SoX emitted optional-tool warnings;
  SDPA is frozen and the Qwen generation path does not require either tool.
- 2026-07-26: From clean documentation checkpoint `057bca8`, the real-host
  offline preflight verified both exact artifacts (4,516,695,644 bytes
  combined), the selected profile and interpreter, the application firewall
  block, 13,427,974,144 free RAM bytes, and 8,174,698,496 free VRAM bytes. It
  failed only `sleep`, `background-load`, and `thermal-state`, which were
  deliberately declared false to prevent the smoke from authorizing a pilot
  or official run.
- 2026-07-26: `pnpm.cmd check:portable` passed in 76.9 seconds and
  `pnpm.cmd check` passed in 74.9 seconds. Both included 18 shared test files /
  175 tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204
  tests, 6 native-WebDriver-client tests, and 72 Python tests. The native
  aggregate also passed Rust formatting, Clippy, crate tests, release build,
  and Python source/wheel packaging. The existing Vite chunk-size advisory
  remained informational.
- 2026-07-26: The 20 changed files passed `git diff --check`,
  private-path/credential-pattern scans, tracked audio/model/raw-input audits,
  and the three changed Markdown files passed the local-link audit. The
  ignored raw tree contains zero files.
- 2026-07-26: Created branch `feat/m006-4-frozen-v3-evaluation` from merged
  `main` at `2b1f7ef`. The worktree and ignored raw result tree were clean.
- 2026-07-26: The first Milestone 4 pilot preflight ran fail-closed without
  loading the model. It verified the exact candidate interpreter, outbound
  firewall block, authorities, provider, and both artifact hashes. It rejected
  the run on the deliberately unchanged 45-minute AC sleep setting, an
  unaccepted background-load declaration, and `12,279,525,376` free RAM bytes,
  which were `605,376,512` bytes below the frozen 12 GiB admission gate.
  NVIDIA reported an idle, 50 C RTX 5060 Laptop GPU with 7,810 MiB free VRAM;
  a five-sample host check measured 4.8% mean and 6% maximum CPU use.
- 2026-07-26: Reconfirmed the exact installed model card and
  `qwen-tts==0.1.1` package as Apache-2.0. Serena is embedded in the model and
  has no separate voice artifact or acceptance terms. Redistribution remains
  subject to the Apache-2.0 license/notice obligations already recorded by the
  repository; no licensing ambiguity blocks evaluation.
- 2026-07-26: Measured the clean CustomVoice packaging boundary rather than
  inheriting the unrelated Base-prototype estimate. The exact model snapshot
  occupies `4,520,220,349` bytes across 27 files. The isolated locked
  environment occupies `5,227,641,745` bytes across 32,476 files and 88
  distributions. Combined size is `9,747,862,094` bytes; 373 native
  `.dll`/`.pyd`/`.exe` files account for `4,713,151,865` bytes. This is high
  packaging risk, not a performance or license failure, and Milestone 11 owns
  any production distribution design.
- 2026-07-26: Committed the readiness, licensing, and packaging checkpoint as
  `8475b289133c5e70f2123542f6842c46001e2eb7`
  (`docs(tts): record v3 evaluation readiness`).
- 2026-07-26: A first pilot wrapper was terminated by the command runner's
  five-second timeout before a receipt existed. It left no candidate process
  or raw file. AC sleep was immediately restored from zero to its captured
  45-minute value, and the attempt was excluded from all evidence.
- 2026-07-26: Available RAM subsequently recovered to `14,380,687,360` bytes.
  From clean checkpoint `8475b28`, the one permitted disposable pilot passed
  in 29.2 seconds with the exact local artifacts, Serena configuration,
  outbound firewall block, Hugging Face/Transformers offline flags, and
  operator readiness satisfied. Its receipt correctly reported no session,
  zero official counts, and `eligibleForPromotion: false`.
- 2026-07-26: Pilot cleanup restored the prior 45-minute AC sleep setting,
  left zero candidate processes and zero raw files, and returned the GPU to
  zero utilization / zero candidate memory with 7,810 MiB free VRAM. No pilot
  waveform, narration text, private path, or diagnostic was retained.

## Discoveries and decisions

1. The previous Qwen rejection is profile-specific. It rejects only the exact
   0.6B CustomVoice/Aiden profile, not the 1.7B CustomVoice model, another
   frozen built-in speaker/instruction, or another output boundary.
2. “CustomVoice” means Qwen's speaker-specific fine-tuned built-in timbres with
   optional instruction control. It is the appropriate family for a default
   narrator; Base is the separate reference-audio voice-cloning family.
3. The personal Base prototype proves only that a related 1.7B Qwen runtime
   can execute on the maintainer's existing hardware. Its good clone quality,
   reference prompt, ICL/x-vector behavior, and disk footprint do not select or
   validate the CustomVoice candidate.
4. The official Qwen family advertises streaming, yet the exact installed
   high-level Python call returns complete waveforms. The next work must prove
   the runtime/output boundary rather than cite the family capability.
5. Whisper is the wrong direction for production narration. Local ASR may help
   measure content consistency, but it cannot replace human listening and
   introduces its own privacy/resource boundary.
6. A new blocker-resolution milestone is preferable to starting Milestone 7:
   production protocol design needs a real selected engine's output,
   cancellation, lifecycle, and resource behavior.
7. Resident-model reuse, batch size one, bounded narration-segment
   consumption, immediate unit delivery, complete model/speaker/instruction
   identities, and one frozen built-in voice belong in this evaluation plan.
   They are constraints on the experiment, not claims that production behavior
   exists.
8. Automatic retry cannot participate in `v3` gate promotion because it would
   hide first-attempt reliability. It may be designed later in Milestone 10.
   VAD/energy analysis is excluded from `v3`: the bounded manual screen and
   existing waveform validation are sufficient for intake, while adding an
   auxiliary detector now would introduce a new dependency and resource
   variable without making the production decision. Milestone 10 may reopen
   content-free defect detection under a separately frozen authority.
9. Persistent generated audio, prose logging, tracked private inputs,
   text-only audio caching, paragraph/chapter accumulation, runtime downloads,
   unlocked dependencies, and unproven “streaming” remain rejected.
10. The nine built-in speakers support Spanish, but none is described as
    Spanish-native and Qwen recommends native-language use. A predeclared,
    blinded, bounded Spanish screen must therefore select exactly one speaker
    before `v3`; upstream WER cannot make that product decision.
11. The official screen cannot use a mutable upstream model identity. The
    model repository commit, major artifact hashes, package wheel identity,
    runtime, generation settings, speaker allowlist, and corpus bytes are
    frozen and independently testable before the first accepted generation
    request.
12. Whisper adds no authority needed by Milestone 1. It remains excluded from
    production and `v3`; no audio-to-text output, transcript retention, cloud
    call, or ASR quality oracle is admitted.
13. A synthetic case is not sufficient evidence when the evaluator lacks its
    applicable scoring dimension. The unscored `v1` screen was therefore
    discarded instead of interpreting general intelligibility as numeric or
    punctuation accuracy. `v2` applies each technical dimension only to cases
    whose frozen corpus tags make it meaningful.
14. The exact high-level Qwen API does not expose native incremental frames or
    cooperative mid-call cancellation, but a useful bounded topology is still
    credible: consume one existing narration segment, publish its complete
    waveform immediately, reject stale identities in the controller, and
    terminate an isolated worker when cancellation occurs. This is sufficient
    to continue the evaluation cycle, not sufficient to select the production
    transport.
15. The prototype's 5.210-second first-produced-audio observation is not an
    official warm measurement and does not pass the inherited 3-second gate.
    It is retained as an honest signal for Milestone 4 rather than interpreted
    as a prototype failure or hidden by changing the authority.
16. A safe `v3` summary must identify the exact evaluation without carrying
    the instruction, narration, audio, local paths, or candidate diagnostics.
    The new schema therefore exposes only fixed identifiers and SHA-256
    fingerprints, while the ignored raw journal carries bounded numeric
    observations plus the configuration fingerprint.
17. The 1.7B high-level API remains a complete-waveform boundary. Extending
    the shared adapter does not reclassify it as native streaming: progress
    occurs at one bounded narration segment, and cancellation credibility
    remains process termination plus identity-first stale rejection.
18. Pilot readiness must remain fail-closed even when the host appears idle.
    The first Milestone 4 attempt was only about 605 MB below the frozen
    free-RAM gate; admitting it anyway would change the authority after seeing
    host state. Closing user applications and rerunning the same preflight is
    valid, while weakening the 12 GiB gate is not.
19. The clean 1.7B CustomVoice model plus locked environment occupies about
    9.08 GiB, materially more than the earlier 0.6B candidate and distinct
    from the external Base prototype. Apache-2.0 licensing permits continued
    evaluation, but this footprint remains an explicit high packaging risk
    for Milestone 11 rather than an implicit production acceptance.

## Final validation results

Plan creation is documentation-only. At creation time:

- the external prototype was inspected read-only and remains unchanged;
- no private reference audio, transcript, input text, generated audio, model
  artifact, or absolute private path was copied into VoxLeaf;
- no production dependency, engine adapter, profile selection, or hardware
  support claim was added;
- a local Markdown-link audit passed for all 13 changed Markdown files;
- `git diff --check` passed;
- the changed-file privacy and forbidden-artifact scan passed for all 13
  changed files;
- `pnpm.cmd check:portable` passed in 27.1 seconds, including 18 shared test
  files / 175 tests, 34 EPUB test files / 555 tests, 20 desktop test files /
  204 tests, 6 native-WebDriver-client tests, and 50 Python tests;
- `pnpm.cmd check` passed in 51.6 seconds with the same TypeScript/Python
  evidence plus Rust format, Clippy, zero-test crate execution, and the native
  release build; and
- implementation and official `v3` validation remain not started. The
  existing informational Vite chunk-size advisory remains unchanged.

After the suggestion-disposition follow-up, the two changed Markdown files
again passed local-link, privacy-canary, and `git diff --check` audits.
`pnpm.cmd check:portable` passed in 26.5 seconds and `pnpm.cmd check` passed in
50.5 seconds with the same test/build scope above. No runtime or architecture
status changed, so the canonical system diagram remains accurate without
another node or edge change.

Milestone 3 extended the benchmark without running the official matrix.
Authority, adapter, preflight, raw journal, quality-session, safe-summary,
privacy, cancellation, and cleanup behavior passed 72 GPU-free tests. The
isolated lock and offline import smoke passed without loading weights. The
real-host preflight hashed both exact artifacts and found no authority,
environment, firewall, provider, artifact, RAM, VRAM, disk, or measurement
failure; only the three deliberately false operator-readiness declarations
failed, as intended.

`pnpm.cmd check:portable` and `pnpm.cmd check` both passed with the full
TypeScript, Python, Rust, packaging, and build scope described in the progress
log. `git diff --check`, local Markdown links, changed-file private
path/credential patterns, tracked audio/model/raw-input exclusions, and raw
cleanup audits passed. No model was loaded by the preflight, no official
observation was accepted, no audio was generated, and no raw session or
private path was retained.

Milestone 4 began from a clean merged base. The first preflight correctly
rejected insufficient readiness without loading the model; after RAM recovered,
the one permitted disposable pilot passed from clean checkpoint `8475b28`.
Artifact, authority, interpreter, provider, firewall, disk, RAM, VRAM, offline,
generation, and cleanup boundaries passed the pilot. The independent
license/packaging audit found no license ambiguity and measured the exact
CustomVoice model plus isolated environment at `9,747,862,094` bytes. No
official observation, generated audio, raw journal, or private input exists at
this checkpoint.

After correcting the candidate to CustomVoice for the built-in-default-voice
requirement, all 13 changed Markdown files passed the local-link,
privacy-canary, forbidden-artifact, and `git diff --check` audits. The initial
sandboxed `pnpm.cmd check:portable` attempt could not scan the existing
`.pytest_cache`; the same command rerun outside the sandbox passed in 28.2
seconds. `pnpm.cmd check` then passed in 50.1 seconds, including 18 shared test
files / 175 tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204
tests, 6 native-WebDriver-client tests, 50 Python tests, Rust formatting,
Clippy, crate-test execution, and the native release build. The system-diagram
status labels now describe CustomVoice screening, while the topology remains
unchanged. No runtime candidate, built-in speaker, production dependency, or
profile is selected by this documentation change.

Milestone 1's pre-audio implementation checkpoint added an isolated
107-package candidate lock, three byte-frozen JSON authorities, a closed
screen command surface, and six model-free tests without adding a production
runtime dependency. The focused Ruff, strict mypy, pytest, exact candidate
import, and package-script import smokes passed. The first full
`pnpm.cmd check:portable` attempt correctly stopped on one Ruff formatting
drift; after applying Ruff, the complete command passed in 26.7 seconds with
the existing TypeScript scope and 56 Python tests. `git diff --check` also
passed. No audio has been generated, no evaluator result exists, and
`selectedSpeaker` remained `null` at that pre-audio checkpoint. The later
screen/result entries above supersede only that status statement.

Milestone 1 closeout froze the schema-valid content-safe speaker aggregate and
`profile-v3.json` before prototype or official benchmark results. The focused
authority suite and both repository aggregates passed. Final
`pnpm.cmd check:portable` passed in 27.1 seconds with 18 shared test files /
175 tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204 tests,
6 native-WebDriver-client tests, and 57 Python tests.
`pnpm.cmd check` passed outside the sandbox in 49.5 seconds with the same
TypeScript/Python evidence plus Rust format, Clippy, crate-test execution,
native release build, and Python source/wheel packaging. Its sandboxed
precursor stopped only because Prettier could not scan the protected existing
`.pytest_cache`. The exact isolated candidate `uv lock --check` resolved all
107 packages.

All 14 changed Markdown files passed the local-link audit. `git diff --check`,
changed-file private-path/credential-pattern scans, the tracked
audio/model/private-input audit, and root/raw-session cleanup checks passed.
The generic rejected-pattern documentation mentions `input.txt` but contains
no copy of that private file. No generated audio, scorecard, model weight,
private input, private path, credential, or raw evaluator submission remains
in the reviewable tree.

Milestone 1 is complete at
`e14c7770bdd9bc8be2bd392fe011f0c1dea249c0`. This completion admits the exact
Serena profile only to Milestone 2's pre-admission prototype. It does not
select a production engine or unblock Milestone 7.

Milestone 2 implemented and froze its authority in
`a9622b7` (`docs(tts): freeze incremental cancellation prototype`), then
implemented the model-free topology and exact candidate command in `1cc4fd2`
(`feat(tts): prototype bounded segment cancellation`). The focused final
authority/topology suite passed with 6 tests. The exact candidate lock check
resolved all 107 packages.

The hardware execution and schema-valid content-safe result were committed as
`2a7017e` (`feat(tts): record passing incremental prototype`). From that
committed state, `pnpm.cmd check:portable` passed in 26.2 seconds and
`pnpm.cmd check` passed in 48.5 seconds. Both included 18 shared test files /
175 tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204 tests,
6 native-WebDriver-client tests, and 63 Python tests. The native aggregate
also passed Rust formatting, Clippy, crate tests, the release build, and
Python source/wheel packaging. The existing Vite chunk-size advisory remained
informational.

All relative links in the 14 changed Markdown files resolved. `git diff
--check`, changed-file private-path/credential scans across 22 changed files,
the tracked audio/model/private-input scan, and ignored raw-file cleanup scan
passed. No prototype Python worker remains; the pre-run 45-minute AC sleep
setting is restored. The only GPU compute row after the run is unrelated to
the prototype. No generated audio, raw result file, model weight, private
path, credential, or user content was committed.

Milestone 2 is complete. The passing result permits Milestone 3 to extend the
candidate-neutral benchmark, but does not select the candidate, supersede
ADR-0013, unblock Milestone 7, claim native waveform streaming, or claim that
the inherited 3-second warm first-audio gate passed.

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

The primary new candidate direction is Qwen3-TTS 12Hz 1.7B Base voice cloning
in transcript-conditioned ICL mode. The speaker-embedding-only
`x_vector_only_mode` is a separate possible fallback profile because it changes
quality and conditioning behavior materially. OpenAI Whisper is rejected as a
production TTS candidate because it recognizes speech and emits text rather
than synthesizing speech from text.

## User-visible outcome

This plan has no immediate user-visible production feature. If it succeeds,
Milestone 7 receives one exact, measured local TTS integration target and can
begin a separate process/protocol implementation plan. If it fails, VoxLeaf
retains a truthful blocker instead of integrating a model that cannot meet the
reader's startup, cancellation, quality, privacy, or resource requirements.

Voice cloning is evaluation scope only at plan creation. This plan does not
silently add voice enrollment, reference-audio persistence, impersonation
features, or generated-audio export to the MVP. Any production voice-cloning
experience requires an explicit product, consent, privacy, and persistence
decision before Milestone 7 can expose it.

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
- The production `services/tts` package still has zero runtime dependencies.

### Maintainer-provided Qwen voice-cloning prototype

The maintainer has a separate, external WSL prototype that was inspected
read-only. It is not copied into VoxLeaf and its private inputs and outputs are
not repository evidence.

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

1. Build a reference prompt once, then reuse it for bounded generation units.
2. Keep candidate batching at one until measurements justify a larger batch.
3. Generate from VoxLeaf's stable locator-linked narration segments and
   publish each valid segment as soon as its audio is available.
4. Keep any diagnostic retry bounded and explicit without allowing it to hide
   an official first-attempt failure; reject every result whose session,
   generation, segment, model, voice, reference, or settings identity is
   stale.
5. Evaluate VAD or a cheaper content-free signal as a post-generation defect
   detector without making it a substitute for human Spanish quality review.
6. Measure ICL and x-vector-only modes as different profiles; never switch
   between them silently.
7. Fingerprint every configuration and authorized reference input used for
   evaluation without retaining the reference audio, transcript, generated
   audio, or book text in committed artifacts.

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
| Build the voice-clone prompt once and reuse it | **Adopt with bounds.** Reuse one in-memory prompt only inside an authorized evaluation session. Key it by exact engine/model revision, mode, reference fingerprint, transcript fingerprint, sampling/configuration, precision, and provider; dispose it on session end or identity change. | Plan Milestones 1–3 | Milestone 7 service lifecycle, only for a selected profile |
| Generate with candidate batch size one | **Adopt as the conservative `v3` default.** It limits retained work and makes segment ownership observable. A larger batch requires pre-result authority plus measured benefit without weakening memory or cancellation. | Plan Milestones 1–4 | Milestone 7 may retain or supersede it from selected-profile evidence |
| Use bounded VoxLeaf narration segments | **Adopt.** The candidate consumes existing `narration-v1` units; it does not invent paragraph/chapter accumulation or model-specific text contracts. | Plan Milestone 2 | Milestones 7 and 9 |
| Deliver each completed segment immediately | **Adopt for the prototype and selected-profile handoff.** Segment-at-a-time delivery improves startup and boundedness, but a complete-waveform call still does not prove mid-segment streaming or cancellation. | Plan Milestone 2 | Milestone 7 emits selected-profile audio; Milestone 8 buffers/plays it |
| Retry failed segments a limited number of times | **Defer for production and prohibit as hidden benchmark recovery.** Official `v3` measurements count the first attempt and every failure. A separately labeled diagnostic retry may investigate a defect but cannot make a gate pass. | Plan Milestones 1 and 3 freeze/test failure accounting only | Milestone 10 may add bounded retry after failure classification, stale-result rejection, backoff, cleanup, and latency evidence |
| Use VAD/energy checks for silence, missing speech, or broken tails | **Adopt only as an optional benchmark defect signal.** Run it after timed synthesis, preserve the original result, report only content-free flags/counts, and keep human Spanish review authoritative. Do not trim, fade, repair, or rescore official audio automatically. | Plan Milestones 1, 3, and 4 if admitted before results | Milestone 10 may consider production monitoring only after false-positive, latency, memory, dependency, and quality evidence |
| Attach generation identities and discard obsolete audio | **Adopt as mandatory.** Use the existing session/generation/segment identities plus exact candidate, voice/reference, and settings identity. Identity rejects stale output even when the model cannot stop promptly; it does not replace cancellation cleanup. | Plan Milestones 1–3 | Milestones 7–9 enforce the protocol, buffer, playback, and synchronization boundary |
| Evaluate normal ICL and x-vector-only modes | **Adopt as separate candidate profiles.** They cannot share a result, quality conclusion, fallback label, or silent runtime switch. X-vector-only enters `v3` only if frozen before results. | Plan Milestones 1 and 4 | Milestone 10 may expose a measured fallback only if it independently passes |
| Fingerprint model, reference, transcript, and settings | **Adopt as mandatory.** Store only content-free hashes/identifiers in safe evidence; private reference material stays in the raw area and is deleted after derivation. | Plan Milestones 1, 3, 4, and 6 | Milestones 7 and 10 own runtime identity and diagnostics |
| Persist generated WAV files | **Reject for normal VoxLeaf behavior.** Disposable blinded-quality audio may exist only in the ignored private raw area and must be cleaned after evidence derivation. Audiobook export remains outside the MVP. | Existing constraint; verify in Plan Milestones 3, 4, and 6 | Milestones 8 and 11 retain non-persistence |
| Print narration or store prose previews | **Reject.** Errors, logs, summaries, tests, and diagnostics remain content-free. | Existing constraint; verify in Plan Milestones 3, 4, and 6 | Milestones 7–11 |
| Track `input.txt`, bytecode, private paths, or raw voice material | **Reject.** Candidate inputs and outputs use ignored private raw storage; repository tests use synthetic/public authorities and privacy canaries. | Plan Milestones 3 and 6 | Milestone 11 packaging/privacy review |
| Load by remote model name or use unlocked dependencies | **Reject for official or production execution.** Use an isolated lock, exact local artifact revision/hashes, fail-closed offline preflight, outbound blocking, and no runtime download. | Plan Milestones 1, 3, and 4 | Milestone 11 owns the deliberate distribution/acquisition strategy |
| Reuse audio from a paragraph-text-only cache key | **Reject.** Milestone 6.1 adds no persistent audio cache. In-memory prompt reuse uses the complete identity tuple above; any future audio cache requires a separate privacy/persistence decision. | Plan Milestones 1–3 | No roadmap commitment |
| Retain and join all paragraph/chapter waveforms | **Reject.** Retention is capped at the active bounded segment/frame and explicit queue limits. | Plan Milestone 2 | Milestones 7 and 8 |
| Accept the high-level complete-waveform API as “streaming” | **Reject without proof.** The candidate cycle stops before the full matrix unless the exact topology proves bounded delivery, after-first-audio cancellation/stale suppression, and cleanup. | Plan Milestone 2 stop gate | Milestone 7 implements only the capability actually selected |
| Treat the observed 4.3 GiB model and 7.8 GiB environment as acceptable packaging | **Do not decide from the prototype.** Measure clean locked artifacts separately; retain exact-host and exact-environment scope. | Plan Milestone 4 | Milestones 10 and 11 own support and packaging decisions |

No new ADR is required for this disposition because no production engine,
transport, retry policy, VAD dependency, cache, or voice-cloning product
experience is selected. The accepted privacy/boundedness rules already govern
the project. A passing profile must hand candidate-specific facts to a
superseding selection ADR; Milestones 7, 8, and 10 must record any later
durable runtime choices when their evidence exists.

### Official Qwen3-TTS evidence

The official
[Qwen3-TTS release post](https://qwen.ai/blog/?id=qwen3tts-0115),
[Qwen3-TTS repository](https://github.com/QwenLM/Qwen3-TTS), and
[1.7B Base model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
establish the following candidate-intake facts:

- Qwen publishes 0.6B and 1.7B Base models for rapid voice cloning and lists
  Spanish among ten supported languages.
- The Base path accepts reference audio plus its transcript. The official
  package documentation warns that speaker-embedding-only
  `x_vector_only_mode` may reduce cloning quality.
- A reusable prompt can avoid recomputing reference features for every
  synthesis call.
- The family is described as supporting streaming and advertises a best-case
  end-to-end latency as low as 97 ms. This is an upstream family claim, not
  evidence for VoxLeaf's exact model, Python API, runtime, hardware, corpus, or
  command-to-audible path.
- The official repository currently documents vLLM-Omni local offline
  inference while stating that online serving and further streaming support
  are future work.
- The 1.7B Base model repository is Apache-2.0 and is approximately 4.54 GB at
  the reviewed upstream state.

The installed `qwen-tts==0.1.1` source used by the personal prototype adds an
important constraint: `generate_voice_clone` returns a list of complete NumPy
waveforms, and its `non_streaming_mode` option changes text-input conditioning
rather than exposing an incremental waveform iterator. The prototype also
sets `non_streaming_mode=True`. Therefore the upstream streaming claim does
not, by itself, resolve VoxLeaf's incremental-audio or cancellation blocker.

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
- Decide whether voice-cloning enrollment is acceptable for evaluation and,
  separately, whether it could be acceptable product behavior.
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
- Commit reference audio, reference transcripts, generated audio, model
  weights, raw journals, book text, private paths, secrets, or user identity.
- Persist voice embeddings, acoustic tokens, reference inputs, or generated
  audio without a separate accepted privacy/persistence decision.
- Add audiobook export, voice impersonation, or general voice-cloning product
  claims.

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `benchmarks/tts/candidates-v1.json`
- `benchmarks/tts/selection-v2.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/architecture/overview.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/tts-feasibility-profile-v2.md`
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
boundary until a profile passes. Model-specific tokenization, prompt
construction, sampling controls, x-vector/ICL behavior, and output conversion
must never leak into `@voxleaf/epub`, `narration-v1`, displayed text, or stable
locator contracts.

The first prototype must distinguish three different boundaries:

1. **Reference preparation:** decode one authorized reference, create the
   prompt, measure its time/resources, and keep the result only in memory.
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
summary areas, and cleanup verification. Reference audio and transcript are
private sensitive inputs. Generated speech and any Whisper-produced
transcript are equally sensitive.

The personal WSL success demonstrates feasibility on the maintainer's existing
computer only. Windows remains authoritative for native VoxLeaf development
and official support evidence. WSL and Windows environments, caches, locks,
and outputs must remain isolated.

## Milestones

## Milestone 1: Freeze candidate and product authority

### Work

- Decide whether user-provided voice cloning is evaluation-only or an
  acceptable optional MVP direction. Record consent, ownership,
  impersonation-abuse, deletion, persistence, and recovery boundaries before
  production selection.
- Admit exact candidate identifiers for transcript-conditioned 1.7B Base ICL
  and, only if justified, x-vector-only fallback. Treat them as separate
  profiles with separate quality and performance outcomes.
- Pin the Qwen engine, model revision, artifact hashes, PyTorch/CUDA runtime,
  attention implementation, precision, sampling parameters, reference-input
  policy, and supported platform.
- Define a licensed or explicitly authorized reference corpus that can be
  evaluated without committing private voice data.
- Decide whether local Whisper is excluded completely or admitted only as an
  optional post-generation benchmark tool. Do not admit the OpenAI API.
- Define a pre-admission prototype gate requiring a credible incremental-audio
  and cancellation boundary.
- Freeze batch size one, the complete prompt identity tuple and in-memory
  lifetime, first-attempt failure accounting, the no-hidden-retry rule, and
  whether post-timing VAD/energy checks are admitted.
- Publish and accept `tts-feasibility-profile-v3` before official execution.

### Validation

- Candidate identities and artifacts are immutable and independently
  checkable.
- ICL and x-vector-only modes cannot be mixed or silently coerced.
- The authority contains no observed official `v3` result.
- Product and privacy boundaries explicitly cover reference voice data.
- Whisper is absent from the production-candidate set.

### Status

Not started. The research in this plan is candidate-intake evidence only.

## Milestone 2: Prove incremental output and cancellation credibility

### Work

- Reproduce the exact candidate on the authoritative Windows host from an
  isolated lock and verified local artifacts.
- Measure reference-prompt preparation separately from model load and
  synthesis.
- Prototype bounded generation from existing `narration-v1` segments with
  batch size one.
- Build the authorized reference prompt once per exact identity and reuse it
  without persisting the prompt, reference, transcript, or derived tokens.
- Publish each valid audio unit immediately instead of joining a paragraph or
  chapter.
- Cap retained input/output at the active segment plus the explicit test queue;
  release each unit before advancing beyond that bound.
- Exercise cancellation before dispatch, after acceptance, after first audio,
  near the hard mid-generation boundary, and during cleanup.
- Reject late/stale audio by session, generation, segment, candidate,
  voice/reference, and settings identity even when the underlying model call
  finishes after cancellation.
- Stop the candidate cycle before the full matrix if no credible incremental
  output or bounded cancellation topology exists.

### Validation

- The prototype reports first-produced-audio and cancellation timestamps
  without recording input text or audio.
- Retained text, waveform, prompt, and queue sizes have explicit ceilings.
- No cancellation trial publishes a stale frame.
- Worker or cooperative-stop cleanup releases RAM/VRAM within the frozen
  bound.

### Status

Not started. No production adapter is authorized.

## Milestone 3: Extend the candidate-neutral benchmark safely

### Work

- Add the exact candidate environment and lock outside production runtime
  dependencies.
- Add a candidate adapter behind the existing benchmark contracts.
- Add model-free tests for reference metadata, complete prompt-key identity,
  prompt reuse/disposal, batch-one/retention bounds, unit/frame ordering,
  first-attempt failure accounting, no-hidden-retry behavior, cancellation,
  stale identity, cleanup, content-free errors, and configuration mismatch.
- Add fail-closed preflight checks for local artifacts, offline controls,
  authorized reference fingerprints, runtime/provider/precision, and hardware.
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
- Privacy canaries prove that reference text, book text, ASR transcripts,
  generated audio, paths, and identity do not reach safe summaries.

### Status

Not started.

## Milestone 4: Execute the frozen v3 evaluation

### Work

- Run pilot validation only as permitted by the frozen authority.
- Execute cold-load, warm, shorter-complete, sustained, cancellation, RAM,
  VRAM, offline, artifact, cleanup, and packaging matrices.
- Count the first attempt and every failure. Do not retry an official sample
  into a passing result; separately labeled diagnostic retries are
  non-promotable.
- Execute blinded Spanish quality evaluation with the frozen minimum panel.
- Score ICL and x-vector-only separately if both were admitted.
- Run any admitted ASR or VAD defect analysis after timed synthesis and keep
  its content-free result separate from human quality scores.
- Record only allowlisted content-free summaries and delete disposable audio,
  raw journals, ASR text, and private reference working data after derivation.

### Validation

- Every count and gate matches `tts-feasibility-profile-v3`.
- Results identify the exact host and make no broader hardware claim.
- Network blocking and local-path-only model loading are directly verified.
- No failed, timed-out, missing-panel, or meaning-changing-defect result is
  promoted.

### Status

Not started; unavailable until Milestones 1 through 3 complete.

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
- A selected profile identifies exact artifacts, runtime, voice/reference
  policy, prompt lifecycle/identity, batch/retention limits, first-attempt
  reliability, hardware evidence, offline controls, and actual incremental or
  complete-waveform capabilities.
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
  generated audio, raw journals, ASR transcript, copyrighted text, secrets,
  or private paths.

### Status

Not started.

## Testing and benchmark strategy

Deterministic default validation must remain model-free and hardware-free.
Unit tests should cover candidate manifest decoding, reference-policy
validation, prompt reuse identities, x-vector/ICL separation, incremental
frame ordering, cancellation state transitions, stale-frame rejection,
content-free failures, cleanup accounting, and summary allowlists.

Hardware-specific execution is manual and isolated. Performance timing begins
and ends at the same adapter boundary for every candidate. Reference prompt
creation, cold model load, warm synthesis, first audio, complete audio, and
cleanup are separate measurements. Batch size, segment size, sampling
parameters, precision, attention implementation, model revision, and reference
policy are frozen inputs.

Whisper, if admitted as test-only ASR, runs after TTS timing and in a separate
process/resource phase. Only numeric alignment or error aggregates may leave
the raw area. Human listeners remain authoritative for pronunciation,
naturalness, prosody, artifacts, and meaning-changing defects.

The existing synthetic neutral/Spanish corpus remains the text authority
unless `v3` changes it before results. No personal book excerpt, private
reference transcript, or generated audio may become a fixture.

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
- **Voice cloning expands privacy and abuse risk.** Keep it evaluation-only
  until consent, ownership, storage, deletion, and impersonation boundaries
  are accepted.
- **Private reference data may leak through logs, metadata, exceptions, ASR,
  or fixtures.** Use content-free identities, raw-area isolation, canaries,
  cleanup, and a final repository scan.
- **X-vector-only may trade quality for stability without improving latency or
  VRAM materially.** Measure it as a separate candidate; never assume it is a
  compatibility profile.
- **Whisper may be mistaken for a TTS engine or automatic quality oracle.**
  Keep its role explicitly ASR-only and optional; human quality gates remain.
- **Prior informal success may bias the frozen authority.** Record it as
  non-promotable intake evidence and freeze all official gates before new
  results.

Rollback is documentation-only until candidate implementation begins: revert
the plan/roadmap change and retain ADR-0013. Later candidate code remains
isolated under development-only benchmark projects and can be removed without
changing production contracts or dependencies.

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

## Discoveries and decisions

1. The previous Qwen rejection is profile-specific. It does not reject the
   1.7B Base family, voice cloning, ICL conditioning, another runtime, or
   another output boundary.
2. The personal prototype's good voice similarity is explained by a richer
   conditioning path: speaker embedding plus reference acoustic codes and
   exact transcript. The official documentation independently warns that
   x-vector-only can reduce cloning quality.
3. Prompt reuse, batch size one, bounded retries, and per-unit review are
   useful concepts, but paragraph persistence, prose logging, incomplete cache
   identity, and complete-paragraph retention conflict with VoxLeaf.
4. The official Qwen family advertises streaming, yet the exact installed
   high-level Python call returns complete waveforms. The next work must prove
   the runtime/output boundary rather than cite the family capability.
5. Whisper is the wrong direction for production narration. Local ASR may help
   measure content consistency, but it cannot replace human listening and
   introduces its own privacy/resource boundary.
6. A new blocker-resolution milestone is preferable to starting Milestone 7:
   production protocol design needs a real selected engine's output,
   cancellation, lifecycle, and resource behavior.
7. Prompt reuse, batch size one, bounded narration-segment consumption,
   immediate unit delivery, complete identities, and separate ICL/x-vector
   profiles belong in this evaluation plan. They are constraints on the
   experiment, not claims that production behavior exists.
8. Automatic retry cannot participate in `v3` gate promotion because it would
   hide first-attempt reliability. It may be designed later in Milestone 10.
   VAD/energy analysis is optional post-timing evidence only and needs a
   separate pre-result admission decision.
9. Persistent generated audio, prose logging, tracked private inputs,
   text-only audio caching, paragraph/chapter accumulation, runtime downloads,
   unlocked dependencies, and unproven “streaming” remain rejected.

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

Update this section with later implementation commands, outcomes, commit
identities, and CI evidence as the plan progresses.

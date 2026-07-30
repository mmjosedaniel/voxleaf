# Post-MVP local TTS candidate backlog

## Status and timing

This is primarily a post-MVP research backlog, not evaluation authority,
implementation approval, or a support claim. Completed M010 is not expanded.
The approved M010.1 ExecPlan promotes only an exact Piper English baseline,
exact local Qwen/Serena Spanish and Qwen/Aiden English controls, Chatterbox
Multilingual V3, and MOSS-TTS-Nano 100M ONNX into bounded pre-M011 work.
CosyVoice was rejected at intake. Every other entry remains post-MVP.

The current MVP direction remains:

- exact Piper 1.4.2 / `es_ES-davefx-medium` as the selected, integrated
  speed-focused CPU fallback; production distribution remains M011 work;
- exact Piper 1.4.2 / `en_US-joe-medium` admitted by the M010.1 v8 baseline
  for later Milestone 6 integration, not yet a selectable product profile;
- exact Qwen3-TTS/Serena as the optional higher-quality GPU-dependent
  development profile, with exact Qwen/Aiden retained for independent English
  quality and hardware-dependent constrained-buffer review;
- exact Chatterbox Multilingual V3 advanced as the sole new-engine full-matrix
  survivor, without product admission; and
- one active service tree, bounded in-memory audio, identity-first
  cancellation, no remote inference, and no generated-audio persistence.

Any future evaluation requires a separate ExecPlan and newly frozen
result-blind authority before result-bearing execution. Candidate claims,
upstream benchmarks, parameter counts, or family names cannot admit a runtime
or voice by themselves.

## Bounded pre-M011 exception

M010.1 exists because explicit English narration and a stronger naturalness
demonstration became active portfolio requirements after M010 closed. It must
not turn this entire backlog into MVP scope:

1. Exact Piper/joe English passed the low-risk bilingual baseline and is
   retained for Milestone 6 integration.
2. Retain exact local Qwen 1.7B CustomVoice Serena/Spanish and native-English
   Aiden/English independently; Milestone 5 must collect result-neutral
   language-specific quality evidence before integration decisions.
3. Advance Chatterbox Multilingual V3 to the next frozen full matrix and defer
   MOSS-TTS-Nano 100M ONNX without rejection pending dialogue/punctuation and
   voice investigation.
4. Retain Fun-CosyVoice3's intake rejection unless a future result-blind
   authority establishes a non-personal default voice.
5. Integrate at most one passing new engine. If none passes, record no winner
   and continue to M011 with the existing M010 support matrix.

Pocket TTS Spanish, the separate Chatterbox Latin American Spanish checkpoint,
Kokoro, and additional voices stay in this backlog. The active
[M010.1 ExecPlan](../plans/active/M010-001-bilingual-narration-and-candidate-screening.md)
will become the only execution authority for the promoted subset.

## Engine-specific text adaptation boundary

Future engines may require different input preparation, but VoxLeaf must not
duplicate general narration normalization inside every model adapter. Preserve
the following ordered boundary:

1. `@voxleaf/epub` owns canonical, locator-preserving normalization and
   semantic segmentation, including accepted number and symbol expansion.
2. A selected engine profile may add deterministic sizing or retention limits
   over that canonical prepared text.
3. The service adapter maps the bounded segment to the exact engine, voice,
   language, input format, and generation parameters.

Piper's implemented `narration-piper-v2` policy is the current example of the
second layer: it accounts for spoken expansion and omits nonspoken
punctuation-only units, but it does not rewrite prepared text. No separate
Piper text preprocessor is currently necessary or approved. Qwen generation
controls such as temperature are adapter configuration rather than canonical
text preprocessing.

Create a shared `EngineTextAdapter` interface only after at least two admitted
engines demonstrate concrete and incompatible adaptation requirements.
Before adopting any engine-specific text rewrite, freeze the exact rule and
prove:

- deterministic and bounded output with bounded cancellation work;
- stable source identity and locator-range traceability;
- no change to displayed EPUB text or persisted reading position;
- preserved meaning plus a measured pronunciation or compatibility benefit;
- no private text, adapted text, or generated audio in logs or persistence;
  and
- candidate-neutral evaluation text remains byte-identical unless a newly
  frozen evaluation authority explicitly versions the corpus.

This is a future decision constraint, not implementation approval or a reason
to delay the current MVP.

## Prioritized candidates

### 1. Pocket TTS Spanish

Pocket TTS is the highest-priority post-MVP challenger for a balanced CPU
profile. Its official project describes a 100M-parameter CPU-oriented engine,
incremental audio streaming, Spanish support, a Spanish preset named `lola`,
and no requirement to use personal voice cloning.

The license boundary is not simply MIT. The implementation repository is
MIT, while the currently published model repository is marked CC-BY-4.0,
requires acceptance of access conditions, and points to separately sourced
voice assets. Before admission, VoxLeaf must freeze the exact Spanish and
optional 24-layer artifacts, `lola` voice provenance, access terms, transitive
runtime, redistribution permission, attribution, offline acquisition, and
commercial-packaging obligations.

If licensing intake passes, screen warm first audio, sustained RTF, real
incremental publication, cancellation and stale-frame rejection, RAM,
long-form stability, pronunciation, omissions, repetitions, inventions, and
auditory fatigue on the accepted Spanish corpus.

Sources:

- [Pocket TTS official repository](https://github.com/kyutai-labs/pocket-tts)
- [Pocket TTS model repository](https://huggingface.co/kyutai/pocket-tts)
- [Kyutai voice repository](https://huggingface.co/kyutai/tts-voices)

### 2. Chatterbox Latin American Spanish

The dedicated Chatterbox `es-419 / es-MX` checkpoint is the highest-priority
future Latin American Spanish quality candidate. Its model card describes a
regional single-language fine-tune and marks the checkpoint MIT. The primary
checkpoint is approximately 2.14 GB before companion decoder/runtime assets,
so it should be evaluated as a quality profile, not assumed to be a CPU
fallback.

Admission must first prove an exact redistributable built-in/default voice
that requires no user reference recording. The short screen must then measure
GPU/CPU placement, startup, VRAM/RAM, sustained RTF, bounded cancellation,
long-form hallucination/repetition, foreign-name behavior, and whether
regional pronunciation materially improves over Piper and Qwen. A passing
screen would justify a full candidate-neutral benchmark against the retained
Qwen quality direction.

Sources:

- [Chatterbox official repository](https://github.com/resemble-ai/chatterbox)
- [Latin American Spanish checkpoint](https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam)

### 3. MOSS-TTS-Nano

MOSS-TTS-Nano is retained as an experimental candidate only. Its official
100M model repository is marked Apache-2.0 and describes multilingual,
CPU-capable inference; the project also publishes an ONNX path and a local
reader prototype with incremental decoding.

It is a recent autoregressive candidate and must not be treated as stable
without evidence. Intake must verify the exact code, model, tokenizer,
default-voice and ONNX artifact licenses and prove that a redistributable
preset voice works without personal voice cloning. The rejection screen must
prioritize missing, duplicated, invented, or truncated speech; speaker drift;
corrupt maximum-token audio; cancellation; memory growth; and sustained
chapter-length behavior.

Sources:

- [MOSS-TTS-Nano official repository](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [MOSS-TTS-Nano 100M model](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M)
- [MOSS-TTS-Nano Reader](https://github.com/OpenMOSS/MOSS-TTS-Nano-Reader)

### 4. Kokoro-82M

Kokoro remains a future English-first candidate and a secondary Spanish
comparison. Its official weights are marked Apache-2.0, it has 82M
parameters, and the current project advertises Spanish plus preset voices.

VoxLeaf already reviewed an earlier Kokoro intake during M006 and rejected it
before measurement: the Python lock pulled `espeakng-loader`, whose published
metadata did not declare a license while bundling native eSpeak assets, and
the separate ONNX release did not bind the current Spanish voice into one
immutable bundle. Re-evaluation is allowed only if a future exact release
resolves both issues. English evaluation should wait until English narration
is an active product requirement.

Sources:

- [Kokoro official repository](https://github.com/hexgrad/kokoro)
- [Kokoro-82M model repository](https://huggingface.co/hexgrad/Kokoro-82M)
- [M006 discovery record](../plans/completed/M006-local-tts-feasibility-and-engine-profiles.md)

### 5. Additional Piper Spanish voices

This is a voice comparison within the selected engine, not a new Piper engine
evaluation. A future screen may compare licensed Latin American voices, such
as a frozen `es_MX` profile, against `es_ES-davefx-medium` for accent,
naturalness, fatigue, and normalization behavior.

Each voice is a separate artifact and support claim. It requires its own
model-card/provenance review, immutable hash and configuration, quality
screen, and packaging decision. The passing davefx result must not be copied
to another voice.

Source:

- [Official Piper voice inventory](https://huggingface.co/rhasspy/piper-voices/blob/main/voices.json)

## Deferred or closed directions

- **Piper/davefx:** already evaluated, selected, and integrated by M010
  Milestone 6. This backlog does not reopen that decision.
- **Supertonic 3:** already failed the frozen VoxLeaf compatibility evaluation.
  Upstream speed claims do not reopen that result.
- **MeloTTS:** defer because it offers no demonstrated product advantage over
  the prioritized candidates.
- **KittenTTS:** defer while it remains English-focused and preliminary.
- **Sherpa-ONNX:** treat as a possible common runtime, not a voice model.
  Investigate it only when a selected exact candidate shows that it would
  materially improve Windows packaging, cancellation, or dependency
  isolation. Runtime licensing does not replace model and voice licensing.

## Required future evaluation sequence

For each candidate:

1. Confirm a useful preset voice that does not require user voice cloning.
2. Freeze exact engine, model, voice, tokenizer/phonemizer, runtime,
   configuration, licenses, commercial-use conditions, and artifact hashes.
3. Prove explicit acquisition followed by completely offline execution, with
   all weights and private raw results outside Git.
4. Run a bounded rejection screen for startup, RTF, memory, cancellation,
   failure rate, omissions, repetitions, inventions, pronunciation, and
   cleanup.
5. Freeze a complete candidate-neutral authority before any official
   result-bearing run.
6. Run the full deterministic, machine, human-quality, privacy, cleanup,
   repository, and packaging evaluation only for candidates that pass the
   screen.
7. Add a profile to the product only through a durable selection decision and
   a separate implementation milestone.

The comparison must retain the accepted synthetic Spanish normalization
coverage, include foreign names and mixed-language passages, and distinguish
engine quality from voice quality. Future English work requires its own
language and evaluator authority rather than silently reusing Spanish
evidence.

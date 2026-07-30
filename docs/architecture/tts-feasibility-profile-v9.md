# Corrective local bilingual TTS evaluation profile v9

## Status

V9 is the result-blind corrective authority for the remaining M010.1 candidate
work. The normative files are:

- [`profile-v9.json`](../../benchmarks/tts/profile-v9.json);
- [`candidates-v9.json`](../../benchmarks/tts/candidates-v9.json);
- the unchanged [`corpus-v7.json`](../../benchmarks/tts/corpus-v7.json);
- the private
  [`bilingual-raw-v9`](../../benchmarks/tts/schemas/bilingual-raw-v9.schema.json)
  schema; and
- the content-safe
  [`bilingual-summary-v9`](../../benchmarks/tts/schemas/bilingual-summary-v9.schema.json)
  schema.

V7 and v8 remain immutable. V9 corrects how future evidence is interpreted; it
does not rewrite old measurements.

## Corrected product interpretation

The `RTF <= 1.1` value is a preferred standard-support target. It is not an
automatic rejection rule for VoxLeaf's constrained buffered MVP. ADR-0015
permits the exact one-GPU Qwen development path to begin after a bounded audio
lead and continue with observable adaptive buffering.

The approximately 1.44 RTF already measured for Qwen/Serena and Qwen/Aiden is
therefore capacity evidence, not a blocker by itself. V9 reports the preferred
target as an advisory and allows quality review to continue.

## Corrected candidate identities

Qwen v9 reuses the exact v8 local model, lock, built-in Serena Spanish voice,
and built-in Aiden English voice. No runtime download, cloud API, clone prompt,
or personal reference audio is permitted.

Chatterbox v2 uses the current official source revision already frozen in v7
and explicitly selects `t3_model="v3"`. Its new isolated dependency lock is
separate from the historical v7/v8 lock. The same exact six V3 model artifacts
and bundled non-personal conditioning remain required. Its corrected host
preflight treats an NVIDIA-reported 8,000 MiB or greater as an 8 GB card,
instead of requiring the nominal 8,192 MiB value that consumer drivers may not
report.

MOSS v2 uses the already frozen model, codec, and source revisions. V9 records
the actual 16 files published at those revisions, including both the TTS model
and audio-tokenizer codec roots. `Ava`, ONNX Runtime CPU, four threads, fixed
sampling, and the frozen bilingual text remain unchanged.

## Bounded execution

Candidates execute sequentially with one loaded model at a time. Each bounded
screen uses five first-attempt cases and four cancellation trials per language.
It records cold load, first-audio time, warm RTF, process-tree RAM, dedicated
VRAM where applicable, cancellation behavior, language correctness, and
private human quality review.

The following stop an individual execution:

- artifact identity mismatch;
- missing outbound isolation;
- remote inference or runtime download;
- privacy or unbounded-retention failure; or
- unsafe host preflight.

A stop is an execution observation, not a model rejection. The harness records
only `measured-awaiting-decision` or
`execution-blocked-awaiting-decision`.

## Decision boundary

No model may be rejected automatically. After a content-safe summary and
private quality review are available, the maintainer decides whether to:

- retain the candidate for further evaluation;
- admit it to a product integration stage;
- defer it; or
- reject it with an explicit recorded rationale.

Until that decision, v9 records `pending-maintainer-decision` and
`rejectionRecorded: false`.

## Privacy and repository boundary

Book text, canaries, generated waveforms, raw evaluator forms, model weights,
environments, private paths, host identity, and raw failures remain ignored.
Only bounded content-safe summaries may be committed. Private raw sessions and
quality audio are removed after the decision evidence is derived.

# Local TTS profile selection v2

## Status

Accepted on 2026-07-25 as the content-free Milestone 6 selection record.
Neither evaluated candidate is selected for production.

This record applies the conjunctive gates in the accepted
[`tts-feasibility-profile-v2`](../../docs/architecture/tts-feasibility-profile-v2.md)
to the content-free actual results recorded in the
[Milestone 6 ExecPlan](../../docs/plans/active/M006-local-tts-feasibility-and-engine-profiles.md).
The exact candidate identities remain frozen by
[`candidates-v1.json`](candidates-v1.json).

The official performance journals were valid, but no schema summary can be
promoted because the available one-evaluator Spanish listening result does not
meet the frozen minimum of three evaluators. This record does not substitute
limited quality evidence with a passing value. The independently sufficient
performance, cancellation, zero-failure, and quality-panel failures below make
both role decisions reproducible without retaining raw journals, generated
audio, text, private paths, or model artifacts.

## Balanced role

Candidate:
`qwen3-tts-0-6b-customvoice-cuda-bf16-v1`.

Measured only on Windows `10.0.26200`, CPython `3.12.10`,
`qwen-tts==0.1.1`, PyTorch and Torchaudio `2.9.1+cu128`, CUDA,
bfloat16/SDPA, NVIDIA driver `577.05`, and an RTX 5060 Laptop GPU with
8,546,942,976 bytes of device VRAM. These observations do not establish a
general hardware requirement or support claim.

| Frozen gate                      |       Required |                                    Measured | Result   |
| -------------------------------- | -------------: | ------------------------------------------: | -------- |
| Process-cold load p95            |   at most 60 s |                                 7.2040064 s | Pass     |
| Warm first-produced-audio p95    |    at most 3 s |                                69.3758902 s | **Fail** |
| Warm time to 15 s of media p95   |   at most 12 s |                                92.8405388 s | **Fail** |
| Warm shorter-complete p95        |    at most 5 s |                                11.8831504 s | **Fail** |
| Warm request RTF p95             |   at most 0.80 |                            1.44146538043478 | **Fail** |
| Sustained request RTF p95        |   at most 0.80 |                                   1.4419725 | **Fail** |
| Total sustained RTF              |   at most 0.75 |                            1.42426716080402 | **Fail** |
| Peak process-tree RAM            | at most 12 GiB |                         2,660,442,112 bytes | Pass     |
| Peak process-attributed VRAM     |  at most 6 GiB |                         4,164,468,736 bytes | Pass     |
| Failed or timed-out observations |      exactly 0 | 3 failed mid-generation cancellation trials | **Fail** |

The two pre-generation cancellation trials stopped by worker termination in
0.3654485 and 0.2840815 seconds. All three mid-generation trials failed
because the complete-waveform API exposed no valid cancellation boundary.
The limited one-evaluator quality mean was 4.095238095238096, but it is not
promotable and includes four meaning-changing defects; therefore the minimum
panel and zero-defect quality gates also fail.

Exact offline synthesis after setup, artifact verification, cleanup, RAM, and
dual-signal VRAM gates passed. Engine and model licensing are Apache-2.0.
Packaging risk is high: the measured model plus isolated environment occupied
7,725,856,438 bytes, including 4,713,151,865 bytes in 373 native files.

Decision: **no balanced profile is selected**.

## Compatibility role

Candidate:
`supertonic-3-onnx-cpu-f1-es-v1`.

Measured only on Windows `10.0.26200`, CPython `3.12.10`,
`supertonic==1.3.1`, ONNX Runtime `1.27.0`, CPUExecutionProvider, float32,
and an Intel Core Ultra 7 255HX. These observations do not establish a general
CPU support claim.

| Frozen gate                      |      Required |                                    Measured | Result   |
| -------------------------------- | ------------: | ------------------------------------------: | -------- |
| Process-cold load p95            |  at most 30 s |                                 1.7851637 s | Pass     |
| Warm first-produced-audio p95    |   at most 5 s |                                12.1658585 s | **Fail** |
| Warm time to 15 s of media p95   |  at most 18 s |                                 12.952202 s | Pass     |
| Warm shorter-complete p95        |   at most 7 s |                                 2.6426412 s | Pass     |
| Warm request RTF p95             |  at most 1.10 |                           0.531674546833444 | Pass     |
| Sustained request RTF p95        |  at most 1.10 |                           0.640149345703125 | Pass     |
| Total sustained RTF              |  at most 1.08 |                           0.307939984424547 | Pass     |
| Peak process-tree RAM            | at most 4 GiB |                           667,475,968 bytes | Pass     |
| GPU providers or allocations     |     exactly 0 |                                           0 | Pass     |
| Failed or timed-out observations |     exactly 0 | 3 failed mid-generation cancellation trials | **Fail** |

The two pre-generation cancellation trials stopped by worker termination in
0.203811 and 1.4079207 seconds. All three mid-generation trials failed because
the complete-waveform API exposed no valid cancellation boundary. The limited
one-evaluator quality mean was 3.288095238095238, but it is not promotable and
includes five meaning-changing defects; therefore the minimum panel and
zero-defect quality gates also fail.

Exact offline synthesis after setup, artifact verification, cleanup, remaining
numeric gates, RAM, and zero-GPU gates passed. Engine code is MIT; the model
and F1 voice are BigScience OpenRAIL-M. The terms are explicit enough for this
decision but add enforceable use restrictions, notice/license flow,
machine-generated-content disclosure policy, and update review before
distribution. Packaging risk is moderate; the measured model plus isolated
environment occupied 526,432,796 bytes.

Decision: **no compatibility profile is selected**.

## Capability and follow-up decision

Both exact profiles proved local complete-waveform synthesis after setup.
Neither proved streaming generation or usable mid-generation cancellation.
Qwen proved CUDA acceleration only on the named measured host; no CPU fallback
was measured. Supertonic proved CPU execution only on the named measured host;
hardware acceleration was not evaluated.

The frozen matrix prohibits a weighted ranking or least-bad selection.
Milestone 7 therefore has no authorized engine integration target and remains
blocked. The required roadmap response is a new candidate-evaluation cycle:

1. admit an exact candidate or materially changed engine API with a credible
   incremental-audio and mid-generation cancellation boundary;
2. freeze a new profile version before observing its results;
3. rerun the complete candidate-neutral performance, quality, offline,
   licensing, cleanup, and packaging protocol, including at least three fluent
   Spanish evaluators; and
4. accept a superseding ADR only if every applicable gate passes.

Do not lower the frozen gates, infer a passing quality panel from one
evaluator, treat buffering as a repair for startup or cancellation, or add
either rejected candidate to the production service dependency graph.

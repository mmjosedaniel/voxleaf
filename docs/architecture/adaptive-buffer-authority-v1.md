# Adaptive buffer and playback UX v1 authority

## Status

Accepted and frozen by M008 Milestone 1. The executable constants and
exact-bound arithmetic live in
`apps/desktop/src/tts/adaptive-buffer-authority.ts`. Milestone 2 implements
the deterministic scheduler, Milestone 3 implements its payload-owning FIFO
and low-level PCM player, and Milestone 5 connects them through the
exact-development product coordinator. Later work must preserve this authority
without silently changing its values or meanings.

This document freezes model-independent scheduling and UX behavior for
ADR-0015's exact one-GPU Qwen/Serena constrained development demo. It does not
claim that the implemented scheduler, multi-unit buffer, and player are wired
to a product narration caller or UI. It does not select a standard production
TTS profile, promise uninterrupted playback, or approve general hardware
support.

## Audio and duration authority

The retained playback format is the M007 protocol-v1 output format:

| Property         | Frozen value                |
| ---------------- | --------------------------- |
| Sample rate      | 24,000 Hz                   |
| Channels         | 1                           |
| Sample format    | finite IEEE-754 float32     |
| Byte order       | little-endian               |
| Bytes per sample | 4                           |
| Publication unit | one complete validated unit |

Sample frames are the duration authority. The scheduler sums sample frames
before converting to display milliseconds:

```text
playableMilliseconds = floor(totalSampleFrames * 1000 / 24000)
```

It must not sum rounded per-unit durations. Dispatch, elapsed wall time,
transport metadata, an intentional wait, or an incomplete response contributes
zero playable duration.

## Playback API implementation

M008 Milestone 3 selects the browser/WebView Web Audio API for the low-level
MVP PCM device boundary. One dedicated `AudioContext` decodes the current
unit's little-endian finite float32 samples into one mono 24-kHz
`AudioBuffer`, connects it through one `GainNode`, and plays it with one
`AudioBufferSourceNode` at the frozen `1.0x` rate.

The bounded FIFO keeps the original `TtsAudioUnit` as its sole releasable
owner. Web Audio necessarily receives one transient device buffer for only the
active unit; it is not another queue, is never persisted or exposed to React,
and is bounded by the existing 20-second/480,000-frame/1,920,000-byte service
unit maximum. Completion or invalidation makes that device copy unreachable,
while the FIFO calls the original unit's `release()` exactly once. This adds no
package dependency or new codec.

## Startup, warning, refill, and maximum thresholds

| Boundary                            |                     Exact value |
| ----------------------------------- | ------------------------------: |
| Quick-start target                  |                       15,000 ms |
| Low-water warning                   |                       10,000 ms |
| Automatic refill/resume target      |                       60,000 ms |
| Prepared-playback choices           | 1, 2, 5, or 10 playable minutes |
| Simultaneous playable-audio ceiling |             30 playable minutes |

The corresponding exact 24-kHz sample-frame values are:

| Boundary   | Sample frames |
| ---------- | ------------: |
| 10 seconds |       240,000 |
| 15 seconds |       360,000 |
| 1 minute   |     1,440,000 |
| 2 minutes  |     2,880,000 |
| 5 minutes  |     7,200,000 |
| 10 minutes |    14,400,000 |
| 30 minutes |    43,200,000 |

Every target is inclusive. Playback starts or resumes immediately when the
active target is met; there is no additional timer. A one-sample-short value
does not meet the target.

When the caller has reached a complete end of the requested reading range and
all remaining valid audio is shorter than the active target, that exact
complete remaining duration becomes the effective target. Its low-water mark
is the lesser of 10 seconds and the effective target. A partial prepared batch,
an estimate, or temporary lack of queued text does not prove a shorter complete
range.

### Quick start

Quick start uses a 15-second target. It begins as soon as at least 360,000
contiguous valid sample frames are owned by the active generation, or the
complete shorter remaining range is ready.

### Prepared playback

Prepared playback is an explicit user choice. Its target is exactly 60,000,
120,000, 300,000, or 600,000 playable milliseconds. The target is not a
guaranteed wall-clock preparation time or uninterrupted listening duration.

### Low water and exhaustion

While playing and more narration is expected, crossing from above the
10-second low-water mark to at or below it shows one low-buffer warning.
Playback continues while valid audio remains.

Reaching zero during expected narration:

1. stops audio consumption immediately;
2. increments the involuntary-underrun count once;
3. enters `buffering`;
4. reports the wait truthfully; and
5. resumes immediately at one playable minute, or at the complete shorter
   remaining range.

No silence is inserted and no stale unit is played to disguise exhaustion.

### Playback-only pause

A voluntary playback pause retains the active session and generation. Audio
consumption stops, but one valid synthesis may continue:

- quick-start mode prepares up to the one-minute refill target;
- prepared mode prepares up to its selected 1-, 2-, 5-, or 10-minute target;
- a complete shorter remaining range stops preparation earlier; and
- every simultaneous resource limit still stops dispatch.

Resume does not require rebuilding the startup target when valid lead already
exists. Playback-only pause is distinct from explicit stop and invalidation.

## Simultaneous resource limits

All limits are inclusive and apply at the same time:

| Resource                                       |     Maximum |
| ---------------------------------------------- | ----------: |
| Retained or reserved playable sample frames    |  43,200,000 |
| Retained or reserved logical PCM payload bytes | 172,800,000 |
| Retained or reserved complete audio units      |         256 |
| Retained or reserved audio metadata entries    |         256 |
| Retained prepared batches                      |           1 |
| Retained prepared narration segments           |          16 |
| Retained narration code points                 |       8,192 |
| Retained narration UTF-8 bytes                 |      24,576 |
| Retained narration sentences                   |          64 |
| Active `prepareNarration` operations           |           1 |
| Active service synthesis operations            |           1 |
| Service-owned queued synthesis operations      |           0 |

At 24-kHz mono float32, 43,200,000 frames equal 172,800,000 bytes and exactly
30 playable minutes. The 256-unit ceiling supports 225 eight-second units plus
31 units of count margin. Shorter valid units may hit the count or metadata
limit before 30 minutes; the duration ceiling is capacity, not a promise that
every input can fill it.

The logical payload-byte limit covers unique accepted or reserved audio. M007's
separately frozen native/renderer one-unit handoff remains limited to one
1,920,000-byte unit and may have a bounded transient transport copy. Model
working memory is measured separately and is not reclassified as playback
buffer capacity.

Before dispatch, the scheduler reserves one maximum M007 service result:

- 480,000 sample frames;
- 1,920,000 logical payload bytes;
- one complete unit; and
- one metadata entry.

Dispatch is allowed only when adding the complete reservation remains within
all four audio limits and every work/text limit. On completion, the reservation
is atomically replaced by the smaller or equal validated result. On failure,
cancellation, timeout, or stale completion, it is released. The scheduler
never dispatches speculatively on an assumed average unit size.

An exact maximum is accepted. Maximum plus one is rejected before dispatch,
retention, or publication. Duration capacity never overrides byte, unit,
metadata, text, or active-work capacity.

## Queue, caller, and ownership

The desktop owns exactly one FIFO pending-work queue. The Python service and
native supervisor continue to own no synthesis queue.

The active-publication caller:

1. calls `OpenedPublication.prepareNarration` from the canonical active locator
   with profile `narration-v1`, the selected supported language, and at most 16
   segments;
2. retains at most one returned batch and its canonical continuation;
3. attaches one active session, generation, monotonic sequence, and fresh
   segment identity without changing prepared text or source ranges;
4. dispatches at most one segment when the service is ready and a full output
   reservation fits;
5. waits for that identity to settle before dispatching the next segment;
6. drops references to the settled segment's sensitive text immediately; and
7. requests the continuation only after the retained batch is exhausted.

The 16-segment, 8,192-code-point, 24,576-byte, and 64-sentence limits include
the active synthesis text plus every pending segment. JavaScript strings cannot
be securely zeroed, so prompt cleanup means releasing all application
references at settlement and never copying text into metrics, errors,
snapshots, or UI state.

A completed service unit first occupies the existing one-unit
`TtsProcessClient` sink. `takeAudioUnit()` transfers sole ownership into the
M008 buffer; the client must be empty before another synthesis dispatch.
The buffer neither copies the payload nor serializes it into React state.
Exactly one owner calls `release()` after playback, stale rejection,
invalidation, capacity rejection, or discard.

Playback order is the active generation's monotonic narration sequence.
Out-of-order, duplicate, incomplete, wrong-format, unknown, or stale units are
released and contribute zero playable duration.

## Lifecycle and service transition

| Action                                                                                         | Identity and queue behavior                                                                                              | Service behavior                                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Playback pause                                                                                 | Keep the active identity; stop consumption; continue bounded generation to the mode's pause target.                      | Keep the ready service unless another limit or failure applies.                                                           |
| Playback resume                                                                                | Keep the active identity and current valid lead.                                                                         | Dispatch only under normal one-active reservation rules.                                                                  |
| Volume change                                                                                  | Keep identity, queue, and timing.                                                                                        | No service action.                                                                                                        |
| Explicit stop                                                                                  | Make the generation stale immediately; stop playback; reject new dispatch; release queued audio and prompt references.   | If synthesis is active, call identity-scoped `cancel`; otherwise call `shutdown`.                                         |
| Seek, chapter/position change, voice/model/settings change, book close, or session replacement | Replace or clear identity before asynchronous cleanup; all old pending and buffered work becomes ineligible immediately. | Cancel the matching active synthesis, otherwise shut down. Later work must explicitly start and prepare a fresh instance. |
| Application exit                                                                               | Invalidate all work, stop playback, release all owned payloads and text, and admit no restart.                           | Cancel active synthesis or shut down, then rely on native bounded exit cleanup.                                           |
| Crash, timeout, or protocol failure                                                            | Reject the complete unit, release its reservation, mark the identity failed/stale, and show a fixed content-free error.  | No automatic synthesis retry or automatic restart.                                                                        |

The eligibility change is synchronous even when zeroing and releasing a large
stale buffer takes multiple bounded cleanup turns. No old unit may play after
invalidation begins.

## Volume and playback speed

M008 v1 supports volume as integer percent gain:

- minimum `0`;
- maximum `100`;
- default `100`; and
- UI step `5`.

Zero volume mutes gain but does not pause consumption, generation, progress, or
underrun accounting.

The only supported playback rate is `1.0x`. M008 v1 exposes no enabled speed
control and does not reinterpret the 24-kHz sample rate. A persisted positive
playback-rate preference outside `1.0` remains valid shared-contract data but
is unsupported by this capability and must not silently alter playback. A
later pitch-preserving range requires separate authority, implementation, and
timing/buffer validation.

## Optional adaptive boundary waits

Boundary waits are disabled by default (`0` ms). The only admitted nonzero
values are 1,000, 2,000, or 3,000 ms.

A later scheduler may use at most one wait at an eligible paragraph or chapter
boundary only when:

- playback is active;
- valid lead is positive and at or below low water;
- more valid audio is expected; and
- no other boundary wait is active.

The wait is interruptible by pause, stop, invalidation, or exit. It contributes
zero playable frames, is reported separately from buffering, and cannot delay
the transition to `buffering` after valid lead reaches zero. The M008 Milestone
5 exact-host matrix used zero intentional wait and did not justify enabling a
nonzero default; Milestone 6 owns any final policy change.

## Buffer-status and UX language

`BufferStatusV1` carries the active phase's effective low, target, and maximum
values:

- quick preparation: target 15 seconds;
- prepared mode: target 1, 2, 5, or 10 minutes;
- refill: target 1 minute; and
- complete shorter range: target that exact positive duration.

`empty` is the stopped/no-request zero-depth state. `buffering` means more
audio is expected but the active target is not ready. `ready` means the active
target is ready but consumption has not started. `playing` requires positive
lead. `paused` means the user voluntarily paused; bounded preparation may still
continue. End of range is a controller outcome, not a new v1 buffer-status
enum.

The UI uses these truthful meanings:

| State                                    | Required message meaning                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Estimate unavailable                     | “Calculating preparation time…”                                                                               |
| Preparing                                | “Preparing audio — {ready} of {target} ready. Estimated wait: {estimate}.”                                    |
| Playback-only pause with work continuing | “Playback paused. Preparing up to {target} of audio.” and an available “Stop preparing” action.               |
| Low water                                | “Audio is running low. Playback may pause while local speech catches up.”                                     |
| Intentional boundary wait                | “Brief planned pause while local speech catches up.”                                                          |
| Involuntary buffering                    | “Playback paused while VoxLeaf generates more audio — {ready} of 1 minute ready. Estimated wait: {estimate}.” |
| Resource ceiling                         | “Preparation paused at the in-memory limit.”                                                                  |
| Complete shorter range                   | “All remaining audio is ready.”                                                                               |

Ready/target progress is derived only from accepted contiguous sample frames
and is clamped to the effective target. Wall-clock elapsed preparation,
intentional wait duration, involuntary buffering duration, model
load/restart time, and generated media duration remain separate values.

An estimate is explicitly labeled as estimated, uses only content-free
completed timing observations, includes known start/load/prepare cost when the
service is stopped, and may become unavailable after a failure or identity
replacement. It must never be presented as a deadline or uninterrupted-audio
guarantee.

## Privacy and measurement

Audio payloads, prepared text, model output, and EPUB contents remain local and
memory-only. They do not enter React state, persistence, logs, metrics,
snapshots, errors, or benchmark summaries.

Content-free measurements distinguish:

- accepted playable sample frames and displayed lead;
- wall-clock model load, preparation, and generation;
- intentional boundary-wait count and duration;
- involuntary underrun count and buffering duration;
- retained/reserved unit, metadata, byte, and text counters;
- explicit stop and invalidation settlement;
- worker termination and later restart/readiness; and
- audio release and stale-output rejection.

No metric may use a prepared text preview, book title, path, locator prose,
audio bytes, model path, process command line, or private host value.

## Deterministic Milestone 1 evidence

The model-free authority tests prove:

- exact quick/low/refill/prepared/maximum sample-frame arithmetic;
- one sample before and exactly at quick start;
- complete-shorter-range threshold reduction;
- exact and maximum-plus-one results for every simultaneous count/byte/work
  limit;
- fixed 1.0x playback speed, volume bounds, and boundary-wait choices; and
- rejection of negative, fractional, non-finite, or unsafe counters.

These tests freeze inputs for later scheduler traces. They do not generate,
retain, or play audio and make no runtime-performance claim.

## Deterministic Milestone 3 evidence

Model-free desktop tests now prove:

- sole transfer from a `takeAudioUnit()` source into the multi-unit FIFO;
- finite 24-kHz mono float32 little-endian validation and monotonic playback
  order;
- exact playable-frame consumption while whole-unit frame/byte ownership
  remains retained until completion;
- release exactly once after playback and immediate ineligibility followed by
  four-unit-at-most cleanup turns after stop, seek, close, or failure;
- pause/resume timing, zero-volume consumption, bounded volume, `1.0x`-only
  rate admission, end-of-range completion, and one count per actual underrun;
  and
- Web Audio decoding into one active bounded device buffer through a gain
  node.

The tests use a manual clock and fake device context. They open no audio
device, load no model, write no generated audio, and make no audible-quality or
hardware-performance claim.

# ADR-0015: Use one GPU worker with bounded adaptive demo buffering

## Status

Accepted.

## Context

ADR-0014 permits the exact Qwen3-TTS 12Hz 1.7B CustomVoice/Serena identity
only for a constrained development demo. Its original boundary assumed one
queued unit, approximately 15 playable seconds before startup, and complete
generation invalidation on pause.

Milestone 6.2 tested attempts to improve sustained output:

- CPU solo completed at aggregate RTF `2.999443394476504`;
- GPU solo completed at aggregate RTF `1.467080448861599`;
- the official concurrent GPU/CPU arm stopped at `resource-limit`; and
- a later non-promotable concurrent diagnostic completed under a low
  application-memory baseline at aggregate RTF `1.4291263397435898`, while
  slowing the GPU worker to RTF `2.3290592090374167`.

Two resident models therefore add memory, thermal, and application-contention
risk for only a small aggregate improvement and still fall behind playback.
The content-safe [`selection-v5`](../../../benchmarks/tts/selection-v5.md)
selects no dual-worker topology.

One GPU worker cannot synthesize indefinitely in real time on the reference
host, but bounded preparation can provide useful listening intervals. At the
measured GPU-solo RTF, ten minutes of playable audio require approximately
14.7 minutes to prepare and provide approximately 31 minutes of playback while
generation continues. These calculations are planning inputs, not startup or
continuous-playback guarantees.

## Decision

Retain exactly one GPU Qwen/Serena worker for the constrained development demo.
Do not integrate the CPU-only or concurrent topology.

The later demo may implement two explicit playback modes:

1. **Quick start:** preserve ADR-0004. Start as soon as approximately 15
   contiguous playable seconds, or a complete shorter remaining range, is
   ready. Add no fixed timer after the threshold.
2. **Prepared playback:** let the user explicitly request a larger playable
   lead. Candidate targets of 1, 2, 5, and 10 minutes must show estimated
   preparation time and measured progress. No target is a default until
   deterministic and exact-host validation accepts it.

The runtime must:

- retain generated audio only in bounded memory and never persist it by
  default;
- enforce a simultaneous ceiling of at most 30 playable minutes plus exact
  byte, frame/unit-count, active-work, and metadata limits frozen before
  implementation;
- continue valid generation during a playback-only pause until the selected
  target or 30-minute ceiling is reached;
- expose an explicit way to stop preparation, and keep active work
  cancellable even when playback is paused;
- immediately invalidate and cancel stale work after seek, chapter or reading
  position change, voice/model/settings change, book close, session
  replacement, explicit stop, or application exit;
- show preparing, playable lead, low-buffer warning, involuntary buffering,
  and estimated resume state honestly;
- enter buffering rather than freeze when playable audio is exhausted;
- evaluate a bounded extra wait of 1-3 seconds only at paragraph or chapter
  boundaries when lead is low, report that intentional wait separately, and
  never count it as generated audio or hide it from interruption metrics; and
- discard played, invalidated, or over-cap audio promptly.

Milestone 8 must determine the default refill/resume target. Ten minutes may be
an explicit user-selected preparation target, but it is not a mandatory
startup or rebuffer threshold.

M008 Milestone 1 resolves the remaining exact policy in
[`adaptive-buffer-authority-v1.md`](../adaptive-buffer-authority-v1.md):
10-second low water, 15-second quick start, one-minute refill/resume, explicit
1/2/5/10-minute prepared targets, exact simultaneous frame/byte/unit/text/work
limits, one pending desktop queue, 0-100% volume, and `1.0x`-only MVP playback.
This authority froze the implementation inputs. M008 Milestones 2-5 now
implement the scheduler, player, exact-development caller, and UI without
changing those values.

The Milestone 5 packaged exact-host matrix measured quick command-to-audible
at 39.238 seconds with 15.280 seconds of playable lead, one underrun, and 20.91
buffering seconds per playback minute. Cancellation completed in 160 ms; the
one-minute prepared arm reached 66.480 playable seconds; peak dedicated GPU
memory was 4,882 MiB; and external requests were zero. This evidence confirms
the constrained demo is audible but not real time. It does not promote the
profile or justify a nonzero boundary-wait default.

M008 Milestone 6 closes the demo policy from that evidence:

- quick start is the default mode and begins only after 15 playable seconds, or
  a complete shorter remaining range, with no fixed wall-clock timer;
- prepared playback remains an explicit opt-in, exposes 1-, 2-, 5-, and
  10-minute choices, and initially selects 1 minute;
- the refill/resume target remains 1 minute;
- the low-water warning remains 10 playable seconds;
- optional semantic-boundary waits remain disabled by default at `0` ms;
- playback remains `1.0x` only, with 100% default volume;
- the simultaneous 30-minute frame/byte/unit ceiling remains a maximum, never a
  startup target or uninterrupted-playback promise; and
- the exact Qwen/Serena path remains available only behind explicit native
  development configuration.

The final closeout rerun measured 19.49 buffering seconds per playback minute,
which exceeds the MVP target of at most 5 seconds. Prepared playback may
exchange a longer explicit wait for more listening time, and playback-only
pause may build lead, but neither changes the model's real-time factor. The
standard-profile blocker therefore remains.
No automatic retry, persistent audio cache, second model worker, CPU fallback,
nonzero hidden wait, general-hardware claim, or production distribution is
accepted by this closeout.

This remains a development-demo exception. ADR-0013 continues to block a
standard production-profile claim. ADR-0002's memory-only rule and ADR-0004's
quick-start rule remain accepted.

This ADR supersedes ADR-0014's one-queued-unit limit and its requirement that a
playback-only pause always invalidate generation. It preserves ADR-0014's
exact model identity, offline artifacts, complete-unit publication,
stale-identity rejection, privacy limits, and non-production status.

## Consequences

- The demo can trade explicit preparation time for longer listening intervals
  without pretending that Qwen is real-time.
- A playback-only pause may build useful lead, but consumes power and keeps
  sensitive generated audio in memory for longer.
- The 30-minute ceiling is a maximum capacity, not a promise to fill it or a
  guaranteed uninterrupted duration.
- Quick start remains responsive in policy, while prepared mode makes a longer
  wait an explicit user choice.
- The scheduler, player, UI, and tests must distinguish generated audio,
  intentional boundary waits, involuntary buffering, and elapsed preparation
  time.
- Any invalidating action can discard substantially more speculative audio, so
  identity-first cancellation and exact memory limits become more important.
- No CPU fallback, dual-worker topology, persistent cache, production
  dependency, installer policy, or general hardware support is accepted.

## Alternatives considered

### Use the GPU and CPU models concurrently

Rejected. The official arm stopped safely, and the successful low-load
diagnostic remained slower than real time while substantially slowing the GPU.

### Require ten prepared minutes before every playback or resume

Rejected. It would require approximately 14.7 minutes on the reference host.
Ten minutes remains an explicit prepared-mode option, not a default.

### Stop all generation whenever playback is paused

Rejected for the bounded demo because a voluntary pause is useful preparation
time. Explicit stop and every invalidating action still cancel generation.

### Persist prepared audio

Rejected. It conflicts with the accepted privacy-first in-memory boundary.

### Claim adaptive pauses make the model real-time

Rejected. Intentional waits can slow buffer depletion but do not improve model
RTF and must remain visible in metrics and UI.

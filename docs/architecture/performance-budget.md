# Performance budget

## User-visible targets

The initial MVP budget is intentionally practical rather than real-time at all moments.

| Metric | MVP target |
|---|---:|
| Initial playable audio lead | Approximately 15 seconds before playback starts |
| Artificial wait after initial lead is ready | 0 seconds |
| Permitted buffering during sustained reading | Up to 5 seconds per minute |
| Cancellation acknowledgment | Target below 500 ms |
| Stale audio after seek or chapter change | 0 seconds played |
| Generated audio persistence | None by default |

Hardware requirements must be documented alongside benchmark results.

## Measurements

### Startup latency

Measure wall-clock time from the accepted play command until the first audio frame is audible. Record model loading, warm-up, and initial generation separately. Fifteen seconds refers to the duration of playable audio accumulated before playback, not an allowed or required wall-clock delay.

Playback should start immediately when the initial lead threshold is satisfied. Benchmarks must report both wall-clock startup latency and playable buffer depth at that moment so a fast model is not made to wait unnecessarily.

### Real-time factor

```text
RTF = generation time / generated audio duration
```

Report warm and cold values. Sustained reading should ideally remain below 1.0.

### Buffer depth

Track seconds of playable audio available, not only the number of chunks.

### Underruns

Count each transition from playing to involuntary buffering and record its duration without recording book text.

### Cancellation latency

Measure from cancellation request until the generator stops producing frames for the cancelled session.

### Memory

Track model memory separately from text queues and audio buffers.

## Initial buffering policy

A starting implementation may use:

- Initial playable buffer: approximately 15 seconds.
- Low-water mark: approximately 8 seconds.
- Target buffer: approximately 30 seconds.
- Maximum buffer: approximately 60 seconds.

These are hypotheses. Benchmarks should determine final values.

The initial threshold may eventually adapt to measured inference speed, but the MVP must not implement a fixed 15-second timer or confuse generated audio duration with elapsed generation time.

## Benchmark reporting

Store summarized, reproducible benchmark reports in Git. Do not commit:

- Proprietary book text.
- Raw generated audio.
- Model weights.
- Machine-specific traces containing private paths.
- Very large raw profiling artifacts.

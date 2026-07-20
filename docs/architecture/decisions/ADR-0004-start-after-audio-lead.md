# ADR-0004: Start playback after building a playable audio lead

## Status

Accepted

## Context

VoxLeaf needs enough generated audio in memory to tolerate variable local inference speed, but a statement that playback may "wait 15 seconds" confuses wall-clock startup latency with buffered media duration. A fast model should not sit idle until a timer expires.

The desired behavior is to begin with approximately 15 seconds of narration ready to play, regardless of how little or how much wall-clock time was required to synthesize it.

## Decision

Gate initial playback on contiguous playable audio duration, not elapsed time.

- Target approximately 15 seconds of valid, in-memory playable audio for the active reading session.
- Start playback immediately when the target is reached.
- Do not add a fixed 15-second timer or delay after the audio is ready.
- If the remaining valid narration before the end of the available reading range is shorter than the target, start when that complete shorter range is ready rather than waiting indefinitely.
- Count only audio belonging to the active session and generation.
- Clear or recalculate the gate after a seek, chapter change, voice change, model change, book close, or session replacement.

Wall-clock time to first audible frame and playable audio depth at startup are separate measurements. Buffer thresholds remain bounded and may be tuned by reproducible benchmarks without changing the distinction between time elapsed and media duration.

## Consequences

- Faster inference produces faster startup while preserving an initial underrun reserve.
- Slow hardware may still take noticeable wall-clock time to generate the lead; the UI must show generation and buffer progress honestly.
- The buffer must measure playable seconds from audio format and frame counts rather than chunk count.
- Tests need deterministic fake audio durations and must verify that no fixed timer controls startup.
- Cancellation and stale-session filtering apply before audio contributes to the startup threshold.

## Alternatives considered

- Always wait 15 wall-clock seconds: rejected because it delays fast hardware without improving the buffer.
- Start on the first audio frame: lowest latency but too vulnerable to immediate underruns.
- Synthesize a complete chapter: rejected because it creates excessive latency and memory use.
- Use a fixed number of chunks: rejected because chunks can contain very different audio durations.

interface PlaybackEpisodeCounters {
  readonly bufferingMs: number;
  readonly intentionalTransitionPauseMs: number;
  readonly renderedSampleFrames: number;
  readonly underrunCount: number;
}

const ZERO_COUNTERS: PlaybackEpisodeCounters = Object.freeze({
  bufferingMs: 0,
  intentionalTransitionPauseMs: 0,
  renderedSampleFrames: 0,
  underrunCount: 0,
});

/** Accumulates player counters across runs in one recovery episode. */
export class PlaybackEpisodeMetrics {
  #totals = ZERO_COUNTERS;
  #lastObserved = ZERO_COUNTERS;

  public clearTotals(): void {
    this.#totals = ZERO_COUNTERS;
  }

  public rebase(observation: PlaybackEpisodeCounters = ZERO_COUNTERS): void {
    const {
      bufferingMs,
      intentionalTransitionPauseMs,
      renderedSampleFrames,
      underrunCount,
    } = observation;
    this.#lastObserved = {
      bufferingMs,
      intentionalTransitionPauseMs,
      renderedSampleFrames,
      underrunCount,
    };
  }

  public record(observation: PlaybackEpisodeCounters): void {
    this.#totals = this.#project(observation);
    this.rebase(observation);
  }

  public preview(
    observation: PlaybackEpisodeCounters | undefined,
    sampleRateHz: number,
  ) {
    const totals = this.#project(observation ?? this.#lastObserved);
    return {
      bufferingMs: totals.bufferingMs,
      intentionalWaitMs: totals.intentionalTransitionPauseMs,
      playbackMs: (totals.renderedSampleFrames * 1_000) / sampleRateHz,
      underrunCount: totals.underrunCount,
    };
  }

  #project(observation: PlaybackEpisodeCounters): PlaybackEpisodeCounters {
    const last = this.#lastObserved;
    return {
      bufferingMs:
        this.#totals.bufferingMs +
        Math.max(0, observation.bufferingMs - last.bufferingMs),
      intentionalTransitionPauseMs:
        this.#totals.intentionalTransitionPauseMs +
        Math.max(
          0,
          observation.intentionalTransitionPauseMs -
            last.intentionalTransitionPauseMs,
        ),
      renderedSampleFrames:
        this.#totals.renderedSampleFrames +
        Math.max(
          0,
          observation.renderedSampleFrames - last.renderedSampleFrames,
        ),
      underrunCount:
        this.#totals.underrunCount +
        Math.max(0, observation.underrunCount - last.underrunCount),
    };
  }
}

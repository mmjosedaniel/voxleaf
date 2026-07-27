import { decodeLocatorRangeV1, decodeReadingLocatorV1 } from "@voxleaf/shared";
import {
  createManualClock,
  VALID_SYNTHETIC_DOCUMENT_FIXTURE,
  type ManualClock,
} from "@voxleaf/shared/testing";
import { describe, expect, it } from "vitest";

import { sampleFramesFromPlayableMilliseconds } from "./adaptive-buffer-authority";
import {
  AdaptiveBufferScheduler,
  type AdaptiveBufferAudioUnit,
  type AdaptiveBufferPreparedSegment,
} from "./adaptive-buffer-scheduler";
import {
  AdaptivePcmPlayer,
  PcmPlaybackError,
  WebAudioPcmPlaybackBackend,
  type AdaptivePcmAudibleProgressObservation,
  type PcmPlaybackBackend,
  type PcmPlaybackCallbacks,
  type PcmPlaybackHandle,
  type PcmPlaybackRequest,
} from "./pcm-playback";

const IDENTITY = Object.freeze({
  sessionId: "session:synthetic-playback-1",
  generationId: "generation:synthetic-playback-1",
});
const SOURCE_START = decodeReadingLocatorV1(
  VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
);

interface OwnedUnit extends AdaptiveBufferAudioUnit {
  readonly releaseCount: number;
}

interface FakeHandle extends PcmPlaybackHandle {
  pump(): void;
}

class ManualPcmPlaybackBackend implements PcmPlaybackBackend {
  readonly startedSequences: number[] = [];
  readonly observedVolumes: number[] = [];
  closeCount = 0;
  active: FakeHandle | undefined;
  lastCallbacks: PcmPlaybackCallbacks | undefined;

  public constructor(private readonly clock: ManualClock) {}

  public start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    if (this.active !== undefined) {
      throw new Error("already active");
    }
    const durationFrames =
      request.sampleCountSamples - request.startSampleFrame;
    let elapsedBeforeResumeMs = 0;
    let resumedAtMs = this.clock.nowMs;
    let paused = false;
    let stopped = false;
    let ended = false;
    let volumePercent = request.volumePercent;
    const elapsedMs = () =>
      elapsedBeforeResumeMs +
      (paused || stopped ? 0 : this.clock.nowMs - resumedAtMs);
    const handle: FakeHandle = {
      sequence: request.sequence,
      get playedSampleFrames() {
        return Math.min(
          durationFrames,
          Math.floor((elapsedMs() * request.sampleRateHz) / 1_000),
        );
      },
      pause: () => {
        if (!paused && !stopped) {
          elapsedBeforeResumeMs = elapsedMs();
          paused = true;
        }
      },
      resume: () => {
        if (paused && !stopped) {
          paused = false;
          resumedAtMs = this.clock.nowMs;
        }
      },
      stop: () => {
        stopped = true;
        this.active = undefined;
      },
      setVolumePercent: (value) => {
        volumePercent = value;
        this.observedVolumes.push(value);
      },
      pump: () => {
        if (
          !stopped &&
          !ended &&
          handle.playedSampleFrames === durationFrames
        ) {
          ended = true;
          this.active = undefined;
          callbacks.ended();
        }
      },
    };
    this.startedSequences.push(request.sequence);
    this.observedVolumes.push(volumePercent);
    this.lastCallbacks = callbacks;
    this.active = handle;
    return handle;
  }

  public pump(): void {
    this.active?.pump();
  }

  public fail(): void {
    this.active = undefined;
    this.lastCallbacks?.failed();
  }

  public close(): void {
    this.active?.stop();
    this.active = undefined;
    this.closeCount += 1;
  }
}

class FakeAudioBuffer {
  readonly channel: Float32Array;

  public constructor(
    readonly numberOfChannels: number,
    readonly length: number,
    readonly sampleRate: number,
  ) {
    this.channel = new Float32Array(length);
  }

  public getChannelData(channel: number): Float32Array {
    if (channel !== 0) {
      throw new Error("unexpected channel");
    }
    return this.channel;
  }
}

class FakeAudioBufferSource {
  buffer: AudioBuffer | null = null;
  readonly playbackRate = { value: 0 };
  onended: (() => void) | null = null;
  connected = false;
  started = false;
  stopped = false;

  public connect(): void {
    this.connected = true;
  }

  public start(): void {
    this.started = true;
  }

  public stop(): void {
    this.stopped = true;
  }

  public end(): void {
    this.onended?.();
  }
}

class FakeAudioContext {
  currentTime = 0;
  readonly destination = {};
  readonly gain = {
    gain: { value: 1 },
    connected: false,
    connect: () => {
      this.gain.connected = true;
    },
  };
  readonly buffers: FakeAudioBuffer[] = [];
  readonly sources: FakeAudioBufferSource[] = [];
  suspendCount = 0;
  resumeCount = 0;
  closeCount = 0;

  public createGain(): GainNode {
    return this.gain as unknown as GainNode;
  }

  public createBuffer(
    channels: number,
    length: number,
    sampleRate: number,
  ): AudioBuffer {
    const buffer = new FakeAudioBuffer(channels, length, sampleRate);
    this.buffers.push(buffer);
    return buffer as unknown as AudioBuffer;
  }

  public createBufferSource(): AudioBufferSourceNode {
    const source = new FakeAudioBufferSource();
    this.sources.push(source);
    return source as unknown as AudioBufferSourceNode;
  }

  public suspend(): Promise<void> {
    this.suspendCount += 1;
    return Promise.resolve();
  }

  public resume(): Promise<void> {
    this.resumeCount += 1;
    return Promise.resolve();
  }

  public close(): Promise<void> {
    this.closeCount += 1;
    return Promise.resolve();
  }
}

function segment(index: number): AdaptiveBufferPreparedSegment {
  return Object.freeze({
    segmentId: `segment:synthetic-playback-${index}`,
    sequence: index - 1,
    sourceRange: decodeLocatorRangeV1({
      schemaVersion: 1,
      start: {
        ...SOURCE_START,
        textOffsetCodePoints: SOURCE_START.textOffsetCodePoints + index,
      },
      end: {
        ...SOURCE_START,
        textOffsetCodePoints: SOURCE_START.textOffsetCodePoints + index + 1,
      },
    }),
    narrationCodePoints: 20,
    narrationUtf8Bytes: 20,
    sentenceCount: 1,
  });
}

function ownedUnit(
  segmentId: string,
  playableMs: number,
  identity = IDENTITY,
): OwnedUnit {
  const sampleCountSamples = sampleFramesFromPlayableMilliseconds(playableMs);
  let releaseCount = 0;
  let retained = new Uint8Array(sampleCountSamples * 4);
  return {
    metadata: Object.freeze({
      ...identity,
      segmentId,
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples,
      payloadBytes: retained.byteLength,
      endOfSegment: true,
    }),
    get payload() {
      return retained;
    },
    get releaseCount() {
      return releaseCount;
    },
    release() {
      releaseCount += 1;
      retained.fill(0);
      retained = new Uint8Array();
    },
  };
}

function readyScheduler(
  clock: ManualClock,
  segments: readonly AdaptiveBufferPreparedSegment[],
  complete: boolean,
): AdaptiveBufferScheduler {
  const scheduler = new AdaptiveBufferScheduler(clock, IDENTITY, {
    kind: "quick",
  });
  scheduler.beginServiceStart();
  scheduler.markServiceStarted();
  scheduler.beginServicePrepare();
  scheduler.markServiceReady();
  scheduler.beginNarrationPreparation();
  scheduler.acceptPreparedBatch({ segments, complete });
  return scheduler;
}

function synthesize(
  scheduler: AdaptiveBufferScheduler,
  segment: AdaptiveBufferPreparedSegment,
  playableMs: number,
): OwnedUnit {
  expect(scheduler.beginSynthesis()).toBe(segment.segmentId);
  const unit = ownedUnit(segment.segmentId, playableMs);
  let retained: OwnedUnit | undefined = unit;
  const source = {
    takeAudioUnit: () => {
      const taken = retained;
      retained = undefined;
      return taken;
    },
  };
  expect(scheduler.takeCompletedUnitFrom(source)).toBe("accepted");
  expect(source.takeAudioUnit()).toBeUndefined();
  return unit;
}

function runCleanupTurns(turns: Array<() => void>): void {
  while (turns.length > 0) {
    turns.shift()?.();
  }
}

describe("adaptive PCM playback", () => {
  it("publishes exact FIFO transitions and progress no more often than every 250 ms", () => {
    const clock = createManualClock(0);
    const segments = [segment(1), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const player = new AdaptivePcmPlayer(scheduler, backend);
    const events: AdaptivePcmAudibleProgressObservation[] = [];
    player.subscribeAudibleProgress((event) => events.push(event));

    player.synchronize();
    expect(events).toEqual([
      expect.objectContaining({
        kind: "segment-started",
        sequence: 0,
        sourceRange: segments[0]!.sourceRange,
        playedSampleFrames: 0,
      }),
    ]);

    clock.advanceBy(249);
    player.synchronize();
    expect(events).toHaveLength(1);
    clock.advanceBy(1);
    player.synchronize();
    expect(events.at(-1)).toMatchObject({
      kind: "progress",
      observedAtMs: 250,
      sequence: 0,
      playedSampleFrames: 6_000,
    });

    player.pause();
    const pausedEventCount = events.length;
    clock.advanceBy(1_000);
    player.synchronize();
    expect(events).toHaveLength(pausedEventCount);

    player.resume();
    clock.advanceBy(250);
    player.synchronize();
    expect(events.at(-1)).toMatchObject({
      kind: "progress",
      observedAtMs: 1_500,
      sequence: 0,
      playedSampleFrames: 12_000,
    });

    clock.advanceBy(7_500);
    backend.pump();
    expect(events.slice(-2)).toEqual([
      expect.objectContaining({
        kind: "segment-completed",
        sequence: 0,
        playedSampleFrames: 192_000,
      }),
      expect.objectContaining({
        kind: "segment-started",
        sequence: 1,
        sourceRange: segments[1]!.sourceRange,
        playedSampleFrames: 0,
      }),
    ]);
    expect(JSON.stringify(events)).not.toContain("payload");
    expect(JSON.stringify(events)).not.toContain("narration");
  });

  it("plays complete units in order and releases each original payload once", () => {
    const clock = createManualClock(0);
    const segments = [segment(1), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    const first = synthesize(scheduler, segments[0]!, 8_000);
    const second = synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const player = new AdaptivePcmPlayer(scheduler, backend);

    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: 0,
      playableDurationMs: 16_000,
    });
    clock.advanceBy(8_000);
    backend.pump();
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(0);
    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: 1,
      playableDurationMs: 8_000,
    });

    clock.advanceBy(8_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "complete",
      activeSequence: undefined,
      playableDurationMs: 0,
    });
    expect(backend.startedSequences).toEqual([0, 1]);
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(1);
  });

  it("pauses time, resumes the same unit, and consumes at zero volume", () => {
    const clock = createManualClock(0);
    const segments = [segment(1), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const player = new AdaptivePcmPlayer(scheduler, backend);

    player.synchronize();
    clock.advanceBy(2_000);
    expect(player.setVolumePercent(0).volumePercent).toBe(0);
    expect(player.pause()).toMatchObject({
      state: "paused",
      playableDurationMs: 14_000,
    });
    clock.advanceBy(5_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "paused",
      playableDurationMs: 14_000,
      activeSequence: 0,
    });

    player.resume();
    clock.advanceBy(6_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: 1,
      playableDurationMs: 8_000,
      volumePercent: 0,
    });
    expect(backend.observedVolumes).toEqual([100, 0, 0]);
  });

  it("counts a real underrun once and resumes after the refill target", () => {
    const clock = createManualClock(0);
    const segments = [
      segment(1),
      segment(2),
      segment(3),
      segment(4),
      segment(5),
    ];
    const scheduler = readyScheduler(clock, segments, false);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const player = new AdaptivePcmPlayer(scheduler, backend);
    const events: AdaptivePcmAudibleProgressObservation[] = [];
    player.subscribeAudibleProgress((event) => events.push(event));

    player.synchronize();
    clock.advanceBy(8_000);
    backend.pump();
    clock.advanceBy(8_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "buffering",
      underrunCount: 1,
      playableDurationMs: 0,
    });
    expect(events.at(-1)).toMatchObject({
      kind: "segment-completed",
      sequence: 1,
    });

    synthesize(scheduler, segments[2]!, 20_000);
    synthesize(scheduler, segments[3]!, 20_000);
    expect(player.synchronize()).toMatchObject({
      state: "buffering",
      underrunCount: 1,
      playableDurationMs: 40_000,
    });
    synthesize(scheduler, segments[4]!, 20_000);
    expect(player.synchronize()).toMatchObject({
      state: "playing",
      underrunCount: 1,
      playableDurationMs: 60_000,
      activeSequence: 2,
    });
    expect(events.at(-1)).toMatchObject({
      kind: "segment-started",
      sequence: 2,
    });
  });

  it("suppresses late transitions after failure while cleanup releases the unit", () => {
    const clock = createManualClock(0);
    const prepared = segment(1);
    const scheduler = readyScheduler(clock, [prepared], true);
    const unit = synthesize(scheduler, prepared, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const cleanupTurns: Array<() => void> = [];
    const player = new AdaptivePcmPlayer(scheduler, backend, (callback) => {
      cleanupTurns.push(callback);
    });
    const events: AdaptivePcmAudibleProgressObservation[] = [];
    player.subscribeAudibleProgress((event) => events.push(event));
    player.synchronize();
    const lateCallbacks = backend.lastCallbacks;

    backend.fail();

    expect(player.synchronize().state).toBe("failed");
    expect(events.map(({ kind }) => kind)).toEqual(["segment-started"]);
    lateCallbacks?.ended();
    lateCallbacks?.failed();
    expect(events.map(({ kind }) => kind)).toEqual(["segment-started"]);
    runCleanupTurns(cleanupTurns);
    expect(unit.releaseCount).toBe(1);
  });

  it.each(["stop", "seek", "close"] as const)(
    "%s invalidates before releasing payloads over bounded cleanup turns",
    (operation) => {
      const clock = createManualClock(0);
      const segments = [segment(1), segment(2)];
      const scheduler = readyScheduler(clock, segments, true);
      const first = synthesize(scheduler, segments[0]!, 8_000);
      const second = synthesize(scheduler, segments[1]!, 8_000);
      const backend = new ManualPcmPlaybackBackend(clock);
      const cleanupTurns: Array<() => void> = [];
      const player = new AdaptivePcmPlayer(scheduler, backend, (callback) => {
        cleanupTurns.push(callback);
      });
      const events: AdaptivePcmAudibleProgressObservation[] = [];
      player.subscribeAudibleProgress((event) => events.push(event));
      player.synchronize();
      const lateCallbacks = backend.lastCallbacks;

      if (operation === "stop") {
        expect(player.stop()).toBe("shutdown");
      } else if (operation === "seek") {
        expect(player.invalidateForSeek()).toBe("shutdown");
      } else {
        expect(player.close()).toBe("shutdown");
      }
      expect(player.synchronize()).toMatchObject({
        state: "stopped",
        playableDurationMs: 0,
        retainedAudioUnitCount: 2,
        discardedAudioUnitCount: 2,
      });
      expect(first.releaseCount).toBe(0);
      expect(second.releaseCount).toBe(0);
      lateCallbacks?.ended();
      lateCallbacks?.failed();
      expect(events.map(({ kind }) => kind)).toEqual(["segment-started"]);

      runCleanupTurns(cleanupTurns);
      expect(first.releaseCount).toBe(1);
      expect(second.releaseCount).toBe(1);
      expect(player.synchronize()).toMatchObject({
        retainedAudioUnitCount: 0,
        discardedAudioUnitCount: 0,
      });
      expect(backend.closeCount).toBe(operation === "close" ? 1 : 0);
    },
  );

  it("releases at most four invalidated originals per scheduled cleanup turn", () => {
    const clock = createManualClock(0);
    const segments = [
      segment(1),
      segment(2),
      segment(3),
      segment(4),
      segment(5),
    ];
    const scheduler = readyScheduler(clock, segments, false);
    const units = segments.map((item) => synthesize(scheduler, item, 4_000));
    const cleanupTurns: Array<() => void> = [];
    const player = new AdaptivePcmPlayer(
      scheduler,
      new ManualPcmPlaybackBackend(clock),
      (callback) => {
        cleanupTurns.push(callback);
      },
    );
    player.synchronize();

    player.stop();
    expect(cleanupTurns).toHaveLength(1);
    cleanupTurns.shift()?.();
    expect(units.map(({ releaseCount }) => releaseCount)).toEqual([
      1, 1, 1, 1, 0,
    ]);
    expect(cleanupTurns).toHaveLength(1);
    cleanupTurns.shift()?.();
    expect(units.map(({ releaseCount }) => releaseCount)).toEqual([
      1, 1, 1, 1, 1,
    ]);
    expect(player.synchronize()).toMatchObject({
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    });
  });

  it("admits bounded volume and only the frozen 1.0x playback rate", () => {
    const clock = createManualClock(0);
    const scheduler = readyScheduler(clock, [segment(1)], true);
    synthesize(scheduler, segment(1), 16_000);
    const player = new AdaptivePcmPlayer(
      scheduler,
      new ManualPcmPlaybackBackend(clock),
    );
    player.synchronize();

    expect(player.setVolumePercent(35).volumePercent).toBe(35);
    expect(player.setPlaybackRate(1).playbackRate).toBe(1);
    for (const invalid of [-1, 101, 2.5]) {
      expect(() => player.setVolumePercent(invalid)).toThrowError(
        PcmPlaybackError,
      );
    }
    expect(() => player.setPlaybackRate(1.25)).toThrowError(PcmPlaybackError);
  });
});

describe("Web Audio PCM backend", () => {
  it("decodes exact little-endian float32 PCM into one bounded device buffer", () => {
    const context = new FakeAudioContext();
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
    );
    const payload = new Uint8Array(12);
    const view = new DataView(payload.buffer);
    view.setFloat32(0, 0.25, true);
    view.setFloat32(4, -0.5, true);
    view.setFloat32(8, 0.75, true);
    let ended = 0;
    const handle = backend.start(
      {
        sequence: 7,
        payload,
        sampleRateHz: 24_000,
        channelCount: 1,
        sampleFormat: "float32-le",
        sampleCountSamples: 3,
        startSampleFrame: 1,
        volumePercent: 35,
        playbackRate: 1,
      },
      {
        ended: () => {
          ended += 1;
        },
        failed: () => {
          throw new Error("unexpected failure");
        },
      },
    );

    expect(context.buffers).toHaveLength(1);
    expect(context.buffers[0]).toMatchObject({
      numberOfChannels: 1,
      length: 2,
      sampleRate: 24_000,
    });
    expect([...context.buffers[0]!.channel]).toEqual([-0.5, 0.75]);
    expect(context.gain.gain.value).toBe(0.35);
    expect(context.sources[0]).toMatchObject({
      connected: true,
      started: true,
      playbackRate: { value: 1 },
    });

    context.currentTime = 1 / 48_000;
    expect(handle.playedSampleFrames).toBe(0);
    context.currentTime = 1 / 24_000;
    expect(handle.playedSampleFrames).toBe(1);
    handle.pause();
    handle.resume();
    handle.setVolumePercent(0);
    expect(context.suspendCount).toBe(1);
    expect(context.resumeCount).toBe(2);
    expect(context.gain.gain.value).toBe(0);

    context.sources[0]!.end();
    expect(ended).toBe(1);
    backend.close();
    expect(context.closeCount).toBe(1);
  });
});

import { decodeLocatorRangeV1, decodeReadingLocatorV1 } from "@voxleaf/shared";
import { MessageChannel, Worker } from "node:worker_threads";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  createManualClock,
  VALID_SYNTHETIC_DOCUMENT_FIXTURE,
  type ManualClock,
} from "@voxleaf/shared/testing";
import { describe, expect, it, vi } from "vitest";

import { sampleFramesFromPlayableMilliseconds } from "./adaptive-buffer-authority";
import {
  AdaptiveBufferScheduler,
  type AdaptiveBufferAudioUnit,
  type AdaptiveBufferPreparedSegment,
  type AdaptiveBufferStartMode,
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
  type TransitionPauseCanceller,
  type TransitionPauseScheduler,
} from "./pcm-playback";
import type { PlaybackTransitionPauseMs } from "./playback-transition-policy";
import { createIncrementalWsolaV3Node } from "./playback-backends/incremental-wsola-v3";

const IDENTITY = Object.freeze({
  sessionId: "session:synthetic-playback-1",
  generationId: "generation:synthetic-playback-1",
});

it("CHAT-AUDIT F09 rejects a prior unit failure delivered FIFO after its ended callback starts the successor", async () => {
  const channel = new MessageChannel();
  const flags = new Int32Array(new SharedArrayBuffer(12));
  const worker = new Worker(
    `
    const {parentPort, workerData} = require('node:worker_threads');
    const flags = new Int32Array(workerData.flags);
    let processor;
    globalThis.currentFrame = 0;
    globalThis.AudioWorkletProcessor = class { port = workerData.port; };
    globalThis.registerProcessor = (_name, Type) => { processor = new Type(); };
    import(workerData.source).then(() => {
      const receive = processor.port.onmessage;
      processor.port.onmessage = event => {
        receive(event);
        if (event.data.type === 'start') { Atomics.store(flags,0,1); Atomics.notify(flags,0); }
        if (event.data.type === 'pause') { Atomics.store(flags,2,1); Atomics.notify(flags,2); }
      };
      parentPort.on('message', () => {
        processor.process([], [[new Float32Array(128)]]);
        Atomics.store(flags,1,1); Atomics.notify(flags,1);
      });
      parentPort.postMessage('ready');
    }).catch(error => { throw error; });
  `,
    {
      eval: true,
      workerData: {
        port: channel.port2,
        flags: flags.buffer,
        source: pathToFileURL(
          path.resolve(
            process.cwd(),
            "src/tts/playback-backends/incremental-wsola-v3-worklet.ts",
          ),
        ).href,
      },
      transferList: [channel.port2],
    },
  );
  const context = new FakeAudioContext();
  const node = { port: channel.port1, connect: vi.fn(), disconnect: vi.fn() };
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
    async () => ({
      node: node as unknown as AudioWorkletNode,
      close: () => channel.port1.close(),
    }),
  );
  try {
    await new Promise<void>((resolve, reject) => {
      worker.once("message", () => resolve());
      worker.once("error", reject);
    });
    await backend.preparePlaybackRate(75);
    const failed = vi.fn();
    const request = {
      sequence: 1,
      payload: new Uint8Array(64),
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 16,
      startSampleFrame: 0,
      volumePercent: 100,
      playbackRate: 0.75,
    } as const;
    const ended = vi.fn(() => {
      backend.start({ ...request, sequence: 2 }, { ended: vi.fn(), failed });
    });
    const first = backend.start(request, { ended, failed: vi.fn() });
    // Let the device resume receipt dispatch start before blocking this thread.
    await Promise.resolve();
    expect(Atomics.wait(flags, 0, 0, 2000)).not.toBe("timed-out");
    worker.postMessage("render");
    expect(Atomics.wait(flags, 1, 0, 2000)).not.toBe("timed-out");
    // The audio thread has ended A, while this busy main thread has not yet
    // received that event. Pause A is still a valid product action here.
    first.pause();
    expect(Atomics.wait(flags, 2, 0, 2000)).not.toBe("timed-out");
    await vi.waitFor(() => expect(ended).toHaveBeenCalledOnce());
    // Give the second FIFO message the same event-loop opportunity as ended.
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(failed).not.toHaveBeenCalled();
    node.port.postMessage({
      type: "arm",
      input: new Float32Array(),
      ratePercent: 75,
      unitSequence: 2,
    });
    await vi.waitFor(() => expect(failed).toHaveBeenCalledOnce());
  } finally {
    backend.close();
    channel.port1.close();
    await worker.terminate();
  }
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
  readonly startedRates: number[] = [];
  readonly preparedRates: number[] = [];
  readonly observedVolumes: number[] = [];
  closeCount = 0;
  releasePreparationCount = 0;
  ratePrepared = false;
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
      get rendering() {
        return !paused && !stopped;
      },
      get playedSampleFrames() {
        return Math.min(
          durationFrames,
          Math.floor(
            (elapsedMs() * request.sampleRateHz * request.playbackRate) / 1_000,
          ),
        );
      },
      get renderedSampleFrames() {
        return Math.min(
          Math.ceil(durationFrames / request.playbackRate),
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
    this.startedRates.push(request.playbackRate);
    this.observedVolumes.push(volumePercent);
    this.lastCallbacks = callbacks;
    this.active = handle;
    return handle;
  }

  public preparePlaybackRate(
    playbackRatePercent: 75 | 80 | 85 | 90 | 95 | 100,
  ): Promise<void> {
    this.preparedRates.push(playbackRatePercent);
    this.ratePrepared = true;
    return Promise.resolve();
  }

  public isPlaybackRatePrepared(
    playbackRatePercent: 75 | 80 | 85 | 90 | 95 | 100,
  ): boolean {
    return playbackRatePercent === 100 || this.ratePrepared;
  }

  public releasePlaybackRatePreparation(): void {
    this.ratePrepared = false;
    this.releasePreparationCount += 1;
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

interface ManualTransitionTimer {
  readonly callback: () => void;
  readonly delayMs: number;
  cancelled: boolean;
}

class ManualTransitionTimers {
  readonly timers: ManualTransitionTimer[] = [];

  public readonly schedule: TransitionPauseScheduler = (callback, delayMs) => {
    const timer: ManualTransitionTimer = {
      callback,
      delayMs,
      cancelled: false,
    };
    this.timers.push(timer);
    return timer;
  };

  public readonly cancel: TransitionPauseCanceller = (handle) => {
    (handle as ManualTransitionTimer).cancelled = true;
  };

  public run(timer: ManualTransitionTimer): void {
    if (!timer.cancelled) {
      timer.callback();
    }
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

  public disconnect(): void {
    this.connected = false;
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
    disconnect: () => {
      this.gain.connected = false;
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

class FakeWsolaPort {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  readonly messages: unknown[] = [];
  closeCount = 0;

  public postMessage(message: unknown): void {
    this.messages.push(message);
  }

  public close(): void {
    this.closeCount += 1;
  }

  public emit(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent<unknown>);
  }
}

class FakeWsolaNode {
  onprocessorerror: (() => void) | null = null;
  readonly port = new FakeWsolaPort();
  connectCount = 0;
  disconnectCount = 0;

  public connect(): void {
    this.connectCount += 1;
  }

  public disconnect(): void {
    this.disconnectCount += 1;
  }
}

it.each([false, true])(
  "MPA-01 real factory delivers terminal disposal across paired ports (cancelled=%s)",
  async (cancelled) => {
    const channel = new MessageChannel();
    let processor!: {
      process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean;
    };
    vi.resetModules();
    vi.stubGlobal(
      "AudioWorkletProcessor",
      class {
        port = channel.port2;
      },
    );
    vi.stubGlobal(
      "registerProcessor",
      (_name: string, Type: new () => typeof processor) => {
        processor = new Type();
      },
    );
    const node = { port: channel.port1, connect: vi.fn(), disconnect: vi.fn() };
    vi.stubGlobal(
      "AudioWorkletNode",
      class {
        constructor() {
          return node;
        }
      },
    );
    let finishModule!: () => void;
    const context = Object.assign(new FakeAudioContext(), {
      audioWorklet: {
        addModule: () =>
          new Promise<void>((resolve) => {
            finishModule = resolve;
          }),
      },
    });
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
    );
    try {
      await import("./playback-backends/incremental-wsola-v3-worklet");
      const closed = new Promise<void>((resolve) =>
        channel.port2.once("close", resolve),
      );
      if (cancelled) {
        const preparation = backend.preparePlaybackRate(75);
        backend.releasePlaybackRatePreparation();
        finishModule();
        await preparation;
        expect(backend.isPlaybackRatePrepared(75)).toBe(false);
      } else {
        const creation = createIncrementalWsolaV3Node(
          context as unknown as AudioContext,
        );
        finishModule();
        const created = await creation;
        created.close();
        created.close();
      }
      await closed;
      expect(node.disconnect).toHaveBeenCalledOnce();
      expect(processor.process([], [])).toBe(false);
    } finally {
      await backend.close();
      channel.port1.close();
      channel.port2.close();
      vi.unstubAllGlobals();
    }
  },
);

it.each([false, true])(
  "RCF-19 real backend retires creation before a later attempt (old rejection=%s)",
  async (rejectOld) => {
    const context = new FakeAudioContext();
    const nodes = [new FakeWsolaNode(), new FakeWsolaNode()];
    const pending: {
      resolve: (
        node: Awaited<ReturnType<typeof createIncrementalWsolaV3Node>>,
      ) => void;
      reject: (reason: unknown) => void;
    }[] = [];
    const create = vi.fn(
      () =>
        new Promise<Awaited<ReturnType<typeof createIncrementalWsolaV3Node>>>(
          (resolve, reject) => {
            pending.push({ resolve, reject });
          },
        ),
    );
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
      create,
    );
    const clock = createManualClock(0);
    const first = segment(1);
    const scheduler = readyScheduler(clock, [first], true);
    const unit = synthesize(scheduler, first, 15_000);
    const player = new AdaptivePcmPlayer(scheduler, backend);
    const settle = async () => {
      for (let i = 0; i < 12; i += 1) await Promise.resolve();
    };
    const created = (index: number) => ({
      node: nodes[index]! as unknown as AudioWorkletNode,
      close: () => {
        nodes[index]!.disconnect();
        nodes[index]!.port.close();
      },
    });
    try {
      player.synchronize();
      await settle();
      const source = context.sources[0]!;
      player.setPlaybackRatePercent(85);
      player.setPlaybackRatePercent(100);
      player.setPlaybackRatePercent(75);
      for (const rate of [80, 95, 75] as const) {
        player.setPlaybackRatePercent(100);
        player.setPlaybackRatePercent(rate);
      }
      expect(create).toHaveBeenCalledTimes(1);
      if (rejectOld) pending[0]!.reject(new Error("retired creation"));
      else pending[0]!.resolve(created(0));
      await settle();
      expect(create).toHaveBeenCalledTimes(2);
      expect(nodes[0]!.disconnectCount).toBe(rejectOld ? 0 : 1);
      expect(nodes[0]!.port.closeCount).toBe(rejectOld ? 0 : 1);
      expect(nodes[0]!.connectCount).toBe(0);
      pending[1]!.resolve(created(1));
      await settle();
      context.currentTime = 1;
      expect(player.synchronize()).toMatchObject({
        state: "playing",
        selectedPlaybackRatePercent: 75,
        activePlaybackRatePercent: 100,
        playbackRateFallback: 0,
      });
      expect(backend.isPlaybackRatePrepared(75)).toBe(true);
      expect(nodes[1]!.connectCount).toBe(1);
      expect(context.sources).toEqual([source]);
      expect(source.stopped).toBe(false);
      expect(unit.releaseCount).toBe(0);
    } finally {
      player.close();
      await player.waitForCleanup();
    }
    expect(nodes[1]!.disconnectCount).toBe(1);
    expect(nodes[1]!.port.closeCount).toBe(1);
    expect(context.closeCount).toBe(1);
    expect(unit.releaseCount).toBe(1);
  },
);

it("RCF-19 close joins retired creation and prevents its queued replacement", async () => {
  const context = new FakeAudioContext();
  const node = new FakeWsolaNode();
  let resolve!: (
    created: Awaited<ReturnType<typeof createIncrementalWsolaV3Node>>,
  ) => void;
  const create = vi.fn(
    () =>
      new Promise<Awaited<ReturnType<typeof createIncrementalWsolaV3Node>>>(
        (done) => {
          resolve = done;
        },
      ),
  );
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
    create,
  );
  const first = backend.preparePlaybackRate(85);
  backend.releasePlaybackRatePreparation();
  const replacement = backend.preparePlaybackRate(75);
  let closed = false;
  const cleanup = backend.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  resolve({
    node: node as unknown as AudioWorkletNode,
    close: () => {
      node.disconnect();
      node.port.close();
    },
  });
  await Promise.all([first, replacement, cleanup]);
  expect(create).toHaveBeenCalledTimes(1);
  expect(node.connectCount).toBe(0);
  expect(node.disconnectCount).toBe(1);
  expect(node.port.closeCount).toBe(1);
  expect(context.closeCount).toBe(1);
});

it.each(["before", "during", "between"])(
  "MPA-02 native processorerror %s units invalidates its owner only",
  async (timing) => {
    const context = new FakeAudioContext();
    const nodes: FakeWsolaNode[] = [];
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
      async () => {
        const node = new FakeWsolaNode();
        nodes.push(node);
        return {
          node: node as unknown as AudioWorkletNode,
          close: () => {
            node.disconnect();
            node.port.close();
          },
        };
      },
    );
    const request = {
      sequence: 1,
      payload: new Uint8Array(64),
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 16,
      startSampleFrame: 0,
      volumePercent: 100,
      playbackRate: 0.75,
    } as const;
    const callbacks = { ended: vi.fn(), failed: vi.fn() };
    try {
      await backend.preparePlaybackRate(75);
      const node = nodes[0]!;
      if (timing !== "before") backend.start(request, callbacks);
      if (timing === "between")
        node.port.emit({ type: "ended", unitSequence: 1 });
      const lateError = node.onprocessorerror;
      const lateMessage = node.port.onmessage;
      lateError?.();
      lateError?.();
      expect(backend.isPlaybackRatePrepared(75)).toBe(false);
      expect(callbacks.failed).toHaveBeenCalledTimes(
        timing === "during" ? 1 : 0,
      );
      expect(callbacks.ended).toHaveBeenCalledTimes(
        timing === "between" ? 1 : 0,
      );
      await expect(backend.preparePlaybackRate(75)).rejects.toMatchObject({
        code: "playback-failure",
      });
      expect(() => backend.start(request, callbacks)).toThrow(PcmPlaybackError);
      expect(nodes).toHaveLength(1);
      backend.releasePlaybackRatePreparation();
      expect(node.onprocessorerror).toBeNull();
      await backend.preparePlaybackRate(75);
      backend.start({ ...request, sequence: 2 }, callbacks);
      lateError?.();
      lateMessage?.({
        data: { type: "failed", unitSequence: 1 },
      } as MessageEvent);
      lateMessage?.({
        data: { type: "ended", unitSequence: 1 },
      } as MessageEvent);
      expect(callbacks.failed).toHaveBeenCalledTimes(
        timing === "during" ? 1 : 0,
      );
      nodes[1]!.port.emit({ type: "ended", unitSequence: 2 });
      expect(callbacks.ended).toHaveBeenCalledTimes(
        timing === "between" ? 2 : 1,
      );
    } finally {
      await backend.close();
    }
  },
);

function segment(
  index: number,
  transitionPauseMs: PlaybackTransitionPauseMs = 0,
): AdaptiveBufferPreparedSegment {
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
    transitionPauseMs,
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
  mode: AdaptiveBufferStartMode = { kind: "quick" },
): AdaptiveBufferScheduler {
  const scheduler = new AdaptiveBufferScheduler(clock, IDENTITY, mode);
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

it("RIA-03 direct resume must succeed and the source clock must advance before heard start", async () => {
  const clock = createManualClock(0);
  const scheduler = readyScheduler(clock, [segment(1)], true);
  synthesize(scheduler, segment(1), 1000);
  const context = new FakeAudioContext();
  let resolve!: () => void;
  context.resume = () =>
    new Promise<void>((done) => {
      resolve = done;
    });
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
  );
  const player = new AdaptivePcmPlayer(scheduler, backend);
  const heard: AdaptivePcmAudibleProgressObservation[] = [];
  player.subscribeAudibleProgress((event) => heard.push(event));
  player.synchronize();
  expect(heard).toEqual([]);
  context.currentTime = 10;
  player.synchronize();
  expect(heard).toEqual([]);
  expect(scheduler.currentPlaybackUnit()?.consumedSampleFrames).toBe(0);
  resolve();
  await Promise.resolve();
  player.synchronize();
  expect(heard).toEqual([]);
  context.currentTime += 0.01;
  player.synchronize();
  expect(heard.map((event) => event.kind)).toEqual(["segment-started"]);
  player.pause();
  player.resume();
  clock.advanceBy(3000);
  context.currentTime += 3;
  player.synchronize();
  expect(heard.map((event) => event.kind)).toEqual(["segment-started"]);
  player.stop();
  resolve();
  await Promise.resolve();
  expect(player.synchronize().state).toBe("stopped");
});

it("CCF-C20 / CAF-R7.3 direct rendering includes deferred suspend but excludes device wait and late end", async () => {
  const context = new FakeAudioContext();
  let suspendDone!: () => void;
  let resumeDone!: () => void;
  context.suspend = () =>
    new Promise<void>((done) => {
      suspendDone = done;
    });
  context.resume = () =>
    new Promise<void>((done) => {
      resumeDone = done;
    });
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
  );
  const ended = vi.fn();
  const failed = vi.fn();
  const handle = backend.start(
    {
      sequence: 1,
      payload: new Uint8Array(24_000 * 4),
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 24_000,
      startSampleFrame: 0,
      volumePercent: 100,
      playbackRate: 1,
    },
    { ended, failed },
  );
  context.currentTime = 10;
  expect(context.sources[0]!.started).toBe(false);
  expect(handle.renderedSampleFrames).toBe(0);
  resumeDone();
  await Promise.resolve();
  expect(context.sources[0]!.started).toBe(true);
  const start = vi.spyOn(context.sources[0]!, "start");
  context.currentTime = 10.25;
  expect(handle.playedSampleFrames).toBe(6_000);
  expect(handle.renderedSampleFrames).toBe(6_000);
  handle.pause();
  // The source continues to render until suspend takes effect. The context
  // clock then freezes; wall-clock time while suspended does not advance it.
  context.currentTime = 10.5;
  suspendDone();
  await Promise.resolve();
  expect(handle.playedSampleFrames).toBe(12_000);
  expect(handle.renderedSampleFrames).toBe(12_000);
  expect(handle.rendering).toBe(false);
  handle.resume();
  // The already-started source resumes with the context, before promise delivery.
  context.currentTime = 10.625;
  resumeDone();
  await Promise.resolve();
  expect(handle.playedSampleFrames).toBe(15_000);
  expect(start).not.toHaveBeenCalled();
  context.currentTime = 12;
  expect(handle.playedSampleFrames).toBe(24_000);
  expect(handle.renderedSampleFrames).toBe(24_000);
  context.sources[0]!.end();
  context.currentTime = 30;
  expect(handle.renderedSampleFrames).toBe(24_000);
  expect(ended).toHaveBeenCalledOnce();
  expect(failed).not.toHaveBeenCalled();
  await backend.close();
});

it("CCF-C20 / RIA-03 WSOLA reports actual output separately from clock-estimated source progress", async () => {
  const context = new FakeAudioContext();
  const node = new FakeWsolaNode();
  const ended = vi.fn();
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
    async () => ({ node: node as unknown as AudioWorkletNode, close: vi.fn() }),
  );
  await backend.preparePlaybackRate(75);
  const handle = backend.start(
    {
      sequence: 1,
      payload: new Uint8Array(96000),
      sampleRateHz: 24000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 24000,
      startSampleFrame: 0,
      volumePercent: 0,
      playbackRate: 0.75,
    },
    { ended, failed: vi.fn() },
  );
  await Promise.resolve();
  context.currentTime = 0.5;
  expect(handle.playedSampleFrames).toBe(0);
  expect(handle.renderedSampleFrames).toBe(0);
  node.port.emit({
    type: "started",
    unitSequence: 1,
    activation: 0,
    currentFrame: 12000,
    sourceFrames: 0,
  });
  context.currentTime += 0.1;
  expect(handle.playedSampleFrames).toBeCloseTo(1800, -1);
  expect(handle.renderedSampleFrames).toBe(0);
  handle.pause();
  node.port.emit({
    type: "paused",
    unitSequence: 1,
    activation: 1,
    sourceFrames: 1800,
    renderedFrames: 2400,
  });
  context.currentTime += 1;
  expect(handle.playedSampleFrames).toBeCloseTo(1800, -1);
  expect(handle.renderedSampleFrames).toBe(2400);
  handle.resume();
  await Promise.resolve();
  context.currentTime += 1;
  expect(handle.playedSampleFrames).toBeCloseTo(1800, -1);
  node.port.emit({
    type: "started",
    unitSequence: 1,
    activation: 0,
    currentFrame: 12000,
    sourceFrames: 0,
  });
  expect(handle.playedSampleFrames).toBeCloseTo(1800, -1);
  node.port.emit({
    type: "resumed",
    unitSequence: 1,
    activation: 2,
    currentFrame: 62400,
    sourceFrames: 1800,
  });
  context.currentTime += 0.1;
  expect(handle.playedSampleFrames).toBeCloseTo(3600, -1);
  node.port.emit({ type: "rendered", unitSequence: 1, renderedFrames: 6000 });
  expect(handle.renderedSampleFrames).toBe(6000);
  node.port.emit({ type: "rendered", unitSequence: 0, renderedFrames: 20000 });
  expect(handle.renderedSampleFrames).toBe(6000);
  context.currentTime += 10;
  node.port.emit({
    type: "ended",
    unitSequence: 1,
    sourceFrames: 24000,
    renderedFrames: 32000,
  });
  expect(handle.renderedSampleFrames).toBe(32000);
  expect(ended).toHaveBeenCalledOnce();
  await backend.close();
});

it("DCR-10 contains createBuffer failure from the successor device callback", async () => {
  const clock = createManualClock(0);
  const first = segment(1);
  const second = segment(2);
  const scheduler = readyScheduler(clock, [first, second], true);
  const firstUnit = synthesize(scheduler, first, 15_000);
  const secondUnit = synthesize(scheduler, second, 15_000);
  const context = new FakeAudioContext();
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
  );
  const player = new AdaptivePcmPlayer(scheduler, backend, (release) =>
    release(),
  );
  player.synchronize();
  await Promise.resolve();
  const allocate = vi
    .spyOn(context, "createBuffer")
    .mockImplementationOnce(() => {
      throw new DOMException("synthetic allocation fault", "NotSupportedError");
    });
  expect(() => context.sources[0]!.end()).not.toThrow();
  expect(allocate).toHaveBeenCalledOnce();
  expect(player.synchronize().state).toBe("failed");
  player.close();
  await player.waitForCleanup();
  expect(context.closeCount).toBe(1);
  expect(firstUnit.releaseCount).toBe(1);
  expect(secondUnit.releaseCount).toBe(1);
});

it("DCR-06 confirms output once from a current positive paused receipt", async () => {
  const clock = createManualClock(0);
  const first = segment(1);
  const scheduler = readyScheduler(clock, [first], true);
  scheduler.selectPlaybackRatePercent(75);
  synthesize(scheduler, first, 15_000);
  const context = new FakeAudioContext();
  const node = new FakeWsolaNode();
  const backend = new WebAudioPcmPlaybackBackend(
    () => context as unknown as AudioContext,
    async () => ({ node: node as unknown as AudioWorkletNode, close: vi.fn() }),
  );
  await backend.preparePlaybackRate(75);
  const player = new AdaptivePcmPlayer(scheduler, backend);
  const progress = vi.fn();
  player.subscribeAudibleProgress(progress);
  player.synchronize();
  await Promise.resolve();
  expect(player.pause().state).toBe("paused");
  node.port.emit({
    type: "started",
    unitSequence: 0,
    activation: 0,
    currentFrame: 0,
    sourceFrames: 0,
  });
  node.port.emit({
    type: "paused",
    unitSequence: 0,
    activation: 1,
    sourceFrames: 0,
    renderedFrames: 0,
  });
  node.port.emit({
    type: "paused",
    unitSequence: 1,
    activation: 1,
    sourceFrames: 480,
    renderedFrames: 640,
  });
  player.synchronize();
  expect(progress).not.toHaveBeenCalled();
  node.port.emit({
    type: "paused",
    unitSequence: 0,
    activation: 0,
    sourceFrames: 480,
    renderedFrames: 640,
  });
  player.synchronize();
  expect(progress).not.toHaveBeenCalled();
  node.port.emit({
    type: "paused",
    unitSequence: 0,
    activation: 1,
    sourceFrames: 480,
    renderedFrames: 640,
  });
  clock.advanceBy(500);
  const retained = scheduler.observe().playableSampleFrames;
  expect(player.synchronize()).toMatchObject({
    state: "paused",
    renderedSampleFrames: 640,
  });
  expect(progress).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ kind: "segment-started", sequence: 0 }),
  );
  clock.advanceBy(500);
  player.synchronize();
  expect(progress).toHaveBeenCalledOnce();
  expect(scheduler.observe().playableSampleFrames).toBe(retained);
  node.port.emit({
    type: "ended",
    unitSequence: 0,
    sourceFrames: 360_000,
    renderedFrames: 480_000,
  });
  expect(progress.mock.calls.map(([event]) => event.kind)).toEqual([
    "segment-started",
    "segment-completed",
  ]);
  player.close();
  await player.waitForCleanup();
});

it.each([1, 0.75])(
  "CCF-C20 / RIA-03 waits for current device activation across pauses and successors at rate %s",
  async (rate) => {
    const context = new FakeAudioContext();
    const pending: { resolve(): void; reject(): void }[] = [];
    context.resume = () =>
      new Promise<void>((resolve, reject) => {
        pending.push({
          resolve,
          reject: () => reject(new Error("synthetic failure")),
        });
      });
    const node = new FakeWsolaNode();
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
      async () => ({
        node: node as unknown as AudioWorkletNode,
        close: vi.fn(),
      }),
    );
    await backend.preparePlaybackRate(rate === 1 ? 100 : 75);
    const request = {
      sequence: 1,
      payload: new Uint8Array(96000),
      sampleRateHz: 24000,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples: 24000,
      startSampleFrame: 0,
      volumePercent: 100,
      playbackRate: rate,
    } as const;
    const callbacks = { ended: vi.fn(), failed: vi.fn() };
    const first = backend.start(request, callbacks);
    if (rate !== 1) {
      expect(node.port.messages).toHaveLength(1);
      expect(node.port.messages[0]).toMatchObject({ type: "arm" });
    }
    first.pause();
    first.resume();
    pending[0]!.resolve();
    await Promise.resolve();
    context.currentTime = 1;
    expect(first.rendering).toBe(false);
    expect(first.playedSampleFrames).toBe(0);
    if (rate !== 1) expect(node.port.messages).toHaveLength(1);
    first.pause();
    first.resume();
    pending[1]!.reject();
    await Promise.resolve();
    await Promise.resolve();
    expect(callbacks.failed).not.toHaveBeenCalled();
    pending[2]!.resolve();
    await Promise.resolve();
    if (rate !== 1) {
      expect(node.port.messages.slice(1)).toMatchObject([
        { type: "start", unitSequence: 1, activation: 4 },
      ]);
      node.port.emit({
        type: "started",
        unitSequence: 1,
        activation: 4,
        currentFrame: 24000,
        sourceFrames: 0,
      });
    }
    context.currentTime += 0.01;
    expect(first.rendering).toBe(true);
    first.pause();
    first.resume();
    if (rate !== 1)
      expect(node.port.messages.at(-1)).toMatchObject({
        type: "pause",
        unitSequence: 1,
        activation: 5,
      });
    first.stop();
    const successor = backend.start({ ...request, sequence: 2 }, callbacks);
    pending[3]!.reject();
    await Promise.resolve();
    await Promise.resolve();
    expect(callbacks.failed).not.toHaveBeenCalled();
    expect(successor.rendering).toBe(false);
    successor.stop();
    pending[4]!.resolve();
    await Promise.resolve();
    if (rate !== 1)
      expect(node.port.messages.at(-1)).toMatchObject({
        type: "stop",
        unitSequence: 2,
      });
    const rejected = backend.start({ ...request, sequence: 3 }, callbacks);
    pending[5]!.reject();
    await Promise.resolve();
    await Promise.resolve();
    expect(callbacks.failed).toHaveBeenCalledOnce();
    expect(callbacks.ended).not.toHaveBeenCalled();
    expect(rejected.rendering).toBe(false);
    expect(rejected.playedSampleFrames).toBe(0);
    await backend.close();
  },
);

it("RIA-03 publishes a short unit start before end even when both occur inside backend allocation", () => {
  const clock = createManualClock(0);
  const scheduler = readyScheduler(clock, [segment(1)], true);
  synthesize(scheduler, segment(1), 1);
  const backend: PcmPlaybackBackend = {
    start(request, callbacks) {
      callbacks.ended();
      return {
        sequence: request.sequence,
        rendering: false,
        playedSampleFrames: 24,
        renderedSampleFrames: 24,
        pause() {},
        resume() {},
        stop() {},
        setVolumePercent() {},
      };
    },
    close() {},
  };
  const player = new AdaptivePcmPlayer(scheduler, backend);
  const events: string[] = [];
  player.subscribeAudibleProgress((event) => events.push(event.kind));
  expect(player.synchronize().state).toBe("complete");
  expect(events).toEqual(["segment-started", "segment-completed"]);
  player.close();
});

function runCleanupTurns(turns: Array<() => void>): void {
  while (turns.length > 0) {
    turns.shift()?.();
  }
}

describe("adaptive PCM playback", () => {
  it.each(["buffered", "pending", "final"] as const)(
    "CLB-02 honors Pause delivered just after ended with %s successor",
    (successor) => {
      const clock = createManualClock(0);
      const first = segment(1, 600);
      const second = segment(2);
      const scheduler = readyScheduler(
        clock,
        successor === "final" ? [first] : [first, second],
        true,
      );
      const unit = synthesize(scheduler, first, 15_000);
      if (successor === "buffered") synthesize(scheduler, second, 15_000);
      const backend = new ManualPcmPlaybackBackend(clock);
      const timers = new ManualTransitionTimers();
      const player = new AdaptivePcmPlayer(
        scheduler,
        backend,
        undefined,
        timers.schedule,
        timers.cancel,
      );
      player.synchronize();
      clock.advanceBy(15_000);
      backend.pump();
      expect(player.pause().state).toBe("paused");
      expect(backend.startedSequences).toEqual([0]);
      expect(unit.releaseCount).toBe(1);
      expect(() => player.resume()).not.toThrow();
      expect(player.synchronize().underrunCount).toBe(
        successor === "pending" ? 1 : 0,
      );
      player.close();
    },
  );

  it.each([100, 75] as const)(
    "CLB-02 settles the real Web Audio backend callback at %i percent",
    async (rate) => {
      const clock = createManualClock(0);
      const first = segment(1);
      const scheduler = readyScheduler(clock, [first], true);
      scheduler.selectPlaybackRatePercent(rate);
      const unit = synthesize(scheduler, first, 15_000);
      const context = new FakeAudioContext();
      const node = new FakeWsolaNode();
      const backend = new WebAudioPcmPlaybackBackend(
        () => context as unknown as AudioContext,
        async () => ({
          node: node as unknown as AudioWorkletNode,
          close: () => {
            node.disconnect();
            node.port.close();
          },
        }),
      );
      if (rate !== 100) await backend.preparePlaybackRate(rate);
      const player = new AdaptivePcmPlayer(scheduler, backend);
      player.synchronize();
      player.pause();
      if (rate === 100) context.sources[0]!.end();
      else node.port.emit({ type: "ended", unitSequence: 0 });
      expect(player.synchronize().state).toBe("paused");
      expect(unit.releaseCount).toBe(1);
      expect(player.resume().state).toBe("complete");
      player.close();
      await player.waitForCleanup();
      expect(context.closeCount).toBe(1);
    },
  );

  it.each([100, 75] as const)(
    "CLB-02 settles a queued ended callback while paused at %i percent",
    (rate) => {
      for (const tailAccounted of [false, true]) {
        for (const successor of ["buffered", "pending", "final"] as const) {
          const clock = createManualClock(0);
          const first = segment(1, 600);
          const second = segment(2);
          const scheduler = readyScheduler(
            clock,
            successor === "final" ? [first] : [first, second],
            true,
          );
          scheduler.selectPlaybackRatePercent(rate);
          const firstUnit = synthesize(scheduler, first, 15_000);
          const secondUnit =
            successor === "buffered"
              ? synthesize(scheduler, second, 15_000)
              : undefined;
          const backend = new ManualPcmPlaybackBackend(clock);
          backend.ratePrepared = true;
          const timers = new ManualTransitionTimers();
          const player = new AdaptivePcmPlayer(
            scheduler,
            backend,
            undefined,
            timers.schedule,
            timers.cancel,
          );
          const progress: AdaptivePcmAudibleProgressObservation[] = [];
          player.subscribeAudibleProgress((event) => progress.push(event));
          player.synchronize();
          clock.advanceBy(tailAccounted ? 15_000 / (rate / 100) : 1);
          expect(player.pause().state).toBe("paused");
          if (successor === "buffered")
            player.setPlaybackRatePercent(rate === 100 ? 75 : 100);
          const ended = backend.lastCallbacks!.ended;
          // AudioContext suspension is asynchronous: an already queued
          // completion can arrive after Pause, with an unaccounted tail.
          backend.active = undefined;
          ended();
          ended();
          expect(player.synchronize().state).toBe("paused");
          expect(firstUnit.releaseCount).toBe(1);
          expect(secondUnit?.releaseCount ?? 0).toBe(0);
          expect(backend.startedSequences).toEqual([0]);
          expect(
            progress.filter((event) => event.kind === "segment-completed"),
          ).toHaveLength(1);
          expect(player.resume().state).toBe(
            successor === "final"
              ? "complete"
              : successor === "pending"
                ? "buffering"
                : "playing",
          );
          if (successor === "buffered") {
            expect(backend.startedSequences).toEqual([0]);
            clock.advanceBy(600);
            player.synchronize();
            expect(backend.startedSequences).toEqual([0, 1]);
            expect(backend.startedRates).toEqual([
              rate / 100,
              rate === 100 ? 0.75 : 1,
            ]);
          }
          player.close();
        }
      }
    },
  );

  it.each([false, true])(
    "five-pass 3.2 waits for Prepared lead at the new rate before first allocation (paused: %s)",
    async (paused) => {
      const clock = createManualClock(0);
      const segments = [segment(1), segment(2), segment(3), segment(4)];
      const scheduler = readyScheduler(clock, segments, false, {
        kind: "prepared",
        targetMs: 60_000,
      });
      scheduler.selectPlaybackRatePercent(75);
      for (const prepared of segments.slice(0, 3)) {
        synthesize(scheduler, prepared, 15_000);
      }
      const backend = new ManualPcmPlaybackBackend(clock);
      let release!: () => void;
      const ratePreparation = new Promise<void>((resolve) => {
        release = resolve;
      });
      const prepare = vi
        .spyOn(backend, "preparePlaybackRate")
        .mockReturnValueOnce(ratePreparation);
      const player = new AdaptivePcmPlayer(scheduler, backend);
      try {
        player.synchronize();
        expect(prepare).toHaveBeenCalledExactlyOnceWith(75);
        expect(backend.startedSequences).toEqual([]);
        if (paused) expect(player.pause().state).toBe("paused");

        player.setPlaybackRatePercent(100);
        const waiting = paused ? player.resume() : player.synchronize();
        expect(backend.startedSequences).toEqual([]);
        expect(waiting.state).toBe("preparing");
        release();
        await ratePreparation;
        player.synchronize();
        expect(backend.startedSequences).toEqual([]);

        synthesize(scheduler, segments[3]!, 15_000);
        expect(player.synchronize().state).toBe("playing");
        expect(backend.startedSequences).toEqual([0]);
        expect(backend.startedRates).toEqual([1]);
      } finally {
        release();
        player.close();
        await player.waitForCleanup();
      }
    },
  );

  it.each(["stop", "close", "invalidateForSeek"] as const)(
    "B08 ignores late rate preparation success and failure after %s",
    async (invalidate) => {
      for (const rejectPreparation of [false, true]) {
        const clock = createManualClock(0);
        const first = segment(1);
        const scheduler = readyScheduler(clock, [first], true);
        scheduler.selectPlaybackRatePercent(75);
        const unit = synthesize(scheduler, first, 15_000);
        const backend = new ManualPcmPlaybackBackend(clock);
        let settle!: () => void;
        vi.spyOn(backend, "preparePlaybackRate").mockImplementation(
          () =>
            new Promise<void>((resolve, reject) => {
              settle = () =>
                rejectPreparation
                  ? reject(new Error("synthetic preparation failure"))
                  : resolve();
            }),
        );
        const player = new AdaptivePcmPlayer(scheduler, backend);
        const audible = vi.fn();
        player.subscribeAudibleProgress(audible);
        player.synchronize();
        player.pause();
        player[invalidate]();
        settle();
        await Promise.resolve();
        await Promise.resolve();
        expect(player.synchronize().state).toBe("stopped");
        expect(backend.startedSequences).toEqual([]);
        expect(audible).not.toHaveBeenCalled();
        expect(backend.releasePreparationCount).toBe(1);
        player.close();
        await player.waitForCleanup();
        expect(unit.releaseCount).toBe(1);
      }
    },
  );

  it.each([75, 85, 100] as const)(
    "RCF-19 shared future failure handles latest %s through current, paused and ended units",
    async (latest) => {
      for (const phase of ["playing", "paused", "boundary"] as const) {
        const clock = createManualClock(0);
        const first = segment(1);
        const second = segment(2);
        const scheduler = readyScheduler(clock, [first, second], true);
        const firstUnit = synthesize(scheduler, first, 15_000);
        synthesize(scheduler, second, 5_000);
        const backend = new ManualPcmPlaybackBackend(clock);
        const player = new AdaptivePcmPlayer(scheduler, backend);
        const progress: AdaptivePcmAudibleProgressObservation[] = [];
        player.subscribeAudibleProgress((event) => progress.push(event));
        let reject!: (reason: unknown) => void;
        const prepare = vi
          .spyOn(backend, "preparePlaybackRate")
          .mockImplementationOnce(
            () =>
              new Promise<void>((_resolve, fail) => {
                reject = fail;
              }),
          );
        player.synchronize();
        const active = backend.active;
        player.setPlaybackRatePercent(85);
        player.setPlaybackRatePercent(latest);
        expect(prepare).toHaveBeenCalledTimes(1);
        if (phase === "paused") player.pause();
        if (phase === "boundary") {
          clock.advanceBy(15_000);
          backend.pump();
          player.synchronize();
        }
        reject(new Error("shared preparation failed"));
        await Promise.resolve();
        await Promise.resolve();
        expect(player.synchronize()).toMatchObject({
          selectedPlaybackRatePercent: 100,
          playbackRateFallback: latest === 100 ? 0 : 1,
        });
        if (phase !== "boundary") {
          expect(backend.active).toBe(active);
          expect(firstUnit.releaseCount).toBe(0);
          expect(player.synchronize().state).toBe(
            phase === "paused" ? "paused" : "playing",
          );
          if (phase === "paused") player.resume();
          clock.advanceBy(15_000);
          backend.pump();
        }
        clock.advanceBy(600);
        player.synchronize();
        expect(backend.startedRates).toEqual([1, 1]);
        expect(prepare).toHaveBeenCalledTimes(1);
        expect(firstUnit.releaseCount).toBe(1);
        expect(
          progress.filter((event) => event.kind === "segment-completed"),
        ).toHaveLength(1);
        player.close();
        await player.waitForCleanup();
      }
    },
  );

  it.each(["stop", "close", "invalidateForSeek", "independent"] as const)(
    "RCF-19 ignores an obsolete future failure after %s",
    async (replacement) => {
      const clock = createManualClock(0);
      const first = segment(1);
      const scheduler = readyScheduler(clock, [first], true);
      const unit = synthesize(scheduler, first, 15_000);
      const backend = new ManualPcmPlaybackBackend(clock);
      const player = new AdaptivePcmPlayer(scheduler, backend);
      let reject!: (reason: unknown) => void;
      const prepare = vi
        .spyOn(backend, "preparePlaybackRate")
        .mockImplementationOnce(
          () =>
            new Promise<void>((_resolve, fail) => {
              reject = fail;
            }),
        );
      player.synchronize();
      const active = backend.active;
      player.setPlaybackRatePercent(85);
      if (replacement === "independent") {
        player.setPlaybackRatePercent(100);
        player.setPlaybackRatePercent(75);
      } else player[replacement]();
      reject(new Error("obsolete preparation failed"));
      await Promise.resolve();
      await Promise.resolve();
      const observation = player.synchronize();
      expect(observation.playbackRateFallback).toBe(0);
      if (replacement === "independent") {
        expect(observation).toMatchObject({
          state: "playing",
          selectedPlaybackRatePercent: 75,
        });
        expect(prepare).toHaveBeenCalledTimes(2);
        expect(backend.ratePrepared).toBe(true);
        expect(backend.active).toBe(active);
      } else expect(observation.state).toBe("stopped");
      player.close();
      await player.waitForCleanup();
      expect(unit.releaseCount).toBe(1);
    },
  );
  it("B08 reports a genuine preparation failure while paused and releases audio", async () => {
    const clock = createManualClock(0);
    const first = segment(1);
    const scheduler = readyScheduler(clock, [first], true);
    scheduler.selectPlaybackRatePercent(75);
    const unit = synthesize(scheduler, first, 15_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    let rejectPreparation!: (error: Error) => void;
    vi.spyOn(backend, "preparePlaybackRate").mockImplementation(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectPreparation = reject;
        }),
    );
    const player = new AdaptivePcmPlayer(scheduler, backend);
    player.synchronize();
    player.pause();
    rejectPreparation(new Error("synthetic preparation failure"));
    await Promise.resolve();
    await Promise.resolve();
    expect(player.synchronize().state).toBe("failed");
    expect(() => player.resume()).toThrow(PcmPlaybackError);
    expect(backend.startedSequences).toEqual([]);
    player.close();
    await player.waitForCleanup();
    expect(unit.releaseCount).toBe(1);
  });

  it("B08 preserves paused intent across rapid rates and Resume before preparation settles", async () => {
    const clock = createManualClock(0);
    const first = segment(1);
    const scheduler = readyScheduler(clock, [first], true);
    scheduler.selectPlaybackRatePercent(75);
    synthesize(scheduler, first, 15_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    let finish!: () => void;
    vi.spyOn(backend, "preparePlaybackRate").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = () => {
            backend.ratePrepared = true;
            resolve();
          };
        }),
    );
    const player = new AdaptivePcmPlayer(scheduler, backend);
    player.synchronize();
    player.pause();
    player.setPlaybackRatePercent(85);
    player.setPlaybackRatePercent(80);
    player.resume();
    expect(backend.startedSequences).toEqual([]);
    player.pause();
    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(player.synchronize().state).toBe("paused");
    player.setPlaybackRatePercent(100);
    expect(backend.startedSequences).toEqual([]);
    player.resume();
    expect(backend.startedRates).toEqual([1]);
    player.close();
    await player.waitForCleanup();
  });

  it("B08 accepts Pause while rate preparation is pending and starts only after Resume", async () => {
    const clock = createManualClock(0);
    const first = segment(1);
    const scheduler = readyScheduler(clock, [first], true);
    scheduler.selectPlaybackRatePercent(75);
    const unit = synthesize(scheduler, first, 15_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    let finish!: () => void;
    vi.spyOn(backend, "preparePlaybackRate").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = () => {
            backend.ratePrepared = true;
            resolve();
          };
        }),
    );
    const player = new AdaptivePcmPlayer(scheduler, backend);
    try {
      player.synchronize();
      expect(backend.startedSequences).toEqual([]);
      expect(player.pause()).toMatchObject({ state: "paused" });
      finish();
      await Promise.resolve();
      await Promise.resolve();
      player.synchronize();
      expect(backend.startedSequences).toEqual([]);
      expect(unit.releaseCount).toBe(0);
      player.resume();
      player.synchronize();
      expect(backend.startedSequences).toEqual([0]);
    } finally {
      player.close();
      finish?.();
      await player.waitForCleanup();
    }
  });

  it("waits for asynchronous backend disposal and closes it only once", async () => {
    const clock = createManualClock(0);
    const scheduler = readyScheduler(clock, [segment(1)], true);
    const backend = new ManualPcmPlaybackBackend(clock);
    let finish!: () => void;
    const close = vi.spyOn(backend, "close").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const player = new AdaptivePcmPlayer(scheduler, backend);
    player.close();
    player.close();
    let settled = false;
    const cleanup = player.waitForCleanup().then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
    finish();
    await cleanup;
    expect(settled).toBe(true);
  });

  it("reports a failed backend close through cleanup instead of declaring release", async () => {
    const clock = createManualClock(0);
    const scheduler = readyScheduler(clock, [segment(1)], true);
    const backend = new ManualPcmPlaybackBackend(clock);
    vi.spyOn(backend, "close").mockImplementation(() =>
      Promise.reject(new PcmPlaybackError("playback-failure")),
    );
    const player = new AdaptivePcmPlayer(scheduler, backend);
    player.close();
    await expect(player.waitForCleanup()).rejects.toMatchObject({
      code: "playback-failure",
    });
  });

  it("settles pending WSOLA preparation before backend close resolves", async () => {
    const context = new FakeAudioContext();
    const node = new FakeWsolaNode();
    let finish!: (value: { node: AudioWorkletNode; close(): void }) => void;
    const closed = vi.fn();
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const preparing = backend.preparePlaybackRate(75);
    let settled = false;
    const closing = backend.close().then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    finish({ node: node as unknown as AudioWorkletNode, close: closed });
    await preparing;
    await closing;
    await backend.close();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(context.closeCount).toBe(1);
    expect(node.connectCount).toBe(0);
  });

  it("waits by semantic transition without allocating or consuming audio", () => {
    const clock = createManualClock(0);
    const segments = [segment(1, 300), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    const first = synthesize(scheduler, segments[0]!, 8_000);
    const second = synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const timers = new ManualTransitionTimers();
    const player = new AdaptivePcmPlayer(
      scheduler,
      backend,
      (callback) => callback(),
      timers.schedule,
      timers.cancel,
    );
    const events: AdaptivePcmAudibleProgressObservation[] = [];
    player.subscribeAudibleProgress((event) => events.push(event));

    player.synchronize();
    clock.advanceBy(8_000);
    backend.pump();

    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: undefined,
      playableDurationMs: 8_000,
      intentionalTransitionPauseActive: true,
      intentionalTransitionPauseRemainingMs: 300,
      completedTransitionPauseCount: 0,
    });
    expect(timers.timers.at(-1)?.delayMs).toBe(300);
    expect(backend.startedSequences).toEqual([0]);
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(0);
    expect(events.at(-1)).toMatchObject({
      kind: "segment-completed",
      sequence: 0,
    });

    clock.advanceBy(299);
    expect(player.synchronize()).toMatchObject({
      activeSequence: undefined,
      intentionalTransitionPauseRemainingMs: 1,
    });
    clock.advanceBy(1);
    expect(player.synchronize()).toMatchObject({
      activeSequence: 1,
      intentionalTransitionPauseActive: false,
      intentionalTransitionPauseMs: 300,
      intentionalTransitionPauseRemainingMs: 0,
      completedTransitionPauseCount: 1,
    });
    expect(backend.startedSequences).toEqual([0, 1]);
    expect(timers.timers.at(-1)?.cancelled).toBe(true);
    expect(events.at(-1)).toMatchObject({
      kind: "segment-started",
      sequence: 1,
    });
  });

  it("freezes and resumes only the remaining transition pause", () => {
    const clock = createManualClock(0);
    const segments = [segment(1, 600), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const timers = new ManualTransitionTimers();
    const player = new AdaptivePcmPlayer(
      scheduler,
      backend,
      (callback) => callback(),
      timers.schedule,
      timers.cancel,
    );

    player.synchronize();
    clock.advanceBy(8_000);
    backend.pump();
    clock.advanceBy(200);
    expect(player.pause()).toMatchObject({
      state: "paused",
      intentionalTransitionPauseActive: false,
      intentionalTransitionPauseMs: 200,
      intentionalTransitionPauseRemainingMs: 400,
    });
    const firstTimer = timers.timers[0]!;
    expect(firstTimer.cancelled).toBe(true);

    clock.advanceBy(2_000);
    expect(player.synchronize()).toMatchObject({
      state: "paused",
      intentionalTransitionPauseMs: 200,
      intentionalTransitionPauseRemainingMs: 400,
    });
    player.resume();
    expect(timers.timers.at(-1)?.delayMs).toBe(400);
    clock.advanceBy(399);
    expect(player.synchronize().activeSequence).toBeUndefined();
    clock.advanceBy(1);
    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: 1,
      intentionalTransitionPauseMs: 600,
      completedTransitionPauseCount: 1,
    });
  });

  it("SAC-11 settles a transition exhausted between Pause clock reads without starting its successor", () => {
    const clock = createManualClock(0);
    const segments = [segment(1, 600), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const timers = new ManualTransitionTimers();
    const player = new AdaptivePcmPlayer(
      scheduler,
      backend,
      (callback) => callback(),
      timers.schedule,
      timers.cancel,
    );
    player.synchronize();
    clock.advanceBy(8_000);
    backend.pump();
    clock.advanceBy(599);
    const observe = scheduler.observe.bind(scheduler);
    vi.spyOn(scheduler, "observe").mockImplementation(() => {
      const snapshot = observe();
      // The eligibility read sees one millisecond remaining; freezing sees zero.
      if (snapshot.observedAtMs === 8_599) clock.advanceBy(1);
      return snapshot;
    });

    expect(player.pause()).toMatchObject({
      state: "paused",
      completedTransitionPauseCount: 1,
      intentionalTransitionPauseRemainingMs: 0,
    });
    expect(backend.startedSequences).toEqual([0]);
    timers.timers[0]!.callback();
    expect(backend.startedSequences).toEqual([0]);
    expect(player.resume()).toMatchObject({
      state: "playing",
      activeSequence: 1,
    });
    player.synchronize();
    expect(backend.startedSequences).toEqual([0, 1]);
  });

  it("does not compound real buffering or delay the final unit", () => {
    const clock = createManualClock(0);
    const segments = [segment(1, 600), segment(2, 1_200)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 16_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const timers = new ManualTransitionTimers();
    const player = new AdaptivePcmPlayer(
      scheduler,
      backend,
      (callback) => callback(),
      timers.schedule,
      timers.cancel,
    );

    player.synchronize();
    clock.advanceBy(16_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "buffering",
      underrunCount: 1,
      intentionalTransitionPauseMs: 0,
      intentionalTransitionPauseRemainingMs: 0,
    });
    expect(timers.timers).toHaveLength(0);

    synthesize(scheduler, segments[1]!, 16_000);
    expect(player.synchronize()).toMatchObject({
      state: "playing",
      activeSequence: 1,
      intentionalTransitionPauseActive: false,
    });
    clock.advanceBy(16_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "complete",
      activeSequence: undefined,
      intentionalTransitionPauseMs: 0,
    });
    expect(timers.timers).toHaveLength(0);
  });

  it("cancels a pending transition before stale cleanup and ignores its late callback", () => {
    const clock = createManualClock(0);
    const segments = [segment(1, 750), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    synthesize(scheduler, segments[0]!, 8_000);
    synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const timers = new ManualTransitionTimers();
    const cleanupTurns: Array<() => void> = [];
    const player = new AdaptivePcmPlayer(
      scheduler,
      backend,
      (callback) => cleanupTurns.push(callback),
      timers.schedule,
      timers.cancel,
    );

    player.synchronize();
    clock.advanceBy(8_000);
    backend.pump();
    const lateTimer = timers.timers[0]!;
    expect(player.synchronize().intentionalTransitionPauseActive).toBe(true);

    expect(player.stop()).toBe("shutdown");
    expect(lateTimer.cancelled).toBe(true);
    lateTimer.callback();
    expect(player.synchronize()).toMatchObject({
      state: "stopped",
      activeSequence: undefined,
      intentionalTransitionPauseActive: false,
      intentionalTransitionPauseRemainingMs: 0,
    });
    expect(backend.startedSequences).toEqual([0]);
    runCleanupTurns(cleanupTurns);
  });

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

  it("releases at most four invalidated originals per scheduled cleanup turn", async () => {
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
    let cleanupComplete = false;
    void player.waitForCleanup().then(() => {
      cleanupComplete = true;
    });
    expect(cleanupTurns).toHaveLength(1);
    cleanupTurns.shift()?.();
    expect(cleanupComplete).toBe(false);
    expect(units.map(({ releaseCount }) => releaseCount)).toEqual([
      1, 1, 1, 1, 0,
    ]);
    expect(cleanupTurns).toHaveLength(1);
    cleanupTurns.shift()?.();
    await Promise.resolve();
    expect(cleanupComplete).toBe(true);
    expect(units.map(({ releaseCount }) => releaseCount)).toEqual([
      1, 1, 1, 1, 1,
    ]);
    expect(player.synchronize()).toMatchObject({
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    });
  });

  it("rejects cleanup observation before identity invalidation", () => {
    const clock = createManualClock(0);
    const scheduler = readyScheduler(clock, [segment(1)], true);
    const player = new AdaptivePcmPlayer(
      scheduler,
      new ManualPcmPlaybackBackend(clock),
    );

    expect(() => player.waitForCleanup()).toThrowError(PcmPlaybackError);
  });

  it("admits bounded volume and only the frozen playback-rate set", () => {
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

  it("defers the latest speed selection to the next complete unit and reuses one stretcher", async () => {
    const clock = createManualClock(0);
    const segments = [segment(1), segment(2)];
    const scheduler = readyScheduler(clock, segments, true);
    const first = synthesize(scheduler, segments[0]!, 8_000);
    const second = synthesize(scheduler, segments[1]!, 8_000);
    const backend = new ManualPcmPlaybackBackend(clock);
    const player = new AdaptivePcmPlayer(scheduler, backend);

    expect(player.synchronize()).toMatchObject({
      activeSequence: 0,
      selectedPlaybackRatePercent: 100,
      activePlaybackRatePercent: 100,
      pendingPlaybackRatePercent: null,
    });
    player.setPlaybackRatePercent(85);
    const selected = player.setPlaybackRatePercent(75);
    expect(selected).toMatchObject({
      activeSequence: 0,
      selectedPlaybackRatePercent: 75,
      activePlaybackRatePercent: 100,
      pendingPlaybackRatePercent: 75,
    });
    expect(first.releaseCount).toBe(0);
    expect(second.releaseCount).toBe(0);
    expect(backend.startedRates).toEqual([1]);

    await Promise.resolve();
    clock.advanceBy(8_000);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      activeSequence: 1,
      selectedPlaybackRatePercent: 75,
      activePlaybackRatePercent: 75,
      pendingPlaybackRatePercent: null,
    });
    expect(backend.startedRates).toEqual([1, 0.75]);
    expect(backend.preparedRates).toEqual([85]);
    expect(first.releaseCount).toBe(1);
    expect(second.releaseCount).toBe(0);

    player.setPlaybackRatePercent(100);
    clock.advanceBy(10_667);
    backend.pump();
    expect(player.synchronize()).toMatchObject({
      state: "complete",
      selectedPlaybackRatePercent: 100,
      activePlaybackRatePercent: 75,
      pendingPlaybackRatePercent: 100,
      retainedAudioUnitCount: 0,
    });
    expect(second.releaseCount).toBe(1);
    expect(backend.releasePreparationCount).toBe(1);
  });
});

describe("Web Audio PCM backend", () => {
  it("requests a rendering clock that matches the fixed narration PCM rate", async () => {
    const context = new FakeAudioContext();
    const audioContextConstructor = vi.fn(function () {
      return context;
    });
    const node = new FakeWsolaNode();
    vi.stubGlobal("AudioContext", audioContextConstructor);

    try {
      const backend = new WebAudioPcmPlaybackBackend(undefined, async () => ({
        node: node as unknown as AudioWorkletNode,
        close: () => {
          node.disconnect();
          node.port.close();
        },
      }));

      await backend.preparePlaybackRate(75);

      expect(audioContextConstructor).toHaveBeenCalledWith({
        sampleRate: 24_000,
      });
      backend.close();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("decodes exact little-endian float32 PCM into one bounded device buffer", async () => {
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

    await Promise.resolve();
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

  it("reuses one admitted WSOLA node and releases it on the default-rate boundary", async () => {
    const context = new FakeAudioContext();
    const node = new FakeWsolaNode();
    let created = 0;
    const backend = new WebAudioPcmPlaybackBackend(
      () => context as unknown as AudioContext,
      async () => {
        created += 1;
        return {
          node: node as unknown as AudioWorkletNode,
          close: () => {
            node.disconnect();
            node.port.close();
          },
        };
      },
    );
    await backend.preparePlaybackRate(75);
    await backend.preparePlaybackRate(85);
    expect(created).toBe(1);
    expect(node.connectCount).toBe(1);
    expect(backend.isPlaybackRatePrepared(75)).toBe(true);

    const payload = new Uint8Array(16);
    const callbacks = { ended: vi.fn(), failed: vi.fn() };
    backend.start(
      {
        sequence: 4,
        payload,
        sampleRateHz: 24_000,
        channelCount: 1,
        sampleFormat: "float32-le",
        sampleCountSamples: 4,
        startSampleFrame: 0,
        volumePercent: 80,
        playbackRate: 0.75,
      },
      callbacks,
    );
    await Promise.resolve();
    expect(node.port.messages).toMatchObject([
      {
        type: "arm",
        ratePercent: 75,
        unitSequence: 4,
      },
      { type: "start", unitSequence: 4 },
    ]);
    node.port.emit({ type: "ended", unitSequence: 4 });
    expect(callbacks.ended).toHaveBeenCalledOnce();

    backend.releasePlaybackRatePreparation();
    expect(node.disconnectCount).toBe(1);
    expect(node.port.closeCount).toBe(1);
    expect(backend.isPlaybackRatePrepared(75)).toBe(false);
    backend.close();
    expect(context.closeCount).toBe(1);
  });
});

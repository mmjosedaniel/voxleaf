import { ADAPTIVE_BUFFER_AUTHORITY_V1 } from "../adaptive-buffer-authority";
import {
  PcmPlaybackError,
  type PcmPlaybackBackend,
  type PcmPlaybackCallbacks,
  type PcmPlaybackHandle,
  type PcmPlaybackRequest,
} from "../pcm-playback-contracts";
import {
  isNarrationPlaybackRatePercentV3,
  type NarrationPlaybackRatePercentV3,
} from "../reader-settings-playback-authority-v3";
import {
  createIncrementalWsolaV3Node,
  type IncrementalWsolaV3Node,
} from "./incremental-wsola-v3";

interface WebAudioPlaybackHandle extends PcmPlaybackHandle {
  readonly playbackRate: number;
  complete(): void;
}

type AudioContextFactory = () => AudioContext;
type IncrementalWsolaV3Factory = (
  context: AudioContext,
) => Promise<IncrementalWsolaV3Node>;

export class WebAudioPcmPlaybackBackend implements PcmPlaybackBackend {
  readonly #createAudioContext: AudioContextFactory;
  readonly #createWsolaNode: IncrementalWsolaV3Factory;
  #context: AudioContext | undefined;
  #gain: GainNode | undefined;
  #active: WebAudioPlaybackHandle | undefined;
  #wsola: IncrementalWsolaV3Node | undefined;
  #wsolaFailed = false;
  #wsolaUnitFailure: (() => void) | undefined;
  #wsolaPreparation: Promise<void> | undefined;
  #wsolaPreparationOwner: number | undefined;
  #wsolaPreparationToken = 0;
  #closeOperation: Promise<void> | undefined;

  public constructor(
    createAudioContext: AudioContextFactory = () =>
      // Protocol PCM and the retained WSOLA window/hop sizes are 24 kHz. A
      // device-default 48 kHz context would consume this output twice as fast.
      new AudioContext({
        sampleRate: ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.sampleRateHz,
      }),
    createWsolaNode: IncrementalWsolaV3Factory = createIncrementalWsolaV3Node,
  ) {
    this.#createAudioContext = createAudioContext;
    this.#createWsolaNode = createWsolaNode;
  }

  public async preparePlaybackRate(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): Promise<void> {
    if (this.#closeOperation !== undefined)
      throw new PcmPlaybackError("invalid-state");
    if (playbackRatePercent !== 100 && this.#wsolaFailed)
      throw new PcmPlaybackError("playback-failure");
    if (playbackRatePercent === 100 || this.#wsola !== undefined) {
      return;
    }
    if (this.#wsolaPreparation !== undefined) {
      const token = this.#wsolaPreparationToken;
      if (this.#wsolaPreparationOwner === token) return this.#wsolaPreparation;
      // A released creation still owns cleanup. Join it before admitting the
      // current request, without adopting its obsolete success or failure.
      await this.#wsolaPreparation.catch(() => undefined);
      if (
        token !== this.#wsolaPreparationToken ||
        this.#closeOperation !== undefined
      )
        return;
      return this.preparePlaybackRate(playbackRatePercent);
    }
    const context = this.#ensureAudioGraph();
    const token = this.#wsolaPreparationToken;
    const preparation = this.#createWsolaNode(context).then((created) => {
      if (token !== this.#wsolaPreparationToken || this.#context !== context) {
        created.close();
        return;
      }
      this.#wsola = created;
      created.node.onprocessorerror = () => {
        if (this.#wsola !== created || this.#wsolaFailed) return;
        this.#wsolaFailed = true;
        const failUnit = this.#wsolaUnitFailure;
        this.#wsolaUnitFailure = undefined;
        this.#disposeWsola();
        failUnit?.();
      };
      created.node.connect(this.#gain!);
    });
    this.#wsolaPreparation = preparation;
    this.#wsolaPreparationOwner = token;
    try {
      await preparation;
    } finally {
      if (this.#wsolaPreparation === preparation) {
        this.#wsolaPreparation = undefined;
        this.#wsolaPreparationOwner = undefined;
      }
    }
  }

  public isPlaybackRatePrepared(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): boolean {
    return (
      playbackRatePercent === 100 ||
      (this.#wsola !== undefined && !this.#wsolaFailed)
    );
  }

  public releasePlaybackRatePreparation(): void {
    if (this.#active !== undefined && this.#active.playbackRate !== 1) {
      return;
    }
    this.#wsolaPreparationToken += 1;
    this.#disposeWsola();
    this.#wsola = undefined;
    this.#wsolaFailed = false;
  }

  public playbackRatePreparationFailed(): boolean {
    return this.#wsolaFailed;
  }

  #disposeWsola(): void {
    if (this.#wsola === undefined) return;
    this.#wsola.node.onprocessorerror = null;
    this.#wsola.node.port.onmessage = null;
    this.#wsola.close();
  }

  public start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    if (this.#active !== undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    const playbackRatePercent = Math.round(request.playbackRate * 100);
    if (
      playbackRatePercent / 100 !== request.playbackRate ||
      !isNarrationPlaybackRatePercentV3(playbackRatePercent)
    ) {
      throw new PcmPlaybackError("unsupported-rate");
    }
    return playbackRatePercent === 100
      ? this.#startDirect(request, callbacks)
      : this.#startWsola(request, callbacks, playbackRatePercent);
  }

  #ensureAudioGraph(): AudioContext {
    if (this.#closeOperation !== undefined)
      throw new PcmPlaybackError("invalid-state");
    const context = this.#context ?? this.#createAudioContext();
    this.#context = context;
    const gain = this.#gain ?? context.createGain();
    if (this.#gain === undefined) {
      gain.connect(context.destination);
      this.#gain = gain;
    }
    return context;
  }

  #readRemainingPcm(request: PcmPlaybackRequest): Float32Array {
    const remaining = request.sampleCountSamples - request.startSampleFrame;
    if (remaining <= 0) {
      throw new PcmPlaybackError("invalid-state");
    }
    const input = new Float32Array(remaining);
    const data = new DataView(
      request.payload.buffer,
      request.payload.byteOffset,
      request.payload.byteLength,
    );
    for (let index = 0; index < remaining; index += 1) {
      const value = data.getFloat32(
        (request.startSampleFrame + index) *
          ADAPTIVE_BUFFER_AUTHORITY_V1.audioFormat.bytesPerSample,
        true,
      );
      if (!Number.isFinite(value)) {
        throw new PcmPlaybackError("playback-failure");
      }
      input[index] = value;
    }
    return input;
  }

  #startDirect(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle {
    this.releasePlaybackRatePreparation();
    const context = this.#ensureAudioGraph();
    const gain = this.#gain!;
    gain.gain.value = request.volumePercent / 100;

    const input = this.#readRemainingPcm(request);
    const remaining = input.length;
    const audioBuffer = context.createBuffer(
      request.channelCount,
      remaining,
      request.sampleRateHz,
    );
    const channel = audioBuffer.getChannelData(0);
    channel.set(input);

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = request.playbackRate;
    source.connect(gain);
    let activatedAt = context.currentTime;
    let activation = 0;
    let resumed = false;
    let sourceStarted = false;
    let sourceStartedAt = 0;
    let playedFrames = 0;
    let stopped = false;
    const readFrames = () =>
      Math.min(
        remaining,
        // A started buffer source follows the context clock, including the
        // interval before suspend settles and before resume's reply arrives.
        // The clock itself freezes while suspended; never reanchor this source.
        sourceStarted && !stopped
          ? Math.max(
              0,
              Math.floor(
                (context.currentTime - sourceStartedAt) * request.sampleRateHz,
              ),
            )
          : playedFrames,
      );
    const resume = () => {
      const token = activation;
      void context
        .resume()
        .then(() => {
          if (stopped || this.#active !== handle || token !== activation)
            return;
          activatedAt = context.currentTime;
          resumed = true;
          if (!sourceStarted) {
            sourceStartedAt = context.currentTime;
            source.start();
            sourceStarted = true;
          }
        })
        .catch(() => {
          if (!stopped && this.#active === handle && token === activation)
            callbacks.failed();
        });
    };
    const handle: WebAudioPlaybackHandle = {
      sequence: request.sequence,
      playbackRate: 1,
      get rendering() {
        return !stopped && resumed && context.currentTime > activatedAt;
      },
      get playedSampleFrames() {
        return readFrames();
      },
      pause: () => {
        playedFrames = readFrames();
        resumed = false;
        const token = ++activation;
        void context.suspend().catch(() => {
          if (!stopped && this.#active === handle && token === activation)
            callbacks.failed();
        });
      },
      resume() {
        activation += 1;
        resumed = false;
        resume();
      },
      stop: () => {
        if (!stopped) {
          playedFrames = readFrames();
          resumed = false;
          stopped = true;
          activation += 1;
          source.onended = null;
          if (sourceStarted) source.stop();
          source.disconnect();
          source.buffer = null;
          if (this.#active === handle) this.#active = undefined;
        }
      },
      setVolumePercent(volumePercent) {
        gain.gain.value = volumePercent / 100;
      },
      complete() {
        playedFrames = remaining;
        resumed = false;
        stopped = true;
        source.onended = null;
        source.disconnect();
        source.buffer = null;
      },
    };
    source.onended = () => {
      if (!stopped && this.#active === handle) {
        handle.complete();
        this.#active = undefined;
        callbacks.ended();
      }
    };
    this.#active = handle;
    resume();
    return handle;
  }

  #startWsola(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): PcmPlaybackHandle {
    const context = this.#ensureAudioGraph();
    const gain = this.#gain!;
    const wsola = this.#wsola;
    if (this.#wsolaFailed) throw new PcmPlaybackError("playback-failure");
    if (wsola === undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    gain.gain.value = request.volumePercent / 100;
    const input = this.#readRemainingPcm(request);
    const remaining = input.length;
    let activatedAt = 0;
    let activation = 0;
    let resumed = false;
    let processing = false;
    let playedFrames = 0;
    let stopped = false;
    const readFrames = () =>
      Math.min(
        remaining,
        playedFrames +
          (processing && resumed
            ? Math.max(
                0,
                Math.floor(
                  (context.currentTime - activatedAt) *
                    request.sampleRateHz *
                    request.playbackRate,
                ),
              )
            : 0),
      );
    const resumeContext = () => {
      const token = activation;
      void context
        .resume()
        .then(() => {
          if (!stopped && this.#active === handle && token === activation)
            resumed = true;
        })
        .catch(() => {
          if (!stopped && this.#active === handle && token === activation)
            callbacks.failed();
        });
    };
    const handle: WebAudioPlaybackHandle = {
      sequence: request.sequence,
      playbackRate: request.playbackRate,
      get rendering() {
        return !stopped && processing && resumed;
      },
      get playedSampleFrames() {
        return readFrames();
      },
      pause: () => {
        playedFrames = readFrames();
        processing = false;
        resumed = false;
        const token = ++activation;
        wsola.node.port.postMessage({
          type: "pause",
          unitSequence: request.sequence,
          activation,
        });
        void context.suspend().catch(() => {
          if (!stopped && this.#active === handle && token === activation)
            callbacks.failed();
        });
      },
      resume: () => {
        activation += 1;
        processing = false;
        resumed = false;
        wsola.node.port.postMessage({
          type: "resume",
          unitSequence: request.sequence,
          activation,
        });
        resumeContext();
      },
      stop: () => {
        if (!stopped) {
          stopped = true;
          activation += 1;
          wsola.node.port.onmessage = null;
          wsola.node.port.postMessage({
            type: "stop",
            unitSequence: request.sequence,
          });
          if (this.#active === handle) {
            this.#active = undefined;
            this.#wsolaUnitFailure = undefined;
          }
        }
      },
      setVolumePercent: (volumePercent) => {
        gain.gain.value = volumePercent / 100;
      },
      complete: () => {
        playedFrames = remaining;
        processing = false;
        stopped = true;
      },
    };
    wsola.node.port.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (typeof message !== "object" || message === null) {
        return;
      }
      const type = Reflect.get(message, "type");
      const unitSequence = Reflect.get(message, "unitSequence");
      if (
        (type === "started" || type === "resumed" || type === "paused") &&
        unitSequence === request.sequence &&
        !stopped &&
        this.#active === handle &&
        Reflect.get(message, "activation") === activation
      ) {
        const sourceFrames: unknown = Reflect.get(message, "sourceFrames");
        const currentFrame: unknown = Reflect.get(message, "currentFrame");
        if (
          typeof sourceFrames !== "number" ||
          !Number.isSafeInteger(sourceFrames) ||
          sourceFrames < 0 ||
          sourceFrames > remaining
        )
          return;
        if (
          type !== "paused" &&
          (typeof currentFrame !== "number" ||
            !Number.isSafeInteger(currentFrame) ||
            currentFrame < 0)
        )
          return;
        playedFrames = sourceFrames;
        processing = type !== "paused";
        if (processing)
          activatedAt = (currentFrame as number) / request.sampleRateHz;
        return;
      }
      if (type === "failed") {
        if (
          unitSequence === request.sequence &&
          !stopped &&
          this.#active === handle
        ) {
          handle.stop();
          callbacks.failed();
        }
        return;
      }
      if (
        type === "ended" &&
        unitSequence === request.sequence &&
        !stopped &&
        this.#active === handle
      ) {
        handle.complete();
        wsola.node.port.onmessage = null;
        this.#active = undefined;
        this.#wsolaUnitFailure = undefined;
        callbacks.ended();
      }
    };
    this.#active = handle;
    this.#wsolaUnitFailure = () => {
      if (stopped || this.#active !== handle) return;
      handle.stop();
      callbacks.failed();
    };
    wsola.node.port.postMessage(
      {
        type: "arm",
        input,
        ratePercent: playbackRatePercent,
        unitSequence: request.sequence,
      },
      [input.buffer],
    );
    wsola.node.port.postMessage({
      type: "start",
      unitSequence: request.sequence,
      activation,
    });
    resumeContext();
    return handle;
  }

  public close(): Promise<void> {
    if (this.#closeOperation !== undefined) return this.#closeOperation;
    this.#active?.stop();
    this.#active = undefined;
    const context = this.#context;
    this.#context = undefined;
    this.#gain?.disconnect();
    this.#gain = undefined;
    this.#wsolaPreparationToken += 1;
    const preparation = this.#wsolaPreparation;
    this.#disposeWsola();
    this.#wsola = undefined;
    this.#closeOperation = Promise.all([
      context?.close(),
      // A cancelled addModule may reject when its context closes. Either
      // settlement has released the pending node; context close must succeed.
      preparation?.catch(() => undefined),
    ]).then(() => undefined);
    return this.#closeOperation;
  }
}

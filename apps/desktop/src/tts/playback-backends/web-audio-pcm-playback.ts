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
  #wsolaPreparation: Promise<void> | undefined;
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
    if (playbackRatePercent === 100 || this.#wsola !== undefined) {
      return;
    }
    if (this.#wsolaPreparation !== undefined) {
      return this.#wsolaPreparation;
    }
    const context = this.#ensureAudioGraph();
    const token = this.#wsolaPreparationToken;
    const preparation = this.#createWsolaNode(context).then((created) => {
      if (token !== this.#wsolaPreparationToken || this.#context !== context) {
        created.close();
        return;
      }
      created.node.connect(this.#gain!);
      this.#wsola = created;
    });
    this.#wsolaPreparation = preparation;
    try {
      await preparation;
    } finally {
      if (this.#wsolaPreparation === preparation) {
        this.#wsolaPreparation = undefined;
      }
    }
  }

  public isPlaybackRatePrepared(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): boolean {
    return playbackRatePercent === 100 || this.#wsola !== undefined;
  }

  public releasePlaybackRatePreparation(): void {
    if (this.#active !== undefined && this.#active.playbackRate !== 1) {
      return;
    }
    this.#wsolaPreparationToken += 1;
    this.#wsola?.close();
    this.#wsola = undefined;
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
    const startedAt = context.currentTime;
    let stopped = false;
    const handle: WebAudioPlaybackHandle = {
      sequence: request.sequence,
      playbackRate: 1,
      get playedSampleFrames() {
        if (stopped) {
          return remaining;
        }
        return Math.min(
          remaining,
          Math.floor((context.currentTime - startedAt) * request.sampleRateHz),
        );
      },
      pause() {
        void context.suspend().catch(callbacks.failed);
      },
      resume() {
        void context.resume().catch(callbacks.failed);
      },
      stop() {
        if (!stopped) {
          stopped = true;
          source.onended = null;
          source.stop();
          source.disconnect();
          source.buffer = null;
        }
      },
      setVolumePercent(volumePercent) {
        gain.gain.value = volumePercent / 100;
      },
      complete() {
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
    void context.resume().catch(callbacks.failed);
    source.start();
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
    if (wsola === undefined) {
      throw new PcmPlaybackError("invalid-state");
    }
    gain.gain.value = request.volumePercent / 100;
    const input = this.#readRemainingPcm(request);
    const remaining = input.length;
    const startedAt = context.currentTime;
    let stopped = false;
    const handle: WebAudioPlaybackHandle = {
      sequence: request.sequence,
      playbackRate: request.playbackRate,
      get playedSampleFrames() {
        if (stopped) {
          return remaining;
        }
        return Math.min(
          remaining,
          Math.floor(
            (context.currentTime - startedAt) *
              request.sampleRateHz *
              request.playbackRate,
          ),
        );
      },
      pause: () => {
        wsola.node.port.postMessage({
          type: "pause",
          unitSequence: request.sequence,
        });
        void context.suspend().catch(callbacks.failed);
      },
      resume: () => {
        wsola.node.port.postMessage({
          type: "resume",
          unitSequence: request.sequence,
        });
        void context.resume().catch(callbacks.failed);
      },
      stop: () => {
        if (!stopped) {
          stopped = true;
          wsola.node.port.onmessage = null;
          wsola.node.port.postMessage({
            type: "stop",
            unitSequence: request.sequence,
          });
          if (this.#active === handle) {
            this.#active = undefined;
          }
        }
      },
      setVolumePercent: (volumePercent) => {
        gain.gain.value = volumePercent / 100;
      },
      complete: () => {
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
      if (type === "failed") {
        if (!stopped && this.#active === handle) {
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
        callbacks.ended();
      }
    };
    this.#active = handle;
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
    });
    void context.resume().catch(callbacks.failed);
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
    this.#wsola?.close();
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

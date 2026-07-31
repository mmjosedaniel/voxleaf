const PROCESSOR_NAME = "voxleaf-incremental-wsola-v2";
const FRAME_SIZE = 768;
const SYNTHESIS_HOP = 192;
const SEARCH_RADIUS = 128;
const CORRELATION_STRIDE = 8;
const RING_SIZE = 4_096;

interface LoadMessage {
  readonly type: "load";
  readonly input: Float32Array;
  readonly ratePercent: number;
}

interface RateMessage {
  readonly type: "rate";
  readonly ratePercent: number;
}

interface PauseMessage {
  readonly type: "pause" | "resume" | "stop";
}

type WorkletMessage = LoadMessage | RateMessage | PauseMessage;

interface AudioWorkletPort {
  onmessage: ((event: MessageEvent<WorkletMessage>) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
}

declare const currentFrame: number;

declare class AudioWorkletProcessor {
  public readonly port: AudioWorkletPort;
}

declare function registerProcessor(
  name: string,
  constructor: new () => AudioWorkletProcessor,
): void;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

class IncrementalWsolaProcessorV2 extends AudioWorkletProcessor {
  readonly #accumulator = new Float32Array(RING_SIZE);
  readonly #weights = new Float32Array(RING_SIZE);
  readonly #window = new Float32Array(FRAME_SIZE);

  #analysisPosition = 0;
  #ended = true;
  #input: Float32Array<ArrayBufferLike> = new Float32Array();
  #nextSynthesisPosition = 0;
  #paused = false;
  #ratePercent = 100;
  #renderedFrames = 0;
  #stopped = false;
  #targetFrames = 0;

  public constructor() {
    super();
    for (let index = 0; index < FRAME_SIZE; index += 1) {
      this.#window[index] =
        0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (FRAME_SIZE - 1));
    }
    this.port.onmessage = (event) => {
      this.#handleMessage(event.data);
    };
  }

  #handleMessage(message: WorkletMessage): void {
    if (message.type === "load") {
      if (
        !(message.input instanceof Float32Array) ||
        !this.#validRate(message.ratePercent) ||
        message.input.length === 0
      ) {
        this.port.postMessage({ type: "failed" });
        return;
      }
      this.#input = message.input;
      this.#ratePercent = message.ratePercent;
      this.#targetFrames = Math.ceil(
        (message.input.length * 100) / message.ratePercent,
      );
      this.#analysisPosition = 0;
      this.#nextSynthesisPosition = 0;
      this.#renderedFrames = 0;
      this.#accumulator.fill(0);
      this.#weights.fill(0);
      this.#paused = false;
      this.#stopped = false;
      this.#ended = false;
      this.port.postMessage({
        type: "ready",
        additionalWorkBytes:
          this.#input.byteLength +
          this.#accumulator.byteLength +
          this.#weights.byteLength +
          this.#window.byteLength,
        targetFrames: this.#targetFrames,
      });
      return;
    }
    if (message.type === "rate") {
      if (!this.#validRate(message.ratePercent)) {
        this.port.postMessage({ type: "failed" });
        return;
      }
      this.#ratePercent = message.ratePercent;
      this.port.postMessage({
        type: "rate-settled",
        sourceFrames: this.#sourceFrames(),
      });
      return;
    }
    if (message.type === "pause") {
      this.#paused = true;
      this.port.postMessage({
        type: "paused",
        sourceFrames: this.#sourceFrames(),
      });
      return;
    }
    if (message.type === "resume") {
      this.#paused = false;
      this.port.postMessage({
        type: "resumed",
        sourceFrames: this.#sourceFrames(),
      });
      return;
    }
    this.#stopped = true;
    this.#ended = true;
    this.#input = new Float32Array();
    this.#accumulator.fill(0);
    this.#weights.fill(0);
    this.port.postMessage({
      type: "stopped",
      sourceFrames: this.#sourceFrames(),
    });
  }

  #validRate(ratePercent: number): boolean {
    return (
      Number.isInteger(ratePercent) && ratePercent >= 75 && ratePercent <= 100
    );
  }

  #sourceFrames(): number {
    return Math.min(
      this.#input.length,
      Math.floor((this.#renderedFrames * this.#ratePercent) / 100),
    );
  }

  #correlation(previousPosition: number, candidatePosition: number): number {
    const overlap = FRAME_SIZE - SYNTHESIS_HOP;
    const comparisonPosition = previousPosition + SYNTHESIS_HOP;
    let numerator = 0;
    let previousEnergy = 0;
    let candidateEnergy = 0;
    for (let index = 0; index < overlap; index += CORRELATION_STRIDE) {
      const previous = this.#input[comparisonPosition + index] ?? 0;
      const candidate = this.#input[candidatePosition + index] ?? 0;
      numerator += previous * candidate;
      previousEnergy += previous * previous;
      candidateEnergy += candidate * candidate;
    }
    const denominator = Math.sqrt(previousEnergy * candidateEnergy);
    return denominator <= Number.EPSILON ? -1 : numerator / denominator;
  }

  #chooseAnalysisPosition(expectedPosition: number): number {
    const maximumPosition = Math.max(0, this.#input.length - FRAME_SIZE);
    const first = clamp(
      Math.round(expectedPosition) - SEARCH_RADIUS,
      0,
      maximumPosition,
    );
    const last = clamp(
      Math.round(expectedPosition) + SEARCH_RADIUS,
      0,
      maximumPosition,
    );
    let bestPosition = first;
    let bestCorrelation = Number.NEGATIVE_INFINITY;
    for (let position = first; position <= last; position += 1) {
      const score = this.#correlation(this.#analysisPosition, position);
      if (score > bestCorrelation) {
        bestCorrelation = score;
        bestPosition = position;
      }
    }
    return bestPosition;
  }

  #synthesizeFrame(): void {
    if (this.#nextSynthesisPosition > 0) {
      const analysisHop = (SYNTHESIS_HOP * this.#ratePercent) / 100;
      this.#analysisPosition = this.#chooseAnalysisPosition(
        this.#analysisPosition + analysisHop,
      );
    }
    for (
      let index = 0;
      index < FRAME_SIZE &&
      this.#nextSynthesisPosition + index < this.#targetFrames;
      index += 1
    ) {
      const sourceIndex = this.#analysisPosition + index;
      const ringIndex = (this.#nextSynthesisPosition + index) % RING_SIZE;
      const weight = this.#window[index]!;
      this.#accumulator[ringIndex] =
        (this.#accumulator[ringIndex] ?? 0) +
        (this.#input[sourceIndex] ?? 0) * weight;
      this.#weights[ringIndex] = (this.#weights[ringIndex] ?? 0) + weight;
    }
    this.#nextSynthesisPosition += SYNTHESIS_HOP;
  }

  public process(
    _inputs: readonly Float32Array[][],
    outputs: readonly Float32Array[][],
  ): boolean {
    const output = outputs[0]?.[0];
    if (output === undefined) {
      return true;
    }
    output.fill(0);
    if (this.#paused || this.#stopped || this.#ended) {
      return true;
    }

    const requiredPosition = Math.min(
      this.#targetFrames,
      this.#renderedFrames + output.length + FRAME_SIZE,
    );
    while (this.#nextSynthesisPosition < requiredPosition) {
      this.#synthesizeFrame();
    }
    for (
      let index = 0;
      index < output.length && this.#renderedFrames < this.#targetFrames;
      index += 1
    ) {
      const ringIndex = this.#renderedFrames % RING_SIZE;
      const weight = this.#weights[ringIndex]!;
      output[index] =
        weight > Number.EPSILON ? this.#accumulator[ringIndex]! / weight : 0;
      this.#accumulator[ringIndex] = 0;
      this.#weights[ringIndex] = 0;
      this.#renderedFrames += 1;
    }
    if (this.#renderedFrames >= this.#targetFrames) {
      this.#ended = true;
      this.port.postMessage({
        type: "ended",
        currentFrame,
        renderedFrames: this.#renderedFrames,
        sourceFrames: this.#input.length,
      });
    }
    return true;
  }
}

registerProcessor(PROCESSOR_NAME, IncrementalWsolaProcessorV2);

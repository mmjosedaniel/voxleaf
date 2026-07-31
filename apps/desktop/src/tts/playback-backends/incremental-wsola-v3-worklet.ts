const PROCESSOR_NAME = "voxleaf-incremental-wsola-boundary-v3";
const GRAIN_FRAMES = 960;
const OVERLAP_FRAMES = 480;
const SYNTHESIS_HOP_FRAMES = GRAIN_FRAMES - OVERLAP_FRAMES;
const SEARCH_RADIUS_FRAMES = 144;
const CORRELATION_STEP_FRAMES = 4;
const OUTPUT_RING_FRAMES = 4_096;

interface ArmMessage {
  readonly type: "arm";
  readonly input: Float32Array;
  readonly ratePercent: number;
  readonly unitSequence: number;
}

interface UnitMessage {
  readonly type: "start" | "pause" | "resume" | "stop";
}

type WorkletMessage = ArmMessage | UnitMessage;

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

function validRatePercent(value: number): boolean {
  return (
    Number.isInteger(value) &&
    (value === 75 ||
      value === 80 ||
      value === 85 ||
      value === 90 ||
      value === 95)
  );
}

function boundedInteger(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

class IncrementalWsolaProcessorV3 extends AudioWorkletProcessor {
  readonly #outputAccumulator = new Float32Array(OUTPUT_RING_FRAMES);
  readonly #outputWeights = new Float32Array(OUTPUT_RING_FRAMES);
  readonly #fadeIn = new Float32Array(GRAIN_FRAMES);
  readonly #referenceOverlap = new Float32Array(OVERLAP_FRAMES);

  #active = false;
  #analysisFrame = 0;
  #armed = false;
  #ended = true;
  #input: Float32Array<ArrayBufferLike> = new Float32Array();
  #nextOutputFrame = 0;
  #paused = false;
  #ratePercent = 100;
  #renderedFrames = 0;
  #startedReported = false;
  #targetFrames = 0;
  #unitSequence = -1;

  public constructor() {
    super();
    for (let index = 0; index < GRAIN_FRAMES; index += 1) {
      this.#fadeIn[index] =
        0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (GRAIN_FRAMES - 1));
    }
    this.port.onmessage = (event) => {
      this.#handleMessage(event.data);
    };
  }

  #handleMessage(message: WorkletMessage): void {
    if (message.type === "arm") {
      this.#arm(message);
      return;
    }
    if (message.type === "start") {
      if (!this.#armed || this.#active || this.#ended) {
        this.port.postMessage({ type: "failed" });
        return;
      }
      this.#active = true;
      this.#paused = false;
      return;
    }
    if (message.type === "pause") {
      if (!this.#active || this.#ended) {
        this.port.postMessage({ type: "failed" });
        return;
      }
      this.#paused = true;
      this.port.postMessage({
        type: "paused",
        sourceFrames: this.#consumedSourceFrames(),
        unitSequence: this.#unitSequence,
      });
      return;
    }
    if (message.type === "resume") {
      if (!this.#active || this.#ended) {
        this.port.postMessage({ type: "failed" });
        return;
      }
      this.#paused = false;
      this.port.postMessage({
        type: "resumed",
        sourceFrames: this.#consumedSourceFrames(),
        unitSequence: this.#unitSequence,
      });
      return;
    }
    this.#releaseUnit();
    this.port.postMessage({
      type: "stopped",
      sourceFrames: 0,
      unitSequence: this.#unitSequence,
    });
  }

  #arm(message: ArmMessage): void {
    if (
      !(message.input instanceof Float32Array) ||
      message.input.length === 0 ||
      !validRatePercent(message.ratePercent) ||
      !Number.isSafeInteger(message.unitSequence) ||
      message.unitSequence <= this.#unitSequence ||
      (this.#active && !this.#ended)
    ) {
      this.port.postMessage({ type: "failed" });
      return;
    }

    this.#input = message.input;
    this.#ratePercent = message.ratePercent;
    this.#unitSequence = message.unitSequence;
    this.#targetFrames = Math.ceil(
      (message.input.length * 100) / message.ratePercent,
    );
    this.#analysisFrame = 0;
    this.#nextOutputFrame = 0;
    this.#renderedFrames = 0;
    this.#outputAccumulator.fill(0);
    this.#outputWeights.fill(0);
    this.#referenceOverlap.fill(0);
    this.#active = false;
    this.#paused = false;
    this.#ended = false;
    this.#armed = true;
    this.#startedReported = false;

    this.port.postMessage({
      type: "armed",
      additionalWorkBytes:
        this.#input.byteLength +
        this.#outputAccumulator.byteLength +
        this.#outputWeights.byteLength +
        this.#fadeIn.byteLength +
        this.#referenceOverlap.byteLength,
      targetFrames: this.#targetFrames,
      unitSequence: this.#unitSequence,
    });
  }

  #releaseUnit(): void {
    this.#active = false;
    this.#armed = false;
    this.#ended = true;
    this.#paused = false;
    this.#input = new Float32Array();
    this.#outputAccumulator.fill(0);
    this.#outputWeights.fill(0);
    this.#referenceOverlap.fill(0);
  }

  #consumedSourceFrames(): number {
    return Math.min(
      this.#input.length,
      Math.floor((this.#renderedFrames * this.#ratePercent) / 100),
    );
  }

  #correlation(candidateFrame: number): number {
    let cross = 0;
    let referenceEnergy = 0;
    let candidateEnergy = 0;
    for (
      let index = 0;
      index < OVERLAP_FRAMES;
      index += CORRELATION_STEP_FRAMES
    ) {
      const reference = this.#referenceOverlap[index] ?? 0;
      const candidate = this.#input[candidateFrame + index] ?? 0;
      cross += reference * candidate;
      referenceEnergy += reference * reference;
      candidateEnergy += candidate * candidate;
    }
    const scale = Math.sqrt(referenceEnergy * candidateEnergy);
    return scale <= Number.EPSILON ? Number.NEGATIVE_INFINITY : cross / scale;
  }

  #chooseAnalysisFrame(expectedFrame: number): number {
    const maximumStart = Math.max(0, this.#input.length - GRAIN_FRAMES);
    const first = boundedInteger(
      expectedFrame - SEARCH_RADIUS_FRAMES,
      0,
      maximumStart,
    );
    const last = boundedInteger(
      expectedFrame + SEARCH_RADIUS_FRAMES,
      first,
      maximumStart,
    );
    let bestFrame = first;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let frame = first; frame <= last; frame += 1) {
      const score = this.#correlation(frame);
      if (score > bestScore) {
        bestFrame = frame;
        bestScore = score;
      }
    }
    return bestFrame;
  }

  #appendGrain(): void {
    if (this.#nextOutputFrame > 0) {
      const expectedAnalysisFrame =
        this.#analysisFrame + (SYNTHESIS_HOP_FRAMES * this.#ratePercent) / 100;
      this.#analysisFrame = this.#chooseAnalysisFrame(expectedAnalysisFrame);
    }

    for (
      let grainFrame = 0;
      grainFrame < GRAIN_FRAMES &&
      this.#nextOutputFrame + grainFrame < this.#targetFrames;
      grainFrame += 1
    ) {
      const source = this.#input[this.#analysisFrame + grainFrame] ?? 0;
      const outputFrame = this.#nextOutputFrame + grainFrame;
      const ringFrame = outputFrame % OUTPUT_RING_FRAMES;
      const weight = this.#fadeIn[grainFrame] ?? 0;
      this.#outputAccumulator[ringFrame] =
        (this.#outputAccumulator[ringFrame] ?? 0) + source * weight;
      this.#outputWeights[ringFrame] =
        (this.#outputWeights[ringFrame] ?? 0) + weight;
    }

    for (let index = 0; index < OVERLAP_FRAMES; index += 1) {
      this.#referenceOverlap[index] =
        this.#input[this.#analysisFrame + SYNTHESIS_HOP_FRAMES + index] ?? 0;
    }
    this.#nextOutputFrame += SYNTHESIS_HOP_FRAMES;
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
    if (!this.#active || this.#paused || this.#ended) {
      return true;
    }

    if (!this.#startedReported) {
      this.#startedReported = true;
      this.port.postMessage({
        type: "started",
        currentFrame,
        unitSequence: this.#unitSequence,
      });
    }

    const requiredFrame = Math.min(
      this.#targetFrames,
      this.#renderedFrames + output.length + GRAIN_FRAMES,
    );
    while (this.#nextOutputFrame < requiredFrame) {
      this.#appendGrain();
    }

    for (
      let index = 0;
      index < output.length && this.#renderedFrames < this.#targetFrames;
      index += 1
    ) {
      const ringFrame = this.#renderedFrames % OUTPUT_RING_FRAMES;
      const weight = this.#outputWeights[ringFrame] ?? 0;
      output[index] =
        weight > Number.EPSILON
          ? (this.#outputAccumulator[ringFrame] ?? 0) / weight
          : 0;
      this.#outputAccumulator[ringFrame] = 0;
      this.#outputWeights[ringFrame] = 0;
      this.#renderedFrames += 1;
    }

    if (this.#renderedFrames >= this.#targetFrames) {
      const completedSourceFrames = this.#input.length;
      const completedRenderedFrames = this.#renderedFrames;
      const completedSequence = this.#unitSequence;
      this.#releaseUnit();
      this.port.postMessage({
        type: "ended",
        currentFrame,
        renderedFrames: completedRenderedFrames,
        sourceFrames: completedSourceFrames,
        unitSequence: completedSequence,
      });
    }
    return true;
  }
}

registerProcessor(PROCESSOR_NAME, IncrementalWsolaProcessorV3);

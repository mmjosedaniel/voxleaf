import { invoke } from "@tauri-apps/api/core";
import {
  decodeNarrationSegmentV1,
  decodeTtsProtocolControlV1,
  type NarrationSegmentV1,
  type TtsProtocolControlV1,
  type TtsServiceStateV1,
} from "@voxleaf/shared";

const MAX_AUDIO_PAYLOAD_BYTES = 1_920_000;
const MAX_AUDIO_SAMPLE_COUNT = 480_000;
const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT;
const SAMPLE_RATE_HZ = 24_000;

export type TtsProcessClientErrorCode =
  | "tts-service-busy"
  | "tts-service-cancelled"
  | "tts-service-internal-failure"
  | "tts-service-invalid-input"
  | "tts-service-invalid-response"
  | "tts-service-invalid-state"
  | "tts-service-protocol-rejected"
  | "tts-service-resource-limit"
  | "tts-service-timeout"
  | "tts-service-unavailable";

const NATIVE_ERROR_CODES = new Set<TtsProcessClientErrorCode>([
  "tts-service-busy",
  "tts-service-cancelled",
  "tts-service-internal-failure",
  "tts-service-invalid-input",
  "tts-service-invalid-state",
  "tts-service-protocol-rejected",
  "tts-service-resource-limit",
  "tts-service-timeout",
  "tts-service-unavailable",
]);

export class TtsProcessClientError extends Error {
  public readonly code: TtsProcessClientErrorCode;

  public constructor(code: TtsProcessClientErrorCode) {
    super("The local speech service operation failed.");
    this.name = "TtsProcessClientError";
    this.code = code;
  }
}

export interface TtsAudioUnitMetadata {
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
  readonly sampleRateHz: 24_000;
  readonly channelCount: 1;
  readonly sampleFormat: "float32-le";
  readonly sampleCountSamples: number;
  readonly payloadBytes: number;
  readonly endOfSegment: true;
}

export interface TtsAudioUnit {
  readonly metadata: TtsAudioUnitMetadata;
  readonly payload: Uint8Array;
  release(): void;
}

export interface TtsProcessClientObservation {
  readonly serviceInstanceId: string | undefined;
  readonly state: TtsServiceStateV1;
  readonly hasActiveGeneration: boolean;
  readonly retainedAudioUnits: 0 | 1;
}

export type TtsExactDemoAvailability = "available" | "unavailable";

export interface TtsGenerationScope {
  readonly sessionId: string;
  readonly generationId: string;
  readonly segmentId: string;
}

type InvokePort = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

class OneUnitAudioSink {
  private unit: TtsAudioUnit | undefined;

  public get retainedCount(): 0 | 1 {
    return this.unit === undefined ? 0 : 1;
  }

  public accept(metadata: TtsAudioUnitMetadata, payload: Uint8Array): void {
    if (this.unit !== undefined) {
      zero(payload);
      throw new TtsProcessClientError("tts-service-busy");
    }
    let retained = payload;
    this.unit = Object.freeze({
      metadata,
      get payload() {
        return retained;
      },
      release: () => {
        zero(retained);
        retained = new Uint8Array();
        if (this.unit?.metadata === metadata) {
          this.unit = undefined;
        }
      },
    });
  }

  public take(): TtsAudioUnit | undefined {
    const unit = this.unit;
    this.unit = undefined;
    return unit;
  }

  public release(): void {
    const unit = this.unit;
    this.unit = undefined;
    unit?.release();
  }
}

function zero(payload: Uint8Array): void {
  payload.fill(0);
}

function fixedFailure(error: unknown): TtsProcessClientError {
  if (
    typeof error === "string" &&
    NATIVE_ERROR_CODES.has(error as TtsProcessClientErrorCode)
  ) {
    return new TtsProcessClientError(error as TtsProcessClientErrorCode);
  }
  return new TtsProcessClientError("tts-service-unavailable");
}

function decodeControls(input: unknown): readonly TtsProtocolControlV1[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 4) {
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
  try {
    return Object.freeze(
      input.map((value) => decodeTtsProtocolControlV1(value)),
    );
  } catch {
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
}

function expectKinds(
  controls: readonly TtsProtocolControlV1[],
  kinds: readonly TtsProtocolControlV1["kind"][],
): void {
  if (
    controls.length !== kinds.length ||
    controls.some((control, index) => control.kind !== kinds[index])
  ) {
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
}

function sameScope(
  left: TtsGenerationScope,
  right: TtsGenerationScope,
): boolean {
  return (
    left.sessionId === right.sessionId &&
    left.generationId === right.generationId &&
    left.segmentId === right.segmentId
  );
}

function scopeFrom(segment: NarrationSegmentV1): TtsGenerationScope {
  return Object.freeze({
    sessionId: segment.sessionId,
    generationId: segment.generationId,
    segmentId: segment.segmentId,
  });
}

function binaryView(response: unknown): Uint8Array {
  if (response instanceof ArrayBuffer) {
    return new Uint8Array(response);
  }
  if (response instanceof Uint8Array) {
    return response;
  }
  throw new TtsProcessClientError("tts-service-invalid-response");
}

function validateAudio(
  response: unknown,
  scope: TtsGenerationScope,
): {
  readonly metadata: TtsAudioUnitMetadata;
  readonly payload: Uint8Array;
} {
  const payload = binaryView(response);
  if (
    payload.byteLength < BYTES_PER_SAMPLE ||
    payload.byteLength > MAX_AUDIO_PAYLOAD_BYTES ||
    payload.byteLength % BYTES_PER_SAMPLE !== 0
  ) {
    zero(payload);
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
  const sampleCountSamples = payload.byteLength / BYTES_PER_SAMPLE;
  if (sampleCountSamples > MAX_AUDIO_SAMPLE_COUNT) {
    zero(payload);
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength,
  );
  for (
    let offset = 0;
    offset < payload.byteLength;
    offset += BYTES_PER_SAMPLE
  ) {
    if (!Number.isFinite(view.getFloat32(offset, true))) {
      zero(payload);
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
  }
  return Object.freeze({
    metadata: Object.freeze({
      ...scope,
      sampleRateHz: SAMPLE_RATE_HZ,
      channelCount: 1,
      sampleFormat: "float32-le",
      sampleCountSamples,
      payloadBytes: payload.byteLength,
      endOfSegment: true,
    }),
    payload,
  });
}

export class TtsProcessClient {
  private readonly invokePort: InvokePort;
  private readonly sink = new OneUnitAudioSink();
  private serviceInstanceId: string | undefined;
  private state: TtsServiceStateV1 = "stopped";
  private active: TtsGenerationScope | undefined;
  private invalidation = 0;

  public constructor(invokePort: InvokePort = invoke) {
    this.invokePort = invokePort;
  }

  public observe(): TtsProcessClientObservation {
    return Object.freeze({
      serviceInstanceId: this.serviceInstanceId,
      state: this.state,
      hasActiveGeneration: this.active !== undefined,
      retainedAudioUnits: this.sink.retainedCount,
    });
  }

  /**
   * Returns only whether the native owner selected the exact reviewed
   * development child. Runtime and model paths remain native-private.
   */
  public async exactDemoAvailability(): Promise<TtsExactDemoAvailability> {
    try {
      return (await this.invokePort<boolean>("exact_tts_demo_available")) ===
        true
        ? "available"
        : "unavailable";
    } catch {
      return "unavailable";
    }
  }

  public async start(): Promise<TtsProcessClientObservation> {
    if (!["stopped", "failed"].includes(this.state)) {
      throw new TtsProcessClientError("tts-service-invalid-state");
    }
    const controls = await this.invokeControls("start_tts_service");
    expectKinds(controls, [
      "state",
      "handshakeAccepted",
      "state",
      "capabilities",
    ]);
    const accepted = controls[1]!;
    const handshaking = controls[0]!;
    const unloaded = controls[2]!;
    if (
      handshaking.kind !== "state" ||
      handshaking.state !== "handshaking" ||
      accepted.kind !== "handshakeAccepted" ||
      unloaded.kind !== "state" ||
      unloaded.state !== "unloaded" ||
      controls.some(
        (control) =>
          "serviceInstanceId" in control &&
          control.serviceInstanceId !== accepted.serviceInstanceId,
      )
    ) {
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
    this.serviceInstanceId = accepted.serviceInstanceId;
    this.state = "unloaded";
    return this.observe();
  }

  public async prepare(): Promise<TtsProcessClientObservation> {
    if (this.state !== "unloaded") {
      throw new TtsProcessClientError("tts-service-invalid-state");
    }
    const controls = await this.invokeControls("prepare_tts_service");
    expectKinds(controls, ["state", "state", "state", "capabilities"]);
    const loading = controls[0]!;
    const warming = controls[1]!;
    const ready = controls[2]!;
    if (
      loading.kind !== "state" ||
      loading.state !== "loading" ||
      warming.kind !== "state" ||
      warming.state !== "warming" ||
      ready.kind !== "state" ||
      ready.state !== "ready" ||
      controls.some(
        (control) =>
          "serviceInstanceId" in control &&
          control.serviceInstanceId !== this.serviceInstanceId,
      )
    ) {
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
    this.state = "ready";
    return this.observe();
  }

  public async health(): Promise<TtsProcessClientObservation> {
    if (this.serviceInstanceId === undefined) {
      throw new TtsProcessClientError("tts-service-invalid-state");
    }
    const controls = await this.invokeControls("health_tts_service");
    expectKinds(controls, ["state", "capabilities"]);
    const state = controls[0]!;
    if (
      state.kind !== "state" ||
      state.serviceInstanceId !== this.serviceInstanceId ||
      controls.some(
        (control) =>
          "serviceInstanceId" in control &&
          control.serviceInstanceId !== this.serviceInstanceId,
      )
    ) {
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
    this.state = state.state;
    return this.observe();
  }

  public async synthesize(input: unknown): Promise<TtsAudioUnitMetadata> {
    if (this.state !== "ready" || this.active !== undefined) {
      throw new TtsProcessClientError("tts-service-busy");
    }
    if (this.sink.retainedCount !== 0) {
      throw new TtsProcessClientError("tts-service-busy");
    }
    let segment: NarrationSegmentV1;
    try {
      segment = decodeNarrationSegmentV1(input);
    } catch {
      throw new TtsProcessClientError("tts-service-invalid-input");
    }
    const scope = scopeFrom(segment);
    const token = this.invalidation;
    this.active = scope;
    this.state = "generating";
    let response: unknown;
    try {
      response = await this.invokePort<unknown>("synthesize_tts_segment", {
        segment,
      });
    } catch (error) {
      if (
        token !== this.invalidation ||
        this.active === undefined ||
        !sameScope(this.active, scope)
      ) {
        throw new TtsProcessClientError("tts-service-cancelled");
      }
      this.active = undefined;
      this.state = "failed";
      throw fixedFailure(error);
    }
    if (
      token !== this.invalidation ||
      this.active === undefined ||
      !sameScope(this.active, scope)
    ) {
      if (response instanceof ArrayBuffer || response instanceof Uint8Array) {
        zero(binaryView(response));
      }
      throw new TtsProcessClientError("tts-service-cancelled");
    }
    const unit = validateAudio(response, scope);
    this.active = undefined;
    this.state = "ready";
    this.sink.accept(unit.metadata, unit.payload);
    return unit.metadata;
  }

  public takeAudioUnit(): TtsAudioUnit | undefined {
    return this.sink.take();
  }

  public async cancel(scope: TtsGenerationScope): Promise<void> {
    if (this.active === undefined || !sameScope(this.active, scope)) {
      throw new TtsProcessClientError("tts-service-invalid-state");
    }
    this.invalidation += 1;
    this.active = undefined;
    this.sink.release();
    this.state = "cancelling";
    const controls = await this.invokeControls("cancel_tts_generation", {
      scope,
    });
    expectKinds(controls, ["state", "cancelled", "state"]);
    const cancelling = controls[0]!;
    const cancelled = controls[1]!;
    const stopped = controls[2]!;
    if (
      cancelling.kind !== "state" ||
      cancelling.state !== "cancelling" ||
      cancelled.kind !== "cancelled" ||
      cancelled.workIdentity.sessionId !== scope.sessionId ||
      cancelled.workIdentity.generationId !== scope.generationId ||
      cancelled.workIdentity.segmentId !== scope.segmentId ||
      stopped.kind !== "state" ||
      stopped.state !== "stopped" ||
      controls.some(
        (control) =>
          "serviceInstanceId" in control &&
          control.serviceInstanceId !== this.serviceInstanceId,
      )
    ) {
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
    this.state = "stopped";
    this.serviceInstanceId = undefined;
  }

  public async shutdown(): Promise<void> {
    this.invalidation += 1;
    this.active = undefined;
    this.sink.release();
    if (this.serviceInstanceId === undefined || this.state === "stopped") {
      this.state = "stopped";
      this.serviceInstanceId = undefined;
      return;
    }
    const controls = await this.invokeControls("shutdown_tts_service");
    expectKinds(controls, ["state", "state"]);
    const stopping = controls[0]!;
    const stopped = controls[1]!;
    if (
      stopping.kind !== "state" ||
      stopping.state !== "stopping" ||
      stopped.kind !== "state" ||
      stopped.state !== "stopped" ||
      controls.some(
        (control) =>
          "serviceInstanceId" in control &&
          control.serviceInstanceId !== this.serviceInstanceId,
      )
    ) {
      throw new TtsProcessClientError("tts-service-invalid-response");
    }
    this.state = "stopped";
    this.serviceInstanceId = undefined;
  }

  private async invokeControls(
    command: string,
    args?: Record<string, unknown>,
  ): Promise<readonly TtsProtocolControlV1[]> {
    try {
      return decodeControls(
        await this.invokePort<unknown>(
          command,
          args === undefined ? undefined : args,
        ),
      );
    } catch (error) {
      if (error instanceof TtsProcessClientError) {
        throw error;
      }
      throw fixedFailure(error);
    }
  }
}

import {
  TtsProcessClient,
  TtsProcessClientError,
  type TtsGenerationScope,
} from "./process-client";

const CANCELLATION_DISPATCH_DELAY_MS = 15;

export interface TtsServiceLifecycleProbeObservation {
  readonly normalPayloadBytes: 19_200;
  readonly normalSampleCountSamples: 4_800;
  readonly cancellationCode: "tts-service-cancelled";
  readonly finalState: "stopped";
  readonly retainedAudioUnits: 0;
}

function syntheticSegment(scope: TtsGenerationScope) {
  const bookIdentity = {
    scheme: "synthetic-test",
    schemeVersion: 1,
    value: "book-test-001",
  };
  const start = {
    schemaVersion: 1,
    bookIdentity: { ...bookIdentity },
    spineItemId: "spine:chapter-1",
    spineItemIndex: 0,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: "paragraph-1",
      anchorIndex: 0,
    },
    textOffsetCodePoints: 0,
  };
  return {
    schemaVersion: 1,
    segmentId: scope.segmentId,
    bookIdentity,
    sessionId: scope.sessionId,
    generationId: scope.generationId,
    sequence: 0,
    sourceRange: {
      schemaVersion: 1,
      start,
      end: {
        ...start,
        bookIdentity: { ...bookIdentity },
        anchor: { ...start.anchor },
        textOffsetCodePoints: 24,
      },
    },
    text: "Synthetic sensitive narration.",
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });
}

export async function runTtsServiceLifecycleProbe(): Promise<TtsServiceLifecycleProbeObservation> {
  const client = new TtsProcessClient();
  const normalScope = Object.freeze({
    sessionId: "session:native-smoke-1",
    generationId: "generation:native-smoke-1",
    segmentId: "segment:native-smoke-1",
  });
  await client.start();
  await client.prepare();
  const metadata = await client.synthesize(syntheticSegment(normalScope));
  const unit = client.takeAudioUnit();
  if (
    unit === undefined ||
    metadata.payloadBytes !== 19_200 ||
    metadata.sampleCountSamples !== 4_800
  ) {
    unit?.release();
    throw new TtsProcessClientError("tts-service-invalid-response");
  }
  unit.release();
  await client.health();
  await client.shutdown();

  const cancelledScope = Object.freeze({
    sessionId: "session:native-smoke-2",
    generationId: "generation:native-smoke-2",
    segmentId: "segment:native-smoke-2",
  });
  await client.start();
  await client.prepare();
  const pending = client.synthesize(syntheticSegment(cancelledScope)).then(
    () => "unexpected-completion" as const,
    (error: unknown) =>
      error instanceof TtsProcessClientError
        ? error.code
        : ("unexpected-error" as const),
  );
  await delay(CANCELLATION_DISPATCH_DELAY_MS);
  await client.cancel(cancelledScope);
  const cancellationCode = await pending;
  const finalObservation = client.observe();
  if (
    cancellationCode !== "tts-service-cancelled" ||
    finalObservation.state !== "stopped" ||
    finalObservation.retainedAudioUnits !== 0
  ) {
    throw new TtsProcessClientError("tts-service-invalid-response");
  }

  return Object.freeze({
    normalPayloadBytes: 19_200,
    normalSampleCountSamples: 4_800,
    cancellationCode,
    finalState: "stopped",
    retainedAudioUnits: 0,
  });
}

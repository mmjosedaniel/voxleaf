import {
  createBookId,
  createFrameId,
  createGenerationId,
  createSegmentId,
  createSessionId,
  createSpineItemId,
} from "../primitives/index.js";

export const FIXED_TEST_IDENTIFIERS = Object.freeze({
  bookId: createBookId("book:test"),
  spineItemId: createSpineItemId("spine-item:test"),
  sessionId: createSessionId("session:test"),
  generationId: createGenerationId("generation:test"),
  segmentId: createSegmentId("segment:test"),
  frameId: createFrameId("frame:test"),
});

export { ManualClockError, createManualClock } from "./manual-clock.js";
export type {
  ManualClock,
  ManualClockErrorCode,
  PendingManualClockTask,
} from "./manual-clock.js";

export {
  FakeDocumentSourceError,
  INVALID_SYNTHETIC_DOCUMENT_FIXTURES,
  VALID_SYNTHETIC_DOCUMENT_FIXTURE,
  createFakeDocumentSource,
  findSyntheticDocumentBlock,
} from "./synthetic-document.js";
export type {
  FakeDocumentSource,
  FakeDocumentSourceErrorCode,
  FakeDocumentSourceStep,
  InvalidSyntheticDocumentFixture,
  SyntheticDialogueBlock,
  SyntheticDocumentBlock,
  SyntheticDocumentBlockKind,
  SyntheticDocumentFixture,
  SyntheticHeadingBlock,
  SyntheticLocalImageMetadata,
  SyntheticParagraphBlock,
  SyntheticSceneBoundaryBlock,
  SyntheticSpineDocument,
} from "./synthetic-document.js";

export { FakeTtsSourceError, createFakeTtsSource } from "./fake-tts-source.js";
export type {
  FakeTtsCancellationBehavior,
  FakeTtsCancelledResultV1,
  FakeTtsErrorResultV1,
  FakeTtsFrameScriptV1,
  FakeTtsFramesResultV1,
  FakeTtsRequest,
  FakeTtsRequestStatus,
  FakeTtsResultV1,
  FakeTtsSource,
  FakeTtsSourceErrorCode,
  FakeTtsSourceStep,
} from "./fake-tts-source.js";

export {
  FakeAudioSinkError,
  createFakeAudioSink,
  createFakeAudioSource,
} from "./fake-audio-pipeline.js";
export type {
  FakeAudioSink,
  FakeAudioSinkErrorCode,
  FakeAudioSinkOutcomeKind,
  FakeAudioSinkOutcomeV1,
  FakeAudioSource,
  FakeAudioSourceStepV1,
} from "./fake-audio-pipeline.js";

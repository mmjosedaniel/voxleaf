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

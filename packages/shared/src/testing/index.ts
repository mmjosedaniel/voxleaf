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

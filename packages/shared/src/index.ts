export { BookContractError, decodeBookV1 } from "./contracts/index.js";

export type {
  BookContractErrorCode,
  BookIdentityV1,
  BookV1,
  LocalResourcePath,
  LocalResourceRoleV1,
  LocalResourceV1,
  NavigationEntryV1,
  PublicationMetadataV1,
  SpineItemV1,
} from "./contracts/index.js";

export {
  assertSupportedSchemaVersion,
  createBookId,
  createByteCount,
  createCount,
  createFrameId,
  createGenerationId,
  createHertz,
  createIndex,
  createMilliseconds,
  createProgression,
  createSampleCount,
  createSchemaVersion,
  createSegmentId,
  createSessionId,
  createSpineItemId,
} from "./primitives/index.js";

export type {
  BookId,
  ByteCount,
  Count,
  FrameId,
  GenerationId,
  Hertz,
  Index,
  Milliseconds,
  Progression,
  SampleCount,
  SchemaVersion,
  SegmentId,
  SessionId,
  SpineItemId,
} from "./primitives/index.js";

export { BookContractError, decodeBookV1 } from "./book.js";
export {
  CapabilityReportContractError,
  decodeCapabilityReportV1,
} from "./capability-report.js";
export {
  LocatorContractError,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
} from "./locator.js";
export {
  NarrationSegmentContractError,
  decodeNarrationSegmentV1,
  getNarrationSegmentWorkIdentity,
} from "./narration-segment.js";
export {
  OperationalErrorContractError,
  createOperationalErrorV1,
  decodeOperationalErrorV1,
} from "./operational-error.js";
export {
  PersistedReadingStateContractError,
  decodePersistedReadingStateV1,
} from "./persisted-reading-state.js";
export {
  ReadingSessionContractError,
  classifyGenerationWorkEligibility,
  createGenerationCancellationIntent,
  decodeReadingSessionV1,
  getGenerationWorkIdentity,
  isGenerationWorkEligible,
} from "./reading-session.js";

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
} from "./book.js";

export type {
  CapabilityReportContractErrorCode,
  CapabilityReportV1,
  CapabilitySetV1,
  CapabilityStatusV1,
} from "./capability-report.js";

export type {
  LocatorContractErrorCode,
  LocatorRangeV1,
  ReadingLocatorV1,
  StructuralAnchorV1,
  StructuralAnchorValue,
} from "./locator.js";

export type {
  NarrationSegmentContractErrorCode,
  NarrationSegmentV1,
  SensitiveNarrationTextV1,
} from "./narration-segment.js";

export type {
  OperationalErrorCategoryV1,
  OperationalErrorCodeV1,
  OperationalErrorContractErrorCode,
  OperationalErrorSeverityV1,
  OperationalErrorV1,
} from "./operational-error.js";

export type {
  PersistedReadingPreferencesV1,
  PersistedReadingStateContractErrorCode,
  PersistedReadingStateV1,
  PersistedVoiceId,
  PlaybackRate,
} from "./persisted-reading-state.js";

export type {
  GenerationCancellationIntentV1,
  GenerationWorkEligibilityV1,
  GenerationWorkIdentityV1,
  ReadingSessionContractErrorCode,
  ReadingSessionV1,
} from "./reading-session.js";

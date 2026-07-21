export { BookContractError, decodeBookV1 } from "./book.js";
export {
  LocatorContractError,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
} from "./locator.js";
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
  LocatorContractErrorCode,
  LocatorRangeV1,
  ReadingLocatorV1,
  StructuralAnchorV1,
  StructuralAnchorValue,
} from "./locator.js";

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

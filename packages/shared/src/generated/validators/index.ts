/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */
import {
  validateAudioFrameV1Wire as standaloneValidateAudioFrameV1Wire,
  validateBookV1Wire as standaloneValidateBookV1Wire,
  validateBufferStatusV1Wire as standaloneValidateBufferStatusV1Wire,
  validateCapabilityReportV1Wire as standaloneValidateCapabilityReportV1Wire,
  validateLocatorRangeV1Wire as standaloneValidateLocatorRangeV1Wire,
  validateReadingLocatorV1Wire as standaloneValidateReadingLocatorV1Wire,
  validateNarrationSegmentV1Wire as standaloneValidateNarrationSegmentV1Wire,
  validateOperationalErrorV1Wire as standaloneValidateOperationalErrorV1Wire,
  validatePersistedReadingStateV1Wire as standaloneValidatePersistedReadingStateV1Wire,
  validateReadingSessionV1Wire as standaloneValidateReadingSessionV1Wire,
} from "./standalone.js";

import type { AudioFrameV1Wire } from "../contracts/audio-frame-v1.js";
import type { BookV1Wire } from "../contracts/book-v1.js";
import type { BufferStatusV1Wire } from "../contracts/buffer-status-v1.js";
import type { CapabilityReportV1Wire } from "../contracts/capability-report-v1.js";
import type { LocatorRangeV1Wire } from "../contracts/locator-range-v1.js";
import type { ReadingLocatorV1Wire } from "../contracts/locator-v1.js";
import type { NarrationSegmentV1Wire } from "../contracts/narration-segment-v1.js";
import type { OperationalErrorV1Wire } from "../contracts/operational-error-v1.js";
import type { PersistedReadingStateV1Wire } from "../contracts/persisted-reading-state-v1.js";
import type { ReadingSessionV1Wire } from "../contracts/reading-session-v1.js";

type ContractValidator<T> = (input: unknown) => input is T;

export const validateAudioFrameV1Wire =
  standaloneValidateAudioFrameV1Wire as unknown as ContractValidator<AudioFrameV1Wire>;

export const validateBookV1Wire =
  standaloneValidateBookV1Wire as unknown as ContractValidator<BookV1Wire>;

export const validateBufferStatusV1Wire =
  standaloneValidateBufferStatusV1Wire as unknown as ContractValidator<BufferStatusV1Wire>;

export const validateCapabilityReportV1Wire =
  standaloneValidateCapabilityReportV1Wire as unknown as ContractValidator<CapabilityReportV1Wire>;

export const validateLocatorRangeV1Wire =
  standaloneValidateLocatorRangeV1Wire as unknown as ContractValidator<LocatorRangeV1Wire>;

export const validateReadingLocatorV1Wire =
  standaloneValidateReadingLocatorV1Wire as unknown as ContractValidator<ReadingLocatorV1Wire>;

export const validateNarrationSegmentV1Wire =
  standaloneValidateNarrationSegmentV1Wire as unknown as ContractValidator<NarrationSegmentV1Wire>;

export const validateOperationalErrorV1Wire =
  standaloneValidateOperationalErrorV1Wire as unknown as ContractValidator<OperationalErrorV1Wire>;

export const validatePersistedReadingStateV1Wire =
  standaloneValidatePersistedReadingStateV1Wire as unknown as ContractValidator<PersistedReadingStateV1Wire>;

export const validateReadingSessionV1Wire =
  standaloneValidateReadingSessionV1Wire as unknown as ContractValidator<ReadingSessionV1Wire>;

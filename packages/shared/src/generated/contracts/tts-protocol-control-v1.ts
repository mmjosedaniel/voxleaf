/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

/**
 * Closed JSON control messages for VoxLeaf local TTS process protocol version 1. Raw PCM is carried only in a separate bounded audio record.
 */
export type TtsProtocolControlV1Wire =
  | TtsHandshakeV1Wire
  | TtsLoadV1Wire
  | TtsWarmV1Wire
  | TtsSynthesizeV1Wire
  | TtsCancelV1Wire
  | TtsHealthV1Wire
  | TtsShutdownV1Wire
  | TtsHandshakeAcceptedV1Wire
  | TtsStateV1Wire
  | TtsCapabilitiesV1Wire
  | TtsAudioMetadataV1Wire
  | TtsCompletedV1Wire
  | TtsCancelledV1Wire
  | TtsErrorV1Wire
  | TtsProtocolRejectedV1Wire;
export type SchemaVersion = SchemaVersionWire & 1;
export type SchemaVersionWire = number;
export type ProtocolVersion = 1;
export type IdentifierWire = string;
export type SegmentIdWire = string;
export type BookIdWire = string;
export type SessionIdWire = string;
export type GenerationIdWire = string;
/**
 * Zero-based order within the active generation; segment production rules remain external.
 */
export type IndexWire = number;
export type SpineItemIdWire = string;
/**
 * Zero-based position of the spine item in the validated book contract.
 */
export type IndexWire1 = number;
/**
 * Opaque structural element identifier; never a text quotation.
 */
export type StructuralAnchorValueWire = string;
/**
 * Zero-based structural anchor order within the spine item.
 */
export type IndexWire2 = number;
/**
 * Zero-based Unicode code-point offset within the anchored text representation.
 */
export type IndexWire3 = number;
/**
 * Optional book-level progression used only for recovery and progress display.
 */
export type ProgressionWire = number;
export type ServiceState =
  | "starting"
  | "handshaking"
  | "unloaded"
  | "loading"
  | "warming"
  | "ready"
  | "generating"
  | "cancelling"
  | "stopping"
  | "stopped"
  | "failed";
/**
 * Unknown is explicit when support has not been established; it must not be treated as supported.
 *
 * This interface was referenced by `CapabilityReportV1Wire`'s JSON-Schema
 * via the `definition` "capabilityStatus".
 */
export type CapabilityStatusV1Wire = "supported" | "unsupported" | "unknown";
export type FrameIdWire = string;
/**
 * Monotonic frame order within the active generation.
 */
export type IndexWire4 = number;
export type HertzWire = number;
export type SampleCountWire = number;
export type CountWire = number;
export type ProtocolReason =
  | "malformed-frame"
  | "unsupported-protocol-version"
  | "unknown-record-kind"
  | "invalid-flags"
  | "empty-payload"
  | "over-limit"
  | "invalid-utf8"
  | "malformed-json"
  | "unknown-message-kind"
  | "unsupported-schema-version"
  | "invalid-message"
  | "invalid-state"
  | "identity-mismatch"
  | "duplicate-identity"
  | "sequence-gap"
  | "format-mismatch"
  | "busy"
  | "engine-failure"
  | "engine-timeout"
  | "operation-cancelled"
  | "resource-exhausted";

export interface TtsHandshakeV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "handshake";
  serviceInstanceId: IdentifierWire;
}
export interface TtsLoadV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "load";
  serviceInstanceId: IdentifierWire;
}
export interface TtsWarmV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "warm";
  serviceInstanceId: IdentifierWire;
}
export interface TtsSynthesizeV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "synthesize";
  serviceInstanceId: IdentifierWire;
  requestId: IdentifierWire;
  segment: NarrationSegmentV1Wire & {
    text?: string;
    [k: string]: unknown;
  };
}
/**
 * One sensitive narration payload tied to a stable reading range and asynchronous work identity.
 */
export interface NarrationSegmentV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  segmentId: SegmentIdWire;
  bookIdentity: BookIdentityV1Wire;
  sessionId: SessionIdWire;
  generationId: GenerationIdWire;
  sequence: IndexWire;
  sourceRange: LocatorRangeV1Wire;
  /**
   * Sensitive narration text. It must not be copied into errors, metrics, persisted reading state, or debug snapshots.
   */
  text: string;
}
export interface BookIdentityV1Wire {
  scheme: string;
  schemeVersion: SchemaVersionWire;
  value: BookIdWire;
}
/**
 * The ordered logical reading range that supplied this narration text.
 */
export interface LocatorRangeV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  start: ReadingLocatorV1Wire;
  end: ReadingLocatorV1Wire;
}
/**
 * A content-free, layout-independent logical position within one book.
 */
export interface ReadingLocatorV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  bookIdentity: BookIdentityV1Wire;
  spineItemId: SpineItemIdWire;
  spineItemIndex: IndexWire1;
  anchor: StructuralAnchorV1Wire;
  textOffsetCodePoints: IndexWire3;
  progression?: ProgressionWire;
}
/**
 * This interface was referenced by `ReadingLocatorV1Wire`'s JSON-Schema
 * via the `definition` "structuralAnchor".
 */
export interface StructuralAnchorV1Wire {
  kind: "element-id";
  formatVersion: SchemaVersionWire & 1;
  value: StructuralAnchorValueWire;
  anchorIndex: IndexWire2;
}
export interface TtsCancelV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "cancel";
  serviceInstanceId: IdentifierWire;
  workIdentity: WorkIdentity;
}
export interface WorkIdentity {
  requestId: IdentifierWire;
  sessionId: SessionIdWire;
  generationId: GenerationIdWire;
  segmentId: SegmentIdWire;
}
export interface TtsHealthV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "health";
  serviceInstanceId: IdentifierWire;
}
export interface TtsShutdownV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "shutdown";
  serviceInstanceId: IdentifierWire;
}
export interface TtsHandshakeAcceptedV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "handshakeAccepted";
  serviceInstanceId: IdentifierWire;
}
export interface TtsStateV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "state";
  serviceInstanceId: IdentifierWire;
  state: ServiceState;
}
export interface TtsCapabilitiesV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "capabilities";
  serviceInstanceId: IdentifierWire;
  report: CapabilityReportV1Wire;
  cancellationContainment: "identity-invalidation-then-worker-termination";
}
/**
 * A model-independent report of local speech-generation features without model identity, hardware identity, or hardware-profile claims.
 */
export interface CapabilityReportV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  capabilities: {
    localSpeechGeneration: CapabilityStatusV1Wire;
    streamingGeneration: CapabilityStatusV1Wire;
    generationCancellation: CapabilityStatusV1Wire;
    hardwareAcceleration: CapabilityStatusV1Wire;
    cpuFallback: CapabilityStatusV1Wire;
  };
}
export interface TtsAudioMetadataV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "audioMetadata";
  serviceInstanceId: IdentifierWire;
  requestId: IdentifierWire;
  frame: AudioFrameV1Wire & {
    sequence?: 0;
    sampleRateHz?: 24000;
    sampleCountSamples?: number;
    channelCount?: 1;
    endOfSegment?: true;
    [k: string]: unknown;
  };
  sampleFormat: "float32-le";
  payloadBytes: number;
}
/**
 * Privacy-safe metadata for one in-memory audio frame. Audio payload and encoding are intentionally outside this contract.
 */
export interface AudioFrameV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  frameId: FrameIdWire;
  sessionId: SessionIdWire;
  generationId: GenerationIdWire;
  segmentId: SegmentIdWire;
  sequence: IndexWire4;
  sampleRateHz: HertzWire;
  /**
   * Positive count of sample frames per channel; duration is this count divided by sampleRateHz.
   */
  sampleCountSamples: SampleCountWire;
  /**
   * Positive number of channels represented by the future payload; it does not multiply duration.
   */
  channelCount: CountWire;
  /**
   * True only for the final audio frame produced for this narration segment.
   */
  endOfSegment: boolean;
}
export interface TtsCompletedV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "completed";
  serviceInstanceId: IdentifierWire;
  workIdentity: WorkIdentity;
}
export interface TtsCancelledV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "cancelled";
  serviceInstanceId: IdentifierWire;
  workIdentity: WorkIdentity;
}
export interface TtsErrorV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "error";
  serviceInstanceId: IdentifierWire;
  reason: ProtocolReason;
  error: OperationalErrorV1Wire;
  workIdentity?: WorkIdentity;
}
/**
 * A privacy-safe machine-readable failure without content, paths, stack traces, or implementation details.
 */
export interface OperationalErrorV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  /**
   * Stable machine-readable error code. Presentation layers map it to safe localized text.
   */
  code:
    | "invalid-input"
    | "unsupported-input"
    | "capability-unavailable"
    | "operation-cancelled"
    | "resource-exhausted"
    | "internal-failure";
  category: "input" | "availability" | "cancellation" | "resource" | "internal";
  /**
   * Whether the owning workflow can offer a safe recovery path or must stop.
   */
  severity: "recoverable" | "fatal";
}
export interface TtsProtocolRejectedV1Wire {
  schemaVersion: SchemaVersion;
  protocolVersion: ProtocolVersion;
  kind: "protocolRejected";
  reason: ProtocolReason;
}

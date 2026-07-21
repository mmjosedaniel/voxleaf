/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
/**
 * Unknown is explicit when support has not been established; it must not be treated as supported.
 *
 * This interface was referenced by `CapabilityReportV1Wire`'s JSON-Schema
 * via the `definition` "capabilityStatus".
 */
export type CapabilityStatusV1Wire = "supported" | "unsupported" | "unknown";

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

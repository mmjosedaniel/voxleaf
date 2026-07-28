/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "knownLogicalProcessorCount".
 */
export type KnownLogicalProcessorCountV1Wire =
  | {
      status: "known";
      value: number;
    }
  | UnknownHostQuantityV1Wire;
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "knownPositiveMebibytes".
 */
export type KnownPositiveMebibytesV1Wire =
  | {
      status: "known";
      value: number;
    }
  | UnknownHostQuantityV1Wire;
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "knownNonNegativeMebibytes".
 */
export type KnownNonNegativeMebibytesV1Wire =
  | {
      status: "known";
      value: number;
    }
  | UnknownHostQuantityV1Wire;
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "availabilityStatus".
 */
export type HostFactAvailabilityV1Wire =
  "available" | "unavailable" | "unknown";

/**
 * A bounded privacy-safe snapshot of local host facts needed for conservative TTS profile matching. It contains no host identity, raw platform output, path, recommendation, or support claim.
 */
export interface HostProfileCompatibilityReportV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  probeStatus: "complete" | "partial" | "permission-denied" | "unavailable";
  platform: {
    operatingSystem: "windows" | "linux" | "macos" | "other" | "unknown";
    architecture: "x86_64" | "aarch64" | "other" | "unknown";
  };
  processor: {
    logicalProcessorCount: KnownLogicalProcessorCountV1Wire;
  };
  memory: {
    totalPhysicalMiB: KnownPositiveMebibytesV1Wire;
    availablePhysicalMiB: KnownNonNegativeMebibytesV1Wire;
  };
  storage: {
    applicationVolumeAvailableMiB: KnownNonNegativeMebibytesV1Wire;
  };
  providers: {
    cpu: HostProviderCapabilityV1Wire;
    cuda: HostProviderCapabilityV1Wire;
    directml: HostProviderCapabilityV1Wire;
    rocm: HostProviderCapabilityV1Wire;
    metal: HostProviderCapabilityV1Wire;
  };
}
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "unknownQuantity".
 */
export interface UnknownHostQuantityV1Wire {
  status: "unknown";
}
/**
 * This interface was referenced by `HostProfileCompatibilityReportV1Wire`'s JSON-Schema
 * via the `definition` "providerCapability".
 */
export interface HostProviderCapabilityV1Wire {
  availability: HostFactAvailabilityV1Wire;
  deviceClass:
    "cpu" | "discrete-gpu" | "integrated-gpu" | "software" | "unknown";
  dedicatedMemoryMiB: KnownNonNegativeMebibytesV1Wire;
  availableDedicatedMemoryMiB: KnownNonNegativeMebibytesV1Wire;
  precisions: {
    float32: HostFactAvailabilityV1Wire;
    float16: HostFactAvailabilityV1Wire;
    bfloat16: HostFactAvailabilityV1Wire;
    int8: HostFactAvailabilityV1Wire;
  };
}

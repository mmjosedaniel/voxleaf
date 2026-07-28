import type { HostProfileCompatibilityReportV1Wire } from "../generated/contracts/host-profile-compatibility-report-v1.js";
import { validateHostProfileCompatibilityReportV1Wire } from "../generated/validators/index.js";
import { createSchemaVersion } from "../primitives/index.js";
import type { SchemaVersion } from "../primitives/index.js";

const HOST_PROFILE_COMPATIBILITY_REPORT_SCHEMA_VERSION_V1 =
  createSchemaVersion(1);

export type HostProbeStatusV1 =
  HostProfileCompatibilityReportV1Wire["probeStatus"];
export type HostOperatingSystemV1 =
  HostProfileCompatibilityReportV1Wire["platform"]["operatingSystem"];
export type HostArchitectureV1 =
  HostProfileCompatibilityReportV1Wire["platform"]["architecture"];
export type HostFactAvailabilityV1 =
  HostProfileCompatibilityReportV1Wire["providers"]["cpu"]["availability"];
export type HostDeviceClassV1 =
  HostProfileCompatibilityReportV1Wire["providers"]["cpu"]["deviceClass"];
export type HostProviderNameV1 =
  keyof HostProfileCompatibilityReportV1Wire["providers"];
export type HostProviderCapabilityV1 =
  HostProfileCompatibilityReportV1Wire["providers"]["cpu"];
export type HostKnownQuantityV1 =
  | HostProfileCompatibilityReportV1Wire["processor"]["logicalProcessorCount"]
  | HostProfileCompatibilityReportV1Wire["memory"]["totalPhysicalMiB"]
  | HostProfileCompatibilityReportV1Wire["memory"]["availablePhysicalMiB"];

export type HostProfileCompatibilityReportContractErrorCode =
  "malformed" | "unsupported-version";

export class HostProfileCompatibilityReportContractError extends Error {
  public readonly code: HostProfileCompatibilityReportContractErrorCode;

  public constructor(code: HostProfileCompatibilityReportContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Host profile compatibility report version is unsupported."
        : "Host profile compatibility report is malformed.",
    );
    this.name = "HostProfileCompatibilityReportContractError";
    this.code = code;
  }
}

export interface HostProfileCompatibilityReportV1 {
  readonly schemaVersion: SchemaVersion;
  readonly probeStatus: HostProbeStatusV1;
  readonly platform: Readonly<HostProfileCompatibilityReportV1Wire["platform"]>;
  readonly processor: Readonly<
    HostProfileCompatibilityReportV1Wire["processor"]
  >;
  readonly memory: Readonly<HostProfileCompatibilityReportV1Wire["memory"]>;
  readonly storage: Readonly<HostProfileCompatibilityReportV1Wire["storage"]>;
  readonly providers: Readonly<
    HostProfileCompatibilityReportV1Wire["providers"]
  >;
}

function malformedHostProfileCompatibilityReport(): never {
  throw new HostProfileCompatibilityReportContractError("malformed");
}

function readSupportedVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedHostProfileCompatibilityReport();
  }

  let version: SchemaVersion;

  try {
    version = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedHostProfileCompatibilityReport();
  }

  if (version !== HOST_PROFILE_COMPATIBILITY_REPORT_SCHEMA_VERSION_V1) {
    throw new HostProfileCompatibilityReportContractError(
      "unsupported-version",
    );
  }

  return version;
}

function knownValue(
  quantity:
    | HostProfileCompatibilityReportV1Wire["memory"]["totalPhysicalMiB"]
    | HostProfileCompatibilityReportV1Wire["memory"]["availablePhysicalMiB"],
): number | undefined {
  return quantity.status === "known" ? quantity.value : undefined;
}

function hasAvailablePrecision(provider: HostProviderCapabilityV1): boolean {
  return Object.values(provider.precisions).some(
    (precision) => precision === "available",
  );
}

function providerSemanticsAreValid(
  name: HostProviderNameV1,
  provider: HostProviderCapabilityV1,
): boolean {
  const dedicatedMemory = knownValue(provider.dedicatedMemoryMiB);
  const availableDedicatedMemory = knownValue(
    provider.availableDedicatedMemoryMiB,
  );

  if (
    dedicatedMemory !== undefined &&
    availableDedicatedMemory !== undefined &&
    availableDedicatedMemory > dedicatedMemory
  ) {
    return false;
  }

  if (provider.availability !== "available") {
    return (
      provider.deviceClass === "unknown" &&
      dedicatedMemory === undefined &&
      availableDedicatedMemory === undefined &&
      !hasAvailablePrecision(provider)
    );
  }

  if (!hasAvailablePrecision(provider)) {
    return false;
  }

  if (name === "cpu") {
    return (
      provider.deviceClass === "cpu" &&
      dedicatedMemory === 0 &&
      availableDedicatedMemory === 0
    );
  }

  return provider.deviceClass !== "cpu" && provider.deviceClass !== "unknown";
}

function freezeQuantity<T extends { readonly status: string }>(value: T): T {
  return Object.freeze({ ...value });
}

function freezeProvider(
  provider: HostProviderCapabilityV1,
): HostProviderCapabilityV1 {
  return Object.freeze({
    ...provider,
    dedicatedMemoryMiB: freezeQuantity(provider.dedicatedMemoryMiB),
    availableDedicatedMemoryMiB: freezeQuantity(
      provider.availableDedicatedMemoryMiB,
    ),
    precisions: Object.freeze({ ...provider.precisions }),
  });
}

export function decodeHostProfileCompatibilityReportV1(
  input: unknown,
): HostProfileCompatibilityReportV1 {
  const schemaVersion = readSupportedVersion(input);

  if (!validateHostProfileCompatibilityReportV1Wire(input)) {
    return malformedHostProfileCompatibilityReport();
  }

  const totalPhysicalMiB = knownValue(input.memory.totalPhysicalMiB);
  const availablePhysicalMiB = knownValue(input.memory.availablePhysicalMiB);
  if (
    totalPhysicalMiB !== undefined &&
    availablePhysicalMiB !== undefined &&
    availablePhysicalMiB > totalPhysicalMiB
  ) {
    return malformedHostProfileCompatibilityReport();
  }

  for (const [name, provider] of Object.entries(input.providers) as Array<
    [HostProviderNameV1, HostProviderCapabilityV1]
  >) {
    if (!providerSemanticsAreValid(name, provider)) {
      return malformedHostProfileCompatibilityReport();
    }
  }

  return Object.freeze({
    schemaVersion,
    probeStatus: input.probeStatus,
    platform: Object.freeze({ ...input.platform }),
    processor: Object.freeze({
      logicalProcessorCount: freezeQuantity(
        input.processor.logicalProcessorCount,
      ),
    }),
    memory: Object.freeze({
      totalPhysicalMiB: freezeQuantity(input.memory.totalPhysicalMiB),
      availablePhysicalMiB: freezeQuantity(input.memory.availablePhysicalMiB),
    }),
    storage: Object.freeze({
      applicationVolumeAvailableMiB: freezeQuantity(
        input.storage.applicationVolumeAvailableMiB,
      ),
    }),
    providers: Object.freeze({
      cpu: freezeProvider(input.providers.cpu),
      cuda: freezeProvider(input.providers.cuda),
      directml: freezeProvider(input.providers.directml),
      rocm: freezeProvider(input.providers.rocm),
      metal: freezeProvider(input.providers.metal),
    }),
  });
}

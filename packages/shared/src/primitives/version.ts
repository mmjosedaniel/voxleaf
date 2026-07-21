declare const schemaVersionBrand: unique symbol;

export type SchemaVersion = number & {
  readonly [schemaVersionBrand]: "SchemaVersion";
};

export function createSchemaVersion(value: unknown): SchemaVersion {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    Object.is(value, -0)
  ) {
    throw new RangeError("SchemaVersion must be a positive JSON safe integer.");
  }

  return value as SchemaVersion;
}

export function assertSupportedSchemaVersion(
  version: SchemaVersion,
  supportedVersions: readonly SchemaVersion[],
): void {
  if (!supportedVersions.includes(version)) {
    throw new RangeError("SchemaVersion is unsupported.");
  }
}

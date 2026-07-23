import type { ReadingLocatorV1Wire } from "../generated/contracts/locator-v1.js";
import {
  validateLocatorRangeV1Wire,
  validateReadingLocatorV1Wire,
} from "../generated/validators/index.js";
import {
  createBookId,
  createIndex,
  createProgression,
  createSchemaVersion,
  createSpineItemId,
} from "../primitives/index.js";
import type {
  Index,
  Progression,
  SchemaVersion,
  SpineItemId,
} from "../primitives/index.js";
import type { BookIdentityV1 } from "./book.js";

const LOCATOR_SCHEMA_VERSION_V1 = createSchemaVersion(1);
const LOCATOR_RANGE_SCHEMA_VERSION_V1 = createSchemaVersion(1);
const ANCHOR_FORMAT_VERSION_V1 = createSchemaVersion(1);

declare const structuralAnchorValueBrand: unique symbol;

export type StructuralAnchorValue = string & {
  readonly [structuralAnchorValueBrand]: "StructuralAnchorValue";
};

export type LocatorContractErrorCode = "malformed" | "unsupported-version";

export class LocatorContractError extends Error {
  public readonly code: LocatorContractErrorCode;

  public constructor(code: LocatorContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Locator contract version is unsupported."
        : "Locator contract is malformed.",
    );
    this.name = "LocatorContractError";
    this.code = code;
  }
}

export interface StructuralAnchorV1 {
  readonly kind: "element-id";
  readonly formatVersion: SchemaVersion;
  readonly value: StructuralAnchorValue;
  readonly anchorIndex: Index;
}

export interface ReadingLocatorV1 {
  readonly schemaVersion: SchemaVersion;
  readonly bookIdentity: BookIdentityV1;
  readonly spineItemId: SpineItemId;
  readonly spineItemIndex: Index;
  readonly anchor: StructuralAnchorV1;
  readonly textOffsetCodePoints: Index;
  readonly progression?: Progression;
}

export interface LocatorRangeV1 {
  readonly schemaVersion: SchemaVersion;
  readonly start: ReadingLocatorV1;
  readonly end: ReadingLocatorV1;
}

function malformedLocatorContract(): never {
  throw new LocatorContractError("malformed");
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return malformedLocatorContract();
  }

  return value as Record<string, unknown>;
}

function readSupportedVersion(
  value: unknown,
  supportedVersion: SchemaVersion,
): SchemaVersion {
  let version: SchemaVersion;

  try {
    version = createSchemaVersion(value);
  } catch {
    return malformedLocatorContract();
  }

  if (version !== supportedVersion) {
    throw new LocatorContractError("unsupported-version");
  }

  return version;
}

function preflightReadingLocator(input: unknown): SchemaVersion {
  const locator = readRecord(input);
  const schemaVersion = readSupportedVersion(
    locator.schemaVersion,
    LOCATOR_SCHEMA_VERSION_V1,
  );
  const anchor = readRecord(locator.anchor);
  readSupportedVersion(anchor.formatVersion, ANCHOR_FORMAT_VERSION_V1);

  return schemaVersion;
}

function createDomainLocator(
  wire: ReadingLocatorV1Wire,
  schemaVersion: SchemaVersion,
): ReadingLocatorV1 {
  const progression =
    wire.progression === undefined
      ? {}
      : { progression: createProgression(wire.progression) };

  return Object.freeze({
    schemaVersion,
    bookIdentity: Object.freeze({
      scheme: wire.bookIdentity.scheme,
      schemeVersion: createSchemaVersion(wire.bookIdentity.schemeVersion),
      value: createBookId(wire.bookIdentity.value),
    }),
    spineItemId: createSpineItemId(wire.spineItemId),
    spineItemIndex: createIndex(wire.spineItemIndex),
    anchor: Object.freeze({
      kind: wire.anchor.kind,
      formatVersion: createSchemaVersion(wire.anchor.formatVersion),
      value: wire.anchor.value as StructuralAnchorValue,
      anchorIndex: createIndex(wire.anchor.anchorIndex),
    }),
    textOffsetCodePoints: createIndex(wire.textOffsetCodePoints),
    ...progression,
  });
}

function bookIdentitiesMatch(
  left: BookIdentityV1,
  right: BookIdentityV1,
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function structuralAnchorsMatch(
  left: StructuralAnchorV1,
  right: StructuralAnchorV1,
): boolean {
  return (
    left.kind === right.kind &&
    left.formatVersion === right.formatVersion &&
    left.value === right.value
  );
}

function compareLocatorPositions(
  start: ReadingLocatorV1,
  end: ReadingLocatorV1,
): number {
  const sameSpineId = start.spineItemId === end.spineItemId;
  const sameSpineIndex = start.spineItemIndex === end.spineItemIndex;

  if (sameSpineId !== sameSpineIndex) {
    return malformedLocatorContract();
  }

  if (!sameSpineIndex) {
    return start.spineItemIndex - end.spineItemIndex;
  }

  const sameAnchor = structuralAnchorsMatch(start.anchor, end.anchor);
  const sameAnchorIndex = start.anchor.anchorIndex === end.anchor.anchorIndex;

  if (sameAnchor !== sameAnchorIndex) {
    return malformedLocatorContract();
  }

  if (!sameAnchorIndex) {
    return start.anchor.anchorIndex - end.anchor.anchorIndex;
  }

  return start.textOffsetCodePoints - end.textOffsetCodePoints;
}

export function decodeReadingLocatorV1(input: unknown): ReadingLocatorV1 {
  const schemaVersion = preflightReadingLocator(input);

  if (!validateReadingLocatorV1Wire(input)) {
    return malformedLocatorContract();
  }

  return createDomainLocator(input as ReadingLocatorV1Wire, schemaVersion);
}

export function decodeLocatorRangeV1(input: unknown): LocatorRangeV1 {
  const range = readRecord(input);
  const schemaVersion = readSupportedVersion(
    range.schemaVersion,
    LOCATOR_RANGE_SCHEMA_VERSION_V1,
  );
  const startSchemaVersion = preflightReadingLocator(range.start);
  const endSchemaVersion = preflightReadingLocator(range.end);

  if (!validateLocatorRangeV1Wire(input)) {
    return malformedLocatorContract();
  }

  const start = createDomainLocator(input.start, startSchemaVersion);
  const end = createDomainLocator(input.end, endSchemaVersion);

  if (!bookIdentitiesMatch(start.bookIdentity, end.bookIdentity)) {
    return malformedLocatorContract();
  }

  if (compareLocatorPositions(start, end) > 0) {
    return malformedLocatorContract();
  }

  if (
    start.progression !== undefined &&
    end.progression !== undefined &&
    start.progression > end.progression
  ) {
    return malformedLocatorContract();
  }

  return Object.freeze({ schemaVersion, start, end });
}

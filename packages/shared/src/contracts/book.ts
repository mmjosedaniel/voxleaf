import type { BookV1Wire } from "../generated/contracts/book-v1.js";
import { validateBookV1Wire } from "../generated/validators/index.js";
import {
  createBookId,
  createIndex,
  createSchemaVersion,
  createSpineItemId,
} from "../primitives/index.js";
import type {
  BookId,
  Index,
  SchemaVersion,
  SpineItemId,
} from "../primitives/index.js";

const BOOK_SCHEMA_VERSION_V1 = createSchemaVersion(1);

declare const localResourcePathBrand: unique symbol;

export type LocalResourcePath = string & {
  readonly [localResourcePathBrand]: "LocalResourcePath";
};

export type BookContractErrorCode = "malformed" | "unsupported-version";

export class BookContractError extends Error {
  public readonly code: BookContractErrorCode;

  public constructor(code: BookContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Book contract version is unsupported."
        : "Book contract is malformed.",
    );
    this.name = "BookContractError";
    this.code = code;
  }
}

export interface BookIdentityV1 {
  readonly scheme: string;
  readonly schemeVersion: SchemaVersion;
  readonly value: BookId;
}

export interface PublicationMetadataV1 {
  readonly title: string;
  readonly authors: readonly string[];
}

export type LocalResourceRoleV1 = "content-document" | "image";

export interface LocalResourceV1 {
  readonly path: LocalResourcePath;
  readonly mediaType: string;
  readonly role: LocalResourceRoleV1;
}

export interface SpineItemV1 {
  readonly id: SpineItemId;
  readonly index: Index;
  readonly resourcePath: LocalResourcePath;
}

export interface NavigationEntryV1 {
  readonly label: string;
  readonly targetSpineItemId: SpineItemId;
}

export interface BookV1 {
  readonly schemaVersion: SchemaVersion;
  readonly identity: BookIdentityV1;
  readonly metadata: PublicationMetadataV1;
  readonly resources: readonly LocalResourceV1[];
  readonly spine: readonly SpineItemV1[];
  readonly navigation: readonly NavigationEntryV1[];
}

function malformedBookContract(): never {
  throw new BookContractError("malformed");
}

function readSupportedSchemaVersion(input: unknown): SchemaVersion {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return malformedBookContract();
  }

  let schemaVersion: SchemaVersion;

  try {
    schemaVersion = createSchemaVersion(
      (input as Record<string, unknown>).schemaVersion,
    );
  } catch {
    return malformedBookContract();
  }

  if (schemaVersion !== BOOK_SCHEMA_VERSION_V1) {
    throw new BookContractError("unsupported-version");
  }

  return schemaVersion;
}

function createDomainBook(
  wire: BookV1Wire,
  schemaVersion: SchemaVersion,
): BookV1 {
  const resourcesByPath = new Map<string, LocalResourceV1>();
  const resources = wire.resources.map((resource) => {
    if (resourcesByPath.has(resource.path)) {
      return malformedBookContract();
    }

    const domainResource = Object.freeze({
      path: resource.path as LocalResourcePath,
      mediaType: resource.mediaType,
      role: resource.role,
    });

    resourcesByPath.set(resource.path, domainResource);
    return domainResource;
  });

  const spineItemIds = new Set<string>();
  const spineIndexes = new Set<number>();
  const spine = wire.spine.map((item, arrayIndex) => {
    if (
      spineItemIds.has(item.id) ||
      spineIndexes.has(item.index) ||
      item.index !== arrayIndex
    ) {
      return malformedBookContract();
    }

    const resource = resourcesByPath.get(item.resourcePath);
    if (resource?.role !== "content-document") {
      return malformedBookContract();
    }

    spineItemIds.add(item.id);
    spineIndexes.add(item.index);

    return Object.freeze({
      id: createSpineItemId(item.id),
      index: createIndex(item.index),
      resourcePath: item.resourcePath as LocalResourcePath,
    });
  });

  const navigation = wire.navigation.map((entry) => {
    if (!spineItemIds.has(entry.targetSpineItemId)) {
      return malformedBookContract();
    }

    return Object.freeze({
      label: entry.label,
      targetSpineItemId: createSpineItemId(entry.targetSpineItemId),
    });
  });

  return Object.freeze({
    schemaVersion,
    identity: Object.freeze({
      scheme: wire.identity.scheme,
      schemeVersion: createSchemaVersion(wire.identity.schemeVersion),
      value: createBookId(wire.identity.value),
    }),
    metadata: Object.freeze({
      title: wire.metadata.title,
      authors: Object.freeze([...wire.metadata.authors]),
    }),
    resources: Object.freeze(resources),
    spine: Object.freeze(spine),
    navigation: Object.freeze(navigation),
  });
}

export function decodeBookV1(input: unknown): BookV1 {
  const schemaVersion = readSupportedSchemaVersion(input);

  if (!validateBookV1Wire(input)) {
    return malformedBookContract();
  }

  return createDomainBook(input, schemaVersion);
}

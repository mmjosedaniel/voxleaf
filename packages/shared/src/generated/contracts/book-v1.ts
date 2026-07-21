/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
export type BookIdWire = string;
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "boundedText".
 */
export type BoundedText = string;
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "localResourcePath".
 */
export type LocalResourcePathWire = string;
export type SpineItemIdWire = string;
export type IndexWire = number;

/**
 * Privacy-safe structural metadata for one opened book.
 */
export interface BookV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  identity: BookIdentityV1Wire;
  metadata: PublicationMetadataV1Wire;
  /**
   * @minItems 1
   * @maxItems 50000
   */
  resources: [LocalResourceV1Wire, ...LocalResourceV1Wire[]];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  spine: [SpineItemV1Wire, ...SpineItemV1Wire[]];
  /**
   * @maxItems 10000
   */
  navigation: NavigationEntryV1Wire[];
}
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "bookIdentity".
 */
export interface BookIdentityV1Wire {
  scheme: string;
  schemeVersion: SchemaVersionWire;
  value: BookIdWire;
}
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "publicationMetadata".
 */
export interface PublicationMetadataV1Wire {
  title: BoundedText;
  /**
   * @maxItems 128
   */
  authors: BoundedText[];
}
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "localResource".
 */
export interface LocalResourceV1Wire {
  path: LocalResourcePathWire;
  mediaType: string;
  role: "content-document" | "image";
}
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "spineItem".
 */
export interface SpineItemV1Wire {
  id: SpineItemIdWire;
  index: IndexWire;
  resourcePath: LocalResourcePathWire;
}
/**
 * This interface was referenced by `BookV1Wire`'s JSON-Schema
 * via the `definition` "navigationEntry".
 */
export interface NavigationEntryV1Wire {
  label: BoundedText;
  targetSpineItemId: SpineItemIdWire;
}

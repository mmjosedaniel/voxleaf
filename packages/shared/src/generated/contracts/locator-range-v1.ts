/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
export type BookIdWire = string;
export type SpineItemIdWire = string;
/**
 * Zero-based position of the spine item in the validated book contract.
 */
export type IndexWire = number;
/**
 * Opaque structural element identifier; never a text quotation.
 */
export type StructuralAnchorValueWire = string;
/**
 * Zero-based structural anchor order within the spine item.
 */
export type IndexWire1 = number;
/**
 * Zero-based Unicode code-point offset within the anchored text representation.
 */
export type IndexWire2 = number;
/**
 * Optional book-level progression used only for recovery and progress display.
 */
export type ProgressionWire = number;

/**
 * An ordered content-free range between two logical reading positions.
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
  spineItemIndex: IndexWire;
  anchor: StructuralAnchorV1Wire;
  textOffsetCodePoints: IndexWire2;
  progression?: ProgressionWire;
}
export interface BookIdentityV1Wire {
  scheme: string;
  schemeVersion: SchemaVersionWire;
  value: BookIdWire;
}
/**
 * This interface was referenced by `ReadingLocatorV1Wire`'s JSON-Schema
 * via the `definition` "structuralAnchor".
 */
export interface StructuralAnchorV1Wire {
  kind: "element-id";
  formatVersion: SchemaVersionWire & 1;
  value: StructuralAnchorValueWire;
  anchorIndex: IndexWire1;
}

/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
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

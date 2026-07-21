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
 * This interface was referenced by `PersistedReadingStateV1Wire`'s JSON-Schema
 * via the `definition` "preferenceIdentifier".
 */
export type PreferenceIdentifier = string;

/**
 * Content-free local reading state for one book without choosing a storage implementation.
 */
export interface PersistedReadingStateV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  bookIdentity: BookIdentityV1Wire;
  locator: ReadingLocatorV1Wire;
  preferences: PersistedReadingPreferencesV1Wire;
}
export interface BookIdentityV1Wire {
  scheme: string;
  schemeVersion: SchemaVersionWire;
  value: BookIdWire;
}
/**
 * The authoritative layout-independent reading position.
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
/**
 * Minimal preferences already defined by product requirements; capability support is validated by later application layers.
 *
 * This interface was referenced by `PersistedReadingStateV1Wire`'s JSON-Schema
 * via the `definition` "readingPreferences".
 */
export interface PersistedReadingPreferencesV1Wire {
  /**
   * Opaque local voice identifier; never a filesystem path.
   */
  selectedVoiceId?: string;
  /**
   * Positive requested playback-rate multiplier; later capability contracts determine supported values.
   */
  playbackRate?: number;
}
